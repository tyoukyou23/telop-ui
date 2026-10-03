import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import {
  TelopRoot, CtrlButton,
  presets, useStoredMode, useAutoHide, useNow, useHotkeys, toggleFullscreen,
  type TelopTheme, type Shape, type Motion, type Density,
} from "telop-ui";
import { T, type Lang } from "./content";
import { LOGO, SCENES, SCENE_NAMES, SceneView, type SceneId } from "./scenes";
import { ENTRIES, GROUPS, defaultsOf, ENTRY, type Entry, type Props, type Value } from "./catalog";

/*
 * The demo is documentation, so its own chrome stays quiet and readable (fixed px sizes),
 * and the components are always shown the way they will really look: inside a 16:9
 * screen, scaled down — they are sized for a projector, not for a docs page.
 *
 *   Scenes     — complete screens, each listing the components it is made of.
 *   Components — nav · a 16:9 preview with a step player · an inspector
 *                (this component's parameters, then the global style).
 */

const VERSION = "0.2.0";
/** Components added in this version (marked NEW in the nav). */
const NEW_IDS = new Set(["mekuri", "judges", "versus", "scorebug", "rankreveal", "flash"]);

const SCENE_DESC: Record<Lang, Record<SceneId, string>> = {
  ja: {
    quiz: "提出が入る → 全員そろう → 難しかった問題 → 解説と正解の判子", vote: "票が入るたびに行が順位へ滑る",
    mekuri: "紙を 1 枚ずつはがして答え合わせ", speech: "審査員の点が 1 人ずつ出て合計へ", sports: "青組と赤組の対抗戦、途中に速報",
    ranking: "第10位から 1 つずつ発表", board: "駅の発車標のような予定表", ceremony: "表題 → 数字 → 内訳 → 登壇者 → エンドロール",
    countdown: "開始までのカウントダウン",
  },
  en: {
    quiz: "Submissions arrive → everyone's in → hardest questions → explanation", vote: "Rows slide to their place as votes arrive",
    mekuri: "Peel the strips one by one", speech: "Judges' scores one by one, then the total", sports: "Blue vs Red, with a breaking-news bar",
    ranking: "Announced from 10th up", board: "A departure-board schedule", ceremony: "Title → number → breakdown → speaker → credits",
    countdown: "Countdown to the start",
  },
};

/** Which catalog entries each scene is built from (links from a scene to its parts). */
const SCENE_PARTS: Record<SceneId, string[]> = {
  quiz: ["bignumber", "segbar", "ranking", "choices", "headline", "lower", "ticker", "banner"],
  vote: ["race", "ticker", "lband"],
  mekuri: ["mekuri"],
  speech: ["judges", "telop", "lband"],
  sports: ["versus", "scorebug", "flash"],
  ranking: ["rankreveal"],
  board: ["splitflap"],
  ceremony: ["slides", "titlecard", "digitroller", "stacked", "person", "credits"],
  countdown: ["countdown", "banner"],
};

type Route = { tab: "scenes" } | { tab: "components"; id: string } | { tab: "scene"; id: SceneId };
function parseHash(h: string): Route {
  if (h.startsWith("#/scene/")) return { tab: "scene", id: h.slice(8) as SceneId };
  if (h.startsWith("#/c/")) return { tab: "components", id: h.slice(4) };
  if (h === "#/components") return { tab: "components", id: ENTRIES[0].id };
  return { tab: "scenes" };
}

