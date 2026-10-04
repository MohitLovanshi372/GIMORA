/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DistrictId } from '../city/types';

interface DistrictNavProps {
  activeDistrict: DistrictId | 'mohit-hub' | null;
  onSelectDistrict: (districtId: DistrictId) => void;
  onSelectMohitHub: () => void;
}

interface DistrictItem {
  id: DistrictId | 'mohit-hub';
  label: string;
  isLandmark?: boolean;
}

const DISTRICTS: DistrictItem[] = [
  { id: 'downtown', label: 'Downtown' },
  { id: 'technology', label: 'Technology' },
  { id: 'mohit-hub', label: 'Mohit Dev Hub', isLandmark: true },
  { id: 'education', label: 'Education' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'residential', label: 'Residential' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'industrial', label: 'Industrial' },
  { id: 'railway', label: 'Railway Hub' },
  { id: 'riverside', label: 'Riverside' },
];

export const DistrictNav: React.FC<DistrictNavProps> = ({
  activeDistrict,
  onSelectDistrict,
  onSelectMohitHub,
}) => {
  return (
    <nav className="hidden lg:flex items-center gap-1 px-3 py-1.5 bg-slate-950/75 border border-white/10 rounded-lg backdrop-blur-md overflow-x-auto max-w-[58vw]">
      <span className="text-xs font-mono text-slate-400 mr-2 uppercase tracking-wider shrink-0">
        Districts
      </span>
      {DISTRICTS.map((item) => {
        const isActive = activeDistrict === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'mohit-hub') {
                onSelectMohitHub();
              } else {
                onSelectDistrict(item.id as DistrictId);
              }
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-all whitespace-nowrap shrink-0 ${
              item.isLandmark
                ? isActive
                  ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/90 shadow-sm shadow-emerald-500/30'
                  : 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60'
                : isActive
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60'
                : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {item.isLandmark && <span className="mr-1 text-emerald-400">★</span>}
            {item.label}
          </button>
        );
      })}
    </nav>
  );
};
