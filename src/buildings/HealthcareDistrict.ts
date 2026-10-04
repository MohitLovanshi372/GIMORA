/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { BuildingData } from '../city/types';
import { CityMaterials } from '../assets/materials';
import { createProceduralWindowTexture } from '../assets/textures';

export interface HealthcareDistrictSystem {
  group: THREE.Group;
  buildingsData: BuildingData[];
  interactiveMeshes: THREE.Object3D[];
  update: (time: number) => void;
  dispose: () => void;
}

export function createHealthcareDistrict(
  scene: THREE.Scene,
  materials: CityMaterials
): HealthcareDistrictSystem {
  const group = new THREE.Group();
  group.name = 'healthcare_district';

  const buildingsData: BuildingData[] = [];
  const interactiveMeshes: THREE.Object3D[] = [];

  const healthWinTex = createProceduralWindowTexture('#38bdf8', 8, 28);
  const researchWinTex = createProceduralWindowTexture('#00f0ff', 8, 24);

  // 1. SMART HOSPITAL MEGA-TOWER
  const hospitalData: BuildingData = {
    id: 'health-smart-hospital',
    name: 'Neo-Genesis Smart Hospital Mega-Tower',
    districtId: 'healthcare',
    districtName: 'Healthcare District',
    category: 'Smart Hospital',
    height: 122,
    floors: 38,
    position: [-160, 0, 160],
    dimensions: [28, 122, 28],
    powerUsage: '16.8 MW (Redundant Uninterruptible Grid)',
    occupancy: '92% (8,400 Patients & Medical Staff)',
    networkStatus: 'Bio-Telemetry Real-Time Link Active',
    description: 'Premier smart hospital citadel equipped with robotic surgical suites, autonomous diagnostics, and regenerative cellular therapy chambers.',
    features: ['Robotic Surgical Suites', 'Nanomedicine ICUs', 'Rooftop Helipad Link', 'Cyan Medical Beacon'],
  };
  buildingsData.push(hospitalData);

  const hospGroup = new THREE.Group();
  hospGroup.position.set(-160, 0, 160);

  // Hospital Main Tower
  const hospMat = new THREE.MeshStandardMaterial({
    map: healthWinTex,
    emissiveMap: healthWinTex,
    emissive: new THREE.Color(0x06b6d4),
    emissiveIntensity: 1.8,
    roughness: 0.25,
    metalness: 0.8,
  });
  hospMat.userData = { isWindowMaterial: true, district: 'healthcare', baseColor: 0x06b6d4 };
  const hospMesh = new THREE.Mesh(new THREE.BoxGeometry(28, 122, 28), hospMat);
  hospMesh.position.y = 61;
  hospMesh.castShadow = true;
  hospGroup.add(hospMesh);

  // Rooftop Medical Cross Sign (Cyan)
  const crossGroup = new THREE.Group();
  crossGroup.position.set(0, 125, 14.2);
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(2.4, 8, 0.4), materials.neonCyan);
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(8, 2.4, 0.4), materials.neonCyan);
  crossGroup.add(crossV);
  crossGroup.add(crossH);
  hospGroup.add(crossGroup);

  hospMesh.userData = { buildingData: hospitalData };
  interactiveMeshes.push(hospMesh);
  group.add(hospGroup);

  // 2. EMERGENCY CENTER & TRAUMA PAVILION
  const emergencyData: BuildingData = {
    id: 'health-emergency-center',
    name: 'Aegis Rapid Emergency & Trauma Pavilion',
    districtId: 'healthcare',
    districtName: 'Healthcare District',
    category: 'Emergency Center',
    height: 36,
    floors: 8,
    position: [-195, 0, 130],
    dimensions: [34, 36, 26],
    powerUsage: '8.4 MW (Instant Backup Storage)',
    occupancy: '95% (24/7 Rapid Response)',
    networkStatus: 'Priority Emergency Dispatch Link',
    description: 'Critical trauma reception facility with multi-lane ambulance airlocks, hyperbaric chambers, and immediate resuscitation pods.',
    features: ['Multi-Lane Ambulance Airlock', 'Strobe Emergency Perimeter', 'Direct Triage Access'],
  };
  buildingsData.push(emergencyData);

  const emGroup = new THREE.Group();
  emGroup.position.set(-195, 0, 130);

  const emMat = new THREE.MeshStandardMaterial({
    map: healthWinTex,
    emissiveMap: healthWinTex,
    emissive: new THREE.Color(0x06b6d4),
    emissiveIntensity: 1.8,
    roughness: 0.3,
    metalness: 0.7,
  });
  emMat.userData = { isWindowMaterial: true, district: 'healthcare', baseColor: 0x06b6d4 };
  const emMesh = new THREE.Mesh(new THREE.BoxGeometry(34, 36, 26), emMat);
  emMesh.position.y = 18;
  emMesh.castShadow = true;
  emGroup.add(emMesh);

  // Red & Cyan Emergency Beacon Strip around canopy
  const emStrobe = new THREE.Mesh(
    new THREE.BoxGeometry(34.4, 0.6, 26.4),
    materials.neonRed
  );
  emStrobe.position.y = 10;
  emGroup.add(emStrobe);

  emMesh.userData = { buildingData: emergencyData };
  interactiveMeshes.push(emMesh);
  group.add(emGroup);

  // 3. AUTOMATED BIO-PHARMACY & SYNTHESIS HUB
  const pharmData: BuildingData = {
    id: 'health-pharmacy',
    name: 'Omni-Bio Automated Pharmacy & Synthesis Hub',
    districtId: 'healthcare',
    districtName: 'Healthcare District',
    category: 'Pharmacy',
    height: 28,
    floors: 6,
    position: [-125, 0, 130],
    dimensions: [22, 28, 22],
    powerUsage: '4.2 MW',
    occupancy: '99% Automated Robotic Dispensing',
    networkStatus: 'Encrypted Prescription Relay',
    description: 'Automated 24/7 molecular pharmacy providing custom-synthesized pharmaceuticals via high-speed pneumatic tubes and drone couriers.',
    features: ['24/7 Robotic Drug Synthesis', 'Drone Dispensing Tubes', 'Sterile Cleanrooms'],
  };
  buildingsData.push(pharmData);

  const pharmGroup = new THREE.Group();
  pharmGroup.position.set(-125, 0, 130);

  const pharmMesh = new THREE.Mesh(
    new THREE.BoxGeometry(22, 28, 22),
    materials.glassCyan
  );
  pharmMesh.position.y = 14;
  pharmMesh.castShadow = true;
  pharmGroup.add(pharmMesh);

  // Pharmacy Green Cross
  const pCross = new THREE.Group();
  pCross.position.set(0, 18, 11.2);
  const pcv = new THREE.Mesh(new THREE.BoxGeometry(1.4, 4.5, 0.2), materials.neonEmerald);
  const pch = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.4, 0.2), materials.neonEmerald);
  pCross.add(pcv);
  pCross.add(pch);
  pharmGroup.add(pCross);

  pharmMesh.userData = { buildingData: pharmData };
  interactiveMeshes.push(pharmMesh);
  group.add(pharmGroup);

  // 4. AMBULANCE PARKING & STAGING BAYS
  const ambParkingGroup = new THREE.Group();
  ambParkingGroup.position.set(-195, 0, 160);

  // Sheltered Canopy
  const canopyGeo = new THREE.BoxGeometry(26, 0.8, 18);
  const canopyMesh = new THREE.Mesh(canopyGeo, materials.metalDark);
  canopyMesh.position.y = 5.2;
  ambParkingGroup.add(canopyMesh);

  // Support Columns
  [-11, 11].forEach((cx) => {
    [-7, 7].forEach((cz) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 5, 8), materials.metalLight);
      col.position.set(cx, 2.5, cz);
      ambParkingGroup.add(col);
    });
  });

  // Ambulances (3 Cyber-Ambulances parked in bays)
  for (let i = 0; i < 3; i++) {
    const amb = new THREE.Group();
    amb.position.set(-7 + i * 7, 0, 0);

    const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 5.8), materials.metalLight);
    body.position.y = 1.3;
    amb.add(body);

    // Strobe bar on roof
    const strobe = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.3, 0.6), materials.neonRed);
    strobe.position.y = 2.5;
    amb.add(strobe);

    ambParkingGroup.add(amb);
  }
  group.add(ambParkingGroup);

  // 5. ELEVATED EMERGENCY HELIPAD
  const heliGroup = new THREE.Group();
  heliGroup.position.set(-160, 0, 120);

  // Sturdy Support Pylon
  const heliPylon = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 24, 12), materials.metalDark);
  heliPylon.position.y = 12;
  heliGroup.add(heliPylon);

  // Circular Deck
  const deckRadius = 11;
  const heliDeck = new THREE.Mesh(new THREE.CylinderGeometry(deckRadius, deckRadius, 0.8, 24), materials.metalDark);
  heliDeck.position.y = 24.4;
  heliGroup.add(heliDeck);

  // Glowing Cyan Landing Ring
  const heliRing = new THREE.Mesh(new THREE.TorusGeometry(deckRadius, 0.25, 8, 32), materials.neonCyan);
  heliRing.position.y = 24.85;
  heliRing.rotation.x = Math.PI / 2;
  heliGroup.add(heliRing);

  // "H" Marking
  const hLine1 = new THREE.Mesh(new THREE.PlaneGeometry(1, 6), materials.neonAmber);
  hLine1.rotateX(-Math.PI / 2);
  hLine1.position.set(-2, 24.86, 0);
  heliGroup.add(hLine1);

  const hLine2 = new THREE.Mesh(new THREE.PlaneGeometry(1, 6), materials.neonAmber);
  hLine2.rotateX(-Math.PI / 2);
  hLine2.position.set(2, 24.86, 0);
  heliGroup.add(hLine2);

  const hCross = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 1), materials.neonAmber);
  hCross.rotateX(-Math.PI / 2);
  hCross.position.set(0, 24.86, 0);
  heliGroup.add(hCross);

  group.add(heliGroup);

  // 6. MEDICAL RESEARCH CITADEL
  const medResData: BuildingData = {
    id: 'health-medical-research',
    name: 'Genomics & Neural Medical Research Citadel',
    districtId: 'healthcare',
    districtName: 'Healthcare District',
    category: 'Medical Research',
    height: 84,
    floors: 24,
    position: [-170, 0, 220],
    dimensions: [26, 84, 26],
    powerUsage: '12.6 MW',
    occupancy: '90% (4,100 Scientists)',
    networkStatus: 'Bio-Secure Neural Mesh 100%',
    description: 'High-containment genomic engineering center advancing cybernetic organ synthesis, genetic repair, and longevity therapies.',
    features: ['DNA Double-Helix Plaza', 'Containment Level-4 Labs', 'Synthetic Organ Bio-Printers'],
  };
  buildingsData.push(medResData);

  const medResMesh = new THREE.Mesh(
    new THREE.BoxGeometry(26, 84, 26),
    new THREE.MeshStandardMaterial({ map: researchWinTex, roughness: 0.2, metalness: 0.85 })
  );
  medResMesh.position.set(-170, 42, 220);
  medResMesh.castShadow = true;
  medResMesh.userData = { buildingData: medResData };
  interactiveMeshes.push(medResMesh);
  group.add(medResMesh);

  scene.add(group);

  const update = (time: number) => {
    // Pulse emergency lights
    const emPulse = Math.sin(time * 8) > 0 ? 1.0 : 0.3;
    emStrobe.scale.set(1, emPulse, 1);
  };

  const dispose = () => {
    scene.remove(group);
    healthWinTex.dispose();
    researchWinTex.dispose();
  };

  return {
    group,
    buildingsData,
    interactiveMeshes,
    update,
    dispose,
  };
}
