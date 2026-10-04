/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CameraMode } from '../city/types';

interface ControlsGuideProps {
  cameraMode: CameraMode;
}

export const ControlsGuide: React.FC<ControlsGuideProps> = ({ cameraMode }) => {
  return (
    <div className="absolute left-6 bottom-6 z-20 pointer-events-auto">
      <div className="px-4 py-2.5 bg-slate-950/75 border border-white/10 rounded-lg backdrop-blur-md text-xs text-slate-300 font-mono flex items-center gap-4">
        {cameraMode === 'follow-vehicle' ? (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-cyan-300">Vehicle Chase Cam Active</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Click &apos;Follow Car&apos; to switch vehicle</span>
          </div>
        ) : cameraMode === 'follow-train' ? (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span className="text-blue-300">Maglev Train Tracking Cam</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Cruising along elevated superconducting line</span>
          </div>
        ) : cameraMode === 'first-person' ? (
          <>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-cyan-300 text-[11px]">W</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-cyan-300 text-[11px]">A</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-cyan-300 text-[11px]">S</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-cyan-300 text-[11px]">D</kbd>
              <span>Walk</span>
            </div>
            <span className="text-slate-600">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-cyan-400">Click & Drag</span>
              <span>Look Around</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <span className="text-cyan-400">Left Click</span>
              <span>Rotate</span>
            </div>
            <span className="text-slate-600">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-cyan-400">Right Click</span>
              <span>Pan</span>
            </div>
            <span className="text-slate-600">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-cyan-400">Scroll</span>
              <span>Zoom</span>
            </div>
            <span className="text-slate-600">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400">Click Building</span>
              <span>Inspect</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
