// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_ROOM_SETTINGS } from "../../shared/roomSettings";
import type { GameRoomState } from "../../shared/types";
import { GameScreen } from "./GameScreen";

afterEach(cleanup);

function playingRoom(roundEndsAt: number): GameRoomState {
  return {
    roomCode: "ABCDE",
    status: "playing",
    settings: { ...DEFAULT_ROOM_SETTINGS, mapPool: [...DEFAULT_ROOM_SETTINGS.mapPool] },
    hostPlayerId: "player-a",
    maxPlayers: 5,
    players: [
      { id: "player-a", nickname: "Alpha", slotIndex: 0, active: true, connected: true, ready: true, score: 0, submitted: false, assetReady: false, postMatchState: null },
      { id: "player-b", nickname: "Bravo", slotIndex: 1, active: true, connected: true, ready: true, score: 0, submitted: false, assetReady: false, postMatchState: null },
    ],
    round: 1,
    questionCount: 10,
    currentQuestion: { questionId: "question-1", imageUrl: "/media/questions/question-1" },
    nextQuestion: null,
    prepareDeadline: null,
    assetPrepareAttempt: 0,
    roundStartedAt: roundEndsAt - 20_000,
    roundEndsAt,
    roundResult: null,
    completedMatch: null,
    assetOrigin: "",
    failureCode: null,
    stateVersion: 5,
    serverNow: roundEndsAt - 1,
  };
}

describe("GameScreen authoritative timer", () => {
  it("waits for clock synchronization instead of showing a device-clock countdown", () => {
    render(
      <GameScreen
        room={playingRoom(Date.now() + 20_000)}
        playerId="player-a"
        serverClockOffsetMs={0}
        clockSynchronized={false}
        onSend={vi.fn()}
      />,
    );

    expect(screen.getByText("SYNCING…")).toBeTruthy();
    expect(screen.queryByText(/30\.\d/)).toBeNull();
    expect(screen.getByText("WHICH MAP IS THIS LOCATION ON?")).toBeTruthy();
    expect(screen.getByText("First choose the correct map, then pinpoint the exact location in the next step.")).toBeTruthy();
    expect(screen.getByRole("img", { name: "Location screenshot to identify" }).closest(".question-image-panel")?.getAttribute("data-image-fit")).toBe("contain");

    fireEvent.click(screen.getByRole("button", { name: "Select Mirage" }));
    expect(screen.getByText("STEP 2 · PINPOINT LOCATION")).toBeTruthy();
    expect(screen.getByText("Now place your marker on the 2D radar to mark the exact spot.")).toBeTruthy();
  });

  it("stays on the playing screen at zero and waits for the server result", async () => {
    const onSend = vi.fn();
    render(
      <GameScreen
        room={playingRoom(Date.now() - 1)}
        playerId="player-a"
        serverClockOffsetMs={0}
        clockSynchronized
        onSend={onSend}
      />,
    );

    await waitFor(() => expect(screen.getByText("WAITING FOR RESULT…")).toBeTruthy());
    expect(document.querySelector(".game-layout-v2")).not.toBeNull();
    expect(onSend).not.toHaveBeenCalled();
  });
});
