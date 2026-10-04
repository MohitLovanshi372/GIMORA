/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { glbLoaderInstance, LoadedGLBAsset } from './GLBLoader';
import { ASSET_REGISTRY, AssetDefinition } from './AssetRegistry';

export class AssetManagerClass {
  private cache: Map<string, THREE.Object3D> = new Map();
  private loadingPromises: Map<string, Promise<THREE.Object3D>> = new Map();
  private mixers: THREE.AnimationMixer[] = [];
  private failedAssets: Set<string> = new Set();

  /**
   * Load any registered or direct asset path with guaranteed procedural fallback
   * e.g. AssetManager.load("vehicles/sports-car.glb")
   */
  public async load(assetPath: string): Promise<THREE.Object3D> {
    // 1. Return cached template clone if ready
    if (this.cache.has(assetPath)) {
      return this.cloneAsset(this.cache.get(assetPath)!);
    }

    // 2. Reuse ongoing load promise
    if (this.loadingPromises.has(assetPath)) {
      const template = await this.loadingPromises.get(assetPath)!;
      return this.cloneAsset(template);
    }

    const loadPromise = this.internalLoad(assetPath);
    this.loadingPromises.set(assetPath, loadPromise);

    try {
      const template = await loadPromise;
      this.cache.set(assetPath, template);
      this.loadingPromises.delete(assetPath);
      return this.cloneAsset(template);
    } catch (err) {
      console.warn(`[AssetManager] Asset ${assetPath} failed to load, invoking procedural fallback:`, err);
      this.failedAssets.add(assetPath);
      const fallback = this.getFallback(assetPath);
      this.cache.set(assetPath, fallback);
      this.loadingPromises.delete(assetPath);
      return this.cloneAsset(fallback);
    }
  }

  private async internalLoad(assetPath: string): Promise<THREE.Object3D> {
    const url = assetPath.startsWith('http') || assetPath.startsWith('/')
      ? assetPath
      : `/assets/${assetPath}`;

    try {
      const loaded: LoadedGLBAsset = await glbLoaderInstance.load(url);
      const root = loaded.scene;
      root.name = `asset_${assetPath.replace(/[/.]/g, '_')}`;

      // Set scale / rotation from registry if registered
      const def = ASSET_REGISTRY[assetPath];
      if (def?.scale) {
        root.scale.setScalar(def.scale);
      }
      if (def?.rotation) {
        root.rotation.set(def.rotation[0], def.rotation[1], def.rotation[2]);
      }

      // If animations exist, store on userData for caller to bind mixer
      if (loaded.animations && loaded.animations.length > 0) {
        root.userData.animations = loaded.animations;
      }

      return root;
    } catch {
      // If network load fails (e.g. 404 in preview environment), return procedural fallback
      return this.getFallback(assetPath);
    }
  }

  /**
   * Procedural fallback provider
   */
  public getFallback(assetPath: string): THREE.Object3D {
    const def: AssetDefinition | undefined = ASSET_REGISTRY[assetPath];
    if (def && def.proceduralFallback) {
      const obj = def.proceduralFallback();
      obj.userData.isProceduralFallback = true;
      obj.userData.assetPath = assetPath;
      return obj;
    }

    // Generic geometry fallback
    const fallbackBox = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshStandardMaterial({ color: 0x00f0ff, wireframe: true })
    );
    fallbackBox.name = `generic_fallback_${assetPath}`;
    fallbackBox.userData.isProceduralFallback = true;
    fallbackBox.userData.assetPath = assetPath;
    return fallbackBox;
  }

  /**
   * Clone a mesh hierarchy safely, keeping materials and geometry references clean
   */
  public cloneAsset(source: THREE.Object3D): THREE.Object3D {
    const clone = source.clone(true);

    // Deep clone materials where unique uniforms or emissive colors are needed
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => m.clone());
        } else if (mesh.material) {
          mesh.material = mesh.material.clone();
        }
      }
    });

    if (source.userData.animations) {
      clone.userData.animations = source.userData.animations;
    }

    return clone;
  }

  /**
   * Bind and play animations for an asset instance
   */
  public createMixer(object: THREE.Object3D): THREE.AnimationMixer | null {
    if (!object.userData.animations || object.userData.animations.length === 0) {
      return null;
    }
    const mixer = new THREE.AnimationMixer(object);
    object.userData.animations.forEach((clip: THREE.AnimationClip) => {
      mixer.clipAction(clip).play();
    });
    this.mixers.push(mixer);
    return mixer;
  }

  /**
   * Update all active animation mixers
   */
  public update(delta: number) {
    for (let i = this.mixers.length - 1; i >= 0; i--) {
      this.mixers[i].update(delta);
    }
  }

  /**
   * Clear cache and mixers
   */
  public dispose() {
    this.mixers.forEach((m) => m.stopAllAction());
    this.mixers = [];
    this.cache.clear();
    this.loadingPromises.clear();
  }
}

export const AssetManager = new AssetManagerClass();
