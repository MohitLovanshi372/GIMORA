/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CameraMode } from '../types';
import { InteriorBuildingType } from '../../ui/BuildingInteriorModal';

export interface InteractionPrompt {
  message: string;
  buildingType: InteriorBuildingType;
  buildingName: string;
}

export class PlayerSystem {
  public avatarGroup: THREE.Group;
  public position: THREE.Vector3;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private scene: THREE.Scene;

  // Key states
  private keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    interact: false,
  };

  private walkSpeed = 22; // m/s
  private sprintSpeed = 44; // m/s
  private yaw = 0;
  public currentPrompt: InteractionPrompt | null = null;
  private onInteractCallback?: (type: InteriorBuildingType) => void;

  // Landmark interactive trigger locations
  private interactiveSpots = [
    {
      type: 'mohit-hub' as InteriorBuildingType,
      name: 'MOHIT DEVELOPER HUB',
      pos: new THREE.Vector3(140, 0, -80),
      radius: 38,
    },
    {
      type: 'railway' as InteriorBuildingType,
      name: 'Central Maglev Terminal',
      pos: new THREE.Vector3(0, 0, -220),
      radius: 45,
    },
    {
      type: 'hospital' as InteriorBuildingType,
      name: 'Neo-Genesis Smart Hospital',
      pos: new THREE.Vector3(-160, 0, 170),
      radius: 40,
    },
    {
      type: 'university' as InteriorBuildingType,
      name: 'Neo-Metropolis University',
      pos: new THREE.Vector3(140, 0, 160),
      radius: 40,
    },
    {
      type: 'mall' as InteriorBuildingType,
      name: 'Cyber-Pulse Megaplex Atrium',
      pos: new THREE.Vector3(-80, 0, -160),
      radius: 35,
    },
    {
      type: 'city-hall' as InteriorBuildingType,
      name: 'Metropolis City Hall',
      pos: new THREE.Vector3(-110, 0, 0),
      radius: 35,
    },
  ];

  constructor(scene: THREE.Scene, onInteract?: (type: InteriorBuildingType) => void) {
    this.scene = scene;
    this.onInteractCallback = onInteract;
    this.position = new THREE.Vector3(140, 0, -40); // Spawn near Mohit Hub entrance avenue

    this.avatarGroup = new THREE.Group();
    this.avatarGroup.name = 'player_avatar';
    this.buildAvatar();
    this.scene.add(this.avatarGroup);

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private buildAvatar() {
    // Cybernetic Engineer Avatar
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.8,
      roughness: 0.2,
    });
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const accentMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.5), bodyMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    this.avatarGroup.add(torso);

    // Head & Helmet
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), bodyMat);
    head.position.y = 2.15;
    this.avatarGroup.add(head);

    // Glowing Visor
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.16, 0.1), visorMat);
    visor.position.set(0, 2.15, -0.28);
    this.avatarGroup.add(visor);

    // Cyber Jetpack / Battery
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.25), accentMat);
    pack.position.set(0, 1.4, 0.35);
    this.avatarGroup.add(pack);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.3, 0.9, 0.35);
    const leftLeg = new THREE.Mesh(legGeo, bodyMat);
    leftLeg.position.set(-0.25, 0.45, 0);
    const rightLeg = new THREE.Mesh(legGeo, bodyMat);
    rightLeg.position.set(0.25, 0.45, 0);
    this.avatarGroup.add(leftLeg, rightLeg);

    this.avatarGroup.position.copy(this.position);
  }

  public update(delta: number, cameraMode: CameraMode, camera: THREE.PerspectiveCamera): InteractionPrompt | null {
    const isPlayerControlled = cameraMode === 'first-person' || cameraMode === 'third-person';

    // Show/hide avatar depending on mode
    this.avatarGroup.visible = cameraMode === 'third-person';

    if (isPlayerControlled) {
      // Calculate forward direction relative to camera
      const cameraDir = new THREE.Vector3();
      camera.getWorldDirection(cameraDir);
      cameraDir.y = 0;
      cameraDir.normalize();

      const cameraRight = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), cameraDir).normalize();

      const moveDir = new THREE.Vector3();
      if (this.keys.forward) moveDir.add(cameraDir);
      if (this.keys.backward) moveDir.sub(cameraDir);
      if (this.keys.left) moveDir.add(cameraRight);
      if (this.keys.right) moveDir.sub(cameraRight);

      const speed = this.keys.sprint ? this.sprintSpeed : this.walkSpeed;

      if (moveDir.lengthSq() > 0.001) {
        moveDir.normalize();
        this.velocity.copy(moveDir.multiplyScalar(speed * delta));
        this.position.add(this.velocity);

        // Orient avatar towards movement direction
        this.yaw = Math.atan2(moveDir.x, moveDir.z);
        this.avatarGroup.rotation.y = this.yaw + Math.PI;
      }

      // Keep within city bounds
      this.position.x = THREE.MathUtils.clamp(this.position.x, -260, 260);
      this.position.z = THREE.MathUtils.clamp(this.position.z, -260, 260);
      this.position.y = 0; // lock to street level

      this.avatarGroup.position.copy(this.position);

      // Third-person camera follow
      if (cameraMode === 'third-person') {
        const offset = new THREE.Vector3(0, 3.8, 8.5);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.avatarGroup.rotation.y - Math.PI);
        camera.position.copy(this.position).add(offset);
        camera.lookAt(this.position.x, this.position.y + 1.8, this.position.z);
      }
    }

    // Check building interaction proximity
    this.currentPrompt = null;
    for (const spot of this.interactiveSpots) {
      const dist = new THREE.Vector2(this.position.x, this.position.z).distanceTo(
        new THREE.Vector2(spot.pos.x, spot.pos.z)
      );

      if (dist < spot.radius) {
        this.currentPrompt = {
          message: `Press [E] to Enter ${spot.name}`,
          buildingType: spot.type,
          buildingName: spot.name,
        };
        break;
      }
    }

    return this.currentPrompt;
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.sprint = true;
        break;
      case 'KeyE':
        if (this.currentPrompt && this.onInteractCallback) {
          this.onInteractCallback(this.currentPrompt.buildingType);
        }
        break;
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.sprint = false;
        break;
    }
  };

  public triggerInteract() {
    if (this.currentPrompt && this.onInteractCallback) {
      this.onInteractCallback(this.currentPrompt.buildingType);
    }
  }

  public setPosition(x: number, y: number, z: number) {
    this.position.set(x, y, z);
    this.avatarGroup.position.copy(this.position);
  }

  public dispose() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.scene.remove(this.avatarGroup);
  }
}
