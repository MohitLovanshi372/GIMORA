/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { BuildingData } from '../city/types';

export type BuildingEntryTheme =
  | 'corporate'
  | 'tech'
  | 'mall'
  | 'hospital'
  | 'university'
  | 'residential'
  | 'transit';

export interface EntryGateAndRoomOptions {
  title: string;
  subtitle?: string;
  theme: BuildingEntryTheme;
  roomWidth?: number;
  roomHeight?: number;
  roomDepth?: number;
  buildingData?: BuildingData;
}

// Shared materials for high performance across 25+ building entry gates & interior rooms
const sharedFloorMarbleMat = new THREE.MeshBasicMaterial({ color: 0xf1f5f9 });
const sharedCarpetRunnerMat = new THREE.MeshStandardMaterial({
  color: 0x991b1b,
  roughness: 0.75,
  metalness: 0.08,
});
const sharedInteriorWallMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
const sharedAccentWoodMat = new THREE.MeshBasicMaterial({ color: 0x78350f });
const sharedCeilingGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });
const sharedWarmSconceMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
const sharedGateStoneMat = new THREE.MeshStandardMaterial({
  color: 0x1e293b,
  roughness: 0.35,
  metalness: 0.55,
});
const sharedBrassTrimMat = new THREE.MeshStandardMaterial({
  color: 0xd97706,
  roughness: 0.22,
  metalness: 0.88,
});
const sharedSteelFrameMat = new THREE.MeshStandardMaterial({
  color: 0xcbd5e1,
  roughness: 0.25,
  metalness: 0.85,
});
const sharedClearDoorGlassMat = new THREE.MeshPhysicalMaterial({
  color: 0xe0f2fe,
  transparent: true,
  opacity: 0.28,
  roughness: 0.08,
  metalness: 0.1,
});
const sharedSofaLeatherMat = new THREE.MeshStandardMaterial({
  color: 0x334155,
  roughness: 0.45,
  metalness: 0.15,
});
const sharedVelvetChairMat = new THREE.MeshStandardMaterial({
  color: 0x0f766e,
  roughness: 0.55,
  metalness: 0.1,
});
const sharedPlantPotMat = new THREE.MeshStandardMaterial({
  color: 0x475569,
  roughness: 0.5,
  metalness: 0.3,
});
const sharedFoliageMat = new THREE.MeshStandardMaterial({
  color: 0x15803d,
  roughness: 0.6,
  metalness: 0.05,
});
const sharedScreenCyanMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
const sharedScreenEmeraldMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
const sharedScreenAmberMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
const sharedMedicalRedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
const sharedSkinMat = new THREE.MeshStandardMaterial({ color: 0xe8be9e, roughness: 0.55 });
const sharedSuitMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });

function createEntryMarqueeTexture(title: string, subtitle: string, theme: BuildingEntryTheme): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, 512, 128);

  const borderColors: Record<BuildingEntryTheme, string> = {
    corporate: '#f59e0b',
    tech: '#38bdf8',
    mall: '#ec4899',
    hospital: '#ef4444',
    university: '#a855f7',
    residential: '#10b981',
    transit: '#06b6d4',
  };
  const accent = borderColors[theme] || '#38bdf8';

  ctx.strokeStyle = accent;
  ctx.lineWidth = 5;
  ctx.strokeRect(6, 6, 500, 116);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title.toUpperCase().slice(0, 26), 256, 56);

  ctx.fillStyle = accent;
  ctx.font = 'bold 19px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(subtitle.toUpperCase().slice(0, 36), 256, 94);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Builds a complete 3D Architectural Entry Gate Portal + Open Sliding Glass Doors +
 * Brightly Illuminated Ground-Floor Interior Room with Furniture, Receptionist & Decor.
 * Local origin (0, 0, 0) is placed at the building's front exterior facade wall, facing +Z.
 */
