import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps, type Dispatch, type ReactNode, type SetStateAction } from "react";
import {
  TelopRoot, CtrlButton,
  presets, createTheme, checkTheme, useStoredMode, useAutoHide, useNow, useHotkeys, toggleFullscreen,
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

const VERSION = "0.3.0";
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
    custom: "カスタム", lowContrast: "投影すると読みにくい組み合わせです", contrastOk: "明るい地・暗い地とも読みやすい組み合わせです（暗い地の色は自動で作ります）",
  },
  en: {
    scenes: "Scenes", components: "Components", style: "Style (global)", params: "Parameters", theme: "Theme", shape: "Shape", motion: "Motion", density: "Density",
    slant: "Slant", square: "Square", round: "Round", calm: "Calm", normal: "Normal", snappy: "Snappy", comfortable: "Comfortable", compact: "Compact",
    back: "← Back", next: "Next", reset: "Reset", copy: "Copy", copied: "Copied", default: "default", noParams: "This component has no parameters.",
    styleNote: "Applies to every part. Passed to TelopRoot.", parts: "Built from", open: "Open full screen", fullscreen: "Full screen",
    heroLead: "Japanese TV-broadcast style screens in React — parts for projectors, lobby signage, live tallies and ceremonies.",
    heroNote: "No dependencies · React 17+ · typed · MIT", browse: "Browse components",
    custom: "Custom", lowContrast: "Hard to read on a projector", contrastOk: "Readable in both light and dark (the dark colors are derived for you)",
  },
};

type RootProps = Omit<ComponentProps<typeof TelopRoot>, "children">;
type ThemeName = keyof typeof presets | "custom";
interface Style { theme: ThemeName; custom: { primary: string; accent: string }; shape: Shape; motion: Motion; density: Density }

/** Two-color pairs offered next to the color pickers. Every pair must pass checkTheme —
 *  a recommended pair that is hard to read on a projector would teach the wrong thing. */
const SWATCHES: Array<{ name: string; primary: string; accent: string }> = [
  { name: "紺 × 赤", primary: "#25408e", accent: "#d2232a" },
  { name: "森 × 金", primary: "#1d6b46", accent: "#b07f00" },
  { name: "紫 × 桃", primary: "#4b2a83", accent: "#d93a72" },
  { name: "海 × 橙", primary: "#0b5c7a", accent: "#d9640a" },
  { name: "茶 × 緑", primary: "#5c3a24", accent: "#23875a" },
  { name: "墨 × 橙", primary: "#1c1c1c", accent: "#e85a00" },
];

/** One custom theme per color pair (createTheme also checks the contrast once per name). */
const customCache = new Map<string, TelopTheme>();
function themeOf(style: Style): TelopTheme {
  if (style.theme !== "custom") return presets[style.theme];
  const key = `${style.custom.primary}-${style.custom.accent}`;
  if (!customCache.has(key)) customCache.set(key, createTheme(`custom ${key}`, style.custom));
  return customCache.get(key) as TelopTheme;
}

/** `?primary=25408e&accent=d2232a` opens the demo with that custom theme (shareable links). */
function styleFromUrl(): Style {
  const q = new URLSearchParams(location.search);
  const hex = (v: string | null) => (v && /^[0-9a-f]{6}$/i.test(v) ? `#${v.toLowerCase()}` : null);
  const primary = hex(q.get("primary"));
  const accent = hex(q.get("accent"));
  return {
    theme: primary && accent ? "custom" : "broadcast",
    custom: { primary: primary ?? SWATCHES[1].primary, accent: accent ?? SWATCHES[1].accent },
    shape: "slant", motion: "normal", density: "comfortable",
  };
}

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

/*
 * Previews live in iframes with a fixed 1600×900 viewport. The parts are sized in vw / vh
 * (for a projector), so the only way to show them at a true 16:9 on a phone or an odd
 * window is to give them their own viewport and scale the frame down. The frame loads
 * once; later changes (parameters, step, style) arrive by postMessage, so animations run
 * on instead of restarting.
 */
const FRAME_W = 1600;
const FRAME_H = 900;

