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
import { createDubaiLandmarks, DubaiLandmarkSystem } from './DubaiLandmarks';
import { createWorldLandmarks, WorldLandmarkSystem } from './WorldLandmarks';
import { WindowMaterialEntry } from '../simulation/CityLifeManager';

export interface BuildingsManagerSystem {
  group: THREE.Group;
  allBuildingsData: BuildingData[];
  interactiveMeshes: THREE.Object3D[];
  mohitHub: MohitHubSystem;
  educationDistrict: EducationDistrictSystem;
  healthcareDistrict: HealthcareDistrictSystem;
  dubaiLandmarks: DubaiLandmarkSystem;
  worldLandmarks: WorldLandmarkSystem;
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

  // Realistic Architectural Window & Facade Textures
  const downtownWinTex = createProceduralWindowTexture('#0f172a', 8, 32, 'corporate-glass');
  const techWinTex = createProceduralWindowTexture('#334155', 8, 28, 'financial-granite');
  const resWinTex = createProceduralWindowTexture('#27272a', 8, 28, 'modern-residential');
  const entWinTex = createProceduralWindowTexture('#475569', 8, 24, 'limestone-retail');

  // Commercial & Corporate Architectural Signboards
  const bb1 = createDigitalBillboardTexture('METROPOLIS FINANCIAL', 'GLOBAL ASSET MANAGEMENT & EQUITY', '#f8fafc', '#38bdf8');
  const bb2 = createDigitalBillboardTexture('CENTRAL GALLERIA', 'LUXURY RETAIL & DINING ATRIUM', '#f8fafc', '#f59e0b');
  const bb3 = createDigitalBillboardTexture('APEX DATA INFRASTRUCTURE', 'ENTERPRISE HYPERSCALE & CLOUD', '#f8fafc', '#10b981');
  const bb4 = createDigitalBillboardTexture('METROPOLITAN OPERA', 'SYMPHONY HALL & PERFORMING ARTS', '#f8fafc', '#e2e8f0');

  // 1. INSTANTIATE SUB-DISTRICTS
  // A. MOHIT DEVELOPER HUB HEADQUARTERS
  const mohitHub = createMohitDeveloperHub(scene, materials);
  allBuildingsData.push(mohitHub.buildingData);
  interactiveMeshes.push(...mohitHub.interactiveMeshes);

  // B. DUBAI ICONIC LANDMARKS (Burj Khalifa, Burj Al Arab, Museum of the Future, Dubai Frame, Cayan Tower)
  const dubaiLandmarks = createDubaiLandmarks(scene, materials);
  allBuildingsData.push(...dubaiLandmarks.buildingsData);
  interactiveMeshes.push(...dubaiLandmarks.interactiveMeshes);

  // C. EDUCATION DISTRICT (University, Engineering College, School, Library, Research, Hostel, Lab)
  const educationDistrict = createEducationDistrict(scene, materials);
  allBuildingsData.push(...educationDistrict.buildingsData);
  interactiveMeshes.push(...educationDistrict.interactiveMeshes);

  // D. HEALTHCARE DISTRICT (Smart Hospital, Emergency Center, Pharmacy, Ambulance Bay, Helipad, Research)
  const healthcareDistrict = createHealthcareDistrict(scene, materials);
  allBuildingsData.push(...healthcareDistrict.buildingsData);
  interactiveMeshes.push(...healthcareDistrict.interactiveMeshes);

  // E. WORLD METROPOLIS ARCHITECTURAL ICONS (Singapore MBS & Gardens, Paris Eiffel & Arc, America ESB & WTC)
  const worldLandmarks = createWorldLandmarks(scene, materials);
  allBuildingsData.push(...worldLandmarks.buildingsData);
  interactiveMeshes.push(...worldLandmarks.interactiveMeshes);

