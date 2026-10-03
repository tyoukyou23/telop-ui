import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { useMessages } from "./root";
import { Telop } from "./text";
import { Clock } from "./numbers";
import { TELOP, resolveSize, type TelopSize } from "./tokens";

/**
 * The standard screen — header, body, L-band:
 *
 *   ┌ brand band ─────────────────────────────────────────┐
 *   │ LOGO [Title][Subtitle]   (controls: hidden)   ● 17:43 │  <StageHeader>
 *   │                      body                            │
 *   ├ LIVE ┃ venue · time · …                      3 left ┤  <LBand>
 *   └──────────────────────────────────────────────────────┘
 *
 * Framing top and bottom keeps a sparse screen from looking empty.
 */
export function Stage({ header, band, children, className = "", bodyClassName = "", bodyStyle }: {
  header?: ReactNode; band?: ReactNode; children?: ReactNode; className?: string; bodyClassName?: string; bodyStyle?: CSSProperties;
}) {
  return (
    <div className={`tu-stage ${band ? "" : "is-no-band"} ${className}`}>
      {header}
      <div className={`tu-stage-body ${bodyClassName}`} style={bodyStyle}>{children}</div>
      {band}
    </div>
  );
}

export interface StageHeaderProps {
  /** Your logo: an image URL or any element. */
  logo?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Small telops after the title (e.g. "DEMO"). */
  badges?: ReactNode;
  /** A <ControlBar> — sits between the title and the clock. */
  controls?: ReactNode;
  /** Clock text ("17:43"). */
  clock?: string;
  stale?: boolean;
  size?: TelopSize | string;
}

/** Header row: logo, title (+subtitle, badges), controls in the middle, clock on the right. */
export function StageHeader({ logo, title, subtitle, badges, controls, clock, stale, size = "lg" }: StageHeaderProps) {
  const fs = resolveSize(size, TELOP, "lg");
  return (
    <header className="tu-header">
      {typeof logo === "string" ? <img src={logo} alt="" className="tu-logo" /> : logo}
      <span className="tu-header-title">
        {title && <Telop size={fs} className="tu-wipe">{title}</Telop>}
        {subtitle && <Telop tone="outline" size={`calc(${fs} * .88)`} className="tu-wipe is-trail" style={{ animationDelay: "120ms" }}>{subtitle}</Telop>}
      </span>
      {badges}
      {controls || <span className="tu-spacer" />}
      {clock != null && <Clock time={clock} stale={!!stale} />}
    </header>
  );
}

/**
 * Bar for operator buttons. Visible only when `visible` (pair with useAutoHide). It keeps its
 * space while hidden — floating it made it overlap the title on narrow screens.
 */
export function ControlBar({ visible, children, className = "" }: { visible: boolean; children?: ReactNode; className?: string }) {
  return <div className={`tu-ctrl-bar ${visible ? "" : "is-hidden"} ${className}`}>{children}</div>;
}

/** Operator button. `main` = the primary action (one per bar). */
export function CtrlButton({ main = false, className = "", children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { main?: boolean }) {
  return <button type="button" className={`tu-btn ${main ? "is-main" : ""} ${className}`} {...rest}>{children}</button>;
}

/** Two columns. `ratio` like "1.4fr 1fr"; `divider` draws a thin rule between them. */
export function Split({ left, right, ratio = "1fr 1fr", divider = false, gap = "3.6vw", align = "stretch", className = "" }: {
  left: ReactNode; right: ReactNode; ratio?: string; divider?: boolean; gap?: string; align?: CSSProperties["alignItems"]; className?: string;
}) {
  const [a, b = "1fr"] = ratio.split(/\s+/);
  return (
    <div className={`tu-split ${className}`} style={{
      gridTemplateColumns: divider ? `minmax(0,${a}) 4px minmax(0,${b})` : `minmax(0,${a}) minmax(0,${b})`, gap, alignItems: align,
    }}>
      <div>{left}</div>
      {divider && <span className="tu-divider" />}
      <div>{right}</div>
    </div>
  );
}

/** A white panel with a telop heading. `grow` takes the remaining height. */
export function Panel({ title, tone = "primary", grow = false, className = "", children }: {
  title?: ReactNode; tone?: "primary" | "accent" | "outline"; grow?: boolean; className?: string; children?: ReactNode;
}) {
  return (
    <section className={`tu-panel ${grow ? "is-grow" : ""} ${className}`}>
      {title && <Telop tone={tone} size="sm" className="tu-wipe is-start">{title}</Telop>}
      <div className="tu-panel-body">{children}</div>
    </section>
  );
}

/** Grid of cards that splits the remaining height evenly (always fits the screen). */
export function CardGrid({ columns = 4, gap = "0.7vw", className = "", children }: { columns?: number; gap?: string; className?: string; children?: ReactNode }) {
  return <div className={`tu-cards ${className}`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap }}>{children}</div>;
}

/** A card: name (+badge) on top, big value and a small meta below. state: active · done · (upcoming). */
export function Card({ title, value, meta, badge, state, index = 0, className = "" }: {
  title: ReactNode; value?: ReactNode; meta?: ReactNode; badge?: ReactNode; state?: "active" | "done"; index?: number; className?: string;
}) {
  return (
    <div className={`tu-card tu-wipe-fast ${state ? `is-${state}` : ""} ${className}`} style={{ animationDelay: `${index * 20}ms` }}>
      <div className="tu-card-top"><span className="tu-card-title">{title}</span>{badge}</div>
      <div className="tu-card-bottom">
        <span className="tu-big tu-card-value">{value}</span>
        {meta && <span className="tu-card-meta">{meta}</span>}
      </div>
    </div>
  );
}

/** The L-band along the bottom edge: an accent tag, then items. */
export function LBand({ tag, children }: { tag: ReactNode; children?: ReactNode }) {
  return (
    <footer className="tu-lband">
      <span className="tu-lband-tag">{tag}</span>
      <span className="tu-lband-body">{children}</span>
    </footer>
  );
}

export function LBandItem({ children, truncate = false, className = "", style }: { children?: ReactNode; truncate?: boolean; className?: string; style?: CSSProperties }) {
  return <span className={`tu-lband-item ${truncate ? "is-truncate" : ""} ${className}`} style={style}>{children}</span>;
}

/** Endless scrolling line (put it inside an LBand for lobby notices). `seconds` = one pass. */
export function Marquee({ children, seconds = 20 }: { children?: ReactNode; seconds?: number }) {
  return <span className="tu-marquee" style={{ ["--tu-marquee-s" as string]: `${seconds}s` }}><span>{children}</span></span>;
}

/**
 * Loading / failed screen. With `message` it is the failure screen (+retry); without, loading.
 * Use only before anything was shown — afterwards keep the data and flag `stale` in the band.
 */
export function StatusScreen({ message, onRetry }: { message?: ReactNode | null; onRetry?: () => void }) {
  const m = useMessages();
  if (!message) return <div className="tu-status"><span className="tu-muted tu-live tu-t-body">{m.loading}</span></div>;
  return (
    <div className="tu-status">
      <div className="tu-t-heading">{message}</div>
      {onRetry && <CtrlButton main onClick={onRetry}>{m.retry}</CtrlButton>}
    </div>
  );
}
