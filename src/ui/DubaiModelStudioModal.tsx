/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import {
  X,
  Download,
  Upload,
  Eye,
  CheckCircle2,
  Box,
  Compass,
  Sparkles,
  Layers,
  FileCode,
  Building,
  Car,
  Ship,
  Maximize2,
} from 'lucide-react';
import { GLBModelService, GLBModelMetadata } from '../services/GLBModelService';

interface DubaiModelStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlyToLandmark?: (landmarkId: string) => void;
  onPlaceModelInCity?: (model: THREE.Object3D) => void;
}

interface PresetModelDef {
  id: string;
  name: string;
  category: 'Landmark' | 'Vehicle' | 'Marine';
  description: string;
  height: string;
  icon: React.ReactNode;
  tags: string[];
}

const DUBAI_PRESET_MODELS: PresetModelDef[] = [
  {
    id: 'burj-khalifa',
    name: 'Burj Khalifa',
    category: 'Landmark',
    description: 'The world’s tallest megatall skyscraper (285m). Features 27 helical stepped setbacks, Y-shaped floorplan, Armani Hotel, Level 148 "At the Top SKY" deck, and pinnacle spire with aviation beacons.',
    height: '285m (828m equivalent)',
    icon: <Building className="w-4 h-4 text-amber-400" />,
    tags: ['Megatall', '27 Setbacks', 'PBR Glass', 'Dubai Fountain'],
  },
  {
    id: 'burj-al-arab',
    name: 'Burj Al Arab Jumeirah',
    category: 'Landmark',
    description: 'Iconic 7-star sail-shaped luxury hotel on an offshore island. Features double-curved PTFE sail facade, white exoskeleton bow trusses, cantilevered rooftop helipad, and private causeway.',
    height: '120m (321m equivalent)',
    icon: <Building className="w-4 h-4 text-cyan-400" />,
    tags: ['Dhow Sail', 'Island Helipad', 'Skyview Lounge', 'Causeway'],
  },
  {
    id: 'museum-of-future',
    name: 'Museum of the Future',
    category: 'Landmark',
    description: 'Torus-shaped architectural wonder on Sheikh Zayed Road. Clad in brushed stainless steel with laser-etched Arabic poetry calligraphy quotes from Sheikh Mohammed bin Rashid Al Maktoum.',
    height: '77m Torus Ring',
    icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
    tags: ['Toroid Ring', 'Arabic Calligraphy', 'Platinum LEED', 'Podium'],
  },
  {
    id: 'dubai-frame',
    name: 'The Dubai Frame',
    category: 'Landmark',
    description: 'Monumental golden architectural picture frame connecting Old and New Dubai. Twin 75m towers clad in 24k gold Islamic star filigree with a 48m glass-floored skybridge.',
    height: '75m (150m equivalent)',
    icon: <Box className="w-4 h-4 text-amber-500" />,
    tags: ['Gold Lattice', 'Glass Skybridge', 'Zabeel Park', 'Filigree'],
  },
  {
    id: 'cayan-tower',
    name: 'Cayan Tower (Infinity Tower)',
    category: 'Landmark',
    description: 'Iconic 90-degree twisting architectural skyscraper in Dubai Marina. Features progressive 1.2° floorplate rotation around a cylindrical core with azure solar curtain wall glass.',
    height: '105m (306m equivalent)',
    icon: <Building className="w-4 h-4 text-sky-400" />,
    tags: ['90° Twist', 'Dubai Marina', 'Solar Azure Glass', 'Helical'],
  },
  {
    id: 'dubai-police-supercar',
    name: 'Dubai Police Pursuit Hypercar',
    category: 'Vehicle',
    description: 'World-renowned high-speed pursuit hypercar in official Dubai Police white and emerald green livery, low-profile flashing red/blue strobe lightbar, and carbon-fiber rear aero wing.',
    height: '1.25m Hypercar',
    icon: <Car className="w-4 h-4 text-emerald-400" />,
    tags: ['Dubai Police', 'Emerald Livery', 'Twin Strobes', 'Hypercar'],
  },
  {
    id: 'dubai-mega-yacht',
    name: 'Dubai Marina Luxury Mega-Yacht',
    category: 'Marine',
    description: 'Three-deck luxury motor yacht moored in the Dubai Marina waterway. Features teak deck planks, observation bridge, sun deck with communications radome, and swim platform.',
    height: '6.5m Superyacht',
    icon: <Ship className="w-4 h-4 text-cyan-300" />,
    tags: ['3 Decks', 'Teak Wood', 'Marine White', 'Arabian Gulf'],
  },
];

