/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { BuildingData, CameraMode, DistrictId, TrafficDensityLevel, TransportationMetrics } from './types';
import { createCityMaterials, CityMaterials } from '../assets/materials';
import { createEnvironment, EnvironmentSystem } from '../environment/EnvironmentManager';
import { createRiverDistrict, RiverDistrictSystem } from '../river/RiverDistrict';
import { createRoadsAndDetails, RoadsAndDetailsSystem } from '../roads/RoadsAndDetails';
import { createRailwayDistrict, RailwayDistrictSystem } from '../railway/RailwayDistrict';
import { createBuildingsManager, BuildingsManagerSystem } from '../buildings/BuildingsManager';
import { createDistrictManager, DistrictManagerSystem, DISTRICT_REGISTRY } from '../districts/DistrictManager';
import { createCityCamera, CameraController } from './modules/camera';
import { FutureSystemsRegistry } from './modules/futureSystems';
import { TrafficManager } from '../transportation/TrafficManager';
import { AgentManager, AgentManagerSnapshot } from '../simulation/AgentManager';
import { createAirportDistrict, AirportDistrictSystem } from '../districts/AirportDistrict';
import { WeatherManager } from '../simulation/WeatherManager';
import { CityLifeManager } from '../simulation/CityLifeManager';
import { CityEconomyManager } from '../simulation/CityEconomyManager';
import { SmartEnergyManager } from '../simulation/SmartEnergyManager';
import { BuildingActivityManager } from '../simulation/BuildingActivityManager';
import { CinematicTourManager } from './modules/CinematicTourManager';
import { WorldChunkManager } from './modules/WorldChunkManager';
import { PlayerSystem, InteractionPrompt } from './modules/PlayerSystem';
import { AssetManager } from '../assets/AssetManager';
import { missionManager } from '../simulation/MissionManager';
import { InteriorBuildingType } from '../ui/BuildingInteriorModal';
import { WeatherType } from './types';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export interface CitySceneCallbacks {
  onBuildingSelect: (building: BuildingData | null) => void;
  onFpsUpdate?: (fps: number) => void;
  onInteractionPrompt?: (prompt: InteractionPrompt | null) => void;
  onInteractBuilding?: (type: InteriorBuildingType) => void;
}

export class CityScene {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private composer!: EffectComposer;
  private bloomPass!: UnrealBloomPass;
  private scene!: THREE.Scene;
  private cameraController!: CameraController;
  private raycaster!: THREE.Raycaster;
  private mouse!: THREE.Vector2;
  private clock!: THREE.Clock;
  private animationFrameId: number | null = null;

  // Subsystems
  public materials!: CityMaterials;
  public environmentSystem!: EnvironmentSystem;
  public riverDistrict!: RiverDistrictSystem;
  public roadsSystem!: RoadsAndDetailsSystem;
  public railwayDistrict!: RailwayDistrictSystem;
  public buildingsManager!: BuildingsManagerSystem;
  public districtManager!: DistrictManagerSystem;
  public trafficManager!: TrafficManager;
  public agentManager!: AgentManager;
  public airportDistrict!: AirportDistrictSystem;
  public weatherManager!: WeatherManager;
  public cityLifeManager!: CityLifeManager;
  public economyManager!: CityEconomyManager;
  public energyManager!: SmartEnergyManager;
  public buildingActivityManager!: BuildingActivityManager;
  public cinematicTourManager!: CinematicTourManager;
  public worldChunkManager!: WorldChunkManager;
  public playerSystem!: PlayerSystem;
  public futureSystemsRegistry!: FutureSystemsRegistry;

  private allInteractiveObjects: THREE.Object3D[] = [];
  private callbacks: CitySceneCallbacks;

  // Highlight Box Helper for selected building
  private selectionBox: THREE.BoxHelper | null = null;
  private selectedObject: THREE.Object3D | null = null;

  constructor(container: HTMLElement, callbacks: CitySceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.init();
  }

  private init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.container.appendChild(this.renderer.domElement);

    // 3. Camera & Controls
    this.cameraController = createCityCamera(this.renderer.domElement, width / height);

