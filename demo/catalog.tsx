/**
 * The component catalog: one entry per component. The demo shows ONE entry at a time
 * (its parameters, a large preview, the code for exactly what is on screen) so the page
 * never turns into a wall of moving parts.
 *
 * Every entry lists the parameters worth trying. The first option of each is the
 * library's default, and the code panel prints only what differs from it.
 */
import { useEffect, useState, type ReactNode } from "react";
import {
  Telop, Text, Tag, Pill, LiveDot, HeadlineBox, LowerThird, PersonLowerThird, TitleCard, BigMessage, Typewriter,
  BigNumber, StatBlock, SegBar, ProgressBar, Countdown, Clock, DigitRoller, SplitFlap,
  RankingList, BarList, StackedBar, ChoiceBars, RankingRace, DrumrollReveal,
  MekuriBoard, JudgeScores, VersusMeter, ScoreBug, RankReveal, NewsFlash,
  TickerStack, SweepBanner, Reveal, Stagger, CreditsRoll, Spotlight, SlideDeck,
  Split, Panel, CardGrid, Card, LBand, LBandItem, Marquee,
  formatClock, MOTION, type TickerItem,
} from "telop-ui";
import { T, RATES, CREDIT_NAMES, PLACE_VOTES, JUDGE_SCORES, type Lang } from "./content";

type Copy = typeof T.ja;
export type Value = string | number | boolean;
export type Props = Record<string, Value>;
export interface Ctx { p: Props; step: number; t: Copy; lang: Lang; now: number }

export type GroupId = "segments" | "text" | "numbers" | "charts" | "effects" | "layout";
export const GROUPS: Array<{ id: GroupId; ja: string; en: string }> = [
  { id: "segments", ja: "番組のコーナー", en: "TV segments" },
  { id: "text", ja: "文字", en: "Text" },
  { id: "numbers", ja: "数字", en: "Numbers" },
  { id: "charts", ja: "グラフ", en: "Charts" },
  { id: "effects", ja: "演出", en: "Effects" },
  { id: "layout", ja: "骨組み・スライド", en: "Layout & slides" },
];

export interface Entry {
  id: string;
  group: GroupId;
  /** The component name as imported. */
  name: string;
  desc: { ja: string; en: string };
  /** prop → options. The first option is the default. */
  controls?: Record<string, ReadonlyArray<Value>>;
  /** Show 次へ / 最初から; `step` runs 0..steps. */
  steps?: number;
  /** Draw the preview as a scaled full screen (for parts that fill the screen). */
  screen?: boolean;
  render: (c: Ctx) => ReactNode;
  code: (c: Ctx) => string;
}

/** ` peel="up" columns={2} hideTotal` — only the given props that differ from the default. */
function attrs(id: string, p: Props, only?: string[]): string {
  const e = ENTRY(id);
  return Object.entries(e.controls || {})
    .filter(([k, opts]) => (!only || only.includes(k)) && p[k] !== opts[0])
    .map(([k]) => {
      const v = p[k];
      if (v === true) return ` ${k}`;
      if (v === false || typeof v === "number") return ` ${k}={${v}}`;
      return ` ${k}="${v}"`;
    })
    .join("");
}

const judgesOf = (t: Copy) => t.judges.map((name, i) => ({ key: i, name, score: JUDGE_SCORES[i] }));
const placesOf = (t: Copy) => t.places.map((p, i) => ({ key: i, label: p, value: `${PLACE_VOTES[i]}${t.votesUnit}` }));
/** Scores that move with the step: Blue scores on odd steps, Red on even ones. */
const scoreAt = (step: number) => [120 + Math.ceil(step / 2) * 10, 105 + Math.floor(step / 2) * 15];
const MARKS = ["A", "B", "C", "D"];

/** Replays a one-shot effect each time `step` changes. */
function Replay({ step, children }: { step: number; children: ReactNode }) {
  return <div key={step}>{children}</div>;
}

function TickerDemo({ step, t }: { step: number; t: Copy }) {
  const [items, setItems] = useState<TickerItem[]>([]);
  useEffect(() => {
    if (!step) return undefined;
    const id = Date.now();
    setItems((p) => [...p.slice(-2), { id, label: t.newVote, text: `${t.candidates[step % t.candidates.length]} +${1 + (step % 3)}` }]);
    const tm = setTimeout(() => setItems((p) => p.filter((x) => x.id !== id)), MOTION.ticker);
    return () => clearTimeout(tm);
  }, [step, t]);
  return <TickerStack items={items} bottom="2vh" />;
}

