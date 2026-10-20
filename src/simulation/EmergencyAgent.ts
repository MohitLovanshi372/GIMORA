/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgentDecision, AgentInfo } from './AgentTypes';
import { CityEvent, CityStateSnapshot } from './CityState';

export class EmergencyAgent {
  public id = 'agent-emergency';
  public name = 'Emergency AI Agent';
  public role = '911 Emergency Response, Unit Dispatch & Crisis Mitigation';
  public decisionCount = 0;
  public lastDecision?: AgentDecision;

  public activeIncidents: CityEvent[] = [];
  public resolvedIncidents: CityEvent[] = [];

  private scanTimer = 0;
  private scanInterval = 2.0;

  // Auto-incident simulation timer
  private autoIncidentTimer = 0;

  constructor() {}

  public getInfo(): AgentInfo {
    return {
      id: this.id,
      type: 'EMERGENCY',
      name: this.name,
      role: this.role,
      status: this.activeIncidents.length > 0 ? 'DISPATCHING' : 'STANDBY',
      confidence: 0.97,
      lastDecision: this.lastDecision,
      decisionCount: this.decisionCount,
      health: 'OPTIMAL',
      telemetrySummary: `${this.activeIncidents.length} active emergency incidents, ${this.resolvedIncidents.length} mitigated`,
    };
  }

  public reportIncident(event: Omit<CityEvent, 'id' | 'timestamp' | 'status' | 'timeline'>): CityEvent {
    const fullEvent: CityEvent = {
      ...event,
      id: `inc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'ACTIVE',
      timeline: [
        {
          time: new Date().toLocaleTimeString(),
          stage: 'DETECTED',
          note: `Incident detected by AI urban sensors in ${event.districtName}`,
        },
      ],
    };

    this.activeIncidents.unshift(fullEvent);
    return fullEvent;
  }

  public resolveIncident(incidentId: string): CityEvent | null {
    const idx = this.activeIncidents.findIndex((e) => e.id === incidentId);
    if (idx === -1) return null;
    const inc = this.activeIncidents[idx];
    inc.status = 'RESOLVED';
    inc.timeline.push({
      time: new Date().toLocaleTimeString(),
      stage: 'RESOLVED',
      note: 'Incident cleared by municipal emergency response command.',
    });
    this.resolvedIncidents.unshift(inc);
    if (this.resolvedIncidents.length > 20) this.resolvedIncidents.pop();
    this.activeIncidents.splice(idx, 1);
    return inc;
  }

  public update(delta: number, _state: CityStateSnapshot): AgentDecision | null {
    this.scanTimer += delta;
    this.autoIncidentTimer += delta;

    // Simulate multi-stage resolution of incidents over time once dispatched
    for (let i = this.activeIncidents.length - 1; i >= 0; i--) {
      const inc = this.activeIncidents[i];
      if (inc.status === 'DISPATCHED' || inc.status === 'RESOLVING') {
        const age = (Date.now() - parseInt(inc.id.split('_')[1] || '0')) / 1000;
        if (age > 20 && inc.status === 'DISPATCHED') {
          inc.status = 'RESOLVING';
          inc.timeline.push({
            time: new Date().toLocaleTimeString(),
            stage: 'ON_SCENE',
            note: 'Emergency response unit arrived on scene. Mitigating hazard.',
          });
        } else if (age > 55) {
          inc.status = 'RESOLVED';
          inc.timeline.push({
            time: new Date().toLocaleTimeString(),
            stage: 'RESOLVED',
            note: 'Hazard neutralized. Site secured and returned to normal traffic flow.',
          });
          this.resolvedIncidents.unshift(inc);
          if (this.resolvedIncidents.length > 20) this.resolvedIncidents.pop();
          this.activeIncidents.splice(i, 1);

          const decision: AgentDecision = {
            id: `dec_em_${Date.now()}`,
            agentType: 'EMERGENCY',
            agentName: this.name,
            action: 'RESOLVE_INCIDENT',
            targetId: inc.id,
            params: { incidentId: inc.id, type: inc.type },
            confidence: 0.99,
            reasoning: `Emergency units successfully contained ${inc.title} in ${inc.districtName}. Decommissioning hazard zone.`,
            timestamp: new Date().toLocaleTimeString(),
            status: 'EXECUTED',
          };
          this.decisionCount++;
          this.lastDecision = decision;
          return decision;
        }
      }
    }

    if (this.scanTimer < this.scanInterval) {
      return null;
    }
    this.scanTimer = 0;

    // Look for ACTIVE incidents that need dispatch
    const pending = this.activeIncidents.find((e) => e.status === 'ACTIVE');
    if (pending) {
      let vehicleType: 'ambulance' | 'police' | 'fire-truck' = 'police';
      if (pending.type === 'FIRE') vehicleType = 'fire-truck';
      else if (pending.type === 'MEDICAL_EMERGENCY' || pending.type === 'ACCIDENT') vehicleType = 'ambulance';

      pending.status = 'DISPATCHED';
      pending.assignedAgent = this.name;
      pending.timeline.push({
        time: new Date().toLocaleTimeString(),
        stage: 'DISPATCHED',
        note: `Dispatched high-speed autonomous ${vehicleType} with audio-visual sirens and green-corridor priority.`,
      });

      const decision: AgentDecision = {
        id: `dec_em_${Date.now()}`,
        agentType: 'EMERGENCY',
        agentName: this.name,
        action: 'DISPATCH_EMERGENCY',
        targetId: pending.id,
        params: {
          incidentId: pending.id,
          vehicleType,
          location: pending.location,
          severity: pending.severity,
          district: pending.districtName,
        },
        confidence: 0.96,
        reasoning: `Identified ${pending.severity} priority ${pending.type} at ${pending.districtName}. Dispatched rapid response ${vehicleType} and requesting cross-district green corridor.`,
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
