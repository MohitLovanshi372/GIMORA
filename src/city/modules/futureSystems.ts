/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

/**
 * ARCHITECTURE FOR FUTURE SYSTEMS
 *
 * This module defines the extensible interfaces and registration hooks
 * for systems that will be added in subsequent milestones:
 * 1. Cars (autonomous ground vehicles)
 * 2. Buses (public transit routing)
 * 3. Trains (elevated maglev system)
 * 4. Pedestrians (crowd simulation)
 * 5. Traffic Simulation (lane navigation, pathfinding)
 * 6. Traffic AI Agent (adaptive signal control & grid optimization)
 * 7. Citizen AI Agents (daily schedules, occupations, dialogue)
 * 8. Emergency AI Agent (incident dispatch, sirens, routing)
 * 9. Train AI Agent (timetable scheduling, collision prevention)
 * 10. Weather System (rain, lightning, volumetric clouds)
 * 11. Day/Night Cycle (sun trajectory, dynamic shadow angles)
 * 12. Dynamic City Events (blackouts, cyber parades, festivals)
 * 13. GLB Assets Loader (drop-in replacement for procedural buildings)
 * 14. GitHub / Project Building Integration (showcase repositories in MOHIT DEVELOPER HUB)
 */

export interface FutureSystemPlugin {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  init?: (scene: THREE.Scene, context: CityContext) => void;
  update?: (delta: number, time: number) => void;
  dispose?: () => void;
}

export interface CityContext {
  scene: THREE.Scene;
  roadWaypoints: THREE.Vector3[];
  transitWaypoints: THREE.Vector3[];
  pedestrianWaypoints: THREE.Vector3[];
  landmarkArea: { center: [number, number, number]; bounds: [number, number] };
}

// 1. Vehicles & Traffic System Interface
export interface TrafficSimulationSystem extends FutureSystemPlugin {
  carsCount: number;
  busesCount: number;
  spawnCar: (type: 'cyber-coupe' | 'sedan' | 'delivery-drone', routeId: string) => void;
  spawnBus: (routeId: string) => void;
  setTrafficDensity: (density: number) => void;
}

// 2. Trains & Maglev System Interface
export interface MaglevTransitSystem extends FutureSystemPlugin {
  activeTrains: number;
  dispatchTrain: (lineId: string) => void;
  setTrackSpeed: (speed: number) => void;
}

// 3. Pedestrian & NPC Crowds Interface
export interface PedestrianCrowdSystem extends FutureSystemPlugin {
  pedestrianCount: number;
  setCrowdDensity: (density: number) => void;
}

// 4. City AI Agents System Interface
export interface CityAgentsSystem extends FutureSystemPlugin {
  trafficAgent: {
    optimizeFlow: () => void;
    currentCongestionIndex: number;
  };
  citizenAgent: {
    activeCitizens: number;
    queryCitizenStatus: (citizenId: string) => any;
  };
  emergencyAgent: {
    activeIncidents: number;
    dispatchUnit: (type: 'police' | 'medevac' | 'fire', targetDistrict: string) => void;
  };
  trainAgent: {
    scheduleAdherence: number;
  };
}

// 5. Environmental & Weather System Interface
export interface WeatherEnvironmentSystem extends FutureSystemPlugin {
  currentWeather: 'clear-night' | 'acid-rain' | 'dense-fog' | 'electric-storm';
  timeOfDay: number; // 0 - 24 hours
  setWeather: (weather: string) => void;
  setTimeOfDay: (hour: number) => void;
}

// 6. External GLB Assets Loader Hook
export interface GLBAssetLoaderPlugin extends FutureSystemPlugin {
  loadBuildingModel: (buildingId: string, glbUrl: string) => Promise<THREE.Object3D>;
  replaceProceduralWithGLB: (buildingId: string, glbModel: THREE.Object3D) => void;
}

// 7. GitHub Developer Hub Integration Hook
export interface GitHubDeveloperHubPlugin extends FutureSystemPlugin {
  hubOwner: string;
  loadRepositories: (username: string) => Promise<any[]>;
  renderRepoHologram: (repo: any, slotIndex: number) => void;
}

/**
 * Future Systems Registry Manager
 */
export class FutureSystemsRegistry {
  private plugins = new Map<string, FutureSystemPlugin>();
  private context: CityContext | null = null;

  init(context: CityContext) {
    this.context = context;
  }

  register(plugin: FutureSystemPlugin) {
    this.plugins.set(plugin.id, plugin);
    if (this.context && plugin.init) {
      plugin.init(this.context.scene, this.context);
    }
  }

  unregister(pluginId: string) {
    const plugin = this.plugins.get(pluginId);
    if (plugin && plugin.dispose) {
      plugin.dispose();
    }
    this.plugins.delete(pluginId);
  }

  update(delta: number, time: number) {
    this.plugins.forEach((plugin) => {
      if (plugin.enabled && plugin.update) {
        plugin.update(delta, time);
      }
    });
  }

  dispose() {
    this.plugins.forEach((plugin) => {
      if (plugin.dispose) plugin.dispose();
    });
    this.plugins.clear();
  }

  getRegisteredSystems(): string[] {
    return Array.from(this.plugins.keys());
  }
}
