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
  outerRingMesh: THREE.Mesh;
  pillarMesh: THREE.Mesh;
  iconMesh: THREE.Object3D;
  detailGroup: THREE.Group;
  pointLight: THREE.PointLight;
  pulseTimer: number;
}

export class IncidentVisuals {
  public group: THREE.Group;
  private scene: THREE.Scene;
  private incidentVisuals: Map<string, ActiveIncidentVisual> = new Map();

  private ringMatFire = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  });
  private ringMatAccident = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  });
  private ringMatMedical = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  });
  private ringMatPower = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  });

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'incident_visual_markers';
    this.scene.add(this.group);
  }

  public addIncident(event: CityEvent) {
    if (this.incidentVisuals.has(event.id)) return;

    const incidentGroup = new THREE.Group();
    incidentGroup.position.set(event.location.x, Math.max(0.3, event.location.y), event.location.z);

    let ringMat = this.ringMatFire;
    let beaconColor = 0xef4444;
    if (event.type === 'ACCIDENT' || event.type === 'TRAFFIC_JAM' || event.type === 'ROAD_BLOCK') {
      ringMat = this.ringMatAccident;
      beaconColor = 0xf59e0b;
    } else if (event.type === 'MEDICAL_EMERGENCY') {
      ringMat = this.ringMatMedical;
      beaconColor = 0x0ea5e9;
    } else if (event.type === 'POWER_OUTAGE') {
      ringMat = this.ringMatPower;
      beaconColor = 0xa855f7;
    }

    // 1. Expanding Inner & Outer Ground Perimeter Warning Rings
    const ringGeo = new THREE.RingGeometry(3.2, 4.4, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, ringMat.clone());
    ringMesh.position.y = 0.25;
    incidentGroup.add(ringMesh);

    const outerRingGeo = new THREE.RingGeometry(5.5, 6.2, 32);
    outerRingGeo.rotateX(-Math.PI / 2);
    const outerRingMesh = new THREE.Mesh(outerRingGeo, ringMat.clone());
    outerRingMesh.position.y = 0.22;
    incidentGroup.add(outerRingMesh);

    // 2. Vertical Emergency Light Column Beacon
    const pillarGeo = new THREE.CylinderGeometry(0.45, 2.4, 42, 16, 1, true);
    const pillarMat = new THREE.MeshBasicMaterial({
      color: beaconColor,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const pillarMesh = new THREE.Mesh(pillarGeo, pillarMat);
    pillarMesh.position.y = 21;
    incidentGroup.add(pillarMesh);

    // 3. 3D Floating Emergency Symbol & Ground Scene Details
    const iconGroup = new THREE.Group();
    iconGroup.position.y = 14;
    incidentGroup.add(iconGroup);

    const detailGroup = new THREE.Group();
    incidentGroup.add(detailGroup);

    if (event.type === 'FIRE') {
      // Floating Flame Octahedron
      const flameIcon = new THREE.Mesh(
        new THREE.OctahedronGeometry(2.2, 0),
        new THREE.MeshBasicMaterial({ color: 0xff5500, wireframe: true })
      );
      iconGroup.add(flameIcon);

      // Ground 3D Fire Cones & Rising Smoke Plumes
      const fireCoreMat = new THREE.MeshBasicMaterial({ color: 0xff4500 });
      const fireInnerMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      const smokeMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.9,
        transparent: true,
        opacity: 0.72,
      });

      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const r = i === 0 ? 0 : 1.4;
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.85, 3.2, 7), i % 2 === 0 ? fireCoreMat : fireInnerMat);
        cone.position.set(Math.cos(angle) * r, 1.6, Math.sin(angle) * r);
        detailGroup.add(cone);
      }

      for (let s = 0; s < 4; s++) {
        const smokePuff = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2 + s * 0.35, 1), smokeMat);
        smokePuff.position.set(
          Math.sin(s * 1.7) * 0.9,
          3.8 + s * 2.2,
          Math.cos(s * 1.7) * 0.9
        );
        detailGroup.add(smokePuff);
      }
    } else if (event.type === 'MEDICAL_EMERGENCY') {
      // 3D Floating Medical Cross Icon
      const crossMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 3.0, 0.9), crossMat);
      const hBar = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.9, 0.9), crossMat);
      iconGroup.add(vBar, hBar);

      // Ground Medical Response Triage Pod & Strobe Beacons
      const podMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
      const medPod = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.65, 1.4), podMat);
      medPod.position.set(0, 0.35, 0);
      detailGroup.add(medPod);

      const crossTop = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.4), crossMat);
      crossTop.position.set(0, 0.7, 0);
      const crossSide = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 1.2), crossMat);
      crossSide.position.set(0, 0.7, 0);
      detailGroup.add(crossTop, crossSide);
    } else {
      // Traffic Collision / Infrastructure Alert Octahedron + Safety Cones
      const hazardIcon = new THREE.Mesh(
        new THREE.OctahedronGeometry(2.0, 0),
        new THREE.MeshBasicMaterial({ color: beaconColor, wireframe: true })
      );
      iconGroup.add(hazardIcon);

      const coneMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 0.4 });
      for (let c = 0; c < 6; c++) {
        const a = (c / 6) * Math.PI * 2;
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.85, 8), coneMat);
        cone.position.set(Math.cos(a) * 3.0, 0.42, Math.sin(a) * 3.0);
        detailGroup.add(cone);
      }
    }

    // 4. High-Intensity Emergency Strobe PointLight
    const pointLight = new THREE.PointLight(beaconColor, 4.5, 38);
    pointLight.position.y = 4.5;
    incidentGroup.add(pointLight);

    this.group.add(incidentGroup);

    this.incidentVisuals.set(event.id, {
      event,
      group: incidentGroup,
      ringMesh,
      outerRingMesh,
      pillarMesh,
      iconMesh: iconGroup,
      detailGroup,
      pointLight,
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
      item.iconMesh.rotation.y = elapsedTime * 2.4;
      item.iconMesh.position.y = 14 + Math.sin(elapsedTime * 3.2) * 1.2;

      const scale1 = 1 + (Math.sin(elapsedTime * 4.5) + 1) * 0.22;
      item.ringMesh.scale.set(scale1, scale1, scale1);

      const scale2 = 1 + (Math.cos(elapsedTime * 3.2) + 1) * 0.18;
      item.outerRingMesh.scale.set(scale2, scale2, scale2);

      // Animate fire cones / strobe intensity
      if (item.event.type === 'FIRE') {
        item.detailGroup.children.forEach((child, idx) => {
          if (idx < 5) {
            child.scale.y = 0.85 + Math.sin(elapsedTime * 9 + idx * 1.7) * 0.3;
          } else {
            child.position.y = 3.8 + (idx - 5) * 2.0 + ((elapsedTime * 2.5 + idx) % 3.5);
          }
        });
      }

      item.pointLight.intensity = 3.5 + Math.sin(elapsedTime * 10) * 1.8;

      const mat = item.pillarMesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.28 + Math.sin(elapsedTime * 6) * 0.14;
    });
  }

  public dispose() {
    this.incidentVisuals.forEach((_, id) => this.removeIncident(id));
    this.scene.remove(this.group);
  }
}
