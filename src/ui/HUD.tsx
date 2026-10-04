/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { CameraMode, CityMetrics, DistrictId } from '../city/types';
import { DistrictNav } from './DistrictNav';
import { InteractionPrompt } from '../city/modules/PlayerSystem';
import {
  Eye,
  Footprints,
  User,
  Video,
  Clock,
  CloudRain,
  Activity,
  Cpu,
  TrendingUp,
  Compass,
  Map,
  Bot,
  Car,
  Flame,
  Building2,
  Sliders,
  Sparkles,
  Target,
  FolderGit2,
  Settings,
} from 'lucide-react';

interface HUDProps {
  metrics: CityMetrics;
  cameraMode: CameraMode;
  activeDistrict: DistrictId | 'mohit-hub' | null;
  onSetCameraMode: (mode: CameraMode) => void;
  onSelectDistrict: (districtId: DistrictId) => void;
  onSelectMohitHub: () => void;
  onOpenControlCenter?: () => void;
  onStartFlyover?: () => void;
  // Section 18 Unified Navigation Buttons
  onExploreCity?: () => void;
  onToggleAIControl?: () => void;
  onOpenCityMap?: () => void;
  onOpenEvents?: () => void;
  onFollowVehicles?: () => void;
  onOpenBuildings?: () => void;
  onOpenProjects?: () => void;
  onOpenMissions?: () => void;
  onOpenSettings?: () => void;
  onOpenTimeControl?: () => void;
  // Proximity Interaction
  interactionPrompt?: InteractionPrompt | null;
  onTriggerInteract?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  metrics,
  cameraMode,
  activeDistrict,
  onSetCameraMode,
  onSelectDistrict,
  onSelectMohitHub,
  onOpenControlCenter,
  onStartFlyover,
  onExploreCity,
  onToggleAIControl,
  onOpenCityMap,
  onOpenEvents,
  onFollowVehicles,
  onOpenBuildings,
  onOpenProjects,
  onOpenMissions,
  onOpenSettings,
  onOpenTimeControl,
  interactionPrompt,
  onTriggerInteract,
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [showMoreCameras, setShowMoreCameras] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentTime(timeStr);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
      {/* TOP BAR CONTRACT: Zone 1 (Brand) - Zone 2 (District Nav) - Zone 3 (Camera Mode & Telemetry) */}
      <header className="flex items-center justify-between gap-4 w-full">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-wider text-white font-['Chakra_Petch'] drop-shadow-[0_0_12px_rgba(0,240,255,0.4)]">
              {metrics.cityName}
            </span>
            <span className="text-xs font-mono text-cyan-400">
              v4.2
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 pl-4 border-l border-white/10">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="tabular-nums">{currentTime || metrics.time}</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <CloudRain className="w-3.5 h-3.5 text-sky-400" />
              <span>{metrics.weather.condition} {metrics.weather.temperature}</span>
            </span>
          </div>
        </div>

        {/* Zone 2: District Navigation Quick Jumps */}
        <div className="pointer-events-auto">
          <DistrictNav
            activeDistrict={activeDistrict}
            onSelectDistrict={onSelectDistrict}
            onSelectMohitHub={onSelectMohitHub}
          />
        </div>

