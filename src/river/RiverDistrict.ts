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

  // 2. RIVERSIDE CAFES & RESTAURANTS
  // West Bank Bistro: Z = -40
  const bistroData: BuildingData = {
    id: 'river-bistro-pavilion',
    name: 'Harbor Terrace Waterfront Bistro',
    districtId: 'riverside',
    districtName: 'Riverside District',
    category: 'Waterfront Venue',
    height: 12,
    floors: 2,
    position: [-42, 0, -40],
    dimensions: [16, 12, 22],
    powerUsage: '1.2 MW',
    occupancy: '92% (420 Diners)',
    networkStatus: 'Guest High-Speed Wi-Fi',
    description: 'Premier waterfront architectural glass dining pavilion featuring outdoor timber dining decks, panoramic sunset river views, and fine dining.',
    features: ['Timber Deck Waterfront Dining', 'Heated Outdoor Cabanas', 'Riverside Cocktail Lounge'],
  };
  buildingsData.push(bistroData);

  const bistroGroup = new THREE.Group();
  bistroGroup.position.set(-42, 0, -40);

  const bistroMesh = new THREE.Mesh(
    new THREE.BoxGeometry(16, 12, 22),
    materials.glassDark
  );
  bistroMesh.position.y = 6;
  bistroMesh.castShadow = true;
  bistroGroup.add(bistroMesh);

  // Outdoor Terrace Platform jutting toward water
  const deckGeo = new THREE.BoxGeometry(8, 0.5, 20);
  const deck = new THREE.Mesh(deckGeo, materials.sidewalk);
  deck.position.set(9, 0.25, 0);
  bistroGroup.add(deck);

  // Outdoor Tables & Canvas Umbrellas (Clean Cream Canvas)
  const umbrellaMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.85 });
  for (let i = -6; i <= 6; i += 6) {
    const table = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.9, 12), materials.metalLight);
    table.position.set(9, 0.7, i);
    bistroGroup.add(table);

    const umbrella = new THREE.Mesh(new THREE.ConeGeometry(1.8, 0.8, 8), umbrellaMat);
    umbrella.position.set(9, 2.2, i);
    bistroGroup.add(umbrella);
  }

  bistroMesh.userData = { buildingData: bistroData };
  interactiveMeshes.push(bistroMesh);
  group.add(bistroGroup);

  // East Bank Cafe: Z = 40
  const cafeData: BuildingData = {
    id: 'river-cyber-cafe',
    name: 'Aqua Marina Harbor Cafe & Yacht Docks',
    districtId: 'riverside',
    districtName: 'Riverside District',
    category: 'Waterfront Venue',
    height: 10,
    floors: 2,
    position: [42, 0, 40],
    dimensions: [14, 10, 20],
    powerUsage: '1.1 MW',
    occupancy: '88% (290 Patrons)',
    networkStatus: 'Municipal Harbor Wireless',
    description: 'Waterfront artisan coffee lounge and yacht club with private boarding docks and sunlit glass terraces.',
    features: ['Direct Boat Slip Access', 'Espresso Roastery Bar', 'Panoramic River Terrace'],
  };
  buildingsData.push(cafeData);

  const cafeMesh = new THREE.Mesh(
    new THREE.BoxGeometry(14, 10, 20),
    materials.glassDark
  );
  cafeMesh.position.set(42, 5, 40);
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

    // Parked Motor Launch / Water Taxi (Realistic Marine Yacht Paint)
    const skiff = new THREE.Group();
    skiff.position.set(cfg.dir * 10, 0.2, 0);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.7 });
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.1 });
    const hull = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.2, 7.5), hullMat);
    hull.position.y = 0.6;
    skiff.add(hull);
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.1, 4.2), cabinMat);
    canopy.position.set(0, 1.6, 0);
    skiff.add(canopy);
    const winMesh = new THREE.Mesh(new THREE.BoxGeometry(2.82, 0.6, 3.8), materials.glassDark);
    winMesh.position.set(0, 1.6, 0);
    skiff.add(winMesh);

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
    if (Math.abs(z) < 18) continue; // clear bridge area
    // West Bank Tree
    dummy.position.set(-halfWidth - wallThickness - 8, 2.4, z);
    dummy.rotation.set(0, 0, 0.1);
    dummy.updateMatrix();
    instancedTrunks.setMatrixAt(tIdx, dummy.matrix);

    dummy.position.set(-halfWidth - wallThickness - 8, 4.8, z);
    dummy.scale.set(1.1, 0.85, 1.1);
    dummy.updateMatrix();
    instancedFoliage.setMatrixAt(tIdx, dummy.matrix);
    tIdx++;

    // East Bank Tree
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

  // 5. ACTIVE CRUISING RIVER WATER TAXIS & TOUR FERRIES
  const riverBoatGroup = new THREE.Group();
  riverBoatGroup.name = 'cruising_river_boats';

  interface CruisingBoat {
    mesh: THREE.Group;
    speed: number;
    direction: number; // 1 = south, -1 = north
    z: number;
    lateralOffset: number;
  }

  const activeBoats: CruisingBoat[] = [];
  const boatConfigs = [
    { z: -150, lateralOffset: -12, speed: 18, direction: 1, hullColor: 0x1e3a8a }, // Navy Blue Tour Ferry
    { z: 50, lateralOffset: 12, speed: 15, direction: -1, hullColor: 0x0f172a },   // Obsidian Harbor Cruiser
    { z: 180, lateralOffset: -6, speed: 20, direction: 1, hullColor: 0xb91c1c },   // Red Crest Water Taxi
  ];

  boatConfigs.forEach((cfg) => {
    const boat = new THREE.Group();
    boat.position.set(cfg.lateralOffset, riverY + 0.35, cfg.z);

    const bHullMat = new THREE.MeshStandardMaterial({ color: cfg.hullColor, roughness: 0.3, metalness: 0.6 });
    const bSuperstructureMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.1 });

    const hull = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.1, 8.5), bHullMat);
    hull.position.y = 0.55;
    boat.add(hull);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.2, 4.8), bSuperstructureMat);
    cabin.position.set(0, 1.6, -0.4);
    boat.add(cabin);

    const prow = new THREE.Mesh(new THREE.ConeGeometry(1.8, 2.8, 4), bHullMat);
    prow.rotateX(Math.PI / 2);
    prow.position.set(0, 0.55, -4.8);
    boat.add(prow);

    // Marine Window band
    const boatWindows = new THREE.Mesh(new THREE.BoxGeometry(2.82, 0.55, 4.2), materials.glassDark);
    boatWindows.position.set(0, 1.65, -0.4);
    boat.add(boatWindows);

    // Marine Navigation Lights (Red Port, Green Starboard)
    const navLightPort = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), materials.neonRed);
    navLightPort.position.set(-1.42, 1.3, -3.2);
    boat.add(navLightPort);

    const navLightStarboard = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), materials.neonEmerald);
    navLightStarboard.position.set(1.42, 1.3, -3.2);
    boat.add(navLightStarboard);

    riverBoatGroup.add(boat);
    activeBoats.push({
      mesh: boat,
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

    // Update cruising boats
    activeBoats.forEach((b) => {
      b.z += b.direction * b.speed * 0.016;
      if (b.z > 300) {
        b.z = -300;
      } else if (b.z < -300) {
        b.z = 300;
      }
      b.mesh.position.z = b.z;
      // Gentle water bobbing
      b.mesh.position.y = riverY + 0.35 + Math.sin(time * 3 + b.lateralOffset) * 0.12;
      b.mesh.rotation.z = Math.sin(time * 2 + b.z * 0.05) * 0.04;
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
