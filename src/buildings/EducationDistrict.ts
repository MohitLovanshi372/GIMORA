/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { BuildingData } from '../city/types';
import { CityMaterials } from '../assets/materials';
import { createProceduralWindowTexture } from '../assets/textures';

export interface EducationDistrictSystem {
  group: THREE.Group;
  buildingsData: BuildingData[];
  interactiveMeshes: THREE.Object3D[];
  update: (time: number) => void;
  dispose: () => void;
}

export function createEducationDistrict(
  scene: THREE.Scene,
  materials: CityMaterials
): EducationDistrictSystem {
  const group = new THREE.Group();
  group.name = 'education_district';

  const buildingsData: BuildingData[] = [];
  const interactiveMeshes: THREE.Object3D[] = [];

  const eduWinTex = createProceduralWindowTexture('#a855f7', 8, 24);
  const engWinTex = createProceduralWindowTexture('#3b82f6', 8, 24);
  const labWinTex = createProceduralWindowTexture('#00ffcc', 8, 16);

  // 1. NEO-METROPOLIS UNIVERSITY MAIN HALL
  const uniData: BuildingData = {
    id: 'edu-university-main',
    name: 'Neo-Metropolis Central University',
    districtId: 'education',
    districtName: 'Education District',
    category: 'University',
    height: 88,
    floors: 26,
    position: [-160, 0, -140],
    dimensions: [32, 88, 28],
    powerUsage: '7.8 MW (Solar Shielded)',
    occupancy: '96% (12,800 Students & Academics)',
    networkStatus: 'Universal Knowledge Uplink Active',
    description: 'Grand quadrangle university hall with stepped glass atrium, central cyber clocktower, and lecture amphitheaters.',
    features: ['Holographic Lecture Halls', 'Central Cyber Clocktower', 'Terraced Student Plaza'],
  };
  buildingsData.push(uniData);

  const uniGroup = new THREE.Group();
  uniGroup.position.set(-160, 0, -140);

  // Base Quadrangle
  const uniBaseMat = new THREE.MeshStandardMaterial({
    map: eduWinTex,
    emissiveMap: eduWinTex,
    emissive: new THREE.Color(0x3b82f6),
    emissiveIntensity: 1.8,
    roughness: 0.3,
    metalness: 0.7,
  });
  uniBaseMat.userData = { isWindowMaterial: true, district: 'education', baseColor: 0x3b82f6 };
  const uniBase = new THREE.Mesh(new THREE.BoxGeometry(32, 40, 28), uniBaseMat);
  uniBase.position.y = 20;
  uniBase.castShadow = true;
  uniGroup.add(uniBase);

  // Center Stepped Atrium & Tower
  const uniTowerMat = new THREE.MeshStandardMaterial({
    map: eduWinTex,
    emissiveMap: eduWinTex,
    emissive: new THREE.Color(0x3b82f6),
    emissiveIntensity: 1.8,
    roughness: 0.2,
    metalness: 0.8,
  });
  uniTowerMat.userData = { isWindowMaterial: true, district: 'education', baseColor: 0x3b82f6 };
  const uniTower = new THREE.Mesh(new THREE.BoxGeometry(16, 48, 16), uniTowerMat);
  uniTower.position.y = 64;
  uniTower.castShadow = true;
  uniGroup.add(uniTower);

  // Spire Clocktower
  const uniSpire = new THREE.Mesh(
    new THREE.ConeGeometry(2.5, 24, 6),
    materials.metalLight
  );
  uniSpire.position.y = 100;
  uniGroup.add(uniSpire);

  const clockBeacon = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), materials.neonPurple);
  clockBeacon.position.y = 112;
  uniGroup.add(clockBeacon);

  uniBase.userData = { buildingData: uniData };
  interactiveMeshes.push(uniBase);
  group.add(uniGroup);

  // 2. ADVANCED ENGINEERING & ROBOTICS COLLEGE
  const engData: BuildingData = {
    id: 'edu-engineering-college',
    name: 'Advanced Engineering & Robotics College',
    districtId: 'education',
    districtName: 'Education District',
    category: 'Engineering College',
    height: 78,
    floors: 22,
    position: [-200, 0, -180],
    dimensions: [26, 78, 24],
    powerUsage: '14.5 MW (Robotics Fabricators)',
    occupancy: '94% (6,400 Engineers)',
    networkStatus: 'Direct SCADA & Simulation Mesh',
    description: 'Angular cantilevered high-tech engineering campus with exposed structural trusses and automated aerial drone testing bays.',
    features: ['Autonomous Drone Launch Gantry', 'Cantilevered Glass Wings', 'Mechatronic Labs'],
  };
  buildingsData.push(engData);

  const engGroup = new THREE.Group();
  engGroup.position.set(-200, 0, -180);

  // Main vertical shaft
  const engCoreMat = new THREE.MeshStandardMaterial({
    map: engWinTex,
    emissiveMap: engWinTex,
    emissive: new THREE.Color(0x3b82f6),
    emissiveIntensity: 1.8,
    roughness: 0.3,
    metalness: 0.85,
  });
  engCoreMat.userData = { isWindowMaterial: true, district: 'education', baseColor: 0x3b82f6 };
  const engCore = new THREE.Mesh(new THREE.BoxGeometry(18, 78, 18), engCoreMat);
  engCore.position.y = 39;
  engCore.castShadow = true;
  engGroup.add(engCore);

  // Cantilevered overhang wing
  const engWing = new THREE.Mesh(
    new THREE.BoxGeometry(28, 18, 22),
    materials.glassDark
  );
  engWing.position.set(4, 52, 0);
  engWing.castShadow = true;
  engGroup.add(engWing);

  // Glowing blue truss outlines
  const engEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(28.2, 18.2, 22.2)),
    materials.neonBlue
  );
  engEdges.position.set(4, 52, 0);
  engGroup.add(engEdges);

  engCore.userData = { buildingData: engData };
  interactiveMeshes.push(engCore);
  group.add(engGroup);

  // 3. FUTURE ACADEMY SCHOOL
  const schoolData: BuildingData = {
    id: 'edu-future-school',
    name: 'Neo-Nexus Future Academy',
    districtId: 'education',
    districtName: 'Education District',
    category: 'School',
    height: 44,
    floors: 10,
    position: [-130, 0, -200],
    dimensions: [36, 44, 22],
    powerUsage: '3.8 MW (Solar Roof)',
    occupancy: '98% (3,800 Students)',
    networkStatus: 'Safe Educational Sandbox 100%',
    description: 'Stepped bio-terrace academy for primary and secondary cybernetic education with panoramic solar canopies.',
    features: ['Bio-Terraced Playgrounds', 'Solar Shading Louvers', 'Immersive Hologram Pods'],
  };
  buildingsData.push(schoolData);

  const schoolGroup = new THREE.Group();
  schoolGroup.position.set(-130, 0, -200);

  const schoolMesh = new THREE.Mesh(
    new THREE.BoxGeometry(36, 44, 22),
    new THREE.MeshStandardMaterial({ map: eduWinTex, roughness: 0.4, metalness: 0.6 })
  );
  schoolMesh.position.y = 22;
  schoolMesh.castShadow = true;
  schoolGroup.add(schoolMesh);

  // Terraced solar roof
  const solarRoof = new THREE.Mesh(
    new THREE.BoxGeometry(38, 1.2, 24),
    materials.metalLight
  );
  solarRoof.position.y = 44.6;
  schoolGroup.add(solarRoof);

  schoolMesh.userData = { buildingData: schoolData };
  interactiveMeshes.push(schoolMesh);
  group.add(schoolGroup);

  // 4. QUANTUM DIGITAL LIBRARY
  const libData: BuildingData = {
    id: 'edu-digital-library',
    name: 'Quantum Digital Library & Planetary Archives',
    districtId: 'education',
    districtName: 'Education District',
    category: 'Digital Library',
    height: 52,
    floors: 12,
    position: [-170, 0, -220],
    dimensions: [34, 52, 34],
    powerUsage: '8.2 MW (Crystal Optical Storage)',
    occupancy: '89% (5,200 Researchers & Visitors)',
    networkStatus: 'Immutable Crystal Data Bus 100 Gbps',
    description: 'A monument of planetary knowledge featuring a grand geodesic reading dome surrounded by optical data pylons.',
    features: ['Geodesic Cyber Dome', 'Concentric Holographic Rings', 'Optical Crystal Vaults'],
  };
  buildingsData.push(libData);

  const libGroup = new THREE.Group();
  libGroup.position.set(-170, 0, -220);

  // Hexagonal Podium
  const libPodium = new THREE.Mesh(
    new THREE.CylinderGeometry(18, 20, 16, 6),
    materials.metalDark
  );
  libPodium.position.y = 8;
  libPodium.castShadow = true;
  libGroup.add(libPodium);

  // Geodesic Glass Dome
  const domeGeo = new THREE.IcosahedronGeometry(15, 2);
  const domeMesh = new THREE.Mesh(domeGeo, materials.glassCyan);
  domeMesh.position.y = 16;
  libGroup.add(domeMesh);

  // Concentric Glowing Orbit Rings
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(17, 0.4, 8, 32), materials.neonPurple);
  ring1.position.y = 22;
  ring1.rotation.x = Math.PI / 4;
  libGroup.add(ring1);

  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(19, 0.4, 8, 32), materials.neonCyan);
  ring2.position.y = 22;
  ring2.rotation.y = Math.PI / 3;
  libGroup.add(ring2);

  libPodium.userData = { buildingData: libData };
  interactiveMeshes.push(libPodium);
  group.add(libGroup);

  // 5. APPLIED SCIENCE RESEARCH CENTER
  const resData: BuildingData = {
    id: 'edu-science-research',
    name: 'Applied Science & Quantum Research Towers',
    districtId: 'education',
    districtName: 'Education District',
    category: 'Research Center',
    height: 96,
    floors: 30,
    position: [-220, 0, -130],
    dimensions: [28, 96, 24],
    powerUsage: '18.4 MW (Superconducting Coils)',
    occupancy: '91% (4,800 Scientists)',
    networkStatus: 'Synchrotron Grid Synchronized',
    description: 'Twin high-rise cylindrical research towers joined by dual enclosed glass skybridges at upper levels.',
    features: ['Dual Enclosed Skybridges', 'Twin Research Cylinders', 'Particle Simulation Hub'],
  };
  buildingsData.push(resData);

  const resGroup = new THREE.Group();
  resGroup.position.set(-220, 0, -130);

  // Tower A & B
  const labMat = new THREE.MeshStandardMaterial({
    map: labWinTex,
    emissiveMap: labWinTex,
    emissive: new THREE.Color(0x3b82f6),
    emissiveIntensity: 1.8,
    metalness: 0.8,
    roughness: 0.2,
  });
  labMat.userData = { isWindowMaterial: true, district: 'education', baseColor: 0x3b82f6 };

  const tGeo = new THREE.CylinderGeometry(6, 6, 96, 16);
  const towerA = new THREE.Mesh(tGeo, labMat);
  towerA.position.set(-8, 48, 0);
  towerA.castShadow = true;
  resGroup.add(towerA);

  const towerB = new THREE.Mesh(tGeo, labMat);
  towerB.position.set(8, 48, 0);
  towerB.castShadow = true;
  resGroup.add(towerB);

  // Skybridge 1 (Y: 50)
  const skybridgeGeo = new THREE.BoxGeometry(16, 4.5, 4.5);
  const sb1 = new THREE.Mesh(skybridgeGeo, materials.glassCyan);
  sb1.position.set(0, 50, 0);
  resGroup.add(sb1);

  // Skybridge 2 (Y: 76)
  const sb2 = new THREE.Mesh(skybridgeGeo, materials.glassCyan);
  sb2.position.set(0, 76, 0);
  resGroup.add(sb2);

  towerA.userData = { buildingData: resData };
  interactiveMeshes.push(towerA);
  group.add(resGroup);

  // 6. STUDENT CYBER-HOSTEL
  const hostelData: BuildingData = {
    id: 'edu-student-hostel',
    name: 'Aurora Student Cyber-Hostel Complex',
    districtId: 'education',
    districtName: 'Education District',
    category: 'Student Hostel',
    height: 68,
    floors: 20,
    position: [-120, 0, -150],
    dimensions: [24, 68, 20],
    powerUsage: '5.2 MW',
    occupancy: '99% (4,100 Residents)',
    networkStatus: 'Campus Fiber Network 100%',
    description: 'High-density modular housing block with cantilevered study balconies, shared social atriums, and gym pods.',
    features: ['Staggered Balconies', 'Automated Laundry Chutes', 'Campus Pod Dining'],
  };
  buildingsData.push(hostelData);

  const hostelMesh = new THREE.Mesh(
    new THREE.BoxGeometry(24, 68, 20),
    new THREE.MeshStandardMaterial({ map: eduWinTex, metalness: 0.6, roughness: 0.4 })
  );
  hostelMesh.position.set(-120, 34, -150);
  hostelMesh.castShadow = true;
  hostelMesh.userData = { buildingData: hostelData };
  interactiveMeshes.push(hostelMesh);
  group.add(hostelMesh);

  // 7. NANOTECHNOLOGY & SCIENCE LABORATORY
  const labData: BuildingData = {
    id: 'edu-nano-lab',
    name: 'Nanotechnology & Quantum Materials Lab',
    districtId: 'education',
    districtName: 'Education District',
    category: 'Science Laboratory',
    height: 52,
    floors: 14,
    position: [-210, 0, -230],
    dimensions: [28, 52, 26],
    powerUsage: '11.2 MW (Cleanroom Environmental Control)',
    occupancy: '88% (2,400 Nanotechnologists)',
    networkStatus: 'Class-100 Cleanroom Certified',
    description: 'Hermetic scientific testing facility with specialized mechanical filtration stacks and vibration-isolated foundations.',
    features: ['Class-100 Cleanrooms', 'Exhaust Filtration Scrubbers', 'Vibration-Damped Basement'],
  };
  buildingsData.push(labData);

  const labMesh = new THREE.Mesh(
    new THREE.BoxGeometry(28, 52, 26),
    new THREE.MeshStandardMaterial({ map: labWinTex, metalness: 0.85, roughness: 0.2 })
  );
  labMesh.position.set(-210, 26, -230);
  labMesh.castShadow = true;
  labMesh.userData = { buildingData: labData };
  interactiveMeshes.push(labMesh);
  group.add(labMesh);

  scene.add(group);

  const update = (time: number) => {
    ring1.rotation.z = time * 0.4;
    ring2.rotation.x = time * 0.5;
  };

  const dispose = () => {
    scene.remove(group);
    eduWinTex.dispose();
    engWinTex.dispose();
    labWinTex.dispose();
  };

  return {
    group,
    buildingsData,
    interactiveMeshes,
    update,
    dispose,
  };
}
