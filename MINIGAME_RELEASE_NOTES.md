# GIMORA — Urban Underworld mini-game release

A separate playable browser mini-game was packaged on October 24, 2026 using the two GLB files supplied by the project owner:

- `public/assets/buildings/city-upload.glb` (~22.2 MB)
- `public/assets/vehicles/zenvo-tsr-s.glb` (~12.9 MB)

The stand-alone game package includes:
- Intro/menu and animated camera
- Walking, enter/exit car, arcade acceleration, steering, braking
- Six linked fictional missions and a free-roam completion state
- 8 moving AI traffic cars, 18 simple pedestrians and 2 patrol cars
- Minimap, pause, graphics quality, audio control and local save/resume
- Node.js static HTTP launcher for Windows
- Automated dependency-free tests (7/7 passing)

**Scope:** This is a separate *small-scope playable mini-game release*, not a full GTA-sized game or a merged replacement for this repository's React application. The release ZIP was delivered separately to the project owner and is not stored in this public repository. Only the text-based integration changes and docs remain on this development branch.

**Testing performed:** Node syntax tests, automated core rules tests, HTTP asset checks and GLB header checks passed. Live browser WebGL rendering and real GPU FPS could not be tested due to sandbox browser restrictions.

**Asset copyright:** Zenvo model embedded metadata credits kevin (ケビン), CC BY 4.0. The uploaded city model has no verified license metadata, so its publication rights must be checked before public redistribution.

**Requirements to run local mini-game:** Unzip the delivered release pack, double-click `START_GAME_WINDOWS.bat` (Node.js required), then open `http://localhost:8000`. Three.js is loaded from jsDelivr and needs internet access.

The parent PR remains reviewable; no direct modifications to the default main branch were made.
