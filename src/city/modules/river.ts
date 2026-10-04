/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface RiverSystem {
  group: THREE.Group;
  waterMesh: THREE.Mesh;
  update: (time: number) => void;
  dispose: () => void;
}

export function createCityRiver(scene: THREE.Scene): RiverSystem {
  const group = new THREE.Group();
  group.name = 'river_system';

  const riverWidth = 56;
  const riverLength = 650;
  const riverY = -1.8;
  const halfWidth = riverWidth / 2;

  // Custom animated water shader for cyber reflective water
  const waterGeometry = new THREE.PlaneGeometry(riverWidth, riverLength, 48, 128);
  waterGeometry.rotateX(-Math.PI / 2);

  const waterMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorDeep: { value: new THREE.Color(0x020b18) },
      uColorShallow: { value: new THREE.Color(0x002c4c) },
      uColorNeonHighlight: { value: new THREE.Color(0x00f0ff) },
      uColorPurpleHighlight: { value: new THREE.Color(0x9d00ff) },
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vWorldPos;

      void main() {
        vUv = uv;
        vec3 pos = position;
        // Subtle rhythmic surface wave ripples
        float wave1 = sin(pos.z * 0.08 + uTime * 1.5) * 0.35;
        float wave2 = cos(pos.x * 0.15 + pos.z * 0.04 + uTime * 2.0) * 0.25;
        pos.y += wave1 + wave2;

        vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
        gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColorDeep;
      uniform vec3 uColorShallow;
      uniform vec3 uColorNeonHighlight;
      uniform vec3 uColorPurpleHighlight;
      varying vec2 vUv;
      varying vec3 vWorldPos;

      void main() {
        // Multi-frequency procedural ripple patterns
        float waveGrid = sin((vWorldPos.z * 0.3) + (uTime * 3.0)) * 
                         cos((vWorldPos.x * 0.3) - (uTime * 2.0));
        float microRipples = sin((vWorldPos.z * 1.2) - (uTime * 4.0)) * 
                             sin((vWorldPos.x * 1.0) + (uTime * 3.0));

        float rippleIntensity = clamp((waveGrid + microRipples * 0.5) * 0.5 + 0.5, 0.0, 1.0);

        // Mix deep water with cyber cyan and purple neon reflections
        vec3 baseWater = mix(uColorDeep, uColorShallow, vUv.x);
        
        // Edge lighting where water meets the promenade walls
        float edgeDist = abs(vUv.x - 0.5) * 2.0;
        float edgeGlow = smoothstep(0.7, 1.0, edgeDist) * 0.45;

        // Dynamic neon glints across surface
        float glint = pow(rippleIntensity, 4.0) * 0.8;
        vec3 reflectionColor = mix(uColorNeonHighlight, uColorPurpleHighlight, sin(vWorldPos.z * 0.02 + uTime) * 0.5 + 0.5);

        vec3 finalColor = baseWater + (reflectionColor * glint) + (uColorNeonHighlight * edgeGlow);

        gl_FragColor = vec4(finalColor, 0.94);
      }
    `,
    transparent: true,
  });

  const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
  waterMesh.position.set(0, riverY, 0);
  waterMesh.receiveShadow = true;
  group.add(waterMesh);

  // Riverbed underneath
  const bedGeo = new THREE.PlaneGeometry(riverWidth + 10, riverLength, 4, 32);
  bedGeo.rotateX(-Math.PI / 2);
  const bedMat = new THREE.MeshStandardMaterial({
    color: 0x01050a,
    roughness: 0.95,
  });
  const bedMesh = new THREE.Mesh(bedGeo, bedMat);
  bedMesh.position.set(0, riverY - 2.5, 0);
  group.add(bedMesh);

  // Embankments & Promenade Retaining Walls (West & East)
  const wallHeight = 2.6;
  const wallThickness = 1.6;
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x111622,
    metalness: 0.4,
    roughness: 0.7,
  });

  // West Wall
  const westWallGeo = new THREE.BoxGeometry(wallThickness, wallHeight, riverLength);
  const westWall = new THREE.Mesh(westWallGeo, wallMat);
  westWall.position.set(-halfWidth - wallThickness / 2, -wallHeight / 2 + 0.5, 0);
  westWall.receiveShadow = true;
  westWall.castShadow = true;
  group.add(westWall);

  // East Wall
  const eastWall = westWall.clone();
  eastWall.position.set(halfWidth + wallThickness / 2, -wallHeight / 2 + 0.5, 0);
  group.add(eastWall);

  // Glowing Neon Railings along the Promenade
  const railingGeo = new THREE.CylinderGeometry(0.18, 0.18, riverLength, 8);
  railingGeo.rotateX(Math.PI / 2);

  const neonCyanMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
  const neonPinkMat = new THREE.MeshBasicMaterial({ color: 0xff007f });

  // West Railing (Cyan)
  const westRailing = new THREE.Mesh(railingGeo, neonCyanMat);
  westRailing.position.set(-halfWidth - 0.4, 0.7, 0);
  group.add(westRailing);

  // East Railing (Magenta/Pink)
  const eastRailing = new THREE.Mesh(railingGeo, neonPinkMat);
  eastRailing.position.set(halfWidth + 0.4, 0.7, 0);
  group.add(eastRailing);

  // Riverside Walkway / Promenades
  const walkWidth = 8;
  const walkGeo = new THREE.PlaneGeometry(walkWidth, riverLength);
  walkGeo.rotateX(-Math.PI / 2);
  const walkMat = new THREE.MeshStandardMaterial({
    color: 0x161b26,
    roughness: 0.65,
    metalness: 0.25,
  });

  // West Promenade
  const westWalk = new THREE.Mesh(walkGeo, walkMat);
  westWalk.position.set(-halfWidth - wallThickness - walkWidth / 2, 0.1, 0);
  westWalk.receiveShadow = true;
  group.add(westWalk);

  // East Promenade
  const eastWalk = new THREE.Mesh(walkGeo, walkMat);
  eastWalk.position.set(halfWidth + wallThickness + walkWidth / 2, 0.1, 0);
  eastWalk.receiveShadow = true;
  group.add(eastWalk);

  // Instanced Promenade bollard lights along both sides
  const bollardCount = 44;
  const bollardGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 8);
  const bollardGlowGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.35, 8);
  const bollardMat = new THREE.MeshStandardMaterial({ color: 0x242d3d, metalness: 0.8 });
  const bollardGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

  const bollardMesh = new THREE.InstancedMesh(bollardGeo, bollardMat, bollardCount * 2);
  const bollardGlowMesh = new THREE.InstancedMesh(bollardGlowGeo, bollardGlowMat, bollardCount * 2);

  const dummy = new THREE.Object3D();
  let instIdx = 0;

  for (let side = -1; side <= 1; side += 2) {
    const xPos = side * (halfWidth + 1.2);
    for (let i = 0; i < bollardCount; i++) {
      const zPos = -riverLength / 2 + 15 + i * (riverLength / bollardCount);
      dummy.position.set(xPos, 0.6, zPos);
      dummy.updateMatrix();
      bollardMesh.setMatrixAt(instIdx, dummy.matrix);

      dummy.position.set(xPos, 1.0, zPos);
      dummy.updateMatrix();
      bollardGlowMesh.setMatrixAt(instIdx, dummy.matrix);

      instIdx++;
    }
  }

  bollardMesh.instanceMatrix.needsUpdate = true;
  bollardGlowMesh.instanceMatrix.needsUpdate = true;
  group.add(bollardMesh);
  group.add(bollardGlowMesh);

  scene.add(group);

  const update = (time: number) => {
    waterMaterial.uniforms.uTime.value = time;
  };

  const dispose = () => {
    scene.remove(group);
    waterGeometry.dispose();
    waterMaterial.dispose();
    bedGeo.dispose();
    bedMat.dispose();
    westWallGeo.dispose();
    wallMat.dispose();
    railingGeo.dispose();
    neonCyanMat.dispose();
    neonPinkMat.dispose();
    walkGeo.dispose();
    walkMat.dispose();
    bollardGeo.dispose();
    bollardGlowGeo.dispose();
    bollardMat.dispose();
    bollardGlowMat.dispose();
  };

  return {
    group,
    waterMesh,
    update,
    dispose,
  };
}
