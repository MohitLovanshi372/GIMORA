/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { Pedestrian } from './Pedestrian';

export class PedestrianManager {
  public group: THREE.Group;
  public pedestrians: Pedestrian[] = [];

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    this.group.name = 'pedestrian_system';
    this.spawnPedestrians();
    scene.add(this.group);
  }

  private spawnPedestrians() {
    // Define walkable pedestrian sidewalk loops across key city biomes
    const loops: THREE.Vector3[][] = [
      // 1. Downtown Sidewalk & Crosswalk Loop
      [
        new THREE.Vector3(-92, 0.25, -60),
        new THREE.Vector3(-92, 0.25, 0),
        new THREE.Vector3(-100, 0.25, 0), // Crosswalk
        new THREE.Vector3(-108, 0.25, 0),
        new THREE.Vector3(-108, 0.25, -60),
        new THREE.Vector3(-100, 0.25, -60),
      ],
      // 2. Mohit Developer Hub Entrance & Tech Avenue Plaza
      [
        new THREE.Vector3(108, 0.25, -60),
        new THREE.Vector3(120, 0.25, -75),
        new THREE.Vector3(135, 0.35, -80), // Mohit Hub Pathway
        new THREE.Vector3(120, 0.25, -85),
        new THREE.Vector3(108, 0.25, -90),
        new THREE.Vector3(92, 0.25, -90),
        new THREE.Vector3(92, 0.25, -60),
      ],
      // 3. Central Riverside Promenade (West Bank)
      [
        new THREE.Vector3(-38, 0.25, -90),
        new THREE.Vector3(-38, 0.25, -20),
        new THREE.Vector3(-38, 0.25, 40),
        new THREE.Vector3(-34, 0.25, 40),
        new THREE.Vector3(-34, 0.25, -20),
        new THREE.Vector3(-34, 0.25, -90),
      ],
      // 4. Central Riverside Promenade (East Bank)
      [
        new THREE.Vector3(34, 0.25, -80),
        new THREE.Vector3(34, 0.25, 20),
        new THREE.Vector3(38, 0.25, 20),
        new THREE.Vector3(38, 0.25, -80),
      ],
      // 5. University Quadrangle & Cyber Library Plaza
      [
        new THREE.Vector3(-150, 0.25, -135),
        new THREE.Vector3(-170, 0.25, -135),
        new THREE.Vector3(-170, 0.25, -165),
        new THREE.Vector3(-150, 0.25, -165),
      ],
      // 6. Railway Terminal Concourse & Pedestrian Entrance
      [
        new THREE.Vector3(-25, 0.25, -180),
        new THREE.Vector3(25, 0.25, -180),
        new THREE.Vector3(25, 0.25, -170),
        new THREE.Vector3(-25, 0.25, -170),
      ],
      // 7. Healthcare District Walkway
      [
        new THREE.Vector3(-150, 0.25, 140),
        new THREE.Vector3(-170, 0.25, 140),
        new THREE.Vector3(-170, 0.25, 180),
        new THREE.Vector3(-150, 0.25, 180),
      ],
    ];

    let pedId = 0;
    loops.forEach((loop) => {
      // Spawn 5-8 pedestrians along each loop at staggered positions
      const count = 6;
      for (let i = 0; i < count; i++) {
        const startIdx = i % loop.length;
        const startPos = loop[startIdx].clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.8,
          0,
          (Math.random() - 0.5) * 0.8
        ));
        const ped = new Pedestrian(`ped_${pedId++}`, startPos, loop);
        ped.currentWaypointIndex = (startIdx + 1) % loop.length;
        this.pedestrians.push(ped);
        this.group.add(ped.mesh);
      }
    });
  }

  public update(delta: number) {
    this.pedestrians.forEach((p) => p.update(delta));
  }

  public getActivePedestrianCount(): number {
    return this.pedestrians.length;
  }

  public dispose() {
    this.pedestrians.forEach((p) => p.dispose());
    this.group.clear();
  }
}
