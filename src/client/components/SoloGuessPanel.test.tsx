// @vitest-environment jsdom

import { useState } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { MapId } from "../../shared/maps";
import { MAP_IDS } from "../../shared/maps";
import { SoloGuessPanel } from "./SoloGuessPanel";

afterEach(cleanup);

describe("SoloGuessPanel hint", () => {
  it("confirms the one-time hint, reveals only the map, and selects it without revealing a floor or point", async () => {
    const user = userEvent.setup();
    const requestHint = vi.fn();
    const phaseChanged = vi.fn();
    function Controlled() {
      const [hintMapId, setHintMapId] = useState<MapId | null>(null);
      return (
        <SoloGuessPanel
          questionId="question-one"
          mapPool={[...MAP_IDS]}
          assetOrigin=""
          hintMapId={hintMapId}
          expired={false}
          busy={false}
          onPhaseChange={phaseChanged}
          onHint={async () => {
            requestHint();
            setHintMapId("nuke");
          }}
          onSubmit={vi.fn()}
        />
      );
    }
    render(<Controlled />);

    await waitFor(() => expect(phaseChanged).toHaveBeenLastCalledWith("map"));
    expect(document.querySelector(".solo-guess-workspace")?.classList.contains("is-map-selection")).toBe(true);
    expect(screen.getByText("WHICH MAP IS THIS LOCATION ON?")).toBeTruthy();
    expect(screen.getByText("First choose the correct map, then pinpoint the exact location in the next step.")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /HINT/ }));
    expect(screen.getByText("Reveal the correct map?")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "REVEAL MAP" }));

    expect(requestHint).toHaveBeenCalledTimes(1);
    expect(screen.getByText("THIS LOCATION IS ON NUKE")).toBeTruthy();
    expect(screen.getByRole("button", { name: "UPPER" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "LOWER" })).toBeTruthy();
    expect(screen.getByText("STEP 2 · PINPOINT LOCATION")).toBeTruthy();
    expect(screen.getByText("Now place your marker on the 2D radar to mark the exact spot.")).toBeTruthy();
    expect(phaseChanged).toHaveBeenLastCalledWith("pinpoint");
    expect(document.querySelector(".solo-guess-workspace")?.classList.contains("is-pinpoint")).toBe(true);
    expect(screen.queryByRole("img", { name: "Correct answer point" })).toBeNull();
    expect(screen.queryByRole("button", { name: /REVEAL MAP/ })).toBeNull();
  });
});
