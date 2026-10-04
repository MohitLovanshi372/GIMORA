/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  X,
  Layers,
  Sparkles,
  Cpu,
  Server,
  Code,
  Compass,
  ExternalLink,
  ChevronRight,
  Shield,
  Activity,
  Zap,
} from 'lucide-react';

export type InteriorBuildingType = 'mohit-hub' | 'railway' | 'hospital' | 'university' | 'mall' | 'city-hall';

interface BuildingInteriorModalProps {
  buildingType: InteriorBuildingType;
  onClose: () => void;
  onSelectBuilding: (type: InteriorBuildingType) => void;
}

export const BuildingInteriorModal: React.FC<BuildingInteriorModalProps> = ({
  buildingType,
  onClose,
  onSelectBuilding,
}) => {
  const [selectedFloor, setSelectedFloor] = useState<number>(0);

  const buildingTitles: Record<InteriorBuildingType, { name: string; subtitle: string; floorsCount: number }> = {
    'mohit-hub': {
      name: 'MOHIT DEVELOPER HUB',
      subtitle: 'AI • SOFTWARE • INNOVATION HQ',
      floorsCount: 6,
    },
    railway: {
      name: 'CENTRAL HYPER-TRANSIT TERMINAL',
      subtitle: 'Maglev Nexus & Continental Concourse',
      floorsCount: 3,
    },
    hospital: {
      name: 'NEO-GENESIS SMART HOSPITAL',
      subtitle: 'Emergency Pavilion & Nanomedicine Center',
      floorsCount: 4,
    },
    university: {
      name: 'NEO-METROPOLIS UNIVERSITY',
      subtitle: 'Quantum Research & Cybernetic Academy',
      floorsCount: 4,
    },
    mall: {
      name: 'CYBER-PULSE MEGAPLEX ATRIUM',
      subtitle: 'Holographic Retail & Entertainment Hub',
      floorsCount: 3,
    },
    'city-hall': {
      name: 'NEON METROPOLIS CITY HALL',
      subtitle: 'Autonomous Civic Council & Digital Governance',
      floorsCount: 4,
    },
  };

  const currentInfo = buildingTitles[buildingType];

  return (
    <div
      role="dialog"
      aria-label="Building Interior Experience"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-950/95 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/80 overflow-hidden flex flex-col font-['Plus_Jakarta_Sans'] text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-gradient-to-r from-slate-900 via-slate-900/80 to-cyan-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-['Chakra_Petch'] text-cyan-300 tracking-wider">
                  {currentInfo.name}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-semibold">
                  INTERACTIVE INTERIOR
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{currentInfo.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs">
              {(['mohit-hub', 'railway', 'hospital', 'university', 'mall', 'city-hall'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    onSelectBuilding(b);
                    setSelectedFloor(0);
                  }}
                  className={`px-2.5 py-1 rounded transition text-xs font-mono ${
                    buildingType === b
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {b === 'mohit-hub' ? 'Mohit Hub' : b === 'city-hall' ? 'City Hall' : b.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
              title="Close Interior Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* MOHIT DEVELOPER HUB INTERIOR */}
          {buildingType === 'mohit-hub' && (
            <div className="space-y-6">
              {/* Floor Selection Tabs */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/90 rounded-xl border border-cyan-500/20 text-xs font-mono">
                {[
                  { floor: 0, label: 'G: Reception & Showcase' },
                  { floor: 1, label: 'L2: Software Lab' },
                  { floor: 2, label: 'L3: AI Laboratory' },
                  { floor: 3, label: 'L4: Cloud Data Center' },
                  { floor: 4, label: 'L5: Innovation Lab' },
                  { floor: 5, label: 'Rooftop: AI Command' },
                ].map((item) => (
                  <button
                    key={item.floor}
                    onClick={() => setSelectedFloor(item.floor)}
                    className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                      selectedFloor === item.floor
                        ? 'bg-gradient-to-r from-cyan-500/30 to-emerald-500/20 text-cyan-200 border border-cyan-400/50 font-bold shadow-md shadow-cyan-950/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* FLOOR 0: Reception & Project Showcase Wall */}
              {selectedFloor === 0 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                        Ground Floor • Main Atrium
                      </span>
                      <h3 className="text-base font-bold text-white font-['Chakra_Petch'] mt-0.5">
                        Holographic Reception & Project Showcase Wall
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 max-w-xl">
                        Welcome to MOHIT DEVELOPER HUB. The ground pavilion showcases real flagship software engineering initiatives, agritech solutions, and geospatial intelligence platforms.
                      </p>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Holographic Map Active</span>
                    </div>
                  </div>

                  {/* PROJECT SHOWCASE WALL */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        Featured Project Showcase Wall
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">4 Production Modules Live</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Project 1: Kisan Procurement Mitra */}
                      <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-500/60 transition space-y-2.5 group">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                              AGRITECH AI
                            </span>
                            <h5 className="text-sm font-bold text-white mt-1 group-hover:text-emerald-300 transition">
                              Kisan Procurement Mitra
                            </h5>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">v2.4 Live</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Intelligent agricultural procurement & mandi analytics engine empowering farmers with dynamic price prediction, harvest scheduling, and transparent direct-to-market dispatch.
                        </p>
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-emerald-400">
                          <span>Tech: AI • React • Cloud Run</span>
                          <span className="flex items-center gap-1 group-hover:underline">
                            Inspect Specs <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>

                      {/* Project 2: Smart Property Finder */}
                      <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-500/60 transition space-y-2.5 group">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                              GEOSPATIAL PROPTECH
                            </span>
                            <h5 className="text-sm font-bold text-white mt-1 group-hover:text-cyan-300 transition">
                              Smart Property Finder
                            </h5>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">v3.1 Live</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Next-generation real estate & urban planning platform with 3D neighborhood zoning visualization, price trend forecasting, and instant algorithmic property matching.
                        </p>
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-cyan-400">
                          <span>Tech: Three.js • Maps SDK • Node</span>
                          <span className="flex items-center gap-1 group-hover:underline">
                            Inspect Specs <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>

                      {/* Project 3: Weather Information Dashboard */}
                      <div className="p-4 rounded-xl bg-slate-900/80 border border-blue-500/30 hover:border-blue-500/60 transition space-y-2.5 group">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold">
                              METEOROLOGICAL AI
                            </span>
                            <h5 className="text-sm font-bold text-white mt-1 group-hover:text-blue-300 transition">
                              Weather Information Dashboard
                            </h5>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">v4.0 Live</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          High-frequency atmospheric radar & Doppler telemetry suite providing real-time precipitation mapping, severe storm trajectory warnings, and micro-climate simulations.
                        </p>
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-blue-400">
                          <span>Tech: Open-Meteo • Charts • WebGL</span>
                          <span className="flex items-center gap-1 group-hover:underline">
                            Inspect Specs <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>

                      {/* Project 4: Developer Portfolio & Hub Engine */}
                      <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/30 hover:border-purple-500/60 transition space-y-2.5 group">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold">
                              PORTFOLIO & ARCHITECTURE
                            </span>
                            <h5 className="text-sm font-bold text-white mt-1 group-hover:text-purple-300 transition">
                              Mohit Lovanshi Developer Portfolio
                            </h5>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">Continuous</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Full-stack software engineering showcase presenting scalable cloud microservices, reactive UI applications, WebGL visual computing, and open-source contributions.
                        </p>
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-purple-400">
                          <span>Tech: TypeScript • React • Node</span>
                          <span className="flex items-center gap-1 group-hover:underline">
                            Inspect Specs <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FLOOR 1: Software Development Lab */}
              {selectedFloor === 1 && (
                <div className="p-6 rounded-xl bg-slate-900/70 border border-cyan-500/20 space-y-4">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Code className="w-5 h-5" />
                    <h3 className="text-base font-bold font-['Chakra_Petch'] text-white">
                      Floor 2: Software Development Lab
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Collaborative open-concept developer engineering pods equipped with curved dual-8K OLED displays, holographic code debuggers, high-speed fiber local networks, and automated CI/CD continuous deployment test harnesses.
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Workstations</span>
                      <span className="text-cyan-300 font-bold text-sm">180 Active Pods</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Daily Commits</span>
                      <span className="text-emerald-300 font-bold text-sm">2,480 Automated</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Test Coverage</span>
                      <span className="text-cyan-300 font-bold text-sm">99.4% Verified</span>
                    </div>
                  </div>
                </div>
              )}

              {/* FLOOR 2: AI Laboratory */}
              {selectedFloor === 2 && (
                <div className="p-6 rounded-xl bg-slate-900/70 border border-cyan-500/20 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Cpu className="w-5 h-5" />
                    <h3 className="text-base font-bold font-['Chakra_Petch'] text-white">
                      Floor 3: Artificial Intelligence Laboratory
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Houses high-throughput neural tensor accelerators, fine-tuning large multimodal foundation models, training real-time vision algorithms for autonomous city traffic, and quantum weight simulators.
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Compute Power</span>
                      <span className="text-emerald-300 font-bold text-sm">480 PFLOPS Tensor</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Active Models</span>
                      <span className="text-cyan-300 font-bold text-sm">14 Swarm Agents</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Inference Latency</span>
                      <span className="text-emerald-300 font-bold text-sm">2.4ms Realtime</span>
                    </div>
                  </div>
                </div>
              )}

              {/* FLOOR 3: Cloud Data Center */}
              {selectedFloor === 3 && (
                <div className="p-6 rounded-xl bg-slate-900/70 border border-cyan-500/20 space-y-4">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Server className="w-5 h-5" />
                    <h3 className="text-base font-bold font-['Chakra_Petch'] text-white">
                      Floor 4: Cloud & Quantum Data Center
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Liquid-nitrogen immersion cooling tanks and optical backbones supporting multi-terabit low-latency routing across the entire metropolis, redundant power buses, and disaster-proof encrypted storage vaults.
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Immersion Temp</span>
                      <span className="text-blue-300 font-bold text-sm">-18°C Cryo-Loop</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Network Bandwidth</span>
                      <span className="text-cyan-300 font-bold text-sm">100 Tbps Terabit</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Uptime SLA</span>
                      <span className="text-emerald-300 font-bold text-sm">99.9999% Tier-5</span>
                    </div>
                  </div>
                </div>
              )}

              {/* FLOOR 4: Innovation Lab */}
              {selectedFloor === 4 && (
                <div className="p-6 rounded-xl bg-slate-900/70 border border-cyan-500/20 space-y-4">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="text-base font-bold font-['Chakra_Petch'] text-white">
                      Floor 5: Innovation & Robotics Pavilion
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Experimental proving grounds for next-generation automated drones, hover-craft navigation algorithms, cybernetic prosthetics prototyping, and clean fusion cell testing.
                  </p>
                </div>
              )}

              {/* FLOOR 5: Rooftop AI Command */}
              {selectedFloor === 5 && (
                <div className="p-6 rounded-xl bg-slate-900/70 border border-cyan-500/20 space-y-4">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Compass className="w-5 h-5" />
                    <h3 className="text-base font-bold font-['Chakra_Petch'] text-white">
                      Rooftop Level: AI Command & VTOL Helipad Deck
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    At 142 meters above ground level, the rooftop commands a 360-degree panoramic skyline view of Neon AI City, river bridges, and continental railway tracks. Features an automated VTOL aerocar helipad deck and primary high-power communications antenna array.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* OTHER BUILDING INTERIORS (Railway, Hospital, University, Mall) */}
          {buildingType === 'railway' && (
            <div className="space-y-4 p-6 rounded-xl bg-slate-900/70 border border-cyan-500/20">
              <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                Grand Central Maglev Concourse & Platforms
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The massive terminal concourse features a 40-meter curved glass ceiling, interactive holographic departure boards, and 4 parallel superconducting maglev tracks operating bullet express trains connecting continental nodes.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Track 1 & 2</span>
                  <span className="text-cyan-300 font-bold">Passenger Bullet Alpha</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Track 3 & 4</span>
                  <span className="text-amber-300 font-bold">Freight Heavy Maglev</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Daily Commuters</span>
                  <span className="text-emerald-300 font-bold">420,000 Passengers</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Turnaround Time</span>
                  <span className="text-cyan-300 font-bold">3.2 Minutes</span>
                </div>
              </div>
            </div>
          )}

          {buildingType === 'hospital' && (
            <div className="space-y-4 p-6 rounded-xl bg-slate-900/70 border border-cyan-500/20">
              <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                Neo-Genesis Smart Hospital & Trauma Pavilion
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                State-of-the-art 24/7 autonomous emergency center featuring 6 surgical robotics suites, automated rapid ambulance bays with priority signal routing, and rooftop helicopter/VTOL medical landing pad.
              </p>
              <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Emergency Readiness</span>
                  <span className="text-emerald-300 font-bold text-sm">100% Operational</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Ambulance Fleet</span>
                  <span className="text-cyan-300 font-bold text-sm">12 Cyber Units</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Trauma Response</span>
                  <span className="text-emerald-300 font-bold text-sm">&lt; 90 Seconds</span>
                </div>
              </div>
            </div>
          )}

          {buildingType === 'university' && (
            <div className="space-y-4 p-6 rounded-xl bg-slate-900/70 border border-cyan-500/20">
              <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                Neo-Metropolis Central University & Quantum Library
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Academic heart of the education biome. Features high-capacity lecture amphitheaters with live holographic projections, a digital archive housing billions of scientific documents, and student collaborative robotics labs.
              </p>
            </div>
          )}

          {buildingType === 'mall' && (
            <div className="space-y-4 p-6 rounded-xl bg-slate-900/70 border border-cyan-500/20">
              <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                Cyber-Pulse Megaplex Atrium & Retail Sky-Plaza
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                A multi-story shopping and entertainment megaplex with interactive holographic boutique storefronts, indoor cybernetic waterfalls, rooftop dining bistros, and zero-gravity arcade chambers.
              </p>
            </div>
          )}

          {buildingType === 'city-hall' && (
            <div className="space-y-4 p-6 rounded-xl bg-slate-900/70 border border-cyan-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                    Executive Municipal Biome
                  </span>
                  <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                    Neon Metropolis City Hall & Civic Council Chambers
                  </h3>
                </div>
                <div className="px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                  Autonomous Governance
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The central seat of urban administration where the autonomous City Manager AI coordinates with elected district commissioners. Houses the Central Citizen Registry, the Open Municipal Data Vault, and the High Civic Council amphitheater.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Legislative Chamber</span>
                  <span className="text-cyan-300 font-bold">120 Civic Delegates</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">AI Oversight Pod</span>
                  <span className="text-emerald-300 font-bold">Direct Grid Sync</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Citizen Services</span>
                  <span className="text-cyan-300 font-bold">24/7 Digital Concierge</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Public Petitions</span>
                  <span className="text-amber-300 font-bold">1,420 Active / Hour</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-cyan-500/20 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Explore and inspect detailed architectural specs of key city institutions</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition font-semibold"
          >
            Return to City View
          </button>
        </div>
      </div>
    </div>
  );
};
