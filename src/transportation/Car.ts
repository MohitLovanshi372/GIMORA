/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { Vehicle } from './Vehicle';

// Shared geometries for performance
const coupeBodyGeo = new THREE.BoxGeometry(2.1, 0.9, 4.4);
const coupeCabinGeo = new THREE.BoxGeometry(1.6, 0.6, 2.2);
const sedanBodyGeo = new THREE.BoxGeometry(2.2, 1.0, 4.8);
const sedanCabinGeo = new THREE.BoxGeometry(1.7, 0.7, 2.6);
const motoBodyGeo = new THREE.BoxGeometry(0.7, 0.9, 2.2);
const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.4, 8);
wheelGeo.rotateZ(Math.PI / 2);

const headlampGeo = new THREE.BoxGeometry(0.35, 0.15, 0.1);
const tailampGeo = new THREE.BoxGeometry(0.35, 0.15, 0.1);

// Shared Realistic GTA V Automotive Clearcoat Paints
const REALISTIC_CAR_PAINTS = [
  0x0f172a, // Midnight Obsidian Metallic
  0xdc2626, // Torino Red Pearl
  0xf8fafc, // Ice White Diamond
  0x1d4ed8, // Ultra Blue Metallic
  0xeab308, // Race Yellow Pearl
  0x475569, // Bluish Silver Metallic
  0x059669, // Gasoline Green Pearl
  0x7c3aed, // Schafter Purple Metallic
  0xea580c, // Sunrise Orange Pearl
];

const wheelMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.78, metalness: 0.2 });
const alloyRimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.18, metalness: 0.92 });
const alloyRimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.42, 8);
alloyRimGeo.rotateZ(Math.PI / 2);

const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0x090d16,
  roughness: 0.06,
  metalness: 0.15,
  clearcoat: 1.0,
  clearcoatRoughness: 0.04,
  transmission: 0.72,
  opacity: 0.92,
  transparent: true,
});

const headlampMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const tailampMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
const chassisMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.75, metalness: 0.4 });

export class Car extends Vehicle {
  public subModel: 'coupe' | 'sedan' | 'motorcycle' | 'taxi' | 'delivery-truck' | 'supercar' | 'dubai-police';
  private brakeLightMaterial: THREE.MeshBasicMaterial;
  private indicatorLightL: THREE.Mesh | null = null;
  private indicatorLightR: THREE.Mesh | null = null;
  private policeLightBarL: THREE.Mesh | null = null;
  private policeLightBarR: THREE.Mesh | null = null;
  private blinkTimer = 0;

  constructor(id: string, subModel: 'coupe' | 'sedan' | 'motorcycle' | 'taxi' | 'delivery-truck' | 'supercar' | 'dubai-police' = 'coupe') {
    super(id, subModel === 'motorcycle' ? 'motorcycle' : subModel === 'taxi' ? 'taxi' : subModel === 'delivery-truck' ? 'delivery-truck' : 'car');
    this.subModel = subModel;
    this.brakeLightMaterial = new THREE.MeshBasicMaterial({ color: 0x880011 });
    this.buildMesh();
  }

  private buildMesh() {
    const isMoto = this.subModel === 'motorcycle';
    const isSedan = this.subModel === 'sedan';
    const isTaxi = this.subModel === 'taxi';
    const isDelivery = this.subModel === 'delivery-truck';
    const isSupercar = this.subModel === 'supercar';
    const isDubaiPolice = this.subModel === 'dubai-police';

    if (isMoto) {
      this.maxSpeed = 19; // ~68 km/h
      this.acceleration = 12;

      const body = new THREE.Mesh(motoBodyGeo, new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 }));
      body.position.y = 0.55;
      body.castShadow = true;
      this.mesh.add(body);

