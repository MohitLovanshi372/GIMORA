/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CameraMode, TrafficDensityLevel, TransportationMetrics } from '../city/types';
import { Car, Train, Gauge, Activity, Users, Navigation, Eye, ChevronDown, ChevronUp } from 'lucide-react';

interface TransportationDashboardProps {
  metrics: TransportationMetrics;
  cameraMode: CameraMode;
  onSetDensity: (level: TrafficDensityLevel) => void;
  onFollowVehicle: () => void;
  onFollowTrain: () => void;
  onResetCamera: () => void;
}

export const TransportationDashboard: React.FC<TransportationDashboardProps> = ({
  metrics,
  cameraMode,
  onSetDensity,
  onFollowVehicle,
  onFollowTrain,
  onResetCamera,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const densityLevels: TrafficDensityLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CONGESTED'];

  return (
    <aside className="absolute left-6 top-20 z-20 pointer-events-auto w-84 max-w-[calc(100vw-3rem)]">
      <div className="p-4 bg-slate-950/85 border border-cyan-500/25 rounded-lg backdrop-blur-md shadow-xl text-slate-100 font-mono transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-xs font-bold tracking-wider text-cyan-300 font-['Chakra_Petch']">
              TRANSIT CONTROL GRID
            </h3>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
            title={collapsed ? 'Expand Dashboard' : 'Collapse Dashboard'}
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {!collapsed && (
          <div className="pt-3 space-y-3 text-xs">
            {/* Density Selector */}
            <div>
              <div className="text-[11px] text-slate-400 mb-1.5 flex items-center justify-between">
                <span>TRAFFIC DENSITY</span>
                <span className="text-cyan-400 font-bold">{metrics.densityLevel}</span>
              </div>
              <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-900/90 rounded border border-white/5">
                {densityLevels.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => onSetDensity(lvl)}
                    className={`py-1 text-[10px] font-semibold rounded transition-all truncate ${
                      metrics.densityLevel === lvl
                        ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/80 shadow-sm shadow-cyan-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-[11px]">
              <div className="flex flex-col gap-0.5 bg-slate-900/50 p-2 rounded border border-white/5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-cyan-400" /> Active Vehicles
                </span>
                <span className="text-slate-100 font-bold tabular-nums text-sm">
                  {metrics.activeVehicles}
                </span>
              </div>

              <div className="flex flex-col gap-0.5 bg-slate-900/50 p-2 rounded border border-white/5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Train className="w-3.5 h-3.5 text-blue-400" /> Active Trains
                </span>
                <span className="text-slate-100 font-bold tabular-nums text-sm">
                  {metrics.activeTrains}
                </span>
              </div>

              <div className="flex flex-col gap-0.5 bg-slate-900/50 p-2 rounded border border-white/5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" /> Average Speed
                </span>
                <span className="text-slate-100 font-bold tabular-nums text-sm">
                  {metrics.averageSpeed} <span className="text-[10px] text-slate-400 font-normal">km/h</span>
                </span>
              </div>

              <div className="flex flex-col gap-0.5 bg-slate-900/50 p-2 rounded border border-white/5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-pink-400" /> Congestion
                </span>
                <span className={`font-bold tabular-nums text-sm ${metrics.congestionPercentage > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {metrics.congestionPercentage}%
                </span>
              </div>
            </div>

            {/* Pedestrians count line */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Users className="w-3 h-3 text-emerald-400" /> Pedestrian NPCs
              </span>
              <span className="text-slate-200 tabular-nums font-semibold">{metrics.activePedestrians}</span>
            </div>

            {/* Quick Tracking Camera Triggers */}
            <div className="pt-2 border-t border-white/10 flex items-center gap-1.5">
              <button
                onClick={onFollowVehicle}
                className={`flex-1 py-1.5 px-2 text-[10px] font-semibold rounded border transition-all flex items-center justify-center gap-1.5 truncate ${
                  cameraMode === 'follow-vehicle'
                    ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400/90 shadow-sm shadow-cyan-500/30'
                    : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-cyan-400/40'
                }`}
                title="Follow moving car or cycle next vehicle"
              >
                <Navigation className="w-3 h-3 text-cyan-400" />
                <span>Follow Car</span>
              </button>

              <button
                onClick={onFollowTrain}
                className={`flex-1 py-1.5 px-2 text-[10px] font-semibold rounded border transition-all flex items-center justify-center gap-1.5 truncate ${
                  cameraMode === 'follow-train'
                    ? 'bg-blue-500/25 text-blue-200 border-blue-400/90 shadow-sm shadow-blue-500/30'
                    : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-blue-400/40'
                }`}
                title="Follow High-Speed Maglev Train"
              >
                <Train className="w-3 h-3 text-blue-400" />
                <span>Follow Train</span>
              </button>

              {(cameraMode === 'follow-vehicle' || cameraMode === 'follow-train') && (
                <button
                  onClick={onResetCamera}
                  className="py-1.5 px-2 text-[10px] font-semibold rounded border bg-slate-900/80 text-slate-300 border-white/10 hover:text-white"
                  title="Return to Orbit"
                >
                  <Eye className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
