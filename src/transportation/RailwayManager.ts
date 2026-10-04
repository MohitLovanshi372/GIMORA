/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { Train } from './Train';

export class RailwayManager {
  public group: THREE.Group;
  public trains: Train[] = [];

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    this.group.name = 'railway_transportation_system';

    // Track Z positions from Phase 2:
    // Track 1: -206 (Passenger Express Eastbound)
    // Track 2: -214 (Passenger Express Westbound)
    // Track 3: -226 (Freight Maglev Eastbound)
    // Track 4: -234 (Freight Maglev Westbound)

    // 1. High-Speed Passenger Bullet Train Alpha
    const passTrain1 = new Train('pass-01', 'passenger', 1, -206, -110);
    this.trains.push(passTrain1);
    this.group.add(passTrain1.mesh);

    // 2. High-Speed Passenger Bullet Train Beta
    const passTrain2 = new Train('pass-02', 'passenger', 2, -214, 110);
    passTrain2.direction = -1;
    passTrain2.mesh.rotation.y = Math.PI;
    this.trains.push(passTrain2);
    this.group.add(passTrain2.mesh);

    // 3. Heavy Freight Maglev Train
    const freightTrain = new Train('freight-01', 'freight', 3, -226, -160);
    freightTrain.currentStation = 'Industrial Geothermal Depot';
    freightTrain.destinationStation = 'Central Logistics Nexus';
    this.trains.push(freightTrain);
    this.group.add(freightTrain.mesh);

    // 4. Ultra-Fast Intercity Express Maglev Train
    const expressTrain = new Train('express-01', 'express', 4, -234, 40);
    expressTrain.currentStation = 'Central Hyper-Transit Terminal';
    expressTrain.destinationStation = 'Sub-Orbital Spaceport Concourse';
    this.trains.push(expressTrain);
    this.group.add(expressTrain.mesh);

    scene.add(this.group);
  }

  public update(delta: number) {
    this.trains.forEach((train) => train.update(delta));
  }

  public getActiveTrainCount(): number {
    return this.trains.length;
  }

  public getLeadPassengerTrain(): Train | null {
    return this.trains.find((t) => t.type === 'passenger') || null;
  }

  // Future AI Agent Hooks
  public setTrainSpeedLimit(maxSpeed: number) {
    this.trains.forEach((t) => (t.maxSpeed = maxSpeed));
  }

  public emergencyBrakeAll() {
    this.trains.forEach((t) => {
      t.speed = 0;
      t.state = 'stopped_at_station';
    });
  }

  public dispose() {
    this.trains.forEach((t) => t.dispose());
    this.group.clear();
  }
}
