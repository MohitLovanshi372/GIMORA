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
  private idleTime = 0;
  private scene: THREE.Scene;
  private physicsEngine: CityPhysicsEngine | null = null;

  // Anatomically articulated human body hierarchy for realistic biomechanics
  private hipsGroup!: THREE.Group;
  private spineGroup!: THREE.Group;
  private headGroup!: THREE.Group;
  private leftShoulderPivot!: THREE.Group;
  private rightShoulderPivot!: THREE.Group;
  private leftElbowPivot!: THREE.Group;
  private rightElbowPivot!: THREE.Group;
  private leftHipPivot!: THREE.Group;
  private rightHipPivot!: THREE.Group;
  private leftKneePivot!: THREE.Group;
  private rightKneePivot!: THREE.Group;
  private leftAnklePivot!: THREE.Group;
  private rightAnklePivot!: THREE.Group;

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

  // Landmark & District Entry Gate interactive trigger locations
  private interactiveSpots = [
    {
      type: 'mohit-hub' as InteriorBuildingType,
      name: 'MOHIT DEVELOPER HUB (Main Entry Gate)',
      pos: new THREE.Vector3(145, 0, -46),
      radius: 42,
    },
    {
      type: 'corporate-office' as InteriorBuildingType,
      name: 'Apex Tower Financial Center (Entry Gate)',
      pos: new THREE.Vector3(-156, 0, -28),
      radius: 38,
    },
    {
      type: 'corporate-office' as InteriorBuildingType,
      name: 'Horizon Financial Monolith (Entry Gate)',
      pos: new THREE.Vector3(-154, 0, 32),
      radius: 38,
    },
    {
      type: 'corporate-office' as InteriorBuildingType,
      name: 'Lumina Corporate Plaza (Entry Gate)',
      pos: new THREE.Vector3(-126, 0, 32),
      radius: 36,
    },
    {
      type: 'corporate-office' as InteriorBuildingType,
      name: 'Omni International Trade Center (Entry Gate)',
      pos: new THREE.Vector3(-210, 0, -52),
      radius: 38,
    },
    {
      type: 'mall' as InteriorBuildingType,
      name: 'Grand Metropolitan Shopping Galleria (Entry Gate)',
      pos: new THREE.Vector3(-72, 0, 125),
      radius: 40,
    },
    {
      type: 'mall' as InteriorBuildingType,
      name: 'Civic Center Plaza & IMAX Megaplex (Entry Gate)',
      pos: new THREE.Vector3(72, 0, 190),
      radius: 38,
    },
    {
      type: 'mohit-hub' as InteriorBuildingType,
      name: 'Advanced Science & Supercomputing Institute (Entry Gate)',
      pos: new THREE.Vector3(140, 0, -125),
      radius: 38,
    },
    {
      type: 'mohit-hub' as InteriorBuildingType,
      name: 'Metropolis Engineering & Technology Tower (Entry Gate)',
      pos: new THREE.Vector3(210, 0, -125),
      radius: 38,
    },
    {
      type: 'railway' as InteriorBuildingType,
      name: 'Grand Central Union Terminal (Entry Gate)',
      pos: new THREE.Vector3(-140, 0, -188),
      radius: 45,
    },
    {
      type: 'hospital' as InteriorBuildingType,
      name: 'Neo-Genesis Smart Hospital (Entry Gate)',
      pos: new THREE.Vector3(-152, 0, 190),
      radius: 40,
    },
    {
      type: 'hospital' as InteriorBuildingType,
      name: 'Aegis Rapid Emergency & Trauma Pavilion (Entry Gate)',
      pos: new THREE.Vector3(-210, 0, 190),
      radius: 36,
    },
    {
      type: 'university' as InteriorBuildingType,
      name: 'Neo-Metropolis Central University (Entry Gate)',
      pos: new THREE.Vector3(-152, 0, -125),
      radius: 40,
    },
    {
      type: 'university' as InteriorBuildingType,
      name: 'Advanced Engineering & Robotics College (Entry Gate)',
      pos: new THREE.Vector3(-210, 0, -125),
      radius: 38,
    },
    {
      type: 'airport' as InteriorBuildingType,
      name: 'Sub-Orbital International Airport Terminal (Entry Gate)',
      pos: new THREE.Vector3(180, 0, -335),
      radius: 52,
    },
    {
      type: 'city-hall' as InteriorBuildingType,
      name: 'Metropolis Cultural & Civic Pavilion (Entry Gate)',
      pos: new THREE.Vector3(-72, 0, 190),
      radius: 38,
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
    // Spawn on Mohit Developer Hub West Forecourt Plaza outside building collider
    this.position = new THREE.Vector3(124, 0.18, -46);

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
    // Realistic PBR Human Skin, Hair, Tailored Bomber Jacket, Denim & Sneaker Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xe5b887,
      roughness: 0.52,
      metalness: 0.04,
    });
    const jacketMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep Navy Tailored Bomber Jacket
      roughness: 0.58,
      metalness: 0.18,
    });
    const jacketAccentMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Cyan-Blue Collar & Shoulder Trim
      roughness: 0.45,
      metalness: 0.25,
    });
    const innerShirtMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Crisp White Crewneck Tee
      roughness: 0.72,
      metalness: 0.05,
    });
    const trousersMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Tailored Charcoal/Indigo Slim Denim
      roughness: 0.78,
      metalness: 0.08,
    });
    const beltMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.4,
      metalness: 0.4,
    });
    const metalBuckleMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.2,
      metalness: 0.9,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x111827, // Textured Espresso-Black Hair
      roughness: 0.82,
      metalness: 0.08,
    });
    const shoeUpperMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
      metalness: 0.2,
    });
    const shoeSoleMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.65,
      metalness: 0.05,
    });
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
    const lipMat = new THREE.MeshStandardMaterial({ color: 0xc08267, roughness: 0.5 });

    // Scale human stature (~1.92m tall in world units for clear third-person visibility)
    const rootScale = 1.08;
    const figureRoot = new THREE.Group();
    figureRoot.scale.setScalar(rootScale);
    this.avatarGroup.add(figureRoot);

    // Soft radial ground contact shadow disc under player feet
    const shadowDisc = new THREE.Mesh(
      new THREE.CircleGeometry(0.42, 20),
      new THREE.MeshBasicMaterial({
        color: 0x020617,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
      })
    );
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = 0.02;
    figureRoot.add(shadowDisc);

    // 1. PELVIS & HIPS ROOT (Y = 0.96m)
    this.hipsGroup = new THREE.Group();
    this.hipsGroup.position.set(0, 0.96, 0);
    figureRoot.add(this.hipsGroup);

    const pelvisMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.165, 0.18, 16), trousersMat);
    pelvisMesh.scale.set(1.18, 1.0, 0.78);
    pelvisMesh.castShadow = true;
    this.hipsGroup.add(pelvisMesh);

    // Leather Belt & Metallic Buckle
    const beltMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 16), beltMat);
    beltMesh.scale.set(1.19, 1.0, 0.79);
    beltMesh.position.y = 0.07;
    this.hipsGroup.add(beltMesh);

    const buckleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.055, 0.03), metalBuckleMat);
    buckleMesh.position.set(0, 0.07, 0.145);
    this.hipsGroup.add(buckleMesh);

    // 2. SPINE & SCULPTED ATHLETIC TORSO (Waist -> Chest -> Clavicles)
    this.spineGroup = new THREE.Group();
    this.spineGroup.position.set(0, 0.08, 0);
    this.hipsGroup.add(this.spineGroup);

    // Lower Abdomen / Waist
    const abdomenMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.195, 0.17, 0.24, 16), jacketMat);
    abdomenMesh.scale.set(1.18, 1.0, 0.76);
    abdomenMesh.position.y = 0.12;
    abdomenMesh.castShadow = true;
    this.spineGroup.add(abdomenMesh);

    // Broad Pectoral Chest & Upper Back (V-Taper)
    const chestMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.195, 0.34, 16), jacketMat);
    chestMesh.scale.set(1.24, 1.0, 0.78);
    chestMesh.position.y = 0.38;
    chestMesh.castShadow = true;
    this.spineGroup.add(chestMesh);

    // Visible Inner White Crewneck Shirt V-Panel & Open Jacket Zip Trim
    const shirtPanel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.46, 0.04), innerShirtMat);
    shirtPanel.position.set(0, 0.32, 0.16);
    this.spineGroup.add(shirtPanel);

    [-0.07, 0.07].forEach((lx) => {
      const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.46, 0.045), jacketAccentMat);
      lapel.position.set(lx, 0.32, 0.165);
      this.spineGroup.add(lapel);
    });

    // Rounded Shoulder / Clavicle Bridge & Jacket Stand Collar
    const shoulderBridge = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.38, 8, 12), jacketMat);
    shoulderBridge.rotation.z = Math.PI / 2;
    shoulderBridge.scale.set(1.0, 1.0, 1.12);
    shoulderBridge.position.set(0, 0.52, 0);
    shoulderBridge.castShadow = true;
    this.spineGroup.add(shoulderBridge);

    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.105, 0.115, 0.07, 14, 1, true, -Math.PI * 0.8, Math.PI * 1.6),
      jacketAccentMat
    );
    collar.position.set(0, 0.58, -0.01);
    this.spineGroup.add(collar);

    // 3. NECK & ANATOMICAL HUMAN HEAD WITH FACIAL FEATURES & LAYERED HAIR
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.58, 0);
    this.spineGroup.add(this.headGroup);

    // Muscular Cylindrical Neck
    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.078, 0.13, 14), skinMat);
    neckMesh.position.y = 0.05;
    this.headGroup.add(neckMesh);

    // Cranium & Sculpted Jawline
    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.135, 20, 20), skinMat);
    cranium.scale.set(0.92, 1.08, 0.98);
    cranium.position.set(0, 0.21, 0.01);
    cranium.castShadow = true;
    this.headGroup.add(cranium);

    const jawline = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.072, 0.11, 14), skinMat);
    jawline.scale.set(0.95, 1.0, 0.92);
    jawline.position.set(0, 0.14, 0.025);
    this.headGroup.add(jawline);

    // Sculpted Nose Bridge, Ears & Lips
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.065, 8), skinMat);
    nose.rotation.x = Math.PI * 0.42;
    nose.position.set(0, 0.20, 0.145);
    this.headGroup.add(nose);

    const lips = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.014, 0.02), lipMat);
    lips.position.set(0, 0.145, 0.128);
    this.headGroup.add(lips);

    [-0.125, 0.125].forEach((ex) => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), skinMat);
      ear.scale.set(0.45, 1.15, 0.75);
      ear.position.set(ex, 0.20, 0.0);
      this.headGroup.add(ear);
    });

    // Eyes (Sclera + Iris/Pupil) & Eyebrows
    [-0.046, 0.046].forEach((ex) => {
      const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 10), eyeWhiteMat);
      eyeWhite.scale.set(1.1, 0.85, 0.6);
      eyeWhite.position.set(ex, 0.225, 0.126);
      this.headGroup.add(eyeWhite);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.010, 8, 8), pupilMat);
      pupil.position.set(ex, 0.225, 0.135);
      this.headGroup.add(pupil);

      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.009, 0.014), hairMat);
      brow.position.set(ex, 0.248, 0.128);
      brow.rotation.z = ex < 0 ? 0.06 : -0.06;
      this.headGroup.add(brow);
    });

    // Layered 3D Haircut (Crown Cap, Back Taper, Textured Top Pompadour/Fringe & Sideburns)
    const hairCrown = new THREE.Mesh(
      new THREE.SphereGeometry(0.144, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.58),
      hairMat
    );
    hairCrown.scale.set(0.94, 1.06, 1.02);
    hairCrown.position.set(0, 0.22, 0.0);
    hairCrown.rotation.x = -0.18;
    this.headGroup.add(hairCrown);

    const hairFringe = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.14, 6, 10), hairMat);
    hairFringe.rotation.z = Math.PI / 2;
    hairFringe.position.set(0, 0.31, 0.085);
    hairFringe.rotation.x = 0.25;
    this.headGroup.add(hairFringe);

    [-0.118, 0.118].forEach((sx) => {
      const sideburn = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.08, 0.045), hairMat);
      sideburn.position.set(sx, 0.21, 0.035);
      this.headGroup.add(sideburn);
    });

    // 4. MULTI-JOINT ARTICULATED ARMS (Shoulder -> Upper Arm -> Elbow -> Forearm -> Hand)
    const buildArm = (isLeft: boolean) => {
      const side = isLeft ? -1 : 1;
      const shoulderPivot = new THREE.Group();
      shoulderPivot.position.set(side * 0.26, 0.50, 0);
      this.spineGroup.add(shoulderPivot);

      // Rounded Deltoid Shoulder Cap
      const deltoid = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 12), jacketMat);
      deltoid.scale.set(0.95, 1.15, 0.95);
      shoulderPivot.add(deltoid);

      // Tapered Upper Arm Sleeve
      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.054, 0.28, 12), jacketMat);
      upperArm.position.y = -0.14;
      upperArm.castShadow = true;
      shoulderPivot.add(upperArm);

      // Elbow Joint Pivot
      const elbowPivot = new THREE.Group();
      elbowPivot.position.set(0, -0.28, 0);
      shoulderPivot.add(elbowPivot);

      const elbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 10), jacketMat);
      elbowPivot.add(elbowJoint);

      // Forearm (Rolled Cuff + Muscular Forearm Skin)
      const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.054, 0.07, 12), jacketAccentMat);
      cuff.position.y = -0.04;
      elbowPivot.add(cuff);

      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.050, 0.038, 0.22, 12), skinMat);
      forearm.position.y = -0.15;
      forearm.castShadow = true;
      elbowPivot.add(forearm);

      // Luxury Chronograph Wristwatch on Left Wrist
      if (isLeft) {
        const watchBand = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.025, 12), metalBuckleMat);
        watchBand.position.y = -0.23;
        elbowPivot.add(watchBand);
      }

      // Sculpted Hand & Thumb
      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.095, 0.068), skinMat);
      hand.position.set(0, -0.29, 0.005);
      elbowPivot.add(hand);

      const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.035, 4, 6), skinMat);
      thumb.position.set(side * -0.02, -0.27, 0.038);
      thumb.rotation.x = 0.4;
      elbowPivot.add(thumb);

      if (isLeft) {
        this.leftShoulderPivot = shoulderPivot;
        this.leftElbowPivot = elbowPivot;
      } else {
        this.rightShoulderPivot = shoulderPivot;
        this.rightElbowPivot = elbowPivot;
      }
    };

    buildArm(true);
    buildArm(false);

    // 5. MULTI-JOINT ARTICULATED LEGS (Hip -> Thigh -> Knee -> Calf -> Ankle & Sneaker)
    const buildLeg = (isLeft: boolean) => {
      const side = isLeft ? -1 : 1;
      const hipPivot = new THREE.Group();
      hipPivot.position.set(side * 0.115, -0.04, 0);
      this.hipsGroup.add(hipPivot);

      // Anatomical Tapered Thigh
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.068, 0.44, 14), trousersMat);
      thigh.position.y = -0.22;
      thigh.castShadow = true;
      hipPivot.add(thigh);

      // Knee Joint Pivot
      const kneePivot = new THREE.Group();
      kneePivot.position.set(0, -0.44, 0);
      hipPivot.add(kneePivot);

      const kneeCap = new THREE.Mesh(new THREE.SphereGeometry(0.066, 12, 12), trousersMat);
      kneePivot.add(kneeCap);

      // Tapered Calf / Shin
      const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.048, 0.42, 14), trousersMat);
      calf.position.y = -0.21;
      calf.castShadow = true;
      kneePivot.add(calf);

      // Ankle & Sculpted Athletic Sneaker
      const anklePivot = new THREE.Group();
      anklePivot.position.set(0, -0.42, 0);
      kneePivot.add(anklePivot);

      // Sneaker Upper
      const shoeUpper = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.075, 0.24), shoeUpperMat);
      shoeUpper.position.set(0, -0.03, 0.045);
      shoeUpper.castShadow = true;
      anklePivot.add(shoeUpper);

      // Rounded Toe Box
      const toeBox = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.105, 12), shoeUpperMat);
      toeBox.rotation.z = Math.PI / 2;
      toeBox.position.set(0, -0.035, 0.165);
      anklePivot.add(toeBox);

      // White Cushion Midsole / Outsole
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.112, 0.028, 0.27), shoeSoleMat);
      sole.position.set(0, -0.068, 0.05);
      anklePivot.add(sole);

      if (isLeft) {
        this.leftHipPivot = hipPivot;
        this.leftKneePivot = kneePivot;
        this.leftAnklePivot = anklePivot;
      } else {
        this.rightHipPivot = hipPivot;
        this.rightKneePivot = kneePivot;
        this.rightAnklePivot = anklePivot;
      }
    };

    buildLeg(true);
    buildLeg(false);

    this.avatarGroup.position.copy(this.position);
  }

  public update(delta: number, cameraMode: CameraMode, camera: THREE.PerspectiveCamera): InteractionPrompt | null {
    const dt = Math.min(delta, 0.1);
    this.idleTime += dt;
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
        this.currentSpeed = THREE.MathUtils.damp(this.currentSpeed, targetMaxSpeed, 10, dt);
        this.velocity.copy(moveDir).multiplyScalar(this.currentSpeed * dt);

        // Smoothly orient avatar towards movement direction (+Z local is forward face)
        const targetYaw = Math.atan2(moveDir.x, moveDir.z);
        let diff = targetYaw - this.yaw;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.yaw += diff * Math.min(1, dt * 14);
        this.avatarGroup.rotation.y = this.yaw;
      } else {
        this.currentSpeed = THREE.MathUtils.damp(this.currentSpeed, 0, 14, dt);
        this.velocity.multiplyScalar(Math.max(0, 1 - 14 * dt));
      }

      // Compute candidate horizontal coordinates
      const candidateX = this.position.x + this.velocity.x;
      const candidateZ = this.position.z + this.velocity.z;

      if (this.physicsEngine) {
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
        this.position.y = THREE.MathUtils.damp(this.position.y, groundY, 16, dt);
        this.isGrounded = true;
      }

      // Biomechanical Human Gait & Joint Kinematics (Hips, Spine, Shoulders, Elbows, Hips, Knees, Ankles)
      if (!this.isGrounded) {
        // Mid-air athletic jump pose
        this.leftHipPivot.rotation.x = THREE.MathUtils.damp(this.leftHipPivot.rotation.x, -0.45, 12, dt);
        this.rightHipPivot.rotation.x = THREE.MathUtils.damp(this.rightHipPivot.rotation.x, 0.25, 12, dt);
        this.leftKneePivot.rotation.x = THREE.MathUtils.damp(this.leftKneePivot.rotation.x, 0.65, 12, dt);
        this.rightKneePivot.rotation.x = THREE.MathUtils.damp(this.rightKneePivot.rotation.x, 0.45, 12, dt);
        this.leftShoulderPivot.rotation.x = THREE.MathUtils.damp(this.leftShoulderPivot.rotation.x, -0.55, 12, dt);
        this.rightShoulderPivot.rotation.x = THREE.MathUtils.damp(this.rightShoulderPivot.rotation.x, -0.55, 12, dt);
        this.leftElbowPivot.rotation.x = THREE.MathUtils.damp(this.leftElbowPivot.rotation.x, -0.85, 12, dt);
        this.rightElbowPivot.rotation.x = THREE.MathUtils.damp(this.rightElbowPivot.rotation.x, -0.85, 12, dt);
      } else if (this.currentSpeed > 0.5) {
        const isSprint = this.keys.sprint;
        const freq = isSprint ? 13.5 : 8.5;
        this.stridePhase += dt * freq;

        const hipAmp = isSprint ? 0.72 : 0.44;
        const kneeAmp = isSprint ? 1.05 : 0.62;
        const armAmp = isSprint ? 0.68 : 0.38;

        const sinL = Math.sin(this.stridePhase);
        const sinR = Math.sin(this.stridePhase + Math.PI);

        // Hip swing (negative rotation.x swings leg forward along +Z)
        this.leftHipPivot.rotation.x = -sinL * hipAmp;
        this.rightHipPivot.rotation.x = -sinR * hipAmp;

        // Knee flexion (positive rotation.x bends lower leg backward during stride lift)
        const kneeBendL = Math.max(0, Math.sin(this.stridePhase - 0.65)) * kneeAmp + 0.06;
        const kneeBendR = Math.max(0, Math.sin(this.stridePhase + Math.PI - 0.65)) * kneeAmp + 0.06;
        this.leftKneePivot.rotation.x = kneeBendL;
        this.rightKneePivot.rotation.x = kneeBendR;

        // Ankle pitch compensation
        this.leftAnklePivot.rotation.x = Math.sin(this.stridePhase + 0.4) * 0.18;
        this.rightAnklePivot.rotation.x = Math.sin(this.stridePhase + Math.PI + 0.4) * 0.18;

        // Counter-swinging arms & natural forward elbow flexion
        this.leftShoulderPivot.rotation.x = sinL * armAmp;
        this.rightShoulderPivot.rotation.x = sinR * armAmp;
        this.leftShoulderPivot.rotation.z = -0.06;
        this.rightShoulderPivot.rotation.z = 0.06;

        const baseElbow = isSprint ? -1.15 : -0.35;
        this.leftElbowPivot.rotation.x = baseElbow - Math.max(0, -sinL) * 0.45;
        this.rightElbowPivot.rotation.x = baseElbow - Math.max(0, -sinR) * 0.45;

        // Pelvis vertical bounce, hip sway & upper torso counter-rotation
        const bounce = Math.abs(Math.cos(this.stridePhase)) * (isSprint ? 0.055 : 0.028);
        this.hipsGroup.position.y = 0.96 + bounce;
        this.hipsGroup.rotation.y = sinL * 0.06;
        this.spineGroup.rotation.y = -sinL * 0.09;
        this.spineGroup.rotation.x = THREE.MathUtils.damp(
          this.spineGroup.rotation.x,
          isSprint ? 0.16 : 0.04,
          10,
          dt
        );
        this.headGroup.rotation.x = isSprint ? -0.10 : 0;
      } else {
        // Natural standing idle pose with gentle chest breathing & subtle head look
        const breath = Math.sin(this.idleTime * 2.2) * 0.012;
        this.hipsGroup.position.y = THREE.MathUtils.damp(this.hipsGroup.position.y, 0.96, 10, dt);
        this.hipsGroup.rotation.y = THREE.MathUtils.damp(this.hipsGroup.rotation.y, 0, 10, dt);
        this.spineGroup.rotation.y = THREE.MathUtils.damp(this.spineGroup.rotation.y, 0, 10, dt);
        this.spineGroup.rotation.x = THREE.MathUtils.damp(this.spineGroup.rotation.x, breath, 10, dt);
        this.headGroup.rotation.y = Math.sin(this.idleTime * 0.8) * 0.08;
        this.headGroup.rotation.x = THREE.MathUtils.damp(this.headGroup.rotation.x, 0, 10, dt);

        this.leftHipPivot.rotation.x = THREE.MathUtils.damp(this.leftHipPivot.rotation.x, 0, 12, dt);
        this.rightHipPivot.rotation.x = THREE.MathUtils.damp(this.rightHipPivot.rotation.x, 0, 12, dt);
        this.leftKneePivot.rotation.x = THREE.MathUtils.damp(this.leftKneePivot.rotation.x, 0.03, 12, dt);
        this.rightKneePivot.rotation.x = THREE.MathUtils.damp(this.rightKneePivot.rotation.x, 0.03, 12, dt);
        this.leftAnklePivot.rotation.x = THREE.MathUtils.damp(this.leftAnklePivot.rotation.x, 0, 12, dt);
        this.rightAnklePivot.rotation.x = THREE.MathUtils.damp(this.rightAnklePivot.rotation.x, 0, 12, dt);

        this.leftShoulderPivot.rotation.x = THREE.MathUtils.damp(this.leftShoulderPivot.rotation.x, 0.04, 12, dt);
        this.rightShoulderPivot.rotation.x = THREE.MathUtils.damp(this.rightShoulderPivot.rotation.x, -0.04, 12, dt);
        this.leftShoulderPivot.rotation.z = -0.05;
        this.rightShoulderPivot.rotation.z = 0.05;
        this.leftElbowPivot.rotation.x = THREE.MathUtils.damp(this.leftElbowPivot.rotation.x, -0.18, 12, dt);
        this.rightElbowPivot.rotation.x = THREE.MathUtils.damp(this.rightElbowPivot.rotation.x, -0.18, 12, dt);
      }

      this.avatarGroup.position.copy(this.position);

      // Third-person camera follow with Spring-Arm Anti-Clipping
      if (cameraMode === 'third-person') {
        const offset = new THREE.Vector3(0, 3.8, -8.5);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.avatarGroup.rotation.y);
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
