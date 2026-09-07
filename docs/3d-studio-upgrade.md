# 3D studio upgrade

The Classic CV remains the default page. Its 3D button and `?view=3d` open the upgraded studio; Minecraft routes are unchanged.

## Backup and restore

`backups/3d-cv-before-upgrade-2026-09-07/original-3d-cv.zip` contains a standalone pre-upgrade Classic/3D site from commit `0c810c4`, including scene code, styles, scripts, Three.js, CV data, and images. The adjacent SHA-256 manifest records each source file. Extract into a separate directory and run `python3 -m http.server 8080`; open `http://localhost:8080/?view=3d`. Restore only in a separate folder first to avoid overwriting subsequent CV content changes.

## Implementation

- `assets/js/world-details.js`: cached beveled geometry, deterministic oak/stone/fabric/plaster color and bump maps, studio reflection environment, furnishings, architectural elements, courtyard, rover details, and hierarchical robot-arm joints.
- `metaverse.js`: integrates the scene details, maps material roles to textures, corrects wheel orientation/ground clearance, updates arm articulation, adds a skylight and ceiling, and initializes WebGL only when 3D is opened.
- No new runtime dependencies, external texture requests, downloaded models, or third-party artwork. Procedural maps are generated locally from a fixed seed; existing CV artwork retains its original provenance.
- Shadow resolution is 1024 on coarse-pointer devices and 2048 on desktop. Device pixel ratio remains capped at 1.5. Geometry and material maps are reused; reflections use one prefiltered environment, not per-frame mirrors.
- Existing bilingual exhibit content, movement, mobile controls, reset, reduced-motion handling, and return navigation remain available.

## Verification

`npm run lint`, `npm run typecheck`, `npm run build`, and Playwright cover view switching, the original Minecraft CV, all seven 3D exhibit panels, keyboard movement/reset, mobile touch movement, and deferred WebGL initialization. Desktop and mobile screenshots are written to `test-results/studio-desktop.png` and `test-results/studio-mobile.png` by the 3D suite.

This remains a stylized, browser-rendered architectural scene. The sky/environment is procedural, and material relief uses bump mapping rather than geometric displacement. The robotics props illustrate the space; they are not engineering reconstructions of the user's physical projects.

## Exhibit visibility fix — September 8

Exhibits explicitly reveal cloned content instead of inheriting the classic page's scroll-animation hidden states. About/experience sections lose their long-page sticky positioning inside dialogs, and GPA counters display their actual stored values immediately. Regression checks now inspect computed visibility of record content, rather than merely checking that a dialog contains DOM nodes.
