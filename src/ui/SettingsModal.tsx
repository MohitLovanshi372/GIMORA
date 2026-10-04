/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  Save,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Sparkles,
  Shield,
  Layers,
  Monitor,
  X,
} from 'lucide-react';
import { AudioManager } from '../services/AudioManager';
import { SaveManager, GameSaveData } from '../services/SaveManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyLoadedSave?: (saveData: GameSaveData) => void;
  getCurrentStateForSave?: () => Partial<GameSaveData>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onApplyLoadedSave,
  getCurrentStateForSave,
}) => {
  const [isMuted, setIsMuted] = useState(AudioManager.getIsMuted());
  const [saveStatusMsg, setSaveStatusMsg] = useState<string | null>(null);
  const [highShadows, setHighShadows] = useState(true);
  const [wetReflections, setWetReflections] = useState(true);

  if (!isOpen) return null;

  const handleToggleAudio = () => {
    const muted = AudioManager.toggleMute();
    setIsMuted(muted);
    AudioManager.playUiClick();
  };

  const handleSaveGame = () => {
    const currentState = getCurrentStateForSave ? getCurrentStateForSave() : {};
    const success = SaveManager.saveGame({
      ...currentState,
      settings: {
        audioMuted: isMuted,
        trafficDensity: 'HIGH',
        highQualityShadows: highShadows,
        bloomEnabled: wetReflections,
      },
    });

    if (success) {
      AudioManager.playUiConfirm();
      setSaveStatusMsg('Simulation state saved to local storage!');
      setTimeout(() => setSaveStatusMsg(null), 3000);
    }
  };

  const handleLoadGame = () => {
    const save = SaveManager.loadGame();
    if (save) {
      AudioManager.playUiConfirm();
      if (onApplyLoadedSave) {
        onApplyLoadedSave(save);
      }
      setIsMuted(save.settings.audioMuted);
      setSaveStatusMsg('Loaded saved simulation state successfully!');
      setTimeout(() => setSaveStatusMsg(null), 3000);
    } else {
      setSaveStatusMsg('No existing local save file found.');
      setTimeout(() => setSaveStatusMsg(null), 3000);
    }
  };

  const handleClearSave = () => {
    SaveManager.clearSave();
    AudioManager.playUiClick();
    setSaveStatusMsg('Saved data cleared.');
    setTimeout(() => setSaveStatusMsg(null), 3000);
  };

  return (
    <div
      role="dialog"
      aria-label="Simulation Settings & Save Management"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md font-['Plus_Jakarta_Sans'] text-slate-100"
    >
      <div className="relative w-full max-w-xl bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/80 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/50 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-['Chakra_Petch'] text-cyan-300 tracking-wider">
                  SYSTEM SETTINGS & LOCAL STORAGE
                </h2>
                <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                  Client Runtime
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Procedural audio synthesizer, graphics fidelity, and local state persistence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Audio Section */}
          <div className="space-y-3">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block font-semibold">
              Procedural Audio Engine (Web Audio API)
            </span>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-mono">Master Audio Output</h4>
                  <p className="text-[11px] text-slate-400">Ambient city drone, traffic whoosh, maglev chime, and emergency sirens</p>
                </div>
              </div>

              <button
                onClick={handleToggleAudio}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-mono font-bold transition ${
                  isMuted
                    ? 'bg-slate-800 text-slate-400 border border-slate-700'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                }`}
              >
                {isMuted ? 'UNMUTE AUDIO' : 'MUTED'}
              </button>
            </div>
          </div>

          {/* Rendering Quality */}
          <div className="space-y-3">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block font-semibold">
              Graphics & Post-Processing Fidelity
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div
                onClick={() => setHighShadows(!highShadows)}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  highShadows
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">PCF Soft Shadows</span>
                  <CheckCircle2 className={`w-4 h-4 ${highShadows ? 'text-cyan-400' : 'text-slate-600'}`} />
                </div>
                <p className="text-[11px] text-slate-400">Dynamic building & vehicle shadow mapping</p>
              </div>

              <div
                onClick={() => setWetReflections(!wetReflections)}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  wetReflections
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">Wet Road PBR</span>
                  <CheckCircle2 className={`w-4 h-4 ${wetReflections ? 'text-cyan-400' : 'text-slate-600'}`} />
                </div>
                <p className="text-[11px] text-slate-400">Dynamic rain puddle gloss and reflections</p>
              </div>
            </div>
          </div>

          {/* Local Save System */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                Local State Persistence (localStorage)
              </span>
              {saveStatusMsg && (
                <span className="text-[11px] font-mono text-emerald-400 animate-fadeIn">
                  {saveStatusMsg}
                </span>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Persists current 24-hour cycle time, weather condition, active camera position, mission progress, and discovered city landmarks.
              </p>

              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  onClick={handleSaveGame}
                  className="flex-1 py-2 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>SAVE SIMULATION</span>
                </button>

                <button
                  onClick={handleLoadGame}
                  className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>LOAD LAST SAVE</span>
                </button>

                <button
                  onClick={handleClearSave}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition"
                  title="Clear Local Save"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>NEON AI CITY Core Engine v5.0</span>
          <span>Zero External Dependencies Required</span>
        </div>
      </div>
    </div>
  );
};
