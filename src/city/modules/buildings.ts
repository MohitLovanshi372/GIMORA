/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { BuildingData, DistrictId } from '../types';

export interface BuildingsSystem {
  group: THREE.Group;
  interactiveMeshes: THREE.Object3D[];
  billboardMaterials: THREE.MeshBasicMaterial[];
  update: (time: number) => void;
  dispose: () => void;
}

export function createCityBuildings(scene: THREE.Scene): BuildingsSystem {
  const group = new THREE.Group();
  group.name = 'buildings_system';

  const interactiveMeshes: THREE.Object3D[] = [];
  const billboardMaterials: THREE.MeshBasicMaterial[] = [];

  // 1. Procedural Window Canvas Texture
  const createWindowTexture = (districtTint: string = '#00f0ff') => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Dark building facade
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cols = 8;
    const rows = 32;
    const padX = 6;
    const padY = 4;
    const winW = (canvas.width - padX * (cols + 1)) / cols;
    const winH = (canvas.height - padY * (rows + 1)) / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const rand = Math.random();
        if (rand > 0.45) {
          if (rand > 0.85) {
            ctx.fillStyle = districtTint;
          } else if (rand > 0.7) {
            ctx.fillStyle = '#ffaa00'; // warm ambient office light
          } else {
            ctx.fillStyle = '#e2e8f0'; // crisp white office light
          }
          ctx.fillRect(
            padX + c * (winW + padX),
            padY + r * (winH + padY),
            winW,
            winH
          );
        }
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  };

  const downtownWinTex = createWindowTexture('#00f0ff');
  const techWinTex = createWindowTexture('#00ffaa');
  const eduWinTex = createWindowTexture('#a855f7');
  const healthWinTex = createWindowTexture('#38bdf8');
  const resWinTex = createWindowTexture('#fbbf24');
  const entWinTex = createWindowTexture('#f43f5e');

  // Shared Core Materials
  const glassFacadeMat = new THREE.MeshPhysicalMaterial({
    color: 0x050c18,
    metalness: 0.85,
    roughness: 0.15,
    reflectivity: 0.9,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
  });

  const neonCyanLineMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
  const neonPinkLineMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
  const neonPurpleLineMat = new THREE.MeshBasicMaterial({ color: 0x9333ea });
  const neonAmberLineMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const neonGreenLineMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });

  // 2. Procedural Digital Billboards with Animated Canvas
  const createAnimatedBillboard = (
    textLine1: string,
    textLine2: string,
    brandColor: string,
    accentColor: string
  ) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
    billboardMaterials.push(mat);

    const render = (time: number) => {
      // Dark cyber background
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Glowing border
      ctx.strokeStyle = brandColor;
      ctx.lineWidth = 10;
      ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

      // Scanline animation effect
      const scanY = (time * 80) % canvas.height;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(0, scanY, canvas.width, 30);

      // Brand Title
      ctx.font = 'bold 44px "Chakra Petch", monospace';
      ctx.fillStyle = brandColor;
      ctx.textAlign = 'center';
      ctx.fillText(textLine1, canvas.width / 2, 95);

      // Sub-line with subtle flicker
      const flicker = Math.sin(time * 12) > 0.8 ? 0.4 : 1.0;
      ctx.globalAlpha = flicker;
      ctx.font = '28px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = accentColor;
      ctx.fillText(textLine2, canvas.width / 2, 160);
      ctx.globalAlpha = 1.0;

      // Bottom bar ticker
      ctx.fillStyle = brandColor;
      ctx.fillRect(20, 200, canvas.width - 40, 8);

      tex.needsUpdate = true;
    };

    return { mat, render };
  };

  const billboard1 = createAnimatedBillboard('CYBER DYNAMICS', 'NEXT-GEN QUANTUM CORES', '#00f0ff', '#38bdf8');
  const billboard2 = createAnimatedBillboard('NEON METROPOLIS', 'THE AUTONOMOUS SMART CITY', '#ff007f', '#f43f5e');
  const billboard3 = createAnimatedBillboard('NEXUS AI SYSTEMS', 'GLOBAL NEURAL NETWORK', '#00ffaa', '#10b981');
  const billboard4 = createAnimatedBillboard('SYNTHWAVE STAGE', 'LIVE HOLOGRAPHIC CONCERTS', '#a855f7', '#c084fc');

  // Helper to build a detailed skyscraper
  const createDetailedBuilding = (
    data: BuildingData,
    options: {
      accentColor: THREE.ColorRepresentation;
      windowTex: THREE.Texture;
      hasSpire?: boolean;
      hasHelipad?: boolean;
      hasBillboard?: { mat: THREE.MeshBasicMaterial; width: number; height: number };
      hasSkybridge?: boolean;
    }
  ) => {
    const bldgGroup = new THREE.Group();
    bldgGroup.position.set(data.position[0], 0, data.position[2]);

    const [w, h, d] = data.dimensions;

    // Main tower body
    const bodyGeo = new THREE.BoxGeometry(w, h, d);
    // Material with procedural window mapping
    const bldgMat = new THREE.MeshStandardMaterial({
      color: 0x070c18,
      metalness: 0.8,
      roughness: 0.25,
      map: options.windowTex,
    });
    // scale texture repeating based on building height
    options.windowTex.repeat.set(Math.max(1, Math.floor(w / 8)), Math.max(2, Math.floor(h / 12)));

    const bodyMesh = new THREE.Mesh(bodyGeo, bldgMat);
    bodyMesh.position.y = h / 2;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bldgGroup.add(bodyMesh);

    // Glowing Neon Edges
    const edgesGeo = new THREE.EdgesGeometry(bodyGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: options.accentColor,
      linewidth: 1.5,
    });
    const edges = new THREE.LineSegments(edgesGeo, edgesMat);
    edges.position.y = h / 2;
    bldgGroup.add(edges);

    // Rooftop mechanical crown
    const crownH = Math.min(6, h * 0.08);
    const crownGeo = new THREE.BoxGeometry(w * 0.75, crownH, d * 0.75);
    const crownMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.9, roughness: 0.4 });
    const crownMesh = new THREE.Mesh(crownGeo, crownMat);
    crownMesh.position.y = h + crownH / 2;
    crownMesh.castShadow = true;
    bldgGroup.add(crownMesh);

    // Rooftop Spire / Antenna
    if (options.hasSpire) {
      const spireH = h * 0.22;
      const spireGeo = new THREE.ConeGeometry(0.8, spireH, 6);
      const spireMat = new THREE.MeshStandardMaterial({ color: 0x374151, metalness: 0.9 });
      const spireMesh = new THREE.Mesh(spireGeo, spireMat);
      spireMesh.position.y = h + crownH + spireH / 2;
      spireMesh.castShadow = true;
      bldgGroup.add(spireMesh);

      // Glowing tip beacon
      const tipGeo = new THREE.SphereGeometry(0.6, 8, 8);
      const tipMat = new THREE.MeshBasicMaterial({ color: options.accentColor });
      const tipMesh = new THREE.Mesh(tipGeo, tipMat);
      tipMesh.position.y = h + crownH + spireH;
      bldgGroup.add(tipMesh);
    }

    // Helipad
    if (options.hasHelipad) {
      const padGeo = new THREE.CylinderGeometry(w * 0.35, w * 0.35, 0.4, 16);
      const padMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.7 });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.y = h + crownH + 0.2;
      bldgGroup.add(pad);

      // Helipad glowing yellow ring
      const ringGeo = new THREE.RingGeometry(w * 0.28, w * 0.32, 16);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = h + crownH + 0.45;
      bldgGroup.add(ring);
    }

    // Digital Billboard
    if (options.hasBillboard) {
      const bbGeo = new THREE.PlaneGeometry(options.hasBillboard.width, options.hasBillboard.height);
      const bbMesh = new THREE.Mesh(bbGeo, options.hasBillboard.mat);
      bbMesh.position.set(0, h * 0.65, d / 2 + 0.2);
      bldgGroup.add(bbMesh);
    }

    // Attach metadata for raycasting on the main body
    bodyMesh.userData = { buildingData: data };
    interactiveMeshes.push(bodyMesh);

    group.add(bldgGroup);
  };

  // 3. PROMINENT DISTRICT BUILDINGS REGISTRY
  const landmarkBuildings: { data: BuildingData; opts: any }[] = [
    // --- DOWNTOWN DISTRICT ---
    {
      data: {
        id: 'bldg-apex-tower',
        name: 'Apex Celestial Tower',
        districtId: 'downtown',
        districtName: 'Downtown District',
        category: 'Skyscraper',
        height: 155,
        floors: 52,
        position: [-100, 0, -40],
        dimensions: [22, 155, 22],
        powerUsage: '14.2 MW (Clean Geothermal)',
        occupancy: '98% (12,400 Employees)',
        networkStatus: 'Hyper-Band Optical Grid 100%',
        description: 'The monumental pinnacle of Neon AI City downtown. Houses global AI financial trusts, neural computation nodes, and the executive city oversight chamber.',
      },
      opts: {
        accentColor: 0x00f0ff,
        windowTex: downtownWinTex,
        hasSpire: true,
        hasBillboard: { mat: billboard1.mat, width: 18, height: 10 },
      },
    },
    {
      data: {
        id: 'bldg-horizon-spire',
        name: 'Horizon Suncore Monolith',
        districtId: 'downtown',
        districtName: 'Downtown District',
        category: 'Skyscraper',
        height: 138,
        floors: 46,
        position: [-140, 0, 40],
        dimensions: [20, 138, 20],
        powerUsage: '11.8 MW',
        occupancy: '94% (9,800 Employees)',
        networkStatus: 'Quantum Mesh Synchronized',
        description: 'Ultra-modern glass and titanium monolith dominating the west downtown avenue. Features holographic sky-decks and autonomous drone docks.',
      },
      opts: {
        accentColor: 0x38bdf8,
        windowTex: downtownWinTex,
        hasSpire: true,
        hasHelipad: true,
      },
    },
    {
      data: {
        id: 'bldg-lumina-plaza',
        name: 'Lumina Corporate Nexus',
        districtId: 'downtown',
        districtName: 'Downtown District',
        category: 'Skyscraper',
        height: 110,
        floors: 36,
        position: [-140, 0, -40],
        dimensions: [24, 110, 24],
        powerUsage: '8.4 MW',
        occupancy: '91% (7,500 Occupants)',
        networkStatus: 'Neural Relay Active',
        description: 'Downtown corporate operations hub with multi-tiered sky gardens and automated municipal data processing centers.',
      },
      opts: {
        accentColor: 0x00f0ff,
        windowTex: downtownWinTex,
        hasSpire: false,
      },
    },

    // --- TECHNOLOGY DISTRICT ---
    {
      data: {
        id: 'bldg-quantum-neural',
        name: 'Quantum Core Supercomputing Lab',
        districtId: 'technology',
        districtName: 'Technology District',
        category: 'Research Pod',
        height: 125,
        floors: 40,
        position: [100, 0, -120],
        dimensions: [24, 125, 24],
        powerUsage: '28.5 MW (Liquid Nitrogen Cooled)',
        occupancy: '89% (5,400 Quantum Researchers)',
        networkStatus: 'Sub-Millisecond Neural Mesh',
        description: 'The core brain of the technology sector. Houses terabit optical processors, AI training clusters, and cybernetic simulation vaults.',
      },
      opts: {
        accentColor: 0x00ffaa,
        windowTex: techWinTex,
        hasSpire: true,
        hasBillboard: { mat: billboard3.mat, width: 20, height: 10 },
      },
    },
    {
      data: {
        id: 'bldg-cyber-dynamics',
        name: 'Cyber Dynamics Robotics Spire',
        districtId: 'technology',
        districtName: 'Technology District',
        category: 'Research Pod',
        height: 105,
        floors: 34,
        position: [180, 0, -80],
        dimensions: [20, 105, 20],
        powerUsage: '16.2 MW',
        occupancy: '95% (4,800 Engineers)',
        networkStatus: 'Autonomous Grid Linked',
        description: 'Advanced automated robotics design center developing humanoid maintenance units and urban air mobility drones.',
      },
      opts: {
        accentColor: 0x10b981,
        windowTex: techWinTex,
        hasSpire: true,
      },
    },

    // --- EDUCATION DISTRICT ---
    {
      data: {
        id: 'bldg-cyber-academy',
        name: 'Omni Cyber Academy & Holographic Institute',
        districtId: 'education',
        districtName: 'Education District',
        category: 'Academy',
        height: 95,
        floors: 30,
        position: [-180, 0, -160],
        dimensions: [26, 95, 26],
        powerUsage: '6.7 MW (Solar Shielded)',
        occupancy: '100% (14,200 Students & AI Tutors)',
        networkStatus: 'Universal Knowledge Uplink Active',
        description: 'Premier cybernetic learning campus equipped with immersive neural classroom chambers, interactive holographic archives, and bio-engineering labs.',
      },
      opts: {
        accentColor: 0xa855f7,
        windowTex: eduWinTex,
        hasSpire: true,
      },
    },
    {
      data: {
        id: 'bldg-quantum-archives',
        name: 'Quantum Planetary Data Archive',
        districtId: 'education',
        districtName: 'Education District',
        category: 'Academy',
        height: 75,
        floors: 24,
        position: [-100, 0, -220],
        dimensions: [22, 75, 22],
        powerUsage: '5.1 MW',
        occupancy: '82% (3,100 Researchers)',
        networkStatus: 'Immutable Distributed Ledger',
        description: 'A subterranean and surface knowledge repository preserving human and machine civilizational data in crystal optical storage.',
      },
      opts: {
        accentColor: 0xc084fc,
        windowTex: eduWinTex,
      },
    },

    // --- HEALTHCARE DISTRICT ---
    {
      data: {
        id: 'bldg-neo-biomedical',
        name: 'Neo-Genesis Medical Citadel',
        districtId: 'healthcare',
        districtName: 'Healthcare District',
        category: 'Medical Tower',
        height: 115,
        floors: 38,
        position: [-180, 0, 160],
        dimensions: [26, 115, 26],
        powerUsage: '12.4 MW (Dedicated Redundant Grid)',
        occupancy: '93% (6,200 Medical Specialists)',
        networkStatus: 'Emergency Bio-Telemetry Active',
        description: 'Advanced nanomedicine and robotic surgery mega-hospital. Features trauma rooftop helipads, regenerative therapy pods, and AI diagnostic centers.',
      },
      opts: {
        accentColor: 0x06b6d4,
        windowTex: healthWinTex,
        hasHelipad: true,
        hasSpire: true,
      },
    },
    {
      data: {
        id: 'bldg-bio-pharma-pod',
        name: 'Aegis Bio-Research Pavilion',
        districtId: 'healthcare',
        districtName: 'Healthcare District',
        category: 'Medical Tower',
        height: 85,
        floors: 26,
        position: [-100, 0, 220],
        dimensions: [22, 85, 22],
        powerUsage: '7.8 MW',
        occupancy: '88% (3,400 Scientists)',
        networkStatus: 'Bio-Secure Network 100%',
        description: 'Specialized genomic therapy center and pharmaceutical synthesis laboratories engineered for cellular rejuvenation research.',
      },
      opts: {
        accentColor: 0x38bdf8,
        windowTex: healthWinTex,
      },
    },

    // --- RESIDENTIAL DISTRICT ---
    {
      data: {
        id: 'bldg-neo-habitat-alpha',
        name: 'Sky-Terrace Habitat Alpha',
        districtId: 'residential',
        districtName: 'Residential District',
        category: 'Neo-Habitat',
        height: 102,
        floors: 35,
        position: [180, 0, 160],
        dimensions: [24, 102, 24],
        powerUsage: '9.3 MW',
        occupancy: '99% (8,200 Residents)',
        networkStatus: 'Smart Home Mesh 100%',
        description: 'Eco-futuristic residential high-rise with personal aerocar parking balconies, vertical hydroponic gardens, and smart atmospheric climate systems.',
      },
      opts: {
        accentColor: 0xf59e0b,
        windowTex: resWinTex,
      },
    },
    {
      data: {
        id: 'bldg-neo-habitat-beta',
        name: 'Aurora Modular Living Complex',
        districtId: 'residential',
        districtName: 'Residential District',
        category: 'Neo-Habitat',
        height: 88,
        floors: 30,
        position: [100, 0, 220],
        dimensions: [22, 88, 22],
        powerUsage: '7.6 MW',
        occupancy: '96% (6,900 Residents)',
        networkStatus: 'Smart Home Mesh 100%',
        description: 'Modular living habitats with customizable room layouts, automated recycling chutes, and shared cybernetic fitness pods.',
      },
      opts: {
        accentColor: 0xfbbf24,
        windowTex: resWinTex,
      },
    },

    // --- ENTERTAINMENT DISTRICT ---
    {
      data: {
        id: 'bldg-synthwave-megaplex',
        name: 'Vortex Holographic Megaplex',
        districtId: 'entertainment',
        districtName: 'Entertainment District',
        category: 'Entertainment Megaplex',
        height: 92,
        floors: 28,
        position: [0, 0, 220],
        dimensions: [28, 92, 24],
        powerUsage: '18.9 MW (High-Density Holograms)',
        occupancy: '97% (18,000 Visitors Nightly)',
        networkStatus: 'Ultra-HD Holocast 8K',
        description: 'The pulsing heart of the night entertainment strip. Features 360-degree holographic music stadiums, cyber-lounges, and neon sky-clubs.',
      },
      opts: {
        accentColor: 0xff007f,
        windowTex: entWinTex,
        hasBillboard: { mat: billboard2.mat, width: 24, height: 12 },
        hasSpire: true,
      },
    },
    {
      data: {
        id: 'bldg-neon-arcade',
        name: 'Cyberpunk Neon Palace',
        districtId: 'entertainment',
        districtName: 'Entertainment District',
        category: 'Entertainment Megaplex',
        height: 72,
        floors: 22,
        position: [-45, 0, 240],
        dimensions: [20, 72, 20],
        powerUsage: '12.1 MW',
        occupancy: '92% (9,400 Visitors)',
        networkStatus: 'Virtual Simulation Ready',
        description: 'Multi-level virtual reality battle arenas, retro-synth gaming towers, and rooftop neon cocktail observatories.',
      },
      opts: {
        accentColor: 0xa855f7,
        windowTex: entWinTex,
        hasBillboard: { mat: billboard4.mat, width: 16, height: 8 },
      },
    },

    // --- INDUSTRIAL DISTRICT ---
    {
      data: {
        id: 'bldg-geothermal-plant',
        name: 'Vulcan Geothermal Energy Hub',
        districtId: 'industrial',
        districtName: 'Industrial District',
        category: 'Power Plant',
        height: 55,
        floors: 14,
        position: [-220, 0, 0],
        dimensions: [32, 55, 32],
        powerUsage: 'Produces +450 MW Surplus',
        occupancy: '99% Automated / 450 Technicians',
        networkStatus: 'Industrial SCADA Core Secure',
        description: 'Deep-bore geothermal reactor powering the city grid with zero emissions. Emits soft illuminated steam vapor from twin cooling pylons.',
      },
      opts: {
        accentColor: 0xf59e0b,
        windowTex: downtownWinTex,
        hasSpire: true,
      },
    },

    // --- CENTRAL RAILWAY DISTRICT ---
    {
      data: {
        id: 'bldg-central-maglev-terminal',
        name: 'Hyper-Rail Central Grand Terminal',
        districtId: 'railway',
        districtName: 'Central Railway District',
        category: 'Transit Hub',
        height: 60,
        floors: 16,
        position: [0, 0, -220],
        dimensions: [36, 60, 48],
        powerUsage: '22.0 MW (Maglev Superconductors)',
        occupancy: '95% (45,000 Commuters / Hour)',
        networkStatus: 'Global Transit Dispatch Online',
        description: 'Grand central terminal connecting continental hyperloop lines and city elevated monorails. Arched glass canopy with magnetic guidance guideways.',
      },
      opts: {
        accentColor: 0x3b82f6,
        windowTex: downtownWinTex,
        hasSpire: true,
      },
    },
  ];

  // Build each landmark building
  landmarkBuildings.forEach((item) => {
    createDetailedBuilding(item.data, item.opts);
  });

  // 4. INSTANCED CITY MID-RISE & SMALL BUILDINGS (High Performance Urban Density)
  // Fill the grid blocks between avenues with 90+ procedural mid-rise structures
  const fillerCount = 90;
  const fillerGeo = new THREE.BoxGeometry(1, 1, 1);
  const fillerMat = new THREE.MeshStandardMaterial({
    color: 0x091122,
    metalness: 0.75,
    roughness: 0.35,
    map: downtownWinTex,
  });

  const instancedFiller = new THREE.InstancedMesh(fillerGeo, fillerMat, fillerCount);
  instancedFiller.castShadow = true;
  instancedFiller.receiveShadow = true;

  const dummy = new THREE.Object3D();
  let fIdx = 0;

  // Grid coordinates for filler blocks
  const xSectors = [-200, -160, -120, -80, 80, 120, 160, 200];
  const zSectors = [-200, -140, -100, -60, 60, 100, 140, 200];

  for (const bx of xSectors) {
    for (const bz of zSectors) {
      // Check collision with rivers and existing landmarks
      if (Math.abs(bx) < 35) continue; // keep river clear
      if (Math.abs(bx - 140) < 25 && Math.abs(bz - -80) < 25) continue; // keep MOHIT DEVELOPER HUB clear
      if (Math.abs(bx - -68) < 30 && Math.abs(bz) < 50) continue; // keep Central Park clear
      if (Math.abs(bx - 68) < 25 && Math.abs(bz - -80) < 35) continue; // keep Tech Park clear

      if (fIdx < fillerCount) {
        const h = 30 + (Math.sin(bx * 0.05 + bz * 0.07) * 0.5 + 0.5) * 45;
        const w = 14 + (Math.cos(bx) * 0.5 + 0.5) * 6;
        const d = 14 + (Math.sin(bz) * 0.5 + 0.5) * 6;

        dummy.position.set(bx, h / 2, bz);
        dummy.scale.set(w, h, d);
        dummy.updateMatrix();
        instancedFiller.setMatrixAt(fIdx, dummy.matrix);
        fIdx++;
      }
    }
  }

  instancedFiller.instanceMatrix.needsUpdate = true;
  group.add(instancedFiller);

  scene.add(group);

  const update = (time: number) => {
    // Animate digital billboards
    billboard1.render(time);
    billboard2.render(time);
    billboard3.render(time);
    billboard4.render(time);
  };

  const dispose = () => {
    scene.remove(group);
    fillerGeo.dispose();
    fillerMat.dispose();
    glassFacadeMat.dispose();
    downtownWinTex.dispose();
    techWinTex.dispose();
    eduWinTex.dispose();
    healthWinTex.dispose();
    resWinTex.dispose();
    entWinTex.dispose();
    neonCyanLineMat.dispose();
    neonPinkLineMat.dispose();
    neonPurpleLineMat.dispose();
    neonAmberLineMat.dispose();
    neonGreenLineMat.dispose();
  };

  return {
    group,
    interactiveMeshes,
    billboardMaterials,
    update,
    dispose,
  };
}
