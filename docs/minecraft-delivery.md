# Minecraft inventory CV delivery

## Architecture

The original application was a static HTML/CSS/JavaScript page using a local Three.js bundle, anime.js, and one bilingual `data.json`. The replacement keeps that authoritative data and GitHub Pages deployment. TypeScript DOM components and Vite provide a checked, bundled client; React was not introduced.

- `minecraft/src/data.ts`: typed view adapters and item mappings over the unchanged root `data.json`.
- `components/inventory.ts`: reusable sprites, slots, grids, equipment and hotbar primitives.
- `components/tooltip.ts`: pointer/focus tooltips constrained to the viewport.
- `components/player.ts`: orthographic Three.js character, Minecraft Steve skin atlas, nearest filtering, damped head/body rotations, idle arms, flat fallback.
- `components/book.ts` and `records.ts`: measured pixel-font pagination and complete CV record conversion; figures appear as additional pages.
- `systems/router.ts`: clean routes, history, refresh, parent navigation, and unknown-route handling.
- `systems/sound.ts`: muted-by-default synthesized clicks, container/page sounds and advancement chimes.
- `main.ts`: survival inventory, chests, crafting recipes, command console, progress, translations and application lifecycle.
- `style.css`: the logical pixel grid, integer GUI scaling, bevels, book paper, tooltips, hotbar and responsive behavior.

## Commands

```sh
npm ci
npm run dev
npm run lint
npm run typecheck
npm run build
npm run preview
npx playwright install chromium
npm test
npm run publish:static
```

Development: http://127.0.0.1:5174/static_cv/ (the QA session used port 5175 because 5174 was occupied).
Production preview: http://127.0.0.1:4174/static_cv/.
`npm run build` writes `dist/`. `npm run publish:static` copies the validated build to the repository root for the existing GitHub Pages setup. It does not commit or push automatically.
Tests accept the URL through `CV_TEST_URL` when set; by default they target the QA development server.

The shipped artwork and PDF are checked in, so no Python installation is required to run or build the website. To regenerate the original artwork or PDF after updating the source data:

```sh
python3 -m venv .venv
.venv/bin/pip install Pillow reportlab
.venv/bin/python scripts/make-assets.py
.venv/bin/python scripts/make-resume.py
npm run build
```

## Features

Survival inventory with armor and offhand slots; 27 inventory slots and 9 hotbar slots; 2×2 crafting area with resume output; 3×3 skill recipes; player pointer tracking; Minecraft Java Edition item sprites and optional glint; project/research/education/experience/publication/award chests; paginated project and CV books; full-size images; real PDF download; English/Korean switching; factual item counts; exploration XP; optional sounds; advancement notifications; commands with Tab completion; 1–9/E/Escape/arrow/Enter keyboard controls; touch navigation; F1 hints toggle; F-key, character-click and Konami-code secrets; clean direct links; themed 404; semantic labels and keyboard focus; reduced-motion support; no analytics or trackers.

## Content and assets

Root `data.json` has not been changed. All 6 projects, 4 experience entries, 2 education entries, 3 publication/concept entries, 1 award and 4 skill groups remain accessible. The pre-filing patent concept is still explicitly a concept, and the ongoing education date remains as supplied. No proficiency numbers, jobs, degrees, dates, or achievements were invented. XP measures sections visited, not experience or skill.

No manual assets are required. The downloadable English PDF was generated from the existing CV; it is not a previously supplied official résumé. A replacement classic-width 64×64 skin is optional. Asset provenance and font licensing are in `minecraft/public/minecraft/ASSET-LICENSES.md`.

## Review passes

