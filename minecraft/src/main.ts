import "./style.css";
import { CherryWorld } from "./systems/world";
import {
  BASE,
  cv,
  t,
  ui,
  language,
  setLanguage,
  navItems,
  projectItems,
  contactItems,
  period,
  type Item,
} from "./data";
import { el, button, safeLink } from "./components/dom";
import { grid, slot, sprite } from "./components/inventory";
import { TooltipManager } from "./components/tooltip";
import { PlayerPreview } from "./components/player";
import { book } from "./components/book";
import { recordFor } from "./records";
import { SoundManager } from "./systems/sound";
import { Router } from "./systems/router";
const app = document.querySelector<HTMLDivElement>("#app")!,
  tip = new TooltipManager(),
  sound = new SoundManager(),
  router = new Router();
const cherryWorld = new CherryWorld();
const visited = new Set<string>();
let player: PlayerPreview;
let toastTimer = 0;
let initial = true;
let konami = 0;
let rare = false;
const shell = el("div", "game-shell"),
  identity = el("header", "identity"),
  stage = el("main", "screen-stage"),
  hud = el("footer", "hud"),
  toolbar = el("div", "toolbar");
app.append(shell);
shell.append(identity, stage, hud, toolbar);
const preview = el("div", "player-preview");
preview.tabIndex = 0;
preview.setAttribute(
  "aria-label",
  "Player preview. Move the pointer to look around.",
);
function scale() {
  const s = Math.max(
    1,
    Math.min(
      4,
      Math.floor((innerWidth - (innerWidth <= 600 ? 24 : 2)) / (innerWidth <= 600 ? 176 : 250)),
      Math.floor((innerHeight - 32) / 310),
    ),
  );
  document.documentElement.style.setProperty("--gui-scale", String(s));
  document.documentElement.dataset.scale = String(s);
}
scale();
addEventListener("resize", () => {
  scale();
  tip.hide();
});
function toast(title: string, description: string, icon = "book") {
  const root = document.querySelector<HTMLDivElement>("#advancement")!;
  clearTimeout(toastTimer);
  root.replaceChildren(sprite({ sprite: icon }), el("div", "toast-copy"));
  root.lastElementChild!.append(
    el("div", "gold", title),
    el("div", "", description),
  );
  root.hidden = false;
  sound.play("advance");
  toastTimer = window.setTimeout(() => (root.hidden = true), 3400);
}
function activate(item: Item) {
  sound.play(item.route ? "open" : "click");
  if (item.route) router.go(item.route);
  else if (item.href) {
    const link = el("a");
    link.href = safeLink(item.href);
    if (item.download) link.download = "Jeonghun-Lee-CV.pdf";
    else if (item.href.startsWith("http")) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    document.body.append(link);
    link.click();
    link.remove();
  }
}
function close() {
  sound.play("close");
  const parts = router.path.split("/").filter(Boolean);
  router.go(parts.length > 1 ? "/" + parts[0] : "/inventory");
}
function windowPanel(title: string, className = "") {
  const panel = el("section", `mc-window ${className}`);
  const heading = el("div", "container-heading");
  heading.append(el("h2", "container-title", title));
  const x = button("×", close, "close-button");
  x.setAttribute("aria-label", ui("Close container", "컨테이너 닫기"));
  heading.append(x);
  panel.append(heading);
  return panel;
}
function inventory() {
  const panel = el("section", "mc-window survival");
  panel.setAttribute(
    "aria-label",
    ui("Survival inventory", "서바이벌 인벤토리"),
  );
  panel.append(el("h2", "sr-only", ui("Inventory", "인벤토리")));
  const armor = el("div", "armor-slots");
  ["helmet", "armor", "leggings", "boots"].forEach((name) => {
    const cell = el("div", "equipment-cell");
    cell.append(sprite({ sprite: name }));
    armor.append(cell);
  });
  panel.append(armor, preview);
  panel.append(el("span", "survival-label", ui("Crafting", "제작")));
  const output = slot(navItems()[8], tip, activate);
  output.classList.add("resume-output");
  panel.append(output);
  const contents: (Item | undefined)[] = Array(27).fill(undefined);
  contents[0] = {
    id: "award-0", name: t(cv.awards[0].title), sprite: "nether-star",
    category: t(cv.awards[0].venue), route: "/awards/0", rarity: "gold",
  };
  if (rare) contents[26] = {
    id: "rare", name: ui("Debugging Diamond", "디버깅 다이아몬드"),
    sprite: "diamond", category: ui("Curiosity rewarded", "호기심의 보상"),
    route: "/about", enchanted: true,
  };
  const belongings = grid(contents, 27, tip, activate);
  belongings.classList.add("belongings");
  panel.append(belongings);
  return panel;
}
function chest(title: string, items: Item[], large = false) {
  const panel = windowPanel(title, "chest-window" + (large ? " large-chest" : ""));
  panel.append(grid(items, 54, tip, activate));
  panel.append(
    el("div", "gui-label inventory-label", ui("Inventory", "인벤토리")),
    grid([], 27, tip, activate),
  );
  const hotbar = grid([], 9, tip, activate);
  hotbar.classList.add("chest-hotbar");
  panel.append(hotbar);
  return panel;
}
function skills() {
  const panel = windowPanel(ui("Crafting", "제작"), "crafting-window");
  const selected = Math.max(
    0,
    Math.min(
      3,
      Number(new URLSearchParams(location.search).get("recipe")) || 0,
    ),
  );
  const category = cv.skills[selected];
  const recipes = el("div", "recipe-tabs");
  cv.skills.forEach((s, i) => {
    const b = button(
      String(i + 1),
      () => router.go(`/skills?recipe=${i}`),
      "pixel-button recipe-tab",
    );
    b.setAttribute("aria-label", t(s.category));
    b.setAttribute("aria-pressed", String(i === selected));
    recipes.append(b);
  });
  panel.append(recipes);
  const inputs = category.items.map((s, i) => ({
    id: `skill-${i}`,
    name: t(s),
    sprite: [
      "blaze",
      "amethyst",
      "eye",
      "quartz",
      "pearl",
      "comparator",
      "bottle",
    ][i % 7],
    category: t(category.category),
    route: `/skills?recipe=${selected}`,
  }));
  const row = el("div", "crafting-recipe");
  row.append(
    grid(
      inputs,
      9,
      tip,
      (item) => toast(t(category.category), item.name, item.sprite),
      3,
    ),
    el("span", "craft-arrow", "➜"),
    slot(
      {
        id: "result",
        name: t(category.category),
        sprite: ["enchanted-book", "repeater", "ingot", "feather"][selected],
        category: ui("Skills recorded in this CV", "CV에 기록된 기술"),
        enchanted: selected === 0,
      },
      tip,
      () =>
        toast(
          ui("Recipe unlocked!", "제작법 잠금 해제!"),
          t(category.category),
          "comparator",
        ),
    ),
  );
  panel.append(
    row,
    el("h3", "recipe-title", t(category.category)),
    el(
      "p",
      "recipe-caption",
      ui(
        "Select a recipe. Inspect each ingredient.",
        "제작법을 고르고 각 재료를 확인하세요.",
      ),
    ),
  );
  panel.append(
    el("div", "gui-label inventory-label", ui("Inventory", "인벤토리")),
    grid([], 9, tip, activate),
  );
  return panel;
}
function render() {
  tip.hide();
  document.documentElement.lang = language;
  identity.replaceChildren(
    el("h1", "nametag", t(cv.profile.name)),
    el("p", "identity-role", t(cv.profile.roles[0])),
    el("p", "identity-lab", t(cv.profile.affiliation.organization)),
    el("p", "identity-focus", t(cv.profile.headline)),
  );
  toolbar.replaceChildren();
  const home = button(ui("Inventory [E]", "인벤토리 [E]"), () =>
    router.go("/inventory"),
  );
  home.classList.add("inventory-shortcut");
  const audio = button(
    ui("Sound: ", "소리: ") +
      (sound.enabled ? ui("ON", "켜짐") : ui("OFF", "꺼짐")),
    () => {
      sound.toggle();
      render();
    },
  );
  audio.setAttribute("aria-pressed", String(sound.enabled));
  const lang = button(language === "en" ? "한국어" : "English", () => {
    setLanguage();
    render();
  });
  const classic = el("a", "pixel-button", ui("Classic CV", "기본 CV"));
  classic.href = BASE;
  const world = el("a", "pixel-button", "3D");
  world.href = BASE + "?view=3d";
  toolbar.append(
    classic,
    world,
    home,
    audio,
    lang,
    button(ui("Commands [/]", "명령어 [/]"), () => openCommands(), "pixel-button command-shortcut"),
  );
  toolbar.append(cherryWorld.controls());
  const path = router.path,
    group = path.split("/")[1];
  stage.replaceChildren();
  let panel: HTMLElement | null = null;
  const record = recordFor(path);
  if (record) {
    const page = Number(new URLSearchParams(location.search).get("page")) || 0;
    panel = book(
      record,
      page,
      (p) => {
        sound.play("page");
        router.go(`${path}?page=${p}`);
      },
      close,
    );
  } else if (path === "/inventory") panel = inventory();
  else if (path === "/projects" || path === "/research" || path === "/robotics")
    panel = chest(
      path === "/projects"
        ? ui("Large Chest — Projects", "큰 상자 — 프로젝트")
        : path === "/research"
          ? ui("Research Chest", "연구 상자")
          : ui("Robotics Chest", "로보틱스 상자"),
      projectItems(group === "projects" ? undefined : group),
      path === "/projects",
    );
  else if (path === "/education")
    panel = chest(
      ui("Education Chest", "학력 상자"),
      cv.education.map((p, i) => ({
        id: `edu-${i}`,
        name: t(p.degree),
        sprite: ["enchanted-book", "book"][i],
        category: t(p.school),
        lines: [period(p), t(p.department)],
        enchanted: i === 0,
        route: `/education/${i}`,
        rarity: "purple",
      })),
    );
  else if (path === "/experience")
    panel = chest(
      ui("Experience Chest", "경력 상자"),
      cv.experience.map((p, i) => ({
        id: `exp-${i}`,
        name: t(p.title),
        sprite: ["diamond-pickaxe", "feather", "axe", "gold-pickaxe"][i],
        category: t(p.organization),
        lines: [period(p)],
        route: `/experience/${i}`,
      })),
    );
  else if (path === "/publications")
    panel = chest(
      ui("Written Books", "작성된 책"),
      cv.publications.map((p, i) => ({
        id: `pub-${i}`,
        name: t(p.title),
        sprite: ["written-book", "map", "writable-book"][i],
        category: t(p.type),
        lines: [p.year, t(p.venue)],
        route: `/publications/${i}`,
        enchanted: !!p.award,
        rarity: "aqua",
      })),
    );
  else if (path === "/awards")
    panel = chest(
      ui("Treasure Chest", "보물 상자"),
      cv.awards.map((p, i) => ({
        id: `award-${i}`,
        name: t(p.title),
        sprite: "diamond",
        category: t(p.venue),
        lines: [t(p.date)],
        enchanted: true,
        rarity: "gold",
        route: `/awards/${i}`,
      })),
    );
  else if (path === "/skills") panel = skills();
  else if (path === "/contact")
    panel = chest(ui("Contact", "연락처"), contactItems());
  else if (path === "/resume") {
    panel = chest(ui("Download CV", "CV 다운로드"), [navItems()[8]]);
  } else if (path === "/github") {
    panel = chest(
      "GitHub",
      contactItems().filter((i) => i.id === "github"),
    );
  } else {
    panel = windowPanel(ui("Disconnected", "연결 끊김"), "error-window");
    panel.append(
      el(
        "p",
        "",
        ui("Unknown inventory location.", "알 수 없는 인벤토리 위치입니다."),
      ),
      button(ui("Back to Inventory", "인벤토리로 돌아가기"), () =>
        router.go("/inventory"),
      ),
    );
  }
  const layout = el("div", "inventory-layout");
  const navigation = el("nav", "section-sidebar");
  navigation.setAttribute("aria-label", ui("CV sections", "CV 섹션"));
  navItems().slice(0, 8).forEach((item, i) => {
    const tab = button("", () => activate(item), "pixel-button section-tab");
    tab.dataset.section = item.id;
    tab.setAttribute("aria-label", `${i + 1}. ${item.name}`);
    tab.title = `${i + 1}. ${item.name}`;
    tab.append(el("span", "section-number", String(i + 1)), el("span", "section-name", item.name));
    const active = item.id === group || (item.id === "projects" && ["research", "robotics"].includes(group));
    if (active) tab.setAttribute("aria-current", "page");
    navigation.append(tab);
  });
  navigation.addEventListener("keydown", (e) => {
    if (!["ArrowDown", "ArrowUp"].includes(e.key)) return;
    e.preventDefault();
    const tabs = [...navigation.querySelectorAll<HTMLButtonElement>("button")];
    const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
    tabs[(index + (e.key === "ArrowDown" ? 1 : 7)) % 8].focus();
  });
  layout.append(navigation, panel);
  stage.append(layout);
  const mainRoutes = navItems()
    .slice(0, 8)
    .map((i) => i.id);
  if (mainRoutes.includes(group)) visited.add(group);
  hud.replaceChildren();
  const xp = el("div", "experience-meter");
  xp.setAttribute("role", "progressbar");
  xp.setAttribute("aria-label", ui("Sections explored", "살펴본 섹션"));
  xp.setAttribute("aria-valuemin", "0");
  xp.setAttribute("aria-valuemax", "8");
  xp.setAttribute("aria-valuenow", String(visited.size));
  xp.append(el("span", "xp-level", String(visited.size)));
  const bar = el("div", "xp-track"),
    fill = el("i", "xp-fill");
  fill.style.width = `${(visited.size / 8) * 100}%`;
  bar.append(fill);
  xp.append(bar);
  hud.append(xp);
  hud.append(
    el(
      "p",
      "controls-hint",
      ui(
        `${visited.size}/8 explored · 1–9 select · E inventory · Esc close`,
        `${visited.size}/8 탐색 · 1–9 선택 · E 인벤토리 · Esc 닫기`,
      ),
    ),
  );
  document.title = `${record?.title ?? navItems().find((i) => i.id === group)?.name ?? ui("Inventory CV", "인벤토리 CV")} — Jeonghun Lee`;
  if (!initial) {
    const focus = stage.querySelector<HTMLElement>("h2");
    if (focus) {
      focus.tabIndex = -1;
      focus.focus({ preventScroll: true });
    }
  }
  if (group === "research" && !sessionStorage.getItem("research-advancement")) {
    sessionStorage.setItem("research-advancement", "1");
    toast(
      ui("Advancement Made!", "발전 과제 달성!"),
      ui("Researcher", "연구자"),
      "spyglass",
    );
  }
  if (visited.size === 8 && !sessionStorage.getItem("fully-explored")) {
    sessionStorage.setItem("fully-explored", "1");
    toast(
      ui("Challenge Complete!", "도전 완료!"),
      ui("Fully Explored", "탐색 완료"),
      "diamond",
    );
  }
  initial = false;
}
const commandList = [
  "/about",
  "/education",
  "/research",
  "/projects",
  "/skills",
  "/experience",
  "/contact",
  "/github",
  "/resume",
  "/publications",
  "/awards",
  "/help",
];
function openCommands() {
  tip.hide();
  const root = document.querySelector<HTMLDivElement>("#command-root")!;
  if (root.childElementCount) return;
  const overlay = el("section", "command-overlay");
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", ui("Commands", "명령어"));
  const log = el(
    "div",
    "command-log",
    ui(
      "Type a command. Tab completes. Enter opens.",
      "명령어 입력 · Tab 자동완성 · Enter 실행",
    ),
  );
  const input = el("input", "command-input");
  input.type = "text";
  input.value = "/";
  input.setAttribute("aria-label", ui("Command", "명령어"));
  input.autocomplete = "off";
  input.spellcheck = false;
  const list = el("div", "command-suggestions");
  const update = () => {
    list.replaceChildren();
    commandList
      .filter((c) => c.startsWith(input.value))
      .forEach((c) => list.append(button(c, () => run(c), "command-option")));
  };
  const dismiss = () => {
    root.replaceChildren();
    toolbar.querySelector<HTMLButtonElement>("button:last-child")?.focus();
  };
  const run = (value: string) => {
    if (value === "/help") {
      log.textContent = commandList.join(" · ");
      return;
    }
    if (!commandList.includes(value)) {
      log.textContent = ui(
        "Unknown command. Try /help.",
        "알 수 없는 명령어입니다. /help를 입력하세요.",
      );
      return;
    }
    dismiss();
    router.go(value);
  };
  input.addEventListener("input", update);
  overlay.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      dismiss();
    }
    if (e.key === "Enter" && e.target === input) {
      e.preventDefault();
      run(input.value.trim());
    }
    if (e.key === "Tab" && e.target === input && !e.shiftKey) {
      e.preventDefault();
      input.value =
        commandList.find((c) => c.startsWith(input.value)) ?? input.value;
      update();
    } else if (e.key === "Tab") {
      const buttons = [
        ...overlay.querySelectorAll<HTMLElement>("input,button"),
      ];
      const at = buttons.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && at === 0) {
        e.preventDefault();
        buttons.at(-1)?.focus();
      } else if (!e.shiftKey && at === buttons.length - 1) {
        e.preventDefault();
        input.focus();
      }
    }
  });
  overlay.append(log, list, input, button(ui("Close", "닫기"), dismiss));
  root.append(overlay);
  update();
  input.focus();
}
addEventListener("keydown", (e) => {
  if (
    (e.target as HTMLElement).matches("input,textarea") ||
    document.querySelector("#command-root")!.childElementCount
  )
    return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const sequence = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  konami =
    e.key === sequence[konami] ? konami + 1 : e.key === sequence[0] ? 1 : 0;
  if (konami === sequence.length) {
    konami = 0;
    rare = true;
    toast(
      ui("Secret Found!", "비밀 발견!"),
      ui("Debugging Diamond", "디버깅 다이아몬드"),
      "diamond",
    );
    render();
  }
  if (/^[1-9]$/.test(e.key)) {
    e.preventDefault();
    activate(navItems()[Number(e.key) - 1]);
  } else if (e.key.toLowerCase() === "e") {
    e.preventDefault();
    router.go("/inventory");
  } else if (e.key === "Escape") {
    e.preventDefault();
    close();
  } else if (e.key === "/" || e.key.toLowerCase() === "t") {
    e.preventDefault();
    openCommands();
  } else if (e.key === "F1") {
    e.preventDefault();
    document.body.classList.toggle("hide-hints");
  } else if (e.key.toLowerCase() === "f")
    toast(
      ui("Advancement Made!", "발전 과제 달성!"),
      ui("Respect the research.", "연구에 경의를."),
      "book",
    );
});
router.onChange = render;
async function preload(src: string) {
  await new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}
