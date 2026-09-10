import { copyFile, cp, writeFile, readFile, mkdir } from "node:fs/promises";
await copyFile("data.json", "dist/data.json");
await cp("res", "dist/res", { recursive: true });
await writeFile("dist/.nojekyll", "");
// GitHub Pages restores clean deep links through a small redirect shim.
const html = await readFile("dist/minecraft-app.html", "utf8").catch(() => readFile("dist/index.html", "utf8"));
await writeFile("dist/minecraft-app.html", html);
await writeFile("dist/404.html", html);

const routes = [
  "inventory",
  "about",
  "education",
  "research",
  "projects",
  "skills",
  "experience",
  "contact",
  "resume",
  "github",
  "publications",
  "awards",
  "robotics",
  "languages",
  ...[
    "trace-ranking",
    "type-4-clone-detection",
    "d-star",
    "wall-climbing-robot",
    "robotic-gripper",
    "fpga-elevators",
  ].map((s) => "projects/" + s),
  ...Array.from({ length: 2 }, (_, i) => "education/" + i),
  ...Array.from({ length: 4 }, (_, i) => "experience/" + i),
  ...Array.from({ length: 3 }, (_, i) => "publications/" + i),
  "awards/0",
  ...JSON.parse(await readFile("data.json", "utf8")).certificates.map(item => "certificates/" + item.id),
];
for (const route of routes) {
  await mkdir("dist/" + route, { recursive: true });
  await writeFile("dist/" + route + "/index.html", html);
}
await writeFile("dist/routes.json", JSON.stringify(routes));

// The classic CV owns the landing page; Minecraft retains its existing routes.
await copyFile("classic/index.html", "dist/index.html");
