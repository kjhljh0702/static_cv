import { test, expect } from '@playwright/test';

test('upgraded studio preserves movement, exhibits and return navigation', async ({ page }) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./?view=3d');
  const stage = page.locator('#metaverse-stage');
  await expect(stage).toHaveAttribute('data-scene-edition', 'studio-2', {timeout:30000});
  await expect(stage).toHaveAttribute('data-station-count', '7');
  await page.locator('#world-start-button').click();
  const before = Number(await stage.getAttribute('data-player-z'));
  await page.keyboard.down('w');
  await expect.poll(async () => Number(await stage.getAttribute('data-player-z'))).toBeLessThan(before - .2);
  await page.keyboard.up('w');
  await page.keyboard.press('r');
  await expect(stage).toHaveAttribute('data-player-z', '9.35');
  await page.evaluate(() => document.exitPointerLock());
  for (const id of ['about', 'education', 'experience', 'projects', 'publications', 'skills', 'awards']) {
    await page.evaluate(id => {
      (window as unknown as { MyHubMetaverse: { openSection: (id: string) => void } }).MyHubMetaverse.openSection(id);
    }, id);
    await expect(page.locator('#world-detail-dialog')).toBeVisible();
    await expect(page.locator('#world-detail-content')).not.toBeEmpty();
    await page.locator('#world-detail-close').click({timeout:10000});
  }
  await page.screenshot({ path: 'test-results/studio-desktop.png' });
  await page.locator('#worldExit').click();
  await expect(page.locator('#cv-shell')).toBeVisible();
  expect(errors).toEqual([]);
});

test('classic defers 3D rendering and touch controls move the studio camera', async ({ browser }) => {
  test.setTimeout(90000);
  const context = await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.goto(process.env.CV_TEST_URL ?? 'http://127.0.0.1:5175/static_cv/');
  const stage=page.locator('#metaverse-stage');
  await expect(page.locator('#loader')).toBeHidden();
  await expect(stage).not.toHaveAttribute('data-world-ready','true');
  await page.locator('#worldBtn').tap();
  await expect(stage).toHaveAttribute('data-world-ready','true',{timeout:30000});
  await page.locator('#world-start-button').tap();
  const control=page.locator('[data-move="forward"]');
  await control.dispatchEvent('pointerdown',{pointerId:1,pointerType:'touch'});
  await expect.poll(async()=>Number(await stage.getAttribute('data-player-z'))).toBeLessThan(9);
  await control.dispatchEvent('pointerup',{pointerId:1,pointerType:'touch'});
  await page.screenshot({path:'test-results/studio-mobile.png'});
  await page.locator('#worldExit').tap();
  await expect(page.locator('#cv-shell')).toBeVisible();
  await context.close();
});
