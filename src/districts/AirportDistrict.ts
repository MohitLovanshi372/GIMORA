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

  // Airport located at X: 180, Z: -335 (North-East Aviation Zone north of the Z=-260 Perimeter Highway)
  const airportCenter = new THREE.Vector3(180, 0, -335);
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

  // 6. REALISTIC COMMERCIAL AIRLINERS (Parked at Terminal Boarding Gates)
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x0b0f19, roughness: 0.85, metalness: 0.15 });
  const strutMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.9 });
  const cabinWinMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  const createCommercialJet = (pos: THREE.Vector3, rotY: number, liveryColor: number) => {
    const jet = new THREE.Group();
    jet.position.copy(pos);
    jet.rotation.y = rotY;

    const fuseMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      metalness: 0.55,
      roughness: 0.18,
      clearcoat: 0.9,
    });
    const liveryMat = new THREE.MeshPhysicalMaterial({
      color: liveryColor,
      metalness: 0.65,
      roughness: 0.22,
      clearcoat: 0.9,
    });
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.72,
      roughness: 0.25,
      side: THREE.DoubleSide,
    });

    // Cylindrical Airliner Fuselage (aligned along Z axis, nose at +Z)
    const bodyCyl = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 1.85, 16, 18), fuseMat);
    bodyCyl.rotation.x = Math.PI / 2;
    bodyCyl.position.set(0, 2.35, 0);
    bodyCyl.castShadow = true;
    jet.add(bodyCyl);

    // Aerodynamic Radome Nose Cone (+Z) & APU Tail Cone (-Z)
    const noseCone = new THREE.Mesh(new THREE.SphereGeometry(1.85, 16, 16), fuseMat);
    noseCone.scale.set(1.0, 0.92, 2.1);
    noseCone.position.set(0, 2.28, 8.0);
    jet.add(noseCone);

    const tailCone = new THREE.Mesh(new THREE.ConeGeometry(1.85, 5.4, 16), fuseMat);
    tailCone.rotation.x = -Math.PI / 2;
    tailCone.position.set(0, 2.45, -10.6);
    jet.add(tailCone);

    // Airline Cheatline Livery Stripe & Belly Fairing
    const cheatline = new THREE.Mesh(new THREE.BoxGeometry(3.76, 0.26, 16.2), liveryMat);
    cheatline.position.set(0, 2.35, 0);
    jet.add(cheatline);

    // Cockpit Multi-Pane Windscreen & Passenger Cabin Oval Windows
    const cockpit = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.62, 1.95), materials.glassDark);
    cockpit.position.set(0, 2.95, 8.6);
    cockpit.rotation.x = 0.25;
    jet.add(cockpit);

    for (let wz = -6.2; wz <= 6.2; wz += 0.95) {
      const winPair = new THREE.Mesh(new THREE.BoxGeometry(3.78, 0.32, 0.42), cabinWinMat);
      winPair.position.set(0, 2.68, wz);
      jet.add(winPair);
    }

    // Swept Airfoil Wings + Blended Upturned Winglets
    const wingGeo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 2.1, 2.5,
      -12.5, 2.35, -3.5,
      -9.8, 2.35, -4.8,

      0, 2.1, 2.5,
      -9.8, 2.35, -4.8,
      0, 2.1, -2.5,

      0, 2.1, 2.5,
      9.8, 2.35, -4.8,
      12.5, 2.35, -3.5,

      0, 2.1, 2.5,
      0, 2.1, -2.5,
      9.8, 2.35, -4.8,
    ]);
    wingGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    wingGeo.computeVertexNormals();
    const wings = new THREE.Mesh(wingGeo, wingMat);
    wings.castShadow = true;
    jet.add(wings);

    [-12.5, 12.5].forEach((wx) => {
      const winglet = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.65, 1.25), liveryMat);
      winglet.position.set(wx, 3.05, -4.0);
      jet.add(winglet);
    });

    // ICAO Wingtip Navigation Lights (Red Port, Green Starboard)
    const tipL = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), materials.neonRed);
    tipL.position.set(-12.6, 2.4, -3.6);
    jet.add(tipL);

    const tipR = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), materials.neonEmerald);
    tipR.position.set(12.6, 2.4, -3.6);
    jet.add(tipR);

    // Swept Vertical Tail Fin & Horizontal Stabilizers
    const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.32, 4.8, 3.6), liveryMat);
    tailFin.position.set(0, 5.1, -9.8);
    tailFin.rotation.x = -0.26;
    tailFin.castShadow = true;
    jet.add(tailFin);

    [-3.6, 3.6].forEach((hx) => {
      const hStab = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.22, 2.2), wingMat);
      hStab.position.set(hx, 2.6, -10.5);
      jet.add(hStab);
    });

    // Twin High-Bypass Turbofan Engines with Titanium Intake Lip & Fan Cone
    [-4.6, 4.6].forEach((ex) => {
      const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.85, 2.2), wingMat);
      pylon.position.set(ex, 1.75, -0.5);
      jet.add(pylon);

      const nacelle = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.86, 3.6, 16), fuseMat);
      nacelle.rotation.x = Math.PI / 2;
      nacelle.position.set(ex, 1.35, 0.2);
      jet.add(nacelle);

      const intakeRing = new THREE.Mesh(new THREE.TorusGeometry(0.90, 0.08, 8, 16), strutMat);
      intakeRing.position.set(ex, 1.35, 2.0);
      jet.add(intakeRing);

      const fanCore = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.2, 12), materials.metalDark);
      fanCore.rotation.x = Math.PI / 2;
      fanCore.position.set(ex, 1.35, 1.85);
      jet.add(fanCore);
    });

    // Deployed Tricycle Landing Gear (Nose Strut + Twin Main Gear Bogies)
    const noseStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 1.5, 8), strutMat);
    noseStrut.position.set(0, 0.85, 7.2);
    const noseWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.48, 12), tireMat);
    noseWheel.rotation.z = Math.PI / 2;
    noseWheel.position.set(0, 0.32, 7.2);
    jet.add(noseStrut, noseWheel);

    [-2.2, 2.2].forEach((gx) => {
      const mStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.6, 8), strutMat);
      mStrut.position.set(gx, 0.9, -0.8);
      const mWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.72, 12), tireMat);
      mWheel.rotation.z = Math.PI / 2;
      mWheel.position.set(gx, 0.44, -0.8);
      jet.add(mStrut, mWheel);
    });

    return jet;
  };

  group.add(createCommercialJet(new THREE.Vector3(-18, 0, -2), Math.PI * 0.08, 0x0284c7));
  group.add(createCommercialJet(new THREE.Vector3(20, 0, -2), 0, 0xdc2626));
  group.add(createCommercialJet(new THREE.Vector3(58, 0, -2), -Math.PI * 0.08, 0x059669));

  // 7. TELESCOPIC PASSENGER BOARDING JET BRIDGES
  [-18, 20, 58].forEach((gateX) => {
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(gateX, 5, -11);

    const node = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 3.2, 12), materials.metalDark);
    bridgeGroup.add(node);

    const tunnel = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, 9), materials.metalLight);
    tunnel.position.set(0, 0, 4.5);
    bridgeGroup.add(tunnel);

    const cabHead = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.8, 2), materials.metalLight);
    cabHead.position.set(0, 0, 9);
    bridgeGroup.add(cabHead);

    const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5, 8), materials.metalDark);
    pylon.position.set(0, -2.5, 7.5);
    bridgeGroup.add(pylon);

    group.add(bridgeGroup);
  });

  // 8. AIRPORT GROUND SUPPORT VEHICLES (Baggage Tractor + Carts, Jet-A1 Fuel Tanker, Follow-Me SUV)
  const gsWheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 12);
  gsWheelGeo.rotateZ(Math.PI / 2);

  // A. Airport Baggage Tractor & Covered Cargo Carts
  const tugGroup = new THREE.Group();
  tugGroup.position.set(2, 0, -4);
  const tugBody = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.15, 3.4), materials.metalLight);
  tugBody.position.y = 0.78;
  tugGroup.add(tugBody);

  const tugCab = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.1, 1.5), materials.glassDark);
  tugCab.position.set(0, 1.72, -0.5);
  tugGroup.add(tugCab);

  const tugStrobe = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), materials.neonAmber);
  tugStrobe.position.set(0, 2.4, -0.5);
  tugGroup.add(tugStrobe);

  [-1.02, 1.02].forEach((wx) => {
    [-1.1, 1.1].forEach((wz) => {
      const w = new THREE.Mesh(gsWheelGeo, tireMat);
      w.position.set(wx, 0.38, wz);
      tugGroup.add(w);
    });
  });

  const luggageMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.65, metalness: 0.35 });
  for (let c = 1; c <= 2; c++) {
    const cartZ = 1.8 + c * 3.4;
    const cart = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.3, 2.6), materials.metalDark);
    cart.position.set(0, 0.55, cartZ);
    tugGroup.add(cart);

    const pod = new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.25, 2.3), luggageMat);
    pod.position.set(0, 1.32, cartZ);
    tugGroup.add(pod);

    [-0.92, 0.92].forEach((wx) => {
      [-0.85, 0.85].forEach((wz) => {
        const cw = new THREE.Mesh(gsWheelGeo, tireMat);
        cw.scale.setScalar(0.65);
        cw.position.set(wx, 0.25, cartZ + wz);
        tugGroup.add(cw);
      });
    });
  }
  group.add(tugGroup);

  // B. Jet-A1 Aviation Fuel Tanker Truck
  const tankerGroup = new THREE.Group();
  tankerGroup.position.set(38, 0, -6);
  const tankerCab = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.1, 2.8), materials.metalDark);
  tankerCab.position.set(0, 1.35, -3.4);
  tankerGroup.add(tankerCab);

  const tankerWin = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.75, 0.15), materials.glassDark);
  tankerWin.position.set(0, 1.85, -4.82);
  tankerGroup.add(tankerWin);

  const tankCyl = new THREE.Mesh(new THREE.CylinderGeometry(1.38, 1.38, 7.4, 20), strutMat);
  tankCyl.rotation.x = Math.PI / 2;
  tankCyl.position.set(0, 1.75, 2.1);
  tankerGroup.add(tankCyl);

  const hazardBand = new THREE.Mesh(new THREE.BoxGeometry(2.82, 0.28, 7.45), materials.neonAmber);
  hazardBand.position.set(0, 1.75, 2.1);
  tankerGroup.add(hazardBand);

  [-1.22, 1.22].forEach((wx) => {
    [-3.4, 0.8, 3.8].forEach((wz) => {
      const tw = new THREE.Mesh(gsWheelGeo, tireMat);
      tw.scale.setScalar(1.15);
      tw.position.set(wx, 0.44, wz);
      tankerGroup.add(tw);
    });
  });
  group.add(tankerGroup);

  // C. Airfield "FOLLOW ME" Operations Marshal SUV
  const followMe = new THREE.Group();
  followMe.position.set(-65, 0, 2);
  const vanMat = new THREE.MeshPhysicalMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.5, clearcoat: 0.9 });
  const vanBody = new THREE.Mesh(new THREE.BoxGeometry(2.25, 1.15, 4.6), vanMat);
  vanBody.position.y = 0.82;
  followMe.add(vanBody);

  const vanGlass = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.78, 2.5), materials.glassDark);
  vanGlass.position.set(0, 1.65, -0.2);
  followMe.add(vanGlass);

  const followSign = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.48, 0.25), materials.neonAmber);
  followSign.position.set(0, 2.25, 0.6);
  followMe.add(followSign);

  [-1.10, 1.10].forEach((wx) => {
    [-1.45, 1.45].forEach((wz) => {
      const vw = new THREE.Mesh(gsWheelGeo, tireMat);
      vw.position.set(wx, 0.38, wz);
      followMe.add(vw);
    });
  });
  group.add(followMe);

  // 9. TERMINAL ACCESS ROAD & PASSENGER DROP-OFF LOOP
  const roadLoopGeo = new THREE.PlaneGeometry(160, 14);
  roadLoopGeo.rotateX(-Math.PI / 2);
  const roadLoop = new THREE.Mesh(roadLoopGeo, materials.asphalt);
  roadLoop.position.set(20, 0.08, -48);
  roadLoop.receiveShadow = true;
  group.add(roadLoop);

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

  // 10. DYNAMIC WIDEBODY FLAGSHIP AIRLINER (Active Takeoff, Climb, Banking Turn & Landing Loop)
  const activeAirliner = new THREE.Group();
  activeAirliner.name = 'active_flight_airliner';

  const airlinerMat = new THREE.MeshPhysicalMaterial({
    color: 0xf8fafc,
    metalness: 0.6,
    roughness: 0.18,
    clearcoat: 1.0,
  });
  const liveryBlueMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    metalness: 0.65,
    roughness: 0.22,
    clearcoat: 0.9,
  });
  const engineMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.82,
    roughness: 0.2,
  });

  // Cylindrical Widebody Fuselage
  const alFuseGeo = new THREE.CylinderGeometry(2.45, 2.45, 28, 20);
  alFuseGeo.rotateZ(Math.PI / 2);
  const alFuse = new THREE.Mesh(alFuseGeo, airlinerMat);
  alFuse.castShadow = true;
  activeAirliner.add(alFuse);

  // Airline Cheatline Stripe & Illuminated Passenger Oval Window Rows
  const alStripe = new THREE.Mesh(new THREE.BoxGeometry(28.2, 0.38, 4.96), liveryBlueMat);
  activeAirliner.add(alStripe);

  for (let wx = -11.5; wx <= 11.5; wx += 1.15) {
    const winSlot = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.42, 4.98), cabinWinMat);
    winSlot.position.set(wx, 0.55, 0);
    activeAirliner.add(winSlot);
  }

  // Smooth Rounded Radome Nose Cone (+X)
  const alNoseGeo = new THREE.SphereGeometry(2.45, 18, 18);
  const alNose = new THREE.Mesh(alNoseGeo, airlinerMat);
  alNose.scale.set(2.3, 0.94, 1.0);
  alNose.position.set(14.0, -0.1, 0);
  activeAirliner.add(alNose);

  // Wrap-Around Cockpit Eyebrow Windshield
  const alCockpit = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.92, 2.85), materials.glassDark);
  alCockpit.position.set(15.2, 1.15, 0);
  alCockpit.rotation.z = -0.24;
  activeAirliner.add(alCockpit);

  // Tapered APU Tail Cone (-X)
  const alTailGeo = new THREE.ConeGeometry(2.45, 7.5, 18);
  alTailGeo.rotateZ(Math.PI / 2);
  const alTail = new THREE.Mesh(alTailGeo, airlinerMat);
  alTail.position.set(-17.6, 0.15, 0);
  activeAirliner.add(alTail);

  // Swept Airfoil Wings (34m Wingspan) + Flap Track Fairings
  const alWingLGeo = new THREE.BufferGeometry();
  const wingVertices = new Float32Array([
    4.5, -0.2, 0,
    -8.5, 0.5, 17,
    -4.2, 0.5, 17,

    4.5, -0.2, 0,
    -4.2, 0.5, 17,
    -6.5, -0.2, 0,

    4.5, -0.2, 0,
    -4.2, 0.5, -17,
    -8.5, 0.5, -17,

    4.5, -0.2, 0,
    -6.5, -0.2, 0,
    -4.2, 0.5, -17,
  ]);
  alWingLGeo.setAttribute('position', new THREE.BufferAttribute(wingVertices, 3));
  alWingLGeo.computeVertexNormals();
  const alWings = new THREE.Mesh(alWingLGeo, airlinerMat);
  alWings.castShadow = true;
  activeAirliner.add(alWings);

  // Blended Scimitar Winglets
  [-17, 17].forEach((wz) => {
    const winglet = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.4, 0.26), liveryBlueMat);
    winglet.position.set(-6.4, 1.35, wz);
    activeAirliner.add(winglet);
  });

  // Swept Vertical Tailfin & Horizontal Stabilizers
  const alFinGeo = new THREE.BoxGeometry(5.2, 7.2, 0.42);
  const alFin = new THREE.Mesh(alFinGeo, liveryBlueMat);
  alFin.position.set(-16.2, 4.4, 0);
  alFin.rotation.z = -0.28;
  activeAirliner.add(alFin);

  [-6.2, 6.2].forEach((hz) => {
    const hStab = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.32, 5.4), airlinerMat);
    hStab.position.set(-17.2, 1.1, hz);
    activeAirliner.add(hStab);
  });

  // High-Bypass Turbofan Jet Engines with Spinning Fan Blades
  const spinningFans: THREE.Object3D[] = [];
  [-7.2, 7.2].forEach((ez) => {
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.9, 0.35), airlinerMat);
    pylon.position.set(0.2, -0.75, ez);
    activeAirliner.add(pylon);

    const engNacelle = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.22, 5.6, 18), airlinerMat);
    engNacelle.rotateZ(Math.PI / 2);
    engNacelle.position.set(0.8, -1.45, ez);
    activeAirliner.add(engNacelle);

    const intakeLip = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.10, 8, 18), strutMat);
    intakeLip.rotation.y = Math.PI / 2;
    intakeLip.position.set(3.6, -1.45, ez);
    activeAirliner.add(intakeLip);

    const fanRotor = new THREE.Group();
    fanRotor.position.set(3.3, -1.45, ez);
    const spinner = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.1, 12), engineMat);
    spinner.rotateZ(-Math.PI / 2);
    fanRotor.add(spinner);
    for (let b = 0; b < 6; b++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.35, 0.28), strutMat);
      blade.rotation.x = (b * Math.PI) / 6;
      fanRotor.add(blade);
    }
    activeAirliner.add(fanRotor);
    spinningFans.push(fanRotor);
  });

  // Retractable Tricycle Landing Gear Group (Deployed on Runway & Final Approach)
  const landingGearGroup = new THREE.Group();
  const noseGearStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.8, 8), strutMat);
  noseGearStrut.position.set(12.5, -2.5, 0);
  const noseGearTire = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.65, 12), tireMat);
  noseGearTire.rotation.x = Math.PI / 2;
  noseGearTire.position.set(12.5, -3.35, 0);
  landingGearGroup.add(noseGearStrut, noseGearTire);

  [-3.2, 3.2].forEach((gz) => {
    const mainStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.9, 8), strutMat);
    mainStrut.position.set(-1.2, -2.45, gz);
    landingGearGroup.add(mainStrut);
    [-0.55, 0.55].forEach((bx) => {
      const bogieTire = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.85, 12), tireMat);
      bogieTire.rotation.x = Math.PI / 2;
      bogieTire.position.set(-1.2 + bx, -3.28, gz);
      landingGearGroup.add(bogieTire);
    });
  });
  activeAirliner.add(landingGearGroup);

  // Aviation Navigation, Anti-Collision Beacon & Wingtip Strobe Lights
  const navRed = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), materials.neonRed);
  navRed.position.set(-6.4, 1.2, 17.2);
  activeAirliner.add(navRed);

  const navGreen = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), materials.neonEmerald);
  navGreen.position.set(-6.4, 1.2, -17.2);
  activeAirliner.add(navGreen);

  const wingStrobeL = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  wingStrobeL.position.set(-6.9, 1.2, 17.2);
  activeAirliner.add(wingStrobeL);

  const wingStrobeR = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  wingStrobeR.position.set(-6.9, 1.2, -17.2);
  activeAirliner.add(wingStrobeR);

  const landingLightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const landingLightL = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), landingLightMat);
  landingLightL.position.set(4.2, -1.1, 4.2);
  activeAirliner.add(landingLightL);

  const landingLightR = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), landingLightMat);
  landingLightR.position.set(4.2, -1.1, -4.2);
  activeAirliner.add(landingLightR);

  group.add(activeAirliner);

  // 11. ACTIVE EXECUTIVE TWIN-TURBINE HELICOPTER (Helipad Liftoff & Aerial Patrol Loop)
  const activeHeli = new THREE.Group();
  activeHeli.name = 'active_executive_helicopter';

  const heliFuselage = new THREE.Mesh(new THREE.SphereGeometry(1.65, 16, 14), liveryBlueMat);
  heliFuselage.scale.set(2.2, 0.95, 0.92);
  heliFuselage.position.y = 1.95;
  heliFuselage.castShadow = true;
  activeHeli.add(heliFuselage);

  const heliCanopy = new THREE.Mesh(new THREE.SphereGeometry(1.48, 14, 12), materials.glassDark);
  heliCanopy.scale.set(1.5, 0.85, 0.88);
  heliCanopy.position.set(1.15, 2.08, 0);
  activeHeli.add(heliCanopy);

  const tailBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.52, 6.2, 10), airlinerMat);
  tailBoom.rotation.z = Math.PI / 2;
  tailBoom.position.set(-4.6, 2.15, 0);
  activeHeli.add(tailBoom);

  const heliTailFin = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.95, 0.18), liveryBlueMat);
  heliTailFin.position.set(-7.4, 2.65, 0);
  heliTailFin.rotation.z = -0.25;
  activeHeli.add(heliTailFin);

  // Helicopter Landing Skids
  [-1.05, 1.05].forEach((sz) => {
    const skid = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.6, 8), strutMat);
    skid.rotation.z = Math.PI / 2;
    skid.position.set(0.2, 0.35, sz);
    activeHeli.add(skid);

    [-1.1, 1.2].forEach((sx) => {
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.15, 6), strutMat);
      strut.position.set(sx, 0.88, sz * 0.82);
      activeHeli.add(strut);
    });
  });

  // Main 4-Blade Rotor & Tail Rotor
  const mainRotorGroup = new THREE.Group();
  mainRotorGroup.position.set(0, 3.65, 0);
  const rotorMast = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.55, 10), strutMat);
  mainRotorGroup.add(rotorMast);
  const rotorBlade1 = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.05, 0.36), engineMat);
  const rotorBlade2 = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.05, 11.2), engineMat);
  rotorBlade1.position.y = 0.22;
  rotorBlade2.position.y = 0.22;
  mainRotorGroup.add(rotorBlade1, rotorBlade2);
  activeHeli.add(mainRotorGroup);

  const tailRotorGroup = new THREE.Group();
  tailRotorGroup.position.set(-7.5, 2.85, 0.25);
  const tailBlade1 = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.18, 0.04), strutMat);
  const tailBlade2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.85, 0.04), strutMat);
  tailRotorGroup.add(tailBlade1, tailBlade2);
  activeHeli.add(tailRotorGroup);

  group.add(activeHeli);

  scene.add(group);

  const update = (time: number) => {
    // Rotate ATC Radar
    radarGroup.rotation.y = time * 1.8;

    // Spin Turbofan Engine Blades & Helicopter Rotors
    spinningFans.forEach((f) => {
      f.rotation.x = time * 18.0;
    });
    mainRotorGroup.rotation.y = time * 24.0;
    tailRotorGroup.rotation.z = time * 28.0;

    // Sequenced Approach Strobe Blink
    const step = Math.floor(time * 6) % 6;
    approachStrobes.forEach((bulb, idx) => {
      const mat = bulb.material as THREE.MeshBasicMaterial;
      mat.color.setHex(idx === step ? 0xffffff : 0x223344);
    });

    // Animate Commercial Flagship Airliner Flight Loop
    const cycle = 32;
    const t = time % cycle;
    const strobeBlink = Math.floor(time * 2) % 2 === 0;
    (wingStrobeL.material as THREE.MeshBasicMaterial).color.setHex(strobeBlink ? 0xffffff : 0x111122);
    (wingStrobeR.material as THREE.MeshBasicMaterial).color.setHex(strobeBlink ? 0xffffff : 0x111122);

    // Automatically deploy landing gear on runway/approach, retract during climb & cruise
    landingGearGroup.visible = t < 9.5 || t > 26.5;

    if (t < 8) {
      // 1. Takeoff Roll on Runway (+X direction)
      const frac = t / 8;
      activeAirliner.position.set(-125 + frac * 235, 3.8, 15);
      activeAirliner.rotation.set(0, 0, 0);
    } else if (t < 15) {
      // 2. Rotation & Climb-Out (+X heading, pitch up)
      const frac = (t - 8) / 7;
      activeAirliner.position.set(110 + frac * 220, 3.8 + frac * 80, 15);
      activeAirliner.rotation.set(0, 0, 0.16);
    } else if (t < 23) {
      // 3. Wide Circling Turn High Above Sky
      const frac = (t - 15) / 8;
      const angle = frac * Math.PI;
      activeAirliner.position.set(
        330 - Math.sin(angle) * 440,
        83.8 + Math.sin(frac * Math.PI) * 12,
        15 - Math.sin(angle) * 140
      );
      activeAirliner.rotation.set(-0.25, -angle, 0);
    } else if (t < 28) {
      // 4. Base Leg to Final Approach Descent
      const frac = (t - 23) / 5;
      activeAirliner.position.set(
        -110 - (1 - frac) * 110,
        83.8 - frac * 52,
        -125 + frac * 140
      );
      activeAirliner.rotation.set(0, -Math.PI + frac * Math.PI, -0.08);
    } else {
      // 5. Final Glideslope & Touchdown
      const frac = (t - 28) / 4;
      activeAirliner.position.set(-220 + frac * 95, 31.8 - frac * 28, 15);
      activeAirliner.rotation.set(0, 0, 0.05);
    }

    // Animate Executive Helicopter Patrol Loop (Helipad Liftoff -> City Skyline Orbit -> Landing)
    const hCycle = 36;
    const ht = time % hCycle;
    if (ht < 5) {
      // Hover & Vertical Liftoff from Helipad 1 (-110, 0, -25)
      const f = ht / 5;
      activeHeli.position.set(-110, 0.15 + f * f * 48, -25);
      activeHeli.rotation.set(0, 0, -f * 0.08);
    } else if (ht < 29) {
      // Scenic Orbit Patrol over Airport & Northern Skyline
      const f = (ht - 5) / 24;
      const ang = f * Math.PI * 2;
      const rx = -110 + Math.sin(ang) * 145;
      const rz = -25 + (1 - Math.cos(ang)) * 95;
      activeHeli.position.set(rx, 48.15 + Math.sin(ang * 2) * 8, rz);
      activeHeli.rotation.set(0.10, -ang, -0.12);
    } else {
      // Vertical Descent & Touchdown on Helipad 1
      const f = (ht - 29) / 7;
      activeHeli.position.set(-110, 48.15 * (1 - f * f), -25);
      activeHeli.rotation.set(0, 0, 0);
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
