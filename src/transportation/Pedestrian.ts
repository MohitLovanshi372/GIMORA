/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { TrafficLight } from './TrafficLight';
import { Vehicle } from './Vehicle';
import { CityPhysicsEngine } from '../city/modules/CityPhysicsEngine';

export type PedestrianArchetype =
  | 'executive'
  | 'tech_commuter'
  | 'tourist'
  | 'student'
  | 'jogger';

export type PedestrianState =
  | 'walking'
  | 'waiting_at_crosswalk'
  | 'crossing_street'
  | 'browsing_plaza';

export interface SidewalkNode {
  id: string;
  position: THREE.Vector3;
  districtId: string;
  densityWeight: number; // Higher in high-density districts (Downtown, Tech, Marina Bay, Paris, Railway)
  isPlaza?: boolean;
}

export interface SidewalkEdge {
  id: string;
  from: SidewalkNode;
  to: SidewalkNode;
  type: 'sidewalk' | 'crosswalk' | 'bridge_walkway' | 'plaza_path';
  length: number;
  direction: THREE.Vector3;
  trafficLightId?: string;
  crossingAxis?: 'NS' | 'EW'; // Axis of pedestrian movement across the street
}

// Shared low-poly articulated geometries for high performance across 110+ agents
const legGeo = new THREE.BoxGeometry(0.13, 0.56, 0.14);
legGeo.translate(0, -0.28, 0);

const armGeo = new THREE.BoxGeometry(0.11, 0.50, 0.11);
armGeo.translate(0, -0.22, 0);

const torsoGeo = new THREE.BoxGeometry(0.36, 0.56, 0.22);
const headGeo = new THREE.SphereGeometry(0.15, 10, 10);
const hairCapGeo = new THREE.SphereGeometry(0.16, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55);
const backpackGeo = new THREE.BoxGeometry(0.26, 0.36, 0.14);
const briefcaseGeo = new THREE.BoxGeometry(0.08, 0.28, 0.36);

// Curated PBR Materials for Urban Crowd Diversity
const coatMats = [
  new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.72 }), // Executive Obsidian Suit
  new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.75 }), // Charcoal Tailored Overcoat
  new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.65 }), // Cobalt Tech Jacket
  new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.70 }), // Crimson Streetwear Hoodie
  new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.72 }), // Emerald Bomber Jacket
  new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.76 }), // Amber Suede Jacket
  new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.68 }), // Crisp White Linen Blazer
  new THREE.MeshStandardMaterial({ color: 0x4f46e5, roughness: 0.68 }), // Indigo Athletic Windbreaker
  new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.80 }), // Espresso Leather Coat
];

const pantsMats = [
  new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.85 }), // Formal Black Trousers
  new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.82 }), // Dark Indigo Denim
  new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 }), // Slate Chinos
  new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.84 }), // Warm Khaki Chinos
];

const skinMats = [
  new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.58 }),
  new THREE.MeshStandardMaterial({ color: 0xf5cba7, roughness: 0.58 }),
  new THREE.MeshStandardMaterial({ color: 0xe0ac69, roughness: 0.58 }),
  new THREE.MeshStandardMaterial({ color: 0xc68642, roughness: 0.58 }),
  new THREE.MeshStandardMaterial({ color: 0x8d5524, roughness: 0.58 }),
  new THREE.MeshStandardMaterial({ color: 0x5c3818, roughness: 0.58 }),
];

const hairMats = [
  new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.88 }), // Jet Black
  new THREE.MeshStandardMaterial({ color: 0x3b1e08, roughness: 0.88 }), // Espresso Brown
  new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.86 }), // Chestnut Auburn
  new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.84 }), // Golden Blonde
  new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.82 }), // Distinguished Silver
];

const accessoryMatDark = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5, metalness: 0.3 });
const accessoryMatTan = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.6, metalness: 0.2 });

export class Pedestrian {
  public id: string;
  public archetype: PedestrianArchetype;
  public mesh: THREE.Group;

  // Articulated limb pivots
  private leftLegPivot!: THREE.Group;
  private rightLegPivot!: THREE.Group;
  private leftArmPivot!: THREE.Group;
  private rightArmPivot!: THREE.Group;
  private headMesh!: THREE.Mesh;