      // Frame Accent
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.08, 2.1), chassisMat);
      frame.position.y = 0.55;
      this.mesh.add(frame);

      // Wheels
      const wFront = new THREE.Mesh(wheelGeo, wheelMat);
      wFront.position.set(0, 0.35, -0.8);
      this.mesh.add(wFront);

      const wRear = new THREE.Mesh(wheelGeo, wheelMat);
      wRear.position.set(0, 0.35, 0.8);
      this.mesh.add(wRear);

      // Headlight
      const hl = new THREE.Mesh(headlampGeo, headlampMat);
      hl.position.set(0, 0.7, -1.12);
      this.mesh.add(hl);
      this.headlights.push(hl);

      // Taillight
      const tl = new THREE.Mesh(tailampGeo, this.brakeLightMaterial);
      tl.position.set(0, 0.7, 1.12);
      this.mesh.add(tl);
      this.taillights.push(tl);
    } else if (isDelivery) {
      this.maxSpeed = 14;
      this.acceleration = 6;

      const cab = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 1.4, 2.2),
        new THREE.MeshStandardMaterial({ color: 0x1e40af, metalness: 0.7, roughness: 0.3 })
      );
      cab.position.set(0, 1.0, -1.8);
      cab.castShadow = true;
      this.mesh.add(cab);

      const container = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 2.0, 4.2),
        new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.3, roughness: 0.5 })
      );
      container.position.set(0, 1.4, 1.2);
      container.castShadow = true;
      this.mesh.add(container);

      // Logistics side panel stripe (clean navy)
      const cStripe = new THREE.Mesh(
        new THREE.BoxGeometry(2.52, 0.35, 3.8),
        new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.4, roughness: 0.5 })
      );
      cStripe.position.set(0, 1.5, 1.2);
      this.mesh.add(cStripe);

      // Wheels
      [-1.25, 1.25].forEach((wx) => {
        [-1.8, 0.5, 2.2].forEach((wz) => {
          const w = new THREE.Mesh(wheelGeo, wheelMat);
          w.position.set(wx, 0.38, wz);
          this.mesh.add(w);
        });
      });

      // Headlights
      [-0.8, 0.8].forEach((hx) => {
        const hl = new THREE.Mesh(headlampGeo, headlampMat);
        hl.position.set(hx, 0.7, -2.91);
        this.mesh.add(hl);
        this.headlights.push(hl);
      });

      // Taillights
      [-0.9, 0.9].forEach((tx) => {
        const tl = new THREE.Mesh(tailampGeo, this.brakeLightMaterial);
        tl.position.set(tx, 0.8, 3.32);
        this.mesh.add(tl);
        this.taillights.push(tl);
      });
    } else if (isSupercar || isDubaiPolice) {
      this.maxSpeed = isDubaiPolice ? 28 : 25; // High-speed pursuit / hypercar
      this.acceleration = 16;

      // Body styling: low-slung wide hypercar
      const scBodyGeo = new THREE.BoxGeometry(2.35, 0.65, 4.8);
      const scCabinGeo = new THREE.BoxGeometry(1.65, 0.45, 2.3);

      let paintColor = 0xdc2626; // Rosso Corsa Red
      if (isDubaiPolice) {
        paintColor = 0xffffff; // Dubai Police Pure White
      } else {
        const hash = this.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        paintColor = hash % 2 === 0 ? 0xdc2626 : 0xd97706; // Rosso Corsa or Metallic Gold
      }

      const carMat = new THREE.MeshPhysicalMaterial({
        color: paintColor,
        roughness: 0.14,
        metalness: 0.85,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        envMapIntensity: 2.2,
      });

      const bodyMesh = new THREE.Mesh(scBodyGeo, carMat);
      bodyMesh.position.y = 0.48;
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      this.mesh.add(bodyMesh);

      // Cabin
      const cabinMesh = new THREE.Mesh(scCabinGeo, glassMat);
      cabinMesh.position.set(0, 0.95, -0.1);
      this.mesh.add(cabinMesh);

      // Dubai Police Emerald Green Chevrons & Livery
      if (isDubaiPolice) {
        const liveryMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.2, metalness: 0.4 });
        [-1.19, 1.19].forEach((lx) => {
          const badge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 2.8), liveryMat);
          badge.position.set(lx, 0.52, 0);
          this.mesh.add(badge);
        });

        // Police Low-Profile Strobe Lightbar on Roof
        const lightbarGeo = new THREE.BoxGeometry(0.35, 0.12, 0.18);
        const redStrobe = new THREE.Mesh(lightbarGeo, new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
        redStrobe.position.set(-0.35, 1.25, -0.1);
        this.mesh.add(redStrobe);
        this.policeLightBarL = redStrobe;

        const blueStrobe = new THREE.Mesh(lightbarGeo, new THREE.MeshBasicMaterial({ color: 0x2563eb }));
        blueStrobe.position.set(0.35, 1.25, -0.1);
        this.mesh.add(blueStrobe);
        this.policeLightBarR = blueStrobe;
      }

      // Aerodynamic Rear Wing / Spoiler
      const wingMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });
      const wingBlade = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.08, 0.55), wingMat);
      wingBlade.position.set(0, 1.1, 2.2);
      this.mesh.add(wingBlade);

      [-0.85, 0.85].forEach((sx) => {
        const strut = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.25), wingMat);
        strut.position.set(sx, 0.88, 2.2);
        this.mesh.add(strut);
      });

      // Front Carbon Splitter
      const splitter = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.6), wingMat);
      splitter.position.set(0, 0.2, -2.4);
      this.mesh.add(splitter);

      // Headlights (Twin Projector LEDs)
      [-0.8, 0.8].forEach((hx) => {
        const hl = new THREE.Mesh(headlampGeo, headlampMat);
        hl.position.set(hx, 0.52, -2.41);
        this.mesh.add(hl);
        this.headlights.push(hl);
      });

      // Forward Beam
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

      // Taillights
      [-0.8, 0.8].forEach((tx) => {
        const tl = new THREE.Mesh(tailampGeo, this.brakeLightMaterial);
        tl.position.set(tx, 0.55, 2.41);
        this.mesh.add(tl);
        this.taillights.push(tl);
      });

      // Low-Profile Sport Wheels
      const scWheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.42, 12);
      scWheelGeo.rotateZ(Math.PI / 2);
      const scWheelMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.3, metalness: 0.9 });
      [
        [-1.12, -1.45],
        [1.12, -1.45],
        [-1.12, 1.45],
        [1.12, 1.45],
      ].forEach(([wx, wz]) => {
        const wheel = new THREE.Mesh(scWheelGeo, scWheelMat);
        wheel.position.set(wx, 0.38, wz);
        this.mesh.add(wheel);
      });
    } else {
      this.maxSpeed = isTaxi ? 16 : isSedan ? 15 : 18;
      this.acceleration = isSedan ? 7 : 9;

      // Realistic car paint selection
      const hash = this.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const paintColor = isTaxi ? 0xeab308 : REALISTIC_CAR_PAINTS[hash % REALISTIC_CAR_PAINTS.length];

      const carMat = new THREE.MeshPhysicalMaterial({
        color: paintColor,
        roughness: 0.18,
        metalness: 0.8,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        envMapIntensity: 2.0,
      });

      const bodyMesh = new THREE.Mesh(isSedan ? sedanBodyGeo : coupeBodyGeo, carMat);
      bodyMesh.position.y = 0.6;
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      this.mesh.add(bodyMesh);

      const cabinMesh = new THREE.Mesh(isSedan ? sedanCabinGeo : coupeCabinGeo, glassMat);
      cabinMesh.position.set(0, 1.25, 0.1);
      this.mesh.add(cabinMesh);

      // Front Chrome Grille & Rear Diffuser
      const grilleMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.32, 0.06),
        alloyRimMat
      );
      grilleMesh.position.set(0, 0.52, -(isSedan ? 2.41 : 2.21));
      this.mesh.add(grilleMesh);

      // Taxi roof light
      if (isTaxi) {
        const taxiLight = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.25, 0.35),
          new THREE.MeshBasicMaterial({ color: 0xfef08a })
        );
        taxiLight.position.set(0, 1.7, 0.1);
        this.mesh.add(taxiLight);
      }

      // Realistic chassis rocker panel
      const rocker = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.10, isSedan ? 4.78 : 4.38), chassisMat);
      rocker.position.y = 0.22;
      this.mesh.add(rocker);

      // Headlights (Twin White/Cyan LEDs) with forward road projection beam
      [-0.7, 0.7].forEach((hx) => {
        const hl = new THREE.Mesh(headlampGeo, headlampMat);
        hl.position.set(hx, 0.65, -(isSedan ? 2.41 : 2.21));
        this.mesh.add(hl);
        this.headlights.push(hl);
      });

      // Forward road illumination beam cone on asphalt
      const beamGeo = new THREE.ConeGeometry(1.6, 7.5, 6);
      beamGeo.rotateX(Math.PI / 2);
      beamGeo.translate(0, 0, -(isSedan ? 5.8 : 5.4));
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

      // Taillights (Twin Red LED strips)
      [-0.7, 0.7].forEach((tx) => {
        const tl = new THREE.Mesh(tailampGeo, this.brakeLightMaterial);
        tl.position.set(tx, 0.65, (isSedan ? 2.41 : 2.21));
        this.mesh.add(tl);
        this.taillights.push(tl);
      });

      // Turn Indicators
      const indGeo = new THREE.BoxGeometry(0.2, 0.12, 0.08);
      const indMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const indL = new THREE.Mesh(indGeo, indMat);
      indL.position.set(-1.0, 0.65, -(isSedan ? 2.38 : 2.18));
      const indR = new THREE.Mesh(indGeo, indMat);
      indR.position.set(1.0, 0.65, -(isSedan ? 2.38 : 2.18));
      this.mesh.add(indL, indR);
      this.indicatorLightL = indL;
      this.indicatorLightR = indR;

      // Wheels with Metallic Alloy Rims
      const halfW = 1.05;
      const halfL = isSedan ? 1.6 : 1.4;
      [
        [-halfW, -halfL],
        [halfW, -halfL],
        [-halfW, halfL],
        [halfW, halfL],
      ].forEach(([wx, wz]) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(wx, 0.35, wz);
        this.mesh.add(wheel);

        const rim = new THREE.Mesh(alloyRimGeo, alloyRimMat);
        rim.position.set(wx, 0.35, wz);
        this.mesh.add(rim);
      });
    }
  }

  public override update(delta: number, trafficLights: Map<string, any>, allVehicles: Vehicle[], pedestrians?: any[]) {
    const prevSpeed = this.speed;
    super.update(delta, trafficLights, allVehicles, pedestrians);

    // Dynamic brake lights: Glow intense bright red when slowing down or stopped
    const isBraking = this.speed < prevSpeed - 0.1 || this.speed < 0.5;
    if (isBraking) {
      this.brakeLightMaterial.color.setHex(0xff0033);
    } else {
      this.brakeLightMaterial.color.setHex(0x550011);
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
