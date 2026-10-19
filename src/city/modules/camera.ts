/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CameraMode } from '../types';
import { CityPhysicsEngine } from './CityPhysicsEngine';

export interface CameraController {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  mode: CameraMode;
  setMode: (mode: CameraMode) => void;
  setPhysicsEngine: (engine: CityPhysicsEngine) => void;
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
  let physicsEngine: CityPhysicsEngine | null = null;

  // Smooth camera transition state
  let isTransitioning = false;
  let transitionProgress = 0;
  let transitionDuration = 1.2;
  const startCamPos = new THREE.Vector3();
  const targetCamPos = new THREE.Vector3();
  const startTargetPos = new THREE.Vector3();
  const targetTargetPos = new THREE.Vector3();

  // First-Person Mode state with grounded walking, sprint, jump & head-bob physics
  const fpvState = {
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    sprint: false,
    jump: false,
    walkSpeed: 18,
    sprintSpeed: 36,
    currentSpeed: 0,
    verticalVelocity: 0,
    groundY: 0,
    isGrounded: true,
    bobPhase: 0,
    eyeHeight: 2.2,
    yaw: 0,
    pitch: 0,
    mouseSensitivity: 0.0025,
    isPointerDown: false,
    lastMouseX: 0,
    lastMouseY: 0,
  };

