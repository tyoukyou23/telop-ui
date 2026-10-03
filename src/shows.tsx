import { useEffect, useRef, useState, type ReactNode } from "react";
import { useCountUp } from "./hooks";
import { useMessages, useSpeed } from "./root";
import { resolveSize, NUMBER, type NumberSize } from "./tokens";

/*
 * Segments borrowed from specific kinds of Japanese TV shows: the paper strips of a
 * wide-show flip board, a judges' panel, a red-vs-white match, a countdown ranking,
 * a breaking-news bar. Each is controlled by the parent (the presenter decides the
 * moment); none of them advance on their own.
 *
 * Every segment has a default form and one or two alternatives (`variant`, `layout`,
 * `peel`, `reveal`…). The defaults are the classic TV look; the alternatives exist so
 * the same data can fit a different room or mood without writing a new component.
 */

/* ── MekuriBoard ───────────────────────────────────────────────────── */

export interface MekuriItem {
  key: string | number;
  /** Left of the strip ("1位", "Q1"). */
  label?: ReactNode;
  /** Hidden under the strip until peeled. */
  answer: ReactNode;
  /** Printed on the strip while covered (a hint). Default "？". */
  cover?: ReactNode;
  /** Accent once peeled (the one answer to look at). */
  hot?: boolean;
}

export interface MekuriBoardProps {
  items: MekuriItem[];
  peeled: ReadonlyArray<string | number>;
  onPeel?: (key: string | number) => void;
  /** How a strip comes off: right (torn off to the side, default) · up (lifted) · flip (turned over). */
  peel?: "right" | "up" | "flip";
  /** Columns of strips. Default 1 (a list); 2 suits short answers. */
  columns?: number;
  size?: string;
  className?: string;
}

/**
 * The wide-show flip board (めくりフリップ): every answer is covered by a paper strip and
 * the presenter peels them one at a time. Pass the peeled keys; `onPeel` lets a click do it.
 */
