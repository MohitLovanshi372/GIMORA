/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TrafficDensityLevel } from '../city/types';

export interface CityEvent {
  id: string;
  type:
    | 'ACCIDENT'
    | 'FIRE'
    | 'MEDICAL_EMERGENCY'
    | 'TRAFFIC_JAM'
    | 'TRAIN_DELAY'
    | 'ROAD_BLOCK'
    | 'WEATHER_CHANGE'
    | 'POWER_OUTAGE'
    | 'CITY_EVENT';
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  districtId: string;
  districtName: string;
  location: { x: number; y: number; z: number };
  roadId?: string;
  description: string;
  timestamp: string;
  status: 'ACTIVE' | 'DISPATCHED' | 'RESOLVING' | 'RESOLVED';
  assignedVehicleId?: string;
  assignedAgent?: string;
  timeline: { time: string; stage: string; note: string }[];
}

export interface CityStateSnapshot {
  simulationTime: string;
  weather: {
    condition: string;
    temperature: string;
    fogDensity: string;
    airQuality: string;
  };
  population: number;
  traffic: {
    density: TrafficDensityLevel;
    activeVehicles: number;
    averageSpeed: number;
    roadCongestion: number;
    intersectionStates: {
      id: string;
      currentPhase: 'NS' | 'EW';
      isRedOnMainAxis: boolean;
    }[];
  };
  transit: {
    activeTrains: number;
    trains: {
      id: string;
      type: 'passenger' | 'freight';
      currentStation: string;
      nextStation: string;
      speed: number;
      state: string;
    }[];
    stations: {
      id: string;
      name: string;
      crowdLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'OVERCROWDED';
      delayMinutes: number;
    }[];
  };
  emergencies: {
    activeCount: number;
    criticalCount: number;
    events: CityEvent[];
    recentResolved: CityEvent[];
  };
  citizens: {
    activePedestrians: number;
    activityBreakdown: {
      home: number;
      work: number;
      transit: number;
      recreation: number;
      healthcare: number;
    };
    moraleIndex: number;
  };
  infrastructure: {
    powerStatus: 'OPTIMAL' | 'STRAINED' | 'CRITICAL_LOAD';
    gridSurplusMW: number;
    districtStatuses: Record<string, { status: string; alerts: string[] }>;
  };
}

export class CityState {
  private state: CityStateSnapshot;

  constructor() {
    this.state = {
      simulationTime: '23:45:00',
      weather: {
        condition: 'Acid Rain',
        temperature: '18°C',
        fogDensity: '38%',
        airQuality: 'AQI 42 (Clean)',
      },
      population: 4821900,
      traffic: {
        density: 'HIGH',
        activeVehicles: 88,
        averageSpeed: 52,
        roadCongestion: 14,
        intersectionStates: [],
      },
      transit: {
        activeTrains: 3,
        trains: [
          {
            id: 'pass-01',
            type: 'passenger',
            currentStation: 'Central Hyper-Transit Terminal',
            nextStation: 'Continental North Hub',
            speed: 38,
            state: 'cruising',
          },
          {
            id: 'pass-02',
            type: 'passenger',
            currentStation: 'Central Hyper-Transit Terminal',
            nextStation: 'Skyline South Terminal',
            speed: 38,
            state: 'cruising',
          },
          {
            id: 'freight-01',
            type: 'freight',
            currentStation: 'Industrial Geothermal Depot',
            nextStation: 'Central Logistics Nexus',
            speed: 24,
            state: 'cruising',
          },
        ],
        stations: [
          {
            id: 'station-central',
            name: 'Central Hyper-Transit Terminal',
            crowdLevel: 'MEDIUM',
            delayMinutes: 0,
          },
        ],
      },
      emergencies: {
        activeCount: 0,
        criticalCount: 0,
        events: [],
        recentResolved: [],
      },
      citizens: {
        activePedestrians: 42,
        activityBreakdown: {
          home: 45,
          work: 30,
          transit: 12,
          recreation: 10,
          healthcare: 3,
        },
        moraleIndex: 94,
      },
      infrastructure: {
        powerStatus: 'OPTIMAL',
        gridSurplusMW: 450,
        districtStatuses: {
          downtown: { status: 'Nominal', alerts: [] },
          technology: { status: 'Nominal', alerts: [] },
          education: { status: 'Nominal', alerts: [] },
          healthcare: { status: 'Nominal', alerts: [] },
          residential: { status: 'Nominal', alerts: [] },
          entertainment: { status: 'Peak Night Activity', alerts: [] },
          industrial: { status: 'Surplus Generation', alerts: [] },
          railway: { status: 'High Transit Flow', alerts: [] },
          riverside: { status: 'Normal Promenade', alerts: [] },
        },
      },
    };
  }

  public getSnapshot(): CityStateSnapshot {
    return JSON.parse(JSON.stringify(this.state));
  }

  public updateTime(timeStr: string) {
    this.state.simulationTime = timeStr;
  }

  public updateTrafficData(
    density: TrafficDensityLevel,
    activeVehicles: number,
    averageSpeed: number,
    congestion: number,
    intersections: { id: string; currentPhase: 'NS' | 'EW'; isRedOnMainAxis: boolean }[]
  ) {
    this.state.traffic.density = density;
    this.state.traffic.activeVehicles = activeVehicles;
    this.state.traffic.averageSpeed = averageSpeed;
    this.state.traffic.roadCongestion = congestion;
    this.state.traffic.intersectionStates = intersections;
  }

  public updateTransitData(
    activeTrains: number,
    trains: { id: string; type: 'passenger' | 'freight'; currentStation: string; nextStation: string; speed: number; state: string }[]
  ) {
    this.state.transit.activeTrains = activeTrains;
    this.state.transit.trains = trains;
  }

  public updatePedestriansCount(count: number) {
    this.state.citizens.activePedestrians = count;
  }

  public updateEvents(activeEvents: CityEvent[], resolvedEvents: CityEvent[]) {
    this.state.emergencies.events = activeEvents;
    this.state.emergencies.activeCount = activeEvents.length;
    this.state.emergencies.criticalCount = activeEvents.filter(
      (e) => e.severity === 'CRITICAL' || e.severity === 'HIGH'
    ).length;
    this.state.emergencies.recentResolved = resolvedEvents.slice(-5);
  }

  public setDistrictAlert(districtId: string, alert: string) {
    if (this.state.infrastructure.districtStatuses[districtId]) {
      this.state.infrastructure.districtStatuses[districtId].alerts.push(alert);
    }
  }

  public clearDistrictAlerts(districtId: string) {
    if (this.state.infrastructure.districtStatuses[districtId]) {
      this.state.infrastructure.districtStatuses[districtId].alerts = [];
    }
  }
}
