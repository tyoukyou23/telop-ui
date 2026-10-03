# telop-ui

**日本のテレビ番組風 UI を React で** — 会場の前に映す画面のための部品集です。
プロジェクター投影・ロビーの掲示・ライブクイズや投票・式典・カウントダウンに。

**[▶ オンラインのデモ](https://tyoukyou23.github.io/telop-ui/)** · [English](./README.md)

- **テロップと名前スーパー**: 斜めの箱、登壇者の名前カード、見出しの箱
- **数字の演出**: カウントアップ、スロットのように回って止まる数字、パタパタ（発車標）、カウントダウン
- **ライブの図表**: 値が変わると行が新しい順位へ滑るランキング、正解に判子が押される選択肢の棒、ドラムロールで正解を明かす演出
- **番組の効果**: ワイプ、横切る帯、右から入るテロップ、エンドロール、スポットライト、スライド間のアイキャッチ
- **投影向け**: 大きさは `min(vw, vh)` で画面に追従、2 色＋墨、暗い会場用のダークモード、マウスを動かすまで隠れる操作ボタン

CSS フレームワーク不要。React 17 以上、TypeScript の型付き、実行時の依存なし。

## インストール

```sh
npm install telop-ui
```

## 使い方

```tsx
import { TelopRoot, Stage, StageHeader, LBand, LBandItem, Telop, BigNumber, SegBar } from "telop-ui";

export function Submissions({ done, total }: { done: number; total: number }) {
  return (
    <TelopRoot locale="ja">
      <Stage
        header={<StageHeader logo="/logo.svg" title="ライブクイズ" subtitle="会場 A" />}
        band={<LBand tag="LIVE"><LBandItem>会場 A</LBandItem></LBand>}
      >
        <Telop className="tu-wipe">提出</Telop>
        <BigNumber value={done} size="hero" tone="primary" />
        <SegBar total={total} filled={done} tall />
      </Stage>
    </TelopRoot>
  );
}
```

`TelopRoot` がスタイルシートを 1 回だけ差し込みます。静的な CSS ファイルを使いたい場合は
`injectStyles={false}` にして `import "telop-ui/styles.css"` してください。

## テーマ

既定は 3 つ: `broadcast`（紺＋赤）・`variety`（墨＋橙）・`ceremony`（緑＋金）。
ブランドの 2 色から自分のテーマも作れます。

```tsx
import { createTheme, TelopRoot } from "telop-ui";

const school = createTheme("school", { primary: "#25408e", accent: "#d2232a" }, { primary: "#8ea6ec", accent: "#ff5157" });

<TelopRoot theme={school} mode="dark">…</TelopRoot>
```

色はすべて CSS 変数（`--tu-bg` `--tu-fg` `--tu-primary` `--tu-accent` `--tu-panel` `--tu-mute` `--tu-track` …）なので、
普通の CSS で上書きすることもできます。

**`accent` は控えめに。** 見てほしい 1 点（いちばん難しかった問題・1 位・残り 10 秒）のための色です。
全部が赤なら、どれも目立ちません。

## 全体の見た目: 形・動き・密度

`TelopRoot` の 3 つのスイッチで、すべての部品がまとめて変わります。

```tsx
<TelopRoot shape="round" motion="calm" density="compact">…</TelopRoot>
```

| プロパティ | 値 | 変わるもの |
|---|---|---|
| `shape` | `slant`（既定）・`square`・`round` | すべての箱: 斜めのテロップ／四角／角丸 |
| `motion` | `calm`・`normal`（既定）・`snappy` | すべての動き（×1.6／×1／×0.6）。動きを待つタイマーも一緒に伸び縮みします |
| `density` | `comfortable`（既定）・`compact` | 一覧やパネルの余白 |

中身は CSS 変数（`--tu-skew`・`--tu-radius`・`--tu-speed`・`--tu-density`）なので、CSS で細かく調整することもできます。

## ライブのデータ

```tsx
import { usePolling, useNow, StatusScreen, Countdown } from "telop-ui";

const { data, error, stale, skew, refresh } = usePolling(() => fetch("/api/live").then((r) => r.json()), {
  interval: 4000,
  serverTimeOf: (d) => d.serverTime, // プロジェクター PC の時計のずれを補正
});
const now = useNow(1000, skew);

if (!data) return <StatusScreen message={error} onRetry={refresh} />;
```

画面にデータが出た後で取り直しに失敗しても、前のデータを出したまま `stale` が立つだけです。
観客の前でプロジェクターの画面が真っ白にならないようにするためです。

## 部品の一覧

| 分類 | 部品 |
|---|---|
| 土台・hook | `TelopRoot` `useTelop` `useMessages` · `usePolling` `useNow` `useCountUp` `useAutoHide` `useHotkeys` `useStoredMode` · `formatClock` `formatCountdown` `toggleFullscreen` |
| レイアウト | `Stage` `StageHeader` `ControlBar` `CtrlButton` `Split` `Panel` `CardGrid` `Card` `LBand` `LBandItem` `Marquee` `StatusScreen` |
| 文字 | `Telop` `Text` `Tag` `Pill` `LiveDot` `HeadlineBox` `LowerThird` `PersonLowerThird` `TitleCard` `BigMessage` `Typewriter` |
| 数字 | `BigNumber` `StatBlock` `SegBar` `ProgressBar` `Countdown` `Clock` `DigitRoller` `SplitFlap` |
| 図表 | `RankingList` `RankingRow` `RankingRace` `BarList` `StackedBar` `ChoiceBars` `Stamp` `DrumrollReveal` |
| 効果 | `TickerStack` `SweepBanner` `Reveal` `Stagger` `CreditsRoll` `Spotlight` |
| 番組のコーナー | `MekuriBoard` `JudgeScores` `VersusMeter` `ScoreBug` `RankReveal` `NewsFlash` |
| スライド | `SlideDeck`（幕・フェード・スライドの切り替え・自動送り・← → / Space） |

### 番組のコーナー

日本のテレビ番組の決まった形を部品にしたもの。どれも呼ぶ側が進めます（いつ出すかは司会者が決める）。

| 部品 | 何か | 形 |
|---|---|---|
| `MekuriBoard` | ワイドショーのめくりフリップ。紙を 1 枚ずつはがして答えを見せる | `peel`: right・up・flip ／ `columns` |
| `JudgeScores` | 審査員の採点（M-1 風）。1 人ずつ点が出て、合計が数え上がる | `reveal`: flip・rise・count ／ `columns`・`hideTotal` |
| `VersusMeter` | 対抗戦（紅白・運動会）。リードしている側へ境目が動く | `variant`: bar・split |
| `ScoreBug` | スポーツ中継の隅のスコア表示 | `variant`: stack・inline |
| `RankReveal` | 第10位からのランキング発表 | `layout`: list・podium |
| `NewsFlash` | 画面の端から出るニュース速報 | `position`: top・bottom ／ `tone`: flash・alert |

ほかの部品にも形があります（`Telop variant="underline"`・`ProgressBar variant="ring"`・
`Countdown variant="ring"`・`SegBar variant="dots"`・`TitleCard align="center"`・`SlideDeck transition="fade"` など）。
デモにすべてのパラメータと既定値が載っています。

補助クラス: `tu-wipe`（ワイプで出る）・`tu-wipe is-start` / `is-trail`（時間差）・`tu-muted`・`tu-spacer`。

組み込みの文言は `ja`（既定）・`en`・`zh`。`messages` でどれでも上書きできます。

## デモ

**オンライン: https://tyoukyou23.github.io/telop-ui/** — 場面を開いて **F** で全画面。

手元で動かす場合:

```sh
git clone https://github.com/tyoukyou23/telop-ui && cd telop-ui
npm install
npm run dev
```

完成した 5 つの場面（ライブクイズ・ライブ投票・発車標・式典スライド・カウントダウン）と、
全部品をコード例つきで並べています。上部で言語・テーマ・明暗を切り替えられます。
場面を開いて **F** で全画面。

## 設計の約束

- **一覧のすべての行は 0.7 秒以内に出揃う。** 時間差の登場は 1 回目は気持ちよく、10 回目は遅いだけです。
- **光彩もグラデーションも使わない。** ベタの色面と斜めの箱が、会場の後ろの席から読めます。
- **テーマの切り替えは一瞬で。** 背景をトランジションさせると、半秒だけ明るい地に暗い箱が浮きます。
- **`prefers-reduced-motion`** では、終わらないループ（マーキー・エンドロール）を遅くし、大きな動きを止めます。
- **人を観客の前で順位付けしない。** ランキングの部品は、問題・選択肢・チームのためのものです。

## ライセンス

MIT © tyoukyou23
