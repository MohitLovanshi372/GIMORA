/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { Vehicle } from './Vehicle';

// Procedurally extruded automotive side profiles (centered on X, extruded across vehicle width)
function createExtrudedProfile(points: [number, number][], width: number, bevel = 0.08): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i][0], points[i][1]);
  }
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: width - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
  });
  // Rotate so 2D X becomes -Z/+Z (vehicle length) and extrusion depth becomes X (vehicle width)
  geo.rotateY(Math.PI / 2);
  geo.center();
  return geo;
}

// 1. Sculpted Coupe Lower Body & Fastback Greenhouse
const coupeBodyGeo = createExtrudedProfile(
  [
    [-2.25, 0.18], // Front lower lip
    [-2.32, 0.52], // Front bumper nose
    [-2.10, 0.78], // Hood leading edge
    [-0.95, 0.92], // Base of windshield
    [1.15, 0.95],  // Base of rear deck
    [2.18, 0.88],  // Rear trunk lip
    [2.28, 0.45],  // Rear bumper
    [2.12, 0.18],  // Rear diffuser base
  ],
  2.04,
  0.09
);

const coupeCabinGeo = createExtrudedProfile(
  [
    [-1.05, 0.0],  // Base of A-pillar
    [-0.35, 0.56], // Windshield top header
    [0.55, 0.54],  // Roofline peak
    [1.45, 0.0],   // Fastback C-pillar tail
  ],
  1.66,
  0.06
);

// 2. Sculpted Executive Sedan Lower Body & Cabin
const sedanBodyGeo = createExtrudedProfile(
  [
    [-2.42, 0.18],
    [-2.48, 0.56],
    [-2.25, 0.82],
    [-1.05, 0.96],
    [1.35, 0.98],
    [2.38, 0.90],
    [2.46, 0.46],
    [2.30, 0.18],
  ],
  2.12,
  0.09
);

const sedanCabinGeo = createExtrudedProfile(
  [
    [-1.12, 0.0],
    [-0.45, 0.62],
    [0.85, 0.62],
    [1.48, 0.0],
  ],
  1.74,
  0.06
);

// 3. Low-Slung Aerodynamic Supercar Wedge Profile
const supercarBodyGeo = createExtrudedProfile(
  [
    [-2.45, 0.14], // Front carbon splitter nose
    [-2.50, 0.42], // Low wedge nose
    [-1.85, 0.68], // Front fender crest
    [-0.85, 0.78], // Cockpit cowl
    [1.25, 0.86],  // Mid-engine deck haunch
    [2.38, 0.76],  // Rear fascia top
    [2.45, 0.36],  // Rear mesh grille
    [2.28, 0.14],  // Venturi diffuser bottom
  ],
  2.28,
  0.08
);

const supercarCabinGeo = createExtrudedProfile(
  [
    [-1.18, 0.0],
    [-0.30, 0.48],
    [0.45, 0.46],
    [1.35, 0.0],
  ],
  1.62,
  0.05
);

// 4. Sculpted Semi / Delivery Truck Aerodynamic Cab
const truckCabGeo = createExtrudedProfile(
  [
    [-1.15, 0.15],
    [-1.20, 0.95],
    [-0.92, 1.85],
    [-0.35, 2.15], // Aerodynamic roof fairing
    [1.05, 2.15],
    [1.05, 0.15],
  ],
  2.36,
  0.07
);

// Shared Wheel, Tire, Rim & Brake Geometries
const tireGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 16);
tireGeo.rotateZ(Math.PI / 2);

const alloyRimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.30, 12);
alloyRimGeo.rotateZ(Math.PI / 2);

const hubCapGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.32, 8);
hubCapGeo.rotateZ(Math.PI / 2);

const wheelArchGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 14, 1, false, 0, Math.PI);
wheelArchGeo.rotateZ(Math.PI / 2);

const headlampGeo = new THREE.BoxGeometry(0.42, 0.14, 0.08);
const tailampGeo = new THREE.BoxGeometry(0.46, 0.14, 0.08);
const mirrorGeo = new THREE.BoxGeometry(0.22, 0.12, 0.16);
const exhaustGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.24, 8);
exhaustGeo.rotateX(Math.PI / 2);

