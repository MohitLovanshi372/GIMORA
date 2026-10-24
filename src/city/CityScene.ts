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
import { CityPhysicsEngine } from './modules/CityPhysicsEngine';
import { AssetManager } from '../assets/AssetManager';
import { addRealCityGLBModels } from './RealCityGLB';
import { missionManager } from '../simulation/MissionManager';
import { InteriorBuildingType } from '../ui/BuildingInteriorModal';
import { WeatherType } from './types';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export interface PlayerRadarTelemetry {
  x: number;
  z: number;
  heading: number;
  speedKmh: number;
  streetName: string;
  districtName: string;
}

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
  private gtaRAGEPass!: ShaderPass;
  private envMapRenderTarget: THREE.WebGLRenderTarget | null = null;
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
  public physicsEngine!: CityPhysicsEngine;
  public futureSystemsRegistry!: FutureSystemsRegistry;

  private allInteractiveObjects: THREE.Object3D[] = [];
  private cleanupRealCityGLB: (() => void) | null = null;
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

    // Generate 4K PBR Image-Based Lighting (IBL) Environment Map for Curtain Wall Glass & Metals
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileCubemapShader();
    const envScene = new THREE.Scene();
    const skyDomeGeo = new THREE.SphereGeometry(100, 32, 16);
    const skyDomeMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        uTopColor: { value: new THREE.Color(0x38bdf8) },
        uHorizonColor: { value: new THREE.Color(0xfef3c7) },
        uGroundColor: { value: new THREE.Color(0x1e293b) },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 uTopColor;
        uniform vec3 uHorizonColor;
        uniform vec3 uGroundColor;
        varying vec3 vWorldPos;
        void main() {
          float h = normalize(vWorldPos).y;
          vec3 col = h >= 0.0
            ? mix(uHorizonColor, uTopColor, pow(h, 0.55))
            : mix(uHorizonColor, uGroundColor, pow(-h, 0.4));
          gl_FragColor = vec4(col * 1.35, 1.0);
        }
      `,
    });
    const skyDome = new THREE.Mesh(skyDomeGeo, skyDomeMat);
    envScene.add(skyDome);

    // Bright solar specular disc in environment map for realistic curtain-wall glints
    const sunDisc = new THREE.Mesh(
      new THREE.SphereGeometry(8, 16, 16),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(6) })
    );
    sunDisc.position.set(45, 65, 35);
    envScene.add(sunDisc);

    this.envMapRenderTarget = pmremGenerator.fromScene(envScene, 0.02);
    this.scene.environment = this.envMapRenderTarget.texture;
    skyDomeGeo.dispose();
    skyDomeMat.dispose();
    pmremGenerator.dispose();

    this.container.appendChild(this.renderer.domElement);

    // 3. Camera & Controls
    this.cameraController = createCityCamera(this.renderer.domElement, width / height);

    // 3b. Cinematic Post-Processing Pipeline (Carefully Tuned Filmic Bloom & Tone Mapping)
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.cameraController.camera);
    this.composer.addPass(renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.34, // bloom strength: GTA V style solar & automotive LED halation
      0.42, // bloom radius: soft natural atmospheric bloom
      0.82  // bloom threshold: captures sun disc, car headlights/taillights, and neon signage
    );
    this.composer.addPass(this.bloomPass);

    // 3c. GTA V RAGE Engine Filmic Color Grading, Contrast & Solar Anamorphic Lens Flare Pass
    const gtaRAGEShader = {
      uniforms: {
        tDiffuse: { value: null },
        uSunScreenPos: { value: new THREE.Vector2(0.5, 0.75) },
        uSunVisible: { value: 1.0 },
        uAspect: { value: width / height },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 uSunScreenPos;
        uniform float uSunVisible;
        uniform float uAspect;
        varying vec2 vUv;

        void main() {
          // Subtle radial lens chromatic dispersion at outer viewport edges
          vec2 centerOffset = vUv - 0.5;
          float edgeDist = dot(centerOffset, centerOffset);
          vec2 caShift = centerOffset * edgeDist * 0.0045;

          float r = texture2D(tDiffuse, vUv + caShift).r;
          float g = texture2D(tDiffuse, vUv).g;
          float b = texture2D(tDiffuse, vUv - caShift).b;
          vec3 col = vec3(r, g, b);

          // GTA V Los Santos Filmic S-Curve Contrast & Warm California Highlight Grading
          float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
          // Vibrance boost (saturates mid-tones while protecting skin/highlight clipping)
          float satAmount = 1.18;
          col = mix(vec3(luma), col, satAmount);

          // Warm golden-amber tint in bright highlights + cool slate-blue shadow toe
          vec3 shadowTint = vec3(0.95, 0.98, 1.04);
          vec3 highlightTint = vec3(1.05, 1.01, 0.94);
          col *= mix(shadowTint, highlightTint, smoothstep(0.15, 0.85, luma));

          // Gentle filmic S-curve contrast
          col = clamp(col, 0.0, 1.0);
          col = mix(col, smoothstep(0.02, 0.98, col), 0.22);

          // Screen-Space Solar Anamorphic Lens Flare & Ghost Halos (when looking toward sun)
          if (uSunVisible > 0.01) {
            vec2 sunDelta = vUv - uSunScreenPos;
            sunDelta.x *= uAspect;
            float dSun = length(sunDelta);

            // Warm solar glare & horizontal anamorphic lens streak
            float sunGlare = exp(-dSun * 4.5) * 0.24;
            float anamorphic = exp(-abs(sunDelta.y) * 34.0) * exp(-abs(sunDelta.x) * 2.2) * 0.18;

            // Secondary lens ghost rings along center axis
            vec2 ghostPos1 = vec2(0.5) - (uSunScreenPos - vec2(0.5)) * 0.55;
            vec2 ghostDelta1 = (vUv - ghostPos1) * vec2(uAspect, 1.0);
            float ghost1 = smoothstep(0.11, 0.0, abs(length(ghostDelta1) - 0.07)) * 0.06;

            vec2 ghostPos2 = vec2(0.5) - (uSunScreenPos - vec2(0.5)) * 1.15;
            vec2 ghostDelta2 = (vUv - ghostPos2) * vec2(uAspect, 1.0);
            float ghost2 = exp(-length(ghostDelta2) * 14.0) * 0.08;

            vec3 flareColor = vec3(1.0, 0.84, 0.52);
            col += flareColor * (sunGlare + anamorphic + ghost1 + ghost2) * uSunVisible;
          }

          // Subtle cinematic optical vignette
          float vig = 1.0 - edgeDist * 0.32;
          col *= clamp(vig, 0.72, 1.0);

          gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
        }
      `,
    };
    this.gtaRAGEPass = new ShaderPass(gtaRAGEShader);
    this.composer.addPass(this.gtaRAGEPass);

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
    this.cityLifeManager.registerWindowMaterial(this.materials.glassCyan, 'technology', 0xfef3c7);
    this.cityLifeManager.scanAndRegisterWindowMaterials(this.scene);
    this.economyManager = new CityEconomyManager();
    this.energyManager = new SmartEnergyManager();
    this.buildingActivityManager = new BuildingActivityManager(this.scene, this.materials);
    this.cinematicTourManager = new CinematicTourManager(this.cameraController.camera);
    this.worldChunkManager = new WorldChunkManager(this.scene);

    // Initialize 3D Spatial Physics & Collision Engine and register all city buildings & landmarks
    this.physicsEngine = new CityPhysicsEngine();
    this.physicsEngine.registerBuildingsList(this.buildingsManager.allBuildingsData);
    this.physicsEngine.registerBuildingsList(this.railwayDistrict.buildingsData);
    this.physicsEngine.registerBuildingsList(this.riverDistrict.buildingsData);
    this.physicsEngine.registerBuildingsList(this.airportDistrict.buildingsData);
    this.physicsEngine.initStaticCityBlockColliders(this.buildingsManager.allBuildingsData);
    this.cleanupRealCityGLB = addRealCityGLBModels(this.scene, this.physicsEngine);

    this.cameraController.setPhysicsEngine(this.physicsEngine);
    this.trafficManager.setPhysicsEngine(this.physicsEngine);
    this.playerSystem = new PlayerSystem(
      this.scene,
      (type) => this.callbacks.onInteractBuilding?.(type),
      this.physicsEngine
    );

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
        center: [145, 0, -46],
        bounds: [40, 40],
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
    if (this.gtaRAGEPass) {
      this.gtaRAGEPass.uniforms.uAspect.value = width / height;
    }
  };

  private mapBuildingToInteriorType(building: BuildingData): InteriorBuildingType {
    const id = building.id.toLowerCase();
    const cat = building.category.toLowerCase();
    if (id === 'mohit-developer-hub-hq' || building.districtId === 'technology') return 'mohit-hub';
    if (id.includes('hospital') || id.includes('emergency') || id.includes('pharm') || building.districtId === 'healthcare') return 'hospital';
    if (id.includes('university') || id.includes('college') || id.includes('school') || id.includes('library') || building.districtId === 'education') return 'university';
    if (id.includes('mall') || id.includes('galleria') || id.includes('megaplex')) return 'mall';
    if (id.includes('airport') || id.includes('skyport')) return 'airport';
    if (id.includes('rail') || cat.includes('transit')) return 'railway';
    if (id.includes('cultural') || id.includes('hall') || id.includes('civic')) return 'city-hall';
    return 'corporate-office';
  }

  private onPointerClick = (event: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.cameraController.camera);
    const intersects = this.raycaster.intersectObjects(this.allInteractiveObjects, true);

    if (intersects.length > 0) {
      let hitObj: THREE.Object3D | null = intersects[0].object;
      let clickedEntryGate = Boolean(hitObj?.userData?.isEntryGate);
      while (hitObj && !hitObj.userData.buildingData && hitObj.parent) {
        if (hitObj.userData?.isEntryGate) clickedEntryGate = true;
        hitObj = hitObj.parent;
      }

      if (hitObj && hitObj.userData.buildingData) {
        if (hitObj.userData?.isEntryGate) clickedEntryGate = true;
        const buildingData = hitObj.userData.buildingData as BuildingData;
        this.selectBuilding(hitObj, buildingData);
        if (clickedEntryGate) {
          this.focusBuildingEntryGate(buildingData);
          this.callbacks.onInteractBuilding?.(this.mapBuildingToInteriorType(buildingData));
        }
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

  /**
   * Flies the 3D camera directly to street level in front of a building's 3D Entry Gate
   * so the user can look straight through the open sliding doors into the 3D ground-floor room.
   */
  public focusBuildingEntryGate(building: BuildingData) {
    const [bx, , bz] = building.position;
    const d = building.dimensions[2] || 22;
    const isMohitHub = building.id === 'mohit-developer-hub-hq';

    const targetPos = isMohitHub
      ? new THREE.Vector3(bx, 5.8, bz)
      : new THREE.Vector3(bx, 2.5, bz + d / 2 - 1);

    const cameraPos = isMohitHub
      ? new THREE.Vector3(bx - 22, 8.2, bz + 16)
      : new THREE.Vector3(bx + 2, 3.6, bz + d / 2 + 16);

    this.cameraController.setMode('orbit');
    this.cameraController.flyTo(targetPos, cameraPos, 1.2);
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

  public focusDubaiLandmark(landmarkId: string) {
    const landmark = this.buildingsManager.allBuildingsData.find(
      (b) => b.id === landmarkId || b.id.includes(landmarkId) || landmarkId.includes(b.id)
    );
    if (landmark) {
      this.focusBuilding(landmark);
      const mesh = this.buildingsManager.interactiveMeshes.find(
        (m) => m.userData?.buildingData?.id === landmark.id
      );
      if (mesh) {
        this.selectBuilding(mesh, landmark);
      }
    } else {
      // Downtown Dubai skyline focus
      this.cameraController.flyTo(
        new THREE.Vector3(-132, 60, -52),
        new THREE.Vector3(-60, 95, 45),
        1.5
      );
    }
  }

  public focusSingapore() {
    const mbs = this.buildingsManager.allBuildingsData.find(
      (b) => b.id === 'singapore-marina-bay-sands'
    );
    if (mbs) {
      this.focusBuilding(mbs);
      const mesh = this.buildingsManager.interactiveMeshes.find(
        (m) => m.userData?.buildingData?.id === mbs.id
      );
      if (mesh) this.selectBuilding(mesh, mbs);
    } else {
      this.cameraController.flyTo(
        new THREE.Vector3(-140, 65, 125),
        new THREE.Vector3(-90, 95, 195),
        1.6
      );
    }
  }

  public focusParis() {
    const eiffel = this.buildingsManager.allBuildingsData.find(
      (b) => b.id === 'paris-eiffel-tower'
    );
    if (eiffel) {
      this.focusBuilding(eiffel);
      const mesh = this.buildingsManager.interactiveMeshes.find(
        (m) => m.userData?.buildingData?.id === eiffel.id
      );
      if (mesh) this.selectBuilding(mesh, eiffel);
    } else {
      this.cameraController.flyTo(
        new THREE.Vector3(-72, 65, -125),
        new THREE.Vector3(-35, 95, -55),
        1.6
      );
    }
  }

  public focusAmerica() {
    const esb = this.buildingsManager.allBuildingsData.find(
      (b) => b.id === 'america-empire-state-building'
    );
    if (esb) {
      this.focusBuilding(esb);
      const mesh = this.buildingsManager.interactiveMeshes.find(
        (m) => m.userData?.buildingData?.id === esb.id
      );
      if (mesh) this.selectBuilding(mesh, esb);
    } else {
      this.cameraController.flyTo(
        new THREE.Vector3(72, 80, -60),
        new THREE.Vector3(35, 125, 10),
        1.6
      );
    }
  }

  public focusAirport() {
    const terminal = this.airportDistrict.interactiveMeshes[0];
    if (terminal?.userData?.buildingData) {
      this.focusBuilding(terminal.userData.buildingData);
      this.selectBuilding(terminal, terminal.userData.buildingData);
    } else {
      this.cameraController.flyTo(
        new THREE.Vector3(120, 65, -255),
        new THREE.Vector3(180, 15, -335),
        1.6
      );
    }
  }

  public focusRailway() {
    const terminal = this.railwayDistrict.interactiveMeshes[0];
    if (terminal?.userData?.buildingData) {
      this.focusBuilding(terminal.userData.buildingData);
      this.selectBuilding(terminal, terminal.userData.buildingData);
    } else {
      this.cameraController.flyTo(
        new THREE.Vector3(-140, 55, -135),
        new THREE.Vector3(-140, 15, -190),
        1.6
      );
    }
  }

  public placeCustomModel(model: THREE.Object3D) {
    const cam = this.cameraController.camera;
    const spawnPos = new THREE.Vector3(
      cam.position.x + 10,
      1,
      cam.position.z - 15
    );
    model.position.copy(spawnPos);
    this.scene.add(model);
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

  public flyToLocation(target: THREE.Vector3, duration = 1.25) {
    this.cinematicTourManager.stopTour();
    this.cameraController.setMode('orbit');
    const lookTarget = new THREE.Vector3(target.x, Math.max(2.5, target.y + 2.0), target.z);
    const camPos = new THREE.Vector3(target.x - 26, Math.max(18, target.y + 20), target.z + 26);
    this.cameraController.flyTo(lookTarget, camPos, duration);
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

  public getPlayerRadarTelemetry(): PlayerRadarTelemetry {
    const isWalk = this.cameraController.mode === 'first-person' || this.cameraController.mode === 'third-person';
    const pos = isWalk ? this.playerSystem.position : this.cameraController.camera.position;
    const x = pos.x;
    const z = pos.z;

    let heading = 0;
    if (this.cameraController.mode === 'third-person') {
      heading = (this.playerSystem as any).rotationY ?? 0;
    } else {
      const dir = new THREE.Vector3();
      this.cameraController.camera.getWorldDirection(dir);
      heading = Math.atan2(dir.x, dir.z);
    }

    // Determine street name based on nearest road corridor
    let streetName = 'Metropolitan Grand Blvd';
    if (Math.abs(x) < 38) streetName = 'Vespucci River Bridgeway';
    else if (Math.abs(z - -220) < 35) streetName = 'Grand Central Rail Corridor';
    else if (x > 95 && z < -230) streetName = 'Los Santos International Runway';
    else if (Math.abs(x - -100) < 25) streetName = 'Del Perro Financial Ave';
    else if (Math.abs(x - 100) < 25) streetName = 'Silicon Innovation Pkwy';
    else if (Math.abs(x - -180) < 25) streetName = 'Marina Bay Promenade';
    else if (Math.abs(x - 180) < 25) streetName = 'Rockford Hills Blvd';
    else if (Math.abs(z) < 25) streetName = 'Central Liberty Concourse';
    else if (Math.abs(z - 160) < 25) streetName = 'South Harbor Expressway';
    else if (Math.abs(z - -160) < 25) streetName = 'Champs-Élysées North Ave';

    // Determine district name
    let districtName = 'Downtown Financial Core';
    if (x > 90 && z < -230) districtName = 'International Airport (LSIA)';
    else if (Math.abs(z - -220) < 32) districtName = 'Grand Central Railway';
    else if (Math.abs(x) < 38) districtName = 'Riverside Waterfront';
    else if (x < -120 && z > 35 && z < 130) districtName = 'Singapore Marina Bay';
    else if (x < -25 && x > -115 && z < -95) districtName = 'Paris Champs-Élysées';
    else if (x > 35 && x < 140 && z < -25 && z > -115) districtName = 'Midtown Manhattan & Tech Hub';
    else if (x < -120 && z > 130) districtName = 'Medical Center District';
    else if (x < -120 && z < -130) districtName = 'University Campus';
    else if (x > 35 && z > 50) districtName = 'Vinewood Residential Hills';

    return {
      x,
      z,
      heading,
      speedKmh: isWalk ? 18 : 64,
      streetName,
      districtName,
    };
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
    this.trafficManager.update(delta, this.playerSystem.position);
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

    // Update GTA V Screen-Space Sun Lens Flare & Night Bloom Intensity
    if (this.gtaRAGEPass && this.environmentSystem) {
      const sunWorld = this.environmentSystem.dirLight.position.clone().normalize().multiplyScalar(600);
      const cam = this.cameraController.camera;
      const camDir = new THREE.Vector3();
      cam.getWorldDirection(camDir);
      const toSun = sunWorld.clone().sub(cam.position).normalize();
      const dotSun = camDir.dot(toSun);

      if (dotSun > 0.15 && !this.cityLifeManager.isNight() && !this.weatherManager.isRaining()) {
        const projected = sunWorld.project(cam);
        const sx = (projected.x + 1) * 0.5;
        const sy = (projected.y + 1) * 0.5;
        this.gtaRAGEPass.uniforms.uSunScreenPos.value.set(sx, sy);
        const edgeFade = Math.max(0, 1.0 - Math.hypot(sx - 0.5, sy - 0.5) * 1.45);
        this.gtaRAGEPass.uniforms.uSunVisible.value = THREE.MathUtils.clamp((dotSun - 0.15) * 1.6 * edgeFade, 0, 1);
      } else {
        this.gtaRAGEPass.uniforms.uSunVisible.value = 0.0;
      }

      // Boost bloom slightly at night or in rain for vivid GTA V neon reflections
      const isNightOrRain = this.cityLifeManager.isNight() || this.weatherManager.isRaining();
      this.bloomPass.strength = isNightOrRain ? 0.52 : 0.34;
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
    if (this.envMapRenderTarget) {
      this.envMapRenderTarget.dispose();
      this.envMapRenderTarget = null;
    }

    this.trafficManager.dispose();
    this.environmentSystem.dispose();
    this.riverDistrict.dispose();
    this.roadsSystem.dispose();
    this.railwayDistrict.dispose();
    this.buildingsManager.dispose();
    this.cleanupRealCityGLB?.();
    this.cleanupRealCityGLB = null;
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
