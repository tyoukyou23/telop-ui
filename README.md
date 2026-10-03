# telop-ui

**Japanese TV-broadcast style UI for React** — for the screen at the front of the room.
Projectors, lobby signage, live quizzes and votes, ceremonies, countdowns.

**[▶ Live demo](https://tyoukyou23.github.io/telop-ui/)** · [日本語](./README.ja.md)

- **Telops and lower thirds**: slanted caption boxes, speaker name cards, headline boxes
- **Numbers that perform**: count-up, slot-machine digit rollers, split-flap boards, countdowns
- **Live charts**: rankings whose rows slide to their new place, choice bars with a stamp on the answer, a drumroll reveal
- **Broadcast effects**: wipes, sweep banners, slide-in tickers, credits rolls, spotlight, eyecatch curtain between slides
- **Made for projection**: sizes scale with `min(vw, vh)`, two colors plus ink, a dark mode for dim rooms, controls that hide until the mouse moves

No CSS framework needed. React 17+, TypeScript types included, no runtime dependencies.

## Install

```sh
npm install telop-ui
```

## Quick start

```tsx
import { TelopRoot, Stage, StageHeader, LBand, LBandItem, Telop, BigNumber, SegBar } from "telop-ui";

export function Submissions({ done, total }: { done: number; total: number }) {
  return (
    <TelopRoot locale="en">
      <Stage
        header={<StageHeader logo="/logo.svg" title="Live Quiz" subtitle="Room A" />}
        band={<LBand tag="LIVE"><LBandItem>Room A</LBandItem></LBand>}
      >
        <Telop className="tu-wipe">Submitted</Telop>
        <BigNumber value={done} size="hero" tone="primary" />
        <SegBar total={total} filled={done} tall />
      </Stage>
    </TelopRoot>
  );
}
```

`TelopRoot` injects the stylesheet once. If you prefer a static file, pass
`injectStyles={false}` and `import "telop-ui/styles.css"`.

## Themes

Three presets: `broadcast` (navy + red), `variety` (ink + orange) and `ceremony` (green + gold).
Make your own from two brand colors:

```tsx
import { createTheme, TelopRoot } from "telop-ui";

const school = createTheme("school", { primary: "#25408e", accent: "#d2232a" }, { primary: "#8ea6ec", accent: "#ff5157" });

<TelopRoot theme={school} mode="dark">…</TelopRoot>
```

Every color is a CSS variable (`--tu-bg`, `--tu-fg`, `--tu-primary`, `--tu-accent`, `--tu-panel`, `--tu-mute`, `--tu-track` …),
so you can also override them in plain CSS.

**Use `accent` sparingly.** It is for the one thing people must look at: the hardest question, the winner, the
last ten seconds. If everything is red, nothing is.

## Live data

```tsx
import { usePolling, useNow, StatusScreen, Countdown } from "telop-ui";

const { data, error, stale, skew, refresh } = usePolling(() => fetch("/api/live").then((r) => r.json()), {
  interval: 4000,
  serverTimeOf: (d) => d.serverTime, // correct the projector's clock
});
const now = useNow(1000, skew);

if (!data) return <StatusScreen message={error} onRetry={refresh} />;
```

When a refresh fails after data is on screen, the old data stays and `stale` is set — a projector
should never go blank in front of an audience.

## Components

| Group | Components |
|---|---|
| Root & hooks | `TelopRoot` `useTelop` `useMessages` · `usePolling` `useNow` `useCountUp` `useAutoHide` `useHotkeys` `useStoredMode` · `formatClock` `formatCountdown` `toggleFullscreen` |
| Layout | `Stage` `StageHeader` `ControlBar` `CtrlButton` `Split` `Panel` `CardGrid` `Card` `LBand` `LBandItem` `Marquee` `StatusScreen` |
| Text | `Telop` `Text` `Tag` `Pill` `LiveDot` `HeadlineBox` `LowerThird` `PersonLowerThird` `TitleCard` `BigMessage` `Typewriter` |
| Numbers | `BigNumber` `StatBlock` `SegBar` `ProgressBar` `Countdown` `Clock` `DigitRoller` `SplitFlap` |
| Charts | `RankingList` `RankingRow` `RankingRace` `BarList` `StackedBar` `ChoiceBars` `Stamp` `DrumrollReveal` |
| Effects | `TickerStack` `SweepBanner` `Reveal` `Stagger` `CreditsRoll` `Spotlight` |
| Slides | `SlideDeck` (eyecatch curtain between slides, auto-advance, ← → / Space) |

Utility classes: `tu-wipe` (wipe in), `tu-wipe is-start` / `is-trail` (stagger), `tu-muted`, `tu-spacer`.

Built-in strings come in `ja` (default), `en` and `zh`; override any of them with `messages`.

## Demo

**Online: https://tyoukyou23.github.io/telop-ui/** — open a scene and press **F** for full screen.

To run it locally:

```sh
git clone https://github.com/tyoukyou23/telop-ui && cd telop-ui
npm install
npm run dev
```

Five complete scenes (live quiz, live vote, departure board, ceremony slides, countdown) and every
component with a code snippet. Switch language, theme and light/dark at the top. Open a scene and press
**F** for full screen.

## Design notes

- **Everything in a list is on screen within 0.7 s.** Staggered entrances look nice the first time and
  slow the tenth time.
- **No glow, no gradients.** Flat color blocks and slanted boxes read from the back of a room.
- **Theme switches are instant.** The background never transitions, or dark boxes float on a light page for half a second.
- **`prefers-reduced-motion`** slows the endless loops (marquee, credits) and disables the big moves.
- **Don't rank people in front of an audience.** The ranking components are for questions, options and teams.

## License

MIT © tyoukyou23
