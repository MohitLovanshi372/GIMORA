/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Target, CheckCircle2, ChevronRight, X, Award, Navigation } from 'lucide-react';
import { CityMission } from '../simulation/MissionManager';

interface ActiveMissionHUDProps {
  mission: CityMission | null;
  onAdvanceObjective: () => void;
  onAbandonMission: () => void;
  onLocateObjective?: (pos: [number, number, number]) => void;
}

export const ActiveMissionHUD: React.FC<ActiveMissionHUDProps> = ({
  mission,
  onAdvanceObjective,
  onAbandonMission,
  onLocateObjective,
}) => {
  if (!mission) return null;

  const currentObj = mission.objectives[mission.currentObjectiveIndex];
  const progressPercent = Math.round(
    (mission.currentObjectiveIndex / mission.objectives.length) * 100
  );

  return (
    <div className="fixed top-24 left-6 z-20 w-80 sm:w-96 pointer-events-auto font-['Plus_Jakarta_Sans'] animate-fadeIn">
      <div className="bg-slate-950/90 border border-cyan-500/40 rounded-xl shadow-2xl shadow-cyan-950/60 p-4 backdrop-blur-xl text-slate-100 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
              ACTIVE MISSION
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-300 font-semibold">
              +{mission.rewardCredits} CR
            </span>
            <button
              onClick={onAbandonMission}
              className="p-1 rounded text-slate-500 hover:text-slate-200 transition"
              title="Abandon Mission"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-white font-['Chakra_Petch'] leading-tight">
          {mission.title}
        </h4>

        {/* Current Objective */}
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Current Objective:
          </span>
          <p className="text-xs text-cyan-200 font-mono font-medium flex items-start gap-1.5">
            <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>{currentObj?.description || 'Finalizing Mission...'}</span>
          </p>
        </div>

        {/* Progress Bar & Actions */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Progress: {mission.currentObjectiveIndex} / {mission.objectives.length}</span>
            <span>{progressPercent}%</span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {currentObj?.targetPosition && onLocateObjective && (
            <button
              onClick={() => onLocateObjective(currentObj.targetPosition!)}
              className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5"
            >
              <Navigation className="w-3 h-3 text-cyan-400" />
              <span>Locate Waypoint</span>
            </button>
          )}

          <button
            onClick={onAdvanceObjective}
            className="flex-1 py-1.5 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-xs font-mono font-bold text-cyan-300 transition flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Complete Step</span>
          </button>
        </div>
      </div>
    </div>
  );
};