export interface EmbedState {
  kind: "scene" | "entry";
  id: string;
  lang: Lang;
  mode: "light" | "dark";
  style: Style;
  p?: Props;
  step?: number;
}

function Frame({ state, interactive = false, title }: { state: EmbedState; interactive?: boolean; title: string }) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.25);
  // the URL is fixed at mount: changing it would reload the frame and restart every animation
  const [src] = useState(() => `?embed=${encodeURIComponent(JSON.stringify(state))}`);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const fit = () => setScale(el.clientWidth / FRAME_W);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const json = JSON.stringify(state);
  const send = () => frame.current?.contentWindow?.postMessage({ type: "telop-demo", state: JSON.parse(json) }, "*");
  useEffect(send, [json]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div ref={box} className={`d-screen ${interactive ? "" : "is-static"}`}>
      <iframe ref={frame} src={src} title={title} loading="lazy" onLoad={send} tabIndex={interactive ? 0 : -1}
        style={{ width: FRAME_W, height: FRAME_H, transform: `scale(${scale})` }} />
    </div>
  );
}

/** What an iframe renders: one scene or one component preview, nothing else. */
function EmbedView({ initial }: { initial: EmbedState }) {
  const [st, setSt] = useState<EmbedState>(initial);
  const now = useNow(1000);
  useEffect(() => {
    const on = (e: MessageEvent) => { if (e.data?.type === "telop-demo") setSt(e.data.state as EmbedState); };
    addEventListener("message", on);
    return () => removeEventListener("message", on);
  }, []);
  const t = T[st.lang];
  const rootProps: RootProps = { theme: themeOf(st.style), mode: st.mode, locale: st.lang, shape: st.style.shape, motion: st.style.motion, density: st.style.density };
  let body: ReactNode = null;
  if (st.kind === "scene") {
    body = <SceneView id={st.id as SceneId} t={t} lang={st.lang} now={now} />;
  } else {
    const entry = ENTRIES.find((e) => e.id === st.id);
    if (entry) {
      const ctx = { p: st.p ?? defaultsOf(entry), step: st.step ?? 0, t, lang: st.lang, now };
      body = entry.screen ? entry.render(ctx) : (
        <div className="tu-stage is-no-band" style={{ justifyContent: "center" }}><div style={{ width: "100%" }}>{entry.render(ctx)}</div></div>
      );
    }
  }
  return <TelopRoot {...rootProps}><style>{"html,body{margin:0;overflow:hidden}"}</style>{body}</TelopRoot>;
}

const EMBED: EmbedState | null = (() => {
  try {
    const raw = new URLSearchParams(location.search).get("embed");
    return raw ? (JSON.parse(raw) as EmbedState) : null;
  } catch { return null; }
})();

/** True on phone-width windows (follows resizes). */
function useNarrow(): boolean {
  const q = "(max-width: 760px)";
  const [narrow, setNarrow] = useState(() => matchMedia(q).matches);
  useEffect(() => {
    const m = matchMedia(q);
    const on = () => setNarrow(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return narrow;
}

function ExpandIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
      <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
    </svg>
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
  return EMBED ? <EmbedView initial={EMBED} /> : <Site />;
}

function Site() {
  const [lang, setLang] = useState<Lang>("ja");
  const [mode, toggleMode] = useStoredMode("telop-ui-demo-mode");
  const [style, setStyle] = useState<Style>(styleFromUrl);
  const [route, setRoute] = useState<Route>(() => parseHash(location.hash));
  const controls = useAutoHide();
  const now = useNow(1000);
  const t = T[lang];
  const u = UI[lang];
  const theme: TelopTheme = themeOf(style);
  // keep a custom theme in the URL so the link can be shared
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (style.theme === "custom") { q.set("primary", style.custom.primary.slice(1)); q.set("accent", style.custom.accent.slice(1)); }
    else { q.delete("primary"); q.delete("accent"); }
    const search = q.toString();
    history.replaceState(null, "", `${location.pathname}${search ? `?${search}` : ""}${location.hash}`);
  }, [style.theme, style.custom.primary, style.custom.accent]);
  const rootProps: RootProps = { theme, mode, locale: lang, shape: style.shape, motion: style.motion, density: style.density };

  useEffect(() => {
    const f = () => { setRoute(parseHash(location.hash)); scrollTo(0, 0); };
    addEventListener("hashchange", f);
    return () => removeEventListener("hashchange", f);
  }, []);
  useHotkeys({ f: toggleFullscreen, Escape: () => { if (route.tab === "scene") history.back(); } });
  // scrollbars and native controls (the phone select) follow the light / dark switch
  useEffect(() => { document.documentElement.style.colorScheme = mode; }, [mode]);

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
          <Segmented value={lang} options={["ja", "en"] as const} onChange={setLang} names={{ ja: "JA", en: "EN" }} />
        </div>
      </header>

      {route.tab === "scenes"
        ? <ScenesTab lang={lang} mode={mode} style={style} setStyle={setStyle} />
        : <ComponentsTab id={route.id} lang={lang} mode={mode} style={style} setStyle={setStyle} />}

      <footer className="d-foot">
        <span>telop-ui v{VERSION}</span><span>MIT © tyoukyou23</span>
        <a href="https://github.com/tyoukyou23/telop-ui" target="_blank" rel="noreferrer">GitHub</a>
        <a href="https://www.npmjs.com/package/telop-ui" target="_blank" rel="noreferrer">npm</a>
        <span className="d-flex" />
        <span>{lang === "ja" ? "デモの人名・学校名・数字はすべて架空です。" : "All names and numbers in this demo are fictional."}</span>
      </footer>
    </TelopRoot>
  );
}

