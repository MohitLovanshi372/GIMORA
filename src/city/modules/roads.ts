/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface RoadSystem {
  group: THREE.Group;
  bridgeMeshes: THREE.Group[];
  update: (time: number) => void;
  dispose: () => void;
}

export function createCityRoads(scene: THREE.Scene): RoadSystem {
  const group = new THREE.Group();
  group.name = 'road_system';

  // Reusable materials
  const asphaltMat = new THREE.MeshStandardMaterial({
    color: 0x0a0e16,
    roughness: 0.75,
    metalness: 0.2,
  });

  const sidewalkMat = new THREE.MeshStandardMaterial({
    color: 0x181f2c,
    roughness: 0.85,
    metalness: 0.15,
  });

  const neonCyanLineMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.9,
  });

  const neonAmberLineMat = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0.9,
  });

  const bridgePylonMat = new THREE.MeshStandardMaterial({
    color: 0x1a2233,
    metalness: 0.8,
    roughness: 0.3,
  });

  const neonCableMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
  });

  const bridgeMeshes: THREE.Group[] = [];

  // 1. GROUND PLANE / CITY FOUNDATION
  const groundGeo = new THREE.PlaneGeometry(600, 600);
  groundGeo.rotateX(-Math.PI / 2);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x05070c,
    roughness: 0.95,
    metalness: 0.1,
  });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.position.y = -0.05;
  groundMesh.receiveShadow = true;
  group.add(groundMesh);

  // Helper function to build a road strip with sidewalks and glowing lane markings
  const createRoadStrip = (
    x: number,
    z: number,
    length: number,
    width: number,
    rotationY: number = 0,
    hasDivider: boolean = true
  ) => {
    const roadGroup = new THREE.Group();
    roadGroup.position.set(x, 0.02, z);
    roadGroup.rotation.y = rotationY;

    // Road surface
    const roadGeo = new THREE.PlaneGeometry(width, length);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMesh = new THREE.Mesh(roadGeo, asphaltMat);
    roadMesh.receiveShadow = true;
    roadGroup.add(roadMesh);

    // Sidewalks on left and right
    const sidewalkWidth = 3.5;
    const sidewalkHeight = 0.2;
    const curbGeo = new THREE.BoxGeometry(sidewalkWidth, sidewalkHeight, length);

    // Left Sidewalk
    const leftCurb = new THREE.Mesh(curbGeo, sidewalkMat);
    leftCurb.position.set(-width / 2 - sidewalkWidth / 2, sidewalkHeight / 2, 0);
    leftCurb.receiveShadow = true;
    roadGroup.add(leftCurb);

    // Right Sidewalk
    const rightCurb = new THREE.Mesh(curbGeo, sidewalkMat);
    rightCurb.position.set(width / 2 + sidewalkWidth / 2, sidewalkHeight / 2, 0);
    rightCurb.receiveShadow = true;
    roadGroup.add(rightCurb);

    // Neon center line markings
    if (hasDivider) {
      const lineCount = Math.floor(length / 8);
      const dashLength = 4;
      const dashWidth = 0.35;
      const dashGeo = new THREE.PlaneGeometry(dashWidth, dashLength);
      dashGeo.rotateX(-Math.PI / 2);

      const instancedDashes = new THREE.InstancedMesh(dashGeo, neonCyanLineMat, lineCount);
      const dummy = new THREE.Object3D();

      for (let i = 0; i < lineCount; i++) {
        const offsetZ = -length / 2 + i * 8 + 4;
        dummy.position.set(0, 0.03, offsetZ);
        dummy.updateMatrix();
        instancedDashes.setMatrixAt(i, dummy.matrix);
      }
      instancedDashes.instanceMatrix.needsUpdate = true;
      roadGroup.add(instancedDashes);

      // Outer road border edge glows (Amber)
      const borderLineGeo = new THREE.PlaneGeometry(0.2, length);
      borderLineGeo.rotateX(-Math.PI / 2);

      const leftBorder = new THREE.Mesh(borderLineGeo, neonAmberLineMat);
      leftBorder.position.set(-width / 2 + 0.3, 0.03, 0);
      roadGroup.add(leftBorder);

      const rightBorder = new THREE.Mesh(borderLineGeo, neonAmberLineMat);
      rightBorder.position.set(width / 2 - 0.3, 0.03, 0);
      roadGroup.add(rightBorder);
    }

    group.add(roadGroup);
  };

  // 2. PRIMARY ROAD NETWORK
  // West Bank North-South Avenues
  createRoadStrip(-180, 0, 560, 14); // West Outer Avenue
  createRoadStrip(-100, 0, 560, 16); // West Central Avenue
  createRoadStrip(-45, 0, 560, 14);  // West Riverside Parkway

  // East Bank North-South Avenues
  createRoadStrip(45, 0, 560, 14);   // East Riverside Parkway
  createRoadStrip(100, 0, 560, 16);  // East Central Avenue
  createRoadStrip(180, 0, 560, 14);  // East Outer Avenue

  // East-West Connecting Streets (West Side: from X = -240 to -35)
  [-220, -160, -90, 0, 90, 160, 220].forEach((zPos) => {
    createRoadStrip(-135, zPos, 200, 14, Math.PI / 2);
    createRoadStrip(135, zPos, 200, 14, Math.PI / 2);
  });

  // 3. ROAD BRIDGES CROSSING THE RIVER
  // Three iconic bridge types across the river:
  // Bridge 1: North Cable-Stayed Cyber Suspension Bridge (Z = -160)
  // Bridge 2: Central Grand Neon Boulevard Arch Bridge (Z = 0)
  // Bridge 3: South High-Speed Expressway Flyover Bridge (Z = 160)

  const bridgeSpan = 74; // from X = -37 to X = 37
  const bridgeWidth = 18;

  // --- BRIDGE 1: North Cable-Stayed Bridge (Z = -160) ---
  const northBridge = new THREE.Group();
  northBridge.position.set(0, 0.4, -160);

  // Road deck
  const deckGeo = new THREE.BoxGeometry(bridgeSpan, 1.2, bridgeWidth);
  const deckMesh = new THREE.Mesh(deckGeo, asphaltMat);
  deckMesh.receiveShadow = true;
  deckMesh.castShadow = true;
  northBridge.add(deckMesh);

  // Deck edge neon glowing strips
  const edgeGeo = new THREE.BoxGeometry(bridgeSpan, 0.4, 0.4);
  const leftEdge = new THREE.Mesh(edgeGeo, neonCyanLineMat);
  leftEdge.position.set(0, 0.7, -bridgeWidth / 2);
  northBridge.add(leftEdge);

  const rightEdge = new THREE.Mesh(edgeGeo, neonCyanLineMat);
  rightEdge.position.set(0, 0.7, bridgeWidth / 2);
  northBridge.add(rightEdge);

  // Center glowing road lines
  const bridgeLineGeo = new THREE.PlaneGeometry(bridgeSpan, 0.35);
  bridgeLineGeo.rotateX(-Math.PI / 2);
  const bridgeLine = new THREE.Mesh(bridgeLineGeo, neonAmberLineMat);
  bridgeLine.position.y = 0.62;
  northBridge.add(bridgeLine);

  // Twin A-Frame Pylons (West and East near river edges)
  [-22, 22].forEach((pylonX) => {
    const pylonHeight = 36;
    const pylonGeo = new THREE.ConeGeometry(2.4, pylonHeight, 4);
    const pylon = new THREE.Mesh(pylonGeo, bridgePylonMat);
    pylon.position.set(pylonX, pylonHeight / 2 - 2, 0);
    pylon.castShadow = true;
    northBridge.add(pylon);

    // Glowing spire tip
    const spireGeo = new THREE.CylinderGeometry(0.2, 0.6, 6, 8);
    const spire = new THREE.Mesh(spireGeo, neonCyanLineMat);
    spire.position.set(pylonX, pylonHeight + 1, 0);
    northBridge.add(spire);

    // Stay cables extending from pylon tip to road deck
    [-34, -28, -16, -8, 8, 16, 28, 34].forEach((cableDeckX) => {
      if (Math.abs(cableDeckX - pylonX) > 4) {
        const cableStart = new THREE.Vector3(pylonX, pylonHeight - 4, 0);
        const cableEnd = new THREE.Vector3(cableDeckX, 0.6, (cableDeckX % 2 === 0 ? 1 : -1) * (bridgeWidth / 2 - 0.5));
        const dir = new THREE.Vector3().subVectors(cableEnd, cableStart);
        const cableLength = dir.length();
        const cableGeo = new THREE.CylinderGeometry(0.08, 0.08, cableLength, 4);
        cableGeo.translate(0, cableLength / 2, 0);
        cableGeo.rotateX(Math.PI / 2);

        const cable = new THREE.Mesh(cableGeo, neonCableMat);
        cable.position.copy(cableStart);
        cable.lookAt(cableEnd);
        northBridge.add(cable);
      }
    });
  });

  group.add(northBridge);
  bridgeMeshes.push(northBridge);

  // --- BRIDGE 2: Central Grand Neon Boulevard Arch Bridge (Z = 0) ---
  const centralBridge = new THREE.Group();
  centralBridge.position.set(0, 0.4, 0);

  const centralDeck = new THREE.Mesh(deckGeo, asphaltMat);
  centralDeck.receiveShadow = true;
  centralDeck.castShadow = true;
  centralBridge.add(centralDeck);

  const centralLine = new THREE.Mesh(bridgeLineGeo, neonCyanLineMat);
  centralLine.position.y = 0.62;
  centralBridge.add(centralLine);

  // Massive glowing arches on North and South sides of the deck
  [-bridgeWidth / 2 - 0.5, bridgeWidth / 2 + 0.5].forEach((archZ) => {
    const archRadius = 38;
    // Semi-circle curved tubular arch
    const archGeo = new THREE.TorusGeometry(archRadius, 0.9, 8, 32, Math.PI);
    const archMesh = new THREE.Mesh(archGeo, bridgePylonMat);
    archMesh.position.set(0, -18, archZ);
    archMesh.rotation.z = Math.PI;
    archMesh.castShadow = true;
    centralBridge.add(archMesh);

    // Glowing neon highlight curve
    const neonArch = new THREE.Mesh(new THREE.TorusGeometry(archRadius, 0.35, 6, 32, Math.PI), neonCyanLineMat);
    neonArch.position.set(0, -18, archZ);
    neonArch.rotation.z = Math.PI;
    centralBridge.add(neonArch);

    // Vertical suspenders
    for (let x = -28; x <= 28; x += 7) {
      const heightAtX = Math.sqrt(Math.max(0, archRadius * archRadius - x * x)) - 18;
      if (heightAtX > 1) {
        const suspGeo = new THREE.CylinderGeometry(0.12, 0.12, heightAtX, 4);
        const susp = new THREE.Mesh(suspGeo, neonCableMat);
        susp.position.set(x, heightAtX / 2, archZ);
        centralBridge.add(susp);
      }
    }
  });

  group.add(centralBridge);
  bridgeMeshes.push(centralBridge);

  // --- BRIDGE 3: South Expressway Flyover Bridge (Z = 160) ---
  const southBridge = new THREE.Group();
  southBridge.position.set(0, 0.4, 160);

  const southDeck = new THREE.Mesh(deckGeo, asphaltMat);
  southDeck.receiveShadow = true;
  southDeck.castShadow = true;
  southBridge.add(southDeck);

  const southLine = new THREE.Mesh(bridgeLineGeo, neonAmberLineMat);
  southLine.position.y = 0.62;
  southBridge.add(southLine);

  // Glowing aerodynamic concrete support piers under the deck
  [-24, 0, 24].forEach((pierX) => {
    const pierGeo = new THREE.BoxGeometry(3, 4.2, bridgeWidth + 2);
    const pier = new THREE.Mesh(pierGeo, bridgePylonMat);
    pier.position.set(pierX, -1.8, 0);
    pier.receiveShadow = true;
    pier.castShadow = true;
    southBridge.add(pier);

    // Glowing neon strip along pier waterline
    const ringGeo = new THREE.BoxGeometry(3.3, 0.35, bridgeWidth + 2.3);
    const ring = new THREE.Mesh(ringGeo, neonCyanLineMat);
    ring.position.set(pierX, -1.2, 0);
    southBridge.add(ring);
  });

  // Glowing futuristic barrier rails (Magenta / Violet)
  const southNeonMat = new THREE.MeshBasicMaterial({ color: 0xff00aa });
  const southRailL = new THREE.Mesh(edgeGeo, southNeonMat);
  southRailL.position.set(0, 0.8, -bridgeWidth / 2);
  southBridge.add(southRailL);

  const southRailR = new THREE.Mesh(edgeGeo, southNeonMat);
  southRailR.position.set(0, 0.8, bridgeWidth / 2);
  southBridge.add(southRailR);

  group.add(southBridge);
  bridgeMeshes.push(southBridge);

  // 4. INSTANCED STREET LIGHTS ALONG ROADS
  const streetLightCount = 120;
  const poleGeo = new THREE.CylinderGeometry(0.18, 0.25, 7.5, 6);
  const armGeo = new THREE.BoxGeometry(2.5, 0.2, 0.3);
  const headGeo = new THREE.BoxGeometry(1.2, 0.25, 0.6);
  const headGlowGeo = new THREE.BoxGeometry(1.0, 0.15, 0.5);

  const poleMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8 });
  const streetLightGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

  const instancedPoles = new THREE.InstancedMesh(poleGeo, poleMat, streetLightCount);
  const instancedHeads = new THREE.InstancedMesh(headGeo, poleMat, streetLightCount);
  const instancedGlows = new THREE.InstancedMesh(headGlowGeo, streetLightGlowMat, streetLightCount);

  const dummy = new THREE.Object3D();
  let slIdx = 0;

  // Distribute along main avenue margins
  const lightAvenues = [-188, -172, -108, -92, 92, 108, 172, 188];
  lightAvenues.forEach((xPos) => {
    for (let z = -240; z <= 240; z += 35) {
      if (slIdx < streetLightCount) {
        dummy.position.set(xPos, 3.75, z);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        instancedPoles.setMatrixAt(slIdx, dummy.matrix);

        const facing = xPos < 0 ? (xPos % 20 < -180 ? 1 : -1) : (xPos % 20 > 180 ? -1 : 1);
        dummy.position.set(xPos + facing * 1.0, 7.5, z);
        dummy.rotation.set(0, facing > 0 ? 0 : Math.PI, 0);
        dummy.updateMatrix();
        instancedHeads.setMatrixAt(slIdx, dummy.matrix);

        dummy.position.set(xPos + facing * 1.0, 7.35, z);
        dummy.updateMatrix();
        instancedGlows.setMatrixAt(slIdx, dummy.matrix);

        slIdx++;
      }
    }
  });

  instancedPoles.instanceMatrix.needsUpdate = true;
  instancedHeads.instanceMatrix.needsUpdate = true;
  instancedGlows.instanceMatrix.needsUpdate = true;

  group.add(instancedPoles);
  group.add(instancedHeads);
  group.add(instancedGlows);

  // 5. TRAFFIC SIGNALS & INTERSECTIONS
  const signalGantries = [
    [-100, -160], [-100, 0], [-100, 160],
    [100, -160], [100, 0], [100, 160],
    [-180, 0], [180, 0]
  ];

  const gantryPostGeo = new THREE.CylinderGeometry(0.2, 0.25, 8.5, 8);
  const gantryArmGeo = new THREE.BoxGeometry(14, 0.35, 0.35);
  const signalBoxGeo = new THREE.BoxGeometry(0.8, 1.8, 0.6);
  const signalLampGeo = new THREE.SphereGeometry(0.2, 8, 8);

  const signalGreenMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
  const signalRedMat = new THREE.MeshBasicMaterial({ color: 0xff3355 });

  signalGantries.forEach(([gx, gz], idx) => {
    const gantry = new THREE.Group();
    gantry.position.set(gx, 0, gz);

    const post = new THREE.Mesh(gantryPostGeo, poleMat);
    post.position.set(7.5, 4.25, 0);
    gantry.add(post);

    const arm = new THREE.Mesh(gantryArmGeo, poleMat);
    arm.position.set(0, 8.0, 0);
    gantry.add(arm);

    // 2 Signal Heads hanging
    [-3, 3].forEach((headX) => {
      const box = new THREE.Mesh(signalBoxGeo, poleMat);
      box.position.set(headX, 6.8, 0);
      gantry.add(box);

      const lamp = new THREE.Mesh(signalLampGeo, idx % 2 === 0 ? signalGreenMat : signalRedMat);
      lamp.position.set(headX, 6.8, 0.35);
      gantry.add(lamp);
    });

    group.add(gantry);
  });

  scene.add(group);

  const update = (time: number) => {
    // Gentle pulse on bridge neon cables and road markings
    const pulse = Math.sin(time * 3) * 0.15 + 0.85;
    neonCyanLineMat.opacity = pulse;
    neonAmberLineMat.opacity = pulse;
  };

  const dispose = () => {
    scene.remove(group);
    groundGeo.dispose();
    groundMat.dispose();
    asphaltMat.dispose();
    sidewalkMat.dispose();
    neonCyanLineMat.dispose();
    neonAmberLineMat.dispose();
    bridgePylonMat.dispose();
    neonCableMat.dispose();
    poleGeo.dispose();
    armGeo.dispose();
    headGeo.dispose();
    headGlowGeo.dispose();
    poleMat.dispose();
    streetLightGlowMat.dispose();
  };

  return {
    group,
    bridgeMeshes,
    update,
    dispose,
  };
}
