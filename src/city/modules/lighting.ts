/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface LightingSystem {
  group: THREE.Group;
  dirLight: THREE.DirectionalLight;
  ambientLight: THREE.AmbientLight;
  districtLights: THREE.PointLight[];
  update: (time: number) => void;
  dispose: () => void;
}

export function createCityLighting(scene: THREE.Scene): LightingSystem {
  const group = new THREE.Group();
  group.name = 'lighting_system';

  // Night fog matching deep cyberpunk dark atmosphere
  const fogColor = new THREE.Color(0x060814);
  scene.background = fogColor;
  scene.fog = new THREE.FogExp2(fogColor.getHex(), 0.0016);

  // Deep indigo ambient light
  const ambientLight = new THREE.AmbientLight(0x0a1428, 1.2);
  group.add(ambientLight);

  // Cool moonlight directional light
  const dirLight = new THREE.DirectionalLight(0x4070a0, 1.8);
  dirLight.position.set(160, 260, 120);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 10;
  dirLight.shadow.camera.far = 700;
  const shadowRange = 260;
  dirLight.shadow.camera.left = -shadowRange;
  dirLight.shadow.camera.right = shadowRange;
  dirLight.shadow.camera.top = shadowRange;
  dirLight.shadow.camera.bottom = -shadowRange;
  dirLight.shadow.bias = -0.0005;
  group.add(dirLight);

  // Hemisphere light to simulate ground neon bounce
  const hemiLight = new THREE.HemisphereLight(0x182848, 0x050810, 0.9);
  group.add(hemiLight);

  // Key district accent point lights to cast neon glows in central plazas
  const districtLights: THREE.PointLight[] = [];

  const accentConfigs = [
    { color: 0x00f0ff, pos: [0, 25, 0], intensity: 4, dist: 160 },       // Downtown Core Cyan
    { color: 0x00ffaa, pos: [140, 25, -120], intensity: 3.5, dist: 140 }, // Tech District Emerald/Cyan
    { color: 0xa855f7, pos: [-140, 25, -120], intensity: 3.5, dist: 140 },// Education District Violet
    { color: 0x06b6d4, pos: [-140, 25, 120], intensity: 3.5, dist: 140 }, // Healthcare District Cyan
    { color: 0xf59e0b, pos: [140, 25, 120], intensity: 3.5, dist: 140 },  // Residential District Gold
    { color: 0xff007f, pos: [0, 25, 150], intensity: 4.5, dist: 160 },    // Entertainment District Hot Pink
    { color: 0x3b82f6, pos: [0, 25, -150], intensity: 4, dist: 160 },    // Railway District Electric Blue
  ];

  accentConfigs.forEach((cfg) => {
    const pLight = new THREE.PointLight(cfg.color, cfg.intensity, cfg.dist, 1.4);
    pLight.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
    districtLights.push(pLight);
    group.add(pLight);

    // Subtle glowing orb marker for the accent light
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 12, 12),
      new THREE.MeshBasicMaterial({ color: cfg.color })
    );
    orb.position.copy(pLight.position);
    group.add(orb);
  });

  // Starfield & Night sky particles
  const starCount = 1200;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 0.85 + 0.15); // upper dome
    const radius = 550 + Math.random() * 150;

    starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = radius * Math.cos(phi);
    starPos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    // Subtle cyan, violet, and cool white stars
    const tintChoice = Math.random();
    if (tintChoice > 0.7) {
      starColors[i * 3] = 0.4;
      starColors[i * 3 + 1] = 0.8;
      starColors[i * 3 + 2] = 1.0;
    } else if (tintChoice > 0.4) {
      starColors[i * 3] = 0.8;
      starColors[i * 3 + 1] = 0.5;
      starColors[i * 3 + 2] = 1.0;
    } else {
      starColors[i * 3] = 0.9;
      starColors[i * 3 + 1] = 0.95;
      starColors[i * 3 + 2] = 1.0;
    }
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 2.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: false,
  });

  const starField = new THREE.Points(starGeo, starMat);
  group.add(starField);

  scene.add(group);

  const update = (time: number) => {
    // Subtle pulsing on district neon lights
    districtLights.forEach((light, idx) => {
      light.intensity = 3.2 + Math.sin(time * 2 + idx) * 0.8;
    });
    // Very gentle rotation of the high star dome
    starField.rotation.y = time * 0.005;
  };

  const dispose = () => {
    scene.remove(group);
    starGeo.dispose();
    starMat.dispose();
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
