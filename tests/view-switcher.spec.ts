import { test, expect } from "@playwright/test";

test("classic is the default and all three views remain reachable", async ({ page }) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("./");
  await expect(page.locator("html")).toHaveAttribute("data-view", "classic");
  await expect(page.locator("#cv-shell")).toBeVisible();
  await expect(page.locator("#loader")).toBeHidden({ timeout: 15000 });
  await page.getByRole("button", { name: "3D portfolio", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-view", "metaverse");
  await expect(page.locator("#worldExit")).toBeVisible();
  await page.locator("#worldExit").click();
  await expect(page.locator("html")).toHaveAttribute("data-view", "classic");
  await page.getByRole("link", { name: "Minecraft CV", exact: true }).click();
  await expect(page.locator(".section-sidebar")).toBeVisible();
  await page.getByRole("link", { name: "3D", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-view", "metaverse");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-view", "metaverse");
  await page.goto("./");
  await expect(page.locator("html")).toHaveAttribute("data-view", "classic");
  expect(errors).toEqual([]);
});

test("mobile view buttons fit and Minecraft can return to the classic CV", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await expect(page.locator("#loader")).toBeHidden({ timeout: 15000 });
  await expect(page.locator("#curtain")).toBeHidden();
  const minecraft = page.getByRole("link", { name: "Minecraft CV", exact: true });
  await expect(minecraft).toBeVisible();
  await expect(page.locator("#worldBtn")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await minecraft.click();
  await page.getByRole("link", { name: "Classic CV", exact: true }).click();
  await expect(page.locator("#cv-shell")).toBeVisible();
});
