# Real Building Physics & Multi-Channel PBR Architectural Textures

This plan upgrades the 3D metropolis with a deterministic spatial physics and collision engine—enforcing strict solid wall stopping, grounded walking/sprinting kinematics, vertical gravity/step-up elevation, and camera anti-clipping—paired with multi-channel Physically Based Rendering (PBR) building materials for masonry podiums, curtain-wall glass, and 3D interior depth.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and physics decisions incorporate your confirmed preference and recommended defaults for physical realism:

- **Confirmed Decision — Strict Solid Wall Stopping & Grounded Movement Physics**: Player and first/third-person camera movement will enforce strict solid collision against all building podiums, skyscraper shafts, world landmarks, and river embankments, stopping cleanly upon contact without passing or clipping through walls, paired with grounded walking, sprinting, and vertical gravity.
- **Default Choice — Full 3D Spatial Collider Registry & Camera Anti-Clipping**: Every landmark, instanced city-block tower, bridge deck, and plaza registers its 3D bounding volume in a centralized spatial hash grid for sub-millisecond collision resolution and spring-arm camera occlusion protection.
- **Default Choice — Multi-Channel PBR Masonry, Glass & Interior Depth**: Building facades combine distinct Albedo, Normal, Roughness, Metalness, and Emissive Interior Parallax maps so limestone/granite podiums feel tactile and matte while curtain-wall glass panes exhibit crisp sky reflections and recessed interior rooms.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms the city's buildings from purely visual meshes into solid physical structures with authentic surface materials. Exploring at street level or in third/first-person mode obeys real-world physical constraints—solid building walls block movement, sidewalks and bridge ramps adjust player elevation naturally, sprinting and jumping follow realistic acceleration and gravity curves, and close-up building inspection reveals high-resolution stone masonry, mortar joints, brushed metal mullions, and multi-layered office/residential interiors.
- **Target Audience / Persona**: Urban explorers, architectural visualization viewers, and simulation users navigating the metropolis from both aerial orbit views and street-level pedestrian perspectives.
- **Key Value**: Eliminates ghosting/clipping through buildings and flat-looking surfaces, delivering a grounded, tactile, and physically believable 3D urban environment.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Grounded Street-Level Exploration (`Walk` / `3rd Person` Modes)**: The user walks (`WASD` / Arrows) and sprints (`Shift`) along sidewalks, plazas, and riverfront promenades with realistic acceleration, deceleration damping, animated stride kinematics, and subtle head-bob.
  2. **Strict Building Wall Collision**: Approaching any skyscraper podium, world landmark (Marina Bay Sands, Eiffel Tower piers, Empire State base, Mohit Hub), or river parapet halts forward motion against the solid boundary at a natural body radius without camera jitter or wall penetration.
  3. **Elevation & Vertical Physics**: Stepping onto raised sidewalks (`+0.25m`), plaza podiums, or river bridge approaches smoothly transitions vertical height, while pressing `Space` triggers a physics-driven jump with gravitational acceleration (`9.81 m/s²`) and solid ground landing.
  4. **Close-Up Architectural Inspection**: Orbiting or walking up to any building reveals distinct physical material properties—rough ashlar granite and brick mortar at street level, specular anodized aluminum mullions, clearcoat reflective glass panes, and warm illuminated 3D interior rooms.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Photorealistic contemporary architectural visualization with physical material contrast.
  - *Color Palette & Mood*: Natural daylight and golden-hour architectural tones—warm Indiana limestone (`#D6CFC2`), charcoal granite (`#27272A`), sapphire low-iron curtain glass (`#1E3A5F`), and warm interior tungsten illumination (`#FEF3C7`), framed by a minimal obsidian HUD (`rgba(15, 23, 42, 0.85)`).
  - *Typography & Hierarchy*: Crisp geometric sans (`Plus Jakarta Sans` / system sans) for minimal HUD navigation and building inspection overlays, paired with `tabular-nums` monospace readouts for coordinates and structural metrics.
  - *Component Styling & Layout*: Unobstructed 100% full-viewport 3D canvas with consolidated top-bar controls and a clean slide-over inspector drawer when a building is clicked.
- **Interactive Feedback & Motion**:
  - Frame-rate independent exponential damping (`THREE.MathUtils.damp`) on velocity, sprint FOV widening, and third-person camera spring-arm retraction when rotating near building facades.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Spatial Hash Grid AABB + Cylinder Physics Engine vs. Heavy External WASM Physics**
  - *Chosen Approach*: A dedicated, zero-allocation TypeScript 3D Spatial Physics & Collision Engine (`CityPhysicsEngine`) supporting Axis-Aligned Bounding Boxes (AABBs), oriented boxes, cylindrical landmark piers, and elevation heightfields (sidewalks, bridges, water bounds).
  - *Why*: Delivers exact, deterministic strict wall stopping at 60 FPS across 300+ buildings and landmarks with zero garbage collection spikes or WASM bundle overhead.
  - *Alternatives Considered*: Full rigid-body mesh triangulation for every window mullion, which would degrade frame rates without improving pedestrian or camera collision accuracy.
