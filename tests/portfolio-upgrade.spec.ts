import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const cv=JSON.parse(readFileSync('data.json','utf8'));
test('Classic filters real projects, opens dossiers and switches language',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('./');await expect(page.locator('#loader')).toBeHidden({timeout:20000});
 await expect(page.locator('#heroName')).toContainText('Jeong');
 await expect(page.locator('#curtain')).toBeHidden();await page.waitForTimeout(800);await page.screenshot({path:'test-results/upgrade-classic-desktop.png'});
 await expect(page.locator('#heroName .g .ch').first()).not.toHaveCSS('color','rgba(0, 0, 0, 0)');
 await page.locator('.project-filter[data-filter="engineering"]').click();
 const count=cv.projects.filter((p:{category:{en:string}})=>!/Research|Synthesis/.test(p.category.en)).length;
 await expect(page.locator('#pcards .pcard:visible')).toHaveCount(count);
 await page.locator('#pcards .pcard:visible .dossier-trigger').first().click();
 await expect(page.locator('#studio-dialog')).toBeVisible();await expect(page.locator('#studio-dialog-body')).toContainText('Mechanical Design');
 await expect(page.locator('#lightbox')).toBeHidden();await page.keyboard.press('Escape');await expect(page.locator('#studio-dialog')).not.toBeVisible();
 await page.locator('#langBtn').click();await expect(page.locator('.project-filter').first()).toHaveText('전체');
 await expect(page.locator('.credential-gallery .credential')).toHaveCount(3);
 await page.locator('[data-certificate="1"]').click();await expect(page.locator('#studio-dialog .document-image')).toHaveAttribute('src','res/completion-ai-engineering.jpeg');
 expect(errors).toEqual([]);
});
test('Minecraft inspection, hotbar and certificate zoom work with keyboard',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('./inventory/');await expect(page.locator('#loading')).toHaveCount(0);
 await expect(page.locator('.navigation-hotbar .slot')).toHaveCount(9);
 await page.screenshot({path:'test-results/upgrade-minecraft-desktop.png'});
 await page.locator('[data-item="certificate-gtelp"]').hover();await expect(page.locator('.inspection-content h2')).toContainText('G-TELP');
 await page.locator('.inspect-action').click();await expect(page).toHaveURL(/certificates\/gtelp/);
 await page.getByRole('button',{name:'Next page',exact:true}).click();
 await page.getByRole('button',{name:'Inspect document',exact:true}).click();await expect(page.locator('.artifact-viewer')).toBeVisible();
 await page.getByRole('button',{name:'Zoom in',exact:true}).click();await expect(page.locator('.artifact-controls')).toContainText('150%');
 await page.keyboard.press('Escape');await expect(page.locator('.artifact-viewer')).toHaveCount(0);
 await page.keyboard.press('Escape');await expect(page.locator('.survival')).toBeVisible();
 await page.locator('.navigation-hotbar [data-item="projects"]').click();await expect(page).toHaveURL(/projects$/);
 expect(errors).toEqual([]);
});
test('phone and landscape keep navigation and content inside the viewport',async({browser})=>{
 for(const [width,height] of [[390,844],[360,800],[844,390]]) {
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true});const page=await context.newPage();
  await page.goto((process.env.CV_TEST_URL??'http://127.0.0.1:4174/static_cv/')+'inventory/');await expect(page.locator('#loading')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator('[data-section="projects"]').tap();await expect(page.locator('.chest-window')).toBeVisible();
  await page.goto((process.env.CV_TEST_URL??'http://127.0.0.1:4174/static_cv/'));await expect(page.locator('#loader')).toBeHidden({timeout:20000});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.locator('#heroPhoto')).toBeVisible();
  const last=await page.locator('#heroName .g .ch').last().boundingBox();expect(last!.x+last!.width).toBeLessThanOrEqual(width);
  await expect(page.locator('#curtain')).toBeHidden();await page.waitForTimeout(800);
  await page.screenshot({path:`test-results/upgrade-classic-${width}.png`});
  await context.close();
 }
});
