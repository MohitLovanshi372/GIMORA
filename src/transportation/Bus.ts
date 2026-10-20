/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { Vehicle } from './Vehicle';
import { BusStopLocation } from './RoadNetwork';
import { TrafficLight } from './TrafficLight';

// Extruded aerodynamic low-floor city transit coach shell
function createBusBodyGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-5.35, 0.22); // Front lower bumper
  shape.lineTo(-5.45, 0.95); // Front fascia
  shape.lineTo(-5.15, 2.38); // Sloped panoramic windshield
  shape.lineTo(-4.75, 2.65); // Front destination header brow
  shape.lineTo(5.15, 2.65);  // Full roof length
  shape.lineTo(5.38, 2.42);  // Rear upper corner
  shape.lineTo(5.42, 0.30);  // Rear engine bay fascia
  shape.lineTo(5.15, 0.22);  // Rear undertray
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: 2.66,
    bevelEnabled: true,
    bevelThickness: 0.09,
    bevelSize: 0.09,
    bevelSegments: 3,
  });
  geo.rotateY(Math.PI / 2);
  geo.center();
  return geo;
}

function createRouteSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 504, 120);
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 54px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('101 METRO LOOP', 256, 66);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const busShellGeo = createBusBodyGeometry();
const busWindowGeo = new THREE.BoxGeometry(2.86, 1.02, 8.6);
const busHvacGeo = new THREE.BoxGeometry(1.85, 0.34, 3.2);
const busSignGeo = new THREE.PlaneGeometry(2.15, 0.44);

const busBodyMat = new THREE.MeshPhysicalMaterial({
  color: 0x1e3a8a,
  roughness: 0.22,
  metalness: 0.65,
  clearcoat: 0.9,
  clearcoatRoughness: 0.08,
});
const busLowerSkirtMat = new THREE.MeshStandardMaterial({
  color: 0x0f172a,
  roughness: 0.5,
  metalness: 0.4,
});
const busAccentStripeMat = new THREE.MeshStandardMaterial({
  color: 0x38bdf8,
  roughness: 0.25,
  metalness: 0.6,
});
const busWindowMat = new THREE.MeshPhysicalMaterial({
  color: 0x090d16,
  roughness: 0.08,
  transmission: 0.68,
  transparent: true,
  opacity: 0.9,
  clearcoat: 1.0,
});
const busRoofPodMat = new THREE.MeshStandardMaterial({
  color: 0xf1f5f9,
  roughness: 0.35,
  metalness: 0.5,
});
const busSignMat = new THREE.MeshBasicMaterial({ map: createRouteSignTexture() });
const doorStrobeMat = new THREE.MeshBasicMaterial({ color: 0xeab308 });
const tireMat = new THREE.MeshStandardMaterial({ color: 0x0b0f19, roughness: 0.85, metalness: 0.15 });
const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.18, metalness: 0.9 });

const busTireGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.36, 16);
busTireGeo.rotateZ(Math.PI / 2);
const busRimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.38, 12);
busRimGeo.rotateZ(Math.PI / 2);

export class Bus extends Vehicle {
  public routeId: string;
  public routeName: string;
  public busStops: BusStopLocation[] = [];
  public currentStopIndex = 0;
  public isDwellingAtStop = false;
  public dwellTimer = 0;
  private doorStrobe: THREE.Mesh | null = null;
  private wheelGroups: THREE.Object3D[] = [];

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
    // 1. Sculpted Aerodynamic Transit Coach Body
    const body = new THREE.Mesh(busShellGeo, busBodyMat);
    body.position.y = 1.48;
    body.castShadow = true;
    body.receiveShadow = true;
    this.mesh.add(body);

