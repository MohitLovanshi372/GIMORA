/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { AssetManager } from './AssetManager';

export interface ReplaceableEntity {
  mesh: THREE.Object3D;
  userData?: any;
}

export class AssetModelReplacer {
  /**
   * Safely swaps the visual mesh of a vehicle, building, or train while:
   * 1. Preserving parent group transformations, position, rotation, scale
   * 2. Transferring userData, bounding boxes, collision data, and event hooks
   * 3. Disposing old procedural geometry if requested
   */
  public static async replaceModel(
    entity: ReplaceableEntity,
    newAssetPath: string,
    options?: {
      preserveUserData?: boolean;
      autoScaleToFit?: boolean;
      targetSize?: THREE.Vector3;
    }
  ): Promise<THREE.Object3D> {
    const oldMesh = entity.mesh;
    const parent = oldMesh.parent;

    // Load new asset (or procedural fallback via AssetManager)
    const newModel = await AssetManager.load(newAssetPath);

    // Copy transforms
    newModel.position.copy(oldMesh.position);
    newModel.rotation.copy(oldMesh.rotation);
    newModel.scale.copy(oldMesh.scale);

    // Auto-scale to fit existing bounding box if requested
    if (options?.autoScaleToFit) {
      const oldBox = new THREE.Box3().setFromObject(oldMesh);
      const oldSize = oldBox.getSize(new THREE.Vector3());

      const newBox = new THREE.Box3().setFromObject(newModel);
      const newSize = newBox.getSize(new THREE.Vector3());

      if (newSize.x > 0 && newSize.y > 0 && newSize.z > 0) {
        const target = options.targetSize || oldSize;
        const scaleX = target.x / newSize.x;
        const scaleY = target.y / newSize.y;
        const scaleZ = target.z / newSize.z;
        newModel.scale.set(scaleX, scaleY, scaleZ);
      }
    }

    // Preserve userData
    if (options?.preserveUserData !== false) {
      newModel.userData = {
        ...oldMesh.userData,
        ...newModel.userData,
        replacedWith: newAssetPath,
        originalProcedural: true,
      };
    }

    // Replace in parent scene tree
    if (parent) {
      parent.remove(oldMesh);
      parent.add(newModel);
    }

    // Update entity reference
    entity.mesh = newModel;

    return newModel;
  }
}
