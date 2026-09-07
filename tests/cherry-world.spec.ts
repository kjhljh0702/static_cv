import {test,expect} from '@playwright/test';
test('lab coat, clock presets, persistent time and continuous game-texture petals',async({page})=>{
 await page.goto('./inventory');
 await expect(page.locator('#loading')).toHaveCount(0);
 await expect(page.locator('.player-canvas')).toHaveAttribute('data-outfit','lab-coat');
 for(const time of ['Noon','Dusk','Night']) {
  await page.getByRole('button',{name:time,exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('data-world-time',time.toLowerCase());
  await expect(page.getByRole('button',{name:time,exact:true})).toHaveAttribute('aria-pressed','true');
 }
 await page.reload();
 await expect(page.locator('html')).toHaveAttribute('data-world-time','night');
 await page.getByRole('button',{name:'Noon',exact:true}).click();
 await expect(page.getByRole('button',{name:'Shake blossoms',exact:true})).toHaveCount(0);
 await expect(page.locator('.grove-canvas')).toBeVisible();
 await expect.poll(()=>page.locator('.cherry-petals').evaluate((c:HTMLCanvasElement)=>{
  const pixels=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;
  return pixels.some((v,i)=>i%4===3 && v>0);
 })).toBe(true);
 const before=await page.locator('.grove-canvas').screenshot();
 await page.getByRole('button',{name:'Night',exact:true}).click();
 const night=await page.locator('.grove-canvas').screenshot();
 expect(Buffer.compare(before,night)).not.toBe(0);
 await page.getByRole('button',{name:'Noon',exact:true}).click();
 await page.screenshot({path:'test-results/cherry-noon.png'});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'test-results/cherry-mobile.png'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(page.locator('#world')).toHaveCSS('animation-name','none');
});
