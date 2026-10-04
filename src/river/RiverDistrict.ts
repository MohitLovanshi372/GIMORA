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

  // 1. ADVANCED ANIMATED WATER SURFACE (Photorealistic Cyberpunk River)
  const waterGeometry = new THREE.PlaneGeometry(riverWidth, riverLength, 64, 160);
  waterGeometry.rotateX(-Math.PI / 2);

  const waterMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorDeep: { value: new THREE.Color(0x010814) },
      uColorShallow: { value: new THREE.Color(0x02203c) },
      uColorNeonCyan: { value: new THREE.Color(0x00f0ff) },
      uColorNeonPink: { value: new THREE.Color(0xff007f) },
      uColorNeonAmber: { value: new THREE.Color(0xf59e0b) },
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
      uniform vec3 uColorNeonCyan;
      uniform vec3 uColorNeonPink;
      uniform vec3 uColorNeonAmber;
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

        // Neon City Skyline & Bridge Reflections
        // Downtown (West / -X) casts Cyan reflections; Entertainment & Bridges cast Magenta and Amber streaks
        float bridgeGlow1 = smoothstep(25.0, 0.0, abs(vWorldPos.z));        // Central Bridge (Z=0)
        float bridgeGlow2 = smoothstep(25.0, 0.0, abs(vWorldPos.z + 160.0)); // North Bridge (Z=-160)
        float bridgeGlow3 = smoothstep(25.0, 0.0, abs(vWorldPos.z - 160.0)); // South Bridge (Z=160)
        float bridgeReflectionMask = clamp(bridgeGlow1 + bridgeGlow2 + bridgeGlow3, 0.0, 1.0);

        // Dynamic multi-colored water highlights
        float rippleA = sin(vWorldPos.z * 0.4 + uTime * 3.0) * cos(vWorldPos.x * 0.4 - uTime * 2.5);
        float rippleB = sin(vWorldPos.z * 1.4 - uTime * 4.2) * sin(vWorldPos.x * 1.2 + uTime * 3.6);
        float specularGlint = pow(clamp((rippleA + rippleB * 0.5) * 0.5 + 0.5, 0.0, 1.0), 5.0) * 1.2;

        // Color blend based on river position
        vec3 cityReflection = mix(uColorNeonCyan, uColorNeonPink, sin(vWorldPos.z * 0.015 + uTime * 0.5) * 0.5 + 0.5);
        cityReflection = mix(cityReflection, uColorNeonAmber, bridgeReflectionMask * 0.65);

        // Embankment shoreline foam / rim illumination
        float edgeDist = abs(vUv.x - 0.5) * 2.0;
        float shorelineFoam = smoothstep(0.85, 0.98, edgeDist) * 0.65;

        // Specular moonlight highlight
        vec3 lightDir = normalize(vec3(160.0, 260.0, 120.0));
        vec3 reflectDir = reflect(-lightDir, vNormal);
        float moonSpec = pow(max(dot(viewDir, reflectDir), 0.0), 24.0) * 0.7;

        // Combine all lighting components
        vec3 finalColor = baseWater +
                          (cityReflection * specularGlint * (0.6 + fresnel * 0.8)) +
                          (cityReflection * bridgeReflectionMask * 0.35) +
                          (uColorNeonCyan * shorelineFoam) +
                          (vec3(0.9, 0.95, 1.0) * moonSpec);

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

  const westWall = new THREE.Mesh(wallGeo, materials.metalDark);
  westWall.position.set(-halfWidth - wallThickness / 2, -wallHeight / 2 + 0.5, 0);
  westWall.receiveShadow = true;
  group.add(westWall);

  const eastWall = westWall.clone();
  eastWall.position.set(halfWidth + wallThickness / 2, -wallHeight / 2 + 0.5, 0);
  group.add(eastWall);

  // Glowing Neon Railings along both banks
  const railingGeo = new THREE.CylinderGeometry(0.18, 0.18, riverLength, 8);
  railingGeo.rotateX(Math.PI / 2);

  const westRailing = new THREE.Mesh(railingGeo, materials.neonCyan);
  westRailing.position.set(-halfWidth - 0.4, 0.7, 0);
  group.add(westRailing);

  const eastRailing = new THREE.Mesh(railingGeo, materials.neonPink);
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
    name: 'Neon Waves Waterfront Bistro & Lounge',
    districtId: 'riverside',
    districtName: 'Riverside District',
    category: 'Waterfront Venue',
    height: 12,
    floors: 2,
    position: [-42, 0, -40],
    dimensions: [16, 12, 22],
    powerUsage: '1.8 MW',
    occupancy: '95% (450 Diners)',
    networkStatus: 'Public Cyber-Guest Wi-Fi 6G',
    description: 'Premier waterfront glass dining pavilion featuring outdoor floating terraces, molecular gastronomy, and panoramic sunset river views.',
    features: ['Floating Deck Dining', 'Heated Outdoor Cabanas', 'Dockside Cocktails'],
  };
  buildingsData.push(bistroData);

  const bistroGroup = new THREE.Group();
  bistroGroup.position.set(-42, 0, -40);

  const bistroMesh = new THREE.Mesh(
    new THREE.BoxGeometry(16, 12, 22),
    materials.glassCyan
  );
  bistroMesh.position.y = 6;
  bistroMesh.castShadow = true;
  bistroGroup.add(bistroMesh);

  // Outdoor Terrace Platform jutting toward water
  const deckGeo = new THREE.BoxGeometry(8, 0.5, 20);
  const deck = new THREE.Mesh(deckGeo, materials.sidewalk);
  deck.position.set(9, 0.25, 0);
  bistroGroup.add(deck);

  // Outdoor Tables & Neon Umbrellas
  for (let i = -6; i <= 6; i += 6) {
    const table = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.9, 12), materials.metalLight);
    table.position.set(9, 0.7, i);
    bistroGroup.add(table);

    const umbrella = new THREE.Mesh(new THREE.ConeGeometry(1.8, 0.8, 8), materials.neonPink);
    umbrella.position.set(9, 2.2, i);
    bistroGroup.add(umbrella);
  }

  bistroMesh.userData = { buildingData: bistroData };
  interactiveMeshes.push(bistroMesh);
  group.add(bistroGroup);

  // East Bank Cyber Cafe: Z = 40
  const cafeData: BuildingData = {
    id: 'river-cyber-cafe',
    name: 'Aqua-Lumina Cyber Cafe & Marina Docks',
    districtId: 'riverside',
    districtName: 'Riverside District',
    category: 'Waterfront Venue',
    height: 10,
    floors: 2,
    position: [42, 0, 40],
    dimensions: [14, 10, 20],
    powerUsage: '1.4 MW',
    occupancy: '90% (320 Patrons)',
    networkStatus: 'High-Speed Neural Cafe Grid',
    description: 'Chic riverside coffee house with dock access for water-taxis and holographic ambient jazz.',
    features: ['Direct Boat Slip Access', 'Espresso Roastery', 'Holographic Sunset Patio'],
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
    const pontoon = new THREE.Mesh(new THREE.BoxGeometry(8, 0.6, 18), materials.metalDark);
    pontoon.position.set(cfg.dir * 9, 0, 0);
    dockGroup.add(pontoon);

    // Glowing Dock Edge Strips
    const dockEdge = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.15, 18.2), materials.neonCyan);
    dockEdge.position.set(cfg.dir * 9, 0.32, 0);
    dockGroup.add(dockEdge);

    // Mooring Bollards
    [-6, 0, 6].forEach((bz) => {
      const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8), materials.metalLight);
      bollard.position.set(cfg.dir * 12.5, 0.5, bz);
      dockGroup.add(bollard);
    });

    // Parked Electric Hover-Skiff / Water Taxi
    const skiff = new THREE.Group();
    skiff.position.set(cfg.dir * 10, 0.2, 0);
    const hull = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.2, 7.5), materials.glassDark);
    hull.position.y = 0.6;
    skiff.add(hull);
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.1, 4.2), materials.glassCyan);
    canopy.position.set(0, 1.6, 0);
    skiff.add(canopy);
    const lightStrip = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.15, 7.6), materials.neonCyan);
    lightStrip.position.y = 0.6;
    skiff.add(lightStrip);

    dockGroup.add(skiff);
    group.add(dockGroup);
  });

  // 4. INSTANCED RIVERSIDE WEEPING WILLOWS & TREES
  const treeCount = 40;
  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 4.8, 6);
  const foliageGeo = new THREE.IcosahedronGeometry(2.4, 1);

  const instancedTrunks = new THREE.InstancedMesh(trunkGeo, materials.metalDark, treeCount);
  const instancedFoliage = new THREE.InstancedMesh(foliageGeo, materials.neonCyan, treeCount);

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

  // 5. ACTIVE CRUISING RIVER WATER TAXIS
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
    { z: -150, lateralOffset: -12, speed: 18, direction: 1, color: 0x00f0ff },
    { z: 50, lateralOffset: 12, speed: 15, direction: -1, color: 0xa855f7 },
    { z: 180, lateralOffset: -6, speed: 20, direction: 1, color: 0x00ffcc },
  ];

  boatConfigs.forEach((cfg, idx) => {
    const boat = new THREE.Group();
    boat.position.set(cfg.lateralOffset, riverY + 0.35, cfg.z);

    const hull = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.1, 8.5), materials.glassDark);
    hull.position.y = 0.55;
    boat.add(hull);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.2, 4.8), materials.glassCyan);
    cabin.position.set(0, 1.6, -0.4);
    boat.add(cabin);

    const prow = new THREE.Mesh(new THREE.ConeGeometry(1.8, 2.8, 4), materials.glassDark);
    prow.rotateX(Math.PI / 2);
    prow.position.set(0, 0.55, -4.8);
    boat.add(prow);

    const glowTrim = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.15, 8.8),
      new THREE.MeshBasicMaterial({ color: cfg.color })
    );
    glowTrim.position.y = 0.6;
    boat.add(glowTrim);

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