export function createBuildingEntryGateAndRoom(
  options: EntryGateAndRoomOptions,
  interactiveMeshes?: THREE.Object3D[]
): THREE.Group {
  const root = new THREE.Group();
  root.name = `entry_gate_and_room_${options.title}`;

  const rw = options.roomWidth || 11.0;
  const rh = options.roomHeight || 4.8;
  const rd = options.roomDepth || 7.2;

  // ============================================================================
  // 1. BRIGHTLY ILLUMINATED 3D INTERIOR ROOM (Recessed inside building / extending slightly forward)
  // ============================================================================
  const roomGroup = new THREE.Group();
  // Positioned so the front glass doorway sits at Z = +0.8 and the interior room extends back to Z = -rd + 0.8
  roomGroup.position.set(0, 0, 0.8);
  root.add(roomGroup);

  // A. Polished Marble / Terrazzo Interior Floor Slab
  const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.16, rd), sharedFloorMarbleMat);
  floorMesh.position.set(0, 0.12, -rd / 2);
  roomGroup.add(floorMesh);

  // Decorative Floor Border Inlay
  const inlayMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(rw - 1.2, rd - 1.2).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xcbd5e1 })
  );
  inlayMesh.position.set(0, 0.21, -rd / 2);
  roomGroup.add(inlayMesh);

  // B. Interior Back Wall & Side Walls (Self-illuminated warm architectural tone so room is vivid from street)
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(rw, rh, 0.25), sharedInteriorWallMat);
  backWall.position.set(0, rh / 2, -rd);
  roomGroup.add(backWall);

  // Warm Wood / Stone Feature Panel on Back Wall
  const featurePanel = new THREE.Mesh(
    new THREE.BoxGeometry(rw * 0.62, rh * 0.76, 0.12),
    sharedAccentWoodMat
  );
  featurePanel.position.set(0, rh * 0.48, -rd + 0.16);
  roomGroup.add(featurePanel);

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, rh, rd), sharedInteriorWallMat);
  leftWall.position.set(-rw / 2, rh / 2, -rd / 2);
  roomGroup.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, rh, rd), sharedInteriorWallMat);
  rightWall.position.set(rw / 2, rh / 2, -rd / 2);
  roomGroup.add(rightWall);

  // C. Warm Recessed Ceiling Coffer Light Panels
  const ceilingSlab = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.2, rd), sharedGateStoneMat);
  ceilingSlab.position.set(0, rh, -rd / 2);
  roomGroup.add(ceilingSlab);

  [-rw * 0.26, 0, rw * 0.26].forEach((lx) => {
    const coffer = new THREE.Mesh(
      new THREE.PlaneGeometry(2.1, rd * 0.72).rotateX(Math.PI / 2),
      sharedCeilingGlowMat
    );
    coffer.position.set(lx, rh - 0.12, -rd / 2);
    roomGroup.add(coffer);
  });

  // ============================================================================
  // 2. RECEPTION / CONCIERGE DESK & 3D RECEPTIONIST HUMAN FIGURE
  // ============================================================================
  const deskGroup = new THREE.Group();
  deskGroup.position.set(0, 0.2, -rd * 0.62);
  roomGroup.add(deskGroup);

  const deskCounter = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.05, 1.1), sharedGateStoneMat);
  deskCounter.position.y = 0.52;
  deskGroup.add(deskCounter);

  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.1, 1.25), sharedBrassTrimMat);
  deskTop.position.y = 1.08;
  deskGroup.add(deskTop);

  // Glowing Front LED Strip on Reception Desk
  const deskLed = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.18), sharedWarmSconceMat);
  deskLed.position.set(0, 0.55, 0.56);
  deskGroup.add(deskLed);

  // Dual Computer Monitors on Reception Desk
  [-0.75, 0.75].forEach((mx) => {
    const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.38, 0.06), sharedScreenCyanMat);
    monitor.position.set(mx, 1.32, 0.1);
    deskGroup.add(monitor);
  });

  // 3D Receptionist Human Figure standing behind the counter
  const staffGroup = new THREE.Group();
  staffGroup.position.set(0, 0, -0.75);
  const staffTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.68, 8), sharedSuitMat);
  staffTorso.position.y = 1.15;
  const staffHead = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), sharedSkinMat);
  staffHead.position.y = 1.64;
  staffGroup.add(staffTorso, staffHead);
  deskGroup.add(staffGroup);

  // ============================================================================
  // 3. THEME-SPECIFIC 3D INTERIOR ROOM FURNITURE & EQUIPMENT
  // ============================================================================
  const theme = options.theme;

  if (theme === 'corporate' || theme === 'residential') {
    // Left Side: Executive Lounge Sofa + Glass Coffee Table
    const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.45, 0.95), sharedSofaLeatherMat);
    sofaBase.position.set(-rw * 0.3, 0.42, -rd * 0.36);
    sofaBase.rotation.y = Math.PI / 2;
    roomGroup.add(sofaBase);

    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.55, 0.22), sharedSofaLeatherMat);
    sofaBack.position.set(-rw * 0.3 - 0.36, 0.75, -rd * 0.36);
    sofaBack.rotation.y = Math.PI / 2;
    roomGroup.add(sofaBack);

    const coffeeTable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.75, 0.42, 16),
      sharedClearDoorGlassMat
    );
    coffeeTable.position.set(-rw * 0.16, 0.41, -rd * 0.36);
    roomGroup.add(coffeeTable);

    // Right Side: Pair of Velvet Lounge Armchairs + Brass Elevator Doors on Back Wall
    [-rd * 0.28, -rd * 0.48].forEach((cz) => {
      const chair = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.75, 0.85), sharedVelvetChairMat);
      chair.position.set(rw * 0.28, 0.55, cz);
      roomGroup.add(chair);
    });

    // Twin Brass Elevator Doors on Back Wall
    [-1.4, 1.4].forEach((ex) => {
      const elevDoor = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.5, 0.08), sharedBrassTrimMat);
      elevDoor.position.set(ex, 1.45, -rd + 0.25);
      roomGroup.add(elevDoor);
    });
  } else if (theme === 'tech') {
    // Center: Illuminated Holographic / Smart Project Table
    const holoPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1, 1.3, 0.85, 16),
      sharedGateStoneMat
    );
    holoPedestal.position.set(-rw * 0.24, 0.62, -rd * 0.36);
    roomGroup.add(holoPedestal);

    const holoTop = new THREE.Mesh(
      new THREE.CylinderGeometry(1.05, 1.05, 0.08, 16),
      sharedScreenCyanMat
    );
    holoTop.position.set(-rw * 0.24, 1.08, -rd * 0.36);
    roomGroup.add(holoTop);

    // 3D Hologram City Cube floating above table
    const holoCube = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), sharedScreenCyanMat);
    holoCube.position.set(-rw * 0.24, 1.65, -rd * 0.36);
    roomGroup.add(holoCube);

    // Right Side: Server Rack Display Alcove & Optical Security Turnstiles
    for (let r = 0; r < 2; r++) {
      const rack = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.4, 0.9), sharedGateStoneMat);
      rack.position.set(rw * 0.32, 1.4, -rd * 0.3 - r * 1.3);
      roomGroup.add(rack);

      const rackLed = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 1.9), sharedScreenEmeraldMat);
      rackLed.rotation.y = -Math.PI / 2;
      rackLed.position.set(rw * 0.32 - 0.46, 1.4, -rd * 0.3 - r * 1.3);
      roomGroup.add(rackLed);
    }
  } else if (theme === 'mall') {
    // Luxury Display Vitrines & Golden Atrium Chandelier
    [-rw * 0.28, rw * 0.28].forEach((vx) => {
      const pedestal = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), sharedFloorMarbleMat);
      pedestal.position.set(vx, 0.75, -rd * 0.35);
      roomGroup.add(pedestal);

      const sculpture = new THREE.Mesh(new THREE.TorusKnotGeometry(0.32, 0.09, 32, 8), sharedBrassTrimMat);
      sculpture.position.set(vx, 1.68, -rd * 0.35);
      roomGroup.add(sculpture);
    });

    const chandelier = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.12, 8, 24).rotateX(Math.PI / 2),
      sharedWarmSconceMat
    );
    chandelier.position.set(0, rh - 0.65, -rd * 0.42);
    roomGroup.add(chandelier);
  } else if (theme === 'hospital') {
    // Glowing Medical Cross on Back Wall + Patient Waiting Chairs
    const medV = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.6, 0.1), sharedMedicalRedMat);
    const medH = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 0.1), sharedMedicalRedMat);
    medV.position.set(0, 3.1, -rd + 0.26);
    medH.position.set(0, 3.1, -rd + 0.26);
    roomGroup.add(medV, medH);

    [-rw * 0.28, rw * 0.28].forEach((wx) => {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.55, 2.4), sharedScreenCyanMat);
      bench.position.set(wx, 0.48, -rd * 0.34);
      roomGroup.add(bench);
    });
  } else if (theme === 'university') {
    // Illuminated Bookshelves along Side Walls + Campus Globe Pedestal
    [-rw / 2 + 0.45, rw / 2 - 0.45].forEach((bx) => {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.2, rd * 0.55), sharedAccentWoodMat);
      shelf.position.set(bx, 1.8, -rd * 0.45);
      roomGroup.add(shelf);
    });

    const globeStand = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.95, 12), sharedBrassTrimMat);
    globeStand.position.set(-rw * 0.22, 0.68, -rd * 0.34);
    const globeOrb = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 14), sharedScreenAmberMat);
    globeOrb.position.set(-rw * 0.22, 1.48, -rd * 0.34);
    roomGroup.add(globeStand, globeOrb);
  } else if (theme === 'transit') {
    // Electronic Train/Flight Departure Board on Back Wall + Turnstiles
    const board = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.3), sharedScreenAmberMat);
    board.position.set(0, 3.2, -rd + 0.26);
    roomGroup.add(board);

    [-1.8, -0.6, 0.6, 1.8].forEach((tx) => {
      const gate = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.95, 1.2), sharedSteelFrameMat);
      gate.position.set(tx, 0.68, -rd * 0.26);
      roomGroup.add(gate);
    });
  }

  // Biophilic Indoor Potted Trees flanking the Interior Room
  [-rw * 0.38, rw * 0.38].forEach((px) => {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.32, 0.65, 10), sharedPlantPotMat);
    pot.position.set(px, 0.52, -rd * 0.18);
    const foliage = new THREE.Mesh(new THREE.SphereGeometry(0.68, 10, 10), sharedFoliageMat);
    foliage.position.set(px, 1.35, -rd * 0.18);
    roomGroup.add(pot, foliage);
  });

  // ============================================================================
  // 4. GRAND ARCHITECTURAL ENTRY GATE PORTAL & OPEN SLIDING GLASS DOORS
  // ============================================================================
  const gateGroup = new THREE.Group();
  gateGroup.position.set(0, 0, 1.2);
  root.add(gateGroup);

  const gateW = rw * 0.86;
  const gateH = rh + 0.4;

  // Twin Sculpted Entry Gate Pillars with Warm Architectural Sconces
  [-gateW / 2, gateW / 2].forEach((gx) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.1, gateH, 1.4), sharedGateStoneMat);
    pillar.position.set(gx, gateH / 2, 0.4);
    pillar.castShadow = true;
    gateGroup.add(pillar);

    // Brushed Brass Pillar Trim
    const trim = new THREE.Mesh(new THREE.BoxGeometry(1.18, gateH * 0.92, 0.25), sharedBrassTrimMat);
    trim.position.set(gx, gateH / 2, 1.05);
    gateGroup.add(trim);

    // Warm Glowing Wall Sconce on Entry Gate Pillar
    const sconce = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.85, 0.18), sharedWarmSconceMat);
    sconce.position.set(gx, 2.6, 1.16);
    gateGroup.add(sconce);
  });

  // Overhead Cantilevered Entry Gate Canopy & Illuminated Building Marquee Sign
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(gateW + 1.8, 0.65, 3.2), sharedGateStoneMat);
  canopy.position.set(0, gateH + 0.15, 0.9);
  canopy.castShadow = true;
  gateGroup.add(canopy);

  const canopyUnderGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(gateW + 0.8, 2.4).rotateX(Math.PI / 2),
    sharedCeilingGlowMat
  );
  canopyUnderGlow.position.set(0, gateH - 0.19, 0.9);
  gateGroup.add(canopyUnderGlow);

  // Marquee Signboard above the Entry Gate
  const defaultSubtitles: Record<BuildingEntryTheme, string> = {
    corporate: 'MAIN ENTRY GATE • EXECUTIVE LOBBY & ROOMS',
    tech: 'SECURITY ENTRY GATE • AI LABS & HUB ATRIUM',
    mall: 'GRAND PROMENADE GATE • BOUTIQUES & DINING',
    hospital: 'MAIN MEDICAL ENTRY • TRIAGE & ICU LOBBY',
    university: 'CAMPUS ENTRY GATE • LECTURE HALL & LIBRARY',
    residential: 'RESIDENTS ENTRY GATE • CONCIERGE LOUNGE',
    transit: 'STATION ENTRY GATE • GRAND CONCOURSE',
  };
  const marqueeTex = createEntryMarqueeTexture(
    options.title,
    options.subtitle || defaultSubtitles[theme],
    theme
  );
  const marqueeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(gateW * 0.82, 1.35),
    new THREE.MeshBasicMaterial({ map: marqueeTex })
  );
  marqueeMesh.position.set(0, gateH + 0.92, 2.52);
  gateGroup.add(marqueeMesh);

  const marqueeBacking = new THREE.Mesh(
    new THREE.BoxGeometry(gateW * 0.84, 1.45, 0.25),
    sharedGateStoneMat
  );
  marqueeBacking.position.set(0, gateH + 0.92, 2.38);
  gateGroup.add(marqueeBacking);

  // Open Automatic Sliding Glass Doors (Parted wide in the center so you can see and walk straight into the room)
  const doorHeight = gateH - 0.5;
  const openGapHalf = 1.95; // 3.9m wide open walk-in/look-in aperture at center!
  const panelW = (gateW - openGapHalf * 2 - 1.0) / 2;

  if (panelW > 0.6) {
    [-1, 1].forEach((side) => {
      const panelX = side * (openGapHalf + panelW / 2);
      const glassPanel = new THREE.Mesh(
        new THREE.BoxGeometry(panelW, doorHeight, 0.1),
        sharedClearDoorGlassMat
      );
      glassPanel.position.set(panelX, doorHeight / 2, 0);
      gateGroup.add(glassPanel);

      // Steel Door Frame & Vertical Push Handle on inner edge of open sliding door
      const innerEdgeX = side * openGapHalf;
      const doorStile = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, doorHeight, 0.16),
        sharedSteelFrameMat
      );
      doorStile.position.set(innerEdgeX, doorHeight / 2, 0);
      gateGroup.add(doorStile);

      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8),
        sharedBrassTrimMat
      );
      handle.position.set(innerEdgeX + side * 0.12, 1.35, 0.14);
      gateGroup.add(handle);
    });
  }

  // VIP Red Carpet / Promenade Entry Runner leading from the street through the open Entry Gate into the Room
  const runnerMesh = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.05, 5.6),
    sharedCarpetRunnerMat
  );
  runnerMesh.position.set(0, 0.22, 0.6);
  gateGroup.add(runnerMesh);

  // Security Gate Bollards flanking the Entrance Walkway
  [-2.6, 2.6].forEach((bx) => {
    const bollard = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.16, 0.95, 10),
      sharedBrassTrimMat
    );
    bollard.position.set(bx, 0.48, 2.8);
    gateGroup.add(bollard);

    const bollardCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 8),
      sharedWarmSconceMat
    );
    bollardCap.position.set(bx, 1.0, 2.8);
    gateGroup.add(bollardCap);
  });

  // Register interactive meshes so clicking the Entry Gate or Interior Room selects/opens the building
  if (options.buildingData && interactiveMeshes) {
    canopy.userData = { buildingData: options.buildingData, isEntryGate: true };
    backWall.userData = { buildingData: options.buildingData, isEntryGate: true };
    deskCounter.userData = { buildingData: options.buildingData, isEntryGate: true };
    interactiveMeshes.push(canopy, backWall, deskCounter);
  }

  return root;
}
