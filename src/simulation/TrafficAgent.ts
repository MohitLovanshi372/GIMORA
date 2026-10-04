/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgentDecision, AgentInfo } from './AgentTypes';
import { CityStateSnapshot } from './CityState';

export class TrafficAgent {
  public id = 'agent-traffic';
  public name = 'Traffic AI Agent';
  public role = 'Urban Traffic Grid Control & Signal Optimization';
  public decisionCount = 0;
  public lastDecision?: AgentDecision;

  private reasonTimer = 0;
  private reasonInterval = 3.5; // Evaluate grid conditions every 3.5s

  public getInfo(): AgentInfo {
    return {
      id: this.id,
      type: 'TRAFFIC',
      name: this.name,
      role: this.role,
      status: 'ANALYZING',
      confidence: 0.94,
      lastDecision: this.lastDecision,
      decisionCount: this.decisionCount,
      health: 'OPTIMAL',
      telemetrySummary: 'Monitoring 12 grid intersections & arterial flow',
    };
  }

  public update(delta: number, state: CityStateSnapshot): AgentDecision | null {
    this.reasonTimer += delta;
    if (this.reasonTimer < this.reasonInterval) {
      return null;
    }
    this.reasonTimer = 0;

    const { traffic, emergencies } = state;

    // 1. Priority: Check if there's an active emergency without a green corridor
    const activeCritical = emergencies.events.find(
      (e) => (e.status === 'ACTIVE' || e.status === 'DISPATCHED') && (e.severity === 'CRITICAL' || e.severity === 'HIGH')
    );

    if (activeCritical && (!this.lastDecision || this.lastDecision.action !== 'REQUEST_GREEN_CORRIDOR' || this.lastDecision.targetId !== activeCritical.id)) {
      const decision: AgentDecision = {
        id: `dec_tr_${Date.now()}`,
        agentType: 'TRAFFIC',
        agentName: this.name,
        action: 'REQUEST_GREEN_CORRIDOR',
        targetId: activeCritical.id,
        params: {
          emergencyId: activeCritical.id,
          location: activeCritical.location,
          axis: Math.abs(activeCritical.location.x) > Math.abs(activeCritical.location.z) ? 'EW' : 'NS',
          duration: 18.0,
        },
        confidence: 0.98,
        reasoning: `High-priority incident detected in ${activeCritical.districtName}. Preempting cross-traffic to establish zero-latency green wave along transit corridor.`,
        timestamp: new Date().toLocaleTimeString(),
        status: 'PROPOSED',
      };
      this.decisionCount++;
      this.lastDecision = decision;
      return decision;
    }

    // 2. High Congestion Check (> 20% congestion or low avg speed < 32 km/h)
    if (traffic.roadCongestion > 22 || traffic.averageSpeed < 35) {
      const decision: AgentDecision = {
        id: `dec_tr_${Date.now()}`,
        agentType: 'TRAFFIC',
        agentName: this.name,
        action: 'ADJUST_SIGNAL',
        targetId: 'all_intersections',
        params: {
          greenDuration: 14.0,
          cycleExtension: 4.0,
          arterialWave: true,
        },
        confidence: 0.91,
        reasoning: `Grid congestion measured at ${traffic.roadCongestion}% with average speed ${traffic.averageSpeed} km/h. Extending arterial green window by +4.0s to flush bottleneck queues.`,
        timestamp: new Date().toLocaleTimeString(),
        status: 'PROPOSED',
      };
      this.decisionCount++;
      this.lastDecision = decision;
      return decision;
    }

    // 3. Low congestion optimization (Flow is high > 50km/h)
    if (traffic.averageSpeed > 52 && traffic.roadCongestion < 12) {
      if (!this.lastDecision || this.lastDecision.action !== 'ADJUST_SIGNAL' || this.lastDecision.params.greenDuration !== 8.0) {
        const decision: AgentDecision = {
          id: `dec_tr_${Date.now()}`,
          agentType: 'TRAFFIC',
          agentName: this.name,
          action: 'ADJUST_SIGNAL',
          targetId: 'all_intersections',
          params: {
            greenDuration: 8.0,
            cycleExtension: 0,
            arterialWave: false,
          },
          confidence: 0.89,
          reasoning: `Traffic flowing smoothly at ${traffic.averageSpeed} km/h with minimal congestion (${traffic.roadCongestion}%). Resetting signal timing to standard 8.0s balanced cycle.`,
          timestamp: new Date().toLocaleTimeString(),
          status: 'PROPOSED',
        };
        this.decisionCount++;
        this.lastDecision = decision;
        return decision;
      }
    }

    return null;
  }
}
