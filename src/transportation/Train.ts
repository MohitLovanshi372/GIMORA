/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export type TrainType = 'passenger' | 'express' | 'freight';
export type TrainState = 'stopped_at_station' | 'accelerating' | 'cruising' | 'decelerating';

export class Train {
  public id: string;
  public type: TrainType;
  public trackIndex: number;
  public trackZ: number;
  public speed = 0;
  public maxSpeed = 38; // ~137 km/h
  public acceleration = 6;
  public deceleration = 7;
  public currentStation = 'Central Hyper-Transit Terminal';
  public nextStation = 'Continental North Hub';
  public destinationStation = 'Neo-Metropolis East Express';
  public state: TrainState = 'cruising';
  public dwellTimer = 0;
  public mesh: THREE.Group;
  public direction = 1; // 1: moving +X, -1: moving -X
  public trackMinX = -220;
  public trackMaxX = 220;
  public stationStopX = 0;

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

    const trainMat = new THREE.MeshStandardMaterial({
      color: isExpress ? 0x2e1065 : isPass ? 0x0a192f : 0x1e293b,
      metalness: 0.9,
      roughness: 0.15,
    });
    const windowMat = new THREE.MeshBasicMaterial({
      color: isExpress ? 0xf0abfc : isPass ? 0x00f0ff : 0xffaa00,
    });
    const glowColor = isExpress ? 0xa855f7 : 0x00f0ff;
    const cyanGlowMat = new THREE.MeshBasicMaterial({ color: glowColor });
    const redGlowMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });

    const carLength = 18;
    const carWidth = 3.2;
    const carHeight = 3.2;
    const carCount = isExpress ? 3 : isPass ? 4 : 5;

    for (let i = 0; i < carCount; i++) {
      const carGroup = new THREE.Group();
      carGroup.position.set(-((i - (carCount - 1) / 2) * (carLength + 0.8)), 0, 0);

      // Car Body
      const carBody = new THREE.Mesh(
        new THREE.BoxGeometry(carLength, carHeight, carWidth),
        trainMat
      );
      carBody.position.y = carHeight / 2 + 0.3;
      carBody.castShadow = true;
      carGroup.add(carBody);

      if (isPass || isExpress) {
        // Streamlined Nose cone on lead cars
        if (i === 0 || i === carCount - 1) {
          const noseSign = i === 0 ? 1 : -1;
          const nose = new THREE.Mesh(
            new THREE.ConeGeometry(carWidth * 0.5, isExpress ? 6.0 : 4.5, 6),
            trainMat
          );
          nose.rotateZ(noseSign * (-Math.PI / 2));
          nose.position.set(noseSign * (carLength / 2 + (isExpress ? 2.8 : 2.0)), carHeight / 2 + 0.3, 0);
          carGroup.add(nose);
        }

        // Passenger Panoramic Window Strips on both sides
        const winL = new THREE.Mesh(new THREE.PlaneGeometry(carLength - 4, 1.1), windowMat);
        winL.position.set(0, carHeight * 0.65 + 0.3, -carWidth / 2 - 0.05);
        carGroup.add(winL);

        const winR = new THREE.Mesh(new THREE.PlaneGeometry(carLength - 4, 1.1), windowMat);
        winR.position.set(0, carHeight * 0.65 + 0.3, carWidth / 2 + 0.05);
        winR.rotation.y = Math.PI;
        carGroup.add(winR);

        // Automated Passenger Door Indicators (Amber/Green LEDs)
        [-carLength / 4, carLength / 4].forEach((dx) => {
          const doorIndicator = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.35, 0.1),
            new THREE.MeshBasicMaterial({ color: 0x10b981 })
          );
          doorIndicator.position.set(dx, carHeight * 0.8 + 0.3, -carWidth / 2 - 0.06);
          carGroup.add(doorIndicator);
          this.doorLights.push(doorIndicator);
        });
      } else {
        // Freight Cargo Containers
        const containerMat = new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0x991b1b : 0x065f46,
          roughness: 0.4,
          metalness: 0.6,
        });
        const container = new THREE.Mesh(
          new THREE.BoxGeometry(carLength - 2, carHeight - 0.4, carWidth - 0.4),
          containerMat
        );
        container.position.y = carHeight / 2 + 0.3;
        carGroup.add(container);
      }

      // Neon Underglow strip along superconducting maglev track
      const underglow = new THREE.Mesh(
        new THREE.BoxGeometry(carLength, 0.15, carWidth + 0.2),
        cyanGlowMat
      );
      underglow.position.y = 0.35;
      carGroup.add(underglow);

      this.mesh.add(carGroup);
    }

    // Lead Headlights & Taillights
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 8), cyanGlowMat);
    hl.position.set((carCount * carLength) / 2 + 3.0, 1.8, 0);
    this.mesh.add(hl);

    const tl = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), redGlowMat);
    tl.position.set(-((carCount * carLength) / 2 + 2.5), 1.8, 0);
    this.mesh.add(tl);
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

        // Passenger boarding simulation count
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
        // Check if approaching station stop from either direction
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
          this.dwellTimer = 5.5; // 5.5 seconds stop at central terminal
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
