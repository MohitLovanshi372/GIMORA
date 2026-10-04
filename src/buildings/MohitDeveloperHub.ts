/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { BuildingData } from '../city/types';
import { CityMaterials } from '../assets/materials';
import { createServerRacksTexture } from '../assets/textures';

export interface MohitHubSystem {
  group: THREE.Group;
  buildingData: BuildingData;
  interactiveMeshes: THREE.Object3D[];
  update: (time: number) => void;
  dispose: () => void;
}

export function createMohitDeveloperHub(
  scene: THREE.Scene,
  materials: CityMaterials
): MohitHubSystem {
  const group = new THREE.Group();
  group.name = 'mohit_developer_hub_hq';

  const posX = 140;
  const posY = 0;
  const posZ = -80;
  const towerHeight = 142;
  const towerWidth = 26;
  const towerDepth = 26;

  group.position.set(posX, posY, posZ);

  const interactiveMeshes: THREE.Object3D[] = [];

  const buildingData: BuildingData = {
    id: 'mohit-developer-hub-hq',
    name: 'MOHIT DEVELOPER HUB',
    districtId: 'technology',
    districtName: 'Technology District',
    category: 'Technology Headquarters',
    height: towerHeight,
    floors: 42,
    position: [posX, posY, posZ],
    dimensions: [towerWidth, towerHeight, towerDepth],
    powerUsage: '32.8 MW (High-Density Quantum Compute)',
    occupancy: '98% (4,200 Engineers & AI Researchers)',
    networkStatus: 'Hyper-Band Terabit Neural Optical Grid',
    description: 'The monumental headquarters of MOHIT DEVELOPER HUB. An ultra-modern cybernetic glass monolith housing high-throughput AI laboratories, quantum data clusters, collaborative developer suites, and an interactive open-source showcase pavilion.',
    isLandmark: true,
    interiorAreas: [
      'Developer Workspace (Collaborative Pods & Dual 8K Workstations)',
      'AI Laboratory (Neural Training Nodes & Large Quantum Models)',
      'Project Showcase Area (Holographic Demo Vaults & Community Repos)',
      'Server / Data Center (Sub-Zero Liquid Cooled Optical Racks)',
      'Innovation Lab (Experimental Autonomous Systems & Robotics)',
    ],
    features: [
      'Rooftop VTOL & Aerocar Helipad Deck',
      'High-Power Communications & Radar Mast',
      'Underground Multi-Level EV Parking Ramp',
      'Illuminated Neon Pathway to Main Avenue',
      'Panoramic Triple-Glazed Cyan/Purple Glass Facade',
    ],
  };

  // 1. BASE PLAZA & FOUNDATION
  const plazaSize = 46;
  const plazaGeo = new THREE.BoxGeometry(plazaSize, 0.6, plazaSize);
  const plazaMat = new THREE.MeshStandardMaterial({
    color: 0x090f1d,
    metalness: 0.8,
    roughness: 0.3,
  });
  const plaza = new THREE.Mesh(plazaGeo, plazaMat);
  plaza.position.y = 0.3;
  plaza.receiveShadow = true;
  group.add(plaza);

  // Plaza perimeter glowing borders (Cyan & Purple)
  const borderGeo = new THREE.BoxGeometry(plazaSize + 0.4, 0.25, plazaSize + 0.4);
  const borderEdges = new THREE.EdgesGeometry(borderGeo);
  const borderLine = new THREE.LineSegments(borderEdges, materials.neonCyan);
  borderLine.position.y = 0.65;
  group.add(borderLine);

  // 2. NEON PATHWAY TO MAIN AVENUE
  // Connects the entrance (Z: 20 from center) to the west avenue (X: -40 from center towards X: 100)
  const pathLength = 34;
  const pathWidth = 6;
  const pathGeo = new THREE.PlaneGeometry(pathLength, pathWidth);
  pathGeo.rotateX(-Math.PI / 2);
  const pathMat = new THREE.MeshStandardMaterial({
    color: 0x070c16,
    roughness: 0.6,
    metalness: 0.4,
  });
  const pathway = new THREE.Mesh(pathGeo, pathMat);
  pathway.position.set(-towerWidth / 2 - pathLength / 2, 0.35, 0);
  pathway.receiveShadow = true;
  group.add(pathway);

  // Pathway Glowing Rails (Cyan on one side, Purple on other side)
  const railGeo = new THREE.BoxGeometry(pathLength, 0.25, 0.25);
  const leftRail = new THREE.Mesh(railGeo, materials.neonCyan);
  leftRail.position.set(-towerWidth / 2 - pathLength / 2, 0.5, -pathWidth / 2);
  group.add(leftRail);

  const rightRail = new THREE.Mesh(railGeo, materials.neonPurple);
  rightRail.position.set(-towerWidth / 2 - pathLength / 2, 0.5, pathWidth / 2);
  group.add(rightRail);

  // Pathway center chevron dash marks
  const chevronCount = 8;
  const chevronGeo = new THREE.PlaneGeometry(1.6, 0.3);
  chevronGeo.rotateX(-Math.PI / 2);
  const instancedChevrons = new THREE.InstancedMesh(chevronGeo, materials.neonCyan, chevronCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < chevronCount; i++) {
    const cx = -towerWidth / 2 - 4 - i * 3.8;
    dummy.position.set(cx, 0.38, 0);
    dummy.updateMatrix();
    instancedChevrons.setMatrixAt(i, dummy.matrix);
  }
  instancedChevrons.instanceMatrix.needsUpdate = true;
  group.add(instancedChevrons);

  // 3. UNDERGROUND PARKING ENTRANCE RAMP
  const rampLength = 16;
  const rampWidth = 7;
  const rampGeo = new THREE.PlaneGeometry(rampWidth, rampLength);
  rampGeo.rotateX(-Math.PI / 2 + 0.18); // slope downwards
  const rampMesh = new THREE.Mesh(rampGeo, materials.asphalt);
  rampMesh.position.set(0, -0.2, towerDepth / 2 + 6);
  group.add(rampMesh);

  // Ramp Portal Overhead Arch
  const portalArchGeo = new THREE.BoxGeometry(rampWidth + 1.2, 3.2, 1.2);
  const portalArch = new THREE.Mesh(portalArchGeo, materials.metalDark);
  portalArch.position.set(0, 1.8, towerDepth / 2 + 1);
  group.add(portalArch);

  // Glowing Parking Sign
  const pSignGeo = new THREE.PlaneGeometry(3.5, 1.2);
  const pSignCanvas = document.createElement('canvas');
  pSignCanvas.width = 256;
  pSignCanvas.height = 128;
  const pCtx = pSignCanvas.getContext('2d')!;
  pCtx.fillStyle = '#020617';
  pCtx.fillRect(0, 0, 256, 128);
  pCtx.fillStyle = '#00f0ff';
  pCtx.font = 'bold 36px "Chakra Petch", monospace';
  pCtx.textAlign = 'center';
  pCtx.fillText('▼ P - SUB LEVEL', 128, 76);
  const pSignTex = new THREE.CanvasTexture(pSignCanvas);
  const pSignMesh = new THREE.Mesh(pSignGeo, new THREE.MeshBasicMaterial({ map: pSignTex }));
  pSignMesh.position.set(0, 2.2, towerDepth / 2 + 1.65);
  group.add(pSignMesh);

  // 4. GROUND FLOOR GLASS ENTRANCE PAVILION
  const entranceW = 16;
  const entranceH = 6;
  const entranceD = 8;
  const entranceGeo = new THREE.BoxGeometry(entranceW, entranceH, entranceD);
  const entranceMesh = new THREE.Mesh(entranceGeo, materials.glassCyan);
  entranceMesh.position.set(0, entranceH / 2 + 0.5, towerDepth / 2 + entranceD / 2 - 2);
  group.add(entranceMesh);

  // Entrance Reception Desk & Holographic Hub Logo inside
  const deskGeo = new THREE.BoxGeometry(4.5, 1.1, 1.8);
  const desk = new THREE.Mesh(deskGeo, materials.metalLight);
  desk.position.set(0, 1.2, towerDepth / 2 + 2);
  group.add(desk);

  const logoHoloGeo = new THREE.IcosahedronGeometry(0.9, 1);
  const logoHolo = new THREE.Mesh(logoHoloGeo, materials.neonCyan);
  logoHolo.position.set(0, 2.8, towerDepth / 2 + 2);
  group.add(logoHolo);

  // 5. MAIN TOWER BODY (Futuristic Glass & Titanium Cyber-Monolith)
  // Outer Glass Shell
  const towerBodyGeo = new THREE.BoxGeometry(towerWidth, towerHeight, towerDepth);
  const towerGlassMesh = new THREE.Mesh(towerBodyGeo, materials.glassCyan);
  towerGlassMesh.position.y = towerHeight / 2 + 0.5;
  towerGlassMesh.castShadow = true;
  towerGlassMesh.receiveShadow = true;
  group.add(towerGlassMesh);

  // Structural Corner Columns & Ribbing (Dark Titanium)
  const colSize = 1.4;
  const colGeo = new THREE.BoxGeometry(colSize, towerHeight, colSize);
  const stripGeo = new THREE.BoxGeometry(0.3, towerHeight, 0.3);
  const halfTW = towerWidth / 2;
  const halfTD = towerDepth / 2;

  [
    [-halfTW, -halfTD],
    [halfTW, -halfTD],
    [-halfTW, halfTD],
    [halfTW, halfTD],
  ].forEach(([cx, cz]) => {
    const col = new THREE.Mesh(colGeo, materials.metalDark);
    col.position.set(cx, towerHeight / 2 + 0.5, cz);
    col.castShadow = true;
    group.add(col);

    // Vertical Neon Accent Strip along each corner (Cyan/Purple)
    const strip = new THREE.Mesh(stripGeo, cx > 0 ? materials.neonCyan : materials.neonPurple);
    strip.position.set(cx + (cx > 0 ? 0.6 : -0.6), towerHeight / 2 + 0.5, cz + (cz > 0 ? 0.6 : -0.6));
    group.add(strip);
  });

  // Intermediate Horizontal Neon Bands every 5 floors
  const bandGeo = new THREE.BoxGeometry(towerWidth + 0.4, 0.4, towerDepth + 0.4);
  const bandEdges = new THREE.EdgesGeometry(bandGeo);
  for (let h = 18; h < towerHeight; h += 18) {
    const bandLine = new THREE.LineSegments(bandEdges, h % 36 === 0 ? materials.neonCyan : materials.neonPurple);
    bandLine.position.y = h;
    group.add(bandLine);
  }

  // 6. VISIBLE INTERIOR FLOORS & LABS THROUGH GLASS
  const innerCoreWidth = towerWidth - 4;
  const innerCoreDepth = towerDepth - 4;

  // Floor Plates (Dividing visible floors)
  const floorCount = 14;
  const floorPlateGeo = new THREE.BoxGeometry(innerCoreWidth, 0.4, innerCoreDepth);
  for (let i = 1; i <= floorCount; i++) {
    const floorPlate = new THREE.Mesh(floorPlateGeo, materials.metalDark);
    floorPlate.position.y = i * (towerHeight / (floorCount + 1));
    group.add(floorPlate);
  }

  // INTERIOR AREA 1: Project Showcase (Floors 1-3, Y: 10)
  const showcasePedestalGeo = new THREE.CylinderGeometry(1.6, 1.8, 1.2, 16);
  const showcasePedestal = new THREE.Mesh(showcasePedestalGeo, materials.metalLight);
  showcasePedestal.position.set(0, 8.6, 0);
  group.add(showcasePedestal);

  const showcaseHoloGeo = new THREE.TorusGeometry(1.8, 0.25, 8, 24);
  const showcaseHolo = new THREE.Mesh(showcaseHoloGeo, materials.neonEmerald);
  showcaseHolo.position.set(0, 11, 0);
  showcaseHolo.rotation.x = Math.PI / 3;
  group.add(showcaseHolo);

  // INTERIOR AREA 2: Developer Workspace (Floors 4-8, Y: 30)
  const deskBlockGeo = new THREE.BoxGeometry(12, 1.0, 3.5);
  const deskBlock1 = new THREE.Mesh(deskBlockGeo, materials.sidewalk);
  deskBlock1.position.set(0, 28, 4);
  group.add(deskBlock1);

  const deskBlock2 = new THREE.Mesh(deskBlockGeo, materials.sidewalk);
  deskBlock2.position.set(0, 28, -4);
  group.add(deskBlock2);

  // INTERIOR AREA 3: Server / Data Center (Floors 9-13, Y: 55)
  const serverTex = createServerRacksTexture();
  serverTex.repeat.set(3, 1);
  const serverRackGeo = new THREE.BoxGeometry(14, 12, 14);
  const serverRackMat = new THREE.MeshStandardMaterial({
    map: serverTex,
    color: 0x051329,
    metalness: 0.9,
    roughness: 0.2,
  });
  const serverCore = new THREE.Mesh(serverRackGeo, serverRackMat);
  serverCore.position.set(0, 52, 0);
  group.add(serverCore);

  // INTERIOR AREA 4: AI Laboratory Quantum Reactor (Floors 14-19, Y: 80)
  const aiReactorRing1 = new THREE.Mesh(
    new THREE.TorusGeometry(5, 0.4, 8, 24),
    materials.neonCyan
  );
  aiReactorRing1.position.set(0, 78, 0);
  group.add(aiReactorRing1);

  const aiReactorRing2 = new THREE.Mesh(
    new THREE.TorusGeometry(3.6, 0.35, 8, 24),
    materials.neonPurple
  );
  aiReactorRing2.position.set(0, 78, 0);
  aiReactorRing2.rotation.x = Math.PI / 2;
  group.add(aiReactorRing2);

  const aiCoreSphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.8, 12, 12),
    materials.neonWhite
  );
  aiCoreSphere.position.set(0, 78, 0);
  group.add(aiCoreSphere);

  // INTERIOR AREA 5: Innovation Lab (Floors 20-25, Y: 105)
  const innovGlobe = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3.2, 1),
    new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true })
  );
  innovGlobe.position.set(0, 106, 0);
  group.add(innovGlobe);

  // 7. MONUMENTAL ILLUMINATED SIGNAGE: "MOHIT DEVELOPER HUB"
  // Creating high-fidelity double-sided canvas sign mounted on facade
  const createSignCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 320;
    const ctx = canvas.getContext('2d')!;

    // Dark sleek background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Electric Cyan & Purple Glowing Border
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 12;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);

    // Top Category Kicker
    ctx.font = 'bold 34px "Chakra Petch", monospace';
    ctx.fillStyle = '#00ffaa';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ GLOBAL HEADQUARTERS ⚡', canvas.width / 2, 70);

    // Main Illuminated Title
    ctx.font = 'bold 64px "Chakra Petch", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 18;
    ctx.fillText('MOHIT DEVELOPER HUB', canvas.width / 2, 160);
    ctx.shadowBlur = 0;

    // Subtitle requested by prompt: "AI • SOFTWARE • INNOVATION"
    ctx.font = 'bold 36px "Chakra Petch", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('AI  •  SOFTWARE  •  INNOVATION', canvas.width / 2, 235);

    // Accent line
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(80, 265, canvas.width - 160, 6);

    return canvas;
  };

  const signTex = new THREE.CanvasTexture(createSignCanvas());
  const signGeo = new THREE.PlaneGeometry(22, 7);
  const signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });

  // Front Sign (Facing South / +Z)
  const signMeshFront = new THREE.Mesh(signGeo, signMat);
  signMeshFront.position.set(0, 126, towerDepth / 2 + 0.3);
  group.add(signMeshFront);

  // Back Sign (Facing North / -Z)
  const signMeshBack = new THREE.Mesh(signGeo, signMat);
  signMeshBack.position.set(0, 126, -towerDepth / 2 - 0.3);
  signMeshBack.rotation.y = Math.PI;
  group.add(signMeshBack);

  // 8. DIGITAL LED SCREENS ON MID-TOWER
  const ledCanvas = document.createElement('canvas');
  ledCanvas.width = 512;
  ledCanvas.height = 128;
  const ledCtx = ledCanvas.getContext('2d')!;
  const ledTex = new THREE.CanvasTexture(ledCanvas);
  const ledMat = new THREE.MeshBasicMaterial({ map: ledTex, side: THREE.DoubleSide });

  const ledGeo = new THREE.PlaneGeometry(20, 5);
  const ledScreenEast = new THREE.Mesh(ledGeo, ledMat);
  ledScreenEast.position.set(towerWidth / 2 + 0.3, 65, 0);
  ledScreenEast.rotation.y = Math.PI / 2;
  group.add(ledScreenEast);

  const ledScreenWest = new THREE.Mesh(ledGeo, ledMat);
  ledScreenWest.position.set(-towerWidth / 2 - 0.3, 65, 0);
  ledScreenWest.rotation.y = -Math.PI / 2;
  group.add(ledScreenWest);

  const updateLedScreen = (time: number) => {
    ledCtx.fillStyle = '#020617';
    ledCtx.fillRect(0, 0, 512, 128);

    ledCtx.strokeStyle = '#a855f7';
    ledCtx.lineWidth = 6;
    ledCtx.strokeRect(4, 4, 504, 120);

    ledCtx.font = 'bold 26px "Chakra Petch", monospace';
    ledCtx.fillStyle = '#00ffcc';
    ledCtx.textAlign = 'center';
    ledCtx.fillText('NEURAL CORE v9.4 // QUANTUM UPLINK', 256, 50);

    const offset = Math.floor((time * 40) % 200);
    ledCtx.font = '20px "Plus Jakarta Sans", sans-serif';
    ledCtx.fillStyle = '#e2e8f0';
    ledCtx.fillText(`ACTIVE THREADS: 128,400 · LATENCY: 0.${offset}ms · 100% OPERATIONAL`, 256, 92);

    ledTex.needsUpdate = true;
  };

  // 9. ROOFTOP HELIPAD & ANTENNA SPIRE
  // Penthouse Roof Block
  const roofPenthouseGeo = new THREE.BoxGeometry(towerWidth - 4, 4, towerDepth - 4);
  const roofPenthouse = new THREE.Mesh(roofPenthouseGeo, materials.metalDark);
  roofPenthouse.position.y = towerHeight + 2.5;
  roofPenthouse.castShadow = true;
  group.add(roofPenthouse);

  // Circular Helipad Deck
  const padRadius = 9;
  const padGeo = new THREE.CylinderGeometry(padRadius, padRadius, 0.6, 24);
  const padMesh = new THREE.Mesh(padGeo, materials.metalDark);
  padMesh.position.y = towerHeight + 5;
  group.add(padMesh);

  // Helipad Yellow Perimeter Light Ring
  const padRingGeo = new THREE.TorusGeometry(padRadius + 0.2, 0.2, 8, 32);
  padRingGeo.rotateX(Math.PI / 2);
  const padRing = new THREE.Mesh(padRingGeo, materials.neonAmber);
  padRing.position.y = towerHeight + 5.35;
  group.add(padRing);

  // Helipad "H" Marking
  const hBarGeo1 = new THREE.PlaneGeometry(1.2, 6);
  hBarGeo1.rotateX(-Math.PI / 2);
  const hBar1 = new THREE.Mesh(hBarGeo1, materials.neonCyan);
  hBar1.position.set(-2, towerHeight + 5.36, 0);
  group.add(hBar1);

  const hBar2 = new THREE.Mesh(hBarGeo1, materials.neonCyan);
  hBar2.position.set(2, towerHeight + 5.36, 0);
  group.add(hBar2);

  const hBarMidGeo = new THREE.PlaneGeometry(4, 1.2);
  hBarMidGeo.rotateX(-Math.PI / 2);
  const hBarMid = new THREE.Mesh(hBarMidGeo, materials.neonCyan);
  hBarMid.position.set(0, towerHeight + 5.36, 0);
  group.add(hBarMid);

  // Communications & Radar Spire (Height: 32m)
  const spireMastGeo = new THREE.CylinderGeometry(0.3, 0.8, 32, 8);
  const spireMast = new THREE.Mesh(spireMastGeo, materials.metalLight);
  spireMast.position.set(0, towerHeight + 21, 0);
  group.add(spireMast);

  // Pulsing White Aircraft Warning Beacon Tip
  const tipGeo = new THREE.SphereGeometry(0.7, 8, 8);
  const tipBeacon = new THREE.Mesh(tipGeo, materials.neonWhite);
  tipBeacon.position.set(0, towerHeight + 37, 0);
  group.add(tipBeacon);

  // High-Intensity Vertical Sky Beam Beacon (Visible across whole city)
  const beamGeo = new THREE.CylinderGeometry(0.6, 4.0, 95, 16);
  beamGeo.translate(0, 47.5, 0);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const skyBeam = new THREE.Mesh(beamGeo, beamMat);
  skyBeam.position.set(0, towerHeight + 37, 0);
  group.add(skyBeam);

  // Rooftop AI Command Center Glass Observation Dome
  const domeGeo = new THREE.SphereGeometry(4.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const domeMesh = new THREE.Mesh(domeGeo, materials.glassCyan);
  domeMesh.position.set(0, towerHeight + 5.2, 0);
  group.add(domeMesh);

  // Rotating Quantum Core Ring inside Command Center Dome
  const coreRingGeo = new THREE.TorusGeometry(2.4, 0.2, 8, 24);
  const coreRing = new THREE.Mesh(coreRingGeo, materials.neonEmerald);
  coreRing.position.set(0, towerHeight + 6.8, 0);
  coreRing.rotation.x = Math.PI / 3;
  group.add(coreRing);

  // 10. HIGH-TECH SKYBRIDGE CONNECTIONS
  // Skybridge 1: North Skybridge at Level 12 (Y: 48m, connecting toward Technology Research Center)
  const skybridge1Length = 32;
  const bridge1Geo = new THREE.CylinderGeometry(2.4, 2.4, skybridge1Length, 12, 1, true);
  bridge1Geo.rotateX(Math.PI / 2);
  const bridge1Mesh = new THREE.Mesh(bridge1Geo, materials.glassCyan);
  bridge1Mesh.position.set(0, 48, -towerDepth / 2 - skybridge1Length / 2);
  group.add(bridge1Mesh);

  // Skybridge 1 Floor Deck & Neon Ribs
  const bridgeDeck1Geo = new THREE.BoxGeometry(3.2, 0.3, skybridge1Length);
  const bridgeDeck1 = new THREE.Mesh(bridgeDeck1Geo, materials.metalDark);
  bridgeDeck1.position.set(0, 46.8, -towerDepth / 2 - skybridge1Length / 2);
  group.add(bridgeDeck1);

  const bridgeRail1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, skybridge1Length), materials.neonCyan);
  bridgeRail1.position.set(1.5, 47.1, -towerDepth / 2 - skybridge1Length / 2);
  group.add(bridgeRail1);

  const bridgeRail2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, skybridge1Length), materials.neonCyan);
  bridgeRail2.position.set(-1.5, 47.1, -towerDepth / 2 - skybridge1Length / 2);
  group.add(bridgeRail2);

  // Skybridge 2: West Skybridge at Level 24 (Y: 88m, connecting across Avenue to AI Research Pod)
  const skybridge2Length = 26;
  const bridge2Geo = new THREE.CylinderGeometry(2.2, 2.2, skybridge2Length, 12, 1, true);
  bridge2Geo.rotateZ(Math.PI / 2);
  const bridge2Mesh = new THREE.Mesh(bridge2Geo, materials.glassCyan);
  bridge2Mesh.position.set(-towerWidth / 2 - skybridge2Length / 2, 88, 0);
  group.add(bridge2Mesh);

  const bridgeDeck2Geo = new THREE.BoxGeometry(skybridge2Length, 0.3, 3.0);
  const bridgeDeck2 = new THREE.Mesh(bridgeDeck2Geo, materials.metalDark);
  bridgeDeck2.position.set(-towerWidth / 2 - skybridge2Length / 2, 86.8, 0);
  group.add(bridgeDeck2);

  const bridgeRail3 = new THREE.Mesh(new THREE.BoxGeometry(skybridge2Length, 0.2, 0.2), materials.neonPurple);
  bridgeRail3.position.set(-towerWidth / 2 - skybridge2Length / 2, 87.1, 1.4);
  group.add(bridgeRail3);

  const bridgeRail4 = new THREE.Mesh(new THREE.BoxGeometry(skybridge2Length, 0.2, 0.2), materials.neonPurple);
  bridgeRail4.position.set(-towerWidth / 2 - skybridge2Length / 2, 87.1, -1.4);
  group.add(bridgeRail4);

  // 11. INTERACTION RAYCASTING TARGET
  // Covering the entire tower volume so clicking anywhere on the Mohit Developer Hub selects it
  const clickTargetGeo = new THREE.BoxGeometry(towerWidth + 6, towerHeight + 20, towerDepth + 6);
  const clickTargetMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const clickTarget = new THREE.Mesh(clickTargetGeo, clickTargetMat);
  clickTarget.position.y = (towerHeight + 20) / 2;
  clickTarget.userData = { buildingData };
  group.add(clickTarget);

  interactiveMeshes.push(clickTarget);
  towerGlassMesh.userData = { buildingData };
  interactiveMeshes.push(towerGlassMesh);

  scene.add(group);

  const update = (time: number) => {
    // Pulse aircraft beacon
    tipBeacon.scale.setScalar(0.9 + Math.sin(time * 6) * 0.3);

    // Rotate AI reactor rings inside lab
    aiReactorRing1.rotation.z = time * 1.5;
    aiReactorRing2.rotation.y = time * 2.0;
    aiCoreSphere.scale.setScalar(1.0 + Math.sin(time * 4) * 0.15);

    // Rotate holographic logo in entrance
    logoHolo.rotation.y = time * 1.2;
    logoHolo.rotation.x = Math.sin(time) * 0.5;

    // Rotate showcase holo ring
    showcaseHolo.rotation.z = time * 0.8;

    // Rotate innovation globe
    innovGlobe.rotation.y = time * 0.5;

    // Animate AI Command Center Core Ring & Sky Beam
    coreRing.rotation.y = time * 2.2;
    beamMat.opacity = 0.22 + Math.sin(time * 3) * 0.08;

    // Update LED screens
    updateLedScreen(time);
  };

  const dispose = () => {
    scene.remove(group);
    plazaGeo.dispose();
    plazaMat.dispose();
    borderGeo.dispose();
    borderEdges.dispose();
    pathGeo.dispose();
    pathMat.dispose();
    railGeo.dispose();
    chevronGeo.dispose();
    rampGeo.dispose();
    portalArchGeo.dispose();
    pSignGeo.dispose();
    pSignTex.dispose();
    entranceGeo.dispose();
    deskGeo.dispose();
    logoHoloGeo.dispose();
    towerBodyGeo.dispose();
    colGeo.dispose();
    stripGeo.dispose();
    bandGeo.dispose();
    bandEdges.dispose();
    floorPlateGeo.dispose();
    showcasePedestalGeo.dispose();
    showcaseHoloGeo.dispose();
    deskBlockGeo.dispose();
    serverRackGeo.dispose();
    serverRackMat.dispose();
    serverTex.dispose();
    aiReactorRing1.geometry.dispose();
    aiReactorRing2.geometry.dispose();
    aiCoreSphere.geometry.dispose();
    innovGlobe.geometry.dispose();
    signGeo.dispose();
    signTex.dispose();
    ledGeo.dispose();
    ledTex.dispose();
    roofPenthouseGeo.dispose();
    padGeo.dispose();
    padRingGeo.dispose();
    hBarGeo1.dispose();
    hBarMidGeo.dispose();
    spireMastGeo.dispose();
    tipGeo.dispose();
    clickTargetGeo.dispose();
    clickTargetMat.dispose();
  };

  return {
    group,
    buildingData,
    interactiveMeshes,
    update,
    dispose,
  };
}
