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
import { createBuildingEntryGateAndRoom, BuildingEntryTheme } from './BuildingEntryRoom';

export type TowerArchitecturalArchetype =
  | 'diagrid-obelisk'
  | 'cylindrical-helical'
  | 'biophilic-stepped-terraces'
  | 'art-deco-ziggurat'
  | 'arched-crystal-galleria'
  | 'twisted-quantum-prism'
  | 'cantilevered-twin-linked'
  | 'balcony-wave-residences'
  | 'deconstructivist-cultural'
  | 'industrial-hyperbolic-reactor';

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

  // 10 Distinct Architectural Exterior Facade & Curtain-Wall Textures
  const downtownWinTex = createProceduralWindowTexture('#0a2540', 8, 32, 'corporate-glass');
  const techWinTex = createProceduralWindowTexture('#78716c', 8, 28, 'financial-granite');
  const resWinTex = createProceduralWindowTexture('#7c2d12', 8, 28, 'modern-residential');
  const entWinTex = createProceduralWindowTexture('#a8a29e', 8, 24, 'limestone-retail');
  const diagridWinTex = createProceduralWindowTexture('#0f2942', 8, 32, 'diagrid-steel');
  const artDecoWinTex = createProceduralWindowTexture('#1c1917', 8, 32, 'art-deco-brass');
  const biophilicWinTex = createProceduralWindowTexture('#44403c', 8, 26, 'biophilic-terrace');
  const emeraldWinTex = createProceduralWindowTexture('#064e3b', 8, 30, 'emerald-curtain');
  const copperWinTex = createProceduralWindowTexture('#78350f', 8, 28, 'rose-copper');
  const brutalistWinTex = createProceduralWindowTexture('#64748b', 6, 24, 'brutalist-concrete');

  // Shared Architectural Exterior Accent Materials
  const brassGoldMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.88,
    roughness: 0.22,
  });
  const brushedCopperMat = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    metalness: 0.82,
    roughness: 0.28,
  });
  const whiteTitaniumMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.65,
    roughness: 0.25,
  });
  const skyGardenFoliageMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.65,
    metalness: 0.05,
  });
  const crystalCrownMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    emissive: new THREE.Color(0x0284c7),
    emissiveIntensity: 0.35,
    metalness: 0.2,
    roughness: 0.1,
    transmission: 0.55,
    transparent: true,
    opacity: 0.88,
  });

  // Commercial & Corporate Architectural Signboards
  const bb1 = createDigitalBillboardTexture('METROPOLIS FINANCIAL', 'GLOBAL ASSET MANAGEMENT & EQUITY', '#f8fafc', '#38bdf8');
  const bb2 = createDigitalBillboardTexture('CENTRAL GALLERIA', 'LUXURY RETAIL & DINING ATRIUM', '#f8fafc', '#f59e0b');
  const bb3 = createDigitalBillboardTexture('APEX DATA INFRASTRUCTURE', 'ENTERPRISE HYPERSCALE & CLOUD', '#f8fafc', '#10b981');
  const bb4 = createDigitalBillboardTexture('METROPOLITAN OPERA', 'SYMPHONY HALL & PERFORMING ARTS', '#f8fafc', '#e2e8f0');

  // 1. INSTANTIATE SUB-DISTRICTS
  const mohitHub = createMohitDeveloperHub(scene, materials);
  allBuildingsData.push(mohitHub.buildingData);
  interactiveMeshes.push(...mohitHub.interactiveMeshes);

  const dubaiLandmarks = createDubaiLandmarks(scene, materials);
  allBuildingsData.push(...dubaiLandmarks.buildingsData);
  interactiveMeshes.push(...dubaiLandmarks.interactiveMeshes);

  const educationDistrict = createEducationDistrict(scene, materials);
  allBuildingsData.push(...educationDistrict.buildingsData);
  interactiveMeshes.push(...educationDistrict.interactiveMeshes);

  const healthcareDistrict = createHealthcareDistrict(scene, materials);
  allBuildingsData.push(...healthcareDistrict.buildingsData);
  interactiveMeshes.push(...healthcareDistrict.interactiveMeshes);

  const worldLandmarks = createWorldLandmarks(scene, materials);
  allBuildingsData.push(...worldLandmarks.buildingsData);
  interactiveMeshes.push(...worldLandmarks.interactiveMeshes);

  // 2. DISTINCT ARCHITECTURAL LANDMARK TOWERS (Each with a unique 3D Exterior Architectural Archetype)
  const landmarkConfigs: {
    data: BuildingData;
    opts: {
      archStyle: TowerArchitecturalArchetype;
      accentColor: number;
      emissiveColor: number;
      windowTex: THREE.CanvasTexture;
      hasSpire?: boolean;
      hasHelipad?: boolean;
      billboard?: { tex: THREE.CanvasTexture; width: number; height: number };
    };
  }[] = [
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
        position: [-156, 0, -28],
        dimensions: [22, 155, 22],
        powerUsage: '14.2 MW (Clean Geothermal)',
        occupancy: '98% (12,400 Employees)',
        networkStatus: 'Hyper-Band Optical Grid 100%',
        description: 'Tapered Neo-Futurist Diagrid Obelisk wrapped in a structural steel X-braced exoskeleton with an illuminated crystal pyramid crown.',
        features: ['Structural Steel Diagrid Exoskeleton', 'Crystal Pyramid Crown', 'Grand 3D Entry Gate & Room'],
      },
      opts: {
        archStyle: 'diagrid-obelisk',
        accentColor: 0x38bdf8,
        emissiveColor: 0xe0f2fe,
        windowTex: diagridWinTex,
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
        position: [-154, 0, 32],
        dimensions: [20, 138, 20],
        powerUsage: '11.8 MW',
        occupancy: '94% (9,800 Employees)',
        networkStatus: 'Enterprise Optical Sync',
        description: 'Sculpted Cylindrical & Fluted Glass Skyscraper wrapped in 3D helical brushed-titanium solar fins and topped by a cantilevered aviation helipad.',
        features: ['Cylindrical Fluted Curtain-Wall', '3D Helical Titanium Spiral Fins', 'Rooftop Helipad'],
      },
      opts: {
        archStyle: 'cylindrical-helical',
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
        position: [-126, 0, 32],
        dimensions: [22, 110, 22],
        powerUsage: '8.4 MW',
        occupancy: '91% (7,500 Occupants)',
        networkStatus: 'Municipal Fiber Active',
        description: 'Biophilic Cantilevered Sky-Garden Tower featuring 4 interlocking offset architectural volumes with lush landscaped trees and hedges on every setback terrace.',
        features: ['4 Interlocking Cantilevered Volumes', 'Lush Landscaped Sky-Garden Terraces', 'Timber & Bronze Louvers'],
      },
      opts: {
        archStyle: 'biophilic-stepped-terraces',
        accentColor: 0x22c55e,
        emissiveColor: 0xfef3c7,
        windowTex: biophilicWinTex,
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
        position: [-210, 0, -52],
        dimensions: [24, 168, 24],
        powerUsage: '16.8 MW Clean Energy',
        occupancy: '98% (14,500 Corporate Staff)',
        networkStatus: 'Hyper-Band Optical Grid 100%',
        description: 'Monumental 5-Tier Art-Deco Ziggurat Skyscraper clad in obsidian stone and brushed golden-brass fluted pilasters with a tiered Empire crown spire.',
        features: ['5-Tier Art-Deco Ziggurat Setbacks', 'Brushed Gold-Brass Fluted Pilasters', 'Illuminated Empire Spire'],
      },
      opts: {
        archStyle: 'art-deco-ziggurat',
        accentColor: 0xd97706,
        emissiveColor: 0xfde68a,
        windowTex: artDecoWinTex,
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
        floors: 18,
        position: [-72, 0, 125],
        dimensions: [26, 78, 28],
        powerUsage: '17.4 MW Commercial',
        occupancy: '98% (24,000 Daily Shoppers)',
        networkStatus: 'Retail Fiber Network 100%',
        description: 'Beaux-Arts Limestone & Crystal Barrel-Vaulted Galleria featuring arched stone colonnades, a full-length glass dome roof, and exterior panoramic glass elevators.',
        features: ['Barrel-Vaulted Crystal Atrium Roof', 'Beaux-Arts Arched Limestone Facade', 'Exterior Panoramic Elevators'],
      },
      opts: {
        archStyle: 'arched-crystal-galleria',
        accentColor: 0xf59e0b,
        emissiveColor: 0xfef08a,
        windowTex: entWinTex,
        billboard: { tex: bb2.texture, width: 22, height: 11 },
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
        position: [140, 0, -125],
        dimensions: [24, 125, 24],
        powerUsage: '28.5 MW (Industrial Cooled)',
        occupancy: '89% (5,400 Research Scientists)',
        networkStatus: 'Petabit High-Performance Optical Mesh',
        description: 'Kinetic Twisted Hexagonal Prism Tower composed of 6 rotated architectural tiers that spiral 45 degrees upward with emerald-teal solar glass.',
        features: ['6-Tier Twisted Hexagonal Prism Massing', 'Emerald-Teal Mirrored Curtain Wall', 'External Cryo-Cooling Spine'],
      },
      opts: {
        archStyle: 'twisted-quantum-prism',
        accentColor: 0x10b981,
        emissiveColor: 0xecfdf5,
        windowTex: emeraldWinTex,
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
        position: [210, 0, -125],
        dimensions: [22, 105, 20],
        powerUsage: '16.2 MW',
        occupancy: '95% (4,800 Engineers)',
        networkStatus: 'Gigabit Fiber Backbone',
        description: 'High-Tech Twin-Linked Cantilevered Towers clad in brushed copper-bronze and travertine stone, connected by dual aerial glass sky-bridges and a rooftop geodesic radome.',
        features: ['Twin Asymmetric Linked Towers', 'Dual Cantilevered Aerial Skybridges', 'Rooftop Geodesic Radome'],
      },
      opts: {
        archStyle: 'cantilevered-twin-linked',
        accentColor: 0xb45309,
        emissiveColor: 0xfef3c7,
        windowTex: copperWinTex,
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
        position: [210, 0, 125],
        dimensions: [22, 102, 22],
        powerUsage: '9.3 MW',
        occupancy: '99% (8,200 Residents)',
        networkStatus: 'Residential FTTH Gigabit',
        description: 'Sculpted Aqua-Wave Balcony Residential Tower featuring undulating 3D wrap-around white & terracotta balcony slabs on every level and a rooftop infinity pool deck.',
        features: ['3D Undulating Wave Balcony Slabs', 'Terracotta & Warm Timber Cladding', 'Rooftop Infinity Pool & Pergola'],
      },
      opts: {
        archStyle: 'balcony-wave-residences',
        accentColor: 0xea580c,
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
        position: [140, 0, 190],
        dimensions: [22, 88, 22],
        powerUsage: '7.6 MW',
        occupancy: '96% (6,900 Residents)',
        networkStatus: 'Residential FTTH Gigabit',
        description: 'Contemporary Biophilic Stepped Condominium Community with cascading rooftop garden terraces, wraparound glass balconies, and ground-level promenade lounges.',
        features: ['Cascading Rooftop Garden Terraces', 'Wraparound Glass Balconies', 'Ground-Floor Concierge Room'],
      },
      opts: {
        archStyle: 'biophilic-stepped-terraces',
        accentColor: 0x16a34a,
        emissiveColor: 0xfde68a,
        windowTex: biophilicWinTex,
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
        position: [72, 0, 190],
        dimensions: [24, 92, 24],
        powerUsage: '18.9 MW Commercial',
        occupancy: '97% (18,000 Visitors)',
        networkStatus: 'High-Capacity Fiber',
        description: 'Deconstructivist Angular Performing Arts & IMAX Center featuring dramatic tilted titanium wings, a spherical golden IMAX dome nested in the atrium, and skyline bistro.',
        features: ['Spherical Golden IMAX Dome', 'Tilted Titanium Deconstructivist Wings', 'Skyline Panorama Bistro'],
      },
      opts: {
        archStyle: 'deconstructivist-cultural',
        accentColor: 0xf59e0b,
        emissiveColor: 0xfef08a,
        windowTex: copperWinTex,
        hasSpire: true,
        billboard: { tex: bb2.texture, width: 20, height: 10 },
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
        position: [-72, 0, 190],
        dimensions: [22, 72, 22],
        powerUsage: '12.1 MW',
        occupancy: '92% (9,400 Visitors)',
        networkStatus: 'Exhibition Media Network',
        description: 'Sculpted Deconstructivist Exhibition Museum with cantilevered white titanium fins, panoramic glass sculpture galleries, and outdoor amphitheater.',
        features: ['Cantilevered Titanium Museum Wings', 'Glass Sculpture Rotunda', 'Outdoor Convention Plaza'],
      },
      opts: {
        archStyle: 'deconstructivist-cultural',
        accentColor: 0x38bdf8,
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
        position: [-210, 0, 46],
        dimensions: [26, 55, 26],
        powerUsage: 'Produces +450 MW Surplus',
        occupancy: '99% Automated / 450 Technicians',
        networkStatus: 'Industrial SCADA Core Secure',
        description: 'Architectural Brutalist & High-Tech Geothermal Power Complex featuring twin sculpted hyperbolic cooling towers, external copper heat-exchange conduits, and turbine hall.',
        features: ['Twin Hyperbolic Cooling Towers', 'External Copper Heat-Exchanger Pipes', '+450 MW Clean Grid Capacity'],
      },
      opts: {
        archStyle: 'industrial-hyperbolic-reactor',
        accentColor: 0xea580c,
        emissiveColor: 0xfef3c7,
        windowTex: brutalistWinTex,
        hasSpire: true,
      },
    },
  ];

  // Build each landmark using its distinct 3D Exterior Architectural Archetype
  const createDetailedTower = (item: (typeof landmarkConfigs)[0]) => {
    const { data, opts } = item;
    const bldgGroup = new THREE.Group();
    bldgGroup.position.set(data.position[0], 0, data.position[2]);

    const [w, h, d] = data.dimensions;
    const archStyle = opts.archStyle;

    // Clone texture per tower so UV repeat is exact
    const towerTex: THREE.CanvasTexture = opts.windowTex.clone();
    towerTex.needsUpdate = true;
    towerTex.repeat.set(Math.max(1, Math.round(w / 9)), Math.max(2, Math.round((h * 0.68) / 14)));

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: archStyle === 'art-deco-ziggurat' || archStyle === 'arched-crystal-galleria' ? 0.48 : 0.78,
      roughness: archStyle === 'art-deco-ziggurat' || archStyle === 'arched-crystal-galleria' ? 0.58 : 0.36,
      roughnessMap: materials.maps.facadeRoughness,
      map: towerTex,
      emissiveMap: towerTex,
      emissive: new THREE.Color(opts.emissiveColor || 0xfef3c7),
      emissiveIntensity: 0.26,
      normalMap: materials.maps.facadeNormal,
      normalScale: new THREE.Vector2(0.65, 0.65),
      envMapIntensity: 2.0,
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

    // 1. GRAND STREET-LEVEL ARCHITECTURAL PODIUM, ENTRY GATE & FURNISHED 3D INTERIOR ROOM
    const podiumH = Math.max(9.5, Math.min(12, h * 0.13));
    const roomH = 4.8;
    const upperPodiumH = Math.max(2.0, podiumH - roomH);

    const podiumAccentMat =
      archStyle === 'art-deco-ziggurat'
        ? brassGoldMat
        : archStyle === 'cantilevered-twin-linked' || archStyle === 'balcony-wave-residences'
        ? brushedCopperMat
        : materials.podiumStone;

    const podiumGeo = new THREE.BoxGeometry(w + 2.6, upperPodiumH, d + 2.6);
    const podiumMesh = new THREE.Mesh(podiumGeo, podiumAccentMat);
    podiumMesh.position.y = roomH + upperPodiumH / 2;
    podiumMesh.castShadow = true;
    podiumMesh.receiveShadow = true;
    bldgGroup.add(podiumMesh);

    const rearCoreDepth = Math.max(4, d * 0.52);
    const rearPodium = new THREE.Mesh(
      new THREE.BoxGeometry(w + 2.4, roomH, rearCoreDepth),
      materials.podiumStone
    );
    rearPodium.position.set(0, roomH / 2, -d / 2 - 1.2 + rearCoreDepth / 2);
    rearPodium.castShadow = true;
    bldgGroup.add(rearPodium);

    [-w * 0.44, w * 0.44].forEach((px) => {
      [-d / 2 - 1.25, d / 2 + 1.25].forEach((pz) => {
        const pillar = new THREE.Mesh(
          new THREE.BoxGeometry(0.95, podiumH, 0.95),
          archStyle === 'art-deco-ziggurat' ? brassGoldMat : materials.metalLight
        );
        pillar.position.set(px, podiumH / 2, pz);
        pillar.castShadow = true;
        bldgGroup.add(pillar);
      });
    });

    const themeMap: Record<string, BuildingEntryTheme> = {
      downtown: 'corporate',
      technology: 'tech',
      entertainment: 'mall',
      residential: 'residential',
      healthcare: 'hospital',
      education: 'university',
      industrial: 'tech',
    };
    const entryTheme: BuildingEntryTheme = themeMap[data.districtId] || 'corporate';

    const entryGateRoom = createBuildingEntryGateAndRoom(
      {
        title: data.name,
        theme: entryTheme,
        roomWidth: Math.min(13.5, w * 0.68),
        roomHeight: roomH,
        roomDepth: Math.min(8.5, d * 0.44),
        buildingData: data,
      },
      interactiveMeshes
    );
    entryGateRoom.position.set(0, 0, d / 2 + 0.5);
    bldgGroup.add(entryGateRoom);

    const corniceMesh = new THREE.Mesh(
      new THREE.BoxGeometry(w + 3.4, 0.8, d + 3.4),
      archStyle === 'art-deco-ziggurat' ? brassGoldMat : materials.metalDark
    );
    corniceMesh.position.y = podiumH + 0.4;
    bldgGroup.add(corniceMesh);

    const shaftH = h - podiumH;
    let primaryInteractiveMesh: THREE.Object3D = podiumMesh;

    // ============================================================================
    // 2. DISTINCT 3D EXTERIOR ARCHITECTURAL MASSING BY ARCHETYPE
    // ============================================================================
    if (archStyle === 'diagrid-obelisk') {
      // Tapered 8-sided Chamfered Obelisk wrapped in 3D Structural Steel X-Braced Diagrid
      const obeliskGeo = new THREE.CylinderGeometry(w * 0.42, w * 0.64, shaftH, 8);
      obeliskGeo.rotateY(Math.PI / 8);
      const obeliskMesh = new THREE.Mesh(obeliskGeo, bodyMat);
      obeliskMesh.position.y = podiumH + shaftH / 2;
      obeliskMesh.castShadow = true;
      obeliskMesh.receiveShadow = true;
      bldgGroup.add(obeliskMesh);
      primaryInteractiveMesh = obeliskMesh;

      // 3D External Diagrid Steel Rings every 18m + Illuminated Crystal Pyramid Crown
      for (let ry = podiumH + 14; ry < h; ry += 18) {
        const t = (ry - podiumH) / shaftH;
        const rad = THREE.MathUtils.lerp(w * 0.65, w * 0.43, t);
        const ring = new THREE.Mesh(
          new THREE.CylinderGeometry(rad, rad, 0.8, 8),
          whiteTitaniumMat
        );
        ring.rotation.y = Math.PI / 8;
        ring.position.y = ry;
        bldgGroup.add(ring);
      }

      const pyramidCrown = new THREE.Mesh(
        new THREE.ConeGeometry(w * 0.42, 22, 8),
        crystalCrownMat
      );
      pyramidCrown.rotation.y = Math.PI / 8;
      pyramidCrown.position.y = h + 11;
      bldgGroup.add(pyramidCrown);
    } else if (archStyle === 'cylindrical-helical') {
      // Tiered Cylindrical Fluted Glass Tower with 3D Spiral Helical Ribbon Fins
      const tier1H = shaftH * 0.62;
      const tier2H = shaftH * 0.38;
      const cyl1 = new THREE.Mesh(
        new THREE.CylinderGeometry(w * 0.52, w * 0.56, tier1H, 24),
        bodyMat
      );
      cyl1.position.y = podiumH + tier1H / 2;
      cyl1.castShadow = true;
      bldgGroup.add(cyl1);
      primaryInteractiveMesh = cyl1;

      const cyl2 = new THREE.Mesh(
        new THREE.CylinderGeometry(w * 0.38, w * 0.46, tier2H, 24),
        bodyMat
      );
      cyl2.position.y = podiumH + tier1H + tier2H / 2;
      cyl2.castShadow = true;
      bldgGroup.add(cyl2);
      cyl2.userData = { buildingData: data };
      interactiveMeshes.push(cyl2);

      // 3D Spiral Helical Exterior Fins Ascending Around the Cylinder
      const spiralSteps = 28;
      for (let s = 0; s < spiralSteps; s++) {
        const frac = s / spiralSteps;
        const sy = podiumH + frac * shaftH;
        const radius = frac < 0.62 ? w * 0.56 : w * 0.44;
        const angle = frac * Math.PI * 3.5;
        for (let arm = 0; arm < 2; arm++) {
          const a = angle + arm * Math.PI;
          const fin = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, (shaftH / spiralSteps) * 1.35, 0.55),
            whiteTitaniumMat
          );
          fin.position.set(Math.cos(a) * radius, sy, Math.sin(a) * radius);
          fin.rotation.y = -a;
          bldgGroup.add(fin);
        }
      }
    } else if (archStyle === 'biophilic-stepped-terraces') {
      // 4 Offset Interlocking Architectural Volumes with Lush Green Sky-Garden Terraces on Every Step
      const tiers = [
        { tw: w, td: d, th: shaftH * 0.32, ox: 0, oz: 0 },
        { tw: w * 0.84, td: d * 0.84, th: shaftH * 0.26, ox: -w * 0.08, oz: d * 0.06 },
        { tw: w * 0.68, td: d * 0.68, th: shaftH * 0.24, ox: w * 0.08, oz: -d * 0.06 },
        { tw: w * 0.52, td: d * 0.52, th: shaftH * 0.18, ox: 0, oz: 0 },
      ];
      let curY = podiumH;
      tiers.forEach((t, idx) => {
        const tMesh = new THREE.Mesh(new THREE.BoxGeometry(t.tw, t.th, t.td), bodyMat);
        tMesh.position.set(t.ox, curY + t.th / 2, t.oz);
        tMesh.castShadow = true;
        tMesh.receiveShadow = true;
        tMesh.userData = { buildingData: data };
        bldgGroup.add(tMesh);
        interactiveMeshes.push(tMesh);
        if (idx === 0) primaryInteractiveMesh = tMesh;

        curY += t.th;

        // Lush 3D Landscaped Sky-Garden Terrace Pad & Trees on top of each setback ledge
        const gardenPad = new THREE.Mesh(
          new THREE.BoxGeometry(t.tw + 1.2, 0.9, t.td + 1.2),
          skyGardenFoliageMat
        );
        gardenPad.position.set(t.ox, curY + 0.45, t.oz);
        bldgGroup.add(gardenPad);

        // Rooftop Terrace Trees around perimeter
        [-t.tw * 0.38, t.tw * 0.38].forEach((tx) => {
          [-t.td * 0.38, t.td * 0.38].forEach((tz) => {
            const treeCrown = new THREE.Mesh(
              new THREE.SphereGeometry(1.4, 8, 8),
              skyGardenFoliageMat
            );
            treeCrown.position.set(t.ox + tx, curY + 1.8, t.oz + tz);
            bldgGroup.add(treeCrown);
          });
        });
      });
    } else if (archStyle === 'art-deco-ziggurat') {
      // 5-Tier Classic New York Art-Deco Ziggurat Setback Skyscraper with Golden Brass Fluted Ribs
      const zigguratTiers = [
        { scale: 1.0, hRatio: 0.42 },
        { scale: 0.84, hRatio: 0.22 },
        { scale: 0.68, hRatio: 0.16 },
        { scale: 0.52, hRatio: 0.12 },
        { scale: 0.36, hRatio: 0.08 },
      ];
      let curY = podiumH;
      zigguratTiers.forEach((zt, idx) => {
        const tw = w * zt.scale;
        const td = d * zt.scale;
        const th = shaftH * zt.hRatio;

        const zMesh = new THREE.Mesh(new THREE.BoxGeometry(tw, th, td), bodyMat);
        zMesh.position.y = curY + th / 2;
        zMesh.castShadow = true;
        zMesh.receiveShadow = true;
        zMesh.userData = { buildingData: data };
        bldgGroup.add(zMesh);
        interactiveMeshes.push(zMesh);
        if (idx === 0) primaryInteractiveMesh = zMesh;

        // Brushed Gold-Brass Vertical Fluted Pilasters along all 4 faces
        [-tw * 0.46, -tw * 0.22, 0, tw * 0.22, tw * 0.46].forEach((px) => {
          const rib = new THREE.Mesh(
            new THREE.BoxGeometry(0.48, th, td + 0.45),
            brassGoldMat
          );
          rib.position.set(px, curY + th / 2, 0);
          bldgGroup.add(rib);
        });

        curY += th;

        // Golden Art-Deco Setback Cornice Crown Ledge
        const ledge = new THREE.Mesh(
          new THREE.BoxGeometry(tw + 1.2, 0.9, td + 1.2),
          brassGoldMat
        );
        ledge.position.y = curY + 0.45;
        bldgGroup.add(ledge);
      });
    } else if (archStyle === 'arched-crystal-galleria') {
      // Beaux-Arts Limestone & Crystal Barrel-Vaulted Galleria with Exterior Panoramic Glass Elevators
      const mainH = shaftH * 0.78;
      const galleriaBody = new THREE.Mesh(new THREE.BoxGeometry(w, mainH, d), bodyMat);
      galleriaBody.position.y = podiumH + mainH / 2;
      galleriaBody.castShadow = true;
      galleriaBody.receiveShadow = true;
      bldgGroup.add(galleriaBody);
      primaryInteractiveMesh = galleriaBody;

      // Full-Length Crystal Barrel-Vaulted Skylight Atrium Roof
      const vaultGeo = new THREE.CylinderGeometry(w * 0.46, w * 0.46, d + 1.0, 20, 1, false, 0, Math.PI);
      vaultGeo.rotateZ(Math.PI / 2);
      vaultGeo.rotateY(Math.PI / 2);
      const vaultMesh = new THREE.Mesh(vaultGeo, crystalCrownMat);
      vaultMesh.position.y = podiumH + mainH;
      bldgGroup.add(vaultMesh);

      // Golden Structural Arch Ribs over the Crystal Barrel Vault
      for (let rz = -d * 0.45; rz <= d * 0.45; rz += d * 0.225) {
        const archRib = new THREE.Mesh(
          new THREE.TorusGeometry(w * 0.47, 0.35, 8, 24, Math.PI),
          brassGoldMat
        );
        archRib.position.set(0, podiumH + mainH, rz);
        bldgGroup.add(archRib);
      }

      // Twin Exterior Glass Sightseeing Elevator Tubes on Front Facade
      [-w * 0.28, w * 0.28].forEach((ex) => {
        const elevTube = new THREE.Mesh(
          new THREE.CylinderGeometry(1.3, 1.3, mainH * 0.92, 12),
          crystalCrownMat
        );
        elevTube.position.set(ex, podiumH + mainH * 0.46, d / 2 + 0.9);
        bldgGroup.add(elevTube);
      });
    } else if (archStyle === 'twisted-quantum-prism') {
      // 6 Vertically Stacked Hexagonal Prisms Twisting 45 Degrees from Base to Crown
      const segs = 6;
      const segH = shaftH / segs;
      for (let i = 0; i < segs; i++) {
        const radius = THREE.MathUtils.lerp(w * 0.58, w * 0.44, i / segs);
        const hexGeo = new THREE.CylinderGeometry(radius * 0.95, radius, segH - 0.6, 6);
        const hexMesh = new THREE.Mesh(hexGeo, bodyMat);
        hexMesh.position.y = podiumH + i * segH + segH / 2;
        hexMesh.rotation.y = (i * Math.PI) / 16;
        hexMesh.castShadow = true;
        hexMesh.receiveShadow = true;
        hexMesh.userData = { buildingData: data };
        bldgGroup.add(hexMesh);
        interactiveMeshes.push(hexMesh);
        if (i === 0) primaryInteractiveMesh = hexMesh;

        // Glowing Cyan/Titanium Inter-Floor Ring Collar
        const collar = new THREE.Mesh(
          new THREE.CylinderGeometry(radius + 0.5, radius + 0.5, 0.65, 6),
          whiteTitaniumMat
        );
        collar.position.y = podiumH + (i + 1) * segH;
        collar.rotation.y = (i * Math.PI) / 16;
        bldgGroup.add(collar);
      }
    } else if (archStyle === 'cantilevered-twin-linked') {
      // Twin Asymmetric Brushed-Copper & Glass Towers Linked by Dual Multi-Story Aerial Skybridges + Geodesic Radome
      const towerW = w * 0.42;
      const westTower = new THREE.Mesh(new THREE.BoxGeometry(towerW, shaftH, d * 0.88), bodyMat);
      westTower.position.set(-w * 0.29, podiumH + shaftH / 2, 0);
      westTower.castShadow = true;
      westTower.userData = { buildingData: data };
      bldgGroup.add(westTower);
      interactiveMeshes.push(westTower);
      primaryInteractiveMesh = westTower;

      const eastH = shaftH * 0.84;
      const eastTower = new THREE.Mesh(new THREE.BoxGeometry(towerW, eastH, d * 0.88), bodyMat);
      eastTower.position.set(w * 0.29, podiumH + eastH / 2, 0);
      eastTower.castShadow = true;
      eastTower.userData = { buildingData: data };
      bldgGroup.add(eastTower);
      interactiveMeshes.push(eastTower);

      // Dual Aerial Glass & Copper Skybridges connecting the Twin Towers at 45% and 75% height
      [0.42, 0.72].forEach((hFrac) => {
        const bridge = new THREE.Mesh(
          new THREE.BoxGeometry(w * 0.58, 4.2, d * 0.48),
          crystalCrownMat
        );
        bridge.position.set(0, podiumH + shaftH * hFrac, 0);
        bldgGroup.add(bridge);

        const truss = new THREE.Mesh(
          new THREE.BoxGeometry(w * 0.6, 0.55, d * 0.52),
          brushedCopperMat
        );
        truss.position.set(0, podiumH + shaftH * hFrac - 2.1, 0);
        bldgGroup.add(truss);
      });

      // Rooftop Geodesic Radome Sphere on West Tower
      const radome = new THREE.Mesh(
        new THREE.IcosahedronGeometry(towerW * 0.45, 2),
        whiteTitaniumMat
      );
      radome.position.set(-w * 0.29, h + towerW * 0.35, 0);
      bldgGroup.add(radome);
    } else if (archStyle === 'balcony-wave-residences') {
      // Sculpted Aqua-Style Wave Balcony Residential Tower with 3D Undulating Wrap-Around Balcony Slabs
      const coreMesh = new THREE.Mesh(new THREE.BoxGeometry(w * 0.88, shaftH, d * 0.88), bodyMat);
      coreMesh.position.y = podiumH + shaftH / 2;
      coreMesh.castShadow = true;
      coreMesh.receiveShadow = true;
      bldgGroup.add(coreMesh);
      primaryInteractiveMesh = coreMesh;

      // 3D Undulating Wave Balcony Slabs every 5.2m up the entire tower
      for (let by = podiumH + 4; by < h - 3; by += 5.2) {
        const waveOffsetX = Math.sin(by * 0.16) * 1.4;
        const waveOffsetZ = Math.cos(by * 0.16) * 1.4;
        const balcSlab = new THREE.Mesh(
          new THREE.BoxGeometry(w + 1.8, 0.42, d + 1.8),
          whiteTitaniumMat
        );
        balcSlab.position.set(waveOffsetX, by, waveOffsetZ);
        balcSlab.castShadow = true;
        bldgGroup.add(balcSlab);
      }

      // Rooftop Infinity Pool & Resort Pergola Deck
      const poolMesh = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.62, 0.45, d * 0.45),
        crystalCrownMat
      );
      poolMesh.position.set(0, h + 0.3, 0);
      bldgGroup.add(poolMesh);
    } else if (archStyle === 'deconstructivist-cultural') {
      // Deconstructivist Angular Museum & Performing Arts Center with Tilted Titanium Wings & Golden Sphere Dome
      const lowerH = shaftH * 0.65;
      const coreMesh = new THREE.Mesh(new THREE.BoxGeometry(w * 0.82, lowerH, d * 0.82), bodyMat);
      coreMesh.position.y = podiumH + lowerH / 2;
      coreMesh.castShadow = true;
      bldgGroup.add(coreMesh);
      primaryInteractiveMesh = coreMesh;

      // Dramatic Tilted Cantilevered Titanium & Brushed-Bronze Wings
      const wingL = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.55, shaftH * 0.72, d * 0.75),
        whiteTitaniumMat
      );
      wingL.position.set(-w * 0.24, podiumH + shaftH * 0.42, 0);
      wingL.rotation.z = 0.14;
      wingL.castShadow = true;
      bldgGroup.add(wingL);

      const wingR = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.52, shaftH * 0.78, d * 0.68),
        brushedCopperMat
      );
      wingR.position.set(w * 0.24, podiumH + shaftH * 0.46, 0);
      wingR.rotation.z = -0.14;
      wingR.castShadow = true;
      bldgGroup.add(wingR);

      // Glowing Spherical IMAX / Planetarium Dome nested in front roof plaza
      const sphereDome = new THREE.Mesh(
        new THREE.SphereGeometry(w * 0.34, 20, 20),
        crystalCrownMat
      );
      sphereDome.position.set(0, podiumH + lowerH * 0.88, d * 0.18);
      bldgGroup.add(sphereDome);
    } else {
      // 'industrial-hyperbolic-reactor': Geothermal Station with Twin Sculpted Hyperbolic Cooling Towers & Copper Conduits
      const hallH = shaftH * 0.52;
      const turbineHall = new THREE.Mesh(new THREE.BoxGeometry(w, hallH, d), bodyMat);
      turbineHall.position.y = podiumH + hallH / 2;
      turbineHall.castShadow = true;
      bldgGroup.add(turbineHall);
      primaryInteractiveMesh = turbineHall;

      // Twin Sculpted Hyperbolic Paraboloid Cooling Towers rising above the Turbine Hall
      const ctH = shaftH * 0.62;
      [-w * 0.26, w * 0.26].forEach((cx) => {
        const lowerCone = new THREE.Mesh(
          new THREE.CylinderGeometry(w * 0.16, w * 0.23, ctH * 0.65, 20),
          materials.podiumStone
        );
        lowerCone.position.set(cx, podiumH + hallH + ctH * 0.32, 0);
        lowerCone.castShadow = true;
        bldgGroup.add(lowerCone);

        const upperFlare = new THREE.Mesh(
          new THREE.CylinderGeometry(w * 0.20, w * 0.16, ctH * 0.35, 20),
          materials.podiumStone
        );
        upperFlare.position.set(cx, podiumH + hallH + ctH * 0.82, 0);
        upperFlare.castShadow = true;
        bldgGroup.add(upperFlare);

        // Glowing Geothermal Rim inside Cooling Tower Throat
        const throatGlow = new THREE.Mesh(
          new THREE.CylinderGeometry(w * 0.18, w * 0.18, 0.3, 16),
          crystalCrownMat
        );
        throatGlow.position.set(cx, podiumH + hallH + ctH, 0);
        bldgGroup.add(throatGlow);
      });

      // External Copper Heat-Exchange Pipes
      [-w * 0.35, 0, w * 0.35].forEach((px) => {
        const pipe = new THREE.Mesh(
          new THREE.CylinderGeometry(0.45, 0.45, hallH, 10),
          brushedCopperMat
        );
        pipe.position.set(px, podiumH + hallH / 2, d / 2 + 0.5);
        bldgGroup.add(pipe);
      });
    }

    // 3. ROOFTOP SPIRE, HELIPAD & BILLBOARD
    if (opts.hasSpire) {
      const spireH = h * 0.18;
      const spireMat = archStyle === 'art-deco-ziggurat' ? brassGoldMat : whiteTitaniumMat;
      const spireBase = new THREE.Mesh(
        new THREE.CylinderGeometry(1.1, 2.0, spireH * 0.35, 8),
        spireMat
      );
      spireBase.position.y = h + (spireH * 0.35) / 2;
      bldgGroup.add(spireBase);

      const spire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 1.0, spireH * 0.65, 8),
        spireMat
      );
      spire.position.y = h + spireH * 0.35 + (spireH * 0.65) / 2;
      bldgGroup.add(spire);

      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), materials.neonRed);
      tip.position.y = h + spireH;
      bldgGroup.add(tip);
    }

    if (opts.hasHelipad) {
      const padRadius = w * 0.32;
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(padRadius, padRadius, 0.5, 20),
        materials.metalDark
      );
      pad.position.y = h + 0.4;
      bldgGroup.add(pad);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(padRadius * 0.72, padRadius * 0.85, 20).rotateX(-Math.PI / 2),
        materials.neonAmber
      );
      ring.position.y = h + 0.68;
      bldgGroup.add(ring);
    }

    if (opts.billboard) {
      const bb = new THREE.Mesh(
        new THREE.PlaneGeometry(opts.billboard.width, opts.billboard.height),
        new THREE.MeshBasicMaterial({ map: opts.billboard.tex, side: THREE.DoubleSide })
      );
      bb.position.set(0, podiumH + shaftH * 0.38, d / 2 + 0.65);
      bldgGroup.add(bb);
    }

    primaryInteractiveMesh.userData = { buildingData: data };
    podiumMesh.userData = { buildingData: data };
    interactiveMeshes.push(primaryInteractiveMesh, podiumMesh);
    allBuildingsData.push(data);
    group.add(bldgGroup);
  };

  landmarkConfigs.forEach(createDetailedTower);

  // Calibrate shared window textures for instanced city block buildings
  [
    downtownWinTex,
    resWinTex,
    techWinTex,
    entWinTex,
    diagridWinTex,
    artDecoWinTex,
    biophilicWinTex,
    emeraldWinTex,
    copperWinTex,
    brutalistWinTex,
  ].forEach((tex) => {
    tex.repeat.set(2, 4);
  });

  // ============================================================================
  // 3. MULTI-SHAPE, MULTI-STYLE INSTANCED CITY BLOCK ARCHITECTURE
  //    (Box Towers, Octagonal/Cylindrical Towers, Tapered Obelisks, 3D Balcony Rings,
  //     Pyramid Glass Crowns, Geodesic Dome Crowns & Diverse Cladding Palettes)
  // ============================================================================
  const fillerGeo = new THREE.BoxGeometry(1, 1, 1);
  const cylOctGeo = new THREE.CylinderGeometry(0.52, 0.54, 1, 8);
  const taperObeliskGeo = new THREE.CylinderGeometry(0.38, 0.58, 1, 4);
  taperObeliskGeo.rotateY(Math.PI / 4);
  const pyramidCrownGeo = new THREE.ConeGeometry(0.65, 1, 4);
  pyramidCrownGeo.rotateY(Math.PI / 4);
  const domeCrownGeo = new THREE.SphereGeometry(0.5, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  const hvacGeo = new THREE.BoxGeometry(1, 1, 1);

  const makeFacadeMat = (
    tex: THREE.CanvasTexture,
    district: string,
    emissiveHex: number,
    metalness = 0.72,
    roughness = 0.48
  ) => {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness,
      roughness,
      roughnessMap: materials.maps.facadeRoughness,
      map: tex,
      emissiveMap: tex,
      emissive: new THREE.Color(emissiveHex),
      emissiveIntensity: 0.25,
      normalMap: materials.maps.facadeNormal,
      normalScale: new THREE.Vector2(0.6, 0.6),
      envMapIntensity: 1.85,
    });
    mat.userData = { isWindowMaterial: true, district, baseColor: emissiveHex };
    windowMaterials.push({ material: mat, district: district as any, baseColor: new THREE.Color(emissiveHex) });
    return mat;
  };

  // 8 Distinct Exterior Architectural Materials for City Blocks
  const dtFillerMat = makeFacadeMat(downtownWinTex, 'downtown', 0xe0f2fe, 0.82, 0.35);
  const diagridFillerMat = makeFacadeMat(diagridWinTex, 'downtown', 0xbae6fd, 0.80, 0.38);
  const artDecoFillerMat = makeFacadeMat(artDecoWinTex, 'downtown', 0xfde68a, 0.62, 0.48);
  const resFillerMat = makeFacadeMat(resWinTex, 'residential', 0xfde68a, 0.45, 0.62);
  const biophilicFillerMat = makeFacadeMat(biophilicWinTex, 'residential', 0xfef3c7, 0.42, 0.60);
  const techFillerMat = makeFacadeMat(emeraldWinTex, 'technology', 0xd1fae5, 0.82, 0.34);
  const copperFillerMat = makeFacadeMat(copperWinTex, 'technology', 0xfef3c7, 0.75, 0.42);
  const entFillerMat = makeFacadeMat(entWinTex, 'entertainment', 0xfef08a, 0.48, 0.58);

  const maxPerMesh = 120;
  // Rectangular & Setback Stepped Towers across 6 distinct architectural facade styles
  const dtMesh = new THREE.InstancedMesh(fillerGeo, dtFillerMat, maxPerMesh);
  const artDecoMesh = new THREE.InstancedMesh(fillerGeo, artDecoFillerMat, maxPerMesh);
  const resMesh = new THREE.InstancedMesh(fillerGeo, resFillerMat, maxPerMesh);
  const biophilicMesh = new THREE.InstancedMesh(fillerGeo, biophilicFillerMat, maxPerMesh);
  const techMesh = new THREE.InstancedMesh(fillerGeo, techFillerMat, maxPerMesh);
  const entMesh = new THREE.InstancedMesh(fillerGeo, entFillerMat, maxPerMesh);

  // Cylindrical / Octagonal Fluted Towers & Tapered Obelisk Towers for 3D Silhouette Variety
  const cylTowerMesh = new THREE.InstancedMesh(cylOctGeo, diagridFillerMat, maxPerMesh);
  const obeliskTowerMesh = new THREE.InstancedMesh(taperObeliskGeo, copperFillerMat, maxPerMesh);

  // Podiums, Lobbies, 3D Projecting Balcony Rings, Pyramid Crowns, Geodesic Dome Crowns & Spires
  const podiumInstancedMesh = new THREE.InstancedMesh(fillerGeo, materials.podiumStone, maxPerMesh * 2);
  const lobbyInstancedMesh = new THREE.InstancedMesh(fillerGeo, materials.glassCyan, maxPerMesh * 2);
  const corniceInstancedMesh = new THREE.InstancedMesh(fillerGeo, brassGoldMat, maxPerMesh * 4);
  const balconyRingInstancedMesh = new THREE.InstancedMesh(fillerGeo, whiteTitaniumMat, maxPerMesh * 5);
  const crownInstancedMesh = new THREE.InstancedMesh(fillerGeo, materials.metalDark, maxPerMesh * 2);
  const pyramidCrownInstancedMesh = new THREE.InstancedMesh(pyramidCrownGeo, crystalCrownMat, maxPerMesh);
  const domeCrownInstancedMesh = new THREE.InstancedMesh(domeCrownGeo, brassGoldMat, maxPerMesh);
  const hvacMesh = new THREE.InstancedMesh(hvacGeo, materials.metalLight, maxPerMesh * 2);
  const spireInstancedMesh = new THREE.InstancedMesh(hvacGeo, materials.metalLight, maxPerMesh);

  const allInstancedMeshes = [
    dtMesh,
    artDecoMesh,
    resMesh,
    biophilicMesh,
    techMesh,
    entMesh,
    cylTowerMesh,
    obeliskTowerMesh,
    podiumInstancedMesh,
    lobbyInstancedMesh,
    corniceInstancedMesh,
    balconyRingInstancedMesh,
    crownInstancedMesh,
    pyramidCrownInstancedMesh,
    domeCrownInstancedMesh,
    hvacMesh,
    spireInstancedMesh,
  ];

  allInstancedMeshes.forEach((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
  });

  const dummy = new THREE.Object3D();
  const dummyPodium = new THREE.Object3D();
  const dummyLobby = new THREE.Object3D();
  const dummyCornice = new THREE.Object3D();
  const dummyBalcony = new THREE.Object3D();
  const dummyUpper = new THREE.Object3D();
  const dummyCrown = new THREE.Object3D();
  const dummyHVAC = new THREE.Object3D();
  const dummySpire = new THREE.Object3D();

  let dtIdx = 0;
  let artDecoIdx = 0;
  let resIdx = 0;
  let bioIdx = 0;
  let techIdx = 0;
  let entIdx = 0;
  let cylIdx = 0;
  let obeliskIdx = 0;
  let podIdx = 0;
  let lobbyIdx = 0;
  let corniceIdx = 0;
  let balcIdx = 0;
  let crownIdx = 0;
  let pyrCrownIdx = 0;
  let domeCrownIdx = 0;
  let hvacIdx = 0;
  let spireIdx = 0;

  // Safe City Block Centers strictly between North-South Avenues and East-West Cross Streets
  const xSectors = [-272, -210, -154, -126, -72, 72, 126, 154, 210, 272];
  const zSectors = [-285, -188, -125, -58, -28, 28, 58, 125, 190, 240, 285];

  let blockCounter = 0;
  for (const bx of xSectors) {
    for (const bz of zSectors) {
      if (Math.abs(bx) < 56) continue; // river & waterfront avenues
      if (Math.abs(bz - -220) < 28) continue; // railway corridor
      if (bx > 20 && bz < -260) continue; // airport tarmac & runway zone
      if (Math.abs(bx - -72) < 20 && bz >= -78 && bz <= -14) continue; // Central Riverside Emerald Park
      if (Math.abs(bx - 72) < 20 && bz >= 102 && bz <= 148) continue; // Tech Arboretum Park
      if (Math.abs(bx - -140) < 34 && Math.abs(bz - -188) < 22) continue; // West Bank Railway Terminal
      if (Math.abs(bx - 140) < 24 && Math.abs(bz - -188) < 22) continue; // East Bank Railway Control Tower
      if (Math.abs(bx - -210) < 18 && Math.abs(bz - -18) < 18) continue; // West EV Parking Lot
      if (Math.abs(bx - 210) < 18 && Math.abs(bz - 18) < 18) continue; // East EV Parking Lot
      if (Math.abs(bx - -272) < 20 && (Math.abs(bz - 125) < 20 || Math.abs(bz - 190) < 20)) continue; // Medical Helipad & Ambulance Bays

      // Dynamically avoid overlapping any registered Landmark, University, Hospital, or District Tower
      const overlapsLandmark = allBuildingsData.some((b) => {
        const bw = (b.dimensions[0] || 24) * 0.5 + 13;
        const bd = (b.dimensions[2] || 24) * 0.5 + 13;
        return Math.abs(bx - b.position[0]) < bw && Math.abs(bz - b.position[2]) < bd;
      });
      if (overlapsLandmark) continue;

      blockCounter++;
      // Architectural style selector (0..7) so adjacent buildings always have different silhouettes & facades
      const archVariant = Math.abs(Math.round(bx * 0.13 + bz * 0.17 + blockCounter)) % 8;

      const hNoise = Math.sin(bx * 0.05 + bz * 0.07) * 0.5 + 0.5;
      const totalH = 28 + hNoise * 76; // 28m to 104m
      const mainH = totalH * 0.72;
      const upperH = totalH * 0.28;
      const maxBlockDepth = Math.abs(bz - 240) < 5 ? 12 : 20;
      const w = 14 + (Math.cos(bx * 0.1) * 0.5 + 0.5) * 6;
      const d = Math.min(maxBlockDepth, 14 + (Math.sin(bz * 0.1) * 0.5 + 0.5) * 6);

      // 1. Street-Level Architectural Podium & Optional Open 3D Entry Gate + Room
      const podH = Math.min(7.5, totalH * 0.14);
      const hasStreetEntryGate =
        (Math.abs(bx) === 72 || Math.abs(bx) === 126 || Math.abs(bx) === 154) &&
        (Math.abs(bz) === 28 || Math.abs(bz) === 58 || Math.abs(bz) === 125);

      if (hasStreetEntryGate) {
        const blockTheme: BuildingEntryTheme =
          bx > 35 && bz > 50
            ? 'residential'
            : bz > 100
            ? 'mall'
            : bx > 35 && bz < 0
            ? 'tech'
            : 'corporate';
        const blockTitle =
          blockTheme === 'residential'
            ? `Grand Suites ${Math.abs(bx)}`
            : blockTheme === 'mall'
            ? `Galleria Arcade ${Math.abs(bx)}`
            : blockTheme === 'tech'
            ? `Cyber Innovation Wing ${Math.abs(bx)}`
            : `Metropolis Financial ${Math.abs(bx)}`;

        const blockBldgData: BuildingData = {
          id: `bldg-block-${bx}-${bz}`,
          name: blockTitle,
          districtId:
            blockTheme === 'residential'
              ? 'residential'
              : blockTheme === 'mall'
              ? 'entertainment'
              : blockTheme === 'tech'
              ? 'technology'
              : 'downtown',
          districtName:
            blockTheme === 'residential'
              ? 'Residential District'
              : blockTheme === 'mall'
              ? 'Commercial District'
              : blockTheme === 'tech'
              ? 'Technology Campus'
              : 'Financial Core',
          category: 'Skyscraper',
          height: Math.round(totalH),
          floors: Math.round(totalH / 3.2),
          position: [bx, 0, bz],
          dimensions: [w, totalH, d],
          powerUsage: '6.4 MW',
          occupancy: '94% Active',
          networkStatus: 'Metropolitan Optical Grid',
          description: `Architecturally distinctive ${blockTitle} featuring an open street-level entry gate, concierge reception desk, and furnished ground-floor interior lounge.`,
          features: ['Open Architectural Entry Gate', 'Ground-Floor Reception Room', 'Custom Exterior Facade'],
        };
        allBuildingsData.push(blockBldgData);

        const entryRoom = createBuildingEntryGateAndRoom(
          {
            title: blockTitle,
            theme: blockTheme,
            roomWidth: Math.min(10.5, w * 0.68),
            roomHeight: 4.5,
            roomDepth: Math.min(6.8, d * 0.42),
            buildingData: blockBldgData,
          },
          interactiveMeshes
        );
        const faceEast = bx < 0;
        entryRoom.position.set(bx + (faceEast ? d / 2 + 0.4 : -d / 2 - 0.4), 0, bz);
        entryRoom.rotation.y = faceEast ? Math.PI / 2 : -Math.PI / 2;
        group.add(entryRoom);
      } else {
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
      }

      // Golden / Brass Podium Cornice & Mid-Tower Setback Ledge
      if (corniceIdx + 1 < maxPerMesh * 4) {
        dummyCornice.position.set(bx, podH + 0.35, bz);
        dummyCornice.scale.set(w + 2.8, 0.7, d + 2.8);
        dummyCornice.updateMatrix();
        corniceInstancedMesh.setMatrixAt(corniceIdx++, dummyCornice.matrix);

        dummyCornice.position.set(bx, mainH, bz);
        dummyCornice.scale.set(w + 0.8, 1.4, d + 0.8);
        dummyCornice.updateMatrix();
        corniceInstancedMesh.setMatrixAt(corniceIdx++, dummyCornice.matrix);
      }

      // 2. Primary Shaft & Upper Setback Tier Matrices
      dummy.position.set(bx, mainH / 2, bz);
      dummy.scale.set(w, mainH, d);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();

      const upperW = w * (archVariant % 2 === 0 ? 0.74 : 0.64);
      const upperD = d * (archVariant % 2 === 0 ? 0.74 : 0.64);
      // Offset some upper tiers slightly for contemporary cantilevered massing!
      const offsetX = archVariant === 3 ? w * 0.08 : archVariant === 5 ? -w * 0.08 : 0;
      dummyUpper.position.set(bx + offsetX, mainH + upperH / 2, bz);
      dummyUpper.scale.set(upperW, upperH, upperD);
      dummyUpper.rotation.set(0, 0, 0);
      dummyUpper.updateMatrix();

      // 3. Assign to Diverse 3D Geometries & Facade Materials (Octagonal Cylinder, Tapered Obelisk, Art-Deco, Biophilic, Terracotta, Emerald, Sapphire)
      if (archVariant === 0 && cylIdx + 1 < maxPerMesh) {
        // Octagonal Fluted Diagrid Tower
        cylTowerMesh.setMatrixAt(cylIdx++, dummy.matrix);
        cylTowerMesh.setMatrixAt(cylIdx++, dummyUpper.matrix);
      } else if (archVariant === 1 && obeliskIdx + 1 < maxPerMesh) {
        // Tapered Copper-Bronze Obelisk Tower
        obeliskTowerMesh.setMatrixAt(obeliskIdx++, dummy.matrix);
        obeliskTowerMesh.setMatrixAt(obeliskIdx++, dummyUpper.matrix);
      } else if (archVariant === 2 && artDecoIdx + 1 < maxPerMesh) {
        // Art-Deco Charcoal & Gold Brass Ziggurat Tower
        artDecoMesh.setMatrixAt(artDecoIdx++, dummy.matrix);
        artDecoMesh.setMatrixAt(artDecoIdx++, dummyUpper.matrix);
      } else if (archVariant === 3 && bioIdx + 1 < maxPerMesh) {
        // Biophilic Green Terrace Tower
        biophilicMesh.setMatrixAt(bioIdx++, dummy.matrix);
        biophilicMesh.setMatrixAt(bioIdx++, dummyUpper.matrix);
      } else if (archVariant === 4 && resIdx + 1 < maxPerMesh) {
        // Terracotta & Balcony Residential Tower + 3D Wrap-Around Projecting Balcony Slabs
        resMesh.setMatrixAt(resIdx++, dummy.matrix);
        resMesh.setMatrixAt(resIdx++, dummyUpper.matrix);
        for (let bFloor = 1; bFloor <= 4 && balcIdx < maxPerMesh * 5; bFloor++) {
          dummyBalcony.position.set(bx, podH + (mainH - podH) * (bFloor / 4.5), bz);
          dummyBalcony.scale.set(w + 1.5, 0.45, d + 1.5);
          dummyBalcony.updateMatrix();
          balconyRingInstancedMesh.setMatrixAt(balcIdx++, dummyBalcony.matrix);
        }
      } else if (archVariant === 5 && techIdx + 1 < maxPerMesh) {
        // Emerald Mirrored High-Tech Tower
        techMesh.setMatrixAt(techIdx++, dummy.matrix);
        techMesh.setMatrixAt(techIdx++, dummyUpper.matrix);
      } else if (archVariant === 6 && entIdx + 1 < maxPerMesh) {
        // Parisian Cream Limestone & Beaux-Arts Masonry Tower
        entMesh.setMatrixAt(entIdx++, dummy.matrix);
        entMesh.setMatrixAt(entIdx++, dummyUpper.matrix);
      } else if (dtIdx + 1 < maxPerMesh) {
        // Sapphire Reflective Curtain-Wall Tower
        dtMesh.setMatrixAt(dtIdx++, dummy.matrix);
        dtMesh.setMatrixAt(dtIdx++, dummyUpper.matrix);
      }

      // 4. Varied Rooftop Architectural Crowns (Illuminated Crystal Pyramid, Golden Dome, or Stepped Parapet)
      const crownH = 3.2;
      if (archVariant === 0 || archVariant === 5) {
        if (pyrCrownIdx < maxPerMesh) {
          dummyCrown.position.set(bx + offsetX, totalH + 5.5, bz);
          dummyCrown.scale.set(upperW, 11.0, upperD);
          dummyCrown.updateMatrix();
          pyramidCrownInstancedMesh.setMatrixAt(pyrCrownIdx++, dummyCrown.matrix);
        }
      } else if (archVariant === 2 || archVariant === 6) {
        if (domeCrownIdx < maxPerMesh) {
          dummyCrown.position.set(bx + offsetX, totalH, bz);
          dummyCrown.scale.set(upperW * 0.85, 8.5, upperD * 0.85);
          dummyCrown.updateMatrix();
          domeCrownInstancedMesh.setMatrixAt(domeCrownIdx++, dummyCrown.matrix);
        }
      } else if (crownIdx < maxPerMesh * 2) {
        dummyCrown.position.set(bx + offsetX, totalH + crownH / 2, bz);
        dummyCrown.scale.set(upperW * 0.78, crownH, upperD * 0.78);
        dummyCrown.updateMatrix();
        crownInstancedMesh.setMatrixAt(crownIdx++, dummyCrown.matrix);
      }

      // 5. Rooftop Mechanical Chiller & Communication Spire
      if (hvacIdx < maxPerMesh * 2) {
        dummyHVAC.position.set(bx + upperW * 0.15, totalH + crownH + 1.1, bz - upperD * 0.15);
        dummyHVAC.scale.set(3.2, 2.0, 3.2);
        dummyHVAC.updateMatrix();
        hvacMesh.setMatrixAt(hvacIdx++, dummyHVAC.matrix);
      }

      if (totalH > 62 && spireIdx < maxPerMesh) {
        const spH = totalH * 0.18;
        dummySpire.position.set(bx + offsetX, totalH + crownH + spH / 2, bz);
        dummySpire.scale.set(0.45, spH, 0.45);
        dummySpire.updateMatrix();
        spireInstancedMesh.setMatrixAt(spireIdx++, dummySpire.matrix);
      }
    }
  }

  dtMesh.count = dtIdx;
  artDecoMesh.count = artDecoIdx;
  resMesh.count = resIdx;
  biophilicMesh.count = bioIdx;
  techMesh.count = techIdx;
  entMesh.count = entIdx;
  cylTowerMesh.count = cylIdx;
  obeliskTowerMesh.count = obeliskIdx;
  podiumInstancedMesh.count = podIdx;
  lobbyInstancedMesh.count = lobbyIdx;
  corniceInstancedMesh.count = corniceIdx;
  balconyRingInstancedMesh.count = balcIdx;
  crownInstancedMesh.count = crownIdx;
  pyramidCrownInstancedMesh.count = pyrCrownIdx;
  domeCrownInstancedMesh.count = domeCrownIdx;
  hvacMesh.count = hvacIdx;
  spireInstancedMesh.count = spireIdx;

  allInstancedMeshes.forEach((m) => {
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
    group.add(m);
  });

  // Elevated Inter-Tower Skybridges
  const skybridgeCoords = [
    { from: [-154, 56, 32], to: [-126, 56, 32], w: 4.2, h: 3.6 },
    { from: [140, 54, -125], to: [210, 54, -125], w: 4.0, h: 3.4 },
    { from: [-152, 32, -125], to: [-124, 32, -125], w: 3.8, h: 3.2 },
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
    cylOctGeo.dispose();
    taperObeliskGeo.dispose();
    pyramidCrownGeo.dispose();
    domeCrownGeo.dispose();
    hvacGeo.dispose();
    dtFillerMat.dispose();
    diagridFillerMat.dispose();
    artDecoFillerMat.dispose();
    resFillerMat.dispose();
    biophilicFillerMat.dispose();
    techFillerMat.dispose();
    copperFillerMat.dispose();
    entFillerMat.dispose();
    brassGoldMat.dispose();
    brushedCopperMat.dispose();
    whiteTitaniumMat.dispose();
    skyGardenFoliageMat.dispose();
    crystalCrownMat.dispose();
    downtownWinTex.dispose();
    techWinTex.dispose();
    resWinTex.dispose();
    entWinTex.dispose();
    diagridWinTex.dispose();
    artDecoWinTex.dispose();
    biophilicWinTex.dispose();
    emeraldWinTex.dispose();
    copperWinTex.dispose();
    brutalistWinTex.dispose();
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
