import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  TelopRoot, Stage, StageHeader, ControlBar, CtrlButton, Split, Panel, CardGrid, Card, LBand, LBandItem, Marquee,
  Telop, Text, Tag, Pill, LiveDot, HeadlineBox, LowerThird, PersonLowerThird, TitleCard, BigMessage, Typewriter,
  BigNumber, StatBlock, SegBar, ProgressBar, Countdown, Clock, DigitRoller, SplitFlap,
  RankingList, BarList, StackedBar, ChoiceBars, RankingRace, DrumrollReveal,
  TickerStack, SweepBanner, Reveal, Stagger, CreditsRoll, Spotlight, SlideDeck,
  presets, useStoredMode, useAutoHide, useNow, useHotkeys, formatClock, toggleFullscreen, MOTION,
  type TelopTheme, type TickerItem, type CreditItem,
} from "telop-ui";
import { T, RATES, CREDIT_NAMES, type Lang } from "./content";

const LOGO = (
  <svg viewBox="0 0 136 40" className="tu-logo" aria-label="logo">
    <rect x="0" y="6" width="28" height="28" fill="var(--tu-primary)" transform="skewX(-12)" />
    <rect x="22" y="6" width="8" height="28" fill="var(--tu-accent)" transform="skewX(-12)" />
    <text x="40" y="29" fontSize="22" fontWeight="900" fill="var(--tu-fg)" fontFamily="system-ui">SAMPLE</text>
  </svg>
);

/* ───────────────────────── scenes ───────────────────────── */