const UI = {
  ja: {
    scenes: "シーン", components: "部品", style: "スタイル（全体）", params: "パラメータ", theme: "テーマ", shape: "形", motion: "動き", density: "密度",
    slant: "斜め", square: "四角", round: "丸み", calm: "ゆっくり", normal: "ふつう", snappy: "きびきび", comfortable: "ゆったり", compact: "つめる",
    back: "← 戻る", next: "次へ", reset: "最初から", copy: "コピー", copied: "コピーしました", default: "既定", noParams: "このコンポーネントにパラメータはありません。",
    styleNote: "すべての部品に効きます。TelopRoot に渡します。", parts: "使っている部品", open: "全画面で開く", fullscreen: "全画面",
    heroLead: "日本のテレビ番組のような画面を React で。プロジェクター・ロビーの掲示・ライブ集計・式典のための部品集です。",
    heroNote: "依存なし・React 17 以上・型つき・MIT", browse: "部品を見る",
  },
  en: {
    scenes: "Scenes", components: "Components", style: "Style (global)", params: "Parameters", theme: "Theme", shape: "Shape", motion: "Motion", density: "Density",
    slant: "Slant", square: "Square", round: "Round", calm: "Calm", normal: "Normal", snappy: "Snappy", comfortable: "Comfortable", compact: "Compact",
    back: "← Back", next: "Next", reset: "Reset", copy: "Copy", copied: "Copied", default: "default", noParams: "This component has no parameters.",
    styleNote: "Applies to every part. Passed to TelopRoot.", parts: "Built from", open: "Open full screen", fullscreen: "Full screen",
    heroLead: "Japanese TV-broadcast style screens in React — parts for projectors, lobby signage, live tallies and ceremonies.",
    heroNote: "No dependencies · React 17+ · typed · MIT", browse: "Browse components",
  },
};

type RootProps = Omit<ComponentProps<typeof TelopRoot>, "children">;
interface Style { theme: keyof typeof presets; shape: Shape; motion: Motion; density: Density }

/* ───────────────────────── small parts ───────────────────────── */

/** Segmented control: a label and a row of mutually exclusive options. */
function Segmented<V extends Value>({ label, value, options, onChange, names, def, defLabel }: {
  label?: string; value: V; options: ReadonlyArray<V>; onChange: (v: V) => void; names?: Partial<Record<string, string>>;
  /** The default option — named next to the label, so changes from the default are easy to see. */
  def?: V; defLabel?: string;
}) {
  return (
    <div className="d-seg">
      {label && (
        <div className="d-seg-label">
          <span>{label}</span>
          {def !== undefined && <span className={`d-seg-def ${value === def ? "" : "is-changed"}`}>{defLabel}: {names?.[String(def)] ?? String(def)}</span>}
        </div>
      )}
      <div className="d-seg-opts" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button key={String(o)} type="button" role="radio" aria-checked={o === value}
            className={`d-seg-opt ${o === value ? "is-on" : ""}`} onClick={() => onChange(o)}>
            {names?.[String(o)] ?? String(o)}
          </button>
        ))}
      </div>
    </div>
  );
}

/** A 16:9 screen: renders children at full projector size and scales them to the box width. */
function Screen({ children, rootProps, maxWidth }: { children: ReactNode; rootProps: RootProps; maxWidth?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const fit = () => setScale(el.clientWidth / window.innerWidth);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    addEventListener("resize", fit);
    return () => { ro.disconnect(); removeEventListener("resize", fit); };
  }, []);
  return (
    <div ref={ref} className="d-screen" style={{ maxWidth, aspectRatio: `${innerWidth} / ${innerHeight}` }}>
      <div className="d-screen-inner" style={{ transform: `scale(${scale})` }}>
        <TelopRoot {...rootProps} paintBody={false}>{children}</TelopRoot>
      </div>
    </div>
  );
}

/** Very small JSX highlighter: tags, attribute names, strings, braces, comments. */
function Highlight({ code }: { code: string }) {
  const out: ReactNode[] = [];
  const re = /(\/\/.*)|("[^"\n]*")|(<\/?[A-Za-z][\w.]*|\/?>)|(\b[a-zA-Z]+(?==))|(\b(?:import|from|const|true|false)\b)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const cls = m[1] ? "c" : m[2] ? "s" : m[3] ? "t" : m[4] ? "a" : "k";
    out.push(<span key={k++} className={`d-hl-${cls}`}>{m[0]}</span>);
    last = m.index + m[0].length;
  }
  out.push(code.slice(last));
  return <>{out}</>;
}

