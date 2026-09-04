# Jeonghun Lee — Code, Intelligence & Motion

A bilingual personal CV and research portfolio: warm ivory, electric blue, editorial typography, scroll animations, and an interactive 3D sculpture.

## Original backup

**`Claude made CV/`** is the verified snapshot taken before this redesign on September 4, 2026. All 92 source, image, vendor, and documentation files were copied; Git metadata and `.DS_Store` were excluded. The original site can be served directly from that folder. The older `_backup_original_2026-09-03/` snapshot is preserved as well.

## Run and edit

```sh
npm install
npm run dev
```

The preview runs at `http://127.0.0.1:5173/`. Edit `app/App.jsx`, `app/style.css`, or the bilingual source of truth in `data.json`.

```sh
npm run build
```

The build creates `dist/` and copies the deployable `index.html` and `compiled/` assets to the repository root. This preserves static hosting compatibility, including GitHub Pages subdirectory hosting. Serve through HTTP; ES modules are not intended for `file://` navigation. `app/index.html` is the editable HTML entry; root `index.html` is generated. `npm run preview` serves the production build on port 4173.

The production archive contains only the new site and the images it uses. The Claude backup and unrelated PRD exports are not part of the published output.

## Features

- Anime.js entrance choreography and scroll-synchronized manifesto typography, progress, and rotation.
- A separately loaded Threlte/Svelte/Three.js scene mounted inside React, with cursor response, mouse drag, scroll-linked rotation, and three selectable geometries.
- Official Magic UI Border Beam and Number Ticker components, with the MIT license retained in `app/components/magicui/LICENSE.md`.
- English/Korean content and locally remembered language preference.
- Six filterable research and engineering projects, full project dialogs, and certificate viewing.
- Expandable experience, education, research outputs, awards, and skills.
- Email link, clipboard action, LinkedIn, keyboard navigation, mobile navigation, focus restoration, and reduced-motion controls.
- A separate print layout containing the full CV; use “Print / save CV” and choose Save as PDF in your browser.
- The 3D scene stops updating outside its visible area, when the document is hidden, or when motion is paused. WebGL failure falls back to the static typographic form.

## Vectary and Jitter exports

These are editor/export integrations, not claims that remote assets have already been authored in those services. The default portfolio is complete without an account, external embed, or supplied export.

Set optional assets in `app/media.config.js`:

- **Vectary** (the 3D editor): export a `.glb`, place it in `res/`, and set `vectaryModel` to `./res/filename.glb`. The Threlte scene loads, centers, and scales the model in place of the default sculpture. Its original materials are retained. Invalid exports preserve the default scene.
- **Jitter**: export a `.webm` or `.mp4`, place it in `res/`, and set `jitterVideo`. Add a static image as `jitterPoster`. The optional decorative clip appears in the contact section, stays muted, and follows the page’s motion toggle. No Jitter asset was supplied or generated for this version.

Sources: [Anime.js](https://animejs.com/documentation/events/onscroll/), [Magic UI](https://magicui.design/docs/components/border-beam), [Threlte](https://threlte.xyz/docs/reference/core/getting-started/), [Vectary export documentation](https://help.vectary.com/documentation/sharing-exporting-embedding/export-options), [Jitter](https://jitter.video/).

## Data integrity

The existing `data.json` and all original images are unchanged. Project labels and introduction copy are editorial summaries of that data. The 2027 degree is explicitly marked expected, and the 2024 patent output remains a pre-filing concept. The small code panel is a conceptual visualization, not a screenshot of a published implementation.
