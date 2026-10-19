/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { Vehicle } from './Vehicle';
import { TrafficLight } from './TrafficLight';

export type EmergencyType = 'ambulance' | 'police' | 'fire-truck';

export class EmergencyVehicle extends Vehicle {
  public emergencyType: EmergencyType;
  private strobeMeshes: THREE.Mesh[] = [];
  private strobeMatRed = new THREE.MeshBasicMaterial({ color: 0xff0033 });
  private strobeMatBlue = new THREE.MeshBasicMaterial({ color: 0x0088ff });
  private strobeMatCyan = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
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

  private buildMesh() {
    const isAmb = this.emergencyType === 'ambulance';
    const isPolice = this.emergencyType === 'police';
    const isFire = this.emergencyType === 'fire-truck';

    if (isFire) {
      // Municipal Fire Engine
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(2.9, 2.2, 9.2),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35, metalness: 0.2 })
      );
      body.position.y = 1.4;
      body.castShadow = true;
      this.mesh.add(body);

      // Equipment, silver roll-up doors & ladders
      const eq = new THREE.Mesh(
        new THREE.BoxGeometry(2.7, 0.8, 4.0),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 })
      );
      eq.position.set(0, 2.6, 1.2);
      this.mesh.add(eq);

      // Lightbar (Red + Amber)
      const barL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.4), this.strobeMatRed);
      barL.position.set(-0.8, 2.7, -3.2);
      this.mesh.add(barL);
      this.strobeMeshes.push(barL);

      const barR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.4), this.strobeMatAmber);
      barR.position.set(0.8, 2.7, -3.2);
      this.mesh.add(barR);
      this.strobeMeshes.push(barR);
    } else if (isAmb) {
      // Emergency Paramedic Ambulance (Clean Medical White with Red Stripe)
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1.9, 5.8),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.1 })
      );
      body.position.y = 1.15;
      body.castShadow = true;
      this.mesh.add(body);

      // Red Hazard Stripe on sides
      const stripeMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
      const sideStripe = new THREE.Mesh(new THREE.BoxGeometry(2.54, 0.45, 5.2), stripeMat);
      sideStripe.position.set(0, 1.1, 0);
      this.mesh.add(sideStripe);

      // Red Medical Cross Decals on Sides
      const crossMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
      const crossV = new THREE.Mesh(new THREE.BoxGeometry(2.56, 0.75, 0.25), crossMat);
      crossV.position.set(0, 1.55, 0.4);
      this.mesh.add(crossV);

      const crossH = new THREE.Mesh(new THREE.BoxGeometry(2.56, 0.25, 0.75), crossMat);
      crossH.position.set(0, 1.55, 0.4);
      this.mesh.add(crossH);

      // Emergency Lightbar (Red + Blue)
      const barL = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.4), this.strobeMatRed);
      barL.position.set(-0.6, 2.25, -1.2);
      this.mesh.add(barL);
      this.strobeMeshes.push(barL);

      const barR = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.4), this.strobeMatBlue);
      barR.position.set(0.6, 2.25, -1.2);
      this.mesh.add(barR);
      this.strobeMeshes.push(barR);
    } else {
      // Police Interceptor (Metropolitan Police White & Black Cruiser)
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.95, 4.6),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.5 })
      );
      body.position.y = 0.65;
      body.castShadow = true;
      this.mesh.add(body);

      // White Doors / Roof
      const doorPanel = new THREE.Mesh(
        new THREE.BoxGeometry(2.24, 0.6, 2.0),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
      );
      doorPanel.position.set(0, 0.7, 0);
      this.mesh.add(doorPanel);

      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(1.7, 0.65, 2.4),
        new THREE.MeshPhysicalMaterial({ color: 0x1e293b, roughness: 0.1, transmission: 0.6 })
      );
      cabin.position.set(0, 1.3, 0);
      this.mesh.add(cabin);

      // Police Roof Lightbar (Red + Blue)
      const barL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.35), this.strobeMatRed);
      barL.position.set(-0.5, 1.7, -0.1);
      this.mesh.add(barL);
      this.strobeMeshes.push(barL);

      const barR = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.35), this.strobeMatBlue);
      barR.position.set(0.5, 1.7, -0.1);
      this.mesh.add(barR);
      this.strobeMeshes.push(barR);
    }

    // Front Headlamps
    [-0.8, 0.8].forEach((hx) => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.1), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      hl.position.set(hx, 0.65, isFire ? -4.6 : isAmb ? -2.9 : -2.3);
      this.mesh.add(hl);
      this.headlights.push(hl);
    });

    // Rear Taillamps
    [-0.8, 0.8].forEach((tx) => {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.1), new THREE.MeshBasicMaterial({ color: 0xff0044 }));
      tl.position.set(tx, 0.65, isFire ? 4.6 : isAmb ? 2.9 : 2.3);
      this.mesh.add(tl);
      this.taillights.push(tl);
    });
  }

  public override update(
    delta: number,
    trafficLights: Map<string, TrafficLight>,
    allVehicles: Vehicle[]
  ) {
    if (!this.active) return;

    // Flash emergency strobe lightbars at 8 Hz alternating
    this.strobeTimer += delta * 12;
    const toggle = Math.sin(this.strobeTimer) > 0;

    if (this.strobeMeshes.length >= 2) {
      this.strobeMeshes[0].visible = toggle;
      this.strobeMeshes[1].visible = !toggle;
    }

    super.update(delta, trafficLights, allVehicles);
  }

  public dispose() {
    this.mesh.clear();
    this.strobeMatRed.dispose();
    this.strobeMatBlue.dispose();
    this.strobeMatCyan.dispose();
    this.strobeMatAmber.dispose();
  }
}
