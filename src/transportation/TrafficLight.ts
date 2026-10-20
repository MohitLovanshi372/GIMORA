/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export type TrafficLightState = 'RED' | 'YELLOW' | 'GREEN';

export interface TrafficLightMeshRef {
  redLamp: THREE.Mesh;
  yellowLamp: THREE.Mesh;
  greenLamp: THREE.Mesh;
}

export class TrafficLight {
  public id: string;
  public position: THREE.Vector3;
  public greenDuration = 9.0;
  public yellowDuration = 2.4;
  public allRedClearance = 1.2; // All-red safety interval so turning traffic clears the intersection box
  public totalCycle: number;
  public phaseOffset: number;
  private currentTime = 0;

  // Signal lamp mesh references
  private nsLamps: TrafficLightMeshRef[] = [];
  private ewLamps: TrafficLightMeshRef[] = [];

  // Agent Green Corridor Override
  public overrideAxis: 'NS' | 'EW' | null = null;
  public overrideTimer = 0;

  // High-visibility LED signal materials
  private redActiveMat = new THREE.MeshBasicMaterial({ color: 0xff1e38 });
  private redDimMat = new THREE.MeshBasicMaterial({ color: 0x2a070c });
  private yellowActiveMat = new THREE.MeshBasicMaterial({ color: 0xffb700 });
  private yellowDimMat = new THREE.MeshBasicMaterial({ color: 0x2b1d00 });
  private greenActiveMat = new THREE.MeshBasicMaterial({ color: 0x00ff66 });
  private greenDimMat = new THREE.MeshBasicMaterial({ color: 0x042914 });

  constructor(id: string, position: THREE.Vector3, phaseOffset = 0) {
    this.id = id;
    this.position = position;
    this.phaseOffset = phaseOffset;
    this.totalCycle = (this.greenDuration + this.yellowDuration + this.allRedClearance) * 2;
    this.currentTime = phaseOffset % this.totalCycle;
  }

  public registerMeshRef(direction: 'NS' | 'EW', ref: TrafficLightMeshRef) {
    if (direction === 'NS') {
      this.nsLamps.push(ref);
    } else {
      this.ewLamps.push(ref);
    }
    this.updateVisuals();
  }

  public setOverride(axis: 'NS' | 'EW' | null, duration = 15.0) {
    this.overrideAxis = axis;
    this.overrideTimer = axis ? duration : 0;
    this.updateVisuals();
  }

  public update(delta: number) {
    if (this.overrideAxis) {
      this.overrideTimer -= delta;
      if (this.overrideTimer <= 0) {
        this.overrideAxis = null;
        this.overrideTimer = 0;
      }
    }
    this.totalCycle = (this.greenDuration + this.yellowDuration + this.allRedClearance) * 2;
    this.currentTime = (this.currentTime + delta) % this.totalCycle;
    this.updateVisuals();
  }

  public getStateForAxis(axis: 'NS' | 'EW'): TrafficLightState {
    if (this.overrideAxis) {
      return this.overrideAxis === axis ? 'GREEN' : 'RED';
    }

    const halfCycle = this.greenDuration + this.yellowDuration + this.allRedClearance;

    if (axis === 'NS') {
      if (this.currentTime < this.greenDuration) {
        return 'GREEN';
      } else if (this.currentTime < this.greenDuration + this.yellowDuration) {
        return 'YELLOW';
      } else {
        return 'RED';
      }
    } else {
      // EW phase runs in the second half of the cycle after NS all-red clearance
      if (this.currentTime < halfCycle) {
        return 'RED';
      } else if (this.currentTime < halfCycle + this.greenDuration) {
        return 'GREEN';
      } else if (this.currentTime < halfCycle + this.greenDuration + this.yellowDuration) {
        return 'YELLOW';
      } else {
        return 'RED';
      }
    }
  }

  public isGreen(axis: 'NS' | 'EW'): boolean {
    return this.getStateForAxis(axis) === 'GREEN';
  }

  public isYellow(axis: 'NS' | 'EW'): boolean {
    return this.getStateForAxis(axis) === 'YELLOW';
  }

  public isRed(axis: 'NS' | 'EW'): boolean {
    return this.getStateForAxis(axis) === 'RED';
  }

  private updateVisuals() {
    const nsState = this.getStateForAxis('NS');
    const ewState = this.getStateForAxis('EW');

    for (let i = 0; i < this.nsLamps.length; i++) {
      const lamp = this.nsLamps[i];
      lamp.redLamp.material = nsState === 'RED' ? this.redActiveMat : this.redDimMat;
      lamp.yellowLamp.material = nsState === 'YELLOW' ? this.yellowActiveMat : this.yellowDimMat;
      lamp.greenLamp.material = nsState === 'GREEN' ? this.greenActiveMat : this.greenDimMat;
    }

    for (let i = 0; i < this.ewLamps.length; i++) {
      const lamp = this.ewLamps[i];
      lamp.redLamp.material = ewState === 'RED' ? this.redActiveMat : this.redDimMat;
      lamp.yellowLamp.material = ewState === 'YELLOW' ? this.yellowActiveMat : this.yellowDimMat;
      lamp.greenLamp.material = ewState === 'GREEN' ? this.greenActiveMat : this.greenDimMat;
    }
  }

  public dispose() {
    this.redActiveMat.dispose();
    this.redDimMat.dispose();
    this.yellowActiveMat.dispose();
    this.yellowDimMat.dispose();
    this.greenActiveMat.dispose();
    this.greenDimMat.dispose();
  }
}