async function boot() {
  const progress =
      document.querySelector<HTMLProgressElement>("#load-progress")!,
    label = document.querySelector("#load-label")!;
  await Promise.all([
    preload(BASE + "minecraft/backgrounds/panorama.png"),
    ...navItems().map((i) => preload(BASE + `minecraft/items/${i.sprite}.png`)),
  ]);
  progress.value = 1;
  label.textContent = ui("Preparing inventory", "인벤토리 준비 중");
  await document.fonts.load("16px InventoryPixel");
  progress.value = 2;
  render();
  player = new PlayerPreview(preview);
  label.textContent = ui("Loading player", "플레이어 불러오는 중");
  await player.load();
  progress.value = 3;
  await preload(BASE + "minecraft/items/diamond.png");
  progress.value = 4;
  document.querySelector("#loading")!.remove();
  toast(
    ui("Advancement Made!", "발전 과제 달성!"),
    ui("Welcome to my CV", "제 CV에 오신 것을 환영합니다"),
  );
}
boot().catch((error) => {
  console.error(error);
  document.querySelector("#loading")?.remove();
  render();
  toast(
    ui("Inventory ready", "인벤토리 준비 완료"),
    ui(
      "Some visual assets could not load.",
      "일부 시각 자료를 불러오지 못했습니다.",
    ),
  );
});
