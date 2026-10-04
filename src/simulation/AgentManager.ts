/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { AgentDecision, AgentInfo, CityDirective, ConflictRecord } from './AgentTypes';
import { CityState, CityEvent } from './CityState';
import { CityManagerAgent } from './CityManagerAgent';
import { TrafficAgent } from './TrafficAgent';
import { EmergencyAgent } from './EmergencyAgent';
import { TransitAgent } from './TransitAgent';
import { CitizenAgent } from './CitizenAgent';
import { IncidentVisuals } from './IncidentVisuals';
import { TrafficManager } from '../transportation/TrafficManager';

export interface AgentManagerSnapshot {
  activeDirective: CityDirective;
  agents: AgentInfo[];
  recentDecisions: AgentDecision[];
  activeEmergencies: CityEvent[];
  resolvedEmergencies: CityEvent[];
  conflictRecords: ConflictRecord[];
  citizenMorale: number;
}

export class AgentManager {
  public cityState: CityState;
  public cityManager: CityManagerAgent;
  public trafficAgent: TrafficAgent;
  public emergencyAgent: EmergencyAgent;
  public transitAgent: TransitAgent;
  public citizenAgent: CitizenAgent;

  public incidentVisuals: IncidentVisuals;
  public trafficManager: TrafficManager;

  public decisionsLog: AgentDecision[] = [];
  public maxDecisionsLog = 40;

  constructor(scene: THREE.Scene, trafficManager: TrafficManager) {
    this.cityState = new CityState();
    this.trafficManager = trafficManager;
    this.incidentVisuals = new IncidentVisuals(scene);

    // Instantiate Agents
    this.cityManager = new CityManagerAgent();
    this.trafficAgent = new TrafficAgent();
    this.emergencyAgent = new EmergencyAgent();
    this.transitAgent = new TransitAgent();
    this.citizenAgent = new CitizenAgent();
  }

  public update(delta: number, simTimeStr: string) {
    this.cityState.updateTime(simTimeStr);

    // Sync live traffic & transit data into CityState
    const metrics = this.trafficManager.getMetrics();
    const intersections = Array.from(this.trafficManager.trafficLights.values()).map((tl) => ({
      id: tl.id,
      currentPhase: tl.getStateForAxis('NS') === 'GREEN' ? ('NS' as const) : ('EW' as const),
      isRedOnMainAxis: tl.isRed('NS'),
    }));

    this.cityState.updateTrafficData(
      metrics.densityLevel,
      metrics.activeVehicles,
      metrics.averageSpeed,
      metrics.congestionPercentage,
      intersections
    );

    this.cityState.updatePedestriansCount(metrics.activePedestrians);
    this.cityState.updateEvents(this.emergencyAgent.activeIncidents, this.emergencyAgent.resolvedIncidents);

    const snapshot = this.cityState.getSnapshot();

    // 1. Update City Manager Agent
    const cmDecision = this.cityManager.update(delta, snapshot);
    if (cmDecision) this.processDecision(cmDecision);

    // 2. Update Emergency Agent
    const emDecision = this.emergencyAgent.update(delta, snapshot);
    if (emDecision) this.processDecision(emDecision);

    // 3. Update Traffic Agent
    const trDecision = this.trafficAgent.update(delta, snapshot);
    if (trDecision) this.processDecision(trDecision);

    // 4. Update Transit Agent
    const transitDecision = this.transitAgent.update(delta, snapshot);
    if (transitDecision) this.processDecision(transitDecision);

    // 5. Update Citizen Agent
    const citDecision = this.citizenAgent.update(delta, snapshot);
    if (citDecision) this.processDecision(citDecision);

    // 6. Update 3D Incident Visuals
    this.incidentVisuals.update(performance.now() * 0.001);
  }

  /**
   * Validates and dispatches an agent's proposed decision
   */
  public processDecision(decision: AgentDecision) {
    // Conflict Detection Check:
    // If a traffic signal modification is proposed while an emergency corridor is active
    if (decision.agentType === 'TRAFFIC' && decision.action === 'ADJUST_SIGNAL') {
      const activeEmergency = this.emergencyAgent.activeIncidents.find((e) => e.status === 'DISPATCHED');
      if (activeEmergency) {
        // Arbitrate with City Manager
        const emergencyDecision: AgentDecision = {
          id: `dec_em_active_${Date.now()}`,
          agentType: 'EMERGENCY',
          agentName: this.emergencyAgent.name,
          action: 'REQUEST_GREEN_CORRIDOR',
          params: { emergencyId: activeEmergency.id },
          confidence: 1.0,
          reasoning: 'Active emergency vehicle en route.',
          timestamp: new Date().toLocaleTimeString(),
          status: 'EXECUTING',
        };

        const { approved, rejected } = this.cityManager.arbitrateConflict(emergencyDecision, decision);
        this.logDecision(rejected);
        if (approved === decision) {
          this.executeDecision(decision);
        }
        return;
      }
    }

    decision.status = 'VALIDATED';
    this.executeDecision(decision);
  }