    // 2. Lower Bumper Skirt & Cyan Metro Transit Livery Band
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(2.86, 0.46, 10.6), busLowerSkirtMat);
    skirt.position.set(0, 0.48, 0);
    this.mesh.add(skirt);

    const liveryStripe = new THREE.Mesh(new THREE.BoxGeometry(2.88, 0.22, 10.4), busAccentStripeMat);
    liveryStripe.position.set(0, 1.02, 0);
    this.mesh.add(liveryStripe);

    // 3. Panoramic Side Passenger Windows & Sloped Front Windshield
    const windows = new THREE.Mesh(busWindowGeo, busWindowMat);
    windows.position.set(0, 1.78, 0.15);
    this.mesh.add(windows);

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.58, 1.18, 0.14), busWindowMat);
    windshield.position.set(0, 1.72, -5.28);
    windshield.rotation.x = -0.18;
    this.mesh.add(windshield);

    // Window Pillars (Mullions) & Folding Boarding Doors
    [-3.2, -1.4, 0.4, 2.2, 4.0].forEach((pz) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(2.89, 1.04, 0.14), busLowerSkirtMat);
      pillar.position.set(0, 1.78, pz);
      this.mesh.add(pillar);
    });

    // Warm Illuminated Interior Cabin Glow & Passenger Seats
    const interiorFloor = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.15, 9.2),
      new THREE.MeshBasicMaterial({ color: 0xfef3c7 })
    );
    interiorFloor.position.set(0, 1.25, 0.2);
    this.mesh.add(interiorFloor);

    // 4. Twin Rooftop HVAC Air Conditioning & Battery Pods
    [-2.1, 2.2].forEach((rz) => {
      const hvac = new THREE.Mesh(busHvacGeo, busRoofPodMat);
      hvac.position.set(0, 2.86, rz);
      hvac.castShadow = true;
      this.mesh.add(hvac);
    });

    // 5. Front & Side Illuminated LED Route Destination Boards
    const frontSign = new THREE.Mesh(busSignGeo, busSignMat);
    frontSign.position.set(0, 2.48, -5.42);
    frontSign.rotation.y = Math.PI;
    this.mesh.add(frontSign);

    // Side Wing Mirrors (Gantry Style)
    [-1.52, 1.52].forEach((mx) => {
      const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.46, 0.22), busLowerSkirtMat);
      mirror.position.set(mx, 1.95, -5.15);
      this.mesh.add(mirror);
    });

    // Door Embarkation Strobe Indicator (Right Curbside)
    const strobe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.85), doorStrobeMat);
    strobe.position.set(1.45, 2.25, -2.35);
    this.mesh.add(strobe);
    this.doorStrobe = strobe;

    // 6. Headlights & Rear Taillight Clusters
    [-1.02, 1.02].forEach((hx) => {
      const hl = new THREE.Mesh(
        new THREE.BoxGeometry(0.44, 0.22, 0.1),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      hl.position.set(hx, 0.76, -5.44);
      this.mesh.add(hl);
      this.headlights.push(hl);

      const tl = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.52, 0.1),
        new THREE.MeshBasicMaterial({ color: 0xff1133 })
      );
      tl.position.set(hx, 0.92, 5.44);
      this.mesh.add(tl);
      this.taillights.push(tl);
    });

    // 7. 6 Heavy-Duty Transit Wheels with Chrome Hubcaps
    [-1.36, 1.36].forEach((wx) => {
      [-3.45, 1.15, 3.45].forEach((wz) => {
        const wGroup = new THREE.Group();
        wGroup.position.set(wx, 0.48, wz);
        const tire = new THREE.Mesh(busTireGeo, tireMat);
        const rim = new THREE.Mesh(busRimGeo, chromeMat);
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.46, 0.08), busLowerSkirtMat);
        wGroup.add(tire, rim, spoke);
        this.mesh.add(wGroup);
        this.wheelGroups.push(wGroup);
      });
    });
  }

  public override update(
    delta: number,
    trafficLights: Map<string, TrafficLight>,
    allVehicles: Vehicle[],
    pedestrians?: any[],
    trains?: any[]
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
        this.isDwellingAtStop = true;
        this.dwellTimer = 4.0;
        this.speed = 0;
        return;
      }
    }

    super.update(delta, trafficLights, allVehicles, pedestrians, trains);

    // Rotate transit bus wheels
    if (this.speed > 0.05) {
      const spin = (this.speed * delta) / 0.48;
      for (let i = 0; i < this.wheelGroups.length; i++) {
        this.wheelGroups[i].rotation.x -= spin;
      }
    }
  }

  public dispose() {
    this.mesh.clear();
  }
}
