/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { BuildingData } from '../city/types';
import { CityMaterials } from '../assets/materials';

export interface AirportDistrictSystem {
  group: THREE.Group;
  interactiveMeshes: THREE.Object3D[];
  update: (time: number) => void;
  dispose: () => void;
}

export function createAirportDistrict(
  scene: THREE.Scene,
  materials: CityMaterials
): AirportDistrictSystem {
  const group = new THREE.Group();
  group.name = 'airport_district';

  const interactiveMeshes: THREE.Object3D[] = [];

  // Airport located at X: 180, Z: -290 (North-East horizon, past the railway and tech district)
  const airportCenter = new THREE.Vector3(180, 0, -290);
  group.position.copy(airportCenter);

  // 1. TARMAC & RUNWAY
  // Runway oriented along X-axis (280m long, 26m wide)
  const tarmacGeo = new THREE.PlaneGeometry(320, 110);
  tarmacGeo.rotateX(-Math.PI / 2);
  const tarmacMat = new THREE.MeshStandardMaterial({
    color: 0x070b14,
    roughness: 0.7,
    metalness: 0.3,
  });
  const tarmac = new THREE.Mesh(tarmacGeo, tarmacMat);
  tarmac.position.y = 0.05;
  tarmac.receiveShadow = true;
  group.add(tarmac);

  // Main Runway Surface
  const runwayGeo = new THREE.PlaneGeometry(280, 24);
  runwayGeo.rotateX(-Math.PI / 2);
  const runwayMat = new THREE.MeshStandardMaterial({
    color: 0x030712,
    roughness: 0.6,
    metalness: 0.4,
  });
  const runway = new THREE.Mesh(runwayGeo, runwayMat);
  runway.position.set(0, 0.08, 15);
  runway.receiveShadow = true;
  group.add(runway);

  // Runway Centerline Lights (White/Cyan glowing dashes)
  const dashCount = 28;
  const dashGeo = new THREE.BoxGeometry(4.5, 0.1, 0.8);
  const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let i = 0; i < dashCount; i++) {
    const dash = new THREE.Mesh(dashGeo, dashMat);
    dash.position.set(-130 + i * 9.6, 0.12, 15);
    group.add(dash);
  }

  // Runway Edge Lights (Cyan along north and south edge)
  const edgeLightMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
  const lightGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 6);
  const edgeCount = 30;
  for (let i = 0; i < edgeCount; i++) {
    const x = -135 + i * 9.3;
    // North edge
    const l1 = new THREE.Mesh(lightGeo, edgeLightMat);
    l1.position.set(x, 0.25, 27);
    group.add(l1);
    // South edge
    const l2 = new THREE.Mesh(lightGeo, edgeLightMat);
    l2.position.set(x, 0.25, 3);
    group.add(l2);
  }

  // Runway Threshold Green Lights (East and West ends)
  const threshMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
  for (let j = 0; j < 8; j++) {
    const z = 6 + j * 2.5;
    const tWest = new THREE.Mesh(lightGeo, threshMat);
    tWest.position.set(-138, 0.25, z);
    group.add(tWest);

    const tEast = new THREE.Mesh(lightGeo, threshMat);
    tEast.position.set(138, 0.25, z);
    group.add(tEast);
  }

  // Sequenced Approach Strobe Lights (5 poles leading into west runway)
  const approachStrobes: THREE.Mesh[] = [];
  const strobeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let s = 1; s <= 6; s++) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 4 + s * 1.5, 6), materials.metalDark);
    pole.position.set(-140 - s * 14, (4 + s * 1.5) / 2, 15);
    group.add(pole);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), strobeMat);
    bulb.position.set(-140 - s * 14, 4 + s * 1.5 + 0.3, 15);
    group.add(bulb);
    approachStrobes.push(bulb);
  }

  // 2. AIR TRAFFIC CONTROL (ATC) TOWER
  const atcBaseGeo = new THREE.CylinderGeometry(2.8, 4.2, 38, 12);
  const atcBase = new THREE.Mesh(atcBaseGeo, materials.metalDark);
  atcBase.position.set(-60, 19, -25);
  atcBase.castShadow = true;
  group.add(atcBase);

  // ATC Glass Observation Cab
  const cabGeo = new THREE.CylinderGeometry(6.2, 4.2, 6.5, 16);
  const cab = new THREE.Mesh(cabGeo, materials.glassCyan);
  cab.position.set(-60, 40, -25);
  group.add(cab);

  // Rotating Radar Dish
  const radarGroup = new THREE.Group();
  radarGroup.position.set(-60, 44.5, -25);
  const radarMast = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 3, 6), materials.metalLight);
  radarGroup.add(radarMast);
  const dishGeo = new THREE.TorusGeometry(1.6, 0.2, 4, 12, Math.PI);
  dishGeo.rotateX(Math.PI / 4);
  const dish = new THREE.Mesh(dishGeo, materials.neonAmber);
  dish.position.y = 2.2;
  radarGroup.add(dish);
  group.add(radarGroup);

  // Red beacon atop ATC
  const beaconLight = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff0044 }));
  beaconLight.position.set(-60, 47, -25);
  group.add(beaconLight);

  // 3. PASSENGER TERMINAL (Aerodynamic Cyber Canopy)
  const terminalGeo = new THREE.BoxGeometry(84, 14, 30);
  const terminal = new THREE.Mesh(terminalGeo, materials.glassCyan);
  terminal.position.set(20, 7, -25);
  terminal.castShadow = true;
  group.add(terminal);

  // Terminal roof neon edges
  const termEdges = new THREE.EdgesGeometry(terminalGeo);
  const termOutline = new THREE.LineSegments(termEdges, materials.neonCyan);
  termOutline.position.copy(terminal.position);
  group.add(termOutline);

  // Terminal Signage: "SKYPORT METRO AIRPORT"
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 512;
  signCanvas.height = 128;
  const ctx = signCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 116);
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('✈ SKYPORT METRO AIRPORT', 256, 54);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('SUB-ORBITAL & REGIONAL TRANSIT', 256, 94);
  }
  const signTex = new THREE.CanvasTexture(signCanvas);
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(36, 9),
    new THREE.MeshBasicMaterial({ map: signTex, transparent: true })
  );
  signMesh.position.set(20, 16.5, -9.8);
  group.add(signMesh);

  // 4. JET HANGARS
  for (let h = 0; h < 2; h++) {
    const hangarGeo = new THREE.CylinderGeometry(14, 14, 36, 16, 1, false, 0, Math.PI);
    hangarGeo.rotateZ(Math.PI / 2);
    hangarGeo.rotateY(Math.PI / 2);
    const hangar = new THREE.Mesh(hangarGeo, materials.metalDark);
    hangar.position.set(95 + h * 42, 0, -25);
    hangar.castShadow = true;
    group.add(hangar);

    // Hangar door neon trim
    const trim = new THREE.Mesh(new THREE.TorusGeometry(14, 0.4, 4, 16, Math.PI), materials.neonAmber);
    trim.rotation.y = Math.PI / 2;
    trim.position.set(95 + h * 42, 0, -7);
    group.add(trim);
  }

  // 5. VTOL ROTARY PADS
  for (let v = 0; v < 2; v++) {
    const padGroup = new THREE.Group();
    padGroup.position.set(-110 + v * 32, 0.15, -25);

    // Outer circle
    const padCircle = new THREE.Mesh(new THREE.RingGeometry(6, 6.6, 24), materials.neonCyan);
    padCircle.rotation.x = -Math.PI / 2;
    padGroup.add(padCircle);

    // Inner 'H'
    const barV1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 5.5), materials.neonCyan);
    barV1.position.x = -1.8;
    padGroup.add(barV1);
    const barV2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 5.5), materials.neonCyan);
    barV2.position.x = 1.8;
    padGroup.add(barV2);
    const barH = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.1, 0.7), materials.neonCyan);
    padGroup.add(barH);

    group.add(padGroup);
  }

  // 6. FUTURISTIC SUPERSONIC JET CRAFT (Parked on Apron)
  const createCyberJet = (pos: THREE.Vector3, rotY: number) => {
    const jet = new THREE.Group();
    jet.position.copy(pos);
    jet.rotation.y = rotY;

    // Fuselage
    const fuseGeo = new THREE.ConeGeometry(2.2, 18, 8);
    fuseGeo.rotateX(Math.PI / 2);
    const fuseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    const fuse = new THREE.Mesh(fuseGeo, fuseMat);
    fuse.position.y = 1.8;
    jet.add(fuse);

    // Delta Swept Wings
    const wingGeo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 1.8, 2,
      -9, 1.6, -5,
      0, 1.8, -4,

      0, 1.8, 2,
      0, 1.8, -4,
      9, 1.6, -5,
    ]);
    wingGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    wingGeo.computeVertexNormals();
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, side: THREE.DoubleSide });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    jet.add(wings);

    // Wingtip cyan neon trails
    const tipL = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6), materials.neonCyan);
    tipL.position.set(-9, 1.6, -5);
    jet.add(tipL);

    const tipR = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6), materials.neonPink);
    tipR.position.set(9, 1.6, -5);
    jet.add(tipR);

    // Twin engines with cyan thruster glow
    for (let e = -1; e <= 1; e += 2) {
      const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 4.5, 8), materials.metalDark);
      eng.rotation.x = Math.PI / 2;
      eng.position.set(e * 1.5, 1.6, -5);
      jet.add(eng);

      const glow = new THREE.Mesh(new THREE.CircleGeometry(0.6, 8), materials.neonCyan);
      glow.position.set(e * 1.5, 1.6, -7.26);
      glow.rotation.y = Math.PI;
      jet.add(glow);
    }

    return jet;
  };

  group.add(createCyberJet(new THREE.Vector3(-18, 0, -5), Math.PI * 0.15));
  group.add(createCyberJet(new THREE.Vector3(58, 0, -6), -Math.PI * 0.1));

  // Interactive Terminal Object
  const buildingData: BuildingData = {
    id: 'skyport-terminal-alpha',
    name: 'Skyport Metro Airport Terminal',
    districtId: 'airport',
    districtName: 'Skyport Cyber Airport',
    category: 'Transit Terminal',
    height: 48,
    floors: 6,
    position: [airportCenter.x + 20, 0, airportCenter.z - 25],
    dimensions: [84, 14, 30],
    powerUsage: '44.0 MW Aeronautical Grid',
    occupancy: '8,400 passengers / hour',
    networkStatus: 'Aero-Nav Radar Mesh v5.2',
    description: 'The premier continental and sub-orbital flight facility of Neon AI City. Houses 12 automated VTOL boarding fingers, supersonic passenger shuttles, and radar guidance operations.',
    isLandmark: true,
    interiorAreas: [
      'Sub-Orbital Departure Lounge',
      'Holographic Flight Boarding Nexus',
      'Air Traffic Radar Operations Deck',
      'VTOL Fast-Boarding Gateways',
    ],
    features: [
      '320m Supersonic Runway with Sequenced Strobes',
      '48m Air Traffic Control Radar Spire',
      'Twin Spaceplane Hangars',
      'Dedicated Autonomous Cargo Loading Aprons',
    ],
  };

  terminal.userData.buildingData = buildingData;
  cab.userData.buildingData = buildingData;
  interactiveMeshes.push(terminal, cab);

  scene.add(group);

  const update = (time: number) => {
    // Rotate ATC Radar
    radarGroup.rotation.y = time * 1.8;

    // Sequenced Approach Strobe Blink
    const step = Math.floor(time * 6) % 6;
    approachStrobes.forEach((bulb, idx) => {
      const mat = bulb.material as THREE.MeshBasicMaterial;
      mat.color.setHex(idx === step ? 0xffffff : 0x223344);
    });
  };

  const dispose = () => {
    scene.remove(group);
  };

  return {
    group,
    interactiveMeshes,
    update,
    dispose,
  };
}
