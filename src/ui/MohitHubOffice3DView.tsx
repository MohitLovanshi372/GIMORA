/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Laptop, Presentation, GitBranch, Eye, ChevronRight } from 'lucide-react';

export type OfficeCameraZone = 'overview' | 'workstations' | 'presentation' | 'github-agents';

interface MohitHubOffice3DViewProps {
  activeZone: OfficeCameraZone;
  onZoneChange: (zone: OfficeCameraZone) => void;
  slideIndex: number;
  onNextSlide: () => void;
}

export const MohitHubOffice3DView: React.FC<MohitHubOffice3DViewProps> = ({
  activeZone,
  onZoneChange,
  slideIndex,
  onNextSlide,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const targetGoalRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.4, 0));
  const camGoalRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 6.2, 11.5));
  const isTransitioningRef = useRef<boolean>(false);
  const slideDrawerRef = useRef<((slide: number) => void) | null>(null);
  const [agentCount] = useState(14);

  // Sync camera preset when activeZone changes
  useEffect(() => {
    if (activeZone === 'overview') {
      camGoalRef.current.set(0, 6.4, 11.8);
      targetGoalRef.current.set(0, 1.3, 0);
    } else if (activeZone === 'workstations') {
      camGoalRef.current.set(-4.2, 2.5, 3.8);
      targetGoalRef.current.set(-4.2, 1.05, -1.2);
    } else if (activeZone === 'presentation') {
      camGoalRef.current.set(3.8, 2.6, 4.6);
      targetGoalRef.current.set(4.5, 1.6, -3.5);
    } else if (activeZone === 'github-agents') {
      camGoalRef.current.set(-1.5, 2.3, -1.2);
      targetGoalRef.current.set(-6.8, 2.1, -1.5);
    }
    isTransitioningRef.current = true;
  }, [activeZone]);

  // Redraw 3D Presentation Projector Screen when slideIndex changes
  useEffect(() => {
    slideDrawerRef.current?.(slideIndex);
  }, [slideIndex]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070d19);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 120);
    camera.position.set(0, 6.4, 11.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minDistance = 1.8;
    controls.maxDistance = 22;
    controls.target.set(0, 1.3, 0);
    controlsRef.current = controls;

    // Cancel camera preset lerp if user manually drags orbit controls
    const onControlStart = () => {
      isTransitioningRef.current = false;
    };
    controls.addEventListener('start', onControlStart);

    // Studio Corporate Lighting
    const ambient = new THREE.AmbientLight(0xe2e8f0, 1.35);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xf8fafc, 1.8);
    dirLight.position.set(6, 12, 8);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const cyanAccentLight = new THREE.PointLight(0x38bdf8, 2.2, 16);
    cyanAccentLight.position.set(-4.5, 3.6, 0);
    scene.add(cyanAccentLight);

    const presWarmLight = new THREE.PointLight(0xfef3c7, 2.0, 16);
    presWarmLight.position.set(4.5, 3.8, 0);
    scene.add(presWarmLight);

    // Shared Materials
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.15 });
    const carpetMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.75 });
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.3 });
    const glassPartMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      roughness: 0.08,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const oakDeskMat = new THREE.MeshStandardMaterial({ color: 0xd6b88e, roughness: 0.4 });
    const walnutTableMat = new THREE.MeshStandardMaterial({ color: 0x5c2d16, roughness: 0.32 });
    const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.8 });
    const silverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.22, metalness: 0.88 });

    // 1. CORPORATE OFFICE FLOOR, GLASS CURTAIN MULLIONS & PARTITION
    const mainFloor = new THREE.Mesh(new THREE.BoxGeometry(16.5, 0.2, 10.5), floorMat);
    mainFloor.position.y = -0.1;
    mainFloor.receiveShadow = true;
    scene.add(mainFloor);

    // Presentation Room Carpet Zone (Right side: X > 0.8)
    const presCarpet = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.03, 9.4), carpetMat);
    presCarpet.position.set(4.2, 0.015, 0);
    scene.add(presCarpet);

    // Back Structural Wall & Glass Curtain Frame
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(16.5, 4.4, 0.25), wallMat);
    backWall.position.set(0, 2.2, -5.2);
    scene.add(backWall);

    // Acoustic Glass Divider Wall between Developer Office (Left) and Presentation Room (Right)
    const dividerGlass = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.8, 8.6), glassPartMat);
    dividerGlass.position.set(0.5, 1.9, -0.4);
    scene.add(dividerGlass);

    // 2. PROCEDURAL CANVAS TEXTURES FOR LAPTOPS, DUAL PCs, GITHUB WALL & PRESENTATION SCREEN
    const makeMonitorTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 256;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, 512, 256);
      // Left: VS Code TypeScript Editor
      ctx.fillStyle = '#161b22';
      ctx.fillRect(6, 6, 244, 244);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('TS  MohitAgentCore.ts', 14, 24);
      const colors = ['#7dd3fc', '#c084fc', '#4ade80', '#facc15', '#f8fafc'];
      for (let i = 0; i < 12; i++) {
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(18 + (i % 3) * 14, 38 + i * 16, 80 + ((i * 29) % 110), 7);
      }
      // Right: GitHub PRs & Contribution Graph
      ctx.fillStyle = '#161b22';
      ctx.fillRect(256, 6, 250, 244);
      ctx.fillStyle = '#f0f6fc';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('github.com/mohit-hub/core', 266, 26);
      ctx.fillStyle = '#238636';
      ctx.fillRect(266, 36, 104, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('PR #428 MERGED', 272, 49);
      const greens = ['#21262d', '#0e4429', '#006d32', '#26a641', '#39d353'];
      for (let gx = 0; gx < 16; gx++) {
        for (let gy = 0; gy < 5; gy++) {
          ctx.fillStyle = greens[(gx * 3 + gy * 5) % greens.length];
          ctx.fillRect(266 + gx * 13, 66 + gy * 13, 10, 10);
        }
      }
      ctx.fillStyle = '#39d353';
      ctx.fillText('✓ @mohit-agent-01: CI passed', 266, 156);
      ctx.fillStyle = '#58a6ff';
      ctx.fillText('⚡ @mohit-agent-02: PR #429', 266, 178);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };

    const monitorTex = makeMonitorTexture();
    const monitorScreenMat = new THREE.MeshBasicMaterial({ map: monitorTex });

    // GitHub Enterprise Kanban & Agent Wall Canvas (Left Wall X = -8.1)
    const ghWallCanvas = document.createElement('canvas');
    ghWallCanvas.width = 1024;
    ghWallCanvas.height = 512;
    const ghCtx = ghWallCanvas.getContext('2d')!;
    ghCtx.fillStyle = '#0d1117';
    ghCtx.fillRect(0, 0, 1024, 512);
    ghCtx.fillStyle = '#161b22';
    ghCtx.fillRect(0, 0, 1024, 68);
    ghCtx.fillStyle = '#58a6ff';
    ghCtx.font = 'bold 26px sans-serif';
    ghCtx.fillText('GITHUB ENTERPRISE // mohit-developer-hub / metropolis-core', 28, 44);
    ghCtx.fillStyle = '#238636';
    ghCtx.fillRect(810, 16, 186, 36);
    ghCtx.fillStyle = '#ffffff';
    ghCtx.font = 'bold 18px monospace';
    ghCtx.fillText('● 38 AGENTS LIVE', 824, 40);

    const cols = [
      { title: 'IN PROGRESS', color: '#f59e0b', items: ['PR #429: Multi-Agent Sync', 'PR #431: Drone Nav Grid'] },
      { title: 'AGENT CODE REVIEW', color: '#38bdf8', items: ['@mohit-pr-agent: #428 OK', '@mohit-sec-agent: 0 Issues'] },
      { title: 'MERGED TO MAIN', color: '#3fb950', items: ['✓ PR #426: Traffic Signals', '✓ PR #424: Entry Rooms'] },
    ];
    cols.forEach((col, ci) => {
      const cx = 24 + ci * 330;
      ghCtx.fillStyle = '#161b22';
      ghCtx.fillRect(cx, 84, 310, 210);
      ghCtx.fillStyle = col.color;
      ghCtx.fillRect(cx, 84, 310, 6);
      ghCtx.font = 'bold 18px monospace';
      ghCtx.fillText(col.title, cx + 14, 114);
      col.items.forEach((it, ii) => {
        ghCtx.fillStyle = '#21262d';
        ghCtx.fillRect(cx + 12, 130 + ii * 70, 286, 54);
        ghCtx.fillStyle = '#e6edf3';
        ghCtx.font = '16px monospace';
        ghCtx.fillText(it, cx + 22, 164 + ii * 70);
      });
    });

    // Green GitHub Contribution Heatmap at Bottom
    const greens = ['#21262d', '#0e4429', '#006d32', '#26a641', '#39d353'];
    for (let wx = 0; wx < 44; wx++) {
      for (let wy = 0; wy < 5; wy++) {
        ghCtx.fillStyle = greens[(wx * 7 + wy * 3) % greens.length];
        ghCtx.fillRect(32 + wx * 21, 326 + wy * 28, 16, 22);
      }
    }
    const ghWallTex = new THREE.CanvasTexture(ghWallCanvas);
    ghWallTex.colorSpace = THREE.SRGBColorSpace;

    const ghBoardMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(6.8, 3.2),
      new THREE.MeshBasicMaterial({ map: ghWallTex, side: THREE.DoubleSide })
    );
    ghBoardMesh.position.set(-8.1, 2.2, -0.6);
    ghBoardMesh.rotation.y = Math.PI / 2;
    scene.add(ghBoardMesh);

    // Presentation Room 16:9 Projector Screen Canvas (Right-North Wall, X = 4.3, Z = -5.0)
    const presCanvas = document.createElement('canvas');
    presCanvas.width = 1024;
    presCanvas.height = 512;
    const presCtx = presCanvas.getContext('2d')!;
    const presTex = new THREE.CanvasTexture(presCanvas);
    presTex.colorSpace = THREE.SRGBColorSpace;

    const drawPresentationSlide = (sIdx: number) => {
      const slides = [
        {
          kicker: 'SLIDE 01 / 04 • ARCHITECTURE OVERVIEW',
          title: 'AUTONOMOUS GITHUB AGENT & DEVELOPER WORKFLOW',
          bars: [
            { label: 'PR Automated Review Coverage', val: 0.96, color: '#38bdf8' },
            { label: 'Unit & Integration Test Pass', val: 0.99, color: '#10b981' },
            { label: 'Deployment Velocity (140/day)', val: 0.88, color: '#f59e0b' },
          ],
          notes: ['• 38 Coding Agents paired with Engineers', '• Zero-latency GitHub Actions runners', '• Automated security & lint gates'],
        },
        {
          kicker: 'SLIDE 02 / 04 • SMART CITY DIGITAL TWIN',
          title: 'METROPOLIS TRAFFIC SIGNAL & VEHICLE AI TELEMETRY',
          bars: [
            { label: 'Signal Compliance Accuracy', val: 1.0, color: '#10b981' },
            { label: 'Multi-Lane Route Efficiency', val: 0.91, color: '#38bdf8' },
            { label: 'Crosswalk Pedestrian Safety', val: 0.99, color: '#a855f7' },
          ],
          notes: ['• All-red intersection clearance phase', '• Real-time lane & turn tracking', '• Railway barrier synchronization'],
        },
        {
          kicker: 'SLIDE 03 / 04 • INFRASTRUCTURE & CLOUD',
          title: 'SUB-ZERO LIQUID COOLED QUANTUM SERVER CLUSTER',
          bars: [
            { label: 'Optical Backbone Utilization', val: 0.84, color: '#38bdf8' },
            { label: 'PUE Energy Efficiency (1.06)', val: 0.95, color: '#10b981' },
            { label: 'Global Edge Node Sync', val: 0.98, color: '#f59e0b' },
          ],
          notes: ['• 32.8 MW geothermal clean power', '• 1.2ms metropolitan ping latency', '• Triple-redundant optical mesh'],
        },
        {
          kicker: 'SLIDE 04 / 04 • Q4 ROADMAP & MILESTONES',
          title: 'NEXT-GEN SPATIAL COMPUTING & OPEN-SOURCE RELEASES',
          bars: [
            { label: 'Q4 Sprint Milestone Completion', val: 0.94, color: '#10b981' },
            { label: 'Open-Source Contributor Growth', val: 0.89, color: '#38bdf8' },
            { label: 'Enterprise SLA Reliability', val: 0.99, color: '#a855f7' },
          ],
          notes: ['• 4,820 active repositories on hub', '• 4,200 engineers & researchers', '• Global 24/7 autonomous operations'],
        },
      ];
      const slide = slides[sIdx % slides.length];

      presCtx.fillStyle = '#0f172a';
      presCtx.fillRect(0, 0, 1024, 512);
      presCtx.fillStyle = '#1e293b';
      presCtx.fillRect(0, 0, 1024, 82);
      presCtx.fillStyle = '#38bdf8';
      presCtx.fillRect(0, 78, 1024, 4);

      presCtx.fillStyle = '#38bdf8';
      presCtx.font = 'bold 18px monospace';
      presCtx.fillText(`MOHIT DEVELOPER HUB // PRESENTATION ROOM • ${slide.kicker}`, 28, 30);
      presCtx.fillStyle = '#ffffff';
      presCtx.font = 'bold 26px sans-serif';
      presCtx.fillText(slide.title, 28, 64);

      presCtx.fillStyle = '#1e293b';
      presCtx.fillRect(28, 104, 540, 380);
      slide.bars.forEach((b, bi) => {
        const by = 150 + bi * 105;
        presCtx.fillStyle = '#e2e8f0';
        presCtx.font = 'bold 18px monospace';
        presCtx.fillText(`${b.label} (${Math.round(b.val * 100)}%)`, 48, by);
        presCtx.fillStyle = '#0f172a';
        presCtx.fillRect(48, by + 14, 490, 30);
        presCtx.fillStyle = b.color;
        presCtx.fillRect(48, by + 14, Math.floor(490 * b.val), 30);
      });

      presCtx.fillStyle = '#1e293b';
      presCtx.fillRect(590, 104, 406, 380);
      presCtx.fillStyle = '#38bdf8';
      presCtx.font = 'bold 22px sans-serif';
      presCtx.fillText('EXECUTIVE KEY TAKEAWAYS', 614, 148);
      presCtx.fillStyle = '#f1f5f9';
      presCtx.font = '19px sans-serif';
      slide.notes.forEach((n, ni) => {
        presCtx.fillText(n, 614, 205 + ni * 64);
      });

      presTex.needsUpdate = true;
    };

    drawPresentationSlide(slideIndex);
    slideDrawerRef.current = drawPresentationSlide;

    const presScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(6.4, 3.2),
      new THREE.MeshBasicMaterial({ map: presTex })
    );
    presScreen.position.set(4.3, 2.25, -5.02);
    scene.add(presScreen);

    // 3. HELPER TO CREATE 3D ARTICULATED HUMAN AGENTS & WORKSTATIONS IN THE MODAL SCENE
    const animatedAgents: {
      head: THREE.Object3D;
      leftArm: THREE.Object3D;
      rightArm: THREE.Object3D;
      role: 'typing' | 'presenter' | 'audience' | 'collab';
      phase: number;
    }[] = [];

    const buildHuman = (
      suitHex: number,
      shirtHex: number,
      skinHex: number,
      seated: boolean,
      role: 'typing' | 'presenter' | 'audience' | 'collab',
      phase: number
    ) => {
      const g = new THREE.Group();
      const suitMat = new THREE.MeshStandardMaterial({ color: suitHex, roughness: 0.6 });
      const shirtMat = new THREE.MeshStandardMaterial({ color: shirtHex, roughness: 0.5 });
      const skinMat = new THREE.MeshStandardMaterial({ color: skinHex, roughness: 0.5 });
      const hairMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.8 });
      const hipY = seated ? 0.48 : 0.88;

      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.50, 0.22), suitMat);
      torso.position.y = hipY + 0.28;
      g.add(torso);

      const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.24, 0.23), shirtMat);
      shirt.position.set(0, hipY + 0.38, 0.01);
      g.add(shirt);

      const head = new THREE.Group();
      head.position.set(0, hipY + 0.64, 0);
      head.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), skinMat));
      const hair = new THREE.Mesh(
        new THREE.SphereGeometry(0.136, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
        hairMat
      );
      hair.position.y = 0.02;
      head.add(hair);
      g.add(head);

      const leftArm = new THREE.Group();
      leftArm.position.set(-0.23, hipY + 0.48, 0);
      const laMesh = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.40, 0.10), suitMat);
      laMesh.position.set(0, -0.16, 0.08);
      leftArm.add(laMesh);

      const rightArm = new THREE.Group();
      rightArm.position.set(0.23, hipY + 0.48, 0);
      const raMesh = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.40, 0.10), suitMat);
      raMesh.position.set(0, -0.16, 0.08);
      rightArm.add(raMesh);

      leftArm.rotation.x = role === 'typing' ? -0.82 : -0.45;
      rightArm.rotation.x = role === 'typing' ? -0.82 : role === 'presenter' ? -1.1 : -0.5;
      g.add(leftArm, rightArm);

      if (seated) {
        [-0.1, 0.1].forEach((lx) => {
          const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.12, 0.38), darkMetalMat);
          thigh.position.set(lx, 0.44, 0.16);
          g.add(thigh);
          const calf = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.12), darkMetalMat);
          calf.position.set(lx, 0.22, 0.32);
          g.add(calf);
        });
      } else {
        [-0.1, 0.1].forEach((lx) => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.84, 0.13), darkMetalMat);
          leg.position.set(lx, 0.42, 0);
          g.add(leg);
        });
      }

      animatedAgents.push({ head, leftArm, rightArm, role, phase });
      return g;
    };

    // Build 4 Corporate Workstation Desks on Left Side (X = -4.2 and -1.8) with Dual PCs, RGB Tower & Open Laptop
    const deskCoords = [
      { x: -4.8, z: -2.0, rotY: 0, suit: 0x1e293b, shirt: 0x38bdf8 },
      { x: -2.1, z: -2.0, rotY: 0, suit: 0x334155, shirt: 0x10b981 },
      { x: -4.8, z: 1.6, rotY: Math.PI, suit: 0x0f172a, shirt: 0xf59e0b },
      { x: -2.1, z: 1.6, rotY: Math.PI, suit: 0x1e3a8a, shirt: 0xec4899 },
    ];

    deskCoords.forEach((dc, idx) => {
      const pod = new THREE.Group();
      pod.position.set(dc.x, 0, dc.z);
      pod.rotation.y = dc.rotY;

      const top = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.06, 0.92), oakDeskMat);
      top.position.y = 0.75;
      pod.add(top);

      // Dual PC Monitors
      [-0.5, 0.12].forEach((mx, mi) => {
        const mon = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.36, 0.03), darkMetalMat);
        mon.position.set(mx, 1.04, -0.22);
        mon.rotation.y = mi === 0 ? 0.15 : -0.15;
        pod.add(mon);

        const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.32), monitorScreenMat);
        scr.position.set(mx, 1.04, -0.201);
        scr.rotation.y = mi === 0 ? 0.15 : -0.15;
        pod.add(scr);
      });

      // Desktop PC Tower with Cyan RGB Strip
      const pcCase = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.45, 0.42), darkMetalMat);
      pcCase.position.set(0.78, 1.0, -0.1);
      pod.add(pcCase);
      const rgb = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.40, 0.38),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      rgb.position.set(0.665, 1.0, -0.1);
      pod.add(rgb);

      // Open Aluminum Laptop on Desk
      const lapBase = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.018, 0.24), silverMat);
      lapBase.position.set(0.44, 0.79, 0.12);
      pod.add(lapBase);
      const lapScr = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.20), monitorScreenMat);
      lapScr.position.set(0.44, 0.90, 0.01);
      lapScr.rotation.x = -0.2;
      pod.add(lapScr);

      // Seated Developer Employee Agent
      const devAgent = buildHuman(dc.suit, dc.shirt, 0xf1c27d, true, 'typing', idx * 0.8);
      devAgent.position.set(-0.1, 0, 0.42);
      devAgent.rotation.y = Math.PI;
      pod.add(devAgent);

      scene.add(pod);
    });

    // 2 Standing Collaborating Agents by the GitHub Enterprise Board (Left Wall)
    const ghAgent1 = buildHuman(0x0f172a, 0x38bdf8, 0xe0ac69, false, 'collab', 1.2);
    ghAgent1.position.set(-6.6, 0, -1.6);
    ghAgent1.rotation.y = -Math.PI * 0.35;
    scene.add(ghAgent1);

    const ghAgent2 = buildHuman(0x1e3a8a, 0x10b981, 0xffdbac, false, 'collab', 2.4);
    ghAgent2.position.set(-6.6, 0, 0.4);
    ghAgent2.rotation.y = -Math.PI * 0.65;
    scene.add(ghAgent2);

    // 4. PRESENTATION ROOM (Right Side: X = 4.3): Podium, Presenter Agent, Conference Table & 6 Audience Agents with Laptops
    const podium = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.1, 0.65), darkMetalMat);
    podium.position.set(2.1, 0.55, -3.6);
    scene.add(podium);

    const presenter = buildHuman(0x0f172a, 0x38bdf8, 0xf1c27d, false, 'presenter', 0.3);
    presenter.position.set(2.1, 0, -4.1);
    presenter.rotation.y = 0.35;
    scene.add(presenter);

    // Long Walnut Conference Table
    const confTable = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 5.8), walnutTableMat);
    confTable.position.set(4.5, 0.76, 0.4);
    scene.add(confTable);

    [-1.8, 0.4, 2.4].forEach((tz, rIdx) => {
      [-1, 1].forEach((side, sIdx) => {
        // Open Laptop on Conference Table
        const lBase = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.018, 0.24), silverMat);
        lBase.position.set(4.5 + side * 0.75, 0.82, tz);
        scene.add(lBase);

        const lLid = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.22, 0.32), monitorScreenMat);
        lLid.position.set(4.5 + side * 0.64, 0.93, tz);
        scene.add(lLid);

        // Seated Employee Agent watching Presentation
        const aud = buildHuman(
          (rIdx + sIdx) % 2 === 0 ? 0x1e293b : 0x334155,
          sIdx === 0 ? 0x38bdf8 : 0xf8fafc,
          0xe0ac69,
          true,
          'audience',
          rIdx + sIdx
        );
        aud.position.set(4.5 + side * 1.55, 0, tz);
        aud.rotation.y = side < 0 ? Math.PI * 0.72 : -Math.PI * 0.72;
        scene.add(aud);
      });
    });

    // Animation Loop
    const clock = new THREE.Clock();
    let reqId = 0;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (isTransitioningRef.current) {
        camera.position.lerp(camGoalRef.current, 0.08);
        controls.target.lerp(targetGoalRef.current, 0.08);
        if (camera.position.distanceTo(camGoalRef.current) < 0.08) {
          isTransitioningRef.current = false;
        }
      }

      controls.update();

      for (const ag of animatedAgents) {
        const t = elapsed * 4.5 + ag.phase;
        if (ag.role === 'typing') {
          ag.leftArm.rotation.x = -0.82 + Math.sin(t * 2.4) * 0.09;
          ag.rightArm.rotation.x = -0.82 + Math.cos(t * 2.4) * 0.09;
          ag.head.rotation.y = Math.sin(t * 0.4) * 0.18;
        } else if (ag.role === 'presenter') {
          ag.rightArm.rotation.x = -1.1 + Math.sin(t * 0.9) * 0.28;
          ag.head.rotation.y = Math.sin(t * 0.5) * 0.35;
        } else if (ag.role === 'collab') {
          ag.rightArm.rotation.x = -0.7 + Math.sin(t * 0.8) * 0.2;
          ag.head.rotation.y = Math.cos(t * 0.4) * 0.25;
        } else {
          ag.head.rotation.y = Math.sin(t * 0.3) * 0.12;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('start', onControlStart);
      controls.dispose();
      renderer.dispose();
      monitorTex.dispose();
      ghWallTex.dispose();
      presTex.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-cyan-500/40 bg-slate-950 shadow-inner">
      {/* 3D WebGL Mount Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top-Left Live Telemetry Pill */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 pointer-events-none">
        <span className="px-2.5 py-1 rounded-md bg-slate-950/85 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 font-semibold shadow">
          3D LIVE CORPORATE OFFICE UNDER TOWER • {agentCount} AGENTS ACTIVE
        </span>
        <span className="hidden md:inline-block px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-[10px] font-mono text-slate-300">
          Drag to Orbit 360° • Scroll to Zoom
        </span>
      </div>

      {/* Top-Right Presentation Slide Controller */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <button
          onClick={onNextSlide}
          className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/50 text-cyan-200 text-[11px] font-mono font-semibold flex items-center gap-1 transition shadow"
          title="Advance Slide on 3D Presentation Room Projector"
        >
          <span>Slide 0{(slideIndex % 4) + 1}/04</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Camera Zone Quick-Focus Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800/90">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'overview' as const, label: 'Full Office View', icon: Eye },
            { id: 'workstations' as const, label: 'Laptop & PC Desks', icon: Laptop },
            { id: 'presentation' as const, label: 'Presentation Room', icon: Presentation },
            { id: 'github-agents' as const, label: 'GitHub & AI Agents Wall', icon: GitBranch },
          ].map((btn) => {
            const Icon = btn.icon;
            const active = activeZone === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => onZoneChange(btn.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition ${
                  active
                    ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 font-bold shadow-sm'
                    : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-cyan-400" />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
