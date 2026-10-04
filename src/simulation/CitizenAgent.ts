/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgentDecision, AgentInfo } from './AgentTypes';
import { CityStateSnapshot } from './CityState';

export class CitizenAgent {
  public id = 'agent-citizen';
  public name = 'Citizen AI Agent';
  public role = 'Pedestrian Dynamics, Public Safety, & Collective Sentiment';
  public decisionCount = 0;
  public lastDecision?: AgentDecision;

  public moraleIndex = 94;
  private reasonTimer = 0;
  private reasonInterval = 4.5;

  public getInfo(): AgentInfo {
    return {
      id: this.id,
      type: 'CITIZEN',
      name: this.name,
      role: this.role,
      status: 'ANALYZING',
      confidence: 0.92,
      lastDecision: this.lastDecision,
      decisionCount: this.decisionCount,
      health: this.moraleIndex > 80 ? 'OPTIMAL' : 'ACTIVE',
      telemetrySummary: `Public Morale Index: ${this.moraleIndex}% across 9 city sectors`,
    };
  }

  public update(delta: number, state: CityStateSnapshot): AgentDecision | null {
    this.reasonTimer += delta;

    // Dynamically adjust morale based on city health
    const { traffic, emergencies } = state;
    if (emergencies.activeCount > 0) {
      this.moraleIndex = Math.max(72, this.moraleIndex - delta * 0.4);
    } else if (traffic.roadCongestion < 15 && this.moraleIndex < 96) {
      this.moraleIndex = Math.min(96, this.moraleIndex + delta * 0.2);
    }

    if (this.reasonTimer < this.reasonInterval) {
      return null;
    }
    this.reasonTimer = 0;

    // Check if an active emergency requires pedestrian evacuation
    const hazard = emergencies.events.find((e) => e.status === 'ACTIVE' || e.status === 'DISPATCHED');
    if (hazard && (!this.lastDecision || this.lastDecision.action !== 'EVACUATE_HAZARD_ZONE' || this.lastDecision.targetId !== hazard.id)) {
      const decision: AgentDecision = {
        id: `dec_cit_${Date.now()}`,
        agentType: 'CITIZEN',
        agentName: this.name,
        action: 'EVACUATE_HAZARD_ZONE',
        targetId: hazard.id,
        params: {
          district: hazard.districtName,
          center: hazard.location,
          radius: 35,
        },
        confidence: 0.96,
        reasoning: `Hazard event (${hazard.title}) active in ${hazard.districtName}. Rerouting pedestrians away from perimeter to smart safety shelters and protected walkways.`,
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
