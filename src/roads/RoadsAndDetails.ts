/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CityMaterials } from '../assets/materials';
import { createLightPoolDecalTexture, createRoadArrowTexture } from '../assets/textures';

export interface RoadsAndDetailsSystem {
  group: THREE.Group;
  bridgeMeshes: THREE.Group[];
  update: (time: number) => void;
  dispose: () => void;
}

export function createRoadsAndDetails(
  scene: THREE.Scene,
  materials: CityMaterials
): RoadsAndDetailsSystem {
  const group = new THREE.Group();
  group.name = 'roads_and_details_system';

  const bridgeMeshes: THREE.Group[] = [];

  // 1. GROUND PLANE
  const groundGeo = new THREE.PlaneGeometry(620, 620);
  groundGeo.rotateX(-Math.PI / 2);
  const groundMesh = new THREE.Mesh(groundGeo, materials.metalDark);
  groundMesh.position.y = -0.05;
  groundMesh.receiveShadow = true;
  group.add(groundMesh);

  // Helper to build road strip with sidewalks and glowing lane markings
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
    const roadMesh = new THREE.Mesh(roadGeo, materials.asphalt);
    roadMesh.receiveShadow = true;
    roadGroup.add(roadMesh);

    // Sidewalks on left and right
    const sidewalkWidth = 3.5;
    const sidewalkHeight = 0.2;
    const curbGeo = new THREE.BoxGeometry(sidewalkWidth, sidewalkHeight, length);

    const leftCurb = new THREE.Mesh(curbGeo, materials.sidewalk);
    leftCurb.position.set(-width / 2 - sidewalkWidth / 2, sidewalkHeight / 2, 0);
    leftCurb.receiveShadow = true;
    roadGroup.add(leftCurb);

    const rightCurb = new THREE.Mesh(curbGeo, materials.sidewalk);
    rightCurb.position.set(width / 2 + sidewalkWidth / 2, sidewalkHeight / 2, 0);
    rightCurb.receiveShadow = true;
    roadGroup.add(rightCurb);

    // Neon center dashes
    if (hasDivider) {
      const lineCount = Math.floor(length / 8);
      const dashGeo = new THREE.PlaneGeometry(0.35, 4);
      dashGeo.rotateX(-Math.PI / 2);
      const instancedDashes = new THREE.InstancedMesh(dashGeo, materials.neonCyan, lineCount);
      const dummy = new THREE.Object3D();

      for (let i = 0; i < lineCount; i++) {
        dummy.position.set(0, 0.03, -length / 2 + i * 8 + 4);
        dummy.updateMatrix();
        instancedDashes.setMatrixAt(i, dummy.matrix);
      }
      instancedDashes.instanceMatrix.needsUpdate = true;
      roadGroup.add(instancedDashes);

      // Outer amber road borders
      const borderLineGeo = new THREE.PlaneGeometry(0.2, length);
      borderLineGeo.rotateX(-Math.PI / 2);

      const leftBorder = new THREE.Mesh(borderLineGeo, materials.neonAmber);
      leftBorder.position.set(-width / 2 + 0.3, 0.03, 0);
      roadGroup.add(leftBorder);

      const rightBorder = new THREE.Mesh(borderLineGeo, materials.neonAmber);
      rightBorder.position.set(width / 2 - 0.3, 0.03, 0);
      roadGroup.add(rightBorder);
    }

    group.add(roadGroup);
  };

  // 2. PRIMARY ROAD NETWORK
  // West Bank North-South Avenues
  createRoadStrip(-180, 0, 560, 14);
  createRoadStrip(-100, 0, 560, 16);
  createRoadStrip(-45, 0, 560, 14);

  // East Bank North-South Avenues
  createRoadStrip(45, 0, 560, 14);
  createRoadStrip(100, 0, 560, 16);
  createRoadStrip(180, 0, 560, 14);

  // Connecting East-West Streets
  [-220, -160, -90, 0, 90, 160, 220].forEach((zPos) => {
    createRoadStrip(-135, zPos, 200, 14, Math.PI / 2);
    createRoadStrip(135, zPos, 200, 14, Math.PI / 2);
  });

  // 3. ROAD BRIDGES CROSSING THE RIVER
  const bridgeSpan = 74;
  const bridgeWidth = 18;
  const deckGeo = new THREE.BoxGeometry(bridgeSpan, 1.2, bridgeWidth);
  const bridgeLineGeo = new THREE.PlaneGeometry(bridgeSpan, 0.35);
  bridgeLineGeo.rotateX(-Math.PI / 2);
  const edgeGeo = new THREE.BoxGeometry(bridgeSpan, 0.4, 0.4);

  // BRIDGE 1: North Cable-Stayed Bridge (Z = -160)
  const northBridge = new THREE.Group();
  northBridge.position.set(0, 0.4, -160);
  const deck1 = new THREE.Mesh(deckGeo, materials.asphalt);
  deck1.castShadow = true;
  northBridge.add(deck1);

  const line1 = new THREE.Mesh(bridgeLineGeo, materials.neonAmber);
  line1.position.y = 0.62;
  northBridge.add(line1);

  [-bridgeWidth / 2, bridgeWidth / 2].forEach((bz) => {
    const edge = new THREE.Mesh(edgeGeo, materials.neonCyan);
    edge.position.set(0, 0.7, bz);
    northBridge.add(edge);
  });

  [-22, 22].forEach((pylonX) => {
    const pylonHeight = 36;
    const pylon = new THREE.Mesh(new THREE.ConeGeometry(2.4, pylonHeight, 4), materials.metalLight);
    pylon.position.set(pylonX, pylonHeight / 2 - 2, 0);
    pylon.castShadow = true;
    northBridge.add(pylon);

    // Stay cables
    [-34, -28, -16, -8, 8, 16, 28, 34].forEach((cableX) => {
      if (Math.abs(cableX - pylonX) > 4) {
        const start = new THREE.Vector3(pylonX, pylonHeight - 4, 0);
        const end = new THREE.Vector3(cableX, 0.6, (cableX % 2 === 0 ? 1 : -1) * (bridgeWidth / 2 - 0.5));
        const dir = new THREE.Vector3().subVectors(end, start);
        const cLen = dir.length();
        const cableGeo = new THREE.CylinderGeometry(0.08, 0.08, cLen, 4);
        cableGeo.translate(0, cLen / 2, 0);
        cableGeo.rotateX(Math.PI / 2);
        const cable = new THREE.Mesh(cableGeo, materials.neonCyan);
        cable.position.copy(start);
        cable.lookAt(end);
        northBridge.add(cable);
      }
    });
  });
  group.add(northBridge);
  bridgeMeshes.push(northBridge);

  // BRIDGE 2: Central Grand Neon Boulevard Arch Bridge (Z = 0)
  const centralBridge = new THREE.Group();
  centralBridge.position.set(0, 0.4, 0);
  const deck2 = new THREE.Mesh(deckGeo, materials.asphalt);
  deck2.castShadow = true;
  centralBridge.add(deck2);

  const line2 = new THREE.Mesh(bridgeLineGeo, materials.neonCyan);
  line2.position.y = 0.62;
  centralBridge.add(line2);

  // Outer neon bridge deck glow strips
  const deckGlowNorth = new THREE.Mesh(new THREE.BoxGeometry(bridgeSpan, 0.35, 0.35), materials.neonCyan);
  deckGlowNorth.position.set(0, 0.65, -bridgeWidth / 2);
  centralBridge.add(deckGlowNorth);

  const deckGlowSouth = new THREE.Mesh(new THREE.BoxGeometry(bridgeSpan, 0.35, 0.35), materials.neonPink);
  deckGlowSouth.position.set(0, 0.65, bridgeWidth / 2);
  centralBridge.add(deckGlowSouth);

  [-bridgeWidth / 2 - 0.5, bridgeWidth / 2 + 0.5].forEach((archZ) => {
    const archRadius = 38;
    const archMesh = new THREE.Mesh(new THREE.TorusGeometry(archRadius, 0.9, 8, 32, Math.PI), materials.metalLight);
    archMesh.position.set(0, -18, archZ);
    archMesh.rotation.z = Math.PI;
    archMesh.castShadow = true;
    centralBridge.add(archMesh);

    const neonArch = new THREE.Mesh(new THREE.TorusGeometry(archRadius, 0.35, 6, 32, Math.PI), materials.neonCyan);
    neonArch.position.set(0, -18, archZ);
    neonArch.rotation.z = Math.PI;
    centralBridge.add(neonArch);

    // Vertical suspension hanger cables from arch to deck
    for (let hx = -32; hx <= 32; hx += 4) {
      const archH = -18 + Math.sqrt(Math.max(0, archRadius * archRadius - hx * hx));
      const hangerH = archH - 0.6;
      if (hangerH > 0.8) {
        const suspGeo = new THREE.CylinderGeometry(0.06, 0.06, hangerH, 4);
        const susp = new THREE.Mesh(suspGeo, materials.neonCyan);
        susp.position.set(hx, 0.6 + hangerH / 2, archZ);
        centralBridge.add(susp);
      }
    }
  });

  // Massive River Piers anchored into the riverbed
  [-24, 24].forEach((px) => {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(4.4, 5.5, bridgeWidth + 4), materials.metalDark);
    pier.position.set(px, -2.2, 0);
    pier.castShadow = true;
    centralBridge.add(pier);

    // Hazard Navigation Beacons (Red on piers)
    const redBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), materials.neonRed);
    redBeacon.position.set(px, 0.4, bridgeWidth / 2 + 1.8);
    centralBridge.add(redBeacon);
  });

  // Green Navigation Clearance Beacon under center of bridge
  const greenBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), materials.neonEmerald);
  greenBeacon.position.set(0, -0.8, 0);
  centralBridge.add(greenBeacon);

  group.add(centralBridge);
  bridgeMeshes.push(centralBridge);

  // BRIDGE 3: South Expressway Flyover Bridge (Z = 160)
  const southBridge = new THREE.Group();
  southBridge.position.set(0, 0.4, 160);
  const deck3 = new THREE.Mesh(deckGeo, materials.asphalt);
  deck3.castShadow = true;
  southBridge.add(deck3);

  const line3 = new THREE.Mesh(bridgeLineGeo, materials.neonAmber);
  line3.position.y = 0.62;
  southBridge.add(line3);

  [-24, 0, 24].forEach((px) => {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(3, 4.2, bridgeWidth + 2), materials.metalDark);
    pier.position.set(px, -1.8, 0);
    pier.castShadow = true;
    southBridge.add(pier);
  });
  group.add(southBridge);
  bridgeMeshes.push(southBridge);

  // 4. CROSSWALKS AT MAJOR INTERSECTIONS
  const intersectionPoints = [
    [-100, -160], [-100, 0], [-100, 160],
    [100, -160], [100, 0], [100, 160],
    [-180, 0], [180, 0]
  ];

  const crosswalkStripeGeo = new THREE.PlaneGeometry(0.8, 4.2);
  crosswalkStripeGeo.rotateX(-Math.PI / 2);
  const crosswalkMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });

  intersectionPoints.forEach(([ix, iz]) => {
    const cwGroup = new THREE.Group();
    cwGroup.position.set(ix, 0.04, iz);

    // 4 Crosswalks (North, South, East, West around the intersection box)
    [-10, 10].forEach((distZ) => {
      for (let s = -5; s <= 5; s += 1.8) {
        const stripe = new THREE.Mesh(crosswalkStripeGeo, crosswalkMat);
        stripe.position.set(s, 0, distZ);
        cwGroup.add(stripe);
      }
    });

    [-10, 10].forEach((distX) => {
      for (let s = -5; s <= 5; s += 1.8) {
        const stripe = new THREE.Mesh(crosswalkStripeGeo, crosswalkMat);
        stripe.position.set(distX, 0, s);
        stripe.rotation.y = Math.PI / 2;
        cwGroup.add(stripe);
      }
    });

    // Road Directional Approach Arrows
    const arrowStraightTex = createRoadArrowTexture('straight');
    const arrowStraightMat = new THREE.MeshBasicMaterial({
      map: arrowStraightTex,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
    const arrowGeo = new THREE.PlaneGeometry(1.8, 3.6);
    arrowGeo.rotateX(-Math.PI / 2);

    [-22, 22].forEach((offsetZ) => {
      const arrow = new THREE.Mesh(arrowGeo, arrowStraightMat);
      arrow.position.set(3.5, 0.04, offsetZ);
      arrow.rotation.y = offsetZ > 0 ? Math.PI : 0;
      cwGroup.add(arrow);
    });
    [-22, 22].forEach((offsetX) => {
      const arrow = new THREE.Mesh(arrowGeo, arrowStraightMat);
      arrow.position.set(offsetX, 0.04, 3.5);
      arrow.rotation.y = offsetX > 0 ? -Math.PI / 2 : Math.PI / 2;
      cwGroup.add(arrow);
    });

    group.add(cwGroup);
  });

  // 5. TRAFFIC LIGHT GANTRIES
  const gantryPostGeo = new THREE.CylinderGeometry(0.2, 0.25, 8.5, 8);
  const gantryArmGeo = new THREE.BoxGeometry(14, 0.35, 0.35);
  const signalBoxGeo = new THREE.BoxGeometry(0.8, 1.8, 0.6);
  const signalLampGeo = new THREE.SphereGeometry(0.2, 8, 8);

  intersectionPoints.forEach(([gx, gz], idx) => {
    const gantry = new THREE.Group();
    gantry.position.set(gx, 0, gz);

    const post = new THREE.Mesh(gantryPostGeo, materials.metalLight);
    post.position.set(7.5, 4.25, 0);
    gantry.add(post);

    const arm = new THREE.Mesh(gantryArmGeo, materials.metalLight);
    arm.position.set(0, 8.0, 0);
    gantry.add(arm);

    [-3, 3].forEach((headX) => {
      const box = new THREE.Mesh(signalBoxGeo, materials.metalDark);
      box.position.set(headX, 6.8, 0);
      gantry.add(box);

      const lamp = new THREE.Mesh(signalLampGeo, idx % 2 === 0 ? materials.neonEmerald : materials.neonRed);
      lamp.position.set(headX, 6.8, 0.35);
      gantry.add(lamp);
    });

    group.add(gantry);
  });

  // 6. STREET SIGNS AT CORNERS
  const streetSignConfigs = [
    { text: 'NEXUS BOULEVARD', x: -100, z: -172 },
    { text: 'CYBER WAY', x: -100, z: 12 },
    { text: 'QUANTUM AVENUE', x: 100, z: -172 },
    { text: 'INNOVATION ROW', x: 100, z: 12 },
    { text: 'RIVERSIDE PARKWAY', x: -45, z: 12 },
    { text: 'ACADEMY DRIVE', x: -180, z: -172 },
  ];

  streetSignConfigs.forEach((cfg) => {
    const signGroup = new THREE.Group();
    signGroup.position.set(cfg.x, 0, cfg.z);

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.5, 6), materials.metalLight);
    post.position.y = 2.25;
    signGroup.add(post);

    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const sCtx = signCanvas.getContext('2d')!;
    sCtx.fillStyle = '#020617';
    sCtx.fillRect(0, 0, 512, 128);
    sCtx.strokeStyle = '#00f0ff';
    sCtx.lineWidth = 6;
    sCtx.strokeRect(4, 4, 504, 120);
    sCtx.font = 'bold 36px "Chakra Petch", monospace';
    sCtx.fillStyle = '#00f0ff';
    sCtx.textAlign = 'center';
    sCtx.fillText(cfg.text, 256, 75);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 0.9),
      new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide })
    );
    signPlate.position.set(0, 4.2, 0);
    signGroup.add(signPlate);

    group.add(signGroup);
  });

  // 7. CYBER BUS STOPS
  const busStopLocations = [
    [-92, -60], [-92, 60],
    [92, -60], [92, 60],
  ];

  busStopLocations.forEach(([bx, bz]) => {
    const shelterGroup = new THREE.Group();
    shelterGroup.position.set(bx, 0, bz);

    // Glass Canopy Shelter
    const shelterGeo = new THREE.BoxGeometry(6, 3.2, 2.5);
    const shelterMesh = new THREE.Mesh(shelterGeo, materials.glassCyan);
    shelterMesh.position.y = 1.6;
    shelterGroup.add(shelterMesh);

    // Waiting Bench
    const bench = new THREE.Mesh(new THREE.BoxGeometry(4, 0.4, 0.8), materials.metalLight);
    bench.position.set(0, 0.5, 0);
    shelterGroup.add(bench);

    // Glowing Bus Route Pillar
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 0.3), materials.neonCyan);
    pillar.position.set(2.8, 1.6, 1.1);
    shelterGroup.add(pillar);

    group.add(shelterGroup);
  });

  // 8. PARKING LOTS WITH CHARGING PYLONS
  const parkingLocations = [
    { x: -140, z: -90, w: 28, d: 24 },
    { x: 140, z: 90, w: 28, d: 24 },
  ];

  parkingLocations.forEach((pkg) => {
    const lotGroup = new THREE.Group();
    lotGroup.position.set(pkg.x, 0.03, pkg.z);

    const lotSurface = new THREE.Mesh(new THREE.PlaneGeometry(pkg.w, pkg.d).rotateX(-Math.PI / 2), materials.asphalt);
    lotGroup.add(lotSurface);

    // White parking stall stripes
    const stallGeo = new THREE.PlaneGeometry(0.2, 5.5).rotateX(-Math.PI / 2);
    for (let x = -pkg.w / 2 + 3; x <= pkg.w / 2 - 3; x += 3.2) {
      const stallL = new THREE.Mesh(stallGeo, materials.neonWhite);
      stallL.position.set(x, 0.02, -pkg.d / 4);
      lotGroup.add(stallL);

      const stallR = new THREE.Mesh(stallGeo, materials.neonWhite);
      stallR.position.set(x, 0.02, pkg.d / 4);
      lotGroup.add(stallR);
    }

    // EV Charging Pylons with green neon LEDs
    for (let x = -pkg.w / 2 + 3; x <= pkg.w / 2 - 3; x += 6.4) {
      const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.8, 0.4), materials.metalDark);
      pylon.position.set(x, 0.9, -pkg.d / 2 + 1);
      lotGroup.add(pylon);

      const led = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), materials.neonEmerald);
      led.position.set(x, 1.6, -pkg.d / 2 + 1.25);
      lotGroup.add(led);
    }

    group.add(lotGroup);
  });

  // 9. INSTANCED STREET LIGHTS WITH ROAD LIGHT POOLS
  const streetLightCount = 120;
  const poleGeo = new THREE.CylinderGeometry(0.18, 0.25, 7.5, 6);
  const headGeo = new THREE.BoxGeometry(1.2, 0.25, 0.6);
  const headGlowGeo = new THREE.BoxGeometry(1.0, 0.15, 0.5);

  const poolGeo = new THREE.PlaneGeometry(14, 14);
  poolGeo.rotateX(-Math.PI / 2);
  const poolTex = createLightPoolDecalTexture('#00f0ff');
  const poolMat = new THREE.MeshBasicMaterial({
    map: poolTex,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const instancedPoles = new THREE.InstancedMesh(poleGeo, materials.metalLight, streetLightCount);
  const instancedHeads = new THREE.InstancedMesh(headGeo, materials.metalLight, streetLightCount);
  const instancedGlows = new THREE.InstancedMesh(headGlowGeo, materials.neonCyan, streetLightCount);
  const instancedPools = new THREE.InstancedMesh(poolGeo, poolMat, streetLightCount);

  const dummy = new THREE.Object3D();
  let slIdx = 0;
  const lightAvenues = [-188, -172, -108, -92, 92, 108, 172, 188];

  lightAvenues.forEach((xPos) => {
    for (let z = -240; z <= 240; z += 35) {
      if (slIdx < streetLightCount) {
        dummy.position.set(xPos, 3.75, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        instancedPoles.setMatrixAt(slIdx, dummy.matrix);

        const facing = xPos < 0 ? 1 : -1;
        dummy.position.set(xPos + facing * 1.0, 7.5, z);
        dummy.rotation.set(0, facing > 0 ? 0 : Math.PI, 0);
        dummy.updateMatrix();
        instancedHeads.setMatrixAt(slIdx, dummy.matrix);

        dummy.position.set(xPos + facing * 1.0, 7.35, z);
        dummy.updateMatrix();
        instancedGlows.setMatrixAt(slIdx, dummy.matrix);

        // Ground light pool on asphalt directly under lamp
        dummy.position.set(xPos + facing * 4.5, 0.04, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        instancedPools.setMatrixAt(slIdx, dummy.matrix);

        slIdx++;
      }
    }
  });

  instancedPoles.instanceMatrix.needsUpdate = true;
  instancedHeads.instanceMatrix.needsUpdate = true;
  instancedGlows.instanceMatrix.needsUpdate = true;
  instancedPools.instanceMatrix.needsUpdate = true;
  group.add(instancedPoles);
  group.add(instancedHeads);
  group.add(instancedGlows);
  group.add(instancedPools);

  scene.add(group);

  const update = (time: number) => {
    // Pulse street markings
    materials.neonCyan.opacity = 0.85 + Math.sin(time * 3) * 0.15;
  };

  const dispose = () => {
    scene.remove(group);
    groundGeo.dispose();
    deckGeo.dispose();
    bridgeLineGeo.dispose();
    edgeGeo.dispose();
    crosswalkStripeGeo.dispose();
    crosswalkMat.dispose();
    gantryPostGeo.dispose();
    gantryArmGeo.dispose();
    signalBoxGeo.dispose();
    signalLampGeo.dispose();
    poleGeo.dispose();
    headGeo.dispose();
    headGlowGeo.dispose();
  };

  return {
    group,
    bridgeMeshes,
    update,
    dispose,
  };
}
