/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Map,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Compass,
  Navigation,
  Car,
  Train,
  AlertTriangle,
  Flame,
  Building,
  Activity,
  Zap,
  Users,
  Eye,
  Crosshair,
} from 'lucide-react';
import { DistrictId } from '../city/types';
import { DISTRICT_REGISTRY } from '../districts/DistrictManager';
import { AgentManagerSnapshot } from '../simulation/AgentManager';

interface InteractiveCityMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFocusDistrict: (districtId: DistrictId) => void;
  onFocusMohitHub: () => void;
  onLocateIncident?: (location: [number, number, number]) => void;
  agentSnapshot?: AgentManagerSnapshot;
  activeVehiclesCount?: number;
  activeTrainsCount?: number;
}

export const InteractiveCityMapModal: React.FC<InteractiveCityMapModalProps> = ({
  isOpen,
  onClose,
  onFocusDistrict,
  onFocusMohitHub,
  onLocateIncident,
  agentSnapshot,
  activeVehiclesCount = 64,
  activeTrainsCount = 3,
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictId | 'mohit-hub'>('technology');
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Layer filters
  const [showDistricts, setShowDistricts] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [showTrains, setShowTrains] = useState(true);
  const [showEmergencies, setShowEmergencies] = useState(true);

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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Convert 3D world coord (-300 to +300) into SVG map coords (0 to 600)
  const worldToMap = (x: number, z: number) => {
    const mapX = ((x + 300) / 600) * 800;
    const mapY = ((z + 300) / 600) * 800;
    return { x: mapX, y: mapY };
  };

  const currentDistrictInfo = selectedDistrict === 'mohit-hub'
    ? {
        name: 'MOHIT DEVELOPER HUB HQ',
        description: 'Monumental glass cyber-tower, AI laboratories, quantum data center, and open-source project showcase pavilion.',
        status: 'Operational • 100% Core Load',
        powerGrid: 'Quantum Geothermal 32.8 MW',
        density: '4,200 AI Engineers',
        color: '#00f0ff',
      }
    : DISTRICT_REGISTRY[selectedDistrict];

  return (
    <div
      role="dialog"
      aria-label="Full-Screen City Tactical Map"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl"
    >
      <div className="relative w-full h-full max-w-7xl max-h-[92vh] bg-slate-950/95 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/90 overflow-hidden flex flex-col font-['Plus_Jakarta_Sans'] text-slate-100">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-['Chakra_Petch'] text-cyan-300 tracking-wider">
                  METROPOLITAN RADAR TACTICAL MAP
                </h2>
                <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                  Real-Time Grid Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Interactive spatial topography, active vehicle routes, maglev corridors, and emergency alerts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Layer Toggles */}
            <div className="hidden md:flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setShowDistricts(!showDistricts)}
                className={`px-2.5 py-1 rounded transition ${
                  showDistricts ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-500'
                }`}
              >
                Districts
              </button>
              <button
                onClick={() => setShowVehicles(!showVehicles)}
                className={`px-2.5 py-1 rounded transition ${
                  showVehicles ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-500'
                }`}
              >
                Vehicles ({activeVehiclesCount})
              </button>
              <button
                onClick={() => setShowTrains(!showTrains)}
                className={`px-2.5 py-1 rounded transition ${
                  showTrains ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-500'
                }`}
              >
                Trains ({activeTrainsCount})
              </button>
              <button
                onClick={() => setShowEmergencies(!showEmergencies)}
                className={`px-2.5 py-1 rounded transition ${
                  showEmergencies ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold' : 'text-slate-500'
                }`}
              >
                Alerts ({agentSnapshot?.activeEmergencies.length || 0})
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close Map"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Map Body (Split: Map Canvas + District Dossier) */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative">
          {/* Main Map Viewport */}
          <div
            className="flex-1 relative overflow-hidden bg-[#030712] cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* SVG Interactive Map */}
            <svg
              className="w-full h-full pointer-events-auto"
              viewBox="0 0 800 800"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              }}
            >
              {/* Background Grid Lines */}
              <defs>
                <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 240, 255, 0.08)" strokeWidth="1" />
                </pattern>
                <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#003855" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#001830" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              <rect width="800" height="800" fill="url(#radarGrid)" />

              {/* Central River Flow */}
              <path
                d="M 370 0 Q 385 200 400 400 T 430 800 L 465 800 Q 435 600 435 400 T 405 0 Z"
                fill="url(#riverGrad)"
                stroke="#00f0ff"
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />

              {/* River Promenade Bridges */}
              <line x1="330" y1="180" x2="470" y2="180" stroke="#f59e0b" strokeWidth="6" strokeDasharray="4 2" />
              <line x1="340" y1="400" x2="480" y2="400" stroke="#f59e0b" strokeWidth="8" strokeDasharray="4 2" />
              <line x1="350" y1="620" x2="490" y2="620" stroke="#f59e0b" strokeWidth="6" strokeDasharray="4 2" />

              {/* Maglev High-Speed Railway Line */}
              {showTrains && (
                <g>
                  <path
                    d="M 400 70 L 400 730"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray="8 4"
                    strokeOpacity="0.7"
                  />
                  {/* Active Maglev Train Dot Pulse */}
                  <circle cx="400" cy="380" r="6" fill="#60a5fa" className="animate-ping" />
                  <circle cx="400" cy="380" r="4" fill="#ffffff" />
                </g>
              )}

              {/* District Zones */}
              {showDistricts && (
                <g>
                  {/* Downtown */}
                  <rect
                    x="150"
                    y="250"
                    width="170"
                    height="190"
                    fill="rgba(0, 240, 255, 0.08)"
                    stroke="#00f0ff"
                    strokeWidth="1.5"
                    rx="8"
                    className="cursor-pointer hover:fill-cyan-500/20 transition"
                    onClick={() => setSelectedDistrict('downtown')}
                  />
                  <text x="235" y="350" textAnchor="middle" fill="#00f0ff" fontSize="12" fontWeight="bold" fontFamily="Chakra Petch">
                    DOWNTOWN CORE
                  </text>

                  {/* Technology District & MOHIT HUB */}
                  <rect
                    x="480"
                    y="240"
                    width="180"
                    height="180"
                    fill="rgba(168, 85, 247, 0.08)"
                    stroke="#a855f7"
                    strokeWidth="1.5"
                    rx="8"
                    className="cursor-pointer hover:fill-purple-500/20 transition"
                    onClick={() => setSelectedDistrict('technology')}
                  />
                  <text x="570" y="310" textAnchor="middle" fill="#a855f7" fontSize="12" fontWeight="bold" fontFamily="Chakra Petch">
                    TECH DISTRICT
                  </text>

                  {/* MOHIT DEVELOPER HUB Landmark Highlight */}
                  <circle
                    cx="586"
                    cy="293"
                    r="14"
                    fill="#00f0ff"
                    fillOpacity="0.3"
                    stroke="#00f0ff"
                    strokeWidth="2"
                    className="cursor-pointer animate-pulse"
                    onClick={() => {
                      setSelectedDistrict('mohit-hub');
                      onFocusMohitHub();
                    }}
                  />
                  <text x="586" y="270" textAnchor="middle" fill="#00ffcc" fontSize="11" fontWeight="bold" fontFamily="Chakra Petch">
                    ★ MOHIT HUB HQ
                  </text>

                  {/* Healthcare District */}
                  <rect
                    x="140"
                    y="500"
                    width="160"
                    height="150"
                    fill="rgba(56, 189, 248, 0.08)"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    rx="8"
                    className="cursor-pointer hover:fill-sky-500/20 transition"
                    onClick={() => setSelectedDistrict('healthcare')}
                  />
                  <text x="220" y="580" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="Chakra Petch">
                    HEALTHCARE
                  </text>

                  {/* Education District */}
                  <rect
                    x="490"
                    y="490"
                    width="160"
                    height="150"
                    fill="rgba(99, 102, 241, 0.08)"
                    stroke="#6366f1"
                    strokeWidth="1.5"
                    rx="8"
                    className="cursor-pointer hover:fill-indigo-500/20 transition"
                    onClick={() => setSelectedDistrict('education')}
                  />
                  <text x="570" y="570" textAnchor="middle" fill="#6366f1" fontSize="11" fontWeight="bold" fontFamily="Chakra Petch">
                    EDUCATION
                  </text>

                  {/* Entertainment District */}
                  <rect
                    x="140"
                    y="70"
                    width="160"
                    height="130"
                    fill="rgba(236, 72, 153, 0.08)"
                    stroke="#ec4899"
                    strokeWidth="1.5"
                    rx="8"
                    className="cursor-pointer hover:fill-pink-500/20 transition"
                    onClick={() => setSelectedDistrict('entertainment')}
                  />
                  <text x="220" y="140" textAnchor="middle" fill="#ec4899" fontSize="11" fontWeight="bold" fontFamily="Chakra Petch">
                    ENTERTAINMENT
                  </text>

                  {/* Sub-Orbital Airport */}
                  <rect
                    x="480"
                    y="50"
                    width="200"
                    height="140"
                    fill="rgba(245, 158, 11, 0.08)"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    rx="8"
                    className="cursor-pointer hover:fill-amber-500/20 transition"
                    onClick={() => setSelectedDistrict('airport')}
                  />
                  <text x="580" y="125" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold" fontFamily="Chakra Petch">
                    SUB-ORBITAL AIRPORT
                  </text>

                  {/* Central Maglev Railway Station */}
                  <rect
                    x="330"
                    y="660"
                    width="140"
                    height="80"
                    fill="rgba(59, 130, 246, 0.12)"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    rx="6"
                    className="cursor-pointer hover:fill-blue-500/20 transition"
                    onClick={() => setSelectedDistrict('railway')}
                  />
                  <text x="400" y="705" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="bold" fontFamily="Chakra Petch">
                    CENTRAL TERMINAL
                  </text>
                </g>
              )}

              {/* Active Emergency Incident Beacons */}
              {showEmergencies &&
                agentSnapshot?.activeEmergencies.map((em) => {
                  const pt = worldToMap(em.location.x, em.location.z);
                  return (
                    <g
                      key={em.id}
                      className="cursor-pointer"
                      onClick={() => {
                        if (onLocateIncident) {
                          onLocateIncident([em.location.x, em.location.y, em.location.z]);
                        }
                      }}
                    >
                      <circle cx={pt.x} cy={pt.y} r="16" fill="rgba(239, 68, 68, 0.25)" className="animate-ping" />
                      <circle cx={pt.x} cy={pt.y} r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                      <text x={pt.x} y={pt.y - 12} textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="bold" fontFamily="monospace">
                        {em.title.toUpperCase()}
                      </text>
                    </g>
                  );
                })}
            </svg>

            {/* Floating Map Zoom / Pan Controls */}
            <div className="absolute right-4 bottom-4 flex flex-col gap-1.5 p-1.5 bg-slate-900/90 rounded-xl border border-slate-700 backdrop-blur-md shadow-xl">
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 transition"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.25, 0.65))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={resetView}
                className="p-2 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 transition"
                title="Reset Map Position"
              >
                <Compass className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Selected District / Landmark Detail Dossier */}
          <div className="w-full lg:w-80 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
                  District Telemetry Dossier
                </span>
                <h3 className="text-xl font-bold text-white font-['Chakra_Petch'] mt-0.5">
                  {currentDistrictInfo.name}
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {currentDistrictInfo.description}
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" /> Status
                  </span>
                  <span className="text-cyan-300 font-bold">{currentDistrictInfo.status}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Power Grid
                  </span>
                  <span className="text-amber-300 font-bold">{currentDistrictInfo.powerGrid}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400" /> Density
                  </span>
                  <span className="text-emerald-300 font-bold">{currentDistrictInfo.density}</span>
                </div>
              </div>

              {/* District List Selector */}
              <div className="pt-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                  Fast Jump To Sector:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                  {districtList.slice(0, 6).map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setSelectedDistrict(d);
                        onFocusDistrict(d);
                      }}
                      className={`px-2 py-1.5 rounded text-left transition truncate ${
                        selectedDistrict === d
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                          : 'bg-slate-950/50 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {d.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Jump Camera Button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  if (selectedDistrict === 'mohit-hub') {
                    onFocusMohitHub();
                  } else {
                    onFocusDistrict(selectedDistrict as DistrictId);
                  }
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-['Chakra_Petch'] font-bold text-xs tracking-wider transition shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 active:scale-95"
              >
                <Crosshair className="w-4 h-4" />
                <span>ENGAGE TACTICAL CAMERA</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
