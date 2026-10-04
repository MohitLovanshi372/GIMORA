/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bot,
  Car,
  Siren,
  Train,
  Users,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { AgentManagerSnapshot } from '../simulation/AgentManager';
import { AgentType } from '../simulation/AgentTypes';

interface AIInteractionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: AgentManagerSnapshot;
  onApplyOverride?: (agentType: AgentType, action: string) => void;
}

export const AIInteractionPanel: React.FC<AIInteractionPanelProps> = ({
  isOpen,
  onClose,
  snapshot,
  onApplyOverride,
}) => {
  const [selectedAgentType, setSelectedAgentType] = useState<AgentType>('TRAFFIC');

  if (!isOpen) return null;

  const agentTabs: { type: AgentType; name: string; icon: React.ReactNode; color: string }[] = [
    { type: 'CITY_MANAGER', name: 'City Manager', icon: <Bot className="w-4 h-4" />, color: 'cyan' },
    { type: 'TRAFFIC', name: 'Traffic Agent', icon: <Car className="w-4 h-4" />, color: 'amber' },
    { type: 'EMERGENCY', name: 'Emergency Agent', icon: <Siren className="w-4 h-4" />, color: 'red' },
    { type: 'TRANSIT', name: 'Transit Agent', icon: <Train className="w-4 h-4" />, color: 'blue' },
    { type: 'CITIZEN', name: 'Citizen Agent', icon: <Users className="w-4 h-4" />, color: 'emerald' },
  ];

  // Specific data-driven scenarios for each agent
  const agentScenarios: Record<
    AgentType,
    {
      situation: string;
      decision: string;
      reason: string;
      affectedArea: string;
      action: string;
      result: string;
      metricImpact: string;
    }
  > = {
    TRAFFIC: {
      situation: 'Avenue 4 congestion level elevated (78% road occupancy detected).',
      decision: 'Extend North-South Green Corridor & throttle secondary feeder ramps.',
      reason: 'Prevent cascading gridlock across River Bridge 2 and maintain transit flow.',
      affectedArea: 'Downtown East Core & Avenue 4 Intersection',
      action: 'Set signal override duration = +25s, synchronizing green wave sequence.',
      result: 'Average traffic flow speed increased by +18.4% within 90 seconds.',
      metricImpact: '+18.4% Flow Speed',
    },
    EMERGENCY: {
      situation: 'Structural emergency incident beacon detected in Technology District.',
      decision: 'Dispatch Cyber-Ambulance Squad 3 with priority signal preemption.',
      reason: 'Minimize emergency arrival latency to under 90 seconds.',
      affectedArea: 'Tech District Avenue 1 & Mohit Developer Hub Plaza',
      action: 'Broadcast Code Red corridor directive; lock opposing signals to RED.',
      result: 'First responder transit time reduced by 42%; zero pedestrian conflicts.',
      metricImpact: '-42% Transit Latency',
    },
    TRANSIT: {
      situation: 'Central Concourse platform crowd density peaking at 89%.',
      decision: 'Increase Maglev Express frequency and shorten station dwell time.',
      reason: 'Clear commuter backlog ahead of peak evening district shift change.',
      affectedArea: 'Central Maglev Terminal Platforms 1 & 2',
      action: 'Inject auxiliary Express Train 4 into active revenue loop.',
      result: 'Platform crowd dispersed by 65%; on-time departure rate held at 99.4%.',
      metricImpact: '99.4% On-Time Transit',
    },
    CITY_MANAGER: {
      situation: 'Urban energy demand elevated during simultaneous storm and peak work hours.',
      decision: 'Engage Smart Energy Geothermal + Fusion auxiliary bypass channels.',
      reason: 'Balance electrical grid stability without imposing brownouts.',
      affectedArea: 'Metropolitan Grid Sectors Alpha through Delta',
      action: 'Reallocate 85 MW surplus from storage capacitors to district substations.',
      result: '100% uninterrupted power uptime; zero hospital or transit outages.',
      metricImpact: '100% Grid Stability',
    },
    CITIZEN: {
      situation: 'Public transit fare reduction requested following heavy rain advisory.',
      decision: 'Activate Free Municipal Maglev Pass during severe weather protocol.',
      reason: 'Encourage safe underground and rail transit over slippery roadway driving.',
      affectedArea: 'All 10 Metropolitan Biomes',
      action: 'Issue digital contactless boarding tokens to 4.8M registered citizens.',
      result: 'Citizen Morale Index boosted to 96%; road traffic reduced by 22%.',
      metricImpact: '+96% Citizen Morale',
    },
  };

  const currentScenario = agentScenarios[selectedAgentType];

  return (
    <div
      role="dialog"
      aria-label="Autonomous AI Agent Interactive Reasoning Panel"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md font-['Plus_Jakarta_Sans'] text-slate-100"
    >
      <div className="relative w-full max-w-3xl bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/80 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/50 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-['Chakra_Petch'] text-cyan-300 tracking-wider">
                  AI AGENT SWARM — COGNITIVE DECISION INTERPRETER
                </h2>
                <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                  Live Swarm Reasoner
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Inspect situational telemetry, policy decisions, causal reasoning, and real-time execution results
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Agent Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-900/70 border-b border-slate-800 overflow-x-auto text-xs font-mono">
          {agentTabs.map((t) => (
            <button
              key={t.type}
              onClick={() => setSelectedAgentType(t.type)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                selectedAgentType === t.type
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.icon}
              <span>{t.name}</span>
            </button>
          ))}
        </div>

        {/* Decision Breakdown Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Situation */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                Current Situation
              </span>
              <span className="text-[11px] font-mono text-slate-400">Telemetry Verified</span>
            </div>
            <p className="text-sm font-semibold text-white">
              {currentScenario.situation}
            </p>
          </div>

          {/* Decision & Reason */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/30 space-y-1.5">
              <span className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider font-semibold">
                Current Decision
              </span>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                {currentScenario.decision}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-purple-500/30 space-y-1.5">
              <span className="text-[11px] font-mono text-purple-300 uppercase tracking-wider font-semibold">
                Underlying Reason
              </span>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                {currentScenario.reason}
              </p>
            </div>
          </div>

          {/* Affected Area & Action */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Affected Area
              </span>
              <p className="text-xs text-slate-300">
                {currentScenario.affectedArea}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Autonomous Action
              </span>
              <p className="text-xs text-slate-300">
                {currentScenario.action}
              </p>
            </div>
          </div>

          {/* Result & Verified Impact */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900 border border-emerald-500/40 flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold block mb-0.5">
                Observed Result
              </span>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                {currentScenario.result}
              </p>
            </div>

            <div className="px-3.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold shrink-0">
              {currentScenario.metricImpact}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Autonomous loop latency: 12ms • Policy Confidence 98.6%</span>
          <button
            onClick={() => {
              if (onApplyOverride) {
                onApplyOverride(selectedAgentType, currentScenario.decision);
              }
              onClose();
            }}
            className="py-1.5 px-4 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 font-bold transition flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> RE-VALIDATE POLICY
          </button>
        </div>
      </div>
    </div>
  );
};
