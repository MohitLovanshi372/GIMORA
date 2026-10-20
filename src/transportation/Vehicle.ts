/**
 * @license
 * @license SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoadLane } from './RoadNetwork';
import { TrafficLight } from './TrafficLight';
import { Pedestrian } from './Pedestrian';
import { Train } from './Train';

export type VehicleType = 'car' | 'bus' | 'motorcycle' | 'ambulance' | 'police' | 'fire-truck' | 'taxi' | 'delivery-truck';

export type VehicleState =
  | 'driving'
  | 'stopping'
  | 'waiting'
  | 'turning'
  | 'changing lane'
  | 'parked';

// Shared brake light materials for zero-allocation state switching
const sharedBrakeActiveMat = new THREE.MeshBasicMaterial({ color: 0xff1122 });
const sharedBrakeNormalMat = new THREE.MeshBasicMaterial({ color: 0x990a14 });

export abstract class Vehicle {
  public id: string;
  public type: VehicleType;
  public mesh: THREE.Group;
  public speed = 0; // m/s
  public maxSpeed = 16; // ~58 km/h default
  public acceleration = 8.5; // m/s^2
  public braking = 15.0; // m/s^2 crisp braking for stop lines
  public currentLane: RoadLane | null = null;
  public destination: THREE.Vector3 | null = null;
  public state: VehicleState = 'driving';
  public waypoints: THREE.Vector3[] = [];
  public waypointLanes: RoadLane[] = [];
  public isTurnWaypoint: boolean[] = [];
  public targetWaypointIndex = 0;
  public active = true;
  public waitTimer = 0;
  public isEmergency = false;
  public parkedTimer = 0;

  // Visual headlights and taillights
  public headlights: THREE.Mesh[] = [];
  public taillights: THREE.Mesh[] = [];

  constructor(id: string, type: VehicleType) {
    this.id = id;
    this.type = type;
    this.mesh = new THREE.Group();
    this.mesh.name = `vehicle_${id}`;
  }

  public setRoute(
    waypoints: THREE.Vector3[],
    currentLane: RoadLane | null,
    waypointLanes?: RoadLane[],
    isTurnWaypoint?: boolean[]
  ) {
    this.waypoints = waypoints;
    this.waypointLanes = waypointLanes || [];
    this.isTurnWaypoint = isTurnWaypoint || [];
    this.targetWaypointIndex = 0;
    this.currentLane = currentLane || (this.waypointLanes.length > 0 ? this.waypointLanes[0] : null);
    this.state = 'driving';
    if (waypoints.length > 0) {
      this.mesh.position.copy(waypoints[0]);
      if (waypoints.length > 1) {
        this.mesh.lookAt(waypoints[1]);
      }
    }
  }

  protected updateBrakeLights(isBrakingOrStopped: boolean) {
    if (this.taillights.length === 0) return;
    const mat = isBrakingOrStopped ? sharedBrakeActiveMat : sharedBrakeNormalMat;
    for (let i = 0; i < this.taillights.length; i++) {
      this.taillights[i].material = mat;
    }
  }

  public update(
    delta: number,
    trafficLights: Map<string, TrafficLight>,
    allVehicles: Vehicle[],
    pedestrians?: Pedestrian[],
    trains?: Train[]
  ) {
    if (!this.active) return;

    if (this.state === 'parked') {
      this.parkedTimer -= delta;
      this.updateBrakeLights(false);
      if (this.parkedTimer <= 0) {
        this.state = 'driving';
      }
      return;
    }

    if (this.waypoints.length === 0 || this.targetWaypointIndex >= this.waypoints.length) {
      this.speed = Math.max(0, this.speed - this.braking * delta);
      this.updateBrakeLights(true);
      if (this.speed === 0) {
        this.state = 'waiting';
      }
      return;
    }

    const currentPos = this.mesh.position;
    let targetWaypoint = this.waypoints[this.targetWaypointIndex];
    const distToWaypoint = currentPos.distanceTo(targetWaypoint);

    // 1. ADVANCE WAYPOINT & SYNCHRONIZE ACTIVE ROAD LANE
    if (distToWaypoint < 3.2) {
      this.targetWaypointIndex++;
      if (this.targetWaypointIndex >= this.waypoints.length) {
        this.speed = 0;
        this.state = 'waiting';
        this.updateBrakeLights(true);
        return;
      }
      targetWaypoint = this.waypoints[this.targetWaypointIndex];
    }

    if (this.waypointLanes.length > this.targetWaypointIndex && this.waypointLanes[this.targetWaypointIndex]) {
      this.currentLane = this.waypointLanes[this.targetWaypointIndex];
    }

    const isTurning = Boolean(this.isTurnWaypoint[this.targetWaypointIndex]);

    // 2. DETECT TRAFFIC LIGHTS & INTERSECTION RIGHT-OF-WAY RULES
    let shouldStopForLight = false;
    let shouldSlowForLight = false;

    if (this.currentLane && this.currentLane.trafficLightId && !this.isEmergency) {
      const tl = trafficLights.get(this.currentLane.trafficLightId);
      if (tl && this.currentLane.stopPoint) {
        const toStop = new THREE.Vector3().subVectors(this.currentLane.stopPoint, currentPos);
        const forwardDot = toStop.dot(this.currentLane.direction);
        const distToStop = Math.hypot(toStop.x, toStop.z);

        // Vehicle is approaching the stop line (has not crossed into the intersection box yet)
        if (forwardDot > -1.2 && distToStop < 28) {
          const axis =
            Math.abs(this.currentLane.direction.x) > Math.abs(this.currentLane.direction.z) ? 'EW' : 'NS';
          if (tl.isRed(axis)) {
            if (distToStop < 19) {
              shouldStopForLight = true;
            } else {
              shouldSlowForLight = true;
            }
          } else if (tl.isYellow(axis)) {
            // Stop on yellow unless already committed right at the stop bar
            if (distToStop > 4.5 && distToStop < 19) {
              shouldStopForLight = true;
            } else {
              shouldSlowForLight = true;
            }
          } else if (tl.isGreen(axis) && distToStop < 9.0 && forwardDot > 0) {
            // Intersection Box Anti-Gridlock Rule: Yield if cross-traffic is still clearing the intersection box
            for (let i = 0; i < allVehicles.length; i++) {
              const other = allVehicles[i];
              if (other === this || !other.active || other.state === 'parked') continue;
              const dInter = Math.hypot(
                other.mesh.position.x - tl.position.x,
                other.mesh.position.z - tl.position.z
              );
              if (dInter < 7.8 && other.currentLane) {
                const dotDir = Math.abs(this.currentLane.direction.dot(other.currentLane.direction));
                if (dotDir < 0.5 && other.speed > 0.5) {
                  shouldStopForLight = true;
                  break;
                }
              }
            }
          }
        }
      }
    }

    // 2b. RAILWAY LEVEL-CROSSING RULE (Stop before Z = -220 tracks when a train is approaching)
    let shouldStopForTrain = false;
    if (trains && !this.isEmergency && this.currentLane) {
      const isNorthSouth = Math.abs(this.currentLane.direction.z) > 0.7;
      if (isNorthSouth) {
        const railZ = -220;
        const distToRailZ = (railZ - currentPos.z) * Math.sign(this.currentLane.direction.z);
        // Approaching the railway corridor (between 16m and 32m before track center)
        if (distToRailZ > 15 && distToRailZ < 32) {
          for (let i = 0; i < trains.length; i++) {
            const train = trains[i];
            const trainDx = Math.abs(train.mesh.position.x - currentPos.x);
            if (trainDx < 85 && train.speed > 0.5) {
              shouldStopForTrain = true;
              break;
            }
          }
        }
      }
    }

    // 3. COLLISION AVOIDANCE & SAFE LANE QUEUING WITH VEHICLES AHEAD
    let vehicleAheadDist = Infinity;
    let vehicleAheadSpeed = this.maxSpeed;
    const forwardVec = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion).normalize();
    // Note: Object3D.lookAt orients +Z toward target in Three.js for standard groups; verify actual heading vector from velocity/target
    const headingVec = new THREE.Vector3().subVectors(targetWaypoint, currentPos);
    headingVec.y = 0;
    if (headingVec.lengthSq() > 0.001) {
      headingVec.normalize();
    } else {
      headingVec.copy(forwardVec);
    }

    for (let i = 0; i < allVehicles.length; i++) {
      const other = allVehicles[i];
      if (other === this || !other.active || other.state === 'parked') continue;

      const dx = other.mesh.position.x - currentPos.x;
      const dz = other.mesh.position.z - currentPos.z;
      const dy = Math.abs(other.mesh.position.y - currentPos.y);
      if (dy > 3.5) continue; // Ignore vehicles on elevated flyover vs ground street

      const distSq = dx * dx + dz * dz;
      if (distSq < 900 && distSq > 0.01) {
        const dist = Math.sqrt(distSq);
        const forwardProj = dx * headingVec.x + dz * headingVec.z;
        const lateralDist = Math.abs(-dx * headingVec.z + dz * headingVec.x);

        if (forwardProj > 0 && lateralDist < 2.8) {
          if (dist < vehicleAheadDist) {
            vehicleAheadDist = dist;
            vehicleAheadSpeed = other.speed;
          }
        }
      }
    }

    // 3b. YIELD TO PEDESTRIANS IN CROSSWALKS
    let pedestrianCrossingAhead = false;
    if (pedestrians && !this.isEmergency) {
      for (let i = 0; i < pedestrians.length; i++) {
        const ped = pedestrians[i];
        if (ped.state !== 'crossing_street') continue;
        const dx = ped.mesh.position.x - currentPos.x;
        const dz = ped.mesh.position.z - currentPos.z;
        const dSq = dx * dx + dz * dz;
        if (dSq < 225) {
          const d = Math.sqrt(dSq);
          const dot = (headingVec.x * dx + headingVec.z * dz) / (d + 0.0001);
          if (dot > 0.68) {
            pedestrianCrossingAhead = true;
            break;
          }
        }
      }
    }

    // 4. SPEED LIMIT COMPLIANCE & STATE DETERMINATION
    const laneSpeedLimitMs = this.currentLane ? this.currentLane.speedLimit / 3.6 : this.maxSpeed;
    const legalCruiseSpeed = this.isEmergency
      ? this.maxSpeed
      : Math.min(this.maxSpeed, laneSpeedLimitMs) * (isTurning ? 0.58 : 1.0);

    let targetSpeed = legalCruiseSpeed;

    if (
      shouldStopForLight ||
      shouldStopForTrain ||
      vehicleAheadDist < 9.2 ||
      pedestrianCrossingAhead
    ) {
      targetSpeed = 0;
      this.state = this.speed < 0.2 ? 'waiting' : 'stopping';
    } else if (shouldSlowForLight || vehicleAheadDist < 18.0) {
      targetSpeed = Math.min(legalCruiseSpeed * 0.42, Math.max(vehicleAheadSpeed, 3.0));
      this.state = isTurning ? 'turning' : 'driving';
    } else {
      this.state = isTurning ? 'turning' : 'driving';
    }

    // Smooth acceleration / crisp deceleration
    const isBraking = targetSpeed < this.speed - 0.5 || targetSpeed === 0;
    this.updateBrakeLights(isBraking || this.speed < 0.5);

    if (this.speed < targetSpeed) {
      this.speed = Math.min(targetSpeed, this.speed + this.acceleration * delta);
    } else if (this.speed > targetSpeed) {
      this.speed = Math.max(targetSpeed, this.speed - this.braking * delta);
    }

    // 5. STEERING & MOVEMENT (including smooth bridge elevation interpolation)
    if (this.speed > 0.01) {
      const dirToTarget = new THREE.Vector3().subVectors(targetWaypoint, currentPos);
      const flatDist = Math.hypot(dirToTarget.x, dirToTarget.z);
      const lookDir = new THREE.Vector3(dirToTarget.x, 0, dirToTarget.z);
      if (lookDir.lengthSq() > 0.0001) {
        lookDir.normalize();
        const lookTarget = currentPos.clone().add(lookDir);
        this.mesh.lookAt(lookTarget);
      }

      const moveDistance = Math.min(this.speed * delta, flatDist);
      this.mesh.position.x += lookDir.x * moveDistance;
      this.mesh.position.z += lookDir.z * moveDistance;
      // Smoothly follow bridge/road elevation
      this.mesh.position.y = THREE.MathUtils.lerp(currentPos.y, targetWaypoint.y, Math.min(1, delta * 8));
    }
  }

  public abstract dispose(): void;
}
