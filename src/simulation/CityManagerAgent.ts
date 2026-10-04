/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgentDecision, AgentInfo, CityDirective, ConflictRecord } from './AgentTypes';
import { CityStateSnapshot } from './CityState';

export class CityManagerAgent {
  public id = 'agent-city-manager';
  public name = 'City Manager AI Agent';
  public role = 'Supreme Urban Executive, Multi-Agent Arbitration & Strategic Directives';
  public decisionCount = 0;
  public lastDecision?: AgentDecision;

  public activeDirective: CityDirective = 'STANDARD_OPERATION';
  public conflictRecords: ConflictRecord[] = [];

  private reasonTimer = 0;
  private reasonInterval = 3.0;

  public getInfo(): AgentInfo {
    return {
      id: this.id,
      type: 'CITY_MANAGER',
      name: this.name,
      role: this.role,
      status: 'REASONING',
      confidence: 0.99,
      lastDecision: this.lastDecision,
      decisionCount: this.decisionCount,
      health: 'OPTIMAL',
      telemetrySummary: `Active Directive: ${this.activeDirective} | 4 Sub-agents Synced`,
    };
  }

  public setDirective(directive: CityDirective, reason?: string): AgentDecision {
    this.activeDirective = directive;
    const decision: AgentDecision = {
      id: `dec_cm_${Date.now()}`,
      agentType: 'CITY_MANAGER',
      agentName: this.name,
      action: 'SET_CITY_DIRECTIVE',
      params: { directive },
      confidence: 1.0,
      reasoning: reason || `Executive order: Engaged ${directive}. Reconfiguring sub-agent priorities and urban grid parameters.`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'EXECUTED',
    };
    this.decisionCount++;
    this.lastDecision = decision;
    return decision;
  }

  /**
   * Arbitrate conflicts between sub-agents (e.g. Traffic vs Emergency)
   */
  public arbitrateConflict(
    requestingDecision: AgentDecision,
    conflictingDecision: AgentDecision
  ): { approved: AgentDecision; rejected: AgentDecision; conflictRecord: ConflictRecord } {
    let approved = requestingDecision;
    let rejected = conflictingDecision;
    let ruling = '';
    let reason = '';

    // RULE 1: Emergency Agent always takes absolute precedence over Traffic signal optimizations
    if (requestingDecision.agentType === 'EMERGENCY' || requestingDecision.action === 'REQUEST_GREEN_CORRIDOR') {
      approved = requestingDecision;
      rejected = conflictingDecision;
      ruling = 'EMERGENCY_PRIORITY_OVERRIDE';
      reason = 'Emergency life-safety protocols override standard traffic throughput optimization. Green corridor established.';
    } else if (conflictingDecision.agentType === 'EMERGENCY' || conflictingDecision.action === 'REQUEST_GREEN_CORRIDOR') {
      approved = conflictingDecision;
      rejected = requestingDecision;
      ruling = 'EMERGENCY_PRIORITY_OVERRIDE';
      reason = 'Standard action deferred; emergency corridor in active response.';
    } else {
      approved = requestingDecision;
      rejected = conflictingDecision;
      ruling = 'DEFAULT_PRIORITY_ORDER';
      reason = 'Resolution determined by urban priority weighting matrix.';
    }

    approved.status = 'VALIDATED';
    rejected.status = 'OVERRIDDEN';
    rejected.overrideReason = reason;

    const record: ConflictRecord = {
      id: `cnf_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      requestingAgent: requestingDecision.agentType,
      competingAgent: conflictingDecision.agentType,
      resource: requestingDecision.targetId || 'traffic_grid',
      ruling,
      reasoning: reason,
    };

    this.conflictRecords.unshift(record);
    if (this.conflictRecords.length > 20) this.conflictRecords.pop();

    return { approved, rejected, conflictRecord: record };
  }

  public update(delta: number, state: CityStateSnapshot): AgentDecision | null {
    this.reasonTimer += delta;
    if (this.reasonTimer < this.reasonInterval) {
      return null;
    }
    this.reasonTimer = 0;

    const { emergencies, traffic } = state;

    // Automatic Directive Escalation
    if (emergencies.criticalCount > 0 && this.activeDirective !== 'CODE_RED_EMERGENCY_CORRIDOR') {
      return this.setDirective(
        'CODE_RED_EMERGENCY_CORRIDOR',
        `Critical emergencies detected (${emergencies.criticalCount} severe events). City Manager escalated directive to CODE RED.`
      );
    }

    if (emergencies.criticalCount === 0 && this.activeDirective === 'CODE_RED_EMERGENCY_CORRIDOR') {
      return this.setDirective(
        'STANDARD_OPERATION',
        'All critical emergencies neutralized. Restoring STANDARD OPERATION directive across city sectors.'
      );
    }

    // Rush Hour Auto-Engagement
    if (traffic.roadCongestion > 24 && this.activeDirective === 'STANDARD_OPERATION') {
      return this.setDirective(
        'RUSH_HOUR_CONGESTION_RELIEF',
        `Autonomous sensor network detected severe congestion (${traffic.roadCongestion}%). City Manager activated Rush Hour Congestion Protocol.`
      );
    }

    return null;
  }
}
