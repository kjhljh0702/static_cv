# Inventory CV asset provenance

This is an unofficial personal CV. Minecraft is a trademark of Mojang/Microsoft; this project is not affiliated with or endorsed by them.

- Actual Java Edition 1.20.1 textures: files listed in `source-manifest.json` include original item sprites, GUI atlases, the title panorama face, Steve skin, cherry-tree/terrain block textures, and the 12 original cherry particle sprites. Download source: https://github.com/InventivetalentDev/minecraft-assets/tree/1.20.1/assets/minecraft/textures. Each source URL and SHA-256 is recorded in the manifest; `scripts/fetch-minecraft-assets.py` reproduces the downloads.
- These game assets are copyrighted by Mojang/Microsoft. The mirror does not grant an open-source license to the game artwork. This personal site is unofficial; the artwork is not claimed as original or licensed under this repository's code license.
- Legacy unreferenced custom item sprites, `skin/player.png`, `skin/player-front.png`, and `backgrounds/plains.png` were generated for the earlier design. The flat player image remains a loading-failure fallback. The old generator is retired to prevent overwriting downloaded assets.
- Active player texture: `skin/steve.png`. An optional personal skin can replace this file with a compatible 64×64 classic-width skin.
- Sidebar bevels, tooltips, XP, and glint are CSS implementations; inventory, chest and book backgrounds use the downloaded GUI atlases.
- Sounds: original short synthesized tones in `minecraft/src/systems/sound.ts`, off by default. No game recordings or music included.
- `fonts/neodgm.woff2`: NeoDGM, SIL Open Font License 1.1. Full license is in `fonts/LICENSE.txt`. Source: https://github.com/neodgm/neodgm-webfont.
- Three.js: MIT license, retained in the bundled source license comments and in the existing `vendor/LICENSE`.
- CV text, portrait, project images, and award certificate are the pre-existing user-provided content from this repository. Their existing rights remain unchanged.

No assets need to be supplied manually for the current site to run. A personal skin is optional.
