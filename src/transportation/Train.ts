/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export type TrainType = 'passenger' | 'express' | 'freight';
export type TrainState = 'stopped_at_station' | 'accelerating' | 'cruising' | 'decelerating';

// Extruded aerodynamic cross-section for high-speed bullet train coach
function createCoachBodyGeometry(length: number, width: number, height: number): THREE.BufferGeometry {
  const hw = width * 0.5;
  const shape = new THREE.Shape();
  shape.moveTo(-hw + 0.18, 0);
  shape.lineTo(hw - 0.18, 0);
  shape.lineTo(hw, height * 0.25);
  shape.lineTo(hw, height * 0.78);
  shape.lineTo(hw - 0.28, height);
  shape.lineTo(-hw + 0.28, height);
  shape.lineTo(-hw, height * 0.78);
  shape.lineTo(-hw, height * 0.25);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: length,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.06,
    bevelSegments: 2,
  });
  // Rotate so depth aligns along X axis (train travel axis)
  geo.rotateY(Math.PI / 2);
  geo.center();
  return geo;
}

export class Train {
  public id: string;
  public type: TrainType;
  public trackIndex: number;
  public trackZ: number;
  public speed = 0;
  public maxSpeed = 38; // ~137 km/h
  public acceleration = 6;
  public deceleration = 7;
  public currentStation = 'Grand Central Union Terminal';
  public nextStation = 'Northern Regional Hub';
  public destinationStation = 'Metropolis East Terminal';
  public state: TrainState = 'cruising';
  public dwellTimer = 0;
  public mesh: THREE.Group;
  public direction = 1; // 1: moving +X, -1: moving -X
  public trackMinX = -220;
  public trackMaxX = 220;
  public stationStopX = -140; // Aligned with relocated Grand Central Railway Terminal

  // Passenger boarding & door indicator visuals
  private doorLights: THREE.Mesh[] = [];
  public passengersBoarding = 0;
  public totalPassengers = 420;

  constructor(id: string, type: TrainType, trackIndex: number, trackZ: number, startX = -120) {
    this.id = id;
    this.type = type;
    this.trackIndex = trackIndex;
    this.trackZ = trackZ;
    this.maxSpeed = type === 'express' ? 52 : type === 'passenger' ? 38 : 24;
    this.acceleration = type === 'express' ? 9 : 6;
    this.mesh = new THREE.Group();
    this.mesh.name = `train_${id}`;
    this.mesh.position.set(startX, 0.45, trackZ);
    this.buildTrainMesh();
  }

