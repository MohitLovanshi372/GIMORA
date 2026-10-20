/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoadLane, RoadNetwork } from './RoadNetwork';

export interface RouteWaypointsResult {
  waypoints: THREE.Vector3[];
  waypointLanes: RoadLane[];
  isTurnWaypoint: boolean[];
}

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

      if (path.length > 14) continue; // limit depth to prevent long detour searches

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

    // Fallback: If no direct route, chain 3 connected lanes so vehicle has a complete multi-block journey
    const fallbackLanes: RoadLane[] = [];
    let current = this.network.lanes.get(startLaneId);
    for (let step = 0; step < 4 && current; step++) {
      fallbackLanes.push(current);
      if (current.connectedLanes.length === 0) break;
      const nextId = current.connectedLanes[Math.floor(Math.random() * current.connectedLanes.length)];
      current = this.network.lanes.get(nextId);
    }

    return fallbackLanes;
  }

  /**
   * Generates smooth waypoints along with the active RoadLane and turn flag for every waypoint
   * so vehicles strictly obey traffic lights, stop lines, and speed limits on EVERY lane in their route.
   */
  public generateRouteWithLanes(lanes: RoadLane[]): RouteWaypointsResult {
    const waypoints: THREE.Vector3[] = [];
    const waypointLanes: RoadLane[] = [];
    const isTurnWaypoint: boolean[] = [];

    for (let i = 0; i < lanes.length; i++) {
      const lane = lanes[i];

      // Add start, midpoints, and stopPoint of this lane so vehicles never skip the stop bar
      const dist = lane.start.distanceTo(lane.end);
      const steps = Math.max(3, Math.floor(dist / 12));

      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const pt = new THREE.Vector3().lerpVectors(lane.start, lane.end, t);
        waypoints.push(pt);
        waypointLanes.push(lane);
        isTurnWaypoint.push(false);
      }

      // Include explicit stopPoint waypoint right before lane end
      if (lane.stopPoint) {
        waypoints.push(lane.stopPoint.clone());
        waypointLanes.push(lane);
        isTurnWaypoint.push(false);
      }

      // Add smooth intersection turn/crossing curve if there is a next lane
      if (i < lanes.length - 1) {
        const nextLane = lanes[i + 1];
        const turnStart = lane.end.clone();
        const turnEnd = nextLane.start.clone();

        // Control point: intersection corner projection for realistic right/left turns
        const dot = lane.direction.dot(nextLane.direction);
        let controlPt: THREE.Vector3;
        if (Math.abs(dot) < 0.35) {
          // 90-degree turn: project along incoming direction to align with outgoing lane
          const forwardDist = turnStart.distanceTo(turnEnd) * 0.52;
          controlPt = turnStart.clone().addScaledVector(lane.direction, forwardDist);
          controlPt.y = (turnStart.y + turnEnd.y) * 0.5;
        } else {
          controlPt = new THREE.Vector3().addVectors(turnStart, turnEnd).multiplyScalar(0.5);
        }

        const curve = new THREE.QuadraticBezierCurve3(turnStart, controlPt, turnEnd);
        const curvePts = curve.getPoints(4);
        for (let c = 0; c < curvePts.length; c++) {
          waypoints.push(curvePts[c]);
          // Once past the first curve point, transition lane tracking to nextLane
          waypointLanes.push(c === 0 ? lane : nextLane);
          isTurnWaypoint.push(Math.abs(dot) < 0.35);
        }
      } else {
        waypoints.push(lane.end.clone());
        waypointLanes.push(lane);
        isTurnWaypoint.push(false);
      }
    }

    return { waypoints, waypointLanes, isTurnWaypoint };
  }

  /**
   * Generates smooth waypoints for a list of lanes including turn curves
   */
  public generateWaypoints(lanes: RoadLane[]): THREE.Vector3[] {
    return this.generateRouteWithLanes(lanes).waypoints;
  }
}
