/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WeatherType } from '../city/types';

export interface GameSaveData {
  version: string;
  timestamp: number;
  timeOfDay: number;
  currentWeather: WeatherType;
  playerPosition: [number, number, number];
  cameraMode: string;
  completedMissions: string[];
  totalCredits: number;
  discoveredLandmarks: string[];
  settings: {
    audioMuted: boolean;
    trafficDensity: string;
    highQualityShadows: boolean;
    bloomEnabled: boolean;
  };
}

const STORAGE_KEY = 'neon_ai_city_save_v1';

export class SaveManager {
  public static saveGame(data: Partial<GameSaveData>): boolean {
    try {
      const existing = this.loadGame() || this.getDefaultSave();
      const merged: GameSaveData = {
        ...existing,
        ...data,
        timestamp: Date.now(),
        settings: {
          ...existing.settings,
          ...(data.settings || {}),
        },
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return true;
    } catch (e) {
      console.warn('[SaveManager] Failed to write to localStorage:', e);
      return false;
    }
  }

  public static loadGame(): GameSaveData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as GameSaveData;
    } catch {
      return null;
    }
  }

  public static getDefaultSave(): GameSaveData {
    return {
      version: '1.0',
      timestamp: Date.now(),
      timeOfDay: 23.7,
      currentWeather: 'CLEAR',
      playerPosition: [0, 2.2, 0],
      cameraMode: 'orbit',
      completedMissions: [],
      totalCredits: 12500,
      discoveredLandmarks: ['mohit-developer-hub-hq', 'railway-terminal-central'],
      settings: {
        audioMuted: false,
        trafficDensity: 'HIGH',
        highQualityShadows: true,
        bloomEnabled: true,
      },
    };
  }

  public static clearSave(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch {
      return false;
    }
  }
}
