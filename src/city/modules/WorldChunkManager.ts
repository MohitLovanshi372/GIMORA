/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export type ChunkDetailLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ChunkDefinition {
  id: string;
  name: string;
  gridX: number;
  gridZ: number;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  center: THREE.Vector3;
  currentLod: ChunkDetailLevel;
  highDetailGroup: THREE.Group;
  mediumDetailGroup: THREE.Group;
  lowDetailGroup: THREE.Group;
  objectsCount: number;
}

export class WorldChunkManager {
  private chunks: Map<string, ChunkDefinition> = new Map();
  private scene: THREE.Scene;
  private rootGroup: THREE.Group;
  private lastUpdatePosition = new THREE.Vector3(9999, 9999, 9999);
  private updateThreshold = 8.0; // only recalculate chunk LOD when camera moves > 8m

  // Distance thresholds
  private highDistance = 110.0;
  private mediumDistance = 260.0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'world_chunk_streaming_system';
    this.scene.add(this.rootGroup);
    this.initGrid();
  }

  private initGrid() {
    // 4x4 Grid covering -280 to +280 on X and Z
    const gridSize = 4;
    const minCoord = -280;
    const maxCoord = 280;
    const chunkSize = (maxCoord - minCoord) / gridSize; // 140m per chunk

    let chunkIndex = 1;
    for (let gx = 0; gx < gridSize; gx++) {
      for (let gz = 0; gz < gridSize; gz++) {
        const minX = minCoord + gx * chunkSize;
        const maxX = minX + chunkSize;
        const minZ = minCoord + gz * chunkSize;
        const maxZ = minZ + chunkSize;

        const center = new THREE.Vector3(
          (minX + maxX) / 2,
          0,
          (minZ + maxZ) / 2
        );

        const pad = (n: number) => n.toString().padStart(2, '0');
        const chunkId = `CityChunk_${pad(chunkIndex)}`;

        const highGroup = new THREE.Group();
        highGroup.name = `${chunkId}_HIGH`;
        const medGroup = new THREE.Group();
        medGroup.name = `${chunkId}_MED`;
        const lowGroup = new THREE.Group();
        lowGroup.name = `${chunkId}_LOW`;

        this.rootGroup.add(highGroup, medGroup, lowGroup);

        this.chunks.set(chunkId, {
          id: chunkId,
          name: `Sector ${String.fromCharCode(65 + gx)}${gz + 1}`,
          gridX: gx,
          gridZ: gz,
          bounds: { minX, maxX, minZ, maxZ },
          center,
          currentLod: 'HIGH',
          highDetailGroup: highGroup,
          mediumDetailGroup: medGroup,
          lowDetailGroup: lowGroup,
          objectsCount: 0,
        });

        chunkIndex++;
      }
    }
  }

  /**
   * Find which chunk a world position belongs to
   */
  public getChunkForPosition(x: number, z: number): ChunkDefinition | undefined {
    for (const chunk of this.chunks.values()) {
      if (
        x >= chunk.bounds.minX &&
        x < chunk.bounds.maxX &&
        z >= chunk.bounds.minZ &&
        z < chunk.bounds.maxZ
      ) {
        return chunk;
      }
    }
    return undefined;
  }

  /**
   * Register an object into a specific chunk and LOD tier
   */
  public registerObject(
    x: number,
    z: number,
    object: THREE.Object3D,
    tier: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH'
  ) {
    const chunk = this.getChunkForPosition(x, z);
    if (!chunk) {
      this.scene.add(object);
      return;
    }

    if (tier === 'HIGH') {
      chunk.highDetailGroup.add(object);
    } else if (tier === 'MEDIUM') {
      chunk.mediumDetailGroup.add(object);
    } else {
      chunk.lowDetailGroup.add(object);
    }
    chunk.objectsCount++;
  }

  /**
   * Update chunk LOD states based on player/camera position
   */
  public update(viewerPosition: THREE.Vector3) {
    if (viewerPosition.distanceTo(this.lastUpdatePosition) < this.updateThreshold) {
      return;
    }
    this.lastUpdatePosition.copy(viewerPosition);

    for (const chunk of this.chunks.values()) {
      const dist = new THREE.Vector2(viewerPosition.x, viewerPosition.z).distanceTo(
        new THREE.Vector2(chunk.center.x, chunk.center.z)
      );

      let newLod: ChunkDetailLevel;
      if (dist < this.highDistance) {
        newLod = 'HIGH';
      } else if (dist < this.mediumDistance) {
        newLod = 'MEDIUM';
      } else {
        newLod = 'LOW';
      }

      if (newLod !== chunk.currentLod) {
        chunk.currentLod = newLod;
        this.applyLod(chunk);
      }
    }
  }

  private applyLod(chunk: ChunkDefinition) {
    switch (chunk.currentLod) {
      case 'HIGH':
        chunk.highDetailGroup.visible = true;
        chunk.mediumDetailGroup.visible = true;
        chunk.lowDetailGroup.visible = false;
        break;
      case 'MEDIUM':
        chunk.highDetailGroup.visible = false;
        chunk.mediumDetailGroup.visible = true;
        chunk.lowDetailGroup.visible = false;
        break;
      case 'LOW':
        chunk.highDetailGroup.visible = false;
        chunk.mediumDetailGroup.visible = false;
        chunk.lowDetailGroup.visible = true;
        break;
    }
  }

  public getChunkMetrics() {
    let highCount = 0;
    let medCount = 0;
    let lowCount = 0;

    for (const c of this.chunks.values()) {
      if (c.currentLod === 'HIGH') highCount++;
      else if (c.currentLod === 'MEDIUM') medCount++;
      else lowCount++;
    }

    return {
      totalChunks: this.chunks.size,
      activeHighChunks: highCount,
      activeMedChunks: medCount,
      activeLowChunks: lowCount,
    };
  }

  public dispose() {
    this.scene.remove(this.rootGroup);
    this.chunks.clear();
  }
}
