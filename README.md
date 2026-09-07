# Jeonghun Lee — Classic, Minecraft & 3D CV

A personal, bilingual CV. The restored Claude CV is the default; its header provides Minecraft and 3D view buttons.

**Live:** https://kjhljh0702.github.io/static_cv/

The interface includes a skinned Three.js player that follows the pointer, numbered sidebar navigation, chests, paginated books, crafting recipes, exploration XP, optional synthesized sounds, keyboard shortcuts, and a downloadable CV.

## Run

```sh
npm ci
npm run dev
```

Open the URL printed by Vite (normally `http://127.0.0.1:5174/static_cv/`).

## Validate and build

```sh
npm run lint
npm run typecheck
npm run build
npm run preview
npx playwright install chromium
CV_TEST_URL=http://127.0.0.1:4174/static_cv/ npm test
```

## Publish to the existing GitHub Pages repository

```sh
npm run build
npm run publish:static
```

Commit the resulting root entry points, route directories, `mc-assets/`, and `minecraft/` assets, then push to `main`. The existing GitHub Pages workflow publishes from the repository root. The default page template is `classic/index.html`, with its existing implementation in `assets/`, `style.css`, and `metaverse.js`. Minecraft source is in `minecraft/src/`; `data.json` remains the single CV content source. `404.html` provides a themed unknown-route screen, and known routes have generated HTML entry points for direct visits.

## Controls

- Click/tap an item to inspect it; hover or keyboard focus shows its tooltip.
- `1–8`: sidebar sections; `9`: download CV; `E`: inventory; `Esc`: parent screen.
- Arrow keys and Enter navigate inventory slots.
- `/` or `T`: command console; Tab autocompletes; `/help` lists commands.
- Sound starts off; use the Sound button to enable it.
- English/Korean is controlled by the language button.

## Content, documentation, and assets

[Delivery notes](docs/minecraft-delivery.md) cover architecture, all commands, review passes, and limitations. [Changed file manifest](docs/minecraft-files.txt) lists every file in this redesign. [Asset provenance](minecraft/public/minecraft/ASSET-LICENSES.md) records original artwork, generated audio, font licensing, and the optional replacement skin format.

No manual assets are required. The English PDF is generated from the existing CV data. To regenerate it after updating `data.json`, follow the commands in the delivery notes.

The previous designs remain in Git history, and the local `Claude made CV/` backup is untouched. The classic CV uses the previously restored Claude design, including the mobile portrait and Korean typography fixes. `?view=3d` opens the existing 3D world; `/inventory/` opens Minecraft. Minecraft’s toolbar links back to the default CV and 3D.

This is an unofficial personal project, not affiliated with Mojang or Microsoft. Minecraft Java Edition textures are sourced from the public asset mirror and remain Mojang/Microsoft copyrighted artwork; see asset provenance. No game sound recordings or music are included.

## 3D studio

The 3D view includes textured oak, stone, fabric and plaster, beveled furnishings, articulated robotics props, a skylight, and an exterior courtyard. WebGL initializes only when 3D is selected. See [upgrade and backup notes](docs/3d-studio-upgrade.md). The pre-upgrade standalone snapshot is in `backups/3d-cv-before-upgrade-2026-09-07/`.

The Classic CV also includes a scroll-progress chapter dock, chapter jump controls, scroll-linked project image framing, and progress accents on education, skills, and papers. Mobile project records flow vertically with sharp, readable text and portrait imagery. These enhancements live in `assets/js/scroll-story.js` and respect reduced motion.