// Shared Realistic GTA V Automotive Clearcoat Paints
const REALISTIC_CAR_PAINTS = [
  0x0f172a, // Midnight Obsidian Metallic
  0xdc2626, // Torino Red Pearl
  0xf8fafc, // Ice White Diamond
  0x1d4ed8, // Ultra Blue Metallic
  0xeab308, // Race Yellow Pearl
  0x475569, // Titanium Silver Metallic
  0x059669, // Emerald Racing Green Pearl
  0x7c3aed, // Schafter Purple Metallic
  0xea580c, // Sunset Valencia Orange Pearl
];

const tireMat = new THREE.MeshStandardMaterial({ color: 0x0b0f19, roughness: 0.85, metalness: 0.15 });
const alloyRimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.16, metalness: 0.92 });
const goldRimMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.22, metalness: 0.88 });
const darkTrimMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.65, metalness: 0.45 });
const chromeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.12, metalness: 0.95 });

const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0x090d16,
  roughness: 0.05,
  metalness: 0.15,
  clearcoat: 1.0,
  clearcoatRoughness: 0.03,
  transmission: 0.72,
  opacity: 0.92,
  transparent: true,
});

const headlampMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const drlAmberMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
const plateMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

export class Car extends Vehicle {
  public subModel: 'coupe' | 'sedan' | 'motorcycle' | 'taxi' | 'delivery-truck' | 'supercar' | 'dubai-police';
  private brakeLightMaterial: THREE.MeshBasicMaterial;
  private indicatorLightL: THREE.Mesh | null = null;
  private indicatorLightR: THREE.Mesh | null = null;
  private policeLightBarL: THREE.Mesh | null = null;
  private policeLightBarR: THREE.Mesh | null = null;
  private wheelGroups: THREE.Object3D[] = [];
  private blinkTimer = 0;

  constructor(
    id: string,
    subModel: 'coupe' | 'sedan' | 'motorcycle' | 'taxi' | 'delivery-truck' | 'supercar' | 'dubai-police' = 'coupe'
  ) {
    super(
      id,
      subModel === 'motorcycle'
        ? 'motorcycle'
        : subModel === 'taxi'
        ? 'taxi'
        : subModel === 'delivery-truck'
        ? 'delivery-truck'
        : 'car'
    );
    this.subModel = subModel;
    this.brakeLightMaterial = new THREE.MeshBasicMaterial({ color: 0x990018 });
    this.buildMesh();
  }

