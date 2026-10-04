/** The full-screen example scenes (fictional content). Each loops on its own. */
import { useEffect, useMemo, useState } from "react";
import {
  Stage, StageHeader, LBand, LBandItem, Marquee, Split,
  Telop, Text, HeadlineBox, LowerThird, PersonLowerThird, TitleCard, Typewriter,
  BigNumber, StatBlock, SegBar, Countdown, DigitRoller, SplitFlap,
  RankingList, StackedBar, ChoiceBars, RankingRace,
  TickerStack, SweepBanner, Reveal, CreditsRoll, SlideDeck,
  formatClock, MOTION,
  type TickerItem, type CreditItem,
} from "telop-ui";
import { T, RATES, CREDIT_NAMES, type Lang } from "./content";
import { SpeechScene, SportsScene, RankScene, MekuriScene } from "./segments";

export const LOGO = (
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
            {/* while submissions come in, the numbers sit in the middle of the screen; the ranking pushes them up */}
            <div style={{ marginBlock: phase === "rank" ? undefined : "auto" }}>
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
            </div>
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
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", padding: "8vh 0 6vh" }}>
            <div>
              <Telop size="md" tone="accent" className="tu-wipe">{t.speechKicker}</Telop>
              <div className="tu-t-display" style={{ marginTop: "3vh", maxWidth: "70vw" }}><Typewriter text={t.speechQuote} speed={90} /></div>
            </div>
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
          <Countdown target={target} now={now} variant="ring" total={16} ringSize="min(34vw, 56vh)" />
        </div>
      </Stage>
      {banner && <SweepBanner text={t.countdownTitle} onDone={() => setBanner(false)} />}
    </>
  );
}

export const SCENES = ["quiz", "vote", "mekuri", "speech", "sports", "ranking", "board", "ceremony", "countdown"] as const;
export type SceneId = typeof SCENES[number];
export const SCENE_NAMES: Record<Lang, Record<SceneId, string>> = {
  ja: { quiz: "ライブクイズ", vote: "ライブ投票", mekuri: "めくりフリップ", speech: "スピーチコンテスト（審査員の採点）", sports: "運動会（対抗戦＋速報）", ranking: "第10位からのランキング", board: "発車標", ceremony: "式典スライド", countdown: "カウントダウン" },
  en: { quiz: "Live quiz", vote: "Live vote", mekuri: "Flip board (mekuri)", speech: "Speech contest (judges)", sports: "Sports day (versus + breaking news)", ranking: "Countdown ranking", board: "Departure board", ceremony: "Ceremony slides", countdown: "Countdown" },
};

export function SceneView({ id, t, lang, now }: { id: SceneId; t: typeof T.ja; lang: Lang; now: number }) {
  const clock = formatClock(now);
  if (id === "quiz") return <QuizScene t={t} clock={clock} />;
  if (id === "vote") return <VoteScene t={t} clock={clock} />;
  if (id === "board") return <BoardScene t={t} clock={clock} />;
  if (id === "mekuri") return <MekuriScene t={t} logo={LOGO} clock={clock} />;
  if (id === "speech") return <SpeechScene t={t} logo={LOGO} clock={clock} />;
  if (id === "sports") return <SportsScene t={t} logo={LOGO} clock={clock} />;
  if (id === "ranking") return <RankScene t={t} logo={LOGO} clock={clock} />;
  if (id === "ceremony") return <CeremonyScene t={t} lang={lang} />;
  return <CountdownScene t={t} now={now} />;
}

