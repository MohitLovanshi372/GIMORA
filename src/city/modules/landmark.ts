/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { BuildingData } from '../types';

export interface LandmarkSystem {
  group: THREE.Group;
  landmarkData: BuildingData;
  interactiveMeshes: THREE.Object3D[];
  update: (time: number) => void;
  dispose: () => void;
}

export function createMohitDeveloperHubLandmark(scene: THREE.Scene): LandmarkSystem {
  const group = new THREE.Group();
  group.name = 'mohit_developer_hub_landmark';

  // Positioned in the prime sector of the Technology District
  const posX = 140;
  const posY = 0.2;
  const posZ = -80;
  const lotWidth = 36;
  const lotDepth = 36;

  group.position.set(posX, posY, posZ);

  // Building metadata for the inspector panel
  const landmarkData: BuildingData = {
    id: 'landmark-mohit-developer-hub',
    name: 'MOHIT DEVELOPER HUB (Reserved Site)',
    districtId: 'technology',
    districtName: 'Technology District',
    category: 'Landmark',
    height: 120, // Planned future building height
    floors: 38,
    position: [posX, posY, posZ],
    dimensions: [lotWidth, 120, lotDepth],
    powerUsage: '0.0 MW (Grid Provisioned 45.0 MW)',
    occupancy: 'Awaiting Construction Deployment',
    networkStatus: 'Hyper-Band 100 Gbps Pre-Allocated',
    description: 'Reserved prime tech-sector landmark site dedicated to the future MOHIT DEVELOPER HUB headquarters. Features pre-provisioned neural grid uplinks, quantum data trunks, and holographic structural foundation schematics.',
    isLandmark: true,
  };

  const interactiveMeshes: THREE.Object3D[] = [];

  // 1. Foundation Base Slab
  const slabGeo = new THREE.BoxGeometry(lotWidth, 0.6, lotDepth);
  const slabMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.9,
    roughness: 0.2,
  });
  const slabMesh = new THREE.Mesh(slabGeo, slabMat);
  slabMesh.position.y = 0.3;
  slabMesh.receiveShadow = true;
  group.add(slabMesh);

  // 2. Holographic Ground Grid (Cyan/Emerald)
  const gridHelper = new THREE.GridHelper(lotWidth - 2, 18, 0x00ffcc, 0x006655);
  gridHelper.position.y = 0.62;
  group.add(gridHelper);

  // 3. Perimeter Warning Boundary Line (Hazard Glowing Amber/Cyan)
  const boundaryGeo = new THREE.BoxGeometry(lotWidth + 0.5, 0.2, lotDepth + 0.5);
  const boundaryEdges = new THREE.EdgesGeometry(boundaryGeo);
  const boundaryMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 2 });
  const boundaryLine = new THREE.LineSegments(boundaryEdges, boundaryMat);
  boundaryLine.position.y = 0.65;
  group.add(boundaryLine);

  // 4. Four Corner Laser Beacon Pylons
  const pylonGeo = new THREE.CylinderGeometry(0.6, 0.8, 3.5, 8);
  const pylonMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85 });
  const beaconGlowMat = new THREE.MeshBasicMaterial({ color: 0x00ffaa });

  // Vertical light beams
  const beamGeo = new THREE.CylinderGeometry(0.15, 0.4, 80, 8);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
  });

  const halfW = lotWidth / 2 - 2;
  const halfD = lotDepth / 2 - 2;
  const cornerPositions = [
    [-halfW, -halfD],
    [halfW, -halfD],
    [-halfW, halfD],
    [halfW, halfD],
  ];

  cornerPositions.forEach(([cx, cz]) => {
    const pylon = new THREE.Mesh(pylonGeo, pylonMat);
    pylon.position.set(cx, 1.75, cz);
    pylon.castShadow = true;
    group.add(pylon);

    const glowOrb = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), beaconGlowMat);
    glowOrb.position.set(cx, 3.6, cz);
    group.add(glowOrb);

    // Light beam shooting into sky
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(cx, 40, cz);
    group.add(beam);
  });

  // 5. Floating Holographic Wireframe Cube (Rotating Future Blueprint)
  const holoGeo = new THREE.BoxGeometry(16, 28, 16);
  const holoEdges = new THREE.EdgesGeometry(holoGeo);
  const holoMat = new THREE.LineBasicMaterial({
    color: 0x00ffcc,
    transparent: true,
    opacity: 0.8,
  });
  const holoBlueprint = new THREE.LineSegments(holoEdges, holoMat);
  holoBlueprint.position.set(0, 18, 0);
  group.add(holoBlueprint);

  // Inner pulsing core
  const coreGeo = new THREE.OctahedronGeometry(4, 0);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    wireframe: true,
    transparent: true,
    opacity: 0.6,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  coreMesh.position.set(0, 18, 0);
  group.add(coreMesh);

  // 6. Holographic Billboard / 3D Canvas Sign
  const createHoloCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cyan Neon Border
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    // Top Sub-header
    ctx.font = 'bold 36px "Chakra Petch", monospace';
    ctx.fillStyle = '#00ffaa';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ RESERVED PRIME LANDMARK LOT ⚡', canvas.width / 2, 64);

    // Main Title
    ctx.font = 'bold 64px "Chakra Petch", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('MOHIT DEVELOPER HUB', canvas.width / 2, 140);

    // Bottom Status
    ctx.font = '28px "Plus Jakarta Sans", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('SECTOR: TECH-01 · STATUS: READY FOR ARCHITECTURE DEPLOYMENT', canvas.width / 2, 204);

    return canvas;
  };

  const canvas = createHoloCanvas();
  const holoTexture = new THREE.CanvasTexture(canvas);
  const signGeo = new THREE.PlaneGeometry(24, 6);
  const signMat = new THREE.MeshBasicMaterial({
    map: holoTexture,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const signMeshFront = new THREE.Mesh(signGeo, signMat);
  signMeshFront.position.set(0, 8.5, lotDepth / 2 + 0.1);
  group.add(signMeshFront);

  const signMeshBack = new THREE.Mesh(signGeo, signMat);
  signMeshBack.position.set(0, 8.5, -lotDepth / 2 - 0.1);
  signMeshBack.rotation.y = Math.PI;
  group.add(signMeshBack);

  // Interactive Click Target Box covering the entire reserved area
  const clickTargetGeo = new THREE.BoxGeometry(lotWidth, 35, lotDepth);
  const clickTargetMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
  });
  const clickTarget = new THREE.Mesh(clickTargetGeo, clickTargetMat);
  clickTarget.position.y = 17.5;
  clickTarget.userData = { buildingData: landmarkData };
  group.add(clickTarget);
  interactiveMeshes.push(clickTarget);

  scene.add(group);

  const update = (time: number) => {
    // Rotate holographic future building blueprint
    holoBlueprint.rotation.y = time * 0.4;
    coreMesh.rotation.y = -time * 0.6;
    coreMesh.rotation.x = Math.sin(time) * 0.3;

    // Pulse beam opacity
    const pulse = 0.35 + Math.sin(time * 3) * 0.15;
    beamMat.opacity = pulse;
    holoMat.opacity = 0.6 + Math.sin(time * 2) * 0.25;
  };

  const dispose = () => {
    scene.remove(group);
    slabGeo.dispose();
    slabMat.dispose();
    gridHelper.dispose();
    boundaryGeo.dispose();
    boundaryEdges.dispose();
    boundaryMat.dispose();
    pylonGeo.dispose();
    pylonMat.dispose();
    beaconGlowMat.dispose();
    beamGeo.dispose();
    beamMat.dispose();
    holoGeo.dispose();
    holoEdges.dispose();
    holoMat.dispose();
    coreGeo.dispose();
    coreMat.dispose();
    signGeo.dispose();
    signMat.dispose();
    holoTexture.dispose();
    clickTargetGeo.dispose();
    clickTargetMat.dispose();
  };

  return {
    group,
    landmarkData,
    interactiveMeshes,
    update,
    dispose,
  };
}
