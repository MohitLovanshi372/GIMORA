/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { BuildingData } from '../city/types';
import { CityMaterials } from '../assets/materials';

export interface AirportDistrictSystem {
  group: THREE.Group;
  buildingsData: BuildingData[];
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

  const buildingsData: BuildingData[] = [];
  const interactiveMeshes: THREE.Object3D[] = [];

  // Airport located at X: 180, Z: -290 (North-East horizon, past the railway and tech district)
  const airportCenter = new THREE.Vector3(180, 0, -290);
  group.position.copy(airportCenter);

  // 1. TARMAC & RUNWAY
  // Runway oriented along X-axis (280m long, 26m wide)
  const tarmacGeo = new THREE.PlaneGeometry(340, 130);
  tarmacGeo.rotateX(-Math.PI / 2);
  const tarmac = new THREE.Mesh(tarmacGeo, materials.concrete);
  tarmac.position.y = 0.05;
  tarmac.receiveShadow = true;
  group.add(tarmac);

  // Main Runway Surface (Using realistic wet asphalt PBR)
  const runwayGeo = new THREE.PlaneGeometry(280, 24);
  runwayGeo.rotateX(-Math.PI / 2);
  const runway = new THREE.Mesh(runwayGeo, materials.asphalt);
  runway.position.set(0, 0.08, 15);
  runway.receiveShadow = true;
  group.add(runway);

  // Runway Threshold Piano Keys (White Stripes at 09L and 27R ends)
  const keyGeo = new THREE.PlaneGeometry(1.2, 8);
  keyGeo.rotateX(-Math.PI / 2);
  const keyMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  [-132, 132].forEach((endX) => {
    for (let k = -8; k <= 8; k += 2.2) {
      const key = new THREE.Mesh(keyGeo, keyMat);
      key.position.set(endX, 0.1, 15 + k);
      group.add(key);
    }
  });

  // Taxiway Centerline Guiding Lines (Glowing Yellow/Amber)
  const taxiLineGeo = new THREE.PlaneGeometry(0.35, 1);
  taxiLineGeo.rotateX(-Math.PI / 2);
  const taxiLineMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

  // Main taxiway parallel to runway
  const taxiwayParallel = new THREE.Mesh(new THREE.PlaneGeometry(240, 0.4).rotateX(-Math.PI / 2), taxiLineMat);
  taxiwayParallel.position.set(0, 0.09, -2);
  group.add(taxiwayParallel);

