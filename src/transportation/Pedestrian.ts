/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

const pedBodyGeo = new THREE.CylinderGeometry(0.2, 0.25, 1.1, 6);
const pedHeadGeo = new THREE.SphereGeometry(0.18, 6, 6);
const pedVisorGeo = new THREE.BoxGeometry(0.22, 0.08, 0.12);

const bodyMats = [
  new THREE.MeshStandardMaterial({ color: 0x091224, roughness: 0.5 }),
  new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.5 }),
  new THREE.MeshStandardMaterial({ color: 0x172554, roughness: 0.5 }),
];

const visorMats = [
  new THREE.MeshBasicMaterial({ color: 0x00f0ff }),
  new THREE.MeshBasicMaterial({ color: 0xff00aa }),
  new THREE.MeshBasicMaterial({ color: 0x00ffaa }),
  new THREE.MeshBasicMaterial({ color: 0xf59e0b }),
];

export class Pedestrian {
  public id: string;
  public mesh: THREE.Group;
  public speed = 1.4; // m/s
  public waypoints: THREE.Vector3[] = [];
  public currentWaypointIndex = 0;
  public state: 'walking' | 'waiting_at_crossing' = 'walking';
  public waitTimer = 0;
  private walkAnimTime = Math.random() * 10;

  constructor(id: string, startPos: THREE.Vector3, waypoints: THREE.Vector3[]) {
    this.id = id;
    this.waypoints = waypoints;
    this.mesh = new THREE.Group();
    this.mesh.name = `ped_${id}`;
    this.mesh.position.copy(startPos);
    this.speed = 1.2 + Math.random() * 0.6;
    this.buildMesh();
  }

  private buildMesh() {
    const bMat = bodyMats[Math.floor(Math.random() * bodyMats.length)];
    const vMat = visorMats[Math.floor(Math.random() * visorMats.length)];

    // Body
    const body = new THREE.Mesh(pedBodyGeo, bMat);
    body.position.y = 0.55;
    this.mesh.add(body);

    // Head
    const head = new THREE.Mesh(pedHeadGeo, bMat);
    head.position.y = 1.25;
    this.mesh.add(head);

    // Cyberpunk Visor
    const visor = new THREE.Mesh(pedVisorGeo, vMat);
    visor.position.set(0, 1.25, -0.15);
    this.mesh.add(visor);
  }

  public update(delta: number) {
    if (this.waypoints.length === 0) return;

    if (this.state === 'waiting_at_crossing') {
      this.waitTimer -= delta;
      if (this.waitTimer <= 0) {
        this.state = 'walking';
      }
      return;
    }

    const currentPos = this.mesh.position;
    const target = this.waypoints[this.currentWaypointIndex];
    const dist = currentPos.distanceTo(target);

    if (dist < 1.0) {
      // Reached waypoint: advance to next or loop
      this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.waypoints.length;

      // Random wait at crosswalks
      if (Math.random() < 0.2) {
        this.state = 'waiting_at_crossing';
        this.waitTimer = 2.5 + Math.random() * 2.0;
        return;
      }
    }

    // Walk towards target
    const dir = new THREE.Vector3().subVectors(target, currentPos);
    dir.y = 0;
    dir.normalize();

    this.mesh.lookAt(currentPos.clone().add(dir));

    // Subtle rhythmic walk bobbing
    this.walkAnimTime += delta * 7;
    const bob = Math.sin(this.walkAnimTime) * 0.04;
    this.mesh.position.y = 0.25 + Math.max(0, bob);

    this.mesh.position.add(dir.multiplyScalar(this.speed * delta));
  }

  public dispose() {
    this.mesh.clear();
  }
}
