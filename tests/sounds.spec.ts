import { test, expect } from '@playwright/test';

test('original recordings play only when enabled and mute stops playback', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    const state = { starts: 0, stops: 0, oscillators: 0, durations: [] as number[] };
    Object.assign(window, { audioTest: state });
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function(...args) {
      state.starts++; state.durations.push(this.buffer?.duration ?? 0);
      return start.apply(this, args);
    };
    const stop = AudioBufferSourceNode.prototype.stop;
    AudioBufferSourceNode.prototype.stop = function(...args) { state.stops++; return stop.apply(this, args); };
    const oscillator = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function() { state.oscillators++; return oscillator.call(this); };
  });
  await page.goto('./inventory');
  await expect(page.locator('#loading')).toHaveCount(0);
  const state = () => page.evaluate(() => (window as unknown as { audioTest: { starts: number; stops: number; oscillators: number; durations: number[] } }).audioTest);
  expect((await state()).starts).toBe(0);
  await page.getByRole('button', { name: 'Sound: OFF', exact: true }).click();
  await expect.poll(async () => (await state()).starts).toBeGreaterThan(0);
  await page.locator('[data-section="education"]').click();
  await expect.poll(async () => (await state()).starts).toBeGreaterThan(1);
  await page.locator('[data-section="about"]').click();
  await expect(page.locator('.book-paper')).toBeVisible();
  await expect.poll(async () => (await state()).starts).toBeGreaterThan(2);
  await page.keyboard.press('Escape');
  await expect.poll(async () => (await state()).starts).toBeGreaterThan(3);
  await page.getByRole('button', { name: 'Sound: ON', exact: true }).click();
  const muted = await state();
  await page.locator('[data-section="education"]').click();
  await page.waitForTimeout(300);
  expect((await state()).starts).toBe(muted.starts);
  expect(muted.oscillators).toBe(0);
  expect(muted.durations.every(duration => duration > 0)).toBe(true);
  expect(errors).toEqual([]);
});

test('missing audio does not break navigation', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/sounds/*.wav', route => route.abort());
  await page.goto('./inventory');
  await expect(page.locator('#loading')).toHaveCount(0);
  await page.getByRole('button', { name: 'Sound: OFF', exact: true }).click();
  await page.locator('[data-section="education"]').click();
  await expect(page.locator('.container-title')).toHaveText('Education Chest');
  expect(errors).toEqual([]);
});
