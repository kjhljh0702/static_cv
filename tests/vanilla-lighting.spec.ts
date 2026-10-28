import {test,expect} from '@playwright/test';
test('crafting ingredients stay within their vanilla slots on desktop and phone',async({page})=>{
 for(const [width,height] of [[1440,900],[390,844]]) {
  await page.setViewportSize({width,height});await page.goto('./inventory/');await expect(page.locator('#loading')).toHaveCount(0);
  const metrics=await page.locator('.survival').evaluate(panel=>{
   const origin=panel.getBoundingClientRect();const scale=Number(document.documentElement.dataset.scale);
   return [...panel.querySelectorAll('.inventory-ingredients .slot')].map((slot,index)=>{
    const r=slot.getBoundingClientRect(),image=slot.querySelector('img')!,sprite=image.getBoundingClientRect();
    return {x:r.x-origin.x,y:r.y-origin.y,expectedX:(97+index%2*18)*scale,expectedY:(17+Math.floor(index/2)*18)*scale,contained:sprite.x>=r.x-.1&&sprite.y>=r.y-.1&&sprite.right<=r.right+.1&&sprite.bottom<=r.bottom+.1,naturalWidth:image.naturalWidth};
   });
  });
  expect(metrics).toHaveLength(4);for(const item of metrics){expect(item.x).toBeCloseTo(item.expectedX);expect(item.y).toBeCloseTo(item.expectedY);expect(item.contained).toBe(true);expect(item.naturalWidth).toBe(16);}
  await page.locator('.survival').screenshot({path:`test-results/vanilla-inventory-${width}.png`});
 }
});
test('glowstone renders in both daytime and night configurations',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('./inventory/');await expect(page.locator('#loading')).toHaveCount(0);
 await page.getByRole('button',{name:'Noon',exact:true}).click();await page.screenshot({path:'test-results/glowstone-noon-ui.png'});
 await page.addStyleTag({content:'#app,#advancement{visibility:hidden}'});await page.screenshot({path:'test-results/glowstone-noon-world.png'});
 await page.addStyleTag({content:'#app{visibility:visible}'});await page.getByRole('button',{name:'Night',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-world-time','night');
 await page.addStyleTag({content:'#app{visibility:hidden}'});await page.screenshot({path:'test-results/glowstone-night-world.png'});
 expect(errors).toEqual([]);
});
