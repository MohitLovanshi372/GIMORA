/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DistrictId =
  | 'downtown'
  | 'technology'
  | 'education'
  | 'healthcare'
  | 'residential'
  | 'entertainment'
  | 'industrial'
  | 'railway'
  | 'riverside'
  | 'airport';

export interface DistrictInfo {
  id: DistrictId;
  name: string;
  tagline: string;
  color: string;
  accentColor: string;
  center: [number, number, number];
  cameraTarget: [number, number, number];
  description: string;
  status: string;
  powerGrid: string;
  density: string;
}

export type WeatherType = 'CLEAR' | 'CLOUDY' | 'RAIN' | 'HEAVY_RAIN' | 'FOG' | 'STORM';

export type CameraMode =
  | 'orbit'
  | 'first-person'
  | 'third-person'
  | 'cinematic'
  | 'follow-vehicle'
  | 'follow-train'
  | 'aerial'
  | 'drone'
  | 'mohit-hub'
  | 'city-flyover'
  | 'river-view'
  | 'bridge-view'
  | 'railway-view'
  | 'airport-view';

export interface CityEconomyMetrics {
  totalJobs: number;
  employmentRate: number; // e.g. 96.4%
  activeBusinesses: number;
  hourlyRevenueCredits: number;
  commercialTaxRate: number;
  transitFareIncome: number;
  economicHealth: 'BOOMING' | 'STEADY' | 'STRAINED';
}

export interface EnergyMetrics {
  totalCapacityMW: number;
  currentConsumptionMW: number;
  surplusMW: number;
  gridStatus: 'OPTIMAL' | 'STRAINED' | 'BLACKOUT';
  solarOutputMW: number;
  geothermalOutputMW: number;
  fusionOutputMW: number;
  districtUsageMW: Record<string, number>;
}

export interface BuildingData {
  id: string;
  name: string;
  districtId: DistrictId;
  districtName: string;
  category:
    | 'Skyscraper'
    | 'Technology Headquarters'
    | 'Research Pod'
    | 'University'
    | 'Engineering College'
    | 'School'
    | 'Digital Library'
    | 'Research Center'
    | 'Student Hostel'
    | 'Science Laboratory'
    | 'Smart Hospital'
    | 'Emergency Center'
    | 'Pharmacy'
    | 'Medical Research'
    | 'Medical Tower'
    | 'Academy'
    | 'Neo-Habitat'
    | 'Entertainment Megaplex'
    | 'Power Plant'
    | 'Transit Terminal'
    | 'Transit Hub'
    | 'Control Tower'
    | 'Waterfront Venue'
    | 'Landmark';
  height: number;
  floors: number;
  position: [number, number, number];
  dimensions: [number, number, number];
  powerUsage: string;
  occupancy: string;
  networkStatus: string;
  description: string;
  isLandmark?: boolean;
  interiorAreas?: string[];
  features?: string[];
}

export type TrafficDensityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CONGESTED';

export interface TransportationMetrics {
  densityLevel: TrafficDensityLevel;
  activeVehicles: number;
  activeTrains: number;
  averageSpeed: number; // in km/h
  congestionPercentage: number;
  activePedestrians: number;
}

export interface CityMetrics {
  cityName: string;
  population: number;
  time: string;
  weather: {
    condition: string;
    temperature: string;
    fogDensity: string;
    airQuality: string;
  };
  trafficStatus: string;
  aiStatus: string;
  energyGrid: string;
}