function CodeBlock({ code, u }: { code: string; u: typeof UI.ja }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setDone(true); setTimeout(() => setDone(false), 1400); } catch { /* clipboard blocked: nothing to do */ }
  };
  return (
    <div className="d-code">
      <div className="d-code-bar"><span>JSX</span><button type="button" className="d-code-copy" onClick={copy}>{done ? u.copied : u.copy}</button></div>
      <pre><Highlight code={code} /></pre>
    </div>
  );
}

/* ───────────────────────── app ───────────────────────── */

export function App() {
  const [lang, setLang] = useState<Lang>("ja");
  const [mode, toggleMode] = useStoredMode("telop-ui-demo-mode");
  const [style, setStyle] = useState<Style>({ theme: "broadcast", shape: "slant", motion: "normal", density: "comfortable" });
  const [route, setRoute] = useState<Route>(() => parseHash(location.hash));
  const controls = useAutoHide();
  const now = useNow(1000);
  const t = T[lang];
  const u = UI[lang];
  const theme: TelopTheme = presets[style.theme];
  const rootProps: RootProps = { theme, mode, locale: lang, shape: style.shape, motion: style.motion, density: style.density };

  useEffect(() => {
    const f = () => { setRoute(parseHash(location.hash)); scrollTo(0, 0); };
    addEventListener("hashchange", f);
    return () => removeEventListener("hashchange", f);
  }, []);
  useHotkeys({ f: toggleFullscreen, Escape: () => { if (route.tab === "scene") history.back(); } });

  if (route.tab === "scene" && SCENES.includes(route.id)) {
    return (
      <TelopRoot {...rootProps} hideCursor={!controls}>
        <style>{DEMO_CSS}</style>
        <SceneView id={route.id} t={t} lang={lang} now={now} />
        <div className={`d-float ${controls ? "" : "is-hidden"}`}>
          <CtrlButton onClick={() => { location.hash = ""; }}>{u.back}</CtrlButton>
          <CtrlButton onClick={toggleFullscreen}>{u.fullscreen} (F)</CtrlButton>
        </div>
      </TelopRoot>
    );
  }

  return (
    <TelopRoot {...rootProps} band={false}>
      <style>{DEMO_CSS}</style>
      <header className="d-top">
        <div className="d-top-in">
          <a className="d-brand" href="#">
            <span className="d-brand-mark"><span /><span /></span>
            <b>telop-ui</b><span className="d-ver">v{VERSION}</span>
          </a>
          <nav className="d-tabs">
            <a className={route.tab === "scenes" ? "is-on" : ""} href="#">{u.scenes}</a>
            <a className={route.tab === "components" ? "is-on" : ""} href="#/components">{u.components}</a>
          </nav>
          <span className="d-flex" />
          <a className="d-link" href="https://github.com/tyoukyou23/telop-ui" target="_blank" rel="noreferrer">GitHub</a>
          <a className="d-link" href="https://www.npmjs.com/package/telop-ui" target="_blank" rel="noreferrer">npm</a>
          <button type="button" className="d-icon" onClick={toggleMode} title={mode === "dark" ? "Light" : "Dark"} aria-label="Toggle light / dark">{mode === "dark" ? "☀" : "☾"}</button>
          <Segmented value={lang} options={["ja", "en"] as const} onChange={setLang} names={{ ja: "日本語", en: "EN" }} />
        </div>
      </header>

      {route.tab === "scenes"
        ? <ScenesTab lang={lang} now={now} rootProps={rootProps} style={style} setStyle={setStyle} />
        : <ComponentsTab id={route.id} lang={lang} now={now} rootProps={rootProps} style={style} setStyle={setStyle} />}

      <footer className="d-foot">
        <span>telop-ui v{VERSION}</span><span>MIT © tyoukyou23</span>
        <span className="d-flex" />
        <span>{lang === "ja" ? "デモの人名・学校名・数字はすべて架空です。" : "All names and numbers in this demo are fictional."}</span>
      </footer>
    </TelopRoot>
  );
}

