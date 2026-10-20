/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { BuildingData } from '../city/types';
import { CityMaterials } from '../assets/materials';
import { createProceduralWindowTexture } from '../assets/textures';
import { createBuildingEntryGateAndRoom } from './BuildingEntryRoom';

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

  const eduWinTex = createProceduralWindowTexture('#a8a29e', 8, 24, 'limestone-retail');
  const engWinTex = createProceduralWindowTexture('#0f2942', 8, 24, 'diagrid-steel');
  const labWinTex = createProceduralWindowTexture('#064e3b', 8, 16, 'emerald-curtain');
  const hostelWinTex = createProceduralWindowTexture('#7c2d12', 8, 24, 'modern-residential');

  // 1. NEO-METROPOLIS UNIVERSITY MAIN HALL
  const uniData: BuildingData = {
    id: 'edu-university-main',
    name: 'Neo-Metropolis Central University',
    districtId: 'education',
    districtName: 'Education District',
    category: 'University',
    height: 88,
    floors: 26,
    position: [-152, 0, -125],
    dimensions: [28, 88, 26],
    powerUsage: '7.8 MW (Solar Shielded)',
    occupancy: '96% (12,800 Students & Academics)',
    networkStatus: 'Universal Knowledge Uplink Active',
    description: 'Grand quadrangle university hall with stepped glass atrium, central cyber clocktower, and lecture amphitheaters.',
    features: ['Holographic Lecture Halls', 'Central Cyber Clocktower', 'Terraced Student Plaza'],
  };
  buildingsData.push(uniData);

  const uniGroup = new THREE.Group();
  uniGroup.position.set(-152, 0, -125);

  // Base Quadrangle
  const uniBaseMat = new THREE.MeshStandardMaterial({
    map: eduWinTex,
    emissiveMap: eduWinTex,
    emissive: new THREE.Color(0x3b82f6),
    emissiveIntensity: 1.8,
    roughness: 0.26,
    metalness: 0.74,
    normalMap: materials.maps.facadeNormal,
    normalScale: new THREE.Vector2(0.55, 0.55),
    envMapIntensity: 1.4,
  });
  uniBaseMat.userData = { isWindowMaterial: true, district: 'education', baseColor: 0x3b82f6 };
  const uniBase = new THREE.Mesh(new THREE.BoxGeometry(28, 40, 26), uniBaseMat);
  uniBase.position.y = 20;
  uniBase.castShadow = true;
  uniGroup.add(uniBase);

  // Center Stepped Atrium & Tower
  const uniTowerMat = new THREE.MeshStandardMaterial({
    map: eduWinTex,
    emissiveMap: eduWinTex,
    emissive: new THREE.Color(0xfef3c7),
    emissiveIntensity: 0.2,
    roughness: 0.25,
    metalness: 0.6,
    normalMap: materials.maps.facadeNormal,
    normalScale: new THREE.Vector2(0.6, 0.6),
    envMapIntensity: 1.5,
  });
  uniTowerMat.userData = { isWindowMaterial: true, district: 'education', baseColor: 0xfef3c7 };
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

  // Traditional Warm Backlit University Clock Orb
  const clockBeacon = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 12), materials.neonWhite);
  clockBeacon.position.y = 112;
  uniGroup.add(clockBeacon);

  const uniEntryGate = createBuildingEntryGateAndRoom(
    {
      title: uniData.name,
      theme: 'university',
      roomWidth: 12.5,
      roomHeight: 4.8,
      roomDepth: 7.5,
      buildingData: uniData,
    },
    interactiveMeshes
  );
  uniEntryGate.position.set(0, 0, 13.5);
  uniGroup.add(uniEntryGate);

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
    position: [-210, 0, -125],
    dimensions: [24, 78, 22],
    powerUsage: '14.5 MW (Robotics Fabricators)',
    occupancy: '94% (6,400 Engineers)',
    networkStatus: 'Direct SCADA & Simulation Mesh',
    description: 'Angular cantilevered high-tech engineering campus with exposed structural trusses and automated aerial drone testing bays.',
    features: ['Autonomous Drone Launch Gantry', 'Cantilevered Glass Wings', 'Mechatronic Labs'],
  };
  buildingsData.push(engData);

  const engGroup = new THREE.Group();
  engGroup.position.set(-210, 0, -125);

  // Main vertical shaft
  const engCoreMat = new THREE.MeshStandardMaterial({
    map: engWinTex,
    emissiveMap: engWinTex,
    emissive: new THREE.Color(0x3b82f6),
    emissiveIntensity: 1.8,
    roughness: 0.24,
    metalness: 0.88,
    normalMap: materials.maps.facadeNormal,
    normalScale: new THREE.Vector2(0.6, 0.6),
    envMapIntensity: 1.5,
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

  const engEntryGate = createBuildingEntryGateAndRoom(
    {
      title: engData.name,
      theme: 'tech',
      roomWidth: 11.0,
      roomHeight: 4.6,
      roomDepth: 7.0,
      buildingData: engData,
    },
    interactiveMeshes
  );
  engEntryGate.position.set(0, 0, 9.5);
  engGroup.add(engEntryGate);

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
    position: [-272, 0, -125],
    dimensions: [28, 44, 22],
    powerUsage: '3.8 MW (Solar Roof)',
    occupancy: '98% (3,800 Students)',
    networkStatus: 'Safe Educational Sandbox 100%',
    description: 'Stepped terrace academy for primary and secondary education with panoramic solar canopies.',
    features: ['Terraced Playgrounds', 'Solar Shading Louvers', 'Interactive Science Pods'],
  };
  buildingsData.push(schoolData);

  const schoolGroup = new THREE.Group();
  schoolGroup.position.set(-272, 0, -125);

  // 3-Tier Stepped Terrace Academy with Solar Louver Overhangs & Rooftop Science Dome
  const schoolMat = new THREE.MeshStandardMaterial({ map: eduWinTex, roughness: 0.42, metalness: 0.45 });
  const schoolTier1 = new THREE.Mesh(new THREE.BoxGeometry(28, 18, 22), schoolMat);
  schoolTier1.position.y = 9;
  schoolTier1.castShadow = true;
  schoolGroup.add(schoolTier1);

  const schoolTier2 = new THREE.Mesh(new THREE.BoxGeometry(22, 14, 18), schoolMat);
  schoolTier2.position.set(-2, 25, 0);
  schoolTier2.castShadow = true;
  schoolGroup.add(schoolTier2);

  const schoolTier3 = new THREE.Mesh(new THREE.BoxGeometry(15, 12, 14), schoolMat);
  schoolTier3.position.set(-4, 38, 0);
  schoolTier3.castShadow = true;
  schoolGroup.add(schoolTier3);

  // Geodesic Botanical & Astronomy Dome on Tier 2 Terrace
  const schoolDome = new THREE.Mesh(
    new THREE.SphereGeometry(5.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    materials.glassCyan
  );
  schoolDome.position.set(6, 18, 0);
  schoolGroup.add(schoolDome);

  // Terraced solar shading canopies
  [18.2, 32.2, 44.2].forEach((sy, idx) => {
    const sw = 30 - idx * 6;
    const sd = 24 - idx * 4;
    const solarRoof = new THREE.Mesh(
      new THREE.BoxGeometry(sw, 0.8, sd),
      materials.metalLight
    );
    solarRoof.position.set(-idx * 2, sy, 0);
    schoolGroup.add(solarRoof);
  });

  schoolTier1.userData = { buildingData: schoolData };
  interactiveMeshes.push(schoolTier1);
  group.add(schoolGroup);

  // 4. METROPOLITAN UNIVERSITY LIBRARY
  const libData: BuildingData = {
    id: 'edu-digital-library',
    name: 'Metropolitan University Library & Archives',
    districtId: 'education',
    districtName: 'Education District',
    category: 'Digital Library',
    height: 52,
    floors: 12,
    position: [-272, 0, -188],
    dimensions: [30, 52, 30],
    powerUsage: '8.2 MW',
    occupancy: '89% (5,200 Researchers & Visitors)',
    networkStatus: 'Campus High-Speed Fiber 100 Gbps',
    description: 'A monument of academic knowledge featuring a grand geodesic glass reading dome framed by structural dark steel trusses.',
    features: ['Geodesic Glass Reading Atrium', 'Rare Manuscripts Archives', 'Digital Research Vaults'],
  };
  buildingsData.push(libData);

  const libGroup = new THREE.Group();
  libGroup.position.set(-272, 0, -188);

  // Hexagonal Podium
  const libPodium = new THREE.Mesh(
    new THREE.CylinderGeometry(18, 20, 16, 6),
    materials.metalDark
  );
  libPodium.position.y = 8;
  libPodium.castShadow = true;
  libGroup.add(libPodium);

  // Geodesic Glass Reading Dome
  const domeGeo = new THREE.IcosahedronGeometry(15, 2);
  const domeMesh = new THREE.Mesh(domeGeo, materials.glassDark);
  domeMesh.position.y = 16;
  libGroup.add(domeMesh);

  // Architectural Structural Dome Ribs (Dark Steel Space Frame)
  const ribGeo = new THREE.TorusGeometry(15.2, 0.25, 8, 32);
  const rib1 = new THREE.Mesh(ribGeo, materials.metalDark);
  rib1.position.y = 16;
  rib1.rotation.x = Math.PI / 2;
  libGroup.add(rib1);

  const rib2 = new THREE.Mesh(ribGeo, materials.metalDark);
  rib2.position.y = 16;
  rib2.rotation.y = Math.PI / 2;
  libGroup.add(rib2);

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
    position: [-210, 0, -188],
    dimensions: [24, 96, 20],
    powerUsage: '18.4 MW (Superconducting Coils)',
    occupancy: '91% (4,800 Scientists)',
    networkStatus: 'Synchrotron Grid Synchronized',
    description: 'Twin high-rise cylindrical research towers joined by dual enclosed glass skybridges at upper levels.',
    features: ['Dual Enclosed Skybridges', 'Twin Research Cylinders', 'Particle Simulation Hub'],
  };
  buildingsData.push(resData);

  const resGroup = new THREE.Group();
  resGroup.position.set(-210, 0, -188);

  // Tower A & B
  const labMat = new THREE.MeshStandardMaterial({
    map: labWinTex,
    emissiveMap: labWinTex,
    emissive: new THREE.Color(0x3b82f6),
    emissiveIntensity: 1.8,
    metalness: 0.84,
    roughness: 0.18,
    normalMap: materials.maps.facadeNormal,
    normalScale: new THREE.Vector2(0.6, 0.6),
    envMapIntensity: 1.5,
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

  // 6. STUDENT RESIDENCE HALL
  const hostelData: BuildingData = {
    id: 'edu-student-hostel',
    name: 'Aurora Student Residence Hall Complex',
    districtId: 'education',
    districtName: 'Education District',
    category: 'Student Hostel',
    height: 68,
    floors: 20,
    position: [-124, 0, -125],
    dimensions: [20, 68, 20],
    powerUsage: '5.2 MW',
    occupancy: '99% (4,100 Residents)',
    networkStatus: 'Campus Fiber Network 100%',
    description: 'High-density modern residential community with study lounges, shared social atriums, and student amenities.',
    features: ['Staggered Balconies', 'Study Lounges', 'Campus Dining Commons'],
  };
  buildingsData.push(hostelData);

  const hostelGroup = new THREE.Group();
  hostelGroup.position.set(-124, 0, -125);

  const hostelMat = new THREE.MeshStandardMaterial({ map: hostelWinTex, metalness: 0.45, roughness: 0.55 });
  const hostelMesh = new THREE.Mesh(new THREE.BoxGeometry(20, 68, 20), hostelMat);
  hostelMesh.position.y = 34;
  hostelMesh.castShadow = true;
  hostelGroup.add(hostelMesh);

  // Staggered Projecting Student Balconies on Every 2nd Floor
  for (let by = 8; by < 64; by += 6.5) {
    const balc = new THREE.Mesh(
      new THREE.BoxGeometry(21.6, 0.45, 21.6),
      materials.metalLight
    );
    balc.position.set(Math.sin(by) * 0.6, by, Math.cos(by) * 0.6);
    hostelGroup.add(balc);
  }

  hostelMesh.userData = { buildingData: hostelData };
  interactiveMeshes.push(hostelMesh);
  group.add(hostelGroup);

  // 7. NANOTECHNOLOGY & SCIENCE LABORATORY (Octagonal Cleanroom Complex with External Filtration Scrubbers)
  const labData: BuildingData = {
    id: 'edu-nano-lab',
    name: 'Nanotechnology & Quantum Materials Lab',
    districtId: 'education',
    districtName: 'Education District',
    category: 'Science Laboratory',
    height: 52,
    floors: 14,
    position: [-272, 0, -46],
    dimensions: [26, 52, 24],
    powerUsage: '11.2 MW (Cleanroom Environmental Control)',
    occupancy: '88% (2,400 Nanotechnologists)',
    networkStatus: 'Class-100 Cleanroom Certified',
    description: 'Hermetic octagonal scientific facility with external stainless-steel air filtration scrubbers and vibration-isolated cleanrooms.',
    features: ['Octagonal Cleanroom Core', 'External Filtration Scrubber Towers', 'Vibration-Damped Basement'],
  };
  buildingsData.push(labData);

  const labGroup = new THREE.Group();
  labGroup.position.set(-272, 0, -46);

  const labMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(12, 13, 52, 8),
    new THREE.MeshStandardMaterial({ map: labWinTex, metalness: 0.82, roughness: 0.24 })
  );
  labMesh.position.y = 26;
  labMesh.castShadow = true;
  labGroup.add(labMesh);

  // External Stainless-Steel Cleanroom Filtration Scrubber Silos around perimeter
  for (let a = 0; a < 4; a++) {
    const ang = (a * Math.PI) / 2 + Math.PI / 4;
    const silo = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.4, 56, 12),
      materials.metalLight
    );
    silo.position.set(Math.cos(ang) * 13.2, 28, Math.sin(ang) * 13.2);
    labGroup.add(silo);
  }

  labMesh.userData = { buildingData: labData };
  interactiveMeshes.push(labMesh);
  group.add(labGroup);

  scene.add(group);

  const update = (_time: number) => {
    // Realistic static architectural structures
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
