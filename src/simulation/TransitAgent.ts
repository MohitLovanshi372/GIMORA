/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgentDecision, AgentInfo } from './AgentTypes';
import { CityStateSnapshot } from './CityState';

export class TransitAgent {
  public id = 'agent-transit';
  public name = 'Transit AI Agent';
  public role = 'Hyper-Rail & Maglev Scheduling, Platform Flow & Transit Balancing';
  public decisionCount = 0;
  public lastDecision?: AgentDecision;

  private reasonTimer = 0;
  private reasonInterval = 4.0;

  public getInfo(): AgentInfo {
    return {
      id: this.id,
      type: 'TRANSIT',
      name: this.name,
      role: this.role,
      status: 'ANALYZING',
      confidence: 0.95,
      lastDecision: this.lastDecision,
      decisionCount: this.decisionCount,
      health: 'OPTIMAL',
      telemetrySummary: 'Synchronizing 3 maglev lines & Central Hyper-Terminal',
    };
  }

  public update(delta: number, state: CityStateSnapshot): AgentDecision | null {
    this.reasonTimer += delta;
    if (this.reasonTimer < this.reasonInterval) {
      return null;
    }
    this.reasonTimer = 0;

    const { transit } = state;

    // Check station crowd level
    const crowdedStation = transit.stations.find((s) => s.crowdLevel === 'HIGH' || s.crowdLevel === 'OVERCROWDED');
    if (crowdedStation && (!this.lastDecision || this.lastDecision.action !== 'STATION_DWELL_TIME')) {
      const decision: AgentDecision = {
        id: `dec_tr_${Date.now()}`,
        agentType: 'TRANSIT',
        agentName: this.name,
        action: 'STATION_DWELL_TIME',
        targetId: crowdedStation.id,
        params: {
          dwellTime: 4.5,
          rapidBoardingMode: true,
        },
        confidence: 0.93,
        reasoning: `High platform passenger volume detected at ${crowdedStation.name}. Extended boarding dwell time by +1.5s to ensure safe, barrier-free maglev boarding.`,
        timestamp: new Date().toLocaleTimeString(),
        status: 'PROPOSED',
      };
      this.decisionCount++;
      this.lastDecision = decision;
      return decision;
    }

    // Default regular optimization
    if (!this.lastDecision) {
      const decision: AgentDecision = {
        id: `dec_tr_${Date.now()}`,
        agentType: 'TRANSIT',
        agentName: this.name,
        action: 'ADJUST_SPEED_LIMIT',
        targetId: 'maglev_fleet',
        params: { maxSpeed: 42 },
        confidence: 0.97,
        reasoning: 'Autonomous maglev track telemetry nominal. Maintaining high-speed express schedule at 150 km/h across all 4 dedicated transit corridors.',
        timestamp: new Date().toLocaleTimeString(),
        status: 'PROPOSED',
      };
      this.decisionCount++;
      this.lastDecision = decision;
      return decision;
    }

    return null;
  }
}
