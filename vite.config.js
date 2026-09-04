import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';
import { createReadStream, existsSync } from 'node:fs';
export default defineConfig({
  root: 'app', base: './', publicDir: false,
  plugins: [react(), svelte(), tailwindcss(), {
    name: 'cv-local-images',
    configureServer(server) {
      server.middlewares.use('/res', (req, res, next) => {
        const name = decodeURIComponent((req.url || '').split('?')[0]);
        const file = resolve('res', '.' + name);
        if (!file.startsWith(resolve('res') + '/') || !existsSync(file)) return next();
        res.setHeader('Content-Type', ({png:'image/png',jpeg:'image/jpeg',jpg:'image/jpeg',glb:'model/gltf-binary',webm:'video/webm',mp4:'video/mp4',json:'application/json'})[file.split('.').pop()] || 'application/octet-stream');
        createReadStream(file).pipe(res);
      });
    }
  }],
  resolve: { alias: { '@': resolve('app') } },
  build: { outDir: '../dist', emptyOutDir: true, assetsDir: 'compiled', rollupOptions: { output: { manualChunks(id) { if (id.includes('/node_modules/three/')) return 'three-engine'; } } } },
});
