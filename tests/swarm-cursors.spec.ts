import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

test('scroll-building swarm can replay, pause, and survive language changes',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('./');await expect(page.locator('#loader')).toBeHidden();
 await expect(page.locator('html')).toHaveAttribute('data-swarm','on');
 await expect(page.locator('.swarm-stage')).toBeVisible();
 await expect.poll(()=>page.locator('[data-swarm-building]').count()).toBeGreaterThan(0);
 await page.screenshot({path:'test-results/swarm-building.png'});
 await expect(page.locator('[data-swarm-building]')).toHaveCount(0,{timeout:10000});
 await page.locator('.swarm-controls summary').click();await page.getByRole('button',{name:'Replay this view ↻',exact:true}).click();
 await expect.poll(()=>page.locator('[data-swarm-building]').count()).toBeGreaterThan(0);
 await page.locator('.swarm-controls summary').click();await page.getByRole('button',{name:'Turn off',exact:true}).click();
 await expect(page.locator('html')).toHaveAttribute('data-swarm','off');await expect(page.locator('[data-swarm-building]')).toHaveCount(0);
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-swarm','off');
 await page.locator('.swarm-controls summary').click();await page.getByRole('button',{name:'Turn on',exact:true}).click();
 await page.locator('#langBtn').click();await expect(page.locator('.swarm-controls summary')).toContainText('커서 스웜');
 await page.locator('#projects').scrollIntoViewIfNeeded();await expect.poll(()=>page.locator('[data-swarm-building]').count()).toBeGreaterThan(0);
 expect(errors).toEqual([]);
});

test('motion preference keeps the page readable and touch controls remain reachable',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('./');await expect(page.locator('#loader')).toBeHidden();await expect(page.locator('html')).toHaveAttribute('data-swarm','off');
 await expect(page.locator('[data-swarm-building]')).toHaveCount(0);await expect(page.locator('.swarm-stage')).toBeHidden();
 await expect(page.locator('#heroName')).toBeVisible();
 await page.locator('.swarm-controls summary').click();await expect(page.getByRole('button',{name:'Turn on',exact:true})).toBeDisabled();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('Minecraft ingredients use unmodified vanilla PNGs, not the recreated block renders',async({page})=>{
 const manifest: {file:string;sha256:string}[]=JSON.parse(readFileSync('minecraft/public/minecraft/source-manifest.json','utf8'));
 await page.goto('./inventory/');await expect(page.locator('#loading')).toHaveCount(0);
 const sources=await page.locator('.inventory-ingredients img').evaluateAll(nodes=>nodes.map(n=>(n as HTMLImageElement).src));
 expect(sources).toHaveLength(4);
 for(const src of sources) {
  expect(src).not.toMatch(/\/(command|piston|crafting|chest)\.png/);
  const path='items/'+new URL(src).pathname.split('/').pop();const original=manifest.find(item=>item.file===path);expect(original).toBeTruthy();
  const response=await page.request.get(src);expect(response.ok()).toBe(true);expect(createHash('sha256').update(await response.body()).digest('hex')).toBe(original!.sha256);
 }
 await page.locator('.survival').screenshot({path:'test-results/original-item-icons.png'});
});
