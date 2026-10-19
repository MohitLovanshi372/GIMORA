/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CameraMode } from '../types';
import { InteriorBuildingType } from '../../ui/BuildingInteriorModal';
import { CityPhysicsEngine } from './CityPhysicsEngine';

export interface InteractionPrompt {
  message: string;
  buildingType: InteriorBuildingType;
  buildingName: string;
}

export class PlayerSystem {
  public avatarGroup: THREE.Group;
  public position: THREE.Vector3;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private verticalVelocity = 0;
  private isGrounded = true;
  private stridePhase = 0;
  private scene: THREE.Scene;
  private physicsEngine: CityPhysicsEngine | null = null;

  // Articulated avatar limbs for grounded walking/sprint animation
  private leftLegMesh!: THREE.Mesh;
  private rightLegMesh!: THREE.Mesh;
  private leftArmMesh!: THREE.Mesh;
  private rightArmMesh!: THREE.Mesh;

  // Key states
  private keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false,
    interact: false,
  };

  private walkSpeed = 18; // m/s
  private sprintSpeed = 36; // m/s
  private currentSpeed = 0;
  private readonly gravity = -26; // m/s^2
  private readonly jumpImpulse = 9.8; // m/s
  private readonly collisionRadius = 0.75;
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
      name: 'Metropolitan Galleria Atrium',
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

  constructor(
    scene: THREE.Scene,
    onInteract?: (type: InteriorBuildingType) => void,
    physicsEngine?: CityPhysicsEngine
  ) {
    this.scene = scene;
    this.onInteractCallback = onInteract;
    this.physicsEngine = physicsEngine || null;
    this.position = new THREE.Vector3(140, 0.18, -42); // Spawn on Mohit Hub entrance plaza outside collider

    this.avatarGroup = new THREE.Group();
    this.avatarGroup.name = 'player_avatar';
    this.buildAvatar();
    this.scene.add(this.avatarGroup);

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  public setPhysicsEngine(engine: CityPhysicsEngine) {
    this.physicsEngine = engine;
  }

  private buildAvatar() {
    // Realistic Urban Explorer / Architect Avatar
    const jacketMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.65,
      metalness: 0.15,
    });
    const trousersMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.8,
    });
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.55,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.88,
    });

    // Torso / Jacket
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.48), jacketMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    this.avatarGroup.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.48), headMat);
    head.position.y = 2.15;
    head.castShadow = true;
    this.avatarGroup.add(head);

    // Hair cap
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.22, 0.52), hairMat);
    hair.position.y = 2.38;
    this.avatarGroup.add(hair);

    // Articulated Arms
    const armGeo = new THREE.BoxGeometry(0.24, 0.88, 0.26);
    this.leftArmMesh = new THREE.Mesh(armGeo, jacketMat);
    this.leftArmMesh.position.set(-0.54, 1.32, 0);
    this.leftArmMesh.castShadow = true;

    this.rightArmMesh = new THREE.Mesh(armGeo, jacketMat);
    this.rightArmMesh.position.set(0.54, 1.32, 0);
    this.rightArmMesh.castShadow = true;
    this.avatarGroup.add(this.leftArmMesh, this.rightArmMesh);

    // Articulated Legs
    const legGeo = new THREE.BoxGeometry(0.3, 0.9, 0.34);
    this.leftLegMesh = new THREE.Mesh(legGeo, trousersMat);
    this.leftLegMesh.position.set(-0.24, 0.45, 0);
    this.leftLegMesh.castShadow = true;

    this.rightLegMesh = new THREE.Mesh(legGeo, trousersMat);
    this.rightLegMesh.position.set(0.24, 0.45, 0);
    this.rightLegMesh.castShadow = true;
    this.avatarGroup.add(this.leftLegMesh, this.rightLegMesh);

    this.avatarGroup.position.copy(this.position);
  }

  public update(delta: number, cameraMode: CameraMode, camera: THREE.PerspectiveCamera): InteractionPrompt | null {
    const dt = Math.min(delta, 0.1);
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

      const targetMaxSpeed = this.keys.sprint ? this.sprintSpeed : this.walkSpeed;
      const isMovingInput = moveDir.lengthSq() > 0.001;

      if (isMovingInput) {
        moveDir.normalize();
        // Grounded acceleration curve
        this.currentSpeed = THREE.MathUtils.damp(this.currentSpeed, targetMaxSpeed, 10, dt);
        this.velocity.copy(moveDir).multiplyScalar(this.currentSpeed * dt);

        // Smoothly orient avatar towards movement direction
        this.yaw = Math.atan2(moveDir.x, moveDir.z);
        this.avatarGroup.rotation.y = this.yaw + Math.PI;
      } else {
        // Grounded friction deceleration
        this.currentSpeed = THREE.MathUtils.damp(this.currentSpeed, 0, 14, dt);
        this.velocity.multiplyScalar(Math.max(0, 1 - 14 * dt));
      }

      // Compute candidate horizontal coordinates
      const candidateX = this.position.x + this.velocity.x;
      const candidateZ = this.position.z + this.velocity.z;

      if (this.physicsEngine) {
        // Enforce Strict Solid Wall Stopping against all buildings, podiums, and river walls
        const res = this.physicsEngine.resolveHorizontalMovement(
          this.position.x,
          this.position.z,
          candidateX,
          candidateZ,
          this.position.y,
          this.collisionRadius
        );
        this.position.x = res.x;
        this.position.z = res.z;
        if (res.blocked) {
          // Strict wall stop: immediately arrest forward momentum upon solid wall contact
          this.currentSpeed = 0;
          this.velocity.set(0, 0, 0);
        }
      } else {
        this.position.x = THREE.MathUtils.clamp(candidateX, -260, 260);
        this.position.z = THREE.MathUtils.clamp(candidateZ, -260, 260);
      }

      // Vertical physics: Ground elevation (curbs, sidewalks, river bridges) + Gravity + Jump
      const groundY = this.physicsEngine
        ? this.physicsEngine.getGroundHeightAt(this.position.x, this.position.z)
        : 0;

      if (this.keys.jump && this.isGrounded) {
        this.verticalVelocity = this.jumpImpulse;
        this.isGrounded = false;
      }

      if (!this.isGrounded || this.position.y > groundY + 0.05) {
        this.verticalVelocity += this.gravity * dt;
        this.position.y += this.verticalVelocity * dt;
        if (this.position.y <= groundY) {
          this.position.y = groundY;
          this.verticalVelocity = 0;
          this.isGrounded = true;
        }
      } else {
        // Smooth step-up / step-down curb & bridge deck transition
        this.position.y = THREE.MathUtils.damp(this.position.y, groundY, 16, dt);
        this.isGrounded = true;
      }

      // Animate walking & sprinting limb stride kinematics
      if (this.currentSpeed > 0.5 && this.isGrounded) {
        const freq = this.keys.sprint ? 14 : 9;
        this.stridePhase += dt * freq;
        const swing = Math.sin(this.stridePhase) * (this.keys.sprint ? 0.65 : 0.42);
        this.leftLegMesh.rotation.x = swing;
        this.rightLegMesh.rotation.x = -swing;
        this.leftArmMesh.rotation.x = -swing * 0.85;
        this.rightArmMesh.rotation.x = swing * 0.85;
      } else {
        this.leftLegMesh.rotation.x = THREE.MathUtils.damp(this.leftLegMesh.rotation.x, 0, 12, dt);
        this.rightLegMesh.rotation.x = THREE.MathUtils.damp(this.rightLegMesh.rotation.x, 0, 12, dt);
        this.leftArmMesh.rotation.x = THREE.MathUtils.damp(this.leftArmMesh.rotation.x, 0, 12, dt);
        this.rightArmMesh.rotation.x = THREE.MathUtils.damp(this.rightArmMesh.rotation.x, 0, 12, dt);
      }

      this.avatarGroup.position.copy(this.position);

      // Third-person camera follow with Spring-Arm Anti-Clipping
      if (cameraMode === 'third-person') {
        const offset = new THREE.Vector3(0, 3.8, 8.5);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.avatarGroup.rotation.y - Math.PI);
        const desiredCamPos = this.position.clone().add(offset);
        const lookAtTarget = new THREE.Vector3(this.position.x, this.position.y + 1.85, this.position.z);

        const safeCamPos = this.physicsEngine
          ? this.physicsEngine.resolveCameraOcclusion(lookAtTarget, desiredCamPos, 1.4)
          : desiredCamPos;

        camera.position.lerp(safeCamPos, 1 - Math.exp(-14 * dt));
        camera.lookAt(lookAtTarget);
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
      case 'Space':
        this.keys.jump = true;
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
      case 'Space':
        this.keys.jump = false;
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
