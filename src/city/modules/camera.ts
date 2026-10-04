/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CameraMode } from '../types';

export interface CameraController {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  mode: CameraMode;
  setMode: (mode: CameraMode) => void;
  flyTo: (target: THREE.Vector3, cameraPos?: THREE.Vector3, duration?: number) => void;
  update: (delta: number, followTarget?: THREE.Object3D | null) => void;
  onKeyDown: (e: KeyboardEvent) => void;
  onKeyUp: (e: KeyboardEvent) => void;
  dispose: () => void;
}

export function createCityCamera(
  domElement: HTMLElement,
  aspectRatio: number
): CameraController {
  const camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.5, 2000);
  camera.position.set(0, 195, 320);

  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.04; // Don't clip below ground
  controls.minDistance = 15;
  controls.maxDistance = 650;
  controls.target.set(0, 35, -40);

  let mode: CameraMode = 'orbit';

  // Smooth camera transition state
  let isTransitioning = false;
  let transitionProgress = 0;
  let transitionDuration = 1.2;
  const startCamPos = new THREE.Vector3();
  const targetCamPos = new THREE.Vector3();
  const startTargetPos = new THREE.Vector3();
  const targetTargetPos = new THREE.Vector3();

  // First-Person Mode state
  const fpvState = {
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    moveSpeed: 38, // units per second
    yaw: 0,
    pitch: 0,
    mouseSensitivity: 0.0025,
    isPointerDown: false,
    lastMouseX: 0,
    lastMouseY: 0,
  };

  const flyTo = (
    target: THREE.Vector3,
    camPos?: THREE.Vector3,
    duration: number = 1.2
  ) => {
    isTransitioning = true;
    transitionProgress = 0;
    transitionDuration = duration;

    startCamPos.copy(camera.position);
    startTargetPos.copy(controls.target);

    targetTargetPos.copy(target);

    if (camPos) {
      targetCamPos.copy(camPos);
    } else {
      // Automatic offset relative to target
      const offset = new THREE.Vector3(-45, 35, 55);
      targetCamPos.copy(target).add(offset);
    }
  };

  const setMode = (newMode: CameraMode) => {
    mode = newMode;
    if (newMode === 'first-person') {
      controls.enabled = false;
      // Drop camera down to human street level on the river promenade
      const currentXZ = new THREE.Vector3(camera.position.x, 2.2, camera.position.z);
      if (currentXZ.length() > 240) {
        currentXZ.set(-45, 2.2, 0); // West riverside parkway
      }
      flyTo(new THREE.Vector3(currentXZ.x, 2.2, currentXZ.z - 20), currentXZ, 0.8);
    } else if (newMode === 'orbit') {
      controls.enabled = true;
    } else if (newMode === 'aerial') {
      controls.enabled = true;
      flyTo(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 380, 50), 1.6);
    } else if (newMode === 'cinematic') {
      controls.enabled = true;
      // High-altitude cinematic perspective exactly matching the reference image visual hierarchy:
      // Looking down the illuminated river canyon, downtown + Mohit Hub in center, airport & mountains in background
      flyTo(new THREE.Vector3(0, 35, -40), new THREE.Vector3(0, 210, 340), 1.8);
    } else if (newMode === 'mohit-hub') {
      controls.enabled = true;
      flyTo(new THREE.Vector3(140, 75, -80), new THREE.Vector3(75, 38, -25), 1.4);
    } else if (newMode === 'river-view') {
      controls.enabled = true;
      // Low river perspective showcasing water reflections, docks, and bridges
      flyTo(new THREE.Vector3(0, 4, -40), new THREE.Vector3(0, 7, 120), 1.4);
    } else if (newMode === 'bridge-view') {
      controls.enabled = true;
      // Grand Central Bridge showcase angle
      flyTo(new THREE.Vector3(10, 8, 0), new THREE.Vector3(-48, 16, 32), 1.4);
    } else if (newMode === 'railway-view') {
      controls.enabled = true;
      // Central Railway Terminal & Maglev Tracks
      flyTo(new THREE.Vector3(0, 10, -220), new THREE.Vector3(-55, 26, -170), 1.4);
    } else if (newMode === 'airport-view') {
      controls.enabled = true;
      // Airport Terminal & Runway Approach Lighting
      flyTo(new THREE.Vector3(180, 15, -315), new THREE.Vector3(110, 35, -240), 1.4);
    } else if (
      newMode === 'third-person' ||
      newMode === 'drone' ||
      newMode === 'follow-vehicle' ||
      newMode === 'follow-train' ||
      newMode === 'city-flyover'
    ) {
      controls.enabled = false;
    }
  };

  // First person keyboard controls
  const onKeyDown = (e: KeyboardEvent) => {
    if (mode !== 'first-person') return;
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        fpvState.moveForward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        fpvState.moveBackward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        fpvState.moveLeft = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        fpvState.moveRight = true;
        break;
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        fpvState.moveForward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        fpvState.moveBackward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        fpvState.moveLeft = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        fpvState.moveRight = false;
        break;
    }
  };

  // Mouse look in first-person mode
  const onMouseDown = (e: MouseEvent) => {
    if (mode === 'first-person') {
      fpvState.isPointerDown = true;
      fpvState.lastMouseX = e.clientX;
      fpvState.lastMouseY = e.clientY;
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    if (mode === 'first-person' && fpvState.isPointerDown) {
      const deltaX = e.clientX - fpvState.lastMouseX;
      const deltaY = e.clientY - fpvState.lastMouseY;
      fpvState.lastMouseX = e.clientX;
      fpvState.lastMouseY = e.clientY;

      fpvState.yaw -= deltaX * fpvState.mouseSensitivity;
      fpvState.pitch -= deltaY * fpvState.mouseSensitivity;
      fpvState.pitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, fpvState.pitch));

      const dir = new THREE.Vector3(
        Math.sin(fpvState.yaw) * Math.cos(fpvState.pitch),
        Math.sin(fpvState.pitch),
        -Math.cos(fpvState.yaw) * Math.cos(fpvState.pitch)
      );
      camera.lookAt(camera.position.clone().add(dir));
    }
  };

  const onMouseUp = () => {
    fpvState.isPointerDown = false;
  };

  domElement.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  const update = (delta: number, followTarget?: THREE.Object3D | null) => {
    if (isTransitioning) {
      transitionProgress += delta / transitionDuration;
      if (transitionProgress >= 1.0) {
        transitionProgress = 1.0;
        isTransitioning = false;
      }

      // Smooth cubic ease-out curve
      const t = 1 - Math.pow(1 - transitionProgress, 3);

      camera.position.lerpVectors(startCamPos, targetCamPos, t);
      controls.target.lerpVectors(startTargetPos, targetTargetPos, t);

      if (mode === 'orbit') {
        controls.update();
      }
      return;
    }

    if (mode === 'orbit') {
      controls.update();
    } else if (mode === 'cinematic' || mode === 'drone') {
      // Cinematic slow 360 revolution around city center
      const speed = mode === 'drone' ? 0.08 : 0.12;
      const angle = delta * speed;
      const x = camera.position.x;
      const z = camera.position.z;
      camera.position.x = x * Math.cos(angle) - z * Math.sin(angle);
      camera.position.z = x * Math.sin(angle) + z * Math.cos(angle);
      camera.lookAt(0, 30, 0);
    } else if (mode === 'mohit-hub') {
      // Slow showcase orbit around Mohit Developer Hub HQ
      const hubCenter = new THREE.Vector3(140, 50, -80);
      const angle = delta * 0.18;
      const relX = camera.position.x - hubCenter.x;
      const relZ = camera.position.z - hubCenter.z;
      camera.position.x = hubCenter.x + (relX * Math.cos(angle) - relZ * Math.sin(angle));
      camera.position.z = hubCenter.z + (relX * Math.sin(angle) + relZ * Math.cos(angle));
      camera.lookAt(hubCenter);
    } else if (mode === 'follow-vehicle' && followTarget) {
      // Follow behind the vehicle along its heading
      const targetPos = followTarget.position;
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(followTarget.quaternion).normalize();
      const desiredPos = targetPos.clone().sub(forward.clone().multiplyScalar(13)).add(new THREE.Vector3(0, 5.5, 0));
      camera.position.lerp(desiredPos, 0.1);
      const lookAtPos = targetPos.clone().add(forward.clone().multiplyScalar(8)).add(new THREE.Vector3(0, 1.5, 0));
      camera.lookAt(lookAtPos);
    } else if (mode === 'follow-train' && followTarget) {
      // Elevated side-tracking camera alongside the high-speed maglev train
      const targetPos = followTarget.position;
      const desiredPos = new THREE.Vector3(targetPos.x - 22, 14, targetPos.z + 18);
      camera.position.lerp(desiredPos, 0.1);
      camera.lookAt(targetPos.clone().add(new THREE.Vector3(12, 2.5, 0)));
    } else if (mode === 'first-person') {
      // Handle movement along walking direction
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(camera.up, forward).normalize();

      const moveVec = new THREE.Vector3();
      if (fpvState.moveForward) moveVec.add(forward);
      if (fpvState.moveBackward) moveVec.sub(forward);
      if (fpvState.moveLeft) moveVec.add(right);
      if (fpvState.moveRight) moveVec.sub(right);

      if (moveVec.lengthSq() > 0) {
        moveVec.normalize().multiplyScalar(fpvState.moveSpeed * delta);
        camera.position.add(moveVec);
      }

      // Keep eye level at pedestrian height (Y = 2.2)
      camera.position.y = 2.2;

      // Keep within city boundaries (-260 to 260)
      camera.position.x = Math.max(-260, Math.min(260, camera.position.x));
      camera.position.z = Math.max(-260, Math.min(260, camera.position.z));
    }
  };

  const dispose = () => {
    controls.dispose();
    domElement.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  return {
    camera,
    controls,
    mode,
    setMode,
    flyTo,
    update,
    onKeyDown,
    onKeyUp,
    dispose,
  };
}
