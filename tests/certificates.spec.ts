import {test,expect} from '@playwright/test';
test('score report opens from inventory and returns home',async({page})=>{
 await page.goto('./inventory/');await expect(page.locator('#loading')).toHaveCount(0);
 await expect(page.locator('.belongings [data-item]')).toHaveCount(3);
 expect(await page.locator('.belongings [data-item]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-item')))).toEqual(['award-0','certificate-ai-engineering','certificate-gtelp']);
 await page.locator('[data-item="certificate-gtelp"]').click();
 await expect(page.locator('.book-text')).toContainText('98%');
 while(await page.getByRole('button',{name:'Next page',exact:true,includeHidden:true}).isEnabled()) await page.getByRole('button',{name:'Next page',exact:true,includeHidden:true}).click();
 await expect(page.locator('.book-figure')).toHaveAttribute('src',/gtelp-level-2/);
 await page.keyboard.press('Escape');await expect(page.locator('.survival')).toBeVisible();
});
test('3D framed score report opens at full size',async({page})=>{
 test.setTimeout(90000);await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('./?view=3d');await expect(page.locator('#metaverse-stage')).toHaveAttribute('data-certificate-count','3',{timeout:30000});
 await page.evaluate(()=> (window as unknown as {MyHubMetaverse:{openSection:(id:string)=>void}}).MyHubMetaverse.openSection('certificates/gtelp'));
 await expect(page.locator('#world-detail-dialog')).toBeVisible();
 await expect(page.locator('#world-detail-content')).toContainText('98%');
 await expect(page.locator('#world-detail-content img')).toHaveJSProperty('complete',true);
 await page.evaluate(()=> (window as unknown as {MyHubMetaverse:{openSection:(id:string)=>void}}).MyHubMetaverse.openSection('certificates/ai-engineering'));
 await expect(page.locator('#world-detail-content')).toContainText('13');
 await expect(page.locator('#world-detail-content img')).toHaveAttribute('src','res/completion-ai-engineering.jpeg');
});
