/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GitHubRepoItem {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  openIssues: number;
  updatedAt: string;
  url: string;
  homepage?: string;
  topics: string[];
  category: 'AGRITECH' | 'PROPTECH' | 'WEATHER' | 'AI_SYSTEMS' | 'PORTFOLIO' | 'SIMULATION';
  highlights: string[];
  architecture: string;
}

export interface GitHubConfig {
  username: string;
  organization?: string;
  fetchTimeoutMs: number;
}

export const DEFAULT_GITHUB_CONFIG: GitHubConfig = {
  username: 'mohitlovanshi',
  fetchTimeoutMs: 4000,
};

// High-fidelity fallback projects data ensuring the UI is never blank even offline
export const FALLBACK_PROJECTS: GitHubRepoItem[] = [
  {
    id: 'kisan-procurement-mitra',
    name: 'Kisan Procurement Mitra',
    fullName: 'mohitlovanshi/kisan-procurement-mitra',
    description: 'Autonomous agricultural procurement & mandi intelligence engine. Empowers local farmers with AI price prediction, harvest scheduling, and transparent direct-to-market dispatch routing.',
    language: 'TypeScript / Python',
    stars: 184,
    forks: 42,
    openIssues: 3,
    updatedAt: '2026-03-28',
    url: 'https://github.com/mohitlovanshi/kisan-procurement-mitra',
    homepage: 'https://kisan-procurement-mitra.web.app',
    topics: ['agritech', 'ai', 'procurement', 'supply-chain', 'gemini'],
    category: 'AGRITECH',
    highlights: [
      'Multi-modal mandi price trend regression model',
      'Direct-to-market logistics route optimizer',
      'Vernacular voice assistant for rural farmers',
      'Automated quality grading via vision models',
    ],
    architecture: 'React 19 • Cloud Run • FastAPI • PostgreSQL • Vector Search',
  },
  {
    id: 'smart-property-finder',
    name: 'Smart Property Finder',
    fullName: 'mohitlovanshi/smart-property-finder',
    description: 'Next-generation 3D spatial real estate & urban planning platform with procedural neighborhood zoning visualization, price trend forecasting, and instant algorithmic property matching.',
    language: 'TypeScript / WebGL',
    stars: 246,
    forks: 58,
    openIssues: 5,
    updatedAt: '2026-04-01',
    url: 'https://github.com/mohitlovanshi/smart-property-finder',
    homepage: 'https://smart-property-finder.web.app',
    topics: ['proptech', 'threejs', 'gis', 'real-estate', '3d-map'],
    category: 'PROPTECH',
    highlights: [
      'Interactive 3D building volumetric footprint explorer',
      'Neighborhood walkability, noise, and sunlight simulation',
      'Algorithmic valuation engine with ROI prediction',
      'Augmented architectural interior walkthroughs',
    ],
    architecture: 'Three.js • Google Maps 3D • React • Drizzle ORM • Node.js',
  },
  {
    id: 'weather-information-dashboard',
    name: 'Weather Information Dashboard',
    fullName: 'mohitlovanshi/weather-information-dashboard',
    description: 'High-frequency meteorological radar & atmospheric telemetry platform. Delivers Doppler precipitation simulation, severe storm trajectory tracking, and district micro-climate sensing.',
    language: 'TypeScript',
    stars: 162,
    forks: 31,
    openIssues: 2,
    updatedAt: '2026-03-15',
    url: 'https://github.com/mohitlovanshi/weather-information-dashboard',
    homepage: 'https://weather-info-dashboard.web.app',
    topics: ['meteorology', 'weather-radar', 'visualization', 'iot-telemetry'],
    category: 'WEATHER',
    highlights: [
      'Real-time Doppler particle wind drift rendering',
      'Micro-climate zone detection across urban heat islands',
      'Instant severe weather push alerts & emergency siren triggers',
      'Air Quality Index (AQI) particulate matter tracking',
    ],
    architecture: 'React • Canvas2D / WebGL • Open-Meteo • Tailwind CSS',
  },
  {
    id: 'developer-portfolio',
    name: 'Developer Portfolio',
    fullName: 'mohitlovanshi/developer-portfolio',
    description: 'Interactive high-performance 3D cybernetic engineering portfolio showcase. Features interactive shader exhibits, full-stack case studies, system architecture diagrams, and live demos.',
    language: 'TypeScript / GLSL',
    stars: 310,
    forks: 89,
    openIssues: 1,
    updatedAt: '2026-04-02',
    url: 'https://github.com/mohitlovanshi/portfolio',
    homepage: 'https://mohitdeveloper.dev',
    topics: ['portfolio', 'threejs', 'creative-coding', 'webgl-shaders'],
    category: 'PORTFOLIO',
    highlights: [
      'Custom procedural PBR materials and bloom post-processing',
      'Dynamic project gallery linked with GitHub GraphQL API',
      'Interactive spatial terminal with command line interface',
      'Flawless 60 FPS mobile and desktop performance',
    ],
    architecture: 'Next.js / Vite • Three.js • Web Audio API • Tailwind CSS',
  },
  {
    id: 'neon-ai-city',
    name: 'NEON AI CITY Simulation',
    fullName: 'mohitlovanshi/neon-ai-city',
    description: 'Full-scale autonomous 3D futuristic smart city simulation. Features multi-agent hierarchical swarms (City Manager, Traffic, Emergency, Transit, Citizen), dynamic 24h day/night, and interactive landmarks.',
    language: 'TypeScript',
    stars: 480,
    forks: 112,
    openIssues: 4,
    updatedAt: '2026-04-03',
    url: 'https://github.com/mohitlovanshi/neon-ai-city',
    homepage: 'https://neon-ai-city.web.app',
    topics: ['smart-city', 'autonomous-agents', 'simulation', 'threejs', 'cyberpunk'],
    category: 'SIMULATION',
    highlights: [
      'Hierarchical agent swarm coordination & conflict resolution',
      'Maglev railway, multi-lane traffic, and airport subsystems',
      'Interactive interior buildings and player exploration modes',
      'Dynamic weather and real-time economy & energy grids',
    ],
    architecture: 'React • Three.js • WebGL • TypeScript • Tailwind CSS',
  },
  {
    id: 'quantum-traffic-swarm',
    name: 'Quantum Traffic Swarm',
    fullName: 'mohitlovanshi/quantum-traffic-swarm',
    description: 'Distributed multi-agent traffic signal timing optimizer with green corridor emergency preemption and bottleneck rerouting algorithms.',
    language: 'Python / TypeScript',
    stars: 128,
    forks: 24,
    openIssues: 0,
    updatedAt: '2026-02-20',
    url: 'https://github.com/mohitlovanshi/quantum-traffic-swarm',
    topics: ['traffic-ai', 'swarm-intelligence', 'urban-mobility'],
    category: 'AI_SYSTEMS',
    highlights: [
      'Adaptive queue length vision estimator',
      'Priority green corridor preemption for ambulances & fire engines',
      'Decentralized intersection peer-to-peer negotiation',
    ],
    architecture: 'TypeScript • Python • Simulation Canvas',
  },
];

