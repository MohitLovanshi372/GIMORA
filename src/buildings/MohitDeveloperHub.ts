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
    description: 'The monumental global headquarters of MOHIT DEVELOPER HUB. A state-of-the-art contemporary glass and steel architectural tower housing high-throughput AI laboratories, high-density computing clusters, executive conference suites, and innovation showcase atriums.',
    isLandmark: true,
    interiorAreas: [
      'Developer Workspace (Collaborative Pods & Dual 8K Workstations)',
      'AI Laboratory (High-Density Neural Training Nodes & Research Labs)',
      'Project Showcase Area (Innovation Gallery & Developer Repos)',
      'Server / Data Center (Sub-Zero Liquid Cooled Optical Racks)',
      'Executive Briefing Center & Panoramic Boardroom',
    ],
    features: [
      'Rooftop Aviation Helipad Deck',
      'High-Power Communications & Radar Mast',
      'Underground Multi-Level EV Parking Ramp',
      'Architectural Landscaped Entrance Promenade',
      'Panoramic Double-Glazed Low-E Architectural Glass Facade',
    ],
  };

  // 1. BASE PLAZA & FOUNDATION (Polished Granite Plaza)
  const plazaSize = 46;
  const plazaGeo = new THREE.BoxGeometry(plazaSize, 0.6, plazaSize);
  const plazaMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.4,
    roughness: 0.4,
    normalMap: materials.maps.concreteNormal,
    normalScale: new THREE.Vector2(0.5, 0.5),
    roughnessMap: materials.maps.concreteRoughness,
    envMapIntensity: 1.3,
  });
  const plaza = new THREE.Mesh(plazaGeo, plazaMat);
  plaza.position.y = 0.3;
  plaza.receiveShadow = true;
  group.add(plaza);

  // Plaza perimeter architectural granite curb
  const curbGeo = new THREE.BoxGeometry(plazaSize + 0.4, 0.25, plazaSize + 0.4);
  const curbMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
  const curbMesh = new THREE.Mesh(curbGeo, curbMat);
  curbMesh.position.y = 0.65;
  group.add(curbMesh);

  // 2. ENTRANCE PROMENADE TO MAIN AVENUE
  const pathLength = 34;
  const pathWidth = 6;
  const pathGeo = new THREE.PlaneGeometry(pathLength, pathWidth);
  pathGeo.rotateX(-Math.PI / 2);
  const pathMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.5,
    metalness: 0.2,
    normalMap: materials.maps.concreteNormal,
    normalScale: new THREE.Vector2(0.6, 0.6),
    roughnessMap: materials.maps.concreteRoughness,
  });
  const pathway = new THREE.Mesh(pathGeo, pathMat);
  pathway.position.set(-towerWidth / 2 - pathLength / 2, 0.35, 0);
  pathway.receiveShadow = true;
  group.add(pathway);

  // Low architectural bollard path luminaires (warm 2700K ambient path markers)
  const bollardCount = 6;
  const bollardGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.9, 8);
  const bollardCapGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8);
  for (let i = 0; i < bollardCount; i++) {
    const bx = -towerWidth / 2 - 4 - i * 5;
    [-pathWidth / 2 + 0.3, pathWidth / 2 - 0.3].forEach((bz) => {
      const bollard = new THREE.Mesh(bollardGeo, materials.metalDark);
      bollard.position.set(bx, 0.75, bz);
      group.add(bollard);

      const cap = new THREE.Mesh(bollardCapGeo, materials.neonWhite);
      cap.position.set(bx, 1.2, bz);
      group.add(cap);
    });
  }

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

  // Parking Sign (Architectural garage signage)
  const pSignGeo = new THREE.PlaneGeometry(3.5, 1.2);
  const pSignCanvas = document.createElement('canvas');
  pSignCanvas.width = 256;
  pSignCanvas.height = 128;
  const pCtx = pSignCanvas.getContext('2d')!;
  pCtx.fillStyle = '#0f172a';
  pCtx.fillRect(0, 0, 256, 128);
  pCtx.fillStyle = '#ffffff';
  pCtx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
  pCtx.textAlign = 'center';
  pCtx.fillText('P - SUB LEVEL', 128, 76);
  const pSignTex = new THREE.CanvasTexture(pSignCanvas);
  const pSignMesh = new THREE.Mesh(pSignGeo, new THREE.MeshBasicMaterial({ map: pSignTex }));
  pSignMesh.position.set(0, 2.2, towerDepth / 2 + 1.65);
  group.add(pSignMesh);

  // 4. GROUND FLOOR GLASS ENTRANCE PAVILION
  const entranceW = 16;
  const entranceH = 6;
  const entranceD = 8;
  const entranceGeo = new THREE.BoxGeometry(entranceW, entranceH, entranceD);
  const entranceMesh = new THREE.Mesh(entranceGeo, materials.glassDark);
  entranceMesh.position.set(0, entranceH / 2 + 0.5, towerDepth / 2 + entranceD / 2 - 2);
  group.add(entranceMesh);

  // Entrance Reception Desk & Architectural Corporate Sculpture
  const deskGeo = new THREE.BoxGeometry(4.5, 1.1, 1.8);
  const desk = new THREE.Mesh(deskGeo, materials.metalLight);
  desk.position.set(0, 1.2, towerDepth / 2 + 2);
  group.add(desk);

  // Contemporary Brushed Bronze Geometric Sculpture
  const logoSculptureGeo = new THREE.IcosahedronGeometry(0.85, 1);
  const logoSculptureMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Polished bronze
    metalness: 0.85,
    roughness: 0.25,
  });
  const logoSculpture = new THREE.Mesh(logoSculptureGeo, logoSculptureMat);
  logoSculpture.position.set(0, 2.8, towerDepth / 2 + 2);
  group.add(logoSculpture);

  // 5. MAIN TOWER BODY (Contemporary Double-Glazed Architectural Glass Tower)
  // Outer Glass Shell
  const towerBodyGeo = new THREE.BoxGeometry(towerWidth, towerHeight, towerDepth);
  const towerGlassMesh = new THREE.Mesh(towerBodyGeo, materials.glassDark);
  towerGlassMesh.position.y = towerHeight / 2 + 0.5;
  towerGlassMesh.castShadow = true;
  towerGlassMesh.receiveShadow = true;
  group.add(towerGlassMesh);

  // Structural Corner Columns (Charcoal Anodized Aluminum Columns)
  const colSize = 1.4;
  const colGeo = new THREE.BoxGeometry(colSize, towerHeight, colSize);
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
  });

  // Architectural Precast Floor Spandrels every 4 floors
  const spandrelGeo = new THREE.BoxGeometry(towerWidth + 0.3, 0.8, towerDepth + 0.3);
  for (let h = 20; h < towerHeight; h += 20) {
    const spandrel = new THREE.Mesh(spandrelGeo, materials.metalDark);
    spandrel.position.y = h;
    group.add(spandrel);
  }

  // 6. VISIBLE INTERIOR FLOORS THROUGH GLASS
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

  // INTERIOR AREA 1: Project Showcase Gallery (Floors 1-3, Y: 10)
  const showcasePedestalGeo = new THREE.CylinderGeometry(1.6, 1.8, 1.2, 16);
  const showcasePedestal = new THREE.Mesh(showcasePedestalGeo, materials.metalLight);
  showcasePedestal.position.set(0, 8.6, 0);
  group.add(showcasePedestal);

  const showcaseExhibitGeo = new THREE.TorusGeometry(1.6, 0.2, 8, 24);
  const showcaseExhibit = new THREE.Mesh(showcaseExhibitGeo, materials.metalLight);
  showcaseExhibit.position.set(0, 10.8, 0);
  showcaseExhibit.rotation.x = Math.PI / 3;
  group.add(showcaseExhibit);

  // INTERIOR AREA 2: Developer Workstations (Floors 4-8, Y: 28)
  const deskBlockGeo = new THREE.BoxGeometry(12, 1.0, 3.5);
  const deskBlock1 = new THREE.Mesh(deskBlockGeo, materials.sidewalk);
  deskBlock1.position.set(0, 28, 4);
  group.add(deskBlock1);

  const deskBlock2 = new THREE.Mesh(deskBlockGeo, materials.sidewalk);
  deskBlock2.position.set(0, 28, -4);
  group.add(deskBlock2);

  // INTERIOR AREA 3: Enterprise Data Center (Floors 9-13, Y: 52)
  const serverTex = createServerRacksTexture();
  serverTex.repeat.set(3, 1);
  const serverRackGeo = new THREE.BoxGeometry(14, 12, 14);
  const serverRackMat = new THREE.MeshStandardMaterial({
    map: serverTex,
    color: 0x0f172a,
    metalness: 0.7,
    roughness: 0.3,
  });
  const serverCore = new THREE.Mesh(serverRackGeo, serverRackMat);
  serverCore.position.set(0, 52, 0);
  group.add(serverCore);

  // INTERIOR AREA 4: Executive Boardroom (Floors 14-19, Y: 78)
  const boardroomTableGeo = new THREE.CylinderGeometry(4.5, 4.5, 0.6, 16);
  const boardroomTableMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.4 });
  const boardroomTable = new THREE.Mesh(boardroomTableGeo, boardroomTableMat);
  boardroomTable.position.set(0, 78, 0);
  group.add(boardroomTable);

  // INTERIOR AREA 5: Innovation Studio (Floors 20-25, Y: 106)
  const studioGlobe = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.8, 1),
    materials.metalLight
  );
  studioGlobe.position.set(0, 106, 0);
  group.add(studioGlobe);

  // 7. MONUMENTAL ARCHITECTURAL SIGNAGE: "MOHIT DEVELOPER HUB"
  const createSignCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 320;
    const ctx = canvas.getContext('2d')!;

    // Sophisticated deep navy/charcoal corporate background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stainless steel framing border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Kicker
    ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText('GLOBAL TECHNOLOGY HEADQUARTERS', canvas.width / 2, 70);

    // Main Illuminated Title
    ctx.font = 'bold 62px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('MOHIT DEVELOPER HUB', canvas.width / 2, 160);

    // Subtitle
    ctx.font = '600 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('AI  •  SOFTWARE  •  INNOVATION', canvas.width / 2, 235);

    // Underline
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(120, 265, canvas.width - 240, 4);

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

  // 8. DIGITAL INFORMATION SCREENS ON MID-TOWER
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
    ledCtx.fillStyle = '#0f172a';
    ledCtx.fillRect(0, 0, 512, 128);

    ledCtx.strokeStyle = '#38bdf8';
    ledCtx.lineWidth = 4;
    ledCtx.strokeRect(4, 4, 504, 120);

    ledCtx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ledCtx.fillStyle = '#ffffff';
    ledCtx.textAlign = 'center';
    ledCtx.fillText('MOHIT CLUSTER // PRODUCTION SYSTEMS', 256, 48);

    const offset = Math.floor((time * 25) % 100);
    ledCtx.font = '18px "Plus Jakarta Sans", sans-serif';
    ledCtx.fillStyle = '#94a3b8';
    ledCtx.fillText(`ACTIVE REPOS: 4,820 · LATENCY: 1.${offset}ms · HEALTH: 100%`, 256, 88);

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

  // Helipad Aviation Yellow Perimeter Ring
  const padRingGeo = new THREE.TorusGeometry(padRadius + 0.2, 0.2, 8, 32);
  padRingGeo.rotateX(Math.PI / 2);
  const padRing = new THREE.Mesh(padRingGeo, materials.neonAmber);
  padRing.position.y = towerHeight + 5.35;
  group.add(padRing);

  // Helipad Crisp White "H" Marking
  const hBarGeo1 = new THREE.PlaneGeometry(1.2, 6);
  hBarGeo1.rotateX(-Math.PI / 2);
  const hBar1 = new THREE.Mesh(hBarGeo1, materials.neonWhite);
  hBar1.position.set(-2, towerHeight + 5.36, 0);
  group.add(hBar1);

  const hBar2 = new THREE.Mesh(hBarGeo1, materials.neonWhite);
  hBar2.position.set(2, towerHeight + 5.36, 0);
  group.add(hBar2);

  const hBarMidGeo = new THREE.PlaneGeometry(4, 1.2);
  hBarMidGeo.rotateX(-Math.PI / 2);
  const hBarMid = new THREE.Mesh(hBarMidGeo, materials.neonWhite);
  hBarMid.position.set(0, towerHeight + 5.36, 0);
  group.add(hBarMid);

  // Communications & Radar Spire (Height: 32m)
  const spireMastGeo = new THREE.CylinderGeometry(0.3, 0.8, 32, 8);
  const spireMast = new THREE.Mesh(spireMastGeo, materials.metalLight);
  spireMast.position.set(0, towerHeight + 21, 0);
  group.add(spireMast);

  // Red Aviation Obstruction Warning Beacon Tip (ICAO / FAA compliant red flasher)
  const tipGeo = new THREE.SphereGeometry(0.7, 8, 8);
  const tipBeacon = new THREE.Mesh(tipGeo, materials.neonRed);
  tipBeacon.position.set(0, towerHeight + 37, 0);
  group.add(tipBeacon);

  // Rooftop Executive Observation Dome
  const domeGeo = new THREE.SphereGeometry(4.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const domeMesh = new THREE.Mesh(domeGeo, materials.glassDark);
  domeMesh.position.set(0, towerHeight + 5.2, 0);
  group.add(domeMesh);

  // 10. ARCHITECTURAL ENCLOSED GLASS SKYBRIDGES
  // Skybridge 1: North Skybridge at Level 12 (Y: 48m, connecting toward Technology Research Center)
  const skybridge1Length = 32;
  const bridge1Geo = new THREE.BoxGeometry(3.6, 3.4, skybridge1Length);
  const bridge1Mesh = new THREE.Mesh(bridge1Geo, materials.glassDark);
  bridge1Mesh.position.set(0, 48, -towerDepth / 2 - skybridge1Length / 2);
  group.add(bridge1Mesh);

  // Skybridge 1 Structural Steel Trusses
  const bridgeDeck1Geo = new THREE.BoxGeometry(3.8, 0.4, skybridge1Length);
  const bridgeDeck1 = new THREE.Mesh(bridgeDeck1Geo, materials.metalDark);
  bridgeDeck1.position.set(0, 46.2, -towerDepth / 2 - skybridge1Length / 2);
  group.add(bridgeDeck1);

  // Skybridge 2: West Skybridge at Level 24 (Y: 88m, connecting across Avenue)
  const skybridge2Length = 26;
  const bridge2Geo = new THREE.BoxGeometry(skybridge2Length, 3.4, 3.6);
  const bridge2Mesh = new THREE.Mesh(bridge2Geo, materials.glassDark);
  bridge2Mesh.position.set(-towerWidth / 2 - skybridge2Length / 2, 88, 0);
  group.add(bridge2Mesh);

  const bridgeDeck2Geo = new THREE.BoxGeometry(skybridge2Length, 0.4, 3.8);
  const bridgeDeck2 = new THREE.Mesh(bridgeDeck2Geo, materials.metalDark);
  bridgeDeck2.position.set(-towerWidth / 2 - skybridge2Length / 2, 86.2, 0);
  group.add(bridgeDeck2);

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
    // Pulse aircraft beacon (standard aviation strobe cadence)
    tipBeacon.scale.setScalar(0.9 + (Math.sin(time * 4) > 0.5 ? 0.35 : 0));

    // Rotate entrance sculpture
    logoSculpture.rotation.y = time * 0.6;

    // Rotate gallery exhibit
    showcaseExhibit.rotation.z = time * 0.5;

    // Slowly rotate studio globe
    studioGlobe.rotation.y = time * 0.4;

    // Update LED screens
    updateLedScreen(time);
  };

  const dispose = () => {
    scene.remove(group);
    plazaGeo.dispose();
    plazaMat.dispose();
    curbGeo.dispose();
    curbMat.dispose();
    pathGeo.dispose();
    pathMat.dispose();
    bollardGeo.dispose();
    bollardCapGeo.dispose();
    rampGeo.dispose();
    portalArchGeo.dispose();
    pSignGeo.dispose();
    pSignTex.dispose();
    entranceGeo.dispose();
    deskGeo.dispose();
    logoSculptureGeo.dispose();
    logoSculptureMat.dispose();
    towerBodyGeo.dispose();
    colGeo.dispose();
    spandrelGeo.dispose();
    floorPlateGeo.dispose();
    showcasePedestalGeo.dispose();
    showcaseExhibitGeo.dispose();
    deskBlockGeo.dispose();
    serverRackGeo.dispose();
    serverRackMat.dispose();
    serverTex.dispose();
    boardroomTableGeo.dispose();
    boardroomTableMat.dispose();
    studioGlobe.geometry.dispose();
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
    bridge1Geo.dispose();
    bridgeDeck1Geo.dispose();
    bridge2Geo.dispose();
    bridgeDeck2Geo.dispose();
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
