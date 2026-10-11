import type { ReactNode } from "react";

export type GameStagePhase = "map" | "pinpoint";

export function GameStageLayout({
  phase,
  className = "",
  screenshot,
  stageContent,
  footer = null,
}: {
  phase: GameStagePhase;
  className?: string;
  screenshot: ReactNode;
  stageContent: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section
      className={`game-layout-v2 game-stage-layout ${className} is-${phase}`.trim()}
      data-screenshot-placement="first"
    >
      {screenshot}
      {stageContent}
      {footer}
    </section>
  );
}