export class GitHubProjectService {
  private config: GitHubConfig;
  private cachedProjects: GitHubRepoItem[] = FALLBACK_PROJECTS;
  private lastFetchTime = 0;
  private cacheDurationMs = 5 * 60 * 1000; // 5 min cache

  constructor(config: Partial<GitHubConfig> = {}) {
    this.config = { ...DEFAULT_GITHUB_CONFIG, ...config };
  }

  public setConfig(newConfig: Partial<GitHubConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.lastFetchTime = 0;
  }

  public async getProjects(): Promise<GitHubRepoItem[]> {
    const now = Date.now();
    if (this.cachedProjects.length > 0 && now - this.lastFetchTime < this.cacheDurationMs) {
      return this.cachedProjects;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.fetchTimeoutMs);

      const endpoint = `https://api.github.com/users/${this.config.username}/repos?sort=updated&per_page=12`;
      const response = await fetch(endpoint, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[GitHubProjectService] GitHub API status ${response.status}. Using rich fallback projects.`);
        return this.cachedProjects;
      }

      const rawRepos = await response.json();
      if (!Array.isArray(rawRepos) || rawRepos.length === 0) {
        return this.cachedProjects;
      }

      // Merge dynamic GitHub repository metadata with curated project categories
      const fetchedRepos: GitHubRepoItem[] = rawRepos.map((repo: any) => {
        const fallbackMatch = FALLBACK_PROJECTS.find(
          (p) => p.name.toLowerCase() === repo.name.toLowerCase() || p.id === repo.name.toLowerCase()
        );

        return {
          id: repo.name,
          name: fallbackMatch ? fallbackMatch.name : repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          fullName: repo.full_name,
          description: repo.description || fallbackMatch?.description || 'Software repository by Mohit.',
          language: repo.language || fallbackMatch?.language || 'TypeScript',
          stars: repo.stargazers_count ?? (fallbackMatch?.stars || 10),
          forks: repo.forks_count ?? (fallbackMatch?.forks || 2),
          openIssues: repo.open_issues_count ?? 0,
          updatedAt: (repo.updated_at || '2026-04-01').split('T')[0],
          url: repo.html_url,
          homepage: repo.homepage || fallbackMatch?.homepage,
          topics: repo.topics || fallbackMatch?.topics || ['software', 'ai'],
          category: fallbackMatch?.category || 'AI_SYSTEMS',
          highlights: fallbackMatch?.highlights || [
            'Modular microservices architecture',
            'Full test coverage with CI/CD automation',
            'Cloud-native deployment ready',
          ],
          architecture: fallbackMatch?.architecture || `${repo.language || 'TypeScript'} • Cloud Services`,
        };
      });

      // Combine fetched with fallback to ensure all landmark featured projects remain present
      const combined = [...fetchedRepos];
      FALLBACK_PROJECTS.forEach((fallback) => {
        if (!combined.some((item) => item.name.toLowerCase() === fallback.name.toLowerCase())) {
          combined.push(fallback);
        }
      });

      this.cachedProjects = combined;
      this.lastFetchTime = now;
      return this.cachedProjects;
    } catch (err) {
      console.warn('[GitHubProjectService] Network or timeout error fetching GitHub data. Using fallback projects:', err);
      return this.cachedProjects;
    }
  }

  public getFallbackProjects(): GitHubRepoItem[] {
    return FALLBACK_PROJECTS;
  }
}

export const gitHubProjectService = new GitHubProjectService();
