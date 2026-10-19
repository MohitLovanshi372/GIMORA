/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CityMaterials } from '../assets/materials';
import {
  createLightPoolDecalTexture,
  createRoadArrowTexture,
  createHighwayGantrySignTexture,
} from '../assets/textures';

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

  // 1. GROUND PLANE (Vast Metropolitan Expanse)
  const groundGeo = new THREE.PlaneGeometry(740, 740);
  groundGeo.rotateX(-Math.PI / 2);
  const groundMesh = new THREE.Mesh(groundGeo, materials.concrete);
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

    // Realistic highway reflective white center dashes
    if (hasDivider) {
      const lineCount = Math.floor(length / 8);
      const dashGeo = new THREE.PlaneGeometry(0.35, 4);
      dashGeo.rotateX(-Math.PI / 2);
      const instancedDashes = new THREE.InstancedMesh(dashGeo, materials.neonWhite, lineCount);
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
  createRoadStrip(-240, 0, 680, 14);
  createRoadStrip(-180, 0, 680, 14);
  createRoadStrip(-100, 0, 680, 16);
  createRoadStrip(-45, 0, 680, 14);

  // East Bank North-South Avenues
  createRoadStrip(45, 0, 680, 14);
  createRoadStrip(100, 0, 680, 16);
  createRoadStrip(180, 0, 680, 14);
  createRoadStrip(240, 0, 680, 14);

  // Connecting East-West Streets
  [-260, -220, -160, -90, 0, 90, 160, 220, 260].forEach((zPos) => {
    createRoadStrip(-145, zPos, 220, 14, Math.PI / 2);
    createRoadStrip(145, zPos, 220, 14, Math.PI / 2);
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
    const edge = new THREE.Mesh(edgeGeo, materials.metalDark);
    edge.position.set(0, 0.7, bz);
    northBridge.add(edge);
  });

  [-22, 22].forEach((pylonX) => {
    const pylonHeight = 36;
    const pylon = new THREE.Mesh(new THREE.ConeGeometry(2.4, pylonHeight, 4), materials.metalLight);
    pylon.position.set(pylonX, pylonHeight / 2 - 2, 0);
    pylon.castShadow = true;
    northBridge.add(pylon);

    // Stay cables (High-tensile structural steel)
    [-34, -28, -16, -8, 8, 16, 28, 34].forEach((cableX) => {
      if (Math.abs(cableX - pylonX) > 4) {
        const start = new THREE.Vector3(pylonX, pylonHeight - 4, 0);
        const end = new THREE.Vector3(cableX, 0.6, (cableX % 2 === 0 ? 1 : -1) * (bridgeWidth / 2 - 0.5));
        const dir = new THREE.Vector3().subVectors(end, start);
        const cLen = dir.length();
        const cableGeo = new THREE.CylinderGeometry(0.08, 0.08, cLen, 4);
        cableGeo.translate(0, cLen / 2, 0);
        cableGeo.rotateX(Math.PI / 2);
        const cable = new THREE.Mesh(cableGeo, materials.metalLight);
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

  const line2 = new THREE.Mesh(bridgeLineGeo, materials.neonWhite);
  line2.position.y = 0.62;
  centralBridge.add(line2);

  // Structural Steel Guardrails on both sides of bridge
  const guardrailGeo = new THREE.BoxGeometry(bridgeSpan, 0.9, 0.25);
  const guardrailNorth = new THREE.Mesh(guardrailGeo, materials.metalDark);
  guardrailNorth.position.set(0, 0.85, -bridgeWidth / 2 + 0.3);
  centralBridge.add(guardrailNorth);

  const guardrailSouth = new THREE.Mesh(guardrailGeo, materials.metalDark);
  guardrailSouth.position.set(0, 0.85, bridgeWidth / 2 - 0.3);
  centralBridge.add(guardrailSouth);

  [-bridgeWidth / 2 - 0.5, bridgeWidth / 2 + 0.5].forEach((archZ) => {
    const archRadius = 38;
    const archMesh = new THREE.Mesh(new THREE.TorusGeometry(archRadius, 0.9, 8, 32, Math.PI), materials.metalLight);
    archMesh.position.set(0, -18, archZ);
    archMesh.rotation.z = Math.PI;
    archMesh.castShadow = true;
    centralBridge.add(archMesh);

    // Vertical suspension hanger cables from steel arch to deck (structural steel)
    for (let hx = -32; hx <= 32; hx += 4) {
      const archH = -18 + Math.sqrt(Math.max(0, archRadius * archRadius - hx * hx));
      const hangerH = archH - 0.6;
      if (hangerH > 0.8) {
        const suspGeo = new THREE.CylinderGeometry(0.08, 0.08, hangerH, 6);
        const susp = new THREE.Mesh(suspGeo, materials.metalLight);
        susp.position.set(hx, 0.6 + hangerH / 2, archZ);
        centralBridge.add(susp);
      }
    }
  });

  // Massive River Piers anchored into the riverbed
  [-24, 24].forEach((px) => {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(4.4, 5.5, bridgeWidth + 4), materials.concrete);
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
    const pier = new THREE.Mesh(new THREE.BoxGeometry(3, 4.2, bridgeWidth + 2), materials.concrete);
    pier.position.set(px, -1.8, 0);
    pier.castShadow = true;
    southBridge.add(pier);
  });
  group.add(southBridge);
  bridgeMeshes.push(southBridge);

  // 3b. ELEVATED HIGHWAY FLYOVER & ACCESS RAMPS (Multi-Level Expressway Viaduct)
  const flyoverGroup = new THREE.Group();
  flyoverGroup.name = 'highway_flyover_system';

  const flyoverElevation = 9.0;
  const flyoverLength = 500;
  const flyoverWidth = 15;
  const flyoverX = 100;

  // Flyover Structural Concrete Deck
  const flyoverDeckGeo = new THREE.BoxGeometry(flyoverWidth, 1.4, flyoverLength);
  const flyoverDeck = new THREE.Mesh(flyoverDeckGeo, materials.concrete);
  flyoverDeck.position.set(flyoverX, flyoverElevation, 0);
  flyoverDeck.castShadow = true;
  flyoverDeck.receiveShadow = true;
  flyoverGroup.add(flyoverDeck);

  // Flyover Asphalt Road Surface
  const flyoverAsphaltGeo = new THREE.PlaneGeometry(flyoverWidth - 0.8, flyoverLength);
  flyoverAsphaltGeo.rotateX(-Math.PI / 2);
  const flyoverRoad = new THREE.Mesh(flyoverAsphaltGeo, materials.asphalt);
  flyoverRoad.position.set(flyoverX, flyoverElevation + 0.72, 0);
  flyoverRoad.receiveShadow = true;
  flyoverGroup.add(flyoverRoad);

  // Concrete Jersey Barriers on Left and Right Edges
  const barrierGeo = new THREE.BoxGeometry(0.5, 1.2, flyoverLength);
  const leftBarrier = new THREE.Mesh(barrierGeo, materials.concrete);
  leftBarrier.position.set(flyoverX - flyoverWidth / 2 + 0.25, flyoverElevation + 1.2, 0);
  flyoverGroup.add(leftBarrier);

  const rightBarrier = new THREE.Mesh(barrierGeo, materials.concrete);
  rightBarrier.position.set(flyoverX + flyoverWidth / 2 - 0.25, flyoverElevation + 1.2, 0);
  flyoverGroup.add(rightBarrier);

  // Structural Steel Guardrails along flyover outer barriers
  const guardGeo = new THREE.BoxGeometry(0.18, 0.4, flyoverLength);
  const leftGuard = new THREE.Mesh(guardGeo, materials.metalDark);
  leftGuard.position.set(flyoverX - flyoverWidth / 2 + 0.15, flyoverElevation + 1.6, 0);
  flyoverGroup.add(leftGuard);

  const rightGuard = new THREE.Mesh(guardGeo, materials.metalDark);
  rightGuard.position.set(flyoverX + flyoverWidth / 2 - 0.15, flyoverElevation + 1.6, 0);
  flyoverGroup.add(rightGuard);

  // Center Concrete Median Divider Barrier
  const medianBarrier = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.0, flyoverLength), materials.concrete);
  medianBarrier.position.set(flyoverX, flyoverElevation + 1.1, 0);
  flyoverGroup.add(medianBarrier);

  // Double Yellow Line along median
  const yellowLineGeo = new THREE.PlaneGeometry(0.2, flyoverLength);
  yellowLineGeo.rotateX(-Math.PI / 2);
  const medYellowL = new THREE.Mesh(yellowLineGeo, materials.neonAmber);
  medYellowL.position.set(flyoverX - 0.5, flyoverElevation + 0.73, 0);
  flyoverGroup.add(medYellowL);

  const medYellowR = new THREE.Mesh(yellowLineGeo, materials.neonAmber);
  medYellowR.position.set(flyoverX + 0.5, flyoverElevation + 0.73, 0);
  flyoverGroup.add(medYellowR);

  // Dashed White Highway Lane Divisors (2 lanes each direction)
  const laneDashCount = Math.floor(flyoverLength / 9);
  const flyoverDashGeo = new THREE.PlaneGeometry(0.3, 4.5);
  flyoverDashGeo.rotateX(-Math.PI / 2);
  const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const instancedFlyoverDashes = new THREE.InstancedMesh(flyoverDashGeo, dashMat, laneDashCount * 2);
  const dummyDash = new THREE.Object3D();
  let dIdx = 0;

  for (let i = 0; i < laneDashCount; i++) {
    const zPos = -flyoverLength / 2 + i * 9 + 4.5;
    // West lane divider (Southbound)
    dummyDash.position.set(flyoverX - 3.8, flyoverElevation + 0.73, zPos);
    dummyDash.updateMatrix();
    instancedFlyoverDashes.setMatrixAt(dIdx++, dummyDash.matrix);

    // East lane divider (Northbound)
    dummyDash.position.set(flyoverX + 3.8, flyoverElevation + 0.73, zPos);
    dummyDash.updateMatrix();
    instancedFlyoverDashes.setMatrixAt(dIdx++, dummyDash.matrix);
  }
  instancedFlyoverDashes.instanceMatrix.needsUpdate = true;
  flyoverGroup.add(instancedFlyoverDashes);

  // Massive Sculptural Hammerhead Concrete Piers supporting the Flyover
  const pierGeo = new THREE.BoxGeometry(3.0, flyoverElevation, 2.6);
  const capGeo = new THREE.BoxGeometry(flyoverWidth + 1.2, 1.4, 3.4);

  for (let pz = -220; pz <= 220; pz += 44) {
    const pier = new THREE.Mesh(pierGeo, materials.concrete);
    pier.position.set(flyoverX, flyoverElevation / 2, pz);
    pier.castShadow = true;
    flyoverGroup.add(pier);

    const cap = new THREE.Mesh(capGeo, materials.concrete);
    cap.position.set(flyoverX, flyoverElevation - 0.7, pz);
    cap.castShadow = true;
    flyoverGroup.add(cap);

    // Under-deck LED road inspection lighting (warm luminaire)
    const underLight = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1.2), materials.neonWhite);
    underLight.position.set(flyoverX, flyoverElevation - 1.4, pz);
    flyoverGroup.add(underLight);
  }

  // Flyover Access Ramps:
  // Ramp 1: On-Ramp ascending from ground level (Z: -240) to flyover (Z: -160)
  const rampLength = 80;
  const rampWidth = 6.5;
  const onRampGeo = new THREE.BoxGeometry(rampWidth, 0.8, rampLength);
  const onRamp = new THREE.Mesh(onRampGeo, materials.concrete);
  onRamp.position.set(flyoverX + 11, flyoverElevation / 2, -200);
  onRamp.rotation.x = Math.atan2(flyoverElevation, rampLength);
  onRamp.castShadow = true;
  flyoverGroup.add(onRamp);

  const onRampRoad = new THREE.Mesh(new THREE.PlaneGeometry(rampWidth - 0.4, rampLength), materials.asphalt);
  onRampRoad.position.set(flyoverX + 11, flyoverElevation / 2 + 0.42, -200);
  onRampRoad.rotation.x = -Math.PI / 2 + Math.atan2(flyoverElevation, rampLength);
  flyoverGroup.add(onRampRoad);

  // Ramp 2: Off-Ramp descending from flyover (Z: 140) down to ground level (Z: 220)
  const offRamp = new THREE.Mesh(onRampGeo, materials.concrete);
  offRamp.position.set(flyoverX + 11, flyoverElevation / 2, 180);
  offRamp.rotation.x = -Math.atan2(flyoverElevation, rampLength);
  offRamp.castShadow = true;
  flyoverGroup.add(offRamp);

  const offRampRoad = new THREE.Mesh(new THREE.PlaneGeometry(rampWidth - 0.4, rampLength), materials.asphalt);
  offRampRoad.position.set(flyoverX + 11, flyoverElevation / 2 + 0.42, 180);
  offRampRoad.rotation.x = -Math.PI / 2 - Math.atan2(flyoverElevation, rampLength);
  flyoverGroup.add(offRampRoad);

  // 3c. OVERHEAD HIGHWAY GANTRY SIGNBOARDS
  const gantryConfigs = [
    {
      x: flyoverX,
      y: flyoverElevation + 5.2,
      z: -120,
      main: 'SKYPORT AIRPORT / MOHIT HUB',
      sub: 'EXIT 4B: TECH DISTRICT  1.2 km',
      route: 'HWY 101 N',
    },
    {
      x: flyoverX,
      y: flyoverElevation + 5.2,
      z: 70,
      main: 'APEX CORP HQ / DOWNTOWN',
      sub: 'EXIT 2A: CORPORATE OFFICES & TRADING',
      route: 'HWY 101 S',
    },
    {
      x: flyoverX,
      y: flyoverElevation + 5.2,
      z: -10,
      main: 'CYBER-PULSE MEGAPLEX MALL',
      sub: 'EXIT 3C: SHOPPING PROMENADE & ATRIUM',
      route: 'HWY 101 N',
    },
    {
      x: -100,
      y: 7.2,
      z: -70,
      main: 'CENTRAL METRO HIGHWAY',
      sub: 'MAGLEV TRANSIT & RIVER CRUISE',
      route: 'EXP 01',
    },
    {
      x: -100,
      y: 7.2,
      z: 110,
      main: 'RIVERSIDE & CENTRAL PARK',
      sub: 'EXIT 1B: SAKURA PROMENADE & POND',
      route: 'PKWY 02',
    },
  ];

  gantryConfigs.forEach((gCfg) => {
    const gantry = new THREE.Group();
    gantry.position.set(gCfg.x, gCfg.y, gCfg.z);

    // Steel overhead truss bridge
    const trussWidth = 18;
    const truss = new THREE.Mesh(new THREE.BoxGeometry(trussWidth, 0.8, 0.8), materials.metalLight);
    gantry.add(truss);

    // Support legs
    [-trussWidth / 2 + 0.4, trussWidth / 2 - 0.4].forEach((legX) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 5.8, 8), materials.metalDark);
      leg.position.set(legX, -2.5, 0);
      gantry.add(leg);
    });

    // Realistic Signboard Mesh
    const signTex = createHighwayGantrySignTexture(gCfg.main, gCfg.sub, gCfg.route);
    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 3.8),
      new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide })
    );
    signMesh.position.set(0, 0.2, 0.5);
    gantry.add(signMesh);

    flyoverGroup.add(gantry);
  });

  group.add(flyoverGroup);
  bridgeMeshes.push(flyoverGroup);

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

  // 6. STREET SIGNS AT CORNERS (Standard Municipal Green Signage)
  const streetSignConfigs = [
    { text: 'METROPOLITAN BLVD', x: -100, z: -172 },
    { text: 'RIVERSIDE DRIVE', x: -100, z: 12 },
    { text: 'UNIVERSITY AVENUE', x: 100, z: -172 },
    { text: 'INNOVATION PARKWAY', x: 100, z: 12 },
    { text: 'HARBOR PARKWAY', x: -45, z: 12 },
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
    sCtx.fillStyle = '#065f46'; // Standard Municipal Highway Green
    sCtx.fillRect(0, 0, 512, 128);
    sCtx.strokeStyle = '#ffffff';
    sCtx.lineWidth = 4;
    sCtx.strokeRect(6, 6, 500, 116);
    sCtx.font = 'bold 36px "Plus Jakarta Sans", system-ui, sans-serif';
    sCtx.fillStyle = '#ffffff';
    sCtx.textAlign = 'center';
    sCtx.fillText(cfg.text, 256, 76);

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

    // Bus Route Schedule Pillar
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 0.3), materials.metalDark);
    pillar.position.set(2.8, 1.6, 1.1);
    shelterGroup.add(pillar);

    // Schedule panel on pillar
    const schedGeo = new THREE.PlaneGeometry(0.24, 1.4);
    const schedMesh = new THREE.Mesh(schedGeo, materials.neonWhite);
    schedMesh.position.set(2.8, 1.8, 1.26);
    shelterGroup.add(schedMesh);

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

    // EV Charging Pylons with green status LEDs
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

  // 9. INSTANCED STREET LIGHTS WITH ROAD LIGHT POOLS (Warm High-Efficiency LED Streetlights)
  const streetLightCount = 120;
  const poleGeo = new THREE.CylinderGeometry(0.18, 0.25, 7.5, 6);
  const headGeo = new THREE.BoxGeometry(1.2, 0.25, 0.6);
  const headGlowGeo = new THREE.BoxGeometry(1.0, 0.15, 0.5);

  const poolGeo = new THREE.PlaneGeometry(14, 14);
  poolGeo.rotateX(-Math.PI / 2);
  const poolTex = createLightPoolDecalTexture('#fef3c7');
  const poolMat = new THREE.MeshBasicMaterial({
    map: poolTex,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const instancedPoles = new THREE.InstancedMesh(poleGeo, materials.metalLight, streetLightCount);
  const instancedHeads = new THREE.InstancedMesh(headGeo, materials.metalLight, streetLightCount);
  const instancedGlows = new THREE.InstancedMesh(headGlowGeo, materials.neonWhite, streetLightCount);
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

  // 10. GTA V LOS SANTOS PALM TREE BOULEVARDS & STREET FURNITURE
  const palmPositions: [number, number][] = [];
  // Waterfront Promenade & Central Grand Boulevard Palm Rows
  for (let z = -230; z <= 230; z += 24) {
    if (Math.abs(z) > 12 && Math.abs(z - -160) > 12 && Math.abs(z - 160) > 12) {
      palmPositions.push([-36, z], [36, z], [-91, z], [91, z]);
    }
  }

  const palmCount = palmPositions.length;
  const palmTrunkGeo = new THREE.CylinderGeometry(0.18, 0.34, 9.5, 7);
  const palmCrownGeo = new THREE.ConeGeometry(2.8, 1.8, 7);
  const palmFrondGeo = new THREE.BoxGeometry(3.8, 0.12, 0.65);

  const palmTrunkMat = new THREE.MeshStandardMaterial({
    color: 0x5c4033,
    roughness: 0.88,
    metalness: 0.05,
    normalMap: materials.maps.concreteNormal,
  });
  const palmLeafMat = new THREE.MeshStandardMaterial({
    color: 0x2d6a3e,
    roughness: 0.62,
    metalness: 0.08,
  });

  const instancedPalmTrunks = new THREE.InstancedMesh(palmTrunkGeo, palmTrunkMat, palmCount);
  const instancedPalmCrowns = new THREE.InstancedMesh(palmCrownGeo, palmLeafMat, palmCount);
  const instancedPalmFronds = new THREE.InstancedMesh(palmFrondGeo, palmLeafMat, palmCount * 4);
  instancedPalmTrunks.castShadow = true;
  instancedPalmCrowns.castShadow = true;

  let frondIdx = 0;
  palmPositions.forEach(([px, pz], idx) => {
    const hScale = 0.88 + ((Math.abs(px + pz) % 5) * 0.06);
    const tiltX = Math.sin(pz * 0.1) * 0.05;
    const tiltZ = Math.cos(px * 0.1) * 0.05;

    dummy.position.set(px, (9.5 * hScale) / 2, pz);
    dummy.rotation.set(tiltX, (idx * 1.1) % Math.PI, tiltZ);
    dummy.scale.set(1, hScale, 1);
    dummy.updateMatrix();
    instancedPalmTrunks.setMatrixAt(idx, dummy.matrix);

    const topY = 9.5 * hScale;
    dummy.position.set(px + tiltZ * 2.0, topY, pz + tiltX * 2.0);
    dummy.rotation.set(0, idx * 0.7, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    instancedPalmCrowns.setMatrixAt(idx, dummy.matrix);

    // 4 Radiating Arching Frond Crosses per Palm
    for (let f = 0; f < 4; f++) {
      dummy.position.set(px + tiltZ * 2.0, topY - 0.2, pz + tiltX * 2.0);
      dummy.rotation.set(0.22, (f * Math.PI) / 4 + idx * 0.3, 0.18);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      instancedPalmFronds.setMatrixAt(frondIdx++, dummy.matrix);
    }
  });

  instancedPalmTrunks.instanceMatrix.needsUpdate = true;
  instancedPalmCrowns.instanceMatrix.needsUpdate = true;
  instancedPalmFronds.instanceMatrix.needsUpdate = true;
  group.add(instancedPalmTrunks);
  group.add(instancedPalmCrowns);
  group.add(instancedPalmFronds);

  scene.add(group);

  const update = (_time: number) => {
    // Street details stay solid and realistic
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
    palmTrunkGeo.dispose();
    palmCrownGeo.dispose();
    palmFrondGeo.dispose();
    palmTrunkMat.dispose();
    palmLeafMat.dispose();
  };

  return {
    group,
    bridgeMeshes,
    update,
    dispose,
  };
}
