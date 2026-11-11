import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

test('page assembles from its background, changes typography, and hands off to the live CV',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{
  const samples:{size:number;family:string;length:number}[]=[];
  const state={background:false,samples};Object.assign(window,{buildAudit:state});
  addEventListener('portfolio-ready',()=>queueMicrotask(()=>{
   const surface=document.querySelector<HTMLElement>('.swarm-surface');
   state.background=surface?.dataset.mode==='intro'&&[...document.querySelectorAll<HTMLElement>('.swarm-copy')].every(node=>node.style.opacity==='0');
   const start=performance.now();
   const observe=()=>{
    const draft=document.querySelector<HTMLElement>('.swarm-piece[data-source="heroName"] .swarm-draft');
    if(draft&&!draft.hidden){const style=getComputedStyle(draft);samples.push({size:parseFloat(style.fontSize),family:style.fontFamily,length:draft.textContent?.length??0});}
    if(performance.now()-start<4000)requestAnimationFrame(observe);
   };requestAnimationFrame(observe);
  }));
 });
 await page.goto('./');await expect(page.locator('#loader')).toBeHidden();
 await expect(page.locator('html')).toHaveAttribute('data-swarm','on');
 await expect(page.locator('.swarm-stage')).toBeVisible();
 await expect.poll(()=>page.locator('[data-swarm-building]').count()).toBeGreaterThan(0);
 await page.screenshot({path:'test-results/swarm-building.png'});
 await expect(page.locator('[data-swarm-building]')).toHaveCount(0,{timeout:10000});
 await expect(page.locator('.swarm-surface')).toBeHidden();
 const audit=await page.evaluate(()=>(window as unknown as {buildAudit:{background:boolean;samples:{size:number;family:string;length:number}[]}}).buildAudit);
 expect(audit.background).toBe(true);expect(new Set(audit.samples.map(sample=>sample.size)).size).toBeGreaterThan(2);
 expect(audit.samples.some(sample=>sample.family.includes('monospace'))).toBe(true);expect(audit.samples.some(sample=>sample.size>50)).toBe(true);
 expect(new Set(audit.samples.map(sample=>sample.length)).size).toBeGreaterThan(2);
 await page.mouse.move(400,400);await expect(page.locator('.swarm-stage')).toBeHidden();
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

test('skip restores the current view and later scrolling still builds real content',async({page})=>{
 await page.goto('./');await expect(page.locator('.swarm-skip')).toBeVisible();await page.locator('.swarm-skip').click();
 await expect(page.locator('.swarm-surface')).toBeHidden();await expect(page.locator('#heroName')).toBeVisible();
 await page.locator('#projects').evaluate(node=>node.scrollIntoView({block:'start'}));
 await expect.poll(()=>page.locator('[data-swarm-building]').count()).toBeGreaterThan(0);
 await expect(page.locator('#pcards .pcard[data-build-complete]')).not.toHaveCount(0,{timeout:10000});
 await page.locator('.dossier-trigger').first().click();await expect(page.locator('#studio-dialog')).toBeVisible();
});

test('mobile opening completes and keyboard focus can reveal a pending section',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('./');
 await expect(page.locator('.swarm-skip')).toBeVisible();
 await expect(page.locator('.swarm-surface')).toBeHidden({timeout:10000});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('.dossier-trigger').first().focus();await expect(page.locator('#pcards .pcard').first()).toHaveCSS('opacity','1');
 await page.keyboard.press('Enter');await expect(page.locator('#studio-dialog')).toBeVisible();
});