/**
 * Builds authentic high-detail 3D geometry and materials for preset models
 */
export function createPreset3DModel(presetId: string): THREE.Group {
  const group = new THREE.Group();
  group.name = `preset_${presetId}`;

  if (presetId === 'burj-khalifa') {
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.12,
      metalness: 0.88,
    });
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.2,
      metalness: 0.92,
    });
    const lakeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.8,
    });

    // Fountain Lake Base
    const lake = new THREE.Mesh(new THREE.CylinderGeometry(14, 15, 0.4, 24), lakeMat);
    lake.position.y = 0.2;
    group.add(lake);

    // Stepped Hexagonal Podium
    const podium = new THREE.Mesh(new THREE.CylinderGeometry(8, 10, 1.8, 6), steelMat);
    podium.position.y = 1.1;
    group.add(podium);

    // Stepped Tiers with Y-Wings
    const tiers = 14;
    let currY = 2.0;
    const towerH = 46;
    const tierH = towerH / tiers;

    for (let t = 0; t < tiers; t++) {
      const p = t / tiers;
      const rad = Math.max(0.8, 6.2 * (1 - p * 0.85));

      // Hex core
      const core = new THREE.Mesh(
        new THREE.CylinderGeometry(rad * 0.5, rad * 0.55, tierH, 6),
        glassMat
      );
      core.position.y = currY + tierH / 2;
      group.add(core);

      // 3 Wings
      for (let w = 0; w < 3; w++) {
        const ang = (w * Math.PI * 2) / 3 + p * 0.3;
        const wLen = rad * 0.9;
        const wing = new THREE.Mesh(
          new THREE.BoxGeometry(rad * 0.4, tierH, wLen),
          glassMat
        );
        wing.position.set(
          Math.sin(ang) * (wLen / 2 + rad * 0.2),
          currY + tierH / 2,
          Math.cos(ang) * (wLen / 2 + rad * 0.2)
        );
        wing.rotation.y = ang;
        group.add(wing);
      }
      currY += tierH;
    }

    // Observation Ring
    const obs = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 2.2, 1.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.1 })
    );
    obs.position.y = currY - 8;
    group.add(obs);

    // Spire
    const spire1 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 7, 8), steelMat);
    spire1.position.y = currY + 3.5;
    group.add(spire1);

    const spire2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.5, 6, 8), steelMat);
    spire2.position.y = currY + 10;
    group.add(spire2);

    // Red Obstruction Beacon
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xdc2626 })
    );
    beacon.position.y = currY + 13.2;
    group.add(beacon);

    // Center entire model vertically around origin
    group.position.y = -22;
  } else if (presetId === 'burj-al-arab') {
    const sailMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.15,
    });
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.18,
      metalness: 0.9,
    });
    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.85,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.8,
    });

    // Island
    const island = new THREE.Mesh(new THREE.CylinderGeometry(9, 10, 1.2, 3), islandMat);
    island.position.y = 0.6;
    group.add(island);

    // Curved Sail
    const sailH = 28;
    const sailGeo = new THREE.CylinderGeometry(4.8, 0.8, sailH, 16, 16, true, 0, Math.PI);
    sailGeo.rotateY(Math.PI / 2);
    const sail = new THREE.Mesh(sailGeo, sailMat);
    sail.position.set(0, sailH / 2 + 1.2, -1.2);
    group.add(sail);

    // Rear Service Spine
    const spine = new THREE.Mesh(new THREE.ConeGeometry(2.8, sailH, 3), glassMat);
    spine.position.set(0, sailH / 2 + 1.2, 1.6);
    spine.rotation.y = Math.PI;
    group.add(spine);

    // Curved Bow Trusses
    [-4.8, 4.8].forEach((bx) => {
      const bow = new THREE.Mesh(
        new THREE.TorusGeometry(16, 0.45, 8, 24, Math.PI * 0.48),
        steelMat
      );
      bow.position.set(bx, 3, -1.5);
      bow.rotation.z = (bx > 0 ? -1 : 1) * 0.12;
      bow.rotation.y = Math.PI / 2;
      group.add(bow);
    });

    // Cantilevered Helipad
    const helipad = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.2, 0.35, 24),
      islandMat
    );
    helipad.position.set(0, 25.2, -4.8);
    group.add(helipad);

    const heliRing = new THREE.Mesh(
      new THREE.RingGeometry(2.4, 2.7, 24).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide })
    );
    heliRing.position.set(0, 25.4, -4.8);
    group.add(heliRing);

    // Cantilevered Skyview Restaurant
    const skyview = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.4, 3.2), glassMat);
    skyview.position.set(0, 23.5, 3.8);
    group.add(skyview);

    // Causeway Bridge
    const causeway = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.3, 12),
      new THREE.MeshStandardMaterial({ color: 0x334155 })
    );
    causeway.position.set(0, 0.5, -11);
    group.add(causeway);

    group.position.y = -12;
  } else if (presetId === 'museum-of-future') {
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.22,
      metalness: 0.88,
    });
    const hillMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.8,
      metalness: 0.05,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
    });

    // Green Mound Hill Podium
    const hill = new THREE.Mesh(new THREE.ConeGeometry(12, 3.5, 24), hillMat);
    hill.position.y = 1.75;
    group.add(hill);

    // Toroid Ring with Void
    const torusGeo = new THREE.TorusGeometry(8.5, 3.2, 24, 48);
    torusGeo.scale(1.2, 1.4, 0.7);
    const torus = new THREE.Mesh(torusGeo, steelMat);
    torus.position.set(0, 13.5, 0);
    torus.rotation.y = Math.PI / 4;
    group.add(torus);

    // Glass Entrance Pavilion
    const atrium = new THREE.Mesh(new THREE.BoxGeometry(5, 2.5, 5), glassMat);
    atrium.position.y = 4.25;
    group.add(atrium);

    group.position.y = -10;
  } else if (presetId === 'dubai-frame') {
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.88,
      roughness: 0.2,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.7,
      transparent: true,
      opacity: 0.7,
    });

    const towerH = 26;
    const towerW = 2.4;
    const towerD = 3.2;
    const span = 13;

    // Twin Gold Towers
    [-span / 2, span / 2].forEach((tx) => {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(towerW, towerH, towerD), goldMat);
      tower.position.set(tx, towerH / 2, 0);
      group.add(tower);
    });

    // Top Skybridge
    const skybridge = new THREE.Mesh(new THREE.BoxGeometry(span + towerW, 2.2, towerD), goldMat);
    skybridge.position.set(0, towerH - 1.1, 0);
    group.add(skybridge);

    // Glass Floor Panel
    const glassFloor = new THREE.Mesh(new THREE.BoxGeometry(span, 0.1, towerD - 0.4), glassMat);
    glassFloor.position.set(0, towerH - 2.15, 0);
    group.add(glassFloor);

    // Bottom Pavilion
    const basePavilion = new THREE.Mesh(
      new THREE.BoxGeometry(span + towerW + 4, 1.8, towerD + 3),
      goldMat
    );
    basePavilion.position.set(0, 0.9, 0);
    group.add(basePavilion);

    group.position.y = -12;
  } else if (presetId === 'cayan-tower') {
    const cayanMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.15,
      metalness: 0.85,
    });
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.8,
    });

    const floorCount = 28;
    const totalH = 34;
    const flH = totalH / floorCount;

    // Core
    const core = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.2, totalH, 16), coreMat);
    core.position.y = totalH / 2;
    group.add(core);

    // Twisting Floors (90° twist)
    for (let f = 0; f < floorCount; f++) {
      const rot = (f / floorCount) * (Math.PI / 2);
      const floor = new THREE.Mesh(new THREE.BoxGeometry(7, flH * 0.92, 7), cayanMat);
      floor.position.set(0, f * flH + flH / 2, 0);
      floor.rotation.y = rot;
      group.add(floor);
    }

    group.position.y = -14;
  } else if (presetId === 'dubai-police-supercar') {
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.18,
      metalness: 0.85,
    });
    const liveryMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      roughness: 0.2,
      metalness: 0.4,
    });
    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.8,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.08,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85,
    });
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x020617,
      roughness: 0.8,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.2,
    });

    // Chassis Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.75, 8.2), bodyMat);
    body.position.y = 0.8;
    group.add(body);

    // Emerald Green Side Stripes
    [-2.12, 2.12].forEach((sx) => {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, 5.2), liveryMat);
      stripe.position.set(sx, 0.85, 0);
      group.add(stripe);
    });

    // Cockpit Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.65, 3.8), glassMat);
    cabin.position.set(0, 1.45, -0.2);
    group.add(cabin);

    // Carbon Splitter & Diffuser
    const splitter = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.1, 1.2), carbonMat);
    splitter.position.set(0, 0.4, -4.0);
    group.add(splitter);

    const diffuser = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.2, 1.0), carbonMat);
    diffuser.position.set(0, 0.45, 4.0);
    group.add(diffuser);

    // Rear Aero Wing
    const wing = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.1, 0.9), carbonMat);
    wing.position.set(0, 1.75, 3.8);
    group.add(wing);

    [-1.4, 1.4].forEach((wx) => {
      const strut = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.4), carbonMat);
      strut.position.set(wx, 1.4, 3.8);
      group.add(strut);
    });

    // Roof Police Lightbar
    const redStrobe = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.18, 0.28),
      new THREE.MeshBasicMaterial({ color: 0xdc2626 })
    );
    redStrobe.position.set(-0.55, 1.88, -0.2);
    group.add(redStrobe);

    const blueStrobe = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.18, 0.28),
      new THREE.MeshBasicMaterial({ color: 0x2563eb })
    );
    blueStrobe.position.set(0.55, 1.88, -0.2);
    group.add(blueStrobe);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.55, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const rimGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.58, 8);
    rimGeo.rotateZ(Math.PI / 2);

    [-2.15, 2.15].forEach((wx) => {
      [-2.4, 2.4].forEach((wz) => {
        const tire = new THREE.Mesh(wheelGeo, wheelMat);
        tire.position.set(wx, 0.65, wz);
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.position.set(wx, 0.65, wz);
        group.add(tire, rim);
      });
    });

    group.position.y = -0.8;
  } else if (presetId === 'dubai-mega-yacht') {
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.2,
      metalness: 0.4,
    });
    const teakMat = new THREE.MeshStandardMaterial({
      color: 0x92400e,
      roughness: 0.75,
      metalness: 0.1,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.08,
      metalness: 0.9,
      transparent: true,
      opacity: 0.9,
    });

    // Hull
    const hull = new THREE.Mesh(new THREE.BoxGeometry(6.2, 2.8, 24), hullMat);
    hull.position.y = 1.4;
    group.add(hull);

    // Prow
    const prowGeo = new THREE.ConeGeometry(3.1, 7.5, 4);
    prowGeo.rotateX(Math.PI / 2);
    const prow = new THREE.Mesh(prowGeo, hullMat);
    prow.position.set(0, 1.4, -15.5);
    group.add(prow);

    // Teak Main Deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.2, 23.5), teakMat);
    deck.position.y = 2.9;
    group.add(deck);

    // Bridge Deck (Tier 2)
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(5.0, 2.2, 14), hullMat);
    bridge.position.y = 4.0;
    group.add(bridge);

    const bridgeWin = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.1, 13.5), glassMat);
    bridgeWin.position.y = 4.4;
    group.add(bridgeWin);

    // Sun Deck (Tier 3)
    const sundeck = new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.6, 8.5), hullMat);
    sundeck.position.y = 5.8;
    group.add(sundeck);

    // Radar Mast & Radome
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.25, 4.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
    );
    mast.position.set(0, 8.2, 0);
    group.add(mast);

    const radome = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12), hullMat);
    radome.position.set(0, 8.2, 0);
    group.add(radome);

    // Swim Platform
    const swim = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.4, 3.2), teakMat);
    swim.position.set(0, 0.6, 13.2);
    group.add(swim);

    group.position.y = -3.5;
  }

  return group;
}

