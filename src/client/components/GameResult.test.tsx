// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_ROOM_SETTINGS } from "../../shared/roomSettings";
import type { GameRoomState, PublicPlayer } from "../../shared/types";
import { GameResult } from "./GameResult";

afterEach(cleanup);

function player(slotIndex: number, score: number, active = true): PublicPlayer {
  return {
    id: `player-${slotIndex}`,
    nickname: `Player ${slotIndex + 1}`,
    slotIndex,
    active,
    connected: active,
    ready: true,
    score,
    submitted: true,
    assetReady: true,
    postMatchState: "viewing_results",
  };
}

function finishedRoom(scores: number[]): GameRoomState {
  const settings = { ...DEFAULT_ROOM_SETTINGS, mapPool: [...DEFAULT_ROOM_SETTINGS.mapPool] };
  const players = scores.map((score, slotIndex) => player(slotIndex, score, slotIndex !== 4));
  return {
    roomCode: "ABCDE",
    status: "finished",
    settings,
    hostPlayerId: "player-0",
    maxPlayers: 5,
    players,
    round: 5,
    questionCount: 20,
    currentQuestion: null,
    nextQuestion: null,
    prepareDeadline: null,
    assetPrepareAttempt: 0,
    roundStartedAt: null,
    roundEndsAt: null,
    roundResult: null,
    completedMatch: {
      matchId: "match-1",
      completedAt: 30_000,
      settings,
      players: players.map(({ id, nickname, slotIndex, active, score }) => ({ id, nickname, slotIndex, active, score })),
      round: 5,
      roundResult: null,
      failureCode: null,
    },
    assetOrigin: "",
    failureCode: null,
    stateVersion: 20,
    serverNow: 30_000,
  };
}

describe("GameResult multiplayer ranking", () => {
  it("declares the viewer the unique winner among five players", () => {
    render(<GameResult room={finishedRoom([120, 180, 310, 250, 90])} playerId="player-2" onPlayAgain={vi.fn()} onLeave={vi.fn()} />);

    expect(screen.getByText("VICTORY")).toBeTruthy();
    expect(screen.getAllByText("Player 3")).toHaveLength(2);
    expect(document.querySelectorAll(".final-scores > .winner")).toHaveLength(1);
    expect(document.querySelector(".final-scores > .winner .final-player-seat")?.textContent).toBe("P3");
  });

  it("highlights every winner in a three-way tie and gives them the same rank", () => {
    render(<GameResult room={finishedRoom([300, 300, 300, 200, 100])} playerId="player-1" onPlayAgain={vi.fn()} onLeave={vi.fn()} />);

    expect(screen.getByText("3-WAY DRAW")).toBeTruthy();
    expect(screen.getByText("Player 1 · Player 2 · Player 3")).toBeTruthy();
    expect(screen.getByText("YOU SHARE THE WIN")).toBeTruthy();
    expect(document.querySelectorAll(".final-scores > .winner")).toHaveLength(3);
    expect(screen.getAllByText("#1")).toHaveLength(3);
    expect(screen.getByText("DNF")).toBeTruthy();
  });

  it("uses a non-destructive home action after a fully completed match", () => {
    render(<GameResult room={finishedRoom([100, 80])} playerId="player-0" onPlayAgain={vi.fn()} onLeave={vi.fn()} />);

    expect(screen.getByRole("button", { name: "BACK TO HOME" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "LEAVE MATCH" })).toBeNull();
  });

  it("keeps early authoritative finishes as a match leave action", () => {
    const room = finishedRoom([100, 80]);
    room.round = room.settings.totalRounds - 1;
    room.completedMatch!.round = room.completedMatch!.settings.totalRounds - 1;
    render(<GameResult room={room} playerId="player-0" onPlayAgain={vi.fn()} onLeave={vi.fn()} />);

    expect(screen.getByRole("button", { name: "LEAVE MATCH" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "BACK TO HOME" })).toBeNull();
  });

  it("excludes an inactive high scorer from winner selection", () => {
    const room = finishedRoom([250, 200, 999]);
    room.players[2].active = false;
    room.completedMatch!.players[2].active = false;
    render(<GameResult room={room} playerId="player-0" onPlayAgain={vi.fn()} onLeave={vi.fn()} />);

    expect(screen.getByText("VICTORY")).toBeTruthy();
    expect(document.querySelector(".final-scores > .winner strong")?.textContent).toContain("Player 1");
    expect(document.querySelector(".final-scores > .is-dnf")?.classList.contains("winner")).toBe(false);
  });

  it("shows a clean multiplayer-only ending when fewer than two active players remain", () => {
    const room = finishedRoom([250, 200]);
    room.failureCode = "NOT_ENOUGH_PLAYERS";
    room.completedMatch!.failureCode = "NOT_ENOUGH_PLAYERS";
    room.players[1].active = false;
    render(<GameResult room={room} playerId="player-0" onPlayAgain={vi.fn()} onLeave={vi.fn()} />);

    expect(screen.getByText("MATCH ENDED")).toBeTruthy();
    expect(screen.getByText("NOT ENOUGH PLAYERS")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "PLAY AGAIN" })).toBeNull();
    expect(screen.getByRole("button", { name: "BACK TO HOME" })).toBeTruthy();
  });

  it("keeps standings and completed settings immutable while the next lobby changes", () => {
    const room = finishedRoom([320, 180]);
    room.players[0].score = 0;
    room.players[1].score = 999;
    room.settings.totalRounds = 10;
    room.settings.roundDurationSeconds = 30;

    render(<GameResult room={room} playerId="player-0" onPlayAgain={vi.fn()} onLeave={vi.fn()} />);

    expect(screen.getByText("VICTORY")).toBeTruthy();
    expect(screen.getByText("320")).toBeTruthy();
    expect(screen.getByText("180")).toBeTruthy();
    expect(screen.queryByText("999")).toBeNull();
  });
});
