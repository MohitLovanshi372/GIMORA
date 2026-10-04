/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Map,
  Activity,
  Zap,
  DollarSign,
  Clock,
  CloudRain,
  Sun,
  Flame,
  AlertTriangle,
  Play,
  Pause,
  Compass,
  Video,
  Eye,
  Sliders,
  Sparkles,
  Building,
  Radio,
  Siren,
  ChevronRight,
  TrendingUp,
  X,
  Volume2,
} from 'lucide-react';
import { DistrictId, WeatherType, CameraMode, CityEconomyMetrics, EnergyMetrics } from '../city/types';
import { DISTRICT_REGISTRY } from '../districts/DistrictManager';
import { AgentManagerSnapshot } from '../simulation/AgentManager';
import { InteriorBuildingType } from './BuildingInteriorModal';

interface SmartCityControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'map' | 'overview' | 'time_weather' | 'energy' | 'camera' | 'events';
  // Time & Weather
  timeString: string;
  timeOfDay: number;
  timeSpeed: number;
  isPaused: boolean;
  onSetTime: (hour: number) => void;
  onSetSpeed: (speed: number) => void;
  onTogglePause: () => void;
  currentWeather: WeatherType;
  onSetWeather: (weather: WeatherType) => void;
  // Metrics & State
  economyMetrics: CityEconomyMetrics;
  energyMetrics: EnergyMetrics;
  agentSnapshot: AgentManagerSnapshot;
  // Camera & Navigation
  cameraMode: CameraMode;
  onSetCameraMode: (mode: CameraMode) => void;
  onSelectDistrict: (districtId: DistrictId) => void;
  onStartFlyover: () => void;
  onOpenInterior: (type: InteriorBuildingType) => void;
  // Event Triggers
  onTriggerFire: () => void;
  onTriggerAccident: () => void;
  onTriggerMedical: () => void;
  onTriggerSummit: () => void;
  onTriggerBlackout: () => void;
}

