/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export interface LoadedGLBAsset {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  cameras: THREE.Camera[];
  asset: any;
  parser: any;
  userData: any;
}

export class CustomGLBLoader {
  private loader: GLTFLoader;
  private dracoLoader: DRACOLoader | null = null;
  private cache: Map<string, Promise<LoadedGLBAsset>> = new Map();

  constructor() {
    this.loader = new GLTFLoader();
    try {
      this.dracoLoader = new DRACOLoader();
      this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
      this.loader.setDRACOLoader(this.dracoLoader);
    } catch (err) {
      console.warn('[CustomGLBLoader] DRACOLoader initialization deferred:', err);
    }
  }

  /**
   * Load a GLB or GLTF asset with caching, promise sharing, and PBR material setup
   */
  public async load(url: string, onProgress?: (event: ProgressEvent) => void): Promise<LoadedGLBAsset> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    const loadPromise = new Promise<LoadedGLBAsset>((resolve, reject) => {
      this.loader.load(
        url,
        (gltf: GLTF) => {
          // Traverse and configure shadows and PBR materials
          gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;

              if (mesh.material) {
                const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                materials.forEach((mat) => {
                  if ((mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
                    const stdMat = mat as THREE.MeshStandardMaterial;
                    stdMat.envMapIntensity = 1.2;
                    stdMat.needsUpdate = true;
                  }
                });
              }
            }
          });

          const result: LoadedGLBAsset = {
            scene: gltf.scene,
            animations: gltf.animations || [],
            cameras: gltf.cameras || [],
            asset: gltf.asset,
            parser: gltf.parser,
            userData: gltf.userData,
          };

          resolve(result);
        },
        onProgress,
        (error) => {
          console.warn(`[CustomGLBLoader] Failed to load ${url}:`, error);
          reject(error);
        }
      );
    });

    this.cache.set(url, loadPromise);
    return loadPromise;
  }

  public dispose() {
    if (this.dracoLoader) {
      this.dracoLoader.dispose();
    }
    this.cache.clear();
  }
}

export const glbLoaderInstance = new CustomGLBLoader();