  private executeDecision(decision: AgentDecision) {
    switch (decision.action) {
      case 'REQUEST_GREEN_CORRIDOR': {
        const { axis, duration } = decision.params;
        // Lock key traffic lights along the route to GREEN for corridor
        this.trafficManager.trafficLights.forEach((tl) => {
          tl.setOverride(axis || 'NS', duration || 16.0);
        });
        decision.status = 'EXECUTING';
        break;
      }

      case 'ADJUST_SIGNAL': {
        const { greenDuration } = decision.params;
        if (greenDuration) {
          this.trafficManager.trafficLights.forEach((tl) => {
            tl.greenDuration = greenDuration;
          });
        }
        decision.status = 'EXECUTED';
        break;
      }

      case 'DISPATCH_EMERGENCY': {
        const { vehicleType, location, incidentId } = decision.params;
        const vehicle = this.trafficManager.dispatchEmergency(vehicleType || 'ambulance');
        if (vehicle && location) {
          // Point vehicle destination towards incident
          const inc = this.emergencyAgent.activeIncidents.find((e) => e.id === incidentId);
          if (inc) {
            inc.assignedVehicleId = vehicle.id;
          }
        }
        decision.status = 'EXECUTING';
        break;
      }

      case 'RESOLVE_INCIDENT': {
        const { incidentId } = decision.params;
        this.incidentVisuals.removeIncident(incidentId);
        decision.status = 'EXECUTED';
        break;
      }

      case 'ADJUST_SPEED_LIMIT': {
        const { maxSpeed } = decision.params;
        if (maxSpeed) {
          this.trafficManager.railwayManager.setTrainSpeedLimit(maxSpeed);
        }
        decision.status = 'EXECUTED';
        break;
      }

      case 'SET_CITY_DIRECTIVE': {
        const { directive } = decision.params;
        if (directive === 'RUSH_HOUR_CONGESTION_RELIEF') {
          this.trafficManager.optimizeSignals();
        } else if (directive === 'ECO_GRID_ENERGY_SAVING') {
          this.trafficManager.setDensityLevel('LOW');
        }
        decision.status = 'EXECUTED';
        break;
      }

      default:
        decision.status = 'EXECUTED';
        break;
    }

    this.logDecision(decision);
  }

  private logDecision(decision: AgentDecision) {
    this.decisionsLog.unshift(decision);
    if (this.decisionsLog.length > this.maxDecisionsLog) {
      this.decisionsLog.pop();
    }
  }

  // --- SCENARIO INJECTION METHODS FOR TESTING & USER INTERACTION ---

  public triggerDowntownFire() {
    const event = this.emergencyAgent.reportIncident({
      type: 'FIRE',
      title: 'Level-3 Cyber Structure Fire',
      severity: 'CRITICAL',
      districtId: 'downtown',
      districtName: 'Neon Downtown Sector',
      location: { x: -80, y: 15, z: -40 },
      description: 'Electrical transformer surge on level 18 of Neon Cyber-Tower Alpha.',
    });
    this.incidentVisuals.addIncident(event);
  }

  public triggerAvenueAccident() {
    const event = this.emergencyAgent.reportIncident({
      type: 'ACCIDENT',
      title: 'Autonomous Vehicle Multi-Collison',
      severity: 'HIGH',
      districtId: 'technology',
      districtName: 'Technology District Avenue',
      location: { x: 75, y: 1, z: -55 },
      roadId: 'road_tech_main',
      description: 'Sensor packet collision caused two autonomous speeders to stall in central lane.',
    });
    this.incidentVisuals.addIncident(event);
  }

  public triggerTechDistrictMedical() {
    const event = this.emergencyAgent.reportIncident({
      type: 'MEDICAL_EMERGENCY',
      title: 'Acute Neural Trauma at Mohit Hub Campus',
      severity: 'HIGH',
      districtId: 'technology',
      districtName: 'Mohit Developer Hub Perimeter',
      location: { x: 125, y: 1, z: -78 },
      description: 'Emergency medical assistance requested near the Mohit Developer Hub entrance plaza.',
    });
    this.incidentVisuals.addIncident(event);
  }

  public triggerMohitHubSummit() {
    this.cityManager.setDirective(
      'MOHIT_HUB_INNOVATION_SUMMIT',
      'Global AI & Software Developer Summit hosted at MOHIT DEVELOPER HUB. Directing transit and pedestrian flow to Tech District.'
    );
    this.citizenAgent.moraleIndex = 99;

    const summitNotice: AgentDecision = {
      id: `dec_summit_${Date.now()}`,
      agentType: 'CITY_MANAGER',
      agentName: this.cityManager.name,
      action: 'SET_CITY_DIRECTIVE',
      params: { directive: 'MOHIT_HUB_INNOVATION_SUMMIT', hub: 'MOHIT DEVELOPER HUB' },
      confidence: 1.0,
      reasoning: 'Prioritizing Tech District perimeter roads, syncing high-speed passenger maglevs, and greeting developer delegations.',
      timestamp: new Date().toLocaleTimeString(),
      status: 'EXECUTED',
    };
    this.logDecision(summitNotice);
  }

  public triggerRushHourProtocol() {
    this.cityManager.setDirective('RUSH_HOUR_CONGESTION_RELIEF');
  }

  public triggerStandardOperation() {
    this.cityManager.setDirective('STANDARD_OPERATION');
  }

  public triggerEcoGridMode() {
    this.cityManager.setDirective('ECO_GRID_ENERGY_SAVING');
  }

  public getSnapshot(): AgentManagerSnapshot {
    return {
      activeDirective: this.cityManager.activeDirective,
      agents: [
        this.cityManager.getInfo(),
        this.trafficAgent.getInfo(),
        this.emergencyAgent.getInfo(),
        this.transitAgent.getInfo(),
        this.citizenAgent.getInfo(),
      ],
      recentDecisions: [...this.decisionsLog],
      activeEmergencies: [...this.emergencyAgent.activeIncidents],
      resolvedEmergencies: [...this.emergencyAgent.resolvedIncidents],
      conflictRecords: [...this.cityManager.conflictRecords],
      citizenMorale: Math.round(this.citizenAgent.moraleIndex),
    };
  }

  public dispose() {
    this.incidentVisuals.dispose();
  }
}
