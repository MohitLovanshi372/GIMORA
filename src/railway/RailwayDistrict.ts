/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { BuildingData } from '../city/types';
import { CityMaterials } from '../assets/materials';

export interface RailwayDistrictSystem {
  group: THREE.Group;
  buildingsData: BuildingData[];
  interactiveMeshes: THREE.Object3D[];
  trackWaypoints: THREE.Vector3[][];
  update: (time: number) => void;
  dispose: () => void;
}

export function createRailwayDistrict(
  scene: THREE.Scene,
  materials: CityMaterials
): RailwayDistrictSystem {
  const group = new THREE.Group();
  group.name = 'railway_district';

  const buildingsData: BuildingData[] = [];
  const interactiveMeshes: THREE.Object3D[] = [];
  const trackWaypoints: THREE.Vector3[][] = [];

  const centerZ = -220;
  const trackLength = 400; // spanning X: -200 to +200

  // 1. GRAND CENTRAL TERMINAL DATA
  const stationData: BuildingData = {
    id: 'rail-central-terminal',
    name: 'Central Grand Metropolitan Railway Terminal',
    districtId: 'railway',
    districtName: 'Railway/Transport District',
    category: 'Transit Terminal',
    height: 38,
    floors: 4,
    position: [0, 0, centerZ + 35],
    dimensions: [86, 38, 48],
    powerUsage: '18.4 MW (Heavy Rail Electrification)',
    occupancy: '96% (48,000 Commuters / Hour)',
    networkStatus: 'Inter-City Dispatch Online',
    description: 'Monumental central passenger rail terminal featuring 4 heavy electrified tracks, multi-level grand passenger concourses, architectural steel canopy arches, and elevated pedestrian skywalks.',
    features: ['4 Electrified Railway Tracks', 'Architectural Steel Canopy Arches', 'Pedestrian Crossover Skywalks', 'Rail Traffic Operations Tower'],
  };
  buildingsData.push(stationData);

  // 2. GRAND ARCHED TERMINAL CONCOURSE
  const stationGroup = new THREE.Group();
  stationGroup.position.set(0, 0, centerZ + 35);

  // Concourse Main Hall
  const hallGeo = new THREE.BoxGeometry(86, 18, 44);
  const hallMesh = new THREE.Mesh(hallGeo, materials.concrete);
  hallMesh.position.y = 9;
  hallMesh.castShadow = true;
  stationGroup.add(hallMesh);

  // Glass Front Atrium & Entrance
  const atriumGeo = new THREE.BoxGeometry(78, 14, 4);
  const atrium = new THREE.Mesh(atriumGeo, materials.glassDark);
  atrium.position.set(0, 7, 22.1);
  stationGroup.add(atrium);

  // Illuminated Terminal Architectural Sign
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 1024;
  signCanvas.height = 192;
  const sCtx = signCanvas.getContext('2d')!;
  sCtx.fillStyle = '#0f172a';
  sCtx.fillRect(0, 0, 1024, 192);
  sCtx.strokeStyle = '#475569';
  sCtx.lineWidth = 6;
  sCtx.strokeRect(6, 6, 1012, 180);
  sCtx.font = 'bold 50px "Plus Jakarta Sans", sans-serif';
  sCtx.fillStyle = '#ffffff';
  sCtx.textAlign = 'center';
  sCtx.fillText('GRAND CENTRAL UNION TERMINAL', 512, 85);
  sCtx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
  sCtx.fillStyle = '#94a3b8';
  sCtx.fillText('INTERCITY PASSENGER RAIL & RAPID TRANSIT', 512, 145);

  const signTex = new THREE.CanvasTexture(signCanvas);
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(36, 6.5),
    new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide })
  );
  signMesh.position.set(0, 21, 22.3);
  stationGroup.add(signMesh);

  // Arched Roof Canopy Over Platforms (Architectural Glass and Steel)
  const canopyWidth = 86;
  const canopyRadius = 45;
  const archGeo = new THREE.CylinderGeometry(canopyRadius, canopyRadius, canopyWidth, 24, 1, true, 0, Math.PI);
  archGeo.rotateZ(Math.PI / 2);
  archGeo.rotateY(Math.PI / 2);
  const archMesh = new THREE.Mesh(archGeo, materials.glassDark);
  archMesh.position.set(0, 0, -22);
  stationGroup.add(archMesh);

  // Arched Structural Steel Truss Ribs
  for (let x = -38; x <= 38; x += 19) {
    const ribGeo = new THREE.TorusGeometry(canopyRadius, 0.45, 6, 24, Math.PI);
    ribGeo.rotateY(Math.PI / 2);
    const rib = new THREE.Mesh(ribGeo, materials.metalLight);
    rib.position.set(x, 0, -22);
    stationGroup.add(rib);
  }

  hallMesh.userData = { buildingData: stationData };
  interactiveMeshes.push(hallMesh);
  group.add(stationGroup);

  // 3. RAILWAY CONTROL TOWER
  const towerData: BuildingData = {
    id: 'rail-control-tower',
    name: 'Railway & Air Traffic Control Spire',
    districtId: 'railway',
    districtName: 'Railway/Transport District',
    category: 'Control Tower',
    height: 62,
    floors: 14,
    position: [-65, 0, centerZ + 15],
    dimensions: [16, 62, 16],
    powerUsage: '6.4 MW (Radar & Quantum Signal Core)',
    occupancy: '99% Automated / 60 Signal Officers',
    networkStatus: 'Real-Time Track Interlocking 100%',
    description: 'Autonomous dispatch and telemetry tower coordinating all continental maglev arrivals, track switches, and emergency air-brakes.',
    features: ['360° Panoramic Cab', 'High-Frequency Radar Dish', 'Automated Track Interlocking'],
  };
  buildingsData.push(towerData);

  const towerGroup = new THREE.Group();
  towerGroup.position.set(-65, 0, centerZ + 15);

  // Tower Shaft
  const towerShaft = new THREE.Mesh(
    new THREE.CylinderGeometry(4, 5.5, 48, 12),
    materials.metalDark
  );
  towerShaft.position.y = 24;
  towerShaft.castShadow = true;
  towerGroup.add(towerShaft);

  // Cantilevered Observation Cab
  const cabMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(8.5, 6.5, 9, 16),
    materials.glassCyan
  );
  cabMesh.position.y = 52;
  towerGroup.add(cabMesh);

  // Radar Dish Array
  const radarMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(3.5, 3.5, 0.4, 16),
    materials.metalLight
  );
  radarMesh.position.set(0, 58, 0);
  radarMesh.rotation.x = Math.PI / 4;
  towerGroup.add(radarMesh);

  towerShaft.userData = { buildingData: towerData };
  interactiveMeshes.push(towerShaft);
  group.add(towerGroup);

  // 4. MULTIPLE RAILWAY TRACKS NETWORK (4 PARALLEL TRACKS)
  // Track Z-Offsets: -206, -214, -226, -234
  const trackZOffsets = [centerZ + 14, centerZ + 6, centerZ - 6, centerZ - 14];

  // Concrete Track Bed / Ballast
  const ballastGeo = new THREE.PlaneGeometry(trackLength, 42);
  ballastGeo.rotateX(-Math.PI / 2);
  const ballastMat = new THREE.MeshStandardMaterial({
    color: 0x070b12,
    roughness: 0.9,
    metalness: 0.1,
  });
  const ballast = new THREE.Mesh(ballastGeo, ballastMat);
  ballast.position.set(0, 0.05, centerZ);
  ballast.receiveShadow = true;
  group.add(ballast);

  // Track Sleepers & Steel Rails
  const railGeo = new THREE.BoxGeometry(trackLength, 0.35, 0.25);
  const maglevCoreGeo = new THREE.BoxGeometry(trackLength, 0.2, 0.8);
  const sleeperCount = 180;
  const sleeperGeo = new THREE.BoxGeometry(0.35, 0.2, 4.2);

  trackZOffsets.forEach((tz) => {
    // Left Rail
    const railL = new THREE.Mesh(railGeo, materials.metalLight);
    railL.position.set(0, 0.35, tz - 1.2);
    group.add(railL);

    // Right Rail
    const railR = new THREE.Mesh(railGeo, materials.metalLight);
    railR.position.set(0, 0.35, tz + 1.2);
    group.add(railR);

    // Center Steel Conductor Rail
    const maglevRail = new THREE.Mesh(maglevCoreGeo, materials.metalDark);
    maglevRail.position.set(0, 0.25, tz);
    group.add(maglevRail);

    // Instanced Sleepers
    const instancedSleepers = new THREE.InstancedMesh(sleeperGeo, materials.metalDark, sleeperCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < sleeperCount; i++) {
      const sx = -trackLength / 2 + (i * trackLength) / sleeperCount;
      dummy.position.set(sx, 0.15, tz);
      dummy.updateMatrix();
      instancedSleepers.setMatrixAt(i, dummy.matrix);
    }
    instancedSleepers.instanceMatrix.needsUpdate = true;
    group.add(instancedSleepers);

    // Record Track Waypoints for future train simulation
    const points: THREE.Vector3[] = [];
    for (let x = -trackLength / 2; x <= trackLength / 2; x += 20) {
      points.push(new THREE.Vector3(x, 0.4, tz));
    }
    trackWaypoints.push(points);
  });

  // 4B. HIGH-SPEED ELECTRIFICATION OVERHEAD CATENARY SYSTEM
  const gantryXPositions = [-180, -140, -100, -60, 60, 100, 140, 180];
  const gantrySpanZ = 40; // spanning all 4 tracks
  const gantryHeight = 7.5;
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });

  gantryXPositions.forEach((gx) => {
    // Twin Support Masts
    [-gantrySpanZ / 2, gantrySpanZ / 2].forEach((mz) => {
      const mast = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, gantryHeight, 0.5),
        materials.metalLight
      );
      mast.position.set(gx, gantryHeight / 2, centerZ + mz);
      mast.castShadow = true;
      group.add(mast);
    });

    // Horizontal Overhead Truss Beam
    const crossBeam = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.4, gantrySpanZ),
      materials.metalLight
    );
    crossBeam.position.set(gx, gantryHeight, centerZ);
    group.add(crossBeam);

    // Insulators above each track
    trackZOffsets.forEach((tz) => {
      const dropArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6),
        materials.metalDark
      );
      dropArm.position.set(gx, gantryHeight - 0.6, tz);
      group.add(dropArm);
    });
  });

  // Longitudinal Catenary Contact Wires spanning all 4 tracks
  trackZOffsets.forEach((tz) => {
    const contactWire = new THREE.Mesh(
      new THREE.BoxGeometry(trackLength, 0.06, 0.06),
      wireMat
    );
    contactWire.position.set(0, gantryHeight - 1.2, tz);
    group.add(contactWire);

    const messengerWire = new THREE.Mesh(
      new THREE.BoxGeometry(trackLength, 0.04, 0.04),
      wireMat
    );
    messengerWire.position.set(0, gantryHeight - 0.2, tz);
    group.add(messengerWire);
  });

  // 5. RAISED PASSENGER PLATFORMS
  // Platform A (between Track 1 and 2, tz: centerZ + 10)
  // Platform B (between Track 3 and 4, tz: centerZ - 10)
  const platformLength = 140;
  const platformWidth = 5;
  const platformHeight = 1.3;
  const platGeo = new THREE.BoxGeometry(platformLength, platformHeight, platformWidth);

  [-10, 10].forEach((offsetZ, pIdx) => {
    const platGroup = new THREE.Group();
    platGroup.position.set(0, platformHeight / 2, centerZ + offsetZ);

    const platMesh = new THREE.Mesh(platGeo, materials.sidewalk);
    platMesh.receiveShadow = true;
    platGroup.add(platMesh);

    // Yellow Safety Edge Markings
    const edgeGeo = new THREE.PlaneGeometry(platformLength, 0.25);
    edgeGeo.rotateX(-Math.PI / 2);
    const leftEdge = new THREE.Mesh(edgeGeo, materials.neonAmber);
    leftEdge.position.set(0, platformHeight / 2 + 0.02, -platformWidth / 2 + 0.2);
    platGroup.add(leftEdge);

    const rightEdge = new THREE.Mesh(edgeGeo, materials.neonAmber);
    rightEdge.position.set(0, platformHeight / 2 + 0.02, platformWidth / 2 - 0.2);
    platGroup.add(rightEdge);

    // Overhead Platform Canopy Roof
    const roofGeo = new THREE.BoxGeometry(platformLength, 0.4, platformWidth + 1.2);
    const roof = new THREE.Mesh(roofGeo, materials.metalDark);
    roof.position.y = 5.2;
    platGroup.add(roof);

    // Canopy Support Pillars
    for (let px = -60; px <= 60; px += 24) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5, 8), materials.metalLight);
      col.position.set(px, 2.5, 0);
      platGroup.add(col);
    }

    // Digital Platform Sign (Amber LED Passenger Information Display)
    const pSignGeo = new THREE.PlaneGeometry(6, 1.2);
    const pSignCanvas = document.createElement('canvas');
    pSignCanvas.width = 256;
    pSignCanvas.height = 64;
    const psCtx = pSignCanvas.getContext('2d')!;
    psCtx.fillStyle = '#0f172a';
    psCtx.fillRect(0, 0, 256, 64);
    psCtx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    psCtx.fillStyle = '#f59e0b';
    psCtx.textAlign = 'center';
    psCtx.fillText(`PLATFORM 0${pIdx + 1} - EXPRESS`, 128, 42);
    const pSignTex = new THREE.CanvasTexture(pSignCanvas);
    const pSignMesh = new THREE.Mesh(pSignGeo, new THREE.MeshBasicMaterial({ map: pSignTex, side: THREE.DoubleSide }));
    pSignMesh.position.set(0, 4.2, 0);
    platGroup.add(pSignMesh);

    group.add(platGroup);
  });

  // 6. OVERHEAD PEDESTRIAN BRIDGES SPANNING THE TRACKS
  [-35, 35].forEach((bx) => {
    const bridgeSpan = 38;
    const pBridgeGroup = new THREE.Group();
    pBridgeGroup.position.set(bx, 6.8, centerZ);

    // Enclosed Glass Walkway Tube
    const tubeGeo = new THREE.BoxGeometry(5, 3.6, bridgeSpan);
    const tube = new THREE.Mesh(tubeGeo, materials.glassDark);
    pBridgeGroup.add(tube);

    // Structural Steel Frame
    const tubeFrame = new THREE.LineSegments(
      new THREE.EdgesGeometry(tubeGeo),
      new THREE.LineBasicMaterial({ color: 0x64748b })
    );
    pBridgeGroup.add(tubeFrame);

    // Vertical Access Stairs Shafts at terminal side
    const shaftGeo = new THREE.BoxGeometry(4.5, 6.8, 4.5);
    const shaft = new THREE.Mesh(shaftGeo, materials.concrete);
    shaft.position.set(0, -3.4, bridgeSpan / 2);
    pBridgeGroup.add(shaft);

    group.add(pBridgeGroup);
  });

  scene.add(group);

  const update = (time: number) => {
    radarMesh.rotation.z = time * 1.5;
  };

  const dispose = () => {
    scene.remove(group);
    hallGeo.dispose();
    atriumGeo.dispose();
    signTex.dispose();
    archGeo.dispose();
    ballastGeo.dispose();
    ballastMat.dispose();
    railGeo.dispose();
    maglevCoreGeo.dispose();
    sleeperGeo.dispose();
    platGeo.dispose();
    wireMat.dispose();
  };

  return {
    group,
    buildingsData,
    interactiveMeshes,
    trackWaypoints,
    update,
    dispose,
  };
}