  private addDetailedWheel(x: number, y: number, z: number, scale = 1.0, useGoldRim = false) {
    const wGroup = new THREE.Group();
    wGroup.position.set(x, y, z);
    wGroup.scale.setScalar(scale);

    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.castShadow = true;
    wGroup.add(tire);

    const rim = new THREE.Mesh(alloyRimGeo, useGoldRim ? goldRimMat : alloyRimMat);
    wGroup.add(rim);

    const cap = new THREE.Mesh(hubCapGeo, darkTrimMat);
    wGroup.add(cap);

    // Cross spokes for visible wheel rotation
    const spoke1 = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.42, 0.06), useGoldRim ? goldRimMat : chromeMat);
    const spoke2 = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.06, 0.42), useGoldRim ? goldRimMat : chromeMat);
    wGroup.add(spoke1, spoke2);

    this.mesh.add(wGroup);
    this.wheelGroups.push(wGroup);
  }

  private buildMesh() {
    const isMoto = this.subModel === 'motorcycle';
    const isSedan = this.subModel === 'sedan';
    const isTaxi = this.subModel === 'taxi';
    const isDelivery = this.subModel === 'delivery-truck';
    const isSupercar = this.subModel === 'supercar';
    const isDubaiPolice = this.subModel === 'dubai-police';

    const hash = this.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    if (isMoto) {
      this.maxSpeed = 20; // ~72 km/h
      this.acceleration = 13;

      const bikeColor = REALISTIC_CAR_PAINTS[hash % REALISTIC_CAR_PAINTS.length];
      const bikeMat = new THREE.MeshPhysicalMaterial({
        color: bikeColor,
        metalness: 0.8,
        roughness: 0.16,
        clearcoat: 1.0,
      });

      // Sculpted sportbike fairing & fuel tank
      const fairing = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.56, 1.35), bikeMat);
      fairing.position.set(0, 0.68, -0.15);
      fairing.rotation.x = 0.15;
      fairing.castShadow = true;
      this.mesh.add(fairing);

      // Front aerodynamic nose & windscreen visor
      const noseCone = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 8), bikeMat);
      noseCone.rotation.x = -Math.PI / 2;
      noseCone.position.set(0, 0.76, -0.92);
      this.mesh.add(noseCone);

      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.26, 0.45), glassMat);
      visor.position.set(0, 0.96, -0.68);
      visor.rotation.x = -0.55;
      this.mesh.add(visor);

      // Engine block, swingarm & chrome exhaust pipe
      const engineBlock = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.42, 0.65), darkTrimMat);
      engineBlock.position.set(0, 0.44, 0.0);
      this.mesh.add(engineBlock);

      const exhaustPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.95, 8), chromeMat);
      exhaustPipe.rotation.x = Math.PI / 2 - 0.18;
      exhaustPipe.position.set(0.26, 0.42, 0.55);
      this.mesh.add(exhaustPipe);

      // Telescopic front forks & handlebars
      const fork = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.72, 0.08), chromeMat);
      fork.position.set(0, 0.62, -0.72);
      fork.rotation.x = -0.35;
      this.mesh.add(fork);

      const handlebars = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.74, 6), darkTrimMat);
      handlebars.rotation.z = Math.PI / 2;
      handlebars.position.set(0, 0.95, -0.52);
      this.mesh.add(handlebars);

      // Articulated Sportbike Rider + Helmet
      const suitMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.2 });
      const riderTorso = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.58, 0.32), suitMat);
      riderTorso.position.set(0, 1.12, 0.18);
      riderTorso.rotation.x = 0.52; // Leaning forward into handlebars
      this.mesh.add(riderTorso);

      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 12), bikeMat);
      helmet.position.set(0, 1.42, -0.05);
      this.mesh.add(helmet);

      const helmetVisor = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.22), glassMat);
      helmetVisor.position.set(0, 1.42, -0.14);
      this.mesh.add(helmetVisor);

      // Front & Rear Motorcycle Wheels
      this.addDetailedWheel(0, 0.34, -0.88, 0.92);
      this.addDetailedWheel(0, 0.34, 0.84, 0.95);

      // Headlight & Taillight
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.08), headlampMat);
      hl.position.set(0, 0.76, -1.18);
      this.mesh.add(hl);
      this.headlights.push(hl);

      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.08), this.brakeLightMaterial);
      tl.position.set(0, 0.82, 0.98);
      this.mesh.add(tl);
      this.taillights.push(tl);
    } else if (isDelivery) {
      this.maxSpeed = 14;
      this.acceleration = 6;

      const cabColors = [0x1e40af, 0x0f172a, 0xb91c1c, 0x047857];
      const cabMat = new THREE.MeshPhysicalMaterial({
        color: cabColors[hash % cabColors.length],
        metalness: 0.7,
        roughness: 0.22,
        clearcoat: 0.9,
      });

      // Sculpted Aerodynamic Truck Cab
      const cab = new THREE.Mesh(truckCabGeo, cabMat);
      cab.position.set(0, 1.22, -1.95);
      cab.castShadow = true;
      cab.receiveShadow = true;
      this.mesh.add(cab);

      // Panoramic Truck Windshield & Side Windows
      const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.72, 0.12), glassMat);
      windshield.position.set(0, 1.62, -2.98);
      windshield.rotation.x = -0.22;
      this.mesh.add(windshield);

      const sideWin = new THREE.Mesh(new THREE.BoxGeometry(2.40, 0.65, 1.15), glassMat);
      sideWin.position.set(0, 1.62, -2.15);
      this.mesh.add(sideWin);

      // Heavy Chrome Grille & Front Bumper
      const grille = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.68, 0.08), chromeMat);
      grille.position.set(0, 0.85, -3.14);
      this.mesh.add(grille);

      const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.32, 0.28), chromeMat);
      frontBumper.position.set(0, 0.42, -3.12);
      this.mesh.add(frontBumper);

      // Twin Vertical Chrome Exhaust Stacks behind cab
      [-1.12, 1.12].forEach((ex) => {
        const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 8), chromeMat);
        stack.position.set(ex, 1.65, -0.92);
        this.mesh.add(stack);

        // Side West-Coast Mirrors
        const mirrorArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.52, 0.08), chromeMat);
        mirrorArm.position.set(ex * 1.12, 1.62, -2.65);
        this.mesh.add(mirrorArm);
      });

      // Corrugated Aluminum Cargo Box Container
      const containerMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.35, roughness: 0.42 });
      const container = new THREE.Mesh(new THREE.BoxGeometry(2.54, 2.35, 4.8), containerMat);
      container.position.set(0, 1.62, 1.45);
      container.castShadow = true;
      container.receiveShadow = true;
      this.mesh.add(container);

      // Logistics Corporate Livery Stripe & Roof Fairing Trim
      const stripeMat = new THREE.MeshStandardMaterial({
        color: cabColors[hash % cabColors.length],
        metalness: 0.5,
        roughness: 0.35,
      });
      const cStripe = new THREE.Mesh(new THREE.BoxGeometry(2.58, 0.42, 4.4), stripeMat);
      cStripe.position.set(0, 1.65, 1.45);
      this.mesh.add(cStripe);

      // Rear Roll-Up Shutter Door Frame & Steel Underride Bar
      const rearFrame = new THREE.Mesh(new THREE.BoxGeometry(2.35, 2.1, 0.08), alloyRimMat);
      rearFrame.position.set(0, 1.62, 3.86);
      this.mesh.add(rearFrame);

      const underride = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.16, 0.16), darkTrimMat);
      underride.position.set(0, 0.38, 3.82);
      this.mesh.add(underride);

      // 6 Heavy-Duty Truck Wheels (Steer Axle + Tandem Drive Axles)
      [-1.18, 1.18].forEach((wx) => {
        [-2.15, 0.85, 2.55].forEach((wz) => {
          this.addDetailedWheel(wx, 0.40, wz, 1.12);
        });
      });

      // Headlights & Amber Roof Clearance Marker Lights
      [-0.88, 0.88].forEach((hx) => {
        const hl = new THREE.Mesh(headlampGeo, headlampMat);
        hl.position.set(hx, 0.72, -3.15);
        this.mesh.add(hl);
        this.headlights.push(hl);
      });

      [-0.8, 0, 0.8].forEach((mx) => {
        const marker = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, 0.08, 0.08),
          new THREE.MeshBasicMaterial({ color: 0xf59e0b })
        );
        marker.position.set(mx, 2.74, -0.94);
        this.mesh.add(marker);
      });

      // Taillights
      [-0.95, 0.95].forEach((tx) => {
        const tl = new THREE.Mesh(tailampGeo, this.brakeLightMaterial);
        tl.position.set(tx, 0.56, 3.86);
        this.mesh.add(tl);
        this.taillights.push(tl);
      });
    } else if (isSupercar || isDubaiPolice) {
      this.maxSpeed = isDubaiPolice ? 28 : 25;
      this.acceleration = 16;

      let paintColor = 0xdc2626;
      if (isDubaiPolice) {
        paintColor = 0xffffff; // Dubai Police Crisp White
      } else {
        const scColors = [0xdc2626, 0xf59e0b, 0x0284c7, 0x10b981, 0x7c3aed];
        paintColor = scColors[hash % scColors.length];
      }

      const carMat = new THREE.MeshPhysicalMaterial({
        color: paintColor,
        roughness: 0.12,
        metalness: 0.86,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        envMapIntensity: 2.3,
      });

      // Sculpted Wedge Hypercar Body
      const bodyMesh = new THREE.Mesh(supercarBodyGeo, carMat);
      bodyMesh.position.y = 0.52;
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      this.mesh.add(bodyMesh);

      // Tear-Drop Canopy Greenhouse
      const cabinMesh = new THREE.Mesh(supercarCabinGeo, glassMat);
      cabinMesh.position.set(0, 0.94, -0.08);
      this.mesh.add(cabinMesh);

      // Side Mid-Engine Air Intakes & Carbon Skirt Blades
      [-1.16, 1.16].forEach((sx) => {
        const intake = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.34, 1.25), darkTrimMat);
        intake.position.set(sx, 0.54, 0.45);
        this.mesh.add(intake);

        const skirt = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 3.1), darkTrimMat);
        skirt.position.set(sx, 0.18, 0.0);
        this.mesh.add(skirt);

        const mirror = new THREE.Mesh(mirrorGeo, carMat);
        mirror.position.set(sx * 1.02, 0.82, -0.78);
        this.mesh.add(mirror);
      });

      // Dubai Police Emerald Green Livery & Interceptor Lightbar
      if (isDubaiPolice) {
        const liveryMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.18, metalness: 0.45 });
        [-1.15, 1.15].forEach((lx) => {
          const badge = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.28, 3.4), liveryMat);
          badge.position.set(lx, 0.52, 0.05);
          this.mesh.add(badge);
        });
        const hoodStripe = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.04, 1.2), liveryMat);
        hoodStripe.position.set(0, 0.72, -1.65);
        hoodStripe.rotation.x = 0.16;
        this.mesh.add(hoodStripe);

        // Low-Profile Aerodynamic Police Lightbar
        const barBase = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.06, 0.24), darkTrimMat);
        barBase.position.set(0, 1.22, -0.1);
        this.mesh.add(barBase);

        const lightbarGeo = new THREE.BoxGeometry(0.48, 0.10, 0.20);
        const redStrobe = new THREE.Mesh(lightbarGeo, new THREE.MeshBasicMaterial({ color: 0xff0033 }));
        redStrobe.position.set(-0.28, 1.26, -0.1);
        this.mesh.add(redStrobe);
        this.policeLightBarL = redStrobe;

        const blueStrobe = new THREE.Mesh(lightbarGeo, new THREE.MeshBasicMaterial({ color: 0x0066ff }));
        blueStrobe.position.set(0.28, 1.26, -0.1);
        this.mesh.add(blueStrobe);
        this.policeLightBarR = blueStrobe;
      }

      // Swan-Neck Carbon GT Rear Wing & Front Splitter
      const wingBlade = new THREE.Mesh(new THREE.BoxGeometry(2.26, 0.07, 0.52), darkTrimMat);
      wingBlade.position.set(0, 1.14, 2.15);
      wingBlade.rotation.x = 0.12;
      this.mesh.add(wingBlade);

      [-0.72, 0.72].forEach((sx) => {
        const strut = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.36, 0.26), darkTrimMat);
        strut.position.set(sx, 0.94, 2.12);
        this.mesh.add(strut);
      });

      const splitter = new THREE.Mesh(new THREE.BoxGeometry(2.34, 0.06, 0.55), darkTrimMat);
      splitter.position.set(0, 0.18, -2.28);
      this.mesh.add(splitter);

      // Quad Center-Exit Exhaust Pipes & Rear Diffuser Fins
      [-0.38, -0.14, 0.14, 0.38].forEach((ex) => {
        const pipe = new THREE.Mesh(exhaustGeo, chromeMat);
        pipe.position.set(ex, 0.32, 2.44);
        this.mesh.add(pipe);
      });

      // Headlights + LED DRL Blades
      [-0.82, 0.82].forEach((hx) => {
        const hl = new THREE.Mesh(headlampGeo, headlampMat);
        hl.position.set(hx, 0.52, -2.42);
        this.mesh.add(hl);
        this.headlights.push(hl);

        const drl = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.05, 0.12), drlAmberMat);
        drl.position.set(hx, 0.58, -2.43);
        this.mesh.add(drl);
      });

      // Forward Volumetric Headlight Beam
      const beamGeo = new THREE.ConeGeometry(1.8, 8.5, 6);
      beamGeo.rotateX(Math.PI / 2);
      beamGeo.translate(0, 0, -6.0);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beamMesh.position.y = 0.15;
      this.mesh.add(beamMesh);

      // Full-Width Cyber LED Taillight Bar + Twin Brake Pods
      const lightbarRear = new THREE.Mesh(new THREE.BoxGeometry(2.08, 0.08, 0.08), this.brakeLightMaterial);
      lightbarRear.position.set(0, 0.68, 2.42);
      this.mesh.add(lightbarRear);
      this.taillights.push(lightbarRear);

      [-0.84, 0.84].forEach((tx) => {
        const tl = new THREE.Mesh(tailampGeo, this.brakeLightMaterial);
        tl.position.set(tx, 0.64, 2.43);
        this.mesh.add(tl);
        this.taillights.push(tl);
      });

      // Low-Profile Forged Gold / Titanium Supercar Wheels
      [
        [-1.12, -1.48],
        [1.12, -1.48],
        [-1.12, 1.48],
        [1.12, 1.48],
      ].forEach(([wx, wz]) => {
        this.addDetailedWheel(wx, 0.37, wz, 1.06, !isDubaiPolice);
      });
    } else {
      // Executive Sedan, Sport Coupe & City Taxi
      this.maxSpeed = isTaxi ? 16 : isSedan ? 15 : 18;
      this.acceleration = isSedan ? 7 : 9;

      const paintColor = isTaxi ? 0xeab308 : REALISTIC_CAR_PAINTS[hash % REALISTIC_CAR_PAINTS.length];

      const carMat = new THREE.MeshPhysicalMaterial({
        color: paintColor,
        roughness: 0.16,
        metalness: 0.82,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        envMapIntensity: 2.0,
      });

      const bodyMesh = new THREE.Mesh(isSedan || isTaxi ? sedanBodyGeo : coupeBodyGeo, carMat);
      bodyMesh.position.y = 0.56;
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      this.mesh.add(bodyMesh);

      const cabinMesh = new THREE.Mesh(isSedan || isTaxi ? sedanCabinGeo : coupeCabinGeo, glassMat);
      cabinMesh.position.set(0, 1.12, 0.08);
      this.mesh.add(cabinMesh);

      // Color-matched Roof Panel on top of glass cabin so pillars & roof look authentic
      const roofLength = isSedan || isTaxi ? 1.52 : 1.15;
      const roofPanel = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.06, roofLength), carMat);
      roofPanel.position.set(0, 1.41, 0.16);
      this.mesh.add(roofPanel);

      const halfZ = isSedan || isTaxi ? 2.43 : 2.27;

      // Sculpted Front Chrome Grille, Lower Air Intake & License Plate
      const grilleMesh = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.34, 0.08), chromeMat);
      grilleMesh.position.set(0, 0.54, -halfZ);
      this.mesh.add(grilleMesh);

      const lowerIntake = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.16, 0.08), darkTrimMat);
      lowerIntake.position.set(0, 0.28, -halfZ);
      this.mesh.add(lowerIntake);

      const frontPlate = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.09), plateMat);
      frontPlate.position.set(0, 0.36, -halfZ - 0.01);
      this.mesh.add(frontPlate);

      const rearPlate = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.09), plateMat);
      rearPlate.position.set(0, 0.48, halfZ + 0.01);
      this.mesh.add(rearPlate);

      // Side Wing Mirrors & Door Handles
      [-1.06, 1.06].forEach((sx) => {
        const mirror = new THREE.Mesh(mirrorGeo, carMat);
        mirror.position.set(sx, 0.92, -0.78);
        this.mesh.add(mirror);

        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.22), chromeMat);
        handle.position.set(sx * 0.99, 0.84, 0.05);
        this.mesh.add(handle);
      });

      // Illuminated Taxi Roof Sign & Checkered Side Band
      if (isTaxi) {
        const taxiBase = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.08, 0.38), darkTrimMat);
        taxiBase.position.set(0, 1.46, 0.05);
        this.mesh.add(taxiBase);

        const taxiLight = new THREE.Mesh(
          new THREE.BoxGeometry(0.82, 0.24, 0.30),
          new THREE.MeshBasicMaterial({ color: 0xfef08a })
        );
        taxiLight.position.set(0, 1.60, 0.05);
        this.mesh.add(taxiLight);
      }

      // Rocker Panels & Twin Chrome Exhaust Tips
      const rocker = new THREE.Mesh(
        new THREE.BoxGeometry(2.14, 0.10, isSedan || isTaxi ? 4.65 : 4.35),
        darkTrimMat
      );
      rocker.position.y = 0.22;
      this.mesh.add(rocker);

      [-0.68, 0.68].forEach((ex) => {
        const pipe = new THREE.Mesh(exhaustGeo, chromeMat);
        pipe.position.set(ex, 0.26, halfZ);
        this.mesh.add(pipe);
      });

      // Twin Projector LED Headlights
      [-0.76, 0.76].forEach((hx) => {
        const hl = new THREE.Mesh(headlampGeo, headlampMat);
        hl.position.set(hx, 0.64, -halfZ);
        this.mesh.add(hl);
        this.headlights.push(hl);
      });

      // Forward Road Illumination Cone
      const beamGeo = new THREE.ConeGeometry(1.6, 7.5, 6);
      beamGeo.rotateX(Math.PI / 2);
      beamGeo.translate(0, 0, -(isSedan || isTaxi ? 5.8 : 5.4));
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beamMesh.position.y = 0.15;
      this.mesh.add(beamMesh);

      // Taillights + Trunk Reflector Bar
      [-0.78, 0.78].forEach((tx) => {
        const tl = new THREE.Mesh(tailampGeo, this.brakeLightMaterial);
        tl.position.set(tx, 0.68, halfZ);
        this.mesh.add(tl);
        this.taillights.push(tl);
      });

      // Turn Indicators
      const indGeo = new THREE.BoxGeometry(0.18, 0.10, 0.08);
      const indMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const indL = new THREE.Mesh(indGeo, indMat);
      indL.position.set(-0.96, 0.62, -halfZ + 0.04);
      const indR = new THREE.Mesh(indGeo, indMat);
      indR.position.set(0.96, 0.62, -halfZ + 0.04);
      this.mesh.add(indL, indR);
      this.indicatorLightL = indL;
      this.indicatorLightR = indR;

      // 4 Detailed Spoked Alloy Wheels
      const halfW = 1.04;
      const halfL = isSedan || isTaxi ? 1.56 : 1.42;
      [
        [-halfW, -halfL],
        [halfW, -halfL],
        [-halfW, halfL],
        [halfW, halfL],
      ].forEach(([wx, wz]) => {
        this.addDetailedWheel(wx, 0.36, wz, 1.0);
      });
    }
  }

  public override update(
    delta: number,
    trafficLights: Map<string, any>,
    allVehicles: Vehicle[],
    pedestrians?: any[],
    trains?: any[]
  ) {
    const prevSpeed = this.speed;
    super.update(delta, trafficLights, allVehicles, pedestrians, trains);

    // Spin wheels proportionally to linear ground velocity
    if (this.speed > 0.05 && this.wheelGroups.length > 0) {
      const spinAngle = (this.speed * delta) / 0.36;
      for (let i = 0; i < this.wheelGroups.length; i++) {
        this.wheelGroups[i].rotation.x -= spinAngle;
      }
    }

    // Dynamic brake lights: Glow intense bright red when slowing down or stopped
    const isBraking = this.speed < prevSpeed - 0.1 || this.speed < 0.5;
    if (isBraking) {
      this.brakeLightMaterial.color.setHex(0xff0033);
    } else {
      this.brakeLightMaterial.color.setHex(0x660015);
    }

    // Blinking turn indicator
    if (this.state === 'turning') {
      this.blinkTimer += delta * 6;
      const visible = Math.sin(this.blinkTimer) > 0;
      if (this.indicatorLightL) this.indicatorLightL.visible = visible;
      if (this.indicatorLightR) this.indicatorLightR.visible = visible;
    } else {
      if (this.indicatorLightL) this.indicatorLightL.visible = false;
      if (this.indicatorLightR) this.indicatorLightR.visible = false;
    }

    // Dubai Police strobe flash
    if (this.subModel === 'dubai-police') {
      const flash = Math.sin(Date.now() * 0.012) > 0;
      if (this.policeLightBarL) this.policeLightBarL.visible = flash;
      if (this.policeLightBarR) this.policeLightBarR.visible = !flash;
    }
  }

  public dispose() {
    this.mesh.clear();
    this.brakeLightMaterial.dispose();
  }
}
