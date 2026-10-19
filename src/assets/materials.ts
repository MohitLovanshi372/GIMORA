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
  createProceduralFacadeRoughnessMap,
  createProceduralStoneMasonryPodiumTexture,
  createProceduralStoneMasonryNormalMap,
} from './textures';

export interface CitySharedMaps {
  asphaltNormal: THREE.CanvasTexture;
  asphaltRoughness: THREE.CanvasTexture;
  concreteNormal: THREE.CanvasTexture;
  concreteRoughness: THREE.CanvasTexture;
  glassNormal: THREE.CanvasTexture;
  facadeNormal: THREE.CanvasTexture;
  facadeRoughness: THREE.CanvasTexture;
  stoneMasonryAlbedo: THREE.CanvasTexture;
  stoneMasonryNormal: THREE.CanvasTexture;
}

export interface CityMaterials {
  asphalt: THREE.MeshStandardMaterial;
  sidewalk: THREE.MeshStandardMaterial;
  concrete: THREE.MeshStandardMaterial;
  podiumStone: THREE.MeshStandardMaterial;
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

  const facadeRoughness = createProceduralFacadeRoughnessMap(8, 32);
  facadeRoughness.repeat.set(2, 6);

  const stoneMasonryAlbedo = createProceduralStoneMasonryPodiumTexture();
  const stoneMasonryNormal = createProceduralStoneMasonryNormalMap();

  const maps: CitySharedMaps = {
    asphaltNormal,
    asphaltRoughness,
    concreteNormal,
    concreteRoughness,
    glassNormal,
    facadeNormal,
    facadeRoughness,
    stoneMasonryAlbedo,
    stoneMasonryNormal,
  };

  // 2. High-Fidelity PBR Materials for Modern Realistic Metropolis
  // A. Asphalt (Realistic bitumen road surface with fine micro-gravel normal & natural roughness)
  const asphalt = new THREE.MeshStandardMaterial({
    color: 0x1e2632,
    roughness: 0.78,
    metalness: 0.14,
    normalMap: asphaltNormal,
    normalScale: new THREE.Vector2(0.65, 0.65),
    roughnessMap: asphaltRoughness,
    envMapIntensity: 0.7,
  });

  // B. Sidewalk (Paved light grey concrete slabs with fine aggregate normal & expansion joints)
  const sidewalk = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.82,
    metalness: 0.08,
    normalMap: concreteNormal,
    normalScale: new THREE.Vector2(0.55, 0.55),
    roughnessMap: concreteRoughness,
    envMapIntensity: 0.5,
  });

  // C. Concrete (Architectural structural concrete for foundations, piers, curbs & overpasses)
  const concrete = new THREE.MeshStandardMaterial({
    color: 0x526071,
    roughness: 0.80,
    metalness: 0.10,
    normalMap: concreteNormal,
    normalScale: new THREE.Vector2(0.6, 0.6),
    roughnessMap: concreteRoughness,
    envMapIntensity: 0.55,
  });

  // C2. Architectural Rusticated Ashlar Stone Masonry (Street-level skyscraper podiums & colonnades)
  const podiumStone = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    map: stoneMasonryAlbedo,
    normalMap: stoneMasonryNormal,
    normalScale: new THREE.Vector2(0.85, 0.85),
    roughnessMap: concreteRoughness,
    roughness: 0.74,
    metalness: 0.12,
    envMapIntensity: 0.75,
  });

  // D. Dark Metallic Structure (Anodized dark steel framing, rooftop crowns, gantry beams)
  const metalDark = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.28,
    normalMap: concreteNormal,
    normalScale: new THREE.Vector2(0.12, 0.12),
    envMapIntensity: 1.2,
  });

  // E. Light Metallic Structure (Brushed aluminum alloy, architectural louvers, antenna masts, HVAC ducting)
  const metalLight = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.82,
    roughness: 0.25,
    normalMap: concreteNormal,
    normalScale: new THREE.Vector2(0.1, 0.1),
    envMapIntensity: 1.25,
  });

  // F. Dark Architectural Glass (Reflective low-E tinted curtain wall glass)
  const glassDark = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    metalness: 0.90,
    roughness: 0.08,
    transparent: true,
    opacity: 0.92,
    reflectivity: 0.95,
    ior: 1.54,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    normalMap: glassNormal,
    normalScale: new THREE.Vector2(0.18, 0.18),
    envMapIntensity: 1.8,
  });

  // G. Modern Architectural Sky-Reflective Glass (Sapphire/Charcoal curtain wall)
  const glassCyan = new THREE.MeshPhysicalMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.10,
    transparent: true,
    opacity: 0.88,
    transmission: 0.35,
    reflectivity: 0.95,
    ior: 1.52,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    normalMap: glassNormal,
    normalScale: new THREE.Vector2(0.18, 0.18),
    emissive: new THREE.Color(0x0a101d),
    emissiveIntensity: 0.05,
    envMapIntensity: 1.8,
    userData: {
      isWindowMaterial: true,
      district: 'technology',
      baseColor: 0xf8fafc,
    },
  });

  return {
    asphalt,
    sidewalk,
    concrete,
    podiumStone,
    metalDark,
    metalLight,
    glassDark,
    glassCyan,
    neonCyan: new THREE.MeshBasicMaterial({ color: 0xf8fafc }), // Road White Paint
    neonPink: new THREE.MeshBasicMaterial({ color: 0xdc2626 }), // Signal / Hazard Red
    neonPurple: new THREE.MeshBasicMaterial({ color: 0x334155 }), // Architectural Charcoal
    neonAmber: new THREE.MeshBasicMaterial({ color: 0xf59e0b }), // Road Yellow Paint
    neonEmerald: new THREE.MeshBasicMaterial({ color: 0x15803d }), // Park Foliage / Signal Green
    neonWhite: new THREE.MeshBasicMaterial({ color: 0xffffff }), // Clean Reflective White
    neonRed: new THREE.MeshBasicMaterial({ color: 0xdc2626 }), // Aviation Beacon Red
    neonBlue: new THREE.MeshBasicMaterial({ color: 0x2563eb }), // Deep Marine Blue
    maps,
  };
}
