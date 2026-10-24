# Real GLB Asset Installation — GIMORA

The optional GLB district and Zenvo code on this branch expects **two user-provided binary GLB files**:

```text
public/assets/buildings/city-upload.glb
public/assets/vehicles/zenvo-tsr-s.glb
```

The actual binary files are **not committed to this public repository**. Add them only if you have redistribution rights. The uploaded city model's license was not verified.

The city GLB contains approximately 2,780 mesh objects and is about 22 MB; the car is about 13 MB. This can be expensive on integrated graphics. Test before enabling high resolution.

## Use in Google AI Studio

1. Import or sync the project and switch to branch `feature/glb-import-reliability`.
2. Copy the actual .glb files into the two paths above without renaming them.
3. Run the existing Vite app and check Network/Console for successful GLB loads.
4. Imported city is an **additional district**; existing game roads and collisions remain separate.
5. Zenvo experimental car physics: **I** accelerate, **K** reverse, **J/L** steering, **Space** braking. This is an arcade prototype, not realistic tyre/suspension simulation.
6. Check that FPS is usable and models are upright, visible, correctly scaled and above ground.
7. Review [Pull Request #1](https://github.com/MohitLovanshi372/GIMORA/pull/1). Do not merge until tests pass.

## Model attribution

Uploaded Zenvo GLB `2020 Zenvo TSR-S | Special Thanks 200 Followers`:
- Creator: **kevin (ケビン)**
- Source: https://sketchfab.com/3d-models/2020-zenvo-tsr-s-special-thanks-200-followers-fb6cf76582824f2b83205571f741d66f
- License embedded in GLB: **CC BY 4.0** (https://creativecommons.org/licenses/by/4.0/)

The file should be credited if published or redistributed. Verify license/provenance of the city GLB separately before publication.

## Standalone browser preview

A separate playable HTML/Three.js preview can load these assets with a Start Game screen, on-foot exploration, keyboard/touch controls, arcade driving, and three checkpoints. This preview is not a replacement for the complete React GIMORA application.

For static hosting, use a local HTTP server; opening index.html directly as file:// will commonly fail because GLB loading needs HTTP. WebGL and Internet access for the Three.js CDN are required.

## Scope limitations

GLB loading and kinematic movement do not automatically create mesh-accurate building collisions, working mission scripts, vehicle wheel animation, realistic physics, police AI, an open-world campaign or a finished packaged game.
