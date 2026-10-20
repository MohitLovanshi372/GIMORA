/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { BuildingData } from '../types';

export interface BuildingCollider {
  id: string;
  shape: 'box' | 'cylinder';
  centerX: number;
  centerZ: number;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  radius: number;
  maxY: number;
}

export interface MovementResolution {
  x: number;
  z: number;
  blocked: boolean;
  hitColliderId: string | null;
}

// Pre-allocated vectors for zero-GC runtime physics queries
const _rayDir = new THREE.Vector3();

export class CityPhysicsEngine {
  private cellSize = 20;
  private grid: Map<string, BuildingCollider[]> = new Map();
  private allColliders: BuildingCollider[] = [];

  // River geometry constants matching RiverDistrict.ts
  private readonly riverHalfWidth = 27.2;
  private readonly bridgeSpans = [
    { zCenter: 0, halfWidth: 13.5, archHeight: 3.8 },    // Grand Central Bridge
    { zCenter: -160, halfWidth: 11.5, archHeight: 3.4 }, // North Bridge
    { zCenter: 160, halfWidth: 11.5, archHeight: 3.4 },  // South Bridge
  ];

  constructor() {
    // Colliders are initialized via registerBuildingsList and initStaticCityBlockColliders
  }

  private getCellKey(cx: number, cz: number): string {
    return `${cx},${cz}`;
  }

