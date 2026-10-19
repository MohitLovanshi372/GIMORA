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
    ambientIntensity: 0.75,
    ambientColor: 0x1e293b,
    fogColor: 0x0f172a,
    dirIntensity: 0.85,
    dirColor: 0x94a3b8,
    windowEmissiveIntensity: 0.45,
    downtownWindow: 0xfef3c7,
    residentialWindow: 0xfde68a,
    techWindow: 0xf8fafc,
    entertainmentWindow: 0xfef08a,
    healthcareWindow: 0xf1f5f9,
    educationWindow: 0xfef3c7,
    industrialWindow: 0xfcd34d,
    districtLightMultiplier: 0.8,
  },
  {
    hour: 4.5, // Pre-dawn Night
    ambientIntensity: 0.75,
    ambientColor: 0x1e293b,
    fogColor: 0x0f172a,
    dirIntensity: 0.8,
    dirColor: 0x94a3b8,
    windowEmissiveIntensity: 0.42,
    downtownWindow: 0xfef3c7,
    residentialWindow: 0xfde68a,
    techWindow: 0xf8fafc,
    entertainmentWindow: 0xfef08a,
    healthcareWindow: 0xf1f5f9,
    educationWindow: 0xfef3c7,
    industrialWindow: 0xfcd34d,
    districtLightMultiplier: 0.8,
  },
  {
    hour: 5.75, // Pre-Dawn Twilight
    ambientIntensity: 1.1,
    ambientColor: 0x334155,
    fogColor: 0x1e293b,
    dirIntensity: 1.2,
    dirColor: 0xfcd34d,
    windowEmissiveIntensity: 0.35,
    downtownWindow: 0xfef3c7,
    residentialWindow: 0xfde68a,
    techWindow: 0xf8fafc,
    entertainmentWindow: 0xfef08a,
    healthcareWindow: 0xf1f5f9,
    educationWindow: 0xfef3c7,
    industrialWindow: 0xfcd34d,
    districtLightMultiplier: 0.6,
  },
  {
    hour: 6.8, // Sunrise (Golden Dawn)
    ambientIntensity: 1.6,
    ambientColor: 0x64748b,
    fogColor: 0x475569,
    dirIntensity: 2.2,
    dirColor: 0xfdba74,
    windowEmissiveIntensity: 0.22,
    downtownWindow: 0xfef3c7,
    residentialWindow: 0xfde68a,
    techWindow: 0xf8fafc,
    entertainmentWindow: 0xfef08a,
    healthcareWindow: 0xf1f5f9,
    educationWindow: 0xfef3c7,
    industrialWindow: 0xfcd34d,
    districtLightMultiplier: 0.4,
  },
  {
    hour: 8.5, // Morning Commute / Full Daylight
    ambientIntensity: 2.2,
    ambientColor: 0x93c5fd,
    fogColor: 0xcfdbe8,
    dirIntensity: 2.8,
    dirColor: 0xfffbeb,
    windowEmissiveIntensity: 0.08,
    downtownWindow: 0xf8fafc,
    residentialWindow: 0xfef3c7,
    techWindow: 0xf8fafc,
    entertainmentWindow: 0xf8fafc,
    healthcareWindow: 0xf8fafc,
    educationWindow: 0xf8fafc,
    industrialWindow: 0xf8fafc,
    districtLightMultiplier: 0.1,
  },
  {
    hour: 12.0, // High Noon (Bright Natural Sun)
    ambientIntensity: 2.5,
    ambientColor: 0xbfdbfe,
    fogColor: 0xdbeafe,
    dirIntensity: 3.2,
    dirColor: 0xffffff,
    windowEmissiveIntensity: 0.05,
    downtownWindow: 0xf8fafc,
    residentialWindow: 0xf8fafc,
    techWindow: 0xf8fafc,
    entertainmentWindow: 0xf8fafc,
    healthcareWindow: 0xf8fafc,
    educationWindow: 0xf8fafc,
    industrialWindow: 0xf8fafc,
    districtLightMultiplier: 0.0,
  },
  {
    hour: 15.0, // Clear Afternoon
    ambientIntensity: 2.4,
    ambientColor: 0xbfdbfe,
    fogColor: 0xdbeafe,
    dirIntensity: 3.0,
    dirColor: 0xfffdf5,
    windowEmissiveIntensity: 0.06,
    downtownWindow: 0xf8fafc,
    residentialWindow: 0xf8fafc,
    techWindow: 0xf8fafc,
    entertainmentWindow: 0xf8fafc,
    healthcareWindow: 0xf8fafc,
    educationWindow: 0xf8fafc,
    industrialWindow: 0xf8fafc,
    districtLightMultiplier: 0.0,
  },
  {
    hour: 17.5, // Late Afternoon / Warm Golden Hour
    ambientIntensity: 2.0,
    ambientColor: 0x94a3b8,
    fogColor: 0x64748b,
    dirIntensity: 2.6,
    dirColor: 0xfbbf24,
    windowEmissiveIntensity: 0.25,
    downtownWindow: 0xfef3c7,
    residentialWindow: 0xfde68a,
    techWindow: 0xf8fafc,
    entertainmentWindow: 0xfef08a,
    healthcareWindow: 0xf1f5f9,
    educationWindow: 0xfef3c7,
    industrialWindow: 0xfcd34d,
    districtLightMultiplier: 0.3,
  },
  {
    hour: 19.2, // Sunset / Dusk
    ambientIntensity: 1.4,
    ambientColor: 0x475569,
    fogColor: 0x334155,
    dirIntensity: 1.6,
    dirColor: 0xf97316,
    windowEmissiveIntensity: 0.38,
    downtownWindow: 0xfef3c7,
    residentialWindow: 0xfde68a,
    techWindow: 0xf8fafc,
    entertainmentWindow: 0xfef08a,
    healthcareWindow: 0xf1f5f9,
    educationWindow: 0xfef3c7,
    industrialWindow: 0xfcd34d,
    districtLightMultiplier: 0.7,
  },
  {
    hour: 21.0, // Metropolitan Evening
    ambientIntensity: 0.85,
    ambientColor: 0x1e293b,
    fogColor: 0x0f172a,
    dirIntensity: 0.9,
    dirColor: 0x94a3b8,
    windowEmissiveIntensity: 0.48,
    downtownWindow: 0xfef3c7,
    residentialWindow: 0xfde68a,
    techWindow: 0xf8fafc,
    entertainmentWindow: 0xfef08a,
    healthcareWindow: 0xf1f5f9,
    educationWindow: 0xfef3c7,
    industrialWindow: 0xfcd34d,
    districtLightMultiplier: 0.9,
  },
  {
    hour: 24.0, // Midnight Wrap
    ambientIntensity: 0.75,
    ambientColor: 0x1e293b,
    fogColor: 0x0f172a,
    dirIntensity: 0.85,
    dirColor: 0x94a3b8,
    windowEmissiveIntensity: 0.45,
    downtownWindow: 0xfef3c7,
    residentialWindow: 0xfde68a,
    techWindow: 0xf8fafc,
    entertainmentWindow: 0xfef08a,
    healthcareWindow: 0xf1f5f9,
    educationWindow: 0xfef3c7,
    industrialWindow: 0xfcd34d,
    districtLightMultiplier: 0.8,
  },
];