/** Live quiz: submissions arrive → hardest questions → explanation with a stamp. Loops. */
function QuizScene({ t, clock }: { t: typeof T.ja; clock: string }) {
  const TOTAL = 24;
  const [submitted, setSubmitted] = useState(0);
  const [phase, setPhase] = useState<"collect" | "rank" | "explain">("collect");
  const [revealed, setRevealed] = useState(false);
  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [banner, setBanner] = useState(false);

  useEffect(() => {
    if (phase !== "collect") return undefined;
    if (submitted >= TOTAL) { setBanner(true); const id = setTimeout(() => setPhase("rank"), 3600); return () => clearTimeout(id); }
    const id = setTimeout(() => {
      const n = Math.min(TOTAL - submitted, 1 + Math.floor(Math.random() * 3));
      setSubmitted((s) => s + n);
      const tid = Date.now();
      setTickers((p) => [...p.slice(-2), { id: tid, label: t.submitted, text: `+${n}` }]);
      setTimeout(() => setTickers((p) => p.filter((x) => x.id !== tid)), MOTION.ticker);
    }, 900 + Math.random() * 900);
    return () => clearTimeout(id);
  }, [phase, submitted, t.submitted]);

  useEffect(() => {
    if (phase === "rank") { const id = setTimeout(() => setPhase("explain"), 6000); return () => clearTimeout(id); }
    if (phase === "explain") {
      const a = setTimeout(() => setRevealed(true), 2600);
      const b = setTimeout(() => { setRevealed(false); setSubmitted(0); setPhase("collect"); }, 9000);
      return () => { clearTimeout(a); clearTimeout(b); };
    }
    return undefined;
  }, [phase]);

  const rate = submitted ? 0.78 : null;
  const ranking = t.questions.slice(0, 5).map((q, i) => ({ key: i, code: `Q${i + 1}`, text: q, value: RATES[i] }));
  return (
    <>
      <Stage
        header={<StageHeader logo={LOGO} title={t.quizTitle} subtitle={t.quizSub} clock={clock} badges={<Telop tone="accent" size="xs">{t.demoBadge}</Telop>} />}
        band={<LBand tag={t.live}><LBandItem style={{ fontWeight: 900 }}>{t.venue}</LBandItem><span className="tu-spacer" /><LBandItem>{t.pending} <b className="tu-big" style={{ fontSize: "1.5em", fontStyle: "normal" }}>{TOTAL - submitted}</b></LBandItem></LBand>}>
        {phase === "explain" ? (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
            <HeadlineBox className="tu-wipe" sub={t === T.ja ? "Mt. Fuji is the highest mountain in Japan" : "富士山は日本一高い山である"}>{t.questions[0]}</HeadlineBox>
            <ChoiceBars resetKey="q1" total={TOTAL} highlightKey="o" revealed={revealed}
              options={[{ key: "o", mark: "○", count: 10 }, { key: "x", mark: "×", count: 14 }]} />
            <Reveal shown={revealed} placeholder={<Text variant="caption" muted>Space</Text>}>
              <LowerThird label={t.explain}><Text variant="heading">{t.answerNote}</Text></LowerThird>
            </Reveal>
          </div>
        ) : (
          <>
            <Split divider ratio="1.4fr 1fr" left={
              <div><Telop size="md" className="tu-wipe">{t.submitted}</Telop>
                <div style={{ marginTop: "2vh", display: "flex", alignItems: "flex-end", gap: "1.2vw" }}>
                  <BigNumber value={submitted} size={phase === "rank" ? "xl" : "hero"} tone="primary" />
                  <span className="tu-big tu-muted" style={{ fontSize: "min(5vw, 8vh)" }}>/ {TOTAL}</span>
                </div></div>
            } right={
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", height: "100%", gap: "3vh" }}>
                <StatBlock layout="row" label={t.correctRate} value={rate == null ? null : Math.round(rate * 100)} unit="%" size={phase === "rank" ? "lg" : "xl"} />
                <StatBlock layout="row" label={t.passRate} value={rate == null ? null : 87} unit="%" size={phase === "rank" ? "lg" : "xl"} delay={100} />
              </div>
            } />
            <div style={{ marginTop: "3.4vh" }}><SegBar total={TOTAL} filled={submitted} tall /></div>
            {phase === "rank" && (
              <div style={{ marginTop: "3vh", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                <Telop tone="accent" size="sm" className="tu-wipe is-start">{t.worst}</Telop>
                <div style={{ marginTop: "1vh", display: "flex", flex: 1, minHeight: 0 }}><RankingList items={ranking} /></div>
              </div>
            )}
          </>
        )}
      </Stage>
      <TickerStack items={tickers} />
      {banner && <SweepBanner text={t.allIn} onDone={() => setBanner(false)} />}
    </>
  );
}

/** Live vote: rows slide to their new rank as votes come in. */
function VoteScene({ t, clock }: { t: typeof T.ja; clock: string }) {
  const [votes, setVotes] = useState(() => t.candidates.map((c, i) => ({ key: i, label: c, value: 20 + i * 3 })));
  const [tickers, setTickers] = useState<TickerItem[]>([]);
  useEffect(() => setVotes(t.candidates.map((c, i) => ({ key: i, label: c, value: 20 + i * 3 }))), [t]);
  useEffect(() => {
    const id = setInterval(() => {
      const k = Math.floor(Math.random() * t.candidates.length);
      const add = 1 + Math.floor(Math.random() * 6);
      setVotes((v) => v.map((x) => (x.key === k ? { ...x, value: x.value + add } : x)));
      const tid = Date.now();
      setTickers((p) => [...p.slice(-2), { id: tid, label: t.newVote, text: `${t.candidates[k]} +${add}` }]);
      setTimeout(() => setTickers((p) => p.filter((x) => x.id !== tid)), MOTION.ticker);
    }, 1300);
    return () => clearInterval(id);
  }, [t]);
  const total = votes.reduce((a, b) => a + b.value, 0);
  return (
    <>
      <Stage header={<StageHeader logo={LOGO} title={t.voteTitle} subtitle={t.voteSub} clock={clock} />}
        band={<LBand tag={t.live}><Marquee seconds={18}>{t.voteSub}　·　{total}{t.votes || " votes"}　·　{t.candidates.join("　/　")}</Marquee></LBand>}>
        <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
          <RankingRace items={votes} unit={t.votes} hotCount={1} rowHeight="min(5.6vw, 9.4vh)" />
        </div>
      </Stage>
      <TickerStack items={tickers} />
    </>
  );
}

/** Departure-board style schedule: every cell flips when the board changes. */
function BoardScene({ t, clock }: { t: typeof T.ja; clock: string }) {
  const [alt, setAlt] = useState(false);
  useEffect(() => { const id = setInterval(() => setAlt((a) => !a), 6000); return () => clearInterval(id); }, []);
  const rows = alt ? t.boardAlt : t.boardRows;
  return (
    <Stage header={<StageHeader logo={LOGO} title={t.boardTitle} clock={clock} />}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, gap: "3.2vh" }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "2.4vw" }}>
            <SplitFlap text={r[0]} length={5} chars="0123456789:" />
            <SplitFlap text={r[1]} length={6} />
            <SplitFlap text={r[2]} length={t === T.ja ? 6 : 10} chars={t === T.ja ? "アイウエオカキクケコサシスセソ" : undefined} />
          </div>
        ))}
      </div>
    </Stage>
  );
}

