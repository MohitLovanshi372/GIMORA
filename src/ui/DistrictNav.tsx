/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DistrictId } from '../city/types';

export type NavDistrictId =
  | DistrictId
  | 'mohit-hub'
  | 'dubai'
  | 'singapore'
  | 'paris'
  | 'america';

interface DistrictNavProps {
  activeDistrict: NavDistrictId | null;
  onSelectDistrict: (districtId: DistrictId) => void;
  onSelectMohitHub: () => void;
  onSelectDubai?: () => void;
  onSelectSingapore?: () => void;
  onSelectParis?: () => void;
  onSelectAmerica?: () => void;
  onSelectAirport?: () => void;
  onSelectRailway?: () => void;
}

interface DistrictItem {
  id: NavDistrictId;
  label: string;
  badge?: string;
  isWorldMetropolis?: boolean;
  theme?: 'amber' | 'sky' | 'indigo' | 'rose' | 'emerald' | 'cyan';
}

const DISTRICTS: DistrictItem[] = [
  { id: 'dubai', label: 'Dubai', badge: '🇦🇪', theme: 'amber', isWorldMetropolis: true },
  { id: 'singapore', label: 'Singapore', badge: '🇸🇬', theme: 'sky', isWorldMetropolis: true },
  { id: 'paris', label: 'Paris', badge: '🇫🇷', theme: 'rose', isWorldMetropolis: true },
  { id: 'america', label: 'America', badge: '🇺🇸', theme: 'indigo', isWorldMetropolis: true },
  { id: 'airport', label: 'Airport', badge: '✈', theme: 'cyan' },
  { id: 'railway', label: 'Railway Hub', badge: '🚄', theme: 'cyan' },
  { id: 'mohit-hub', label: 'Mohit Dev Hub', badge: '★', theme: 'emerald' },
  { id: 'downtown', label: 'Downtown' },
  { id: 'technology', label: 'Technology' },
  { id: 'riverside', label: 'Riverside' },
  { id: 'education', label: 'Education' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'residential', label: 'Residential' },
  { id: 'entertainment', label: 'Entertainment' },
];

export const DistrictNav: React.FC<DistrictNavProps> = ({
  activeDistrict,
  onSelectDistrict,
  onSelectMohitHub,
  onSelectDubai,
  onSelectSingapore,
  onSelectParis,
  onSelectAmerica,
  onSelectAirport,
  onSelectRailway,
}) => {
  return (
    <nav className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/85 border border-white/10 rounded-lg backdrop-blur-md overflow-x-auto max-w-[62vw] shadow-lg shadow-black/40">
      <span className="text-[11px] font-mono font-semibold text-slate-400 mr-1.5 uppercase tracking-wider shrink-0">
        World Cities:
      </span>
      {DISTRICTS.map((item) => {
        const isActive = activeDistrict === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'dubai') {
                if (onSelectDubai) onSelectDubai();
                else onSelectDistrict('downtown');
              } else if (item.id === 'singapore') {
                if (onSelectSingapore) onSelectSingapore();
                else onSelectDistrict('riverside');
              } else if (item.id === 'paris') {
                if (onSelectParis) onSelectParis();
                else onSelectDistrict('entertainment');
              } else if (item.id === 'america') {
                if (onSelectAmerica) onSelectAmerica();
                else onSelectDistrict('downtown');
              } else if (item.id === 'airport') {
                if (onSelectAirport) onSelectAirport();
                else onSelectDistrict('airport');
              } else if (item.id === 'railway') {
                if (onSelectRailway) onSelectRailway();
                else onSelectDistrict('railway');
              } else if (item.id === 'mohit-hub') {
                onSelectMohitHub();
              } else {
                onSelectDistrict(item.id as DistrictId);
              }
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-all whitespace-nowrap shrink-0 flex items-center gap-1 ${
              item.isWorldMetropolis
                ? isActive
                  ? 'bg-gradient-to-r from-amber-500/30 to-amber-600/30 text-amber-200 border border-amber-400/90 shadow-sm shadow-amber-500/30 font-semibold'
                  : 'bg-slate-900/80 text-amber-300 hover:text-white border border-amber-500/30 hover:border-amber-400/60 hover:bg-slate-800'
                : item.badge
                ? isActive
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/90 shadow-sm shadow-cyan-500/30 font-semibold'
                  : 'bg-slate-900/70 text-slate-300 hover:text-white border border-white/10 hover:border-cyan-400/50'
                : isActive
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {item.badge && <span className="text-[13px]">{item.badge}</span>}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
