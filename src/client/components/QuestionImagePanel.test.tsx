// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuestionImagePanel } from "./QuestionImagePanel";

afterEach(cleanup);

describe("QuestionImagePanel", () => {
  it("uses the shared contain image contract with an optional loading treatment", () => {
    const onLoad = vi.fn();
    const { container, rerender } = render(
      <QuestionImagePanel
        className="question-frame-v2"
        src="/media/questions/wide-shot"
        alt="Location screenshot to identify"
        loading
        showScanline
        onLoad={onLoad}
      />,
    );

    const panel = container.querySelector(".question-image-panel");
    const image = screen.getByRole("img", { name: "Location screenshot to identify" });
    expect(panel?.getAttribute("data-image-fit")).toBe("contain");
    expect(panel?.classList.contains("question-frame-v2")).toBe(true);
    expect(image.classList.contains("question-image-panel-image")).toBe(true);
    expect(image.style.opacity).toBe("0");
    expect(screen.getByText("LOADING INTEL…")).toBeTruthy();
    expect(container.querySelector(".scanline")).toBeTruthy();

    fireEvent.load(image);
    expect(onLoad).toHaveBeenCalledTimes(1);

    rerender(<QuestionImagePanel src="/media/questions/tall-shot" alt="Round location screenshot" />);
    expect(screen.getByRole("img", { name: "Round location screenshot" }).style.opacity).toBe("1");
    expect(screen.queryByText("LOADING INTEL…")).toBeNull();
  });
});
