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

  private assignRouteToVehicle(vehicle: Vehicle, startLane: RoadLane, keepCurrentPosition = false) {
    const destLane = this.network.getRandomLane();
    const lanes = this.pathfinding.findRoute(startLane.id, destLane.id);
    const routeData = this.pathfinding.generateRouteWithLanes(lanes);
    const savedPos = keepCurrentPosition ? vehicle.mesh.position.clone() : null;

    vehicle.setRoute(
      routeData.waypoints,
      startLane,
      routeData.waypointLanes,
      routeData.isTurnWaypoint
    );

    if (savedPos && routeData.waypoints.length > 0) {
      vehicle.mesh.position.copy(savedPos);
    }
  }

  public spawnBus(routeId: string, routeName: string): Bus {
    const bus = new Bus(`bus_${this.nextVehicleId++}`, routeId, routeName, this.network.busStops);
    const startLane = this.network.getRandomLane();
    this.assignRouteToVehicle(bus, startLane);
    this.activeVehicles.push(bus);
    this.group.add(bus.mesh);
    return bus;
  }

  public spawnEmergencyVehicle(emergencyType: EmergencyType): EmergencyVehicle {
    const ev = new EmergencyVehicle(`ev_${this.nextVehicleId++}`, emergencyType);
    const startLane = this.network.getRandomLane();
    this.assignRouteToVehicle(ev, startLane);
    this.activeVehicles.push(ev);
    this.group.add(ev.mesh);
    return ev;
  }

  public spawnCar(
    subModel?: 'coupe' | 'sedan' | 'motorcycle' | 'taxi' | 'delivery-truck' | 'supercar' | 'dubai-police',
    preferredLane?: RoadLane
  ): Car {
    let car: Car;
    if (this.pooledVehicles.length > 0) {
      car = this.pooledVehicles.pop() as Car;
      car.active = true;
    } else {
      const rand = Math.random();
      const model =
        subModel ||
        (rand < 0.12
          ? 'dubai-police'
          : rand < 0.28
          ? 'supercar'
          : rand < 0.42
          ? 'taxi'
          : rand < 0.55
          ? 'motorcycle'
          : rand < 0.7
          ? 'delivery-truck'
          : rand < 0.85
          ? 'sedan'
          : 'coupe');
      car = new Car(`car_${this.nextVehicleId++}`, model);
      this.group.add(car.mesh);
    }

    const startLane = preferredLane || this.network.getRandomLane();
    this.assignRouteToVehicle(car, startLane);
    this.activeVehicles.push(car);
    return car;
  }

  public recycleVehicle(vehicle: Vehicle) {
    // Seamlessly chain the next route from the vehicle's current lane downstream connection so it never teleports
    let nextStartLane: RoadLane | undefined;
    if (vehicle.currentLane && vehicle.currentLane.connectedLanes.length > 0) {
      const nextId =
        vehicle.currentLane.connectedLanes[
          Math.floor(Math.random() * vehicle.currentLane.connectedLanes.length)
        ];
      nextStartLane = this.network.lanes.get(nextId);
    }

    if (nextStartLane) {
      this.assignRouteToVehicle(vehicle, nextStartLane, true);
    } else {
      const randomLane = this.network.getRandomLane();
      this.assignRouteToVehicle(vehicle, randomLane, false);
    }
  }

  public maintainPopulation(targetCount: number) {
    // Spawn if below target
    while (this.activeVehicles.length < targetCount) {
      const rand = Math.random();
      if (rand < 0.08) {
        this.spawnEmergencyVehicle(
          Math.random() < 0.4 ? 'ambulance' : Math.random() < 0.7 ? 'police' : 'fire-truck'
        );
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
