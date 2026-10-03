import { useEffect, useState, type ReactNode } from "react";
import {
  Stage, StageHeader, LBand, LBandItem, Telop, Text,
  MekuriBoard, JudgeScores, VersusMeter, ScoreBug, RankReveal, NewsFlash,
} from "telop-ui";
import { T, PLACE_VOTES, JUDGE_SCORES } from "./content";

type Copy = typeof T.ja;

/** Runs `step` every `ms` while mounted (the scenes loop on their own for the demo). */
function useTicker(ms: number, step: () => void) {
  useEffect(() => {
    const id = setInterval(step, ms);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ms]);
}

/** Speech contest: the five judges' scores flip up one by one, then the total counts up. */
export function SpeechScene({ t, logo, clock }: { t: Copy; logo: ReactNode; clock: string }) {
  const [shown, setShown] = useState(0);
  // 5 judges + a long pause on the total, then start over
  useTicker(1300, () => setShown((n) => (n >= 9 ? 0 : n + 1)));
  const judges = t.judges.map((name, i) => ({ key: i, name, score: JUDGE_SCORES[i] }));
  return (
    <Stage header={<StageHeader logo={logo} title={t.speechTitle} subtitle={t.speechSub} clock={clock} />}
      band={<LBand tag="LIVE"><LBandItem style={{ fontWeight: 900 }}>{t.entrant}</LBandItem><LBandItem>{t.entrantName}</LBandItem></LBand>}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, gap: "4vh" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "1.4vw" }}>
          <Telop size="lg" className="tu-wipe">{t.entrant}</Telop>
          <Text variant="title">{t.entrantName}</Text>
          <Text variant="heading" muted>{t.entrantTheme}</Text>
        </div>
        <JudgeScores judges={judges} revealed={Math.min(shown, judges.length)} totalLabel={t.judgeTotal} unit={t.points} />
      </div>
    </Stage>
  );
}

/** Sports day: two teams on one bar, a corner scoreboard, and a breaking-news bar once a loop. */
export function SportsScene({ t, logo, clock }: { t: Copy; logo: ReactNode; clock: string }) {
  const [score, setScore] = useState([120, 105]);
  const [tick, setTick] = useState(0);
  useTicker(1800, () => {
    setTick((n) => (n + 1) % 12);
    setScore(([a, b]) => (Math.random() < 0.5 ? [a + 10, b] : [a, b + 10]));
  });
  useEffect(() => { if (tick === 0) setScore([120, 105]); }, [tick]);
  const left = { label: t.teams[0], value: score[0] };
  const right = { label: t.teams[1], value: score[1] };
  return (
    <>
      <Stage header={<StageHeader logo={logo} title={t.sportsTitle} subtitle={t.sportsSub} clock={clock} />}
        band={<LBand tag="LIVE"><LBandItem style={{ fontWeight: 900 }}>{t.sportsSub}</LBandItem></LBand>}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
          <VersusMeter left={left} right={right} unit={t.points} />
        </div>
        <div style={{ position: "absolute", right: "4.5vw", bottom: "13vh" }}>
          <ScoreBug left={left} right={right} period={t.period} />
        </div>
      </Stage>
      <NewsFlash shown={tick >= 3 && tick < 6} text={t.flashText} />
    </>
  );
}

/** Countdown ranking: from 10th up to 1st; the last three take longer. */
export function RankScene({ t, logo, clock }: { t: Copy; logo: ReactNode; clock: string }) {
  const [shown, setShown] = useState(0);
  const items = t.places.map((p, i) => ({ key: i, label: p, value: `${PLACE_VOTES[i]}${t.votesUnit}` }));
  useEffect(() => {
    const n = items.length;
    // slow down for the podium, hold on the full list, then restart
    const wait = shown >= n ? 5000 : shown >= n - 3 ? 2200 : 900;
    const id = setTimeout(() => setShown((v) => (v >= n ? 0 : v + 1)), wait);
    return () => clearTimeout(id);
  }, [shown, items.length]);
  return (
    <Stage header={<StageHeader logo={logo} title={t.rankTitle} subtitle={t.rankSub} clock={clock} />}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
        <RankReveal items={items} revealed={shown} />
      </div>
    </Stage>
  );
}

/** Flip board: one strip peeled at a time. */
export function MekuriScene({ t, logo, clock }: { t: Copy; logo: ReactNode; clock: string }) {
  const [peeled, setPeeled] = useState(0);
  useTicker(1500, () => setPeeled((n) => (n >= t.mekuri.length + 3 ? 0 : n + 1)));
  const items = t.mekuri.map(([label, q, a], i) => ({
    key: label, label,
    answer: <><span style={{ opacity: 0.6, marginRight: "1em" }}>{q}</span>{a}</>,
    cover: q, hot: i === 0,
  }));
  return (
    <Stage header={<StageHeader logo={logo} title={t.mekuriTitle} subtitle={t.mekuriSub} clock={clock} />}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
        <MekuriBoard items={items} peeled={items.slice(0, peeled).map((x) => x.key)} />
      </div>
    </Stage>
  );
}