  private insertIntoGrid(collider: BuildingCollider) {
    this.allColliders.push(collider);
    const minCellX = Math.floor(collider.minX / this.cellSize);
    const maxCellX = Math.floor(collider.maxX / this.cellSize);
    const minCellZ = Math.floor(collider.minZ / this.cellSize);
    const maxCellZ = Math.floor(collider.maxZ / this.cellSize);

    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cz = minCellZ; cz <= maxCellZ; cz++) {
        const key = this.getCellKey(cx, cz);
        let cell = this.grid.get(key);
        if (!cell) {
          cell = [];
          this.grid.set(key, cell);
        }
        cell.push(collider);
      }
    }
  }

  public registerBoxCollider(
    id: string,
    centerX: number,
    centerZ: number,
    width: number,
    depth: number,
    maxY: number
  ) {
    const halfW = width * 0.5;
    const halfD = depth * 0.5;
    const collider: BuildingCollider = {
      id,
      shape: 'box',
      centerX,
      centerZ,
      minX: centerX - halfW,
      maxX: centerX + halfW,
      minZ: centerZ - halfD,
      maxZ: centerZ + halfD,
      radius: Math.hypot(halfW, halfD),
      maxY,
    };
    this.insertIntoGrid(collider);
  }

  public registerCylinderCollider(
    id: string,
    centerX: number,
    centerZ: number,
    radius: number,
    maxY: number
  ) {
    const collider: BuildingCollider = {
      id,
      shape: 'cylinder',
      centerX,
      centerZ,
      minX: centerX - radius,
      maxX: centerX + radius,
      minZ: centerZ - radius,
      maxZ: centerZ + radius,
      radius,
      maxY,
    };
    this.insertIntoGrid(collider);
  }

  public registerBuildingsList(buildings?: BuildingData[]) {
    if (!buildings || !Array.isArray(buildings)) return;
    for (const b of buildings) {
      if (!b || !b.position || !b.dimensions) continue;
      const [bx, , bz] = b.position;
      // Include podium base footprint (+2.4m around main dimensions)
      const w = (b.dimensions[0] || 18) + 2.4;
      const d = (b.dimensions[2] || 18) + 2.4;
      const h = b.height || b.dimensions[1] || 40;
      this.registerBoxCollider(b.id, bx, bz, w, d, h);
    }
  }

  /**
   * Registers all instanced city-block skyscrapers using the exact deterministic
   * coordinates, dimensions, and landmark exclusion zones from BuildingsManager.ts.
   */
  public initStaticCityBlockColliders(registeredLandmarks: BuildingData[] = []) {
    const xSectors = [-272, -210, -154, -126, -72, 72, 126, 154, 210, 272];
    const zSectors = [-285, -188, -125, -58, -28, 28, 58, 125, 190, 240, 285];

    for (const bx of xSectors) {
      for (const bz of zSectors) {
        if (Math.abs(bx) < 56) continue; // river & waterfront avenues
        if (Math.abs(bz - -220) < 28) continue; // railway corridor
        if (bx > 20 && bz < -260) continue; // airport tarmac & runway zone
        if (Math.abs(bx - -72) < 20 && bz >= -78 && bz <= -14) continue; // Central Riverside Emerald Park
        if (Math.abs(bx - 72) < 20 && bz >= 102 && bz <= 148) continue; // Tech Arboretum Park
        if (Math.abs(bx - -140) < 34 && Math.abs(bz - -188) < 22) continue; // West Bank Railway Terminal
        if (Math.abs(bx - 140) < 24 && Math.abs(bz - -188) < 22) continue; // East Bank Railway Control Tower
        if (Math.abs(bx - -210) < 18 && Math.abs(bz - -18) < 18) continue; // West EV Parking Lot
        if (Math.abs(bx - 210) < 18 && Math.abs(bz - 18) < 18) continue; // East EV Parking Lot
        if (Math.abs(bx - -272) < 20 && (Math.abs(bz - 125) < 20 || Math.abs(bz - 190) < 20)) continue; // Medical Helipad & Ambulance Bays

        const overlapsLandmark = registeredLandmarks.some((b) => {
          const bw = (b.dimensions[0] || 24) * 0.5 + 13;
          const bd = (b.dimensions[2] || 24) * 0.5 + 13;
          return Math.abs(bx - b.position[0]) < bw && Math.abs(bz - b.position[2]) < bd;
        });
        if (overlapsLandmark) continue;

        const hNoise = Math.sin(bx * 0.05 + bz * 0.07) * 0.5 + 0.5;
        const totalH = 26 + hNoise * 76;
        const maxBlockDepth = Math.abs(bz - 240) < 5 ? 12 : 20;
        const w = 14 + (Math.cos(bx * 0.1) * 0.5 + 0.5) * 6;
        const d = Math.min(maxBlockDepth, 14 + (Math.sin(bz * 0.1) * 0.5 + 0.5) * 6);

        // Register solid podium + tower footprint
        this.registerBoxCollider(
          `block_tower_${bx}_${bz}`,
          bx,
          bz,
          w + 2.2,
          d + 2.2,
          totalH + 3.2
        );
      }
    }
  }

  /**
   * Returns true if (x, z) is on one of the 3 river bridges.
   */
  public isOnBridge(x: number, z: number): boolean {
    if (Math.abs(x) > 34) return false;
    for (const br of this.bridgeSpans) {
      if (Math.abs(z - br.zCenter) <= br.halfWidth) {
        return true;
      }
    }
    return false;
  }

  /**
   * Computes exact walkable surface elevation at (x, z), including
   * bridge decks, park terraces, and raised sidewalks vs. asphalt streets.
   */
  public getGroundHeightAt(x: number, z: number): number {
    // 1. River bridge arch deck elevation
    if (Math.abs(x) <= 34) {
      for (const br of this.bridgeSpans) {
        if (Math.abs(z - br.zCenter) <= br.halfWidth) {
          const normX = Math.min(1, Math.abs(x) / 34);
          return 0.22 + Math.cos(normX * Math.PI * 0.5) * br.archHeight;
        }
      }
    }

    // 2. Central Riverside Park & East Tech Arboretum Park elevated terraces
    if (x >= -87 && x <= -57 && z >= -77 && z <= -15) {
      return 0.26;
    }
    if (x >= 58 && x <= 86 && z >= 102 && z <= 148) {
      return 0.26;
    }

    // 3. Raised sidewalks/plazas around building blocks (+0.18m) vs asphalt road lanes (0.0m)
    const nsRoads = [-240, -180, -100, -45, 45, 100, 180, 240];
    const ewRoads = [-260, -160, -90, 0, 90, 160, 220, 260];
    const onAsphaltX = nsRoads.some((rx) => Math.abs(x - rx) < 7.0);
    const onAsphaltZ = ewRoads.some((rz) => Math.abs(z - rz) < (rz === 0 ? 9.0 : 7.0));
    if (!onAsphaltX && !onAsphaltZ) {
      return 0.18;
    }

    return 0.0;
  }

  /**
   * Checks if a circular actor of given radius at (x, z, y) intersects any solid building collider
   * or the unbridged river water channel.
   */
  public checkCollisionAt(
    x: number,
    z: number,
    y: number,
    radius: number
  ): BuildingCollider | string | null {
    // 1. Prevent walking into the open river channel unless on a bridge
    if (Math.abs(x) < this.riverHalfWidth + radius && y < 6.0) {
      if (!this.isOnBridge(x, z)) {
        return 'river_embankment_wall';
      }
    }

    // 2. Query spatial hash grid cells overlapping actor radius
    const minCellX = Math.floor((x - radius) / this.cellSize);
    const maxCellX = Math.floor((x + radius) / this.cellSize);
    const minCellZ = Math.floor((z - radius) / this.cellSize);
    const maxCellZ = Math.floor((z + radius) / this.cellSize);

    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cz = minCellZ; cz <= maxCellZ; cz++) {
        const cell = this.grid.get(this.getCellKey(cx, cz));
        if (!cell) continue;

        for (let i = 0; i < cell.length; i++) {
          const col = cell[i];
          if (y > col.maxY) continue;

          if (col.shape === 'cylinder') {
            const distSq = (x - col.centerX) ** 2 + (z - col.centerZ) ** 2;
            const minDist = col.radius + radius;
            if (distSq < minDist * minDist) {
              return col;
            }
          } else {
            // AABB vs Circle test
            const closestX = Math.max(col.minX, Math.min(x, col.maxX));
            const closestZ = Math.max(col.minZ, Math.min(z, col.maxZ));
            const dx = x - closestX;
            const dz = z - closestZ;
            if (dx * dx + dz * dz < radius * radius) {
              return col;
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Strict Solid Wall Stopping Solver:
   * Evaluates candidate horizontal movement from (startX, startZ) to (targetX, targetZ).
   * If the path intersects a solid building wall or parapet, movement strictly halts
   * at the contact boundary without passing or sliding through the structure.
   */
  public resolveHorizontalMovement(
    startX: number,
    startZ: number,
    targetX: number,
    targetZ: number,
    currentY: number,
    radius: number = 0.75
  ): MovementResolution {
    // Clamp to outer metropolis perimeter
    const clampedX = THREE.MathUtils.clamp(targetX, -275, 275);
    const clampedZ = THREE.MathUtils.clamp(targetZ, -340, 275);

    // Sub-step sweep along the movement vector so high-speed sprinting cannot tunnel
    const steps = 4;
    let lastValidX = startX;
    let lastValidZ = startZ;

    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const testX = startX + (clampedX - startX) * t;
      const testZ = startZ + (clampedZ - startZ) * t;

      const hit = this.checkCollisionAt(testX, testZ, currentY, radius);
      if (hit) {
        // Strict solid wall stop: halt immediately at the last unblocked sub-step
        const hitId = typeof hit === 'string' ? hit : hit.id;
        return {
          x: lastValidX,
          z: lastValidZ,
          blocked: true,
          hitColliderId: hitId,
        };
      }

      lastValidX = testX;
      lastValidZ = testZ;
    }

    return {
      x: lastValidX,
      z: lastValidZ,
      blocked: false,
      hitColliderId: null,
    };
  }

  /**
   * Spring-arm camera occlusion solver:
   * Prevents third-person or orbit cameras from clipping inside buildings or below the ground.
   */
  public resolveCameraOcclusion(
    targetPos: THREE.Vector3,
    desiredCamPos: THREE.Vector3,
    minGroundClearance: number = 1.2
  ): THREE.Vector3 {
    _rayDir.subVectors(desiredCamPos, targetPos);
    const totalDist = _rayDir.length();
    if (totalDist < 0.01) return desiredCamPos;

    _rayDir.divideScalar(totalDist);
    const samples = 12;
    let safeDist = totalDist;

    for (let i = 1; i <= samples; i++) {
      const d = (i / samples) * totalDist;
      const sx = targetPos.x + _rayDir.x * d;
      const sy = targetPos.y + _rayDir.y * d;
      const sz = targetPos.z + _rayDir.z * d;

      const hit = this.checkCollisionAt(sx, sz, sy, 0.55);
      if (hit && typeof hit !== 'string') {
        safeDist = Math.max(2.2, ((i - 1) / samples) * totalDist);
        break;
      }
    }

    const finalPos = targetPos.clone().addScaledVector(_rayDir, safeDist);
    const groundY = this.getGroundHeightAt(finalPos.x, finalPos.z);
    if (finalPos.y < groundY + minGroundClearance) {
      finalPos.y = groundY + minGroundClearance;
    }
    return finalPos;
  }
}
