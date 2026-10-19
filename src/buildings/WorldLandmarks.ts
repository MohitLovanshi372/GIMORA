/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { BuildingData } from '../city/types';
import { CityMaterials } from '../assets/materials';
import {
  createMarinaBaySandsFacadeTexture,
  createEiffelIronLatticeTexture,
  createParisianLimestoneTexture,
  createArtDecoLimestoneFacadeTexture,
  createPrismaticGlassCurtainWallTexture,
} from '../assets/textures';

export interface WorldLandmarkSystem {
  group: THREE.Group;
  buildingsData: BuildingData[];
  interactiveMeshes: THREE.Object3D[];
  update: (time: number) => void;
  dispose: () => void;
}

/**
 * World Metropolis Iconic Architectural Landmarks (4K PBR & Multi-Part Real Architecture):
 * 1. Singapore: Marina Bay Sands & Gardens by the Bay Supertree Grove
 * 2. Paris: Eiffel Tower & Arc de Triomphe
 * 3. America: Empire State Building & One World Trade Center
 */
export function createWorldLandmarks(
  scene: THREE.Scene,
  materials: CityMaterials
): WorldLandmarkSystem {
  const group = new THREE.Group();
  group.name = 'world_metropolis_landmarks_system';

  const buildingsData: BuildingData[] = [];
  const interactiveMeshes: THREE.Object3D[] = [];
  const animatables: ((time: number) => void)[] = [];

  // 4K Procedural Architectural Textures
  const mbsFacadeTex = createMarinaBaySandsFacadeTexture();
  mbsFacadeTex.repeat.set(2, 3);

  const eiffelLatticeTex = createEiffelIronLatticeTexture();
  eiffelLatticeTex.repeat.set(2, 6);

  const parisLimestoneTex = createParisianLimestoneTexture();
  parisLimestoneTex.repeat.set(2, 2);

  const esbFacadeTex = createArtDecoLimestoneFacadeTexture();
  esbFacadeTex.repeat.set(2, 3);

  const wtcCurtainTex = createPrismaticGlassCurtainWallTexture();
  wtcCurtainTex.repeat.set(3, 4);

  // PBR Materials for World Landmarks
  const parisIronMat = new THREE.MeshStandardMaterial({
    color: 0x9a846b, // Classic Tour Eiffel Bronze / Puddle Iron
    map: eiffelLatticeTex,
    bumpMap: eiffelLatticeTex,
    bumpScale: 0.35,
    metalness: 0.86,
    roughness: 0.28,
    envMapIntensity: 1.8,
  });

  const parisGoldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: new THREE.Color(0xd97706),
    emissiveIntensity: 0.35,
    metalness: 0.9,
    roughness: 0.2,
  });

  const parisStoneMat = new THREE.MeshStandardMaterial({
    color: 0xe7dec8, // Lutetian Parisian Carved Ashlar Limestone
    map: parisLimestoneTex,
    normalMap: materials.maps.concreteNormal,
    normalScale: new THREE.Vector2(0.45, 0.45),
    roughness: 0.78,
    metalness: 0.08,
  });

  const mbsGlassMat = new THREE.MeshStandardMaterial({
    color: 0xbae6fd,
    map: mbsFacadeTex,
    emissiveMap: mbsFacadeTex,
    emissive: new THREE.Color(0xfef3c7),
    emissiveIntensity: 0.26,
    normalMap: materials.maps.facadeNormal,
    normalScale: new THREE.Vector2(0.4, 0.4),
    metalness: 0.85,
    roughness: 0.14,
    envMapIntensity: 2.0,
  });

  const mbsDeckMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // Pristine SkyPark superstructure
    metalness: 0.45,
    roughness: 0.22,
    envMapIntensity: 1.5,
  });

  const poolWaterMat = new THREE.MeshPhysicalMaterial({
    color: 0x06b6d4, // Rooftop Infinity Pool Turquoise
    emissive: new THREE.Color(0x0891b2),
    emissiveIntensity: 0.25,
    metalness: 0.15,
    roughness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 2.2,
  });

  const supertreeCoreMat = new THREE.MeshStandardMaterial({
    color: 0x475569, // Concrete & steel trunk core
    normalMap: materials.maps.concreteNormal,
    metalness: 0.55,
    roughness: 0.48,
  });

  const supertreeFoliageMat = new THREE.MeshStandardMaterial({
    color: 0x15803d, // Living vertical garden bromeliads & ferns
    roughness: 0.72,
    metalness: 0.08,
  });

  const supertreeGlowMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc, // Bioluminescent purple/magenta nighttime Exoskeleton
    emissive: new THREE.Color(0xd946ef),
    emissiveIntensity: 0.85,
    roughness: 0.25,
    metalness: 0.5,
  });

  const artDecoLimestoneMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0, // Empire State Indiana Limestone & Recessed Windows
    map: esbFacadeTex,
    emissiveMap: esbFacadeTex,
    emissive: new THREE.Color(0xfef3c7),
    emissiveIntensity: 0.28,
    normalMap: materials.maps.facadeNormal,
    normalScale: new THREE.Vector2(0.5, 0.5),
    roughness: 0.55,
    metalness: 0.32,
    envMapIntensity: 1.5,
  });

  const artDecoSteelMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // Polished Stainless Steel mullions & spire
    metalness: 0.94,
    roughness: 0.14,
    envMapIntensity: 2.1,
  });

  const crystallineGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x93c5fd, // One World Trade prismatic reflective curtain wall
    map: wtcCurtainTex,
    emissiveMap: wtcCurtainTex,
    emissive: new THREE.Color(0xe0f2fe),
    emissiveIntensity: 0.24,
    normalMap: materials.maps.glassNormal,
    normalScale: new THREE.Vector2(0.35, 0.35),
    metalness: 0.88,
    roughness: 0.08,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    envMapIntensity: 2.4,
  });

  const woodTrunkMat = new THREE.MeshStandardMaterial({
    color: 0x5c4033, // Palm trunk tropical bark & teak deck
    roughness: 0.8,
    metalness: 0.05,
  });

  // =========================================================================
  // 1. SINGAPORE: MARINA BAY SANDS (Triple Slanted-Leg Towers & SkyPark Hull)
  // =========================================================================
  const mbsGroup = new THREE.Group();
  mbsGroup.position.set(-165, 0, 75); // Waterfront Bay sector

  const mbsData: BuildingData = {
    id: 'singapore-marina-bay-sands',
    name: 'Marina Bay Sands - Singapore Bayfront',
    districtId: 'riverside',
    districtName: 'Marina Bay Promenade',
    category: 'Skyscraper',
    height: 125,
    floors: 57,
    position: [-165, 0, 75],
    dimensions: [92, 125, 34],
    powerUsage: '22.8 MW (High Efficiency Tri-Generation)',
    occupancy: '98% (2,561 Luxury Hotel Rooms & Suites)',
    networkStatus: 'Smart Bay IoT Mesh 100%',
    description:
      'World-renowned architectural icon designed by Moshe Safdie. Comprises three 55-story cascading glass hotel towers with asymmetric inclined East/West legs merging at Floor 23, topped by the cantilevered Sands SkyPark—a 340m ship-like deck with a 150m rooftop infinity pool and panoramic gardens.',
    features: [
      'Three Cascading 55-Story Inclined Dual-Leg Hotel Towers',
      '340-Meter Cantilevered SkyPark Rooftop Ship Hull & Struts',
      '150-Meter Infinity Pool with Frameless Glass Water Edge',
      'Vaulted Glass Waterfront Galleria & Cé La Vi Sky Lounge',
    ],
    isLandmark: true,
  };
  buildingsData.push(mbsData);

  // A. Three Dual-Leg Converging Hotel Towers (Tower 1, Tower 2, Tower 3)
  const towerHeight = 105;
  const towerWidth = 17;
  const towerDepth = 13;
  const towerSpacing = 28;

  const mbsTowerMeshes: THREE.Mesh[] = [];

  [-towerSpacing, 0, towerSpacing].forEach((tx) => {
    // 1. Upright Main East Leg
    const leg1Geo = new THREE.BoxGeometry(towerWidth, towerHeight, towerDepth * 0.58);
    const leg1Mesh = new THREE.Mesh(leg1Geo, mbsGlassMat);
    leg1Mesh.position.set(tx, towerHeight / 2, -towerDepth * 0.2);
    leg1Mesh.castShadow = true;
    leg1Mesh.receiveShadow = true;
    mbsGroup.add(leg1Mesh);
    mbsTowerMeshes.push(leg1Mesh);

    // 2. Inclined Slanted West Leg (leaning 9 degrees inward to join main leg at mid-height)
    const leg2H = towerHeight * 0.72;
    const leg2Geo = new THREE.BoxGeometry(towerWidth * 0.94, leg2H, towerDepth * 0.52);
    const leg2Mesh = new THREE.Mesh(leg2Geo, mbsGlassMat);
    leg2Mesh.position.set(tx, leg2H / 2, towerDepth * 0.35);
    leg2Mesh.rotation.x = -0.14;
    leg2Mesh.castShadow = true;
    mbsGroup.add(leg2Mesh);
    mbsTowerMeshes.push(leg2Mesh);

    // 3. Exterior Structural Steel Spine Fins & Balcony Bands
    const finGeo = new THREE.BoxGeometry(0.55, towerHeight + 1, towerDepth + 0.8);
    [-towerWidth / 2 + 0.6, -towerWidth / 6, towerWidth / 6, towerWidth / 2 - 0.6].forEach((rx) => {
      const fin = new THREE.Mesh(finGeo, mbsDeckMat);
      fin.position.set(tx + rx, towerHeight / 2, -0.5);
      mbsGroup.add(fin);
    });

    // Horizontal recessed refuge/balcony ledges every 15m
    for (let by = 18; by < towerHeight; by += 16) {
      const ledge = new THREE.Mesh(
        new THREE.BoxGeometry(towerWidth + 0.8, 0.55, towerDepth + 0.6),
        mbsDeckMat
      );
      ledge.position.set(tx, by, -0.5);
      mbsGroup.add(ledge);
    }

    // 4. Vaulted Glass Wave Atrium Podium at Base
    const waveCanopyGeo = new THREE.CylinderGeometry(
      towerDepth * 0.75,
      towerDepth * 0.95,
      towerWidth + 8,
      16,
      1,
      false,
      0,
      Math.PI * 0.5
    );
    waveCanopyGeo.rotateZ(Math.PI / 2);
    const waveCanopy = new THREE.Mesh(waveCanopyGeo, materials.glassCyan);
    waveCanopy.position.set(tx, 0, 2);
    mbsGroup.add(waveCanopy);
  });

  // Continuous Grand Waterfront Galleria Colonnade connecting all 3 towers
  const galleriaBase = new THREE.Mesh(
    new THREE.BoxGeometry(towerSpacing * 2 + towerWidth + 10, 7.5, towerDepth + 12),
    materials.glassDark
  );
  galleriaBase.position.set(0, 3.75, 2);
  mbsGroup.add(galleriaBase);

  // B. The Sands SkyPark Ship Hull & Cantilever
  const skyparkLength = towerSpacing * 2 + towerWidth + 38;
  const skyparkWidth = 22;
  const skyparkH = 5.2;

  // Curved Boat Hull Underbelly
  const hullGeo = new THREE.CylinderGeometry(
    skyparkWidth * 0.52,
    skyparkWidth * 0.36,
    skyparkLength,
    16
  );
  hullGeo.rotateZ(Math.PI / 2);
  hullGeo.scale(1, 0.45, 1);
  const skypark = new THREE.Mesh(hullGeo, mbsDeckMat);
  skypark.position.set(8, towerHeight + skyparkH * 0.45, -1);
  skypark.castShadow = true;
  mbsGroup.add(skypark);

  // Flat Teak & Limestone Observation Deck Surface on top of Hull
  const deckTop = new THREE.Mesh(
    new THREE.BoxGeometry(skyparkLength - 4, 1.2, skyparkWidth - 2),
    mbsDeckMat
  );
  deckTop.position.set(8, towerHeight + skyparkH * 0.85, -1);
  mbsGroup.add(deckTop);

  // Diagonal Cantilever Support Struts under the North Ship Bow (Tower 3)
  [-4, 4].forEach((sz) => {
    const strut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.65, 22, 8),
      mbsDeckMat
    );
    strut.position.set(towerSpacing + 16, towerHeight - 4, sz - 1);
    strut.rotation.z = -0.65;
    mbsGroup.add(strut);
  });

  // Cantilevered Nose Bow (Aerodynamic Ship Prow)
  const prowGeo = new THREE.ConeGeometry(skyparkWidth * 0.46, 18, 12);
  prowGeo.rotateZ(-Math.PI / 2);
  prowGeo.scale(1, 0.38, 1);
  const prow = new THREE.Mesh(prowGeo, mbsDeckMat);
  prow.position.set(8 + skyparkLength / 2 + 7, towerHeight + skyparkH * 0.6, -1);
  mbsGroup.add(prow);

  // Cé La Vi Rooftop Skybar Pavilion & Umbrella Canopy
  const skybar = new THREE.Mesh(
    new THREE.CylinderGeometry(5.5, 4.5, 4.2, 16),
    materials.glassCyan
  );
  skybar.position.set(towerSpacing + 14, towerHeight + skyparkH + 2.1, -1);
  mbsGroup.add(skybar);

  const skybarRoof = new THREE.Mesh(
    new THREE.CylinderGeometry(7.2, 6.8, 0.5, 16),
    mbsDeckMat
  );
  skybarRoof.position.set(towerSpacing + 14, towerHeight + skyparkH + 4.4, -1);
  mbsGroup.add(skybarRoof);

  // C. 150m Infinity Pool on Bayfront Edge
  const poolGeo = new THREE.BoxGeometry(skyparkLength * 0.68, 0.7, 7.2);
  const pool = new THREE.Mesh(poolGeo, poolWaterMat);
  pool.position.set(-2, towerHeight + skyparkH + 0.35, -skyparkWidth / 2 + 4.2);
  mbsGroup.add(pool);

  // SkyPark Palm Trees along deck
  for (let px = -36; px <= 36; px += 9) {
    const palmTrunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.35, 4.5, 8),
      woodTrunkMat
    );
    palmTrunk.position.set(px, towerHeight + skyparkH + 2.25, 2.5);
    const palmFrond = new THREE.Mesh(
      new THREE.SphereGeometry(1.75, 8, 8),
      supertreeFoliageMat
    );
    palmFrond.scale.set(1.2, 0.55, 1.2);
    palmFrond.position.set(px, towerHeight + skyparkH + 4.5, 2.5);
    mbsGroup.add(palmTrunk, palmFrond);
  }

  // Bind interactive mesh
  skypark.userData = { buildingData: mbsData };
  interactiveMeshes.push(skypark);
  mbsTowerMeshes.forEach((m) => {
    m.userData = { buildingData: mbsData };
    interactiveMeshes.push(m);
  });
  group.add(mbsGroup);

  // =========================================================================
  // 2. SINGAPORE: GARDENS BY THE BAY (Supertree Grove & Aerial Skyway)
  // =========================================================================
  const gbGroup = new THREE.Group();
  gbGroup.position.set(-205, 0, 110);

  const gbData: BuildingData = {
    id: 'singapore-gardens-by-the-bay',
    name: 'Gardens by the Bay - Supertree Grove',
    districtId: 'riverside',
    districtName: 'Marina South Gardens',
    category: 'Research Pod',
    height: 52,
    floors: 16,
    position: [-205, 0, 110],
    dimensions: [75, 52, 75],
    powerUsage: 'Solar Canopy Generative (+4.2 MW Surplus)',
    occupancy: '95% (16,000 Daily Botanical Visitors)',
    networkStatus: 'Eco-Sensing Environmental Grid Active',
    description:
      'Iconic vertical garden Supertrees ranging from 25 to 50 meters tall. Embedded with photovoltaic cells, rainwater collection canopies, radial steel exoskeleton ribs, living plant walls, and the elevated OCBC Skyway suspension walkway.',
    features: [
      'Vertical Living Plant Skins with 162,900+ Bromeliads & Ferns',
      'Radial Exoskeleton Steel Lattice Ribs & Flaring Crown Canopies',
      'Elevated OCBC Skyway Suspension Walkway at 22m Height',
      'Nightly Garden Rhapsody Bioluminescent Light & Sound Show',
    ],
    isLandmark: true,
  };
  buildingsData.push(gbData);

  const supertrees = [
    { x: 0, z: 0, height: 50, crownRad: 16.5 },     // Central Master Supertree
    { x: -25, z: -18, height: 38, crownRad: 12.5 }, // West Supertree
    { x: 26, z: -14, height: 40, crownRad: 13.5 },  // East Supertree
    { x: -16, z: 26, height: 34, crownRad: 11.5 },  // South-West Supertree
    { x: 22, z: 24, height: 36, crownRad: 12.0 },   // South-East Supertree
  ];

  supertrees.forEach((st, idx) => {
    // 1. Concrete & Steel Flared Trunk
    const trunkGeo = new THREE.CylinderGeometry(
      st.crownRad * 0.24,
      st.crownRad * 0.46,
      st.height * 0.76,
      16
    );
    const trunk = new THREE.Mesh(trunkGeo, supertreeCoreMat);
    trunk.position.set(st.x, (st.height * 0.76) / 2, st.z);
    trunk.castShadow = true;
    gbGroup.add(trunk);

    // 2. Living Green Plant Skin Covering
    const foliageGeo = new THREE.CylinderGeometry(
      st.crownRad * 0.27,
      st.crownRad * 0.50,
      st.height * 0.68,
      16,
      1,
      true
    );
    const foliage = new THREE.Mesh(foliageGeo, supertreeFoliageMat);
    foliage.position.set(st.x, (st.height * 0.68) / 2 + 1, st.z);
    gbGroup.add(foliage);

    // 3. Radial Exoskeleton Ribs Flaring Outward into Inverted Umbrella Crown
    const ribCount = 12;
    for (let r = 0; r < ribCount; r++) {
      const ang = (r / ribCount) * Math.PI * 2;
      const rib = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.26, st.height * 0.34, 6),
        supertreeGlowMat
      );
      const midR = st.crownRad * 0.58;
      rib.position.set(
        st.x + Math.cos(ang) * midR,
        st.height * 0.84,
        st.z + Math.sin(ang) * midR
      );
      rib.rotation.z = -Math.cos(ang) * 0.58;
      rib.rotation.x = Math.sin(ang) * 0.58;
      gbGroup.add(rib);
    }

    // 4. Concentric Bioluminescent Crown Canopy Rings
    [0.62, 0.82, 1.0].forEach((scaleFactor, rIdx) => {
      const ringGeo = new THREE.TorusGeometry(st.crownRad * scaleFactor, 0.38, 8, 32);
      ringGeo.rotateX(Math.PI / 2);
      const glowRing = new THREE.Mesh(ringGeo, supertreeGlowMat);
      glowRing.position.set(st.x, st.height * (0.82 + rIdx * 0.08), st.z);
      gbGroup.add(glowRing);
    });

    // 5. Solar Photovoltaic Crown Cap on Central Supertree
    if (idx === 0) {
      const obsDeck = new THREE.Mesh(
        new THREE.CylinderGeometry(5.5, 4.5, 2.4, 16),
        materials.glassCyan
      );
      obsDeck.position.set(st.x, st.height * 0.92, st.z);
      gbGroup.add(obsDeck);

      trunk.userData = { buildingData: gbData };
      obsDeck.userData = { buildingData: gbData };
      interactiveMeshes.push(trunk, obsDeck);
    }
  });

  // Curved Elevated OCBC Skyway Suspension Bridge connecting the Supertrees
  const skywayDeck = new THREE.Mesh(
    new THREE.TorusGeometry(24, 0.9, 6, 36, Math.PI * 1.15),
    mbsDeckMat
  );
  skywayDeck.rotation.x = Math.PI / 2;
  skywayDeck.rotation.z = -0.3;
  skywayDeck.position.set(0, 22, 4);
  gbGroup.add(skywayDeck);

  group.add(gbGroup);

  animatables.push((time: number) => {
    const pulse = Math.sin(time * 2.5) * 0.35 + 0.95;
    supertreeGlowMat.emissiveIntensity = pulse;
  });

  // =========================================================================
  // 3. PARIS: EIFFEL TOWER (Tour Eiffel - 165m Wrought-Iron Lattice Masterpiece)
  // =========================================================================
  const eiffelGroup = new THREE.Group();
  eiffelGroup.position.set(-45, 0, -125); // Champ de Mars cultural sector

  const eiffelData: BuildingData = {
    id: 'paris-eiffel-tower',
    name: 'Eiffel Tower (Tour Eiffel) - Champ de Mars',
    districtId: 'entertainment',
    districtName: 'Parisian Arts & Cultural District',
    category: 'Landmark',
    height: 165,
    floors: 3,
    position: [-45, 0, -125],
    dimensions: [56, 165, 56],
    powerUsage: '6.8 MW (Golden Illumination & Hydraulic Lifts)',
    occupancy: '94% (25,000 Global Visitors Daily)',
    networkStatus: 'National Broadcast & Telemetry Mast Online',
    description:
      'Gustave Eiffel’s world-famous 1889 wrought-iron lattice monument. Features 4 splayed lattice leg pylons anchored in masonry foundations, 4 monumental semicircular entrance arches, Level 1 and Level 2 double-deck observation pavilions, and a pinnacle cupola with a 360-degree rotating golden searchlight beacon.',
    features: [
      '18,038 Puddle-Iron Lattice Truss Members & 2.5M Rivets',
      'Four Splayed Pylon Legs & Monumental Semicircular Base Arches',
      'Level 1 & Level 2 Observation Pavilions with Central Open Void',
      'Rotating 360° Golden Aerial Searchlight Beacon & Cupola',
    ],
    isLandmark: true,
  };
  buildingsData.push(eiffelData);

  // A. Four Masonry Stone Foundations & Splayed Lattice Pylon Legs (0 to 36m)
  const baseSpan = 21;
  const legH = 36;

  [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ].forEach(([sx, sz]) => {
    // Inclined Masonry Foundation Pier
    const masonry = new THREE.Mesh(
      new THREE.BoxGeometry(6.5, 4.5, 6.5),
      parisStoneMat
    );
    masonry.position.set(sx * baseSpan, 2.25, sz * baseSpan);
    eiffelGroup.add(masonry);

    // Splayed Lattice Box-Girder Pylon angling inward from +/-21m to +/-12m
    const legGeo = new THREE.CylinderGeometry(2.6, 4.4, legH, 4);
    const leg = new THREE.Mesh(legGeo, parisIronMat);
    leg.position.set(sx * 16.5, legH / 2 + 2, sz * 16.5);
    leg.rotation.z = sx * 0.24;
    leg.rotation.x = -sz * 0.24;
    leg.castShadow = true;
    eiffelGroup.add(leg);
  });

  // B. Four Monumental Vertical Semicircular Base Arches on North, South, East, West Faces
  [
    { x: 0, z: 18.5, rotY: 0 },
    { x: 0, z: -18.5, rotY: 0 },
    { x: 18.5, z: 0, rotY: Math.PI / 2 },
    { x: -18.5, z: 0, rotY: Math.PI / 2 },
  ].forEach((cfg) => {
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(13.5, 1.05, 8, 32, Math.PI),
      parisIronMat
    );
    arch.position.set(cfg.x, 4, cfg.z);
    arch.rotation.y = cfg.rotY;
    eiffelGroup.add(arch);
  });

  // C. Level 1 Double-Deck Observation Pavilion & Perimeter Gallery (Height 36m)
  const plat1Base = new THREE.Mesh(new THREE.BoxGeometry(31, 2.4, 31), parisIronMat);
  plat1Base.position.y = legH;
  plat1Base.castShadow = true;
  eiffelGroup.add(plat1Base);

  const plat1Pavilion = new THREE.Mesh(
    new THREE.BoxGeometry(27, 3.2, 27),
    parisGoldTrimMat
  );
  plat1Pavilion.position.y = legH + 2.6;
  eiffelGroup.add(plat1Pavilion);

  const plat1Top = new THREE.Mesh(new THREE.BoxGeometry(29.5, 1.4, 29.5), parisIronMat);
  plat1Top.position.y = legH + 4.6;
  eiffelGroup.add(plat1Top);

  // D. Mid Section: Four Converging Lattice Standards with Open Central Void (Height 40m to 74m)
  const midH = 34;
  const midStartY = legH + 5;
  [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ].forEach(([sx, sz]) => {
    const midLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(2.0, 3.1, midH, 4),
      parisIronMat
    );
    midLeg.position.set(sx * 8.2, midStartY + midH / 2, sz * 8.2);
    midLeg.rotation.z = sx * 0.14;
    midLeg.rotation.x = -sz * 0.14;
    midLeg.castShadow = true;
    eiffelGroup.add(midLeg);
  });

  // Mid-section horizontal lattice belt truss at Y = 56m
  const midBelt = new THREE.Mesh(new THREE.BoxGeometry(19.5, 2.2, 19.5), parisIronMat);
  midBelt.position.y = midStartY + midH * 0.5;
  eiffelGroup.add(midBelt);

  // E. Level 2 Double-Deck Observation Platform (Height 74m)
  const plat2Y = midStartY + midH;
  const plat2 = new THREE.Mesh(new THREE.BoxGeometry(18.5, 2.4, 18.5), parisIronMat);
  plat2.position.y = plat2Y;
  eiffelGroup.add(plat2);

  const plat2Gallery = new THREE.Mesh(new THREE.BoxGeometry(16, 2.2, 16), parisGoldTrimMat);
  plat2Gallery.position.y = plat2Y + 2.2;
  eiffelGroup.add(plat2Gallery);

  // F. Upper Tapering Lattice Spire Shaft with Structural Girder Rings (Height 76m to 150m)
  const spireH = 74;
  const spireStartY = plat2Y + 3.2;
  const towerSpire = new THREE.Mesh(
    new THREE.CylinderGeometry(2.4, 6.8, spireH, 4),
    parisIronMat
  );
  towerSpire.position.y = spireStartY + spireH / 2;
  towerSpire.rotation.y = Math.PI / 4;
  towerSpire.castShadow = true;
  eiffelGroup.add(towerSpire);

  // Horizontal structural box-girder rings along upper shaft
  for (let ry = 10; ry < spireH; ry += 12) {
    const ringW = (6.8 - (ry / spireH) * 4.4) * 1.48;
    const ring = new THREE.Mesh(
      new THREE.BoxGeometry(ringW, 1.1, ringW),
      parisIronMat
    );
    ring.position.y = spireStartY + ry;
    eiffelGroup.add(ring);
  }

  // G. Level 3 Summit Observation Platform, Gustave Eiffel's Cupola & Broadcast Mast (150m to 165m)
  const summitY = spireStartY + spireH;
  const summitDeck = new THREE.Mesh(new THREE.BoxGeometry(6.5, 2.0, 6.5), parisIronMat);
  summitDeck.position.y = summitY;
  eiffelGroup.add(summitDeck);

  const apexDome = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.8, 4.5, 12),
    parisGoldTrimMat
  );
  apexDome.position.y = summitY + 3.0;
  eiffelGroup.add(apexDome);

  const cupolaCap = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
    parisIronMat
  );
  cupolaCap.position.y = summitY + 5.2;
  eiffelGroup.add(cupolaCap);

  const radioMast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.7, 13, 8),
    artDecoSteelMat
  );
  radioMast.position.y = summitY + 11.5;
  eiffelGroup.add(radioMast);

  // H. 360-Degree Rotating Dual Aerial Golden Searchlight Beams
  const beaconLightGroup = new THREE.Group();
  beaconLightGroup.position.y = summitY + 5.5;

  [-1, 1].forEach((dir) => {
    const beaconGeo = new THREE.CylinderGeometry(0.15, 7.5, 68, 12);
    beaconGeo.rotateX((Math.PI / 2) * dir);
    beaconGeo.translate(0, 0, 34 * dir);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    beaconLightGroup.add(new THREE.Mesh(beaconGeo, beaconMat));
  });
  eiffelGroup.add(beaconLightGroup);

  animatables.push((time: number) => {
    beaconLightGroup.rotation.y = time * 0.85;
  });

  plat1Base.userData = { buildingData: eiffelData };
  towerSpire.userData = { buildingData: eiffelData };
  interactiveMeshes.push(plat1Base, towerSpire);
  group.add(eiffelGroup);

  // =========================================================================
  // 4. PARIS: ARC DE TRIOMPHE (Place Charles de Gaulle Neoclassical Monument)
  // =========================================================================
  const arcGroup = new THREE.Group();
  arcGroup.position.set(-85, 0, -165); // Grand Avenue Plaza

  const arcData: BuildingData = {
    id: 'paris-arc-de-triomphe',
    name: 'Arc de Triomphe - Place Charles de Gaulle',
    districtId: 'entertainment',
    districtName: 'Parisian Historic Axis',
    category: 'Landmark',
    height: 50,
    floors: 4,
    position: [-85, 0, -165],
    dimensions: [45, 50, 22],
    powerUsage: '1.8 MW Civic Monument & Eternal Flame',
    occupancy: '92% (14,000 Visitors)',
    networkStatus: 'Civic Mesh Active',
    description:
      'Iconic neoclassical triumphal arch standing at the center of the 12 radiating Parisian avenues. Features 4 sculpted Lutetian limestone piers with high-relief groups including La Marseillaise, a vaulted Grande Arcade, dentil cornice entablature, and rooftop viewing terrace.',
    features: [
      'Four Sculpted Lutetian Limestone Piers & Pedestals',
      'Intersecting Barrel-Vaulted Grande Arcade & Transverse Arch',
      'Projecting Dentil Cornice & Attic Frieze with 30 Shields',
      'Tomb of the Unknown Soldier Eternal Flame & Rooftop Terrace',
    ],
    isLandmark: true,
  };
  buildingsData.push(arcData);

  // Four Corner Masonry Pillars creating Both Main Arch and Transverse Archways
  const pierW = 6.2;
  const pierH = 31;
  const pierD = 8.2;

  [
    [-13.5, -5.2],
    [13.5, -5.2],
    [-13.5, 5.2],
    [13.5, 5.2],
  ].forEach(([px, pz]) => {
    // Moulded Base Plinth
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(pierW + 1.4, 4.5, pierD + 1.4),
      parisStoneMat
    );
    plinth.position.set(px, 2.25, pz);
    arcGroup.add(plinth);

    // Main Ashlar Limestone Pillar
    const pier = new THREE.Mesh(
      new THREE.BoxGeometry(pierW, pierH, pierD),
      parisStoneMat
    );
    pier.position.set(px, pierH / 2, pz);
    pier.castShadow = true;
    pier.receiveShadow = true;
    arcGroup.add(pier);

    // High-Relief Sculpted Pedestal Frame (La Marseillaise) on Front/Rear Facades
    const relief = new THREE.Mesh(
      new THREE.BoxGeometry(pierW * 0.68, 12, 0.8),
      parisStoneMat
    );
    relief.position.set(px, 12.5, pz + (pz > 0 ? pierD / 2 + 0.3 : -pierD / 2 - 0.3));
    arcGroup.add(relief);
  });

  // Semicircular Barrel Vault Coffered Arch Crown
  const archVault = new THREE.Mesh(
    new THREE.TorusGeometry(9.2, 1.4, 8, 24, Math.PI),
    parisStoneMat
  );
  archVault.position.set(0, 21.5, 0);
  archVault.scale.set(1, 1, 7.8);
  arcGroup.add(archVault);

  // Upper Entablature & Frieze Block above Arch
  const archRoof = new THREE.Mesh(
    new THREE.BoxGeometry(41.5, 11, 20.5),
    parisStoneMat
  );
  archRoof.position.set(0, pierH + 5.5, 0);
  archRoof.castShadow = true;
  arcGroup.add(archRoof);

  // Projecting Neoclassical Dentil Cornice Ledge
  const mainCornice = new THREE.Mesh(
    new THREE.BoxGeometry(43.8, 1.8, 22.8),
    parisStoneMat
  );
  mainCornice.position.set(0, pierH + 11.2, 0);
  arcGroup.add(mainCornice);

  // Attic Story with 30 Inscribed Gilded Shields
  const attic = new THREE.Mesh(
    new THREE.BoxGeometry(40.5, 6.2, 19.5),
    parisStoneMat
  );
  attic.position.set(0, pierH + 15.0, 0);
  arcGroup.add(attic);

  for (let sx = -17; sx <= 17; sx += 3.4) {
    [-9.9, 9.9].forEach((sz) => {
      const shield = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.65, 0.25, 12),
        parisGoldTrimMat
      );
      shield.rotation.x = Math.PI / 2;
      shield.position.set(sx, pierH + 15.0, sz);
      arcGroup.add(shield);
    });
  }

  // Eternal Flame Bronze Brazier beneath the Vault
  const flameRing = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.6, 0.4, 16),
    parisGoldTrimMat
  );
  flameRing.position.set(0, 0.2, 0);
  arcGroup.add(flameRing);

  archRoof.userData = { buildingData: arcData };
  interactiveMeshes.push(archRoof);
  group.add(arcGroup);

  // =========================================================================
  // 5. AMERICA: EMPIRE STATE BUILDING (Art Deco Skyscraper - 240m)
  // =========================================================================
  const esbGroup = new THREE.Group();
  esbGroup.position.set(65, 0, -85); // 5th Avenue American Corridor

  const esbData: BuildingData = {
    id: 'america-empire-state-building',
    name: 'Empire State Building - Fifth Avenue NYC',
    districtId: 'downtown',
    districtName: 'Metropolitan Financial Corridor',
    category: 'Skyscraper',
    height: 240,
    floors: 102,
    position: [65, 0, -85],
    dimensions: [38, 240, 32],
    powerUsage: '18.6 MW (Empire State Retrofit Energy Star)',
    occupancy: '97% (21,000 Corporate Tenants & Visitors)',
    networkStatus: 'Tier-1 Optical Hub 100%',
    description:
      'The world’s most celebrated American Art Deco skyscraper. Features 7 iconic stepped Indiana limestone setbacks, 6,514 recessed double-hung windows, polished chrome-nickel steel mullions, 86th Floor Open-Air Observatory, 102nd Floor Top Deck, and a 62m illuminated mooring mast.',
    features: [
      'Classic 1931 Shreve, Lamb & Harmon Art Deco Setback Massing',
      'Indiana Limestone Ashlar Facade & Chrome-Nickel Steel Mullions',
      '86th Floor Open-Air & 102nd Floor Enclosed Observatories',
      '62-Meter Illuminated Mooring Mast & Broadcast Needle Spire',
    ],
    isLandmark: true,
  };
  buildingsData.push(esbData);

  // A. 5-Story Fifth Avenue Limestone Podium & Monumental Brass Entrance Portal
  const esbBase = new THREE.Mesh(
    new THREE.BoxGeometry(38, 16, 30),
    artDecoLimestoneMat
  );
  esbBase.position.y = 8;
  esbBase.castShadow = true;
  esbBase.receiveShadow = true;
  esbGroup.add(esbBase);

  const entrancePortal = new THREE.Mesh(
    new THREE.BoxGeometry(8.5, 11, 1.4),
    artDecoSteelMat
  );
  entrancePortal.position.set(0, 5.5, 15.2);
  esbGroup.add(entrancePortal);

  // B. Seven Stepped Art Deco Setback Tiers with 3D Stainless Steel Mullion Fins (Floors 6 - 86)
  const esbTiers = [
    { w: 32, d: 25, h: 24, y: 16 },   // Lower Setback Tier
    { w: 26, d: 21, h: 48, y: 40 },   // Lower Shaft
    { w: 22, d: 18, h: 52, y: 88 },   // Main Mid-Rise Shaft
    { w: 18.5, d: 15.5, h: 40, y: 140 }, // Upper Setback Shaft
    { w: 15.5, d: 13.5, h: 22, y: 180 }, // Crown Neck below 86th Floor
  ];

  const esbMeshes: THREE.Mesh[] = [esbBase];

  esbTiers.forEach((tier) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(tier.w, tier.h, tier.d),
      artDecoLimestoneMat
    );
    mesh.position.y = tier.y + tier.h / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    esbGroup.add(mesh);
    esbMeshes.push(mesh);

    // Limestone parapet coping ledge at top of each setback tier
    const coping = new THREE.Mesh(
      new THREE.BoxGeometry(tier.w + 0.8, 0.8, tier.d + 0.8),
      artDecoSteelMat
    );
    coping.position.y = tier.y + tier.h - 0.4;
    esbGroup.add(coping);

    // 3D Extruded Chrome-Nickel Steel Vertical Mullion Ribs on All 4 Facades
    [-tier.w * 0.28, 0, tier.w * 0.28].forEach((mx) => {
      const mullion = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, tier.h, tier.d + 0.45),
        artDecoSteelMat
      );
      mullion.position.set(mx, tier.y + tier.h / 2, 0);
      esbGroup.add(mullion);
    });
  });

  // C. 86th Floor Open-Air Observatory Deck & Parapet Fence (Height 202m)
  const obs86 = new THREE.Mesh(
    new THREE.BoxGeometry(16.6, 3.2, 14.6),
    artDecoSteelMat
  );
  obs86.position.y = 203.6;
  esbGroup.add(obs86);

  // D. Illuminated Art Deco Mooring Mast Tower (Floors 87 - 102, Height 205m to 224m)
  const mastGlowMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    emissive: new THREE.Color(0x38bdf8),
    emissiveIntensity: 0.45,
    metalness: 0.85,
    roughness: 0.18,
  });

  const mastTower = new THREE.Mesh(
    new THREE.CylinderGeometry(4.4, 5.8, 18, 16),
    mastGlowMat
  );
  mastTower.position.y = 205.2 + 9;
  esbGroup.add(mastTower);

  // 102nd Floor Enclosed Observation Ring
  const obs102 = new THREE.Mesh(
    new THREE.CylinderGeometry(4.9, 4.9, 2.6, 20),
    artDecoSteelMat
  );
  obs102.position.y = 223.8;
  esbGroup.add(obs102);

  // E. Stepped Broadcast Spire Needle & Red Aviation Beacon (225m to 248m)
  const esbSpire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 2.6, 23, 12),
    artDecoSteelMat
  );
  esbSpire.position.y = 225.1 + 11.5;
  esbGroup.add(esbSpire);

  const esbRedBeacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 8, 8),
    materials.neonRed
  );
  esbRedBeacon.position.y = 248.5;
  esbGroup.add(esbRedBeacon);

  esbMeshes.forEach((m) => {
    m.userData = { buildingData: esbData };
    interactiveMeshes.push(m);
  });
  group.add(esbGroup);

  // =========================================================================
  // 6. AMERICA: ONE WORLD TRADE CENTER (Freedom Tower - 215m Antiprism Monolith)
  // =========================================================================
  const wtcGroup = new THREE.Group();
  wtcGroup.position.set(115, 0, -45); // Lower Manhattan Core

  const wtcData: BuildingData = {
    id: 'america-one-world-trade-center',
    name: 'One World Trade Center - Lower Manhattan',
    districtId: 'downtown',
    districtName: 'World Financial District',
    category: 'Skyscraper',
    height: 215,
    floors: 104,
    position: [115, 0, -45],
    dimensions: [32, 215, 32],
    powerUsage: '24.2 MW (LEED Gold High-Performance)',
    occupancy: '96% (26,000 Global Executives)',
    networkStatus: 'Global Financial Backbone 100%',
    description:
      'Iconic supertall skyscraper of the Western Hemisphere designed by David Childs (SOM). Rises from a fortified 200-foot stainless-steel louvered cubic podium, tapering into 8 interlocking isosceles-triangle crystalline glass facets, crowned by a 408-foot broadcast spire.',
    features: [
      'Eight Interlocking Isosceles Triangle Crystalline Glass Facets',
      'Fortified Base Podium with 4,000 Stainless-Steel Louver Fins',
      'One World Observatory on 100th, 101st & 102nd Floors',
      '10-Ring Communications Platform & 408-Foot LED Broadcast Spire',
    ],
    isLandmark: true,
  };
  buildingsData.push(wtcData);

  // A. Fortified Cubic Podium Base with Vertical Stainless-Steel Louver Fins
  const wtcBase = new THREE.Mesh(
    new THREE.BoxGeometry(27, 28, 27),
    materials.concrete
  );
  wtcBase.position.y = 14;
  wtcBase.castShadow = true;
  wtcBase.receiveShadow = true;
  wtcGroup.add(wtcBase);

  for (let lx = -12; lx <= 12; lx += 3) {
    const fin = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 26, 27.6),
      artDecoSteelMat
    );
    fin.position.set(lx, 14, 0);
    wtcGroup.add(fin);
  }

  // B. Interlocking Antiprism Crystalline Faceted Tower Body (Height 28m to 170m)
  const wtcBodyH = 142;
  const wtcPrismA = new THREE.Mesh(
    new THREE.CylinderGeometry(13.5, 19.2, wtcBodyH, 4),
    crystallineGlassMat
  );
  wtcPrismA.position.y = 28 + wtcBodyH / 2;
  wtcPrismA.rotation.y = Math.PI / 4;
  wtcPrismA.castShadow = true;
  wtcPrismA.receiveShadow = true;
  wtcGroup.add(wtcPrismA);

  const wtcPrismB = new THREE.Mesh(
    new THREE.CylinderGeometry(19.2, 13.5, wtcBodyH, 4),
    crystallineGlassMat
  );
  wtcPrismB.position.y = 28 + wtcBodyH / 2;
  wtcPrismB.rotation.y = 0;
  wtcPrismB.castShadow = true;
  wtcPrismB.receiveShadow = true;
  wtcGroup.add(wtcPrismB);

  // C. One World Observatory Illuminated Band (100th–102nd Floors) & Square Parapet
  const obsWtc = new THREE.Mesh(
    new THREE.BoxGeometry(20.2, 4.5, 20.2),
    mastGlowMat
  );
  obsWtc.position.y = 28 + wtcBodyH - 6;
  obsWtc.rotation.y = Math.PI / 4;
  wtcGroup.add(obsWtc);

  const parapet = new THREE.Mesh(
    new THREE.BoxGeometry(20.4, 3.8, 20.4),
    artDecoSteelMat
  );
  parapet.position.y = 28 + wtcBodyH + 1.9;
  parapet.rotation.y = Math.PI / 4;
  wtcGroup.add(parapet);

  // D. Rooftop Communications Ring Platform & 408-Foot Spire Mast
  const commRing = new THREE.Mesh(
    new THREE.TorusGeometry(6.8, 0.55, 8, 24),
    artDecoSteelMat
  );
  commRing.rotation.x = Math.PI / 2;
  commRing.position.y = 28 + wtcBodyH + 5.2;
  wtcGroup.add(commRing);

  const wtcSpireH = 40;
  const wtcSpire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 1.9, wtcSpireH, 12),
    artDecoSteelMat
  );
  wtcSpire.position.y = 28 + wtcBodyH + 3.8 + wtcSpireH / 2;
  wtcGroup.add(wtcSpire);

  const wtcStrobe = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 8, 8),
    materials.neonWhite
  );
  wtcStrobe.position.y = 28 + wtcBodyH + 4.2 + wtcSpireH;
  wtcGroup.add(wtcStrobe);

  wtcPrismA.userData = { buildingData: wtcData };
  wtcPrismB.userData = { buildingData: wtcData };
  interactiveMeshes.push(wtcPrismA, wtcPrismB);
  group.add(wtcGroup);

  scene.add(group);

  const update = (time: number) => {
    animatables.forEach((fn) => fn(time));
  };

  const dispose = () => {
    scene.remove(group);
    mbsFacadeTex.dispose();
    eiffelLatticeTex.dispose();
    parisLimestoneTex.dispose();
    esbFacadeTex.dispose();
    wtcCurtainTex.dispose();
    parisIronMat.dispose();
    parisGoldTrimMat.dispose();
    parisStoneMat.dispose();
    mbsGlassMat.dispose();
    mbsDeckMat.dispose();
    poolWaterMat.dispose();
    supertreeCoreMat.dispose();
    supertreeFoliageMat.dispose();
    supertreeGlowMat.dispose();
    artDecoLimestoneMat.dispose();
    artDecoSteelMat.dispose();
    crystallineGlassMat.dispose();
    mastGlowMat.dispose();
    woodTrunkMat.dispose();
  };

  return {
    group,
    buildingsData,
    interactiveMeshes,
    update,
    dispose,
  };
}
