import source from "../../data.json";
export const cv = source;
export type Local = string | { en: string; ko: string };
export type Item = {
  id: string;
  name: string;
  sprite: string;
  category: string;
  lines?: string[];
  count?: number;
  rarity?: "aqua" | "gold" | "purple" | "green" | "white";
  enchanted?: boolean;
  route?: string;
  href?: string;
  download?: boolean;
};
export const BASE = import.meta.env.BASE_URL;
export let language: "en" | "ko" =
  localStorage.getItem("inventory-language") === "ko" ? "ko" : "en";
export const t = (value: Local | undefined): string =>
  typeof value === "string" ? value : (value?.[language] ?? "");
export const ui = (en: string, ko: string) => (language === "ko" ? ko : en);
export function setLanguage() {
  language = language === "en" ? "ko" : "en";
  localStorage.setItem("inventory-language", language);
  document.documentElement.lang = language;
}
export const period = (x: { start: string; end: string }) =>
  `${x.start} - ${x.end === "present" ? ui("Present", "현재") : x.end}`;
export const slugs = [
  "trace-ranking",
  "type-4-clone-detection",
  "d-star",
  "wall-climbing-robot",
  "robotic-gripper",
  "fpga-elevators",
];
export const projectSprites = [
  "eye",
  "enchanted-book",
  "comparator",
  "ingot",
  "lead",
  "repeater",
];
export function navItems(): Item[] {
  const items: Item[] = [
    {
      id: "inventory",
      name: ui("Inventory", "인벤토리"),
      sprite: "chest",
      category: t(cv.profile.name),
      route: "/inventory",
    },
    {
      id: "about",
      name: ui("About Me", "소개"),
      sprite: "book",
      category: t(cv.profile.roles[0]),
      route: "/about",
    },
    {
      id: "education",
      name: ui("Education", "학력"),
      sprite: "enchanted-book",
      category: ui("Academic record", "학업 기록"),
      count: cv.education.length,
      enchanted: true,
      rarity: "purple",
      route: "/education",
    },
    {
      id: "research",
      name: ui("Research", "연구"),
      sprite: "spyglass",
      category: t(cv.profile.headline),
      count: cv.projects.filter((p) => p.category.en === "Graduate Research")
        .length,
      rarity: "aqua",
      route: "/research",
    },
    {
      id: "projects",
      name: ui("Projects", "프로젝트"),
      sprite: "redstone",
      category: ui("Research & engineering", "연구 및 공학"),
      count: cv.projects.length,
      route: "/projects",
    },
    {
      id: "skills",
      name: ui("Skills", "기술"),
      sprite: "crafting",
      category: ui("Crafting expertise", "전문 분야 조합"),
      route: "/skills",
    },
    {
      id: "experience",
      name: ui("Experience", "경력"),
      sprite: "pickaxe",
      category: ui("Research & industry", "연구 및 산업 경력"),
      count: cv.experience.length,
      route: "/experience",
    },
    {
      id: "contact",
      name: ui("Contact", "연락처"),
      sprite: "compass",
      category: cv.profile.contacts[0].value,
      route: "/contact",
    },
    {
      id: "resume",
      name: ui("Download CV", "CV 다운로드"),
      sprite: "paper",
      category: ui("Written by Lee Jeong Hoon", "이정훈 작성"),
      lines: [ui("PDF · generated from the CV record", "PDF · CV 데이터 기반")],
      href: BASE + "minecraft/Jeonghun-Lee-CV.pdf",
      download: true,
    },
  ];
  const publications: Item = { id: "publications", name: ui("Papers", "논문·포스터"), sprite: "written-book", category: ui("Posters and papers", "포스터 및 논문"), route: "/publications" };
  items[0].name = ui("Home", "홈");
  items[0].sprite = "compass";
  items[4].name = ui("Work", "작업");
  items[5].sprite = "comparator";
  items[8].sprite = "written-book";
  return [items[0], items[1], items[6], items[2], items[4], items[5], publications, items[7], items[8]];
}
export function extraItems(): Item[] {
  return [
    {
      id: "publications",
      name: ui("Publications", "논문 및 포스터"),
      sprite: "book",
      category: ui(
        "Papers, poster & patent concept",
        "논문, 포스터 및 특허 아이디어",
      ),
      count: cv.publications.length,
      route: "/publications",
      rarity: "aqua",
    },
    {
      id: "awards",
      name: ui("Awards", "수상"),
      sprite: "diamond",
      category: t(cv.awards[0].title),
      count: cv.awards.length,
      enchanted: true,
      rarity: "gold",
      route: "/awards",
    },
    {
      id: "robotics",
      name: ui("Robotics", "로보틱스"),
      sprite: "piston",
      category: t(cv.skills[2].category),
      route: "/robotics",
    },
    {
      id: "languages",
      name: ui("Languages", "언어"),
      sprite: "paper",
      category: t(cv.skills[3].category),
      route: "/languages",
    },
    {
      id: "programming",
      name: ui("Programming", "프로그래밍"),
      sprite: "command",
      category: cv.skills[1].items.map(t).join(", "),
      route: "/skills?recipe=1",
    },
    {
      id: "ai",
      name: ui("Research & AI", "연구 및 AI"),
      sprite: "eye",
      category: t(cv.skills[0].category),
      route: "/skills?recipe=0",
      enchanted: true,
      rarity: "aqua",
    },
  ];
}
export function projectItems(filter?: string): Item[] {
  return cv.projects.flatMap((p, i) =>
    (filter === "research" && p.category.en !== "Graduate Research") ||
    (filter === "robotics" &&
      !["wall-climbing-robot", "robotic-gripper", "fpga-elevators"].includes(
        slugs[i],
      ))
      ? []
      : [
          {
            id: slugs[i],
            name: t(p.title),
            sprite: projectSprites[i],
            category: t(p.category),
            lines: [t(p.organization), period(p), t(p.role)],
            route: `/projects/${slugs[i]}`,
            enchanted: i < 2,
            rarity: i < 2 ? "aqua" : "white",
          },
        ],
  );
}
export function contactItems(): Item[] {
  return [
    ...cv.profile.contacts.map((c, i) => ({
      id: `contact-${i}`,
      name: t(c.label),
      sprite: i ? "compass" : "paper",
      category: c.value,
      href: c.href,
    })),
    ...cv.profile.socials.map((s, i) => ({
      id: `social-${i}`,
      name: t(s.label),
      sprite: i ? "emerald" : "name-tag",
      category: s.url,
      href: s.url,
    })),
    {
      id: "github",
      name: "GitHub",
      sprite: "redstone",
      category: "kjhljh0702",
      href: "https://github.com/kjhljh0702",
    },
    navItems()[8],
  ];
}
