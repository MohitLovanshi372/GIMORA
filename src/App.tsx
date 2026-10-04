/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CityScene } from './city/CityScene';
import { BuildingData, CameraMode, CityMetrics, DistrictId, TrafficDensityLevel, TransportationMetrics } from './city/types';
import { HUD } from './ui/HUD';
import { BuildingInspector } from './ui/BuildingInspector';
import { ControlsGuide } from './ui/ControlsGuide';
import { TransportationDashboard } from './ui/TransportationDashboard';
import { AIAgentDashboard } from './ui/AIAgentDashboard';
import { SmartCityControlCenter } from './ui/SmartCityControlCenter';
import { BuildingInteriorModal, InteriorBuildingType } from './ui/BuildingInteriorModal';
import { AgentManagerSnapshot } from './simulation/AgentManager';
import { CityDirective } from './simulation/AgentTypes';
import { CityEvent } from './simulation/CityState';
import { CityEconomyMetrics, EnergyMetrics, WeatherType } from './city/types';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const citySceneRef = useRef<CityScene | null>(null);

  const [selectedBuilding, setSelectedBuilding] = useState<BuildingData | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit');
  const [activeDistrict, setActiveDistrict] = useState<DistrictId | 'mohit-hub' | null>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // Modals & Panels State
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [controlCenterTab, setControlCenterTab] = useState<'map' | 'overview' | 'time_weather' | 'energy' | 'camera' | 'events'>('map');
  const [interiorModalType, setInteriorModalType] = useState<InteriorBuildingType | null>(null);
  const [isAgentDashboardOpen, setIsAgentDashboardOpen] = useState(true);

  // Time & Weather State
  const [currentWeather, setCurrentWeather] = useState<WeatherType>('CLEAR');
  const [timeOfDay, setTimeOfDay] = useState(23.7);
  const [timeString, setTimeString] = useState('23:42:18');
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [isTimePaused, setIsTimePaused] = useState(false);

  // Economy & Energy Live State
  const [economyMetrics, setEconomyMetrics] = useState<CityEconomyMetrics>({
    totalJobs: 3450000,
    employmentRate: 96.4,
    activeBusinesses: 28400,
    hourlyRevenueCredits: 184500,
    commercialTaxRate: 8.5,
    transitFareIncome: 42800,
    economicHealth: 'BOOMING',
  });

  const [energyMetrics, setEnergyMetrics] = useState<EnergyMetrics>({
    totalCapacityMW: 1250,
    currentConsumptionMW: 1042,
    surplusMW: 208,
    gridStatus: 'OPTIMAL',
    solarOutputMW: 320,
    geothermalOutputMW: 450,
    fusionOutputMW: 480,
    districtUsageMW: {},
  });

  // Transportation Live Metrics
  const [transportMetrics, setTransportMetrics] = useState<TransportationMetrics>({
    densityLevel: 'HIGH',
    activeVehicles: 88,
    activeTrains: 3,
    averageSpeed: 52,
    congestionPercentage: 14,
    activePedestrians: 42,
  });

  // Live simulated city metrics
  const [metrics] = useState<CityMetrics>({
    cityName: 'NEON AI CITY',
    population: 4821900,
    time: '23:42:18',
    weather: {
      condition: 'Acid Rain',
      temperature: '18°C',
      fogDensity: '38%',
      airQuality: 'AQI 42 (Clean)',
    },
    trafficStatus: 'Optimal (Flow 94.2%)',
    aiStatus: 'Autonomous Grid Stable',
    energyGrid: 'Geothermal + Fusion 100%',
  });

  // AI Agent Manager Telemetry Snapshot
  const [agentSnapshot, setAgentSnapshot] = useState<AgentManagerSnapshot>({
    activeDirective: 'STANDARD_OPERATION',
    agents: [],
    recentDecisions: [],
    activeEmergencies: [],
    resolvedEmergencies: [],
    conflictRecords: [],
    citizenMorale: 94,
  });

  useEffect(() => {
    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    if (!containerRef.current) return;

    // Instantiate CityScene
    const cityScene = new CityScene(containerRef.current, {
      onBuildingSelect: (building) => {
        setSelectedBuilding(building);
        if (building) {
          if (building.id === 'mohit-developer-hub-hq') {
            setActiveDistrict('mohit-hub');
          } else {
            setActiveDistrict(building.districtId);
          }
        }
      },
    });

    citySceneRef.current = cityScene;

    // Periodic telemetry update from CityScene
    const metricsInterval = setInterval(() => {
      if (citySceneRef.current) {
        setTransportMetrics(citySceneRef.current.getTransportationMetrics());
        setCameraMode(citySceneRef.current.getCameraMode());
        setAgentSnapshot(citySceneRef.current.getAgentSnapshot());
        setTimeString(citySceneRef.current.cityLifeManager.getTimeString());
        setTimeOfDay(citySceneRef.current.cityLifeManager.timeOfDay);
        setEconomyMetrics(citySceneRef.current.economyManager.getSnapshot());
        setEnergyMetrics(citySceneRef.current.energyManager.getSnapshot());
      }
    }, 350);

    return () => {
      clearInterval(metricsInterval);
      cityScene.dispose();
      citySceneRef.current = null;
    };
  }, []);

  const handleSelectDistrict = (districtId: DistrictId) => {
    setActiveDistrict(districtId);
    if (citySceneRef.current) {
      citySceneRef.current.focusDistrict(districtId);
    }
  };

  const handleSelectMohitHub = () => {
    setActiveDistrict('mohit-hub');
    if (citySceneRef.current) {
      citySceneRef.current.focusMohitHub();
    }
  };

  const handleFocusBuilding = (building: BuildingData) => {
    if (citySceneRef.current) {
      citySceneRef.current.focusBuilding(building);
    }
  };

  const handleCloseInspector = () => {
    setSelectedBuilding(null);
    if (citySceneRef.current) {
      citySceneRef.current.clearSelection();
    }
  };

  const handleSetCameraMode = (mode: CameraMode) => {
    setCameraMode(mode);
    if (citySceneRef.current) {
      if (mode !== 'city-flyover') {
        citySceneRef.current.stopFlyoverTour();
      }
      citySceneRef.current.setCameraMode(mode);
    }
  };

  const handleSetDensity = (level: TrafficDensityLevel) => {
    if (citySceneRef.current) {
      citySceneRef.current.setTrafficDensity(level);
      setTransportMetrics(citySceneRef.current.getTransportationMetrics());
    }
  };

  const handleFollowVehicle = () => {
    if (citySceneRef.current) {
      citySceneRef.current.followVehicle();
      setCameraMode('follow-vehicle');
    }
  };

  const handleFollowTrain = () => {
    if (citySceneRef.current) {
      citySceneRef.current.followTrain();
      setCameraMode('follow-train');
    }
  };

  const handleResetCamera = () => {
    handleSetCameraMode('orbit');
  };

  // Weather & Time Handlers
  const handleSetWeather = (weather: WeatherType) => {
    setCurrentWeather(weather);
    citySceneRef.current?.setWeather(weather);
  };

  const handleSetTime = (hour: number) => {
    setTimeOfDay(hour);
    citySceneRef.current?.setTimeOfDay(hour);
    if (citySceneRef.current) {
      setTimeString(citySceneRef.current.cityLifeManager.getTimeString());
    }
  };

  const handleSetTimeSpeed = (speed: number) => {
    setTimeSpeed(speed);
    citySceneRef.current?.setTimeSpeed(speed);
  };

  const handleToggleTimePause = () => {
    setIsTimePaused(!isTimePaused);
    citySceneRef.current?.toggleTimePause();
  };

  const handleStartFlyover = () => {
    setCameraMode('city-flyover');
    citySceneRef.current?.startFlyoverTour();
  };

  const handleTriggerBlackout = () => {
    citySceneRef.current?.energyManager.triggerDistrictBlackout('entertainment');
    citySceneRef.current?.agentManager.cityManager.setDirective(
      'CODE_RED_EMERGENCY_CORRIDOR',
      'Sudden blackout detected in Entertainment sector. Backup systems engaged and traffic rerouted.'
    );
  };

  const handleOpenInterior = (type: InteriorBuildingType) => {
    setInteriorModalType(type);
  };

  // Section 13 Gameplay & Quick Bar Handlers
  const handleExploreCity = () => {
    handleSetCameraMode('orbit');
    setSelectedBuilding(null);
    setInteriorModalType(null);
    setIsControlCenterOpen(false);
  };

  const handleToggleAIControl = () => {
    setIsAgentDashboardOpen(!isAgentDashboardOpen);
  };

  const handleOpenCityMap = () => {
    setControlCenterTab('map');
    setIsControlCenterOpen(true);
  };

  const handleOpenEvents = () => {
    setControlCenterTab('events');
    setIsControlCenterOpen(true);
  };

  const handleFollowVehicles = () => {
    handleFollowVehicle();
  };

  const handleOpenBuildings = () => {
    if (selectedBuilding) {
      if (selectedBuilding.id === 'mohit-developer-hub-hq') {
        setInteriorModalType('mohit-hub');
      } else if (selectedBuilding.id.includes('hospital')) {
        setInteriorModalType('hospital');
      } else if (selectedBuilding.id.includes('university') || selectedBuilding.id.includes('academy')) {
        setInteriorModalType('university');
      } else if (selectedBuilding.id.includes('mall') || selectedBuilding.id.includes('plaza')) {
        setInteriorModalType('mall');
      } else if (selectedBuilding.id.includes('hall') || selectedBuilding.id.includes('civic')) {
        setInteriorModalType('city-hall');
      } else {
        setInteriorModalType('mohit-hub');
      }
    } else {
      setInteriorModalType('mohit-hub');
    }
  };

  const handleOpenTimeControl = () => {
    setControlCenterTab('time_weather');
    setIsControlCenterOpen(true);
  };

  // AI Agent Handlers
  const handleSelectDirective = (directive: CityDirective) => {
    if (citySceneRef.current) {
      citySceneRef.current.agentManager.cityManager.setDirective(directive);
      setAgentSnapshot(citySceneRef.current.getAgentSnapshot());
    }
  };

  const handleTriggerFire = () => {
    if (citySceneRef.current) {
      citySceneRef.current.agentManager.triggerDowntownFire();
      setAgentSnapshot(citySceneRef.current.getAgentSnapshot());
    }
  };

  const handleTriggerAccident = () => {
    if (citySceneRef.current) {
      citySceneRef.current.agentManager.triggerAvenueAccident();
      setAgentSnapshot(citySceneRef.current.getAgentSnapshot());
    }
  };

  const handleTriggerMedical = () => {
    if (citySceneRef.current) {
      citySceneRef.current.agentManager.triggerTechDistrictMedical();
      setAgentSnapshot(citySceneRef.current.getAgentSnapshot());
    }
  };

  const handleTriggerSummit = () => {
    if (citySceneRef.current) {
      citySceneRef.current.agentManager.triggerMohitHubSummit();
      setAgentSnapshot(citySceneRef.current.getAgentSnapshot());
      handleSelectMohitHub();
    }
  };

  const handleLocateIncident = (incident: CityEvent) => {
    if (citySceneRef.current) {
      citySceneRef.current.flyToLocation(
        new THREE.Vector3(incident.location.x, incident.location.y, incident.location.z)
      );
    }
  };

  if (!webGlSupported) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
        <h1 className="text-2xl font-bold font-['Chakra_Petch'] text-cyan-400 mb-2">WebGL Unavailable</h1>
        <p className="text-sm text-slate-400 max-w-md">
          Your browser does not have WebGL hardware acceleration enabled. Please enable WebGL to explore the 3D NEON AI CITY.
        </p>
      </div>
    );
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-['Plus_Jakarta_Sans']">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Futuristic HUD Overlay */}
      <HUD
        metrics={{
          ...metrics,
          time: timeString,
          weather: {
            ...metrics.weather,
            condition: currentWeather,
          },
        }}
        cameraMode={cameraMode}
        activeDistrict={activeDistrict}
        onSetCameraMode={handleSetCameraMode}
        onSelectDistrict={handleSelectDistrict}
        onSelectMohitHub={handleSelectMohitHub}
        onOpenControlCenter={() => {
          setControlCenterTab('overview');
          setIsControlCenterOpen(true);
        }}
        onStartFlyover={handleStartFlyover}
        onExploreCity={handleExploreCity}
        onToggleAIControl={handleToggleAIControl}
        onOpenCityMap={handleOpenCityMap}
        onOpenEvents={handleOpenEvents}
        onFollowVehicles={handleFollowVehicles}
        onOpenBuildings={handleOpenBuildings}
        onOpenTimeControl={handleOpenTimeControl}
      />

      {/* Transportation Control Dashboard */}
      <TransportationDashboard
        metrics={transportMetrics}
        cameraMode={cameraMode}
        onSetDensity={handleSetDensity}
        onFollowVehicle={handleFollowVehicle}
        onFollowTrain={handleFollowTrain}
        onResetCamera={handleResetCamera}
      />

      {/* AI Autonomous Agent Hierarchy & Command Matrix */}
      <AIAgentDashboard
        snapshot={agentSnapshot}
        isOpen={isAgentDashboardOpen}
        onToggleOpen={handleToggleAIControl}
        onSelectDirective={handleSelectDirective}
        onTriggerFire={handleTriggerFire}
        onTriggerAccident={handleTriggerAccident}
        onTriggerMedical={handleTriggerMedical}
        onTriggerSummit={handleTriggerSummit}
        onLocateIncident={handleLocateIncident}
      />

      {/* Smart City Full Command Center & Interactive Map */}
      <SmartCityControlCenter
        isOpen={isControlCenterOpen}
        onClose={() => setIsControlCenterOpen(false)}
        initialTab={controlCenterTab}
        timeString={timeString}
        timeOfDay={timeOfDay}
        timeSpeed={timeSpeed}
        isPaused={isTimePaused}
        onSetTime={handleSetTime}
        onSetSpeed={handleSetTimeSpeed}
        onTogglePause={handleToggleTimePause}
        currentWeather={currentWeather}
        onSetWeather={handleSetWeather}
        economyMetrics={economyMetrics}
        energyMetrics={energyMetrics}
        agentSnapshot={agentSnapshot}
        cameraMode={cameraMode}
        onSetCameraMode={handleSetCameraMode}
        onSelectDistrict={handleSelectDistrict}
        onStartFlyover={handleStartFlyover}
        onOpenInterior={handleOpenInterior}
        onTriggerFire={handleTriggerFire}
        onTriggerAccident={handleTriggerAccident}
        onTriggerMedical={handleTriggerMedical}
        onTriggerSummit={handleTriggerSummit}
        onTriggerBlackout={handleTriggerBlackout}
      />

      {/* Building Inspector Panel */}
      {selectedBuilding && (
        <BuildingInspector
          building={selectedBuilding}
          onClose={handleCloseInspector}
          onFocus={handleFocusBuilding}
          onEnterInterior={handleOpenInterior}
        />
      )}

      {/* Interactive Building Interior Modal */}
      {interiorModalType && (
        <BuildingInteriorModal
          buildingType={interiorModalType}
          onClose={() => setInteriorModalType(null)}
          onSelectBuilding={handleOpenInterior}
        />
      )}

      {/* Controls & Navigation Guide */}
      <ControlsGuide cameraMode={cameraMode} />
    </main>
  );
}
