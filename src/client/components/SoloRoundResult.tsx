import { useState } from "react";
import { getMap } from "../../shared/maps";
import { LAYER_SCORE, MAP_SCORE, MAX_LOCATION_SCORE, MAX_TIME_BONUS } from "../../shared/scoring";
import type { SoloSessionState } from "../../shared/solo";
import { formatScore } from "../lib/formatScore";
import { ResultRadarView, type ResultRadarMarker } from "./RoundRadarResult";

export function SoloRoundResult({
  session,
  busy,
  onNext,
}: {
  session: SoloSessionState;
  busy: boolean;
  onNext: () => void;
}) {
  const [mobileView, setMobileView] = useState<"radar" | "photo">("radar");
  const result = session.roundResult;
  const question = session.currentQuestion;
  if (!result || !question) return null;
  const player = result.player;
  const markers: ResultRadarMarker[] = player.pointGuess
    && player.mapGuess === result.correctMapId
    && player.layerGuess === result.correctLayerId
    ? [{ key: "you", point: player.pointGuess, className: "your-point", label: "YOU", ariaLabel: "Your guessed point" }]
    : [];
  const guessedMap = player.mapGuess ? getMap(player.mapGuess).name : "No guess";
  const distance = player.distance === null ? null : `${(player.distance * 100).toFixed(1)}%`;
  const isLastRound = session.round >= session.settings.totalRounds;

  return (
    <section className="round-result-page solo-round-result">
      <header className="result-page-heading">
        <div><span>ROUND {session.round} COMPLETE</span><h2>POSITION REVEALED</h2></div>
        {result.hintUsed && <p className="solo-hint-used">HINT USED · MAP REVEALED</p>}
      </header>
      <div className="solo-mobile-view-tabs solo-result-view-tabs" role="group" aria-label="Round result view">
        <button type="button" className={mobileView === "radar" ? "is-active" : ""} aria-pressed={mobileView === "radar"} onClick={() => setMobileView("radar")}>RADAR</button>
        <button type="button" className={mobileView === "photo" ? "is-active" : ""} aria-pressed={mobileView === "photo"} onClick={() => setMobileView("photo")}>PHOTO</button>
      </div>
      <div className={`round-result-layout solo-round-result-media mobile-view-${mobileView}`}>
        <ResultRadarView
          correctMapId={result.correctMapId}
          correctLayerId={result.correctLayerId}
          correctPoint={result.correctPoint}
          markers={markers}
          legend={["✓ Correct", "Y You"]}
          assetOrigin={session.assetOrigin}
        />
        <div className="result-question-image"><img src={question.imageUrl} alt="Round location screenshot" /></div>
      </div>
      <div className="solo-score-summary" aria-label="Your round result">
        <div className="solo-result-facts">
          <div><span>MAP</span><strong className={player.mapCorrect ? "correct" : "wrong"}>{guessedMap} {player.mapCorrect ? "✓" : player.submitted ? "×" : "—"}</strong></div>
          <div><span>LAYER</span><strong className={player.layerCorrect ? "correct" : "wrong"}>{player.layerGuess?.toUpperCase() ?? "—"} {player.layerCorrect ? "✓" : player.submitted ? "×" : ""}</strong></div>
          <div><span>DISTANCE</span><strong>{distance ?? (player.submitted ? "WRONG MAP / LAYER" : "NO GUESS")}</strong></div>
          <div><span>TIME</span><strong>{player.elapsedMs === null ? "—" : `${(player.elapsedMs / 1000).toFixed(1)}s`}</strong></div>
        </div>
        <div className="solo-score-breakdown">
          <div><span>MAP SCORE</span><strong>+{formatScore(player.mapScore)} <i>/ {MAP_SCORE}</i></strong></div>
          <div><span>LAYER SCORE</span><strong>+{formatScore(player.layerScore)} <i>/ {LAYER_SCORE}</i></strong></div>
          <div><span>POSITION SCORE</span><strong>+{formatScore(player.locationScore)} <i>/ {MAX_LOCATION_SCORE}</i></strong></div>
          <div><span>TIME SCORE</span><strong>+{formatScore(player.timeBonus ?? 0)} <i>/ {MAX_TIME_BONUS}</i></strong></div>
        </div>
        <div className="solo-round-total"><span>ROUND SCORE</span><strong>+{formatScore(player.points)}</strong></div>
      </div>
      <div className="solo-next-action">
        <button className="primary-button" type="button" onClick={onNext} disabled={busy}>
          {busy ? "LOADING…" : isLastRound ? "VIEW SESSION RESULTS" : "NEXT ROUND"}
        </button>
      </div>
    </section>
  );
}