  private buildTrainMesh() {
    const isPass = this.type === 'passenger';
    const isExpress = this.type === 'express';

    // Realistic High-Speed Shinkansen / Eurostar / Freight Locomotive Materials
    const trainMat = new THREE.MeshPhysicalMaterial({
      color: isExpress ? 0xf8fafc : isPass ? 0xf1f5f9 : 0x1e293b,
      metalness: 0.65,
      roughness: 0.18,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
    });
    const stripeMat = new THREE.MeshStandardMaterial({
      color: isExpress ? 0xdc2626 : isPass ? 0x0284c7 : 0xf59e0b,
      metalness: 0.55,
      roughness: 0.25,
    });
    const underbellyMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.65,
      metalness: 0.5,
    });
    const windowMat = new THREE.MeshPhysicalMaterial({
      color: 0x090d16,
      emissive: new THREE.Color(0xfef08a),
      emissiveIntensity: 0.28,
      roughness: 0.08,
      metalness: 0.85,
      clearcoat: 1.0,
    });
    const bogieMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.6 });
    const steelWheelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.9 });
    const whiteHeadlampMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const redTaillampMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });

    const carLength = 18;
    const carWidth = 3.2;
    const carHeight = 3.2;
    const carCount = isExpress ? 4 : isPass ? 4 : 5;
    const coachGeo = createCoachBodyGeometry(carLength, carWidth, carHeight);

    for (let i = 0; i < carCount; i++) {
      const carGroup = new THREE.Group();
      const carX = -((i - (carCount - 1) / 2) * (carLength + 0.9));
      carGroup.position.set(carX, 0, 0);

      // Inter-Car Articulated Bellows Gangway Diaphragm
      if (i < carCount - 1) {
        const bellows = new THREE.Mesh(
          new THREE.BoxGeometry(1.1, carHeight * 0.84, carWidth * 0.82),
          underbellyMat
        );
        bellows.position.set(-carLength * 0.5 - 0.45, carHeight * 0.5 + 0.35, 0);
        carGroup.add(bellows);
      }

      if (isPass || isExpress) {
        // 1. Sculpted Aerodynamic Coach Shell
        const carBody = new THREE.Mesh(coachGeo, trainMat);
        carBody.position.y = carHeight / 2 + 0.35;
        carBody.castShadow = true;
        carBody.receiveShadow = true;
        carGroup.add(carBody);

        // 2. Aerodynamic Twin Livery Speed Stripes
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(carLength + 0.06, 0.32, carWidth + 0.08),
          stripeMat
        );
        stripe.position.y = carHeight * 0.44 + 0.35;
        carGroup.add(stripe);

        const lowerSkirt = new THREE.Mesh(
          new THREE.BoxGeometry(carLength, 0.42, carWidth - 0.16),
          underbellyMat
        );
        lowerSkirt.position.y = 0.52;
        carGroup.add(lowerSkirt);

        // 3. Sculpted Shinkansen / TGV Multi-Stage Aerodynamic Duckbill Nose Cone on Lead & Tail Cars
        if (i === 0 || i === carCount - 1) {
          const noseSign = i === 0 ? 1 : -1;
          const noseLen = isExpress ? 6.8 : 5.2;

          // Lathe / Multi-segment tapered aerodynamic nose
          const noseGroup = new THREE.Group();
          noseGroup.position.set(noseSign * (carLength / 2), 0.35, 0);

          const noseBase = new THREE.Mesh(
            new THREE.CylinderGeometry(carWidth * 0.32, carWidth * 0.48, noseLen, 16),
            trainMat
          );
          noseBase.rotation.z = noseSign * (-Math.PI / 2);
          noseBase.scale.set(1.0, 1.0, 0.88);
          noseBase.position.set(noseSign * (noseLen * 0.48), carHeight * 0.38, 0);
          noseBase.castShadow = true;
          noseGroup.add(noseBase);

          const noseTip = new THREE.Mesh(
            new THREE.SphereGeometry(carWidth * 0.31, 14, 14),
            stripeMat
          );
          noseTip.scale.set(1.6, 0.65, 0.85);
          noseTip.position.set(noseSign * (noseLen * 0.92), carHeight * 0.32, 0);
          noseGroup.add(noseTip);

          // Wrap-around Driver Cockpit Canopy Glass
          const cockpitGlass = new THREE.Mesh(
            new THREE.BoxGeometry(2.6, 0.78, carWidth * 0.76),
            windowMat
          );
          cockpitGlass.position.set(noseSign * 1.45, carHeight * 0.72, 0);
          cockpitGlass.rotation.z = noseSign * -0.32;
          noseGroup.add(cockpitGlass);

          // Twin Projector Headlights & Red Marker Lights on Nose
          [-0.85, 0.85].forEach((lz) => {
            const lamp = new THREE.Mesh(
              new THREE.SphereGeometry(0.24, 8, 8),
              i === 0 ? whiteHeadlampMat : redTaillampMat
            );
            lamp.position.set(noseSign * (noseLen * 0.75), carHeight * 0.35, lz);
            noseGroup.add(lamp);
          });

          carGroup.add(noseGroup);
        }

        // 4. Individual Panoramic Rounded Passenger Windows along both sides
        for (let wx = -carLength * 0.36; wx <= carLength * 0.36; wx += 2.2) {
          const winPane = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.92, carWidth + 0.10), windowMat);
          winPane.position.set(wx, carHeight * 0.64 + 0.35, 0);
          carGroup.add(winPane);
        }

        // 5. Rooftop High-Voltage Pantograph & HVAC Louvers on Intermediate Cars
        if (i === 1 || i === carCount - 2) {
          const pantoGroup = new THREE.Group();
          pantoGroup.position.set(0, carHeight + 0.38, 0);
          const pantoBase = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.16, 1.6), bogieMat);
          const armLower = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.08), steelWheelMat);
          armLower.position.set(-0.3, 0.45, 0);
          armLower.rotation.z = 0.45;
          const armUpper = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.08), steelWheelMat);
          armUpper.position.set(-0.3, 0.95, 0);
          armUpper.rotation.z = -0.42;
          const collectorBow = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 1.9), stripeMat);
          collectorBow.position.set(0.2, 1.25, 0);
          pantoGroup.add(pantoBase, armLower, armUpper, collectorBow);
          carGroup.add(pantoGroup);
        }

        // Automated Sliding Passenger Doors & Boarding Status LEDs
        [-carLength * 0.38, carLength * 0.38].forEach((dx) => {
          const doorPanel = new THREE.Mesh(
            new THREE.BoxGeometry(1.35, carHeight * 0.76, carWidth + 0.06),
            underbellyMat
          );
          doorPanel.position.set(dx, carHeight * 0.48 + 0.35, 0);
          carGroup.add(doorPanel);

          const doorIndicator = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.25, carWidth + 0.14),
            new THREE.MeshBasicMaterial({ color: 0x10b981 })
          );
          doorIndicator.position.set(dx, carHeight * 0.88 + 0.35, 0);
          carGroup.add(doorIndicator);
          this.doorLights.push(doorIndicator);
        });
      } else {
        // Heavy Freight Train: Lead Diesel-Electric Locomotive + Intermodal Container Flatcars
        if (i === 0) {
          // Lead Heavy Freight Locomotive
          const locoBody = new THREE.Mesh(
            new THREE.BoxGeometry(carLength, carHeight + 0.3, carWidth),
            new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.5 })
          );
          locoBody.position.y = (carHeight + 0.3) * 0.5 + 0.4;
          locoBody.castShadow = true;
          carGroup.add(locoBody);

          const locoStripe = new THREE.Mesh(
            new THREE.BoxGeometry(carLength + 0.08, 0.45, carWidth + 0.08),
            underbellyMat
          );
          locoStripe.position.y = 1.35;
          carGroup.add(locoStripe);

          const locoCabWin = new THREE.Mesh(
            new THREE.BoxGeometry(2.8, 0.95, carWidth + 0.12),
            windowMat
          );
          locoCabWin.position.set(carLength * 0.34, 2.85, 0);
          carGroup.add(locoCabWin);
        } else {
          // Flatbed Well Car + Corrugated Intermodal ISO Shipping Container
          const deck = new THREE.Mesh(
            new THREE.BoxGeometry(carLength - 0.4, 0.38, carWidth),
            underbellyMat
          );
          deck.position.y = 0.55;
          carGroup.add(deck);

          const containerColors = [0x991b1b, 0x065f46, 0x1e40af, 0xb45309];
          const containerMat = new THREE.MeshStandardMaterial({
            color: containerColors[i % containerColors.length],
            roughness: 0.42,
            metalness: 0.55,
          });
          const container = new THREE.Mesh(
            new THREE.BoxGeometry(carLength - 1.6, carHeight - 0.2, carWidth - 0.3),
            containerMat
          );
          container.position.y = carHeight * 0.5 + 0.65;
          container.castShadow = true;
          carGroup.add(container);

          // Corrugated Vertical Ribs on Container
          for (let rx = -carLength * 0.36; rx <= carLength * 0.36; rx += 1.6) {
            const rib = new THREE.Mesh(
              new THREE.BoxGeometry(0.18, carHeight - 0.18, carWidth - 0.22),
              containerMat
            );
            rib.position.set(rx, carHeight * 0.5 + 0.65, 0);
            carGroup.add(rib);
          }
        }
      }

      // 6. Detailed Dual-Axle Steel Railway Bogies & Flanged Wheels
      [-carLength * 0.32, carLength * 0.32].forEach((bx) => {
        const bogieFrame = new THREE.Mesh(
          new THREE.BoxGeometry(3.6, 0.34, carWidth - 0.25),
          bogieMat
        );
        bogieFrame.position.set(bx, 0.28, 0);
        carGroup.add(bogieFrame);

        [-1.15, 1.15].forEach((ax) => {
          const wheelAxle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.42, 0.42, carWidth - 0.15, 12),
            steelWheelMat
          );
          wheelAxle.rotation.x = Math.PI / 2;
          wheelAxle.position.set(bx + ax, 0.22, 0);
          carGroup.add(wheelAxle);
        });
      });

      this.mesh.add(carGroup);
    }
  }

  public update(delta: number) {
    const curX = this.mesh.position.x;
    const distToStation = Math.abs(curX - this.stationStopX);

    // Train State Machine: Station Stop -> Accelerate -> Cruise -> Decelerate
    switch (this.state) {
      case 'stopped_at_station':
        this.speed = 0;
        this.dwellTimer -= delta;

        // Animate door lights during boarding
        const isDoorOpen = this.dwellTimer > 1.0;
        this.doorLights.forEach((dl) => {
          (dl.material as THREE.MeshBasicMaterial).color.setHex(
            isDoorOpen ? (Math.sin(this.dwellTimer * 8) > 0 ? 0xf59e0b : 0x10b981) : 0xef4444
          );
        });

        if (isDoorOpen) {
          this.passengersBoarding = Math.floor(Math.sin(this.dwellTimer * 2) * 18 + 24);
        }

        if (this.dwellTimer <= 0) {
          this.state = 'accelerating';
          this.doorLights.forEach((dl) => {
            (dl.material as THREE.MeshBasicMaterial).color.setHex(0x10b981);
          });
        }
        break;

      case 'accelerating':
        this.speed = Math.min(this.maxSpeed, this.speed + this.acceleration * delta);
        if (this.speed >= this.maxSpeed) {
          this.state = 'cruising';
        }
        break;

      case 'cruising':
        this.speed = this.maxSpeed;
        if (distToStation < 55 && distToStation > 5) {
          this.state = 'decelerating';
        }
        break;

      case 'decelerating':
        this.speed = Math.max(2, this.speed - this.deceleration * delta);
        if (distToStation < 3.5) {
          this.speed = 0;
          this.mesh.position.x = this.stationStopX;
          this.state = 'stopped_at_station';
          this.dwellTimer = 5.5;
          if (this.direction > 0) {
            this.nextStation = 'Continental North Hub';
          } else {
            this.nextStation = 'Skyline South Terminal';
          }
        }
        break;
    }

    // Move along track
    if (this.speed > 0) {
      this.mesh.position.x += this.direction * this.speed * delta;

      // Handle track boundary turnaround
      if (this.mesh.position.x > this.trackMaxX) {
        this.direction = -1;
        this.mesh.rotation.y = Math.PI;
      } else if (this.mesh.position.x < this.trackMinX) {
        this.direction = 1;
        this.mesh.rotation.y = 0;
      }
    }
  }

  public dispose() {
    this.mesh.clear();
  }
}
