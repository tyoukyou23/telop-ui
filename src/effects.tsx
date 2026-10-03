import { Children, cloneElement, isValidElement, useEffect, useRef, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { MOTION } from "./tokens";
import { useIsoLayoutEffect } from "./root";

/*
 * Effects mark a MOMENT (a submission arrived, everyone is in, the answer is out).
 * A screen where something always moves has no moments left.
 */

export interface TickerItem { id: string | number; label: ReactNode; text: ReactNode }

/** Captions that slide in from the right and back out. You remove items after MOTION.ticker ms. */
export function TickerStack({ items, bottom = "9.5vh" }: { items: TickerItem[]; bottom?: string }) {
  return (
    <div className="tu-tickers" style={{ bottom }}>
      {items.map((p) => (
        <div key={p.id} className="tu-ticker">
          <span className="tu-ticker-label">{p.label}</span>
          <span className="tu-ticker-text">{p.text}</span>
        </div>
      ))}
    </div>
  );
}

/** A band that sweeps across the screen ("Everyone's in!"). Calls onDone after MOTION.banner ms. */
export function SweepBanner({ text, onDone }: { text: ReactNode; onDone?: () => void }) {
  // Keep onDone in a ref: screens re-render every second (clock), and restarting the timer
  // on each render would keep the banner up forever.
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    const id = setTimeout(() => doneRef.current?.(), MOTION.banner);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className="tu-banner-wrap">
      <div className="tu-banner">
        <div className="tu-banner-main">{text}</div>
        <div className="tu-banner-edge" />
      </div>
    </div>
  );
}

/**
 * Show later (answers, results): wipes in the moment `shown` turns true.
 *
 * The wipe runs across the CONTENT, not the wrapper: a 160px telop in a full-width row would
 * otherwise stay invisible for most of the animation and pop in at the end. The extent is
 * measured before paint (a Range covers transformed children, so a slanted telop's corners
 * are included and never clipped). While hidden, the content keeps its space so nothing
 * below jumps when it appears — pass `reserve={false}` to collapse instead.
 */
export function Reveal({ shown, placeholder = null, reserve = true, children, className = "" }: {
  shown: boolean; placeholder?: ReactNode; reserve?: boolean; children?: ReactNode; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!shown || !el || typeof document === "undefined") return;
    const box = el.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(el);
    const c = range.getBoundingClientRect();
    if (!c.width) return; // nothing measurable: keep the default (whole wrapper)
    el.style.setProperty("--tu-reveal-from", `${box.right - c.left}px`);
    el.style.setProperty("--tu-reveal-to", `${box.right - c.right}px`);
  }, [shown]);
  if (!shown && !reserve) return <>{placeholder}</>;
  if (!shown) {
    return (
      <div className={`tu-reveal ${className}`}>
        <div className="tu-reveal-ghost" aria-hidden="true">{children}</div>
        {placeholder != null && <div className="tu-reveal-placeholder">{placeholder}</div>}
      </div>
    );
  }
  return <div key="on" ref={ref} className={`tu-reveal is-on ${className}`}>{children}</div>;
}

/** Wipe children in one after another (heading → number → caption). */
export function Stagger({ step = 120, start = 0, fast = false, children }: { step?: number; start?: number; fast?: boolean; children?: ReactNode }) {
  let i = 0;
  return (
    <>
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        const el = child as ReactElement<{ className?: string; style?: CSSProperties }>;
        const delay = start + step * i++;
        return cloneElement(el, {
          className: `${el.props.className || ""} ${fast ? "tu-wipe-fast" : "tu-wipe"}`,
          style: { ...(el.props.style || {}), animationDelay: `${delay}ms` },
        });
      })}
    </>
  );
}

export type CreditItem = { key: string | number; section: ReactNode } | { key: string | number; name: ReactNode; sub?: ReactNode; value?: ReactNode };

/**
 * End credits that roll up forever (graduations, award nights). Insert `{ section }` rows as
 * headings. Hover pauses. `seconds` per loop (default: 2.2s per row).
 * Showing people's names publicly needs their consent.
 */
export function CreditsRoll({ items, seconds, className = "" }: { items: CreditItem[]; seconds?: number; className?: string }) {
  const dur = seconds || Math.max(20, items.length * 2.2);
  return (
    <div className={`tu-credits ${className}`} style={{ ["--tu-credits-dur" as string]: `${dur}s` }}>
      <div className="tu-credits-track">
        {items.map((it) => ("section" in it ? (
          <div key={it.key} className="tu-credit-section">
            <span className="tu-telop tu-fill-accent" style={{ fontSize: "min(1.4vw, 2.4vh)" }}><span className="tu-telop-in">{it.section}</span></span>
          </div>
        ) : (
          <div key={it.key} className="tu-credit">
            <span className="tu-credit-name">{it.name}{it.sub && <span className="tu-credit-sub">{it.sub}</span>}</span>
            <span className="tu-credit-value">{it.value}</span>
          </div>
        )))}
      </div>
    </div>
  );
}

/**
 * Spotlight — while `on`, everything else dims and this element gets an accent outline.
 * Point at one number while you explain it.
 */
export function Spotlight({ on, children, className = "", style }: { on: boolean; children?: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <>
      {on && <div className="tu-spot-veil" />}
      <div className={`tu-spot ${on ? "is-on" : ""} ${className}`} style={style}>{children}</div>
    </>
  );
}
