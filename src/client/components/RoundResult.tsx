import { useState } from "react";
import { getMap } from "../../shared/maps";
import { LAYER_SCORE, MAP_SCORE, MAX_LOCATION_SCORE, MAX_TIME_BONUS } from "../../shared/scoring";
import type { GameRoomState } from "../../shared/types";
import { formatScore } from "../lib/formatScore";
import { RoundRadarResult } from "./RoundRadarResult";
import { HostKickButton } from "./HostKickButton";
import { QuestionImagePanel } from "./QuestionImagePanel";

export function RoundResult({
  room,
  playerId,
  onKick,
  kickingPlayerId,
}: {
  room: GameRoomState;
  playerId: string;
  onKick?: (targetPlayerId: string) => void;
  kickingPlayerId?: string | null;
}) {
  const [mobileView, setMobileView] = useState<"photo" | "radar">("photo");
  const result = room.roundResult;
  const question = room.currentQuestion;
  if (!result || !question) return null;
  const roomPlayers = new Map(room.players.map((player) => [player.id, player]));
  const rankedPlayers = result.players
    .map((player, fallbackIndex) => {
      const roomPlayer = roomPlayers.get(player.playerId);
      return {
        player,
        roomPlayer,
        slotIndex: roomPlayer?.slotIndex ?? fallbackIndex,
        active: roomPlayer?.active ?? true,
        totalScore: roomPlayer?.score ?? player.points,
      };
    })
    .sort((left, right) => right.player.points - left.player.points
      || left.slotIndex - right.slotIndex);

  return (
    <section className="round-result-page multiplayer-round-result">
      <header className="result-page-heading">
        <div><span>ROUND {room.round} COMPLETE</span><h2>POSITION REVEALED</h2></div>
        <p>{room.round === room.settings.totalRounds ? "FINAL RESULT INCOMING" : "NEXT ROUND IN A MOMENT"}</p>
      </header>
      <div className="stage-view-tabs multiplayer-result-view-tabs" role="group" aria-label="Round result view">
        <button type="button" className={mobileView === "photo" ? "is-active" : ""} aria-pressed={mobileView === "photo"} onClick={() => setMobileView("photo")}>PHOTO</button>
        <button type="button" className={mobileView === "radar" ? "is-active" : ""} aria-pressed={mobileView === "radar"} onClick={() => setMobileView("radar")}>RADAR</button>
      </div>
      <div className={`round-result-layout multiplayer-round-result-media mobile-view-${mobileView}`} data-screenshot-placement="first">
        <QuestionImagePanel className="result-question-image" src={question.imageUrl} alt="Round location screenshot" />
        <RoundRadarResult result={result} playerId={playerId} players={room.players} assetOrigin={room.assetOrigin} />
      </div>
      <div className="multiplayer-result-table" role="table" aria-label="Round leaderboard">
        <div className="multiplayer-result-table-head" role="row">
          <span role="columnheader">RANK</span>
          <span role="columnheader">PLAYER</span>
          <span role="columnheader">ROUND</span>
          <span role="columnheader">TOTAL</span>
        </div>
        {rankedPlayers.map(({ player, roomPlayer, slotIndex, active, totalScore }, index) => {
          const previous = index > 0 ? rankedPlayers[index - 1].player.points : null;
          const rank = previous === player.points
            ? rankedPlayers.findIndex((entry) => entry.player.points === player.points) + 1
            : index + 1;
          const guessedMap = player.mapGuess ? getMap(player.mapGuess).name : "No guess";
          const distance = player.distance === null ? null : `${(player.distance * 100).toFixed(1)}%`;
          const layer = player.layerGuess?.toUpperCase() ?? "—";
          const timeBonus = player.timeBonus ?? 0;
          return (
            <details className={`${player.playerId === playerId ? "is-me" : ""} ${active ? "" : "is-dnf"}`} key={player.playerId}>
              <summary>
                <span className="round-result-rank">#{rank}</span>
                <span className="multiplayer-result-player">
                  <i className={`round-result-seat player-slot-${slotIndex + 1}`}>P{slotIndex + 1}</i>
                  <strong>{player.nickname}</strong>
                  {player.playerId === playerId && <small>YOU</small>}
                  {!active && <small className="is-dnf-label">DNF</small>}
                </span>
                <b className="multiplayer-round-score">+{formatScore(player.points)}</b>
                <b className="multiplayer-total-score">{formatScore(totalScore)}</b>
              </summary>
              <div className="multiplayer-result-detail-body">
                <dl>
                  <div><dt>MAP</dt><dd className={player.mapCorrect ? "correct" : "wrong"}>{guessedMap} {player.mapCorrect ? "✓" : "×"}</dd></div>
                  <div><dt>MAP SCORE</dt><dd>+{formatScore(player.mapScore)} / {MAP_SCORE}</dd></div>
                  <div><dt>LAYER</dt><dd className={player.layerCorrect ? "correct" : "wrong"}>{layer} {player.layerCorrect ? "✓" : "×"}</dd></div>
                  <div><dt>LAYER SCORE</dt><dd>+{formatScore(player.layerScore)} / {LAYER_SCORE}</dd></div>
                  <div><dt>DISTANCE</dt><dd>{distance ?? (player.submitted ? "WRONG MAP" : "—")}</dd></div>
                  <div><dt>POSITION SCORE</dt><dd>+{formatScore(player.locationScore)} / {MAX_LOCATION_SCORE}</dd></div>
                  <div><dt>TIME</dt><dd>{player.elapsedMs === null ? "—" : `${(player.elapsedMs / 1000).toFixed(1)}s`}</dd></div>
                  <div><dt>TIME SCORE</dt><dd>+{formatScore(timeBonus)} / {MAX_TIME_BONUS}</dd></div>
                </dl>
                {roomPlayer && onKick && (
                  <HostKickButton
                    viewerPlayerId={playerId}
                    hostPlayerId={room.hostPlayerId}
                    target={roomPlayer}
                    status={room.status}
                    isKicking={kickingPlayerId === player.playerId}
                    onKick={onKick}
                  />
                )}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
