import { describe, it, expect, vi, afterEach } from "vitest";
import { createTheme, checkTheme, broadcast, variety, ceremony } from "../src/theme";

afterEach(() => { vi.restoreAllMocks(); });
import { contrastRatio, readableOn, mix, parseColor, ensureContrast } from "../src/color";

describe("color helpers", () => {
  it("parses hex and rgb, and passes unknown colors through mix as CSS", () => {
    expect(parseColor("#25408e")).toEqual([37, 64, 142]);
    expect(parseColor("#fff")).toEqual([255, 255, 255]);
    expect(parseColor("rgb(1, 2, 3)")).toEqual([1, 2, 3]);
    expect(parseColor("var(--x)")).toBeNull();
    expect(mix("var(--a)", "#000", 0.5)).toContain("color-mix");
  });
  it("contrast follows WCAG (black on white = 21)", () => {
    expect(Math.round(contrastRatio("#000", "#fff"))).toBe(21);
    expect(readableOn("#ffd400")).not.toBe("#ffffff"); // dark text on yellow
    expect(readableOn("#25408e")).toBe("#ffffff");
    expect(readableOn("#ff4f57")).toBe("#ffffff"); // bright red keeps white text (3.2:1, bold captions)
  });
  it("ensureContrast moves only as far as needed", () => {
    const c = ensureContrast("#25408e", "#0b0c10", 4.5, "#ffffff");
    expect(contrastRatio(c, "#0b0c10")).toBeGreaterThanOrEqual(4.5);
    expect(c).not.toBe("#ffffff");
  });
});

describe("createTheme from two colors", () => {
  const quiet = () => vi.spyOn(console, "warn").mockImplementation(() => {});

  it("derives a readable dark mode instead of falling back to the default navy", () => {
    quiet();
    const t = createTheme("forest", { primary: "#1d6b46", accent: "#e0a000" });
    expect(t.dark.primary).not.toBe(broadcast.dark.primary);
    expect(contrastRatio(t.dark.primary, t.dark.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.dark.fg, t.dark.bg)).toBeGreaterThanOrEqual(7);
  });

  it("picks dark text on a light brand color", () => {
    quiet();
    const t = createTheme("sun", { primary: "#1d3557", accent: "#ffd400" });
    expect(t.light.onAccent).not.toBe("#ffffff");
    expect(contrastRatio(t.light.onAccent as string, t.light.accent)).toBeGreaterThanOrEqual(3);
  });

  it("keeps fields that are given", () => {
    quiet();
    const t = createTheme("jcl", { primary: "#25408e", accent: "#d2232a", bg: "#f7f7f4" }, { bg: "#0e1a3c" });
    expect(t.light.primary).toBe("#25408e");
    expect(t.light.bg).toBe("#f7f7f4");
    expect(t.dark.bg).toBe("#0e1a3c");
  });

  it("checkTheme reports a color that disappears on the background, and warns once", () => {
    const warn = quiet();
    const t = createTheme("pale", { primary: "#e8ecf2", accent: "#f2f2a0" });
    const issues = checkTheme(t);
    expect(issues.some((i) => i.mode === "light" && i.what === "primary on background")).toBe(true);
    createTheme("pale", { primary: "#e8ecf2", accent: "#f2f2a0" });
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("the built-in presets have no issues", () => {
    for (const t of [broadcast, variety, ceremony]) expect(checkTheme(t), t.name).toEqual([]);
  });
});
