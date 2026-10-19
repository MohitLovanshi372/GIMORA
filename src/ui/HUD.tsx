/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { CameraMode, CityMetrics, DistrictId, WeatherType } from '../city/types';
import { PlayerRadarTelemetry } from '../city/CityScene';
import { DistrictNav, NavDistrictId } from './DistrictNav';
import {
  Eye,
  EyeOff,
  Footprints,
  Video,
  Clock,
  CloudRain,
  Compass,
  Building2,
  Sun,
  Sunset,
  Moon,
  User,
} from 'lucide-react';

interface HUDProps {
  metrics: CityMetrics;
  cameraMode: CameraMode;
  activeDistrict: NavDistrictId | null;
  radarTelemetry?: PlayerRadarTelemetry;
  timeOfDay?: number;
  currentWeather?: WeatherType;
  onSetCameraMode: (mode: CameraMode) => void;
  onSelectDistrict: (districtId: DistrictId) => void;
  onSelectMohitHub: () => void;
  onSelectDubai?: () => void;
  onSelectSingapore?: () => void;
  onSelectParis?: () => void;
  onSelectAmerica?: () => void;
  onSelectAirport?: () => void;
  onSelectRailway?: () => void;
  onStartFlyover?: () => void;
  onOpenDubaiStudio?: () => void;
  onSetTimeOfDay?: (hour: number) => void;
  onSetWeather?: (weather: WeatherType) => void;
}