type SetStyle = Dispatch<SetStateAction<Style>>;

/** Two color pickers, ready-made pairs, and a warning when the pair would be hard to read. */
function CustomColors({ style, setStyle, lang }: { style: Style; setStyle: SetStyle; lang: Lang }) {
  const u = UI[lang];
  const setColor = (k: "primary" | "accent") => (v: string) => setStyle((prev) => ({ ...prev, custom: { ...prev.custom, [k]: v } }));
  const issues = checkTheme(themeOf(style));
  return (
    <div className="d-custom">
      <div className="d-pickers">
        {(["primary", "accent"] as const).map((k) => (
          <label key={k} className="d-picker-color">
            <input type="color" value={style.custom[k]} onChange={(e) => setColor(k)(e.target.value)} aria-label={k} />
            <span><b>{k}</b><code>{style.custom[k]}</code></span>
          </label>
        ))}
      </div>
      <div className="d-swatches">
        {SWATCHES.map((sw) => (
          <button key={sw.name} type="button" title={sw.name} aria-label={sw.name}
            className={`d-swatch ${sw.primary === style.custom.primary && sw.accent === style.custom.accent ? "is-on" : ""}`}
            onClick={() => setStyle((prev) => ({ ...prev, custom: { primary: sw.primary, accent: sw.accent } }))}>
            <span style={{ background: sw.primary }} /><span style={{ background: sw.accent }} />
          </button>
        ))}
      </div>
      {issues.length > 0
        ? <p className="d-warn">⚠ {u.lowContrast}: {issues.map((i) => `${i.mode} · ${i.what} ${i.ratio}:1`).join(" / ")}</p>
        : <p className="d-ok">✓ {u.contrastOk}</p>}
    </div>
  );
}

function StylePanel({ style, setStyle, lang, horizontal = false }: { style: Style; setStyle: SetStyle; lang: Lang; horizontal?: boolean }) {
  const u = UI[lang];
  // updater form: two quick clicks must not overwrite each other with a stale copy
  const set = <K extends keyof Style>(k: K) => (v: Style[K]) => setStyle((prev) => ({ ...prev, [k]: v }));
  return (
    <div className={`d-style ${horizontal ? "is-row" : ""}`}>
      <div className="d-themebox">
        <Segmented label={u.theme} value={style.theme} options={[...(Object.keys(presets) as Array<keyof typeof presets>), "custom"] as ThemeName[]}
          onChange={set("theme")} def="broadcast" defLabel={u.default} names={{ custom: u.custom }} />
        {style.theme === "custom" && <CustomColors style={style} setStyle={setStyle} lang={lang} />}
      </div>
      <Segmented label={u.shape} value={style.shape} options={["slant", "square", "round"] as const} onChange={set("shape")} names={{ slant: u.slant, square: u.square, round: u.round }} def="slant" defLabel={u.default} />
      <Segmented label={u.motion} value={style.motion} options={["calm", "normal", "snappy"] as const} onChange={set("motion")} names={{ calm: u.calm, normal: u.normal, snappy: u.snappy }} def="normal" defLabel={u.default} />
      <Segmented label={u.density} value={style.density} options={["comfortable", "compact"] as const} onChange={set("density")} names={{ comfortable: u.comfortable, compact: u.compact }} def="comfortable" defLabel={u.default} />
    </div>
  );
}