  // 2. DETAILED DOWNTOWN, ENTERTAINMENT, RESIDENTIAL & INDUSTRIAL TOWERS
  const landmarkConfigs: { data: BuildingData; opts: any }[] = [
    // --- DOWNTOWN FINANCIAL CORE ---
    {
      data: {
        id: 'bldg-apex-tower',
        name: 'Apex Tower - World Financial Center',
        districtId: 'downtown',
        districtName: 'Financial Core',
        category: 'Skyscraper',
        height: 155,
        floors: 52,
        position: [-100, 0, -40],
        dimensions: [22, 155, 22],
        powerUsage: '14.2 MW (Clean Geothermal)',
        occupancy: '98% (12,400 Employees)',
        networkStatus: 'Hyper-Band Optical Grid 100%',
        description: 'The premier landmark of the financial district. Houses global banking headquarters, international law firms, and the corporate executive oversight suite.',
        features: ['Rooftop Spire Beacon', 'Grand 3-Story Lobby Atrium', 'Financial Boardroom Suite'],
      },
      opts: {
        accentColor: 0x94a3b8,
        emissiveColor: 0xfef3c7,
        windowTex: downtownWinTex,
        hasSpire: true,
        billboard: { tex: bb1.texture, width: 18, height: 10 },
      },
    },
    {
      data: {
        id: 'bldg-horizon-spire',
        name: 'Horizon Financial Monolith',
        districtId: 'downtown',
        districtName: 'Financial Core',
        category: 'Skyscraper',
        height: 138,
        floors: 46,
        position: [-140, 0, 40],
        dimensions: [20, 138, 20],
        powerUsage: '11.8 MW',
        occupancy: '94% (9,800 Employees)',
        networkStatus: 'Enterprise Optical Sync',
        description: 'Reflective architectural glass and titanium monolith overlooking West Boulevard. Features open-plan trading floors, executive conference suites, and rooftop helipad.',
        features: ['Rooftop Helipad', 'Architectural Crown Spire', 'Glass Observation Gallery'],
      },
      opts: {
        accentColor: 0x94a3b8,
        emissiveColor: 0xfef3c7,
        windowTex: downtownWinTex,
        hasSpire: true,
        hasHelipad: true,
      },
    },
    {
      data: {
        id: 'bldg-lumina-plaza',
        name: 'Lumina Corporate Plaza',
        districtId: 'downtown',
        districtName: 'Financial Core',
        category: 'Skyscraper',
        height: 110,
        floors: 36,
        position: [-140, 0, -40],
        dimensions: [24, 110, 24],
        powerUsage: '8.4 MW',
        occupancy: '91% (7,500 Occupants)',
        networkStatus: 'Municipal Fiber Active',
        description: 'Downtown corporate operations center with stepped landscaped terraces, architectural sun louvers, and municipal management offices.',
        features: ['Tiered Sky Gardens', 'Solar Louver Facades', 'Municipal Council Offices'],
      },
      opts: {
        accentColor: 0x64748b,
        emissiveColor: 0xfef3c7,
        windowTex: downtownWinTex,
      },
    },
    {
      data: {
        id: 'bldg-omni-corp',
        name: 'Omni International Trade Center',
        districtId: 'downtown',
        districtName: 'Financial Core',
        category: 'Skyscraper',
        height: 168,
        floors: 54,
        position: [-140, 0, -100],
        dimensions: [26, 168, 26],
        powerUsage: '16.8 MW Clean Energy',
        occupancy: '98% (14,500 Corporate Staff)',
        networkStatus: 'Hyper-Band Optical Grid 100%',
        description: 'Monumental 54-story corporate headquarters featuring multi-national conference facilities, commodities exchange floor, and an elevated glass skybridge.',
        features: ['Rooftop Communications Mast', 'Executive Skybridge Access', 'Helicopter Landing Facility'],
      },
      opts: {
        accentColor: 0x94a3b8,
        emissiveColor: 0xfef3c7,
        windowTex: downtownWinTex,
        hasSpire: true,
        hasHelipad: true,
        billboard: { tex: bb3.texture, width: 22, height: 11 },
      },
    },
    {
      data: {
        id: 'bldg-galleria-mall',
        name: 'Grand Metropolitan Shopping Galleria',
        districtId: 'entertainment',
        districtName: 'Commercial & Retail District',
        category: 'Entertainment Megaplex',
        height: 78,
        floors: 4,
        position: [0, 0, 140],
        dimensions: [36, 78, 30],
        powerUsage: '17.4 MW Commercial',
        occupancy: '98% (24,000 Daily Shoppers)',
        networkStatus: 'Retail Fiber Network 100%',
        description: 'Multi-level premier shopping galleria showcasing flagship luxury retailers, designer apparel, electronics megastores, artisan gourmet food hall, and glass atrium.',
        features: ['5 Flagship Retail Boutiques', 'Triple-Height Skylight Atrium', 'Gourmet Dining Promenade', 'Observation Terrace'],
      },
      opts: {
        accentColor: 0x64748b,
        emissiveColor: 0xfef08a,
        windowTex: entWinTex,
        billboard: { tex: bb2.texture, width: 26, height: 13 },
      },
    },

    // --- TECHNOLOGY DISTRICT ---
    {
      data: {
        id: 'bldg-quantum-neural',
        name: 'Advanced Science & Supercomputing Institute',
        districtId: 'technology',
        districtName: 'Technology Campus',
        category: 'Research Pod',
        height: 125,
        floors: 40,
        position: [100, 0, -120],
        dimensions: [24, 125, 24],
        powerUsage: '28.5 MW (Industrial Cooled)',
        occupancy: '89% (5,400 Research Scientists)',
        networkStatus: 'Petabit High-Performance Optical Mesh',
        description: 'State-of-the-art computational research facility housing high-density supercomputer clusters, advanced material labs, and cleanrooms adjacent to Mohit Developer Hub.',
        features: ['High-Performance Computing Cluster', 'Precision Cleanrooms', 'Digital Architectural Sign'],
      },
      opts: {
        accentColor: 0x94a3b8,
        emissiveColor: 0xf8fafc,
        windowTex: techWinTex,
        hasSpire: true,
        billboard: { tex: bb3.texture, width: 20, height: 10 },
      },
    },
    {
      data: {
        id: 'bldg-engineering-tech',
        name: 'Metropolis Engineering & Technology Tower',
        districtId: 'technology',
        districtName: 'Technology Campus',
        category: 'Research Pod',
        height: 105,
        floors: 34,
        position: [180, 0, -80],
        dimensions: [20, 105, 20],
        powerUsage: '16.2 MW',
        occupancy: '95% (4,800 Engineers)',
        networkStatus: 'Gigabit Fiber Backbone',
        description: 'Contemporary architectural tower housing automation laboratories, software engineering teams, and architectural prototyping studios.',
        features: ['Rooftop Climate Station', 'Multi-Floor Engineering Labs', 'Parabolic Communications Dish'],
      },
      opts: {
        accentColor: 0x94a3b8,
        emissiveColor: 0xf8fafc,
        windowTex: techWinTex,
        hasSpire: true,
      },
    },

    // --- RESIDENTIAL DISTRICT ---
    {
      data: {
        id: 'bldg-neo-habitat-alpha',
        name: 'Sky-Terrace Residences North',
        districtId: 'residential',
        districtName: 'Residential District',
        category: 'Neo-Habitat',
        height: 102,
        floors: 35,
        position: [180, 0, 160],
        dimensions: [24, 102, 24],
        powerUsage: '9.3 MW',
        occupancy: '99% (8,200 Residents)',
        networkStatus: 'Residential FTTH Gigabit',
        description: 'Luxury high-rise residential condominium tower featuring panoramic city balconies, private landscaped roof gardens, and modern amenities.',
        features: ['Private Terrace Balconies', 'Rooftop Residents Lounge', 'Underground Valet Parking'],
      },
      opts: {
        accentColor: 0x71717a,
        emissiveColor: 0xfde68a,
        windowTex: resWinTex,
      },
    },
    {
      data: {
        id: 'bldg-neo-habitat-beta',
        name: 'Aurora Grand Promenade Apartments',
        districtId: 'residential',
        districtName: 'Residential District',
        category: 'Neo-Habitat',
        height: 88,
        floors: 30,
        position: [100, 0, 220],
        dimensions: [22, 88, 22],
        powerUsage: '7.6 MW',
        occupancy: '96% (6,900 Residents)',
        networkStatus: 'Residential FTTH Gigabit',
        description: 'Contemporary multi-family apartment community with integrated ground-level cafes, fitness center, and private courtyard.',
        features: ['Landscaped Podium Courtyard', 'Ground-Floor Retail Cafes', 'Bicycle & EV Facilities'],
      },
      opts: {
        accentColor: 0x71717a,
        emissiveColor: 0xfde68a,
        windowTex: resWinTex,
      },
    },

    // --- ENTERTAINMENT & CIVIC DISTRICT ---
    {
      data: {
        id: 'bldg-synthwave-megaplex',
        name: 'Civic Center Plaza & IMAX Theater',
        districtId: 'entertainment',
        districtName: 'Civic & Culture District',
        category: 'Entertainment Megaplex',
        height: 92,
        floors: 28,
        position: [0, 0, 220],
        dimensions: [28, 92, 24],
        powerUsage: '18.9 MW Commercial',
        occupancy: '97% (18,000 Visitors)',
        networkStatus: 'High-Capacity Fiber',
        description: 'Vibrant civic and cultural centerpiece featuring multi-screen cinema multiplex, rooftop skyline bistro, and performing arts auditoriums.',
        features: ['IMAX Laser Auditoriums', 'Skyline Panorama Bistro', 'Civic Plaza Fountain'],
      },
      opts: {
        accentColor: 0x64748b,
        emissiveColor: 0xfef08a,
        windowTex: entWinTex,
        hasSpire: true,
        billboard: { tex: bb2.texture, width: 24, height: 12 },
      },
    },
    {
      data: {
        id: 'bldg-cultural-pavilion',
        name: 'Metropolis Cultural & Exhibition Pavilion',
        districtId: 'entertainment',
        districtName: 'Civic & Culture District',
        category: 'Entertainment Megaplex',
        height: 72,
        floors: 22,
        position: [-45, 0, 240],
        dimensions: [20, 72, 20],
        powerUsage: '12.1 MW',
        occupancy: '92% (9,400 Visitors)',
        networkStatus: 'Exhibition Media Network',
        description: 'Contemporary exhibition halls, contemporary digital media museum, and conference center welcoming international conventions.',
        features: ['Grand Exhibition Galleries', 'Convention Amphitheater', 'Rooftop Sculpture Terrace'],
      },
      opts: {
        accentColor: 0x64748b,
        emissiveColor: 0xfef3c7,
        windowTex: entWinTex,
        billboard: { tex: bb4.texture, width: 16, height: 8 },
      },
    },

    // --- INDUSTRIAL DISTRICT ---
    {
      data: {
        id: 'bldg-geothermal-plant',
        name: 'Metropolitan Geothermal Energy Station',
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
        description: 'State-of-the-art zero-carbon geothermal generation facility supplying clean renewable base-load electrical power to the city.',
        features: ['Subterranean Heat Exchangers', 'Twin Cooling Towers', '+450 MW Clean Grid Capacity'],
      },
      opts: {
        accentColor: 0x475569,
        emissiveColor: 0xfef3c7,
        windowTex: downtownWinTex,
        hasSpire: true,
      },
    },
  ];

