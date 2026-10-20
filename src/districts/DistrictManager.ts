/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { DistrictId, DistrictInfo } from '../city/types';
import { CityMaterials } from '../assets/materials';

export const DISTRICT_REGISTRY: Record<DistrictId, DistrictInfo> = {
  downtown: {
    id: 'downtown',
    name: 'Downtown Dubai & Burj Khalifa',
    tagline: 'Home of the World’s Tallest Megatall Skyscraper (285m)',
    color: '#38bdf8',
    accentColor: '#0284c7',
    center: [-132, 45, -52],
    cameraTarget: [-190, 120, 75],
    description: 'The monumental core of Dubai. Features the 285m Burj Khalifa with 27 helical setbacks, the choreographed Dubai Fountain lagoon, Armani suites, and global banking towers.',
    status: 'Nominal 100% Operational',
    powerGrid: '56.4 MW Clean Solar Grid',
    density: 'Very High (160,000 / km²)',
  },
  technology: {
    id: 'technology',
    name: 'Dubai Future District',
    tagline: 'Museum of the Future, AI Research & Mohit Developer Hub',
    color: '#10b981',
    accentColor: '#059669',
    center: [145, 35, -46],
    cameraTarget: [70, 85, 50],
    description: 'The innovation center of Dubai along Sheikh Zayed Road. Home to the torus-shaped Museum of the Future with Arabic calligraphy, computing research centers, and MOHIT DEVELOPER HUB headquarters.',
    status: 'Max Compute Throughput',
    powerGrid: '98.5 MW High-Density Grid',
    density: 'High (95,000 / km²)',
  },
  education: {
    id: 'education',
    name: 'Zabeel & Cultural District',
    tagline: 'The Dubai Frame, Universities & Research Quadrangle',
    color: '#8b5cf6',
    accentColor: '#7c3aed',
    center: [-152, 25, -125],
    cameraTarget: [-95, 85, -45],
    description: 'Cultural and academic campus anchored by The Dubai Frame with its golden towers and glass skybridge, university academies, and engineering research libraries.',
    status: 'Active Academic Session',
    powerGrid: '38.6 MW Solar Grid',
    density: 'Medium-High (62,000 / km²)',
  },
  healthcare: {
    id: 'healthcare',
    name: 'Dubai Healthcare City',
    tagline: 'Metropolitan General Hospital & Medical Campus',
    color: '#06b6d4',
    accentColor: '#0891b2',
    center: [-152, 25, 190],
    cameraTarget: [-95, 95, 275],
    description: 'Major medical center housing the General Hospital Tower, Emergency Pavilion, 24/7 central pharmacy, ambulance parking bays, and rooftop helipad.',
    status: '24/7 Emergency Readiness',
    powerGrid: '42.0 MW Redundant Grid',
    density: 'High (55,000 / km²)',
  },
  residential: {
    id: 'residential',
    name: 'Dubai Marina & JBR',
    tagline: 'Cayan 90° Twisting Tower & Luxury Marina Residences',
    color: '#f59e0b',
    accentColor: '#d97706',
    center: [130, 25, 125],
    cameraTarget: [75, 90, 205],
    description: 'World-renowned waterfront skyscraper district. Features the 90-degree twisting Cayan Tower, luxury high-rise condominium spires, private yacht berths, and palm promenades.',
    status: 'Optimal Comfort Index 99.2%',
    powerGrid: '44.8 MW Solar-Wind Hybrid',
    density: 'Very High (135,000 / km²)',
  },
  entertainment: {
    id: 'entertainment',
    name: 'Commercial & Retail Mall',
    tagline: 'Grand Luxury Shopping Galleria & Atrium Promenade',
    color: '#ec4899',
    accentColor: '#db2777',
    center: [-72, 25, 125],
    cameraTarget: [-20, 85, 215],
    description: 'Vibrant commercial center packed with luxury shopping boutiques, fine dining restaurants, multiplex cinemas, and the municipal performing arts center.',
    status: 'Peak Activity',
    powerGrid: '58.5 MW Commercial Grid',
    density: 'High (180,000 / km²)',
  },
  industrial: {
    id: 'industrial',
    name: 'Industrial District',
    tagline: 'Geothermal Generation, Logistics Hub & Utility Plants',
    color: '#eab308',
    accentColor: '#ca8a04',
    center: [-210, 20, 46],
    cameraTarget: [-135, 75, 120],
    description: 'Automated logistics complexes and deep-bore geothermal reactors producing +450 MW clean energy surplus for the metropolis.',
    status: 'Surplus Generation +450 MW',
    powerGrid: 'Clean Energy Producer',
    density: 'Industrial (5,200 Operators)',
  },
  railway: {
    id: 'railway',
    name: 'Railway & Transit Hub',
    tagline: 'Grand Union Terminal, 4 Heavy Rail Tracks & Concourse',
    color: '#3b82f6',
    accentColor: '#2563eb',
    center: [-140, 25, -195],
    cameraTarget: [-140, 85, -105],
    description: 'High-speed continental transit nexus comprising the Grand Union Terminal, 4 parallel rail tracks, covered passenger platforms, and signaling tower.',
    status: 'Express Rail Active',
    powerGrid: '52.0 MW High-Capacity Grid',
    density: 'High Commuter Flow',
  },
  riverside: {
    id: 'riverside',
    name: 'Jumeirah Waterfront & Burj Al Arab',
    tagline: 'Burj Al Arab Luxury Island, Superyachts & Coastal Lagoon',
    color: '#0ea5e9',
    accentColor: '#0284c7',
    center: [-72, 20, 50],
    cameraTarget: [-125, 65, 115],
    description: 'Exclusive coastal district featuring the iconic sail-shaped Burj Al Arab on its private island, luxury mega-yachts, private causeway bridge, and waterfront dining promenades.',
    status: 'Exclusive Coastal Resort',
    powerGrid: '22.5 MW Ambient Eco-Lighting',
    density: 'Luxury Resort & Marine Marina',
  },
  airport: {
    id: 'airport',
    name: 'Dubai International Aviation Gateway',
    tagline: 'Commercial Runway, Jet Terminals & ATC Tower',
    color: '#38bdf8',
    accentColor: '#0284c7',
    center: [180, 20, -335],
    cameraTarget: [120, 75, -245],
    description: 'The intercontinental aviation gateway of Dubai. Features an illuminated 320m runway with FAA standard lighting, automated air traffic control tower, modern passenger terminal, and aircraft stands.',
    status: 'Airspace Cleared / Active Flights',
    powerGrid: '44.0 MW Aeronautical Grid',
    density: 'Commercial Aviation Transit',
  },
};

