/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CityEvent } from './CityState';

export type MissionType =
  | 'TRAFFIC_RESPONSE'
  | 'EMERGENCY_RESPONSE'
  | 'TRAIN_INSPECTION'
  | 'CITY_EXPLORATION'
  | 'DELIVERY'
  | 'BUILDING_INSPECTION'
  | 'AI_SYSTEM_CHECK'
  | 'EVENT_MANAGEMENT';

export interface MissionObjective {
  id: string;
  description: string;
  completed: boolean;
  targetPosition?: [number, number, number];
  requiredDistance?: number;
}

export interface CityMission {
  id: string;
  title: string;
  type: MissionType;
  description: string;
  districtId: string;
  objectives: MissionObjective[];
  currentObjectiveIndex: number;
  rewardCredits: number;
  aiTrustBonus: number;
  status: 'AVAILABLE' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  startedAt?: number;
  completedAt?: number;
  linkedEventId?: string;
}

export const PRESET_MISSIONS: CityMission[] = [
  {
    id: 'mission-accident-downtown',
    title: 'Downtown Avenue Collision Response',
    type: 'EMERGENCY_RESPONSE',
    description: 'A cyber-autonomous vehicle collision has obstructed East Avenue. Reach the scene, inspect vehicle telemetry, coordinate emergency green corridor, and clear the roadway.',
    districtId: 'downtown',
    rewardCredits: 3500,
    aiTrustBonus: 6,
    status: 'AVAILABLE',
    currentObjectiveIndex: 0,
    objectives: [
      {
        id: 'obj-1',
        description: 'Navigate to the incident zone on Central Avenue',
        completed: false,
        targetPosition: [-90, 2, -40],
        requiredDistance: 45,
      },
      {
        id: 'obj-2',
        description: 'Authorize Emergency Agent green signal corridor override',
        completed: false,
      },
      {
        id: 'obj-3',
        description: 'Inspect vehicle diagnostics and clear debris',
        completed: false,
      },
      {
        id: 'obj-4',
        description: 'Restore autonomous traffic flow',
        completed: false,
      },
    ],
  },
  {
    id: 'mission-mohit-hub-inspection',
    title: 'MOHIT DEVELOPER HUB Systems Audit',
    type: 'BUILDING_INSPECTION',
    description: 'Conduct a comprehensive architectural inspection of the flagship MOHIT DEVELOPER HUB. Visit the Project Showcase and verify AI Laboratory reactor stability.',
    districtId: 'technology',
    rewardCredits: 4200,
    aiTrustBonus: 8,
    status: 'AVAILABLE',
    currentObjectiveIndex: 0,
    objectives: [
      {
        id: 'obj-1',
        description: 'Arrive at the main entrance plaza of MOHIT DEVELOPER HUB',
        completed: false,
        targetPosition: [140, 2, -80],
        requiredDistance: 35,
      },
      {
        id: 'obj-2',
        description: 'Enter the building and inspect the Featured Project Showcase Wall',
        completed: false,
      },
      {
        id: 'obj-3',
        description: 'Ascend to Level 3 AI Laboratory and check quantum core stability',
        completed: false,
      },
      {
        id: 'obj-4',
        description: 'Access the Rooftop AI Command Center',
        completed: false,
      },
    ],
  },
  {
    id: 'mission-train-inspection',
    title: 'Maglev Express Speed Diagnostic',
    type: 'TRAIN_INSPECTION',
    description: 'Inspect the superconducting maglev express train during active revenue service. Monitor passenger boarding at Central Station.',
    districtId: 'railway',
    rewardCredits: 2800,
    aiTrustBonus: 5,
    status: 'AVAILABLE',
    currentObjectiveIndex: 0,
    objectives: [
      {
        id: 'obj-1',
        description: 'Locate the Central Maglev Terminal Concourse',
        completed: false,
        targetPosition: [0, 2, -220],
        requiredDistance: 40,
      },
      {
        id: 'obj-2',
        description: 'Engage Train Follow Camera mode and monitor track velocity',
        completed: false,
      },
      {
        id: 'obj-3',
        description: 'Verify magnetic levitation stability across River Bridge',
        completed: false,
      },
    ],
  },
  {
    id: 'mission-grid-blackout',
    title: 'Entertainment Sector Power Restoration',
    type: 'EVENT_MANAGEMENT',
    description: 'Substation overload in Entertainment District. Switch auxiliary geothermal power and restart neon grid luminaires.',
    districtId: 'entertainment',
    rewardCredits: 5000,
    aiTrustBonus: 10,
    status: 'AVAILABLE',
    currentObjectiveIndex: 0,
    objectives: [
      {
        id: 'obj-1',
        description: 'Reach the Entertainment District Neon Boulevard',
        completed: false,
        targetPosition: [-160, 2, -180],
        requiredDistance: 45,
      },
      {
        id: 'obj-2',
        description: 'Trigger Smart Energy Manager secondary fusion route',
        completed: false,
      },
      {
        id: 'obj-3',
        description: 'Confirm 100% luminaire and digital facade re-ignition',
        completed: false,
      },
    ],
  },
  {
    id: 'mission-grand-tour',
    title: 'Metropolitan Aerial Survey',
    type: 'CITY_EXPLORATION',
    description: 'Execute a full survey of all 10 administrative city biomes from the airport to the riverside promenade.',
    districtId: 'airport',
    rewardCredits: 3000,
    aiTrustBonus: 7,
    status: 'AVAILABLE',
    currentObjectiveIndex: 0,
    objectives: [
      {
        id: 'obj-1',
        description: 'Initiate Guided Cinematic City Flyover Tour',
        completed: false,
      },
      {
        id: 'obj-2',
        description: 'Survey Sub-Orbital Airport runway operations',
        completed: false,
      },
      {
        id: 'obj-3',
        description: 'Survey MOHIT DEVELOPER HUB skybridges and river bridges',
        completed: false,
      },
    ],
  },
];

