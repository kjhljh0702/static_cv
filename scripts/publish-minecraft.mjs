import { cp, copyFile, mkdir, readFile } from "node:fs/promises";
await mkdir("mc-assets", { recursive: true });
await cp("dist/mc-assets", "mc-assets", { recursive: true });
// Public URLs use minecraft/; public source assets are retained separately.
await cp("dist/minecraft", "minecraft", { recursive: true });
await copyFile("dist/index.html", "index.html");
await copyFile("dist/404.html", "404.html");

const routes = JSON.parse(await readFile("dist/routes.json", "utf8"));
for (const route of routes) {
  await mkdir(route, { recursive: true });
  await copyFile("dist/" + route + "/index.html", route + "/index.html");
}
