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
import { CityPhysicsEngine } from '../city/modules/CityPhysicsEngine';

export class TrafficManager {
  public scene: THREE.Scene;
  public roadNetwork: RoadNetwork;
  public pathfinding: Pathfinding;
  public trafficLights: Map<string, TrafficLight> = new Map();
  public signalGroup: THREE.Group;
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
    this.signalGroup = new THREE.Group();
    this.signalGroup.name = 'traffic_signals_and_stop_bars';
    this.scene.add(this.signalGroup);

    this.roadNetwork = new RoadNetwork();
    this.pathfinding = new Pathfinding(this.roadNetwork);
    this.parkingManager = new ParkingManager();
    this.initTrafficLightsAnd3DSignals();

    this.vehicleSpawner = new VehicleSpawner(this.scene, this.roadNetwork, this.pathfinding);
    this.railwayManager = new RailwayManager(this.scene);
    this.pedestrianManager = new PedestrianManager(this.scene);

    // Initial population
    this.vehicleSpawner.maintainPopulation(this.vehicleSpawner.getTargetCountForDensity(this.densityLevel));
  }

  private initTrafficLightsAnd3DSignals() {
    const postGeo = new THREE.CylinderGeometry(0.18, 0.22, 6.8, 8);
    const armGeo = new THREE.BoxGeometry(6.8, 0.22, 0.22);
    const housingGeo = new THREE.BoxGeometry(0.55, 1.45, 0.42);
    const lampGeo = new THREE.SphereGeometry(0.14, 8, 8);
    const stopBarGeo = new THREE.PlaneGeometry(5.6, 0.55);
    stopBarGeo.rotateX(-Math.PI / 2);

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.35 });
    const housingMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6, roughness: 0.45 });
    const stopBarMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });

    const createSignalHead = (zSign: number) => {
      const head = new THREE.Group();
      const box = new THREE.Mesh(housingGeo, housingMat);
      head.add(box);

      const redLamp = new THREE.Mesh(lampGeo);
      redLamp.position.set(0, 0.42, zSign * 0.22);
      const yellowLamp = new THREE.Mesh(lampGeo);
      yellowLamp.position.set(0, 0, zSign * 0.22);
      const greenLamp = new THREE.Mesh(lampGeo);
      greenLamp.position.set(0, -0.42, zSign * 0.22);

      head.add(redLamp, yellowLamp, greenLamp);
      return { head, ref: { redLamp, yellowLamp, greenLamp } };
    };

    this.roadNetwork.intersections.forEach((intersection) => {
      // Stagger phase offsets across city grid for smooth progressive green waves
      const phaseOffset =
        ((Math.abs(intersection.position.x) + Math.abs(intersection.position.z)) * 0.06) % 22;
      const tl = new TrafficLight(intersection.trafficLightId, intersection.position, phaseOffset);
      this.trafficLights.set(intersection.trafficLightId, tl);

      const ix = intersection.position.x;
      const iz = intersection.position.z;
      const interGroup = new THREE.Group();
      interGroup.position.set(ix, 0, iz);

      // 1. North-South Gantry Mast (NE & SW corners facing NS traffic)
      const nsMast = new THREE.Group();
      const postNE = new THREE.Mesh(postGeo, poleMat);
      postNE.position.set(8.2, 3.4, -8.2);
      const armNE = new THREE.Mesh(armGeo, poleMat);
      armNE.position.set(4.8, 6.4, -8.2);
      nsMast.add(postNE, armNE);

      const nsHeadNorth = createSignalHead(1);
      nsHeadNorth.head.position.set(3.5, 5.8, -8.2);
      nsMast.add(nsHeadNorth.head);
      tl.registerMeshRef('NS', nsHeadNorth.ref);

      const nsHeadSouth = createSignalHead(-1);
      nsHeadSouth.head.position.set(6.2, 5.8, -8.2);
      nsMast.add(nsHeadSouth.head);
      tl.registerMeshRef('NS', nsHeadSouth.ref);

      interGroup.add(nsMast);

      // 2. East-West Gantry Mast (NW corner rotated 90 deg facing EW traffic)
      const ewMast = new THREE.Group();
      ewMast.rotation.y = Math.PI / 2;
      const postNW = new THREE.Mesh(postGeo, poleMat);
      postNW.position.set(8.2, 3.4, -8.2);
      const armNW = new THREE.Mesh(armGeo, poleMat);
      armNW.position.set(4.8, 6.4, -8.2);
      ewMast.add(postNW, armNW);

      const ewHeadEast = createSignalHead(1);
      ewHeadEast.head.position.set(3.5, 5.8, -8.2);
      ewMast.add(ewHeadEast.head);
      tl.registerMeshRef('EW', ewHeadEast.ref);

      const ewHeadWest = createSignalHead(-1);
      ewHeadWest.head.position.set(6.2, 5.8, -8.2);
      ewMast.add(ewHeadWest.head);
      tl.registerMeshRef('EW', ewHeadWest.ref);

      interGroup.add(ewMast);

      // 3. Painted White Stop Bars on All 4 Approaches
      const stopSB = new THREE.Mesh(stopBarGeo, stopBarMat);
      stopSB.position.set(-3.5, 0.04, -8.2);
      const stopNB = new THREE.Mesh(stopBarGeo, stopBarMat);
      stopNB.position.set(3.5, 0.04, 8.2);

      const stopEB = new THREE.Mesh(stopBarGeo, stopBarMat);
      stopEB.rotation.y = Math.PI / 2;
      stopEB.position.set(-8.2, 0.04, -3.5);
      const stopWB = new THREE.Mesh(stopBarGeo, stopBarMat);
      stopWB.rotation.y = Math.PI / 2;
      stopWB.position.set(8.2, 0.04, 3.5);

      interGroup.add(stopSB, stopNB, stopEB, stopWB);
      this.signalGroup.add(interGroup);
    });
  }

  public setPhysicsEngine(physicsEngine: CityPhysicsEngine) {
    this.pedestrianManager.setPhysicsEngine(physicsEngine);
  }

  public setDensityLevel(level: TrafficDensityLevel) {
    this.densityLevel = level;
    const target = this.vehicleSpawner.getTargetCountForDensity(level);
    this.vehicleSpawner.maintainPopulation(target);
  }

  public update(delta: number, playerPos?: THREE.Vector3) {
    // 1. Update Traffic Lights
    this.trafficLights.forEach((tl) => tl.update(delta));

    // 2. Update Railways & Trains first so vehicles can obey active train crossings
    this.railwayManager.update(delta);

    // 3. Update Vehicles (strictly obeying traffic lights, crosswalk pedestrians, and railway trains)
    const effDelta = delta * this.weatherSpeedMultiplier;
    const vehicles = this.vehicleSpawner.activeVehicles;
    const pedestrians = this.pedestrianManager.pedestrians;
    const trains = this.railwayManager.trains;

    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      v.update(effDelta, this.trafficLights, vehicles, pedestrians, trains);

      // Check if vehicle completed route and seamlessly chain next route
      if (v.state === 'waiting' && v.targetWaypointIndex >= v.waypoints.length) {
        this.vehicleSpawner.recycleVehicle(v);
      }
    }

    // 4. Maintain Target Population
    const target = this.vehicleSpawner.getTargetCountForDensity(this.densityLevel);
    this.vehicleSpawner.maintainPopulation(target);

    // 5. Random Parking Simulation
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

    // 6. Update Pedestrians (with Traffic Lights, Vehicles, and Player avoidance)
    this.pedestrianManager.update(delta, this.trafficLights, vehicles, playerPos);
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

  // --- AI AGENT SUPPORT HOOKS ---
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
    this.scene.remove(this.signalGroup);
    this.vehicleSpawner.dispose();
    this.railwayManager.dispose();
    this.pedestrianManager.dispose();
  }
}
