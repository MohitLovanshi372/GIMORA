/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AgentType =
  | 'CITY_MANAGER'
  | 'TRAFFIC'
  | 'EMERGENCY'
  | 'TRANSIT'
  | 'CITIZEN';

export type AgentStatus =
  | 'IDLE'
  | 'ANALYZING'
  | 'REASONING'
  | 'DISPATCHING'
  | 'OVERRIDING'
  | 'STANDBY';

export type CityDirective =
  | 'STANDARD_OPERATION'
  | 'RUSH_HOUR_CONGESTION_RELIEF'
  | 'CODE_RED_EMERGENCY_CORRIDOR'
  | 'SEVERE_WEATHER_PROTOCOL'
  | 'MOHIT_HUB_INNOVATION_SUMMIT'
  | 'ECO_GRID_ENERGY_SAVING';

export interface AgentDecision {
  id: string;
  agentType: AgentType;
  agentName: string;
  action:
    | 'ADJUST_SIGNAL'
    | 'REROUTE_TRAFFIC'
    | 'SET_SPAWN_RATE'
    | 'CLEAR_ROAD'
    | 'REQUEST_GREEN_CORRIDOR'
    | 'DISPATCH_EMERGENCY'
    | 'RESOLVE_INCIDENT'
    | 'ADJUST_SPEED_LIMIT'
    | 'STATION_DWELL_TIME'
    | 'DISPATCH_EXTRA_TRAIN'
    | 'EVACUATE_HAZARD_ZONE'
    | 'CONGREGATE_AT_MOHIT_HUB'
    | 'SET_CITY_DIRECTIVE'
    | 'RESOLVE_CONFLICT'
    | 'ALLOCATE_GRID_POWER';
  targetId?: string;
  params: Record<string, any>;
  confidence: number; // 0.0 to 1.0
  reasoning: string;
  timestamp: string;
  status: 'PROPOSED' | 'VALIDATED' | 'EXECUTING' | 'EXECUTED' | 'REJECTED' | 'OVERRIDDEN';
  overrideReason?: string;
}

export interface AgentInfo {
  id: string;
  type: AgentType;
  name: string;
  role: string;
  status: AgentStatus;
  confidence: number;
  lastDecision?: AgentDecision;
  decisionCount: number;
  health: 'OPTIMAL' | 'ACTIVE' | 'ATTENTION';
  telemetrySummary: string;
}

export interface ConflictRecord {
  id: string;
  timestamp: string;
  requestingAgent: AgentType;
  competingAgent: AgentType;
  resource: string;
  ruling: string;
  reasoning: string;
}
