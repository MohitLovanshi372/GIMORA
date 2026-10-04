/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CityMaterials } from '../assets/materials';

export interface EnvironmentSystem {
  group: THREE.Group;
  dirLight: THREE.DirectionalLight;
  ambientLight: THREE.AmbientLight;
  districtLights: THREE.PointLight[];
  update: (time: number) => void;
  dispose: () => void;
}

export function createEnvironment(
  scene: THREE.Scene,
  materials: CityMaterials
): EnvironmentSystem {
  const group = new THREE.Group();
  group.name = 'environment_system';

  // 1. NIGHT ATMOSPHERIC FOG
  const fogColor = new THREE.Color(0x060814);
  scene.background = fogColor;
  scene.fog = new THREE.FogExp2(fogColor.getHex(), 0.0016);

  // 2. PRIMARY ILLUMINATION
  // Deep indigo ambient light
  const ambientLight = new THREE.AmbientLight(0x0a1428, 1.25);
  group.add(ambientLight);

  // Cool moonlight directional light with high-resolution soft shadows
  const dirLight = new THREE.DirectionalLight(0x4070a0, 1.85);
  dirLight.position.set(160, 260, 120);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 10;
  dirLight.shadow.camera.far = 750;
  const shadowRange = 300;
  dirLight.shadow.camera.left = -shadowRange;
  dirLight.shadow.camera.right = shadowRange;
  dirLight.shadow.camera.top = shadowRange;
  dirLight.shadow.camera.bottom = -shadowRange;
  dirLight.shadow.bias = -0.0004;
  group.add(dirLight);

  // Hemisphere ground bounce for rich lower shadow fill
  const hemiLight = new THREE.HemisphereLight(0x182848, 0x050810, 0.95);
  group.add(hemiLight);

  // 3. DISTRICT ACCENT POINT LIGHTS
  const districtLights: THREE.PointLight[] = [];
  const accentConfigs = [
    { color: 0x00f0ff, pos: [-110, 25, 0], intensity: 4, dist: 160 },      // Downtown
    { color: 0x00ffaa, pos: [140, 25, -80], intensity: 4, dist: 150 },     // Technology & Mohit Hub
    { color: 0xa855f7, pos: [-160, 25, -170], intensity: 3.5, dist: 140 }, // Education
    { color: 0x06b6d4, pos: [-160, 25, 170], intensity: 3.5, dist: 140 },  // Healthcare
    { color: 0xf59e0b, pos: [150, 25, 170], intensity: 3.5, dist: 140 },   // Residential
    { color: 0xff007f, pos: [0, 25, 220], intensity: 4.5, dist: 160 },     // Entertainment
    { color: 0x3b82f6, pos: [0, 25, -220], intensity: 4, dist: 160 },     // Railway
    { color: 0x00e5ff, pos: [0, 15, 0], intensity: 3.5, dist: 150 },       // Riverside
  ];

  accentConfigs.forEach((cfg) => {
    const pLight = new THREE.PointLight(cfg.color, cfg.intensity, cfg.dist, 1.4);
    pLight.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
    districtLights.push(pLight);
    group.add(pLight);

    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 8, 8),
      new THREE.MeshBasicMaterial({ color: cfg.color })
    );
    orb.position.copy(pLight.position);
    group.add(orb);
  });

  // 4. DISTANT MOUNTAIN SILHOUETTES ON BACKGROUND HORIZON
  // Reference Image Match: BACKGROUND contains distant mountain ridges framing the metropolis
  const mountainGroup = new THREE.Group();
  mountainGroup.name = 'background_mountains';

  const mountainMat = new THREE.MeshStandardMaterial({
    color: 0x050a16,
    roughness: 0.95,
    metalness: 0.1,
  });

  // Layer 1: Far North Mountain Range (Behind Airport & Railway, Z: -480 to -560)
  const buildMountainRidge = (zCenter: number, baseHeight: number, count: number, spanX: number) => {
    const ridgeGeo = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];

    const segments = count;
    const dx = spanX / segments;
    const startX = -spanX / 2;

    for (let i = 0; i <= segments; i++) {
      const x = startX + i * dx;
      const noise = Math.sin(i * 0.45) * 25 + Math.cos(i * 0.9) * 15 + Math.sin(i * 1.8) * 8;
      const peakY = Math.max(20, baseHeight + noise);

      // Bottom vertex
      vertices.push(x, -5, zCenter);
      // Top peak vertex
      vertices.push(x, peakY, zCenter);
    }

    for (let i = 0; i < segments; i++) {
      const b1 = i * 2;
      const t1 = i * 2 + 1;
      const b2 = (i + 1) * 2;
      const t2 = (i + 1) * 2 + 1;

      // Two triangles per quad
      indices.push(b1, t1, t2);
      indices.push(b1, t2, b2);
    }

    ridgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    ridgeGeo.setIndex(indices);
    ridgeGeo.computeVertexNormals();

    const ridgeMesh = new THREE.Mesh(ridgeGeo, mountainMat);
    return ridgeMesh;
  };

  const farNorthRidge = buildMountainRidge(-520, 68, 60, 950);
  mountainGroup.add(farNorthRidge);

  const midNorthRidge = buildMountainRidge(-460, 48, 48, 850);
  mountainGroup.add(midNorthRidge);

  // Subtle Cyan/Purple Rim Highlights along Mountain Peaks
  const rimGeo = new THREE.BufferGeometry();
  const rimPoints: number[] = [];
  for (let i = 0; i <= 60; i++) {
    const x = -475 + i * (950 / 60);
    const noise = Math.sin(i * 0.45) * 25 + Math.cos(i * 0.9) * 15 + Math.sin(i * 1.8) * 8;
    const peakY = Math.max(20, 68 + noise) + 0.3;
    rimPoints.push(x, peakY, -518);
  }
  rimGeo.setAttribute('position', new THREE.Float32BufferAttribute(rimPoints, 3));
  const rimLine = new THREE.Line(
    rimGeo,
    new THREE.LineBasicMaterial({ color: 0x1e3a8a, transparent: true, opacity: 0.65 })
  );
  mountainGroup.add(rimLine);

  group.add(mountainGroup);

  // 5. HORIZON METROPOLITAN GLOW DOME
  // Creates the realistic impression of continuous city density stretching beyond district borders
  const horizonGeo = new THREE.CylinderGeometry(520, 520, 80, 48, 1, true);
  const horizonMat = new THREE.ShaderMaterial({
    uniforms: {
      uColorBottom: { value: new THREE.Color(0x0a1630) },
      uColorTop: { value: new THREE.Color(0x060814) },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColorBottom;
      uniform vec3 uColorTop;
      varying vec2 vUv;
      void main() {
        float glow = pow(1.0 - vUv.y, 2.2);
        vec3 col = mix(uColorTop, uColorBottom, glow * 0.7);
        gl_FragColor = vec4(col, glow * 0.6);
      }
    `,
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
  });
  const horizonMesh = new THREE.Mesh(horizonGeo, horizonMat);
  horizonMesh.position.y = 35;
  group.add(horizonMesh);

  // 6. ATMOSPHERIC NIGHT CLOUD LAYER
  const cloudCount = 18;
  const cloudGroup = new THREE.Group();
  cloudGroup.name = 'atmospheric_clouds';
  const cloudGeo = new THREE.PlaneGeometry(160, 65);
  cloudGeo.rotateX(-Math.PI / 2);

  const cloudCanvas = document.createElement('canvas');
  cloudCanvas.width = 256;
  cloudCanvas.height = 128;
  const cCtx = cloudCanvas.getContext('2d')!;
  const cGrad = cCtx.createRadialGradient(128, 64, 10, 128, 64, 120);
  cGrad.addColorStop(0, 'rgba(30, 45, 80, 0.45)');
  cGrad.addColorStop(0.5, 'rgba(15, 25, 50, 0.25)');
  cGrad.addColorStop(1, 'rgba(6, 8, 20, 0)');
  cCtx.fillStyle = cGrad;
  cCtx.fillRect(0, 0, 256, 128);
  const cloudTex = new THREE.CanvasTexture(cloudCanvas);

  const cloudMat = new THREE.MeshBasicMaterial({
    map: cloudTex,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  for (let i = 0; i < cloudCount; i++) {
    const cMesh = new THREE.Mesh(cloudGeo, cloudMat);
    const rad = 250 + Math.random() * 200;
    const ang = (i / cloudCount) * Math.PI * 2;
    cMesh.position.set(Math.cos(ang) * rad, 160 + Math.random() * 35, Math.sin(ang) * rad);
    cMesh.rotation.y = Math.random() * Math.PI;
    cMesh.scale.set(1 + Math.random() * 0.8, 1, 1 + Math.random() * 0.8);
    cloudGroup.add(cMesh);
  }
  group.add(cloudGroup);

  // 7. STARFIELD UPPER DOME
  const starCount = 1400;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 0.82 + 0.18);
    const radius = 560 + Math.random() * 160;

    starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = radius * Math.cos(phi);
    starPos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    const tintChoice = Math.random();
    if (tintChoice > 0.75) {
      starColors[i * 3] = 0.35;
      starColors[i * 3 + 1] = 0.85;
      starColors[i * 3 + 2] = 1.0;
    } else if (tintChoice > 0.45) {
      starColors[i * 3] = 0.85;
      starColors[i * 3 + 1] = 0.55;
      starColors[i * 3 + 2] = 1.0;
    } else {
      starColors[i * 3] = 0.95;
      starColors[i * 3 + 1] = 0.98;
      starColors[i * 3 + 2] = 1.0;
    }
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 2.4,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: false,
  });

  const starField = new THREE.Points(starGeo, starMat);
  group.add(starField);

  // 8. BIOLUMINESCENT PARKS & REFLECTING WATER PONDS
  const parkGrassMat = new THREE.MeshStandardMaterial({
    color: 0x051a14,
    roughness: 0.8,
    metalness: 0.1,
  });

  // Central Riverside Emerald Park
  const centralPark = new THREE.Mesh(new THREE.BoxGeometry(45, 0.25, 90), parkGrassMat);
  centralPark.position.set(-68, 0.12, 0);
  centralPark.receiveShadow = true;
  group.add(centralPark);

  // Reflecting Pond with glowing rim
  const pond = new THREE.Mesh(
    new THREE.CylinderGeometry(8, 8, 0.1, 16),
    new THREE.MeshStandardMaterial({ color: 0x001524, roughness: 0.1, metalness: 0.9 })
  );
  pond.position.set(-68, 0.26, 0);
  group.add(pond);

  const pondRim = new THREE.Mesh(
    new THREE.TorusGeometry(8.1, 0.2, 8, 24).rotateX(Math.PI / 2),
    materials.neonCyan
  );
  pondRim.position.set(-68, 0.3, 0);
  group.add(pondRim);

  // Tech Arboretum Park
  const techPark = new THREE.Mesh(new THREE.BoxGeometry(40, 0.25, 55), parkGrassMat);
  techPark.position.set(68, 0.12, -80);
  techPark.receiveShadow = true;
  group.add(techPark);

  // Instanced Bioluminescent Trees
  const treeCount = 60;
  const trunkGeo = new THREE.CylinderGeometry(0.25, 0.45, 4.5, 6);
  const canopyGeo = new THREE.IcosahedronGeometry(2.2, 1);
  const instancedTrunks = new THREE.InstancedMesh(trunkGeo, materials.metalDark, treeCount);
  const instancedCanopyGreen = new THREE.InstancedMesh(canopyGeo, materials.neonEmerald, Math.floor(treeCount / 2));
  const instancedCanopyCyan = new THREE.InstancedMesh(canopyGeo, materials.neonCyan, Math.floor(treeCount / 2));

  const dummy = new THREE.Object3D();
  let tIdx = 0;
  let gIdx = 0;
  let cIdx = 0;

  for (let x = -84; x <= -52; x += 10) {
    for (let z = -38; z <= 38; z += 14) {
      if (Math.hypot(x - -68, z) > 10 && tIdx < treeCount) {
        dummy.position.set(x, 2.25, z);
        dummy.rotation.set(0, Math.random() * Math.PI, 0);
        dummy.updateMatrix();
        instancedTrunks.setMatrixAt(tIdx, dummy.matrix);

        dummy.position.set(x, 4.6, z);
        dummy.updateMatrix();
        if (tIdx % 2 === 0 && gIdx < instancedCanopyGreen.count) {
          instancedCanopyGreen.setMatrixAt(gIdx++, dummy.matrix);
        } else if (cIdx < instancedCanopyCyan.count) {
          instancedCanopyCyan.setMatrixAt(cIdx++, dummy.matrix);
        }
        tIdx++;
      }
    }
  }

  instancedTrunks.instanceMatrix.needsUpdate = true;
  instancedCanopyGreen.instanceMatrix.needsUpdate = true;
  instancedCanopyCyan.instanceMatrix.needsUpdate = true;
  group.add(instancedTrunks);
  group.add(instancedCanopyGreen);
  group.add(instancedCanopyCyan);

  scene.add(group);

  const update = (time: number) => {
    districtLights.forEach((light, idx) => {
      light.intensity = 3.2 + Math.sin(time * 2 + idx) * 0.8;
    });
    starField.rotation.y = time * 0.005;
    cloudGroup.rotation.y = time * 0.004;
    pondRim.scale.setScalar(1 + Math.sin(time * 2) * 0.015);
    horizonMat.uniforms.uTime.value = time;
  };

  const dispose = () => {
    scene.remove(group);
    starGeo.dispose();
    starMat.dispose();
    trunkGeo.dispose();
    canopyGeo.dispose();
    mountainMat.dispose();
    horizonGeo.dispose();
    horizonMat.dispose();
    cloudGeo.dispose();
    cloudMat.dispose();
    cloudTex.dispose();
  };

  return {
    group,
    dirLight,
    ambientLight,
    districtLights,
    update,
    dispose,
  };
}
