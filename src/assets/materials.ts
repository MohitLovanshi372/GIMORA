/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import {
  createProceduralAsphaltNormalMap,
  createProceduralAsphaltRoughnessMap,
  createProceduralConcreteNormalMap,
  createProceduralConcreteRoughnessMap,
  createProceduralGlassNormalMap,
  createProceduralFacadeNormalMap,
} from './textures';

export interface CitySharedMaps {
  asphaltNormal: THREE.CanvasTexture;
  asphaltRoughness: THREE.CanvasTexture;
  concreteNormal: THREE.CanvasTexture;
  concreteRoughness: THREE.CanvasTexture;
  glassNormal: THREE.CanvasTexture;
  facadeNormal: THREE.CanvasTexture;
}

export interface CityMaterials {
  asphalt: THREE.MeshStandardMaterial;
  sidewalk: THREE.MeshStandardMaterial;
  concrete: THREE.MeshStandardMaterial;
  metalDark: THREE.MeshStandardMaterial;
  metalLight: THREE.MeshStandardMaterial;
  glassDark: THREE.MeshPhysicalMaterial;
  glassCyan: THREE.MeshPhysicalMaterial;
  neonCyan: THREE.MeshBasicMaterial;
  neonPink: THREE.MeshBasicMaterial;
  neonPurple: THREE.MeshBasicMaterial;
  neonAmber: THREE.MeshBasicMaterial;
  neonEmerald: THREE.MeshBasicMaterial;
  neonWhite: THREE.MeshBasicMaterial;
  neonRed: THREE.MeshBasicMaterial;
  neonBlue: THREE.MeshBasicMaterial;
  maps: CitySharedMaps;
}

export function createCityMaterials(): CityMaterials {
  // 1. Procedural Normal & Roughness Maps for Physical Surfaces
  const asphaltNormal = createProceduralAsphaltNormalMap();
  asphaltNormal.repeat.set(16, 48);

  const asphaltRoughness = createProceduralAsphaltRoughnessMap();
  asphaltRoughness.repeat.set(16, 48);

  const concreteNormal = createProceduralConcreteNormalMap();
  concreteNormal.repeat.set(8, 32);

  const concreteRoughness = createProceduralConcreteRoughnessMap();
  concreteRoughness.repeat.set(8, 32);

  const glassNormal = createProceduralGlassNormalMap(4, 12);
  glassNormal.repeat.set(6, 18);

  const facadeNormal = createProceduralFacadeNormalMap(8, 32);
  facadeNormal.repeat.set(2, 6);

  const maps: CitySharedMaps = {
    asphaltNormal,
    asphaltRoughness,
    concreteNormal,
    concreteRoughness,
    glassNormal,
    facadeNormal,
  };

  // 2. High-Fidelity PBR Materials
  // A. Asphalt (Wet reflective night asphalt with micro-gravel normal & wet puddle roughness)
  const asphalt = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.35,
    metalness: 0.45,
    normalMap: asphaltNormal,
    normalScale: new THREE.Vector2(0.85, 0.85),
    roughnessMap: asphaltRoughness,
    envMapIntensity: 1.6,
  });

  // B. Sidewalk (Paved concrete slabs with fine aggregate normal & expansion joints)
  const sidewalk = new THREE.MeshStandardMaterial({
    color: 0x141b28,
    roughness: 0.72,
    metalness: 0.14,
    normalMap: concreteNormal,
    normalScale: new THREE.Vector2(0.65, 0.65),
    roughnessMap: concreteRoughness,
    envMapIntensity: 0.8,
  });

  // C. Concrete (Architectural structural concrete for foundations, piers, curbs & overpasses)
  const concrete = new THREE.MeshStandardMaterial({
    color: 0x182232,
    roughness: 0.68,
    metalness: 0.18,
    normalMap: concreteNormal,
    normalScale: new THREE.Vector2(0.75, 0.75),
    roughnessMap: concreteRoughness,
    envMapIntensity: 0.85,
  });

  // D. Dark Metallic Structure (Titanium framing, rooftop crowns, gantry beams)
  const metalDark = new THREE.MeshStandardMaterial({
    color: 0x0b1120,
    metalness: 0.92,
    roughness: 0.22,
    normalMap: concreteNormal,
    normalScale: new THREE.Vector2(0.14, 0.14),
    envMapIntensity: 1.4,
  });

  // E. Light Metallic Structure (Silver alloy, antenna masts, HVAC ducting)
  const metalLight = new THREE.MeshStandardMaterial({
    color: 0x2e3d52,
    metalness: 0.88,
    roughness: 0.20,
    normalMap: concreteNormal,
    normalScale: new THREE.Vector2(0.12, 0.12),
    envMapIntensity: 1.3,
  });

  // F. Dark Architectural Glass (Observation lounges, executive tint, sky-bridges)
  const glassDark = new THREE.MeshPhysicalMaterial({
    color: 0x020815,
    metalness: 0.85,
    roughness: 0.06,
    transparent: true,
    opacity: 0.90,
    reflectivity: 0.98,
    ior: 1.54,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    normalMap: glassNormal,
    normalScale: new THREE.Vector2(0.28, 0.28),
    envMapIntensity: 2.0,
  });

  // G. Cyber Cyan Glass (MOHIT Hub facade, quantum laboratories, holographic towers)
  const glassCyan = new THREE.MeshPhysicalMaterial({
    color: 0x00283c,
    metalness: 0.25,
    roughness: 0.08,
    transparent: true,
    opacity: 0.72,
    transmission: 0.55,
    reflectivity: 0.98,
    ior: 1.52,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    normalMap: glassNormal,
    normalScale: new THREE.Vector2(0.32, 0.32),
    emissive: new THREE.Color(0x002233),
    emissiveIntensity: 0.6,
    envMapIntensity: 2.2,
    userData: {
      isWindowMaterial: true,
      district: 'technology',
      baseColor: 0x00f0ff,
    },
  });

  return {
    asphalt,
    sidewalk,
    concrete,
    metalDark,
    metalLight,
    glassDark,
    glassCyan,
    neonCyan: new THREE.MeshBasicMaterial({ color: 0x00f0ff }),
    neonPink: new THREE.MeshBasicMaterial({ color: 0xff007f }),
    neonPurple: new THREE.MeshBasicMaterial({ color: 0xa855f7 }),
    neonAmber: new THREE.MeshBasicMaterial({ color: 0xf59e0b }),
    neonEmerald: new THREE.MeshBasicMaterial({ color: 0x10b981 }),
    neonWhite: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    neonRed: new THREE.MeshBasicMaterial({ color: 0xef4444 }),
    neonBlue: new THREE.MeshBasicMaterial({ color: 0x3b82f6 }),
    maps,
  };
}
