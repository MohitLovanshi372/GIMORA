/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { glbLoaderInstance, LoadedGLBAsset } from '../assets/GLBLoader';

export interface GLBModelMetadata {
  id: string;
  name: string;
  category: 'landmark' | 'vehicle' | 'prop' | 'custom';
  vertexCount: number;
  triangleCount: number;
  meshCount: number;
  fileSizeBytes?: number;
  blobUrl?: string;
  object?: THREE.Object3D;
}

export class GLBModelService {
  private static exporter = new GLTFExporter();
  private static userLoadedModels: Map<string, GLBModelMetadata> = new Map();

  /**
   * Export any Three.js 3D object to a real binary GLB Blob
   */
  public static async exportToGLB(
    object: THREE.Object3D,
    options: { binary?: boolean; embedImages?: boolean } = { binary: true, embedImages: true }
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.exporter.parse(
        object,
        (result) => {
          if (result instanceof ArrayBuffer) {
            const blob = new Blob([result], { type: 'model/gltf-binary' });
            resolve(blob);
          } else {
            const output = JSON.stringify(result, null, 2);
            const blob = new Blob([output], { type: 'application/json' });
            resolve(blob);
          }
        },
        (error) => {
          console.error('[GLBModelService] Export failed:', error);
          reject(error);
        },
        {
          binary: options.binary !== false,
          embedImages: options.embedImages !== false,
        }
      );
    });
  }

  /**
   * Download a 3D object as a real `.glb` file to the user's computer
   */
  public static async downloadGLB(object: THREE.Object3D, filename: string = 'dubai-model.glb'): Promise<void> {
    const blob = await this.exportToGLB(object, { binary: true });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.glb') ? filename : `${filename}.glb`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  /**
   * Load any user-selected `.glb` or `.gltf` file directly into memory
   */
  public static async loadUserFile(file: File): Promise<GLBModelMetadata> {
    const blobUrl = URL.createObjectURL(file);
    const loaded: LoadedGLBAsset = await glbLoaderInstance.load(blobUrl);

    // Compute polygon and vertex stats
    let vertexCount = 0;
    let triangleCount = 0;
    let meshCount = 0;

    loaded.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        meshCount++;
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) {
          const geo = mesh.geometry;
          if (geo.attributes.position) {
            vertexCount += geo.attributes.position.count;
          }
          if (geo.index) {
            triangleCount += geo.index.count / 3;
          } else if (geo.attributes.position) {
            triangleCount += geo.attributes.position.count / 3;
          }
        }
      }
    });

    const meta: GLBModelMetadata = {
      id: `user-glb-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      category: 'custom',
      vertexCount,
      triangleCount: Math.round(triangleCount),
      meshCount,
      fileSizeBytes: file.size,
      blobUrl,
      object: loaded.scene,
    };

    this.userLoadedModels.set(meta.id, meta);
    return meta;
  }

  /**
   * Generates a real GLB binary representation of an object and returns a loadable Blob URL
   */
  public static async convertToGLBBlobUrl(object: THREE.Object3D): Promise<string> {
    const blob = await this.exportToGLB(object, { binary: true });
    return URL.createObjectURL(blob);
  }

  public static getLoadedUserModels(): GLBModelMetadata[] {
    return Array.from(this.userLoadedModels.values());
  }

  public static getModelById(id: string): GLBModelMetadata | undefined {
    return this.userLoadedModels.get(id);
  }
}
