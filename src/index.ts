/**
 * telop-ui — Japanese TV-broadcast style UI for projectors, signage and live presentations.
 * Everything is exported from here; import nothing from inner files.
 */

// foundations
export { TEXT, TELOP, NUMBER, MOTION, resolveSize } from "./tokens";
export type { TextSize, TelopSize, NumberSize } from "./tokens";
export { presets, broadcast, variety, ceremony, createTheme, themeVars } from "./theme";
export type { TelopTheme, ModeColors } from "./theme";
export { MESSAGES } from "./i18n";
export type { Messages, Locale } from "./i18n";
export { CSS } from "./styles";

// root & hooks
export { TelopRoot, useTelop, useMessages, useSpeed, SPEED } from "./root";
export type { TelopRootProps, Shape, Motion, Density } from "./root";
export {
  useStoredMode, useAutoHide, useCountUp, useNow, useHotkeys, usePolling,
  formatClock, formatCountdown, toggleFullscreen,
} from "./hooks";
export type { PollingOptions, PollingState } from "./hooks";

// layout
export { Stage, StageHeader, ControlBar, CtrlButton, Split, Panel, CardGrid, Card, LBand, LBandItem, Marquee, StatusScreen } from "./layout";
export type { StageHeaderProps } from "./layout";

// text
export { Telop, Text, Tag, Pill, LiveDot, HeadlineBox, LowerThird, PersonLowerThird, TitleCard, BigMessage, Typewriter } from "./text";
export type { TelopProps, TextProps } from "./text";

// numbers
export { BigNumber, StatBlock, SegBar, ProgressBar, Countdown, Clock, DigitRoller, SplitFlap } from "./numbers";
export type { BigNumberProps, StatBlockProps, CountdownProps, DigitRollerProps, SplitFlapProps } from "./numbers";

// charts
export { RankingRow, RankingList, BarList, StackedBar, ChoiceBars, Stamp, RankingRace, DrumrollReveal } from "./charts";
export type { RankingRowProps, RankingItem, BarItem, ChoiceOption, RaceItem, DrumrollProps } from "./charts";

// effects
export { TickerStack, SweepBanner, Reveal, Stagger, CreditsRoll, Spotlight } from "./effects";
export type { TickerItem, CreditItem } from "./effects";

// TV segments
export { MekuriBoard, JudgeScores, VersusMeter, ScoreBug, RankReveal, NewsFlash } from "./shows";
export type { MekuriItem, MekuriBoardProps, Judge, JudgeScoresProps, Side, VersusMeterProps, ScoreBugProps, RevealRankItem, RankRevealProps, NewsFlashProps } from "./shows";

// slides
export { SlideDeck } from "./slides";
export type { Slide, SlideDeckProps } from "./slides";