  const setPhysicsEngine = (engine: CityPhysicsEngine) => {
    physicsEngine = engine;
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
      const offset = new THREE.Vector3(-45, 35, 55);
      targetCamPos.copy(target).add(offset);
    }
  };

  const setMode = (newMode: CameraMode) => {
    mode = newMode;
    if (newMode === 'first-person') {
      controls.enabled = false;
      // Drop camera down to safe street level outside building colliders
      const currentXZ = new THREE.Vector3(camera.position.x, 2.2, camera.position.z);
      if (
        currentXZ.length() > 240 ||
        (physicsEngine && physicsEngine.checkCollisionAt(currentXZ.x, currentXZ.z, 0, 1.0))
      ) {
        currentXZ.set(-40, 2.2, 0); // West riverside promenade
      }
      fpvState.groundY = physicsEngine ? physicsEngine.getGroundHeightAt(currentXZ.x, currentXZ.z) : 0;
      currentXZ.y = fpvState.groundY + fpvState.eyeHeight;
      flyTo(new THREE.Vector3(currentXZ.x, currentXZ.y, currentXZ.z - 20), currentXZ, 0.8);
    } else if (newMode === 'orbit') {
      controls.enabled = true;
      camera.fov = 50;
      camera.updateProjectionMatrix();
    } else if (newMode === 'aerial') {
      controls.enabled = true;
      flyTo(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 380, 50), 1.6);
    } else if (newMode === 'cinematic') {
      controls.enabled = true;
      flyTo(new THREE.Vector3(0, 35, -40), new THREE.Vector3(0, 210, 340), 1.8);
    } else if (newMode === 'mohit-hub') {
      controls.enabled = true;
      flyTo(new THREE.Vector3(140, 75, -80), new THREE.Vector3(75, 38, -25), 1.4);
    } else if (newMode === 'river-view') {
      controls.enabled = true;
      flyTo(new THREE.Vector3(0, 4, -40), new THREE.Vector3(0, 7, 120), 1.4);
    } else if (newMode === 'bridge-view') {
      controls.enabled = true;
      flyTo(new THREE.Vector3(10, 8, 0), new THREE.Vector3(-48, 16, 32), 1.4);
    } else if (newMode === 'railway-view') {
      controls.enabled = true;
      flyTo(new THREE.Vector3(0, 10, -220), new THREE.Vector3(-55, 26, -170), 1.4);
    } else if (newMode === 'airport-view') {
      controls.enabled = true;
      flyTo(new THREE.Vector3(180, 15, -315), new THREE.Vector3(110, 35, -240), 1.4);
    } else if (newMode === 'flyover-view') {
      controls.enabled = true;
      flyTo(new THREE.Vector3(100, 10, -50), new THREE.Vector3(135, 24, -110), 1.4);
    } else if (newMode === 'park-view') {
      controls.enabled = true;
      flyTo(new THREE.Vector3(-68, 4, 0), new THREE.Vector3(-105, 18, 42), 1.4);
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
      case 'ShiftLeft':
      case 'ShiftRight':
        fpvState.sprint = true;
        break;
      case 'Space':
        fpvState.jump = true;
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
      case 'ShiftLeft':
      case 'ShiftRight':
        fpvState.sprint = false;
        break;
      case 'Space':
        fpvState.jump = false;
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
    const dt = Math.min(delta, 0.1);

    if (isTransitioning) {
      transitionProgress += dt / transitionDuration;
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
      if (physicsEngine) {
        const minGround = physicsEngine.getGroundHeightAt(camera.position.x, camera.position.z) + 1.5;
        if (camera.position.y < minGround) {
          camera.position.y = minGround;
        }
      }
    } else if (mode === 'cinematic' || mode === 'drone') {
      const speed = mode === 'drone' ? 0.08 : 0.12;
      const angle = dt * speed;
      const x = camera.position.x;
      const z = camera.position.z;
      camera.position.x = x * Math.cos(angle) - z * Math.sin(angle);
      camera.position.z = x * Math.sin(angle) + z * Math.cos(angle);
      camera.lookAt(0, 30, 0);
    } else if (mode === 'mohit-hub') {
      const hubCenter = new THREE.Vector3(140, 50, -80);
      const angle = dt * 0.18;
      const relX = camera.position.x - hubCenter.x;
      const relZ = camera.position.z - hubCenter.z;
      camera.position.x = hubCenter.x + (relX * Math.cos(angle) - relZ * Math.sin(angle));
      camera.position.z = hubCenter.z + (relX * Math.sin(angle) + relZ * Math.cos(angle));
      camera.lookAt(hubCenter);
    } else if (mode === 'follow-vehicle' && followTarget) {
      const targetPos = followTarget.position;
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(followTarget.quaternion).normalize();
      const desiredPos = targetPos.clone().sub(forward.clone().multiplyScalar(13)).add(new THREE.Vector3(0, 5.5, 0));
      camera.position.lerp(desiredPos, 0.1);
      const lookAtPos = targetPos.clone().add(forward.clone().multiplyScalar(8)).add(new THREE.Vector3(0, 1.5, 0));
      camera.lookAt(lookAtPos);
    } else if (mode === 'follow-train' && followTarget) {
      const targetPos = followTarget.position;
      const desiredPos = new THREE.Vector3(targetPos.x - 22, 14, targetPos.z + 18);
      camera.position.lerp(desiredPos, 0.1);
      camera.lookAt(targetPos.clone().add(new THREE.Vector3(12, 2.5, 0)));
    } else if (mode === 'first-person') {
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

      const targetMaxSpeed = fpvState.sprint ? fpvState.sprintSpeed : fpvState.walkSpeed;
      if (moveVec.lengthSq() > 0) {
        moveVec.normalize();
        fpvState.currentSpeed = THREE.MathUtils.damp(fpvState.currentSpeed, targetMaxSpeed, 10, dt);
        moveVec.multiplyScalar(fpvState.currentSpeed * dt);
      } else {
        fpvState.currentSpeed = THREE.MathUtils.damp(fpvState.currentSpeed, 0, 14, dt);
      }

      const candidateX = camera.position.x + moveVec.x;
      const candidateZ = camera.position.z + moveVec.z;

      if (physicsEngine) {
        // Strict Solid Wall Stopping against buildings and river embankments
        const res = physicsEngine.resolveHorizontalMovement(
          camera.position.x,
          camera.position.z,
          candidateX,
          candidateZ,
          fpvState.groundY,
          0.75
        );
        camera.position.x = res.x;
        camera.position.z = res.z;
        if (res.blocked) {
          fpvState.currentSpeed = 0;
        }
      } else {
        camera.position.x = Math.max(-260, Math.min(260, candidateX));
        camera.position.z = Math.max(-260, Math.min(260, candidateZ));
      }

      // Ground elevation (sidewalk curbs, park terraces, river bridges) + jump/gravity
      const surfaceY = physicsEngine
        ? physicsEngine.getGroundHeightAt(camera.position.x, camera.position.z)
        : 0;

      if (fpvState.jump && fpvState.isGrounded) {
        fpvState.verticalVelocity = 9.8;
        fpvState.isGrounded = false;
      }

      if (!fpvState.isGrounded || fpvState.groundY > surfaceY + 0.05) {
        fpvState.verticalVelocity -= 26 * dt;
        fpvState.groundY += fpvState.verticalVelocity * dt;
        if (fpvState.groundY <= surfaceY) {
          fpvState.groundY = surfaceY;
          fpvState.verticalVelocity = 0;
          fpvState.isGrounded = true;
        }
      } else {
        fpvState.groundY = THREE.MathUtils.damp(fpvState.groundY, surfaceY, 16, dt);
        fpvState.isGrounded = true;
      }

      // Subtle grounded walking/sprinting head-bob & FOV cue
      let bobOffset = 0;
      if (fpvState.currentSpeed > 0.5 && fpvState.isGrounded) {
        fpvState.bobPhase += dt * (fpvState.sprint ? 13 : 8.5);
        bobOffset = Math.sin(fpvState.bobPhase) * (fpvState.sprint ? 0.11 : 0.06);
      }

      const targetFov = fpvState.sprint && fpvState.currentSpeed > 20 ? 55 : 50;
      if (Math.abs(camera.fov - targetFov) > 0.05) {
        camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 8, dt);
        camera.updateProjectionMatrix();
      }

      camera.position.y = fpvState.groundY + fpvState.eyeHeight + bobOffset;
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
    setPhysicsEngine,
    flyTo,
    update,
    onKeyDown,
    onKeyUp,
    dispose,
  };
}