export const HUD: React.FC<HUDProps> = ({
  metrics,
  cameraMode,
  activeDistrict,
  radarTelemetry,
  timeOfDay = 17.35,
  currentWeather = 'CLEAR',
  onSetCameraMode,
  onSelectDistrict,
  onSelectMohitHub,
  onSelectDubai,
  onSelectSingapore,
  onSelectParis,
  onSelectAmerica,
  onSelectAirport,
  onSelectRailway,
  onStartFlyover,
  onOpenDubaiStudio,
  onSetTimeOfDay,
  onSetWeather,
}) => {
  const [isUiVisible, setIsUiVisible] = useState(true);
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw GTA V Rectangular Radar Minimap
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Dark translucent radar background
    ctx.fillStyle = '#0b131e';
    ctx.fillRect(0, 0, w, h);

    const px = radarTelemetry?.x ?? 0;
    const pz = radarTelemetry?.z ?? 80;
    const heading = radarTelemetry?.heading ?? 0;
    const scale = 0.42; // world meters to radar pixels

    ctx.save();
    ctx.translate(w / 2, h * 0.58);
    ctx.rotate(heading);

    // 1. River Channel (X: -28 to +28)
    ctx.fillStyle = '#164e63';
    ctx.fillRect((-28 - px) * scale, (-360 - pz) * scale, 56 * scale, 720 * scale);

    // 2. Central Emerald Park
    ctx.fillStyle = '#14532d';
    ctx.fillRect((-92 - px) * scale, (-48 - pz) * scale, 48 * scale, 96 * scale);

    // 3. City Road Grid (North-South & East-West Avenues)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4.5;
    const nsRoads = [-240, -180, -100, -45, 45, 100, 180, 240];
    nsRoads.forEach((rx) => {
      ctx.beginPath();
      ctx.moveTo((rx - px) * scale, (-340 - pz) * scale);
      ctx.lineTo((rx - px) * scale, (340 - pz) * scale);
      ctx.stroke();
    });

    const ewRoads = [-260, -220, -160, -90, 0, 90, 160, 220, 260];
    ewRoads.forEach((rz) => {
      ctx.beginPath();
      ctx.moveTo((-260 - px) * scale, (rz - pz) * scale);
      ctx.lineTo((260 - px) * scale, (rz - pz) * scale);
      ctx.stroke();
    });

    // Highlighted GPS Route / Main Boulevard
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo((-100 - px) * scale, (160 - pz) * scale);
    ctx.lineTo((-100 - px) * scale, (0 - pz) * scale);
    ctx.lineTo((100 - px) * scale, (0 - pz) * scale);
    ctx.lineTo((100 - px) * scale, (-160 - pz) * scale);
    ctx.stroke();

    // 4. Landmark Blips on Radar
    const blips = [
      { x: 140, z: -80, color: '#22d3ee' },  // Mohit Hub
      { x: -105, z: -45, color: '#fbbf24' }, // Burj Khalifa
      { x: -165, z: 75, color: '#38bdf8' },  // Singapore MBS
      { x: -45, z: -125, color: '#f472b6' }, // Paris Eiffel Tower
      { x: 65, z: -85, color: '#a78bfa' },   // Empire State
      { x: 180, z: -290, color: '#4ade80' }, // Airport
    ];

    blips.forEach((b) => {
      const bx = (b.x - px) * scale;
      const bz = (b.z - pz) * scale;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(bx, bz, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    ctx.restore();

    // 5. Player / Camera Field-of-View Cone & White Arrow at Radar Center
    const cx = w / 2;
    const cy = h * 0.58;

    const fovGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 46);
    fovGrad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
    fovGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = fovGrad;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, 46, -Math.PI * 0.72, -Math.PI * 0.28);
    ctx.closePath();
    ctx.fill();

    // Player White Triangle Blip with Black Border
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 7);
    ctx.lineTo(cx - 5.5, cy + 5.5);
    ctx.lineTo(cx, cy + 2.5);
    ctx.lineTo(cx + 5.5, cy + 5.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // North 'N' Badge on Radar Top Edge
    const northAngle = heading - Math.PI / 2;
    const nx = THREE_MathUtils_clamp(cx + Math.cos(northAngle) * (w * 0.44), 12, w - 12);
    const ny = THREE_MathUtils_clamp(cy + Math.sin(northAngle) * (h * 0.44), 12, h - 12);
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(nx, ny, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', nx, ny);
  }, [radarTelemetry]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 p-4 flex flex-col justify-between">
      {/* Top Bar */}
      {isUiVisible ? (
        <header className="flex flex-wrap items-center justify-between gap-3 w-full">
          {/* Zone 1: Brand & GTA V Atmosphere / Graphics Presets */}
          <div className="flex items-center gap-2.5 pointer-events-auto bg-slate-950/80 border border-white/10 rounded-lg px-3 py-1.5 backdrop-blur-md shadow-lg">
            <span className="text-base font-extrabold tracking-wider text-white font-['Chakra_Petch',sans-serif]">
              {metrics.cityName}
            </span>

            <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-slate-300 pl-2.5 border-l border-white/10">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="tabular-nums">{metrics.time}</span>
            </div>

            {/* GTA V Graphics & Time-of-Day Preset Buttons */}
            <div className="flex items-center gap-1 pl-2 border-l border-white/10">
              <button
                onClick={() => {
                  onSetWeather?.('CLEAR');
                  onSetTimeOfDay?.(17.35);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition ${
                  currentWeather === 'CLEAR' && timeOfDay >= 16.5 && timeOfDay <= 19.2
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="GTA V Los Santos Golden Hour Sunset"
              >
                <Sunset className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">Sunset</span>
              </button>

              <button
                onClick={() => {
                  onSetWeather?.('CLEAR');
                  onSetTimeOfDay?.(12.5);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition ${
                  currentWeather === 'CLEAR' && timeOfDay > 8.5 && timeOfDay < 16.5
                    ? 'bg-sky-500/25 text-sky-300 border border-sky-400/50'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Los Santos Bright California Noon"
              >
                <Sun className="w-3 h-3 text-yellow-300" />
                <span className="hidden sm:inline">Noon</span>
              </button>

              <button
                onClick={() => {
                  onSetWeather?.('CLEAR');
                  onSetTimeOfDay?.(22.0);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition ${
                  currentWeather === 'CLEAR' && (timeOfDay > 19.5 || timeOfDay < 5.5)
                    ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-400/50'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Downtown Neon Night"
              >
                <Moon className="w-3 h-3 text-indigo-300" />
                <span className="hidden sm:inline">Night</span>
              </button>

              <button
                onClick={() => {
                  onSetWeather?.(currentWeather === 'RAIN' ? 'CLEAR' : 'RAIN');
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition ${
                  currentWeather === 'RAIN'
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="GTA V Wet Asphalt Puddle Reflections"
              >
                <CloudRain className="w-3 h-3 text-cyan-400" />
                <span className="hidden sm:inline">Wet Road</span>
              </button>
            </div>
          </div>

          {/* Zone 2: District Navigation Quick Jumps */}
          <div className="pointer-events-auto">
            <DistrictNav
              activeDistrict={activeDistrict}
              onSelectDistrict={onSelectDistrict}
              onSelectMohitHub={onSelectMohitHub}
              onSelectDubai={onSelectDubai}
              onSelectSingapore={onSelectSingapore}
              onSelectParis={onSelectParis}
              onSelectAmerica={onSelectAmerica}
              onSelectAirport={onSelectAirport}
              onSelectRailway={onSelectRailway}
            />
          </div>

          {/* Zone 3: Camera Mode Selectors & Dubai Studio */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="flex items-center p-1 bg-slate-950/80 border border-white/10 rounded-lg backdrop-blur-md">
              <button
                onClick={() => onSetCameraMode('orbit')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-all ${
                  cameraMode === 'orbit'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Free Explore Orbit (Rotate, Pan, Zoom)"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Orbit</span>
              </button>

              <button
                onClick={() => onSetCameraMode('third-person')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-all ${
                  cameraMode === 'third-person'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-sm shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="GTA V Third-Person Character Walk & Sprint (WASD + Shift + Space)"
              >
                <User className="w-3.5 h-3.5" />
                <span>GTA Walk</span>
              </button>

              <button
                onClick={() => onSetCameraMode('first-person')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-all ${
                  cameraMode === 'first-person'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="First-Person Street Level Walk"
              >
                <Footprints className="w-3.5 h-3.5" />
                <span>1st Person</span>
              </button>

              <button
                onClick={() => onSetCameraMode('aerial')}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-all ${
                  cameraMode === 'aerial'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Aerial City View"
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
                title="Cinematic Skyline Overview"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Cinematic</span>
              </button>
            </div>

            {onOpenDubaiStudio && (
              <button
                onClick={onOpenDubaiStudio}
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-['Chakra_Petch'] font-bold rounded-lg text-xs tracking-wider transition-all shadow-lg shadow-amber-500/30 active:scale-95"
                title="Dubai 3D Landmarks & High-Resolution GLB Models"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-950" />
                <span>DUBAI 3D</span>
              </button>
            )}

            {onStartFlyover && (
              <button
                onClick={onStartFlyover}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/40 hover:to-blue-600/40 text-purple-200 border border-purple-400/50 rounded-lg text-xs font-mono font-bold tracking-wider transition-all shadow-md shadow-purple-950/40"
                title="Start Cinematic City Flyover Tour"
              >
                <Video className="w-3.5 h-3.5 text-purple-300" />
                <span>TOUR</span>
              </button>
            )}

            <button
              onClick={() => setIsUiVisible(false)}
              className="p-2 bg-slate-950/80 border border-white/10 hover:border-white/30 text-slate-400 hover:text-white rounded-lg transition"
              title="Hide UI for full cinematic view"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>
      ) : (
        <div className="flex justify-end w-full">
          <button
            onClick={() => setIsUiVisible(true)}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/80 border border-white/15 text-slate-300 hover:text-white rounded-lg backdrop-blur-md text-xs font-mono transition shadow-lg"
            title="Show Navigation Controls"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Show Menu</span>
          </button>
        </div>
      )}

      {/* GTA V Bottom HUD Row: Left Rectangular Radar Minimap + Right Street/District Name Callout */}
      {isUiVisible && (
        <div className="flex items-end justify-between w-full mt-auto pt-4">
          {/* Bottom-Left: Authentic GTA V Rectangular Radar Minimap + Health / Armor / Stamina Bars */}
          <div className="pointer-events-auto flex flex-col w-56 sm:w-64 bg-slate-950/90 border-2 border-slate-800/90 shadow-2xl overflow-hidden">
            <div className="relative w-full h-36">
              <canvas
                ref={radarCanvasRef}
                width={256}
                height={144}
                className="w-full h-full block"
              />
              <div className="absolute bottom-1.5 right-2 text-[10px] font-mono font-bold text-slate-300 bg-slate-950/75 px-1.5 py-0.5 rounded">
                {radarTelemetry?.speedKmh ?? 64} KM/H
              </div>
            </div>
            {/* GTA V Iconic Triple Bar: Green Health (50%), Blue Armor (25%), Amber Special/Stamina (25%) */}
            <div className="flex w-full h-2 bg-slate-900 border-t border-slate-800 gap-0.5 p-0.5">
              <div className="w-1/2 h-full bg-emerald-950 overflow-hidden">
                <div className="w-full h-full bg-emerald-500" />
              </div>
              <div className="w-1/4 h-full bg-sky-950 overflow-hidden">
                <div className="w-full h-full bg-sky-400" />
              </div>
              <div className="w-1/4 h-full bg-amber-950 overflow-hidden">
                <div className="w-full h-full bg-amber-400" />
              </div>
            </div>
          </div>

          {/* Bottom-Right: GTA V Stylized Street & District Location Callout */}
          <div className="hidden sm:flex flex-col items-end text-right drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] select-none">
            <span className="text-xl font-extrabold tracking-wide text-amber-300 font-['Chakra_Petch',sans-serif] uppercase">
              {radarTelemetry?.districtName || 'Downtown Financial Core'}
            </span>
            <span className="text-sm font-semibold tracking-wider text-white/90 font-['Plus_Jakarta_Sans',sans-serif]">
              {radarTelemetry?.streetName || 'Metropolitan Grand Blvd'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

function THREE_MathUtils_clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