function BannerDemo({ step, t, tone }: { step: number; t: Copy; tone: "primary" | "accent" }) {
  const [on, setOn] = useState(false);
  useEffect(() => { if (step) setOn(true); }, [step]);
  return on ? <SweepBanner tone={tone} text={t.allIn} onDone={() => setOn(false)} /> : null;
}

const PLACEHOLDER = <Text variant="heading" muted>▶</Text>;

export const ENTRIES: Entry[] = [
  /* ── TV segments ─────────────────────────────────────────────── */
  {
    id: "mekuri", group: "segments", name: "MekuriBoard",
    desc: { ja: "めくりフリップ。答えを紙で隠し、1 枚ずつはがして見せる。", en: "Flip board: answers hidden under paper strips, peeled one at a time." },
    controls: { peel: ["right", "up", "flip"], columns: [1, 2] }, steps: 5,
    render: ({ p, step, t }) => (
      <MekuriBoard peel={p.peel as "right"} columns={p.columns as number}
        items={t.mekuri.map(([label, q, a], i) => ({ key: label, label, cover: q, answer: a, hot: i === 0 }))}
        peeled={t.mekuri.slice(0, step).map(([label]) => label)} />
    ),
    code: ({ p }) => `<MekuriBoard${attrs("mekuri", p)}\n  peeled={peeled}\n  items={[{ key: "q1", label: "Q1", cover: "Longest river", answer: "Shinano River", hot: true }, …]} />`,
  },
  {
    id: "judges", group: "segments", name: "JudgeScores",
    desc: { ja: "審査員の採点。1 人ずつ点が出て、そろうと合計が数え上がる。最高点は赤。", en: "Judges' panel: scores appear one by one, then the total counts up. The top score is accent." },
    controls: { reveal: ["flip", "rise", "count"], columns: [5, 3], hideTotal: [false, true] }, steps: 5,
    render: ({ p, step, t }) => (
      <JudgeScores judges={judgesOf(t)} revealed={step} reveal={p.reveal as "flip"} columns={p.columns as number}
        hideTotal={p.hideTotal as boolean} totalLabel={t.judgeTotal} unit={t.points} size="lg" />
    ),
    code: ({ p }) => `<JudgeScores${attrs("judges", p)}\n  revealed={n}\n  judges={[{ key: "a", name: "Judge A", score: 92 }, …]} />`,
  },
  {
    id: "versus", group: "segments", name: "VersusMeter",
    desc: { ja: "対抗戦（紅白・運動会）。リードしている側へ境目が動く。", en: "Two teams on one meter; the split moves toward the leader." },
    controls: { variant: ["bar", "split"], unit: ["点", "none"] }, steps: 8,
    render: ({ p, step, t }) => {
      const [a, b] = scoreAt(step);
      return (
        <div style={{ height: p.variant === "split" ? "42vh" : "auto" }}>
          <VersusMeter variant={p.variant as "bar"} left={{ label: t.teams[0], value: a }} right={{ label: t.teams[1], value: b }} unit={p.unit === "none" ? undefined : (t.points || "pt")} />
        </div>
      );
    },
    code: ({ p }) => `<VersusMeter${attrs("versus", p, ["variant"])}${p.unit === "none" ? "" : ` unit="点"`}\n  left={{ label: "Blue", value: 130 }}\n  right={{ label: "Red", value: 120 }} />`,
  },
  {
    id: "scorebug", group: "segments", name: "ScoreBug",
    desc: { ja: "中継の隅のスコア表示。点が変わると一度だけ光る。置き場所は呼ぶ側が決める。", en: "The corner scoreboard. A changed score flashes once. You place it." },
    controls: { variant: ["stack", "inline"], period: [true, false] }, steps: 8,
    render: ({ p, step, t }) => {
      const [a, b] = scoreAt(step);
      return <ScoreBug variant={p.variant as "stack"} left={{ label: t.teams[0], value: a }} right={{ label: t.teams[1], value: b }} period={p.period ? t.period : undefined} />;
    },
    code: ({ p }) => `<ScoreBug${attrs("scorebug", p, ["variant"])}\n  left={{ label: "Blue", value: 130 }} right={{ label: "Red", value: 120 }}${p.period ? `\n  period="Event 3 of 6"` : ""} />`,
  },
  {
    id: "rankreveal", group: "segments", name: "RankReveal",
    desc: { ja: "第10位からの発表。下から 1 つずつ埋まる。人ではなく物事を並べる。", en: "Countdown ranking, filled from the bottom. Rank things, not people." },
    controls: { layout: ["list", "podium"], bigTop: [3, 1, 0] }, steps: 10,
    render: ({ p, step, t }) => <RankReveal layout={p.layout as "list"} bigTop={p.bigTop as number} items={placesOf(t)} revealed={step} />,
    code: ({ p }) => `<RankReveal${attrs("rankreveal", p)}\n  revealed={n}\n  items={[{ key: "kyoto", label: "Kyoto", value: "184" }, …]} />`,
  },
  {
    id: "flash", group: "segments", name: "NewsFlash",
    desc: { ja: "ニュース速報。画面の端から帯が出て、時間が来たら戻る。", en: "Breaking-news bar from the screen edge; retracts after `duration`." },
    controls: { position: ["top", "bottom"], tone: ["flash", "alert"] }, steps: 1, screen: true,
    render: ({ p, step, t }) => (
      <div className="tu-stage is-no-band" style={{ justifyContent: "center", alignItems: "center" }}>
        {step ? null : PLACEHOLDER}
        <NewsFlash shown={step > 0} position={p.position as "top"} tone={p.tone as "flash"} text={t.flashText} />
      </div>
    ),
    code: ({ p }) => `<NewsFlash${attrs("flash", p)}\n  shown={flash} text="…" duration={5000} onDone={() => setFlash(false)} />`,
  },

  /* ── text ────────────────────────────────────────────────────── */
  {
    id: "telop", group: "text", name: "Telop",
    desc: { ja: "テロップ。見出し・ラベルの基本。", en: "The caption box — headings and labels." },
    controls: { variant: ["slant", "box", "underline"], tone: ["primary", "accent", "outline"], size: ["md", "xs", "sm", "lg", "xl"] },
    render: ({ p, t }) => <Telop variant={p.variant as "slant"} tone={p.tone as "primary"} size={p.size as string}>{t.quizTitle}</Telop>,
    code: ({ p }) => `<Telop${attrs("telop", p)}>Live Quiz</Telop>`,
  },
  {
    id: "tags", group: "text", name: "Tag · Pill · LiveDot",
    desc: { ja: "状態の札（下書き・変更あり）、今まさにの印、ライブ中の点。", en: "State tags, a 'now' pill and a live dot." },
    controls: { accent: [false, true], off: [false, true] },
    render: ({ p }) => (
      <div style={{ display: "flex", gap: "1.6vw", alignItems: "center", fontSize: "1.8em" }}>
        <Tag accent={p.accent as boolean}>{p.accent ? "changed" : "draft"}</Tag><Pill>LIVE</Pill><LiveDot off={p.off as boolean} />
      </div>
    ),
    code: ({ p }) => `<Tag${p.accent ? " accent" : ""}>draft</Tag>\n<Pill>LIVE</Pill>\n<LiveDot${p.off ? " off" : ""} />`,
  },
  {
    id: "headline", group: "text", name: "HeadlineBox",
    desc: { ja: "大きな見出しの箱（問題文など）。sub は 2 行目（訳）。", en: "A big headline box (a question). `sub` is a second line (translation)." },
    controls: { variant: ["fill", "outline"], sub: [true, false] },
    render: ({ p, t, lang }) => (
      <HeadlineBox variant={p.variant as "fill"} sub={p.sub ? (lang === "ja" ? "Mt. Fuji is the highest mountain in Japan" : "富士山は日本一高い山である") : undefined}>{t.questions[0]}</HeadlineBox>
    ),
    code: ({ p }) => `<HeadlineBox${attrs("headline", p, ["variant"])}${p.sub ? ` sub="…"` : ""}>\n  Mt. Fuji is the highest mountain in Japan\n</HeadlineBox>`,
  },
  {
    id: "lower", group: "text", name: "LowerThird",
    desc: { ja: "画面下のテロップ帯（解説・お知らせ）。", en: "The lower third (explanations, notices)." },
    controls: { tone: ["accent", "primary"] },
    render: ({ p, t }) => <LowerThird tone={p.tone as "accent"} label={t.explain}><Text variant="heading">{t.answerNote}</Text></LowerThird>,
    code: ({ p }) => `<LowerThird label="Why"${attrs("lower", p)}>\n  <Text variant="heading">…</Text>\n</LowerThird>`,
  },
  {
    id: "person", group: "text", name: "PersonLowerThird",
    desc: { ja: "登壇者の名前スーパー。右に立つ人には right。", en: "Speaker name card. Use `right` for someone standing on the right." },
    controls: { align: ["left", "right"], sub: [true, false] },
    render: ({ p, t }) => (
      <div style={{ display: "flex", justifyContent: p.align === "right" ? "flex-end" : "flex-start" }}>
        <PersonLowerThird key={String(p.align)} align={p.align as "left"} name={t.speaker} sub={p.sub ? (t.speakerSub || "Sample Academy") : undefined} role={t.speakerRole} />
      </div>
    ),
    code: ({ p }) => `<PersonLowerThird${attrs("person", p, ["align"])} name="Taro Sample"${p.sub ? ` sub="…"` : ""} role="Principal" />`,
  },
  {
    id: "typewriter", group: "text", name: "Typewriter",
    desc: { ja: "1 文字ずつ打ち出す。speed は 1 文字の ms。", en: "Characters appear one by one. `speed` = ms per character." },
    controls: { speed: [70, 30, 140], caret: [true, false] }, steps: 1,
    render: ({ p, step, t }) => <Text variant="title"><Typewriter key={`${step}-${p.speed}`} text={t.tagline} speed={p.speed as number} caret={p.caret as boolean} /></Text>,
    code: ({ p }) => `<Typewriter text="Welcome"${attrs("typewriter", p)} />`,
  },
  {
    id: "titlecard", group: "text", name: "TitleCard",
    desc: { ja: "表題の一枚（式典・発表の 1 枚目）。", en: "A title card (the first slide of a ceremony or a talk)." },
    controls: { align: ["left", "center"], caption: [true, false] }, screen: true,
    render: ({ p, t }) => (
      <div className="tu-stage is-no-band">
        <TitleCard key={String(p.align)} align={p.align as "left"} kicker={t.ceremonyKicker} title={t.ceremonyTitle} caption={p.caption ? t.ceremonyCaption : undefined} />
      </div>
    ),
    code: ({ p }) => `<TitleCard${attrs("titlecard", p, ["align"])} kicker="Class of 2026" title={["Graduation"]}${p.caption ? ` caption="Main Hall"` : ""} />`,
  },
  {
    id: "bigmessage", group: "text", name: "BigMessage",
    desc: { ja: "画面いっぱいの一言（中身が無い日・待っている間）。", en: "One big message filling the screen (nothing on today, waiting)." },
    controls: { align: ["left", "center"], reason: [true, false] }, screen: true,
    render: ({ p, t }) => (
      <div className="tu-stage is-no-band">
        <BigMessage key={String(p.align)} align={p.align as "left"} reason={p.reason ? t.boardTitle : undefined}>{t.countdownTitle}</BigMessage>
      </div>
    ),
    code: ({ p }) => `<BigMessage${attrs("bigmessage", p, ["align"])}${p.reason ? ` reason="Today"` : ""}>Starting soon</BigMessage>`,
  },

  /* ── numbers ─────────────────────────────────────────────────── */
  {
    id: "bignumber", group: "numbers", name: "BigNumber",
    desc: { ja: "太い数字。前の値から動き、止まる瞬間に弾む。null の間は「集計待ち」。", en: "Counts from the previous value and bumps on landing. null = waiting." },
    controls: { tone: ["primary", "accent"], size: ["lg", "md", "xl", "hero"], decimals: [0, 1] }, steps: 6,
    render: ({ p, step }) => <BigNumber value={step ? [42.4, 87.6, 13.1, 64.8, 99.5, 28.2][step - 1] : null} unit="%" size={p.size as string} tone={p.tone as "primary"} decimals={p.decimals as number} />,
    code: ({ p }) => `<BigNumber value={42.4} unit="%"${attrs("bignumber", p)} />`,
  },
  {
    id: "digitroller", group: "numbers", name: "DigitRoller",
    desc: { ja: "スロットのように各桁が回って止まる。", en: "Every digit spins and lands, slot-machine style." },
    controls: { separator: [",", "none"], minDigits: [4, 6], tone: ["primary", "accent"] }, steps: 4,
    render: ({ p, step }) => <DigitRoller value={[0, 1280, 3776, 128, 9999][step]} minDigits={p.minDigits as number} tone={p.tone as "primary"} separator={p.separator === "none" ? undefined : ","} size="hero" />,
    code: ({ p }) => `<DigitRoller value={1280}${attrs("digitroller", p, ["minDigits", "tone"])}${p.separator === "none" ? "" : ` separator=","`} />`,
  },
  {
    id: "splitflap", group: "numbers", name: "SplitFlap",
    desc: { ja: "駅の発車標のように 1 マスずつめくれて止まる。cycles はめくる回数、flipMs は 1 回の速さ。", en: "Departure board: each cell flips and lands. `cycles` = flips, `flipMs` = speed of one flip." },
    controls: { cycles: [6, 2, 12], flipMs: [70, 40, 120] }, steps: 2,
    render: ({ p, step }) => <SplitFlap text={["ROOM A", "HALL", "LOBBY"][step]} length={6} cycles={p.cycles as number} flipMs={p.flipMs as number} size="min(6vw, 10vh)" />,
    code: ({ p }) => `<SplitFlap text="ROOM A" length={6}${attrs("splitflap", p)} />`,
  },
  {
    id: "stat", group: "numbers", name: "StatBlock",
    desc: { ja: "見出し＋数字＋補足。row は数字の右端がそろう。", en: "Label + number + caption. `row` aligns the numbers on the right." },
    controls: { layout: ["stack", "row"], tone: ["primary", "accent"], caption: [false, true] },
    render: ({ p, t }) => (
      <div style={{ display: "flex", flexDirection: p.layout === "row" ? "column" : "row", gap: "4vh 5vw" }}>
        <StatBlock layout={p.layout as "row"} tone={p.tone as "primary"} label={t.correctRate} value={86} unit="%" size="xl" caption={p.caption ? "+4" : undefined} />
        <StatBlock layout={p.layout as "row"} tone={p.tone as "primary"} label={t.passRate} value={92} unit="%" size="xl" delay={100} caption={p.caption ? "+2" : undefined} />
      </div>
    ),
    code: ({ p }) => `<StatBlock label="Correct" value={86} unit="%"${attrs("stat", p, ["layout", "tone"])}${p.caption ? ` caption="+4"` : ""} />`,
  },
  {
    id: "segbar", group: "numbers", name: "SegBar",
    desc: { ja: "1 人 1 コマの帯（誰の分かは出さない）。人数を見せるときに。", en: "One segment per person (never says who). For head counts." },
    controls: { variant: ["segments", "dots"], tone: ["primary", "accent"], tall: [false, true] }, steps: 8,
    render: ({ p, step }) => <SegBar total={24} filled={step * 3} variant={p.variant as "segments"} tone={p.tone as "primary"} tall={p.tall as boolean} />,
    code: ({ p }) => `<SegBar total={24} filled={18}${attrs("segbar", p)} />`,
  },
  {
    id: "progress", group: "numbers", name: "ProgressBar",
    desc: { ja: "割合・経過の棒。ring で円になる。", en: "A share or progress bar. `ring` makes it a circle." },
    controls: { variant: ["bar", "ring"], label: [false, true], tone: ["primary", "accent"] }, steps: 8,
    render: ({ p, step }) => <ProgressBar value={(step * 3) / 24} variant={p.variant as "bar"} label={p.label as boolean} tone={p.tone as "primary"} />,
    code: ({ p }) => `<ProgressBar value={0.75}${attrs("progress", p)} />`,
  },
  {
    id: "countdown", group: "numbers", name: "Countdown",
    desc: { ja: "開始までのカウントダウン。最後の数秒は脈打って赤くなる。", en: "Countdown to a moment. The last seconds pulse in accent." },
    controls: { variant: ["digits", "ring"], finalSeconds: [10, 0], tone: ["primary", "accent"] },
    render: ({ p, now }) => (
      <Countdown target={now - (now % 60000) + 60000} now={now} variant={p.variant as "digits"} finalSeconds={p.finalSeconds as number}
        tone={p.tone as "primary"} size="hero" ringSize="min(26vw, 40vh)" />
    ),
    code: ({ p }) => `<Countdown target={startsAt} now={useNow(1000, skew)}${attrs("countdown", p)} />`,
  },
  {
    id: "clock", group: "numbers", name: "Clock",
    desc: { ja: "右上の時計。赤い点＝ライブ、灰色＝つながっていない（stale）。", en: "The corner clock. Red dot = live, grey = disconnected (`stale`)." },
    controls: { stale: [false, true] },
    render: ({ p, now }) => <div style={{ fontSize: "2em" }}><Clock time={formatClock(now)} stale={p.stale as boolean} /></div>,
    code: ({ p }) => `<Clock time={formatClock(now)}${attrs("clock", p)} />`,
  },

  /* ── charts ──────────────────────────────────────────────────── */
  {
    id: "ranking", group: "charts", name: "RankingList",
    desc: { ja: "割合のランキング。上位 hotCount 行を赤く（満点は赤くしない）。9 行以上は自動で 2 列。", en: "A ranking of rates; the top `hotCount` rows are accent. 9+ rows become two columns." },
    controls: { rows: [5, 7, 12], hotCount: [3, 1, 0] },
    render: ({ p, t }) => {
      const qs = [...t.questions, ...t.questions].slice(0, p.rows as number);
      return <div key={String(p.rows)} style={{ display: "flex", height: "52vh" }}><RankingList hotCount={p.hotCount as number} items={qs.map((q, i) => ({ key: i, code: `Q${i + 1}`, text: q, value: [...RATES, ...RATES][i] }))} /></div>;
    },
    code: ({ p }) => `<RankingList${attrs("ranking", p, ["hotCount"])}\n  items={[{ key, code: "Q4", text: "…", value: 0.42 }, …]} />`,
  },
  {
    id: "race", group: "charts", name: "RankingRace",
    desc: { ja: "値が変わると行が新しい順位へ滑る（ライブ投票）。", en: "Rows slide to their new place as values change (live votes)." },
    controls: { hotCount: [1, 0, 3] }, steps: 10,
    render: ({ p, step, t }) => (
      <RankingRace hotCount={p.hotCount as number} unit={t.votes}
        items={t.candidates.map((c, i) => ({ key: i, label: c, value: 20 + i * 3 + ((step * (i + 3) * 7) % 23) }))} />
    ),
    code: ({ p }) => `<RankingRace${attrs("race", p)} items={[{ key: "a", label: "Photo Club", value: 32 }, …]} />`,
  },
  {
    id: "barlist", group: "charts", name: "BarList",
    desc: { ja: "横棒（名前・棒・数字）。highlight の行だけ赤。", en: "Horizontal bars (label · bar · value). Only `highlight` rows are accent." },
    controls: { highlight: ["first", "none"], rows: [4, 6] },
    render: ({ p, t }) => (
      <BarList key={String(p.rows)} items={t.candidates.slice(0, p.rows as number).map((c, i) => ({ key: i, label: c, value: 40 - i * 6 }))} highlight={p.highlight === "first" ? [0] : []} />
    ),
    code: ({ p }) => `<BarList${p.highlight === "first" ? ` highlight={["a"]}` : ""}\n  items={[{ key: "a", label: "Photo Club", value: 40 }, …]} />`,
  },
  {
    id: "stacked", group: "charts", name: "StackedBar",
    desc: { ja: "内訳の帯（国籍・コース）。紺の濃淡＋赤は 1 区分だけ。", en: "A composition bar: shades of primary, accent for one part only." },
    controls: { legend: [true, false], highlight: ["first", "none"] },
    render: ({ p, t }) => (
      <StackedBar legend={p.legend as boolean} highlight={p.highlight === "first" ? "u" : undefined}
        parts={[{ key: "u", label: t.courses[0], value: 74 }, { key: "g", label: t.courses[1], value: 31 }, { key: "v", label: t.courses[2], value: 23 }]} />
    ),
    code: ({ p }) => `<StackedBar${p.highlight === "first" ? ` highlight="u"` : ""}${p.legend ? "" : " legend={false}"}\n  parts={[{ key: "u", label: "University", value: 74 }, …]} />`,
  },
  {
    id: "choices", group: "charts", name: "ChoiceBars",
    desc: { ja: "選択肢ごとの人数。revealed で正解に判子を押し、ほかを薄くする。", en: "Who picked what. `revealed` stamps the answer and dims the rest." },
    controls: { options: [2, 4] }, steps: 1,
    render: ({ p, step }) => {
      const opts = p.options === 2
        ? [{ key: "o", mark: "○", count: 10 }, { key: "x", mark: "×", count: 14 }]
        : MARKS.map((m, i) => ({ key: m, mark: m, count: [5, 11, 6, 2][i] }));
      return <ChoiceBars key={String(p.options)} resetKey={String(p.options)} total={24} highlightKey={p.options === 2 ? "o" : "B"} revealed={step > 0} options={opts} />;
    },
    code: () => `<ChoiceBars total={24} highlightKey="o" revealed={revealed}\n  options={[{ key: "o", mark: "○", count: 10 }, { key: "x", mark: "×", count: 14 }]} />`,
  },
  {
    id: "drumroll", group: "charts", name: "DrumrollReveal",
    desc: { ja: "クイズ番組の正解発表。光が走り、ゆっくりになって正解で止まる。", en: "Quiz-show reveal: the light races, slows down and lands on the answer." },
    controls: { columns: [4, 2], duration: [2800, 1600, 4500] }, steps: 1,
    render: ({ p, step }) => (
      <DrumrollReveal key={`${p.columns}-${p.duration}`} play={step > 0} answer="b" columns={p.columns as number} duration={p.duration as number}
        options={[{ key: "a", label: "2,776m" }, { key: "b", label: "3,776m" }, { key: "c", label: "4,776m" }, { key: "d", label: "5,776m" }]} />
    ),
    code: ({ p }) => `<DrumrollReveal play={play} answer="b"${attrs("drumroll", p)}\n  options={[{ key: "a", label: "2,776m" }, …]} />`,
  },

  /* ── effects ─────────────────────────────────────────────────── */
  {
    id: "reveal", group: "effects", name: "Reveal",
    desc: { ja: "あとから見せる（正解・結果）。reserve で場所を先に取っておき、下が動かない。", en: "Show later. With `reserve` the space is kept, so nothing below moves." },
    controls: { reserve: [true, false] }, steps: 1,
    render: ({ p, step, t }) => (
      <div>
        <Reveal shown={step > 0} reserve={p.reserve as boolean} placeholder={PLACEHOLDER}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "1.2vw" }}><Telop tone="accent" size="lg">{t.allIn}</Telop><BigNumber value={24} size="lg" tone="accent" /></div>
        </Reveal>
        <div style={{ marginTop: "2vh", borderTop: "2px dashed var(--tu-track)", paddingTop: "1vh" }}><Text variant="caption" muted>↑ {p.reserve ? "reserve" : "no reserve"}</Text></div>
      </div>
    ),
    code: ({ p }) => `<Reveal shown={done}${attrs("reveal", p)} placeholder={…}>…</Reveal>`,
  },
  {
    id: "stagger", group: "effects", name: "Stagger",
    desc: { ja: "子を順にワイプで出す（見出し → 数字 → 補足）。step は間隔（ms）。", en: "Wipes children in one after another. `step` = ms between them." },
    controls: { step: [120, 60, 300], fast: [false, true] }, steps: 1,
    render: ({ p, step, t }) => (
      <Replay step={step + (p.step as number) + (p.fast ? 1000 : 0)}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "1.6vh" }}>
          <Stagger step={p.step as number} fast={p.fast as boolean}>
            <Telop size="lg">{t.admitted}</Telop>
            <div><BigNumber value={128} size="xl" tone="primary" /></div>
            <Text variant="body" muted>{t.composition}</Text>
          </Stagger>
        </div>
      </Replay>
    ),
    code: ({ p }) => `<Stagger${attrs("stagger", p)}>\n  <Telop>…</Telop>\n  <div>…</div>\n</Stagger>`,
  },
  {
    id: "spotlight", group: "effects", name: "Spotlight",
    desc: { ja: "ほかを暗くして 1 か所を指す。", en: "Dims everything else while you point at one thing." }, steps: 1,
    render: ({ step }) => (
      <div style={{ display: "flex", gap: "4vw", alignItems: "flex-end" }}>
        <BigNumber value={62} unit="%" size="xl" />
        <Spotlight on={step > 0} style={{ display: "inline-block", padding: "1vh 1vw" }}><BigNumber value={87} unit="%" size="xl" tone="accent" /></Spotlight>
        <BigNumber value={74} unit="%" size="xl" />
      </div>
    ),
    code: () => `<Spotlight on={focus}><BigNumber … /></Spotlight>`,
  },
  {
    id: "ticker", group: "effects", name: "TickerStack",
    desc: { ja: "右から出て戻るテロップ（提出・投票が入った時）。消すのは呼ぶ側。", en: "Captions that slide in from the right and back out. You remove them." },
    steps: 20, screen: true,
    render: ({ step, t }) => (
      <div className="tu-stage is-no-band" style={{ justifyContent: "center", alignItems: "center" }}>
        {PLACEHOLDER}
        <TickerDemo step={step} t={t} />
      </div>
    ),
    code: () => `<TickerStack items={[{ id, label: "Vote", text: "+3" }]} />\n// remove each item after MOTION.ticker ms`,
  },
  {
    id: "banner", group: "effects", name: "SweepBanner",
    desc: { ja: "画面を横切る帯（全員そろった時など）。", en: "A band sweeping across the screen (everyone's in)." },
    controls: { tone: ["primary", "accent"] }, steps: 20, screen: true,
    render: ({ p, step, t }) => (
      <div className="tu-stage is-no-band" style={{ justifyContent: "center", alignItems: "center" }}>
        {PLACEHOLDER}
        <BannerDemo step={step} t={t} tone={p.tone as "primary"} />
      </div>
    ),
    code: ({ p }) => `{done && <SweepBanner${attrs("banner", p)} text="Everyone's in!" onDone={() => setDone(false)} />}`,
  },
  {
    id: "credits", group: "effects", name: "CreditsRoll",
    desc: { ja: "エンドロール（修了式・卒業式）。マウスを乗せると止まる。", en: "End credits (graduations). Pauses on hover." },
    controls: { align: ["split", "center"], seconds: [16, 30] }, screen: true,
    render: ({ p, t, lang }) => (
      <div className="tu-stage is-no-band">
        <CreditsRoll key={`${p.align}-${p.seconds}`} align={p.align as "split"} seconds={p.seconds as number}
          items={[{ key: "s", section: t.credits }, ...CREDIT_NAMES[lang].map((c, i) => ({ key: i, name: c[0], sub: c[1] || undefined, value: c[2] }))]} />
      </div>
    ),
    code: ({ p }) => `<CreditsRoll${attrs("credits", p)}\n  items={[{ key, section: "University" }, { key, name: "…", value: "…" }]} />`,
  },

  /* ── layout & slides ─────────────────────────────────────────── */
  {
    id: "cards", group: "layout", name: "CardGrid · Card",
    desc: { ja: "升目のカード。state＝active（今まさに）/ done（終わった）/ なし（これから）。", en: "A grid of cards. state = active (now) / done (over) / none (upcoming)." },
    controls: { columns: [3, 4, 2] },
    render: ({ p }) => (
      <div style={{ display: "flex", height: p.columns === 2 ? "40vh" : "26vh" }}>
        <CardGrid columns={p.columns as number}>
          <Card title="ROOM A" value="101" meta="09:00" state="done" />
          <Card title="ROOM B" value="202" meta="10:30" state="active" badge={<Pill>LIVE</Pill>} index={1} />
          <Card title="HALL" value="1F" meta="13:00" index={2} />
          <Card title="LOBBY" value="B1" meta="15:00" index={3} />
        </CardGrid>
      </div>
    ),
    code: ({ p }) => `<CardGrid${attrs("cards", p)}>\n  <Card title="ROOM B" value="202" state="active" badge={<Pill>LIVE</Pill>} />\n  …\n</CardGrid>`,
  },
  {
    id: "panel", group: "layout", name: "Panel · Split",
    desc: { ja: "見出し付きの面と、左右の分割（divider で仕切り線）。", en: "A titled panel, and a left/right split (`divider` draws a rule)." },
    controls: { tone: ["primary", "accent"], divider: [false, true] },
    render: ({ p, t }) => (
      <Split ratio="1fr 1fr" divider={p.divider as boolean} left={<Panel tone={p.tone as "primary"} title={t.boardTitle}><Text variant="body">09:00 — ROOM A</Text></Panel>}
        right={<Panel title={t.venue}><Text variant="body">13:00 — HALL</Text></Panel>} />
    ),
    code: ({ p }) => `<Split${p.divider ? " divider" : ""} left={<Panel${p.tone === "accent" ? ` tone="accent"` : ""} title="Today">…</Panel>} right={…} />`,
  },
  {
    id: "lband", group: "layout", name: "LBand",
    desc: { ja: "下端の L 字帯。会場・時間・件数など画面の前提を置く。Marquee で流せる。", en: "The bottom L-band for venue, time and counts. `Marquee` scrolls text." },
    controls: { marquee: [false, true] }, screen: true,
    render: ({ p, t }) => (
      <div className="tu-stage">
        <LBand tag={t.live}>
          {p.marquee
            ? <Marquee seconds={14}>{t.voteSub}　·　{t.candidates.join("　/　")}</Marquee>
            : <><LBandItem style={{ fontWeight: 900 }}>{t.venue}</LBandItem><LBandItem>10:55–11:15</LBandItem><span className="tu-spacer" /><LBandItem>{t.pending} 3</LBandItem></>}
        </LBand>
      </div>
    ),
    code: ({ p }) => p.marquee ? `<LBand tag="LIVE">\n  <Marquee>…</Marquee>\n</LBand>` : `<LBand tag="LIVE">\n  <LBandItem>Room A</LBandItem>\n  <LBandItem>10:55–11:15</LBandItem>\n</LBand>`,
  },
  {
    id: "slides", group: "layout", name: "SlideDeck",
    desc: { ja: "スライド。auto で自動送り。transition で切り替え方を選ぶ。", en: "Slides; `auto` advances by itself, `transition` picks the change." },
    controls: { transition: ["curtain", "fade", "slide"], progress: [true, false] }, screen: true,
    render: ({ p, t }) => (
      <div className="tu-stage is-no-band">
        <SlideDeck key={String(p.transition)} auto interval={3000} keyboard={false} transition={p.transition as "curtain"} progress={p.progress as boolean} slides={[
          { key: "a", node: <TitleCard kicker={t.ceremonyKicker} title={t.ceremonyTitle} caption={t.ceremonyCaption} /> },
          { key: "b", node: <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}><Telop size="lg">{t.admitted}</Telop><div style={{ marginTop: "3vh" }}><BigNumber value={128} size="hero" tone="primary" /></div></div> },
          { key: "c", node: <BigMessage reason={t.credits}>{t.countdownTitle}</BigMessage> },
        ]} />
      </div>
    ),
    code: ({ p }) => `<SlideDeck auto${attrs("slides", p)} slides={[\n  { key: "title", node: <TitleCard … /> },\n  { key: "count", node: <…/>, seconds: 20 },\n]} />`,
  },
];

export function ENTRY(id: string): Entry {
  return ENTRIES.find((e) => e.id === id) as Entry;
}

export function defaultsOf(e: Entry): Props {
  return Object.fromEntries(Object.entries(e.controls || {}).map(([k, opts]) => [k, opts[0]]));
}
