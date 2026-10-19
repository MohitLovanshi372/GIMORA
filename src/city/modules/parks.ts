/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface ParksSystem {
  group: THREE.Group;
  update: (time: number) => void;
  dispose: () => void;
}

export function createCityParks(scene: THREE.Scene): ParksSystem {
  const group = new THREE.Group();
  group.name = 'parks_system';

  // Shared Realistic Park Materials
  const parkGrassMat = new THREE.MeshStandardMaterial({
    color: 0x2e6b2c, // Lush manicured lawn green
    roughness: 0.85,
    metalness: 0.05,
  });

  const pondMat = new THREE.MeshStandardMaterial({
    color: 0x0f3443, // Natural clear freshwater pond
    roughness: 0.15,
    metalness: 0.85,
  });

  const pondBorderMat = new THREE.MeshStandardMaterial({
    color: 0x475569, // Chiseled slate / granite curbing
    roughness: 0.7,
    metalness: 0.15,
  });

  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x4a3525, // Natural bark wood
    roughness: 0.9,
    metalness: 0.05,
  });

  const leafGreenMat = new THREE.MeshStandardMaterial({
    color: 0x2d6a2e, // Deep emerald foliage
    roughness: 0.75,
    metalness: 0.05,
  });
  const leafLimeMat = new THREE.MeshStandardMaterial({
    color: 0x417d38, // Fresh summer canopy
    roughness: 0.75,
    metalness: 0.05,
  });
  const leafAutumnMat = new THREE.MeshStandardMaterial({
    color: 0x365e2b, // Mature canopy green
    roughness: 0.75,
    metalness: 0.05,
  });

  // 1. Central Riverside Emerald Park (West Bank, near Central Bridge)
  const centralParkGeo = new THREE.BoxGeometry(45, 0.25, 90);
  const centralPark = new THREE.Mesh(centralParkGeo, parkGrassMat);
  centralPark.position.set(-68, 0.12, 0);
  centralPark.receiveShadow = true;
  group.add(centralPark);

  // Decorative Central Reflecting Pond
  const pondGeo = new THREE.CylinderGeometry(8, 8, 0.1, 16);
  const pond = new THREE.Mesh(pondGeo, pondMat);
  pond.position.set(-68, 0.26, 0);
  group.add(pond);

  // Pond glowing rim
  const pondRimGeo = new THREE.TorusGeometry(8.1, 0.2, 8, 24);
  pondRimGeo.rotateX(Math.PI / 2);
  const pondRim = new THREE.Mesh(pondRimGeo, pondBorderMat);
  pondRim.position.set(-68, 0.3, 0);
  group.add(pondRim);

  // 2. Tech District Cyber Arboretum (East Bank)
  const techParkGeo = new THREE.BoxGeometry(40, 0.25, 55);
  const techPark = new THREE.Mesh(techParkGeo, parkGrassMat);
  techPark.position.set(68, 0.12, -80);
  techPark.receiveShadow = true;
  group.add(techPark);

  // 3. Education District Bio-Dome Plaza (West Bank North)
  const eduParkGeo = new THREE.BoxGeometry(40, 0.25, 55);
  const eduPark = new THREE.Mesh(eduParkGeo, parkGrassMat);
  eduPark.position.set(-68, 0.12, -160);
  eduPark.receiveShadow = true;
  group.add(eduPark);

  // 4. Instanced Natural Trees (Oak, Maple & Pine species)
  const treeCount = 70;
  const trunkGeo = new THREE.CylinderGeometry(0.25, 0.45, 4.5, 6);
  const canopyGeo = new THREE.IcosahedronGeometry(2.2, 1);

  const instancedTrunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
  const instancedCanopyGreen = new THREE.InstancedMesh(canopyGeo, leafGreenMat, Math.floor(treeCount / 2));
  const instancedCanopyLime = new THREE.InstancedMesh(canopyGeo, leafLimeMat, Math.floor(treeCount / 2));

  const dummy = new THREE.Object3D();
  let tIdx = 0;
  let gIdx = 0;
  let cIdx = 0;

  // Tree locations
  const treeLocations: [number, number][] = [];

  // Around Central Park
  for (let x = -84; x <= -52; x += 9) {
    for (let z = -38; z <= 38; z += 13) {
      if (Math.hypot(x - -68, z) > 10) { // avoid pond center
        treeLocations.push([x, z]);
      }
    }
  }

  // Around Tech Arboretum
  for (let x = 52; x <= 84; x += 11) {
    for (let z = -102; z <= -58; z += 12) {
      treeLocations.push([x, z]);
    }
  }

  // Around Education Park
  for (let x = -84; x <= -52; x += 11) {
    for (let z = -182; z <= -138; z += 12) {
      treeLocations.push([x, z]);
    }
  }

  treeLocations.slice(0, treeCount).forEach(([tx, tz]) => {
    // Trunk
    dummy.position.set(tx, 2.25, tz);
    dummy.scale.set(1, 1, 1);
    dummy.rotation.set(0, Math.random() * Math.PI, 0);
    dummy.updateMatrix();
    instancedTrunks.setMatrixAt(tIdx, dummy.matrix);

    // Foliage canopy
    dummy.position.set(tx, 4.6, tz);
    const scale = 0.85 + Math.random() * 0.45;
    dummy.scale.set(scale, scale * 1.1, scale);
    dummy.updateMatrix();

    if (tIdx % 2 === 0 && gIdx < instancedCanopyGreen.count) {
      instancedCanopyGreen.setMatrixAt(gIdx++, dummy.matrix);
    } else if (cIdx < instancedCanopyLime.count) {
      instancedCanopyLime.setMatrixAt(cIdx++, dummy.matrix);
    }
    tIdx++;
  });

  instancedTrunks.instanceMatrix.needsUpdate = true;
  instancedCanopyGreen.instanceMatrix.needsUpdate = true;
  instancedCanopyLime.instanceMatrix.needsUpdate = true;

  group.add(instancedTrunks);
  group.add(instancedCanopyGreen);
  group.add(instancedCanopyLime);

  scene.add(group);

  const update = (_time: number) => {
    // Realistic steady environment
  };

  const dispose = () => {
    scene.remove(group);
    centralParkGeo.dispose();
    techParkGeo.dispose();
    eduParkGeo.dispose();
    parkGrassMat.dispose();
    pondGeo.dispose();
    pondMat.dispose();
    pondRimGeo.dispose();
    pondBorderMat.dispose();
    trunkGeo.dispose();
    canopyGeo.dispose();
    trunkMat.dispose();
    leafGreenMat.dispose();
    leafLimeMat.dispose();
    leafAutumnMat.dispose();
  };

  return {
    group,
    update,
    dispose,
  };
}
