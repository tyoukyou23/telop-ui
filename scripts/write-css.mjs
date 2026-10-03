// dist/styles.css を書き出す（自動注入を使わず、自分で CSS を読み込みたい人向け）。
// CSS の真値源は src/styles.ts の String.raw のテンプレート 1 つ。
import { readFileSync, writeFileSync } from "node:fs";
const src = readFileSync(new URL("../src/styles.ts", import.meta.url), "utf8");
const start = src.indexOf("String.raw`") + "String.raw`".length;
const end = src.lastIndexOf("`");
writeFileSync(new URL("../dist/styles.css", import.meta.url), src.slice(start, end).trim() + "\n");
console.log("wrote dist/styles.css");
