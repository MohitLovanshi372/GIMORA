/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoadLane, RoadNetwork } from './RoadNetwork';

export class Pathfinding {
  private network: RoadNetwork;
  private pathCache: Map<string, string[]> = new Map();

  constructor(network: RoadNetwork) {
    this.network = network;
  }

  /**
   * Finds a sequence of lanes from startLaneId to targetLaneId using BFS
   */
  public findRoute(startLaneId: string, targetLaneId: string): RoadLane[] {
    if (startLaneId === targetLaneId) {
      const l = this.network.lanes.get(startLaneId);
      return l ? [l] : [];
    }

    const cacheKey = `${startLaneId}->${targetLaneId}`;
    if (this.pathCache.has(cacheKey)) {
      const cachedIds = this.pathCache.get(cacheKey)!;
      return cachedIds.map((id) => this.network.lanes.get(id)!).filter(Boolean);
    }

    const queue: string[][] = [[startLaneId]];
    const visited = new Set<string>([startLaneId]);
    let bestPath: string[] | null = null;

    while (queue.length > 0) {
      const path = queue.shift()!;
      const currentId = path[path.length - 1];

      if (currentId === targetLaneId) {
        bestPath = path;
        break;
      }

      if (path.length > 12) continue; // limit depth to prevent long detour searches

      const currentLane = this.network.lanes.get(currentId);
      if (!currentLane) continue;

      for (const nextId of currentLane.connectedLanes) {
        if (!visited.has(nextId)) {
          visited.add(nextId);
          queue.push([...path, nextId]);
        }
      }
    }

    if (bestPath) {
      this.pathCache.set(cacheKey, bestPath);
      return bestPath.map((id) => this.network.lanes.get(id)!).filter(Boolean);
    }

    // Fallback: If no direct route, pick next connected lane
    const current = this.network.lanes.get(startLaneId);
    if (current && current.connectedLanes.length > 0) {
      const nextId = current.connectedLanes[Math.floor(Math.random() * current.connectedLanes.length)];
      const nextLane = this.network.lanes.get(nextId);
      return nextLane ? [current, nextLane] : [current];
    }

    return current ? [current] : [];
  }

  /**
   * Generates smooth waypoints for a list of lanes including turn curves
   */
  public generateWaypoints(lanes: RoadLane[]): THREE.Vector3[] {
    const waypoints: THREE.Vector3[] = [];

    for (let i = 0; i < lanes.length; i++) {
      const lane = lanes[i];

      // Add start and midpoints of this lane
      const dist = lane.start.distanceTo(lane.end);
      const steps = Math.max(2, Math.floor(dist / 14));

      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const pt = new THREE.Vector3().lerpVectors(lane.start, lane.end, t);
        waypoints.push(pt);
      }

      // Add smooth turn curve if there is a next lane
      if (i < lanes.length - 1) {
        const nextLane = lanes[i + 1];
        const turnStart = lane.end.clone();
        const turnEnd = nextLane.start.clone();

        // Control point: intersection of directions
        const midPoint = new THREE.Vector3().addVectors(turnStart, turnEnd).multiplyScalar(0.5);
        const curve = new THREE.QuadraticBezierCurve3(turnStart, midPoint, turnEnd);
        const curvePts = curve.getPoints(4);
        waypoints.push(...curvePts);
      } else {
        waypoints.push(lane.end.clone());
      }
    }

    return waypoints;
  }
}
