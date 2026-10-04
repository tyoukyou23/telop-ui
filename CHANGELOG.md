# Changelog

## 0.2.1 — 2026-10-04

### Fixed
- `SplitFlap`: one cell width per row. Padding cells next to kanji were narrow, so the rows of a
  board ended at different places, and cells changed width while shuffling. New `wide` prop
  to force it either way.
- `SlideDeck`: the slanted corner of a telop at the left edge of a slide was cut off.

### Demo
- Previews and scene thumbnails are iframes with a fixed 16:9 viewport, so phones and odd
  window shapes show the real projector layout. Phone layout; a full-screen button per preview.
- The countdown scene uses the ring; the ceremony's speaker slide has a typed quote.

## 0.2.0 — 2026-10-04

### Added
- **TV segments**: `MekuriBoard` (flip board), `JudgeScores` (judges' panel), `VersusMeter` and `ScoreBug`
  (team scores), `RankReveal` (countdown ranking), `NewsFlash` (breaking-news bar).
- **Global style** on `TelopRoot`: `shape` (slant · square · round), `motion` (calm · normal · snappy),
  `density` (comfortable · compact). `useSpeed()` scales your own timers with `motion`.
- **Forms** for existing parts: `Telop variant`, `HeadlineBox variant`, `LowerThird tone`,
  `PersonLowerThird align`, `TitleCard` / `BigMessage align`, `SegBar variant="dots"`,
  `ProgressBar variant="ring"` + `label`, `Countdown variant="ring"`, `SweepBanner tone`,
  `CreditsRoll align`, `SlideDeck transition` (curtain · fade · slide).
- Strings `flash` and `total` in ja / en / zh.

### Fixed
- `Reveal` wipes across its content, not its full-width wrapper (it appeared late and the
  slanted corners popped in at the end), and keeps its space while hidden.
- An updated stylesheet now replaces an older one already on the page (hot reload, two versions).
- Counters printed by the new segments never show fractions while counting.

### Demo
- Rebuilt: scenes and components on separate tabs; each component on its own page with a
  16:9 preview, a step player, its parameters (with defaults) and copyable code.

## 0.1.0 — 2026-10-03

First release.

- Root, themes (`broadcast` / `variety` / `ceremony` + `createTheme`), light/dark, ja/en/zh strings
- Layout: `Stage`, `StageHeader`, `LBand`, `Marquee`, `Split`, `Panel`, `CardGrid`, `StatusScreen` …
- Text: `Telop`, `LowerThird`, `PersonLowerThird`, `HeadlineBox`, `TitleCard`, `BigMessage`, `Typewriter` …
- Numbers: `BigNumber`, `StatBlock`, `SegBar`, `Countdown`, `DigitRoller`, `SplitFlap` …
- Charts: `RankingList`, `RankingRace`, `BarList`, `StackedBar`, `ChoiceBars`, `DrumrollReveal`
- Effects: `TickerStack`, `SweepBanner`, `Reveal`, `Stagger`, `CreditsRoll`, `Spotlight`
- Slides: `SlideDeck` with an eyecatch curtain
- Hooks: `usePolling` (keeps the last data on failure), `useNow` (server clock skew), `useAutoHide`, `useHotkeys` …