  // Pathfinding & Graph State
  public currentNode: SidewalkNode;
  public route: SidewalkEdge[] = [];
  public currentEdgeIndex = 0;
  public state: PedestrianState = 'walking';
  public waitTimer = 0;

  // Kinematics & Steering
  public baseSpeed = 1.45;
  public currentSpeed = 1.45;
  public velocity = new THREE.Vector3();
  public heading = 0;
  public laneOffset = 0; // Right-hand sidewalk lane bias (-0.65m to +0.65m)
  public curbQueueOffset = new THREE.Vector3();
  private walkCycle = Math.random() * Math.PI * 2;

  // Reusable working vectors (Zero-GC in update loop)
  private tmpDesired = new THREE.Vector3();
  private tmpSteer = new THREE.Vector3();
  private tmpRight = new THREE.Vector3();
  private tmpProbe = new THREE.Vector3();
  private tmpDiff = new THREE.Vector3();

  constructor(
    id: string,
    startNode: SidewalkNode,
    archetype: PedestrianArchetype,
    initialRoute: SidewalkEdge[]
  ) {
    this.id = id;
    this.currentNode = startNode;
    this.archetype = archetype;
    this.route = initialRoute;

    // Right-hand rule sidewalk offset with slight natural variation
    this.laneOffset = 0.28 + (Math.random() - 0.5) * 0.45;
    this.curbQueueOffset.set((Math.random() - 0.5) * 1.4, 0, (Math.random() - 0.5) * 0.9);

    // Speed tailored by archetype
    switch (archetype) {
      case 'jogger':
        this.baseSpeed = 2.35 + Math.random() * 0.35;
        break;
      case 'executive':
      case 'tech_commuter':
        this.baseSpeed = 1.55 + Math.random() * 0.25;
        break;
      case 'student':
        this.baseSpeed = 1.42 + Math.random() * 0.25;
        break;
      case 'tourist':
      default:
        this.baseSpeed = 1.18 + Math.random() * 0.22;
        break;
    }
    this.currentSpeed = this.baseSpeed;

    this.mesh = new THREE.Group();
    this.mesh.name = `pedestrian_${id}`;
    this.mesh.position.copy(startNode.position);

    this.buildArticulatedAvatar();
  }

