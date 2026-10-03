import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// The demo imports "telop-ui" straight from ../src, so it always shows the current source.
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [react()],
  resolve: { alias: { "telop-ui": fileURLToPath(new URL("../src/index.ts", import.meta.url)) } },
  base: "./",
});
