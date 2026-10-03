// @vitest-environment jsdom
/**
 * Regression: callers pass fresh literals (arrays, inline callbacks) on every render, and live
 * screens re-render every second (a clock). Effects must not restart because of that.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { DrumrollReveal } from "../src/charts";
import { SlideDeck } from "../src/slides";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
beforeEach(() => { vi.useFakeTimers(); host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); vi.useRealTimers(); });

/** Re-render with fresh props every `tick` ms for `total` ms. */
function rerenderEvery(render: () => JSX.Element, tick: number, total: number) {
  act(() => root.render(render()));
  for (let t = 0; t < total; t += tick) {
    act(() => { vi.advanceTimersByTime(tick); });
    act(() => root.render(render()));
  }
}

describe("DrumrollReveal", () => {
  it("lands on the answer even when options is a new array every render", () => {
    rerenderEvery(() => (
      <DrumrollReveal play answer="b" duration={1000}
        options={[{ key: "a", label: "A" }, { key: "b", label: "B" }, { key: "c", label: "C" }, { key: "d", label: "D" }]} />
    ), 200, 2000);
    const items = [...host.querySelectorAll(".tu-drum-item")];
    expect(items.map((e) => e.classList.contains("is-hit"))).toEqual([false, true, false, false]);
  });
});

describe("SlideDeck", () => {
  it("auto-advances even when onIndexChange is an inline callback", () => {
    const seen: number[] = [];
    rerenderEvery(() => (
      <SlideDeck auto interval={1500} keyboard={false} onIndexChange={(i) => seen.push(i)}
        slides={[{ key: "a", node: "A" }, { key: "b", node: "B" }, { key: "c", node: "C" }]} />
    ), 500, 3400);
    expect(seen).toEqual([1, 2]);
  });
});
