/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoadLane } from './RoadNetwork';
import { TrafficLight } from './TrafficLight';

export type VehicleType = 'car' | 'bus' | 'motorcycle' | 'ambulance' | 'police' | 'fire-truck' | 'taxi' | 'delivery-truck';

export type VehicleState =
  | 'driving'
  | 'stopping'
  | 'waiting'
  | 'turning'
  | 'changing lane'
  | 'parked';

export abstract class Vehicle {
  public id: string;
  public type: VehicleType;
  public mesh: THREE.Group;
  public speed = 0; // m/s
  public maxSpeed = 16; // ~58 km/h default
  public acceleration = 8; // m/s^2
  public braking = 12; // m/s^2
  public currentLane: RoadLane | null = null;
  public destination: THREE.Vector3 | null = null;
  public state: VehicleState = 'driving';
  public waypoints: THREE.Vector3[] = [];
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

  public setRoute(waypoints: THREE.Vector3[], currentLane: RoadLane | null) {
    this.waypoints = waypoints;
    this.targetWaypointIndex = 0;
    this.currentLane = currentLane;
    this.state = 'driving';
    if (waypoints.length > 0) {
      this.mesh.position.copy(waypoints[0]);
      if (waypoints.length > 1) {
        this.mesh.lookAt(waypoints[1]);
      }
    }
  }

  public update(
    delta: number,
    trafficLights: Map<string, TrafficLight>,
    allVehicles: Vehicle[]
  ) {
    if (!this.active) return;

    if (this.state === 'parked') {
      this.parkedTimer -= delta;
      if (this.parkedTimer <= 0) {
        // Leave parking
        this.state = 'driving';
      }
      return;
    }

    if (this.waypoints.length === 0 || this.targetWaypointIndex >= this.waypoints.length) {
      this.speed = Math.max(0, this.speed - this.braking * delta);
      if (this.speed === 0) {
        this.state = 'waiting';
      }
      return;
    }

    const currentPos = this.mesh.position;
    const targetWaypoint = this.waypoints[this.targetWaypointIndex];
    const distToWaypoint = currentPos.distanceTo(targetWaypoint);

    // 1. ADVANCE WAYPOINT
    if (distToWaypoint < 4.0) {
      this.targetWaypointIndex++;
      if (this.targetWaypointIndex >= this.waypoints.length) {
        this.speed = 0;
        this.state = 'waiting';
        return;
      }
    }

    // 2. DETECT TRAFFIC LIGHTS
    let shouldStopForLight = false;
    let shouldSlowForLight = false;

    if (this.currentLane && this.currentLane.trafficLightId && !this.isEmergency) {
      const tl = trafficLights.get(this.currentLane.trafficLightId);
      if (tl && this.currentLane.stopPoint) {
        const distToStop = currentPos.distanceTo(this.currentLane.stopPoint);
        // Is vehicle approaching the stop line in driving direction?
        const toStop = new THREE.Vector3().subVectors(this.currentLane.stopPoint, currentPos);
        const forwardDot = toStop.dot(this.currentLane.direction);

        if (forwardDot > 0 && distToStop < 28) {
          const axis = Math.abs(this.currentLane.direction.x) > Math.abs(this.currentLane.direction.z) ? 'EW' : 'NS';
          if (tl.isRed(axis)) {
            shouldStopForLight = distToStop < 16;
          } else if (tl.isYellow(axis)) {
            shouldSlowForLight = true;
          }
        }
      }
    }

    // 3. COLLISION AVOIDANCE WITH VEHICLES AHEAD
    let vehicleAheadDist = Infinity;
    const forwardVec = new THREE.Vector3(0, 0, -1).applyQuaternion(this.mesh.quaternion).normalize();

    for (let i = 0; i < allVehicles.length; i++) {
      const other = allVehicles[i];
      if (other === this || !other.active || other.state === 'parked') continue;

      const toOther = new THREE.Vector3().subVectors(other.mesh.position, currentPos);
      const dist = toOther.length();

      if (dist < 35) {
        const dot = forwardVec.dot(toOther.clone().normalize());
        if (dot > 0.75) { // Directly in front within narrow cone
          if (dist < vehicleAheadDist) {
            vehicleAheadDist = dist;
          }
        }
      }
    }

    // 4. SPEED ADJUSTMENT & STATE DETERMINATION
    let targetSpeed = this.maxSpeed;

    if (shouldStopForLight || vehicleAheadDist < 8.0) {
      targetSpeed = 0;
      this.state = 'stopping';
    } else if (shouldSlowForLight || vehicleAheadDist < 16.0) {
      targetSpeed = this.maxSpeed * 0.35;
      this.state = 'driving';
    } else {
      this.state = 'driving';
    }

    // Smooth acceleration / deceleration
    if (this.speed < targetSpeed) {
      this.speed = Math.min(targetSpeed, this.speed + this.acceleration * delta);
    } else if (this.speed > targetSpeed) {
      this.speed = Math.max(targetSpeed, this.speed - this.braking * delta);
    }

    // 5. STEERING & MOVEMENT
    if (this.speed > 0) {
      // Steer towards target waypoint
      const dirToTarget = new THREE.Vector3().subVectors(targetWaypoint, currentPos);
      dirToTarget.y = 0;
      dirToTarget.normalize();

      const lookTarget = currentPos.clone().add(dirToTarget);
      this.mesh.lookAt(lookTarget);

      // Advance along heading
      const moveDistance = this.speed * delta;
      this.mesh.position.add(dirToTarget.multiplyScalar(moveDistance));
    }
  }

  public abstract dispose(): void;
}
