import {test,expect} from '@playwright/test';
test('phone layout has margins, top tabs and touch-reactive petals',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 const page=await context.newPage();await page.goto((process.env.CV_TEST_URL??'http://127.0.0.1:5175/static_cv/')+'inventory/');
 await expect(page.locator('#loading')).toHaveCount(0);
 const panel=await page.locator('.survival').boundingBox(),tabs=await page.locator('.section-sidebar').boundingBox();
 expect(panel!.x).toBeGreaterThanOrEqual(12);expect(panel!.x+panel!.width).toBeLessThanOrEqual(378);expect(tabs!.y+tabs!.height).toBeLessThan(panel!.y);
 await page.getByRole('button',{name:'Noon',exact:true}).tap();
 let point:{x:number;y:number}|null=null;
 await expect.poll(async()=>{
  point=await page.locator('.cherry-petals').evaluate((c:HTMLCanvasElement)=>{
   const d=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;
   for(let y=Math.floor(c.height*.78);y<c.height-15;y++)for(let x=5;x<c.width-5;x++)if(d[(y*c.width+x)*4+3]>0)return{x:x*3,y:y*3};return null;
  });return point!==null;
 }).toBe(true);
 await page.touchscreen.tap(point!.x,point!.y);
 await expect(page.locator('.cherry-petals')).toHaveAttribute('data-touch-reaction','true');
 await page.screenshot({path:'test-results/minecraft-phone-polish.png'});
 await context.close();
});
test('classic chapter control and project imagery respond to scrolling',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('./');
 await expect(page.locator('#loader')).toBeHidden({timeout:15000});
 await expect(page.locator('.reading-dock')).toBeVisible();
 await page.locator('.reading-location').click();await page.locator('.reading-menu a[href="#projects"]').click();
 await expect(page.locator('.reading-location')).toContainText('Projects',{timeout:15000});
 await expect.poll(()=>page.locator('#projects .pcard').first().evaluate(n=>Number((n as HTMLElement).style.getPropertyValue('--photo-progress')))).toBeGreaterThan(.5);
 await expect(page.locator('#projects .pcard').first()).toHaveCSS('position','relative');
 await page.screenshot({path:'test-results/classic-scroll-phone.png'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(page.locator('#projects .pcard__img').first()).toHaveCSS('clip-path','none');
});
