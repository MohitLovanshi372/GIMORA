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
  densityWeight: number;
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
  crossingAxis?: 'NS' | 'EW';
}

// Shared Anatomical Human Geometries for 110+ High-FPS Articulated Pedestrians
const pelvisGeo = new THREE.CylinderGeometry(0.145, 0.135, 0.14, 12);
pelvisGeo.scale(1.15, 1.0, 0.78);

const torsoChestGeo = new THREE.CylinderGeometry(0.185, 0.145, 0.44, 12);
torsoChestGeo.scale(1.18, 1.0, 0.76);

const shoulderBridgeGeo = new THREE.CapsuleGeometry(0.085, 0.30, 6, 10);
shoulderBridgeGeo.rotateZ(Math.PI / 2);

const neckGeo = new THREE.CylinderGeometry(0.054, 0.062, 0.10, 10);
const headGeo = new THREE.SphereGeometry(0.118, 14, 14);
headGeo.scale(0.92, 1.10, 0.98);

const noseGeo = new THREE.ConeGeometry(0.018, 0.05, 6);
noseGeo.rotateX(Math.PI * 0.42);

const eyeGeo = new THREE.SphereGeometry(0.013, 6, 6);
const hairCapGeo = new THREE.SphereGeometry(0.125, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.58);
hairCapGeo.scale(0.95, 1.06, 1.02);

const hairBunGeo = new THREE.SphereGeometry(0.055, 8, 8);

// Multi-joint leg geometries (Thigh + Calf + Shoe)
const thighGeo = new THREE.CylinderGeometry(0.072, 0.056, 0.36, 10);
thighGeo.translate(0, -0.18, 0);

const calfGeo = new THREE.CylinderGeometry(0.054, 0.040, 0.34, 10);
calfGeo.translate(0, -0.17, 0);

const shoeGeo = new THREE.BoxGeometry(0.086, 0.062, 0.20);
shoeGeo.translate(0, -0.03, 0.035);

// Multi-joint arm geometries (Upper Arm + Forearm + Hand)
const upperArmGeo = new THREE.CylinderGeometry(0.052, 0.044, 0.24, 10);
upperArmGeo.translate(0, -0.12, 0);

const forearmGeo = new THREE.CylinderGeometry(0.042, 0.033, 0.21, 10);
forearmGeo.translate(0, -0.105, 0);

const handGeo = new THREE.SphereGeometry(0.036, 8, 8);
handGeo.scale(0.75, 1.25, 0.9);
handGeo.translate(0, -0.23, 0);

const backpackGeo = new THREE.BoxGeometry(0.24, 0.34, 0.12);
const briefcaseGeo = new THREE.BoxGeometry(0.07, 0.26, 0.34);

// Curated PBR Materials for Urban Crowd Diversity
const coatMats = [
  new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.68 }), // Executive Obsidian Suit
  new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.72 }), // Charcoal Tailored Overcoat
  new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.62 }), // Cobalt Tech Jacket
  new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.68 }), // Crimson Streetwear Hoodie
  new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.70 }), // Emerald Bomber Jacket
  new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.74 }), // Amber Suede Jacket
  new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65 }), // Crisp White Linen Blazer
  new THREE.MeshStandardMaterial({ color: 0x4f46e5, roughness: 0.65 }), // Indigo Athletic Windbreaker
  new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.76 }), // Espresso Leather Coat
];

const pantsMats = [
  new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.82 }), // Formal Black Trousers
  new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.80 }), // Dark Indigo Denim
  new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.82 }), // Slate Chinos
  new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.82 }), // Warm Khaki Chinos
];

const skinMats = [
  new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.54 }),
  new THREE.MeshStandardMaterial({ color: 0xf5cba7, roughness: 0.54 }),
  new THREE.MeshStandardMaterial({ color: 0xe0ac69, roughness: 0.54 }),
  new THREE.MeshStandardMaterial({ color: 0xc68642, roughness: 0.54 }),
  new THREE.MeshStandardMaterial({ color: 0x8d5524, roughness: 0.54 }),
  new THREE.MeshStandardMaterial({ color: 0x5c3818, roughness: 0.54 }),
];

const hairMats = [
  new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.85 }), // Jet Black
  new THREE.MeshStandardMaterial({ color: 0x3b1e08, roughness: 0.85 }), // Espresso Brown
  new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.84 }), // Chestnut Auburn
  new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.82 }), // Golden Blonde
  new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.80 }), // Distinguished Silver
];

const shoeMats = [
  new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.55 }),
  new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.60 }),
  new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.50 }),
];

const pupilMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
const shirtCollarMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
const accessoryMatDark = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5, metalness: 0.3 });
const accessoryMatTan = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.6, metalness: 0.2 });

export class Pedestrian {
  public id: string;
  public archetype: PedestrianArchetype;
  public mesh: THREE.Group;

  // Anatomically articulated joint pivots
  private hipsGroup!: THREE.Group;
  private torsoGroup!: THREE.Group;
  private headGroup!: THREE.Group;
  private leftLegPivot!: THREE.Group;
  private rightLegPivot!: THREE.Group;
  private leftKneePivot!: THREE.Group;
  private rightKneePivot!: THREE.Group;
  private leftArmPivot!: THREE.Group;
  private rightArmPivot!: THREE.Group;
  private leftElbowPivot!: THREE.Group;
  private rightElbowPivot!: THREE.Group;

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
  public laneOffset = 0;
  public curbQueueOffset = new THREE.Vector3();
  private walkCycle = Math.random() * Math.PI * 2;

  // Reusable working vectors (Zero-GC in update loop)
  private tmpDesired = new THREE.Vector3();
  private tmpSteer = new THREE.Vector3();
  private tmpRight = new THREE.Vector3();

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

    this.laneOffset = 0.28 + (Math.random() - 0.5) * 0.45;
    this.curbQueueOffset.set((Math.random() - 0.5) * 1.4, 0, (Math.random() - 0.5) * 0.9);

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
    const shoeMat = shoeMats[(hash * 2) % shoeMats.length];
    const isShortSleeve = this.archetype === 'jogger' || this.archetype === 'tourist' || hash % 3 === 0;

    // Slight natural height variation (0.94 to 1.07)
    const heightScale = 0.94 + (hash % 14) * 0.01;
    this.mesh.scale.setScalar(heightScale);

    // 1. Pelvis & Hips Root (Y = 0.76m)
    this.hipsGroup = new THREE.Group();
    this.hipsGroup.position.set(0, 0.76, 0);
    this.mesh.add(this.hipsGroup);

    const pelvis = new THREE.Mesh(pelvisGeo, pMat);
    pelvis.castShadow = true;
    this.hipsGroup.add(pelvis);

    // 2. Multi-Joint Articulated Left & Right Legs (Hip -> Thigh -> Knee -> Calf -> Shoe)
    const buildLeg = (isLeft: boolean) => {
      const side = isLeft ? -1 : 1;
      const hipPivot = new THREE.Group();
      hipPivot.position.set(side * 0.095, -0.02, 0);
      this.hipsGroup.add(hipPivot);

      const thigh = new THREE.Mesh(thighGeo, pMat);
      thigh.castShadow = true;
      hipPivot.add(thigh);

      const kneePivot = new THREE.Group();
      kneePivot.position.set(0, -0.36, 0);
      hipPivot.add(kneePivot);

      const calf = new THREE.Mesh(calfGeo, this.archetype === 'jogger' ? sMat : pMat);
      calf.castShadow = true;
      kneePivot.add(calf);

      const shoe = new THREE.Mesh(shoeGeo, shoeMat);
      shoe.position.set(0, -0.34, 0);
      kneePivot.add(shoe);

      if (isLeft) {
        this.leftLegPivot = hipPivot;
        this.leftKneePivot = kneePivot;
      } else {
        this.rightLegPivot = hipPivot;
        this.rightKneePivot = kneePivot;
      }
    };

    buildLeg(true);
    buildLeg(false);

    // 3. Sculpted V-Taper Torso, Collar & Shoulders
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.set(0, 0.05, 0);
    this.hipsGroup.add(this.torsoGroup);

    const torso = new THREE.Mesh(torsoChestGeo, cMat);
    torso.position.y = 0.22;
    torso.castShadow = true;
    this.torsoGroup.add(torso);

    const shoulders = new THREE.Mesh(shoulderBridgeGeo, cMat);
    shoulders.position.set(0, 0.40, 0);
    this.torsoGroup.add(shoulders);

