/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { BuildingData } from '../city/types';
import { CityMaterials } from '../assets/materials';
import { createServerRacksTexture } from '../assets/textures';
import { createBuildingEntryGateAndRoom } from './BuildingEntryRoom';

export interface MohitHubSystem {
  group: THREE.Group;
  buildingData: BuildingData;
  interactiveMeshes: THREE.Object3D[];
  update: (time: number) => void;
  dispose: () => void;
}

interface AnimatedOfficeAgent {
  group: THREE.Group;
  headGroup: THREE.Group;
  leftArm: THREE.Object3D;
  rightArm: THREE.Object3D;
  role: 'typing' | 'presenter' | 'collaborating' | 'audience';
  phase: number;
}

/**
 * Creates a realistic articulated 3D Human Developer / Corporate Employee Agent
 * (Seated at a laptop/PC workstation or standing in the Presentation / GitHub room)
 */
function createCorporateHumanAgent(opts: {
  suitColor: number;
  shirtColor: number;
  skinColor: number;
  hairColor: number;
  seated: boolean;
  role: AnimatedOfficeAgent['role'];
  phase: number;
}): AnimatedOfficeAgent {
  const agent = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: opts.skinColor, roughness: 0.55 });
  const suitMat = new THREE.MeshStandardMaterial({ color: opts.suitColor, roughness: 0.65 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: opts.shirtColor, roughness: 0.5 });
  const hairMat = new THREE.MeshStandardMaterial({ color: opts.hairColor, roughness: 0.8 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
  const badgeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  const baseHipY = opts.seated ? 0.52 : 0.92;

  // Torso & Jacket
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.54, 0.24), suitMat);
  torso.position.y = baseHipY + 0.30;
  torso.castShadow = true;
  agent.add(torso);

  // Inner Shirt / Collar V-strip
  const shirtStrip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.26, 0.25), shirtMat);
  shirtStrip.position.set(0, baseHipY + 0.42, 0.01);
  agent.add(shirtStrip);

  // Employee ID Lanyard Badge on Chest
  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.09, 0.02), badgeMat);
  badge.position.set(0.11, baseHipY + 0.38, 0.13);
  agent.add(badge);

  // Head & Hair Group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, baseHipY + 0.68, 0);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), skinMat);
  headGroup.add(head);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.148, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hairMat
  );
  hair.position.y = 0.02;
  headGroup.add(hair);
  agent.add(headGroup);

  // Articulated Left & Right Arms (pivoting at shoulder)
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.26, baseHipY + 0.52, 0);
  const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.44, 0.11), suitMat);
  leftArmMesh.position.set(0, -0.18, 0.10);
  leftArmPivot.add(leftArmMesh);
  const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), skinMat);
  leftHand.position.set(0, -0.38, 0.16);
  leftArmPivot.add(leftHand);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.26, baseHipY + 0.52, 0);
  const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.44, 0.11), suitMat);
  rightArmMesh.position.set(0, -0.18, 0.10);
  rightArmPivot.add(rightArmMesh);
  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), skinMat);
  rightHand.position.set(0, -0.38, 0.16);
  rightArmPivot.add(rightHand);

  if (opts.role === 'typing') {
    leftArmPivot.rotation.x = -0.82;
    rightArmPivot.rotation.x = -0.82;
  } else if (opts.role === 'presenter') {
    leftArmPivot.rotation.x = -0.45;
    rightArmPivot.rotation.x = -1.15;
    rightArmPivot.rotation.z = -0.25;
  } else if (opts.role === 'collaborating') {
    leftArmPivot.rotation.x = -0.55;
    rightArmPivot.rotation.x = -0.75;
  } else {
    leftArmPivot.rotation.x = -0.45;
    rightArmPivot.rotation.x = -0.45;
  }

  agent.add(leftArmPivot, rightArmPivot);

  // Legs (Seated vs Standing)
  if (opts.seated) {
    [-0.11, 0.11].forEach((lx) => {
      const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.42), pantsMat);
      thigh.position.set(lx, 0.48, 0.18);
      agent.add(thigh);

      const calf = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.44, 0.13), pantsMat);
      calf.position.set(lx, 0.24, 0.34);
      agent.add(calf);

      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.08, 0.22), shoeMat);
      shoe.position.set(lx, 0.04, 0.38);
      agent.add(shoe);
    });
  } else {
    [-0.11, 0.11].forEach((lx) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.86, 0.14), pantsMat);
      leg.position.set(lx, 0.45, 0);
      agent.add(leg);

      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.24), shoeMat);
      shoe.position.set(lx, 0.04, 0.05);
      agent.add(shoe);
    });
  }

  return {
    group: agent,
    headGroup,
    leftArm: leftArmPivot,
    rightArm: rightArmPivot,
    role: opts.role,
    phase: opts.phase,
  };
}

/**
 * Creates a procedural texture for PC & Laptop Monitors showing GitHub PRs, Contribution Graph & VS Code IDE
 */
function createGitHubWorkstationScreenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Dark GitHub & IDE background
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, 512, 256);

  // Left half: VS Code TypeScript Editor
  ctx.fillStyle = '#161b22';
  ctx.fillRect(6, 6, 244, 244);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('TS  AgentOrchestrator.ts', 16, 24);

  const codeColors = ['#7dd3fc', '#c084fc', '#4ade80', '#facc15', '#f8fafc', '#fb7185'];
  for (let line = 0; line < 13; line++) {
    ctx.fillStyle = '#475569';
    ctx.fillRect(14, 38 + line * 15, 12, 6);
    ctx.fillStyle = codeColors[line % codeColors.length];
    const indent = (line % 3) * 14;
    const width = 65 + ((line * 37) % 120);
    ctx.fillRect(34 + indent, 38 + line * 15, width, 7);
  }

  // Right half: GitHub Repository & Contribution Graph
  ctx.fillStyle = '#161b22';
  ctx.fillRect(258, 6, 248, 244);
  ctx.fillStyle = '#f0f6fc';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('github.com/mohit-hub/core', 268, 26);

  // PR Status Badges
  ctx.fillStyle = '#238636';
  ctx.fillRect(268, 36, 95, 18);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('PR #428 MERGED', 274, 49);

  ctx.fillStyle = '#1f6feb';
  ctx.fillRect(370, 36, 124, 18);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('AGENTS: 12 ACTIVE', 376, 49);

  // GitHub Green Contribution Heatmap Grid
  const greens = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
  for (let gx = 0; gx < 18; gx++) {
    for (let gy = 0; gy < 5; gy++) {
      ctx.fillStyle = greens[(gx * 3 + gy * 7) % greens.length];
      ctx.fillRect(268 + gx * 12, 66 + gy * 12, 9, 9);
    }
  }

  // Active Agent Terminal Log
  ctx.fillStyle = '#090d11';
  ctx.fillRect(268, 136, 228, 104);
  ctx.fillStyle = '#39d353';
  ctx.font = '10px monospace';
  ctx.fillText('✓ @mohit-agent-01: CI passed', 274, 154);
  ctx.fillStyle = '#58a6ff';
  ctx.fillText('⚡ @mohit-agent-02: PR #429', 274, 174);
  ctx.fillStyle = '#d2a8ff';
  ctx.fillText('⚙ Building neural traffic sync', 274, 194);
  ctx.fillStyle = '#3fb950';
  ctx.fillText('★ 4,820 commits on main', 274, 214);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Creates a complete Corporate Developer Workstation Desk with:
 * - Warm oak & brushed-steel desk
 * - Dual curved 4K PC monitors + RGB Desktop PC Tower
 * - Open Aluminum Laptop on desk
 * - Ergonomic office chair + Articulated 3D Employee Agent typing
 */
function createDeveloperWorkstationPod(
  screenMat: THREE.Material,
  laptopScreenMat: THREE.Material,
  suitColor: number,
  shirtColor: number,
  skinColor: number,
  hairColor: number,
  phase: number
): { group: THREE.Group; agent: AnimatedOfficeAgent } {
  const pod = new THREE.Group();

  const deskWoodMat = new THREE.MeshStandardMaterial({ color: 0xd6b88e, roughness: 0.42, metalness: 0.1 });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.8 });
  const silverAluminumMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25, metalness: 0.88 });
  const pcCaseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.85 });
  const rgbAccentMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  // 1. Corporate Desk Top (2.1m wide x 0.95m deep at Y = 0.76m)
  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.06, 0.95), deskWoodMat);
  deskTop.position.set(0, 0.76, 0);
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;
  pod.add(deskTop);

  // Steel Desk Legs
  [-0.95, 0.95].forEach((lx) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.76, 0.82), darkMetalMat);
    leg.position.set(lx, 0.38, 0);
    pod.add(leg);
  });

  // 2. Dual Curved PC Monitors on Dual-Arm Stand
  const standPost = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.38, 8), darkMetalMat);
  standPost.position.set(-0.22, 0.96, -0.26);
  pod.add(standPost);

  [-0.56, 0.12].forEach((mx, idx) => {
    const rotY = idx === 0 ? 0.16 : -0.16;
    const monFrame = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.38, 0.03), darkMetalMat);
    monFrame.position.set(mx, 1.06, -0.22);
    monFrame.rotation.y = rotY;
    pod.add(monFrame);

    const monScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.34), screenMat);
    monScreen.position.set(mx, 1.06, -0.202);
    monScreen.rotation.y = rotY;
    pod.add(monScreen);
  });

  // Full-Size Mechanical Keyboard & Mouse in front of Dual PC Monitors
  const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.15), darkMetalMat);
  keyboard.position.set(-0.22, 0.80, 0.12);
  pod.add(keyboard);

  const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.025, 0.11), silverAluminumMat);
  mouse.position.set(0.10, 0.80, 0.12);
  pod.add(mouse);

  // 3. High-Performance Desktop PC Tower Chassis on Right Side of Desk
  const pcTower = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.48, 0.46), pcCaseMat);
  pcTower.position.set(0.82, 1.03, -0.12);
  pcTower.castShadow = true;
  pod.add(pcTower);

  const pcRgbStrip = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.42, 0.40), rgbAccentMat);
  pcRgbStrip.position.set(0.695, 1.03, -0.12);
  pod.add(pcRgbStrip);

  // 4. Open Aluminum Developer Laptop on Left/Center-Right Side of Desk
  const laptopGroup = new THREE.Group();
  laptopGroup.position.set(0.46, 0.79, 0.08);
  laptopGroup.rotation.y = -0.28;

  const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.018, 0.25), silverAluminumMat);
  laptopGroup.add(laptopBase);

  const laptopKeys = new THREE.Mesh(new THREE.PlaneGeometry(0.30, 0.14), darkMetalMat);
  laptopKeys.rotation.x = -Math.PI / 2;
  laptopKeys.position.set(0, 0.011, -0.02);
  laptopGroup.add(laptopKeys);

  const laptopLid = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.24, 0.014), silverAluminumMat);
  laptopLid.position.set(0, 0.115, -0.12);
  laptopLid.rotation.x = -0.22;
  laptopGroup.add(laptopLid);

  const laptopScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.33, 0.21), laptopScreenMat);
  laptopScreen.position.set(0, 0.115, -0.111);
  laptopScreen.rotation.x = -0.22;
  laptopGroup.add(laptopScreen);

  pod.add(laptopGroup);

  // 5. Ergonomic Mesh Executive Chair
  const chairGroup = new THREE.Group();
  chairGroup.position.set(-0.12, 0, 0.56);

  const chairBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 8), darkMetalMat);
  chairBase.position.y = 0.04;
  chairGroup.add(chairBase);

  const chairStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.42, 8), darkMetalMat);
  chairStem.position.y = 0.25;
  chairGroup.add(chairStem);

  const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.07, 0.48), darkMetalMat);
  chairSeat.position.y = 0.46;
  chairGroup.add(chairSeat);

  const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.58, 0.06), darkMetalMat);
  chairBack.position.set(0, 0.78, 0.22);
  chairGroup.add(chairBack);
  pod.add(chairGroup);

  // 6. Seated Corporate Developer Employee Agent
  const agent = createCorporateHumanAgent({
    suitColor,
    shirtColor,
    skinColor,
    hairColor,
    seated: true,
    role: 'typing',
    phase,
  });
  agent.group.position.set(-0.12, 0, 0.42);
  agent.group.rotation.y = Math.PI; // face the monitors & laptop (-Z)
  pod.add(agent.group);

  return { group: pod, agent };
}

