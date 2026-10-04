/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CityEvent } from './CityState';

interface ActiveIncidentVisual {
  event: CityEvent;
  group: THREE.Group;
  ringMesh: THREE.Mesh;
  pillarMesh: THREE.Mesh;
  iconMesh: THREE.Mesh;
  pulseTimer: number;
}

export class IncidentVisuals {
  public group: THREE.Group;
  private scene: THREE.Scene;
  private incidentVisuals: Map<string, ActiveIncidentVisual> = new Map();

  // Materials
  private ringMatFire = new THREE.MeshBasicMaterial({ color: 0xff3300, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
  private ringMatAccident = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
  private ringMatMedical = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
  private ringMatTraffic = new THREE.MeshBasicMaterial({ color: 0xff0055, transparent: true, opacity: 0.8, side: THREE.DoubleSide });

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'incident_visual_markers';
    this.scene.add(this.group);
  }

  public addIncident(event: CityEvent) {
    if (this.incidentVisuals.has(event.id)) return;

    const incidentGroup = new THREE.Group();
    incidentGroup.position.set(event.location.x, Math.max(0.5, event.location.y), event.location.z);

    // Pick color scheme
    let ringMat = this.ringMatFire;
    let beaconColor = 0xff2200;
    if (event.type === 'ACCIDENT') {
      ringMat = this.ringMatAccident;
      beaconColor = 0xff9900;
    } else if (event.type === 'MEDICAL_EMERGENCY') {
      ringMat = this.ringMatMedical;
      beaconColor = 0x00e5ff;
    } else if (event.type === 'TRAFFIC_JAM' || event.type === 'ROAD_BLOCK') {
      ringMat = this.ringMatTraffic;
      beaconColor = 0xff0066;
    }

    // 1. Expanding Ground Warning Ring
    const ringGeo = new THREE.RingGeometry(2.5, 3.8, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, ringMat.clone());
    ringMesh.position.y = 0.2;
    incidentGroup.add(ringMesh);

    // 2. Vertical Holographic Cyber Beacon Pillar
    const pillarGeo = new THREE.CylinderGeometry(0.35, 1.8, 38, 12, 1, true);
    const pillarMat = new THREE.MeshBasicMaterial({
      color: beaconColor,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const pillarMesh = new THREE.Mesh(pillarGeo, pillarMat);
    pillarMesh.position.y = 19;
    incidentGroup.add(pillarMesh);

    // 3. Rotating Diamond / Cross Floating Marker
    const iconGeo = new THREE.OctahedronGeometry(1.6);
    const iconMat = new THREE.MeshBasicMaterial({
      color: beaconColor,
      wireframe: true,
    });
    const iconMesh = new THREE.Mesh(iconGeo, iconMat);
    iconMesh.position.y = 12;
    incidentGroup.add(iconMesh);

    // 4. Point light for atmospheric incident glow
    const pointLight = new THREE.PointLight(beaconColor, 3, 30);
    pointLight.position.y = 4;
    incidentGroup.add(pointLight);

    this.group.add(incidentGroup);

    this.incidentVisuals.set(event.id, {
      event,
      group: incidentGroup,
      ringMesh,
      pillarMesh,
      iconMesh,
      pulseTimer: 0,
    });
  }

  public removeIncident(eventId: string) {
    const item = this.incidentVisuals.get(eventId);
    if (!item) return;

    this.group.remove(item.group);
    item.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    });

    this.incidentVisuals.delete(eventId);
  }

  public update(elapsedTime: number) {
    this.incidentVisuals.forEach((item) => {
      // Rotate floating icon
      item.iconMesh.rotation.y = elapsedTime * 2.2;
      item.iconMesh.rotation.x = Math.sin(elapsedTime * 1.5) * 0.4;
      item.iconMesh.position.y = 12 + Math.sin(elapsedTime * 3) * 1.2;

      // Pulse ground ring
      const scale = 1 + (Math.sin(elapsedTime * 4) + 1) * 0.25;
      item.ringMesh.scale.set(scale, scale, scale);

      // Flickering pillar opacity
      const mat = item.pillarMesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.35 + Math.sin(elapsedTime * 7) * 0.15;
    });
  }

  public dispose() {
    this.incidentVisuals.forEach((_, id) => this.removeIncident(id));
    this.scene.remove(this.group);
  }
}