function StylePanel({ style, setStyle, lang, horizontal = false }: { style: Style; setStyle: (s: Style) => void; lang: Lang; horizontal?: boolean }) {
  const u = UI[lang];
  const set = <K extends keyof Style>(k: K) => (v: Style[K]) => setStyle({ ...style, [k]: v });
  return (
    <div className={`d-style ${horizontal ? "is-row" : ""}`}>
      <Segmented label={u.theme} value={style.theme} options={Object.keys(presets) as Array<keyof typeof presets>} onChange={set("theme")} def="broadcast" defLabel={u.default} />
      <Segmented label={u.shape} value={style.shape} options={["slant", "square", "round"] as const} onChange={set("shape")} names={{ slant: u.slant, square: u.square, round: u.round }} def="slant" defLabel={u.default} />
      <Segmented label={u.motion} value={style.motion} options={["calm", "normal", "snappy"] as const} onChange={set("motion")} names={{ calm: u.calm, normal: u.normal, snappy: u.snappy }} def="normal" defLabel={u.default} />
      <Segmented label={u.density} value={style.density} options={["comfortable", "compact"] as const} onChange={set("density")} names={{ comfortable: u.comfortable, compact: u.compact }} def="comfortable" defLabel={u.default} />
    </div>
  );
}

interface TabProps { lang: Lang; now: number; rootProps: RootProps; style: Style; setStyle: (s: Style) => void }