    const vNeck = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.14, 0.04), shirtCollarMat);
    vNeck.position.set(0, 0.36, 0.13);
    this.torsoGroup.add(vNeck);

    if (this.archetype === 'tech_commuter' || this.archetype === 'student') {
      const backpack = new THREE.Mesh(backpackGeo, accessoryMatDark);
      backpack.position.set(0, 0.24, -0.16);
      this.torsoGroup.add(backpack);
    }

    // 4. Multi-Joint Articulated Arms (Shoulder -> Upper Arm -> Elbow -> Forearm -> Hand)
    const buildArm = (isLeft: boolean) => {
      const side = isLeft ? -1 : 1;
      const armPivot = new THREE.Group();
      armPivot.position.set(side * 0.215, 0.39, 0);
      this.torsoGroup.add(armPivot);

      const upperArm = new THREE.Mesh(upperArmGeo, cMat);
      upperArm.castShadow = true;
      armPivot.add(upperArm);

      const elbowPivot = new THREE.Group();
      elbowPivot.position.set(0, -0.24, 0);
      armPivot.add(elbowPivot);

      const forearm = new THREE.Mesh(forearmGeo, isShortSleeve ? sMat : cMat);
      forearm.castShadow = true;
      elbowPivot.add(forearm);

      const hand = new THREE.Mesh(handGeo, sMat);
      elbowPivot.add(hand);

      if (!isLeft && this.archetype === 'executive') {
        const briefcase = new THREE.Mesh(briefcaseGeo, accessoryMatTan);
        briefcase.position.set(0.05, -0.28, 0);
        elbowPivot.add(briefcase);
      }

      if (isLeft) {
        this.leftArmPivot = armPivot;
        this.leftElbowPivot = elbowPivot;
      } else {
        this.rightArmPivot = armPivot;
        this.rightElbowPivot = elbowPivot;
      }
    };

    buildArm(true);
    buildArm(false);

    // 5. Neck, Sculpted Head, Facial Features & Diverse Hairstyles
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.45, 0);
    this.torsoGroup.add(this.headGroup);

    const neck = new THREE.Mesh(neckGeo, sMat);
    neck.position.y = 0.04;
    this.headGroup.add(neck);

    const head = new THREE.Mesh(headGeo, sMat);
    head.position.set(0, 0.17, 0.01);
    head.castShadow = true;
    this.headGroup.add(head);

    const nose = new THREE.Mesh(noseGeo, sMat);
    nose.position.set(0, 0.165, 0.125);
    this.headGroup.add(nose);

    [-0.04, 0.04].forEach((ex) => {
      const eye = new THREE.Mesh(eyeGeo, pupilMat);
      eye.position.set(ex, 0.185, 0.112);
      this.headGroup.add(eye);
    });

    const hair = new THREE.Mesh(hairCapGeo, hMat);
    hair.position.set(0, 0.18, 0);
    hair.rotation.x = -0.16;
    this.headGroup.add(hair);

    // Add ponytail / bun on ~40% of pedestrians for natural crowd variety
    if (hash % 5 < 2) {
      const bun = new THREE.Mesh(hairBunGeo, hMat);
      bun.position.set(0, 0.19, -0.125);
      this.headGroup.add(bun);
    }
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

  private canCrossStreet(edge: SidewalkEdge, trafficLights: Map<string, TrafficLight>): boolean {
    if (!edge.trafficLightId || !edge.crossingAxis) return true;
    const tl = trafficLights.get(edge.trafficLightId);
    if (!tl) return true;
    const conflictingVehicleAxis = edge.crossingAxis === 'NS' ? 'EW' : 'NS';
    return tl.isRed(conflictingVehicleAxis);
  }

  private isVehicleInCrosswalk(edge: SidewalkEdge, vehicles: Vehicle[]): boolean {
    const midX = (edge.from.position.x + edge.to.position.x) * 0.5;
    const midZ = (edge.from.position.z + edge.to.position.z) * 0.5;

    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      if (!v.active || v.state === 'parked') continue;
      const dx = v.mesh.position.x - midX;
      const dz = v.mesh.position.z - midZ;
      if (dx * dx + dz * dz < 64) {
        return true;
      }
    }
    return false;
  }

  public update(
    delta: number,
    trafficLights: Map<string, TrafficLight>,
    vehicles: Vehicle[],
    nearbyPedestrians: Pedestrian[],
    physicsEngine: CityPhysicsEngine | null,
    playerPos?: THREE.Vector3
  ): boolean {
    const edge = this.activeEdge;
    if (!edge) return true;

    const pos = this.mesh.position;

    // 1. HANDLE PLAZA BROWSING PAUSE
    if (this.state === 'browsing_plaza') {
      this.waitTimer -= delta;
      this.animateLimbs(delta, 0);
      if (this.waitTimer <= 0) {
        this.state = 'walking';
      }
      return false;
    }

    // 2. HANDLE CROSSWALK SIGNAL & VEHICLE SAFETY GATE
    if (this.state === 'waiting_at_crosswalk') {
      const waitSpotX = edge.from.position.x + this.curbQueueOffset.x;
      const waitSpotZ = edge.from.position.z + this.curbQueueOffset.z;
      const dx = waitSpotX - pos.x;
      const dz = waitSpotZ - pos.z;
      const distToSpot = Math.hypot(dx, dz);

      if (distToSpot > 0.25) {
        const moveStep = Math.min(distToSpot, this.baseSpeed * 0.65 * delta);
        pos.x += (dx / distToSpot) * moveStep;
        pos.z += (dz / distToSpot) * moveStep;
        this.heading = Math.atan2(edge.direction.x, edge.direction.z);
        this.mesh.rotation.y = this.heading;
        this.animateLimbs(delta, this.baseSpeed * 0.6);
      } else {
        this.heading = Math.atan2(edge.direction.x, edge.direction.z);
        this.mesh.rotation.y = this.heading;
        this.animateLimbs(delta, 0);
      }

      if (this.canCrossStreet(edge, trafficLights) && !this.isVehicleInCrosswalk(edge, vehicles)) {
        this.state = 'crossing_street';
      }
      return false;
    }

    // 3. COMPUTE TARGET WAYPOINT WITH RIGHT-HAND SIDEWALK LANE OFFSET
    this.tmpRight.set(-edge.direction.z, 0, edge.direction.x);
    const activeLaneOffset = edge.type === 'crosswalk' ? this.laneOffset * 0.5 : this.laneOffset;
    const targetX = edge.to.position.x + this.tmpRight.x * activeLaneOffset;
    const targetZ = edge.to.position.z + this.tmpRight.z * activeLaneOffset;

    const toTargetX = targetX - pos.x;
    const toTargetZ = targetZ - pos.z;
    const distToTarget = Math.hypot(toTargetX, toTargetZ);

    // 4. WAYPOINT ARRIVAL & EDGE TRANSITION
    if (distToTarget < 0.85) {
      this.currentNode = edge.to;

      if (edge.to.isPlaza && Math.random() < 0.28) {
        this.state = 'browsing_plaza';
        this.waitTimer = 2.0 + Math.random() * 3.0;
      }

      this.currentEdgeIndex++;
      if (this.currentEdgeIndex >= this.route.length) {
        return true;
      }

      const nextEdge = this.route[this.currentEdgeIndex];
      if (nextEdge.type === 'crosswalk') {
        if (!this.canCrossStreet(nextEdge, trafficLights) || this.isVehicleInCrosswalk(nextEdge, vehicles)) {
          this.state = 'waiting_at_crosswalk';
          return false;
        } else {
          this.state = 'crossing_street';
        }
      } else {
        this.state = 'walking';
      }
      return false;
    }

    // 5. DESIRED VELOCITY TOWARD TARGET
    let desiredSpeed = this.baseSpeed;
    if (this.state === 'crossing_street') {
      if (edge.trafficLightId && edge.crossingAxis) {
        const tl = trafficLights.get(edge.trafficLightId);
        const conflictingAxis = edge.crossingAxis === 'NS' ? 'EW' : 'NS';
        if (tl && !tl.isRed(conflictingAxis)) {
          desiredSpeed = this.baseSpeed * 1.45;
        }
      }
    }

    this.tmpDesired.set(toTargetX / distToTarget, 0, toTargetZ / distToTarget);
    this.tmpSteer.copy(this.tmpDesired).multiplyScalar(desiredSpeed);

    // 6. SOCIAL FORCE CROWD AVOIDANCE (Pedestrian-to-Pedestrian Separation)
    const sepRadius = 1.65;
    const sepRadiusSq = sepRadius * sepRadius;

    for (let i = 0; i < nearbyPedestrians.length; i++) {
      const other = nearbyPedestrians[i];
      if (other === this) continue;

      const ox = pos.x - other.mesh.position.x;
      const oz = pos.z - other.mesh.position.z;
      const dSq = ox * ox + oz * oz;

      if (dSq > 0.0001 && dSq < sepRadiusSq) {
        const d = Math.sqrt(dSq);
        const strength = ((sepRadius - d) / sepRadius) * 2.2;
        this.tmpSteer.x += (ox / d) * strength;
        this.tmpSteer.z += (oz / d) * strength;
      }
    }

    // 7. DYNAMIC OBSTACLE AVOIDANCE (Player Avatar & Vehicles)
    if (playerPos) {
      const px = pos.x - playerPos.x;
      const pz = pos.z - playerPos.z;
      const pDistSq = px * px + pz * pz;
      if (pDistSq > 0.001 && pDistSq < 9.0) {
        const pDist = Math.sqrt(pDistSq);
        const push = ((3.0 - pDist) / 3.0) * 3.2;
        this.tmpSteer.x += (px / pDist) * push;
        this.tmpSteer.z += (pz / pDist) * push;
      }
    }

    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      if (!v.active) continue;
      const vx = pos.x - v.mesh.position.x;
      const vz = pos.z - v.mesh.position.z;
      const vDistSq = vx * vx + vz * vz;
      if (vDistSq > 0.001 && vDistSq < 18.0) {
        const vDist = Math.sqrt(vDistSq);
        const push = ((4.25 - vDist) / 4.25) * 4.0;
        this.tmpSteer.x += (vx / vDist) * push;
        this.tmpSteer.z += (vz / vDist) * push;
      }
    }

    // 8. BUILDING WALL WHISKER FEELER & SOLID COLLISION RESOLUTION
    if (physicsEngine) {
      const feelerDist = 1.15;
      const probeX = pos.x + this.tmpDesired.x * feelerDist;
      const probeZ = pos.z + this.tmpDesired.z * feelerDist;
      const res = physicsEngine.resolveHorizontalMovement(pos.x, pos.z, probeX, probeZ, pos.y, 0.42);
      if (res.blocked) {
        // Steer tangentially around building corner
        this.tmpSteer.x += -this.tmpDesired.z * 2.5;
        this.tmpSteer.z += this.tmpDesired.x * 2.5;
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
      const res = physicsEngine.resolveHorizontalMovement(pos.x, pos.z, nextX, nextZ, pos.y, 0.35);
      pos.x = res.x;
      pos.z = res.z;
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
      // Natural standing pose with subtle idle head turn & elbow relaxation
      const damp = Math.min(1.0, delta * 10.0);
      this.walkCycle += delta * 1.5;
      this.leftLegPivot.rotation.x *= 1 - damp;
      this.rightLegPivot.rotation.x *= 1 - damp;
      this.leftKneePivot.rotation.x *= 1 - damp;
      this.rightKneePivot.rotation.x *= 1 - damp;
      this.leftArmPivot.rotation.x *= 1 - damp;
      this.rightArmPivot.rotation.x *= 1 - damp;
      this.leftElbowPivot.rotation.x += (-0.15 - this.leftElbowPivot.rotation.x) * damp;
      this.rightElbowPivot.rotation.x += (-0.15 - this.rightElbowPivot.rotation.x) * damp;
      this.hipsGroup.position.y += (0.76 - this.hipsGroup.position.y) * damp;
      this.torsoGroup.rotation.y *= 1 - damp;
      this.headGroup.rotation.y = Math.sin(this.walkCycle * 0.7) * 0.12;
      return;
    }

    this.walkCycle += delta * speed * 4.2;
    const isJogging = this.archetype === 'jogger' || speed > 2.0;
    const hipSwing = Math.sin(this.walkCycle) * Math.min(0.65, speed * 0.30);

    // Hip flexion/extension (negative rotation.x swings leg forward along +Z)
    this.leftLegPivot.rotation.x = -hipSwing;
    this.rightLegPivot.rotation.x = hipSwing;

    // Articulated Knee Bend during swing phase (positive rotation.x bends lower leg backward)
    const kneeAmp = isJogging ? 0.88 : 0.54;
    this.leftKneePivot.rotation.x = Math.max(0, Math.sin(this.walkCycle - 0.6)) * kneeAmp + 0.04;
    this.rightKneePivot.rotation.x = Math.max(0, Math.sin(this.walkCycle + Math.PI - 0.6)) * kneeAmp + 0.04;

    // Counter-swinging shoulders & articulated elbows
    this.leftArmPivot.rotation.x = hipSwing * 0.82;
    this.rightArmPivot.rotation.x = -hipSwing * 0.82;

    const baseElbow = isJogging ? -0.95 : -0.28;
    this.leftElbowPivot.rotation.x = baseElbow - Math.max(0, -hipSwing) * 0.45;
    this.rightElbowPivot.rotation.x = baseElbow - Math.max(0, hipSwing) * 0.45;

    // Vertical pelvis stride bounce & upper torso counter-twist
    this.hipsGroup.position.y = 0.76 + Math.abs(Math.cos(this.walkCycle)) * (isJogging ? 0.042 : 0.022);
    this.torsoGroup.rotation.y = -hipSwing * 0.14;
    this.headGroup.rotation.y *= 0.9;
  }

  public dispose() {
    this.mesh.clear();
  }
}
