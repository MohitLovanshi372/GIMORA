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
    name: 'Neon Downtown Core',
    tagline: 'Hyper-Density Financial & AI Governance Spire',
    color: '#00f0ff',
    accentColor: '#38bdf8',
    center: [-110, 30, 0],
    cameraTarget: [-175, 110, 110],
    description: 'The towering corporate and governmental core of Neon AI City. Features soaring glass skyscrapers up to 155m, neural computational nodes, and panoramic skybridges.',
    status: 'Nominal 100% Operational',
    powerGrid: '48.2 MW Clean Geothermal',
    density: 'Very High (145,000 / km²)',
  },
  technology: {
    id: 'technology',
    name: 'Technology District',
    tagline: 'AI Research, Quantum Compute & Mohit Developer Hub',
    color: '#00ffaa',
    accentColor: '#10b981',
    center: [140, 35, -80],
    cameraTarget: [85, 95, 20],
    description: 'The cybernetic brain of the metropolis. Home to quantum research monoliths, robotics fabrication pods, and the monumental headquarters of MOHIT DEVELOPER HUB.',
    status: 'Max Compute Throughput',
    powerGrid: '92.4 MW High-Density Quantum',
    density: 'High (88,000 / km²)',
  },
  education: {
    id: 'education',
    name: 'Education District',
    tagline: 'Universities, Quantum Archives & Engineering Colleges',
    color: '#a855f7',
    accentColor: '#c084fc',
    center: [-170, 25, -170],
    cameraTarget: [-110, 85, -80],
    description: 'An advanced learning and research biome featuring Neo-Metropolis Central University, Advanced Engineering & Robotics College, Quantum Digital Library, and student cyber-hostels.',
    status: 'Active Knowledge Stream',
    powerGrid: '38.6 MW Solar Shielded',
    density: 'Medium-High (62,000 / km²)',
  },
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare District',
    tagline: 'Smart Hospital, Trauma Pavilion & Nanomedicine',
    color: '#38bdf8',
    accentColor: '#06b6d4',
    center: [-160, 25, 170],
    cameraTarget: [-95, 95, 270],
    description: 'Critical medical zone housing the Neo-Genesis Smart Hospital Mega-Tower, Aegis Rapid Emergency Pavilion, 24/7 automated bio-pharmacy, ambulance parking bays, and elevated helipads.',
    status: '24/7 Emergency Readiness',
    powerGrid: '42.0 MW Redundant Grid',
    density: 'High (55,000 / km²)',
  },
  residential: {
    id: 'residential',
    name: 'Residential District',
    tagline: 'Neo-Habitats & Modular Eco-Living Terraces',
    color: '#f59e0b',
    accentColor: '#fbbf24',
    center: [150, 25, 170],
    cameraTarget: [85, 90, 260],
    description: 'Eco-futuristic modular habitats with aerocar parking balconies, vertical hydroponic gardens, and automated climate systems for 2.1 million citizens.',
    status: 'Optimal Comfort Index 98.4%',
    powerGrid: '34.8 MW Solar-Wind Hybrid',
    density: 'Very High (110,000 / km²)',
  },
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment District',
    tagline: 'Holographic Megaplexes & Cyber Nightlife',
    color: '#ff007f',
    accentColor: '#f43f5e',
    center: [0, 25, 220],
    cameraTarget: [0, 85, 330],
    description: 'Pulsing night entertainment strip packed with 360-degree holographic concert stadiums, retro-synth gaming towers, and neon sky lounges.',
    status: 'Peak Activity (Night Mode)',
    powerGrid: '58.5 MW High-Luminance Grid',
    density: 'Peak Surge (180,000 / km²)',
  },
  industrial: {
    id: 'industrial',
    name: 'Industrial District',
    tagline: 'Geothermal Plants, Automated Fabs & Energy Hub',
    color: '#eab308',
    accentColor: '#ca8a04',
    center: [-210, 20, 0],
    cameraTarget: [-135, 75, 90],
    description: 'Heavy automated manufacturing complexes and deep-bore vulcan geothermal reactors producing +450 MW clean energy surplus for the metropolis.',
    status: 'Surplus Generation +450 MW',
    powerGrid: 'Clean Energy Producer',
    density: 'Automated (5,200 Operators)',
  },
  railway: {
    id: 'railway',
    name: 'Railway/Transport District',
    tagline: 'Grand Maglev Terminal, 4 Tracks & Control Spire',
    color: '#3b82f6',
    accentColor: '#60a5fa',
    center: [0, 25, -220],
    cameraTarget: [0, 85, -110],
    description: 'High-speed continental transit nexus comprising the Central Hyper-Transit Terminal, 4 parallel superconducting maglev tracks, raised passenger platforms, and radar control spire.',
    status: 'Superconducting Maglev Active',
    powerGrid: '52.0 MW High-Capacity Maglev',
    density: 'High Commuter Flow',
  },
  riverside: {
    id: 'riverside',
    name: 'Riverside District',
    tagline: 'Waterfront Promenades, Docks & Neon Bistros',
    color: '#06b6d4',
    accentColor: '#22d3ee',
    center: [0, 15, 0],
    cameraTarget: [-65, 55, 65],
    description: 'Scenic waterfront corridor bordering the 56m-wide cyber river. Features floating dock slips, outdoor cafes and bistros, glowing pedestrian promenades, and 3 iconic river bridges.',
    status: 'Tranquil & Monitored Flow',
    powerGrid: '12.5 MW Ambient Eco-Lighting',
    density: 'Medium (Outdoor Promenade)',
  },
  airport: {
    id: 'airport',
    name: 'Skyport Cyber Airport',
    tagline: 'Sub-Orbital Shuttles, VTOL Apron & Radar Spire',
    color: '#38bdf8',
    accentColor: '#0284c7',
    center: [180, 20, -290],
    cameraTarget: [120, 75, -210],
    description: 'The intercontinental transit gateway of Neon AI City. Features an illuminated 320m supersonic runway with sequenced strobes, automated air traffic radar spire, passenger terminal, and VTOL flight decks.',
    status: 'Airspace Cleared / Active Flights',
    powerGrid: '44.0 MW Aeronautical Grid',
    density: 'Regional & Sub-Orbital Transit',
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

  // District Gateway Holographic Pillars at district boundaries
  const gatewayLocations = [
    { text: 'ENTER TECHNOLOGY DISTRICT', x: 75, z: -80, color: materials.neonEmerald },
    { text: 'ENTER DOWNTOWN CORE', x: -75, z: 0, color: materials.neonCyan },
    { text: 'ENTER EDUCATION DISTRICT', x: -140, z: -100, color: materials.neonPurple },
    { text: 'ENTER HEALTHCARE DISTRICT', x: -140, z: 100, color: materials.neonCyan },
    { text: 'ENTER ENTERTAINMENT STRIP', x: 0, z: 160, color: materials.neonPink },
    { text: 'ENTER CENTRAL RAILWAY HUB', x: 0, z: -160, color: materials.neonBlue },
  ];

  gatewayLocations.forEach((gw) => {
    const pylonGeo = new THREE.CylinderGeometry(0.3, 0.4, 12, 8);
    const pylon = new THREE.Mesh(pylonGeo, gw.color);
    pylon.position.set(gw.x, 6, gw.z);
    group.add(pylon);

    // Glowing beacon ring
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.2, 6, 16), gw.color);
    ring.position.set(gw.x, 12, gw.z);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
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