export interface DistrictManagerSystem {
  group: THREE.Group;
  update: (time: number) => void;
  dispose: () => void;
}

export function createDistrictManager(
  scene: THREE.Scene,
  materials: CityMaterials
): DistrictManagerSystem {
  const group = new THREE.Group();
  group.name = 'district_manager';

  // Municipal Architectural Entry Monuments at district plaza corners (clear of all roads and bridges)
  const gatewayLocations = [
    { text: 'TECHNOLOGY DISTRICT', sub: 'MOHIT DEVELOPER HUB & RESEARCH', x: 114, z: -15 },
    { text: 'DOWNTOWN FINANCIAL CORE', sub: 'WORLD FINANCIAL CENTER', x: -114, z: -15 },
    { text: 'EDUCATION DISTRICT', sub: 'UNIVERSITY & RESEARCH QUADRANGLE', x: -114, z: -103 },
    { text: 'HEALTHCARE DISTRICT', sub: 'METROPOLIS GENERAL MEDICAL CENTER', x: -114, z: 173 },
    { text: 'COMMERCIAL & RETAIL', sub: 'GALLERIA & PERFORMING ARTS', x: -58, z: 103 },
    { text: 'CENTRAL RAILWAY HUB', sub: 'GRAND UNION TRANSIT TERMINAL', x: -114, z: -173 },
  ];

  gatewayLocations.forEach((gw) => {
    const monumentGroup = new THREE.Group();
    monumentGroup.position.set(gw.x, 0, gw.z);

    // Granite / Concrete Base Plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.6, 2.2), materials.concrete);
    plinth.position.y = 0.3;
    plinth.receiveShadow = true;
    monumentGroup.add(plinth);

    // Architectural Stone Monolith Pylon
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(3.6, 6.2, 1.4), materials.metalDark);
    pylon.position.y = 3.7;
    pylon.castShadow = true;
    monumentGroup.add(pylon);

    // Brushed Aluminum / Bronze Cast District Plaque
    const plaqueCanvas = document.createElement('canvas');
    plaqueCanvas.width = 512;
    plaqueCanvas.height = 256;
    const pCtx = plaqueCanvas.getContext('2d')!;
    pCtx.fillStyle = '#0f172a';
    pCtx.fillRect(0, 0, 512, 256);
    pCtx.strokeStyle = '#94a3b8';
    pCtx.lineWidth = 6;
    pCtx.strokeRect(6, 6, 500, 244);
    pCtx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
    pCtx.fillStyle = '#f8fafc';
    pCtx.textAlign = 'center';
    pCtx.fillText(gw.text, 256, 105);
    pCtx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    pCtx.fillStyle = '#94a3b8';
    pCtx.fillText(gw.sub, 256, 165);

    const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
    const plaqueMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 1.6),
      new THREE.MeshBasicMaterial({ map: plaqueTex })
    );
    plaqueMesh.position.set(0, 4.0, 0.72);
    monumentGroup.add(plaqueMesh);

    // Architectural Ground Uplight Luminaire
    const luminaire = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.4), materials.metalLight);
    luminaire.position.set(0, 0.65, 0.9);
    monumentGroup.add(luminaire);

    group.add(monumentGroup);
  });

  scene.add(group);

  const update = (time: number) => {};
  const dispose = () => {
    scene.remove(group);
  };

  return {
    group,
    update,
    dispose,
  };
}
