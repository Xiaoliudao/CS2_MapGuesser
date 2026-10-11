// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SoloStageLayout, type SoloStagePhase } from "./SoloStageLayout";

afterEach(cleanup);

describe("SoloStageLayout", () => {
  it("keeps the screenshot first while the stage changes", () => {
    const renderLayout = (phase: SoloStagePhase) => (
      <SoloStageLayout
        phase={phase}
        screenshot={<div data-testid="screenshot" />}
        stageContent={<div data-testid="stage-content" />}
      />
    );
    const { container, rerender } = render(renderLayout("map"));
    const assertStableOrder = (phase: SoloStagePhase) => {
      const layout = container.querySelector(".solo-game-layout");
      expect(layout?.getAttribute("data-screenshot-placement")).toBe("first");
      expect(layout?.children[0]?.getAttribute("data-testid")).toBe("screenshot");
      expect(layout?.children[1]?.getAttribute("data-testid")).toBe("stage-content");
      expect(layout?.classList.contains(`is-${phase}`)).toBe(true);
    };

    assertStableOrder("map");
    rerender(renderLayout("pinpoint"));
    assertStableOrder("pinpoint");
  });
});
