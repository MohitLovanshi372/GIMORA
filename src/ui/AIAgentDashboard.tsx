/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bot,
  ShieldAlert,
  Flame,
  Radio,
  Sliders,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertCircle,
  Siren,
  Building,
  GitBranch,
} from 'lucide-react';
import { AgentManagerSnapshot } from '../simulation/AgentManager';
import { CityDirective } from '../simulation/AgentTypes';
import { CityEvent } from '../simulation/CityState';

interface AIAgentDashboardProps {
  snapshot: AgentManagerSnapshot;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  onSelectDirective: (directive: CityDirective) => void;
  onTriggerFire: () => void;
  onTriggerAccident: () => void;
  onTriggerMedical: () => void;
  onTriggerSummit: () => void;
  onLocateIncident: (incident: CityEvent) => void;
}

export const AIAgentDashboard: React.FC<AIAgentDashboardProps> = ({
  snapshot,
  isOpen: controlledIsOpen,
  onToggleOpen,
  onSelectDirective,
  onTriggerFire,
  onTriggerAccident,
  onTriggerMedical,
  onTriggerSummit,
  onLocateIncident,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const toggleOpen = onToggleOpen || (() => setInternalIsOpen(!internalIsOpen));
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'decisions' | 'emergencies' | 'scenarios'>('hierarchy');

  const { activeDirective, agents, recentDecisions, activeEmergencies, resolvedEmergencies, conflictRecords, citizenMorale } = snapshot;

  const directiveBadgeColors: Record<CityDirective, string> = {
    STANDARD_OPERATION: 'border-cyan-500/40 bg-cyan-950/60 text-cyan-300',
    RUSH_HOUR_CONGESTION_RELIEF: 'border-amber-500/40 bg-amber-950/60 text-amber-300',
    CODE_RED_EMERGENCY_CORRIDOR: 'border-red-500/50 bg-red-950/70 text-red-300 animate-pulse',
    SEVERE_WEATHER_PROTOCOL: 'border-blue-500/40 bg-blue-950/60 text-blue-300',
    MOHIT_HUB_INNOVATION_SUMMIT: 'border-emerald-500/50 bg-emerald-950/60 text-emerald-300',
    ECO_GRID_ENERGY_SAVING: 'border-purple-500/40 bg-purple-950/60 text-purple-300',
  };

  return (
    <aside
      aria-label="AI Autonomous Agent Management Matrix"
      className="fixed left-4 bottom-24 z-20 w-[420px] max-w-[calc(100vw-32px)] transition-all duration-300 pointer-events-auto"
    >
      <div className="bg-slate-950/90 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-950/50 overflow-hidden text-slate-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/40 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
              <Bot className="w-4 h-4 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-wider font-['Chakra_Petch'] text-cyan-300">
                  AI AGENT MATRIX
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-mono">
                  v3.5
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <span>Autonomous Hierarchy</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">{citizenMorale}% Morale</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeEmergencies.length > 0 && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                <Siren className="w-3 h-3" />
                {activeEmergencies.length} ALERT
              </span>
            )}
            <button
              onClick={toggleOpen}
              className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
              title={isOpen ? 'Collapse Agent Matrix' : 'Expand Agent Matrix'}
            >
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        {isOpen && (
          <div className="p-3 space-y-3">
            {/* Active Directive Chip */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <Radio className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-[11px] text-slate-400 font-mono shrink-0">DIRECTIVE:</span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border truncate ${directiveBadgeColors[activeDirective]}`}
                >
                  {activeDirective.replace(/_/g, ' ')}
                </span>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono shrink-0">5 AGENTS</span>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => setActiveTab('hierarchy')}
                className={`py-1 rounded font-medium transition ${
                  activeTab === 'hierarchy'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hierarchy
              </button>
              <button
                onClick={() => setActiveTab('decisions')}
                className={`py-1 rounded font-medium transition ${
                  activeTab === 'decisions'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Reasoning ({recentDecisions.length})
              </button>
              <button
                onClick={() => setActiveTab('emergencies')}
                className={`py-1 rounded font-medium transition ${
                  activeTab === 'emergencies'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Alerts ({activeEmergencies.length})
              </button>
              <button
                onClick={() => setActiveTab('scenarios')}
                className={`py-1 rounded font-medium transition ${
                  activeTab === 'scenarios'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Scenarios
              </button>
            </div>

            {/* TAB 1: AGENT HIERARCHY */}
            {activeTab === 'hierarchy' && (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {/* Visual Tree */}
                <div className="space-y-1.5">
                  {agents.map((agent) => {
                    const isManager = agent.type === 'CITY_MANAGER';
                    return (
                      <div
                        key={agent.id}
                        className={`p-2.5 rounded-lg border transition ${
                          isManager
                            ? 'bg-cyan-950/30 border-cyan-500/40 shadow-sm shadow-cyan-900/20'
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                agent.status === 'DISPATCHING'
                                  ? 'bg-red-400 animate-ping'
                                  : agent.status === 'REASONING'
                                  ? 'bg-amber-400 animate-pulse'
                                  : 'bg-emerald-400'
                              }`}
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-slate-100 font-['Chakra_Petch']">
                                  {agent.name}
                                </span>
                                {isManager && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/30 text-cyan-300 font-mono">
                                    EXECUTIVE
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400">{agent.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                              {Math.round(agent.confidence * 100)}% Conf
                            </span>
                            <div className="text-[9px] text-slate-500 font-mono">
                              {agent.decisionCount} orders
                            </div>
                          </div>
                        </div>

                        {agent.lastDecision && (
                          <div className="mt-1.5 p-1.5 rounded bg-slate-950/60 border border-slate-800 text-[10px] font-mono text-slate-300">
                            <div className="flex items-center justify-between text-slate-400 mb-0.5">
                              <span className="text-cyan-400 font-semibold">{agent.lastDecision.action}</span>
                              <span>{agent.lastDecision.timestamp}</span>
                            </div>
                            <p className="text-slate-300 text-[10px] line-clamp-2 leading-relaxed">
                              {agent.lastDecision.reasoning}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Conflict Resolution Count */}
                {conflictRecords.length > 0 && (
                  <div className="p-2 rounded bg-amber-950/30 border border-amber-500/30 text-[10px] flex items-center justify-between text-amber-300">
                    <span className="flex items-center gap-1">
                      <GitBranch className="w-3.5 h-3.5" />
                      Multi-Agent Conflicts Arbitrated:
                    </span>
                    <span className="font-mono font-bold">{conflictRecords.length} resolved</span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: LIVE REASONING LOG */}
            {activeTab === 'decisions' && (
              <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                {recentDecisions.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 font-mono">
                    Awaiting next reasoning cycle...
                  </div>
                ) : (
                  recentDecisions.map((dec) => (
                    <div
                      key={dec.id}
                      className={`p-2 rounded border text-[10px] ${
                        dec.status === 'OVERRIDDEN'
                          ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                          : dec.agentType === 'EMERGENCY'
                          ? 'bg-red-950/20 border-red-500/30 text-red-100'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 font-mono text-[9px]">
                        <span className="font-semibold text-cyan-400">{dec.agentName}</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1 rounded ${
                              dec.status === 'OVERRIDDEN'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {dec.status}
                          </span>
                          <span className="text-slate-500">{dec.timestamp}</span>
                        </div>
                      </div>
                      <div className="font-semibold text-slate-200 mb-0.5">{dec.action}</div>
                      <p className="text-slate-300 leading-normal">{dec.reasoning}</p>
                      {dec.overrideReason && (
                        <div className="mt-1 text-[9px] text-amber-400 italic">
                          Arbitration Ruling: {dec.overrideReason}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: EMERGENCIES & ALERTS */}
            {activeTab === 'emergencies' && (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {activeEmergencies.length === 0 ? (
                  <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 text-center space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-200">No Active Emergencies</p>
                    <p className="text-[10px] text-slate-400">
                      Urban telemetry across all 9 districts reports nominal safe status.
                    </p>
                  </div>
                ) : (
                  activeEmergencies.map((inc) => (
                    <div
                      key={inc.id}
                      className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/40 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-red-500/30 text-red-300 border border-red-500/50">
                              {inc.severity}
                            </span>
                            <span className="text-xs font-bold text-slate-100 font-['Chakra_Petch']">
                              {inc.title}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            {inc.districtName} • Detected: {inc.timestamp}
                          </p>
                        </div>
                        <button
                          onClick={() => onLocateIncident(inc)}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] hover:bg-cyan-500/30 transition shrink-0"
                          title="Fly Camera to Incident"
                        >
                          <Eye className="w-3 h-3" />
                          Locate
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-300">{inc.description}</p>

                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-red-500/20">
                        <span className="text-amber-400 font-semibold">Status: {inc.status}</span>
                        {inc.assignedAgent && <span>Dispatcher: {inc.assignedAgent}</span>}
                      </div>
                    </div>
                  ))
                )}

                {resolvedEmergencies.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono">Recently Mitigated Hazards:</span>
                    {resolvedEmergencies.slice(0, 3).map((res) => (
                      <div
                        key={res.id}
                        className="p-1.5 rounded bg-slate-900/40 border border-slate-800 text-[10px] flex items-center justify-between text-slate-400"
                      >
                        <span className="truncate max-w-[240px] text-slate-300">{res.title}</span>
                        <span className="text-emerald-400 font-mono text-[9px]">Resolved</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SCENARIOS & DIRECTIVES */}
            {activeTab === 'scenarios' && (
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {/* Scenario Injections */}
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1.5">
                    Inject Simulation Events:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={onTriggerFire}
                      className="p-2 rounded-lg bg-red-950/40 border border-red-500/40 hover:bg-red-900/50 text-left transition space-y-0.5 group"
                    >
                      <div className="flex items-center gap-1.5 text-red-300 text-[11px] font-bold">
                        <Flame className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition" />
                        <span>Tower Fire</span>
                      </div>
                      <p className="text-[9px] text-slate-400">Downtown level-3 blaze</p>
                    </button>

                    <button
                      onClick={onTriggerAccident}
                      className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/50 text-left transition space-y-0.5 group"
                    >
                      <div className="flex items-center gap-1.5 text-amber-300 text-[11px] font-bold">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition" />
                        <span>Multi-Collision</span>
                      </div>
                      <p className="text-[9px] text-slate-400">Tech Avenue gridlock</p>
                    </button>

                    <button
                      onClick={onTriggerMedical}
                      className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/40 hover:bg-cyan-900/50 text-left transition space-y-0.5 group"
                    >
                      <div className="flex items-center gap-1.5 text-cyan-300 text-[11px] font-bold">
                        <Siren className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition" />
                        <span>Medical Crisis</span>
                      </div>
                      <p className="text-[9px] text-slate-400">Mohit Hub perimeter</p>
                    </button>

                    <button
                      onClick={onTriggerSummit}
                      className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/50 text-left transition space-y-0.5 group"
                    >
                      <div className="flex items-center gap-1.5 text-emerald-300 text-[11px] font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition" />
                        <span>Mohit Hub Summit</span>
                      </div>
                      <p className="text-[9px] text-slate-400">AI developer expo flow</p>
                    </button>
                  </div>
                </div>

                {/* Directives Switcher */}
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1.5">
                    City Manager Directives:
                  </span>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    {(
                      [
                        { id: 'STANDARD_OPERATION', label: 'Standard Operation' },
                        { id: 'RUSH_HOUR_CONGESTION_RELIEF', label: 'Rush Hour Relief' },
                        { id: 'CODE_RED_EMERGENCY_CORRIDOR', label: 'Code Red Corridor' },
                        { id: 'ECO_GRID_ENERGY_SAVING', label: 'Eco-Grid Saving' },
                      ] as const
                    ).map((d) => (
                      <button
                        key={d.id}
                        onClick={() => onSelectDirective(d.id)}
                        className={`p-1.5 rounded border text-left font-mono transition truncate ${
                          activeDirective === d.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold'
                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