export function MekuriBoard({ items, peeled, onPeel, peel = "right", columns = 1, size = "min(2.6vw, 4.3vh)", className = "" }: MekuriBoardProps) {
  const open = new Set(peeled);
  return (
    <div className={`tu-mekuri is-peel-${peel} ${className}`} style={{ fontSize: size, gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {items.map((it, i) => {
        const isOpen = open.has(it.key);
        return (
          <div key={it.key} className="tu-mekuri-row tu-wipe-fast" style={{ animationDelay: `${i * 40}ms` }}>
            {it.label != null && <span className="tu-mekuri-label">{it.label}</span>}
            <div className={`tu-mekuri-slot ${isOpen && it.hot ? "is-hot" : ""}`}>
              <span className="tu-mekuri-answer">{it.answer}</span>
              <MekuriStrip open={isOpen} onClick={onPeel && !isOpen ? () => onPeel(it.key) : undefined}>{it.cover ?? "？"}</MekuriStrip>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** The strip stays mounted for the length of the peel, then leaves the DOM. */
function MekuriStrip({ open, onClick, children }: { open: boolean; onClick?: () => void; children?: ReactNode }) {
  const [gone, setGone] = useState(open);
  const ms = 700 * useSpeed();
  useEffect(() => {
    if (!open) { setGone(false); return undefined; }
    const id = setTimeout(() => setGone(true), ms);
    return () => clearTimeout(id);
  }, [open, ms]);
  if (gone) return null;
  return (
    <button type="button" className={`tu-mekuri-strip ${open ? "is-peeling" : ""}`} onClick={onClick} disabled={!onClick} tabIndex={onClick ? 0 : -1}>
      <span>{children}</span>
    </button>
  );
}

/* ── JudgeScores ───────────────────────────────────────────────────── */

export interface Judge { key: string | number; name: ReactNode; score: number }

export interface JudgeScoresProps {
  judges: Judge[];
  /** How many judges are shown (left to right). The total appears once all are. */
  revealed: number;
  /** How each score appears: flip (a card turning, default) · rise (slides up) · count (counts up from 0). */
  reveal?: "flip" | "rise" | "count";
  /** Judges per row. Default: all in one row. */
  columns?: number;
  totalLabel?: ReactNode;
  unit?: ReactNode;
  /** Hide the total (show only the individual scores). */
  hideTotal?: boolean;
  size?: NumberSize | string;
  className?: string;
}

/**
 * A judges' panel (M-1 style): each judge's score appears in turn, then the total counts
 * up. The highest score is marked accent once everyone has scored.
 */
export function JudgeScores({ judges, revealed, reveal = "flip", columns, totalLabel, unit, hideTotal = false, size = "xl", className = "" }: JudgeScoresProps) {
  const m = useMessages();
  const shown = judges.slice(0, revealed);
  const all = revealed >= judges.length && judges.length > 0;
  const total = shown.reduce((a, j) => a + j.score, 0);
  const best = all ? Math.max(...judges.map((j) => j.score)) : null;
  // back to 0 while hidden, so the next round counts up again instead of sitting on the old sum
  const [count, bump] = useCountUp(all ? total : 0, 1100);
  return (
    <div className={`tu-judges is-reveal-${reveal} ${className}`}>
      <div className="tu-judge-row" style={{ gridTemplateColumns: `repeat(${columns || judges.length}, minmax(0, 1fr))` }}>
        {judges.map((j, i) => {
          const on = i < revealed;
          return (
            <div key={j.key} className={`tu-judge ${on ? "is-on" : ""} ${on && j.score === best ? "is-best" : ""}`}>
              <div className="tu-judge-name">{j.name}</div>
              <div className="tu-judge-score" style={{ fontSize: resolveSize(size, NUMBER, "xl") }}>
                {on
                  ? (reveal === "count" ? <CountedScore key="on" score={j.score} /> : <span key="on" className="tu-judge-num">{j.score}</span>)
                  : <span className="tu-judge-wait" />}
              </div>
            </div>
          );
        })}
      </div>
      {!hideTotal && (
        <div className={`tu-judge-total ${all ? "is-on" : ""}`}>
          <span className="tu-telop tu-fill-accent is-slant"><span className="tu-telop-in">{totalLabel ?? m.total}</span></span>
          <span key={bump} className={`tu-big ${bump ? "tu-bump" : ""}`} style={{ fontSize: resolveSize("hero", NUMBER, "hero"), color: "var(--tu-accent)" }}>
            {/* always rendered (only faded) so the panel does not jump when the total arrives */}
            {Math.round(count)}
            {unit != null && <span className="tu-big-unit">{unit}</span>}
          </span>
        </div>
      )}
    </div>
  );
}

function CountedScore({ score }: { score: number }) {
  const [start, setStart] = useState(false);
  useEffect(() => { setStart(true); }, []);
  const [v] = useCountUp(start ? score : 0, 800);
  return <span className="tu-judge-num">{Math.round(v)}</span>;
}

/* ── VersusMeter & ScoreBug ────────────────────────────────────────── */

export interface Side { label: ReactNode; value: number }

export interface VersusMeterProps {
  left: Side;
  right: Side;
  /** bar (scores above one shared bar, default) · split (the screen halves, the leader's half grows). */
  variant?: "bar" | "split";
  unit?: ReactNode;
  className?: string;
}

/**
 * Two teams on one meter (紅白 / sports day): the split moves toward whoever leads.
 * Left is primary, right is accent — the one place both colors are equals.
 */
export function VersusMeter({ left, right, variant = "bar", unit, className = "" }: VersusMeterProps) {
  const sum = left.value + right.value;
  const share = sum > 0 ? left.value / sum : 0.5;
  if (variant === "split") {
    // keep both halves readable even when one side runs away with it
    const s = Math.min(0.68, Math.max(0.32, share));
    return (
      <div className={`tu-vs-split ${className}`}>
        <div className="tu-vs-half is-left" style={{ flexGrow: s }}><VsScore side={left} unit={unit} inverse /></div>
        <span className="tu-vs-split-mark"><span>VS</span></span>
        <div className="tu-vs-half is-right" style={{ flexGrow: 1 - s }}><VsScore side={right} unit={unit} right inverse /></div>
      </div>
    );
  }
  return (
    <div className={`tu-vs ${className}`}>
      <div className="tu-vs-head">
        <VsScore side={left} unit={unit} />
        <span className="tu-vs-mark">VS</span>
        <VsScore side={right} unit={unit} right />
      </div>
      <div className="tu-vs-bar">
        <span className="tu-vs-left" style={{ flexGrow: share }} />
        <span className="tu-vs-right" style={{ flexGrow: 1 - share }} />
        <span className="tu-vs-center" />
      </div>
    </div>
  );
}

function VsScore({ side, unit, right = false, inverse = false }: { side: Side; unit?: ReactNode; right?: boolean; inverse?: boolean }) {
  const [v, bump] = useCountUp(side.value);
  const color = inverse ? "#fff" : right ? "var(--tu-accent)" : "var(--tu-primary)";
  return (
    <div className={`tu-vs-side ${right ? "is-right" : ""}`}>
      <span className={`tu-telop is-slant ${inverse ? "tu-fill-outline" : right ? "tu-fill-accent" : "tu-fill-primary"}`} style={{ fontSize: "min(1.9vw, 3.2vh)" }}>
        <span className="tu-telop-in">{side.label}</span>
      </span>
      <span key={bump} className={`tu-big ${bump ? "tu-bump" : ""}`} style={{ fontSize: resolveSize(inverse ? "hero" : "xl", NUMBER, "xl"), color }}>
        {Math.round(v)}{unit != null && <span className="tu-big-unit">{unit}</span>}
      </span>
    </div>
  );
}

export interface ScoreBugProps {
  left: Side;
  right: Side;
  period?: ReactNode;
  /** stack (two rows, default) · inline (one row: Blue 130 – 125 Red). */
  variant?: "stack" | "inline";
  className?: string;
}

/**
 * The corner scoreboard of a sports broadcast. A score that changes flashes once.
 * Place it yourself (it does not position itself).
 */
export function ScoreBug({ left, right, period, variant = "stack", className = "" }: ScoreBugProps) {
  if (variant === "inline") {
    return (
      <div className={`tu-bug is-inline ${className}`}>
        <div className="tu-bug-row">
          <span className="tu-bug-team tu-fill-primary">{left.label}</span>
          <BugScore value={left.value} />
          <span className="tu-bug-dash">–</span>
          <BugScore value={right.value} />
          <span className="tu-bug-team tu-fill-accent">{right.label}</span>
        </div>
        {period != null && <div className="tu-bug-period">{period}</div>}
      </div>
    );
  }
  return (
    <div className={`tu-bug ${className}`}>
      <div className="tu-bug-row"><span className="tu-bug-team tu-fill-primary">{left.label}</span><BugScore value={left.value} /></div>
      <div className="tu-bug-row"><span className="tu-bug-team tu-fill-accent">{right.label}</span><BugScore value={right.value} /></div>
      {period != null && <div className="tu-bug-period">{period}</div>}
    </div>
  );
}

function BugScore({ value }: { value: number }) {
  const prev = useRef(value);
  const [flash, setFlash] = useState(0);
  useEffect(() => {
    if (value !== prev.current) setFlash((f) => f + 1);
    prev.current = value;
  }, [value]);
  return <span key={flash} className={`tu-bug-score ${flash ? "is-flash" : ""}`}>{value}</span>;
}

/* ── RankReveal ────────────────────────────────────────────────────── */

export interface RevealRankItem { key: string | number; label: ReactNode; value?: ReactNode }

export interface RankRevealProps {
  /** In rank order (1st first). */
  items: RevealRankItem[];
  /** How many are announced, counted from the last rank. */
  revealed: number;
  /** list (default) · podium (the top three stand on a podium, the rest in a strip below). */
  layout?: "list" | "podium";
  /** In the list layout, how many top ranks are drawn larger. Default 3. */
  bigTop?: number;
  className?: string;
}

/**
 * A countdown ranking ("第10位から"): ranks fill in from the bottom, one per step. Ranks
 * not yet announced show "？". The rank just announced is accent.
 */
export function RankReveal({ items, revealed, layout = "list", bigTop = 3, className = "" }: RankRevealProps) {
  const n = items.length;
  const firstShown = n - revealed; // index of the highest rank shown so far
  const row = (it: RevealRankItem, i: number, big: boolean) => {
    const on = i >= firstShown;
    const latest = on && i === firstShown;
    return (
      <div key={it.key} className={`tu-rr-row ${big ? "is-big" : ""} ${on ? "is-on" : ""} ${latest ? "is-latest" : ""}`}>
        <span className="tu-rr-rank">{i + 1}</span>
        {on ? (
          <span key="on" className="tu-rr-body tu-reveal is-on">
            <span className="tu-rr-label">{it.label}</span>
            {it.value != null && <span className="tu-rr-value">{it.value}</span>}
          </span>
        ) : (
          <span className="tu-rr-body is-wait">？</span>
        )}
      </div>
    );
  };

  if (layout === "podium") {
    const podium = [1, 0, 2].filter((i) => i < n); // 2nd, 1st, 3rd
    const rest = items.slice(3);
    return (
      <div className={`tu-rr is-podium ${className}`}>
        <div className="tu-podium">
          {podium.map((i) => {
            const it = items[i];
            const on = i >= firstShown;
            const latest = on && i === firstShown;
            return (
              <div key={it.key} className={`tu-podium-col is-p${i + 1} ${on ? "is-on" : ""} ${latest ? "is-latest" : ""}`}>
                <div className="tu-podium-top">
                  {on ? (
                    <span key="on" className="tu-podium-reveal">
                      <span className="tu-podium-label">{it.label}</span>
                      {it.value != null && <span className="tu-podium-value">{it.value}</span>}
                    </span>
                  ) : <span className="tu-podium-label is-wait">？</span>}
                </div>
                <div className="tu-podium-block"><span>{i + 1}</span></div>
              </div>
            );
          })}
        </div>
        {rest.length > 0 && (
          <div className="tu-podium-rest" style={{ gridTemplateRows: `repeat(${Math.ceil(rest.length / 2)}, auto)` }}>
            {rest.map((it, k) => row(it, k + 3, false))}
          </div>
        )}
      </div>
    );
  }

  return <div className={`tu-rr ${className}`}>{items.map((it, i) => row(it, i, i < bigTop))}</div>;
}

/* ── NewsFlash ─────────────────────────────────────────────────────── */

export interface NewsFlashProps {
  shown: boolean;
  text: ReactNode;
  label?: ReactNode;
  /** top (drops from the top edge, default) · bottom (rises from the bottom edge). */
  position?: "top" | "bottom";
  /** flash (news bulletin, default) · alert (all accent, the label pulses — for urgent notices). */
  tone?: "flash" | "alert";
  /** ms until it retracts by itself. Omit to keep it until `shown` turns false. */
  duration?: number;
  onDone?: () => void;
}

/**
 * The breaking-news bar (ニュース速報). Show it with `shown`; with `duration` it retracts on
 * its own and calls `onDone`.
 */
export function NewsFlash({ shown, text, label, position = "top", tone = "flash", duration, onDone }: NewsFlashProps) {
  const m = useMessages();
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const [leaving, setLeaving] = useState(false);
  const outMs = 450 * useSpeed();
  useEffect(() => {
    setLeaving(false);
    if (!shown || !duration) return undefined;
    const a = setTimeout(() => setLeaving(true), duration);
    const b = setTimeout(() => doneRef.current?.(), duration + outMs);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [shown, duration, outMs]);
  if (!shown) return null;
  return (
    <div className={`tu-flash is-${position} is-${tone} ${leaving ? "is-leaving" : ""}`} role="status">
      <span className="tu-flash-label">{label ?? m.flash}</span>
      <span className="tu-flash-text">{text}</span>
    </div>
  );
}
