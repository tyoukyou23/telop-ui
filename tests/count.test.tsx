// @vitest-environment jsdom
/**
 * Regression: useCountUp yields fractional values while animating. Components that print
 * the value themselves must round it, or the screen flashes "105.90710051260889".
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { VersusMeter, JudgeScores } from "../src/shows";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "requestAnimationFrame", "cancelAnimationFrame", "performance"] });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.useRealTimers(); });

/** Every number printed in big type, sampled through an animation. */
function sampleBigNumbers(frames: number): string[] {
  const seen: string[] = [];
  for (let i = 0; i < frames; i++) {
    act(() => { vi.advanceTimersByTime(40); });
    host.querySelectorAll(".tu-big").forEach((e) => seen.push(e.textContent || ""));
  }
  return seen;
}

describe("printed counters are whole numbers while counting", () => {
  it("VersusMeter", () => {
    const render = (b: number) => root.render(<VersusMeter left={{ label: "A", value: 120 }} right={{ label: "B", value: b }} />);
    act(() => render(105));
    act(() => render(115));
    const seen = sampleBigNumbers(25);
    expect(seen.some((t) => t.includes("."))).toBe(false);
    expect(seen.at(-1)).toBe("115");
  });

  it("JudgeScores total, and it counts up again on the next round", () => {
    const judges = [{ key: 1, name: "A", score: 91 }, { key: 2, name: "B", score: 88 }];
    const total = () => host.querySelector(".tu-judge-total .tu-big")?.textContent;
    for (const round of [1, 2]) {
      act(() => root.render(<JudgeScores judges={judges} revealed={0} />));
      sampleBigNumbers(40); // settle back to 0
      act(() => root.render(<JudgeScores judges={judges} revealed={2} />));
      act(() => { vi.advanceTimersByTime(40); });
      expect(Number(total()), `round ${round} starts low`).toBeLessThan(179);
      const seen = sampleBigNumbers(40);
      expect(seen.some((t) => t.includes(".")), `round ${round} fractions`).toBe(false);
      expect(total(), `round ${round} lands`).toBe("179");
    }
  });
});
