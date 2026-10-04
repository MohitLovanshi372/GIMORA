/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export type AssetCategory =
  | 'buildings'
  | 'vehicles'
  | 'trains'
  | 'buses'
  | 'bridges'
  | 'airport'
  | 'railway'
  | 'environment'
  | 'characters'
  | 'props';

export interface AssetDefinition {
  id: string;
  category: AssetCategory;
  path: string; // e.g. "vehicles/sports-car.glb"
  name: string;
  description: string;
  scale?: number;
  rotation?: [number, number, number];
  proceduralFallback: () => THREE.Object3D;
}

/**
 * Standard procedural fallback generators for high-fidelity substitution
 */
export function createFallbackSportsCar(): THREE.Object3D {
  const group = new THREE.Group();
  group.name = 'fallback_sports_car';

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    metalness: 0.9,
    roughness: 0.2,
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x051020,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.8,
    transparent: true,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.7, 4.4), bodyMat);
  body.position.y = 0.55;
  body.castShadow = true;
  group.add(body);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.55, 2.2), glassMat);
  roof.position.set(0, 1.05, -0.2);
  group.add(roof);

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.32, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7 });

  [
    [-1.0, 0.38, 1.3],
    [1.0, 0.38, 1.3],
    [-1.0, 0.38, -1.3],
    [1.0, 0.38, -1.3],
  ].forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.set(wx, wy, wz);
    group.add(wheel);
  });

  // Headlights
  const lightGeo = new THREE.BoxGeometry(0.4, 0.15, 0.1);
  const headMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
  const hl1 = new THREE.Mesh(lightGeo, headMat);
  hl1.position.set(-0.7, 0.55, -2.2);
  const hl2 = new THREE.Mesh(lightGeo, headMat);
  hl2.position.set(0.7, 0.55, -2.2);
  group.add(hl1, hl2);

  return group;
}

export function createFallbackBus(): THREE.Object3D {
  const group = new THREE.Group();
  group.name = 'fallback_cyber_bus';

  const busMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    metalness: 0.7,
    roughness: 0.3,
  });
  const glassMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.4, 9.6), busMat);
  body.position.y = 1.6;
  body.castShadow = true;
  group.add(body);

  const windowBand = new THREE.Mesh(new THREE.BoxGeometry(2.82, 0.9, 8.8), glassMat);
  windowBand.position.y = 1.9;
  group.add(windowBand);

  // Neon strip
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(2.86, 0.12, 9.4),
    new THREE.MeshBasicMaterial({ color: 0x00f0ff })
  );
  strip.position.y = 0.9;
  group.add(strip);

  return group;
}

export function createFallbackTrain(): THREE.Object3D {
  const group = new THREE.Group();
  group.name = 'fallback_maglev_train';

  const trainMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.85,
    roughness: 0.15,
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.6, 24), trainMat);
  body.position.y = 1.8;
  body.castShadow = true;
  group.add(body);

  // Aerodynamic Nose
  const nose = new THREE.Mesh(new THREE.ConeGeometry(1.6, 4.5, 16), trainMat);
  nose.rotateX(-Math.PI / 2);
  nose.position.set(0, 1.8, -14);
  group.add(nose);

  // Neon Maglev Underglow
  const underglow = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 0.2, 22),
    new THREE.MeshBasicMaterial({ color: 0x00f0ff })
  );
  underglow.position.y = 0.4;
  group.add(underglow);

  return group;
}

export function createFallbackBuilding(name: string, colorHex: number = 0x0ea5e9): THREE.Object3D {
  const group = new THREE.Group();
  group.name = `fallback_building_${name}`;

  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    metalness: 0.8,
    roughness: 0.25,
  });
  const tower = new THREE.Mesh(new THREE.BoxGeometry(24, 75, 24), mat);
  tower.position.y = 37.5;
  tower.castShadow = true;
  group.add(tower);

  const neonEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(tower.geometry),
    new THREE.LineBasicMaterial({ color: 0x00f0ff })
  );
  neonEdges.position.y = 37.5;
  group.add(neonEdges);

  return group;
}

