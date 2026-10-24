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


  // Optional user-provided full city model. Keep it as one district so the
  // original playable roads and collision system are not silently replaced.
  const controller = new AbortController();
  controllers.add(controller);
  const url = '/assets/buildings/city-upload.glb';
  fetch(url, { method: 'HEAD', signal: controller.signal })
    .then((response) => {
      if (!response.ok || disposed || (response.headers.get('content-type') || '').includes('text/html')) return null;
      return glbLoaderInstance.load(url);
    })
    .then((asset) => {
      if (!asset || disposed) return;
      const model = asset.scene.clone(true);
      const bounds = new THREE.Box3().setFromObject(model);
      if (bounds.isEmpty()) return;
      const size = bounds.getSize(new THREE.Vector3());
      // Fit the full imported city into a 280-unit-wide showcase district.
      const footprint = Math.max(size.x, size.z, 1);
      const scale = 280 / footprint;
      model.scale.setScalar(scale);
      const center = bounds.getCenter(new THREE.Vector3());
      model.position.set(420 - center.x * scale, -bounds.min.y * scale, 420 - center.z * scale);
      model.name = 'Imported City GLB District';
      model.userData.realCityGLB = true;
      group.add(model);
    })
    .catch((error) => {
      if (!disposed && (error as Error).name !== 'AbortError') {
        console.warn('[RealCityGLB] City model not loaded:', error);
      }
    });

  return () => {
    disposed = true;
    controllers.forEach((controller) => controller.abort());
    scene.remove(group);
    // Geometries/materials are shared with the GLB loader cache.
    group.clear();
  };
}
