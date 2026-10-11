// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GameStageLayout, type GameStagePhase } from "./GameStageLayout";

afterEach(cleanup);

describe("GameStageLayout", () => {
  it.each(["solo-game-layout", "multiplayer-game-layout"])(
    "keeps the screenshot first while %s changes stage",
    (className) => {
      const renderLayout = (phase: GameStagePhase) => (
        <GameStageLayout
          phase={phase}
          className={className}
          screenshot={<div data-testid="screenshot" />}
          stageContent={<div data-testid="stage-content" />}
          footer={<div data-testid="footer" />}
        />
      );
      const { container, rerender } = render(renderLayout("map"));
      const assertStableOrder = (phase: GameStagePhase) => {
        const layout = container.querySelector(".game-stage-layout");
        expect(layout?.getAttribute("data-layout")).toBe("screenshot-left-interaction-right");
        expect(layout?.getAttribute("data-screenshot-placement")).toBe("first");
        expect(layout?.children[0]?.getAttribute("data-testid")).toBe("screenshot");
        expect(layout?.children[1]?.getAttribute("data-testid")).toBe("stage-content");
        expect(layout?.children[2]?.getAttribute("data-testid")).toBe("footer");
        expect(layout?.classList.contains(`is-${phase}`)).toBe(true);
      };

      assertStableOrder("map");
      rerender(renderLayout("pinpoint"));
      assertStableOrder("pinpoint");
    },
  );
});
