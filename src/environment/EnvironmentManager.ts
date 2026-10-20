/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CityMaterials } from '../assets/materials';
import { createProceduralGrassTexture, createCobblestoneParkPathTexture } from '../assets/textures';

export interface SkyDomeUniforms {
  uZenithColor: { value: THREE.Color };
  uHorizonColor: { value: THREE.Color };
  uSunColor: { value: THREE.Color };
  uSunDirection: { value: THREE.Vector3 };
  uTime: { value: number };
  uNightFactor: { value: number };
}

export interface EnvironmentSystem {
  group: THREE.Group;
  dirLight: THREE.DirectionalLight;
  ambientLight: THREE.AmbientLight;
  districtLights: THREE.PointLight[];
  skyUniforms: SkyDomeUniforms;
  starMat: THREE.PointsMaterial;
  update: (time: number) => void;
  dispose: () => void;
}

export function createEnvironment(
  scene: THREE.Scene,
  materials: CityMaterials
): EnvironmentSystem {
  const group = new THREE.Group();
  group.name = 'environment_system';

  // 1. REALISTIC METROPOLITAN SKY & ATMOSPHERIC AERIAL PERSPECTIVE FOG
  const skyColor = new THREE.Color(0xcfdbe8);
  scene.background = skyColor;
  scene.fog = new THREE.FogExp2(skyColor.getHex(), 0.0011);

  // 2. PRIMARY ILLUMINATION (Natural Daylight & Soft Atmosphere)
  const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.85);
  group.add(ambientLight);

  // Sunlight directional light with 4K ultra-high-resolution soft shadows
  const dirLight = new THREE.DirectionalLight(0xfffbeb, 2.85);
  dirLight.position.set(160, 260, 120);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 4096;
  dirLight.shadow.mapSize.height = 4096;
  dirLight.shadow.camera.near = 10;
  dirLight.shadow.camera.far = 750;
  const shadowRange = 300;
  dirLight.shadow.camera.left = -shadowRange;
  dirLight.shadow.camera.right = shadowRange;
  dirLight.shadow.camera.top = shadowRange;
  dirLight.shadow.camera.bottom = -shadowRange;
  dirLight.shadow.bias = -0.0003;
  dirLight.shadow.normalBias = 0.02;
  group.add(dirLight);

  // Hemisphere sky-ground bounce for rich natural fill
  const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x334155, 1.25);
  group.add(hemiLight);

  // 3. DISTRICT AMBIENT ILLUMINATION (Subtle Warm Architectural Lighting)
  const districtLights: THREE.PointLight[] = [];
  const accentConfigs = [
    { color: 0xfef3c7, pos: [-110, 25, 0], intensity: 1.5, dist: 160 },      // Downtown Financial
    { color: 0xf8fafc, pos: [140, 25, -80], intensity: 1.5, dist: 150 },     // Technology Campus
    { color: 0xfef3c7, pos: [-160, 25, -170], intensity: 1.2, dist: 140 }, // Education
    { color: 0xf1f5f9, pos: [-160, 25, 170], intensity: 1.2, dist: 140 },  // Healthcare
    { color: 0xfde68a, pos: [150, 25, 170], intensity: 1.2, dist: 140 },   // Residential
    { color: 0xfef08a, pos: [0, 25, 220], intensity: 1.5, dist: 160 },     // Commercial / Retail
    { color: 0xf1f5f9, pos: [0, 25, -220], intensity: 1.4, dist: 160 },     // Railway Terminal
    { color: 0x94a3b8, pos: [0, 15, 0], intensity: 1.2, dist: 150 },       // Riverside
  ];

  accentConfigs.forEach((cfg) => {
    const pLight = new THREE.PointLight(cfg.color, cfg.intensity, cfg.dist, 1.8);
    pLight.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
    districtLights.push(pLight);
    group.add(pLight);
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

  // 5. GTA V RAGE-STYLE ATMOSPHERIC SKY & VOLUMETRIC CUMULUS CLOUD DOME
  const skyDomeGeo = new THREE.SphereGeometry(680, 48, 32);
  const skyUniforms: SkyDomeUniforms = {
    uZenithColor: { value: new THREE.Color(0x1d4ed8) },
    uHorizonColor: { value: new THREE.Color(0xfdba74) },
    uSunColor: { value: new THREE.Color(0xffedd5) },
    uSunDirection: { value: new THREE.Vector3(160, 120, 120).normalize() },
    uTime: { value: 0 },
    uNightFactor: { value: 0.0 },
  };

  const skyDomeMat = new THREE.ShaderMaterial({
    uniforms: skyUniforms as unknown as Record<string, THREE.IUniform>,
    vertexShader: `
      varying vec3 vWorldDirection;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldDirection = normalize(position);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform vec3 uZenithColor;
      uniform vec3 uHorizonColor;
      uniform vec3 uSunColor;
      uniform vec3 uSunDirection;
      uniform float uTime;
      uniform float uNightFactor;
      varying vec3 vWorldDirection;

      // 2D Hash & Value Noise for Volumetric Cumulus Clouds
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p = rot * p * 2.03;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec3 dir = normalize(vWorldDirection);
        float elevation = max(dir.y, 0.0);

        // 1. Rayleigh Zenith-to-Horizon Atmospheric Gradient
        float horizonCurve = pow(1.0 - elevation, 2.4);
        vec3 skyCol = mix(uZenithColor, uHorizonColor, horizonCurve);

        // 2. Mie Solar Scattering & Physical Sun Disc
        vec3 sunDir = normalize(uSunDirection);
        float sunDot = max(dot(dir, sunDir), 0.0);
        float mieHalo = pow(sunDot, 8.0) * 0.45 * (1.0 - uNightFactor * 0.7);
        float sunCorona = pow(sunDot, 64.0) * 0.9 * (1.0 - uNightFactor * 0.8);
        float sunDisc = smoothstep(0.9985, 0.9996, sunDot) * (1.0 - uNightFactor * 0.85);
        skyCol += uSunColor * (mieHalo + sunCorona + sunDisc * 2.5);

        // 3. Volumetric Cumulus Cloud Layer with Sunlit Silver-Gold Rims
        if (dir.y > 0.04) {
          vec2 cloudUv = dir.xz / (dir.y + 0.16) * 1.45;
          cloudUv += vec2(uTime * 0.012, uTime * 0.006);

          float n1 = fbm(cloudUv);
          float n2 = fbm(cloudUv * 2.1 - vec2(uTime * 0.008, 0.0));
          float cloudDensity = smoothstep(0.46, 0.76, n1 * 0.7 + n2 * 0.3);

          // Sample offset towards sun for self-shadowing / silver lining
          float nSun = fbm(cloudUv + sunDir.xz * 0.08);
          float sunRim = clamp((n1 - nSun) * 3.2 + 0.55, 0.0, 1.0);

          vec3 cloudShadowCol = mix(uZenithColor * 0.65, vec3(0.12, 0.16, 0.24), uNightFactor);
          vec3 cloudLightCol = mix(uSunColor * 1.12, uHorizonColor * 0.85, 0.35);
          vec3 cloudCol = mix(cloudShadowCol, cloudLightCol, sunRim);

          // Fade clouds near the horizon for aerial perspective
          float cloudFade = smoothstep(0.04, 0.22, dir.y);
          skyCol = mix(skyCol, cloudCol, cloudDensity * cloudFade * (0.78 - uNightFactor * 0.35));
        }

        // 4. Lower Hemisphere Ground Bounce
        if (dir.y < 0.0) {
          skyCol = mix(uHorizonColor, vec3(0.04, 0.06, 0.10), clamp(-dir.y * 4.0, 0.0, 1.0));
        }

        gl_FragColor = vec4(skyCol, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  });

  const skyDomeMesh = new THREE.Mesh(skyDomeGeo, skyDomeMat);
  group.add(skyDomeMesh);

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

  // 8. LUSH URBAN PARKS & REFLECTING WATER PONDS
  const grassTex = createProceduralGrassTexture();
  const pathTex = createCobblestoneParkPathTexture();

  const parkGrassMat = new THREE.MeshStandardMaterial({
    map: grassTex,
    color: 0x2e6f40,
    roughness: 0.72,
    metalness: 0.05,
    normalMap: materials.maps.concreteNormal,
    normalScale: new THREE.Vector2(0.25, 0.25),
  });

  const parkPathMat = new THREE.MeshStandardMaterial({
    map: pathTex,
    color: 0x52525b,
    roughness: 0.65,
    metalness: 0.12,
    normalMap: materials.maps.concreteNormal,
    normalScale: new THREE.Vector2(0.35, 0.35),
  });

  // Central Riverside Emerald Park (Cleanly inside West Waterfront Block X ∈ [-88.5, -55.5], Z ∈ [-79.5, -13.0])
  const centralPark = new THREE.Mesh(new THREE.BoxGeometry(30, 0.25, 62), parkGrassMat);
  centralPark.position.set(-72, 0.12, -46);
  centralPark.receiveShadow = true;
  group.add(centralPark);

  // Promenade Pedestrian Walkways across Central Park
  // North-South Promenade
  const nsPath = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 60).rotateX(-Math.PI / 2), parkPathMat);
  nsPath.position.set(-72, 0.26, -46);
  nsPath.receiveShadow = true;
  group.add(nsPath);

  // East-West Park Pathway
  const ewPath = new THREE.Mesh(new THREE.PlaneGeometry(28, 4.0).rotateX(-Math.PI / 2), parkPathMat);
  ewPath.position.set(-72, 0.26, -32);
  ewPath.receiveShadow = true;
  group.add(ewPath);

  // Reflecting Pond with glowing rim
  const pond = new THREE.Mesh(
    new THREE.CylinderGeometry(7.0, 7.0, 0.1, 24),
    new THREE.MeshStandardMaterial({ color: 0x001524, roughness: 0.05, metalness: 0.95 })
  );
  pond.position.set(-72, 0.27, -32);
  group.add(pond);

  const pondRim = new THREE.Mesh(
    new THREE.TorusGeometry(7.1, 0.25, 8, 32).rotateX(Math.PI / 2),
    materials.concrete
  );
  pondRim.position.set(-72, 0.32, -32);
  group.add(pondRim);

  // Central Tiered Water Fountain
  const fountainBase = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.4, 1.2, 16), materials.concrete);
  fountainBase.position.set(-72, 0.8, -32);
  group.add(fountainBase);

  const waterSprayMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.85,
    transparent: true,
    opacity: 0.7,
  });
  const fountainSpray = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.8, 3.8, 12), waterSprayMat);
  fountainSpray.position.set(-72, 2.7, -32);
  group.add(fountainSpray);

  // Romantic Arched Footbridge over Pond Arm
  const footbridgeGeo = new THREE.BoxGeometry(3.2, 0.35, 9);
  const footbridge = new THREE.Mesh(footbridgeGeo, materials.concrete);
  footbridge.position.set(-72, 0.65, -24);
  footbridge.castShadow = true;
  group.add(footbridge);

  const bridgeHandrailL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.8, 9), materials.metalDark);
  bridgeHandrailL.position.set(-72 - 1.5, 1.1, -24);
  group.add(bridgeHandrailL);

  const bridgeHandrailR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.8, 9), materials.metalDark);
  bridgeHandrailR.position.set(-72 + 1.5, 1.1, -24);
  group.add(bridgeHandrailR);

  // Tech Arboretum Park (Cleanly inside East Waterfront Block X ∈ [55.5, 88.5], Z ∈ [100.5, 149.5])
  const techPark = new THREE.Mesh(new THREE.BoxGeometry(30, 0.25, 44), parkGrassMat);
  techPark.position.set(72, 0.12, 125);
  techPark.receiveShadow = true;
  group.add(techPark);

  // Instanced Trees with Realistic Deciduous and Cherry Foliage
  const treeCount = 72;
  const trunkGeo = new THREE.CylinderGeometry(0.25, 0.45, 4.5, 6);
  const canopyGeo = new THREE.IcosahedronGeometry(2.2, 1);

  const realTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.85, metalness: 0.05 });
  const realFoliageDeep = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.75, metalness: 0.05 });
  const realFoliageBright = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.75, metalness: 0.05 });
  const realFoliageBlossom = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.8, metalness: 0.05 });

  const instancedTrunks = new THREE.InstancedMesh(trunkGeo, realTrunkMat, treeCount);
  const instancedCanopyGreen = new THREE.InstancedMesh(canopyGeo, realFoliageDeep, 24);
  const instancedCanopyCyan = new THREE.InstancedMesh(canopyGeo, realFoliageBright, 24);
  const instancedCanopySakura = new THREE.InstancedMesh(canopyGeo, realFoliageBlossom, 24);

  const dummy = new THREE.Object3D();
  let tIdx = 0;
  let gIdx = 0;
  let cIdx = 0;
  let sIdx = 0;

  // Trees around Central Park (-72, -46) and Tech Arboretum Park (72, 125)
  const parkTreeZones = [
    { xMin: -84, xMax: -60, zMin: -72, zMax: -18, avoidX: -72, avoidZ: -32, avoidR: 9.0 },
    { xMin: 60, xMax: 84, zMin: 106, zMax: 144, avoidX: 72, avoidZ: 125, avoidR: 5.0 },
  ];

  for (const zone of parkTreeZones) {
    for (let x = zone.xMin; x <= zone.xMax; x += 8) {
      for (let z = zone.zMin; z <= zone.zMax; z += 11) {
        if (Math.hypot(x - zone.avoidX, z - zone.avoidZ) > zone.avoidR && Math.abs(z - -56) > 8 && tIdx < treeCount) {
          dummy.position.set(x, 2.25, z);
          dummy.rotation.set(0, Math.random() * Math.PI, 0);
          dummy.updateMatrix();
          instancedTrunks.setMatrixAt(tIdx, dummy.matrix);

          dummy.position.set(x, 4.6, z);
          const sc = 0.8 + Math.random() * 0.4;
          dummy.scale.set(sc, sc, sc);
          dummy.updateMatrix();

          if (tIdx % 3 === 0 && gIdx < 24) {
            instancedCanopyGreen.setMatrixAt(gIdx++, dummy.matrix);
          } else if (tIdx % 3 === 1 && cIdx < 24) {
            instancedCanopyCyan.setMatrixAt(cIdx++, dummy.matrix);
          } else if (sIdx < 24) {
            instancedCanopySakura.setMatrixAt(sIdx++, dummy.matrix);
          }
          tIdx++;
        }
      }
    }
  }

  instancedTrunks.instanceMatrix.needsUpdate = true;
  instancedCanopyGreen.instanceMatrix.needsUpdate = true;
  instancedCanopyCyan.instanceMatrix.needsUpdate = true;
  instancedCanopySakura.instanceMatrix.needsUpdate = true;
  group.add(instancedTrunks);
  group.add(instancedCanopyGreen);
  group.add(instancedCanopyCyan);
  group.add(instancedCanopySakura);

  scene.add(group);

  const update = (time: number) => {
    districtLights.forEach((light, idx) => {
      light.intensity = 3.2 + Math.sin(time * 2 + idx) * 0.8;
    });
    starField.rotation.y = time * 0.005;
    cloudGroup.rotation.y = time * 0.004;
    pondRim.scale.setScalar(1 + Math.sin(time * 2) * 0.015);
    skyUniforms.uTime.value = time;
  };

  const dispose = () => {
    scene.remove(group);
    starGeo.dispose();
    starMat.dispose();
    trunkGeo.dispose();
    canopyGeo.dispose();
    mountainMat.dispose();
    skyDomeGeo.dispose();
    skyDomeMat.dispose();
    cloudGeo.dispose();
    cloudMat.dispose();
    cloudTex.dispose();
  };

  return {
    group,
    dirLight,
    ambientLight,
    districtLights,
    skyUniforms,
    starMat,
    update,
    dispose,
  };
}
