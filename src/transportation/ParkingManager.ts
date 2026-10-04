/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { Vehicle } from './Vehicle';

export interface ParkingStall {
  id: string;
  type: 'street' | 'lot' | 'underground';
  position: THREE.Vector3;
  heading: number; // Y rotation
  occupied: boolean;
  vehicleId: string | null;
}

export class ParkingManager {
  public stalls: ParkingStall[] = [];

  constructor() {
    this.initStalls();
  }

  private initStalls() {
    let stallId = 0;

    // 1. Street Parking Stalls (along Downtown & Tech Avenues)
    [-108, 108].forEach((x) => {
      for (let z = -40; z <= 40; z += 12) {
        this.stalls.push({
          id: `stall_street_${stallId++}`,
          type: 'street',
          position: new THREE.Vector3(x, 0.25, z),
          heading: 0,
          occupied: false,
          vehicleId: null,
        });
      }
    });

    // 2. Surface Parking Lots (West Lot: -140, -90; East Lot: 140, 90)
    for (let x = -150; x <= -130; x += 6) {
      for (let z = -98; z <= -82; z += 14) {
        this.stalls.push({
          id: `stall_lot_${stallId++}`,
          type: 'lot',
          position: new THREE.Vector3(x, 0.25, z),
          heading: Math.PI / 2,
          occupied: false,
          vehicleId: null,
        });
      }
    }

    for (let x = 130; x <= 150; x += 6) {
      for (let z = 82; z <= 98; z += 14) {
        this.stalls.push({
          id: `stall_lot_${stallId++}`,
          type: 'lot',
          position: new THREE.Vector3(x, 0.25, z),
          heading: Math.PI / 2,
          occupied: false,
          vehicleId: null,
        });
      }
    }

    // 3. Underground Parking at Mohit Developer Hub
    [-3, 0, 3].forEach((offset) => {
      this.stalls.push({
        id: `stall_underground_mohit_${stallId++}`,
        type: 'underground',
        position: new THREE.Vector3(140 + offset, 0.1, -66),
        heading: Math.PI,
        occupied: false,
        vehicleId: null,
      });
    });
  }

  public getAvailableStall(): ParkingStall | null {
    const available = this.stalls.filter((s) => !s.occupied);
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }

  public parkVehicle(vehicle: Vehicle, duration = 12): boolean {
    const stall = this.getAvailableStall();
    if (!stall) return false;

    stall.occupied = true;
    stall.vehicleId = vehicle.id;

    vehicle.state = 'parked';
    vehicle.speed = 0;
    vehicle.parkedTimer = duration;
    vehicle.mesh.position.copy(stall.position);
    vehicle.mesh.rotation.y = stall.heading;
    return true;
  }

  public releaseStall(vehicleId: string) {
    const stall = this.stalls.find((s) => s.vehicleId === vehicleId);
    if (stall) {
      stall.occupied = false;
      stall.vehicleId = null;
    }
  }
}
