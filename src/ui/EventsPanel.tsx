/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Flame,
  HeartPulse,
  Car,
  Zap,
  Crosshair,
  CheckCircle2,
  X,
  Plus,
  Clock,
  ChevronDown,
  ChevronUp,
  Radio,
} from 'lucide-react';
import { CityEvent } from '../simulation/CityState';

export type IncidentFilterType = 'ALL' | 'FIRE' | 'MEDICAL' | 'TRAFFIC_GRID' | 'RESOLVED';

interface EventsPanelProps {
  activeIncidents: CityEvent[];
  resolvedIncidents: CityEvent[];
  onClose: () => void;
  onFocusIncident: (incident: CityEvent) => void;
  onResolveIncident: (incidentId: string) => void;
  onTriggerFire: () => void;
  onTriggerMedical: () => void;
  onTriggerAccident: () => void;
  onTriggerPowerSurge: () => void;
}

export const EventsPanel: React.FC<EventsPanelProps> = ({
  activeIncidents,
  resolvedIncidents,
  onClose,
  onFocusIncident,
  onResolveIncident,
  onTriggerFire,
  onTriggerMedical,
  onTriggerAccident,
  onTriggerPowerSurge,
}) => {
  const [filter, setFilter] = useState<IncidentFilterType>('ALL');
  const [focusedIncidentId, setFocusedIncidentId] = useState<string | null>(null);
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null);

  const filteredIncidents = (() => {
    if (filter === 'RESOLVED') return resolvedIncidents;
    return activeIncidents.filter((inc) => {
      if (filter === 'ALL') return true;
      if (filter === 'FIRE') return inc.type === 'FIRE';
      if (filter === 'MEDICAL') return inc.type === 'MEDICAL_EMERGENCY';
      if (filter === 'TRAFFIC_GRID') {
        return (
          inc.type === 'ACCIDENT' ||
          inc.type === 'TRAFFIC_JAM' ||
          inc.type === 'ROAD_BLOCK' ||
          inc.type === 'POWER_OUTAGE'
        );
      }
      return true;
    });
  })();

  const getTypeIcon = (type: CityEvent['type']) => {
    if (type === 'FIRE') return <Flame className="w-4 h-4 text-red-400 shrink-0" />;
    if (type === 'MEDICAL_EMERGENCY') return <HeartPulse className="w-4 h-4 text-sky-400 shrink-0" />;
    if (type === 'POWER_OUTAGE') return <Zap className="w-4 h-4 text-purple-400 shrink-0" />;
    return <Car className="w-4 h-4 text-amber-400 shrink-0" />;
  };

  const getTypeLabel = (type: CityEvent['type']) => {
    if (type === 'FIRE') return 'FIRE ALERT';
    if (type === 'MEDICAL_EMERGENCY') return 'MEDICAL EMERGENCY';
    if (type === 'POWER_OUTAGE') return 'GRID SURGE';
    if (type === 'ACCIDENT') return 'TRAFFIC COLLISION';
    return type.replace('_', ' ');
  };

  const getSeverityTextClass = (severity: CityEvent['severity']) => {
    if (severity === 'CRITICAL') return 'text-red-400 font-bold';
    if (severity === 'HIGH') return 'text-amber-400 font-semibold';
    if (severity === 'MEDIUM') return 'text-sky-400 font-medium';
    return 'text-slate-400';
  };

  const getStatusTextClass = (status: CityEvent['status']) => {
    if (status === 'ACTIVE') return 'text-red-400';
    if (status === 'DISPATCHED') return 'text-amber-300';
    if (status === 'RESOLVING') return 'text-cyan-300';
    return 'text-emerald-400';
  };

  const fireCount = activeIncidents.filter((e) => e.type === 'FIRE').length;
  const medicalCount = activeIncidents.filter((e) => e.type === 'MEDICAL_EMERGENCY').length;

  return (
    <aside
      aria-label="Real-Time City Events & Incident Log"
      className="fixed top-20 right-4 z-30 w-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-7rem)] bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-md flex flex-col overflow-hidden text-slate-100 font-['Plus_Jakarta_Sans']"
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-800/90 bg-slate-900/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Radio className="w-4 h-4 text-red-400 animate-pulse" />
          <div>
            <h2 className="text-sm font-bold tracking-wider uppercase font-['Chakra_Petch'] text-white">
              City Events & Incident Log
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
              <span className="text-red-400 font-semibold">{activeIncidents.length} Active</span>
              <span aria-hidden="true">·</span>
              <span>{fireCount} Fire</span>
              <span aria-hidden="true">·</span>
              <span>{medicalCount} Medical</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">{resolvedIncidents.length} Resolved</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Close Events Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Simulate / Trigger Incident Bar */}
      <div className="px-4 py-2.5 bg-slate-900/40 border-b border-slate-800/80 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
          <span>Dispatch / Simulate Live Incident</span>
          <span>Auto-Sensor Feed Active</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={onTriggerFire}
            className="px-2 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/35 text-red-300 text-[11px] font-mono font-semibold flex items-center justify-center gap-1 transition active:scale-95"
            title="Trigger Real-Time Fire Alert"
          >
            <Plus className="w-3 h-3" />
            <span>Fire</span>
          </button>
          <button
            onClick={onTriggerMedical}
            className="px-2 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/35 text-sky-300 text-[11px] font-mono font-semibold flex items-center justify-center gap-1 transition active:scale-95"
            title="Trigger Real-Time Medical Emergency"
          >
            <Plus className="w-3 h-3" />
            <span>Medical</span>
          </button>
          <button
            onClick={onTriggerAccident}
            className="px-2 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 text-[11px] font-mono font-semibold flex items-center justify-center gap-1 transition active:scale-95"
            title="Trigger Multi-Vehicle Traffic Collision"
          >
            <Plus className="w-3 h-3" />
            <span>Crash</span>
          </button>
          <button
            onClick={onTriggerPowerSurge}
            className="px-2 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/35 text-purple-300 text-[11px] font-mono font-semibold flex items-center justify-center gap-1 transition active:scale-95"
            title="Trigger Substation Power Grid Surge"
          >
            <Plus className="w-3 h-3" />
            <span>Grid</span>
          </button>
        </div>
      </div>

      {/* Interactive Segmented Filter Bar */}
      <div className="px-4 pt-2.5 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800/90 text-[11px] font-mono">
          {(
            [
              { id: 'ALL', label: `All (${activeIncidents.length})` },
              { id: 'FIRE', label: 'Fire' },
              { id: 'MEDICAL', label: 'Medical' },
              { id: 'TRAFFIC_GRID', label: 'Traffic' },
              { id: 'RESOLVED', label: 'Log' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex-1 py-1 px-1.5 rounded-md transition font-medium text-center truncate ${
                filter === tab.id
                  ? 'bg-slate-800 text-cyan-300 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Real-Time Incident Feed */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
        {filteredIncidents.length === 0 ? (
          <div className="py-10 px-4 text-center space-y-2">
            <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto opacity-80" />
            <p className="text-xs font-semibold text-slate-300">No Incidents Matching Filter</p>
            <p className="text-[11px] text-slate-500 font-mono">
              Use the simulation buttons above to dispatch a new Fire Alert or Medical Emergency.
            </p>
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const isFocused = focusedIncidentId === incident.id;
            const isExpanded = expandedTimelineId === incident.id;

            return (
              <div
                key={incident.id}
                className={`p-3.5 rounded-lg border transition space-y-2.5 ${
                  isFocused
                    ? 'bg-slate-900/95 border-cyan-400/70 shadow-md shadow-cyan-950/50'
                    : 'bg-slate-900/65 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                {/* Kicker Metadata Line (Unboxed clean inline text with middle dots) */}
                <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    {getTypeIcon(incident.type)}
                    <span className="font-bold tracking-wider text-slate-200">
                      {getTypeLabel(incident.type)}
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className={getSeverityTextClass(incident.severity)}>
                      {incident.severity}
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className={getStatusTextClass(incident.status)}>
                      {incident.status}
                    </span>
                  </div>

                  <span className="text-slate-400 shrink-0 flex items-center gap-1 tabular-nums">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {incident.timestamp}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-xs font-bold text-white font-['Chakra_Petch'] leading-snug">
                    {incident.title}
                  </h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                    {incident.description}
                  </p>
                </div>

                {/* Location & Coordinates Metadata Line */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-0.5">
                  <span className="text-cyan-300/90 truncate">{incident.districtName}</span>
                  <span className="text-[10px] text-slate-500 shrink-0 tabular-nums">
                    [{Math.round(incident.location.x)}, {Math.round(incident.location.z)}]
                  </span>
                </div>

                {/* Action Bar: Auto-Focus Camera Button + Timeline Toggle + Resolve */}
                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      setFocusedIncidentId(incident.id);
                      onFocusIncident(incident);
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 ${
                      isFocused
                        ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/30'
                        : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40'
                    }`}
                    title="Fly 3D Camera Directly to Incident Location"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>{isFocused ? 'Camera Focused' : 'Focus Camera'}</span>
                  </button>

                  {incident.status !== 'RESOLVED' && (
                    <button
                      onClick={() => onResolveIncident(incident.id)}
                      className="py-1.5 px-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-semibold transition"
                      title="Mark Incident Resolved & Clear Hazard"
                    >
                      Resolve
                    </button>
                  )}

                  <button
                    onClick={() =>
                      setExpandedTimelineId(isExpanded ? null : incident.id)
                    }
                    className="p-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 transition"
                    title="Toggle Dispatch Timeline"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Expandable Dispatch Timeline */}
                {isExpanded && incident.timeline && incident.timeline.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/60 space-y-1.5 text-[10px] font-mono">
                    {incident.timeline.map((entry, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-300">
                        <span className="text-slate-500 shrink-0 tabular-nums">{entry.time}</span>
                        <span className="text-cyan-400 font-semibold shrink-0">{entry.stage}</span>
                        <span className="text-slate-400 leading-tight">{entry.note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