/** Ceremony slides: title → number reveal → composition → speaker → credits. */
function CeremonyScene({ t, lang }: { t: typeof T.ja; lang: Lang }) {
  const [count, setCount] = useState(0);
  const credits: CreditItem[] = useMemo(() => [
    { key: "s", section: t.credits },
    ...CREDIT_NAMES[lang].map((c, i) => ({ key: i, name: c[0], sub: c[1] || undefined, value: c[2] })),
  ], [lang, t.credits]);
  return (
    <div className="tu-stage is-no-band">
      <SlideDeck auto interval={6500} keyboard={false} onIndexChange={(i) => setCount(i === 1 ? 128 : 0)} slides={[
        { key: "title", node: <TitleCard kicker={t.ceremonyKicker} title={t.ceremonyTitle} caption={t.ceremonyCaption} /> },
        { key: "count", node: (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
            <Telop size="lg" className="tu-wipe is-start">{t.admitted}</Telop>
            <div style={{ marginTop: "4vh" }}><DigitRoller value={count} minDigits={3} size="hero" unit={T[lang] === T.ja ? "名" : ""} /></div>
          </div>) },
        { key: "mix", node: (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
            <Telop size="lg" className="tu-wipe is-start">{t.composition}</Telop>
            <div style={{ marginTop: "5vh" }}><StackedBar parts={[{ key: "u", label: t.courses[0], value: 74 }, { key: "g", label: t.courses[1], value: 31 }, { key: "v", label: t.courses[2], value: 23 }]} highlight="u" /></div>
          </div>) },
        { key: "speaker", node: (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%", paddingBottom: "6vh" }}>
            <PersonLowerThird name={t.speaker} sub={t.speakerSub || undefined} role={t.speakerRole} />
          </div>) },
        { key: "credits", node: <CreditsRoll items={credits} seconds={16} />, seconds: 14 },
      ]} />
    </div>
  );
}

/** "Starting soon" with the last 10 seconds pulsing. Loops. */
function CountdownScene({ t, now }: { t: typeof T.ja; now: number }) {
  const [target, setTarget] = useState(() => Date.now() + 16000);
  const [banner, setBanner] = useState(false);
  useEffect(() => {
    if (now >= target + 2500) { setTarget(Date.now() + 16000); }
    if (Math.ceil((target - now) / 1000) === 0 && !banner) setBanner(true);
  }, [now, target, banner]);
  return (
    <>
      <Stage header={<StageHeader logo={LOGO} title={t.countdownTitle} clock={formatClock(now)} />}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", flex: 1, gap: "3vh" }}>
          <Telop size="lg">{t.countdownSub}</Telop>
          <Countdown target={target} now={now} size="hero" />
        </div>
      </Stage>
      {banner && <SweepBanner text={t.countdownTitle} onDone={() => setBanner(false)} />}
    </>
  );
}

const SCENES = ["quiz", "vote", "board", "ceremony", "countdown"] as const;
type SceneId = typeof SCENES[number];
const SCENE_NAMES: Record<Lang, Record<SceneId, string>> = {
  ja: { quiz: "ライブクイズ", vote: "ライブ投票", board: "発車標", ceremony: "式典スライド", countdown: "カウントダウン" },
  en: { quiz: "Live quiz", vote: "Live vote", board: "Departure board", ceremony: "Ceremony slides", countdown: "Countdown" },
};

