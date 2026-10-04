/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { BuildingData } from '../city/types';
import { CityMaterials } from '../assets/materials';
import { createProceduralWindowTexture, createDigitalBillboardTexture } from '../assets/textures';
import { createMohitDeveloperHub, MohitHubSystem } from './MohitDeveloperHub';
import { createEducationDistrict, EducationDistrictSystem } from './EducationDistrict';
import { createHealthcareDistrict, HealthcareDistrictSystem } from './HealthcareDistrict';
import { WindowMaterialEntry } from '../simulation/CityLifeManager';

export interface BuildingsManagerSystem {
  group: THREE.Group;
  allBuildingsData: BuildingData[];
  interactiveMeshes: THREE.Object3D[];
  mohitHub: MohitHubSystem;
  educationDistrict: EducationDistrictSystem;
  healthcareDistrict: HealthcareDistrictSystem;
  windowMaterials: WindowMaterialEntry[];
  update: (time: number) => void;
  dispose: () => void;
}

export function createBuildingsManager(
  scene: THREE.Scene,
  materials: CityMaterials
): BuildingsManagerSystem {
  const group = new THREE.Group();
  group.name = 'buildings_manager';

  const allBuildingsData: BuildingData[] = [];
  const interactiveMeshes: THREE.Object3D[] = [];
  const windowMaterials: WindowMaterialEntry[] = [];

  // Window textures
  const downtownWinTex = createProceduralWindowTexture('#00f0ff', 8, 32);
  const techWinTex = createProceduralWindowTexture('#00ffaa', 8, 28);
  const resWinTex = createProceduralWindowTexture('#fbbf24', 8, 28);
  const entWinTex = createProceduralWindowTexture('#f43f5e', 8, 24);

  // Digital Billboards
  const bb1 = createDigitalBillboardTexture('CYBER DYNAMICS', 'QUANTUM CORES & NEURAL BUS', '#00f0ff', '#38bdf8');
  const bb2 = createDigitalBillboardTexture('NEON METROPOLIS', 'AUTONOMOUS SMART CITY 2099', '#ff007f', '#f43f5e');
  const bb3 = createDigitalBillboardTexture('NEXUS AI SYSTEMS', 'GLOBAL NEURAL NETWORK v9', '#00ffaa', '#10b981');
  const bb4 = createDigitalBillboardTexture('SYNTHWAVE STAGE', 'LIVE HOLOGRAPHIC CONCERTS', '#a855f7', '#c084fc');

  // 1. INSTANTIATE SUB-DISTRICTS
  // A. MOHIT DEVELOPER HUB HEADQUARTERS
  const mohitHub = createMohitDeveloperHub(scene, materials);
  allBuildingsData.push(mohitHub.buildingData);
  interactiveMeshes.push(...mohitHub.interactiveMeshes);

  // B. EDUCATION DISTRICT (University, Engineering College, School, Library, Research, Hostel, Lab)
  const educationDistrict = createEducationDistrict(scene, materials);
  allBuildingsData.push(...educationDistrict.buildingsData);
  interactiveMeshes.push(...educationDistrict.interactiveMeshes);

  // C. HEALTHCARE DISTRICT (Smart Hospital, Emergency Center, Pharmacy, Ambulance Bay, Helipad, Research)
  const healthcareDistrict = createHealthcareDistrict(scene, materials);
  allBuildingsData.push(...healthcareDistrict.buildingsData);
  interactiveMeshes.push(...healthcareDistrict.interactiveMeshes);

  // 2. DETAILED DOWNTOWN, ENTERTAINMENT, RESIDENTIAL & INDUSTRIAL TOWERS
  const landmarkConfigs: { data: BuildingData; opts: any }[] = [
    // --- DOWNTOWN ---
    {
      data: {
        id: 'bldg-apex-tower',
        name: 'Apex Celestial Tower',
        districtId: 'downtown',
        districtName: 'Neon Downtown',
        category: 'Skyscraper',
        height: 155,
        floors: 52,
        position: [-100, 0, -40],
        dimensions: [22, 155, 22],
        powerUsage: '14.2 MW (Clean Geothermal)',
        occupancy: '98% (12,400 Employees)',
        networkStatus: 'Hyper-Band Optical Grid 100%',
        description: 'The monumental pinnacle of Neon Downtown. Houses global AI financial institutions, neural computation nodes, and the executive city oversight chamber.',
        features: ['Rooftop Spire Beacon', 'High-Speed Aerocar Docks', 'Digital Mega-Billboard'],
      },
      opts: {
        accentColor: 0x00f0ff,
        windowTex: downtownWinTex,
        hasSpire: true,
        billboard: { tex: bb1.texture, width: 18, height: 10 },
      },
    },
    {
      data: {
        id: 'bldg-horizon-spire',
        name: 'Horizon Suncore Monolith',
        districtId: 'downtown',
        districtName: 'Neon Downtown',
        category: 'Skyscraper',
        height: 138,
        floors: 46,
        position: [-140, 0, 40],
        dimensions: [20, 138, 20],
        powerUsage: '11.8 MW',
        occupancy: '94% (9,800 Employees)',
        networkStatus: 'Quantum Mesh Synchronized',
        description: 'Ultra-modern glass and titanium monolith dominating the west downtown avenue. Features holographic sky-decks and autonomous drone docks.',
        features: ['Rooftop Helipad', 'Dual Spire Antennas', 'Glass Observation Deck'],
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
        districtName: 'Neon Downtown',
        category: 'Skyscraper',
        height: 110,
        floors: 36,
        position: [-140, 0, -40],
        dimensions: [24, 110, 24],
        powerUsage: '8.4 MW',
        occupancy: '91% (7,500 Occupants)',
        networkStatus: 'Neural Relay Active',
        description: 'Downtown corporate operations hub with multi-tiered sky gardens and automated municipal data processing centers.',
        features: ['Tiered Sky Gardens', 'Solar Louvers', 'Municipal AI Node'],
      },
      opts: {
        accentColor: 0x00f0ff,
        windowTex: downtownWinTex,
      },
    },

    // --- TECHNOLOGY DISTRICT PEERS ---
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
        description: 'Superconducting quantum computing laboratory housing terabit optical processors, AI training clusters, and cybernetic simulation vaults adjacent to Mohit Developer Hub.',
        features: ['Cryogenic Cooling Stacks', 'Quantum Processor Vaults', 'Digital Billboard'],
      },
      opts: {
        accentColor: 0x00ffaa,
        windowTex: techWinTex,
        hasSpire: true,
        billboard: { tex: bb3.texture, width: 20, height: 10 },
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
        features: ['Drone Flight Tunnel', 'Robotic Fab Floor', 'Radar Array'],
      },
      opts: {
        accentColor: 0x10b981,
        windowTex: techWinTex,
        hasSpire: true,
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
        features: ['Balcony Sky-Terraces', 'Vertical Hydroponics', 'Smart Climate Systems'],
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
        features: ['Custom Modular Units', 'Community Social Deck', 'Automated Recyclers'],
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
        features: ['360° Holo-Stadium', 'Mega Digital Billboard', 'Skyline Cocktail Lounge'],
      },
      opts: {
        accentColor: 0xff007f,
        windowTex: entWinTex,
        hasSpire: true,
        billboard: { tex: bb2.texture, width: 24, height: 12 },
      },
    },
    {
      data: {
        id: 'bldg-neon-arcade',
        name: 'Cyberpunk Neon Palace & VR Arena',
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
        features: ['VR Battle Simulators', 'Retro Arcade Floors', 'Rooftop Neon Dome'],
      },
      opts: {
        accentColor: 0xa855f7,
        windowTex: entWinTex,
        billboard: { tex: bb4.texture, width: 16, height: 8 },
      },
    },

    // --- INDUSTRIAL DISTRICT ---
    {
      data: {
        id: 'bldg-geothermal-plant',
        name: 'Vulcan Geothermal Energy Citadel',
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
        description: 'Deep-bore geothermal reactor powering the entire metropolis with zero carbon emissions. Twin cooling pylons emit soft steam rings.',
        features: ['Subterranean Magma Tunnels', 'Twin Cooling Pylons', '+450 MW Surplus Generation'],
      },
      opts: {
        accentColor: 0xf59e0b,
        windowTex: downtownWinTex,
        hasSpire: true,
      },
    },
  ];

  // Helper to build a detailed skyscraper
  const createDetailedTower = (item: { data: BuildingData; opts: any }) => {
    const { data, opts } = item;
    const bldgGroup = new THREE.Group();
    bldgGroup.position.set(data.position[0], 0, data.position[2]);

    const [w, h, d] = data.dimensions;
    const bodyGeo = new THREE.BoxGeometry(w, h, d);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x070d18,
      metalness: 0.85,
      roughness: 0.25,
      map: opts.windowTex,
      emissiveMap: opts.windowTex,
      emissive: new THREE.Color(opts.accentColor || 0x00f0ff),
      emissiveIntensity: 2.0,
    });
    opts.windowTex.repeat.set(Math.max(1, Math.floor(w / 8)), Math.max(2, Math.floor(h / 12)));

    bodyMat.userData = {
      isWindowMaterial: true,
      district: data.districtId,
      baseColor: opts.accentColor || 0x00f0ff,
    };
    windowMaterials.push({
      material: bodyMat,
      district: data.districtId,
      baseColor: new THREE.Color(opts.accentColor || 0x00f0ff),
    });

    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = h / 2;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bldgGroup.add(bodyMesh);

    // Glowing Neon Edges
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(bodyGeo),
      new THREE.LineBasicMaterial({ color: opts.accentColor })
    );
    edges.position.y = h / 2;
    bldgGroup.add(edges);

    // Mechanical Rooftop Crown
    const crownH = Math.min(6, h * 0.08);
    const crown = new THREE.Mesh(new THREE.BoxGeometry(w * 0.75, crownH, d * 0.75), materials.metalDark);
    crown.position.y = h + crownH / 2;
    bldgGroup.add(crown);

    // Rooftop Spire
    if (opts.hasSpire) {
      const spireH = h * 0.22;
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.8, spireH, 6), materials.metalLight);
      spire.position.y = h + crownH + spireH / 2;
      bldgGroup.add(spire);

      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 8), new THREE.MeshBasicMaterial({ color: opts.accentColor }));
      tip.position.y = h + crownH + spireH;
      bldgGroup.add(tip);
    }

    // Helipad
    if (opts.hasHelipad) {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.35, w * 0.35, 0.4, 16), materials.metalDark);
      pad.position.y = h + crownH + 0.2;
      bldgGroup.add(pad);

      const ring = new THREE.Mesh(new THREE.RingGeometry(w * 0.28, w * 0.32, 16).rotateX(-Math.PI / 2), materials.neonAmber);
      ring.position.y = h + crownH + 0.45;
      bldgGroup.add(ring);
    }

    // Digital Billboard
    if (opts.billboard) {
      const bb = new THREE.Mesh(
        new THREE.PlaneGeometry(opts.billboard.width, opts.billboard.height),
        new THREE.MeshBasicMaterial({ map: opts.billboard.tex, side: THREE.DoubleSide })
      );
      bb.position.set(0, h * 0.65, d / 2 + 0.2);
      bldgGroup.add(bb);
    }

    // ROOFTOP STRUCTURES: HVAC chillers, satellite dishes, antenna poles
    const hvac = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.8, 3.5), materials.metalLight);
    hvac.position.set(-w * 0.2, h + crownH + 0.9, -d * 0.2);
    bldgGroup.add(hvac);

    const dish = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.3, 12), materials.metalLight);
    dish.position.set(w * 0.2, h + crownH + 1.2, d * 0.2);
    dish.rotation.x = Math.PI / 3;
    bldgGroup.add(dish);

    bodyMesh.userData = { buildingData: data };
    interactiveMeshes.push(bodyMesh);
    allBuildingsData.push(data);
    group.add(bldgGroup);
  };

  landmarkConfigs.forEach(createDetailedTower);

  // 3. MULTI-DISTRICT HIGH-DENSITY FILLER SKYSCRAPERS & ROOFTOP STRUCTURES
  const fillerGeo = new THREE.BoxGeometry(1, 1, 1);
  const hvacGeo = new THREE.BoxGeometry(1, 1, 1);

  // A. Downtown Tower Material (Cyan)
  const dtFillerMat = new THREE.MeshStandardMaterial({
    color: 0x070e1c,
    metalness: 0.8,
    roughness: 0.28,
    map: downtownWinTex,
    emissiveMap: downtownWinTex,
    emissive: new THREE.Color(0x00f0ff),
    emissiveIntensity: 1.8,
  });
  dtFillerMat.userData = { isWindowMaterial: true, district: 'downtown', baseColor: 0x00f0ff };
  windowMaterials.push({ material: dtFillerMat, district: 'downtown', baseColor: new THREE.Color(0x00f0ff) });

  // B. Residential Tower Material (Amber Gold)
  const resFillerMat = new THREE.MeshStandardMaterial({
    color: 0x0c0d18,
    metalness: 0.7,
    roughness: 0.35,
    map: resWinTex,
    emissiveMap: resWinTex,
    emissive: new THREE.Color(0xf59e0b),
    emissiveIntensity: 1.8,
  });
  resFillerMat.userData = { isWindowMaterial: true, district: 'residential', baseColor: 0xf59e0b };
  windowMaterials.push({ material: resFillerMat, district: 'residential', baseColor: new THREE.Color(0xf59e0b) });

  // C. Technology District Material (Emerald / Cyan)
  const techFillerMat = new THREE.MeshStandardMaterial({
    color: 0x060f18,
    metalness: 0.85,
    roughness: 0.25,
    map: techWinTex,
    emissiveMap: techWinTex,
    emissive: new THREE.Color(0x00ffaa),
    emissiveIntensity: 1.8,
  });
  techFillerMat.userData = { isWindowMaterial: true, district: 'technology', baseColor: 0x00ffaa };
  windowMaterials.push({ material: techFillerMat, district: 'technology', baseColor: new THREE.Color(0x00ffaa) });

  // D. Entertainment District Material (Neon Magenta)
  const entFillerMat = new THREE.MeshStandardMaterial({
    color: 0x0d0718,
    metalness: 0.8,
    roughness: 0.3,
    map: entWinTex,
    emissiveMap: entWinTex,
    emissive: new THREE.Color(0xff007f),
    emissiveIntensity: 2.0,
  });
  entFillerMat.userData = { isWindowMaterial: true, district: 'entertainment', baseColor: 0xff007f };
  windowMaterials.push({ material: entFillerMat, district: 'entertainment', baseColor: new THREE.Color(0xff007f) });

  const maxPerMesh = 60;
  const dtMesh = new THREE.InstancedMesh(fillerGeo, dtFillerMat, maxPerMesh);
  const resMesh = new THREE.InstancedMesh(fillerGeo, resFillerMat, maxPerMesh);
  const techMesh = new THREE.InstancedMesh(fillerGeo, techFillerMat, maxPerMesh);
  const entMesh = new THREE.InstancedMesh(fillerGeo, entFillerMat, maxPerMesh);
  const hvacMesh = new THREE.InstancedMesh(hvacGeo, materials.metalLight, maxPerMesh * 2);

  [dtMesh, resMesh, techMesh, entMesh, hvacMesh].forEach((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
  });

  const dummy = new THREE.Object3D();
  const dummyHVAC = new THREE.Object3D();
  let dtIdx = 0;
  let resIdx = 0;
  let techIdx = 0;
  let entIdx = 0;
  let hvacIdx = 0;

  const xSectors = [-200, -160, -120, -80, 80, 120, 160, 200];
  const zSectors = [-200, -140, -100, -60, 60, 100, 140, 200];

  for (const bx of xSectors) {
    for (const bz of zSectors) {
      if (Math.abs(bx) < 35) continue; // river
      if (Math.abs(bx - 140) < 32 && Math.abs(bz - -80) < 32) continue; // Mohit Developer Hub
      if (Math.abs(bx - -68) < 32 && Math.abs(bz) < 55) continue; // Central Park
      if (Math.abs(bx - -160) < 36 && Math.abs(bz - 160) < 36) continue; // Healthcare
      if (Math.abs(bx - -170) < 36 && Math.abs(bz - -170) < 36) continue; // Education
      if (Math.abs(bz - -220) < 40) continue; // Railway corridor

      // Varied height: stepped skyline from mid-rise to soaring skyscrapers
      const hNoise = Math.sin(bx * 0.05 + bz * 0.07) * 0.5 + 0.5;
      const h = 22 + hNoise * 72; // 22m to 94m
      const w = 13 + (Math.cos(bx * 0.1) * 0.5 + 0.5) * 8;
      const d = 13 + (Math.sin(bz * 0.1) * 0.5 + 0.5) * 8;

      dummy.position.set(bx, h / 2, bz);
      dummy.scale.set(w, h, d);
      dummy.updateMatrix();

      // Rooftop HVAC unit
      if (hvacIdx < maxPerMesh * 2) {
        dummyHVAC.position.set(bx + (Math.random() - 0.5) * (w * 0.4), h + 1.2, bz + (Math.random() - 0.5) * (d * 0.4));
        dummyHVAC.scale.set(3.2, 1.8, 3.2);
        dummyHVAC.updateMatrix();
        hvacMesh.setMatrixAt(hvacIdx++, dummyHVAC.matrix);
      }

      // Assign to district
      if (bx > 35 && bz > 50 && resIdx < maxPerMesh) {
        resMesh.setMatrixAt(resIdx++, dummy.matrix);
      } else if (bz > 130 && entIdx < maxPerMesh) {
        entMesh.setMatrixAt(entIdx++, dummy.matrix);
      } else if (bx > 35 && bz < 0 && techIdx < maxPerMesh) {
        techMesh.setMatrixAt(techIdx++, dummy.matrix);
      } else if (dtIdx < maxPerMesh) {
        dtMesh.setMatrixAt(dtIdx++, dummy.matrix);
      }
    }
  }

  dtMesh.count = dtIdx;
  resMesh.count = resIdx;
  techMesh.count = techIdx;
  entMesh.count = entIdx;
  hvacMesh.count = hvacIdx;

  [dtMesh, resMesh, techMesh, entMesh, hvacMesh].forEach((m) => {
    m.instanceMatrix.needsUpdate = true;
    group.add(m);
  });

  scene.add(group);

  const update = (time: number) => {
    mohitHub.update(time);
    educationDistrict.update(time);
    healthcareDistrict.update(time);

    bb1.update(time);
    bb2.update(time);
    bb3.update(time);
    bb4.update(time);
  };

  const dispose = () => {
    scene.remove(group);
    mohitHub.dispose();
    educationDistrict.dispose();
    healthcareDistrict.dispose();
    fillerGeo.dispose();
    hvacGeo.dispose();
    dtFillerMat.dispose();
    resFillerMat.dispose();
    techFillerMat.dispose();
    entFillerMat.dispose();
    downtownWinTex.dispose();
    techWinTex.dispose();
    resWinTex.dispose();
    entWinTex.dispose();
    bb1.texture.dispose();
    bb2.texture.dispose();
    bb3.texture.dispose();
    bb4.texture.dispose();
  };

  return {
    group,
    allBuildingsData,
    interactiveMeshes,
    mohitHub,
    educationDistrict,
    healthcareDistrict,
    windowMaterials,
    update,
    dispose,
  };
}
