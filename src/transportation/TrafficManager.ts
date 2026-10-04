/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoadNetwork } from './RoadNetwork';
import { TrafficLight } from './TrafficLight';
import { Pathfinding } from './Pathfinding';
import { VehicleSpawner } from './VehicleSpawner';
import { Vehicle } from './Vehicle';
import { RailwayManager } from './RailwayManager';
import { PedestrianManager } from './PedestrianManager';
import { ParkingManager } from './ParkingManager';
import { TrafficDensityLevel, TransportationMetrics } from '../city/types';

export class TrafficManager {
  public scene: THREE.Scene;
  public roadNetwork: RoadNetwork;
  public pathfinding: Pathfinding;
  public trafficLights: Map<string, TrafficLight> = new Map();
  public vehicleSpawner: VehicleSpawner;
  public railwayManager: RailwayManager;
  public pedestrianManager: PedestrianManager;
  public parkingManager: ParkingManager;

  public densityLevel: TrafficDensityLevel = 'HIGH';
  public weatherSpeedMultiplier = 1.0;
  public trackedVehicle: Vehicle | null = null;
  private parkingCheckTimer = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.roadNetwork = new RoadNetwork();
    this.pathfinding = new Pathfinding(this.roadNetwork);
    this.parkingManager = new ParkingManager();
    this.initTrafficLights();

    this.vehicleSpawner = new VehicleSpawner(this.scene, this.roadNetwork, this.pathfinding);
    this.railwayManager = new RailwayManager(this.scene);
    this.pedestrianManager = new PedestrianManager(this.scene);

    // Initial population
    this.vehicleSpawner.maintainPopulation(this.vehicleSpawner.getTargetCountForDensity(this.densityLevel));
  }

  private initTrafficLights() {
    this.roadNetwork.intersections.forEach((intersection) => {
      // Stagger phase offsets across city grid for smooth progressive waves
      const phaseOffset = ((Math.abs(intersection.position.x) + Math.abs(intersection.position.z)) * 0.05) % 19;
      const tl = new TrafficLight(intersection.trafficLightId, intersection.position, phaseOffset);
      this.trafficLights.set(intersection.trafficLightId, tl);
    });
  }

  public setDensityLevel(level: TrafficDensityLevel) {
    this.densityLevel = level;
    const target = this.vehicleSpawner.getTargetCountForDensity(level);
    this.vehicleSpawner.maintainPopulation(target);
  }

  public update(delta: number) {
    // 1. Update Traffic Lights
    this.trafficLights.forEach((tl) => tl.update(delta));

    // 2. Update Vehicles
    const effDelta = delta * this.weatherSpeedMultiplier;
    const vehicles = this.vehicleSpawner.activeVehicles;
    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      v.update(effDelta, this.trafficLights, vehicles);

      // Check if vehicle completed route and recycle
      if (v.state === 'waiting' && v.targetWaypointIndex >= v.waypoints.length) {
        this.vehicleSpawner.recycleVehicle(v);
      }
    }

    // 3. Maintain Target Population
    const target = this.vehicleSpawner.getTargetCountForDensity(this.densityLevel);
    this.vehicleSpawner.maintainPopulation(target);

    // 4. Random Parking Simulation
    this.parkingCheckTimer += delta;
    if (this.parkingCheckTimer > 3.0) {
      this.parkingCheckTimer = 0;
      if (Math.random() < 0.35 && vehicles.length > 0) {
        // Pick random non-emergency car to park
        const candidate = vehicles.find((v) => v.type === 'car' && v.state === 'driving');
        if (candidate) {
          this.parkingManager.parkVehicle(candidate, 8 + Math.random() * 12);
        }
      }
    }

    // 5. Update Railways & Trains
    this.railwayManager.update(delta);

    // 6. Update Pedestrians
    this.pedestrianManager.update(delta);
  }

  public getMetrics(): TransportationMetrics {
    const vehicles = this.vehicleSpawner.activeVehicles;
    let totalSpeed = 0;
    let stoppedCount = 0;

    vehicles.forEach((v) => {
      totalSpeed += v.speed * 3.6; // convert m/s to km/h
      if (v.speed < 1.0) stoppedCount++;
    });

    const avgSpeed = vehicles.length > 0 ? Math.round(totalSpeed / vehicles.length) : 52;
    const congestion = vehicles.length > 0 ? Math.round((stoppedCount / vehicles.length) * 100) : 12;

    return {
      densityLevel: this.densityLevel,
      activeVehicles: vehicles.length,
      activeTrains: this.railwayManager.getActiveTrainCount(),
      averageSpeed: Math.max(18, avgSpeed),
      congestionPercentage: Math.min(95, Math.max(8, congestion)),
      activePedestrians: this.pedestrianManager.getActivePedestrianCount(),
    };
  }

  public getTrackedVehicle(): Vehicle | null {
    if (this.trackedVehicle && this.trackedVehicle.active) {
      return this.trackedVehicle;
    }
    // Default to first active vehicle
    return this.vehicleSpawner.activeVehicles[0] || null;
  }

  public selectNextTrackedVehicle(): Vehicle | null {
    const active = this.vehicleSpawner.activeVehicles;
    if (active.length === 0) return null;
    const curIdx = this.trackedVehicle ? active.indexOf(this.trackedVehicle) : -1;
    const nextIdx = (curIdx + 1) % active.length;
    this.trackedVehicle = active[nextIdx];
    return this.trackedVehicle;
  }

  // --- FUTURE AI AGENT SUPPORT HOOKS ---
  public dispatchEmergency(type: 'ambulance' | 'police' | 'fire-truck') {
    return this.vehicleSpawner.spawnEmergencyVehicle(type);
  }

  public optimizeSignals() {
    this.trafficLights.forEach((tl) => {
      tl.greenDuration = 12.0; // Extend green window during peak hours
    });
  }

  public dispose() {
    this.trafficLights.forEach((tl) => tl.dispose());
    this.vehicleSpawner.dispose();
    this.railwayManager.dispose();
    this.pedestrianManager.dispose();
  }
}
