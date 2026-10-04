/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { Vehicle } from './Vehicle';
import { BusStopLocation, RoadNetwork } from './RoadNetwork';
import { TrafficLight } from './TrafficLight';

const busBodyGeo = new THREE.BoxGeometry(2.8, 2.2, 10.5);
const busWindowGeo = new THREE.BoxGeometry(2.82, 0.9, 8.5);
const busRoofGeo = new THREE.BoxGeometry(2.7, 0.4, 10.2);
const busSignGeo = new THREE.PlaneGeometry(2.2, 0.6);

const busBodyMat = new THREE.MeshStandardMaterial({ color: 0x071527, roughness: 0.3, metalness: 0.8 });
const busWindowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.75 });
const busAccentMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
const busSignMat = new THREE.MeshBasicMaterial({ color: 0x00ffaa });
const doorStrobeMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

export class Bus extends Vehicle {
  public routeId: string;
  public routeName: string;
  public busStops: BusStopLocation[] = [];
  public currentStopIndex = 0;
  public isDwellingAtStop = false;
  public dwellTimer = 0;
  private doorStrobe: THREE.Mesh | null = null;

  constructor(id: string, routeId: string, routeName: string, stops: BusStopLocation[]) {
    super(id, 'bus');
    this.routeId = routeId;
    this.routeName = routeName;
    this.busStops = stops;
    this.maxSpeed = 12; // ~43 km/h
    this.acceleration = 5;
    this.braking = 9;
    this.buildMesh();
  }

  private buildMesh() {
    // Bus Chassis & Body
    const body = new THREE.Mesh(busBodyGeo, busBodyMat);
    body.position.y = 1.35;
    body.castShadow = true;
    this.mesh.add(body);

    // Illuminated Passenger Windows Strip
    const windows = new THREE.Mesh(busWindowGeo, busWindowMat);
    windows.position.set(0, 1.6, 0.2);
    this.mesh.add(windows);

    // Aerodynamic Roof Shell
    const roof = new THREE.Mesh(busRoofGeo, busAccentMat);
    roof.position.set(0, 2.55, 0);
    this.mesh.add(roof);

    // Front Route Destination Display
    const frontSign = new THREE.Mesh(busSignGeo, busSignMat);
    frontSign.position.set(0, 2.1, -5.26);
    this.mesh.add(frontSign);

    // Door Embarkation Strobe Indicator (Right side)
    const strobe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.8), doorStrobeMat);
    strobe.position.set(1.42, 1.8, -2.5);
    this.mesh.add(strobe);
    this.doorStrobe = strobe;

    // Headlights
    [-1.0, 1.0].forEach((hx) => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.1), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      hl.position.set(hx, 0.8, -5.26);
      this.mesh.add(hl);
      this.headlights.push(hl);
    });

    // Taillights
    [-1.0, 1.0].forEach((tx) => {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.1), new THREE.MeshBasicMaterial({ color: 0xff1144 }));
      tl.position.set(tx, 0.8, 5.26);
      this.mesh.add(tl);
      this.taillights.push(tl);
    });

    // 6 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.4, 8);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x05070c, roughness: 0.8 });

    [-1.3, 1.3].forEach((wx) => {
      [-3.5, 0.5, 3.5].forEach((wz) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(wx, 0.45, wz);
        this.mesh.add(wheel);
      });
    });
  }

  public override update(
    delta: number,
    trafficLights: Map<string, TrafficLight>,
    allVehicles: Vehicle[]
  ) {
    if (!this.active) return;

    // Handle passenger stop dwell
    if (this.isDwellingAtStop) {
      this.speed = 0;
      this.state = 'waiting';
      this.dwellTimer -= delta;

      // Pulse door strobe light
      if (this.doorStrobe) {
        this.doorStrobe.scale.setScalar(Math.sin(this.dwellTimer * 10) > 0 ? 1.5 : 0.8);
      }

      if (this.dwellTimer <= 0) {
        // Resume route
        this.isDwellingAtStop = false;
        this.state = 'driving';
        this.currentStopIndex = (this.currentStopIndex + 1) % Math.max(1, this.busStops.length);
        if (this.doorStrobe) this.doorStrobe.scale.setScalar(1);
      }
      return;
    }

    // Check distance to next assigned bus stop
    if (this.busStops.length > 0) {
      const nextStop = this.busStops[this.currentStopIndex];
      const distToStop = this.mesh.position.distanceTo(nextStop.position);

      if (distToStop < 7.0 && this.speed < 8.0) {
        // Begin dwelling at stop for passenger transfer
        this.isDwellingAtStop = true;
        this.dwellTimer = 4.0; // 4 seconds passenger boarding
        this.speed = 0;
        return;
      }
    }

    super.update(delta, trafficLights, allVehicles);
  }

  public dispose() {
    this.mesh.clear();
  }
}
