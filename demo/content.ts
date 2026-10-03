/** Demo content — fictional, generic, in two languages. Not real people or organizations. */
export type Lang = "ja" | "en";

export const T = {
  ja: {
    tagline: "日本のテレビ番組風 UI — プロジェクター・掲示・ライブ発表のための React 部品集",
    scenes: "シーン", components: "部品", openFull: "全画面で開く", back: "← 一覧へ",
    lang: "English", theme: "テーマ", dark: "暗い地", light: "明るい地",
    quizTitle: "ライブクイズ", quizSub: "会場 A　3年 1組",
    submitted: "提出", correctRate: "正答率", passRate: "合格率", worst: "正答率ワースト5", explain: "解説",
    questions: [
      "富士山は日本一高い山である", "日本の首都は大阪である", "1年は365日である（うるう年を除く）",
      "太陽は西から昇る", "水は100℃で沸騰する（1気圧）", "パンダは日本固有の動物である", "地球は太陽のまわりを回っている",
    ],
    answerNote: "富士山（3,776m）は日本でいちばん高い山です。",
    voteTitle: "ライブ投票", voteSub: "文化祭　ベスト展示", votes: "票", newVote: "投票",
    candidates: ["写真部", "美術部", "科学部", "茶道部", "軽音楽部", "書道部"],
    boardTitle: "本日の予定", boardRows: [["09:00", "ROOM A", "開会式"], ["10:30", "ROOM B", "基調講演"], ["13:00", "HALL", "パネル討論"], ["15:30", "ROOM C", "閉会"]],
    boardAlt: [["09:30", "ROOM A", "受付開始"], ["11:00", "ROOM D", "ワークショップ"], ["14:00", "HALL", "表彰式"], ["16:00", "LOBBY", "懇親会"]],
    ceremonyKicker: "2026年度", ceremonyTitle: ["修了式"], ceremonyCaption: "サンプル学院　大ホール",
    admitted: "進学が決まった人", composition: "コースの内訳", courses: ["大学", "大学院", "専門学校"],
    credits: "おめでとう", speaker: "見本 太郎", speakerSub: "みほん たろう", speakerRole: "学院長",
    countdownTitle: "まもなく開始", countdownSub: "スタートまで",
    allIn: "全員提出！", demoBadge: "デモ", live: "LIVE", venue: "会場 A", pending: "未提出",
    speechTitle: "スピーチコンテスト", speechSub: "決勝", entrant: "エントリー 3 番", entrantName: "見本 さくら", entrantTheme: "テーマ「私のふるさと」",
    judges: ["見本 一郎", "例 花子", "試験 次郎", "仮名 三奈", "見本 五郎"], judgeTotal: "合計", points: "点",
    sportsTitle: "運動会", sportsSub: "第 3 競技　綱引き", teams: ["青組", "赤組"], period: "第 3 競技 / 全 6 競技",
    flashText: "午後のリレーは雨のため体育館で行います",
    rankTitle: "行ってみたい場所ランキング", rankSub: "全校アンケート", votesUnit: "票",
    places: ["京都", "沖縄", "北海道", "東京", "大阪", "奈良", "広島", "福岡", "長崎", "金沢"],
    mekuriTitle: "今日の答え合わせ", mekuriSub: "日本の一番",
    mekuri: [["Q1", "日本一長い川", "信濃川（367km）"], ["Q2", "日本一高い山", "富士山（3,776m）"], ["Q3", "日本一大きい湖", "琵琶湖"], ["Q4", "日本一人口の多い県", "東京都"], ["Q5", "日本一小さい県", "香川県"]],
    next: "次へ", reset: "最初から", peelAll: "全部めくる",
  },
  en: {
    tagline: "Japanese TV-broadcast style UI — React parts for projectors, signage and live presentations",
    scenes: "Scenes", components: "Components", openFull: "Open fullscreen", back: "← Back",
    lang: "日本語", theme: "Theme", dark: "Dark", light: "Light",
    quizTitle: "Live Quiz", quizSub: "Room A · Class 3-1",
    submitted: "Submitted", correctRate: "Correct", passRate: "Passed", worst: "Hardest 5", explain: "Why",
    questions: [
      "Mt. Fuji is the highest mountain in Japan", "The capital of Japan is Osaka", "A year has 365 days (non-leap)",
      "The sun rises in the west", "Water boils at 100°C (1 atm)", "Pandas are native to Japan", "The Earth orbits the Sun",
    ],
    answerNote: "Mt. Fuji (3,776 m) is Japan's highest peak.",
    voteTitle: "Live Vote", voteSub: "School Festival · Best Exhibit", votes: "", newVote: "Vote",
    candidates: ["Photo Club", "Art Club", "Science Club", "Tea Club", "Music Club", "Calligraphy"],
    boardTitle: "Today", boardRows: [["09:00", "ROOM A", "OPENING"], ["10:30", "ROOM B", "KEYNOTE"], ["13:00", "HALL", "PANEL"], ["15:30", "ROOM C", "CLOSING"]],
    boardAlt: [["09:30", "ROOM A", "CHECK-IN"], ["11:00", "ROOM D", "WORKSHOP"], ["14:00", "HALL", "AWARDS"], ["16:00", "LOBBY", "PARTY"]],
    ceremonyKicker: "Class of 2026", ceremonyTitle: ["Graduation"], ceremonyCaption: "Sample Academy · Main Hall",
    admitted: "Students moving on", composition: "By path", courses: ["University", "Graduate", "Vocational"],
    credits: "Congratulations", speaker: "Taro Sample", speakerSub: "", speakerRole: "Principal",
    countdownTitle: "Starting soon", countdownSub: "Starts in",
    allIn: "Everyone's in!", demoBadge: "DEMO", live: "LIVE", venue: "Room A", pending: "Left",
    speechTitle: "Speech Contest", speechSub: "Final", entrant: "Entry No. 3", entrantName: "Sakura Sample", entrantTheme: "Theme: \"My Hometown\"",
    judges: ["Ichiro S.", "Hanako E.", "Jiro T.", "Mina P.", "Goro S."], judgeTotal: "Total", points: "",
    sportsTitle: "Sports Day", sportsSub: "Event 3 · Tug of War", teams: ["Blue", "Red"], period: "Event 3 of 6",
    flashText: "The afternoon relay moves to the gym because of rain",
    rankTitle: "Places We Want to Visit", rankSub: "School-wide survey", votesUnit: "",
    places: ["Kyoto", "Okinawa", "Hokkaido", "Tokyo", "Osaka", "Nara", "Hiroshima", "Fukuoka", "Nagasaki", "Kanazawa"],
    mekuriTitle: "Answer Check", mekuriSub: "Japan's No. 1",
    mekuri: [["Q1", "Longest river", "Shinano River (367 km)"], ["Q2", "Highest mountain", "Mt. Fuji (3,776 m)"], ["Q3", "Largest lake", "Lake Biwa"], ["Q4", "Most populous", "Tokyo"], ["Q5", "Smallest prefecture", "Kagawa"]],
    next: "Next", reset: "Reset", peelAll: "Peel all",
  },
};

export const PLACE_VOTES = [184, 152, 139, 121, 98, 77, 64, 51, 40, 33];
export const JUDGE_SCORES = [92, 88, 95, 90, 89];

export const RATES = [0.42, 0.55, 0.68, 0.81, 0.9, 0.95, 1];

export const CREDIT_NAMES = {
  ja: [["見本 花子", "みほん はなこ", "サンプル大学"], ["例 一郎", "れい いちろう", "サンプル大学大学院"], ["試験 次郎", "しけん じろう", "サンプル専門学校"],
    ["仮名 三奈", "かめい みな", "サンプル大学"], ["見本 四郎", "みほん しろう", "サンプル工科大学"], ["例 五月", "れい さつき", "サンプル大学"]],
  en: [["Hanako Sample", "", "Sample University"], ["Ichiro Example", "", "Sample Graduate School"], ["Jiro Test", "", "Sample Vocational"],
    ["Mina Placeholder", "", "Sample University"], ["Shiro Sample", "", "Sample Tech"], ["Satsuki Example", "", "Sample University"]],
};