export class CityLifeManager {
  // Current 24-hour time in fractional hours (0.0 to 24.0)
  // Default start at 17.35 (5:21 PM GTA V Los Santos Golden Hour)
  public timeOfDay = 17.35;
  public timeSpeed = 0.4; // multiplier: 0 = paused, 1 = normal, 5 = fast, 20 = hyper
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

    // Update GTA V Atmospheric Sky & Volumetric Cloud Dome Uniforms
    if (this.env.skyUniforms) {
      this.env.skyUniforms.uSunDirection.value.set(posX, posY, posZ).normalize();
      this.env.skyUniforms.uHorizonColor.value.copy(this.currentFogColor);
      this.env.skyUniforms.uSunColor.value.copy(this.currentDirColor);

      const nightFactor = THREE.MathUtils.clamp(1.0 - (sunHeight + 0.15) * 1.6, 0.0, 1.0);
      this.env.skyUniforms.uNightFactor.value = nightFactor;

      // Deep cerulean/cobalt zenith during day, rich midnight indigo at night
      const dayZenith = new THREE.Color(0x1e40af).lerp(this.currentAmbientColor, 0.35);
      const nightZenith = new THREE.Color(0x040814);
      this.env.skyUniforms.uZenithColor.value.copy(dayZenith).lerp(nightZenith, nightFactor);

      if (this.env.starMat) {
        this.env.starMat.opacity = nightFactor * 0.9;
      }
    }

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
