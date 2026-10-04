/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoadNetwork, RoadLane } from './RoadNetwork';
import { Pathfinding } from './Pathfinding';
import { Vehicle } from './Vehicle';
import { Car } from './Car';
import { Bus } from './Bus';
import { EmergencyVehicle, EmergencyType } from './EmergencyVehicle';
import { TrafficDensityLevel } from '../city/types';

export class VehicleSpawner {
  private network: RoadNetwork;
  private pathfinding: Pathfinding;
  public group: THREE.Group;

  public activeVehicles: Vehicle[] = [];
  public pooledVehicles: Vehicle[] = [];
  private nextVehicleId = 1;

  constructor(scene: THREE.Scene, network: RoadNetwork, pathfinding: Pathfinding) {
    this.network = network;
    this.pathfinding = pathfinding;
    this.group = new THREE.Group();
    this.group.name = 'vehicles_container';
    scene.add(this.group);
  }

  public getTargetCountForDensity(level: TrafficDensityLevel): number {
    switch (level) {
      case 'LOW':
        return 24;
      case 'MEDIUM':
        return 52;
      case 'HIGH':
        return 88;
      case 'CONGESTED':
        return 130;
    }
  }

  public spawnBus(routeId: string, routeName: string): Bus {
    const bus = new Bus(`bus_${this.nextVehicleId++}`, routeId, routeName, this.network.busStops);
    const startLane = this.network.getRandomLane();
    const destLane = this.network.getRandomLane();
    const lanes = this.pathfinding.findRoute(startLane.id, destLane.id);
    const waypoints = this.pathfinding.generateWaypoints(lanes);

    bus.setRoute(waypoints, startLane);
    this.activeVehicles.push(bus);
    this.group.add(bus.mesh);
    return bus;
  }

  public spawnEmergencyVehicle(emergencyType: EmergencyType): EmergencyVehicle {
    const ev = new EmergencyVehicle(`ev_${this.nextVehicleId++}`, emergencyType);
    const startLane = this.network.getRandomLane();
    const destLane = this.network.getRandomLane();
    const lanes = this.pathfinding.findRoute(startLane.id, destLane.id);
    const waypoints = this.pathfinding.generateWaypoints(lanes);

    ev.setRoute(waypoints, startLane);
    this.activeVehicles.push(ev);
    this.group.add(ev.mesh);
    return ev;
  }

  public spawnCar(subModel?: 'coupe' | 'sedan' | 'motorcycle' | 'taxi' | 'delivery-truck', preferredLane?: RoadLane): Car {
    let car: Car;
    if (this.pooledVehicles.length > 0) {
      car = this.pooledVehicles.pop() as Car;
      car.active = true;
    } else {
      const rand = Math.random();
      const model = subModel || (
        rand < 0.15 ? 'motorcycle' :
        rand < 0.35 ? 'taxi' :
        rand < 0.50 ? 'delivery-truck' :
        rand < 0.75 ? 'sedan' : 'coupe'
      );
      car = new Car(`car_${this.nextVehicleId++}`, model);
      this.group.add(car.mesh);
    }

    const startLane = preferredLane || this.network.getRandomLane();
    const destLane = this.network.getRandomLane();
    const lanes = this.pathfinding.findRoute(startLane.id, destLane.id);
    const waypoints = this.pathfinding.generateWaypoints(lanes);

    car.setRoute(waypoints, startLane);
    this.activeVehicles.push(car);
    return car;
  }

  public recycleVehicle(vehicle: Vehicle) {
    const idx = this.activeVehicles.indexOf(vehicle);
    if (idx !== -1) {
      this.activeVehicles.splice(idx, 1);
    }

    // Pick new destination route immediately to keep traffic flowing smoothly
    const startLane = this.network.getRandomLane();
    const destLane = this.network.getRandomLane();
    const lanes = this.pathfinding.findRoute(startLane.id, destLane.id);
    const waypoints = this.pathfinding.generateWaypoints(lanes);

    vehicle.setRoute(waypoints, startLane);
    this.activeVehicles.push(vehicle);
  }

  public maintainPopulation(targetCount: number) {
    // Spawn if below target
    while (this.activeVehicles.length < targetCount) {
      const rand = Math.random();
      if (rand < 0.08) {
        this.spawnEmergencyVehicle(Math.random() < 0.4 ? 'ambulance' : Math.random() < 0.7 ? 'police' : 'fire-truck');
      } else if (rand < 0.16) {
        this.spawnBus('route-101', 'Line 101 - Metro Loop');
      } else {
        this.spawnCar();
      }
    }

    // If above target (e.g. density reduced), despawn surplus
    while (this.activeVehicles.length > targetCount) {
      const v = this.activeVehicles.pop();
      if (v) {
        v.active = false;
        v.mesh.position.set(0, -200, 0); // hide offscreen
        this.pooledVehicles.push(v);
      }
    }
  }

  public dispose() {
    this.activeVehicles.forEach((v) => v.dispose());
    this.pooledVehicles.forEach((v) => v.dispose());
    this.group.clear();
  }
}