export const SmartCityControlCenter: React.FC<SmartCityControlCenterProps> = ({
  isOpen,
  onClose,
  initialTab = 'map',
  timeString,
  timeOfDay,
  timeSpeed,
  isPaused,
  onSetTime,
  onSetSpeed,
  onTogglePause,
  currentWeather,
  onSetWeather,
  economyMetrics,
  energyMetrics,
  agentSnapshot,
  cameraMode,
  onSetCameraMode,
  onSelectDistrict,
  onStartFlyover,
  onOpenInterior,
  onTriggerFire,
  onTriggerAccident,
  onTriggerMedical,
  onTriggerSummit,
  onTriggerBlackout,
}) => {
  const [activeTab, setActiveTab] = useState<'map' | 'overview' | 'time_weather' | 'energy' | 'camera' | 'events'>(initialTab);
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictId | null>('technology');

  React.useEffect(() => {
    if (initialTab && isOpen) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const districtList: DistrictId[] = [
    'downtown',
    'technology',
    'education',
    'healthcare',
    'residential',
    'entertainment',
    'industrial',
    'railway',
    'riverside',
    'airport',
  ];

  const weatherOptions: { type: WeatherType; label: string; icon: string }[] = [
    { type: 'CLEAR', label: 'Clear Sky', icon: '☀' },
    { type: 'CLOUDY', label: 'Overcast', icon: '☁' },
    { type: 'RAIN', label: 'Neon Rain', icon: '🌧' },
    { type: 'HEAVY_RAIN', label: 'Torrential', icon: '⛈' },
    { type: 'FOG', label: 'Atmospheric Fog', icon: '🌫' },
    { type: 'STORM', label: 'Lightning Storm', icon: '⚡' },
  ];

  return (
    <div
      role="dialog"
      aria-label="Smart City Central Command Matrix"
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md pointer-events-auto"
    >
      <div className="relative w-full max-w-5xl h-[85vh] max-h-[800px] bg-slate-950/95 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/80 overflow-hidden flex flex-col font-['Plus_Jakarta_Sans'] text-slate-100">
        {/* Top Command Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-cyan-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-['Chakra_Petch'] text-cyan-300 tracking-wider">
                  SMART CITY COMMAND MATRIX
                </h2>
                <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-semibold">
                  CENTRAL HUB
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Simulation Clock: <span className="text-cyan-300 font-bold tabular-nums">{timeString}</span> • Weather: <span className="text-emerald-400">{currentWeather}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close Command Matrix"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-slate-800 bg-slate-900/60 text-xs font-mono overflow-x-auto">
          {[
            { id: 'map', label: 'Interactive City Map', icon: Map },
            { id: 'overview', label: 'City Overview & Economy', icon: Activity },
            { id: 'time_weather', label: '24h Time & Weather', icon: Clock },
            { id: 'energy', label: 'Smart Energy Grid', icon: Zap },
            { id: 'camera', label: 'Cinematic Camera', icon: Video },
            { id: 'events', label: 'City Events Injector', icon: Siren },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-500/50 font-semibold shadow-sm shadow-cyan-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: INTERACTIVE 2D / ISOMETRIC CITY MAP */}
          {activeTab === 'map' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              {/* Map Canvas Diagram */}
              <div className="lg:col-span-8 p-4 rounded-xl bg-slate-900/80 border border-cyan-500/20 relative flex flex-col items-center justify-center min-h-[380px]">
                <div className="absolute top-3 left-4 text-xs font-mono text-cyan-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>METROPOLITAN SECTOR SCHEMATIC</span>
                </div>

                {/* Stylized Grid Map Layout */}
                <div className="grid grid-cols-3 gap-3 w-full max-w-lg mt-4">
                  {districtList.map((dId) => {
                    const info = DISTRICT_REGISTRY[dId];
                    const isHovered = hoveredDistrict === dId;
                    const isMohitHub = dId === 'technology';
                    return (
                      <button
                        key={dId}
                        onMouseEnter={() => setHoveredDistrict(dId)}
                        onClick={() => {
                          onSelectDistrict(dId);
                          onClose();
                        }}
                        className={`p-3 rounded-xl border text-left transition relative overflow-hidden group ${
                          isHovered
                            ? 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-950/50 scale-[1.02]'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full mb-1.5"
                          style={{ backgroundColor: info?.color || '#00f0ff' }}
                        />
                        <div className="text-xs font-bold text-slate-100 font-['Chakra_Petch'] truncate">
                          {info?.name.replace(' District', '')}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {isMohitHub ? '★ MOHIT HUB' : info?.density.split('(')[0]}
                        </div>
                        {isMohitHub && (
                          <span className="absolute top-1 right-1.5 text-[9px] font-mono text-emerald-400 font-bold">
                            HQ
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="text-[11px] text-slate-400 font-mono mt-4">
                  Hover to inspect district telemetry • Click any district to fly 3D camera
                </p>
              </div>

              {/* District Telemetry Sidebar */}
              <div className="lg:col-span-4 p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                {hoveredDistrict && DISTRICT_REGISTRY[hoveredDistrict] && (
                  <>
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                        Sector Selected
                      </span>
                      <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                        {DISTRICT_REGISTRY[hoveredDistrict].name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {DISTRICT_REGISTRY[hoveredDistrict].tagline}
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {DISTRICT_REGISTRY[hoveredDistrict].description}
                    </p>

                    <div className="space-y-2 text-xs font-mono pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Status:</span>
                        <span className="text-emerald-400 font-bold">{DISTRICT_REGISTRY[hoveredDistrict].status}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Power Grid:</span>
                        <span className="text-cyan-300">{DISTRICT_REGISTRY[hoveredDistrict].powerGrid}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Density:</span>
                        <span className="text-slate-200">{DISTRICT_REGISTRY[hoveredDistrict].density}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectDistrict(hoveredDistrict);
                        onClose();
                      }}
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center justify-center gap-2 transition"
                    >
                      <span>Fly Camera To Sector</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CITY OVERVIEW & ECONOMY */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/20 space-y-1">
                  <span className="text-xs text-slate-400 font-mono">Metropolis Population</span>
                  <div className="text-xl font-bold font-['Chakra_Petch'] text-cyan-300">4,821,900</div>
                  <span className="text-[10px] text-emerald-400 font-mono">+1.8% annual growth</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-emerald-500/20 space-y-1">
                  <span className="text-xs text-slate-400 font-mono">Employment Rate</span>
                  <div className="text-xl font-bold font-['Chakra_Petch'] text-emerald-400">
                    {economyMetrics.employmentRate}%
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {economyMetrics.totalJobs.toLocaleString()} Total Jobs
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-purple-500/20 space-y-1">
                  <span className="text-xs text-slate-400 font-mono">Hourly Revenue</span>
                  <div className="text-xl font-bold font-['Chakra_Petch'] text-purple-300">
                    +{economyMetrics.hourlyRevenueCredits.toLocaleString()} CR
                  </div>
                  <span className="text-[10px] text-purple-400 font-mono">Com-Tax & Fares</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-amber-500/20 space-y-1">
                  <span className="text-xs text-slate-400 font-mono">Registered Businesses</span>
                  <div className="text-xl font-bold font-['Chakra_Petch'] text-amber-300">
                    {economyMetrics.activeBusinesses.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Economic Health: BOOMING</span>
                </div>
              </div>

              {/* District Economic Breakdown */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                  District Commercial Productivity Matrix
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Technology & Mohit Hub</span>
                    <span className="text-cyan-300 font-bold text-sm">48.5% Total GDP</span>
                    <p className="text-[10px] text-slate-400 mt-1">High-density AI compute, software export, quantum research</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Downtown Financial</span>
                    <span className="text-emerald-300 font-bold text-sm">32.0% Total GDP</span>
                    <p className="text-[10px] text-slate-400 mt-1">Global inter-continental banking, corporate fintech</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Industrial & Energy Export</span>
                    <span className="text-amber-300 font-bold text-sm">19.5% Total GDP</span>
                    <p className="text-[10px] text-slate-400 mt-1">+450 MW clean power exports to neighboring sectors</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 24-HOUR TIME & DYNAMIC WEATHER */}
          {activeTab === 'time_weather' && (
            <div className="space-y-6">
              {/* Time Controls */}
              <div className="p-5 rounded-xl bg-slate-900/70 border border-cyan-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold font-['Chakra_Petch'] text-cyan-300">
                      24-Hour Solar & Lunar Life Cycle
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Current: <span className="text-white font-bold">{timeString}</span> (24h Simulation Clock)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={onTogglePause}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                        isPaused
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      }`}
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                      <span>{isPaused ? 'Resume Time' : 'Pause Time'}</span>
                    </button>
                  </div>
                </div>

                {/* Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>00:00 (Midnight)</span>
                    <span>06:00 (Dawn)</span>
                    <span>12:00 (Noon)</span>
                    <span>18:00 (Dusk)</span>
                    <span>24:00</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    step="0.1"
                    value={timeOfDay}
                    onChange={(e) => onSetTime(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Time Jump Presets */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">Quick Jumps:</span>
                  {[
                    { label: 'Dawn (06:00)', hour: 6.0 },
                    { label: 'Noon (12:00)', hour: 12.0 },
                    { label: 'Dusk (18:00)', hour: 18.0 },
                    { label: 'Midnight (23:45)', hour: 23.75 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => onSetTime(p.hour)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Speed Multipliers */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">Time Speed:</span>
                  {[1, 2, 5, 20].map((s) => (
                    <button
                      key={s}
                      onClick={() => onSetSpeed(s)}
                      className={`px-2.5 py-1 rounded border transition ${
                        timeSpeed === s
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Weather Selector */}
              <div className="p-5 rounded-xl bg-slate-900/70 border border-cyan-500/20 space-y-3">
                <h3 className="text-sm font-bold font-['Chakra_Petch'] text-cyan-300">
                  Dynamic Atmospheric Weather Manager
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Selecting a weather condition dynamically updates rain particles, road specular sheen, scene fog, and traffic speeds.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {weatherOptions.map((opt) => (
                    <button
                      key={opt.type}
                      onClick={() => onSetWeather(opt.type)}
                      className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                        currentWeather === opt.type
                          ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 font-bold shadow-md shadow-cyan-950/40'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <div>
                        <div className="text-xs">{opt.label}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{opt.type}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SMART ENERGY GRID */}
          {activeTab === 'energy' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/20">
                  <span className="text-xs text-slate-400 font-mono">Total Grid Capacity</span>
                  <div className="text-2xl font-bold font-['Chakra_Petch'] text-cyan-300">
                    {energyMetrics.totalCapacityMW} MW
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Clean Geothermal + Solar + Fusion</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-emerald-500/20">
                  <span className="text-xs text-slate-400 font-mono">Current Consumption</span>
                  <div className="text-2xl font-bold font-['Chakra_Petch'] text-emerald-400">
                    {energyMetrics.currentConsumptionMW} MW
                  </div>
                  <span className="text-[10px] text-emerald-300 font-mono">Surplus: +{energyMetrics.surplusMW} MW</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-purple-500/20">
                  <span className="text-xs text-slate-400 font-mono">Grid Stability</span>
                  <div className="text-2xl font-bold font-['Chakra_Petch'] text-purple-300">
                    {energyMetrics.gridStatus}
                  </div>
                  <span className="text-[10px] text-purple-400 font-mono">Zero Carbon Emission</span>
                </div>
              </div>

              {/* Blackout Scenario Test */}
              <div className="p-5 rounded-xl bg-slate-900/70 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-amber-300 font-['Chakra_Petch']">
                    Simulate Grid Load Stress / District Blackout
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Triggers a localized power failure scenario to test City Manager and emergency backup failover.
                  </p>
                </div>
                <button
                  onClick={onTriggerBlackout}
                  className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold hover:bg-amber-500/30 transition shrink-0"
                >
                  Trigger Blackout
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: CINEMATIC CAMERA MODES */}
          {activeTab === 'camera' && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-900/80 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                    Guided Cinematic City Flyover Tour
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Embark on a continuous aerial flyover journey across all landmark districts: Airport, Downtown Skyscrapers, Mohit Developer Hub, River Bridges, Railway Terminal, Hospital, University, and Entertainment.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onStartFlyover();
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono shadow-lg shadow-cyan-500/30 flex items-center gap-2 transition shrink-0"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Guided Flyover Tour</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                {[
                  { mode: 'orbit', label: 'Free Orbit Camera', desc: 'Pan, zoom, and rotate freely' },
                  { mode: 'first-person', label: 'First-Person Walk', desc: 'Street-level sidewalk walk' },
                  { mode: 'aerial', label: 'Aerial Birdseye View', desc: 'Overhead high altitude plan' },
                  { mode: 'follow-vehicle', label: 'Follow Automobile', desc: 'Chase active car or bus' },
                  { mode: 'follow-train', label: 'Follow Maglev Train', desc: 'Ride high-speed bullet train' },
                  { mode: 'drone', label: 'Cinematic Drone Orbit', desc: 'Smooth continuous drift' },
                  { mode: 'mohit-hub', label: 'MOHIT HUB Showcase', desc: 'Dramatic tower spiral' },
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => {
                      onSetCameraMode(item.mode as any);
                      onClose();
                    }}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      cameraMode === item.mode
                        ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 font-bold shadow-md shadow-cyan-950/40'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-white mb-0.5">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CITY EVENTS INJECTOR */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-['Chakra_Petch'] text-cyan-300">
                    Citywide Scenario Injectors
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Trigger authentic urban crises or celebrations to observe AI agent reactions in real-time.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onTriggerFire();
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 hover:bg-red-900/50 text-left transition flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-red-300 text-xs font-bold">
                      <Flame className="w-4 h-4 text-red-400 group-hover:scale-110 transition" />
                      <span>Downtown Cyber Tower Fire</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Dispatches Fire Engine + Green corridor</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-400" />
                </button>

                <button
                  onClick={() => {
                    onTriggerAccident();
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/50 text-left transition flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
                      <span>Tech Avenue Multi-Collision</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Dispatches Police + Ambulance + Signal Wave</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </button>

                <button
                  onClick={() => {
                    onTriggerMedical();
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 hover:bg-cyan-900/50 text-left transition flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-bold">
                      <Siren className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
                      <span>Mohit Hub Perimeter Medical</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Dispatches Rapid Response Cyber-Ambulance</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-cyan-400" />
                </button>

                <button
                  onClick={() => {
                    onTriggerSummit();
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/50 text-left transition flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold">
                      <Sparkles className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                      <span>Host Mohit Hub Innovation Summit</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Directs transit, draws crowds, maximizes morale</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