  // Curved exit leads connecting runway to apron
  [-80, 0, 80].forEach((txX) => {
    const connector = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 18).rotateX(-Math.PI / 2), taxiLineMat);
    connector.position.set(txX, 0.09, 6.5);
    group.add(connector);
  });

  // Runway Centerline Lights (White/Cyan glowing dashes)
  const dashCount = 28;
  const dashGeo = new THREE.BoxGeometry(4.5, 0.1, 0.8);
  const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let i = 0; i < dashCount; i++) {
    const dash = new THREE.Mesh(dashGeo, dashMat);
    dash.position.set(-130 + i * 9.6, 0.12, 15);
    group.add(dash);
  }

  // Runway Edge Lights (Aviation standard white along north and south edge)
  const edgeLightMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
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
  const threshMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
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

  // ATC Glass Observation Cab (Tinted 360-degree control cab)
  const cabGeo = new THREE.CylinderGeometry(6.2, 4.2, 6.5, 16);
  const cab = new THREE.Mesh(cabGeo, materials.glassDark);
  cab.position.set(-60, 40, -25);
  group.add(cab);

  // Rotating Radar Dish
  const radarGroup = new THREE.Group();
  radarGroup.position.set(-60, 44.5, -25);
  const radarMast = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 3, 6), materials.metalLight);
  radarGroup.add(radarMast);
  const dishGeo = new THREE.TorusGeometry(1.6, 0.2, 4, 12, Math.PI);
  dishGeo.rotateX(Math.PI / 4);
  const dish = new THREE.Mesh(dishGeo, materials.metalLight);
  dish.position.y = 2.2;
  radarGroup.add(dish);
  group.add(radarGroup);

  // Red beacon atop ATC (FAA standard flashing red beacon)
  const beaconLight = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), materials.neonRed);
  beaconLight.position.set(-60, 47, -25);
  group.add(beaconLight);

  // 3. PASSENGER TERMINAL (Modern Architectural Airport Terminal)
  const terminalGeo = new THREE.BoxGeometry(84, 14, 30);
  const terminal = new THREE.Mesh(terminalGeo, materials.glassDark);
  terminal.position.set(20, 7, -25);
  terminal.castShadow = true;
  group.add(terminal);

  // White Overhanging Terminal Roof Canopy
  const termCanopyGeo = new THREE.BoxGeometry(88, 1.4, 34);
  const termCanopyMesh = new THREE.Mesh(termCanopyGeo, materials.metalLight);
  termCanopyMesh.position.set(20, 14.5, -25);
  group.add(termCanopyMesh);

  // Terminal Signage: "METROPOLITAN INTERNATIONAL AIRPORT"
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 1024;
  signCanvas.height = 256;
  const ctx = signCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 1024, 256);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 1008, 240);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✈ METROPOLITAN INTERNATIONAL AIRPORT', 512, 110);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('PASSENGER TERMINAL 1 & AIR FREIGHT LOGISTICS', 512, 185);
  }
  const signTex = new THREE.CanvasTexture(signCanvas);
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(42, 10.5),
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

    // Hangar door steel frame trim
    const trim = new THREE.Mesh(new THREE.TorusGeometry(14, 0.4, 4, 16, Math.PI), materials.metalLight);
    trim.rotation.y = Math.PI / 2;
    trim.position.set(95 + h * 42, 0, -7);
    group.add(trim);
  }

  // 5. HELIPADS / ROTARY PADS
  for (let v = 0; v < 2; v++) {
    const padGroup = new THREE.Group();
    padGroup.position.set(-110 + v * 32, 0.15, -25);

    // Outer aviation yellow circle
    const padCircle = new THREE.Mesh(new THREE.RingGeometry(6, 6.6, 24), materials.neonAmber);
    padCircle.rotation.x = -Math.PI / 2;
    padGroup.add(padCircle);

    // Inner crisp white 'H'
    const barV1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 5.5), materials.neonWhite);
    barV1.position.x = -1.8;
    padGroup.add(barV1);
    const barV2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 5.5), materials.neonWhite);
    barV2.position.x = 1.8;
    padGroup.add(barV2);
    const barH = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.1, 0.7), materials.neonWhite);
    padGroup.add(barH);

    group.add(padGroup);
  }

  // 6. MODERN COMMERCIAL / EXECUTIVE JETS (Parked on Apron)
  const createCyberJet = (pos: THREE.Vector3, rotY: number) => {
    const jet = new THREE.Group();
    jet.position.copy(pos);
    jet.rotation.y = rotY;

    // Fuselage (Pearl white airliner body)
    const fuseGeo = new THREE.ConeGeometry(2.2, 18, 12);
    fuseGeo.rotateX(Math.PI / 2);
    const fuseMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.6, roughness: 0.3 });
    const fuse = new THREE.Mesh(fuseGeo, fuseMat);
    fuse.position.y = 1.8;
    jet.add(fuse);

    // Cockpit windscreen
    const cockpitGeo = new THREE.BoxGeometry(1.6, 0.6, 1.8);
    const cockpit = new THREE.Mesh(cockpitGeo, materials.glassDark);
    cockpit.position.set(0, 2.5, 4.2);
    jet.add(cockpit);

    // Delta Swept Wings (Metallic airliner wings)
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
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7, roughness: 0.3, side: THREE.DoubleSide });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    jet.add(wings);

    // Standard ICAO wingtip navigation lights: Red (port/left), Green (starboard/right)
    const tipL = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6), materials.neonRed);
    tipL.position.set(-9, 1.6, -5);
    jet.add(tipL);

    const tipR = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6), materials.neonEmerald);
    tipR.position.set(9, 1.6, -5);
    jet.add(tipR);

    // Vertical Stabilizer / Tail fin
    const tailGeo = new THREE.BoxGeometry(0.3, 3.8, 3.2);
    const tailMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.5, roughness: 0.4 });
    const tail = new THREE.Mesh(tailGeo, tailMat);
    tail.position.set(0, 4.2, -6.5);
    jet.add(tail);

    // Twin turbofan jet engines
    for (let e = -1; e <= 1; e += 2) {
      const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.75, 4.5, 12), materials.metalDark);
      eng.rotation.x = Math.PI / 2;
      eng.position.set(e * 2.8, 1.2, -2.5);
      jet.add(eng);
    }

    return jet;
  };

  group.add(createCyberJet(new THREE.Vector3(-18, 0, -5), Math.PI * 0.15));
  group.add(createCyberJet(new THREE.Vector3(58, 0, -6), -Math.PI * 0.1));

  // 7. TELESCOPIC PASSENGER BOARDING JET BRIDGES
  [-18, 20, 58].forEach((gateX) => {
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(gateX, 5, -11);

    // Rotary node at terminal wall
    const node = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 3.2, 12), materials.metalDark);
    bridgeGroup.add(node);

    // Telescopic tunnel corridor (Steel jetway with glass viewing panels)
    const tunnel = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, 9), materials.metalLight);
    tunnel.position.set(0, 0, 4.5);
    bridgeGroup.add(tunnel);

    // Accordion boarding cab at plane door
    const cabHead = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.8, 2), materials.metalLight);
    cabHead.position.set(0, 0, 9);
    bridgeGroup.add(cabHead);

    // Support pylon with wheel bogie
    const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5, 8), materials.metalDark);
    pylon.position.set(0, -2.5, 7.5);
    bridgeGroup.add(pylon);

    group.add(bridgeGroup);
  });

  // 8. AIRPORT GROUND SUPPORT VEHICLES (Baggage Tug, Fuel Tanker, Follow-Me Van)
  // A. Airport Baggage Tug & Cargo Carts
  const tugGroup = new THREE.Group();
  tugGroup.position.set(2, 0, -4);
  const tugBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 3.4), materials.metalLight);
  tugBody.position.y = 0.8;
  tugGroup.add(tugBody);

  const tugCab = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 1.4), materials.glassDark);
  tugCab.position.set(0, 1.8, -0.6);
  tugGroup.add(tugCab);

  const tugStrobe = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), materials.neonAmber);
  tugStrobe.position.set(0, 2.5, -0.6);
  tugGroup.add(tugStrobe);

  // 2 Trailing baggage pod carts
  const luggageMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7, metalness: 0.3 });
  for (let c = 1; c <= 2; c++) {
    const cart = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 2.4), materials.metalDark);
    cart.position.set(0, 0.7, 1.8 + c * 3.2);
    tugGroup.add(cart);

    const pod = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 2.0), luggageMat);
    pod.position.set(0, 1.3, 1.8 + c * 3.2);
    tugGroup.add(pod);
  }
  group.add(tugGroup);

  // B. Airfield Fuel Tanker Truck
  const tankerGroup = new THREE.Group();
  tankerGroup.position.set(38, 0, -8);
  const tankerCab = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.2, 3.2), materials.metalDark);
  tankerCab.position.set(0, 1.2, -3.2);
  tankerGroup.add(tankerCab);

  const tankCyl = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 7.2, 16), materials.concrete);
  tankCyl.rotation.x = Math.PI / 2;
  tankCyl.position.set(0, 1.6, 2.2);
  tankerGroup.add(tankCyl);

  // Hazard amber safety striping
  const hazardBand = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.3, 7.4), materials.neonAmber);
  hazardBand.position.set(0, 1.6, 2.2);
  tankerGroup.add(hazardBand);
  group.add(tankerGroup);

  // C. Airfield "FOLLOW ME" Operations Safety Van
  const followMe = new THREE.Group();
  followMe.position.set(-65, 0, 2);
  const vanMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.4 });
  const vanBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 4.6), vanMat);
  vanBody.position.y = 1.0;
  followMe.add(vanBody);

  const vanGlass = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 2.4), materials.glassDark);
  vanGlass.position.set(0, 1.7, -0.6);
  followMe.add(vanGlass);

  const followSign = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 0.8), materials.neonAmber);
  followSign.position.set(0, 2.2, 1.2);
  followMe.add(followSign);
  group.add(followMe);

  // 9. TERMINAL ACCESS ROAD & PASSENGER DROP-OFF LOOP
  const roadLoopGeo = new THREE.PlaneGeometry(160, 14);
  roadLoopGeo.rotateX(-Math.PI / 2);
  const roadLoop = new THREE.Mesh(roadLoopGeo, materials.asphalt);
  roadLoop.position.set(20, 0.08, -48);
  roadLoop.receiveShadow = true;
  group.add(roadLoop);

  // Passenger Drop-Off Overhead Canopy
  const canopyGeo = new THREE.BoxGeometry(86, 0.6, 8);
  const canopy = new THREE.Mesh(canopyGeo, materials.glassDark);
  canopy.position.set(20, 6.2, -42);
  group.add(canopy);

  const canopyGlow = new THREE.Mesh(new THREE.BoxGeometry(86.4, 0.2, 0.4), materials.metalLight);
  canopyGlow.position.set(20, 6.2, -38);
  group.add(canopyGlow);

  // Interactive Terminal Object
  const buildingData: BuildingData = {
    id: 'skyport-terminal-alpha',
    name: 'Skyport International Terminal',
    districtId: 'airport',
    districtName: 'Skyport International Airport',
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

  buildingsData.push(buildingData);
  terminal.userData.buildingData = buildingData;
  cab.userData.buildingData = buildingData;
  interactiveMeshes.push(terminal, cab);

  // 9. DYNAMIC FLIGHT AIRLINER (Commercial Flagship Jet in Active Flight Loop)
  const activeAirliner = new THREE.Group();
  activeAirliner.name = 'active_flight_airliner';

  const airlinerMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.7,
    roughness: 0.25,
  });
  const liveryBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Sky Blue Airline Livery
    metalness: 0.6,
    roughness: 0.3,
  });
  const engineMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.8,
    roughness: 0.2,
  });

  // Cylindrical Fuselage
  const alFuseGeo = new THREE.CylinderGeometry(2.4, 2.4, 28, 16);
  alFuseGeo.rotateZ(Math.PI / 2);
  const alFuse = new THREE.Mesh(alFuseGeo, airlinerMat);
  alFuse.castShadow = true;
  activeAirliner.add(alFuse);

  // Aerodynamic Nose Cone
  const alNoseGeo = new THREE.ConeGeometry(2.4, 6, 16);
  alNoseGeo.rotateZ(-Math.PI / 2);
  const alNose = new THREE.Mesh(alNoseGeo, airlinerMat);
  alNose.position.x = 17;
  activeAirliner.add(alNose);

  // Cockpit Windshield (reflective dark glass)
  const alCockpit = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.9, 2.4),
    materials.glassDark
  );
  alCockpit.position.set(15, 1.4, 0);
  activeAirliner.add(alCockpit);

  // Tail Cone
  const alTailGeo = new THREE.ConeGeometry(2.4, 7, 16);
  alTailGeo.rotateZ(Math.PI / 2);
  const alTail = new THREE.Mesh(alTailGeo, airlinerMat);
  alTail.position.x = -17.5;
  activeAirliner.add(alTail);

  // Swept Wings (Wingspan 32m)
  const alWingLGeo = new THREE.BufferGeometry();
  const wingVertices = new Float32Array([
    4, 0, 0,
    -8, 0.5, 16,
    -4, 0.5, 16,

    4, 0, 0,
    -4, 0.5, 16,
    -6, 0, 0,

    4, 0, 0,
    -4, 0.5, -16,
    -8, 0.5, -16,

    4, 0, 0,
    -6, 0, 0,
    -4, 0.5, -16,
  ]);
  alWingLGeo.setAttribute('position', new THREE.BufferAttribute(wingVertices, 3));
  alWingLGeo.computeVertexNormals();
  const alWings = new THREE.Mesh(alWingLGeo, airlinerMat);
  activeAirliner.add(alWings);

  // Winglets (upturned tips)
  [-16, 16].forEach((wz) => {
    const winglet = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 2.2, 0.25),
      liveryBlueMat
    );
    winglet.position.set(-6, 1.2, wz);
    activeAirliner.add(winglet);
  });

  // Vertical Stabilizer / Tailfin
  const alFinGeo = new THREE.BoxGeometry(4.5, 6.5, 0.4);
  const alFin = new THREE.Mesh(alFinGeo, liveryBlueMat);
  alFin.position.set(-16, 4.2, 0);
  alFin.rotation.z = -0.25;
  activeAirliner.add(alFin);

  // Horizontal Stabilizers
  [-6, 6].forEach((hz) => {
    const hStab = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 0.3, 5),
      airlinerMat
    );
    hStab.position.set(-17, 1.2, hz);
    activeAirliner.add(hStab);
  });

  // Twin Turbofan Jet Engines
  [-7, 7].forEach((ez) => {
    const engNacelle = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.25, 5.5, 16),
      engineMat
    );
    engNacelle.rotateZ(Math.PI / 2);
    engNacelle.position.set(0.5, -1.4, ez);
    activeAirliner.add(engNacelle);

    // Intake Glow / Spinner
    const fanSpinner = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 1.2, 12),
      materials.metalLight
    );
    fanSpinner.rotateZ(-Math.PI / 2);
    fanSpinner.position.set(3.2, -1.4, ez);
    activeAirliner.add(fanSpinner);
  });

  // Aviation Navigation & Strobe Lights
  const navRed = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), materials.neonRed);
  navRed.position.set(-6, 1.2, 16.2);
  activeAirliner.add(navRed);

  const navGreen = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), materials.neonEmerald);
  navGreen.position.set(-6, 1.2, -16.2);
  activeAirliner.add(navGreen);

  const wingStrobeL = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  wingStrobeL.position.set(-6.5, 1.2, 16.2);
  activeAirliner.add(wingStrobeL);

  const wingStrobeR = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  wingStrobeR.position.set(-6.5, 1.2, -16.2);
  activeAirliner.add(wingStrobeR);

  // High-Intensity Forward Landing Lights
  const landingLightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const landingLightL = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), landingLightMat);
  landingLightL.position.set(4, -1.2, 4);
  activeAirliner.add(landingLightL);

  const landingLightR = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), landingLightMat);
  landingLightR.position.set(4, -1.2, -4);
  activeAirliner.add(landingLightR);

  group.add(activeAirliner);

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

    // Animate Commercial Flight Loop
    const cycle = 32;
    const t = (time % cycle);
    const strobeBlink = (Math.floor(time * 2) % 2 === 0);
    (wingStrobeL.material as THREE.MeshBasicMaterial).color.setHex(strobeBlink ? 0xffffff : 0x111122);
    (wingStrobeR.material as THREE.MeshBasicMaterial).color.setHex(strobeBlink ? 0xffffff : 0x111122);

    if (t < 8) {
      // 1. Takeoff Roll on Runway (+X direction)
      const frac = t / 8;
      activeAirliner.position.set(-125 + frac * 235, 2.4, 15);
      activeAirliner.rotation.set(0, 0, 0);
    } else if (t < 15) {
      // 2. Rotation & Climb-Out (+X heading, pitch up)
      const frac = (t - 8) / 7;
      activeAirliner.position.set(110 + frac * 220, 2.4 + frac * 80, 15);
      activeAirliner.rotation.set(0, 0, 0.16); // pitch up nose
    } else if (t < 23) {
      // 3. Wide Circling Turn High Above Sky
      const frac = (t - 15) / 8;
      const angle = frac * Math.PI;
      activeAirliner.position.set(
        330 - Math.sin(angle) * 440,
        82.4 + Math.sin(frac * Math.PI) * 12,
        15 - Math.sin(angle) * 140
      );
      activeAirliner.rotation.set(-0.25, -angle, 0); // banking turn
    } else if (t < 28) {
      // 4. Base Leg to Final Approach Descent
      const frac = (t - 23) / 5;
      activeAirliner.position.set(
        -110 - (1 - frac) * 110,
        82.4 - frac * 52,
        -125 + frac * 140
      );
      activeAirliner.rotation.set(0, -Math.PI + frac * Math.PI, -0.08);
    } else {
      // 5. Final Glideslope & Touchdown
      const frac = (t - 28) / 4;
      activeAirliner.position.set(-220 + frac * 95, 30.4 - frac * 28, 15);
      activeAirliner.rotation.set(0, 0, 0.05); // slight flare
    }
  };

  const dispose = () => {
    scene.remove(group);
    airlinerMat.dispose();
    liveryBlueMat.dispose();
    engineMat.dispose();
    alFuseGeo.dispose();
    alNoseGeo.dispose();
    alTailGeo.dispose();
    alWingLGeo.dispose();
    alFinGeo.dispose();
    landingLightMat.dispose();
  };

  return {
    group,
    buildingsData,
    interactiveMeshes,
    update,
    dispose,
  };
}
