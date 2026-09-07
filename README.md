# Jeonghun Lee — Inventory CV

A personal, bilingual CV presented as a Minecraft-style survival inventory.

**Live:** https://kjhljh0702.github.io/static_cv/

The interface includes a skinned Three.js player that follows the pointer, inventory-item navigation, chests, paginated books, crafting recipes, exploration XP, optional synthesized sounds, keyboard shortcuts, and a downloadable CV.

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

Commit the resulting root entry points, route directories, `mc-assets/`, and `minecraft/` assets, then push to `main`. The existing GitHub Pages workflow publishes from the repository root. Source is in `minecraft/src/`; `data.json` remains the single CV content source. `404.html` provides a themed unknown-route screen, and known routes have generated HTML entry points for direct visits.

## Controls

- Click/tap an item to inspect it; hover or keyboard focus shows its tooltip.
- `1–9`: hotbar shortcuts; `E`: inventory; `Esc`: parent screen.
- Arrow keys and Enter navigate inventory slots.
- `/` or `T`: command console; Tab autocompletes; `/help` lists commands.
- Sound starts off; use the Sound button to enable it.
- English/Korean is controlled by the language button.

## Content, documentation, and assets

[Delivery notes](docs/minecraft-delivery.md) cover architecture, all commands, review passes, and limitations. [Changed file manifest](docs/minecraft-files.txt) lists every file in this redesign. [Asset provenance](minecraft/public/minecraft/ASSET-LICENSES.md) records original artwork, generated audio, font licensing, and the optional replacement skin format.

No manual assets are required. The English PDF is generated from the existing CV data. To regenerate it after updating `data.json`, follow the commands in the delivery notes.

The previous designs remain in Git history, and the local `Claude made CV/` backup is untouched. The previous `assets/`, `metaverse.js`, `style.css`, and `script.js` are retained but are not loaded by the new entry point.

This is an unofficial personal project, not affiliated with Mojang or Microsoft. No Minecraft game textures, skins, sound recordings, or music are redistributed.
