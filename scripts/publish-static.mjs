import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
await cp('res', 'dist/res', { recursive: true });
await cp('dist/compiled', 'compiled', { recursive: true });
await cp('dist/index.html', 'index.html');
await mkdir('dist/licenses', { recursive: true });
await cp('app/components/magicui/LICENSE.md', 'dist/licenses/Magic-UI.md');
console.log('Static CV built in dist/ and synced to index.html + compiled/. Original backup untouched.');
