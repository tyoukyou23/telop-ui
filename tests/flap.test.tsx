// @vitest-environment jsdom
/**
 * Regression: a split-flap row must have one cell width. Padding cells next to kanji were
 * narrow, so rows of a board ended at different places, and cells changed width while
 * shuffling through characters of a different width.
 */
import { describe, it, expect, afterEach } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SplitFlap } from "../src/numbers";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
function render(node: JSX.Element) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(node));
  return [...host.querySelectorAll(".tu-flap")].map((c) => c.classList.contains("is-wide"));
}
afterEach(() => { act(() => root.unmount()); host.remove(); });

describe("SplitFlap cell width", () => {
  it("a row with kanji is wide in every cell, padding included", () => {
    expect(render(<SplitFlap text="開会式" length={6} />)).toEqual([true, true, true, true, true, true]);
  });
  it("an ASCII row stays narrow", () => {
    expect(render(<SplitFlap text="ROOM A" length={6} />)).toEqual([false, false, false, false, false, false]);
  });
  it("kana in the flip characters make the row wide even before it lands", () => {
    expect(render(<SplitFlap text="AB" length={3} chars="アイウ" />)).toEqual([true, true, true]);
  });
  it("`wide` overrides the guess", () => {
    expect(render(<SplitFlap text="開会" length={2} wide={false} />)).toEqual([false, false]);
  });
});