interface TabProps { lang: Lang; mode: "light" | "dark"; style: Style; setStyle: SetStyle }

function ScenesTab({ lang, mode, style, setStyle }: TabProps) {
  const u = UI[lang];
  const narrow = useNarrow();
  const panel = <StylePanel style={style} setStyle={setStyle} lang={lang} horizontal />;
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
        {narrow ? <details className="d-fold"><summary>{u.style}</summary>{panel}</details> : panel}
      </div>

      <div className="d-scenes">
        {SCENES.map((id) => (
          <article key={id} className="d-card">
            <a className="d-card-screen" href={`#/scene/${id}`} aria-label={`${SCENE_NAMES[lang][id]} — ${u.open}`}>
              <Frame title={SCENE_NAMES[lang][id]} state={{ kind: "scene", id, lang, mode, style }} />
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

function ComponentsTab({ id, lang, mode, style, setStyle }: TabProps & { id: string }) {
  const entry = ENTRIES.find((e) => e.id === id) ?? ENTRIES[0];
  return (
    <div className="d-docs">
      <label className="d-picker">
        <select value={entry.id} onChange={(e) => { location.hash = `#/c/${e.target.value}`; }}>
          {GROUPS.map((g) => (
            <optgroup key={g.id} label={g[lang]}>
              {ENTRIES.filter((e) => e.group === g.id).map((e) => <option key={e.id} value={e.id}>{e.name}{NEW_IDS.has(e.id) ? "  — NEW" : ""}</option>)}
            </optgroup>
          ))}
        </select>
      </label>
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
      <EntryView key={entry.id} entry={entry} lang={lang} mode={mode} style={style} setStyle={setStyle} />
    </div>
  );
}

function EntryView({ entry, lang, mode, style, setStyle }: TabProps & { entry: Entry }) {
  const u = UI[lang];
  const t = T[lang];
  const defaults = defaultsOf(entry);
  const [p, setP] = useState<Props>(defaults);
  const [step, setStep] = useState(0);
  const ctx = { p, step, t, lang, now: Date.now() };
  const group = GROUPS.find((g) => g.id === entry.group);
  const names = entry.name.split(" · ");
  // When the global style differs from the defaults, show the TelopRoot that produces it,
  // so the snippet reproduces exactly what is on screen.
  const rootAttrs = [
    style.theme === "custom" ? ` theme={createTheme("my-theme", { primary: "${style.custom.primary}", accent: "${style.custom.accent}" })}`
      : style.theme !== "broadcast" ? ` theme={presets.${style.theme}}` : "",
    style.shape !== "slant" ? ` shape="${style.shape}"` : "",
    style.motion !== "normal" ? ` motion="${style.motion}"` : "",
    style.density !== "comfortable" ? ` density="${style.density}"` : "",
  ].join("");
  const body = entry.code(ctx);
  const imports = [...(rootAttrs ? ["TelopRoot", ...(style.theme === "custom" ? ["createTheme"] : style.theme !== "broadcast" ? ["presets"] : [])] : []), ...names];
  const code = `import { ${imports.join(", ")} } from "telop-ui";\n\n${
    rootAttrs ? `<TelopRoot${rootAttrs}>\n${body.replace(/^/gm, "  ")}\n</TelopRoot>` : body}`;
  const steps = entry.steps;
  // open exactly this preview (parameters, step, style) on its own page — on a phone, turn it sideways
  const embedHref = `?embed=${encodeURIComponent(JSON.stringify({ kind: "entry", id: entry.id, lang, mode, style, p, step }))}`;

  return (
    <>
      <main className="d-main">
        <div className="d-crumb">{group?.[lang]} / <b>{names[0]}</b></div>
        <h1 className="d-title">{entry.name}{NEW_IDS.has(entry.id) && <span className="d-new is-big">NEW</span>}</h1>
        <p className="d-desc">{entry.desc[lang]}</p>

        <div className="d-stagebox">
          <Frame interactive title={entry.name} state={{ kind: "entry", id: entry.id, lang, mode, style, p, step }} />
          {steps != null && (
            <div className="d-player">
              <button type="button" className="d-btn" onClick={() => setStep(0)} disabled={step === 0} aria-label={u.reset}>⟲<span className="d-wide-only"> {u.reset}</span></button>
              <div className="d-progress" aria-label={`${step} / ${steps}`}>
                {steps <= 12
                  ? Array.from({ length: steps }).map((_, i) => <span key={i} className={i < step ? "is-on" : ""} />)
                  : <b>{step} / {steps}</b>}
              </div>
              <button type="button" className="d-btn is-main" onClick={() => setStep((s) => Math.min(s + 1, steps))} disabled={step >= steps}>{u.next} ▶</button>
              <a className="d-btn" href={embedHref} target="_blank" rel="noreferrer" title={u.fullscreen} aria-label={u.fullscreen}><ExpandIcon /></a>
            </div>
          )}
          {steps == null && (
            <div className="d-player"><span className="d-flex" /><a className="d-btn" href={embedHref} target="_blank" rel="noreferrer" title={u.fullscreen} aria-label={u.fullscreen}><ExpandIcon /> {u.fullscreen}</a></div>
          )}
        </div>

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

      <div className="d-codewrap"><CodeBlock code={code} u={u} /></div>
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

/* custom theme */
.d-themebox { display: flex; flex-direction: column; gap: 10px; }
.d-custom { display: flex; flex-direction: column; gap: 10px; padding: 12px; background: var(--d-line); border-radius: var(--tu-radius); max-width: 420px; }
.d-pickers { display: flex; gap: 10px; flex-wrap: wrap; }
.d-picker-color { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
.d-picker-color input { width: 38px; height: 38px; padding: 0; border: 0; background: none; cursor: pointer; }
.d-picker-color span { display: flex; flex-direction: column; font-size: 11.5px; line-height: 1.3; }
.d-picker-color code { font: 600 12px ui-monospace, Menlo, monospace; }
.d-swatches { display: flex; flex-wrap: wrap; gap: 6px; }
.tu-root .d-swatch { display: inline-flex; width: 40px; height: 24px; overflow: hidden; border-radius: var(--tu-radius); box-shadow: 0 0 0 1px var(--d-line); }
.tu-root .d-swatch span:first-child { flex: 7; }
.tu-root .d-swatch span:last-child { flex: 3; }
.tu-root .d-swatch.is-on { box-shadow: 0 0 0 2px var(--tu-fg); }
.d-warn { margin: 0; font-size: 12px; font-weight: 700; line-height: 1.5; color: var(--tu-accent); }
.d-ok { margin: 0; font-size: 12px; font-weight: 700; line-height: 1.5; color: var(--tu-mute); }

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
.d-docs { display: grid; grid-template-columns: 220px minmax(0, 1fr) 290px; grid-template-areas: "nav main insp" "nav code insp";
  grid-template-rows: auto 1fr; gap: 0 36px; max-width: 1480px; margin: 0 auto; padding: 28px 28px 0; align-items: start; }
.d-nav { grid-area: nav; }
.d-main { grid-area: main; }
.d-inspector { grid-area: insp; }
.d-codewrap { grid-area: code; min-width: 0; }
.d-picker { display: none; }
.d-nav, .d-inspector { scrollbar-width: thin; scrollbar-color: var(--d-line) transparent; }
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
/* the preview: a 16:9 box holding a 1600x900 iframe scaled to fit */
.d-screen { position: relative; width: 100%; aspect-ratio: 16 / 9; overflow: hidden; background: var(--tu-bg); box-shadow: 0 0 0 1px var(--d-line); border-radius: var(--tu-radius); }
.d-screen iframe { position: absolute; left: 0; top: 0; border: 0; transform-origin: 0 0; background: var(--tu-bg); }
.d-screen.is-static iframe { pointer-events: none; }
.d-player { display: flex; align-items: center; gap: 14px; margin-top: 12px; }
.d-player .d-btn { white-space: nowrap; }
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
.d-inspector .d-seg-opts { display: grid; grid-template-columns: repeat(auto-fit, minmax(84px, 1fr)); align-self: stretch; }
.d-inspector .d-seg-opt { text-align: center; }

.d-foot { display: flex; flex-wrap: wrap; gap: 18px; max-width: 1480px; margin: 60px auto 0; padding: 22px 28px 40px; box-shadow: 0 -1px 0 var(--d-line);
  color: var(--tu-mute); font-size: 12.5px; font-weight: 700; }

/* full-screen scene */
.d-float { position: fixed; top: 2.4vh; left: 50%; transform: translateX(-50%); z-index: 60; display: flex; gap: .4vw; transition: opacity .4s; }
.d-float.is-hidden { opacity: 0; pointer-events: none; }

/* narrower windows: the inspector goes under the preview, then the nav goes on top */
@media (max-width: 1180px) {
  .d-docs { grid-template-columns: 200px minmax(0, 1fr); grid-template-areas: "nav main" "nav insp" "nav code"; grid-template-rows: auto auto 1fr; }
  .d-inspector { position: static; max-height: none; margin-top: 22px; }
}

/* phones: one column; nav becomes a select; style folds away; header never wraps */
@media (max-width: 760px) {
  .tu-root { --d-text: 15px; }
  .d-top-in { gap: 6px; padding: 0 12px; height: 52px; }
  .d-brand b { font-size: 16px; }
  .d-ver, .d-link { display: none; }
  .d-tabs { margin-left: 2px; }
  .d-tabs a { padding: 0 9px; }
  .d-top a, .d-top b, .d-top button { white-space: nowrap; }
  .d-wrap { padding: 0 16px; }
  .d-hero { padding: 30px 0 26px; }
  .d-hero-title { font-size: 34px; }
  .d-brand-mark.is-big { width: 32px; height: 32px; margin-right: 12px; }
  .d-hero-lead { font-size: 15px; }
  .d-section-head { margin: 26px 0 14px; align-items: center; }
  .d-scenes { grid-template-columns: 1fr; gap: 18px; }
  .d-card-open { opacity: 1; transform: none; }
  .d-docs { grid-template-columns: minmax(0, 1fr); grid-template-areas: "pick" "main" "insp" "code"; grid-template-rows: none; padding: 16px 16px 0; }
  .d-nav { display: none; }
  .d-picker { display: block; grid-area: pick; margin-bottom: 16px; }
  .d-picker select { width: 100%; padding: 12px 14px; font: 700 16px ui-monospace, Menlo, monospace; color: var(--tu-fg);
    background: var(--tu-panel); border: 0; box-shadow: inset 0 0 0 1px var(--d-line); border-radius: var(--tu-radius); }
  .d-title { font-size: 22px; }
  .d-desc { font-size: 14px; }
  .d-stagebox { padding: 8px; }
  .d-player { gap: 8px; }
  .tu-root .d-btn { padding: 11px 14px; }
  .d-progress span { width: 8px; }
  .d-wide-only { display: none; }
  .d-player .d-btn { white-space: nowrap; padding: 11px 12px; }
  .tu-root .d-seg-opt { padding: 9px 12px; font-size: 13.5px; }
  .d-code pre { font-size: 12px; padding: 12px; }
  .d-foot { margin-top: 40px; padding: 20px 16px 32px; }
}
.d-fold summary { cursor: pointer; font-weight: 800; padding: 9px 14px; list-style: none; box-shadow: inset 0 0 0 1px var(--d-line); border-radius: var(--tu-radius); }
.d-fold summary::-webkit-details-marker { display: none; }
.d-fold summary::after { content: " ▾"; color: var(--tu-mute); }
.d-fold[open] summary::after { content: " ▴"; }
.d-fold[open] { flex-basis: 100%; }
.d-fold[open] .d-style { margin-top: 14px; flex-direction: column; }
`;
