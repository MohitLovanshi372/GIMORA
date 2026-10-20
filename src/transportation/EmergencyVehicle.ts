/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { Vehicle } from './Vehicle';
import { TrafficLight } from './TrafficLight';

export type EmergencyType = 'ambulance' | 'police' | 'fire-truck';

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
  geo.rotateY(Math.PI / 2);
  geo.center();
  return geo;
}

const policeBodyGeo = createExtrudedProfile(
  [
    [-2.38, 0.18],
    [-2.45, 0.56],
    [-2.20, 0.82],
    [-1.02, 0.96],
    [1.32, 0.98],
    [2.34, 0.88],
    [2.42, 0.46],
    [2.26, 0.18],
  ],
  2.14,
  0.08
);

const policeCabinGeo = createExtrudedProfile(
  [
    [-1.08, 0.0],
    [-0.42, 0.62],
    [0.82, 0.62],
    [1.45, 0.0],
  ],
  1.72,
  0.06
);

const ambCabGeo = createExtrudedProfile(
  [
    [-1.45, 0.15],
    [-1.50, 0.72],
    [-1.05, 1.12],
    [-0.25, 1.88],
    [0.85, 1.88],
    [0.85, 0.15],
  ],
  2.26,
  0.07
);

const tireGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 16);
tireGeo.rotateZ(Math.PI / 2);
const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.34, 12);
rimGeo.rotateZ(Math.PI / 2);

const tireMat = new THREE.MeshStandardMaterial({ color: 0x0b0f19, roughness: 0.85, metalness: 0.15 });
const chromeMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.16, metalness: 0.92 });
const darkSteelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.55, metalness: 0.6 });
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0x090d16,
  roughness: 0.06,
  transmission: 0.68,
  transparent: true,
  opacity: 0.9,
  clearcoat: 1.0,
});

export class EmergencyVehicle extends Vehicle {
  public emergencyType: EmergencyType;
  private strobeMeshes: THREE.Mesh[] = [];
  private wheelGroups: THREE.Object3D[] = [];
  private strobeMatRed = new THREE.MeshBasicMaterial({ color: 0xff0033 });
  private strobeMatBlue = new THREE.MeshBasicMaterial({ color: 0x0088ff });
  private strobeMatWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
  private strobeMatAmber = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  private strobeTimer = 0;

  constructor(id: string, emergencyType: EmergencyType) {
    super(id, emergencyType);
    this.emergencyType = emergencyType;
    this.isEmergency = true;
    this.maxSpeed = 22; // ~80 km/h priority response
    this.acceleration = 12;
    this.braking = 16;
    this.buildMesh();
  }

