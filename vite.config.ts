import { defineConfig } from "vite";
import { resolve } from "node:path";
import { cpSync } from "node:fs";
cpSync("res", "minecraft/public/res", { recursive: true });
export default defineConfig({
  root: "minecraft",
  base: "/static_cv/",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    assetsDir: "mc-assets",
    rollupOptions: { output: { manualChunks: { three: ["three"] } } },
  },
  server: { fs: { allow: [resolve(".")] } },
});