  // Helper to build a complete, multi-tiered architectural skyscraper
  const createDetailedTower = (item: { data: BuildingData; opts: any }) => {
    const { data, opts } = item;
    const bldgGroup = new THREE.Group();
    bldgGroup.position.set(data.position[0], 0, data.position[2]);

    const [w, h, d] = data.dimensions;

    // Clone texture per tower so UV repeat is exact and never overwrites shared maps
    const towerTex: THREE.CanvasTexture = opts.windowTex.clone();
    towerTex.needsUpdate = true;
    towerTex.repeat.set(Math.max(1, Math.round(w / 9)), Math.max(2, Math.round((h * 0.68) / 14)));

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.76,
      roughness: 0.55,
      roughnessMap: materials.maps.facadeRoughness,
      map: towerTex,
      emissiveMap: towerTex,
      emissive: new THREE.Color(opts.emissiveColor || 0xfef3c7),
      emissiveIntensity: 0.24,
      normalMap: materials.maps.facadeNormal,
      normalScale: new THREE.Vector2(0.65, 0.65),
      envMapIntensity: 1.95,
    });

    bodyMat.userData = {
      isWindowMaterial: true,
      district: data.districtId,
      baseColor: opts.emissiveColor || 0xfef3c7,
    };
    windowMaterials.push({
      material: bodyMat,
      district: data.districtId,
      baseColor: new THREE.Color(opts.emissiveColor || 0xfef3c7),
    });

    // 1. GRAND STREET-LEVEL ARCHITECTURAL PODIUM & COLONNADE ATRIUM
    const podiumH = Math.min(12, h * 0.13);
    const podiumGeo = new THREE.BoxGeometry(w + 2.6, podiumH, d + 2.6);
    const podiumMesh = new THREE.Mesh(podiumGeo, materials.podiumStone);
    podiumMesh.position.y = podiumH / 2;
    podiumMesh.castShadow = true;
    podiumMesh.receiveShadow = true;
    bldgGroup.add(podiumMesh);

    // Double-height recessed glass lobby atrium at street level
    const lobbyGlass = new THREE.Mesh(
      new THREE.BoxGeometry(w + 1.8, podiumH * 0.72, d + 2.8),
      materials.glassCyan
    );
    lobbyGlass.position.y = podiumH * 0.36;
    bldgGroup.add(lobbyGlass);

    // Perimeter structural colonnade pillars along street frontage
    [-w * 0.42, -w * 0.14, w * 0.14, w * 0.42].forEach((px) => {
      [-d / 2 - 1.25, d / 2 + 1.25].forEach((pz) => {
        const pillar = new THREE.Mesh(
          new THREE.BoxGeometry(0.95, podiumH, 0.95),
          materials.metalLight
        );
        pillar.position.set(px, podiumH / 2, pz);
        pillar.castShadow = true;
        bldgGroup.add(pillar);
      });
    });

    // Cantilevered steel & glass entrance canopy over main plaza
    const entranceCanopy = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.56, 0.45, 4.2),
      materials.metalLight
    );
    entranceCanopy.position.set(0, 5.2, d / 2 + 3.0);
    bldgGroup.add(entranceCanopy);

    // Architectural Cornice Trim between Podium and Main Tower Shaft
    const corniceMesh = new THREE.Mesh(
      new THREE.BoxGeometry(w + 3.4, 0.8, d + 3.4),
      materials.metalDark
    );
    corniceMesh.position.y = podiumH + 0.4;
    bldgGroup.add(corniceMesh);

    // 2. LOWER & MID MAIN TOWER SHAFT (with 3D Extruded Curtain-Wall Mullion Fins)
    const lowerShaftH = h * 0.68;
    const bodyGeo = new THREE.BoxGeometry(w, lowerShaftH, d);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = podiumH + lowerShaftH / 2;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bldgGroup.add(bodyMesh);

    // 3D Vertical Anodized Steel Mullions & Corner Exoskeleton Columns
    const mullionOffsets = [-w / 2, -w * 0.25, 0, w * 0.25, w / 2];
    mullionOffsets.forEach((mx) => {
      const mFin = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, lowerShaftH, d + 0.45),
        materials.metalLight
      );
      mFin.position.set(mx, podiumH + lowerShaftH / 2, 0);
      bldgGroup.add(mFin);
    });

    // Mid-height Mechanical & Sky-Lobby Louver Band
    const mechBandY = podiumH + lowerShaftH;
    const mechBand = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.8, 2.4, d + 0.8),
      materials.metalDark
    );
    mechBand.position.y = mechBandY;
    bldgGroup.add(mechBand);

    // 3. UPPER STEPPED SETBACK TOWER TIER (Creates Authentic Tapered Skyline Profile)
    const upperW = w * 0.78;
    const upperD = d * 0.78;
    const upperH = h - podiumH - lowerShaftH;
    const upperGeo = new THREE.BoxGeometry(upperW, upperH, upperD);
    const upperMesh = new THREE.Mesh(upperGeo, bodyMat);
    upperMesh.position.y = mechBandY + upperH / 2;
    upperMesh.castShadow = true;
    upperMesh.receiveShadow = true;
    bldgGroup.add(upperMesh);

    // Upper tier vertical corner mullions
    [-upperW / 2, 0, upperW / 2].forEach((ux) => {
      const uFin = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, upperH, upperD + 0.4),
        materials.metalLight
      );
      uFin.position.set(ux, mechBandY + upperH / 2, 0);
      bldgGroup.add(uFin);
    });

    // 4. ARCHITECTURAL ROOFTOP CROWN, PARAPET & MECHANICAL PENTHOUSE
    const crownH = Math.min(7, h * 0.08);
    const crown = new THREE.Mesh(
      new THREE.BoxGeometry(upperW * 0.82, crownH, upperD * 0.82),
      materials.metalDark
    );
    crown.position.y = h + crownH / 2;
    crown.castShadow = true;
    bldgGroup.add(crown);

    // Illuminated architectural crown trim ring
    const crownTrim = new THREE.Mesh(
      new THREE.BoxGeometry(upperW + 0.6, 0.7, upperD + 0.6),
      materials.metalLight
    );
    crownTrim.position.y = h + 0.35;
    bldgGroup.add(crownTrim);

    // Rooftop Spire with FAA Standard Red Aviation Beacon
    if (opts.hasSpire) {
      const spireH = h * 0.22;
      const spireBase = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 2.2, spireH * 0.35, 8),
        materials.metalLight
      );
      spireBase.position.y = h + crownH + (spireH * 0.35) / 2;
      bldgGroup.add(spireBase);

      const spire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 1.1, spireH * 0.65, 8),
        materials.metalLight
      );
      spire.position.y = h + crownH + spireH * 0.35 + (spireH * 0.65) / 2;
      bldgGroup.add(spire);

      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), materials.neonRed);
      tip.position.y = h + crownH + spireH;
      bldgGroup.add(tip);
    }

    // Helipad
    if (opts.hasHelipad) {
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(upperW * 0.38, upperW * 0.38, 0.5, 20),
        materials.metalDark
      );
      pad.position.y = h + crownH + 0.25;
      bldgGroup.add(pad);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(upperW * 0.28, upperW * 0.33, 20).rotateX(-Math.PI / 2),
        materials.neonAmber
      );
      ring.position.y = h + crownH + 0.52;
      bldgGroup.add(ring);
    }

    // Commercial / Corporate Billboard
    if (opts.billboard) {
      const bb = new THREE.Mesh(
        new THREE.PlaneGeometry(opts.billboard.width, opts.billboard.height),
        new THREE.MeshBasicMaterial({ map: opts.billboard.tex, side: THREE.DoubleSide })
      );
      bb.position.set(0, podiumH + lowerShaftH * 0.55, d / 2 + 0.35);
      bldgGroup.add(bb);
    }

    // ROOFTOP STRUCTURES: Twin Cooling Towers, HVAC Chillers & Satellite Array
    [-1.8, 1.8].forEach((cx) => {
      const coolingTower = new THREE.Mesh(
        new THREE.CylinderGeometry(1.1, 1.3, 2.2, 12),
        materials.metalLight
      );
      coolingTower.position.set(-upperW * 0.22 + cx, h + crownH + 1.1, -upperD * 0.2);
      bldgGroup.add(coolingTower);
    });

    const dish = new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 1.3, 0.3, 12),
      materials.metalLight
    );
    dish.position.set(upperW * 0.22, h + crownH + 1.2, upperD * 0.22);
    dish.rotation.x = Math.PI / 3;
    bldgGroup.add(dish);

    bodyMesh.userData = { buildingData: data };
    upperMesh.userData = { buildingData: data };
    podiumMesh.userData = { buildingData: data };
    interactiveMeshes.push(bodyMesh, upperMesh, podiumMesh);
    allBuildingsData.push(data);
    group.add(bldgGroup);
  };

  landmarkConfigs.forEach(createDetailedTower);

  // Calibrate shared window textures for instanced city block buildings
  downtownWinTex.repeat.set(2, 4);
  resWinTex.repeat.set(2, 4);
  techWinTex.repeat.set(2, 3);
  entWinTex.repeat.set(2, 3);

  // 3. MULTI-DISTRICT HIGH-DENSITY STEPPED SKYSCRAPERS (Podium + Main Shaft + Setback Tier + Crown)
  const fillerGeo = new THREE.BoxGeometry(1, 1, 1);
  const hvacGeo = new THREE.BoxGeometry(1, 1, 1);

  // A. Downtown Tower Material (Reflective Corporate Glass & Steel)
  const dtFillerMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.80,
    roughness: 0.55,
    roughnessMap: materials.maps.facadeRoughness,
    map: downtownWinTex,
    emissiveMap: downtownWinTex,
    emissive: new THREE.Color(0xfef3c7),
    emissiveIntensity: 0.24,
    normalMap: materials.maps.facadeNormal,
    normalScale: new THREE.Vector2(0.6, 0.6),
    envMapIntensity: 1.95,
  });
  dtFillerMat.userData = { isWindowMaterial: true, district: 'downtown', baseColor: 0xfef3c7 };
  windowMaterials.push({ material: dtFillerMat, district: 'downtown', baseColor: new THREE.Color(0xfef3c7) });

  // B. Residential Tower Material (Contemporary Stone & Balconies)
  const resFillerMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.52,
    roughness: 0.62,
    roughnessMap: materials.maps.facadeRoughness,
    map: resWinTex,
    emissiveMap: resWinTex,
    emissive: new THREE.Color(0xfde68a),
    emissiveIntensity: 0.28,
    normalMap: materials.maps.facadeNormal,
    normalScale: new THREE.Vector2(0.6, 0.6),
    envMapIntensity: 1.55,
  });
  resFillerMat.userData = { isWindowMaterial: true, district: 'residential', baseColor: 0xfde68a };
  windowMaterials.push({ material: resFillerMat, district: 'residential', baseColor: new THREE.Color(0xfde68a) });

  // C. Technology Campus Material (Precast Concrete & Architectural Glass)
  const techFillerMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.78,
    roughness: 0.55,
    roughnessMap: materials.maps.facadeRoughness,
    map: techWinTex,
    emissiveMap: techWinTex,
    emissive: new THREE.Color(0xf8fafc),
    emissiveIntensity: 0.22,
    normalMap: materials.maps.facadeNormal,
    normalScale: new THREE.Vector2(0.62, 0.62),
    envMapIntensity: 1.9,
  });
  techFillerMat.userData = { isWindowMaterial: true, district: 'technology', baseColor: 0xf8fafc };
  windowMaterials.push({ material: techFillerMat, district: 'technology', baseColor: new THREE.Color(0xf8fafc) });

  // D. Commercial & Entertainment Material (Limestone & Retail Facades)
  const entFillerMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.65,
    roughness: 0.58,
    roughnessMap: materials.maps.facadeRoughness,
    map: entWinTex,
    emissiveMap: entWinTex,
    emissive: new THREE.Color(0xfef08a),
    emissiveIntensity: 0.26,
    normalMap: materials.maps.facadeNormal,
    normalScale: new THREE.Vector2(0.6, 0.6),
    envMapIntensity: 1.65,
  });
  entFillerMat.userData = { isWindowMaterial: true, district: 'entertainment', baseColor: 0xfef08a };
  windowMaterials.push({ material: entFillerMat, district: 'entertainment', baseColor: new THREE.Color(0xfef08a) });

  const maxPerMesh = 140;
  const dtMesh = new THREE.InstancedMesh(fillerGeo, dtFillerMat, maxPerMesh);
  const resMesh = new THREE.InstancedMesh(fillerGeo, resFillerMat, maxPerMesh);
  const techMesh = new THREE.InstancedMesh(fillerGeo, techFillerMat, maxPerMesh);
  const entMesh = new THREE.InstancedMesh(fillerGeo, entFillerMat, maxPerMesh);
  const podiumInstancedMesh = new THREE.InstancedMesh(fillerGeo, materials.podiumStone, maxPerMesh * 2);
  const lobbyInstancedMesh = new THREE.InstancedMesh(fillerGeo, materials.glassCyan, maxPerMesh * 2);
  const corniceInstancedMesh = new THREE.InstancedMesh(fillerGeo, materials.metalDark, maxPerMesh * 4);
  const crownInstancedMesh = new THREE.InstancedMesh(fillerGeo, materials.metalDark, maxPerMesh * 2);
  const hvacMesh = new THREE.InstancedMesh(hvacGeo, materials.metalLight, maxPerMesh * 2);
  const spireInstancedMesh = new THREE.InstancedMesh(hvacGeo, materials.metalLight, maxPerMesh);

  [
    dtMesh,
    resMesh,
    techMesh,
    entMesh,
    podiumInstancedMesh,
    lobbyInstancedMesh,
    corniceInstancedMesh,
    crownInstancedMesh,
    hvacMesh,
    spireInstancedMesh,
  ].forEach((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
  });

  const dummy = new THREE.Object3D();
  const dummyPodium = new THREE.Object3D();
  const dummyLobby = new THREE.Object3D();
  const dummyCornice = new THREE.Object3D();
  const dummyUpper = new THREE.Object3D();
  const dummyCrown = new THREE.Object3D();
  const dummyHVAC = new THREE.Object3D();
  const dummySpire = new THREE.Object3D();
  let dtIdx = 0;
  let resIdx = 0;
  let techIdx = 0;
  let entIdx = 0;
  let podIdx = 0;
  let lobbyIdx = 0;
  let corniceIdx = 0;
  let crownIdx = 0;
  let hvacIdx = 0;
  let spireIdx = 0;

  const xSectors = [-250, -210, -170, -130, -90, -50, 50, 90, 130, 170, 210, 250];
  const zSectors = [-250, -200, -150, -100, -50, 50, 100, 150, 200, 250];

  for (const bx of xSectors) {
    for (const bz of zSectors) {
      if (Math.abs(bx) < 35) continue; // river
      if (Math.abs(bx - 140) < 32 && Math.abs(bz - -80) < 32) continue; // Mohit Developer Hub
      if (Math.abs(bx - -68) < 32 && Math.abs(bz) < 55) continue; // Central Park
      if (Math.abs(bx - -160) < 36 && Math.abs(bz - 160) < 36) continue; // Healthcare
      if (Math.abs(bx - -170) < 36 && Math.abs(bz - -170) < 36) continue; // Education
      if (Math.abs(bz - -220) < 40) continue; // Railway corridor
      if (bx > 90 && bz < -240) continue; // Airport runway & tarmac zone
      if (Math.abs(bx - -165) < 30 && Math.abs(bz - 75) < 30) continue; // Singapore MBS
      if (Math.abs(bx - -205) < 30 && Math.abs(bz - 110) < 30) continue; // Singapore Gardens by the Bay
      if (Math.abs(bx - -45) < 25 && Math.abs(bz - -125) < 25) continue; // Paris Eiffel Tower
      if (Math.abs(bx - -85) < 25 && Math.abs(bz - -165) < 25) continue; // Paris Arc de Triomphe
      if (Math.abs(bx - 65) < 25 && Math.abs(bz - -85) < 25) continue; // America Empire State Building
      if (Math.abs(bx - 115) < 25 && Math.abs(bz - -45) < 25) continue; // America One World Trade Center

      // Stepped skyscraper massing: Podium + Lobby Atrium + Primary Shaft + Mechanical Band + Setback Tier + Crown + Spire
      const hNoise = Math.sin(bx * 0.05 + bz * 0.07) * 0.5 + 0.5;
      const totalH = 26 + hNoise * 76; // 26m to 102m
      const mainH = totalH * 0.74;
      const upperH = totalH * 0.26;
      const w = 14 + (Math.cos(bx * 0.1) * 0.5 + 0.5) * 8;
      const d = 14 + (Math.sin(bz * 0.1) * 0.5 + 0.5) * 8;

      // 1. Street-Level Architectural Limestone Podium Base & Recessed Glass Lobby
      const podH = Math.min(7.5, totalH * 0.14);
      if (podIdx < maxPerMesh * 2) {
        dummyPodium.position.set(bx, podH / 2, bz);
        dummyPodium.scale.set(w + 2.2, podH, d + 2.2);
        dummyPodium.updateMatrix();
        podiumInstancedMesh.setMatrixAt(podIdx++, dummyPodium.matrix);
      }

      if (lobbyIdx < maxPerMesh * 2) {
        dummyLobby.position.set(bx, podH * 0.38, bz);
        dummyLobby.scale.set(w + 1.4, podH * 0.72, d + 2.5);
        dummyLobby.updateMatrix();
        lobbyInstancedMesh.setMatrixAt(lobbyIdx++, dummyLobby.matrix);
      }

      // Podium Cornice & Mid-Tower Mechanical Louver Band
      if (corniceIdx + 1 < maxPerMesh * 4) {
        dummyCornice.position.set(bx, podH + 0.35, bz);
        dummyCornice.scale.set(w + 2.8, 0.7, d + 2.8);
        dummyCornice.updateMatrix();
        corniceInstancedMesh.setMatrixAt(corniceIdx++, dummyCornice.matrix);

        dummyCornice.position.set(bx, mainH, bz);
        dummyCornice.scale.set(w + 0.6, 1.8, d + 0.6);
        dummyCornice.updateMatrix();
        corniceInstancedMesh.setMatrixAt(corniceIdx++, dummyCornice.matrix);
      }

      // 2. Primary Curtain-Wall Shaft
      dummy.position.set(bx, mainH / 2, bz);
      dummy.scale.set(w, mainH, d);
      dummy.updateMatrix();

      // 3. Upper Setback Tower Tier
      const upperW = w * 0.72;
      const upperD = d * 0.72;
      dummyUpper.position.set(bx, mainH + upperH / 2, bz);
      dummyUpper.scale.set(upperW, upperH, upperD);
      dummyUpper.updateMatrix();

      // 4. Rooftop Architectural Parapet Crown
      const crownH = 3.2;
      if (crownIdx < maxPerMesh * 2) {
        dummyCrown.position.set(bx, totalH + crownH / 2, bz);
        dummyCrown.scale.set(upperW * 0.78, crownH, upperD * 0.78);
        dummyCrown.updateMatrix();
        crownInstancedMesh.setMatrixAt(crownIdx++, dummyCrown.matrix);
      }

      // 5. Rooftop Mechanical Chiller & Elevator Overrun
      if (hvacIdx < maxPerMesh * 2) {
        dummyHVAC.position.set(bx + upperW * 0.15, totalH + crownH + 1.1, bz - upperD * 0.15);
        dummyHVAC.scale.set(3.4, 2.2, 3.4);
        dummyHVAC.updateMatrix();
        hvacMesh.setMatrixAt(hvacIdx++, dummyHVAC.matrix);
      }

      // 6. Architectural Rooftop Communication Spire on Tall Skyscrapers
      if (totalH > 62 && spireIdx < maxPerMesh) {
        const spH = totalH * 0.18;
        dummySpire.position.set(bx, totalH + crownH + spH / 2, bz);
        dummySpire.scale.set(0.45, spH, 0.45);
        dummySpire.updateMatrix();
        spireInstancedMesh.setMatrixAt(spireIdx++, dummySpire.matrix);
      }

      // Assign both Main Shaft and Setback Tier to district instanced mesh
      if (bx > 35 && bz > 50 && resIdx + 1 < maxPerMesh) {
        resMesh.setMatrixAt(resIdx++, dummy.matrix);
        resMesh.setMatrixAt(resIdx++, dummyUpper.matrix);
      } else if (bz > 130 && entIdx + 1 < maxPerMesh) {
        entMesh.setMatrixAt(entIdx++, dummy.matrix);
        entMesh.setMatrixAt(entIdx++, dummyUpper.matrix);
      } else if (bx > 35 && bz < 0 && techIdx + 1 < maxPerMesh) {
        techMesh.setMatrixAt(techIdx++, dummy.matrix);
        techMesh.setMatrixAt(techIdx++, dummyUpper.matrix);
      } else if (dtIdx + 1 < maxPerMesh) {
        dtMesh.setMatrixAt(dtIdx++, dummy.matrix);
        dtMesh.setMatrixAt(dtIdx++, dummyUpper.matrix);
      }
    }
  }

  dtMesh.count = dtIdx;
  resMesh.count = resIdx;
  techMesh.count = techIdx;
  entMesh.count = entIdx;
  podiumInstancedMesh.count = podIdx;
  lobbyInstancedMesh.count = lobbyIdx;
  corniceInstancedMesh.count = corniceIdx;
  crownInstancedMesh.count = crownIdx;
  hvacMesh.count = hvacIdx;
  spireInstancedMesh.count = spireIdx;

  [
    dtMesh,
    resMesh,
    techMesh,
    entMesh,
    podiumInstancedMesh,
    lobbyInstancedMesh,
    corniceInstancedMesh,
    crownInstancedMesh,
    hvacMesh,
    spireInstancedMesh,
  ].forEach((m) => {
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
    group.add(m);
  });

  // Elevated Inter-Tower Skybridges (Architectural Glass & Steel Skyway Connectors)
  const skybridgeCoords = [
    { from: [-100, 56, -40], to: [-140, 56, -40], w: 4.2, h: 3.6 },
    { from: [-140, 64, 40], to: [-100, 64, 40], w: 4.2, h: 3.6 },
    { from: [100, 54, -120], to: [140, 54, -80], w: 4.0, h: 3.4 },
    { from: [180, 58, 160], to: [140, 58, 160], w: 4.2, h: 3.6 },
  ];

  skybridgeCoords.forEach((sb) => {
    const p1 = new THREE.Vector3(sb.from[0], sb.from[1], sb.from[2]);
    const p2 = new THREE.Vector3(sb.to[0], sb.to[1], sb.to[2]);
    const span = p1.distanceTo(p2);
    const center = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    const sbGeo = new THREE.BoxGeometry(sb.w, sb.h, span);
    const sbMesh = new THREE.Mesh(sbGeo, materials.glassDark);
    sbMesh.position.copy(center);
    sbMesh.lookAt(p2);
    group.add(sbMesh);

    // Structural dark steel frame trusses (top and bottom)
    const frameGeo = new THREE.BoxGeometry(sb.w + 0.2, 0.4, span);
    const frameBottom = new THREE.Mesh(frameGeo, materials.metalDark);
    frameBottom.position.set(0, -sb.h / 2, 0);
    sbMesh.add(frameBottom);

    const frameTop = new THREE.Mesh(frameGeo, materials.metalDark);
    frameTop.position.set(0, sb.h / 2, 0);
    sbMesh.add(frameTop);
  });

  scene.add(group);

  const update = (time: number) => {
    mohitHub.update(time);
    dubaiLandmarks.update(time);
    worldLandmarks.update(time);
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
    dubaiLandmarks.dispose();
    worldLandmarks.dispose();
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
    dubaiLandmarks,
    worldLandmarks,
    windowMaterials,
    update,
    dispose,
  };
}
