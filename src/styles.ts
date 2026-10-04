/**
 * All CSS for telop-ui. <TelopRoot> injects it once (no build setup needed);
 * `telop-ui/styles.css` contains the same text for people who prefer a stylesheet.
 *
 * Conventions:
 *   - Every class starts with `tu-` (never collides with the host app).
 *   - Colors come only from the theme variables (--tu-primary / --tu-accent / ...).
 *   - The "don't do this" notes sit next to the rule they protect.
 */
export const CSS = String.raw`
/* ── root ─────────────────────────────────────────────────────────── */
.tu-root {
  --tu-ease-wipe: cubic-bezier(.7,0,.2,1);
  --tu-ease-out: cubic-bezier(.2,.7,.2,1);
  --tu-ease-spring: cubic-bezier(.3,1.25,.5,1);
  --tu-num-font: "Barlow Condensed", "Arial Narrow", system-ui, sans-serif;
  /* the three global switches (TelopRoot shape / motion / density) */
  --tu-skew: -12deg; --tu-unskew: 12deg; --tu-radius: 0px; --tu-cut: 1.4vw;
  --tu-speed: 1;
  --tu-density: 1;
  position: relative; min-height: 100vh; width: 100%; overflow: hidden; user-select: none;
  background: var(--tu-bg); color: var(--tu-fg);
  font-family: var(--tu-font, "Noto Sans JP", "Hiragino Sans", system-ui, sans-serif);
  -webkit-font-smoothing: antialiased;
  /* No transition on the background: the frame would fade while inner boxes switch
     instantly, and for half a second dark boxes float on a light page (a "flash"). */
}
.tu-root[data-shape="square"] { --tu-skew: 0deg; --tu-unskew: 0deg; --tu-cut: 0px; }
.tu-root[data-shape="round"] { --tu-skew: 0deg; --tu-unskew: 0deg; --tu-cut: 0px; --tu-radius: min(.7vw, 1.15vh); }
.tu-root[data-motion="calm"] { --tu-speed: 1.6; }
.tu-root[data-motion="snappy"] { --tu-speed: .6; }
.tu-root[data-density="compact"] { --tu-density: .55; }
/* round: every box gets the same corner (one place, so nothing is half round) */
.tu-root[data-shape="round"] :is(.tu-telop, .tu-tag, .tu-pill, .tu-seg, .tu-progress, .tu-btn, .tu-panel, .tu-card, .tu-qbox,
  .tu-lower, .tu-rank-no, .tu-rank-track, .tu-stack, .tu-opt-mark, .tu-opt-track, .tu-flap, .tu-drum-item, .tu-judge, .tu-mekuri-slot,
  .tu-mekuri-strip, .tu-rr-rank, .tu-bug, .tu-vs-bar, .tu-person, .tu-legend-swatch, .tu-lband-tag, .tu-race-row .tu-rank-track) { border-radius: var(--tu-radius); }
.tu-root[data-shape="round"] :is(.tu-lower, .tu-person, .tu-bug, .tu-vs-bar, .tu-judge) { overflow: hidden; }
.tu-root *, .tu-root *::before, .tu-root *::after { box-sizing: border-box; }
.tu-root button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; text-align: inherit; }
.tu-root.is-cursor-hidden { cursor: none; }
.tu-muted { color: var(--tu-mute); }
.tu-spacer { flex: 1; }
.tu-band { position: absolute; left: 0; right: 0; top: 0; z-index: 50; display: flex; height: 1vh; }
/* the thin top stripe sits on the page background, so it follows the mode (an ink brand
   color would vanish on a dark page); full bands and banners keep the brand color. */
.tu-band > :first-child { flex: var(--tu-band-a, 8); background: var(--tu-primary); }
.tu-band > :last-child { flex: var(--tu-band-b, 2); background: var(--tu-brand-accent); }

/* ── text ─────────────────────────────────────────────────────────── */
.tu-t-caption { font-size: min(1vw, 1.7vh); font-weight: 700; }
.tu-t-body { font-size: min(1.4vw, 2.4vh); font-weight: 700; line-height: 1.45; }
.tu-t-heading { font-size: min(2.2vw, 3.7vh); font-weight: 900; line-height: 1.4; }
.tu-t-title { font-size: min(3.5vw, 5.8vh); font-weight: 900; line-height: 1.35; }
.tu-t-display { font-size: min(5.4vw, 9vh); font-weight: 900; line-height: 1.15; }

/* telop: a slanted box; the text inside stays upright */
.tu-telop { display: inline-block; transform: skewX(var(--tu-skew)); padding: .35em 1em; font-weight: 900; line-height: 1.1; white-space: nowrap; }
.tu-telop-in { display: inline-block; transform: skewX(var(--tu-unskew)); }
/* variants: box never slants; underline drops the fill for a thick rule under the text */
.tu-telop.is-box, .tu-telop.is-box .tu-telop-in, .tu-telop.is-underline, .tu-telop.is-underline .tu-telop-in { transform: none; }
.tu-telop.is-underline { background: transparent; padding: .1em .05em .3em; border-radius: 0 !important; }
.tu-telop.is-underline.tu-fill-primary { color: var(--tu-primary); box-shadow: inset 0 -.2em 0 var(--tu-primary); }
.tu-telop.is-underline.tu-fill-accent { color: var(--tu-accent); box-shadow: inset 0 -.2em 0 var(--tu-accent); }
.tu-telop.is-underline.tu-fill-outline { color: var(--tu-fg); box-shadow: inset 0 -.2em 0 var(--tu-track); }
.tu-telop.is-trail { margin-left: -.3vw; max-width: 40vw; overflow: hidden; text-overflow: ellipsis; }
.tu-telop.is-start { align-self: flex-start; }
.tu-fill-primary { background: var(--tu-primary); color: var(--tu-on-primary); }
.tu-fill-accent { background: var(--tu-accent); color: #fff; }
.tu-fill-outline { background: var(--tu-panel); color: var(--tu-fg); box-shadow: inset 0 0 0 3px var(--tu-primary); }

.tu-tag { display: inline-block; flex-shrink: 0; font-weight: 900; font-size: min(.75vw, 1.25vh); padding: .1vh .45vw;
  box-shadow: inset 0 0 0 1.5px var(--tu-primary); color: var(--tu-primary); vertical-align: middle; white-space: nowrap; }
.tu-tag.is-accent { box-shadow: inset 0 0 0 1.5px var(--tu-accent); color: var(--tu-accent); }
.tu-pill { display: inline-block; flex-shrink: 0; background: var(--tu-accent); color: #fff; font-weight: 900;
  font-size: min(.8vw, 1.35vh); padding: .2vh .5vw; white-space: nowrap; }
.tu-dot { display: inline-block; flex-shrink: 0; border-radius: 999px; width: min(.8vw, 1.3vh); height: min(.8vw, 1.3vh); background: var(--tu-accent); }
.tu-dot.is-off { background: var(--tu-mute); }

/* ── numbers ──────────────────────────────────────────────────────── */
.tu-big { font-family: var(--tu-num-font); font-weight: 800; font-style: italic; line-height: .86;
  letter-spacing: -0.01em; font-variant-numeric: tabular-nums; display: inline-block; }
.tu-big.is-upright { font-style: normal; }
.tu-big-unit { font-size: .42em; margin-left: .06em; font-style: normal; font-weight: 700; }
.tu-big-wait { font-family: var(--tu-font, "Noto Sans JP", system-ui, sans-serif); font-size: .26em; font-style: normal; font-weight: 700; letter-spacing: .1em; color: var(--tu-mute); }
@keyframes tu-bump { 0% { transform: scale(1) } 35% { transform: scale(1.08) } 100% { transform: scale(1) } }
.tu-bump { animation: tu-bump calc(.35s * var(--tu-speed, 1)) cubic-bezier(.3,1.5,.5,1); transform-origin: left bottom; }

.tu-stat-head { margin-top: 1.4vh; }
.tu-stat-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 1.4vw; }
.tu-stat-row > .tu-telop { margin-bottom: 1.4vh; }
.tu-stat-caption { margin-top: .8vh; font-size: min(.95vw, 1.6vh); font-weight: 700; color: var(--tu-mute); }
.tu-stat-caption.is-end { text-align: right; }

.tu-segs { display: flex; gap: .25vw; height: 2.4vh; }
.tu-segs.is-tall { height: 3.4vh; }
.tu-seg { flex: 1; background: var(--tu-track); transform: skewX(var(--tu-skew)); transition: background calc(.4s * var(--tu-speed, 1)), transform calc(.4s * var(--tu-speed, 1)) cubic-bezier(.3,1.6,.5,1); }
.tu-seg.is-on { background: var(--tu-seg-on, var(--tu-primary)); transform: skewX(var(--tu-skew)) scaleY(1.25); }

.tu-progress { position: relative; background: var(--tu-track); transform: skewX(var(--tu-skew)); overflow: hidden; }
.tu-progress-fill { height: 100%; transition: width calc(.9s * var(--tu-speed, 1)) var(--tu-ease-spring), background calc(.3s * var(--tu-speed, 1)); }

.tu-clock { display: inline-flex; align-items: center; gap: .8vw; color: var(--tu-primary); flex-shrink: 0; }
.tu-clock .tu-big { font-size: min(3.4vw, 5.6vh); font-style: normal; }

/* digit roller (slot-machine counter) */
.tu-roller { display: inline-flex; align-items: flex-end; font-family: var(--tu-num-font); font-weight: 800; font-style: italic;
  line-height: 1; font-variant-numeric: tabular-nums; }
.tu-roller-col { display: inline-block; height: 1em; overflow: hidden; }
.tu-roller-strip { display: flex; flex-direction: column; }
.tu-roller-strip > span { height: 1em; display: block; text-align: center; }
.tu-roller-strip.is-moving { transition: transform var(--tu-roll-ms, 1400ms) cubic-bezier(.2,.8,.15,1); }
.tu-roller-sep { display: inline-block; }

/* split-flap (station board) */
.tu-flap-row { display: inline-flex; gap: .14em; }
.tu-flap { position: relative; display: inline-flex; align-items: center; justify-content: center; width: .86em; height: 1.22em;
  background: var(--tu-primary); color: var(--tu-on-primary); font-weight: 900; line-height: 1; overflow: hidden; perspective: 4em; }
.tu-flap.is-wide { width: 1.25em; }
.tu-flap::after { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 2px; background: var(--tu-bg); opacity: .55; }
@keyframes tu-flap { 0% { transform: rotateX(90deg); filter: brightness(.6) } 100% { transform: rotateX(0); filter: none } }
.tu-flap-char { display: block; transform-origin: 50% 50%; animation: tu-flap var(--tu-flap-ms, 70ms) linear; }

/* ── motion helpers ───────────────────────────────────────────────── */
@keyframes tu-wipe { from { clip-path: inset(0 100% 0 0) } to { clip-path: inset(0 0 0 0) } }
/* fill-mode BACKWARDS on purpose: keeping the final clip-path would clip anything that
   sticks out afterwards (the stamp on the correct answer was cut in half). */
.tu-wipe { animation: tu-wipe calc(.45s * var(--tu-speed, 1)) var(--tu-ease-wipe) backwards; }
.tu-wipe-fast { animation: tu-wipe calc(.28s * var(--tu-speed, 1)) cubic-bezier(.6,0,.2,1) backwards; }
/* Reveal: the wipe edge travels from the content's left to its right (measured in JS);
   the other three sides never clip, so slanted corners stay whole during the move. */
@keyframes tu-reveal {
  from { clip-path: inset(-100vmax var(--tu-reveal-from, 100%) -100vmax -100vmax) }
  to   { clip-path: inset(-100vmax var(--tu-reveal-to, 0px) -100vmax -100vmax) }
}
.tu-reveal { position: relative; }
.tu-reveal.is-on { animation: tu-reveal calc(.45s * var(--tu-speed, 1)) var(--tu-ease-wipe) backwards; }
.tu-reveal-ghost { visibility: hidden; }
.tu-reveal-placeholder { position: absolute; inset: 0; display: flex; align-items: center; }
@keyframes tu-rise { from { opacity: 0; transform: translateY(1.2vh) } to { opacity: 1; transform: none } }
.tu-rise { animation: tu-rise calc(.5s * var(--tu-speed, 1)) var(--tu-ease-out) backwards; }
@keyframes tu-live { 0%,100% { opacity: 1 } 50% { opacity: .25 } }
.tu-live { animation: tu-live 1.6s ease-in-out infinite; }

/* ── layout ───────────────────────────────────────────────────────── */
.tu-stage { position: relative; display: flex; flex-direction: column; height: 100vh; padding: 5vh 4.5vw 11vh; }
.tu-stage.is-no-band { padding-bottom: 4vh; }
.tu-stage-body { display: flex; flex-direction: column; flex: 1; min-height: 0; margin-top: calc(3vh * var(--tu-density)); }
.tu-header { display: flex; align-items: center; gap: 1.4vw; min-width: 0; }
.tu-header-title { display: flex; align-items: center; min-width: 0; }
.tu-logo { height: min(5vh, 2.8vw); width: auto; flex-shrink: 0; filter: var(--tu-logo-filter); }
.tu-ctrl-bar { display: flex; flex: 1; min-width: 0; align-items: center; justify-content: center; gap: .4vw; overflow: hidden; padding: 0 1vw;
  transition: opacity calc(.4s * var(--tu-speed, 1)); }
.tu-ctrl-bar.is-hidden { opacity: 0; pointer-events: none; }
.tu-root .tu-btn { white-space: nowrap; flex-shrink: 0; font-size: min(.95vw, 1.7vh); font-weight: 700; padding: .8vh .8vw; color: var(--tu-fg);
  background: var(--tu-panel); box-shadow: inset 0 0 0 2px var(--tu-track), 0 6px 20px rgba(0,0,0,.12); }
.tu-root .tu-btn:hover { box-shadow: inset 0 0 0 2px var(--tu-primary); }
.tu-root .tu-btn:disabled { opacity: .35; cursor: default; }
.tu-root .tu-btn.is-main { background: var(--tu-primary); color: var(--tu-on-primary); box-shadow: none; }
.tu-split { display: grid; }
.tu-split > * { min-width: 0; }
.tu-divider { background: var(--tu-track); }
.tu-rule { display: block; height: 3px; background: var(--tu-track); }
.tu-panel { display: flex; flex-direction: column; background: var(--tu-panel); box-shadow: inset 0 0 0 2px var(--tu-track); padding: calc(1.8vh * var(--tu-density)) 1.4vw; }
.tu-panel.is-grow { flex: 1; min-height: 0; }
.tu-panel-body { display: flex; flex-direction: column; flex: 1; min-height: 0; margin-top: 1.4vh; }
.tu-cards { display: grid; flex: 1; min-height: 0; grid-auto-rows: minmax(0, 1fr); }
.tu-card { position: relative; display: flex; flex-direction: column; justify-content: space-between; min-height: 0;
  background: var(--tu-panel); box-shadow: inset 0 0 0 2px var(--tu-track); padding: 1vh 1vw; transition: opacity calc(.6s * var(--tu-speed, 1)); }
.tu-card.is-active { background: var(--tu-primary); color: var(--tu-on-primary); box-shadow: none; }
.tu-card.is-active .tu-card-meta { color: var(--tu-on-primary); opacity: .8; }
.tu-card.is-done { opacity: .35; }
.tu-card-top { display: flex; align-items: center; gap: .5vw; min-width: 0; }
.tu-card-title { font-weight: 900; font-size: min(1.25vw, 2.1vh); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tu-card-bottom { display: flex; align-items: flex-end; justify-content: space-between; gap: .6vw; }
.tu-card-value { font-size: min(2.8vw, 4.6vh); }
.tu-card:not(.is-active) .tu-card-value { color: var(--tu-primary); }
.tu-card-meta { text-align: right; font-size: min(.8vw, 1.35vh); font-weight: 700; color: var(--tu-mute); line-height: 1.35; }
.tu-status { display: flex; min-height: 100vh; flex-direction: column; align-items: center; justify-content: center; gap: 2vh; padding: 0 8vw; text-align: center; }

.tu-lband { position: absolute; left: 0; right: 0; bottom: 0; z-index: 10; display: flex; height: 7vh; font-size: min(1.5vw, 2.6vh); font-weight: 700; }
.tu-lband-tag { display: flex; align-items: center; padding: 0 2.2vw 0 4.5vw; background: var(--tu-brand-accent); color: #fff;
  font-family: var(--tu-num-font); font-style: italic; font-weight: 800; letter-spacing: .12em; font-size: 1.25em; }
.tu-lband-body { flex: 1; min-width: 0; display: flex; align-items: center; gap: 2.4vw; padding: 0 4.5vw 0 2vw;
  background: var(--tu-brand-primary); color: #fff; overflow: hidden; }
.tu-lband-item { white-space: nowrap; display: inline-flex; align-items: baseline; gap: .4vw; }
.tu-lband-item.is-truncate { min-width: 0; overflow: hidden; text-overflow: ellipsis; display: block; }
/* marquee inside the L-band (lobby signage) */
.tu-marquee { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; }
/* padding-left:100% already parks the text just past the right edge; start there. */
@keyframes tu-marquee { from { transform: translateX(0) } to { transform: translateX(-100%) } }
.tu-marquee > span { display: inline-block; padding-left: 100%; animation: tu-marquee var(--tu-marquee-s, 20s) linear infinite; }

/* ── text blocks ──────────────────────────────────────────────────── */
.tu-qbox { background: var(--tu-primary); color: var(--tu-on-primary); padding: 2.4vh 2.2vw; border-left: 1.2vw solid var(--tu-accent); }
.tu-qbox-sub { margin-top: 1vh; font-size: min(2vw, 3.3vh); font-weight: 700; opacity: .75; line-height: 1.4; }
.tu-lower { display: flex; align-items: stretch; }
.tu-lower-label { flex-shrink: 0; display: flex; align-items: center; background: var(--tu-accent); color: #fff; padding: 0 1.4vw;
  font-weight: 900; font-size: min(1.7vw, 2.8vh); }
.tu-lower-body { flex: 1; background: var(--tu-panel); padding: 1.8vh 1.8vw; box-shadow: inset 0 -.5vh 0 var(--tu-primary); }
.tu-title-card { display: flex; flex-direction: column; justify-content: center; height: 100%; }
.tu-title-main { margin-top: 2.4vh; font-weight: 900; font-size: min(6.4vw, 10.6vh); line-height: 1.1; letter-spacing: .02em; }
.tu-title-rule { display: flex; height: .9vh; width: 18vw; margin-top: 3vh; }
.tu-title-rule > :first-child { flex: 8; background: var(--tu-primary); }
.tu-title-rule > :last-child { flex: 2; background: var(--tu-accent); }
.tu-title-caption { margin-top: 2.4vh; }
@keyframes tu-grow-x { from { transform: scaleX(0) } to { transform: scaleX(1) } }
.tu-grow-x { transform-origin: left; animation: tu-grow-x calc(.7s * var(--tu-speed, 1)) var(--tu-ease-wipe) calc(.25s * var(--tu-speed, 1)) backwards; }
.tu-message { display: flex; flex: 1; flex-direction: column; justify-content: center; }
.tu-message-reason { margin-top: 2.4vh; }
/* person lower third (speaker introduction) */
.tu-person { display: inline-flex; align-items: stretch; }
.tu-person-name { background: var(--tu-panel); padding: 1.4vh 2vw 1.4vh 1.6vw; box-shadow: inset 0 -.5vh 0 var(--tu-primary); }
.tu-person-name b { display: block; font-weight: 900; font-size: min(2.4vw, 4vh); line-height: 1.15; }
.tu-person-name small { display: block; font-weight: 700; font-size: min(1vw, 1.7vh); color: var(--tu-mute); }
.tu-person-role { display: flex; align-items: center; background: var(--tu-primary); color: var(--tu-on-primary); padding: 0 1.6vw;
  font-weight: 900; font-size: min(1.3vw, 2.2vh); }
/* typewriter */
.tu-type-caret { display: inline-block; width: .08em; height: 1em; margin-left: .06em; vertical-align: -.12em; background: currentColor; animation: tu-live 1s steps(1) infinite; }

/* ── charts ───────────────────────────────────────────────────────── */
.tu-rank-list { display: grid; flex: 1; min-height: 0; }
.tu-rank-list.is-single { align-content: space-around; }
.tu-rank { display: flex; align-items: center; gap: 1.1vw; width: 100%; text-align: left; padding: calc(.9vh * var(--tu-density)) .6vw;
  border-bottom: 2px solid var(--tu-track); transition: background calc(.2s * var(--tu-speed, 1)); }
.tu-rank.is-clickable:hover { background: var(--tu-track); }
/* Many rows halve the row height, so EVERY part shrinks — otherwise the rank boxes
   overlap vertically and the bars cover the next row's text. */
.tu-rank.is-compact { min-height: 0; overflow: hidden; gap: .8vw; padding: .3vh .4vw; border-bottom-width: 1px; }
.tu-rank.is-compact .tu-rank-no { width: min(2.2vw, 3.6vh); font-size: min(1.3vw, 2.1vh); padding: .15em 0; }
.tu-rank.is-compact .tu-rank-code { width: min(2.4vw, 3.8vh); font-size: min(1.1vw, 1.8vh); }
.tu-rank.is-compact .tu-rank-text { font-size: min(1.15vw, 1.95vh); line-height: 1.25; }
.tu-rank.is-compact .tu-rank-track { margin-top: .35vh; height: min(.5vw, .8vh); }
.tu-rank.is-compact .tu-rank-value { width: min(4.6vw, 7.4vh); font-size: min(1.9vw, 3.1vh); }
.tu-rank-no { flex-shrink: 0; transform: skewX(var(--tu-skew)); width: min(3.4vw, 5.6vh); text-align: center; padding: .25em 0;
  font-family: var(--tu-num-font); font-weight: 800; font-style: italic; font-size: min(2.2vw, 3.6vh); }
.tu-rank-code { flex-shrink: 0; width: min(3.4vw, 5.6vh); font-family: var(--tu-num-font); font-weight: 700; font-size: min(1.7vw, 2.8vh); color: var(--tu-mute); }
.tu-rank-main { min-width: 0; flex: 1; }
.tu-rank-text { display: block; font-weight: 900; font-size: min(1.65vw, 2.75vh); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tu-rank-track { display: block; margin-top: .7vh; height: min(1vw, 1.6vh); background: var(--tu-track); transform: skewX(var(--tu-skew)); }
.tu-rank-fill { display: block; height: 100%; transition: width calc(.55s * var(--tu-speed, 1)) cubic-bezier(.3,1.2,.5,1); }
.tu-rank-value { flex-shrink: 0; width: min(7vw, 11vh); text-align: right; font-family: var(--tu-num-font); font-weight: 800; font-style: italic;
  font-size: min(3.4vw, 5.6vh); line-height: 1; }

/* ranking race (rows slide to their new place) */
.tu-race { position: relative; width: 100%; }
.tu-race-row { position: absolute; left: 0; right: 0; display: grid; grid-template-columns: auto minmax(0, var(--tu-race-label, 26%)) minmax(0,1fr) auto;
  align-items: center; gap: 1.2vw; transition: top calc(.8s * var(--tu-speed, 1)) var(--tu-ease-spring); }
.tu-race-label { font-weight: 900; font-size: min(1.5vw, 2.5vh); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tu-race-value { font-size: min(2.6vw, 4.3vh); min-width: min(7vw, 11vh); text-align: right; }

.tu-bar-row { display: grid; grid-template-columns: minmax(0, var(--tu-bar-label, 28%)) minmax(0, 1fr) auto; align-items: center;
  gap: 1.2vw; padding: calc(.8vh * var(--tu-density)) 0; border-bottom: 2px solid var(--tu-track); }
.tu-bar-row:last-child { border-bottom: 0; }
.tu-bar-label { font-weight: 900; font-size: min(1.4vw, 2.4vh); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tu-bar-value { font-size: min(2.6vw, 4.3vh); text-align: right; min-width: min(6vw, 10vh); }

.tu-stack { display: flex; height: min(3vw, 5vh); transform: skewX(var(--tu-skew)); overflow: hidden; background: var(--tu-track); }
.tu-stack-part { height: 100%; min-width: 0; flex-basis: 0; display: flex; align-items: center; justify-content: center; overflow: hidden;
  transition: flex-grow calc(.9s * var(--tu-speed, 1)) var(--tu-ease-spring); }
.tu-stack-part > span { transform: skewX(var(--tu-unskew)); color: #fff; font-weight: 900; font-size: min(1.1vw, 1.9vh); white-space: nowrap; }
.tu-legend { display: flex; flex-wrap: wrap; gap: .8vh 1.6vw; margin-top: 1.6vh; }
.tu-legend-item { display: inline-flex; align-items: center; gap: .5vw; font-weight: 700; font-size: min(1.05vw, 1.8vh); }
.tu-legend-swatch { width: min(1vw, 1.7vh); height: min(1vw, 1.7vh); transform: skewX(var(--tu-skew)); }
.tu-legend-item .tu-big { font-size: 1.3em; font-style: normal; }

.tu-choices { display: flex; flex-direction: column; gap: calc(2.6vh * var(--tu-density)); }
.tu-choice { position: relative; display: flex; align-items: center; gap: 1.6vw; transition: opacity calc(.4s * var(--tu-speed, 1)); }
.tu-choice.is-dim { opacity: .3; }
.tu-opt-mark { flex-shrink: 0; width: min(7vw, 11vh); height: min(7vw, 11vh); display: flex; align-items: center; justify-content: center;
  background: var(--tu-panel); box-shadow: inset 0 0 0 4px var(--tu-primary); font-weight: 900; font-size: min(4.6vw, 7.6vh); }
.tu-opt-track { position: relative; flex: 1; height: min(4.4vw, 7.2vh); background: var(--tu-track); transform: skewX(var(--tu-skew)); overflow: hidden; }
.tu-opt-fill { height: 100%; transition: width calc(.7s * var(--tu-speed, 1)) cubic-bezier(.3,1.2,.5,1), background calc(.3s * var(--tu-speed, 1)); }
.tu-opt-num { flex-shrink: 0; width: min(10vw, 16vh); text-align: right; }
.tu-opt-count { display: block; font-size: min(1.2vw, 2vh); font-weight: 700; color: var(--tu-mute); }

@keyframes tu-stamp { 0% { opacity: 0; transform: translateY(-50%) scale(2.6) rotate(-28deg) }
  60% { opacity: 1; transform: translateY(-50%) scale(.92) rotate(-12deg) } 100% { opacity: 1; transform: translateY(-50%) scale(1) rotate(-12deg) } }
.tu-stamp { position: absolute; left: min(8.5vw, 14vh); top: 50%; z-index: 2; color: var(--tu-accent); border: .45vw solid var(--tu-accent);
  border-radius: 999px; padding: .2em .55em; font-weight: 900; font-size: min(3vw, 5vh); letter-spacing: .1em; white-space: nowrap;
  background: color-mix(in srgb, var(--tu-bg) 80%, transparent); animation: tu-stamp calc(.45s * var(--tu-speed, 1)) cubic-bezier(.3,1.4,.5,1) both; }

/* drumroll reveal (quiz-show style) */
.tu-drum { display: grid; gap: 1.2vw; }
.tu-drum-item { position: relative; display: flex; align-items: center; justify-content: center; min-height: min(9vw, 15vh); padding: 1.4vh 1vw;
  background: var(--tu-panel); box-shadow: inset 0 0 0 3px var(--tu-track); font-weight: 900; font-size: min(2.2vw, 3.7vh); text-align: center;
  transition: background calc(.08s * var(--tu-speed, 1)), color calc(.08s * var(--tu-speed, 1)), opacity calc(.5s * var(--tu-speed, 1)), box-shadow calc(.08s * var(--tu-speed, 1)); }
.tu-drum-item.is-lit { background: var(--tu-primary); color: var(--tu-on-primary); box-shadow: none; }
.tu-drum-item.is-hit { background: var(--tu-accent); color: #fff; box-shadow: none; }
.tu-drum-item.is-dim { opacity: .3; }
.tu-drum-item .tu-stamp { left: auto; right: -1vw; top: 0; }

/* ── effects ──────────────────────────────────────────────────────── */
.tu-tickers { position: absolute; right: 0; z-index: 20; display: flex; flex-direction: column; align-items: flex-end; gap: 1vh; pointer-events: none; }
@keyframes tu-ticker { 0% { transform: translateX(120%) } 14% { transform: translateX(0) } 82% { transform: translateX(0) } 100% { transform: translateX(120%) } }
.tu-ticker { display: flex; animation: tu-ticker 2.6s cubic-bezier(.7,0,.2,1) both; font-weight: 900; font-size: min(1.6vw, 2.7vh); }
.tu-ticker-label { background: var(--tu-accent); color: #fff; padding: 1vh 1.2vw; }
.tu-ticker-text { background: var(--tu-panel); padding: 1vh 4.5vw 1vh 1.6vw; box-shadow: inset 0 -.4vh 0 var(--tu-primary); }

.tu-banner-wrap { position: fixed; inset: 0; z-index: 40; display: flex; align-items: center; pointer-events: none; }
@keyframes tu-banner { 0% { clip-path: inset(0 100% 0 0) } 18% { clip-path: inset(0 0 0 0) } 82% { clip-path: inset(0 0 0 0) } 100% { clip-path: inset(0 0 0 100%) } }
.tu-banner { width: 100%; animation: tu-banner calc(3.4s * var(--tu-speed, 1)) cubic-bezier(.7,0,.2,1) both; }
.tu-banner-main { background: var(--tu-brand-primary); padding: 4vh 0; text-align: center; color: #fff; font-weight: 900; font-size: 7vw; letter-spacing: .08em; }
.tu-banner-edge { background: var(--tu-brand-accent); height: 1.4vh; }

/* end credits. Travel = screen height + list height; translateY(100%) alone is the LIST's
   height, so a short list started mid-screen with a big gap. The screen height is 100cqh. */
.tu-credits { position: relative; overflow: hidden; height: 100%; container-type: size;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 12%, #000 88%, transparent 100%);
          mask-image: linear-gradient(to bottom, transparent 0, #000 12%, #000 88%, transparent 100%); }
@keyframes tu-credits { from { transform: translateY(100cqh) } to { transform: translateY(-100%) } }
.tu-credits-track { animation: tu-credits var(--tu-credits-dur, 60s) linear infinite; }
.tu-credits:hover .tu-credits-track { animation-play-state: paused; }
.tu-credit { display: grid; grid-template-columns: 1fr 1fr; gap: 2.4vw; align-items: baseline; padding: 1.8vh 0; }
.tu-credit-name { text-align: right; font-weight: 900; font-size: min(2.6vw, 4.4vh); }
.tu-credit-sub { display: block; font-weight: 700; font-size: min(1.15vw, 1.9vh); color: var(--tu-mute); }
.tu-credit-value { font-weight: 900; font-size: min(2.1vw, 3.5vh); color: var(--tu-primary); }
.tu-credit-section { text-align: center; padding: 4vh 0 1.6vh; }

/* spotlight: dims everything except the child */
.tu-spot { position: relative; z-index: 35; }
.tu-spot-veil { position: fixed; inset: 0; z-index: 34; background: color-mix(in srgb, var(--tu-bg) 78%, transparent); animation: tu-rise calc(.35s * var(--tu-speed, 1)) var(--tu-ease-out) both; pointer-events: none; }
.tu-spot.is-on { box-shadow: 0 0 0 .6vh var(--tu-accent); }

/* last-seconds countdown */
@keyframes tu-beat { 0% { transform: scale(1.6); opacity: 0 } 25% { transform: scale(1); opacity: 1 } 100% { transform: scale(.92); opacity: .9 } }
.tu-beat { display: inline-block; animation: tu-beat calc(1s * var(--tu-speed, 1)) var(--tu-ease-out) both; }

/* ── slides ───────────────────────────────────────────────────────── */
/* overflow hidden: the curtain stops just outside the right edge (translateX(101%));
   without clipping it lingers in the margin as a solid bar. */
/* overflow is hidden for the curtain; the 2vw of extra room on each side keeps the slanted
   corners of telops at the content edge from being cut off */
.tu-deck { position: relative; height: 100%; width: calc(100% + 4vw); margin: 0 -2vw; padding: 0 2vw; overflow: hidden; }
.tu-deck-slide { height: 100%; width: 100%; }
@keyframes tu-curtain { 0% { transform: translateX(-101%) } 45%, 55% { transform: translateX(0) } 100% { transform: translateX(101%) } }
.tu-curtain { position: absolute; inset: 0; z-index: 45; display: flex; pointer-events: none; animation: tu-curtain calc(.8s * var(--tu-speed, 1)) var(--tu-ease-wipe) both; }
.tu-curtain > :first-child { flex: 1; background: var(--tu-brand-primary); }
.tu-curtain > :last-child { width: 1.4vw; background: var(--tu-brand-accent); }
.tu-deck-progress { position: absolute; right: 2vw; bottom: 0; z-index: 30; display: flex; gap: .4vw; align-items: center; }
.tu-deck-seg { position: relative; width: min(2.6vw, 4.4vh); height: min(.45vw, .75vh); background: var(--tu-track); overflow: hidden; transform: skewX(var(--tu-skew)); }
.tu-deck-seg.is-done { background: var(--tu-primary); }
@keyframes tu-deck-fill { from { width: 0 } to { width: 100% } }
.tu-deck-seg > span { position: absolute; top: 0; bottom: 0; left: 0; background: var(--tu-primary); animation: tu-deck-fill linear forwards; }


/* ── TV segments (shows.tsx) ─────────────────────────────────────── */

/* MekuriBoard: answers under paper strips. The strip is a flat primary block with a
   folded corner; peeling lifts it a little, then pulls it off to the upper right. */
.tu-mekuri { display: grid; gap: calc(1.6vh * var(--tu-density)) 2vw; }
.tu-mekuri-row { display: flex; align-items: stretch; gap: 1.2vw; }
.tu-mekuri-label { flex-shrink: 0; display: flex; align-items: center; justify-content: center; min-width: 4.2em;
  font-family: var(--tu-num-font); font-style: italic; font-weight: 800; color: var(--tu-primary); font-size: 1.15em; }
.tu-mekuri-slot { position: relative; flex: 1; min-width: 0; display: flex; align-items: center; padding: .55em 1em;
  background: var(--tu-panel); box-shadow: inset 0 0 0 3px var(--tu-track); font-weight: 900; }
.tu-mekuri-slot.is-hot { color: var(--tu-accent); box-shadow: inset 0 0 0 3px var(--tu-accent); }
.tu-mekuri-answer { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tu-root .tu-mekuri-strip { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background: var(--tu-primary); color: var(--tu-on-primary); font-weight: 900; transform-origin: 100% 0;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - .9em), calc(100% - .9em) 100%, 0 100%); }
.tu-root .tu-mekuri-strip:disabled { cursor: default; }
.tu-root .tu-mekuri-strip:not(:disabled):hover { filter: brightness(1.08); }
/* the folded corner: a small triangle in the cut-off area */
.tu-mekuri-strip::after { content: ""; position: absolute; right: 0; bottom: 0; width: .9em; height: .9em;
  background: color-mix(in srgb, var(--tu-primary) 55%, var(--tu-bg)); clip-path: polygon(0 0, 100% 0, 0 100%); }
@keyframes tu-mekuri {
  0%   { transform: none }
  25%  { transform: translate(.3em, -.25em) rotate(-1.2deg) }
  100% { transform: translate(115%, -60%) rotate(9deg); opacity: 0 }
}
.tu-mekuri-strip.is-peeling { animation: tu-mekuri calc(.7s * var(--tu-speed, 1)) cubic-bezier(.5,0,.75,0) forwards; pointer-events: none; }

/* JudgeScores */
.tu-judges { display: flex; flex-direction: column; gap: calc(4vh * var(--tu-density)); }
.tu-judge-row { display: grid; gap: 1.4vw; }
.tu-judge { display: flex; flex-direction: column; background: var(--tu-panel); box-shadow: inset 0 0 0 3px var(--tu-track); }
.tu-judge-name { padding: 1.2vh .8vw; text-align: center; font-weight: 900; font-size: min(1.4vw, 2.4vh);
  background: var(--tu-primary); color: var(--tu-on-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tu-judge-score { display: flex; align-items: center; justify-content: center; min-height: 1.3em; perspective: 600px;
  font-family: var(--tu-num-font); font-style: italic; font-weight: 800; color: var(--tu-fg); }
.tu-judge-num { display: block; animation: tu-flap calc(.32s * var(--tu-speed, 1)) cubic-bezier(.3,1.3,.5,1); }
.tu-judge-wait { display: block; width: 1.1em; height: .12em; background: var(--tu-track); }
.tu-judge.is-best { box-shadow: inset 0 0 0 4px var(--tu-accent); }
.tu-judge.is-best .tu-judge-score { color: var(--tu-accent); }
.tu-judge-total { display: flex; align-items: flex-end; justify-content: flex-end; gap: 1.6vw; min-height: 1em; opacity: 0; }
/* fade in only: fading out would show the sum counting back down to 0 */
.tu-judge-total.is-on { opacity: 1; transition: opacity calc(.3s * var(--tu-speed, 1)); }
.tu-judge-total > .tu-telop { margin-bottom: 2.4vh; font-size: min(2vw, 3.3vh); }

/* VersusMeter */
.tu-vs { display: flex; flex-direction: column; gap: 2.4vh; }
.tu-vs-head { display: flex; align-items: flex-end; gap: 2vw; }
.tu-vs-side { flex: 1; display: flex; flex-direction: column; align-items: flex-start; gap: 1.4vh; }
.tu-vs-side.is-right { align-items: flex-end; }
.tu-vs-mark { align-self: center; font-family: var(--tu-num-font); font-style: italic; font-weight: 800;
  font-size: min(3vw, 5vh); color: var(--tu-mute); }
.tu-vs-bar { position: relative; display: flex; height: min(3.4vw, 5.6vh); gap: .4vw; }
.tu-vs-left, .tu-vs-right { flex-basis: 0; min-width: 2%; transition: flex-grow calc(.9s * var(--tu-speed, 1)) var(--tu-ease-spring); }
.tu-vs-left { background: var(--tu-primary); clip-path: polygon(0 0, 100% 0, calc(100% - var(--tu-cut)) 100%, 0 100%); }
.tu-vs-right { background: var(--tu-accent); clip-path: polygon(var(--tu-cut) 0, 100% 0, 100% 100%, 0 100%); margin-left: calc(var(--tu-cut) * -1); }
.tu-vs-center { position: absolute; left: 50%; top: -1vh; bottom: -1vh; width: 3px; background: var(--tu-fg); opacity: .5; }

/* ScoreBug */
.tu-bug { display: inline-flex; flex-direction: column; min-width: 15vw; background: var(--tu-panel);
  box-shadow: 0 .6vh 2vh rgba(0,0,0,.18); font-size: min(1.5vw, 2.5vh); }
.tu-bug-row { display: flex; align-items: stretch; }
.tu-bug-team { flex: 1; padding: .5em .8em; font-weight: 900; white-space: nowrap; }
.tu-bug-score { display: flex; align-items: center; justify-content: center; min-width: 2.6em; padding: 0 .4em;
  font-family: var(--tu-num-font); font-style: italic; font-weight: 800; font-size: 1.45em; color: var(--tu-fg); }
@keyframes tu-bug-flash { 0%, 40% { background: var(--tu-accent); color: #fff } 100% { background: transparent } }
.tu-bug-score.is-flash { animation: tu-bug-flash calc(1.2s * var(--tu-speed, 1)) ease-out; }
.tu-bug-period { padding: .35em .8em; text-align: center; font-weight: 700; font-size: .8em; color: var(--tu-mute);
  box-shadow: inset 0 1px 0 var(--tu-track); }

/* RankReveal */
.tu-rr { display: flex; flex-direction: column; gap: calc(.7vh * var(--tu-density)); }
.tu-rr-row { display: flex; align-items: center; gap: 1.2vw; font-size: min(1.45vw, 2.4vh); }
.tu-rr-row.is-big { font-size: min(2.2vw, 3.6vh); }
.tu-rr-rank { flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: min(5vw, 8.3vh); height: 1.6em;
  transform: skewX(var(--tu-skew)); background: var(--tu-track); color: var(--tu-mute);
  font-family: var(--tu-num-font); font-style: italic; font-weight: 800; font-size: 1.1em; }
.tu-rr-row.is-on .tu-rr-rank { background: var(--tu-primary); color: var(--tu-on-primary); }
.tu-rr-row.is-latest .tu-rr-rank { background: var(--tu-accent); color: #fff; }
.tu-rr-body { flex: 1; min-width: 0; display: flex; align-items: baseline; gap: 1.4vw; padding: .3em 0; font-weight: 900;
  box-shadow: inset 0 -2px 0 var(--tu-track); }
.tu-rr-body.is-wait { color: var(--tu-mute); font-weight: 700; }
.tu-rr-row.is-latest .tu-rr-body { color: var(--tu-accent); box-shadow: inset 0 -3px 0 var(--tu-accent); }
.tu-rr-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tu-rr-value { flex-shrink: 0; font-family: var(--tu-num-font); font-style: italic; font-weight: 800; font-size: 1.15em; }

/* NewsFlash: drops in from the top edge, over the brand band */
.tu-flash { position: fixed; top: 0; left: 0; right: 0; z-index: 55; display: flex; align-items: stretch;
  font-size: min(2.2vw, 3.7vh); font-weight: 900; color: #fff; animation: tu-flash-in calc(.5s * var(--tu-speed, 1)) var(--tu-ease-out) both; }
.tu-flash.is-leaving { animation: tu-flash-out calc(.45s * var(--tu-speed, 1)) var(--tu-ease-wipe) both; }
@keyframes tu-flash-in { from { transform: translateY(-110%) } to { transform: none } }
@keyframes tu-flash-out { from { transform: none } to { transform: translateY(-110%) } }
.tu-flash-label { flex-shrink: 0; display: flex; align-items: center; padding: .55em 1.2em; background: var(--tu-brand-accent); letter-spacing: .12em; }
.tu-flash-text { flex: 1; min-width: 0; display: flex; align-items: center; padding: .55em 1.2em; background: var(--tu-brand-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }


/* ── forms (variants of the TV segments) ─────────────────────────── */

/* MekuriBoard peel: up (lifted from the bottom edge) · flip (turned over like a card) */
@keyframes tu-mekuri-up { 0% { transform: none } 25% { transform: translateY(.15em) } 100% { transform: translateY(-140%) rotate(-2deg); opacity: 0 } }
.tu-mekuri.is-peel-up .tu-mekuri-strip.is-peeling { animation-name: tu-mekuri-up; transform-origin: 50% 0; }
@keyframes tu-mekuri-flip { 0% { transform: perspective(40em) rotateX(0) } 100% { transform: perspective(40em) rotateX(-92deg); opacity: .2 } }
.tu-mekuri.is-peel-flip .tu-mekuri-strip.is-peeling { animation-name: tu-mekuri-flip; transform-origin: 50% 0; animation-timing-function: cubic-bezier(.5,0,.6,1); }

/* JudgeScores reveal: rise */
@keyframes tu-judge-rise { from { transform: translateY(40%); opacity: 0 } to { transform: none; opacity: 1 } }
.tu-judges.is-reveal-rise .tu-judge-num { animation: tu-judge-rise calc(.45s * var(--tu-speed, 1)) var(--tu-ease-out) both; }
.tu-judges.is-reveal-count .tu-judge-num { animation: none; }
.tu-judge-row { row-gap: calc(2vh * var(--tu-density)); }

/* VersusMeter split: two colored halves, the leader's half grows */
.tu-vs-split { position: relative; display: flex; align-items: stretch; height: 100%; min-height: 40vh; gap: 0; }
.tu-vs-half { flex-basis: 0; display: flex; align-items: center; padding: 0 3vw; transition: flex-grow calc(.9s * var(--tu-speed, 1)) var(--tu-ease-spring); }
.tu-vs-half.is-left { background: var(--tu-primary); clip-path: polygon(0 0, 100% 0, calc(100% - var(--tu-cut)) 100%, 0 100%); }
.tu-vs-half.is-right { background: var(--tu-accent); justify-content: flex-end; clip-path: polygon(var(--tu-cut) 0, 100% 0, 100% 100%, 0 100%); margin-left: calc(var(--tu-cut) * -1); }
.tu-vs-half .tu-vs-side { gap: 2vh; }
/* a zero-width item between the halves, so the VS rides on the seam as the split moves */
.tu-vs-split-mark { position: relative; z-index: 1; flex: 0 0 0; width: 0; display: flex; align-items: center; justify-content: center; overflow: visible; }
.tu-vs-split-mark > span { flex-shrink: 0; padding: .2em .5em; background: var(--tu-bg); color: var(--tu-fg);
  font-family: var(--tu-num-font); font-style: italic; font-weight: 800; font-size: min(3vw, 5vh); }

/* ScoreBug inline: one row */
.tu-bug.is-inline { min-width: 0; }
.tu-bug.is-inline .tu-bug-team { flex: 0 0 auto; }
.tu-bug-dash { display: flex; align-items: center; color: var(--tu-mute); font-weight: 900; }

/* RankReveal podium: 2nd · 1st · 3rd, the rest in two columns below */
.tu-rr.is-podium { gap: calc(3vh * var(--tu-density)); }
.tu-podium { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: end; gap: 1.6vw; height: 44vh; }
.tu-podium-col { display: flex; flex-direction: column; justify-content: flex-end; height: 100%; min-width: 0; }
.tu-podium-top { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; min-height: 9vh; padding-bottom: 1.2vh; text-align: center; }
.tu-podium-reveal { display: flex; flex-direction: column; align-items: center; animation: tu-rise calc(.5s * var(--tu-speed, 1)) var(--tu-ease-out) both; }
.tu-podium-label { font-weight: 900; font-size: min(2.4vw, 4vh); line-height: 1.2; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tu-podium-label.is-wait { color: var(--tu-mute); font-weight: 700; }
.tu-podium-value { margin-top: .4vh; font-family: var(--tu-num-font); font-style: italic; font-weight: 800; font-size: min(1.8vw, 3vh); color: var(--tu-mute); }
.tu-podium-block { display: flex; align-items: flex-start; justify-content: center; padding-top: 1.4vh; background: var(--tu-track);
  font-family: var(--tu-num-font); font-style: italic; font-weight: 800; font-size: min(5vw, 8.3vh); color: var(--tu-mute);
  transform-origin: bottom; transition: background calc(.3s * var(--tu-speed, 1)), color calc(.3s * var(--tu-speed, 1)); }
.tu-root[data-shape="round"] .tu-podium-block { border-radius: var(--tu-radius) var(--tu-radius) 0 0; }
.tu-podium-col.is-p1 .tu-podium-block { height: 72%; }
.tu-podium-col.is-p2 .tu-podium-block { height: 52%; }
.tu-podium-col.is-p3 .tu-podium-block { height: 38%; }
.tu-podium-col.is-on .tu-podium-block { background: var(--tu-primary); color: var(--tu-on-primary); }
.tu-podium-col.is-latest .tu-podium-block { background: var(--tu-accent); color: #fff; }
.tu-podium-col.is-latest .tu-podium-label { color: var(--tu-accent); }
@keyframes tu-podium-up { from { transform: scaleY(.15) } to { transform: scaleY(1) } }
.tu-podium-col.is-on .tu-podium-block { animation: tu-podium-up calc(.6s * var(--tu-speed, 1)) var(--tu-ease-spring) both; }
.tu-podium-rest { display: grid; grid-auto-flow: column; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: calc(.6vh * var(--tu-density)) 3vw; }

/* NewsFlash: bottom · alert */
.tu-flash.is-bottom { top: auto; bottom: 0; animation-name: tu-flash-up; }
.tu-flash.is-bottom.is-leaving { animation-name: tu-flash-down; }
@keyframes tu-flash-up { from { transform: translateY(110%) } to { transform: none } }
@keyframes tu-flash-down { from { transform: none } to { transform: translateY(110%) } }
.tu-flash.is-alert .tu-flash-text { background: var(--tu-brand-accent); }
.tu-flash.is-alert .tu-flash-label { background: #fff; color: var(--tu-brand-accent); animation: tu-live 1s ease-in-out infinite; }


/* ── more forms (0.2) ─────────────────────────────────────────────── */

/* SegBar dots: one round dot per person */
.tu-segs.is-dots { gap: .45vw; }
.tu-segs.is-dots .tu-seg { flex: 0 0 auto; aspect-ratio: 1; height: 100%; border-radius: 999px; transform: none; }
.tu-segs.is-dots .tu-seg.is-on { transform: scale(1.15); }

/* ring (ProgressBar variant="ring", Countdown variant="ring") */
.tu-ring { position: relative; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tu-ring > svg { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
.tu-ring-track { fill: none; stroke: var(--tu-track); stroke-width: 9; }
.tu-ring-fill { fill: none; stroke-width: 9; stroke-dasharray: 100 100; stroke-linecap: butt;
  transition: stroke-dashoffset calc(.9s * var(--tu-speed, 1)) var(--tu-ease-spring), stroke calc(.3s * var(--tu-speed, 1)); }
.tu-root[data-shape="round"] .tu-ring-fill { stroke-linecap: round; }
.tu-ring-in { position: relative; display: flex; align-items: center; justify-content: center; }
.tu-progress-row { display: flex; align-items: center; gap: 1.4vw; }

/* HeadlineBox outline */
.tu-qbox.is-outline { background: var(--tu-panel); color: var(--tu-fg); box-shadow: inset 0 0 0 3px var(--tu-primary); }
.tu-qbox.is-outline .tu-qbox-sub { color: var(--tu-mute); opacity: 1; }

/* LowerThird primary label */
.tu-lower.is-primary .tu-lower-label { background: var(--tu-primary); color: var(--tu-on-primary); }
.tu-lower.is-primary .tu-lower-body { box-shadow: inset 0 -.5vh 0 var(--tu-accent); }

/* PersonLowerThird mirrored */
.tu-person.is-right { flex-direction: row-reverse; }
.tu-person.is-right .tu-person-name { text-align: right; padding: 1.4vh 1.6vw 1.4vh 2vw; }

/* TitleCard / BigMessage centered */
.tu-title-card.is-center, .tu-message.is-center { align-items: center; text-align: center; }
.tu-title-card.is-center .tu-telop.is-start { align-self: center; }
.tu-title-card.is-center .tu-grow-x { transform-origin: center; }

/* SweepBanner accent */
.tu-banner.is-accent .tu-banner-main { background: var(--tu-brand-accent); }
.tu-banner.is-accent .tu-banner-edge { background: var(--tu-brand-primary); }

/* CreditsRoll centered */
.tu-credits.is-center .tu-credit { grid-template-columns: 1fr; gap: .6vh; text-align: center; padding: 2.2vh 0; }
.tu-credits.is-center .tu-credit-name { text-align: center; }

/* SlideDeck fade / slide */
@keyframes tu-deck-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes tu-deck-slide-in { from { transform: translateX(8%); opacity: 0 } to { transform: none; opacity: 1 } }
.tu-deck-slide.is-enter-fade { animation: tu-deck-fade calc(.6s * var(--tu-speed, 1)) ease both; }
.tu-deck-slide.is-enter-slide { animation: tu-deck-slide-in calc(.55s * var(--tu-speed, 1)) var(--tu-ease-out) both; }

/* Respect reduced-motion: jump to the final state. */
@media (prefers-reduced-motion: reduce) {
  .tu-wipe, .tu-wipe-fast, .tu-reveal.is-on, .tu-rise, .tu-bump, .tu-grow-x, .tu-ticker, .tu-banner, .tu-curtain, .tu-flap-char, .tu-beat,
  .tu-mekuri-strip.is-peeling, .tu-judge-num, .tu-podium-reveal, .tu-podium-col.is-on .tu-podium-block, .tu-deck-slide.is-enter-fade, .tu-deck-slide.is-enter-slide, .tu-bug-score.is-flash, .tu-flash, .tu-flash.is-leaving { animation-duration: .01s !important; }
  .tu-vs-left, .tu-vs-right { transition-duration: .01s !important; }
  .tu-credits-track, .tu-marquee > span { animation-duration: 600s !important; }
  .tu-roller-strip.is-moving { transition-duration: .01s !important; }
}
`;
