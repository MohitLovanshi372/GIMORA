/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { BuildingData } from '../city/types';
import { CityMaterials } from '../assets/materials';
import {
  createBurjKhalifaFacadeTexture,
  createMuseumOfFutureCalligraphyTexture,
  createDubaiGoldLatticeTexture,
  createPalmTreeBarkTexture,
} from '../assets/textures';

export interface DubaiLandmarkSystem {
  group: THREE.Group;
  buildingsData: BuildingData[];
  interactiveMeshes: THREE.Object3D[];
  update: (time: number) => void;
  dispose: () => void;
}

/**
 * High-Fidelity 3D Architectural Models of Iconic Dubai Landmarks
 */
export function createDubaiLandmarks(
  scene: THREE.Scene,
  materials: CityMaterials
): DubaiLandmarkSystem {
  const group = new THREE.Group();
  group.name = 'dubai_landmarks_system';

  const buildingsData: BuildingData[] = [];
  const interactiveMeshes: THREE.Object3D[] = [];
  const animatables: ((time: number) => void)[] = [];

  // Shared Textures
  const burjTex = createBurjKhalifaFacadeTexture();
  const museumTex = createMuseumOfFutureCalligraphyTexture();
  const goldLatticeTex = createDubaiGoldLatticeTexture();
  const palmBarkTex = createPalmTreeBarkTexture();

  // Shared Dubai PBR Materials
  const burjGlassMat = new THREE.MeshStandardMaterial({
    map: burjTex,
    color: 0x93c5fd,
    roughness: 0.12,
    metalness: 0.88,
    envMapIntensity: 1.9,
  });

  const burjSteelMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.92,
    roughness: 0.18,
    envMapIntensity: 1.8,
  });

  const gold24kMat = new THREE.MeshStandardMaterial({
    map: goldLatticeTex,
    color: 0xfbbf24,
    metalness: 0.85,
    roughness: 0.22,
    envMapIntensity: 2.2,
  });

  const sailWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
    metalness: 0.15,
  });

  const museumSteelMat = new THREE.MeshStandardMaterial({
    map: museumTex,
    color: 0xf8fafc,
    roughness: 0.25,
    metalness: 0.85,
    envMapIntensity: 1.6,
  });

  const palmFoliageMat = new THREE.MeshStandardMaterial({
    color: 0x166534,
    roughness: 0.65,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  const palmTrunkMat = new THREE.MeshStandardMaterial({
    map: palmBarkTex,
    color: 0x78350f,
    roughness: 0.85,
    metalness: 0.05,
  });

  // =========================================================================
  // 1. BURJ KHALIFA (The World's Tallest Megatall Skyscraper - 285m Equivalent)
  // =========================================================================
  const burjGroup = new THREE.Group();
  burjGroup.position.set(-105, 0, -45); // Central Downtown Dubai Core

  const burjData: BuildingData = {
    id: 'dubai-burj-khalifa',
    name: 'Burj Khalifa - Downtown Dubai',
    districtId: 'downtown',
    districtName: 'Downtown Dubai',
    category: 'Skyscraper',
    height: 285,
    floors: 163,
    position: [-105, 0, -45],
    dimensions: [42, 285, 42],
    powerUsage: '48.5 MW Clean Solar Grid',
    occupancy: '98% (35,000 Residents & Office Personnel)',
    networkStatus: 'Terabit High-Frequency Fiber Core 100%',
    description: 'The crowning jewel of Dubai and the world’s tallest megatall skyscraper. Features 27 helical stepped setbacks, tripartite Y-shaped floorplan, Armani Hotel, Level 148 "At the Top SKY" observation deck, and pinnacle communications spire.',
    features: [
      '27 Helical Stepped Aerodynamic Setbacks',
      'Level 148 "At the Top SKY" Glass Observation Deck',
      'Reflective Silver & Azure Curtain Wall Glass',
      'Tiered Dubai Dancing Fountain Lagoon at Base',
      'Pinnacle Communications Mast with Aviation Beacons',
    ],
    isLandmark: true,
  };
  buildingsData.push(burjData);

  // A. Grand Hexagonal Base Podium & Lake
  const lakeGeo = new THREE.CylinderGeometry(36, 38, 0.4, 32);
  const lakeMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.08,
    metalness: 0.85,
  });
  const lakeMesh = new THREE.Mesh(lakeGeo, lakeMat);
  lakeMesh.position.y = 0.2;
  burjGroup.add(lakeMesh);

  // Stepped Hexagonal Foundation Podium
  const podiumGeo = new THREE.CylinderGeometry(24, 28, 4.5, 6);
  const podium = new THREE.Mesh(podiumGeo, burjSteelMat);
  podium.position.y = 2.25;
  podium.castShadow = true;
  burjGroup.add(podium);

  // B. Tripartite Y-Shaped Setback Tiers (27 Stepped Setback Levels)
  const tierCount = 18;
  const totalTowerH = 220;
  let currentY = 4.5;
  const wingMeshes: THREE.Mesh[] = [];

  for (let t = 0; t < tierCount; t++) {
    const tierProgress = t / tierCount;
    const tierHeight = (totalTowerH / tierCount);
    // Tapering width from 38m down to 6m
    const currentRadius = Math.max(3.2, 20 * (1 - tierProgress * 0.85));

    // 1. Central Hexagonal Core
    const coreGeo = new THREE.CylinderGeometry(
      currentRadius * 0.45,
      currentRadius * 0.50,
      tierHeight,
      6
    );
    const coreMesh = new THREE.Mesh(coreGeo, burjGlassMat);
    coreMesh.position.y = currentY + tierHeight / 2;
    coreMesh.castShadow = true;
    burjGroup.add(coreMesh);

    // 2. Three Y-Shaped Buttressed Wings at 120-degree intervals
    for (let w = 0; w < 3; w++) {
      // Stepped helical setbacks: cycle which wing steps back at each tier
      const wingStep = (t + w) % 3;
      const wingLength = (currentRadius * (1 - wingStep * 0.12));
      const angle = (w * Math.PI * 2) / 3 + tierProgress * 0.4; // subtle aerodynamic twist

      const wingGeo = new THREE.BoxGeometry(currentRadius * 0.38, tierHeight, wingLength);
      const wingMesh = new THREE.Mesh(wingGeo, burjGlassMat);

      // Offset along wing radial angle
      const offsetX = Math.sin(angle) * (wingLength / 2 + currentRadius * 0.2);
      const offsetZ = Math.cos(angle) * (wingLength / 2 + currentRadius * 0.2);

      wingMesh.position.set(offsetX, currentY + tierHeight / 2, offsetZ);
      wingMesh.rotation.y = angle;
      wingMesh.castShadow = true;
      burjGroup.add(wingMesh);
      wingMeshes.push(wingMesh);

      // Stainless Steel Exterior Nose Fin on each wing edge
      const noseFin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.45, tierHeight, 6),
        burjSteelMat
      );
      noseFin.position.set(
        Math.sin(angle) * (wingLength + currentRadius * 0.2),
        currentY + tierHeight / 2,
        Math.cos(angle) * (wingLength + currentRadius * 0.2)
      );
      burjGroup.add(noseFin);
    }

    currentY += tierHeight;
  }

  // C. Level 148 Observation Deck ("At the Top, Burj Khalifa SKY")
  const obsY = currentY - 35;
  const obsRing = new THREE.Mesh(
    new THREE.CylinderGeometry(7.5, 6.8, 4.2, 16),
    new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: new THREE.Color(0xfef08a),
      emissiveIntensity: 0.35,
      metalness: 0.9,
      roughness: 0.1,
    })
  );
  obsRing.position.y = obsY;
  burjGroup.add(obsRing);

  // D. Pinnacle Spire & Telescopic Communications Mast (Height 220 to 285m)
  const spireBaseH = 25;
  const spireBase = new THREE.Mesh(
    new THREE.CylinderGeometry(1.8, 3.2, spireBaseH, 8),
    burjSteelMat
  );
  spireBase.position.y = currentY + spireBaseH / 2;
  burjGroup.add(spireBase);

  const spireMidH = 22;
  const spireMid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 1.8, spireMidH, 8),
    burjSteelMat
  );
  spireMid.position.y = currentY + spireBaseH + spireMidH / 2;
  burjGroup.add(spireMid);

  const spireNeedleH = 18;
  const spireNeedle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.8, spireNeedleH, 8),
    burjSteelMat
  );
  spireNeedle.position.y = currentY + spireBaseH + spireMidH + spireNeedleH / 2;
  burjGroup.add(spireNeedle);

  // Red Flashing FAA Aviation Beacon on Spire Apex
  const beaconGeo = new THREE.SphereGeometry(0.65, 8, 8);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.y = currentY + spireBaseH + spireMidH + spireNeedleH + 0.5;
  burjGroup.add(beacon);

  // E. The Dubai Fountain Water Jets (Animated concentric shooter jets)
  const fountainCount = 24;
  const fountainJets: THREE.Mesh[] = [];
  const jetGeo = new THREE.CylinderGeometry(0.2, 0.6, 6, 8);
  const jetMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.85,
    roughness: 0.1,
    metalness: 0.7,
  });

  for (let f = 0; f < fountainCount; f++) {
    const ang = (f / fountainCount) * Math.PI * 2;
    const rad = 28;
    const jet = new THREE.Mesh(jetGeo, jetMat);
    jet.position.set(Math.cos(ang) * rad, 3.2, Math.sin(ang) * rad);
    burjGroup.add(jet);
    fountainJets.push(jet);
  }

  // Interactive binding
  podium.userData = { buildingData: burjData };
  interactiveMeshes.push(podium);
  wingMeshes.forEach((mesh) => {
    mesh.userData = { buildingData: burjData };
    interactiveMeshes.push(mesh);
  });
  group.add(burjGroup);

  // Animate Burj Khalifa fountain & beacon
  animatables.push((time: number) => {
    // Flashing red obstruction beacon
    beacon.visible = Math.sin(time * 6) > 0.1;

    // Choreographed dancing water fountains
    fountainJets.forEach((jet, idx) => {
      const wave = Math.sin(time * 3 + idx * 0.4) * 0.5 + 0.5;
      const jetH = 2.0 + wave * 9.5;
      jet.scale.set(1, jetH / 6, 1);
      jet.position.y = jetH / 2;
    });
  });

  // =========================================================================
  // 2. BURJ AL ARAB (Iconic 7-Star Luxury Dhow Sail Hotel on Island)
  // =========================================================================
  const baaGroup = new THREE.Group();
  baaGroup.position.set(-55, 0, 85); // Coastal Island sector along water

  const baaData: BuildingData = {
    id: 'dubai-burj-al-arab',
    name: 'Burj Al Arab Jumeirah - Luxury Island',
    districtId: 'riverside',
    districtName: 'Jumeirah Waterfront',
    category: 'Waterfront Venue',
    height: 120,
    floors: 56,
    position: [-55, 0, 85],
    dimensions: [36, 120, 36],
    powerUsage: '14.8 MW Luxury Reserve Grid',
    occupancy: '94% (Exclusive VIP Suites & Royal Pavilions)',
    networkStatus: 'Private Sovereign Optical Encrypted 100%',
    description: 'The world-famous sail-shaped ultra-luxury landmark hotel. Built on an artificial island, it features a billowing white fiberglass sail facade, monumental white exoskeleton steel arches, circular cantilevered rooftop helipad, and panoramic Skyview Lounge.',
    features: [
      'Iconic Billowing Sail Silhouette & Exoskeleton Arches',
      'Cantilevered Circular Rooftop Helipad (210m High)',
      'Cantilevered Skyview Restaurant & Bar',
      'Private Island Causeway Bridge with Palm Promenades',
      'Duplex Luxury Royal Suites with 24k Gold Accents',
    ],
    isLandmark: true,
  };
  buildingsData.push(baaData);

  // A. Triangular Offshore Artificial Island
  const islandGeo = new THREE.CylinderGeometry(26, 28, 1.2, 3);
  const islandMat = new THREE.MeshStandardMaterial({
    color: 0x475569, // Granite rip-rap wave barriers
    roughness: 0.9,
    metalness: 0.1,
  });
  const island = new THREE.Mesh(islandGeo, islandMat);
  island.position.y = 0.6;
  island.receiveShadow = true;
  baaGroup.add(island);

  // Island Paved Terrace
  const islandPaving = new THREE.Mesh(
    new THREE.CylinderGeometry(23, 23, 0.3, 3),
    materials.sidewalk
  );
  islandPaving.position.y = 1.3;
  baaGroup.add(islandPaving);

  // B. Curved Sail Main Facade (Pure White Billowing Double-Curved Sail)
  const sailH = 95;
  const sailGeo = new THREE.CylinderGeometry(14, 2, sailH, 16, 16, true, 0, Math.PI);
  sailGeo.rotateY(Math.PI / 2);
  const sailMesh = new THREE.Mesh(sailGeo, sailWhiteMat);
  sailMesh.position.set(0, sailH / 2 + 1.2, -4);
  sailMesh.castShadow = true;
  baaGroup.add(sailMesh);

  // Rear Triangular Service Spine & Glass Atrium
  const spineGeo = new THREE.ConeGeometry(8, sailH, 3);
  const spine = new THREE.Mesh(spineGeo, materials.glassCyan);
  spine.position.set(0, sailH / 2 + 1.2, 4);
  spine.rotation.y = Math.PI;
  baaGroup.add(spine);

  // C. Exoskeleton Bow Trusses (Massive Diagonal White Steel Arches)
  [-14, 14].forEach((bowX) => {
    const bowRadius = 52;
    const bowGeo = new THREE.TorusGeometry(bowRadius, 1.1, 8, 32, Math.PI * 0.48);
    const bowMesh = new THREE.Mesh(bowGeo, burjSteelMat);
    bowMesh.position.set(bowX, 10, -5);
    bowMesh.rotation.z = (bowX > 0 ? -1 : 1) * 0.12;
    bowMesh.rotation.y = Math.PI / 2;
    bowMesh.castShadow = true;
    baaGroup.add(bowMesh);

    // Diagonal Cross-Struts connecting to sail
    for (let sy = 25; sy <= 85; sy += 20) {
      const strutGeo = new THREE.CylinderGeometry(0.35, 0.35, Math.abs(bowX), 8);
      const strut = new THREE.Mesh(strutGeo, burjSteelMat);
      strut.position.set(bowX / 2, sy, -2);
      strut.rotation.z = Math.PI / 2;
      baaGroup.add(strut);
    }
  });

  // D. Cantilevered Circular Rooftop Helipad
  const heliRadius = 7.5;
  const heliDeck = new THREE.Mesh(
    new THREE.CylinderGeometry(heliRadius, heliRadius, 0.6, 24),
    burjSteelMat
  );
  heliDeck.position.set(0, 84, -14);
  baaGroup.add(heliDeck);

  // Helipad Yellow Perimeter Ring & White H
  const heliRing = new THREE.Mesh(
    new THREE.RingGeometry(heliRadius - 0.8, heliRadius - 0.3, 24).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide })
  );
  heliRing.position.set(0, 84.32, -14);
  baaGroup.add(heliRing);

  const heliH = new THREE.Mesh(
    new THREE.PlaneGeometry(3.5, 4.5).rotateX(-Math.PI / 2),
    materials.neonWhite
  );
  heliH.position.set(0, 84.34, -14);
  baaGroup.add(heliH);

  // Helipad Cantilever Strut Support
  const heliStrut = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.9, 16, 8),
    burjSteelMat
  );
  heliStrut.position.set(0, 76, -10);
  heliStrut.rotation.x = -Math.PI / 4;
  baaGroup.add(heliStrut);

  // E. Cantilevered Skyview Restaurant (Rear ocean projection)
  const skyviewGeo = new THREE.BoxGeometry(16, 4, 9);
  const skyview = new THREE.Mesh(skyviewGeo, materials.glassDark);
  skyview.position.set(0, 78, 11);
  skyview.castShadow = true;
  baaGroup.add(skyview);

  // F. Private Causeway Bridge to Mainland
  const causewayGeo = new THREE.BoxGeometry(7, 0.8, 38);
  const causeway = new THREE.Mesh(causewayGeo, materials.asphalt);
  causeway.position.set(0, 0.8, -36);
  causeway.receiveShadow = true;
  baaGroup.add(causeway);

  // Royal Date Palms on Causeway Bridge
  for (let pz = -48; pz <= -24; pz += 10) {
    [-4.5, 4.5].forEach((px) => {
      const palm = createDatePalmMesh(palmTrunkMat, palmFoliageMat, 0.7);
      palm.position.set(px, 0.8, pz);
      baaGroup.add(palm);
    });
  }

  sailMesh.userData = { buildingData: baaData };
  interactiveMeshes.push(sailMesh);
  group.add(baaGroup);

  // =========================================================================
  // 3. MUSEUM OF THE FUTURE (Torus Architectural Marvel with Arabic Calligraphy)
  // =========================================================================
  const motfGroup = new THREE.Group();
  motfGroup.position.set(70, 0, 10); // Prime Sheikh Zayed Road Boulevard Frontage

  const motfData: BuildingData = {
    id: 'dubai-museum-of-the-future',
    name: 'Museum of the Future - Sheikh Zayed Rd',
    districtId: 'technology',
    districtName: 'Dubai Future District',
    category: 'Research Pod',
    height: 77,
    floors: 7,
    position: [70, 0, 10],
    dimensions: [32, 77, 48],
    powerUsage: '8.4 MW Sustainable Platinum LEED',
    occupancy: '95% (18,000 Global Innovators & Visitors)',
    networkStatus: 'AI Ecosystem Trunks 100% Operational',
    description: 'One of the world’s most intricate architectural marvels. A toroid ring clad in gleaming stainless steel, engraved with quotes of Arabic poetry by Sheikh Mohammed bin Rashid Al Maktoum that illuminate as window apertures.',
    features: [
      'Toroid Architectural Ring with Hollow Elliptical Void',
      'Facade Engraved with Illuminating Arabic Poetry Calligraphy',
      'Lush Green Mound Landscaped Earthen Podium',
      'Column-Free Interior Exhibition Spaces on 7 Levels',
      'Autonomous Drone Port & High-Speed Transportation Plaza',
    ],
    isLandmark: true,
  };
  buildingsData.push(motfData);

  // A. Lush Green Landscaped Hill Podium
  const hillGeo = new THREE.ConeGeometry(26, 6, 24);
  const hillMat = new THREE.MeshStandardMaterial({
    color: 0x2e7d32, // Lush manicured grass green
    roughness: 0.8,
    metalness: 0.05,
  });
  const hill = new THREE.Mesh(hillGeo, hillMat);
  hill.position.y = 3.0;
  hill.receiveShadow = true;
  motfGroup.add(hill);

  // B. Torus Ring Structure with Central Void
  const torusMajor = 22;
  const torusMinor = 8.5;
  const torusGeo = new THREE.TorusGeometry(torusMajor, torusMinor, 24, 48);
  torusGeo.scale(1.2, 1.4, 0.7); // Elliptical profile
  const torusMesh = new THREE.Mesh(torusGeo, museumSteelMat);
  torusMesh.position.set(0, 32, 0);
  torusMesh.rotation.y = Math.PI / 4;
  torusMesh.castShadow = true;
  motfGroup.add(torusMesh);

  // Entrance Atrium Glass Cube below void
  const entranceCube = new THREE.Mesh(
    new THREE.BoxGeometry(14, 6, 14),
    materials.glassDark
  );
  entranceCube.position.y = 7.5;
  motfGroup.add(entranceCube);

  torusMesh.userData = { buildingData: motfData };
  interactiveMeshes.push(torusMesh);
  group.add(motfGroup);

  // =========================================================================
  // 4. DUBAI FRAME (The Monumental Golden Architectural Picture Frame)
  // =========================================================================
  const frameGroup = new THREE.Group();
  frameGroup.position.set(-145, 0, -145); // Gateway Park sector

  const frameData: BuildingData = {
    id: 'dubai-frame',
    name: 'The Dubai Frame - Zabeel Park',
    districtId: 'education',
    districtName: 'Zabeel Cultural District',
    category: 'Landmark',
    height: 75,
    floors: 48,
    position: [-145, 0, -145],
    dimensions: [48, 75, 12],
    powerUsage: '4.2 MW Solar Integrated',
    occupancy: '92% (8,500 Daily Visitors)',
    networkStatus: 'Civic Fiber Network',
    description: 'Iconic 150m-equivalent golden monument framing panoramic views of historic and contemporary Dubai. Features twin golden towers clad in Islamic star filigree and an illuminated glass-floored skybridge spanning 48m.',
    features: [
      'Twin Golden Stainless Steel Towers (75m Tall)',
      '48-Meter High Glass-Floored Sky Bridge with 360° Views',
      '24k Gold Islamic Star Filigree Cladding Panels',
      'Historic & Futuristic Immersive Holographic Galleries',
    ],
    isLandmark: true,
  };
  buildingsData.push(frameData);

  // Twin Golden Towers
  const towerH = 75;
  const towerW = 6.5;
  const towerD = 8.5;
  const towerSpan = 38;

  [-towerSpan / 2, towerSpan / 2].forEach((tx) => {
    const frameTower = new THREE.Mesh(
      new THREE.BoxGeometry(towerW, towerH, towerD),
      gold24kMat
    );
    frameTower.position.set(tx, towerH / 2, 0);
    frameTower.castShadow = true;
    frameGroup.add(frameTower);
  });

  // Top Glass Skybridge
  const skybridgeGeo = new THREE.BoxGeometry(towerSpan + towerW, 5.5, towerD);
  const skybridge = new THREE.Mesh(skybridgeGeo, gold24kMat);
  skybridge.position.set(0, towerH - 2.75, 0);
  skybridge.castShadow = true;
  frameGroup.add(skybridge);

  // Glass Viewing Floor Strip
  const glassStrip = new THREE.Mesh(
    new THREE.PlaneGeometry(towerSpan, towerD - 1).rotateX(-Math.PI / 2),
    materials.glassDark
  );
  glassStrip.position.set(0, towerH - 5.4, 0);
  frameGroup.add(glassStrip);

  // Bottom Exhibition Pavilion
  const basePavilion = new THREE.Mesh(
    new THREE.BoxGeometry(towerSpan + towerW + 10, 4.2, towerD + 8),
    gold24kMat
  );
  basePavilion.position.set(0, 2.1, 0);
  basePavilion.castShadow = true;
  frameGroup.add(basePavilion);

  skybridge.userData = { buildingData: frameData };
  interactiveMeshes.push(skybridge);
  group.add(frameGroup);

  // =========================================================================
  // 5. CAYAN TOWER / INFINITY TOWER (Iconic 90° Twisting Skyscraper)
  // =========================================================================
  const cayanGroup = new THREE.Group();
  cayanGroup.position.set(130, 0, 95); // Dubai Marina sector

  const cayanData: BuildingData = {
    id: 'dubai-cayan-tower',
    name: 'Cayan Tower (Infinity Tower) - Dubai Marina',
    districtId: 'residential',
    districtName: 'Dubai Marina & JBR',
    category: 'Skyscraper',
    height: 105,
    floors: 75,
    position: [130, 0, 95],
    dimensions: [22, 105, 22],
    powerUsage: '12.4 MW',
    occupancy: '98% (4,200 Luxury Marina Residents)',
    networkStatus: 'FTTH Gigabit Fiber 100%',
    description: 'The world-famous 90-degree twisting architectural skyscraper. Each floor rotates 1.2 degrees around a cylindrical concrete elevator core to minimize wind loads and maximize panoramic Arabian Gulf views.',
    features: [
      'Continuous 90-Degree Helical Twist from Base to Crown',
      'Reflective Azure Solar Curtain Wall & Titanium Screens',
      'Rooftop Infinity Pool & Marina Yacht Club Lounge',
    ],
    isLandmark: true,
  };
  buildingsData.push(cayanData);

  // Twisting Floor Plates
  const floorCount = 36;
  const cayanTotalH = 105;
  const floorH = cayanTotalH / floorCount;
  const cayanMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Azure Gulf glass
    roughness: 0.15,
    metalness: 0.85,
    envMapIntensity: 1.8,
  });

  for (let fl = 0; fl < floorCount; fl++) {
    const twistAngle = (fl / floorCount) * (Math.PI / 2); // 90-degree total twist
    const floorPlate = new THREE.Mesh(
      new THREE.BoxGeometry(20, floorH * 0.92, 20),
      cayanMat
    );
    floorPlate.position.set(0, fl * floorH + floorH / 2, 0);
    floorPlate.rotation.y = twistAngle;
    floorPlate.castShadow = true;
    cayanGroup.add(floorPlate);

    if (fl === floorCount - 1) {
      floorPlate.userData = { buildingData: cayanData };
      interactiveMeshes.push(floorPlate);
    }
  }

  group.add(cayanGroup);

  // =========================================================================
  // 6. ROYAL DATE PALMS ALONG SHEIKH ZAYED RD & MARINA PROMENADES
  // =========================================================================
  // Plant authentic Royal Date Palms along major avenues and plazas
  const palmAvenues = [
    { x: -100, zMin: -200, zMax: 200, step: 25 },
    { x: 100, zMin: -200, zMax: 200, step: 25 },
    { x: -45, zMin: -120, zMax: 120, step: 30 },
    { x: 45, zMin: -120, zMax: 120, step: 30 },
  ];

  palmAvenues.forEach((av) => {
    for (let z = av.zMin; z <= av.zMax; z += av.step) {
      if (Math.abs(z) < 20) continue; // clear crossings
      const palm = createDatePalmMesh(palmTrunkMat, palmFoliageMat, 1.0 + Math.random() * 0.25);
      palm.position.set(av.x + (av.x > 0 ? 8.5 : -8.5), 0.1, z);
      group.add(palm);
    }
  });

  // =========================================================================
  // 7. DUBAI LUXURY MEGA-YACHT IN WATERWAY
  // =========================================================================
  const yacht = createLuxuryMegaYacht();
  yacht.position.set(10, -1.4, -40);
  group.add(yacht);

  animatables.push((time: number) => {
    // Gentle marina water bobbing for mega yacht
    yacht.position.y = -1.4 + Math.sin(time * 1.8) * 0.08;
    yacht.rotation.z = Math.sin(time * 1.2) * 0.015;
  });

  scene.add(group);

  const update = (time: number) => {
    animatables.forEach((fn) => fn(time));
  };

  const dispose = () => {
    scene.remove(group);
    burjTex.dispose();
    museumTex.dispose();
    goldLatticeTex.dispose();
    palmBarkTex.dispose();
  };

  return {
    group,
    buildingsData,
    interactiveMeshes,
    update,
    dispose,
  };
}

