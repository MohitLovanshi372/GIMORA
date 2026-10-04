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

// Shared Materials
const darkBodyMat = new THREE.MeshStandardMaterial({ color: 0x090f1d, roughness: 0.3, metalness: 0.85 });
const cyanTrimMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
const purpleTrimMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
const amberTrimMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x05070c, roughness: 0.8 });
const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x002233, roughness: 0.1, transmission: 0.6 });

const headlampMat = new THREE.MeshBasicMaterial({ color: 0xe0f7ff });
const tailampMat = new THREE.MeshBasicMaterial({ color: 0xff1144 });

export class Car extends Vehicle {
  public subModel: 'coupe' | 'sedan' | 'motorcycle' | 'taxi' | 'delivery-truck';
  private brakeLightMaterial: THREE.MeshBasicMaterial;
  private indicatorLightL: THREE.Mesh | null = null;
  private indicatorLightR: THREE.Mesh | null = null;
  private blinkTimer = 0;

  constructor(id: string, subModel: 'coupe' | 'sedan' | 'motorcycle' | 'taxi' | 'delivery-truck' = 'coupe') {
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

    if (isMoto) {
      this.maxSpeed = 19; // ~68 km/h
      this.acceleration = 12;

      const body = new THREE.Mesh(motoBodyGeo, darkBodyMat);
      body.position.y = 0.55;
      body.castShadow = true;
      this.mesh.add(body);

      // Neon Trim
      const trim = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.1, 2.22), cyanTrimMat);
      trim.position.y = 0.55;
      this.mesh.add(trim);

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
        new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 })
      );
      cab.position.set(0, 1.0, -1.8);
      cab.castShadow = true;
      this.mesh.add(cab);

      const container = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 2.0, 4.2),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6, roughness: 0.4 })
      );
      container.position.set(0, 1.4, 1.2);
      container.castShadow = true;
      this.mesh.add(container);

      // Container neon branding stripe
      const cStripe = new THREE.Mesh(new THREE.BoxGeometry(2.54, 0.2, 4.0), cyanTrimMat);
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
    } else {
      this.maxSpeed = isTaxi ? 16 : isSedan ? 15 : 18;
      this.acceleration = isSedan ? 7 : 9;

      const carMat = isTaxi
        ? new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.3, metalness: 0.8 })
        : darkBodyMat;

      const bodyMesh = new THREE.Mesh(isSedan ? sedanBodyGeo : coupeBodyGeo, carMat);
      bodyMesh.position.y = 0.6;
      bodyMesh.castShadow = true;
      this.mesh.add(bodyMesh);

      const cabinMesh = new THREE.Mesh(isSedan ? sedanCabinGeo : coupeCabinGeo, glassMat);
      cabinMesh.position.set(0, 1.25, 0.1);
      this.mesh.add(cabinMesh);

      // Taxi roof light
      if (isTaxi) {
        const taxiLight = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.25, 0.35),
          new THREE.MeshBasicMaterial({ color: 0xfef08a })
        );
        taxiLight.position.set(0, 1.7, 0.1);
        this.mesh.add(taxiLight);
      }

      // Accent Neon Underglow & Edge Trims
      const trimMat = isTaxi ? amberTrimMat : isSedan ? amberTrimMat : purpleTrimMat;
      const trim = new THREE.Mesh(new THREE.BoxGeometry(2.22, 0.12, isSedan ? 4.82 : 4.42), trimMat);
      trim.position.y = 0.25;
      this.mesh.add(trim);

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

      // Wheels
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
      });
    }
  }

  public override update(delta: number, trafficLights: Map<string, any>, allVehicles: Vehicle[]) {
    const prevSpeed = this.speed;
    super.update(delta, trafficLights, allVehicles);

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
  }

  public dispose() {
    this.mesh.clear();
    this.brakeLightMaterial.dispose();
  }
}