- **Decision 2: Multi-Material Tiered Facades & PBR Texture Channels**
  - *Chosen Approach*: Separate PBR material definitions and UV-calibrated procedural maps (Albedo, Normal bump, Roughness, Metalness, and Emissive Interior) for (1) Street-Level Masonry Podiums (ashlar stone, travertine, architectural brick), (2) Curtain-Wall Mullion Grids, and (3) Clearcoat Reflective Window Panes.
  - *Why*: Ensures a clear roughness and metalness contrast (`Δroughness >= 0.5`) between matte stone/concrete structure and mirror-like glass panes under Image-Based Lighting (PMREM).

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           3D Metropolis Scene                              │
└───────────────────┬────────────────────────────────────┬───────────────────┘
                    │                                    │
                    ▼                                    ▼
┌───────────────────────────────────────┐  ┌─────────────────────────────────┐
│     Multi-Channel PBR Asset Engine    │  │   3D Spatial Physics Engine     │
│  ┌─────────────────────────────────┐  │  │  ┌───────────────────────────┐  │
│  │ Stone / Brick / Granite Podium  │  │  │  │ Spatial Hash Grid (20m)   │  │
│  │ Albedo + Normal + Roughness Map │  │  │  │ Static Building Colliders │  │
│  └─────────────────────────────────┘  │  │  └─────────────┬─────────────┘  │
│  ┌─────────────────────────────────┐  │  │                │                │
│  │ Curtain-Wall Glass & Mullions   │  │  │  ┌─────────────▼─────────────┐  │
│  │ Clearcoat + Metalness + Bump    │  │  │  │ Strict Solid Wall Solver  │  │
│  └─────────────────────────────────┘  │  │  │ Ground / Curb / Gravity   │  │
│  ┌─────────────────────────────────┐  │  │  └─────────────┬─────────────┘  │
│  │ 3D Interior Room Parallax Grid  │  │  │                │                │
│  │ Ceiling Troffers + Blinds + AO  │  │  │  ┌─────────────▼─────────────┐  │
│  └─────────────────────────────────┘  │  │  │ Camera Spring-Arm Raycast │  │
└───────────────────┬───────────────────┘  │  │ Anti-Clipping Protection  │  │
                    │                      │  └─────────────┬─────────────┘  │
                    ▼                      └────────────────┼────────────────┘
┌───────────────────────────────────────┐                   │
│  Landmark & City-Block Builders       │───────────────────┘
│  (Registers Exact Physical Bounds)    │
└───────────────────────────────────────┘
```

### Data Model & State

- **`BuildingCollider`**: Represents a physical structure in the spatial grid (`id`, `minX`, `maxX`, `minZ`, `maxZ`, `maxY`, `shape: 'box' | 'cylinder'`, `isWalkableSurface: boolean`).
- **`PlayerPhysicsState`**: Tracks grounded position `(x, y, z)`, horizontal velocity `(vx, vz)`, vertical velocity `vy`, `isGrounded`, `isSprinting`, `stepHeight` (`0.35m` for curbs), and `collisionRadius` (`0.65m`).
- **`PBRMaterialSet`**: Encapsulates synchronized `map` (SRGB Albedo), `normalMap` (Tangent-space bump), `roughnessMap` (Micro-surface scatter), `metalnessMap` (Mullion vs. glass vs. stone mask), and `emissiveMap` (Interior lighting).

### Interactive Component & State Mapping

- **Building Registration Flow**: When `BuildingsManager`, `WorldLandmarks`, `DubaiLandmarks`, `RailwayDistrict`, and `AirportDistrict` instantiate towers and terminals, each structure registers its exact world-space footprint into the physics engine.
- **Pedestrian & First-Person Movement Loop**:
  1. Reads directional input (`WASD` / Arrows), sprint (`Shift`), and jump (`Space`).
  2. Applies grounded acceleration and friction damping to compute candidate position.
  3. Queries the spatial hash grid for nearby building colliders and river walls; if an intersection occurs, enforces strict solid wall stopping along the blocked axis so the player halts cleanly against the facade.
  4. Evaluates surface height (`groundHeightAt(x, z)`) across streets (`0.0m`), sidewalks/parks (`0.25m`), and river bridge decks, applying gravity (`-24 m/s²` game-tuned snappiness) when airborne.
- **Camera Anti-Clipping**: In third-person and orbit modes, clamps minimum ground clearance and raycasts between the look-at target and camera position against building colliders so the camera smoothly pulls in rather than clipping inside adjacent skyscrapers.
