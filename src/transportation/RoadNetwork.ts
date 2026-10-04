/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { DistrictId } from '../city/types';

export interface RoadLane {
  id: string;
  roadName: string;
  start: THREE.Vector3;
  end: THREE.Vector3;
  direction: THREE.Vector3;
  length: number;
  speedLimit: number; // in km/h
  districtId: DistrictId;
  trafficLightId?: string;
  stopPoint?: THREE.Vector3;
  connectedLanes: string[]; // downstream lane IDs
}

export interface RoadIntersection {
  id: string;
  position: THREE.Vector3;
  incomingLanes: string[];
  outgoingLanes: string[];
  trafficLightId: string;
  axisPhase: 'NS' | 'EW'; // Phase grouping
}

export interface BusStopLocation {
  id: string;
  name: string;
  districtId: DistrictId;
  position: THREE.Vector3;
  laneId: string;
}

export class RoadNetwork {
  public lanes: Map<string, RoadLane> = new Map();
  public intersections: Map<string, RoadIntersection> = new Map();
  public busStops: BusStopLocation[] = [];

  constructor() {
    this.buildNetwork();
  }

  private buildNetwork() {
    // 1. PRIMARY NORTH-SOUTH AVENUES
    // X coordinates: -180 (Industrial/Education), -100 (Downtown/Education/Healthcare), -45 (Riverside West),
    //                45 (Riverside East), 100 (Technology/Residential), 180 (Outer Tech/Residential)
    const nsAvenues = [
      { x: -180, name: 'Outer West Ave', districtN: 'education', districtS: 'healthcare', speed: 50 },
      { x: -100, name: 'Downtown Central Blvd', districtN: 'education', districtS: 'downtown', speed: 60 },
      { x: -45, name: 'Riverside West Pkwy', districtN: 'riverside', districtS: 'riverside', speed: 45 },
      { x: 45, name: 'Riverside East Pkwy', districtN: 'riverside', districtS: 'riverside', speed: 45 },
      { x: 100, name: 'Quantum Core Ave', districtN: 'technology', districtS: 'residential', speed: 60 },
      { x: 180, name: 'Outer East Ave', districtN: 'technology', districtS: 'residential', speed: 50 },
    ];

    // Z coordinates of East-West Cross Streets
    const zCrossings = [-220, -160, -90, 0, 90, 160, 220];

    // Helper to add a lane
    const addLane = (
      id: string,
      roadName: string,
      start: THREE.Vector3,
      end: THREE.Vector3,
      speedLimit: number,
      districtId: DistrictId,
      trafficLightId?: string,
      stopPoint?: THREE.Vector3
    ): RoadLane => {
      const dir = new THREE.Vector3().subVectors(end, start).normalize();
      const length = start.distanceTo(end);
      const lane: RoadLane = {
        id,
        roadName,
        start,
        end,
        direction: dir,
        length,
        speedLimit,
        districtId,
        trafficLightId,
        stopPoint,
        connectedLanes: [],
      };
      this.lanes.set(id, lane);
      return lane;
    };

    // 2. CREATE NS SEGMENTS BETWEEN CROSSINGS
    nsAvenues.forEach((ave) => {
      const laneOffset = 3.5; // distance from road center to lane center

      for (let i = 0; i < zCrossings.length - 1; i++) {
        const z1 = zCrossings[i];
        const z2 = zCrossings[i + 1];
        const midZ = (z1 + z2) / 2;
        const district: DistrictId = midZ < -100 ? (ave.districtN as DistrictId) : (ave.districtS as DistrictId);

        // Southbound lane (moving +Z): starts at z1 + 6, ends at z2 - 6
        const sbId = `lane_ns_sb_x${ave.x}_z${z1}_${z2}`;
        const sbStart = new THREE.Vector3(ave.x - laneOffset, 0.25, z1 + 6);
        const sbEnd = new THREE.Vector3(ave.x - laneOffset, 0.25, z2 - 6);
        const tlSouthId = `tl_x${ave.x}_z${z2}`;
        const stopSouth = new THREE.Vector3(ave.x - laneOffset, 0.25, z2 - 8);
        addLane(sbId, ave.name, sbStart, sbEnd, ave.speed, district, tlSouthId, stopSouth);

        // Northbound lane (moving -Z): starts at z2 - 6, ends at z1 + 6
        const nbId = `lane_ns_nb_x${ave.x}_z${z2}_${z1}`;
        const nbStart = new THREE.Vector3(ave.x + laneOffset, 0.25, z2 - 6);
        const nbEnd = new THREE.Vector3(ave.x + laneOffset, 0.25, z1 + 6);
        const tlNorthId = `tl_x${ave.x}_z${z1}`;
        const stopNorth = new THREE.Vector3(ave.x + laneOffset, 0.25, z1 + 8);
        addLane(nbId, ave.name, nbStart, nbEnd, ave.speed, district, tlNorthId, stopNorth);
      }
    });

    // 3. CREATE EW CONNECTING STREETS & RIVER BRIDGES
    zCrossings.forEach((z) => {
      const isBridge = z === -160 || z === 0 || z === 160;
      const speed = isBridge ? 70 : 50;

      // West Side: x from -180 to -100, and -100 to -45
      const westNodes = [-180, -100, -45];
      for (let i = 0; i < westNodes.length - 1; i++) {
        const x1 = westNodes[i];
        const x2 = westNodes[i + 1];

        // Eastbound (moving +X)
        const ebId = `lane_ew_eb_w_z${z}_x${x1}_${x2}`;
        const ebStart = new THREE.Vector3(x1 + 6, 0.25, z - 3.5);
        const ebEnd = new THREE.Vector3(x2 - 6, 0.25, z - 3.5);
        addLane(ebId, `Street Z${z}`, ebStart, ebEnd, speed, 'downtown', `tl_x${x2}_z${z}`, new THREE.Vector3(x2 - 8, 0.25, z - 3.5));

        // Westbound (moving -X)
        const wbId = `lane_ew_wb_w_z${z}_x${x2}_${x1}`;
        const wbStart = new THREE.Vector3(x2 - 6, 0.25, z + 3.5);
        const wbEnd = new THREE.Vector3(x1 + 6, 0.25, z + 3.5);
        addLane(wbId, `Street Z${z}`, wbStart, wbEnd, speed, 'downtown', `tl_x${x1}_z${z}`, new THREE.Vector3(x1 + 8, 0.25, z + 3.5));
      }

      // River Bridges (connecting X: -45 to X: 45)
      if (isBridge) {
        const bridgeY = 0.65;
        // Eastbound Bridge
        const bEbId = `lane_bridge_eb_z${z}`;
        const bEbStart = new THREE.Vector3(-45 + 6, bridgeY, z - 3.5);
        const bEbEnd = new THREE.Vector3(45 - 6, bridgeY, z - 3.5);
        addLane(bEbId, `Bridge Z${z}`, bEbStart, bEbEnd, 70, 'riverside', `tl_x45_z${z}`, new THREE.Vector3(45 - 8, bridgeY, z - 3.5));

        // Westbound Bridge
        const bWbId = `lane_bridge_wb_z${z}`;
        const bWbStart = new THREE.Vector3(45 - 6, bridgeY, z + 3.5);
        const bWbEnd = new THREE.Vector3(-45 + 6, bridgeY, z + 3.5);
        addLane(bWbId, `Bridge Z${z}`, bWbStart, bWbEnd, 70, 'riverside', `tl_x-45_z${z}`, new THREE.Vector3(-45 + 8, bridgeY, z + 3.5));
      }

      // East Side: x from 45 to 100, and 100 to 180
      const eastNodes = [45, 100, 180];
      for (let i = 0; i < eastNodes.length - 1; i++) {
        const x1 = eastNodes[i];
        const x2 = eastNodes[i + 1];

        // Eastbound (moving +X)
        const ebId = `lane_ew_eb_e_z${z}_x${x1}_${x2}`;
        const ebStart = new THREE.Vector3(x1 + 6, 0.25, z - 3.5);
        const ebEnd = new THREE.Vector3(x2 - 6, 0.25, z - 3.5);
        addLane(ebId, `Street Z${z}`, ebStart, ebEnd, speed, 'technology', `tl_x${x2}_z${z}`, new THREE.Vector3(x2 - 8, 0.25, z - 3.5));

        // Westbound (moving -X)
        const wbId = `lane_ew_wb_e_z${z}_x${x2}_${x1}`;
        const wbStart = new THREE.Vector3(x2 - 6, 0.25, z + 3.5);
        const wbEnd = new THREE.Vector3(x1 + 6, 0.25, z + 3.5);
        addLane(wbId, `Street Z${z}`, wbStart, wbEnd, speed, 'technology', `tl_x${x1}_z${z}`, new THREE.Vector3(x1 + 8, 0.25, z + 3.5));
      }
    });

    // 4. INTERSECTIONS & TURNS CONNECTION
    // Major intersections are at all (ave.x, zCrossings)
    nsAvenues.forEach((ave) => {
      zCrossings.forEach((z) => {
        const interId = `inter_x${ave.x}_z${z}`;
        const tlId = `tl_x${ave.x}_z${z}`;
        const incoming: string[] = [];
        const outgoing: string[] = [];

        // Find incoming/outgoing lanes near this intersection
        this.lanes.forEach((lane) => {
          if (lane.end.distanceTo(new THREE.Vector3(ave.x, lane.end.y, z)) < 12) {
            incoming.push(lane.id);
          }
          if (lane.start.distanceTo(new THREE.Vector3(ave.x, lane.start.y, z)) < 12) {
            outgoing.push(lane.id);
          }
        });

        const intersection: RoadIntersection = {
          id: interId,
          position: new THREE.Vector3(ave.x, 0.25, z),
          incomingLanes: incoming,
          outgoingLanes: outgoing,
          trafficLightId: tlId,
          axisPhase: Math.abs(ave.x) % 2 === 0 ? 'NS' : 'EW',
        };
        this.intersections.set(interId, intersection);

        // Connect incoming lanes to valid outgoing lanes
        incoming.forEach((inLaneId) => {
          const inLane = this.lanes.get(inLaneId);
          if (!inLane) return;

          outgoing.forEach((outLaneId) => {
            const outLane = this.lanes.get(outLaneId);
            if (!outLane) return;

            // Prevent strict U-turns (dot product close to -1)
            const dot = inLane.direction.dot(outLane.direction);
            if (dot > -0.6) {
              if (!inLane.connectedLanes.includes(outLaneId)) {
                inLane.connectedLanes.push(outLaneId);
              }
            }
          });
        });
      });
    });

    // 5. BUS STOPS REGISTRATION
    this.busStops = [
      {
        id: 'stop-downtown-central',
        name: 'Downtown Central Station Plaza',
        districtId: 'downtown',
        position: new THREE.Vector3(-92, 0.25, -60),
        laneId: 'lane_ns_sb_x-100_z-90_0',
      },
      {
        id: 'stop-downtown-financial',
        name: 'Apex Tower Commercial Halt',
        districtId: 'downtown',
        position: new THREE.Vector3(-92, 0.25, 60),
        laneId: 'lane_ns_sb_x-100_z0_90',
      },
      {
        id: 'stop-technology-hub',
        name: 'Mohit Developer Hub Transit Portal',
        districtId: 'technology',
        position: new THREE.Vector3(92, 0.25, -60),
        laneId: 'lane_ns_nb_x100_z0_-90',
      },
      {
        id: 'stop-residential-square',
        name: 'Sky-Terrace Living Commons',
        districtId: 'residential',
        position: new THREE.Vector3(92, 0.25, 60),
        laneId: 'lane_ns_sb_x100_z0_90',
      },
      {
        id: 'stop-railway-terminal',
        name: 'Grand Central Maglev Concourse',
        districtId: 'railway',
        position: new THREE.Vector3(0, 0.25, -170),
        laneId: 'lane_bridge_eb_z-160',
      },
      {
        id: 'stop-waterfront-bistro',
        name: 'Riverside Promenade Marina',
        districtId: 'riverside',
        position: new THREE.Vector3(-45, 0.25, -40),
        laneId: 'lane_ns_sb_x-45_z-90_0',
      },
    ];
  }

  public getRandomLane(): RoadLane {
    const laneArray = Array.from(this.lanes.values());
    return laneArray[Math.floor(Math.random() * laneArray.length)];
  }

  public getLanesByDistrict(districtId: DistrictId): RoadLane[] {
    const res: RoadLane[] = [];
    this.lanes.forEach((lane) => {
      if (lane.districtId === districtId) res.push(lane);
    });
    return res.length > 0 ? res : Array.from(this.lanes.values());
  }
}