export class MissionManager {
  public missions: CityMission[] = [];
  public activeMission: CityMission | null = null;
  public completedMissionsCount = 0;
  public totalCreditsEarned = 0;

  constructor() {
    this.missions = JSON.parse(JSON.stringify(PRESET_MISSIONS));
  }

  public getAvailableMissions(): CityMission[] {
    return this.missions.filter((m) => m.status === 'AVAILABLE');
  }

  public startMission(missionId: string): CityMission | null {
    const mission = this.missions.find((m) => m.id === missionId);
    if (!mission) return null;

    if (this.activeMission) {
      this.activeMission.status = 'AVAILABLE';
    }

    mission.status = 'ACTIVE';
    mission.startedAt = Date.now();
    mission.currentObjectiveIndex = 0;
    this.activeMission = mission;
    return mission;
  }

  public advanceObjective(): boolean {
    if (!this.activeMission) return false;

    const mission = this.activeMission;
    if (mission.currentObjectiveIndex < mission.objectives.length) {
      mission.objectives[mission.currentObjectiveIndex].completed = true;
      mission.currentObjectiveIndex++;

      // Check if all objectives completed
      if (mission.currentObjectiveIndex >= mission.objectives.length) {
        mission.status = 'COMPLETED';
        mission.completedAt = Date.now();
        this.completedMissionsCount++;
        this.totalCreditsEarned += mission.rewardCredits;
        this.activeMission = null;
        return true;
      }
    }
    return false;
  }

  public abandonMission() {
    if (this.activeMission) {
      this.activeMission.status = 'AVAILABLE';
      this.activeMission.objectives.forEach((o) => (o.completed = false));
      this.activeMission.currentObjectiveIndex = 0;
      this.activeMission = null;
    }
  }

  /**
   * Automatically generate playable mission from dynamic city event
   */
  public createMissionFromEvent(event: CityEvent): CityMission {
    const eventMission: CityMission = {
      id: `mission-event-${event.id}`,
      title: `${event.title} Emergency Response`,
      type: event.type === 'ACCIDENT' || event.type === 'TRAFFIC_JAM' ? 'TRAFFIC_RESPONSE' : 'EMERGENCY_RESPONSE',
      description: `Active incident reported in ${event.districtId}. ${event.description}. Coordinate with AI Emergency services to reach and resolve the scene.`,
      districtId: event.districtId,
      rewardCredits: 4000,
      aiTrustBonus: 8,
      status: 'AVAILABLE',
      linkedEventId: event.id,
      currentObjectiveIndex: 0,
      objectives: [
        {
          id: 'obj-reach',
          description: `Reach incident coordinates in ${event.districtId}`,
          completed: false,
          targetPosition: [event.location.x, event.location.y, event.location.z],
          requiredDistance: 40,
        },
        {
          id: 'obj-coordinate',
          description: 'Deploy Emergency Agent dispatch & green corridor',
          completed: false,
        },
        {
          id: 'obj-resolve',
          description: 'Verify hazard mitigation & resolve incident',
          completed: false,
        },
      ],
    };

    // Add if not already present
    if (!this.missions.some((m) => m.id === eventMission.id)) {
      this.missions.unshift(eventMission);
    }
    return eventMission;
  }

  /**
   * Distance-based objective auto-check
   */
  public updatePlayerPosition(playerPos: THREE.Vector3) {
    if (!this.activeMission) return;

    const currentObj = this.activeMission.objectives[this.activeMission.currentObjectiveIndex];
    if (currentObj && currentObj.targetPosition && !currentObj.completed) {
      const targetVec = new THREE.Vector3(...currentObj.targetPosition);
      const dist = new THREE.Vector2(playerPos.x, playerPos.z).distanceTo(
        new THREE.Vector2(targetVec.x, targetVec.z)
      );

      const threshold = currentObj.requiredDistance || 35;
      if (dist <= threshold) {
        this.advanceObjective();
      }
    }
  }
}

export const missionManager = new MissionManager();
