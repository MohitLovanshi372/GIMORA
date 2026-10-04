/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { EnvironmentSystem } from '../environment/EnvironmentManager';
import { DistrictId } from '../city/types';

export interface WindowMaterialEntry {
  material: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
  district: string;
  baseColor?: THREE.Color;
}

interface TimeKeyframe {
  hour: number;
  ambientIntensity: number;
  ambientColor: number;
  fogColor: number;
  dirIntensity: number;
  dirColor: number;
  windowEmissiveIntensity: number;
  // Window emissive colors per district category
  downtownWindow: number;
  residentialWindow: number;
  techWindow: number;
  entertainmentWindow: number;
  healthcareWindow: number;
  educationWindow: number;
  industrialWindow: number;
  districtLightMultiplier: number;
}

const TIME_KEYFRAMES: TimeKeyframe[] = [
  {
    hour: 0.0, // Midnight
    ambientIntensity: 0.85,
    ambientColor: 0x091428,
    fogColor: 0x050714,
    dirIntensity: 1.25,
    dirColor: 0x3d6694,
    windowEmissiveIntensity: 2.2,
    downtownWindow: 0x00f0ff,
    residentialWindow: 0xf59e0b,
    techWindow: 0x00ffaa,
    entertainmentWindow: 0xff007f,
    healthcareWindow: 0x06b6d4,
    educationWindow: 0x3b82f6,
    industrialWindow: 0xf97316,
    districtLightMultiplier: 1.0,
  },
  {
    hour: 4.5, // Deep Pre-dawn Night
    ambientIntensity: 0.85,
    ambientColor: 0x0a162c,
    fogColor: 0x060918,
    dirIntensity: 1.15,
    dirColor: 0x355580,
    windowEmissiveIntensity: 2.05,
    downtownWindow: 0x00f0ff,
    residentialWindow: 0xf59e0b,
    techWindow: 0x00ffaa,
    entertainmentWindow: 0xff007f,
    healthcareWindow: 0x06b6d4,
    educationWindow: 0x3b82f6,
    industrialWindow: 0xf97316,
    districtLightMultiplier: 1.0,
  },
  {
    hour: 5.75, // Pre-Dawn Twilight
    ambientIntensity: 1.05,
    ambientColor: 0x161a34,
    fogColor: 0x0c1024,
    dirIntensity: 1.3,
    dirColor: 0x664477,
    windowEmissiveIntensity: 1.8,
    downtownWindow: 0x22d3ee,
    residentialWindow: 0xfbbf24,
    techWindow: 0x2dd4bf,
    entertainmentWindow: 0xec4899,
    healthcareWindow: 0x38bdf8,
    educationWindow: 0x60a5fa,
    industrialWindow: 0xfb923c,
    districtLightMultiplier: 0.9,
  },
  {
    hour: 6.8, // Sunrise (Golden Dawn)
    ambientIntensity: 1.45,
    ambientColor: 0x2e2236,
    fogColor: 0x1e192a,
    dirIntensity: 1.95,
    dirColor: 0xffa044,
    windowEmissiveIntensity: 1.35,
    downtownWindow: 0x67e8f9,
    residentialWindow: 0xfde047,
    techWindow: 0x5eead4,
    entertainmentWindow: 0xf43f5e,
    healthcareWindow: 0x7dd3fc,
    educationWindow: 0x93c5fd,
    industrialWindow: 0xfdba74,
    districtLightMultiplier: 0.7,
  },
  {
    hour: 8.5, // Morning Commute / Full Daylight
    ambientIntensity: 1.85,
    ambientColor: 0x223652,
    fogColor: 0x142034,
    dirIntensity: 2.45,
    dirColor: 0xffeedd,
    windowEmissiveIntensity: 0.65,
    downtownWindow: 0x5090b8,
    residentialWindow: 0xd4a373,
    techWindow: 0x38bdf8,
    entertainmentWindow: 0xa855f7,
    healthcareWindow: 0x7dd3fc,
    educationWindow: 0x60a5fa,
    industrialWindow: 0xd97706,
    districtLightMultiplier: 0.45,
  },
  {
    hour: 12.0, // High Noon (Bright Sun)
    ambientIntensity: 2.25,
    ambientColor: 0x2a4468,
    fogColor: 0x12243e,
    dirIntensity: 2.85,
    dirColor: 0xf5f8ff,
    windowEmissiveIntensity: 0.3,
    downtownWindow: 0x38bdf8,
    residentialWindow: 0xb45309,
    techWindow: 0x0284c7,
    entertainmentWindow: 0x9333ea,
    healthcareWindow: 0x0284c7,
    educationWindow: 0x2563eb,
    industrialWindow: 0xb45309,
    districtLightMultiplier: 0.35,
  },
  {
    hour: 15.5, // Clear Afternoon
    ambientIntensity: 2.10,
    ambientColor: 0x284062,
    fogColor: 0x14243c,
    dirIntensity: 2.65,
    dirColor: 0xfff0e4,
    windowEmissiveIntensity: 0.35,
    downtownWindow: 0x38bdf8,
    residentialWindow: 0xb45309,
    techWindow: 0x0284c7,
    entertainmentWindow: 0x9333ea,
    healthcareWindow: 0x0284c7,
    educationWindow: 0x2563eb,
    industrialWindow: 0xb45309,
    districtLightMultiplier: 0.35,
  },
  {
    hour: 17.5, // Late Afternoon / Golden Hour
    ambientIntensity: 1.70,
    ambientColor: 0x38283a,
    fogColor: 0x26182c,
    dirIntensity: 2.3,
    dirColor: 0xff8833,
    windowEmissiveIntensity: 0.85,
    downtownWindow: 0x38bdf8,
    residentialWindow: 0xf59e0b,
    techWindow: 0x2dd4bf,
    entertainmentWindow: 0xf43f5e,
    healthcareWindow: 0x38bdf8,
    educationWindow: 0x60a5fa,
    industrialWindow: 0xf97316,
    districtLightMultiplier: 0.55,
  },
  {
    hour: 19.0, // Sunset / Dusk
    ambientIntensity: 1.35,
    ambientColor: 0x2a1a38,
    fogColor: 0x1b1028,
    dirIntensity: 1.7,
    dirColor: 0xff4477,
    windowEmissiveIntensity: 1.65,
    downtownWindow: 0x00f0ff,
    residentialWindow: 0xf59e0b,
    techWindow: 0x00ffcc,
    entertainmentWindow: 0xff007f,
    healthcareWindow: 0x06b6d4,
    educationWindow: 0x8b5cf6,
    industrialWindow: 0xf97316,
    districtLightMultiplier: 0.85,
  },
  {
    hour: 20.8, // Cyberpunk Twilight / Neon Nightfall
    ambientIntensity: 1.0,
    ambientColor: 0x121430,
    fogColor: 0x080c20,
    dirIntensity: 1.35,
    dirColor: 0x554499,
    windowEmissiveIntensity: 2.1,
    downtownWindow: 0x00f0ff,
    residentialWindow: 0xf59e0b,
    techWindow: 0x00ffaa,
    entertainmentWindow: 0xff007f,
    healthcareWindow: 0x06b6d4,
    educationWindow: 0x3b82f6,
    industrialWindow: 0xf97316,
    districtLightMultiplier: 1.0,
  },
  {
    hour: 24.0, // Midnight Wrap
    ambientIntensity: 0.85,
    ambientColor: 0x091428,
    fogColor: 0x050714,
    dirIntensity: 1.25,
    dirColor: 0x3d6694,
    windowEmissiveIntensity: 2.2,
    downtownWindow: 0x00f0ff,
    residentialWindow: 0xf59e0b,
    techWindow: 0x00ffaa,
    entertainmentWindow: 0xff007f,
    healthcareWindow: 0x06b6d4,
    educationWindow: 0x3b82f6,
    industrialWindow: 0xf97316,
    districtLightMultiplier: 1.0,
  },
];