    // 3b. Cinematic Post-Processing Pipeline (Carefully Tuned Filmic Bloom & Tone Mapping)
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.cameraController.camera);
    this.composer.addPass(renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.46, // bloom strength: subtle glowing luminescence
      0.38, // bloom radius: organic spread
      0.68  // bloom threshold: preserves architectural crispness, glows neon & emissive lights
    );
    this.composer.addPass(this.bloomPass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);

    // 4. Clock & Raycasting
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // 5. Initialize Subsystems in order
    this.materials = createCityMaterials();
    this.environmentSystem = createEnvironment(this.scene, this.materials);
    this.riverDistrict = createRiverDistrict(this.scene, this.materials);
    this.roadsSystem = createRoadsAndDetails(this.scene, this.materials);
    this.railwayDistrict = createRailwayDistrict(this.scene, this.materials);
    this.buildingsManager = createBuildingsManager(this.scene, this.materials);
    this.districtManager = createDistrictManager(this.scene, this.materials);
    this.trafficManager = new TrafficManager(this.scene);
    this.agentManager = new AgentManager(this.scene, this.trafficManager);
    this.airportDistrict = createAirportDistrict(this.scene, this.materials);
    this.weatherManager = new WeatherManager(this.scene, this.materials, this.environmentSystem);
    this.cityLifeManager = new CityLifeManager(this.scene, this.environmentSystem, this.buildingsManager.windowMaterials);
    this.cityLifeManager.registerWindowMaterial(this.materials.glassCyan, 'technology', 0x00f0ff);
    this.cityLifeManager.scanAndRegisterWindowMaterials(this.scene);
    this.economyManager = new CityEconomyManager();
    this.energyManager = new SmartEnergyManager();
    this.buildingActivityManager = new BuildingActivityManager(this.scene, this.materials);
    this.cinematicTourManager = new CinematicTourManager(this.cameraController.camera);
    this.worldChunkManager = new WorldChunkManager(this.scene);
    this.playerSystem = new PlayerSystem(this.scene, (type) => this.callbacks.onInteractBuilding?.(type));

    // Gather all clickable objects
    this.allInteractiveObjects = [
      ...this.buildingsManager.interactiveMeshes,
      ...this.railwayDistrict.interactiveMeshes,
      ...this.riverDistrict.interactiveMeshes,
      ...this.airportDistrict.interactiveMeshes,
    ];

    // 6. Future Systems Registry
    this.futureSystemsRegistry = new FutureSystemsRegistry();
    this.futureSystemsRegistry.init({
      scene: this.scene,
      roadWaypoints: [],
      transitWaypoints: this.railwayDistrict.trackWaypoints.flat(),
      pedestrianWaypoints: [],
      landmarkArea: {
        center: [140, 0, -80],
        bounds: [42, 42],
      },
    });

    // 7. Event Listeners
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.cameraController.onKeyDown);
    window.addEventListener('keyup', this.cameraController.onKeyUp);
    this.renderer.domElement.addEventListener('click', this.onPointerClick);

    // Start animation loop
    this.animate();
  }

  private onResize = () => {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.cameraController.camera.aspect = width / height;
    this.cameraController.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    this.bloomPass.resolution.set(width, height);
  };

  private onPointerClick = (event: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.cameraController.camera);
    const intersects = this.raycaster.intersectObjects(this.allInteractiveObjects, true);

    if (intersects.length > 0) {
      let hitObj: THREE.Object3D | null = intersects[0].object;
      while (hitObj && !hitObj.userData.buildingData && hitObj.parent) {
        hitObj = hitObj.parent;
      }

      if (hitObj && hitObj.userData.buildingData) {
        const buildingData = hitObj.userData.buildingData as BuildingData;
        this.selectBuilding(hitObj, buildingData);
        return;
      }
    }
  };

  public selectBuilding(object: THREE.Object3D, data: BuildingData) {
    this.selectedObject = object;

    if (this.selectionBox) {
      this.scene.remove(this.selectionBox);
      this.selectionBox.dispose();
      this.selectionBox = null;
    }

    const boxColor = data.id === 'mohit-developer-hub-hq' ? 0x00ffcc : 0x00f0ff;
    this.selectionBox = new THREE.BoxHelper(object, boxColor);
    this.scene.add(this.selectionBox);

    this.callbacks.onBuildingSelect(data);
  }

  public clearSelection() {
    if (this.selectionBox) {
      this.scene.remove(this.selectionBox);
      this.selectionBox.dispose();
      this.selectionBox = null;
    }
    this.selectedObject = null;
    this.callbacks.onBuildingSelect(null);
  }

  public focusBuilding(building: BuildingData) {
    const targetPos = new THREE.Vector3(
      building.position[0],
      building.height * 0.45,
      building.position[2]
    );

    const dist = Math.max(65, building.height * 0.95);
    const cameraPos = new THREE.Vector3(
      building.position[0] - dist * 0.65,
      building.height * 0.65 + 30,
      building.position[2] + dist * 0.75
    );

    this.cameraController.flyTo(targetPos, cameraPos, 1.4);
  }

  public focusDistrict(districtId: DistrictId) {
    const info = DISTRICT_REGISTRY[districtId];
    if (info) {
      this.cameraController.flyTo(
        new THREE.Vector3(...info.center),
        new THREE.Vector3(...info.cameraTarget),
        1.5
      );
    }
  }

  public focusMohitHub() {
    const hub = this.buildingsManager.mohitHub.buildingData;
    this.focusBuilding(hub);
    this.selectBuilding(this.buildingsManager.mohitHub.interactiveMeshes[0], hub);
  }

  public setCameraMode(mode: CameraMode) {
    this.cameraController.setMode(mode);
  }

  public getCameraMode(): CameraMode {
    return this.cameraController.mode;
  }

  public setTrafficDensity(level: TrafficDensityLevel) {
    this.trafficManager.setDensityLevel(level);
  }

  public getTransportationMetrics(): TransportationMetrics {
    return this.trafficManager.getMetrics();
  }

  public followVehicle() {
    this.trafficManager.selectNextTrackedVehicle();
    this.setCameraMode('follow-vehicle');
  }

  public followTrain() {
    this.setCameraMode('follow-train');
  }

  public getAgentSnapshot(): AgentManagerSnapshot {
    return this.agentManager.getSnapshot();
  }

  public flyToLocation(target: THREE.Vector3, duration = 1.4) {
    const camPos = new THREE.Vector3(target.x - 45, target.y + 40, target.z + 45);
    this.cameraController.flyTo(target, camPos, duration);
  }

  public startFlyoverTour() {
    this.cameraController.setMode('city-flyover');
    this.cinematicTourManager.startTour();
  }

  public stopFlyoverTour() {
    this.cinematicTourManager.stopTour();
    this.cameraController.setMode('orbit');
  }

  public setWeather(type: WeatherType) {
    this.weatherManager.setWeather(type);
  }

  public setTimeOfDay(hour: number) {
    this.cityLifeManager.setTime(hour);
  }

  public setTimeSpeed(speed: number) {
    this.cityLifeManager.setSpeed(speed);
  }

  public toggleTimePause() {
    this.cityLifeManager.togglePause();
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Update Subsystems
    this.environmentSystem.update(elapsedTime);
    this.riverDistrict.update(elapsedTime);
    this.roadsSystem.update(elapsedTime);
    this.railwayDistrict.update(elapsedTime);
    this.buildingsManager.update(elapsedTime);
    this.districtManager.update(elapsedTime);
    this.airportDistrict.update(elapsedTime);

    // Weather & Living City
    this.weatherManager.update(delta, elapsedTime);
    this.trafficManager.weatherSpeedMultiplier = this.weatherManager.getSpeedMultiplier();
    this.cityLifeManager.update(delta);
    this.buildingActivityManager.update(delta, elapsedTime);

    // Economy & Energy
    this.economyManager.update(
      delta,
      this.trafficManager.vehicleSpawner.activeVehicles.length,
      this.trafficManager.railwayManager.getActiveTrainCount()
    );
    this.energyManager.update(delta);

    // Traffic & Autonomous Agents
    this.trafficManager.update(delta);
    this.agentManager.update(delta, this.cityLifeManager.getTimeString());

    // Player Exploration & Building Interaction Detection
    const prompt = this.playerSystem.update(delta, this.cameraController.mode, this.cameraController.camera);
    this.callbacks.onInteractionPrompt?.(prompt);
    missionManager.updatePlayerPosition(this.playerSystem.position);

    // World Chunk Streaming & Asset Mixers
    AssetManager.update(delta);
    this.worldChunkManager.update(this.cameraController.camera.position);

    // Guided Flyover Tour Check
    if (this.cinematicTourManager.isActive()) {
      this.cinematicTourManager.update(delta);
    } else {
      // Determine follow target for camera if in follow mode
      let followTarget: THREE.Object3D | null = null;
      const currentMode = this.cameraController.mode;
      if (currentMode === 'follow-vehicle') {
        followTarget = this.trafficManager.getTrackedVehicle()?.mesh || null;
      } else if (currentMode === 'follow-train') {
        followTarget = this.trafficManager.railwayManager.getLeadPassengerTrain()?.mesh || null;
      }
      this.cameraController.update(delta, followTarget);
    }

    this.futureSystemsRegistry.update(delta, elapsedTime);

    if (this.selectionBox && this.selectedObject) {
      this.selectionBox.update();
    }

    this.composer.render();
  };

  public dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.cameraController.onKeyDown);
    window.removeEventListener('keyup', this.cameraController.onKeyUp);
    this.renderer.domElement.removeEventListener('click', this.onPointerClick);

    if (this.selectionBox) {
      this.scene.remove(this.selectionBox);
      this.selectionBox.dispose();
      this.selectionBox = null;
    }

    this.composer.dispose();

    this.trafficManager.dispose();
    this.environmentSystem.dispose();
    this.riverDistrict.dispose();
    this.roadsSystem.dispose();
    this.railwayDistrict.dispose();
    this.buildingsManager.dispose();
    this.districtManager.dispose();
    this.airportDistrict.dispose();
    this.weatherManager.dispose();
    this.buildingActivityManager.dispose();
    this.playerSystem.dispose();
    this.worldChunkManager.dispose();
    AssetManager.dispose();
    this.cameraController.dispose();
    this.futureSystemsRegistry.dispose();
    this.agentManager.dispose();

    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