export const ASSET_REGISTRY: Record<string, AssetDefinition> = {
  // 1. Vehicles
  'vehicles/sports-car.glb': {
    id: 'sports-car',
    category: 'vehicles',
    path: 'vehicles/sports-car.glb',
    name: 'Cyberpunk Sports Coupe',
    description: 'High-speed aerodyne electric sports vehicle',
    scale: 1.0,
    proceduralFallback: createFallbackSportsCar,
  },
  'vehicles/police-interceptor.glb': {
    id: 'police-interceptor',
    category: 'vehicles',
    path: 'vehicles/police-interceptor.glb',
    name: 'Metropolitan Police Interceptor',
    description: 'Emergency response autonomous patrol cruiser',
    scale: 1.0,
    proceduralFallback: () => {
      const v = createFallbackSportsCar();
      const siren = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.2, 0.3),
        new THREE.MeshBasicMaterial({ color: 0x3b82f6 })
      );
      siren.position.set(0, 1.45, -0.2);
      v.add(siren);
      return v;
    },
  },
  'vehicles/ambulance.glb': {
    id: 'ambulance',
    category: 'vehicles',
    path: 'vehicles/ambulance.glb',
    name: 'Smart Trauma Ambulance',
    description: 'Rapid life-support emergency drone vehicle',
    scale: 1.1,
    proceduralFallback: () => {
      const bus = createFallbackBus();
      bus.scale.set(0.7, 0.7, 0.65);
      return bus;
    },
  },
  'vehicles/delivery-truck.glb': {
    id: 'delivery-truck',
    category: 'vehicles',
    path: 'vehicles/delivery-truck.glb',
    name: 'Autonomous Delivery Hauler',
    description: 'Medium-duty freight and parcel transport unit',
    scale: 1.0,
    proceduralFallback: () => {
      const bus = createFallbackBus();
      bus.scale.set(0.85, 0.85, 0.75);
      return bus;
    },
  },

  // 2. Buses
  'buses/cyber-bus.glb': {
    id: 'cyber-bus',
    category: 'buses',
    path: 'buses/cyber-bus.glb',
    name: 'Autonomous Rapid Transit Bus',
    description: 'High-capacity electric articulated transit bus',
    scale: 1.0,
    proceduralFallback: createFallbackBus,
  },

  // 3. Trains
  'trains/futuristic-train.glb': {
    id: 'futuristic-train',
    category: 'trains',
    path: 'trains/futuristic-train.glb',
    name: 'Superconducting Maglev Express',
    description: 'High-speed passenger maglev transit bullet train',
    scale: 1.0,
    proceduralFallback: createFallbackTrain,
  },

  // 4. Buildings & Landmarks
  'buildings/hospital.glb': {
    id: 'hospital-complex',
    category: 'buildings',
    path: 'buildings/hospital.glb',
    name: 'Neo-Genesis Hospital Complex',
    description: 'State-of-the-art emergency medical trauma pavilion',
    scale: 1.0,
    proceduralFallback: () => createFallbackBuilding('Hospital', 0x0284c7),
  },
  'buildings/university.glb': {
    id: 'university-academy',
    category: 'buildings',
    path: 'buildings/university.glb',
    name: 'Neo-Metropolis Quantum University',
    description: 'Advanced research and cybernetics research academy',
    scale: 1.0,
    proceduralFallback: () => createFallbackBuilding('University', 0x4f46e5),
  },
  'buildings/mohit-hub.glb': {
    id: 'mohit-hub-landmark',
    category: 'buildings',
    path: 'buildings/mohit-hub.glb',
    name: 'MOHIT DEVELOPER HUB Landmark',
    description: 'Futuristic glass tower and innovation command center',
    scale: 1.0,
    proceduralFallback: () => createFallbackBuilding('MohitHub', 0x06b6d4),
  },

  // 5. Environment & Props
  'props/street-lamp.glb': {
    id: 'street-lamp',
    category: 'props',
    path: 'props/street-lamp.glb',
    name: 'Smart Street Lamp',
    description: 'Solar-integrated LED smart light pole',
    scale: 1.0,
    proceduralFallback: () => {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.16, 7.5, 6),
        new THREE.MeshStandardMaterial({ color: 0x475569 })
      );
      pole.position.y = 3.75;
      return pole;
    },
  },
  'props/bus-shelter.glb': {
    id: 'bus-shelter',
    category: 'props',
    path: 'props/bus-shelter.glb',
    name: 'Holographic Bus Shelter',
    description: 'Commuter shelter with transit schedule display',
    scale: 1.0,
    proceduralFallback: () => {
      const shelter = new THREE.Mesh(
        new THREE.BoxGeometry(5.5, 3.2, 2.5),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, transparent: true, opacity: 0.85 })
      );
      shelter.position.y = 1.6;
      return shelter;
    },
  },
};