function SceneView({ id, t, lang, now }: { id: SceneId; t: typeof T.ja; lang: Lang; now: number }) {
  const clock = formatClock(now);
  if (id === "quiz") return <QuizScene t={t} clock={clock} />;
  if (id === "vote") return <VoteScene t={t} clock={clock} />;
  if (id === "board") return <BoardScene t={t} clock={clock} />;
  if (id === "ceremony") return <CeremonyScene t={t} lang={lang} />;
  return <CountdownScene t={t} now={now} />;
}

/* ───────────────────────── catalog helpers ───────────────────────── */

function MiniScreen({ scale, children }: { scale: number; children: ReactNode }) {
  return (
    <div className="demo-mini" style={{ width: `calc(100vw * ${scale})`, height: `calc(100vh * ${scale})` }}>
      <div className="demo-mini-inner" style={{ transform: `scale(${scale})` }}>{children}</div>
    </div>
  );
}

function Sample({ name, use, code, actions, wide, children }: { name: string; use: string; code?: string; actions?: ReactNode; wide?: boolean; children: ReactNode }) {
  return (
    <section className={`demo-sample ${wide ? "is-wide" : ""}`}>
      <div className="demo-sample-head">
        <div style={{ minWidth: 0, flex: 1 }}><code className="demo-name">{name}</code><div className="demo-use">{use}</div></div>
        {actions && <div style={{ display: "flex", gap: ".4vw", flexShrink: 0 }}>{actions}</div>}
      </div>
      <div style={{ marginTop: "2.2vh" }}>{children}</div>
      {code && <pre className="demo-code">{code}</pre>}
    </section>
  );
}

/* ───────────────────────── app ───────────────────────── */