export class CityLifeManager {
  // Current 24-hour time in fractional hours (0.0 to 24.0)
  // Default start at 23.7 (23:42 night)
  public timeOfDay = 23.7;
  public timeSpeed = 1.0; // multiplier: 0 = paused, 1 = normal, 5 = fast, 20 = hyper
  public isPaused = false;

  private env: EnvironmentSystem;
  private scene: THREE.Scene;

  // Tracked window materials across the city
  private windowMaterials: WindowMaterialEntry[] = [];

  // Working colors for garbage-free interpolation
  private tmpColor1 = new THREE.Color();
  private tmpColor2 = new THREE.Color();
  private currentAmbientColor = new THREE.Color();
  private currentFogColor = new THREE.Color();
  private currentDirColor = new THREE.Color();
  private currentWindowColors: Record<string, THREE.Color> = {
    downtown: new THREE.Color(),
    residential: new THREE.Color(),
    technology: new THREE.Color(),
    entertainment: new THREE.Color(),
    healthcare: new THREE.Color(),
    education: new THREE.Color(),
    industrial: new THREE.Color(),
    riverside: new THREE.Color(),
    airport: new THREE.Color(),
  };

  // Expose current transition values for inspectability and HUD
  public currentAmbientIntensity = 0.85;
  public currentWindowEmissiveIntensity = 2.2;