export const DubaiModelStudioModal: React.FC<DubaiModelStudioModalProps> = ({
  isOpen,
  onClose,
  onFlyToLandmark,
  onPlaceModelInCity,
}) => {
  const [selectedModelId, setSelectedModelId] = useState<string>('burj-khalifa');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [userModels, setUserModels] = useState<GLBModelMetadata[]>([]);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedPreset = DUBAI_PRESET_MODELS.find((m) => m.id === selectedModelId);
  const selectedUserModel = userModels.find((m) => m.id === selectedModelId);

  // Compute live geometric statistics for active model
  const activeStats = useMemo(() => {
    if (selectedUserModel) {
      return {
        vertexCount: selectedUserModel.vertexCount,
        triangleCount: selectedUserModel.triangleCount,
        meshCount: selectedUserModel.meshCount,
      };
    }
    const model = createPreset3DModel(selectedModelId);
    let vCount = 0;
    let tCount = 0;
    let mCount = 0;
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        mCount++;
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) {
          if (mesh.geometry.attributes.position) {
            vCount += mesh.geometry.attributes.position.count;
          }
          if (mesh.geometry.index) {
            tCount += mesh.geometry.index.count / 3;
          } else if (mesh.geometry.attributes.position) {
            tCount += mesh.geometry.attributes.position.count / 3;
          }
        }
      }
    });
    return {
      vertexCount: vCount,
      triangleCount: Math.round(tCount),
      meshCount: mCount,
    };
  }, [selectedModelId, selectedUserModel]);

  // 3D Mini-Preview Scene with Interactive Drag
  useEffect(() => {
    if (!isOpen || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 10, 48);

    const ambient = new THREE.AmbientLight(0xfff7ed, 1.8);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffedd5, 2.8);
    sun.position.set(25, 40, 30);
    scene.add(sun);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.2);
    fillLight.position.set(-25, 20, -20);
    scene.add(fillLight);

    // Build or display representation of current selection
    const previewGroup = new THREE.Group();
    scene.add(previewGroup);

    if (selectedUserModel?.object) {
      const cloned = selectedUserModel.object.clone();
      previewGroup.add(cloned);
    } else {
      const presetGroup = createPreset3DModel(selectedModelId);
      previewGroup.add(presetGroup);
    }

    if (selectedModelId === 'dubai-police-supercar') {
      camera.position.set(0, 6, 18);
    } else if (selectedModelId === 'dubai-mega-yacht') {
      camera.position.set(0, 8, 32);
    } else {
      camera.position.set(0, 10, 48);
    }

    camera.lookAt(0, 0, 0);

    // Interactive Mouse / Pointer Rotation
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let rotY = 0;
    let rotX = 0.1;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      rotY += dx * 0.01;
      rotX = Math.max(-0.6, Math.min(0.8, rotX + dy * 0.01));
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        rotY += 0.008;
      }
      previewGroup.rotation.y = rotY;
      previewGroup.rotation.x = rotX;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
    };
  }, [isOpen, selectedModelId, selectedUserModel]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    try {
      setStatusMessage(`Loading 3D model: ${file.name}...`);
      const meta = await GLBModelService.loadUserFile(file);
      setUserModels((prev) => [meta, ...prev]);
      setSelectedModelId(meta.id);
      setStatusMessage(`Successfully loaded ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(err);
      setStatusMessage(`Error loading GLB file. Please ensure it is a valid .glb or .gltf model.`);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDownload = async () => {
    setIsExporting(true);
    setStatusMessage('Generating authentic binary .glb file with embedded PBR materials...');
    try {
      const objectToExport = selectedUserModel?.object
        ? selectedUserModel.object
        : createPreset3DModel(selectedModelId);

      await GLBModelService.downloadGLB(objectToExport, `${selectedModelId}-dubai.glb`);
      setStatusMessage(`Downloaded ${selectedModelId}-dubai.glb successfully.`);
    } catch (err) {
      console.error(err);
      setStatusMessage('Export error: Unable to generate GLB.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFlyTo = () => {
    if (onFlyToLandmark) {
      onFlyToLandmark(selectedModelId);
      onClose();
    }
  };

  const handlePlaceInCity = () => {
    if (onPlaceModelInCity) {
      const objectToPlace = selectedUserModel?.object
        ? selectedUserModel.object.clone()
        : createPreset3DModel(selectedModelId);
      onPlaceModelInCity(objectToPlace);
      setStatusMessage(`Placed 3D model in city scene!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-5xl bg-slate-900/95 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-950/40 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/40 rounded-xl text-amber-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Dubai 3D & GLB Model Studio
                </h2>
                <span className="text-xs text-amber-400 font-semibold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  REAL 3D ARCHITECTURE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Explore real Dubai landmarks, inspect 3D geometry, import custom GLB/GLTF models, or export binary GLBs.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split 2-Column Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Preset & User Model Selector */}
          <div className="lg:col-span-5 border-r border-white/10 p-5 overflow-y-auto space-y-4 bg-slate-950/40">
            {/* Upload / Drag and Drop Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 border-2 border-dashed rounded-xl cursor-pointer transition flex flex-col items-center justify-center text-center gap-2 ${
                dragOver
                  ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                  : 'border-white/15 bg-slate-900/60 hover:border-amber-500/50 hover:bg-slate-900'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".glb,.gltf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="p-2 bg-amber-500/15 text-amber-400 rounded-lg">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Import Custom .GLB / .GLTF</p>
                <p className="text-[11px] text-slate-400">Drag & drop 3D model files from your computer</p>
              </div>
            </div>

            {/* User Uploaded Models List */}
            {userModels.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider">
                  <span>Custom Loaded Models</span>
                  <span className="text-cyan-400">{userModels.length}</span>
                </div>
                <div className="space-y-1.5">
                  {userModels.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedModelId(m.id)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                        selectedModelId === m.id
                          ? 'bg-amber-500/20 border-amber-400/80 text-white shadow-sm'
                          : 'bg-slate-900/70 border-white/10 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-xs font-medium truncate">{m.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {m.triangleCount.toLocaleString()} △
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dubai Architectural Landmarks Preset List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider">
                <span>Iconic Dubai Real Assets</span>
                <span className="text-amber-400">{DUBAI_PRESET_MODELS.length} Presets</span>
              </div>

              <div className="space-y-1.5">
                {DUBAI_PRESET_MODELS.map((preset) => {
                  const isSelected = selectedModelId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedModelId(preset.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-500/25 to-amber-600/15 border-amber-400/80 text-white shadow-md shadow-amber-950/30'
                          : 'bg-slate-900/70 border-white/10 text-slate-300 hover:bg-slate-800/90 hover:border-white/20'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-white/10 shrink-0 mt-0.5">
                        {preset.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white truncate">
                            {preset.name}
                          </span>
                          <span className="text-[10px] text-amber-400 font-mono">
                            {preset.height}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {preset.tags.join(' · ')}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: 3D Preview Canvas & Technical Details */}
          <div className="lg:col-span-7 flex flex-col p-6 overflow-y-auto space-y-5 bg-slate-900/80">
            {/* 3D Mini-Viewer Viewport */}
            <div className="relative w-full h-64 bg-slate-950 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
              <canvas
                ref={previewCanvasRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"
              />
              <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 bg-slate-900/90 border border-white/10 rounded-md text-[11px] text-slate-300 font-mono backdrop-blur-md">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Interactive 3D Viewport (Drag to Orbit)</span>
              </div>
            </div>

            {/* Model Title & Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  {selectedPreset?.name || selectedUserModel?.name}
                </h3>
                <span className="text-xs font-mono text-amber-300 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  {selectedPreset?.category || 'Custom GLB'}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedPreset?.description ||
                  `User uploaded custom 3D model containing ${selectedUserModel?.meshCount} meshes and ${selectedUserModel?.triangleCount} triangles.`}
              </p>
            </div>

            {/* Architectural & Geometry Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-950/70 border border-white/10 rounded-xl text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[11px] block">Triangles</span>
                <span className="text-slate-200 font-semibold">
                  {activeStats.triangleCount.toLocaleString()} △
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Vertices</span>
                <span className="text-emerald-400 font-semibold">
                  {activeStats.vertexCount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Format</span>
                <span className="text-amber-300 font-semibold">GLTF 2.0 / Binary</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Meshes</span>
                <span className="text-cyan-400 font-semibold">{activeStats.meshCount} Parts</span>
              </div>
            </div>

            {/* Status message */}
            {statusMessage && (
              <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-lg font-mono">
                {statusMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleFlyTo}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs tracking-wide transition shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <Compass className="w-4 h-4" />
                <span>FLY CAMERA TO LANDMARK</span>
              </button>

              <button
                onClick={handleDownload}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-white/10 transition active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>{isExporting ? 'EXPORTING...' : 'DOWNLOAD AS REAL .GLB'}</span>
              </button>

              {onPlaceModelInCity && (
                <button
                  onClick={handlePlaceInCity}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide transition active:scale-95"
                >
                  <Box className="w-4 h-4" />
                  <span>PLACE MODEL IN CITY</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
