import { useEffect, useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import { TELOP, resolveSize, type TelopSize, type TextSize } from "./tokens";

type Tone = "primary" | "accent" | "outline";

export interface TelopProps {
  children?: ReactNode;
  /** primary (default) · accent (attention) · outline (secondary). */
  tone?: Tone;
  /** xs | sm | md | lg | xl, or a raw CSS size. */
  size?: TelopSize | string;
  className?: string;
  style?: CSSProperties;
}

/** The slanted caption box — the signature element. */
export function Telop({ children, tone = "primary", size = "md", className = "", style }: TelopProps) {
  return (
    <span className={`tu-telop tu-fill-${tone} ${className}`} style={{ fontSize: resolveSize(size, TELOP, "md"), ...style }}>
      <span className="tu-telop-in">{children}</span>
    </span>
  );
}

export interface TextProps {
  variant?: TextSize;
  muted?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/** Body text on the type scale: caption · body · heading · title · display. */
export function Text({ variant = "body", muted = false, as: Tag = "div", className = "", style, children }: TextProps) {
  return <Tag className={`tu-t-${variant} ${muted ? "tu-muted" : ""} ${className}`} style={style}>{children}</Tag>;
}

/** Outlined label for a state ("draft", "changed"). `accent` for the important one. */
export function Tag({ accent = false, className = "", children }: { accent?: boolean; className?: string; children?: ReactNode }) {
  return <span className={`tu-tag ${accent ? "is-accent" : ""} ${className}`}>{children}</span>;
}

/** Filled accent label for something happening NOW ("LIVE", "in progress"). Use sparingly. */
export function Pill({ className = "", children }: { className?: string; children?: ReactNode }) {
  return <span className={`tu-pill ${className}`}>{children}</span>;
}

/** Blinking dot — "we are live". `off` turns it grey (disconnected). */
export function LiveDot({ off = false, title }: { off?: boolean; title?: string }) {
  return <span className={`tu-dot ${off ? "is-off" : "tu-live"}`} title={title} />;
}

/** Big headline box (primary fill, accent edge). `sub` is a second line, e.g. a translation. */
export function HeadlineBox({ children, sub, className = "", style }: { children?: ReactNode; sub?: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`tu-qbox ${className}`} style={style}>
      <div className="tu-t-title">{children}</div>
      {sub && <div className="tu-qbox-sub">{sub}</div>}
    </div>
  );
}

/** Lower-third caption bar with an accent label (explanations, notices). */
export function LowerThird({ label, children, className = "" }: { label: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={`tu-lower ${className}`}>
      <span className="tu-lower-label"><span className="tu-telop-in">{label}</span></span>
      <div className="tu-lower-body">{children}</div>
    </div>
  );
}

/** Lower third for a person: name (+ reading/sub line) and a role box. For speaker introductions. */
export function PersonLowerThird({ name, sub, role, className = "" }: { name: ReactNode; sub?: ReactNode; role?: ReactNode; className?: string }) {
  return (
    <div className={`tu-person tu-wipe ${className}`}>
      <div className="tu-person-name"><b>{name}</b>{sub && <small>{sub}</small>}</div>
      {role && <div className="tu-person-role">{role}</div>}
    </div>
  );
}

/** Title card — the first slide of a ceremony or a talk. `title` may be an array of lines. */
export function TitleCard({ kicker, title, caption, className = "" }: { kicker?: ReactNode; title: ReactNode | ReactNode[]; caption?: ReactNode; className?: string }) {
  const lines = Array.isArray(title) ? title : [title];
  return (
    <div className={`tu-title-card ${className}`}>
      {kicker && <Telop tone="accent" size="md" className="tu-wipe is-start">{kicker}</Telop>}
      <div className="tu-title-main">
        {lines.map((l, i) => <div key={i} className="tu-wipe" style={{ animationDelay: `${120 + i * 120}ms` }}>{l}</div>)}
      </div>
      <div className="tu-title-rule tu-grow-x"><span /><span /></div>
      {caption && <div className="tu-rise tu-t-body tu-muted tu-title-caption" style={{ animationDelay: "400ms" }}>{caption}</div>}
    </div>
  );
}

/** One big message filling the stage ("No classes today"), with an optional accent reason. */
export function BigMessage({ children, reason, className = "" }: { children?: ReactNode; reason?: ReactNode; className?: string }) {
  return (
    <div className={`tu-message ${className}`}>
      <div className="tu-t-display tu-wipe">{children}</div>
      {reason && <div className="tu-message-reason"><Telop tone="accent" size="xl" className="tu-wipe" style={{ animationDelay: "150ms" }}>{reason}</Telop></div>}
    </div>
  );
}

/**
 * Typewriter text — characters appear one by one (opening lines, quotes).
 * Restarts whenever `text` changes. `onDone` fires when the last character is shown.
 */
export function Typewriter({ text, speed = 70, caret = true, onDone, className = "" }: { text: string; speed?: number; caret?: boolean; onDone?: () => void; className?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const chars = Array.from(text);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= chars.length) { clearInterval(id); onDone?.(); }
    }, speed);
    return () => clearInterval(id);
    // onDone is intentionally not a dependency (a new function every render would restart typing)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed]);
  const shown = Array.from(text).slice(0, n).join("");
  return <span className={className}>{shown}{caret && <span className="tu-type-caret" />}</span>;
}