  constructor(scene: THREE.Scene, env: EnvironmentSystem, initialWindowMaterials?: WindowMaterialEntry[]) {
    this.scene = scene;
    this.env = env;

    if (initialWindowMaterials && initialWindowMaterials.length > 0) {
      this.registerWindowMaterials(initialWindowMaterials);
    }

    this.applyTimeLighting();
  }

  /**
   * Register a single window material for dynamic emissive transitions
   */
  public registerWindowMaterial(
    mat: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial,
    district = 'downtown',
    baseColor?: number | THREE.Color
  ) {
    if (!mat) return;
    const exists = this.windowMaterials.some((entry) => entry.material === mat);
    if (!exists) {
      const color = baseColor
        ? (baseColor instanceof THREE.Color ? baseColor.clone() : new THREE.Color(baseColor))
        : (mat.emissive ? mat.emissive.clone() : new THREE.Color(0x00f0ff));

      this.windowMaterials.push({
        material: mat,
        district: district.toLowerCase(),
        baseColor: color,
      });
    }
  }

  /**
   * Bulk register window materials
   */
  public registerWindowMaterials(entries: WindowMaterialEntry[]) {
    entries.forEach((e) => this.registerWindowMaterial(e.material, e.district, e.baseColor));
  }

  /**
   * Traverse the scene to scan and automatically register any window materials
   */
  public scanAndRegisterWindowMaterials(root?: THREE.Object3D) {
    const targetRoot = root || this.scene;
    targetRoot.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const mat = obj.material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => this.checkAndRegisterMaterial(m, obj.userData?.district));
        } else if (mat) {
          this.checkAndRegisterMaterial(mat, obj.userData?.district || obj.userData?.buildingData?.districtId);
        }
      }
    });
    // Immediately apply current time-of-day lighting & emissive values
    this.applyTimeLighting();
  }

  private checkAndRegisterMaterial(mat: THREE.Material, fallbackDistrict?: string) {
    if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
      const isMarked = Boolean(mat.userData?.isWindowMaterial);
      const hasWindowMap = Boolean(mat.emissiveMap) || (mat.map && mat.map.name?.includes('window'));
      if (isMarked || hasWindowMap) {
        const district = mat.userData?.district || fallbackDistrict || 'downtown';
        const baseColor = mat.userData?.baseColor || mat.emissive?.getHex() || 0x00f0ff;
        this.registerWindowMaterial(mat, district, baseColor);
      }
    }
  }

  public setTime(hour: number) {
    this.timeOfDay = ((hour % 24) + 24) % 24;
    this.applyTimeLighting();
  }

  public setSpeed(speed: number) {
    this.timeSpeed = speed;
  }

  public togglePause() {
    this.isPaused = !this.isPaused;
  }

  public getTimeString(): string {
    const totalMinutes = Math.floor(this.timeOfDay * 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    const seconds = Math.floor((this.timeOfDay * 3600) % 60);

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  public getDistrictActivity(districtId: DistrictId): number {
    const h = this.timeOfDay;

    switch (districtId) {
      case 'downtown':
        return (h >= 8 && h <= 18) ? 92 : (h >= 19 && h <= 23) ? 65 : 32;

      case 'technology':
        return (h >= 8 && h <= 21) ? 88 : 62;

      case 'education':
        return (h >= 8 && h <= 17) ? 94 : (h >= 17 && h <= 22) ? 45 : 12;

      case 'healthcare':
        return (h >= 8 && h <= 20) ? 82 : 74;

      case 'residential':
        return (h >= 6 && h <= 9 || h >= 18 && h <= 23) ? 90 : (h >= 10 && h <= 17) ? 42 : 80;

      case 'entertainment':
        return (h >= 18 || h <= 3) ? 98 : (h >= 12 && h < 18) ? 55 : 20;

      case 'industrial':
        return (h >= 6 && h <= 22) ? 78 : 50;

      case 'riverside':
        return (h >= 16 && h <= 23) ? 85 : (h >= 11 && h <= 16) ? 60 : 25;

      case 'airport':
        return (h >= 6 && h <= 23) ? 84 : 45;

      default:
        return 70;
    }
  }

  public isNight(): boolean {
    return this.timeOfDay < 5.5 || this.timeOfDay > 19.5;
  }

  public update(delta: number) {
    if (!this.isPaused) {
      // 1 real second = 0.05 sim hour at 1x speed (a full 24h day takes ~8 minutes)
      const simHourDelta = (delta / 20) * this.timeSpeed;
      this.timeOfDay = (this.timeOfDay + simHourDelta) % 24;
      this.applyTimeLighting();
    }
  }

  /**
   * Dynamically transition ambient light intensity, fog color, directional light,
   * and window emissive colors based on the timeOfDay state variable.
   */
  public applyTimeLighting() {
    const h = ((this.timeOfDay % 24) + 24) % 24;

    // Find the bounding keyframes
    let k1 = TIME_KEYFRAMES[0];
    let k2 = TIME_KEYFRAMES[1];

    for (let i = 0; i < TIME_KEYFRAMES.length - 1; i++) {
      if (h >= TIME_KEYFRAMES[i].hour && h <= TIME_KEYFRAMES[i + 1].hour) {
        k1 = TIME_KEYFRAMES[i];
        k2 = TIME_KEYFRAMES[i + 1];
        break;
      }
    }

    // Normalized progress between k1 and k2
    const span = k2.hour - k1.hour;
    const rawT = span > 0 ? (h - k1.hour) / span : 0;
    // Smoothstep interpolation for soft, organic curve transitions
    const t = rawT * rawT * (3 - 2 * rawT);

    // 1. DYNAMIC AMBIENT LIGHT INTENSITY & COLOR
    this.currentAmbientIntensity = THREE.MathUtils.lerp(k1.ambientIntensity, k2.ambientIntensity, t);
    this.env.ambientLight.intensity = this.currentAmbientIntensity;

    this.tmpColor1.setHex(k1.ambientColor);
    this.tmpColor2.setHex(k2.ambientColor);
    this.currentAmbientColor.copy(this.tmpColor1).lerp(this.tmpColor2, t);
    this.env.ambientLight.color.copy(this.currentAmbientColor);

    // 2. DYNAMIC FOG COLOR & SKY BACKGROUND
    this.tmpColor1.setHex(k1.fogColor);
    this.tmpColor2.setHex(k2.fogColor);
    this.currentFogColor.copy(this.tmpColor1).lerp(this.tmpColor2, t);

    const fog = this.scene.fog as THREE.FogExp2;
    if (fog) {
      fog.color.copy(this.currentFogColor);
    }
    if (this.scene.background instanceof THREE.Color) {
      this.scene.background.copy(this.currentFogColor);
    }

    // 3. SUN / MOON CELESTIAL POSITION & DIRECTIONAL LIGHT
    const angle = ((h - 6) / 24) * Math.PI * 2;
    const sunHeight = Math.sin(angle);
    const sunDist = 320;

    const posX = Math.cos(angle) * sunDist;
    const posY = Math.max(28, sunHeight * sunDist);
    const posZ = 120;
    this.env.dirLight.position.set(posX, posY, posZ);

    this.env.dirLight.intensity = THREE.MathUtils.lerp(k1.dirIntensity, k2.dirIntensity, t);
    this.tmpColor1.setHex(k1.dirColor);
    this.tmpColor2.setHex(k2.dirColor);
    this.currentDirColor.copy(this.tmpColor1).lerp(this.tmpColor2, t);
    this.env.dirLight.color.copy(this.currentDirColor);

    // 4. DISTRICT LIGHT ACCENTS MULTIPLIER
    const districtLightMult = THREE.MathUtils.lerp(k1.districtLightMultiplier, k2.districtLightMultiplier, t);
    this.env.districtLights.forEach((light) => {
      light.intensity = 4.0 * districtLightMult;
    });

    // 5. DYNAMIC WINDOW EMISSIVE COLORS & INTENSITY
    this.currentWindowEmissiveIntensity = THREE.MathUtils.lerp(
      k1.windowEmissiveIntensity,
      k2.windowEmissiveIntensity,
      t
    );

    // Compute interpolated target colors for all districts
    const interpolateDistrict = (c1: number, c2: number): THREE.Color => {
      return new THREE.Color(c1).lerp(new THREE.Color(c2), t);
    };

    this.currentWindowColors.downtown = interpolateDistrict(k1.downtownWindow, k2.downtownWindow);
    this.currentWindowColors.residential = interpolateDistrict(k1.residentialWindow, k2.residentialWindow);
    this.currentWindowColors.technology = interpolateDistrict(k1.techWindow, k2.techWindow);
    this.currentWindowColors.entertainment = interpolateDistrict(k1.entertainmentWindow, k2.entertainmentWindow);
    this.currentWindowColors.healthcare = interpolateDistrict(k1.healthcareWindow, k2.healthcareWindow);
    this.currentWindowColors.education = interpolateDistrict(k1.educationWindow, k2.educationWindow);
    this.currentWindowColors.industrial = interpolateDistrict(k1.industrialWindow, k2.industrialWindow);
    this.currentWindowColors.riverside = this.currentWindowColors.downtown;
    this.currentWindowColors.airport = this.currentWindowColors.technology;

    // Apply to all registered window materials
    const winIntensity = this.currentWindowEmissiveIntensity;
    for (let i = 0; i < this.windowMaterials.length; i++) {
      const entry = this.windowMaterials[i];
      const mat = entry.material;
      const districtKey = entry.district in this.currentWindowColors ? entry.district : 'downtown';
      const targetColor = this.currentWindowColors[districtKey];

      if (mat.emissive) {
        if (entry.baseColor) {
          // Gracefully blend base architectural accent with dynamic time-of-day sky reflection
          mat.emissive.copy(entry.baseColor).lerp(targetColor, 0.65);
        } else {
          mat.emissive.copy(targetColor);
        }
        mat.emissiveIntensity = winIntensity;
      }
    }
  }

  // Getters for status & monitoring
  public getAmbientIntensity(): number {
    return this.currentAmbientIntensity;
  }

  public getFogColor(): THREE.Color {
    return this.currentFogColor.clone();
  }

  public getWindowEmissiveIntensity(): number {
    return this.currentWindowEmissiveIntensity;
  }
}
