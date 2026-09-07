import {test,expect} from '@playwright/test';
for(const [name,width,height,dpr] of [['landscape',844,390,3],['portrait',390,844,3],['desktop',1440,900,1]] as const) {
 test(`${name} renders sharp geometry and readable inventory`,async({browser})=>{
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:name!=='desktop'});
  const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.env.CV_TEST_URL??'http://127.0.0.1:4174/static_cv/')+'inventory/');
  await expect(page.locator('#loading')).toHaveCount(0);
  const metrics=await page.evaluate(()=>{
   const canvas=document.querySelector<HTMLCanvasElement>('.grove-canvas')!;
   const panel=document.querySelector('.survival')!.getBoundingClientRect();
   return {pixels:canvas.width,width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,panelWidth:panel.width,bottom:panel.bottom,height:innerHeight};
  });
  expect(metrics.pixels).toBe(width*Math.min(dpr,2));expect(metrics.overflow).toBe(false);
  expect(metrics.panelWidth).toBeGreaterThanOrEqual(352);expect(metrics.bottom).toBeLessThanOrEqual(height);
  await page.getByRole('button',{name:'Night',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-world-time','night');
  await page.locator('[data-section="education"]').click();await expect(page.locator('.container-title')).toHaveText('Education Chest');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);await context.close();
 });
}