  private addWheel(x: number, y: number, z: number, scale = 1.0) {
    const wGroup = new THREE.Group();
    wGroup.position.set(x, y, z);
    wGroup.scale.setScalar(scale);

    const tire = new THREE.Mesh(tireGeo, tireMat);
    const rim = new THREE.Mesh(rimGeo, chromeMat);
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.42, 0.08), darkSteelMat);
    wGroup.add(tire, rim, spoke);
    this.mesh.add(wGroup);
    this.wheelGroups.push(wGroup);
  }

  private buildMesh() {
    const isAmb = this.emergencyType === 'ambulance';
    const isFire = this.emergencyType === 'fire-truck';

    if (isFire) {
      // 1. Municipal Aerial Ladder & Pumper Fire Engine
      const fireRedMat = new THREE.MeshPhysicalMaterial({
        color: 0xdc2626,
        roughness: 0.18,
        metalness: 0.55,
        clearcoat: 1.0,
      });
      const whiteRoofMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.2 });
      const shutterMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.88, roughness: 0.22 });

      // Crew Cab (Front)
      const crewCab = new THREE.Mesh(new THREE.BoxGeometry(2.76, 2.15, 3.1), fireRedMat);
      crewCab.position.set(0, 1.42, -3.15);
      crewCab.castShadow = true;
      this.mesh.add(crewCab);

      const cabRoof = new THREE.Mesh(new THREE.BoxGeometry(2.78, 0.28, 3.12), whiteRoofMat);
      cabRoof.position.set(0, 2.55, -3.15);
      this.mesh.add(cabRoof);

      const cabWindshield = new THREE.Mesh(new THREE.BoxGeometry(2.54, 0.86, 0.14), glassMat);
      cabWindshield.position.set(0, 1.86, -4.68);
      this.mesh.add(cabWindshield);

      const cabSideGlass = new THREE.Mesh(new THREE.BoxGeometry(2.80, 0.78, 2.2), glassMat);
      cabSideGlass.position.set(0, 1.86, -3.10);
      this.mesh.add(cabSideGlass);

      // Chrome Front Extended Bumper, Siren Speaker & Grille
      const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(2.86, 0.36, 0.52), chromeMat);
      frontBumper.position.set(0, 0.52, -4.82);
      this.mesh.add(frontBumper);

      const frontGrille = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.72, 0.10), chromeMat);
      frontGrille.position.set(0, 1.06, -4.71);
      this.mesh.add(frontGrille);

      // Pump Panel & Rear Apparatus Body with Aluminum Roll-Up Compartments
      const pumpModule = new THREE.Mesh(new THREE.BoxGeometry(2.72, 1.95, 1.25), darkSteelMat);
      pumpModule.position.set(0, 1.32, -0.92);
      this.mesh.add(pumpModule);

      const rearBody = new THREE.Mesh(new THREE.BoxGeometry(2.82, 2.05, 5.15), fireRedMat);
      rearBody.position.set(0, 1.38, 2.28);
      rearBody.castShadow = true;
      this.mesh.add(rearBody);

      // 3 Roll-Up Aluminum Equipment Shutters per side + High-Visibility Reflective Stripe
      [-0.6, 1.15, 2.95].forEach((sz) => {
        const shutter = new THREE.Mesh(new THREE.BoxGeometry(2.86, 1.25, 1.35), shutterMat);
        shutter.position.set(0, 1.48, sz + 1.0);
        this.mesh.add(shutter);
      });

      const reflectiveStripe = new THREE.Mesh(
        new THREE.BoxGeometry(2.85, 0.18, 9.4),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      reflectiveStripe.position.set(0, 0.82, 0.0);
      this.mesh.add(reflectiveStripe);

      // Roof Turntable & Telescoping Aluminum Aerial Ladder Assembly
      const turntable = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.32, 16), darkSteelMat);
      turntable.position.set(0, 2.55, 3.4);
      this.mesh.add(turntable);

      const ladderGroup = new THREE.Group();
      ladderGroup.position.set(0, 2.88, 0.35);
      ladderGroup.rotation.x = 0.04; // Slightly elevated toward front

      [-0.45, 0.45].forEach((lx) => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 8.6), chromeMat);
        rail.position.set(lx, 0, 0);
        ladderGroup.add(rail);
      });
      for (let r = -3.8; r <= 3.8; r += 0.65) {
        const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), chromeMat);
        rung.rotation.z = Math.PI / 2;
        rung.position.set(0, 0, r);
        ladderGroup.add(rung);
      }
      // Deluge Water Monitor Nozzle at ladder tip
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.65, 8), darkSteelMat);
      nozzle.rotation.x = Math.PI / 2;
      nozzle.position.set(0, 0.22, -4.35);
      ladderGroup.add(nozzle);
      this.mesh.add(ladderGroup);

      // Emergency Lightbar Pods (Red + White + Amber)
      const barL = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.24, 0.38), this.strobeMatRed);
      barL.position.set(-0.78, 2.80, -4.15);
      this.mesh.add(barL);
      this.strobeMeshes.push(barL);

      const barR = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.24, 0.38), this.strobeMatAmber);
      barR.position.set(0.78, 2.80, -4.15);
      this.mesh.add(barR);
      this.strobeMeshes.push(barR);

      // 6 Heavy-Duty Fire Engine Wheels
      [-1.38, 1.38].forEach((wx) => {
        [-3.25, 1.55, 3.35].forEach((wz) => {
          this.addWheel(wx, 0.46, wz, 1.1);
        });
      });
    } else if (isAmb) {
      // 2. Modular Type-I Paramedic Trauma Ambulance
      const whiteMat = new THREE.MeshPhysicalMaterial({
        color: 0xf8fafc,
        roughness: 0.2,
        metalness: 0.25,
        clearcoat: 0.9,
      });
      const redStripeMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.25, metalness: 0.3 });

      // Forward Sprinter Chassis Cab
      const cab = new THREE.Mesh(ambCabGeo, whiteMat);
      cab.position.set(0, 1.02, -1.85);
      cab.castShadow = true;
      this.mesh.add(cab);

      const cabWindshield = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.72, 0.12), glassMat);
      cabWindshield.position.set(0, 1.48, -2.72);
      cabWindshield.rotation.x = -0.35;
      this.mesh.add(cabWindshield);

      const cabSideWin = new THREE.Mesh(new THREE.BoxGeometry(2.28, 0.62, 1.05), glassMat);
      cabSideWin.position.set(0, 1.46, -1.78);
      this.mesh.add(cabSideWin);

      // High-Roof Modular Patient Care Box
      const medBox = new THREE.Mesh(new THREE.BoxGeometry(2.56, 2.24, 4.15), whiteMat);
      medBox.position.set(0, 1.38, 1.12);
      medBox.castShadow = true;
      this.mesh.add(medBox);

      // Red Life-Line Stripe & Blue Star-of-Life Medical Crosses
      const sideStripe = new THREE.Mesh(new THREE.BoxGeometry(2.60, 0.38, 4.18), redStripeMat);
      sideStripe.position.set(0, 1.06, 1.12);
      this.mesh.add(sideStripe);

      const crossMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
      const crossV = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.78, 0.24), crossMat);
      crossV.position.set(0, 1.72, 1.15);
      this.mesh.add(crossV);

      const crossH = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.24, 0.78), crossMat);
      crossH.position.set(0, 1.72, 1.15);
      this.mesh.add(crossH);

      // Rear Double Doors with Frosted Windows & Rear Step Bumper
      const rearWin = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.65, 0.08), glassMat);
      rearWin.position.set(0, 1.78, 3.21);
      this.mesh.add(rearWin);

      const stepBumper = new THREE.Mesh(new THREE.BoxGeometry(2.58, 0.22, 0.34), chromeMat);
      stepBumper.position.set(0, 0.36, 3.28);
      this.mesh.add(stepBumper);

      // Front Emergency Lightbar & Perimeter Box Strobe Pods
      const barL = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.24, 0.36), this.strobeMatRed);
      barL.position.set(-0.62, 2.58, -0.72);
      this.mesh.add(barL);
      this.strobeMeshes.push(barL);

      const barR = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.24, 0.36), this.strobeMatBlue);
      barR.position.set(0.62, 2.58, -0.72);
      this.mesh.add(barR);
      this.strobeMeshes.push(barR);

      // 4 Ambulance Wheels
      [
        [-1.18, -2.05],
        [1.18, -2.05],
        [-1.24, 1.85],
        [1.24, 1.85],
      ].forEach(([wx, wz]) => {
        this.addWheel(wx, 0.42, wz, 0.98);
      });
    } else {
      // 3. Metropolitan Police Pursuit Interceptor Cruiser
      const blackMat = new THREE.MeshPhysicalMaterial({
        color: 0x090d16,
        roughness: 0.16,
        metalness: 0.75,
        clearcoat: 1.0,
      });
      const whiteDoorMat = new THREE.MeshPhysicalMaterial({
        color: 0xf8fafc,
        roughness: 0.18,
        metalness: 0.3,
        clearcoat: 1.0,
      });

      const body = new THREE.Mesh(policeBodyGeo, blackMat);
      body.position.y = 0.56;
      body.castShadow = true;
      this.mesh.add(body);

      // Contrast White Doors & Roof Panel (Classic B&W Interceptor Livery)
      const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.66, 2.05), whiteDoorMat);
      doorPanel.position.set(0, 0.66, 0.05);
      this.mesh.add(doorPanel);

      const cabin = new THREE.Mesh(policeCabinGeo, glassMat);
      cabin.position.set(0, 1.12, 0.08);
      this.mesh.add(cabin);

      const roofCap = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.06, 1.48), whiteDoorMat);
      roofCap.position.set(0, 1.42, 0.15);
      this.mesh.add(roofCap);

      // Heavy Steel Front Push-Bumper (Pit-Maneuver Bullbar) & A-Pillar Spotlight
      const bullbar = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.54, 0.24), darkSteelMat);
      bullbar.position.set(0, 0.54, -2.52);
      this.mesh.add(bullbar);

      const spotlight = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.18, 8), this.strobeMatWhite);
      spotlight.rotation.x = Math.PI / 2;
      spotlight.position.set(-0.98, 1.06, -0.82);
      this.mesh.add(spotlight);

      // Roof Interceptor V-Bar Lightbar (Red + Blue)
      const barBase = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.06, 0.28), darkSteelMat);
      barBase.position.set(0, 1.48, -0.05);
      this.mesh.add(barBase);

      const barL = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.14, 0.24), this.strobeMatRed);
      barL.position.set(-0.36, 1.56, -0.05);
      this.mesh.add(barL);
      this.strobeMeshes.push(barL);

      const barR = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.14, 0.24), this.strobeMatBlue);
      barR.position.set(0.36, 1.56, -0.05);
      this.mesh.add(barR);
      this.strobeMeshes.push(barR);

      // 4 Police Interceptor Wheels
      [
        [-1.05, -1.56],
        [1.05, -1.56],
        [-1.05, 1.56],
        [1.05, 1.56],
      ].forEach(([wx, wz]) => {
        this.addWheel(wx, 0.38, wz, 0.90);
      });
    }

    // Front Headlamps & Rear Taillamps
    const frontZ = isFire ? -4.72 : isAmb ? -3.02 : -2.44;
    const rearZ = isFire ? 4.86 : isAmb ? 3.21 : 2.44;
    [-0.86, 0.86].forEach((hx) => {
      const hl = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.18, 0.1),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      hl.position.set(hx, 0.68, frontZ);
      this.mesh.add(hl);
      this.headlights.push(hl);

      const tl = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.18, 0.1),
        new THREE.MeshBasicMaterial({ color: 0xff0044 })
      );
      tl.position.set(hx, 0.68, rearZ);
      this.mesh.add(tl);
      this.taillights.push(tl);
    });
  }

  public override update(
    delta: number,
    trafficLights: Map<string, TrafficLight>,
    allVehicles: Vehicle[],
    pedestrians?: any[],
    trains?: any[]
  ) {
    if (!this.active) return;

    // Flash emergency strobe lightbars at 8 Hz alternating
    this.strobeTimer += delta * 14;
    const toggle = Math.sin(this.strobeTimer) > 0;

    if (this.strobeMeshes.length >= 2) {
      this.strobeMeshes[0].visible = toggle;
      this.strobeMeshes[1].visible = !toggle;
    }

    super.update(delta, trafficLights, allVehicles, pedestrians, trains);

    // Spin wheels proportionally to speed
    if (this.speed > 0.05) {
      const spin = (this.speed * delta) / 0.40;
      for (let i = 0; i < this.wheelGroups.length; i++) {
        this.wheelGroups[i].rotation.x -= spin;
      }
    }
  }

  public dispose() {
    this.mesh.clear();
    this.strobeMatRed.dispose();
    this.strobeMatBlue.dispose();
    this.strobeMatWhite.dispose();
    this.strobeMatAmber.dispose();
  }
}
