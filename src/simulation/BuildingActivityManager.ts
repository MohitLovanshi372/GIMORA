/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CityMaterials } from '../assets/materials';

interface ElevatorCab {
  mesh: THREE.Mesh;
  minY: number;
  maxY: number;
  currentY: number;
  speed: number;
  direction: number;
}

export class BuildingActivityManager {
  private group: THREE.Group;
  private scene: THREE.Scene;
  private materials: CityMaterials;
  private elevators: ElevatorCab[] = [];
  private rooftopBeacons: THREE.Mesh[] = [];

  constructor(scene: THREE.Scene, materials: CityMaterials) {
    this.scene = scene;
    this.materials = materials;
    this.group = new THREE.Group();
    this.group.name = 'building_activity_system';
    this.initElevators();
    this.initRooftopBeacons();
    this.scene.add(this.group);
  }

  private initElevators() {
    // Glass exterior elevator shafts on 4 prominent towers:
    // 1. MOHIT DEVELOPER HUB (X: 140, Z: -67)
    // 2. Downtown Core Alpha Tower (X: -110, Z: -20)
    // 3. Downtown Corporate Spire (X: -80, Z: 20)
    // 4. Healthcare Mega-Tower (X: -160, Z: 170)

    const shaftConfigs = [
      { x: 140, z: -66.5, minY: 4, maxY: 128, color: 0x00f0ff },
      { x: 140, z: -93.5, minY: 4, maxY: 128, color: 0x00ffcc },
      { x: -110, z: -5, minY: 4, maxY: 140, color: 0xff00aa },
      { x: -160, z: 185, minY: 4, maxY: 72, color: 0x38bdf8 },
    ];

    const cabGeo = new THREE.BoxGeometry(2.4, 3.2, 2.4);

    shaftConfigs.forEach((cfg) => {
      const cabMat = new THREE.MeshBasicMaterial({ color: cfg.color });
      const cab = new THREE.Mesh(cabGeo, cabMat);
      cab.position.set(cfg.x, cfg.minY + Math.random() * (cfg.maxY - cfg.minY), cfg.z);
      this.group.add(cab);

      this.elevators.push({
        mesh: cab,
        minY: cfg.minY,
        maxY: cfg.maxY,
        currentY: cab.position.y,
        speed: 16 + Math.random() * 8, // m/s
        direction: Math.random() < 0.5 ? 1 : -1,
      });
    });
  }

  private initRooftopBeacons() {
    // Red / Amber anti-collision aviation beacons on top of tallest spires
    const beaconCoords = [
      { x: 140, y: 172, z: -80, color: 0x00f0ff }, // Mohit Hub Mast
      { x: -110, y: 156, z: 0, color: 0xff0055 },   // Downtown Central Spire
      { x: -160, y: 88, z: 170, color: 0x38bdf8 },  // Hospital Mast
      { x: 180, y: 47, z: -315, color: 0xff0033 },  // Airport ATC Spire
      { x: 0, y: 72, z: -220, color: 0x3b82f6 },    // Railway Control Spire
    ];

    const beaconGeo = new THREE.SphereGeometry(0.7, 8, 8);
    beaconCoords.forEach((bc) => {
      const beaconMat = new THREE.MeshBasicMaterial({ color: bc.color });
      const bMesh = new THREE.Mesh(beaconGeo, beaconMat);
      bMesh.position.set(bc.x, bc.y, bc.z);
      this.rooftopBeacons.push(bMesh);
      this.group.add(bMesh);
    });
  }

  public update(delta: number, elapsedTime: number) {
    // 1. Animate Exterior Elevators
    this.elevators.forEach((el) => {
      el.currentY += el.direction * el.speed * delta;
      if (el.currentY >= el.maxY) {
        el.currentY = el.maxY;
        el.direction = -1;
      } else if (el.currentY <= el.minY) {
        el.currentY = el.minY;
        el.direction = 1;
      }
      el.mesh.position.y = el.currentY;
    });

    // 2. Pulse Rooftop Hazard Beacons
    const beaconAlpha = (Math.sin(elapsedTime * 4.5) + 1) * 0.5;
    this.rooftopBeacons.forEach((b) => {
      b.scale.setScalar(0.85 + beaconAlpha * 0.45);
    });
  }

  public dispose() {
    this.scene.remove(this.group);
  }
}
