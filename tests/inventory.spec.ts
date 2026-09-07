import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const cv = JSON.parse(readFileSync("data.json", "utf8"));
test.beforeEach(async ({ page }) => {
  await page.goto("./");
  await expect(page.locator("#loading")).toHaveCount(0);
});
test("main inventory, mouse tracking, hotbar and browser history", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await expect(
    page.getByRole("heading", { name: "Jeonghun Lee" }),
  ).toBeVisible();
  await expect(
    page.locator(".survival > .slot-grid").first().locator(".slot"),
  ).toHaveCount(27);
  await expect(page.locator(".section-sidebar .section-tab")).toHaveCount(8);
  const canvas = page.locator(".player-canvas");
  const before = await canvas.screenshot();
  await page.mouse.move(1200, 100);
  await page.waitForTimeout(400);
  const after = await canvas.screenshot();
  expect(Buffer.compare(before, after)).not.toBe(0);
  await page.keyboard.press("5");
  await expect(page).toHaveURL(/projects$/);
  await expect(
    page.locator(".chest-window > .slot-grid").first().locator(".slot"),
  ).toHaveCount(54);
  await page.locator('.chest-window [data-item="trace-ranking"]').click();
  await expect(page.locator(".book-text")).toContainText("Trace-Based");
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/projects$/);
  await page.goBack();
  await expect(page).toHaveURL(/projects\/trace-ranking$/);
  await page.keyboard.press("e");
  await expect(page.locator(".survival")).toBeVisible();
  expect(errors).toEqual([]);
});
test("book pagination preserves complete source content in both languages", async ({
  page,
}) => {
  for (const lang of ["en", "ko"]) {
    if (lang === "ko")
      await page.getByRole("button", { name: "한국어", exact: true }).click();
    await page.goto("./projects/trace-ranking");
    await expect(page.locator("#loading")).toHaveCount(0);
    let text = "";
    while (true) {
      text += " " + (await page.locator(".book-paper").innerText());
      const next = page.getByRole("button", {
        name: lang === "en" ? "Next page" : "다음 쪽",
        exact: true,
        includeHidden: true,
      });
      if (await next.isDisabled()) break;
      await next.click();
    }
    const normalize = (s: string) => s.replace(/\s+/g, "");
    expect(normalize(text)).toContain(normalize(cv.projects[0].summary[lang]));
    expect(normalize(text)).toContain(
      normalize(cv.projects[0].highlights[1][lang]),
    );
    await expect(page.locator(".book-figure")).toBeVisible();
  }
});
test("keyboard slots, commands, sound, recipe and exploration", async ({
  page,
}) => {
  await page.keyboard.press("4");
  const first = page.locator(".chest-window .slot").first();
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".chest-window .slot").nth(1)).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(".book-text")).toContainText("Bachelor");
  await page.keyboard.press("/");
  await page.getByRole("textbox", { name: "Command", exact: true }).fill("/sk");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("textbox", { name: "Command", exact: true }),
  ).toHaveValue("/skills");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/skills$/);
  await page.getByRole("button", { name: "Programming", exact: true }).click();
  await expect(page).toHaveURL(/recipe=1/);
  await page.getByRole("button", { name: "Sound: OFF", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Sound: ON", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Sound: ON", exact: true }).click();
  await page.keyboard.press("8");
  await expect(page.locator(".container-title")).toHaveText("Contact");
  await page.keyboard.press("Escape");
  await expect(page.locator(".survival")).toBeVisible();
});
test("responsive integer slots and bounded tooltips", async ({ page }) => {
  for (const [width, height] of [
    [2560, 1440],
    [1920, 1080],
    [1600, 900],
    [1440, 900],
    [1366, 768],
    [768, 1024],
    [390, 844],
    [844, 390],
    [320, 568],
  ]) {
    await page.setViewportSize({ width, height });
    await expect.poll(() => page.evaluate(() => Number(document.documentElement.dataset.scale))).toBe(Math.max(1, Math.min(4, Math.floor((width - 2) / (width <= 600 ? 194 : 250)), Math.floor((height - 32) / 310))));
    await page.keyboard.press("e");
    const box = await page.locator(".survival").boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    const slot = page
      .locator(".survival > .slot-grid")
      .first()
      .locator(".slot")
      .first();
    const bounds = await slot.boundingBox();
    expect(bounds!.width % 18).toBe(0);
    await slot.hover();
    const tip = await page.locator("#tooltip").boundingBox();
    expect(tip!.x).toBeGreaterThanOrEqual(0);
    expect(tip!.x + tip!.width).toBeLessThanOrEqual(width);
    expect(tip!.y + tip!.height).toBeLessThanOrEqual(height);
    await page.screenshot({
      path: `test-results/inventory-${width}x${height}.png`,
    });
  }
});
test("touch navigation and reduced motion", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 3,
    reducedMotion: "reduce",
  });
  const p = await context.newPage();
  await p.goto(process.env.CV_TEST_URL ?? "http://127.0.0.1:5175/static_cv/");
  await expect(p.locator("#loading")).toHaveCount(0);
  await p.locator('.section-sidebar [data-section="projects"]').tap();
  await expect(p.locator(".container-title")).toContainText("Large Chest");
  await p.locator('.chest-window [data-item="trace-ranking"]').tap();
  await expect(p.locator(".book-text")).toContainText("Trace-Based");
  await p.getByRole("button", { name: "Done", exact: true }).tap();
  await expect(p).toHaveURL(/projects$/);
  await context.close();
});
test("direct links, missing image fallback, slow load and themed 404", async ({
  page,
}) => {
  await page.route("**/minecraft/skin/steve.png", (r) => r.abort());
  await page.goto("./education");
  await expect(page.locator("#loading")).toHaveCount(0);
  await expect(page.locator(".container-title")).toHaveText("Education Chest");
  await page.reload();
  await expect(page.locator(".container-title")).toHaveText("Education Chest");
  await page.goto("./does-not-exist");
  await expect(page.locator(".container-title")).toHaveText("Disconnected");
  await page
    .getByRole("button", { name: "Back to Inventory", exact: true })
    .click();
  await expect(page.locator(".survival")).toBeVisible();
});
test("PDF download and external link destinations", async ({ page }) => {
  const download = page.waitForEvent("download");
  await page.keyboard.press("9");
  const pdf = await download;
  expect(pdf.suggestedFilename()).toBe("Jeonghun-Lee-CV.pdf");
  const file = await pdf.path();
  expect(readFileSync(file!).subarray(0, 4).toString()).toBe("%PDF");
  await page.keyboard.press("8");
  const popup = page.waitForEvent("popup");
  await page.locator('.chest-window [data-item="github"]').click();
  const gh = await popup;
  expect(gh.url()).toContain("github.com/kjhljh0702");
  await gh.close();
});
test("book pages do not overflow, Korean labels and high-DPI zoom stay readable", async ({
  page,
  browser,
}) => {
  for (const route of [
    "about",
    "education/0",
    "experience/1",
    "projects/trace-ranking",
    "publications/1",
    "awards/0",
  ]) {
    await page.goto("./" + route);
    await expect(page.locator("#loading")).toHaveCount(0);
    const overflow = await page.locator(".book-text").evaluate((n) => {
      const r = n.getBoundingClientRect(),
        p = n.parentElement!.getBoundingClientRect();
      return r.bottom > p.bottom || n.scrollWidth > n.clientWidth + 1;
    });
    expect(overflow).toBe(false);
  }
  await page.getByRole("button", { name: "한국어", exact: true }).click();
  await page.goto("./publications");
  await expect(
    page.locator('.chest-window [data-item="pub-1"]'),
  ).toHaveAttribute("aria-label", /연구 포스터/);
  const context = await browser.newContext({
    viewport: { width: 960, height: 600 },
    deviceScaleFactor: 2,
  });
  const p = await context.newPage();
  await p.goto(process.env.CV_TEST_URL ?? "http://127.0.0.1:5175/static_cv/");
  await expect(p.locator("#loading")).toHaveCount(0);
  const overflow = await p.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  expect(overflow).toBe(false);
  await context.close();
});
test("asset loading reports real progress and gracefully handles missing artwork", async ({
  page,
}) => {
  await page.route("**/minecraft/skin/steve.png", async (r) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await r.continue();
  });
  await page.goto("./", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#load-progress")).toHaveAttribute("value", "2");
  await expect(page.locator("#loading")).toHaveCount(0);
  await page.route("**/res/project-trace-ranking.png", (r) => r.abort());
  await page.goto("./projects/trace-ranking?page=999");
  await expect(page.locator(".image-fallback")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Done", exact: true }),
  ).toBeEnabled();
});
test("all known routes resolve with original record counts", async ({
  page,
}) => {
  for (const [route, count] of [
    ["education", 2],
    ["experience", 4],
    ["projects", 6],
    ["research", 2],
    ["robotics", 3],
    ["publications", 3],
    ["awards", 1],
  ] as const) {
    await page.goto("./" + route);
    await expect(page.locator("#loading")).toHaveCount(0);
    await expect(
      page.locator(".chest-window > .slot-grid").first().locator("[data-item]"),
    ).toHaveCount(count);
  }
  await page.keyboard.press("e");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("b");
  await page.keyboard.press("a");
  await expect(page.locator('[data-item="rare"]')).toBeVisible();
});

test("sidebar routes and distinct record sprites", async ({ page }) => {
  const routes = ["inventory", "about", "experience", "education", "projects", "skills", "publications", "contact"];
  for (const route of routes) {
    await page.locator(`[data-section="${route}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${route}$`));
    await expect(page.locator(`[data-section="${route}"]`)).toHaveAttribute("aria-current", "page");
    const sprites = await page.locator(".chest-window [data-item] img").evaluateAll(nodes => nodes.map(n => (n as HTMLImageElement).src));
    expect(new Set(sprites).size).toBe(sprites.length);
  }
  await page.locator('[data-section="inventory"]').focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator('[data-section="about"]')).toBeFocused();
});
