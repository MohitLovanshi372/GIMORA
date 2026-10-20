/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BuildingData } from '../city/types';
import { Layers, Zap, Users, Wifi, Compass, X, Sparkles, CheckCircle2, Box, DoorOpen } from 'lucide-react';
import { InteriorBuildingType } from './BuildingInteriorModal';

interface BuildingInspectorProps {
  building: BuildingData;
  onClose: () => void;
  onFocus: (building: BuildingData) => void;
  onFocusEntryGate?: (building: BuildingData) => void;
  onEnterInterior?: (type: InteriorBuildingType) => void;
}

export const BuildingInspector: React.FC<BuildingInspectorProps> = ({
  building,
  onClose,
  onFocus,
  onFocusEntryGate,
  onEnterInterior,
}) => {
  const isMohitHub = building.id === 'mohit-developer-hub-hq';

  const getInteriorType = (): InteriorBuildingType => {
    const id = building.id.toLowerCase();
    const cat = building.category.toLowerCase();
    if (isMohitHub || building.districtId === 'technology' || cat.includes('research')) return 'mohit-hub';
    if (building.districtId === 'airport' || id.includes('airport') || id.includes('skyport')) return 'airport';
    if (cat.includes('transit') || id.includes('rail')) return 'railway';
    if (building.districtId === 'healthcare' || cat.includes('hospital') || cat.includes('emergency') || cat.includes('pharm')) return 'hospital';
    if (building.districtId === 'education' || cat.includes('university') || cat.includes('college') || cat.includes('school') || cat.includes('library')) return 'university';
    if (id.includes('cultural') || id.includes('civic') || id.includes('hall')) return 'city-hall';
    if (building.districtId === 'entertainment' || cat.includes('megaplex') || id.includes('galleria')) return 'mall';
    return 'corporate-office';
  };

  return (
    <aside className="absolute right-6 top-20 w-96 max-w-[calc(100vw-3rem)] max-h-[82vh] overflow-y-auto z-30 pointer-events-auto">
      <div
        className={`p-5 rounded-lg border backdrop-blur-md shadow-2xl transition-all ${
          isMohitHub
            ? 'bg-slate-950/90 border-cyan-400/50 shadow-cyan-950/40 ring-1 ring-purple-500/30'
            : 'bg-slate-950/80 border-cyan-400/20 shadow-cyan-950/30'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider">
              {isMohitHub ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> GLOBAL TECH HQ
                </span>
              ) : (
                <span className="text-cyan-400 font-medium">{building.districtName}</span>
              )}
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">{building.category}</span>
            </div>

            <h2 className="text-xl font-bold text-white tracking-wide mt-1 font-['Chakra_Petch']">
              {building.name}
            </h2>

            {/* Sub-header specifically required for MOHIT DEVELOPER HUB */}
            {isMohitHub && (
              <div className="mt-1 text-xs font-mono font-bold tracking-widest text-cyan-300">
                AI • SOFTWARE • INNOVATION
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            title="Close Inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 py-3 border-b border-white/10 text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> Height & Floors
            </span>
            <span className="text-slate-100 font-mono font-medium tabular-nums">
              {building.height}m · {building.floors} fl
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Power Usage
            </span>
            <span className="text-slate-100 font-mono font-medium truncate">
              {building.powerUsage}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-pink-400" /> Occupancy
            </span>
            <span className="text-slate-100 font-mono font-medium truncate">
              {building.occupancy}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" /> Network Connectivity
            </span>
            <span className="text-slate-100 font-mono font-medium truncate">
              {building.networkStatus}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="py-3 border-b border-white/10">
          <p className="text-xs text-slate-300 leading-relaxed">
            {building.description}
          </p>
        </div>

        {/* Visible Interior Areas Through Glass (Required for Mohit Developer Hub) */}
        {building.interiorAreas && building.interiorAreas.length > 0 && (
          <div className="py-3 border-b border-white/10">
            <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5" /> Visible Interior Areas (Through Glass)
            </div>
            <ul className="space-y-1.5 text-xs text-slate-200 font-mono">
              {building.interiorAreas.map((area, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-900/60 p-1.5 rounded border border-white/5">
                  <span className="text-cyan-400 font-bold">0{idx + 1}.</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Architectural Features */}
        {building.features && building.features.length > 0 && (
          <div className="py-3 border-b border-white/10">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Architectural Systems
            </div>
            <div className="grid grid-cols-1 gap-1 text-xs text-slate-300">
              {building.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => onFocus(building)}
              className="flex-1 py-2 px-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-white border border-cyan-400/40 rounded text-xs font-semibold tracking-wider flex items-center justify-center gap-1.5 transition-all"
            >
              <Compass className="w-3.5 h-3.5" /> TOWER VIEW
            </button>

            {onFocusEntryGate && (
              <button
                onClick={() => onFocusEntryGate(building)}
                className="flex-1 py-2 px-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white border border-amber-400/50 rounded text-xs font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all"
                title="Zoom camera to Street Entry Gate to look inside 3D Ground-Floor Room"
              >
                <DoorOpen className="w-3.5 h-3.5 text-amber-400" /> 3D ENTRY GATE
              </button>
            )}
          </div>

          {onEnterInterior && (
            <button
              onClick={() => onEnterInterior(getInteriorType())}
              className="w-full py-2.5 px-3 bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-200 hover:text-white border border-emerald-400/60 rounded text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/50"
              title="Enter Building Interior Rooms"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" /> ENTER INTERIOR ROOMS
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