  private buildArticulatedAvatar() {
    const hash = this.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const cMat = coatMats[hash % coatMats.length];
    const pMat = pantsMats[(hash * 3) % pantsMats.length];
    const sMat = skinMats[(hash * 7) % skinMats.length];
    const hMat = hairMats[(hash * 5) % hairMats.length];

    // 1. Articulated Left & Right Legs
    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.09, 0.56, 0);
    const leftLeg = new THREE.Mesh(legGeo, pMat);
    leftLeg.castShadow = true;
    this.leftLegPivot.add(leftLeg);
    this.mesh.add(this.leftLegPivot);

    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.09, 0.56, 0);
    const rightLeg = new THREE.Mesh(legGeo, pMat);
    rightLeg.castShadow = true;
    this.rightLegPivot.add(rightLeg);
    this.mesh.add(this.rightLegPivot);

    // 2. Torso
    const torso = new THREE.Mesh(torsoGeo, cMat);
    torso.position.set(0, 0.86, 0);
    torso.castShadow = true;
    this.mesh.add(torso);

    // 3. Articulated Left & Right Arms
    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.24, 1.10, 0);
    const leftArm = new THREE.Mesh(armGeo, cMat);
    leftArm.castShadow = true;
    this.leftArmPivot.add(leftArm);
    this.mesh.add(this.leftArmPivot);

    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.24, 1.10, 0);
    const rightArm = new THREE.Mesh(armGeo, cMat);
    rightArm.castShadow = true;
    this.rightArmPivot.add(rightArm);

    // Archetype Accessories
    if (this.archetype === 'executive') {
      const briefcase = new THREE.Mesh(briefcaseGeo, accessoryMatTan);
      briefcase.position.set(0.06, -0.48, 0);
      this.rightArmPivot.add(briefcase);
    } else if (this.archetype === 'tech_commuter' || this.archetype === 'student') {
      const backpack = new THREE.Mesh(backpackGeo, accessoryMatDark);
      backpack.position.set(0, 0.88, -0.17);
      this.mesh.add(backpack);
    }

    this.mesh.add(this.rightArmPivot);

    // 4. Head & Hair
    this.headMesh = new THREE.Mesh(headGeo, sMat);
    this.headMesh.position.set(0, 1.31, 0);
    this.headMesh.castShadow = true;
    this.mesh.add(this.headMesh);

    const hair = new THREE.Mesh(hairCapGeo, hMat);
    hair.position.set(0, 1.33, 0);
    this.mesh.add(hair);
  }

  public assignRoute(newRoute: SidewalkEdge[]) {
    this.route = newRoute;
    this.currentEdgeIndex = 0;
    this.state = 'walking';
  }

  public get activeEdge(): SidewalkEdge | null {
    if (this.currentEdgeIndex < 0 || this.currentEdgeIndex >= this.route.length) {
      return null;
    }
    return this.route[this.currentEdgeIndex];
  }

  /**
   * Evaluates whether a signalized crosswalk edge is safe to enter.
   * Checks both the intersection TrafficLight phase and approaching vehicles.
   */
  private canEnterCrosswalk(
    edge: SidewalkEdge,
    trafficLights: Map<string, TrafficLight>,
    vehicles: Vehicle[]
  ): boolean {
    // 1. Check Traffic Signal Walk Phase
    if (edge.trafficLightId && edge.crossingAxis) {
      const tl = trafficLights.get(edge.trafficLightId);
      if (tl) {
        // Pedestrians walk parallel to the axis that currently has GREEN traffic,
        // so perpendicular cars are stopped on RED.
        if (!tl.isGreen(edge.crossingAxis)) {
          return false;
        }
      }
    }

    // 2. Check for any fast-approaching or emergency vehicle inside the crosswalk zone
    const midX = (edge.from.position.x + edge.to.position.x) * 0.5;
    const midZ = (edge.from.position.z + edge.to.position.z) * 0.5;

    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      if (!v.active || v.state === 'parked') continue;
      const dx = v.mesh.position.x - midX;
      const dz = v.mesh.position.z - midZ;
      const distSq = dx * dx + dz * dz;
      if (distSq < 110 && v.speed > 1.8) {
        return false;
      }
    }

    return true;
  }

  public update(
    delta: number,
    neighbors: Pedestrian[],
    trafficLights: Map<string, TrafficLight>,
    vehicles: Vehicle[],
    physicsEngine?: CityPhysicsEngine,
    playerPos?: THREE.Vector3,
    staticObstacles?: THREE.Vector2[]
  ): boolean {
    const edge = this.activeEdge;
    if (!edge) {
      return true; // Signals PedestrianManager to compute a new A* route
    }

    const pos = this.mesh.position;

    // 1. PLAZA BROWSING PAUSE STATE
    if (this.state === 'browsing_plaza') {
      this.waitTimer -= delta;
      this.animateLimbs(delta, 0);
      if (this.waitTimer <= 0) {
        this.state = 'walking';
        return true; // Ready for next destination
      }
      return false;
    }

    // Compute target waypoint with right-hand sidewalk lane offset
    this.tmpRight.set(-edge.direction.z, 0, edge.direction.x);
    const targetX = edge.to.position.x + this.tmpRight.x * this.laneOffset;
    const targetZ = edge.to.position.z + this.tmpRight.z * this.laneOffset;

    const dxToTarget = targetX - pos.x;
    const dzToTarget = targetZ - pos.z;
    const distToTarget = Math.hypot(dxToTarget, dzToTarget);

    // 2. CROSSWALK CURB WAITING LOGIC
    if (this.state === 'waiting_at_crosswalk') {
      if (this.canEnterCrosswalk(edge, trafficLights, vehicles)) {
        this.state = 'crossing_street';
      } else {
        // Stand at curb queue spot and face across the crosswalk
        const lookAngle = Math.atan2(edge.direction.x, edge.direction.z);
        this.heading = lookAngle;
        this.mesh.rotation.y = this.heading;
        this.animateLimbs(delta, 0);
        // Subtle head scan left/right watching traffic
        this.headMesh.rotation.y = Math.sin(Date.now() * 0.0025 + this.walkCycle) * 0.28;
        return false;
      }
    }

    // 3. WAYPOINT ADVANCEMENT & NEXT EDGE TRANSITION
    if (distToTarget < 1.05) {
      this.currentNode = edge.to;
      this.currentEdgeIndex++;

      if (this.currentEdgeIndex >= this.route.length) {
        if (this.currentNode.isPlaza && Math.random() < 0.45) {
          this.state = 'browsing_plaza';
          this.waitTimer = 2.0 + Math.random() * 2.5;
          return false;
        }
        return true; // Route finished; request new A* path
      }

      const nextEdge = this.route[this.currentEdgeIndex];
      if (nextEdge.type === 'crosswalk') {
        if (this.canEnterCrosswalk(nextEdge, trafficLights, vehicles)) {
          this.state = 'crossing_street';
        } else {
          this.state = 'waiting_at_crosswalk';
          return false;
        }
      } else {
        this.state = 'walking';
      }
      return false;
    }

    // 4. DESIRED VELOCITY TOWARDS TARGET WAYPOINT
    this.headMesh.rotation.y = 0;
    let speedMultiplier = 1.0;

    // If crossing street and signal turns yellow/red mid-crossing, hustle across!
    if (this.state === 'crossing_street' && edge.trafficLightId && edge.crossingAxis) {
      const tl = trafficLights.get(edge.trafficLightId);
      if (tl && !tl.isGreen(edge.crossingAxis)) {
        speedMultiplier = 1.48;
      }
    }

    const desiredSpeed = this.baseSpeed * speedMultiplier;
    this.tmpDesired.set(dxToTarget / distToTarget, 0, dzToTarget / distToTarget);
    this.tmpSteer.copy(this.tmpDesired).multiplyScalar(desiredSpeed);

    // 5. SOCIAL FORCE STEERING (Pedestrian Neighbor Separation & Oncoming Right-Hand Passing)
    const socialRadius = 1.45;
    for (let i = 0; i < neighbors.length; i++) {
      const other = neighbors[i];
      if (other === this) continue;

      const nx = pos.x - other.mesh.position.x;
      const nz = pos.z - other.mesh.position.z;
      const dSq = nx * nx + nz * nz;

      if (dSq > 0.0001 && dSq < socialRadius * socialRadius) {
        const d = Math.sqrt(dSq);
        const repulseStrength = ((socialRadius - d) / socialRadius) * 2.1;
        this.tmpSteer.x += (nx / d) * repulseStrength;
        this.tmpSteer.z += (nz / d) * repulseStrength;

        // If oncoming pedestrian, add right-hand sidestep impulse for smooth lane formation
        const dotHeading =
          this.velocity.x * other.velocity.x + this.velocity.z * other.velocity.z;
        if (dotHeading < -0.2) {
          this.tmpSteer.x += this.tmpRight.x * 0.65;
          this.tmpSteer.z += this.tmpRight.z * 0.65;
        }
      }
    }

    // 6. AVOID PLAYER AVATAR
    if (playerPos) {
      const px = pos.x - playerPos.x;
      const pz = pos.z - playerPos.z;
      const pDistSq = px * px + pz * pz;
      if (pDistSq > 0.001 && pDistSq < 5.2) {
        const pDist = Math.sqrt(pDistSq);
        const push = ((2.28 - pDist) / 2.28) * 2.8;
        this.tmpSteer.x += (px / pDist) * push;
        this.tmpSteer.z += (pz / pDist) * push;
      }
    }

    // 7. AVOID STATIC STREET FURNITURE (Palm Trees, Streetlights, Bus Shelters, Hydrants)
    if (staticObstacles && this.state !== 'crossing_street') {
      for (let i = 0; i < staticObstacles.length; i++) {
        const obs = staticObstacles[i];
        const ox = pos.x - obs.x;
        const oz = pos.z - obs.y;
        const oDistSq = ox * ox + oz * oz;
        if (oDistSq > 0.001 && oDistSq < 3.6) {
          const oDist = Math.sqrt(oDistSq);
          const avoid = ((1.9 - oDist) / 1.9) * 2.6;
          this.tmpSteer.x += (ox / oDist) * avoid;
          this.tmpSteer.z += (oz / oDist) * avoid;
        }
      }
    }

    // 8. BUILDING WALL WHISKER FEELER & SOLID COLLISION RESOLUTION
    if (physicsEngine) {
      const feelerDist = 1.15;
      const probeX = pos.x + this.tmpDesired.x * feelerDist;
      const probeZ = pos.z + this.tmpDesired.z * feelerDist;
      this.tmpProbe.set(probeX, pos.y, probeZ);
      physicsEngine.resolveHorizontalMovement(pos, this.tmpProbe, 0.42, pos.y);
      // If feeler was deflected by a building wall, steer parallel to wall
      const deflectX = this.tmpProbe.x - probeX;
      const deflectZ = this.tmpProbe.z - probeZ;
      if (Math.abs(deflectX) > 0.001 || Math.abs(deflectZ) > 0.001) {
        this.tmpSteer.x += deflectX * 6.0;
        this.tmpSteer.z += deflectZ * 6.0;
      }
    }

    // Clamp steering speed and smoothly blend velocity
    const steerMag = Math.hypot(this.tmpSteer.x, this.tmpSteer.z);
    if (steerMag > desiredSpeed * 1.25) {
      this.tmpSteer.multiplyScalar((desiredSpeed * 1.25) / steerMag);
    }

    const blend = Math.min(1.0, delta * 9.0);
    this.velocity.x += (this.tmpSteer.x - this.velocity.x) * blend;
    this.velocity.z += (this.tmpSteer.z - this.velocity.z) * blend;
    this.currentSpeed = Math.hypot(this.velocity.x, this.velocity.z);

    // 9. APPLY HORIZONTAL MOVEMENT & PHYSICS WALL / ELEVATION RESOLUTION
    const nextX = pos.x + this.velocity.x * delta;
    const nextZ = pos.z + this.velocity.z * delta;

    if (physicsEngine) {
      this.tmpDiff.set(nextX, pos.y, nextZ);
      physicsEngine.resolveHorizontalMovement(pos, this.tmpDiff, 0.35, pos.y);
      pos.x = this.tmpDiff.x;
      pos.z = this.tmpDiff.z;
      const groundY = physicsEngine.getGroundHeightAt(pos.x, pos.z);
      pos.y += (groundY - pos.y) * Math.min(1.0, delta * 14.0);
    } else {
      pos.x = nextX;
      pos.z = nextZ;
      pos.y = edge.to.position.y;
    }

    // Smoothly orient character along velocity vector
    if (this.currentSpeed > 0.15) {
      const targetHeading = Math.atan2(this.velocity.x, this.velocity.z);
      let angleDiff = targetHeading - this.heading;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      this.heading += angleDiff * Math.min(1.0, delta * 10.0);
      this.mesh.rotation.y = this.heading;
    }

    this.animateLimbs(delta, this.currentSpeed);
    return false;
  }

  private animateLimbs(delta: number, speed: number) {
    if (speed < 0.1) {
      // Smoothly return limbs to neutral standing pose when waiting at crosswalk
      const damp = Math.min(1.0, delta * 10.0);
      this.leftLegPivot.rotation.x *= 1 - damp;
      this.rightLegPivot.rotation.x *= 1 - damp;
      this.leftArmPivot.rotation.x *= 1 - damp;
      this.rightArmPivot.rotation.x *= 1 - damp;
      return;
    }

    this.walkCycle += delta * speed * 4.4;
    const swing = Math.sin(this.walkCycle) * Math.min(0.62, speed * 0.28);

    this.leftLegPivot.rotation.x = swing;
    this.rightLegPivot.rotation.x = -swing;
    this.leftArmPivot.rotation.x = -swing * 0.75;
    this.rightArmPivot.rotation.x = swing * 0.75;
  }

  public dispose() {
    this.mesh.clear();
  }
}
