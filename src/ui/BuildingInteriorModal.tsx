/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  X,
  Sparkles,
  Cpu,
  Server,
  Code,
  Compass,
  Briefcase,
  Monitor,
  ShoppingBag,
  Users,
  Tag,
  TrendingUp,
  Laptop,
  Presentation,
  GitBranch,
  GitPullRequest,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { MohitHubOffice3DView, OfficeCameraZone } from './MohitHubOffice3DView';

export type InteriorBuildingType =
  | 'mohit-hub'
  | 'corporate-office'
  | 'mall'
  | 'airport'
  | 'railway'
  | 'hospital'
  | 'university'
  | 'city-hall';

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
  const [selectedShopId, setSelectedShopId] = useState<string>('neobionix');
  const [mohitCameraZone, setMohitCameraZone] = useState<OfficeCameraZone>('overview');
  const [presentationSlide, setPresentationSlide] = useState<number>(0);
  const [mergedPrIds, setMergedPrIds] = useState<string[]>(['PR-426', 'PR-424']);

  const buildingTitles: Record<InteriorBuildingType, { name: string; subtitle: string; floorsCount: number }> = {
    'mohit-hub': {
      name: 'MOHIT DEVELOPER HUB',
      subtitle: 'CORPORATE EMPLOYEE OFFICE • LAPTOP/PC PODS • PRESENTATION ROOM • GITHUB AGENTS',
      floorsCount: 5,
    },
    'corporate-office': {
      name: 'APEX INTERNATIONAL FINANCIAL TOWER',
      subtitle: 'Global Investment Banking, Capital Markets & Executive Suites',
      floorsCount: 3,
    },
    railway: {
      name: 'METROPOLIS CENTRAL UNION STATION',
      subtitle: 'High-Speed Rail Concourse & Regional Transit Terminal',
      floorsCount: 3,
    },
    hospital: {
      name: 'METROPOLITAN GENERAL HOSPITAL & MEDICAL CENTER',
      subtitle: 'Emergency Pavilion, Surgical Suites & Diagnostic Research',
      floorsCount: 4,
    },
    university: {
      name: 'METROPOLIS UNIVERSITY & RESEARCH CAMPUS',
      subtitle: 'School of Engineering, Sciences & Academic Library Quad',
      floorsCount: 4,
    },
    mall: {
      name: 'GRAND METROPOLITAN SHOPPING GALLERIA',
      subtitle: '5 Premier Retail Boutiques, Dining Atrium & Customer Services',
      floorsCount: 3,
    },
    airport: {
      name: 'SKYPORT INTERNATIONAL AIRPORT TERMINAL',
      subtitle: 'Passenger Concourse, Air Traffic Logistics & International Gates',
      floorsCount: 3,
    },
    'city-hall': {
      name: 'METROPOLIS CIVIC CENTER & CITY HALL',
      subtitle: 'Municipal Council Chambers, Public Services & Urban Planning',
      floorsCount: 4,
    },
  };

  const currentInfo = buildingTitles[buildingType] || buildingTitles['corporate-office'];

  // Corporate Office Employees List
  const corporateEmployees = [
    {
      name: 'Aria Chen',
      id: 'EMP-1042',
      role: 'Chief AI Architect',
      dept: 'Core Neural Systems',
      status: 'Active',
      statusColor: 'emerald',
      task: 'Fine-tuning distributed swarm intelligence models across downtown nodes',
      avatar: 'AC',
    },
    {
      name: 'Marcus Vance',
      id: 'EMP-1089',
      role: 'Principal Systems SRE',
      dept: 'Infrastructure & Edge',
      status: 'In Meeting',
      statusColor: 'amber',
      task: 'Multi-datacenter optical bus auto-balancing review',
      avatar: 'MV',
    },
    {
      name: 'Elena Rostova',
      id: 'EMP-1104',
      role: 'Lead Quantum Cryptographer',
      dept: 'Data Security',
      status: 'Active',
      statusColor: 'emerald',
      task: 'Validating post-quantum encryption keys for banking transactions',
      avatar: 'ER',
    },
    {
      name: 'Devon Kincaid',
      id: 'EMP-1128',
      role: 'Product Strategy Director',
      dept: 'Autonomous Ventures',
      status: 'In Meeting',
      statusColor: 'amber',
      task: 'Quarterly roadmap sync with Metropolitan City Governance council',
      avatar: 'DK',
    },
    {
      name: 'Sora Takahashi',
      id: 'EMP-1156',
      role: 'Robotics Firmware Lead',
      dept: 'Hardware Engineering',
      status: 'Deep Focus',
      statusColor: 'cyan',
      task: 'Benchmarking collision avoidance firmware for aerocars and drones',
      avatar: 'ST',
    },
    {
      name: 'Maya Lin',
      id: 'EMP-1192',
      role: 'Senior Spatial UI/UX Lead',
      dept: 'Design Systems',
      status: 'Active',
      statusColor: 'emerald',
      task: 'Prototyping volumetric holographic dashboard telemetry for HUD',
      avatar: 'ML',
    },
    {
      name: 'Zackary Cross',
      id: 'EMP-1205',
      role: 'Chief Information Security Officer',
      dept: 'InfoSec Operations',
      status: 'Active',
      statusColor: 'emerald',
      task: 'Monitoring network security infrastructure and firewall clusters',
      avatar: 'ZC',
    },
    {
      name: 'Dr. Tariq Al-Mansoor',
      id: 'EMP-1230',
      role: 'Machine Learning Researcher',
      dept: 'Quantum AI Labs',
      status: 'Deep Focus',
      statusColor: 'cyan',
      task: 'Sparse transformer attention scaling for metropolitan weather forecast',
      avatar: 'TA',
    },
  ];

  // Mall Shops & Employees (Premier Contemporary Retail Galleria)
  const mallShops = [
    {
      id: 'neobionix',
      name: 'Apex Precision Optics & Camera Lab',
      category: 'Professional Photography & Imaging',
      tagline: 'High-End Mirrorless Cameras, Cinema Lenses & Studio Lighting',
      rating: '4.9 ★',
      badge: 'Authorized Pro Dealer',
      badgeColor: 'blue',
      items: [
        { name: 'Apex Prime 85mm f/1.2 Cinema Lens', price: '$2,450' },
        { name: 'Titanium Carbon Fiber Pro Tripod Kit', price: '$680' },
        { name: 'Studio Bi-Color LED Panel 300W', price: '$850' },
      ],
      employees: [
        { name: 'Cassian Drake', id: 'STAFF-4091', role: 'Chief Imaging Specialist', task: 'Calibrating medium-format sensor on client camera' },
        { name: 'Nia Sterling', id: 'STAFF-4092', role: 'Studio Lighting Consultant', task: 'Demonstrating softbox diffuser setups in testing bay' },
      ],
    },
    {
      id: 'nexus',
      name: 'Nexus Electronics & Computing Store',
      category: 'Computing, Mobile & Smart Audio',
      tagline: 'Workstation Laptops, Hi-Res Audio & Smart Workspace Tech',
      rating: '4.8 ★',
      badge: 'Official Store',
      badgeColor: 'blue',
      items: [
        { name: 'Nexus ProBook Studio 16" (OLED 120Hz)', price: '$2,800' },
        { name: 'Planar Magnetic Studio Headphones', price: '$750' },
        { name: 'Thunderbolt 4 Enterprise Docking Station', price: '$340' },
      ],
      employees: [
        { name: 'Kenji Sato', id: 'STAFF-5104', role: 'Solutions Architect', task: 'Setting up dual 4K workstation displays for architect client' },
        { name: 'Lila Moreno', id: 'STAFF-5105', role: 'Customer Experience Lead', task: 'Configuring color-accurate monitor profiles' },
      ],
    },
    {
      id: 'chroma',
      name: 'Atelier Moderne Luxury Fashion & Apparel',
      category: 'Contemporary Designer Apparel & Footwear',
      tagline: 'Italian Wool Overcoats, Bespoke Tailoring & Fine Leather',
      rating: '4.9 ★',
      badge: 'Haute Horlogerie',
      badgeColor: 'amber',
      items: [
        { name: 'Cashmere-Blend Tailored Overcoat', price: '$1,650' },
        { name: 'Handcrafted Tuscan Leather Chelsea Boots', price: '$580' },
        { name: 'Minimalist Titanium Automatic Chronograph', price: '$2,400' },
      ],
      employees: [
        { name: 'Valentina Rossi', id: 'STAFF-3210', role: 'Lead Fashion Stylist', task: 'Arranging the autumn luxury collection showcase' },
        { name: 'Dexter Cole', id: 'STAFF-3211', role: 'Bespoke Tailoring Associate', task: 'Taking measurements for custom two-piece wool suit' },
      ],
    },
    {
      id: 'ramen',
      name: 'Artisan Espresso Bar & Specialty Bistro',
      category: 'Gourmet Specialty Coffee & Patisserie',
      tagline: 'Single-Origin Ethiopian Pour-Overs & Fresh Bakery Delights',
      rating: '5.0 ★',
      badge: 'Award Winner',
      badgeColor: 'amber',
      items: [
        { name: 'Signature Hand-Poured Geisha Pour-Over', price: '$9.50' },
        { name: 'Avocado & Smoked Salmon Brioche Toast', price: '$14.00' },
        { name: 'Valrhona Dark Chocolate Hazelnut Croissant', price: '$6.50' },
      ],
      employees: [
        { name: 'Hiroshi Tanaka', id: 'STAFF-8120', role: 'Head Roaster & Barista Champion', task: 'Profiling micro-lot roast batches on cast-iron roaster' },
        { name: 'Claire Dubois', id: 'STAFF-8121', role: 'Pastry Chef', task: 'Laminating butter layers for artisanal morning croissants' },
      ],
    },
    {
      id: 'skyforge',
      name: 'Skyline Travel Goods & Drone Studio',
      category: 'Luggage, Travel Essentials & Imaging Drones',
      tagline: 'Anodized Aluminum Carry-Ons & 4K Foldable Drones',
      rating: '4.7 ★',
      badge: 'Verified Dealer',
      badgeColor: 'emerald',
      items: [
        { name: 'Aviation Anodized Aluminum Carry-On', price: '$720' },
        { name: 'Falcon 4K HDR Foldable Travel Drone', price: '$1,150' },
        { name: 'Weather-Resistant Ballistic Nylon Backpack', price: '$260' },
      ],
      employees: [
        { name: 'Tyler Reed', id: 'STAFF-6240', role: 'Aviation Tech Specialist', task: 'Demonstrating gimbal stabilization and obstacle avoidance' },
        { name: 'Zoe Brooks', id: 'STAFF-6241', role: 'Travel Gear Specialist', task: 'Assisting passenger with TSA-compliant luggage sizing' },
      ],
    },
  ];

  const currentShop = mallShops.find((s) => s.id === selectedShopId) || mallShops[0];

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
              {(
                [
                  'mohit-hub',
                  'corporate-office',
                  'mall',
                  'airport',
                  'railway',
                  'hospital',
                  'university',
                  'city-hall',
                ] as const
              ).map((b) => (
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
                  {b === 'mohit-hub'
                    ? 'Mohit Hub'
                    : b === 'corporate-office'
                    ? 'Corporate HQ'
                    : b === 'mall'
                    ? 'Mall'
                    : b === 'airport'
                    ? 'Airport'
                    : b === 'city-hall'
                    ? 'City Hall'
                    : b.toUpperCase()}
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
          {/* CORPORATE OFFICE INTERIOR */}
          {buildingType === 'corporate-office' && (
            <div className="space-y-6">
              {/* Floor Tabs */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/90 rounded-xl border border-cyan-500/20 text-xs font-mono">
                {[
                  { floor: 0, label: 'L42: Collaborative Engineering Pods & Desks' },
                  { floor: 1, label: 'L48: Executive Boardroom & Holo-Suite' },
                  { floor: 2, label: 'L52: Neural Trading & Financial Intelligence' },
                ].map((item) => (
                  <button
                    key={item.floor}
                    onClick={() => setSelectedFloor(item.floor)}
                    className={`px-3 py-1.5 rounded-lg transition font-medium ${
                      selectedFloor === item.floor
                        ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* FLOOR 0: Open Collaborative Tech Floor with Live Employees */}
              {selectedFloor === 0 && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-cyan-400 mb-1">
                        <Monitor className="w-4 h-4" />
                        <h3 className="text-base font-bold font-['Chakra_Petch'] text-white">
                          Level 42: Open Engineering Pods & Collaborative Desks
                        </h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        High-efficiency open-plan corporate workspace featuring 240 dual-monitor ergonomic workstations, floor-to-ceiling panoramic glass facing the city skyline, collaborative huddle pods, and high-bandwidth optical interconnects.
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center font-mono">
                        <span className="text-[10px] text-slate-400 block">Occupancy</span>
                        <span className="text-emerald-400 font-bold text-sm">96% (240/250)</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center font-mono">
                        <span className="text-[10px] text-slate-400 block">Bandwidth</span>
                        <span className="text-cyan-400 font-bold text-sm">100 Gbps</span>
                      </div>
                    </div>
                  </div>

                  {/* Employees On Duty Roster */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span className="font-semibold text-white">Active Corporate Personnel on Floor:</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">8 Senior Technologists Live</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {corporateEmployees.map((emp) => (
                        <div
                          key={emp.id}
                          className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition flex items-start gap-3"
                        >
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600/30 to-blue-600/40 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-xs text-cyan-300">
                              {emp.avatar}
                            </div>
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${
                                emp.statusColor === 'emerald'
                                  ? 'bg-emerald-400'
                                  : emp.statusColor === 'amber'
                                  ? 'bg-amber-400'
                                  : 'bg-cyan-400'
                              }`}
                            />
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-bold text-slate-100 truncate">{emp.name}</h4>
                              <span className="text-[10px] font-mono text-slate-500">{emp.id}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-cyan-400 truncate">{emp.role}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                  emp.statusColor === 'emerald'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : emp.statusColor === 'amber'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                }`}
                              >
                                {emp.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-tight truncate">
                              ⚡ {emp.task}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* FLOOR 1: Executive Boardroom */}
              {selectedFloor === 1 && (
                <div className="p-6 rounded-xl bg-slate-900/70 border border-cyan-500/20 space-y-4">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Briefcase className="w-5 h-5" />
                    <h3 className="text-base font-bold font-['Chakra_Petch'] text-white">
                      Level 48: Executive Boardroom & Strategy Suite
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A grand 24-seat conference suite encased in smart acoustic privacy glass. Features a centerpiece digital architectural model of Metropolis Central displaying real-time traffic flux, power distribution, and commercial metrics for executive review.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Current Session</span>
                      <span className="text-cyan-300 font-bold text-xs">Metropolitan Cloud Scaling</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Security Clearance</span>
                      <span className="text-emerald-300 font-bold text-xs">Level 5 Biometric</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Remote Telepresence</span>
                      <span className="text-purple-300 font-bold text-xs">6 Encrypted Holo-Feeds</span>
                    </div>
                  </div>
                </div>
              )}

              {/* FLOOR 2: Neural Trading Floor */}
              {selectedFloor === 2 && (
                <div className="p-6 rounded-xl bg-slate-900/70 border border-cyan-500/20 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                    <h3 className="text-base font-bold font-['Chakra_Petch'] text-white">
                      Level 52: Neural Computation & Financial Trading Floor
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Multi-tier trading pits executing high-frequency autonomous algorithms across global commodity and energy markets. Surrounded by a 360-degree LED stock ticker ribbon and sub-millisecond execution engines.
                  </p>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-cyan-400 font-bold">METRO-TECH $842.50 (+4.8%)</span>
                    <span className="text-emerald-400 font-bold">QUANTUM-SYS $1,240.10 (+8.2%)</span>
                    <span className="text-blue-400 font-bold">URBAN-TRANSIT $420.30 (+1.9%)</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* METROPOLITAN GALLERIA MALL INTERIOR */}
          {buildingType === 'mall' && (
            <div className="space-y-6">
              {/* Floor Tabs */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/90 rounded-xl border border-cyan-500/20 text-xs font-mono">
                {[
                  { floor: 0, label: 'L1: Ground Retail Promenade (5 Boutiques)' },
                  { floor: 1, label: 'L2: Zero-G Arcade & VR Mezzanine' },
                  { floor: 2, label: 'L3: Celestial Rooftop Sky-Bistro' },
                ].map((item) => (
                  <button
                    key={item.floor}
                    onClick={() => setSelectedFloor(item.floor)}
                    className={`px-3 py-1.5 rounded-lg transition font-medium ${
                      selectedFloor === item.floor
                        ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* FLOOR 0: Retail Promenade with 5 Distinct Shops */}
              {selectedFloor === 0 && (
                <div className="space-y-5">
                  {/* Mall Telemetry Banner */}
                  <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-cyan-400 mb-1">
                        <ShoppingBag className="w-4 h-4" />
                        <h3 className="text-base font-bold font-['Chakra_Petch'] text-white">
                          Grand Metropolitan Shopping Galleria: Retail Directory
                        </h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        A multi-level premier shopping galleria showcasing flagship luxury boutiques for professional photography, workstation computing, designer fashion, specialty artisan coffee, and travel goods.
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center font-mono">
                        <span className="text-[10px] text-slate-400 block">Live Visitors</span>
                        <span className="text-emerald-400 font-bold text-sm">1,420 Shoppers</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center font-mono">
                        <span className="text-[10px] text-slate-400 block">Retail Staff</span>
                        <span className="text-cyan-400 font-bold text-sm">48 On Duty</span>
                      </div>
                    </div>
                  </div>

                  {/* Shop Selector Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {mallShops.map((shop) => (
                      <button
                        key={shop.id}
                        onClick={() => setSelectedShopId(shop.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-mono transition text-left flex items-center gap-2 border ${
                          selectedShopId === shop.id
                            ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/50 shadow-sm shadow-cyan-500/20 font-bold'
                            : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <Tag className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{shop.name.split('&')[0]}</span>
                      </button>
                    ))}
                  </div>

                  {/* Active Shop Details Card */}
                  <div className="p-5 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold font-['Chakra_Petch'] text-cyan-300">
                            {currentShop.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                            {currentShop.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{currentShop.tagline}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400 font-mono">{currentShop.rating}</span>
                        <span className="text-xs text-slate-500 font-mono">• {currentShop.category}</span>
                      </div>
                    </div>

                    {/* Featured Shop Catalog */}
                    <div>
                      <h5 className="text-xs font-mono font-semibold text-slate-300 mb-2">Featured Products Catalog:</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {currentShop.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                          >
                            <span className="text-xs text-slate-200 truncate pr-2">{item.name}</span>
                            <span className="text-xs font-bold font-mono text-emerald-400 whitespace-nowrap">
                              {item.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Staff On Duty for this Shop */}
                    <div>
                      <h5 className="text-xs font-mono font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Assigned Shop Employees on Shift:</span>
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {currentShop.employees.map((emp, eIdx) => (
                          <div
                            key={eIdx}
                            className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5"
                          >
                            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-xs text-cyan-300 shrink-0">
                              {emp.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white truncate">{emp.name}</span>
                                <span className="text-[10px] font-mono text-slate-500">{emp.id}</span>
                              </div>
                              <span className="text-[11px] font-mono text-cyan-400 block">{emp.role}</span>
                              <span className="text-[11px] text-slate-400 block mt-0.5 leading-tight">
                                🛠 Current Task: {emp.task}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FLOOR 1: Zero-G Arcade */}
              {selectedFloor === 1 && (
                <div className="p-6 rounded-xl bg-slate-900/70 border border-cyan-500/20 space-y-4">
                  <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                    Level 2: Zero-Gravity VR Arcade & Holographic Arena
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Featuring 16 magnetic suspension battle pods, 360-degree holographic music dance floors, retro-synth coin-op cabinets, and competitive esports leagues with 240 live spectators.
                  </p>
                </div>
              )}

              {/* FLOOR 2: Sky Bistro */}
              {selectedFloor === 2 && (
                <div className="p-6 rounded-xl bg-slate-900/70 border border-cyan-500/20 space-y-4">
                  <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                    Level 3: Celestial Rooftop Sky-Bistro & Terrace
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Open-air cocktail lounges, cantilevered glass dining balconies extending over the central boulevard, and live ambient synth performances overlooking the river bridges.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* MOHIT DEVELOPER HUB INTERIOR: REAL 3D CORPORATE OFFICE, LAPTOPS/PCs, PRESENTATION ROOM & GITHUB AGENTS */}
          {buildingType === 'mohit-hub' && (
            <div className="space-y-5">
              {/* Interactive 3D Walkthrough Viewport of the Corporate Employee Office Under Tower */}
              <MohitHubOffice3DView
                activeZone={mohitCameraZone}
                onZoneChange={(zone) => {
                  setMohitCameraZone(zone);
                  if (zone === 'workstations') setSelectedFloor(0);
                  else if (zone === 'presentation') setSelectedFloor(1);
                  else if (zone === 'github-agents') setSelectedFloor(2);
                }}
                slideIndex={presentationSlide}
                onNextSlide={() => setPresentationSlide((prev) => (prev + 1) % 4)}
              />

              {/* Floor & Room Selection Tabs */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/90 rounded-xl border border-cyan-500/20 text-xs font-mono">
                {[
                  { floor: 0, zone: 'workstations' as OfficeCameraZone, label: 'L1: Corporate Office & Laptop/PC Desks' },
                  { floor: 1, zone: 'presentation' as OfficeCameraZone, label: 'L2: Presentation Room & Projector' },
                  { floor: 2, zone: 'github-agents' as OfficeCameraZone, label: 'L3: GitHub Project Work & Agents' },
                  { floor: 3, zone: 'overview' as OfficeCameraZone, label: 'L4: Server Core & Rooftop Helipad' },
                ].map((item) => (
                  <button
                    key={item.floor}
                    onClick={() => {
                      setSelectedFloor(item.floor);
                      setMohitCameraZone(item.zone);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition font-medium ${
                      selectedFloor === item.floor
                        ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* TAB 0: CORPORATE EMPLOYEE OFFICE & LAPTOP / DUAL-PC WORKSTATIONS */}
              {selectedFloor === 0 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900/75 border border-cyan-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-cyan-400 mb-1">
                        <Laptop className="w-4 h-4" />
                        <h3 className="text-base font-bold font-['Chakra_Petch'] text-white">
                          Under-Tower Corporate Employee Office & Laptop/PC Workstations
                        </h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        Located directly inside the crystal-clear glass lower floors of the Mohit Developer Hub tower. Every engineer desk features an open aluminum developer laptop paired with dual curved 4K PC monitors, an RGB liquid-cooled desktop workstation tower, and direct optical GitHub Enterprise links.
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0 font-mono">
                      <div className="px-3 py-1.5 rounded-lg bg-slate-950/85 border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block">Workstations</span>
                        <span className="text-emerald-400 font-bold text-xs">Laptop + Dual 4K PC</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-slate-950/85 border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block">Active Staff</span>
                        <span className="text-cyan-400 font-bold text-xs">120 On Floor</span>
                      </div>
                    </div>
                  </div>

                  {/* Workstation Desk Roster */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      {
                        desk: 'DESK POD A-01',
                        name: 'Mohit Lovanshi',
                        role: 'Founder & Principal Systems Architect',
                        rig: 'MacBook Pro M4 Max + Dual 32" 8K PC Tower',
                        ideFile: 'src/city/AutonomousAgentCore.ts',
                        branch: 'feat/multi-agent-office',
                        agentPair: '@mohit-arch-agent',
                      },
                      {
                        desk: 'DESK POD A-02',
                        name: 'Aria Chen',
                        role: 'Staff AI & Neural Graphics Engineer',
                        rig: 'ThinkPad X1 Carbon + Dual Curved 4K RTX-5090 PC',
                        ideFile: 'src/transportation/TrafficManager.ts',
                        branch: 'feat/3d-signal-gantries',
                        agentPair: '@mohit-vision-agent',
                      },
                      {
                        desk: 'DESK POD B-01',
                        name: 'Marcus Vance',
                        role: 'Principal Cloud & Kubernetes SRE',
                        rig: 'ProBook Studio Laptop + Triple-Monitor Linux PC',
                        ideFile: 'infra/github-actions-runner.yaml',
                        branch: 'ops/zero-latency-ci',
                        agentPair: '@mohit-ci-sentinel',
                      },
                      {
                        desk: 'DESK POD B-02',
                        name: 'Elena Rostova',
                        role: 'Lead Security & Cryptography Engineer',
                        rig: 'Aluminum DevBook 16" + Dual 4K Hardened PC',
                        ideFile: 'security/PostQuantumAuth.ts',
                        branch: 'sec/zero-trust-audit',
                        agentPair: '@mohit-sec-auditor',
                      },
                    ].map((wk) => (
                      <div
                        key={wk.desk}
                        className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-bold">
                              {wk.desk}
                            </span>
                            <span className="text-xs font-bold text-white">{wk.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            ● Coding Live
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-cyan-400">{wk.role}</p>
                        <div className="text-[11px] font-mono text-slate-300 bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Hardware:</span>
                            <span className="text-slate-200">{wk.rig}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">IDE Buffer:</span>
                            <span className="text-amber-300">{wk.ideFile}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Git Branch & Agent:</span>
                            <span className="text-emerald-300">
                              {wk.branch} • {wk.agentPair}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 1: EXECUTIVE PRESENTATION & ARCHITECTURE REVIEW ROOM */}
              {selectedFloor === 1 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900/75 border border-cyan-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-cyan-400 mb-1">
                        <Presentation className="w-4 h-4" />
                        <h3 className="text-base font-bold font-['Chakra_Petch'] text-white">
                          Level 2: Glass-Enclosed Presentation & Architecture Review Room
                        </h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        Features a 16:9 ultra-bright wall projector screen, speaker podium with presenter laptop, and a 10-meter walnut executive conference table where 8 seated engineers review sprint demos with open laptops. Click any slide below to project it onto the 3D Presentation Screen above!
                      </p>
                    </div>
                    <button
                      onClick={() => setPresentationSlide((prev) => (prev + 1) % 4)}
                      className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 text-xs font-mono font-bold shrink-0 transition"
                    >
                      Next Projector Slide ({(presentationSlide % 4) + 1}/4) →
                    </button>
                  </div>

                  {/* Interactive Slide Selector Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        idx: 0,
                        title: 'Slide 01: Autonomous GitHub Agent Workflow',
                        speaker: 'Mohit Lovanshi (Lead Presenter at Podium)',
                        summary: '96% automated PR code review coverage with 38 active coding & testing agents.',
                      },
                      {
                        idx: 1,
                        title: 'Slide 02: Metropolis Smart Traffic & Signal AI',
                        speaker: 'Aria Chen (Traffic Systems Lead)',
                        summary: '100% red/yellow signal compliance, all-red safety clearance, and multi-lane pathfinding.',
                      },
                      {
                        idx: 2,
                        title: 'Slide 03: Sub-Zero Quantum Server Cluster',
                        speaker: 'Marcus Vance (Principal Cloud SRE)',
                        summary: '32.8 MW geothermal compute core operating at 1.06 PUE efficiency & 1.2ms latency.',
                      },
                      {
                        idx: 3,
                        title: 'Slide 04: Q4 Spatial Computing & Open-Source',
                        speaker: 'Devon Kincaid (VP Product Strategy)',
                        summary: '4,820 active repositories and real-time 3D building interior digital twin telemetry.',
                      },
                    ].map((sl) => (
                      <button
                        key={sl.idx}
                        onClick={() => {
                          setPresentationSlide(sl.idx);
                          setMohitCameraZone('presentation');
                        }}
                        className={`p-3.5 rounded-xl border text-left transition space-y-1.5 ${
                          presentationSlide % 4 === sl.idx
                            ? 'bg-cyan-500/20 border-cyan-400/60 shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-cyan-300 font-['Chakra_Petch']">{sl.title}</span>
                          {presentationSlide % 4 === sl.idx && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                              ON SCREEN
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-amber-300">Presenter: {sl.speaker}</p>
                        <p className="text-[11px] text-slate-300 leading-snug">{sl.summary}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: GITHUB PROJECT WORK & AUTONOMOUS CODING AGENTS */}
              {selectedFloor === 2 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900/75 border border-cyan-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-400 mb-1">
                        <GitBranch className="w-4 h-4" />
                        <h3 className="text-base font-bold font-['Chakra_Petch'] text-white">
                          github.com / mohit-developer-hub / metropolis-autonomous-core
                        </h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        Live GitHub Enterprise War-Room where human engineers collaborate with autonomous AI coding agents to review Pull Requests, run CI/CD test suites, and deploy city-wide updates.
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0 font-mono">
                      <div className="px-3 py-1.5 rounded-lg bg-slate-950/85 border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block">Commits (Main)</span>
                        <span className="text-emerald-400 font-bold text-xs">14,820+</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-slate-950/85 border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block">AI Agents</span>
                        <span className="text-cyan-400 font-bold text-xs">38 Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Autonomous GitHub Agents & Pull Requests Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Left: Pull Requests with Interactive Merge */}
                    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-mono text-cyan-300 font-bold">
                        <span className="flex items-center gap-1.5">
                          <GitPullRequest className="w-4 h-4" />
                          ACTIVE PULL REQUESTS
                        </span>
                        <span className="text-[10px] text-emerald-400">CI/CD: 1,420/1,420 Passing</span>
                      </div>
                      {[
                        {
                          id: 'PR-429',
                          title: 'feat(hub): 3D Corporate Office, Laptops/PCs & Presentation Room',
                          author: 'mohitlovanshi92 + @mohit-codegen-agent',
                        },
                        {
                          id: 'PR-428',
                          title: 'feat(traffic): Multi-lane signal gantries & all-red safety phase',
                          author: 'aria-chen + @mohit-pr-reviewer',
                        },
                        {
                          id: 'PR-426',
                          title: 'feat(buildings): 10 exterior architectural archetypes & crowns',
                          author: 'marcus-vance + @mohit-ci-sentinel',
                        },
                      ].map((pr) => {
                        const isMerged = mergedPrIds.includes(pr.id);
                        return (
                          <div
                            key={pr.id}
                            className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/90 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold text-cyan-400">{pr.id}</span>
                                <span className="text-xs font-semibold text-white truncate">{pr.title}</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{pr.author}</span>
                            </div>
                            <button
                              onClick={() => {
                                if (!isMerged) setMergedPrIds((prev) => [...prev, pr.id]);
                              }}
                              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold shrink-0 transition ${
                                isMerged
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                  : 'bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/40'
                              }`}
                            >
                              {isMerged ? '✓ MERGED' : 'Merge PR'}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right: Autonomous Coding Agents Roster */}
                    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-mono text-emerald-300 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Terminal className="w-4 h-4" />
                          AUTONOMOUS GITHUB CODING AGENTS
                        </span>
                        <span className="text-[10px] text-cyan-400">Swarm Sync: 100%</span>
                      </div>
                      {[
                        {
                          handle: '@mohit-codegen-agent',
                          role: 'Autonomous TypeScript & Three.js Synthesizer',
                          task: 'Generating procedural PBR geometries & shader uniforms on branch feat/office-3d',
                        },
                        {
                          handle: '@mohit-pr-reviewer',
                          role: 'Automated AST & Architecture Reviewer',
                          task: 'Verified zero memory leaks and 60 FPS instanced draw call budgets on PR #429',
                        },
                        {
                          handle: '@mohit-ci-sentinel',
                          role: 'Continuous Integration & Build Runner',
                          task: 'Running parallel Vite production bundle verification & typechecking',
                        },
                      ].map((ag) => (
                        <div
                          key={ag.handle}
                          className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/90 space-y-0.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-emerald-400">{ag.handle}</span>
                            <span className="text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 block">{ag.role}</span>
                          <p className="text-[11px] text-slate-300 leading-tight">{ag.task}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SERVER CORE & ROOFTOP HELIPAD */}
              {selectedFloor === 3 && (
                <div className="p-5 rounded-xl bg-slate-900/75 border border-cyan-500/25 space-y-3">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Server className="w-5 h-5" />
                    <h3 className="text-base font-bold font-['Chakra_Petch'] text-white">
                      Upper Tower: Sub-Zero Quantum Data Center & Rooftop VTOL Helipad
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Above the 3-level Corporate Office, Presentation Room, and GitHub War-Room, the upper tower houses liquid-cooled optical server racks (Floors 9–18) and the 142m Rooftop Aviation Helipad & AI Command Dome.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SKYPORT METRO AIRPORT TERMINAL INTERIOR */}
          {buildingType === 'airport' && (
            <div className="space-y-6">
              {/* Floor Tabs */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/90 rounded-xl border border-cyan-500/20 text-xs font-mono">
                {[
                  { floor: 0, label: 'L1: Sub-Orbital Flight Gates & Departure Lounge' },
                  { floor: 1, label: 'L2: First-Class Celestial Sky-Lounge & Duty Free' },
                  { floor: 2, label: 'L3: Air Traffic Control & Radar Operations' },
                ].map((item) => (
                  <button
                    key={item.floor}
                    onClick={() => setSelectedFloor(item.floor)}
                    className={`px-3 py-1.5 rounded-lg transition font-medium ${
                      selectedFloor === item.floor
                        ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {selectedFloor === 0 && (
                <div className="space-y-4 p-6 rounded-xl bg-slate-900/70 border border-cyan-500/20">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                        Sub-Orbital Boarding Concourse & Live Departure Gates
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        High-speed sub-orbital shuttles and regional VTOL aerocars with biometric fast boarding.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
                        Airspace Clear (Runway 09L/27R)
                      </span>
                    </div>
                  </div>

                  {/* Flight Departures Board */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono text-left">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                          <th className="pb-2">Flight</th>
                          <th className="pb-2">Destination</th>
                          <th className="pb-2">Gate</th>
                          <th className="pb-2">Vessel</th>
                          <th className="pb-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        <tr>
                          <td className="py-2.5 font-bold text-cyan-400">SKY-402</td>
                          <td>Tokyo Haneda International</td>
                          <td>Gate 01</td>
                          <td>Boeing 787-9 Dreamliner</td>
                          <td><span className="text-emerald-400 font-semibold">BOARDING</span></td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold text-cyan-400">LON-914</td>
                          <td>London Heathrow Airport</td>
                          <td>Gate 03</td>
                          <td>Airbus A350-1000</td>
                          <td><span className="text-cyan-400 font-semibold">ON SCHEDULE</span></td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold text-cyan-400">EUR-208</td>
                          <td>Frankfurt International</td>
                          <td>Gate 02</td>
                          <td>Boeing 777-300ER</td>
                          <td><span className="text-amber-400 font-semibold">FINAL CALL</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Flight Crew On Shift */}
                  <div className="pt-2">
                    <h4 className="text-xs font-mono font-semibold text-slate-300 mb-2">Active Flight Personnel on Shift:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-300">
                          CP
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">Capt. Elena Rostov</span>
                            <span className="text-[10px] text-slate-500">PILOT-802</span>
                          </div>
                          <span className="text-cyan-400 text-[11px] block">Chief Sub-Orbital Commander</span>
                          <span className="text-slate-400 text-[11px] block mt-0.5">Pre-flight checks for Mach-4.2 departure to Neo-Tokyo</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center font-bold text-blue-300">
                          TC
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">Dante Vance</span>
                            <span className="text-[10px] text-slate-500">ATC-109</span>
                          </div>
                          <span className="text-blue-400 text-[11px] block">Lead Radar Controller</span>
                          <span className="text-slate-400 text-[11px] block mt-0.5">Sequencing supersonic approach vector on Runway 09L</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedFloor === 1 && (
                <div className="space-y-4 p-6 rounded-xl bg-slate-900/70 border border-cyan-500/20">
                  <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                    First-Class Celestial Sky-Lounge & Duty-Free
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Panoramic zero-gravity observation deck looking over the illuminated 320m runway and mountain horizon. Features acoustic relaxation pods, priority sub-orbital customs clearance, and duty-free chronometer boutiques.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Aero-Lounge Capacity</span>
                      <span className="text-cyan-300 font-bold">240 VIP Passengers</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Duty-Free Boutique</span>
                      <span className="text-emerald-300 font-bold">Quantum Chronometers</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Fast-Track Biometrics</span>
                      <span className="text-purple-300 font-bold">&lt; 15 sec Clearance</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedFloor === 2 && (
                <div className="space-y-4 p-6 rounded-xl bg-slate-900/70 border border-cyan-500/20">
                  <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                    Level 3: Air Traffic Control Radar Operations Hub
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Surrounded by 360-degree glass overlooking the flight apron and the entire metropolis. Real-time telemetry coordinates automated arrival strobes, sub-orbital trajectories, and drone delivery flight corridors across all districts.
                  </p>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-cyan-400 font-bold">AIRSPACE SECTOR 4: GREEN</span>
                    <span className="text-emerald-400 font-bold">WIND: 12 KNOTS HEADWIND (270°)</span>
                    <span className="text-blue-400 font-bold">RADAR SWEEP: 360° REFRESH 0.8s</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* OTHER BUILDING INTERIORS (Railway, Hospital, University, City Hall) */}
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
            </div>
          )}

          {buildingType === 'university' && (
            <div className="space-y-4 p-6 rounded-xl bg-slate-900/70 border border-cyan-500/20">
              <h3 className="text-base font-bold text-white font-['Chakra_Petch']">
                Neo-Metropolis Central University & Quantum Labs
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Academic heart of the education biome. Features high-capacity lecture amphitheaters with live holographic projections, a digital archive housing billions of scientific documents, and student collaborative robotics labs.
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
                    Metropolis City Hall & Civic Council Chambers
                  </h3>
                </div>
                <div className="px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                  Autonomous Governance
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The central seat of urban administration where the autonomous City Manager AI coordinates with elected district commissioners. Houses the Central Citizen Registry, the Open Municipal Data Vault, and the High Civic Council amphitheater.
              </p>
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
