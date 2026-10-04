/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { WeatherType } from '../city/types';
import { CityMaterials } from '../assets/materials';
import { EnvironmentSystem } from '../environment/EnvironmentManager';

export class WeatherManager {
  public currentWeather: WeatherType = 'CLEAR';
  private scene: THREE.Scene;
  private materials: CityMaterials;
  private env: EnvironmentSystem;

  // Rain Particle System
  private rainCount = 3500;
  private rainGeo!: THREE.BufferGeometry;
  private rainMat!: THREE.PointsMaterial;
  private rainPoints!: THREE.Points;
  private rainVelocities!: Float32Array;

  // Lightning Simulation
  private lightningTimer = 0;
  private nextLightningTime = 5;
  private isFlashing = false;
  private flashTimer = 0;

  constructor(scene: THREE.Scene, materials: CityMaterials, env: EnvironmentSystem) {
    this.scene = scene;
    this.materials = materials;
    this.env = env;
    this.initRainSystem();
    this.applyWeatherSettings(this.currentWeather);
  }

  private initRainSystem() {
    this.rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.rainCount * 3);
    this.rainVelocities = new Float32Array(this.rainCount);

    const spreadX = 450;
    const spreadZ = 450;
    const heightMax = 180;

    for (let i = 0; i < this.rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spreadX;
      positions[i * 3 + 1] = Math.random() * heightMax;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spreadZ;
      this.rainVelocities[i] = 120 + Math.random() * 60; // fall speed m/s
    }

    this.rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.rainMat = new THREE.PointsMaterial({
      color: 0x88ccff,
      size: 0.85,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.rainPoints = new THREE.Points(this.rainGeo, this.rainMat);
    this.rainPoints.name = 'weather_rain_particles';
    this.scene.add(this.rainPoints);
  }

  public setWeather(type: WeatherType) {
    this.currentWeather = type;
    this.applyWeatherSettings(type);
  }

  public getSpeedMultiplier(): number {
    switch (this.currentWeather) {
      case 'RAIN':
        return 0.8;
      case 'HEAVY_RAIN':
        return 0.68;
      case 'STORM':
        return 0.55;
      case 'FOG':
        return 0.75;
      default:
        return 1.0;
    }
  }

  public isRaining(): boolean {
    return this.currentWeather === 'RAIN' || this.currentWeather === 'HEAVY_RAIN' || this.currentWeather === 'STORM';
  }

  private applyWeatherSettings(type: WeatherType) {
    const fog = this.scene.fog as THREE.FogExp2;

    switch (type) {
      case 'CLEAR':
        this.rainMat.opacity = 0.0;
        this.materials.asphalt.roughness = 0.85;
        this.materials.asphalt.metalness = 0.2;
        this.materials.sidewalk.roughness = 0.8;
        if (fog) {
          fog.density = 0.0014;
          fog.color.setHex(0x060814);
        }
        break;

      case 'CLOUDY':
        this.rainMat.opacity = 0.0;
        this.materials.asphalt.roughness = 0.8;
        this.materials.asphalt.metalness = 0.25;
        if (fog) {
          fog.density = 0.0022;
          fog.color.setHex(0x080c1e);
        }
        break;

      case 'RAIN':
        this.rainMat.opacity = 0.6;
        // Wet road reflections
        this.materials.asphalt.roughness = 0.15;
        this.materials.asphalt.metalness = 0.85;
        this.materials.sidewalk.roughness = 0.25;
        if (fog) {
          fog.density = 0.003;
          fog.color.setHex(0x0a1024);
        }
        break;

      case 'HEAVY_RAIN':
        this.rainMat.opacity = 0.9;
        this.materials.asphalt.roughness = 0.08;
        this.materials.asphalt.metalness = 0.92;
        this.materials.sidewalk.roughness = 0.18;
        if (fog) {
          fog.density = 0.0042;
          fog.color.setHex(0x070b18);
        }
        break;

      case 'FOG':
        this.rainMat.opacity = 0.0;
        this.materials.asphalt.roughness = 0.55;
        this.materials.asphalt.metalness = 0.4;
        if (fog) {
          fog.density = 0.0048;
          fog.color.setHex(0x0e172a);
        }
        break;

      case 'STORM':
        this.rainMat.opacity = 0.95;
        this.materials.asphalt.roughness = 0.05;
        this.materials.asphalt.metalness = 0.95;
        this.materials.sidewalk.roughness = 0.12;
        if (fog) {
          fog.density = 0.0038;
          fog.color.setHex(0x040610);
        }
        break;
    }
  }

  public update(delta: number, _elapsedTime: number) {
    // 1. Update Falling Rain
    if (this.isRaining()) {
      const posAttr = this.rainGeo.getAttribute('position') as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;

      for (let i = 0; i < this.rainCount; i++) {
        arr[i * 3 + 1] -= this.rainVelocities[i] * delta;
        // Wind drift
        arr[i * 3] += (this.currentWeather === 'STORM' ? 14 : 4) * delta;

        // Reset if hitting ground
        if (arr[i * 3 + 1] < 0) {
          arr[i * 3 + 1] = 160 + Math.random() * 20;
          arr[i * 3] = (Math.random() - 0.5) * 450;
        }
      }
      posAttr.needsUpdate = true;
    }

    // 2. Storm Lightning Effect
    if (this.currentWeather === 'STORM') {
      this.lightningTimer += delta;

      if (!this.isFlashing && this.lightningTimer > this.nextLightningTime) {
        this.isFlashing = true;
        this.flashTimer = 0;
        this.lightningTimer = 0;
        this.nextLightningTime = 3.5 + Math.random() * 6.5;

        // Flash Light Burst
        this.env.dirLight.intensity = 5.5;
        this.env.dirLight.color.setHex(0xe0f2fe);
        this.env.ambientLight.intensity = 3.2;
      }

      if (this.isFlashing) {
        this.flashTimer += delta;
        if (this.flashTimer > 0.12) {
          // Reset after brief flash
          this.isFlashing = false;
          this.env.dirLight.intensity = 1.85;
          this.env.dirLight.color.setHex(0x4070a0);
          this.env.ambientLight.intensity = 1.25;
        }
      }
    }
  }

  public dispose() {
    this.scene.remove(this.rainPoints);
    this.rainGeo.dispose();
    this.rainMat.dispose();
  }
}
