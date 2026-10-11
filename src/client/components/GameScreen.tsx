import { useEffect, useState } from "react";
import type { ClientEvent } from "../../shared/protocol";
import type { GameRoomState } from "../../shared/types";
import { GuessPanel } from "./GuessPanel";
import { GameStageLayout, type GameStagePhase } from "./GameStageLayout";
import { PlayerStrip } from "./PlayerStrip";
import { QuestionImagePanel } from "./QuestionImagePanel";
import { isImagePreloaded } from "../lib/preloadImage";
import { useAuthoritativeCountdown } from "../hooks/useAuthoritativeCountdown";

export function GameScreen({
  room,
  playerId,
  serverClockOffsetMs,
  clockSynchronized,
  onSend,
  onKick,
  kickingPlayerId,
}: {
  room: GameRoomState;
  playerId: string;
  serverClockOffsetMs: number;
  clockSynchronized: boolean;
  onSend: (event: ClientEvent) => boolean;
  onKick?: (targetPlayerId: string) => void;
  kickingPlayerId?: string | null;
}) {
  const [imageLoaded, setImageLoaded] = useState(() => room.currentQuestion ? isImagePreloaded(room.currentQuestion.imageUrl) : false);
  const [guessPhase, setGuessPhase] = useState<GameStagePhase>("map");
  const remainingMs = useAuthoritativeCountdown({
    status: room.status,
    roundEndsAt: room.roundEndsAt,
    serverClockOffsetMs,
    clockSynchronized,
  });
  const me = room.players.find((player) => player.id === playerId);
  const submitted = Boolean(me?.submitted);
  const expired = remainingMs !== null && remainingMs <= 0;
  const question = room.currentQuestion;

  useEffect(() => {
    setImageLoaded(question ? isImagePreloaded(question.imageUrl) : false);
    setGuessPhase("map");
  }, [question?.imageUrl, question?.questionId]);
  if (!question) return null;

  return (
    <GameStageLayout
      phase={guessPhase}
      className="multiplayer-game-layout"
      screenshot={(
        <section className="question-workspace">
          <QuestionImagePanel
            className="question-frame-v2"
            src={question.imageUrl}
            alt="Location screenshot to identify"
            loading={!imageLoaded}
            showScanline
            onLoad={() => setImageLoaded(true)}
          />
          <div className="round-console">
            <div><span>ROUND</span><strong>{room.round} <i>/ {room.settings.totalRounds}</i></strong></div>
            <div className={remainingMs !== null && remainingMs <= 5_000 ? "urgent" : ""}>
              <span>TIME LEFT</span>
              {remainingMs === null
                ? <strong className="open">SYNCING…</strong>
                : expired
                  ? <strong className="locked">WAITING FOR RESULT…</strong>
                  : <strong>{(remainingMs / 1000).toFixed(1)}<i>s</i></strong>}
            </div>
            <div><span>STATUS</span><strong className={submitted ? "locked" : "open"}>{submitted ? "LOCKED IN ✓" : "SELECTING…"}</strong></div>
          </div>
        </section>
      )}
      stageContent={(
        <GuessPanel
          questionId={question.questionId}
          round={room.round}
          mapPool={room.settings.mapPool}
          assetOrigin={room.assetOrigin}
          submitted={submitted}
          expired={expired}
          onPhaseChange={setGuessPhase}
          onSend={onSend}
        />
      )}
      footer={(
        <div className="game-score-row">
          <PlayerStrip
            players={room.players}
            playerId={playerId}
            hostPlayerId={room.hostPlayerId}
            status={room.status}
            onKick={onKick}
            kickingPlayerId={kickingPlayerId}
          />
        </div>
      )}
    />
  );
}
