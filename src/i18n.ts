/**
 * Built-in UI strings. Pass `locale` to <TelopRoot>, and override any key with `messages`.
 * Only the library's own words live here — your content (titles, labels) is always yours.
 */

export interface Messages {
  /** Shown instead of a number that is not known yet (a bold "—" looks broken). */
  waiting: string;
  loading: string;
  retry: string;
  /** Countdown reached zero. */
  started: string;
  /** Stamp on the correct answer. */
  correct: string;
  /** Default unit for head counts. */
  people: string;
  /** Shown when polling fails after data was already on screen. */
  unstable: string;
  /** Generic load failure when the error has no message. */
  loadFailed: string;
  /** Label of the breaking-news bar. */
  flash: string;
  /** Label of a sum (judges' total). */
  total: string;
}

export const MESSAGES: Record<"ja" | "en" | "zh", Messages> = {
  ja: {
    waiting: "集計待ち", loading: "読み込み中", retry: "もう一度読み込む", started: "開始",
    correct: "正解", people: "名", unstable: "接続が不安定です", loadFailed: "読み込めませんでした",
    flash: "速報", total: "合計",
  },
  en: {
    waiting: "Waiting", loading: "Loading", retry: "Try again", started: "Now",
    correct: "Correct", people: "", unstable: "Connection unstable", loadFailed: "Could not load",
    flash: "Breaking", total: "Total",
  },
  zh: {
    waiting: "统计中", loading: "读取中", retry: "重新读取", started: "开始",
    correct: "正确", people: "人", unstable: "连接不稳定", loadFailed: "读取失败",
    flash: "快讯", total: "总分",
  },
};

export type Locale = keyof typeof MESSAGES;