export function createMohitDeveloperHub(
  scene: THREE.Scene,
  materials: CityMaterials
): MohitHubSystem {
  const group = new THREE.Group();
  group.name = 'mohit_developer_hub_hq';

  const posX = 145;
  const posY = 0;
  const posZ = -46;
  const towerHeight = 142;
  const towerWidth = 26;
  const towerDepth = 26;

  group.position.set(posX, posY, posZ);

  const interactiveMeshes: THREE.Object3D[] = [];
  const officeAgents: AnimatedOfficeAgent[] = [];

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
    occupancy: '98% (4,200 Engineers & AI Coding Agents)',
    networkStatus: 'GitHub Enterprise Optical Grid • 100% Online',
    description:
      'The monumental global headquarters of MOHIT DEVELOPER HUB. Features a transparent multi-level Corporate Employee Office under the tower with dual-PC & laptop developer workstations, an Executive Presentation & Sprint Review Room with live projector slides, and a GitHub Project & Autonomous Coding Agent War-Room.',
    isLandmark: true,
    interiorAreas: [
      'Corporate Developer Office (Ergonomic Desks, Dual 4K PCs & Open Laptops)',
      'Executive Presentation & Architecture Review Room (16:9 Projector & Conference Table)',
      'GitHub Enterprise Project & Autonomous Coding Agent War-Room (Live PRs & Commit Wall)',
      'Server / Data Center (Sub-Zero Liquid Cooled Optical Racks)',
      'Rooftop AI Command & Aviation Helipad Deck',
    ],
    features: [
      'Real Look-In Corporate Employee Office Under Tower',
      'Laptop & Dual-PC Developer Workstations with Live GitHub Screens',
      'Glass-Enclosed Presentation Room with Live Slide Projector & Presenter Agent',
      'GitHub Project Kanban & Autonomous Coding Agents Floor',
      'Panoramic Double-Glazed Low-E Architectural Glass Facade',
    ],
  };

  // 1. BASE PLAZA & FOUNDATION (Polished Granite Plaza)
  const plazaSize = 44;
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

  const curbGeo = new THREE.BoxGeometry(plazaSize + 0.4, 0.25, plazaSize + 0.4);
  const curbMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
  const curbMesh = new THREE.Mesh(curbGeo, curbMat);
  curbMesh.position.y = 0.65;
  group.add(curbMesh);

  // 2. ENTRANCE PROMENADE TO MAIN AVENUE
  const pathLength = 21;
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
  rampGeo.rotateX(-Math.PI / 2 + 0.18);
  const rampMesh = new THREE.Mesh(rampGeo, materials.asphalt);
  rampMesh.position.set(0, -0.2, towerDepth / 2 + 6);
  group.add(rampMesh);

  const portalArchGeo = new THREE.BoxGeometry(rampWidth + 1.2, 3.2, 1.2);
  const portalArch = new THREE.Mesh(portalArchGeo, materials.metalDark);
  portalArch.position.set(0, 1.8, towerDepth / 2 + 1);
  group.add(portalArch);

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

  // 4. GROUND FLOOR ARCHITECTURAL ENTRY GATES & RECEPTION WINGS
  const westEntryGateRoom = createBuildingEntryGateAndRoom(
    {
      title: 'MOHIT DEVELOPER HUB',
      subtitle: 'CORPORATE OFFICE • LAPTOP/PC PODS • GITHUB AGENTS',
      theme: 'tech',
      roomWidth: 14.0,
      roomHeight: 5.2,
      roomDepth: 8.5,
      buildingData,
    },
    interactiveMeshes
  );
  westEntryGateRoom.position.set(-towerWidth / 2 - 0.5, 0.3, 0);
  westEntryGateRoom.rotation.y = -Math.PI / 2;
  group.add(westEntryGateRoom);

  const southEntryGateRoom = createBuildingEntryGateAndRoom(
    {
      title: 'MOHIT HUB PRESENTATION SUITE',
      subtitle: 'SOUTH ENTRY GATE • PRESENTATION ROOM & REPOS',
      theme: 'tech',
      roomWidth: 13.5,
      roomHeight: 5.2,
      roomDepth: 8.0,
      buildingData,
    },
    interactiveMeshes
  );
  southEntryGateRoom.position.set(0, 0.3, towerDepth / 2 + 0.5);
  group.add(southEntryGateRoom);

  // Forecourt Geometric Sculpture
  const logoSculptureGeo = new THREE.IcosahedronGeometry(0.85, 1);
  const logoSculptureMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.85,
    roughness: 0.25,
  });
  const logoSculpture = new THREE.Mesh(logoSculptureGeo, logoSculptureMat);
  logoSculpture.position.set(-towerWidth / 2 - 8, 2.4, 0);
  group.add(logoSculpture);

  // ============================================================================
  // 5. REAL CORPORATE EMPLOYEE OFFICE, LAPTOP/PC WORKSTATIONS, PRESENTATION ROOM
  //    & GITHUB PROJECT AGENT WAR-ROOM UNDER & INSIDE THE TOWER
  // ============================================================================
  const ghScreenTex = createGitHubWorkstationScreenTexture();
  const ghScreenMat = new THREE.MeshBasicMaterial({ map: ghScreenTex });

  // Crystal-clear architectural glass for the lower 3 Corporate Office floors under the tower (Y = 0.6 to 24.6m)
  const lowerOfficeHeight = 24;
  const clearOfficeGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.18,
    roughness: 0.08,
    metalness: 0.1,
    transmission: 0.72,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const lowerOfficeShell = new THREE.Mesh(
    new THREE.BoxGeometry(towerWidth - 0.2, lowerOfficeHeight, towerDepth - 0.2),
    clearOfficeGlassMat
  );
  lowerOfficeShell.position.y = lowerOfficeHeight / 2 + 0.6;
  lowerOfficeShell.userData = { buildingData, isEntryGate: true };
  group.add(lowerOfficeShell);
  interactiveMeshes.push(lowerOfficeShell);

  // Upper Tower Glass Shell (Y = 24.6m to 142.6m) — semi-transparent so upper floors also glow through
  const upperTowerHeight = towerHeight - lowerOfficeHeight;
  const upperGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f2942,
    transparent: true,
    opacity: 0.36,
    roughness: 0.15,
    metalness: 0.25,
    depthWrite: false,
  });
  const towerBodyGeo = new THREE.BoxGeometry(towerWidth, upperTowerHeight, towerDepth);
  const towerGlassMesh = new THREE.Mesh(towerBodyGeo, upperGlassMat);
  towerGlassMesh.position.y = lowerOfficeHeight + upperTowerHeight / 2 + 0.6;
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

  // Architectural Precast Floor Spandrels
  const spandrelGeo = new THREE.BoxGeometry(towerWidth + 0.3, 0.65, towerDepth + 0.3);
  for (let h = 8.6; h < towerHeight; h += 8.0) {
    const spandrel = new THREE.Mesh(spandrelGeo, materials.metalDark);
    spandrel.position.y = h;
    group.add(spandrel);
  }

  // Shared Interior Materials for Corporate Office Floors under Tower
  const officeFloorMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.35,
    metalness: 0.15,
  });
  const oakCarpetMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.65,
  });
  const ceilingLightMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
  const glassPartitionMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.28,
    roughness: 0.1,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  // ----------------------------------------------------------------------------
  // LEVEL 1 UNDER TOWER (Y = 0.65m): CORPORATE EMPLOYEE OFFICE, LAPTOPS/PCs & GITHUB AGENT WAR-ROOM
  // ----------------------------------------------------------------------------
  const level1Group = new THREE.Group();
  level1Group.position.y = 0.65;

  const l1Floor = new THREE.Mesh(new THREE.BoxGeometry(towerWidth - 1.2, 0.2, towerDepth - 1.2), officeFloorMat);
  l1Floor.receiveShadow = true;
  level1Group.add(l1Floor);

  // Illuminated Ceiling LED Troffers over Level 1 Office (at Y = 7.6m)
  for (let lx = -8; lx <= 8; lx += 8) {
    for (let lz = -8; lz <= 8; lz += 8) {
      const troffer = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.1, 1.4), ceilingLightMat);
      troffer.position.set(lx, 7.6, lz);
      level1Group.add(troffer);
    }
  }

  // 8 Corporate Developer Workstations (Laptop + Dual 4K PCs + RGB Tower + Seated Typing Engineer Agent)
  const workstationConfigs = [
    { x: -6.5, z: -5.5, rotY: 0, suit: 0x1e293b, shirt: 0x38bdf8, skin: 0xf1c27d, hair: 0x1c1917 },
    { x: -2.2, z: -5.5, rotY: 0, suit: 0x334155, shirt: 0xf8fafc, skin: 0xe0ac69, hair: 0x451a03 },
    { x: -6.5, z: -1.5, rotY: Math.PI, suit: 0x0f172a, shirt: 0x10b981, skin: 0xffdbac, hair: 0x27272a },
    { x: -2.2, z: -1.5, rotY: Math.PI, suit: 0x1e3a8a, shirt: 0xf8fafc, skin: 0xc68642, hair: 0x090d16 },
    { x: -6.5, z: 3.5, rotY: 0, suit: 0x374151, shirt: 0xf59e0b, skin: 0xf1c27d, hair: 0x1c1917 },
    { x: -2.2, z: 3.5, rotY: 0, suit: 0x1e293b, shirt: 0x38bdf8, skin: 0xffdbac, hair: 0x78350f },
    { x: -6.5, z: 7.2, rotY: Math.PI, suit: 0x0f172a, shirt: 0xec4899, skin: 0xe0ac69, hair: 0x1c1917 },
    { x: -2.2, z: 7.2, rotY: Math.PI, suit: 0x334155, shirt: 0xa855f7, skin: 0xc68642, hair: 0x090d16 },
  ];

  workstationConfigs.forEach((cfg, idx) => {
    const pod = createDeveloperWorkstationPod(
      ghScreenMat,
      ghScreenMat,
      cfg.suit,
      cfg.shirt,
      cfg.skin,
      cfg.hair,
      idx * 0.9
    );
    pod.group.position.set(cfg.x, 0.1, cfg.z);
    pod.group.rotation.y = cfg.rotY;
    level1Group.add(pod.group);
    officeAgents.push(pod.agent);
  });

  // GITHUB PROJECT & AUTONOMOUS CODING AGENTS WAR-ROOM WALL (East side of Level 1, X = +9.8m)
  const ghBoardCanvas = document.createElement('canvas');
  ghBoardCanvas.width = 1024;
  ghBoardCanvas.height = 512;
  const ghCtx = ghBoardCanvas.getContext('2d')!;
  const ghBoardTex = new THREE.CanvasTexture(ghBoardCanvas);
  ghBoardTex.colorSpace = THREE.SRGBColorSpace;

  const updateGitHubBoardCanvas = (time: number) => {
    ghCtx.fillStyle = '#0d1117';
    ghCtx.fillRect(0, 0, 1024, 512);

    // Header Bar
    ghCtx.fillStyle = '#161b22';
    ghCtx.fillRect(0, 0, 1024, 68);
    ghCtx.strokeStyle = '#30363d';
    ghCtx.lineWidth = 3;
    ghCtx.strokeRect(4, 4, 1016, 504);

    ghCtx.fillStyle = '#58a6ff';
    ghCtx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
    ghCtx.fillText('GITHUB ENTERPRISE // mohit-developer-hub / metropolis-autonomous-core', 28, 44);

    ghCtx.fillStyle = '#238636';
    ghCtx.fillRect(830, 16, 168, 36);
    ghCtx.fillStyle = '#ffffff';
    ghCtx.font = 'bold 18px monospace';
    ghCtx.fillText('● CI/CD PASSING', 844, 40);

    // 3 Kanban Columns: IN PROGRESS, AI AGENT REVIEW, MERGED TO MAIN
    const cols = [
      {
        title: 'IN PROGRESS (DEV + AGENTS)',
        color: '#f59e0b',
        cards: [
          'PR #429: Multi-Agent Office Sync',
          'PR #431: Autonomous Drone Routing',
          'ISSUE #412: WebGPU Shader Cache',
        ],
      },
      {
        title: 'AI AGENT CODE REVIEW',
        color: '#38bdf8',
        cards: [
          '@mohit-pr-agent: Reviewing #428',
          '@mohit-sec-agent: 0 Vulnerabilities',
          '@mohit-test-agent: 1,420 Tests OK',
        ],
      },
      {
        title: 'MERGED TO PRODUCTION',
        color: '#3fb950',
        cards: [
          '✓ PR #426: 3D Traffic Signal Gantries',
          '✓ PR #424: Building Entry Rooms',
          '✓ PR #420: Real Pedestrian Agents',
        ],
      },
    ];

    cols.forEach((col, cIdx) => {
      const cx = 24 + cIdx * 330;
      ghCtx.fillStyle = '#161b22';
      ghCtx.fillRect(cx, 84, 312, 250);
      ghCtx.fillStyle = col.color;
      ghCtx.fillRect(cx, 84, 312, 6);
      ghCtx.font = 'bold 18px monospace';
      ghCtx.fillText(col.title, cx + 14, 114);

      col.cards.forEach((card, kIdx) => {
        const cy = 132 + kIdx * 62;
        ghCtx.fillStyle = '#21262d';
        ghCtx.fillRect(cx + 12, cy, 288, 50);
        ghCtx.fillStyle = '#e6edf3';
        ghCtx.font = '16px monospace';
        ghCtx.fillText(card, cx + 22, cy + 31);
      });
    });

    // Bottom: 52-Week Green GitHub Contribution Graph
    ghCtx.fillStyle = '#161b22';
    ghCtx.fillRect(24, 350, 976, 142);
    ghCtx.fillStyle = '#8b949e';
    ghCtx.font = 'bold 16px monospace';
    const pulseCommits = 14820 + Math.floor((time * 3) % 40);
    ghCtx.fillText(
      `CONTRIBUTIONS GRAPH: ${pulseCommits.toLocaleString()} COMMITS BY MOHIT HUB ENGINEERS & CODING AGENTS`,
      40,
      376
    );

    const greens = ['#21262d', '#0e4429', '#006d32', '#26a641', '#39d353'];
    for (let wx = 0; wx < 44; wx++) {
      for (let wy = 0; wy < 5; wy++) {
        const gIdx = (wx * 5 + wy * 3 + Math.floor(time * 2)) % greens.length;
        ghCtx.fillStyle = greens[gIdx];
        ghCtx.fillRect(40 + wx * 21, 392 + wy * 17, 15, 13);
      }
    }

    ghBoardTex.needsUpdate = true;
  };
  updateGitHubBoardCanvas(0);

  // Mount the Giant GitHub Project Board on the East Interior Wall of Level 1
  const ghWallFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 4.4, 9.6),
    materials.metalDark
  );
  ghWallFrame.position.set(9.8, 3.4, 0);
  level1Group.add(ghWallFrame);

  const ghWallScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(9.2, 4.1),
    new THREE.MeshBasicMaterial({ map: ghBoardTex, side: THREE.DoubleSide })
  );
  ghWallScreen.position.set(9.62, 3.4, 0);
  ghWallScreen.rotation.y = -Math.PI / 2;
  level1Group.add(ghWallScreen);

  // Collaborative Round Holographic GitHub Agent Pod Table in front of the GitHub Wall
  const agentPodTable = new THREE.Mesh(
    new THREE.CylinderGeometry(1.8, 1.4, 0.88, 20),
    materials.metalDark
  );
  agentPodTable.position.set(5.4, 0.44, 0);
  level1Group.add(agentPodTable);

  const agentHoloRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.35, 0.05, 8, 24).rotateX(Math.PI / 2),
    materials.neonCyan
  );
  agentHoloRing.position.set(5.4, 0.92, 0);
  level1Group.add(agentHoloRing);

  const agentHoloCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.65, 1),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true })
  );
  agentHoloCore.position.set(5.4, 1.85, 0);
  level1Group.add(agentHoloCore);

  // 3 Standing Collaborating Engineer Agents around the GitHub Project Board & Holo Table
  const collabConfigs = [
    { x: 6.8, z: -1.8, rotY: 0.4, suit: 0x0f172a, shirt: 0x38bdf8, skin: 0xf1c27d, hair: 0x1c1917 },
    { x: 6.8, z: 1.8, rotY: 2.5, suit: 0x1e3a8a, shirt: 0x10b981, skin: 0xe0ac69, hair: 0x451a03 },
    { x: 3.4, z: 0.2, rotY: 1.5, suit: 0x334155, shirt: 0xf59e0b, skin: 0xffdbac, hair: 0x090d16 },
  ];
  collabConfigs.forEach((cc, idx) => {
    const collabAgent = createCorporateHumanAgent({
      suitColor: cc.suit,
      shirtColor: cc.shirt,
      skinColor: cc.skin,
      hairColor: cc.hair,
      seated: false,
      role: 'collaborating',
      phase: idx * 1.4,
    });
    collabAgent.group.position.set(cc.x, 0.1, cc.z);
    collabAgent.group.rotation.y = cc.rotY;
    level1Group.add(collabAgent.group);
    officeAgents.push(collabAgent);
  });

  group.add(level1Group);

  // ----------------------------------------------------------------------------
  // LEVEL 2 UNDER TOWER (Y = 8.6m): EXECUTIVE PRESENTATION & ARCHITECTURE REVIEW ROOM
  // ----------------------------------------------------------------------------
  const level2Group = new THREE.Group();
  level2Group.position.y = 8.6;

  const l2Floor = new THREE.Mesh(new THREE.BoxGeometry(towerWidth - 1.2, 0.35, towerDepth - 1.2), officeFloorMat);
  l2Floor.receiveShadow = true;
  level2Group.add(l2Floor);

  // Glass Acoustic Partition Wall enclosing the Presentation Room
  const presGlassWall = new THREE.Mesh(new THREE.BoxGeometry(20, 6.8, 0.15), glassPartitionMat);
  presGlassWall.position.set(0, 3.5, 9.5);
  level2Group.add(presGlassWall);

  // Illuminated Ceiling Troffers over Level 2 Presentation Room
  for (let lx = -7; lx <= 7; lx += 7) {
    for (let lz = -6; lz <= 6; lz += 6) {
      const troffer = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.1, 1.4), ceilingLightMat);
      troffer.position.set(lx, 7.4, lz);
      level2Group.add(troffer);
    }
  }

  // GIANT 16:9 PRESENTATION ROOM PROJECTOR SCREEN (North Wall of Level 2, facing South)
  const presCanvas = document.createElement('canvas');
  presCanvas.width = 1024;
  presCanvas.height = 512;
  const presCtx = presCanvas.getContext('2d')!;
  const presTex = new THREE.CanvasTexture(presCanvas);
  presTex.colorSpace = THREE.SRGBColorSpace;

  const updatePresentationCanvas = (time: number) => {
    const slideIdx = Math.floor((time * 0.25) % 3);

    presCtx.fillStyle = '#0f172a';
    presCtx.fillRect(0, 0, 1024, 512);

    // Slide Header
    presCtx.fillStyle = '#1e293b';
    presCtx.fillRect(0, 0, 1024, 76);
    presCtx.fillStyle = '#38bdf8';
    presCtx.fillRect(0, 72, 1024, 4);

    presCtx.fillStyle = '#38bdf8';
    presCtx.font = 'bold 20px monospace';
    presCtx.fillText(`MOHIT DEVELOPER HUB // EXECUTIVE PRESENTATION ROOM • SLIDE 0${slideIdx + 1}/03`, 32, 32);

    presCtx.fillStyle = '#ffffff';
    presCtx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
    if (slideIdx === 0) {
      presCtx.fillText('MULTI-AGENT GITHUB WORKFLOW & AUTONOMOUS CODE PIPELINE', 32, 62);
    } else if (slideIdx === 1) {
      presCtx.fillText('METROPOLIS SMART TRAFFIC & AI CLOUD THROUGHPUT BENCHMARKS', 32, 62);
    } else {
      presCtx.fillText('Q4 PRODUCT ROADMAP: DISTRIBUTED NEURAL CLUSTER EXPANSION', 32, 62);
    }

    // Left Box: Architecture Diagram / Metrics
    presCtx.fillStyle = '#1e293b';
    presCtx.fillRect(32, 100, 520, 376);
    presCtx.strokeStyle = '#38bdf8';
    presCtx.lineWidth = 2;
    presCtx.strokeRect(32, 100, 520, 376);

    // Animated Bar Chart inside Presentation Slide
    const bars = [
      { label: 'GitHub PR Velocity', val: 0.92, color: '#38bdf8' },
      { label: 'AI Agent Pass Rate', val: 0.98, color: '#10b981' },
      { label: 'Build Speedup (4.8x)', val: 0.86, color: '#f59e0b' },
      { label: 'Zero-Downtime Deploys', val: 0.99, color: '#a855f7' },
    ];
    bars.forEach((b, i) => {
      const by = 136 + i * 80;
      presCtx.fillStyle = '#cbd5e1';
      presCtx.font = 'bold 18px monospace';
      presCtx.fillText(b.label, 54, by);
      presCtx.fillStyle = '#0f172a';
      presCtx.fillRect(54, by + 12, 460, 28);
      presCtx.fillStyle = b.color;
      presCtx.fillRect(54, by + 12, Math.floor(460 * b.val), 28);
    });

    // Right Box: Live Sprint Summary & Presenter Notes
    presCtx.fillStyle = '#1e293b';
    presCtx.fillRect(576, 100, 416, 376);
    presCtx.fillStyle = '#38bdf8';
    presCtx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    presCtx.fillText('LIVE SPRINT TELEMETRY', 600, 140);

    const bullets = [
      '• 4,820 Active GitHub Repositories',
      '• 38 Autonomous Dev Agents Online',
      '• 99.998% Cloud Cluster Uptime',
      '• Sub-Millisecond Neural Inference',
      '• Automated PR Security Auditing',
      '• Real-Time City Digital Twin Sync',
    ];
    presCtx.fillStyle = '#e2e8f0';
    presCtx.font = '19px "Plus Jakarta Sans", sans-serif';
    bullets.forEach((line, bIdx) => {
      presCtx.fillText(line, 600, 188 + bIdx * 44);
    });

    presTex.needsUpdate = true;
  };
  updatePresentationCanvas(0);

  const presScreenFrame = new THREE.Mesh(
    new THREE.BoxGeometry(11.4, 5.2, 0.35),
    materials.metalDark
  );
  presScreenFrame.position.set(0, 3.6, -9.2);
  level2Group.add(presScreenFrame);

  const presScreenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(10.8, 4.8),
    new THREE.MeshBasicMaterial({ map: presTex, side: THREE.DoubleSide })
  );
  presScreenMesh.position.set(0, 3.6, -8.98);
  level2Group.add(presScreenMesh);

  // Presenter Podium + Laptop + Standing Presenter Human Agent in front of Screen
  const podiumMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 1.15, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.7 })
  );
  podiumMesh.position.set(-3.8, 0.65, -6.8);
  level2Group.add(podiumMesh);

  const presenterAgent = createCorporateHumanAgent({
    suitColor: 0x0f172a,
    shirtColor: 0x38bdf8,
    skinColor: 0xf1c27d,
    hairColor: 0x1c1917,
    seated: false,
    role: 'presenter',
    phase: 0.5,
  });
  presenterAgent.group.position.set(-3.8, 0.18, -7.5);
  presenterAgent.group.rotation.y = 0.25; // facing the conference table audience
  level2Group.add(presenterAgent.group);
  officeAgents.push(presenterAgent);

  // Executive Walnut Conference & Presentation Table (10m long x 3.2m wide)
  const confTableTop = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 0.12, 9.6),
    new THREE.MeshStandardMaterial({ color: 0x5c2d16, roughness: 0.32, metalness: 0.15 })
  );
  confTableTop.position.set(0, 0.82, 0.4);
  confTableTop.castShadow = true;
  level2Group.add(confTableTop);

  const confTableBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.74, 7.6),
    materials.metalDark
  );
  confTableBase.position.set(0, 0.42, 0.4);
  level2Group.add(confTableBase);

  // 8 Seated Employee Agents around the Presentation Conference Table with Open Laptops
  const silverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.25 });
  [-3.2, -1.0, 1.2, 3.4].forEach((tz, rowIdx) => {
    [-1, 1].forEach((side, sIdx) => {
      const seatX = side * 2.15;
      const laptopX = side * 1.15;

      // Open Laptop on Conference Table facing each employee
      const lapBase = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.02, 0.26), silverMat);
      lapBase.position.set(laptopX, 0.90, tz);
      level2Group.add(lapBase);

      const lapScreen = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.24, 0.36), ghScreenMat);
      lapScreen.position.set(laptopX - side * 0.12, 1.02, tz);
      level2Group.add(lapScreen);

      // Seated Audience Employee Agent looking toward the Presentation Screen & Table
      const audAgent = createCorporateHumanAgent({
        suitColor: (rowIdx + sIdx) % 2 === 0 ? 0x1e293b : 0x334155,
        shirtColor: sIdx === 0 ? 0x38bdf8 : 0xf8fafc,
        skinColor: (rowIdx + sIdx) % 2 === 0 ? 0xe0ac69 : 0xffdbac,
        hairColor: 0x1c1917,
        seated: true,
        role: 'audience',
        phase: rowIdx * 0.7 + sIdx,
      });
      audAgent.group.position.set(seatX, 0.16, tz);
      // Angle slightly toward the North Presentation Screen (-Z) and table center
      audAgent.group.rotation.y = side < 0 ? Math.PI * 0.72 : -Math.PI * 0.72;
      level2Group.add(audAgent.group);
      officeAgents.push(audAgent);
    });
  });

  group.add(level2Group);

  // ----------------------------------------------------------------------------
  // LEVEL 3 UNDER TOWER (Y = 16.6m): AI AGENT LAB & UPPER DEVELOPER PODS
  // ----------------------------------------------------------------------------
  const level3Group = new THREE.Group();
  level3Group.position.y = 16.6;

  const l3Floor = new THREE.Mesh(new THREE.BoxGeometry(towerWidth - 1.2, 0.35, towerDepth - 1.2), oakCarpetMat);
  level3Group.add(l3Floor);

  // 4 More Developer Laptop/PC Workstation Pods on Level 3
  [
    { x: -6.0, z: -4.0, rotY: 0 },
    { x: 6.0, z: -4.0, rotY: 0 },
    { x: -6.0, z: 4.0, rotY: Math.PI },
    { x: 6.0, z: 4.0, rotY: Math.PI },
  ].forEach((pos, idx) => {
    const pod = createDeveloperWorkstationPod(
      ghScreenMat,
      ghScreenMat,
      0x1e293b,
      0x10b981,
      0xf1c27d,
      0x1c1917,
      idx + 3.0
    );
    pod.group.position.set(pos.x, 0.18, pos.z);
    pod.group.rotation.y = pos.rotY;
    level3Group.add(pod.group);
    officeAgents.push(pod.agent);
  });

  group.add(level3Group);

  // 6. UPPER VISIBLE INTERIOR FLOORS THROUGH GLASS (Levels 4 to 14)
  const innerCoreWidth = towerWidth - 3.2;
  const innerCoreDepth = towerDepth - 3.2;
  const floorPlateGeo = new THREE.BoxGeometry(innerCoreWidth, 0.4, innerCoreDepth);
  for (let y = 24.6; y < towerHeight - 8; y += 8.5) {
    const floorPlate = new THREE.Mesh(floorPlateGeo, materials.metalDark);
    floorPlate.position.y = y;
    group.add(floorPlate);

    // Glowing ceiling strip on each upper floor so the entire tower interior looks alive
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(innerCoreWidth - 2, 0.18, innerCoreDepth - 2),
      ceilingLightMat
    );
    strip.position.y = y + 7.8;
    group.add(strip);
  }

  // Enterprise Data Center Server Racks at Y = 52m
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

  // Innovation Studio Holographic Globe at Y = 104m
  const studioGlobe = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.8, 1),
    materials.metalLight
  );
  studioGlobe.position.set(0, 104, 0);
  group.add(studioGlobe);

  // 7. MONUMENTAL ARCHITECTURAL SIGNAGE: "MOHIT DEVELOPER HUB"
  const createSignCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 320;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText('GLOBAL TECHNOLOGY HEADQUARTERS', canvas.width / 2, 70);

    ctx.font = 'bold 62px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('MOHIT DEVELOPER HUB', canvas.width / 2, 160);

    ctx.font = '600 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('CORPORATE OFFICE • GITHUB AGENTS • AI LABS', canvas.width / 2, 235);

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(120, 265, canvas.width - 240, 4);

    return canvas;
  };

  const signTex = new THREE.CanvasTexture(createSignCanvas());
  const signGeo = new THREE.PlaneGeometry(22, 7);
  const signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });

  const signMeshFront = new THREE.Mesh(signGeo, signMat);
  signMeshFront.position.set(0, 126, towerDepth / 2 + 0.3);
  group.add(signMeshFront);

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

    ledCtx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ledCtx.fillStyle = '#ffffff';
    ledCtx.textAlign = 'center';
    ledCtx.fillText('MOHIT HUB // GITHUB ENTERPRISE & AI AGENTS', 256, 48);

    const offset = Math.floor((time * 25) % 100);
    ledCtx.font = '18px "Plus Jakarta Sans", sans-serif';
    ledCtx.fillStyle = '#38bdf8';
    ledCtx.fillText(`REPOS: 4,820 · AGENTS: 38 ACTIVE · LATENCY: 1.${offset}ms`, 256, 88);

    ledTex.needsUpdate = true;
  };

  // 9. ROOFTOP HELIPAD & ANTENNA SPIRE
  const roofPenthouseGeo = new THREE.BoxGeometry(towerWidth - 4, 4, towerDepth - 4);
  const roofPenthouse = new THREE.Mesh(roofPenthouseGeo, materials.metalDark);
  roofPenthouse.position.y = towerHeight + 2.5;
  roofPenthouse.castShadow = true;
  group.add(roofPenthouse);

  const padRadius = 9;
  const padGeo = new THREE.CylinderGeometry(padRadius, padRadius, 0.6, 24);
  const padMesh = new THREE.Mesh(padGeo, materials.metalDark);
  padMesh.position.y = towerHeight + 5;
  group.add(padMesh);

  const padRingGeo = new THREE.TorusGeometry(padRadius + 0.2, 0.2, 8, 32);
  padRingGeo.rotateX(Math.PI / 2);
  const padRing = new THREE.Mesh(padRingGeo, materials.neonAmber);
  padRing.position.y = towerHeight + 5.35;
  group.add(padRing);

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

  const spireMastGeo = new THREE.CylinderGeometry(0.3, 0.8, 32, 8);
  const spireMast = new THREE.Mesh(spireMastGeo, materials.metalLight);
  spireMast.position.set(0, towerHeight + 21, 0);
  group.add(spireMast);

  const tipGeo = new THREE.SphereGeometry(0.7, 8, 8);
  const tipBeacon = new THREE.Mesh(tipGeo, materials.neonRed);
  tipBeacon.position.set(0, towerHeight + 37, 0);
  group.add(tipBeacon);

  const domeGeo = new THREE.SphereGeometry(4.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const domeMesh = new THREE.Mesh(domeGeo, materials.glassDark);
  domeMesh.position.set(0, towerHeight + 5.2, 0);
  group.add(domeMesh);

  // 10. ARCHITECTURAL ENCLOSED GLASS SKYBRIDGES
  const skybridge1Length = 32;
  const bridge1Geo = new THREE.BoxGeometry(3.6, 3.4, skybridge1Length);
  const bridge1Mesh = new THREE.Mesh(bridge1Geo, materials.glassDark);
  bridge1Mesh.position.set(0, 48, -towerDepth / 2 - skybridge1Length / 2);
  group.add(bridge1Mesh);

  const bridgeDeck1Geo = new THREE.BoxGeometry(3.8, 0.4, skybridge1Length);
  const bridgeDeck1 = new THREE.Mesh(bridgeDeck1Geo, materials.metalDark);
  bridgeDeck1.position.set(0, 46.2, -towerDepth / 2 - skybridge1Length / 2);
  group.add(bridgeDeck1);

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

  let lastCanvasUpdate = -10;

  const update = (time: number) => {
    tipBeacon.scale.setScalar(0.9 + (Math.sin(time * 4) > 0.5 ? 0.35 : 0));
    logoSculpture.rotation.y = time * 0.6;
    agentHoloCore.rotation.y = time * 0.85;
    agentHoloCore.rotation.x = Math.sin(time * 0.5) * 0.3;
    studioGlobe.rotation.y = time * 0.4;

    // Animate all Corporate Employee Agents inside the tower (typing on laptops/PCs, presenting, collaborating)
    for (let i = 0; i < officeAgents.length; i++) {
      const ag = officeAgents[i];
      const t = time * 4.5 + ag.phase;
      if (ag.role === 'typing') {
        ag.leftArm.rotation.x = -0.82 + Math.sin(t * 2.2) * 0.08;
        ag.rightArm.rotation.x = -0.82 + Math.cos(t * 2.2) * 0.08;
        ag.headGroup.rotation.y = Math.sin(t * 0.4) * 0.18;
      } else if (ag.role === 'presenter') {
        ag.rightArm.rotation.x = -1.1 + Math.sin(t * 0.8) * 0.25;
        ag.headGroup.rotation.y = Math.sin(t * 0.5) * 0.35;
      } else if (ag.role === 'collaborating') {
        ag.rightArm.rotation.x = -0.75 + Math.sin(t * 0.9) * 0.18;
        ag.headGroup.rotation.y = Math.cos(t * 0.45) * 0.28;
      } else {
        ag.headGroup.rotation.y = Math.sin(t * 0.3) * 0.12;
      }
    }

    updateLedScreen(time);

    // Refresh GitHub & Presentation Room wall canvases every 0.8s for crisp performance
    if (time - lastCanvasUpdate > 0.8) {
      lastCanvasUpdate = time;
      updateGitHubBoardCanvas(time);
      updatePresentationCanvas(time);
    }
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
    logoSculptureGeo.dispose();
    logoSculptureMat.dispose();
    towerBodyGeo.dispose();
    clearOfficeGlassMat.dispose();
    upperGlassMat.dispose();
    officeFloorMat.dispose();
    oakCarpetMat.dispose();
    ceilingLightMat.dispose();
    glassPartitionMat.dispose();
    ghScreenTex.dispose();
    ghScreenMat.dispose();
    ghBoardTex.dispose();
    presTex.dispose();
    colGeo.dispose();
    spandrelGeo.dispose();
    floorPlateGeo.dispose();
    serverRackGeo.dispose();
    serverRackMat.dispose();
    serverTex.dispose();
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