/**
 * Creates an authentic Royal Date Palm tree model with curved fronds and diamond trunk
 */
function createDatePalmMesh(
  trunkMat: THREE.Material,
  frondMat: THREE.Material,
  scale: number = 1.0
): THREE.Group {
  const palm = new THREE.Group();
  palm.name = 'royal_date_palm';

  // Tapering Textured Trunk (Curved gently)
  const trunkH = 8.5 * scale;
  const trunkGeo = new THREE.CylinderGeometry(0.35 * scale, 0.55 * scale, trunkH, 8);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = trunkH / 2;
  trunk.rotation.z = (Math.random() - 0.5) * 0.08;
  trunk.castShadow = true;
  palm.add(trunk);

  // Crown of 16 Curving Palm Fronds
  const frondCount = 16;
  const frondGroup = new THREE.Group();
  frondGroup.position.y = trunkH;

  for (let f = 0; f < frondCount; f++) {
    const angle = (f / frondCount) * Math.PI * 2;
    const frondLength = (4.8 + (f % 2) * 1.2) * scale;
    const frondGeo = new THREE.ConeGeometry(0.6 * scale, frondLength, 4);
    frondGeo.rotateX(Math.PI / 2);
    frondGeo.translate(0, 0, frondLength / 2);

    const frond = new THREE.Mesh(frondGeo, frondMat);
    frond.rotation.y = angle;
    frond.rotation.x = 0.55 + (f % 2) * 0.25; // drooping angle
    frond.castShadow = true;
    frondGroup.add(frond);
  }
  palm.add(frondGroup);

  // Ground Uplight Brass Fixture
  const uplight = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.25, 0.2, 8),
    new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8 })
  );
  uplight.position.set(0.6 * scale, 0.1, 0);
  palm.add(uplight);

  return palm;
}