1. Functional: inventory counts, content routes, item selection and downloads.
2. Visual: survival proportions, bevel directions, item shapes, book and chest screens.
3. Interaction: head movement, hover/focus tooltips, page arrows, sound controls and commands.
4. Responsive: 2560×1440, 1920×1080, 1600×900, 1440×900, 1366×768, 768×1024, 390×844, 844×390 and 320×568.
5. Performance: persistent player renderer, nearest filtering, paused hidden preview, no rerender on pointer motion, static landscape.
6. Accessibility: labels, focused headings, keyboard grids, touch selection, command focus containment and reduced motion.
7. Content: unchanged data file, exact record counts, full English/Korean project text recovered across pages.
8. Style: obsolete scroll styles and scripts are not imported by the new entry point; no rounded/glass UI.
9. Pixels: slot widths remain multiples of 18; sprite images are Minecraft 16px textures; integer GUI scaling; non-antialiased player canvas.
10. Release: lint, typecheck, production build, direct HTML route entries and final regression suite.

## Practical limits

- It is a web recreation using Mojang/Microsoft game textures with original synthesized sounds; asset rights and download provenance are documented.
- The background is a static block panorama; it is not a walkable game world.
- Small screens may use 1× GUI scale; browser zoom remains available. Touch opens items directly rather than requiring dragging.
- WebGL-unavailable browsers receive a flat character fallback. Automated testing uses Chromium, including touch/high-DPI/reduced-motion emulation; a physical iPhone/Safari session has not been run.
- The PDF is English; the interactive CV is English/Korean. Regenerate the PDF using the command above when CV data changes.
- GitHub is linked to the repository owner's account; no project repository URLs were invented because the original project records did not include them.

## Final validation

The final production build passed all 10 Playwright tests (17.2 seconds), ESLint, and TypeScript checking. The generated four-page PDF was rendered and visually inspected; no split entries or clipped text remained. The root CV data file is byte-for-byte unchanged from the pre-redesign version. The production renderer chunk is approximately 127 KB gzip.

See `docs/minecraft-files.txt` for the complete changed-file list, including generated route entry points and public assets.

## September sidebar and texture revision

Eight persistent numbered tabs beside the armor panel replace duplicated section items and the navigation hotbar: Home, About, Experience, Education, Work, Skills, Papers, Contact. On narrow screens the numbers remain visible and accessible names retain the labels. Key 9 downloads the CV. Each chest record uses a distinct sprite, and each chest contains only its own records. The survival screen shows equipment, the player, an actual award, and resume output. Downloaded inventory, chest, book, panorama, and Steve textures replace the recreated artwork. Asset downloads require Python 3 only; application dependencies and run/build commands are unchanged.

## Cherry world and researcher outfit — September 8

The existing Steve model now wears a geometric pixel-scale white lab coat with sleeves, lapels, pockets, buttons and a blue badge. This is an original 3D overlay; the downloaded skin file remains unchanged. `systems/world.ts` provides a gently moving cherry panorama, pointer-reactive falling petals, a shake-blossoms button, and clock controls for noon, dusk and night. Time selection persists locally. Night adds a dark sky treatment and pixel stars; reduced-motion disables the panorama drift and automatic petals. The scene uses the existing attributed panorama and clock texture without new asset downloads.

## Daylight and original cherry particles correction

The baked sunset panorama has been replaced by a lightweight instanced-block cherry grove (`systems/grove.ts`). Noon uses a blue sky and daylight illumination; dusk and night change scene lighting, fog, and the celestial disc. The grove uses original Java Edition cherry leaves/log, grass, and dirt textures. Falling petals use the exact 12 `particle/cherry_*.png` game sprites, continuously emitted without pointer repulsion, click bursts, or a shake button. Utility and clock buttons are compact; time labels and accessible names remain present. Asset URLs and SHA-256 hashes are recorded in the source manifest. The tree arrangement is recreated geometry, not a captured Minecraft world. Reduced-motion stops camera drift and falling petals.

## Mobile layout and touch wind

On phones, the eight section tabs sit above the 176-unit inventory so its edges retain comfortable margins. Utility controls are grouped into two compact rows. The original game particle sprites continue falling automatically; touches and swipes in the background impart temporary wind to nearby particles without spawning bursts or blocking page gestures. The mobile camera frames a nearer part of the cherry grove. Desktop sidebar navigation is unchanged.
