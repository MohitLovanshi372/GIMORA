/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface TourWaypoint {
  name: string;
  cameraPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  duration: number; // in seconds
  description: string;
}

export class CinematicTourManager {
  private camera: THREE.PerspectiveCamera;
  private isTourActive = false;
  private currentWaypointIdx = 0;
  private transitionProgress = 0; // 0.0 to 1.0
  private currentWaypoint!: TourWaypoint;
  private nextWaypoint!: TourWaypoint;

  public waypoints: TourWaypoint[] = [
    {
      name: 'Sub-Orbital Airport',
      cameraPos: new THREE.Vector3(260, 55, -240),
      targetPos: new THREE.Vector3(180, 10, -290),
      duration: 6.0,
      description: '320m supersonic runway with sequenced strobes and autonomous sub-orbital terminal.',
    },
    {
      name: 'Industrial & Geothermal Complex',
      cameraPos: new THREE.Vector3(-190, 50, -210),
      targetPos: new THREE.Vector3(-140, 15, -170),
      duration: 6.0,
      description: 'Heavy automated manufacturing, geothermal power substation, and logistics depots.',
    },
    {
      name: 'Neon Downtown Core',
      cameraPos: new THREE.Vector3(-190, 110, 85),
      targetPos: new THREE.Vector3(-110, 45, 0),
      duration: 6.5,
      description: 'Corporate glass skyscrapers, animated digital facades, and central skybridge spans.',
    },
    {
      name: 'MOHIT DEVELOPER HUB',
      cameraPos: new THREE.Vector3(80, 85, -25),
      targetPos: new THREE.Vector3(140, 50, -80),
      duration: 7.5,
      description: '142m AI & Software Headquarters featuring rooftop helipad, quantum labs, and project showcase.',
    },
    {
      name: 'Central Maglev Terminal',
      cameraPos: new THREE.Vector3(0, 75, -140),
      targetPos: new THREE.Vector3(0, 15, -210),
      duration: 6.0,
      description: 'High-speed 4-track continental transit terminal with superconducting passenger trains.',
    },
    {
      name: 'River Promenade',
      cameraPos: new THREE.Vector3(-55, 35, -20),
      targetPos: new THREE.Vector3(0, 5, 0),
      duration: 6.0,
      description: 'Reflective cybernetic river with illuminated water taxis, floating bistros, and docks.',
    },
    {
      name: 'Central Cable-Stayed Bridge',
      cameraPos: new THREE.Vector3(80, 45, 10),
      targetPos: new THREE.Vector3(0, 15, 0),
      duration: 6.0,
      description: 'Iconic suspension road bridge connecting west and east banks with pulsing neon cables.',
    },
    {
      name: 'Neo-Genesis Smart Hospital',
      cameraPos: new THREE.Vector3(-105, 75, 230),
      targetPos: new THREE.Vector3(-160, 25, 170),
      duration: 6.0,
      description: 'Emergency trauma pavilion, 24/7 medical drone helipads, and nanomedicine laboratories.',
    },
    {
      name: 'Education District & University',
      cameraPos: new THREE.Vector3(90, 65, 130),
      targetPos: new THREE.Vector3(140, 20, 160),
      duration: 6.0,
      description: 'Neo-Metropolis University, Quantum Digital Library, and student robotics labs.',
    },
    {
      name: 'Pulsing Entertainment District',
      cameraPos: new THREE.Vector3(-110, 65, -120),
      targetPos: new THREE.Vector3(-80, 20, -160),
      duration: 6.5,
      description: 'Holographic concert megaplexes, neon sky lounges, and nighttime pedestrian plazas.',
    },
    {
      name: 'Skyline Residential Towers',
      cameraPos: new THREE.Vector3(-60, 70, 210),
      targetPos: new THREE.Vector3(-80, 25, 160),
      duration: 6.0,
      description: 'Eco-residential biophilic vertical apartments, green rooftop gardens, and community pods.',
    },
  ];

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  public startTour() {
    this.isTourActive = true;
    this.currentWaypointIdx = 0;
    this.transitionProgress = 0;
    this.currentWaypoint = this.waypoints[0];
    this.nextWaypoint = this.waypoints[1];
  }

  public stopTour() {
    this.isTourActive = false;
  }

  public isActive(): boolean {
    return this.isTourActive;
  }

  public getCurrentWaypoint(): TourWaypoint | null {
    if (!this.isTourActive) return null;
    return this.currentWaypoint;
  }

  public update(delta: number): { active: boolean; targetLookAt: THREE.Vector3 | null } {
    if (!this.isTourActive) return { active: false, targetLookAt: null };

    const wp = this.currentWaypoint;
    const nextWp = this.nextWaypoint;

    // Advance progress along waypoint duration
    this.transitionProgress += delta / wp.duration;

    if (this.transitionProgress >= 1.0) {
      this.transitionProgress = 0;
      this.currentWaypointIdx = (this.currentWaypointIdx + 1) % this.waypoints.length;
      this.currentWaypoint = this.waypoints[this.currentWaypointIdx];
      this.nextWaypoint = this.waypoints[(this.currentWaypointIdx + 1) % this.waypoints.length];
    }

    // Smooth cubic hermite interpolation between waypoints
    const t = this.transitionProgress;
    const smoothT = t * t * (3 - 2 * t);

    this.camera.position.lerpVectors(wp.cameraPos, nextWp.cameraPos, smoothT);
    const currentLook = new THREE.Vector3().lerpVectors(wp.targetPos, nextWp.targetPos, smoothT);
    this.camera.lookAt(currentLook);

    return { active: true, targetLookAt: currentLook };
  }
}
