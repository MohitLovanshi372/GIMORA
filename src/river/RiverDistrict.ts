/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { BuildingData } from '../city/types';
import { CityMaterials } from '../assets/materials';

export interface RiverDistrictSystem {
  group: THREE.Group;
  buildingsData: BuildingData[];
  interactiveMeshes: THREE.Object3D[];
  update: (time: number) => void;
  dispose: () => void;
}

export function createRiverDistrict(
  scene: THREE.Scene,
  materials: CityMaterials
): RiverDistrictSystem {
  const group = new THREE.Group();
  group.name = 'riverside_district';

  const buildingsData: BuildingData[] = [];
  const interactiveMeshes: THREE.Object3D[] = [];

  const riverWidth = 56;
  const halfWidth = riverWidth / 2;
  const riverLength = 650;
  const riverY = -1.8;

  // 1. ADVANCED ANIMATED WATER SURFACE (Photorealistic Metropolitan River)
  const waterGeometry = new THREE.PlaneGeometry(riverWidth, riverLength, 64, 160);
  waterGeometry.rotateX(-Math.PI / 2);

  const waterMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorDeep: { value: new THREE.Color(0x0c2538) },
      uColorShallow: { value: new THREE.Color(0x1a4664) },
      uColorSkyReflection: { value: new THREE.Color(0x93c5fd) },
      uColorSunHighlight: { value: new THREE.Color(0xfffbeb) },
      uColorBridgeGlow: { value: new THREE.Color(0xfef3c7) },
      uRainIntensity: { value: 0.0 },
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vNormal;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Primary swell waves
        float wave1 = sin(pos.z * 0.06 + uTime * 1.8) * 0.28;
        float wave2 = cos(pos.x * 0.12 + pos.z * 0.03 + uTime * 2.2) * 0.20;
        // High-frequency capillary ripples
        float microWave = sin(pos.x * 0.4 + pos.z * 0.5 + uTime * 4.5) * 0.08;
        pos.y += wave1 + wave2 + microWave;

        // Approximate wave normal
        float dYdX = -0.12 * sin(pos.x * 0.12 + pos.z * 0.03 + uTime * 2.2) * 0.20 +
                     0.4 * cos(pos.x * 0.4 + pos.z * 0.5 + uTime * 4.5) * 0.08;
        float dYdZ = 0.06 * cos(pos.z * 0.06 + uTime * 1.8) * 0.28 +
                     0.5 * cos(pos.x * 0.4 + pos.z * 0.5 + uTime * 4.5) * 0.08;
        vNormal = normalize(vec3(-dYdX, 1.0, -dYdZ));

        vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
        gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColorDeep;
      uniform vec3 uColorShallow;
      uniform vec3 uColorSkyReflection;
      uniform vec3 uColorSunHighlight;
      uniform vec3 uColorBridgeGlow;
      uniform float uRainIntensity;
      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vNormal;

      void main() {
        // View direction for Fresnel
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.2);

        // Water base color gradient across river width
        vec3 baseWater = mix(uColorDeep, uColorShallow, sin(vUv.x * 3.14159) * 0.6 + 0.4);

        // Natural bridge warmth reflection
        float bridgeGlow1 = smoothstep(25.0, 0.0, abs(vWorldPos.z));        // Central Bridge (Z=0)
        float bridgeGlow2 = smoothstep(25.0, 0.0, abs(vWorldPos.z + 160.0)); // North Bridge (Z=-160)
        float bridgeGlow3 = smoothstep(25.0, 0.0, abs(vWorldPos.z - 160.0)); // South Bridge (Z=160)
        float bridgeReflectionMask = clamp(bridgeGlow1 + bridgeGlow2 + bridgeGlow3, 0.0, 1.0);

        // Dynamic natural water ripples
        float rippleA = sin(vWorldPos.z * 0.4 + uTime * 3.0) * cos(vWorldPos.x * 0.4 - uTime * 2.5);
        float rippleB = sin(vWorldPos.z * 1.4 - uTime * 4.2) * sin(vWorldPos.x * 1.2 + uTime * 3.6);
        float specularGlint = pow(clamp((rippleA + rippleB * 0.5) * 0.5 + 0.5, 0.0, 1.0), 5.0) * 1.2;

        // Sky and bridge natural color reflections
        vec3 skyReflection = mix(uColorSkyReflection, uColorBridgeGlow, bridgeReflectionMask * 0.45);

        // Embankment shoreline foam / rim illumination
        float edgeDist = abs(vUv.x - 0.5) * 2.0;
        float shorelineFoam = smoothstep(0.90, 0.99, edgeDist) * 0.45;

        // Specular sunlight highlight
        vec3 lightDir = normalize(vec3(160.0, 260.0, 120.0));
        vec3 reflectDir = reflect(-lightDir, vNormal);
        float sunSpec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0) * 0.85;

        // Combine all lighting components
        vec3 finalColor = baseWater +
                          (skyReflection * specularGlint * (0.5 + fresnel * 0.75)) +
                          (uColorBridgeGlow * bridgeReflectionMask * 0.15) +
                          (vec3(0.7, 0.85, 0.95) * shorelineFoam) +
                          (uColorSunHighlight * sunSpec);

        gl_FragColor = vec4(finalColor, 0.96);
      }
    `,
    transparent: true,
  });

  const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
  waterMesh.position.set(0, riverY, 0);
  waterMesh.receiveShadow = true;
  group.add(waterMesh);

  // Riverbed
  const bedGeo = new THREE.PlaneGeometry(riverWidth + 10, riverLength, 4, 32);
  bedGeo.rotateX(-Math.PI / 2);
  const bedMesh = new THREE.Mesh(bedGeo, materials.metalDark);
  bedMesh.position.set(0, riverY - 2.5, 0);
  group.add(bedMesh);

  // Concrete Embankment Retaining Walls
  const wallHeight = 2.6;
  const wallThickness = 1.6;
  const wallGeo = new THREE.BoxGeometry(wallThickness, wallHeight, riverLength);

  const westWall = new THREE.Mesh(wallGeo, materials.concrete);
  westWall.position.set(-halfWidth - wallThickness / 2, -wallHeight / 2 + 0.5, 0);
  westWall.receiveShadow = true;
  group.add(westWall);

  const eastWall = westWall.clone();
  eastWall.position.set(halfWidth + wallThickness / 2, -wallHeight / 2 + 0.5, 0);
  group.add(eastWall);

  // Architectural Stainless Steel Handrails along both banks
  const railingGeo = new THREE.CylinderGeometry(0.12, 0.12, riverLength, 8);
  railingGeo.rotateX(Math.PI / 2);

  const westRailing = new THREE.Mesh(railingGeo, materials.metalLight);
  westRailing.position.set(-halfWidth - 0.4, 0.7, 0);
  group.add(westRailing);

  const eastRailing = new THREE.Mesh(railingGeo, materials.metalLight);
  eastRailing.position.set(halfWidth + 0.4, 0.7, 0);
  group.add(eastRailing);

  // Promenades on both sides
  const walkWidth = 10;
  const walkGeo = new THREE.PlaneGeometry(walkWidth, riverLength);
  walkGeo.rotateX(-Math.PI / 2);

  const westWalk = new THREE.Mesh(walkGeo, materials.sidewalk);
  westWalk.position.set(-halfWidth - wallThickness - walkWidth / 2, 0.1, 0);
  westWalk.receiveShadow = true;
  group.add(westWalk);

  const eastWalk = new THREE.Mesh(walkGeo, materials.sidewalk);
  eastWalk.position.set(halfWidth + wallThickness + walkWidth / 2, 0.1, 0);
  eastWalk.receiveShadow = true;
  group.add(eastWalk);

  // 2. RIVERSIDE CAFES & RESTAURANTS (Positioned on dedicated riverside boardwalk piers clear of X=±45 roads)
  // West Bank Bistro: X = -33, Z = -45
  const bistroData: BuildingData = {
    id: 'river-bistro-pavilion',
    name: 'Harbor Terrace Waterfront Bistro',
    districtId: 'riverside',
    districtName: 'Riverside District',
    category: 'Waterfront Venue',
    height: 10,
    floors: 2,
    position: [-33, 0, -45],
    dimensions: [8, 10, 20],
    powerUsage: '1.2 MW',
    occupancy: '92% (420 Diners)',
    networkStatus: 'Guest High-Speed Wi-Fi',
    description: 'Premier waterfront architectural glass dining pavilion featuring outdoor timber dining decks, panoramic sunset river views, and fine dining.',
    features: ['Timber Deck Waterfront Dining', 'Heated Outdoor Cabanas', 'Riverside Cocktail Lounge'],
  };
  buildingsData.push(bistroData);

  const bistroGroup = new THREE.Group();
  bistroGroup.position.set(-33, 0, -45);

  const bistroMesh = new THREE.Mesh(
    new THREE.BoxGeometry(8, 10, 20),
    materials.glassDark
  );
  bistroMesh.position.y = 5;
  bistroMesh.castShadow = true;
  bistroGroup.add(bistroMesh);

  // Outdoor Terrace Platform jutting over water edge
  const deckGeo = new THREE.BoxGeometry(6, 0.5, 18);
  const deck = new THREE.Mesh(deckGeo, materials.sidewalk);
  deck.position.set(5, 0.25, 0);
  bistroGroup.add(deck);

  // Outdoor Tables & Canvas Umbrellas (Clean Cream Canvas)
  const umbrellaMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.85 });
  for (let i = -6; i <= 6; i += 6) {
    const table = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.9, 12), materials.metalLight);
    table.position.set(5, 0.7, i);
    bistroGroup.add(table);

    const umbrella = new THREE.Mesh(new THREE.ConeGeometry(1.8, 0.8, 8), umbrellaMat);
    umbrella.position.set(5, 2.2, i);
    bistroGroup.add(umbrella);
  }

  bistroMesh.userData = { buildingData: bistroData };
  interactiveMeshes.push(bistroMesh);
  group.add(bistroGroup);

  // East Bank Cafe: X = 33, Z = 45
  const cafeData: BuildingData = {
    id: 'river-cyber-cafe',
    name: 'Aqua Marina Harbor Cafe & Yacht Docks',
    districtId: 'riverside',
    districtName: 'Riverside District',
    category: 'Waterfront Venue',
    height: 10,
    floors: 2,
    position: [33, 0, 45],
    dimensions: [8, 10, 20],
    powerUsage: '1.1 MW',
    occupancy: '88% (290 Patrons)',
    networkStatus: 'Municipal Harbor Wireless',
    description: 'Waterfront artisan coffee lounge and yacht club with private boarding docks and sunlit glass terraces.',
    features: ['Direct Boat Slip Access', 'Espresso Roastery Bar', 'Panoramic River Terrace'],
  };
  buildingsData.push(cafeData);

  const cafeMesh = new THREE.Mesh(
    new THREE.BoxGeometry(8, 10, 20),
    materials.glassDark
  );
  cafeMesh.position.set(33, 5, 45);
  cafeMesh.castShadow = true;
  cafeMesh.userData = { buildingData: cafeData };
  interactiveMeshes.push(cafeMesh);
  group.add(cafeMesh);

  // 3. SMALL BOAT DOCKS & FLOATING PONTOONS
  // Dock 1 (West Bank, Z = -90)
  // Dock 2 (East Bank, Z = 90)
  const dockConfigs = [
    { x: -halfWidth, z: -90, dir: 1 },
    { x: halfWidth, z: 90, dir: -1 },
  ];

  dockConfigs.forEach((cfg) => {
    const dockGroup = new THREE.Group();
    dockGroup.position.set(cfg.x, riverY + 0.3, cfg.z);

    // Gangway Ramp
    const gangway = new THREE.Mesh(new THREE.BoxGeometry(10, 0.3, 3), materials.metalLight);
    gangway.position.set(cfg.dir * 5, 0.8, 0);
    gangway.rotation.z = cfg.dir * 0.15;
    dockGroup.add(gangway);

    // Floating Pontoon
    const pontoon = new THREE.Mesh(new THREE.BoxGeometry(8, 0.6, 18), materials.concrete);
    pontoon.position.set(cfg.dir * 9, 0, 0);
    dockGroup.add(pontoon);

    // Dock Timber Edge Fender
    const dockEdge = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.2, 18.2), materials.metalDark);
    dockEdge.position.set(cfg.dir * 9, 0.32, 0);
    dockGroup.add(dockEdge);

    // Mooring Bollards
    [-6, 0, 6].forEach((bz) => {
      const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8), materials.metalLight);
      bollard.position.set(cfg.dir * 12.5, 0.5, bz);
      dockGroup.add(bollard);
    });

    // Moored Luxury Marina Speedboat / Runabout Launch (Sculpted V-Hull, Windscreen & Outboard Motor)
    const skiff = new THREE.Group();
    skiff.position.set(cfg.dir * 13.5, 0.2, 0);

    const hullMat = new THREE.MeshPhysicalMaterial({
      color: cfg.dir > 0 ? 0x0f172a : 0x7f1d1d,
      roughness: 0.16,
      metalness: 0.65,
      clearcoat: 1.0,
    });
    const teakDeckMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.65, metalness: 0.1 });
    const leatherSeatMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.45, metalness: 0.05 });

    const hullBody = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.95, 6.4), hullMat);
    hullBody.position.y = 0.55;
    skiff.add(hullBody);

    const bowCone = new THREE.Mesh(new THREE.ConeGeometry(1.98, 2.6, 4), hullMat);
    bowCone.rotation.x = Math.PI / 2;
    bowCone.rotation.z = Math.PI / 4;
    bowCone.position.set(0, 0.58, 4.4);
    skiff.add(bowCone);

    const teakDeck = new THREE.Mesh(new THREE.BoxGeometry(2.56, 0.12, 6.1), teakDeckMat);
    teakDeck.position.set(0, 1.04, 0);
    skiff.add(teakDeck);

    const windscreen = new THREE.Mesh(new THREE.BoxGeometry(2.42, 0.58, 1.25), materials.glassDark);
    windscreen.position.set(0, 1.32, 0.85);
    windscreen.rotation.x = -0.35;
    skiff.add(windscreen);

    [-0.9, -2.1].forEach((sz) => {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.48, 0.65), leatherSeatMat);
      seat.position.set(0, 1.28, sz);
      skiff.add(seat);
    });

    const outboardMotor = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.95, 0.65), materials.metalDark);
    outboardMotor.position.set(0, 0.85, -3.45);
    skiff.add(outboardMotor);

    dockGroup.add(skiff);
    group.add(dockGroup);
  });

  // 4. INSTANCED RIVERSIDE WEEPING WILLOWS & SHADE TREES
  const treeCount = 40;
  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 4.8, 6);
  const foliageGeo = new THREE.IcosahedronGeometry(2.4, 1);

  const realTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.85, metalness: 0.05 });
  const realWillowFoliage = new THREE.MeshStandardMaterial({ color: 0x2d6a32, roughness: 0.75, metalness: 0.05 });

  const instancedTrunks = new THREE.InstancedMesh(trunkGeo, realTrunkMat, treeCount);
  const instancedFoliage = new THREE.InstancedMesh(foliageGeo, realWillowFoliage, treeCount);

  const dummy = new THREE.Object3D();
  let tIdx = 0;

  for (let z = -220; z <= 220; z += 24) {
    if (Math.abs(z) < 18) continue;
    dummy.position.set(-halfWidth - wallThickness - 8, 2.4, z);
    dummy.rotation.set(0, 0, 0.1);
    dummy.updateMatrix();
    instancedTrunks.setMatrixAt(tIdx, dummy.matrix);

    dummy.position.set(-halfWidth - wallThickness - 8, 4.8, z);
    dummy.scale.set(1.1, 0.85, 1.1);
    dummy.updateMatrix();
    instancedFoliage.setMatrixAt(tIdx, dummy.matrix);
    tIdx++;

    dummy.position.set(halfWidth + wallThickness + 8, 2.4, z + 8);
    dummy.rotation.set(0, 0, -0.1);
    dummy.updateMatrix();
    instancedTrunks.setMatrixAt(tIdx, dummy.matrix);

    dummy.position.set(halfWidth + wallThickness + 8, 4.8, z + 8);
    dummy.scale.set(1.1, 0.85, 1.1);
    dummy.updateMatrix();
    instancedFoliage.setMatrixAt(tIdx, dummy.matrix);
    tIdx++;
  }

  instancedTrunks.instanceMatrix.needsUpdate = true;
  instancedFoliage.instanceMatrix.needsUpdate = true;
  group.add(instancedTrunks);
  group.add(instancedFoliage);

  // 5. ACTIVE MARITIME FLEET: DOUBLE-DECK PASSENGER FERRIES, LUXURY SUPERYACHTS & CARGO SHIPS
  const riverBoatGroup = new THREE.Group();
  riverBoatGroup.name = 'cruising_river_boats';

  interface CruisingBoat {
    mesh: THREE.Group;
    radarScanner?: THREE.Object3D;
    wakeMesh?: THREE.Mesh;
    speed: number;
    direction: number; // 1 = south (+Z), -1 = north (-Z)
    z: number;
    lateralOffset: number;
  }

  const activeBoats: CruisingBoat[] = [];
  const wakeMat = new THREE.MeshBasicMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });
  const warmCabinGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const lifebuoyMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.4 });
  const teakMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 });

  const boatConfigs: {
    z: number;
    lateralOffset: number;
    speed: number;
    direction: number;
    hullColor: number;
    vesselType: 'ferry' | 'superyacht' | 'cargo-ship';
  }[] = [
    { z: -180, lateralOffset: -11, speed: 16, direction: 1, hullColor: 0x1e3a8a, vesselType: 'ferry' },
    { z: 40, lateralOffset: 11, speed: 19, direction: -1, hullColor: 0xf8fafc, vesselType: 'superyacht' },
    { z: 160, lateralOffset: -4, speed: 13, direction: 1, hullColor: 0x7f1d1d, vesselType: 'cargo-ship' },
    { z: -60, lateralOffset: 6, speed: 21, direction: -1, hullColor: 0x0f172a, vesselType: 'superyacht' },
  ];

  boatConfigs.forEach((cfg) => {
    const boat = new THREE.Group();
    boat.position.set(cfg.lateralOffset, riverY + 0.35, cfg.z);
    // Orient bow along travel direction (model built with bow facing -Z; if direction == 1 (+Z), rotate PI)
    if (cfg.direction > 0) {
      boat.rotation.y = Math.PI;
    }

    const bHullMat = new THREE.MeshPhysicalMaterial({
      color: cfg.hullColor,
      roughness: 0.18,
      metalness: 0.55,
      clearcoat: 0.9,
    });
    const bSuperMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      roughness: 0.2,
      metalness: 0.2,
      clearcoat: 0.85,
    });

    let radarScanner: THREE.Object3D | undefined;
    const isCargo = cfg.vesselType === 'cargo-ship';
    const isYacht = cfg.vesselType === 'superyacht';

    const hullLen = isCargo ? 18.5 : isYacht ? 13.5 : 14.5;
    const hullW = isCargo ? 4.8 : isYacht ? 3.9 : 4.4;

    // 1. Flared Maritime Hull + Raked Bow Prow + Waterline Antifouling Stripe
    const hull = new THREE.Mesh(new THREE.BoxGeometry(hullW, 1.35, hullLen), bHullMat);
    hull.position.y = 0.65;
    hull.castShadow = true;
    boat.add(hull);

    const waterline = new THREE.Mesh(
      new THREE.BoxGeometry(hullW + 0.06, 0.24, hullLen + 0.04),
      new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5 })
    );
    waterline.position.y = 0.16;
    boat.add(waterline);

    const prow = new THREE.Mesh(new THREE.ConeGeometry(hullW * 0.71, 4.2, 4), bHullMat);
    prow.rotation.x = -Math.PI / 2;
    prow.rotation.z = Math.PI / 4;
    prow.position.set(0, 0.68, -(hullLen * 0.5 + 1.9));
    boat.add(prow);

    // Teak Main Deck
    const mainDeck = new THREE.Mesh(new THREE.BoxGeometry(hullW - 0.2, 0.14, hullLen - 0.2), teakMat);
    mainDeck.position.y = 1.36;
    boat.add(mainDeck);

    if (isYacht) {
      // LUXURY SUPERYACHT: Sleek Multi-Tiered Flybridge, Radar Arch & Aft Swim Platform
      const swimPlatform = new THREE.Mesh(new THREE.BoxGeometry(hullW - 0.3, 0.22, 2.2), teakMat);
      swimPlatform.position.set(0, 0.32, hullLen * 0.5 + 0.9);
      boat.add(swimPlatform);

      const mainSaloon = new THREE.Mesh(new THREE.BoxGeometry(hullW - 0.6, 1.15, 7.6), bSuperMat);
      mainSaloon.position.set(0, 1.92, 0.6);
      mainSaloon.castShadow = true;
      boat.add(mainSaloon);

      const saloonGlass = new THREE.Mesh(new THREE.BoxGeometry(hullW - 0.52, 0.68, 7.2), materials.glassDark);
      saloonGlass.position.set(0, 2.02, 0.5);
      boat.add(saloonGlass);

      // Upper Flybridge Lounge & Tinted Windscreen
      const flybridge = new THREE.Mesh(new THREE.BoxGeometry(hullW - 1.1, 0.92, 4.4), bSuperMat);
      flybridge.position.set(0, 2.88, 0.9);
      boat.add(flybridge);

      const flyGlass = new THREE.Mesh(new THREE.BoxGeometry(hullW - 1.02, 0.48, 3.8), materials.glassDark);
      flyGlass.position.set(0, 2.96, 0.8);
      boat.add(flyGlass);

      // Swept Radar Arch + Satellite Domes + Spinning Marine Radar
      const radarArch = new THREE.Mesh(new THREE.BoxGeometry(hullW - 1.2, 0.85, 0.45), bSuperMat);
      radarArch.position.set(0, 3.65, 1.8);
      radarArch.rotation.x = 0.25;
      boat.add(radarArch);

      [-0.75, 0.75].forEach((dx) => {
        const satDome = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), bSuperMat);
        satDome.position.set(dx, 4.22, 1.8);
        boat.add(satDome);
      });

      const scannerBar = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.12, 0.18), bSuperMat);
      scannerBar.position.set(0, 4.32, 1.1);
      boat.add(scannerBar);
      radarScanner = scannerBar;
    } else if (isCargo) {
      // RIVER CONTAINER CARGO SHIP: Aft Multi-Deck Bridgehouse, Funnel & Stacked ISO Containers
      const forecastle = new THREE.Mesh(new THREE.BoxGeometry(hullW, 0.65, 3.2), bHullMat);
      forecastle.position.set(0, 1.65, -hullLen * 0.5 + 1.4);
      boat.add(forecastle);

      // Aft White Navigation Bridgehouse & Smokestack Funnel
      const bridgeHouse = new THREE.Mesh(new THREE.BoxGeometry(hullW - 0.5, 2.65, 3.6), bSuperMat);
      bridgeHouse.position.set(0, 2.65, hullLen * 0.5 - 2.1);
      bridgeHouse.castShadow = true;
      boat.add(bridgeHouse);

      const bridgeWin = new THREE.Mesh(new THREE.BoxGeometry(hullW - 0.42, 0.58, 3.66), materials.glassDark);
      bridgeWin.position.set(0, 3.45, hullLen * 0.5 - 2.1);
      boat.add(bridgeWin);

      const funnel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.58, 1.65, 12),
        new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.4 })
      );
      funnel.position.set(0, 4.45, hullLen * 0.5 - 1.2);
      boat.add(funnel);

      const scannerBar = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.14, 0.22), materials.metalLight);
      scannerBar.position.set(0, 4.35, hullLen * 0.5 - 2.6);
      boat.add(scannerBar);
      radarScanner = scannerBar;

      // Stacked Multi-Color Intermodal Cargo Containers on Main Hold
      const containerColors = [0x1d4ed8, 0xdc2626, 0x059669, 0xd97706];
      [-4.2, 0.2].forEach((cz, idx) => {
        [-1.05, 1.05].forEach((cx, cIdx) => {
          const cMat = new THREE.MeshStandardMaterial({
            color: containerColors[(idx * 2 + cIdx) % containerColors.length],
            roughness: 0.45,
            metalness: 0.5,
          });
          const cont1 = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.15, 3.9), cMat);
          cont1.position.set(cx, 1.98, cz);
          cont1.castShadow = true;
          boat.add(cont1);

          const cont2 = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.15, 3.9), cMat);
          cont2.position.set(cx, 3.16, cz);
          cont2.castShadow = true;
          boat.add(cont2);
        });
      });
    } else {
      // DOUBLE-DECK PANORAMIC PASSENGER RIVER FERRY / WATER BUS
      const lowerCabin = new THREE.Mesh(new THREE.BoxGeometry(hullW - 0.5, 1.35, 10.6), bSuperMat);
      lowerCabin.position.set(0, 2.02, 0.4);
      lowerCabin.castShadow = true;
      boat.add(lowerCabin);

      const lowerGlass = new THREE.Mesh(new THREE.BoxGeometry(hullW - 0.42, 0.82, 9.8), materials.glassDark);
      lowerGlass.position.set(0, 2.08, 0.4);
      boat.add(lowerGlass);

      const interiorGlow = new THREE.Mesh(new THREE.BoxGeometry(hullW - 0.9, 0.65, 9.2), warmCabinGlowMat);
      interiorGlow.position.set(0, 1.95, 0.4);
      boat.add(interiorGlow);

      // Upper Sun-Deck Canopy, Wheelhouse Bridge & Orange Lifebuoys
      const upperDeck = new THREE.Mesh(new THREE.BoxGeometry(hullW - 0.7, 0.22, 8.8), bSuperMat);
      upperDeck.position.set(0, 2.82, 0.6);
      boat.add(upperDeck);

      const wheelhouse = new THREE.Mesh(new THREE.BoxGeometry(hullW - 1.1, 1.05, 2.6), bSuperMat);
      wheelhouse.position.set(0, 3.38, -2.4);
      boat.add(wheelhouse);

      const wheelhouseGlass = new THREE.Mesh(new THREE.BoxGeometry(hullW - 1.02, 0.55, 2.66), materials.glassDark);
      wheelhouseGlass.position.set(0, 3.48, -2.4);
      boat.add(wheelhouseGlass);

      const sunCanopy = new THREE.Mesh(new THREE.BoxGeometry(hullW - 1.0, 0.14, 5.4), bSuperMat);
      sunCanopy.position.set(0, 3.85, 1.8);
      boat.add(sunCanopy);

      [-3.2, 0.0, 3.2].forEach((lz) => {
        [-hullW * 0.46, hullW * 0.46].forEach((lx) => {
          const buoy = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.07, 6, 12), lifebuoyMat);
          buoy.rotation.y = Math.PI / 2;
          buoy.position.set(lx, 2.75, lz);
          boat.add(buoy);
        });
      });

      const scannerBar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.18), materials.metalLight);
      scannerBar.position.set(0, 4.08, -2.4);
      boat.add(scannerBar);
      radarScanner = scannerBar;
    }

    // COLREGS Marine Navigation Lights (Red Port, Green Starboard, White Masthead)
    const navLightPort = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), materials.neonRed);
    navLightPort.position.set(-hullW * 0.48, 2.1, -hullLen * 0.35);
    boat.add(navLightPort);

    const navLightStarboard = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), materials.neonEmerald);
    navLightStarboard.position.set(hullW * 0.48, 2.1, -hullLen * 0.35);
    boat.add(navLightStarboard);

    // Foaming White Water V-Wake Trail behind Stern
    const wakeGeo = new THREE.PlaneGeometry(hullW * 1.45, 9.5);
    wakeGeo.rotateX(-Math.PI / 2);
    const wakeMesh = new THREE.Mesh(wakeGeo, wakeMat);
    wakeMesh.position.set(0, 0.08, hullLen * 0.5 + 4.8);
    boat.add(wakeMesh);

    riverBoatGroup.add(boat);
    activeBoats.push({
      mesh: boat,
      radarScanner,
      wakeMesh,
      speed: cfg.speed,
      direction: cfg.direction,
      z: cfg.z,
      lateralOffset: cfg.lateralOffset,
    });
  });

  group.add(riverBoatGroup);

  scene.add(group);

  const update = (time: number) => {
    waterMaterial.uniforms.uTime.value = time;

    // Update cruising ships, yachts & ferries
    activeBoats.forEach((b) => {
      b.z += b.direction * b.speed * 0.016;
      if (b.z > 300) {
        b.z = -300;
      } else if (b.z < -300) {
        b.z = 300;
      }
      b.mesh.position.z = b.z;
      // Gentle hydrodynamic pitch & roll on river waves
      b.mesh.position.y = riverY + 0.35 + Math.sin(time * 2.8 + b.lateralOffset) * 0.11;
      b.mesh.rotation.z = Math.sin(time * 1.9 + b.z * 0.04) * 0.032;
      b.mesh.rotation.x = Math.cos(time * 2.3 + b.lateralOffset) * 0.018;

      if (b.radarScanner) {
        b.radarScanner.rotation.y = time * 4.5;
      }
      if (b.wakeMesh) {
        b.wakeMesh.scale.x = 0.92 + Math.sin(time * 7 + b.lateralOffset) * 0.12;
      }
    });
  };

  const dispose = () => {
    scene.remove(group);
    waterGeometry.dispose();
    waterMaterial.dispose();
    bedGeo.dispose();
    wallGeo.dispose();
    railingGeo.dispose();
    walkGeo.dispose();
    bistroMesh.geometry.dispose();
    deckGeo.dispose();
    trunkGeo.dispose();
    foliageGeo.dispose();
  };

  return {
    group,
    buildingsData,
    interactiveMeshes,
    update,
    dispose,
  };
}