function ScenesTab({ lang, now, rootProps, style, setStyle }: TabProps) {
  const t = T[lang];
  const u = UI[lang];
  return (
    <div className="d-wrap">
      <section className="d-hero">
        <div className="d-hero-title"><span className="d-brand-mark is-big"><span /><span /></span>telop-ui</div>
        <p className="d-hero-lead">{u.heroLead}</p>
        <div className="d-hero-row">
          <code className="d-install">npm install telop-ui</code>
          <a className="d-btn is-main" href="#/components">{u.browse} →</a>
          <span className="d-hero-note">{u.heroNote}</span>
        </div>
      </section>

      <div className="d-section-head">
        <h2>{u.scenes}</h2>
        <StylePanel style={style} setStyle={setStyle} lang={lang} horizontal />
      </div>

      <div className="d-scenes">
        {SCENES.map((id) => (
          <article key={id} className="d-card">
            <a className="d-card-screen" href={`#/scene/${id}`} aria-label={u.open}>
              <Screen rootProps={rootProps}><SceneView id={id} t={t} lang={lang} now={now} /></Screen>
              <span className="d-card-open">{u.open} ↗</span>
            </a>
            <div className="d-card-body">
              <h3>{SCENE_NAMES[lang][id]}</h3>
              <p>{SCENE_DESC[lang][id]}</p>
              <div className="d-chips">
                {SCENE_PARTS[id].map((pid) => <a key={pid} className="d-chip" href={`#/c/${pid}`}>{ENTRY(pid).name.split(" · ")[0]}</a>)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ComponentsTab({ id, lang, now, rootProps, style, setStyle }: TabProps & { id: string }) {
  const entry = ENTRIES.find((e) => e.id === id) ?? ENTRIES[0];
  return (
    <div className="d-docs">
      <aside className="d-nav">
        {GROUPS.map((g) => {
          const items = ENTRIES.filter((e) => e.group === g.id);
          return (
            <div key={g.id} className="d-nav-group">
              <div className="d-nav-title">{g[lang]}<span>{items.length}</span></div>
              {items.map((e) => (
                <a key={e.id} href={`#/c/${e.id}`} className={`d-nav-item ${e.id === entry.id ? "is-on" : ""}`}>
                  {e.name}{NEW_IDS.has(e.id) && <span className="d-new">NEW</span>}
                </a>
              ))}
            </div>
          );
        })}
      </aside>
      {/* keyed: switching components starts from that component's defaults */}
      <EntryView key={entry.id} entry={entry} lang={lang} now={now} rootProps={rootProps} style={style} setStyle={setStyle} />
    </div>
  );
}

function EntryView({ entry, lang, now, rootProps, style, setStyle }: TabProps & { entry: Entry }) {
  const u = UI[lang];
  const t = T[lang];
  const defaults = defaultsOf(entry);
  const [p, setP] = useState<Props>(defaults);
  const [step, setStep] = useState(0);
  const ctx = { p, step, t, lang, now };
  const group = GROUPS.find((g) => g.id === entry.group);
  const names = entry.name.split(" · ");
  // When the global style differs from the defaults, show the TelopRoot that produces it,
  // so the snippet reproduces exactly what is on screen.
  const rootAttrs = [
    style.theme !== "broadcast" ? ` theme={presets.${style.theme}}` : "",
    style.shape !== "slant" ? ` shape="${style.shape}"` : "",
    style.motion !== "normal" ? ` motion="${style.motion}"` : "",
    style.density !== "comfortable" ? ` density="${style.density}"` : "",
  ].join("");
  const body = entry.code(ctx);
  const imports = [...(rootAttrs ? ["TelopRoot", ...(style.theme !== "broadcast" ? ["presets"] : [])] : []), ...names];
  const code = `import { ${imports.join(", ")} } from "telop-ui";\n\n${
    rootAttrs ? `<TelopRoot${rootAttrs}>\n${body.replace(/^/gm, "  ")}\n</TelopRoot>` : body}`;
  // Parts that fill the screen are drawn as they are; the rest are centered on a bare stage.
  const preview = entry.screen ? entry.render(ctx) : (
    <div className="tu-stage is-no-band" style={{ justifyContent: "center" }}><div style={{ width: "100%" }}>{entry.render(ctx)}</div></div>
  );
  const steps = entry.steps;

  return (
    <>
      <main className="d-main">
        <div className="d-crumb">{group?.[lang]} / <b>{names[0]}</b></div>
        <h1 className="d-title">{entry.name}{NEW_IDS.has(entry.id) && <span className="d-new is-big">NEW</span>}</h1>
        <p className="d-desc">{entry.desc[lang]}</p>

        <div className="d-stagebox">
          <Screen rootProps={rootProps}>{preview}</Screen>
          {steps != null && (
            <div className="d-player">
              <button type="button" className="d-btn" onClick={() => setStep(0)} disabled={step === 0}>⟲ {u.reset}</button>
              <div className="d-progress" aria-label={`${step} / ${steps}`}>
                {steps <= 12
                  ? Array.from({ length: steps }).map((_, i) => <span key={i} className={i < step ? "is-on" : ""} />)
                  : <b>{step} / {steps}</b>}
              </div>
              <button type="button" className="d-btn is-main" onClick={() => setStep((s) => Math.min(s + 1, steps))} disabled={step >= steps}>{u.next} ▶</button>
            </div>
          )}
        </div>

        <CodeBlock code={code} u={u} />
      </main>

      <aside className="d-inspector">
        <section>
          <h4>{u.params}</h4>
          {entry.controls ? Object.entries(entry.controls).map(([k, opts]) => (
            <Segmented key={k} label={k} value={p[k]} options={opts} def={defaults[k]} defLabel={u.default}
              onChange={(v) => { setP((prev) => ({ ...prev, [k]: v })); setStep(0); }} />
          )) : <p className="d-muted">{u.noParams}</p>}
        </section>
        <section>
          <h4>{u.style}</h4>
          <p className="d-muted">{u.styleNote}</p>
          <StylePanel style={style} setStyle={setStyle} lang={lang} />
        </section>
      </aside>
    </>
  );
}

const DEMO_CSS = `
/* docs chrome: fixed px sizes (readable at any window size); colors from the theme */
.tu-root { --d-line: var(--tu-track); --d-text: 14px; font-size: var(--d-text); }
.tu-root a { color: inherit; }
.d-flex { flex: 1; }
.d-muted { color: var(--tu-mute); font-size: 12.5px; line-height: 1.6; margin: 0 0 10px; font-weight: 600; }

/* top bar */
.d-top { position: sticky; top: 0; z-index: 40; background: var(--tu-bg); box-shadow: 0 1px 0 var(--d-line); }
.d-top::before { content: ""; display: flex; height: 4px; background: linear-gradient(90deg, var(--tu-primary) 0 80%, var(--tu-accent) 80% 100%); }
.d-top-in { display: flex; align-items: center; gap: 18px; max-width: 1480px; margin: 0 auto; padding: 0 28px; height: 58px; }
.d-brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; }
.d-brand b { font-size: 18px; font-weight: 900; letter-spacing: .01em; }
.d-ver { font: 700 11px ui-monospace, Menlo, monospace; color: var(--tu-mute); padding: 2px 6px; box-shadow: inset 0 0 0 1px var(--d-line); }
.d-brand-mark { display: inline-flex; width: 22px; height: 22px; transform: skewX(var(--tu-skew)); overflow: hidden; border-radius: var(--tu-radius); }
.d-brand-mark > :first-child { flex: 8; background: var(--tu-primary); }
.d-brand-mark > :last-child { flex: 2; background: var(--tu-accent); }
.d-brand-mark.is-big { width: 46px; height: 46px; margin-right: 16px; }
.d-tabs { display: flex; gap: 4px; margin-left: 10px; height: 100%; }
.d-tabs a { display: flex; align-items: center; padding: 0 14px; font-weight: 800; text-decoration: none; color: var(--tu-mute); box-shadow: inset 0 -3px 0 transparent; }
.d-tabs a:hover { color: var(--tu-fg); }
.d-tabs a.is-on { color: var(--tu-fg); box-shadow: inset 0 -3px 0 var(--tu-primary); }
.d-link { font-weight: 700; text-decoration: none; color: var(--tu-mute); }
.d-link:hover { color: var(--tu-fg); }
.tu-root .d-icon { width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center; font-size: 16px;
  box-shadow: inset 0 0 0 1px var(--d-line); border-radius: var(--tu-radius); }
.tu-root .d-icon:hover { background: var(--d-line); }

/* segmented control */
.d-seg { display: flex; flex-direction: column; gap: 6px; }
.d-seg-label { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; font: 700 11.5px ui-monospace, Menlo, monospace; color: var(--tu-mute); }
.d-seg-def { font: 600 11px system-ui, sans-serif; color: var(--tu-mute); opacity: .8; }
.d-seg-def.is-changed { color: var(--tu-accent); opacity: 1; }
/* in the one-line style bar only the changed ones say what the default was */
.d-style.is-row .d-seg-def:not(.is-changed) { visibility: hidden; }
.d-seg-opts { display: inline-flex; flex-wrap: wrap; align-self: flex-start; padding: 2px; gap: 2px; background: var(--d-line); border-radius: calc(var(--tu-radius) + 2px); }
.tu-root .d-seg-opt { position: relative; font-size: 12.5px; font-weight: 700; padding: 5px 11px; color: var(--tu-fg); border-radius: var(--tu-radius); line-height: 1.4; }
.tu-root .d-seg-opt:hover { background: var(--tu-panel); }
.tu-root .d-seg-opt.is-on { background: var(--tu-primary); color: var(--tu-on-primary); }
.d-top .d-seg-label { display: none; }

/* buttons */
.tu-root .d-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; font-weight: 800; font-size: 13px; text-decoration: none;
  background: var(--tu-panel); box-shadow: inset 0 0 0 1px var(--d-line); border-radius: var(--tu-radius); color: var(--tu-fg); }
.tu-root .d-btn:hover:not(:disabled) { box-shadow: inset 0 0 0 1px var(--tu-primary); }
.tu-root .d-btn:disabled { opacity: .4; cursor: default; }
.tu-root .d-btn.is-main { background: var(--tu-primary); color: var(--tu-on-primary); box-shadow: none; }

/* scenes tab */
.d-wrap { max-width: 1480px; margin: 0 auto; padding: 0 28px; }
.d-hero { padding: 54px 0 40px; box-shadow: 0 1px 0 var(--d-line); }
.d-hero-title { display: flex; align-items: center; font-size: 46px; font-weight: 900; letter-spacing: -.01em; }
.d-hero-lead { max-width: 760px; margin: 16px 0 0; font-size: 17px; font-weight: 700; line-height: 1.7; }
.d-hero-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; margin-top: 24px; }
.d-install { font: 700 13.5px ui-monospace, Menlo, monospace; padding: 9px 14px; background: var(--d-line); border-radius: var(--tu-radius); user-select: all; }
.d-hero-note { color: var(--tu-mute); font-size: 12.5px; font-weight: 700; }
.d-section-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 18px; margin: 34px 0 20px; }
.d-section-head h2 { margin: 0; font-size: 22px; font-weight: 900; }
.d-style { display: flex; flex-direction: column; gap: 14px; }
.d-style.is-row { flex-direction: row; flex-wrap: wrap; gap: 18px; }
.d-scenes { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 26px; }
.d-card { display: flex; flex-direction: column; background: var(--tu-panel); box-shadow: inset 0 0 0 1px var(--d-line); border-radius: var(--tu-radius); overflow: hidden; }
.d-card-screen { position: relative; display: block; }
.d-card-screen .d-screen { box-shadow: 0 1px 0 var(--d-line); border-radius: 0; }
.d-card-open { position: absolute; right: 10px; bottom: 10px; padding: 5px 10px; font-size: 12px; font-weight: 800;
  background: var(--tu-primary); color: var(--tu-on-primary); opacity: 0; transform: translateY(4px); transition: opacity .15s, transform .15s; border-radius: var(--tu-radius); }
.d-card-screen:hover .d-card-open, .d-card-screen:focus-visible .d-card-open { opacity: 1; transform: none; }
.d-card-body { padding: 16px 18px 18px; }
.d-card-body h3 { margin: 0; font-size: 16px; font-weight: 900; }
.d-card-body p { margin: 6px 0 0; color: var(--tu-mute); font-size: 13px; font-weight: 700; line-height: 1.6; }
.d-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.d-chip { font: 700 11.5px ui-monospace, Menlo, monospace; padding: 3px 8px; text-decoration: none; color: var(--tu-primary);
  box-shadow: inset 0 0 0 1px var(--d-line); border-radius: var(--tu-radius); }
.d-chip:hover { box-shadow: inset 0 0 0 1px var(--tu-primary); }

/* components tab: nav · main · inspector */
.d-docs { display: grid; grid-template-columns: 220px minmax(0, 1fr) 290px; gap: 36px; max-width: 1480px; margin: 0 auto; padding: 28px 28px 0; align-items: start; }
.d-nav { position: sticky; top: 90px; max-height: calc(100vh - 110px); overflow: auto; padding-bottom: 20px; }
.d-nav-group + .d-nav-group { margin-top: 20px; }
.d-nav-title { display: flex; align-items: center; justify-content: space-between; font-size: 11.5px; font-weight: 900; color: var(--tu-mute); letter-spacing: .06em; margin-bottom: 6px; }
.d-nav-title span { font: 700 11px ui-monospace, Menlo, monospace; }
.d-nav-item { display: flex; align-items: center; gap: 8px; padding: 6px 10px; font: 600 12.5px ui-monospace, Menlo, monospace; text-decoration: none;
  border-left: 2px solid var(--d-line); }
.d-nav-item:hover { background: var(--d-line); }
.d-nav-item.is-on { border-left-color: var(--tu-primary); color: var(--tu-primary); font-weight: 800; background: var(--tu-panel); }
.d-new { font: 800 9.5px system-ui, sans-serif; letter-spacing: .06em; padding: 1px 5px; background: var(--tu-accent); color: #fff; border-radius: var(--tu-radius); }
.d-new.is-big { font-size: 11px; margin-left: 12px; vertical-align: middle; }

.d-main { min-width: 0; }
.d-crumb { font-size: 12px; font-weight: 700; color: var(--tu-mute); }
.d-crumb b { color: var(--tu-fg); }
.d-title { margin: 6px 0 0; font: 800 28px ui-monospace, Menlo, monospace; letter-spacing: -.01em; }
.d-desc { margin: 10px 0 0; max-width: 760px; font-size: 14.5px; font-weight: 700; line-height: 1.7; color: var(--tu-mute); }
.d-stagebox { margin-top: 22px; background: var(--tu-panel); box-shadow: inset 0 0 0 1px var(--d-line); border-radius: var(--tu-radius); padding: 14px; }
.d-screen { position: relative; width: 100%; overflow: hidden; background: var(--tu-bg); box-shadow: 0 0 0 1px var(--d-line); border-radius: var(--tu-radius); }
.d-screen-inner { position: absolute; left: 0; top: 0; width: 100vw; height: 100vh; transform-origin: 0 0; }
.d-player { display: flex; align-items: center; gap: 14px; margin-top: 12px; }
.d-progress { flex: 1; display: flex; justify-content: center; gap: 5px; font: 800 13px ui-monospace, Menlo, monospace; color: var(--tu-mute); }
.d-progress span { width: 22px; height: 5px; background: var(--d-line); border-radius: 3px; transition: background .2s; }
.d-progress span.is-on { background: var(--tu-primary); }

.d-code { margin-top: 18px; border-radius: var(--tu-radius); overflow: hidden; box-shadow: inset 0 0 0 1px var(--d-line); }
.d-code-bar { display: flex; align-items: center; justify-content: space-between; padding: 6px 8px 6px 14px; background: var(--d-line);
  font: 800 11px ui-monospace, Menlo, monospace; color: var(--tu-mute); letter-spacing: .06em; }
.tu-root .d-code-copy { font: 700 12px system-ui, sans-serif; padding: 4px 10px; color: var(--tu-fg); background: var(--tu-panel); border-radius: var(--tu-radius); }
.d-code pre { margin: 0; padding: 16px; background: var(--tu-panel); font: 500 13px/1.75 ui-monospace, Menlo, monospace; white-space: pre-wrap; user-select: text; overflow-x: auto; }
.d-hl-t { color: var(--tu-primary); font-weight: 700; }
.d-hl-a { color: var(--tu-fg); opacity: .75; }
.d-hl-s { color: var(--tu-accent); }
.d-hl-k { color: var(--tu-primary); font-style: italic; }
.d-hl-c { color: var(--tu-mute); font-style: italic; }

.d-inspector { position: sticky; top: 90px; display: flex; flex-direction: column; gap: 22px; max-height: calc(100vh - 110px); overflow: auto; padding-bottom: 20px; }
.d-inspector section { display: flex; flex-direction: column; gap: 14px; padding: 18px; background: var(--tu-panel); box-shadow: inset 0 0 0 1px var(--d-line); border-radius: var(--tu-radius); }
.d-inspector h4 { margin: 0; font-size: 12px; font-weight: 900; letter-spacing: .06em; color: var(--tu-mute); }
.d-inspector .d-muted { margin: -8px 0 0; }
/* equal cells in the inspector: tidy columns instead of ragged wrapping */
.d-inspector .d-seg-opts { display: grid; grid-template-columns: repeat(auto-fit, minmax(74px, 1fr)); align-self: stretch; }
.d-inspector .d-seg-opt { text-align: center; }

.d-foot { display: flex; flex-wrap: wrap; gap: 18px; max-width: 1480px; margin: 60px auto 0; padding: 22px 28px 40px; box-shadow: 0 -1px 0 var(--d-line);
  color: var(--tu-mute); font-size: 12.5px; font-weight: 700; }

/* full-screen scene */
.d-float { position: fixed; top: 2.4vh; left: 50%; transform: translateX(-50%); z-index: 60; display: flex; gap: .4vw; transition: opacity .4s; }
.d-float.is-hidden { opacity: 0; pointer-events: none; }

/* narrower windows: the inspector goes under the preview, then the nav goes on top */
@media (max-width: 1180px) {
  .d-docs { grid-template-columns: 200px minmax(0, 1fr); }
  .d-inspector { position: static; grid-column: 2; max-height: none; }
}
@media (max-width: 760px) {
  .d-docs { grid-template-columns: 1fr; gap: 20px; }
  .d-nav { position: static; max-height: 220px; }
  .d-inspector { grid-column: 1; }
  .d-top-in { gap: 10px; padding: 0 14px; }
  .d-link { display: none; }
  .d-scenes { grid-template-columns: 1fr; }
}
`;
