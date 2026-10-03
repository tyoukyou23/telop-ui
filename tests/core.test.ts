import { describe, it, expect } from "vitest";
import { formatCountdown } from "../src/hooks";
import { resolveSize, NUMBER, TELOP } from "../src/tokens";
import { themeVars, createTheme, broadcast } from "../src/theme";
import { MESSAGES } from "../src/i18n";

describe("formatCountdown", () => {
  it("MM:SS under an hour, H:MM:SS from an hour", () => {
    expect(formatCountdown(65)).toBe("01:05");
    expect(formatCountdown(3600)).toBe("1:00:00");
    expect(formatCountdown(3725)).toBe("1:02:05");
  });
  it("rounds partial seconds up and never goes negative", () => {
    expect(formatCountdown(0.2)).toBe("00:01");
    expect(formatCountdown(-5)).toBe("00:00");
  });
});

describe("resolveSize", () => {
  it("maps names to tokens and passes raw CSS through", () => {
    expect(resolveSize("xl", NUMBER, "lg")).toBe(NUMBER.xl);
    expect(resolveSize("min(3vw, 5vh)", NUMBER, "lg")).toBe("min(3vw, 5vh)");
    expect(resolveSize(undefined, TELOP, "md")).toBe(TELOP.md);
  });
});

describe("themes", () => {
  it("band and banners use the LIGHT brand colors in both modes", () => {
    const dark = themeVars(broadcast, "dark");
    expect(dark["--tu-brand-primary"]).toBe(broadcast.light.primary);
    expect(dark["--tu-bg"]).toBe(broadcast.dark.bg);
  });
  it("createTheme keeps the two brand colors and derives the rest", () => {
    const t = createTheme("school", { primary: "#25408e", accent: "#d2232a" });
    expect(t.light.primary).toBe("#25408e");
    expect(t.light.accent).toBe("#d2232a");
    expect(t.light.panel).toBeTruthy();
    expect(t.dark.bg).toBeTruthy();
  });
});

describe("messages", () => {
  it("every locale defines every key", () => {
    const keys = Object.keys(MESSAGES.ja).sort();
    for (const loc of Object.keys(MESSAGES) as Array<keyof typeof MESSAGES>) {
      expect(Object.keys(MESSAGES[loc]).sort()).toEqual(keys);
    }
  });
});
