import { defineConfig } from "vite";
import { resolve } from "node:path";
import { cpSync, readFileSync, existsSync } from "node:fs";
for (const name of ["res", "assets", "vendor", "style.css", "metaverse.js", "data.json"]) {
  cpSync(name, "minecraft/public/" + name, { recursive: true });
}
export default defineConfig({
  root: "minecraft",
  plugins: [{
    name: "classic-cv-landing",
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split("?")[0] ?? "";
        if (!pathname.startsWith("/static_cv/") || pathname === "/static_cv/" || /\.[^/]+$/.test(pathname)) return next();
        const relative = pathname.slice("/static_cv/".length).replace(/\/$/, "");
        const target = resolve("dist", relative, "index.html");
        if (!target.startsWith(resolve("dist") + "/")) return next();
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(readFileSync(existsSync(target) ? target : "dist/404.html", "utf8"));
      });
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split("?")[0];
        if (!["/", "/static_cv/", "/static_cv/index.html"].includes(path ?? "")) return next();
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(readFileSync("classic/index.html", "utf8"));
      });
    },
  }],
  base: "/static_cv/",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    assetsDir: "mc-assets",
    rollupOptions: { output: { manualChunks: { three: ["three"] } } },
  },
  server: { fs: { allow: [resolve(".")] } },
});
