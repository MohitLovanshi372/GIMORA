/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  FolderGit2,
  Star,
  GitFork,
  ExternalLink,
  Code2,
  Calendar,
  Layers,
  Sparkles,
  X,
  Search,
  CheckCircle2,
  Cpu,
  Globe,
  Radio,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { gitHubProjectService, GitHubRepoItem } from '../services/GitHubProjectService';

interface ProjectGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject?: (project: GitHubRepoItem) => void;
}

export const ProjectGalleryModal: React.FC<ProjectGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectProject,
}) => {
  const [projects, setProjects] = useState<GitHubRepoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<GitHubRepoItem | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchRepos = async () => {
      setLoading(true);
      const data = await gitHubProjectService.getProjects();
      if (mounted) {
        setProjects(data);
        if (data.length > 0 && !selectedProject) {
          setSelectedProject(data[0]);
        }
        setLoading(false);
      }
    };
    if (isOpen) {
      fetchRepos();
    }
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredProjects = projects.filter((p) => {
    const matchesCat = activeCategory === 'ALL' || p.category === activeCategory;
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.language.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const categories = [
    { id: 'ALL', label: 'All Projects' },
    { id: 'AGRITECH', label: 'Agritech AI' },
    { id: 'PROPTECH', label: 'PropTech 3D' },
    { id: 'WEATHER', label: 'Meteorology' },
    { id: 'SIMULATION', label: 'Smart City' },
    { id: 'PORTFOLIO', label: 'Portfolio' },
  ];

  return (
    <div
      role="dialog"
      aria-label="Mohit Developer Hub Project Gallery"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
    >
      <div className="relative w-full max-w-5xl h-[88vh] bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/80 flex flex-col font-['Plus_Jakarta_Sans'] text-slate-100 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/50 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-['Chakra_Petch'] text-cyan-300 tracking-wider">
                  MOHIT DEVELOPER HUB — PROJECT GALLERY
                </h2>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                  GitHub Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Interactive Showcase of Production Systems, Open Source Repositories & Agritech AI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close Gallery"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-slate-800 text-xs">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1.5 rounded-md font-mono text-xs transition-colors ${
                  activeCategory === c.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950/90 border border-slate-700/80 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>
        </div>

        {/* Main Content Area (Split Grid: Left list, Right inspector) */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left: Project Cards Grid */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 font-mono text-xs">
                <Cpu className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
                <span>Fetching GitHub project repository metadata...</span>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-20 text-slate-500 font-mono text-xs">
                No repositories found matching "{searchQuery}"
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredProjects.map((p) => {
                  const isSelected = selectedProject?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedProject(p);
                        if (onSelectProject) onSelectProject(p);
                      }}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                        isSelected
                          ? 'bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border-cyan-400/80 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400/40'
                          : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800/80 hover:border-cyan-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 text-xs text-slate-400 font-mono">
                            <span className="text-cyan-400 font-semibold">{p.category}</span>
                            <span>•</span>
                            <span>{p.language}</span>
                          </div>
                          <h3 className="text-sm font-bold text-white font-['Chakra_Petch'] flex items-center gap-2">
                            {p.name}
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                          </h3>
                          <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                            {p.description}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0 text-xs font-mono text-slate-400">
                          <span className="flex items-center gap-1 text-amber-300">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {p.stars}
                          </span>
                          <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                            <GitFork className="w-3 h-3" />
                            {p.forks}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="text-slate-500">Updated {p.updatedAt}</span>
                        <span className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold">
                          View In-Depth Specs <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Selected Project In-Game Inspection Panel */}
          {selectedProject && (
            <div className="w-full md:w-[420px] bg-slate-900/90 border-t md:border-t-0 md:border-l border-slate-800 overflow-y-auto p-6 flex flex-col justify-between">
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span className="text-cyan-400 font-semibold">{selectedProject.category}</span>
                    <span>•</span>
                    <span>{selectedProject.language}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-['Chakra_Petch'] mt-1">
                    {selectedProject.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    {selectedProject.fullName}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
                    Architecture Stack
                  </span>
                  <p className="text-xs text-slate-200 font-mono font-medium leading-relaxed">
                    {selectedProject.architecture}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-mono text-cyan-300 uppercase tracking-wider block mb-2">
                    System Overview
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-mono text-cyan-300 uppercase tracking-wider block mb-2">
                    Key Innovations & Capabilities
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {selectedProject.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5 font-bold">▹</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Repository Telemetry */}
                <div className="grid grid-cols-3 gap-2.5 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">STARS</span>
                    <span className="text-amber-300 font-bold text-sm">{selectedProject.stars}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">FORKS</span>
                    <span className="text-cyan-300 font-bold text-sm">{selectedProject.forks}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">ISSUES</span>
                    <span className="text-emerald-300 font-bold text-sm">{selectedProject.openIssues}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-800 flex items-center gap-3">
                <a
                  href={selectedProject.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 transition font-['Chakra_Petch'] font-bold text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40"
                >
                  <ExternalLink className="w-4 h-4 text-cyan-400" />
                  <span>OPEN GITHUB REPO</span>
                </a>

                {selectedProject.homepage && (
                  <a
                    href={selectedProject.homepage}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                    title="Launch Live App"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 bg-slate-950/90 border-t border-cyan-500/20 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Connected to Mohit Developer Hub Software Repository Pipeline</span>
          <span>Security Verified • Public Repositories</span>
        </div>
      </div>
    </div>
  );
};