        {/* Zone 3: Camera Mode Selectors */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center p-1 bg-slate-950/80 border border-white/10 rounded-lg backdrop-blur-md">
            <button
              onClick={() => onSetCameraMode('orbit')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-all ${
                cameraMode === 'orbit'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="1. Free Explore Orbit (Pan, Rotate, Zoom)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Orbit</span>
            </button>

            <button
              onClick={() => onSetCameraMode('first-person')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-all ${
                cameraMode === 'first-person'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="2. First-Person Street Level Walk (WASD + Mouse)"
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Walk</span>
            </button>

            <button
              onClick={() => onSetCameraMode('aerial')}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-all ${
                cameraMode === 'aerial'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="3. Aerial City View (High Altitude Ortho)"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Aerial</span>
            </button>

            <button
              onClick={() => onSetCameraMode('cinematic')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-all ${
                cameraMode === 'cinematic'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Cinematic Overview (Reference Image Composition)"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Cinematic</span>
            </button>

            <button
              onClick={() => onSetCameraMode('river-view')}
              className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-all ${
                cameraMode === 'river-view'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Waterfront & River Promenade"
            >
              <span>River</span>
            </button>

            <button
              onClick={() => onSetCameraMode('bridge-view')}
              className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-all ${
                cameraMode === 'bridge-view'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grand Central Bridge"
            >
              <span>Bridge</span>
            </button>

            <button
              onClick={() => onSetCameraMode('mohit-hub')}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-all ${
                cameraMode === 'mohit-hub'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="MOHIT DEVELOPER HUB Landmark Showcase"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mohit Hub</span>
            </button>

            {(cameraMode === 'follow-vehicle' || cameraMode === 'follow-train') && (
              <span className="ml-1 px-2.5 py-1 text-[11px] font-mono font-semibold rounded bg-cyan-500/25 text-cyan-300 border border-cyan-400/80 animate-pulse">
                {cameraMode === 'follow-vehicle' ? 'Following Car' : 'Following Train'}
              </span>
            )}
            {cameraMode === 'city-flyover' && (
              <span className="ml-1 px-2.5 py-1 text-[11px] font-mono font-semibold rounded bg-purple-500/30 text-purple-300 border border-purple-400/80 animate-pulse">
                Tour Active
              </span>
            )}
          </div>

          {onStartFlyover && (
            <button
              onClick={onStartFlyover}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/40 hover:to-blue-600/40 text-purple-200 border border-purple-400/50 rounded-lg text-xs font-mono font-bold tracking-wider transition-all shadow-md shadow-purple-950/40"
              title="Start Cinematic City Flyover Tour"
            >
              <Video className="w-3.5 h-3.5 text-purple-300" />
              <span>FLYOVER TOUR</span>
            </button>
          )}

          {onOpenControlCenter && (
            <button
              onClick={onOpenControlCenter}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-['Chakra_Petch'] font-bold rounded-lg text-xs tracking-wider transition-all shadow-lg shadow-cyan-500/30 active:scale-95"
              title="Open Smart City Command Matrix & Map"
            >
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span>COMMAND MATRIX</span>
            </button>
          )}
        </div>
      </header>

      {/* QUICK INTERACTION TOOLBAR: Section 13 Buttons */}
      <div className="w-full flex justify-center pointer-events-auto mt-2">
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-950/85 border border-cyan-500/30 rounded-xl backdrop-blur-xl shadow-2xl shadow-cyan-950/60 font-['Chakra_Petch'] text-xs font-bold tracking-wide">
          {onExploreCity && (
            <button
              onClick={onExploreCity}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition active:scale-95"
              title="Free explore city camera"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>EXPLORE CITY</span>
            </button>
          )}

          {onToggleAIControl && (
            <button
              onClick={onToggleAIControl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition active:scale-95"
              title="Inspect autonomous AI agents and command matrix"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI CONTROL</span>
            </button>
          )}

          {onOpenCityMap && (
            <button
              onClick={onOpenCityMap}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition active:scale-95"
              title="Interactive city district radar map"
            >
              <Map className="w-3.5 h-3.5 text-cyan-400" />
              <span>CITY MAP</span>
            </button>
          )}

          {onOpenEvents && (
            <button
              onClick={onOpenEvents}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 transition active:scale-95"
              title="Trigger and inspect simulated city events"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>EVENTS</span>
            </button>
          )}

          {onFollowVehicles && (
            <button
              onClick={onFollowVehicles}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition active:scale-95"
              title="Follow active traffic and commuter vehicles"
            >
              <Car className="w-3.5 h-3.5 text-cyan-400" />
              <span>VEHICLES</span>
            </button>
          )}

          {onOpenBuildings && (
            <button
              onClick={onOpenBuildings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition active:scale-95"
              title="Enter interactive building interiors"
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>BUILDINGS</span>
            </button>
          )}

          {onOpenTimeControl && (
            <button
              onClick={onOpenTimeControl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition active:scale-95"
              title="24-hour cycle time and weather controls"
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>TIME CONTROL</span>
            </button>
          )}
        </div>
      </div>

      {/* BOTTOM TELEMETRY BAR: Population, Traffic, AI Status, Grid */}
      <footer className="w-full flex items-end justify-end pointer-events-auto">
        <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 bg-slate-950/75 border border-white/10 rounded-lg backdrop-blur-md text-xs font-mono">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Population:</span>
            <span className="text-slate-100 font-semibold tabular-nums">
              {metrics.population.toLocaleString()}
            </span>
          </div>

          <span className="text-slate-600 hidden sm:inline">·</span>

          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Traffic:</span>
            <span className="text-emerald-300 font-semibold">
              {metrics.trafficStatus}
            </span>
          </div>

          <span className="text-slate-600 hidden sm:inline">·</span>

          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-slate-400">AI Core:</span>
            <span className="text-pink-300 font-semibold">
              {metrics.aiStatus}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