/**
 * Creates an authentic Dubai multi-deck luxury mega-yacht
 */
function createLuxuryMegaYacht(): THREE.Group {
  const yacht = new THREE.Group();
  yacht.name = 'dubai_luxury_mega_yacht';

  const hullMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // Pristine Marine White
    roughness: 0.2,
    metalness: 0.4,
  });

  const teakMat = new THREE.MeshStandardMaterial({
    color: 0x92400e, // Warm teak wood decking
    roughness: 0.75,
    metalness: 0.1,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    roughness: 0.08,
    metalness: 0.9,
    transparent: true,
    opacity: 0.9,
  });

  // 1. Main Hull
  const hullLength = 22;
  const hullWidth = 5.2;
  const hullHeight = 2.4;
  const hullGeo = new THREE.BoxGeometry(hullWidth, hullHeight, hullLength);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.y = hullHeight / 2;
  yacht.add(hull);

  // Sleek Aerodynamic Prow / Bow
  const prowGeo = new THREE.ConeGeometry(hullWidth * 0.5, 6.5, 4);
  prowGeo.rotateX(Math.PI / 2);
  const prow = new THREE.Mesh(prowGeo, hullMat);
  prow.position.set(0, hullHeight / 2, -hullLength / 2 - 3.2);
  yacht.add(prow);

  // 2. Teak Main Deck
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(hullWidth - 0.3, 0.15, hullLength - 0.4),
    teakMat
  );
  deck.position.y = hullHeight + 0.08;
  yacht.add(deck);

  // 3. Superstructure Deck 2 (Bridge Deck)
  const bridge = new THREE.Mesh(
    new THREE.BoxGeometry(hullWidth - 0.8, 1.8, hullLength * 0.65),
    hullMat
  );
  bridge.position.set(0, hullHeight + 0.95, -1);
  yacht.add(bridge);

  // Panoramic Tinted Bridge Windows
  const bridgeWin = new THREE.Mesh(
    new THREE.BoxGeometry(hullWidth - 0.76, 0.9, hullLength * 0.6),
    glassMat
  );
  bridgeWin.position.set(0, hullHeight + 1.2, -1.2);
  yacht.add(bridgeWin);

  // 4. Sun Deck & Radar Mast (Deck 3)
  const sundeck = new THREE.Mesh(
    new THREE.BoxGeometry(hullWidth - 1.6, 1.4, hullLength * 0.38),
    hullMat
  );
  sundeck.position.set(0, hullHeight + 2.5, 0.5);
  yacht.add(sundeck);

  // Radar Radome & Comms Mast
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.2, 3.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
  );
  mast.position.set(0, hullHeight + 4.2, 0.5);
  yacht.add(mast);

  const radome = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 12, 12),
    hullMat
  );
  radome.position.set(0, hullHeight + 4.2, 0.5);
  yacht.add(radome);

  // Aft Swim Platform & Teak Steps
  const swimPlatform = new THREE.Mesh(
    new THREE.BoxGeometry(hullWidth - 0.2, 0.35, 2.5),
    teakMat
  );
  swimPlatform.position.set(0, 0.4, hullLength / 2 + 1.2);
  yacht.add(swimPlatform);

  return yacht;
}
