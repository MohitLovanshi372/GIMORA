/** Optional licensed GLB city dressing. Models go in public/assets/buildings/.
 * Missing files are skipped so the existing world keeps running.
 */
import * as THREE from 'three';
import { glbLoaderInstance } from '../assets/GLBLoader';

const MODELS = [
  { file: 'office-tower.glb', positions: [[-105, 0, -95], [-145, 0, -140]] },
  { file: 'apartment-block.glb', positions: [[112, 0, 125], [145, 0, 145]] },
  { file: 'shop-row.glb', positions: [[-90, 0, 150], [92, 0, -145]] },
  { file: 'residential-home.glb', positions: [[128, 0, 165], [145, 0, 182], [165, 0, 160]] },
  { file: 'residential-home-b.glb', positions: [[-125, 0, 175], [-150, 0, 185], [-168, 0, 165]] },
] as const;

export function addRealCityGLBModels(scene: THREE.Scene): () => void {
  const group = new THREE.Group();
  group.name = 'optional_real_city_glb';
  scene.add(group);
  let disposed = false;
  const controllers = new Set<AbortController>();

  for (const item of MODELS) {
    const url = '/assets/buildings/' + item.file;
    const controller = new AbortController();
    controllers.add(controller);
    // Avoid loading absent models: the existing procedural city stays available.
    fetch(url, { method: 'HEAD', signal: controller.signal })
      .then((response) => {
        if (!response.ok || disposed) return null;
        const type = response.headers.get('content-type') || '';
        // Vite's HTML fallback may return 200 for a nonexistent URL.
        if (type.includes('text/html')) return null;
        return glbLoaderInstance.load(url);
      })
      .then((asset) => {
        if (!asset || disposed) return;
        for (const coords of item.positions) {
          const model = asset.scene.clone(true);
          model.position.set(coords[0], coords[1], coords[2]);
          // Asset scale is authored in its GLB (meters/Y-up).
          model.userData.realCityGLB = true;
          group.add(model);
        }
      })
      .catch((error) => {
        if (!disposed && (error as Error).name !== 'AbortError') {
          console.warn('[RealCityGLB] Skipped', url, error);
        }
      });
  }

  return () => {
    disposed = true;
    controllers.forEach((controller) => controller.abort());
    scene.remove(group);
    // Geometries/materials are shared with the GLB loader cache.
    group.clear();
  };
}