export function App() {
  const [lang, setLang] = useState<Lang>("ja");
  const [themeName, setThemeName] = useState<keyof typeof presets>("broadcast");
  const [mode, toggleMode] = useStoredMode("telop-ui-demo-mode");
  const [hash, setHash] = useState(() => location.hash);
  const controls = useAutoHide();
  const now = useNow(1000);
  const t = T[lang];
  const theme: TelopTheme = presets[themeName];
  useEffect(() => { const f = () => { setHash(location.hash); scrollTo(0, 0); }; addEventListener("hashchange", f); return () => removeEventListener("hashchange", f); }, []);
  useHotkeys({ f: toggleFullscreen, Escape: () => { location.hash = ""; } });

  // catalog state
  const [num, setNum] = useState(42);
  const [roll, setRoll] = useState(1280);
  const [flap, setFlap] = useState(0);
  const [filled, setFilled] = useState(9);
  const [revealed, setRevealed] = useState(false);
  const [round, setRound] = useState(0);
  const [drum, setDrum] = useState(false);
  const [spot, setSpot] = useState(false);
  const [shown, setShown] = useState(false);
  const [stagger, setStagger] = useState(0);
  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [banner, setBanner] = useState(false);
  const [race, setRace] = useState([{ key: "a", label: "A", value: 12 }, { key: "b", label: "B", value: 9 }, { key: "c", label: "C", value: 7 }, { key: "d", label: "D", value: 4 }]);

  const scene = hash.startsWith("#/scene/") ? (hash.slice(8) as SceneId) : null;
  const root = (children: ReactNode) => (
    <TelopRoot theme={theme} mode={mode} locale={lang} hideCursor={!!scene && !controls}><style>{DEMO_CSS}</style>{children}</TelopRoot>
  );

  if (scene && SCENES.includes(scene)) {
    return root(
      <>
        <SceneView id={scene} t={t} lang={lang} now={now} />
        <div className={`demo-float ${controls ? "" : "is-hidden"}`}>
          <CtrlButton onClick={() => { location.hash = ""; }}>{t.back}</CtrlButton>
          <CtrlButton onClick={toggleFullscreen}>F</CtrlButton>
        </div>
      </>,
    );
  }

  const fireTicker = () => {
    const id = Date.now();
    setTickers((p) => [...p.slice(-2), { id, label: t.newVote, text: "+3" }]);
    setTimeout(() => setTickers((p) => p.filter((x) => x.id !== id)), MOTION.ticker);
  };
  const flapWords = lang === "ja" ? ["ROOM A", "HALL", "LOBBY"] : ["ROOM A", "HALL", "LOBBY"];

  return root(
    <div className="demo-page">
      <header className="tu-header">
        {LOGO}
        <Telop size="lg" className="tu-wipe">telop-ui</Telop>
        <Telop tone="outline" size="md" className="tu-wipe is-trail">React</Telop>
        <span className="tu-spacer" />
        <CtrlButton onClick={() => setLang(lang === "ja" ? "en" : "ja")}>{t.lang}</CtrlButton>
        {(Object.keys(presets) as Array<keyof typeof presets>).map((k) => (
          <CtrlButton key={k} main={k === themeName} onClick={() => setThemeName(k)}>{k}</CtrlButton>
        ))}
        <CtrlButton onClick={toggleMode}>{mode === "dark" ? t.light : t.dark}</CtrlButton>
        <Clock time={formatClock(now)} />
      </header>
      <Text variant="heading" className="demo-lead">{t.tagline}</Text>
      <pre className="demo-code" style={{ marginTop: "2vh" }}>{`npm install telop-ui\n\nimport { TelopRoot, Stage, StageHeader, BigNumber, LBand } from "telop-ui";`}</pre>

      {/* scenes */}
      <div className="demo-section-head"><Telop size="lg" className="tu-wipe">{t.scenes}</Telop></div>
      <div className="demo-grid">
        {SCENES.map((id) => (
          <section key={id} className="demo-sample">
            <div className="demo-sample-head">
              <div style={{ flex: 1 }}><Text variant="heading">{SCENE_NAMES[lang][id]}</Text></div>
              <CtrlButton main onClick={() => { location.hash = `#/scene/${id}`; }}>{t.openFull}</CtrlButton>
            </div>
            <div style={{ marginTop: "2vh" }}>
              <MiniScreen scale={0.4}><TelopRoot theme={theme} mode={mode} locale={lang} paintBody={false}><SceneView id={id} t={t} lang={lang} now={now} /></TelopRoot></MiniScreen>
            </div>
          </section>
        ))}
      </div>

      {/* components */}
      <div className="demo-section-head"><Telop size="lg" className="tu-wipe">{t.components}</Telop></div>
      <div className="demo-grid">
        <Sample name="<Telop tone size>" use="primary · accent · outline / xs–xl" code={`<Telop tone="accent" size="lg">Breaking</Telop>`}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1vw", alignItems: "flex-end" }}>
            <Telop size="lg">Telop</Telop><Telop tone="accent" size="lg">Accent</Telop><Telop tone="outline" size="lg">Outline</Telop>
          </div>
        </Sample>
        <Sample name="<Tag> <Pill> <LiveDot>" use="state · now · live" code={`<Tag>draft</Tag> <Pill>LIVE</Pill> <LiveDot />`}>
          <div style={{ display: "flex", gap: "1vw", alignItems: "center" }}><Tag>draft</Tag><Tag accent>changed</Tag><Pill>LIVE</Pill><LiveDot /><LiveDot off /></div>
        </Sample>
        <Sample name="<BigNumber value unit size tone>" use="counts from the previous value · bumps on landing · null → waiting"
          actions={<CtrlButton onClick={() => setNum(Math.floor(Math.random() * 100))}>↻</CtrlButton>} code={`<BigNumber value={42} unit="%" size="xl" tone="primary" />`}>
          <div style={{ display: "flex", gap: "3vw", alignItems: "flex-end" }}><BigNumber value={num} unit="%" size="xl" tone="primary" /><BigNumber value={null} size="lg" /></div>
        </Sample>
        <Sample name="<DigitRoller value minDigits separator>" use="slot-machine reveal — every digit spins and lands"
          actions={<CtrlButton main onClick={() => setRoll(Math.floor(Math.random() * 9999))}>↻</CtrlButton>} code={`<DigitRoller value={1280} minDigits={4} separator="," />`}>
          <DigitRoller value={roll} minDigits={4} separator="," size="xl" />
        </Sample>
        <Sample name="<SplitFlap text length chars>" use="departure board — each cell shuffles and lands"
          actions={<CtrlButton main onClick={() => setFlap((f) => (f + 1) % 3)}>↻</CtrlButton>} code={`<SplitFlap text="ROOM A" length={6} />`}>
          <SplitFlap text={flapWords[flap]} length={6} />
        </Sample>
        <Sample name="<Countdown target now finalSeconds>" use="the last seconds pulse; a word at zero" code={`<Countdown target={startsAt} now={useNow(1000, skew)} />`}>
          <Countdown target={Date.now() + ((60 - (Math.floor(now / 1000) % 60)) * 1000)} now={now} size="xl" />
        </Sample>
        <Sample name="<StatBlock label value caption layout>" use="labelled metric — stack or row" code={`<StatBlock layout="row" label="Correct" value={86} unit="%" />`}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
            <StatBlock layout="row" label={t.correctRate} value={86} unit="%" size="md" /><StatBlock layout="row" label={t.passRate} value={92} unit="%" size="md" delay={100} />
          </div>
        </Sample>
        <Sample name="<SegBar total filled> · <ProgressBar value>" use="one segment per person · continuous share"
          actions={<CtrlButton onClick={() => setFilled((v) => (v >= 24 ? 0 : v + 3))}>+3</CtrlButton>} code={`<SegBar total={24} filled={18} tall />`}>
          <SegBar total={24} filled={filled} tall /><div style={{ marginTop: "2vh" }}><ProgressBar value={filled / 24} /></div>
        </Sample>
        <Sample wide name="<RankingRace items hotCount unit>" use="rows slide to their new place as values change"
          actions={<CtrlButton main onClick={() => setRace((r) => r.map((x) => ({ ...x, value: x.value + Math.floor(Math.random() * 9) })))}>+</CtrlButton>}
          code={`<RankingRace items={[{ key: "a", label: "A", value: 12 }, …]} hotCount={1} />`}>
          <RankingRace items={race} hotCount={1} />
        </Sample>
        <Sample wide name="<RankingList items hotCount onSelect>" use="top 3 accent (a perfect 1.0 never) · 9+ rows → 2 compact columns"
          code={`<RankingList items={[{ key, code: "Q4", text: "…", value: 0.42 }]} />`}>
          <RankingList items={t.questions.slice(0, 5).map((q, i) => ({ key: i, code: `Q${i + 1}`, text: q, value: RATES[i] }))} />
        </Sample>
        <Sample name="<BarList items highlight unit>" use="label · bar · value" code={`<BarList items={[{ key: "a", label: "A", value: 12 }]} highlight={["a"]} />`}>
          <BarList items={t.candidates.slice(0, 4).map((c, i) => ({ key: i, label: c, value: 40 - i * 8 }))} highlight={[0]} />
        </Sample>
        <Sample name="<StackedBar parts highlight>" use="composition — tints of primary + one accent" code={`<StackedBar parts={[{ key, label, value }]} highlight="u" />`}>
          <StackedBar parts={[{ key: "u", label: t.courses[0], value: 74 }, { key: "g", label: t.courses[1], value: 31 }, { key: "v", label: t.courses[2], value: 23 }]} highlight="u" />
        </Sample>
        <Sample wide name="<HeadlineBox> + <ChoiceBars revealed> + <LowerThird>" use="question · who picked what · stamp on the answer · explanation"
          actions={<><CtrlButton main onClick={() => setRevealed(true)}>✓</CtrlButton><CtrlButton onClick={() => { setRevealed(false); setRound((r) => r + 1); }}>↺</CtrlButton></>}
          code={`<ChoiceBars total={24} highlightKey="o" revealed={revealed} options={[{ key: "o", mark: "○", count: 10 }, …]} />`}>
          <HeadlineBox sub={lang === "ja" ? "Mt. Fuji is the highest mountain in Japan" : "富士山は日本一高い山である"}>{t.questions[0]}</HeadlineBox>
          <div style={{ marginTop: "3vh" }}>
            <ChoiceBars key={round} resetKey={round} total={24} highlightKey="o" revealed={revealed} options={[{ key: "o", mark: "○", count: 10 }, { key: "x", mark: "×", count: 14 }]} />
          </div>
          <div style={{ marginTop: "3vh" }}><LowerThird label={t.explain}><Text variant="heading">{t.answerNote}</Text></LowerThird></div>
        </Sample>
        <Sample wide name="<DrumrollReveal options answer play>" use="quiz-show reveal — races, slows, lands, stamps"
          actions={<CtrlButton main onClick={() => { setDrum(false); setTimeout(() => setDrum(true), 50); }}>▶</CtrlButton>}
          code={`<DrumrollReveal options={[…]} answer="b" play={play} />`}>
          <DrumrollReveal play={drum} answer="b" options={[{ key: "a", label: "2,776m" }, { key: "b", label: "3,776m" }, { key: "c", label: "4,776m" }, { key: "d", label: "5,776m" }]} />
        </Sample>
        <Sample name="<PersonLowerThird name sub role>" use="speaker introduction" code={`<PersonLowerThird name="…" role="Principal" />`}>
          <PersonLowerThird name={t.speaker} sub={t.speakerSub || undefined} role={t.speakerRole} />
        </Sample>
        <Sample name="<Typewriter text>" use="characters appear one by one" actions={<CtrlButton onClick={() => setStagger((s) => s + 1)}>↺</CtrlButton>} code={`<Typewriter text="Welcome" />`}>
          <Text variant="heading"><Typewriter key={stagger} text={t.tagline} speed={45} /></Text>
        </Sample>
        <Sample name="<Reveal> · <Stagger>" use="show later · one after another"
          actions={<><CtrlButton main onClick={() => setShown((v) => !v)}>👁</CtrlButton><CtrlButton onClick={() => setStagger((s) => s + 1)}>↺</CtrlButton></>}
          code={`<Reveal shown={done}>…</Reveal>\n<Stagger step={120}>…</Stagger>`}>
          <Reveal shown={shown} placeholder={<Text muted>—</Text>}><Telop tone="accent" size="lg">{t.allIn}</Telop></Reveal>
          <div key={stagger} style={{ marginTop: "2vh", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "1vh" }}>
            <Stagger step={140}><Telop size="sm">1</Telop><Telop size="sm">2</Telop><Telop size="sm">3</Telop></Stagger>
          </div>
        </Sample>
        <Sample name="<Spotlight on>" use="dim everything else while you point at one thing"
          actions={<CtrlButton main onClick={() => setSpot((v) => !v)}>💡</CtrlButton>} code={`<Spotlight on={focus}><BigNumber … /></Spotlight>`}>
          <Spotlight on={spot} style={{ display: "inline-block", padding: "1vh 1vw" }}><BigNumber value={87} unit="%" size="xl" tone="accent" /></Spotlight>
        </Sample>
        <Sample name="<TickerStack> · <SweepBanner>" use="slide-in captions · full-width banner"
          actions={<><CtrlButton onClick={fireTicker}>→</CtrlButton><CtrlButton main onClick={() => setBanner(true)}>⇢</CtrlButton></>}
          code={`<TickerStack items={items} />\n<SweepBanner text="Everyone's in!" onDone={…} />`}>
          <Text muted variant="caption">↘ / ⟷</Text>
        </Sample>
        <Sample wide name="<Panel> · <Split divider> · <CardGrid> + <Card state>" use="layout building blocks" code={`<CardGrid columns={4}><Card title="A" value="101" state="active" badge={<Pill>LIVE</Pill>} /></CardGrid>`}>
          <Split ratio="1fr 2fr" gap="1vw" left={<Panel title={t.boardTitle}><Text>09:00 — ROOM A</Text></Panel>} right={
            <div style={{ display: "flex", height: "18vh" }}><CardGrid columns={3}>
              <Card title="ROOM A" value="101" meta="09:00" state="done" /><Card title="ROOM B" value="202" meta="10:30" state="active" badge={<Pill>LIVE</Pill>} index={1} /><Card title="HALL" value="1F" meta="13:00" index={2} />
            </CardGrid></div>} />
        </Sample>
        <Sample wide name="<TitleCard> · <BigMessage> · <CreditsRoll>" use="full-screen pieces (shown scaled)" code={`<TitleCard kicker="Class of 2026" title={["Graduation"]} />`}>
          <div style={{ display: "flex", gap: "1.4vw" }}>
            <MiniScreen scale={0.27}><TelopRoot theme={theme} mode={mode} locale={lang} paintBody={false}><div className="tu-stage is-no-band"><TitleCard kicker={t.ceremonyKicker} title={t.ceremonyTitle} caption={t.ceremonyCaption} /></div></TelopRoot></MiniScreen>
            <MiniScreen scale={0.27}><TelopRoot theme={theme} mode={mode} locale={lang} paintBody={false}><div className="tu-stage is-no-band"><BigMessage reason={t.boardTitle}>{t.countdownTitle}</BigMessage></div></TelopRoot></MiniScreen>
            <MiniScreen scale={0.27}><TelopRoot theme={theme} mode={mode} locale={lang} paintBody={false}><div className="tu-stage is-no-band"><CreditsRoll seconds={14} items={[{ key: "s", section: t.credits }, ...CREDIT_NAMES[lang].map((c, i) => ({ key: i, name: c[0], sub: c[1] || undefined, value: c[2] }))]} /></div></TelopRoot></MiniScreen>
          </div>
        </Sample>
      </div>

      <TickerStack items={tickers} />
      {banner && <SweepBanner text={t.allIn} onDone={() => setBanner(false)} />}
      <LBand tag="telop-ui"><LBandItem>MIT</LBandItem><LBandItem>React ≥ 17</LBandItem><span className="tu-spacer" /><Marquee seconds={24}>{t.tagline}</Marquee></LBand>
    </div>,
  );
}

