/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Target,
  CheckCircle2,
  X,
  Play,
  Award,
  AlertCircle,
  Clock,
  Compass,
  Zap,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { CityMission, missionManager } from '../simulation/MissionManager';

interface MissionDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMission: (missionId: string) => void;
  onLocateObjective?: (pos: [number, number, number]) => void;
}

export const MissionDashboardModal: React.FC<MissionDashboardModalProps> = ({
  isOpen,
  onClose,
  onStartMission,
  onLocateObjective,
}) => {
  if (!isOpen) return null;

  const missions = missionManager.missions;
  const activeMission = missionManager.activeMission;

  return (
    <div
      role="dialog"
      aria-label="City Gameplay Operations & Missions Matrix"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md font-['Plus_Jakarta_Sans'] text-slate-100"
    >
      <div className="relative w-full max-w-4xl max-h-[88vh] bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/80 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/50 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-['Chakra_Petch'] text-cyan-300 tracking-wider">
                  MUNICIPAL TACTICAL MISSIONS & SIMULATION SCENARIOS
                </h2>
                <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                  Autonomous Operations
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Coordinate with city AI swarms to mitigate emergencies, inspect transit lines, and explore biomes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close Missions"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="text-slate-400">
              Completed:{' '}
              <strong className="text-emerald-400">{missionManager.completedMissionsCount}</strong>
            </span>
            <span>•</span>
            <span className="text-slate-400">
              Earned Credits:{' '}
              <strong className="text-amber-400">
                {missionManager.totalCreditsEarned.toLocaleString()} CR
              </strong>
            </span>
          </div>

          {activeMission && (
            <div className="flex items-center gap-2 text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Active: {activeMission.title}</span>
            </div>
          )}
        </div>

        {/* Missions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missions.map((m) => {
              const isActive = activeMission?.id === m.id;
              const isCompleted = m.status === 'COMPLETED';

              return (
                <div
                  key={m.id}
                  className={`p-5 rounded-xl border flex flex-col justify-between transition ${
                    isActive
                      ? 'bg-gradient-to-r from-slate-900 to-cyan-950/40 border-cyan-400/80 shadow-lg shadow-cyan-950/40'
                      : isCompleted
                      ? 'bg-slate-900/40 border-emerald-500/30'
                      : 'bg-slate-900/70 border-slate-800/80 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                          {m.type.replace(/_/g, ' ')}
                        </span>
                        <span>•</span>
                        <span className="text-[10px] font-mono text-slate-400 capitalize">
                          {m.districtId} sector
                        </span>
                      </div>

                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Done
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-amber-300 font-bold">
                          +{m.rewardCredits} CR
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white font-['Chakra_Petch']">
                      {m.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {m.description}
                    </p>

                    {/* Objectives Checklist */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        Objectives:
                      </span>
                      {m.objectives.map((obj, idx) => (
                        <div key={obj.id} className="flex items-center gap-2 text-xs font-mono">
                          {obj.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[9px] text-slate-400 shrink-0">
                              {idx + 1}
                            </span>
                          )}
                          <span className={obj.completed ? 'text-slate-400 line-through' : 'text-slate-200'}>
                            {obj.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> +{m.aiTrustBonus}% AI Trust
                    </span>

                    {isActive ? (
                      <button
                        onClick={() => {
                          const currentObj = m.objectives[m.currentObjectiveIndex];
                          if (currentObj?.targetPosition && onLocateObjective) {
                            onLocateObjective(currentObj.targetPosition);
                            onClose();
                          }
                        }}
                        className="py-1.5 px-3.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 text-xs font-mono font-bold hover:bg-cyan-500/30 transition flex items-center gap-1.5"
                      >
                        <Compass className="w-3.5 h-3.5" /> Focus Objective
                      </button>
                    ) : isCompleted ? (
                      <span className="text-xs font-mono text-slate-500">Completed</span>
                    ) : (
                      <button
                        onClick={() => {
                          onStartMission(m.id);
                          onClose();
                        }}
                        className="py-1.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-['Chakra_Petch'] font-bold tracking-wider transition flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> ACCEPT MISSION
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
