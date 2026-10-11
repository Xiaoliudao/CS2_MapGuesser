import type { ReactNode } from "react";

export type SoloStagePhase = "map" | "pinpoint";

export function SoloStageLayout({
  phase,
  screenshot,
  stageContent,
}: {
  phase: SoloStagePhase;
  screenshot: ReactNode;
  stageContent: ReactNode;
}) {
  return (
    <section
      className={`game-layout-v2 solo-game-layout is-${phase}`}
      data-screenshot-placement="first"
    >
      {screenshot}
      {stageContent}
    </section>
  );
}