const DEMO_CSS = `
.demo-page { padding: 6vh 4vw 16vh; }
.demo-lead { margin-top: 2.6vh; max-width: 70vw; }
.demo-section-head { margin-top: 7vh; }
.demo-grid { margin-top: 3vh; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2vw; }
.demo-sample { background: var(--tu-panel); box-shadow: inset 0 0 0 2px var(--tu-track); padding: 3vh 2vw; min-width: 0; }
.demo-sample.is-wide { grid-column: span 2; }
.demo-sample-head { display: flex; align-items: flex-start; gap: 1vw; }
.demo-name { font-family: ui-monospace, Menlo, monospace; font-weight: 700; font-size: min(1.05vw, 1.8vh); color: var(--tu-primary); }
.demo-use { margin-top: .6vh; font-weight: 700; font-size: min(.95vw, 1.6vh); color: var(--tu-mute); line-height: 1.6; }
.demo-code { margin: 2.2vh 0 0; padding: 1.4vh 1vw; background: var(--tu-track); font-family: ui-monospace, Menlo, monospace; font-size: min(.85vw, 1.45vh); line-height: 1.6; white-space: pre-wrap; user-select: text; }
.demo-mini { position: relative; overflow: hidden; margin: 0 auto; box-shadow: 0 0 0 2px var(--tu-track), 0 12px 32px rgba(0,0,0,.12); background: var(--tu-bg); }
.demo-mini-inner { position: absolute; left: 0; top: 0; width: 100vw; height: 100vh; transform-origin: 0 0; }
.demo-float { position: fixed; top: 2.4vh; left: 50%; transform: translateX(-50%); z-index: 60; display: flex; gap: .4vw; transition: opacity .4s; }
.demo-float.is-hidden { opacity: 0; pointer-events: none; }
`;
