import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useHotkeys } from "./hooks";
import { MOTION } from "./tokens";
import { useSpeed } from "./root";

/** Swap the content when the curtain fully covers the screen (45% of .tu-curtain). */
const SWAP_AT = 360;

export interface Slide { key: string | number; node: ReactNode; /** Seconds for this slide when auto-advancing. */ seconds?: number }

export interface SlideDeckProps {
  slides: Slide[];
  /** Advance automatically (lobby loops). Off when a presenter clicks through. */
  auto?: boolean;
  /** Default ms per slide. */
  interval?: number;
  /** ← → / Space navigate (ignored while typing). */
  keyboard?: boolean;
  /** Show progress segments in the bottom-right corner. */
  progress?: boolean;
  /** Controlled index (optional). */
  index?: number;
  onIndexChange?: (index: number) => void;
  /** curtain (a brand-colored eyecatch sweeps across, default) · fade · slide (the next slide comes in from the right). */
  transition?: "curtain" | "fade" | "slide";
  className?: string;
}

/**
 * Slides with a TV "eyecatch" transition: a brand-colored curtain sweeps across and the
 * content is swapped while the screen is covered.
 */
export function SlideDeck({ slides, auto = false, interval = MOTION.slide, keyboard = true, progress = true, index: controlled, onIndexChange, transition = "curtain", className = "" }: SlideDeckProps) {
  const [inner, setInner] = useState(0);
  const index = controlled ?? inner;
  const [shown, setShown] = useState(index);
  const [curtain, setCurtain] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const n = slides.length;
  const swapAt = SWAP_AT * useSpeed(); // the curtain's length follows the motion setting

  // Callers usually pass an inline callback; keep it in a ref so a re-render of the parent
  // does not restart the auto-advance timer (it would never advance under a ticking clock).
  const changeRef = useRef(onIndexChange);
  changeRef.current = onIndexChange;
  const isControlled = controlled != null;
  const go = useCallback((next: number) => {
    if (!n) return;
    const to = ((next % n) + n) % n;
    if (!isControlled) setInner(to);
    changeRef.current?.(to);
  }, [n, isControlled]);

  // Whenever the index changes (inside or from the parent), run the curtain and swap.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return undefined; }
    setCurtain((c) => c + 1);
    clearTimeout(timer.current);
    // the curtain hides the swap; fade and slide animate the new slide in right away
    if (transition === "curtain") timer.current = setTimeout(() => setShown(index), swapAt);
    else setShown(index);
    return () => clearTimeout(timer.current);
  }, [index]);

  const ms = slides[index]?.seconds ? (slides[index].seconds as number) * 1000 : interval;
  useEffect(() => {
    if (!auto || n < 2) return undefined;
    const id = setTimeout(() => go(index + 1), ms);
    return () => clearTimeout(id);
  }, [auto, index, ms, n, go]);

  useHotkeys({ ArrowRight: () => go(index + 1), ArrowLeft: () => go(index - 1), " ": () => go(index + 1) }, keyboard);

  const current = slides[shown];
  return (
    <div className={`tu-deck ${className}`}>
      <div key={current?.key ?? shown} className={`tu-deck-slide ${curtain > 0 && transition !== "curtain" ? `is-enter-${transition}` : ""}`}>{current?.node}</div>
      {curtain > 0 && transition === "curtain" && <div key={curtain} className="tu-curtain"><span /><span /></div>}
      {progress && n > 1 && (
        <div className="tu-deck-progress">
          {slides.map((s, i) => (
            <span key={s.key} className={`tu-deck-seg ${i < index ? "is-done" : ""}`}>
              {i === index && <span key={`${index}-${curtain}`} style={{ animationDuration: auto ? `${ms}ms` : "0s" }} />}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
