/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import {
  Pedestrian,
  PedestrianArchetype,
  SidewalkEdge,
  SidewalkNode,
} from './Pedestrian';
import { TrafficLight } from './TrafficLight';
import { Vehicle } from './Vehicle';
import { CityPhysicsEngine } from '../city/modules/CityPhysicsEngine';

interface CrosswalkBeacon {
  trafficLightId: string;
  axis: 'NS' | 'EW';
  lampMesh: THREE.Mesh;
}

export class PedestrianManager {
  public group: THREE.Group;
  public pedestrians: Pedestrian[] = [];
  public nodes: Map<string, SidewalkNode> = new Map();
  public adjacency: Map<string, SidewalkEdge[]> = new Map();
  public weightedNodes: SidewalkNode[] = [];

  private physicsEngine?: CityPhysicsEngine;
  private staticObstacles: THREE.Vector2[] = [];
  private spatialGrid: Map<string, Pedestrian[]> = new Map();
  private readonly gridCellSize = 8.0;

  // Visual pedestrian WALK / DONT WALK signal beacons at major intersections
  private crosswalkBeacons: CrosswalkBeacon[] = [];
  private walkGreenMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  private waitRedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  private beaconPostMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.8,
  });

  constructor(scene: THREE.Scene, physicsEngine?: CityPhysicsEngine) {
    this.physicsEngine = physicsEngine;
    this.group = new THREE.Group();
    this.group.name = 'pedestrian_system';

    this.buildStaticStreetObstacleRegistry();
    this.buildSidewalkAndCrosswalkGraph();
    this.buildCrosswalkSignalBeacons();
    this.spawnHighDensityCrowd(110);

    scene.add(this.group);
  }

  public setPhysicsEngine(physicsEngine: CityPhysicsEngine) {
    this.physicsEngine = physicsEngine;
  }

  /**
   * Registers street furniture positions (palm trees, streetlights, bus stops)
   * along sidewalks so pedestrian agents steer smoothly around them.
   */
  private buildStaticStreetObstacleRegistry() {
    // 1. Streetlight poles along avenues
    const lightAvenues = [-188, -172, -108, -92, 92, 108, 172, 188];
    lightAvenues.forEach((xPos) => {
      for (let z = -240; z <= 240; z += 35) {
        this.staticObstacles.push(new THREE.Vector2(xPos, z));
      }
    });

    // 2. Los Santos Boulevard Palm Trees
    for (let z = -230; z <= 230; z += 24) {
      if (Math.abs(z) > 12 && Math.abs(z - -160) > 12 && Math.abs(z - 160) > 12) {
        this.staticObstacles.push(
          new THREE.Vector2(-36, z),
          new THREE.Vector2(36, z),
          new THREE.Vector2(-91, z),
          new THREE.Vector2(91, z)
        );
      }
    }

    // 3. Bus Stop Shelters
    const busStops: [number, number][] = [
      [-92, -60],
      [-92, 60],
      [92, -60],
      [92, 60],
    ];
    busStops.forEach(([bx, bz]) => {
      this.staticObstacles.push(new THREE.Vector2(bx, bz));
    });
  }

  /**
   * Builds the city-wide procedural Sidewalk & Signalized Crosswalk Navigation Graph,
   * concentrating node density weights in high-density metropolitan districts.
   */
  private buildSidewalkAndCrosswalkGraph() {
    const nsAvenues = [-180, -100, -45, 45, 100, 180];
    const ewStreets = [-220, -160, -90, 0, 90, 160, 220];

    const addNode = (
      id: string,
      x: number,
      y: number,
      z: number,
      districtId: string,
      densityWeight: number,
      isPlaza = false
    ): SidewalkNode => {
      const node: SidewalkNode = {
        id,
        position: new THREE.Vector3(x, y, z),
        districtId,
        densityWeight,
        isPlaza,
      };
      this.nodes.set(id, node);
      this.adjacency.set(id, []);

      // Populate weighted selection pool for high-density district spawning & destinations
      const copies = Math.max(1, Math.round(densityWeight));
      for (let c = 0; c < copies; c++) {
        this.weightedNodes.push(node);
      }
      return node;
    };

    const addDirectedEdge = (
      from: SidewalkNode,
      to: SidewalkNode,
      type: SidewalkEdge['type'],
      trafficLightId?: string,
      crossingAxis?: 'NS' | 'EW'
    ) => {
      const dir = new THREE.Vector3().subVectors(to.position, from.position);
      dir.y = 0;
      const length = dir.length();
      if (length > 0.001) dir.divideScalar(length);

      const edge: SidewalkEdge = {
        id: `edge_${from.id}_to_${to.id}`,
        from,
        to,
        type,
        length,
        direction: dir,
        trafficLightId,
        crossingAxis,
      };
      this.adjacency.get(from.id)?.push(edge);
    };

    const addBidirectionalEdge = (
      n1: SidewalkNode,
      n2: SidewalkNode,
      type: SidewalkEdge['type'],
      trafficLightId?: string,
      crossingAxis?: 'NS' | 'EW'
    ) => {
      addDirectedEdge(n1, n2, type, trafficLightId, crossingAxis);
      addDirectedEdge(n2, n1, type, trafficLightId, crossingAxis);
    };

    // Helper to classify district density weight by coordinates
    const getDistrictAndWeight = (x: number, z: number): { district: string; weight: number } => {
      if (Math.abs(x - -100) <= 25 && Math.abs(z) <= 100) {
        return { district: 'downtown', weight: 6 }; // High-density Downtown Financial & Burj Khalifa Core
      }
      if (x >= 40 && x <= 150 && z >= -110 && z <= 20) {
        return { district: 'technology', weight: 6 }; // High-density Midtown America & Mohit Developer Hub
      }
      if (x <= -100 && z >= 0 && z <= 115) {
        return { district: 'singapore', weight: 5 }; // High-density Singapore Marina Bay
      }
      if (x <= -40 && z <= -90 && z >= -175) {
        return { district: 'paris', weight: 5 }; // High-density Paris Champs-Élysées
      }
      if (Math.abs(z - -220) <= 30 && Math.abs(x) <= 105) {
        return { district: 'railway', weight: 5 }; // Grand Central Railway Terminal Concourse
      }
      if (Math.abs(x) <= 50 && Math.abs(z) <= 100) {
        return { district: 'riverside', weight: 4 }; // Waterfront Promenade
      }
      return { district: 'metropolitan', weight: 2 };
    };

    // 1. Create 4 Sidewalk Corner Nodes (NW, NE, SW, SE) at Every City Intersection
    const cornerOffset = 9.2; // Sidewalk center offset from road center
    for (const ix of nsAvenues) {
      for (const iz of ewStreets) {
        const { district, weight } = getDistrictAndWeight(ix, iz);
        const tlId = `tl_x${ix}_z${iz}`;

        const nw = addNode(`c_${ix}_${iz}_NW`, ix - cornerOffset, 0.22, iz - cornerOffset, district, weight);
        const ne = addNode(`c_${ix}_${iz}_NE`, ix + cornerOffset, 0.22, iz - cornerOffset, district, weight);
        const sw = addNode(`c_${ix}_${iz}_SW`, ix - cornerOffset, 0.22, iz + cornerOffset, district, weight);
        const se = addNode(`c_${ix}_${iz}_SE`, ix + cornerOffset, 0.22, iz + cornerOffset, district, weight);

        // Signalized Crosswalks across the North-South Avenue (Pedestrians walk East-West)
        addBidirectionalEdge(nw, ne, 'crosswalk', tlId, 'EW');
        addBidirectionalEdge(sw, se, 'crosswalk', tlId, 'EW');

        // Signalized Crosswalks across the East-West Street (Pedestrians walk North-South)
        addBidirectionalEdge(nw, sw, 'crosswalk', tlId, 'NS');
        addBidirectionalEdge(ne, se, 'crosswalk', tlId, 'NS');
      }
    }

    // 2. Connect Sidewalks Along North-South Avenues (Both West & East Sidewalks)
    for (const ix of nsAvenues) {
      for (let j = 0; j < ewStreets.length - 1; j++) {
        const z1 = ewStreets[j];
        const z2 = ewStreets[j + 1];

        // West sidewalk of avenue: SW corner of z1 to NW corner of z2
        const sw1 = this.nodes.get(`c_${ix}_${z1}_SW`);
        const nw2 = this.nodes.get(`c_${ix}_${z2}_NW`);
        if (sw1 && nw2) addBidirectionalEdge(sw1, nw2, 'sidewalk');

        // East sidewalk of avenue: SE corner of z1 to NE corner of z2
        const se1 = this.nodes.get(`c_${ix}_${z1}_SE`);
        const ne2 = this.nodes.get(`c_${ix}_${z2}_NE`);
        if (se1 && ne2) addBidirectionalEdge(se1, ne2, 'sidewalk');
      }
    }

    // 3. Connect Sidewalks Along East-West Cross Streets & River Bridges
    for (const iz of ewStreets) {
      for (let i = 0; i < nsAvenues.length - 1; i++) {
        const x1 = nsAvenues[i];
        const x2 = nsAvenues[i + 1];
        const isRiverSpan = x1 === -45 && x2 === 45;
        const isBridgeZ = iz === -160 || iz === 0 || iz === 160;

        // Only cross the river where bridges exist
        if (isRiverSpan && !isBridgeZ) continue;

        const edgeType: SidewalkEdge['type'] = isRiverSpan ? 'bridge_walkway' : 'sidewalk';

        // North sidewalk of street: NE corner of x1 to NW corner of x2
        const ne1 = this.nodes.get(`c_${x1}_${iz}_NE`);
        const nw2 = this.nodes.get(`c_${x2}_${iz}_NW`);
        if (ne1 && nw2) addBidirectionalEdge(ne1, nw2, edgeType);

        // South sidewalk of street: SE corner of x1 to SW corner of x2
        const se1 = this.nodes.get(`c_${x1}_${iz}_SE`);
        const sw2 = this.nodes.get(`c_${x2}_${iz}_SW`);
        if (se1 && sw2) addBidirectionalEdge(se1, sw2, edgeType);
      }
    }

    // 4. Add High-Density Landmark Plaza Nodes & Connect to Adjacent Sidewalks
    const linkPlaza = (
      id: string,
      x: number,
      z: number,
      district: string,
      weight: number,
      nearNodeIds: string[]
    ) => {
      const pNode = addNode(id, x, 0.24, z, district, weight, true);
      nearNodeIds.forEach((nid) => {
        const target = this.nodes.get(nid);
        if (target) addBidirectionalEdge(pNode, target, 'plaza_path');
      });
    };

    // Mohit Developer Hub Forecourt Plaza (Block center 145, -46 -> west forecourt at 124, -46)
    linkPlaza('plaza_mohit_hub', 124, -46, 'technology', 7, [
      'c_100_-90_SE',
      'c_100_0_NE',
    ]);

    // Downtown Burj Khalifa & Apex Promenade (Burj at -132, -52 -> east forecourt at -114, -52)
    linkPlaza('plaza_downtown_burj', -114, -52, 'downtown', 7, [
      'c_-100_-90_SW',
      'c_-100_0_NW',
    ]);

    // Singapore Marina Bay Sands Waterfront Boardwalk (MBS at -140, 125 -> north forecourt at -140, 106)
    linkPlaza('plaza_singapore_mbs', -140, 106, 'singapore', 6, [
      'c_-180_90_SE',
      'c_-100_90_SW',
    ]);

    // Paris Eiffel Tower & Champs-Élysées Esplanade (Eiffel at -72, -125 -> south plaza at -72, -104)
    linkPlaza('plaza_paris_eiffel', -72, -104, 'paris', 6, [
      'c_-45_-90_NW',
      'c_-100_-90_NE',
    ]);

    // America Empire State & One WTC Midtown Plaza (Between ESB 72, -60 and One WTC 72, -26 -> plaza at 86, -44)
    linkPlaza('plaza_america_midtown', 86, -44, 'technology', 6, [
      'c_100_-90_SW',
      'c_100_0_NW',
      'c_45_-90_SE',
    ]);

    // Grand Central Railway Terminal Concourse (Terminal at -140, -190 -> south forecourt at -140, -172)
    linkPlaza('plaza_railway_terminal', -140, -172, 'railway', 6, [
      'c_-180_-160_NE',
      'c_-100_-160_NW',
    ]);
  }

  /**
   * Builds visual pedestrian WALK / WAIT signal heads at major city crosswalks.
   */
  private buildCrosswalkSignalBeacons() {
    const majorIntersections: [number, number][] = [
      [-100, -160],
      [-100, -90],
      [-100, 0],
      [-100, 90],
      [-100, 160],
      [100, -160],
      [100, -90],
      [100, 0],
      [100, 90],
      [100, 160],
      [-45, 0],
      [45, 0],
      [-180, 0],
      [180, 0],
    ];

    const postGeo = new THREE.CylinderGeometry(0.07, 0.09, 2.5, 6);
    const boxGeo = new THREE.BoxGeometry(0.28, 0.42, 0.22);
    const lampGeo = new THREE.SphereGeometry(0.11, 8, 8);

    majorIntersections.forEach(([ix, iz]) => {
      const tlId = `tl_x${ix}_z${iz}`;
      const corners: { dx: number; dz: number; axis: 'NS' | 'EW' }[] = [
        { dx: -9.8, dz: -9.8, axis: 'EW' },
        { dx: 9.8, dz: -9.8, axis: 'NS' },
        { dx: -9.8, dz: 9.8, axis: 'NS' },
        { dx: 9.8, dz: 9.8, axis: 'EW' },
      ];

      corners.forEach((c) => {
        const post = new THREE.Mesh(postGeo, this.beaconPostMat);
        post.position.set(ix + c.dx, 1.25, iz + c.dz);
        this.group.add(post);

        const housing = new THREE.Mesh(boxGeo, this.beaconPostMat);
        housing.position.set(ix + c.dx, 2.45, iz + c.dz);
        this.group.add(housing);

        const lamp = new THREE.Mesh(lampGeo, this.walkGreenMat);
        lamp.position.set(ix + c.dx, 2.45, iz + c.dz);
        this.group.add(lamp);

        this.crosswalkBeacons.push({
          trafficLightId: tlId,
          axis: c.axis,
          lampMesh: lamp,
        });
      });
    });
  }

  /**
   * Computes an A* path across the sidewalk & crosswalk graph from startNode to goalNode.
   */
  public findPath(startNode: SidewalkNode, goalNode: SidewalkNode): SidewalkEdge[] {
    if (startNode.id === goalNode.id) return [];

    const openSet: SidewalkNode[] = [startNode];
    const cameFromEdge = new Map<string, SidewalkEdge>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    gScore.set(startNode.id, 0);
    fScore.set(startNode.id, startNode.position.distanceTo(goalNode.position));

    const closedSet = new Set<string>();

    while (openSet.length > 0) {
      // Pop node with lowest fScore
      let bestIdx = 0;
      let bestF = fScore.get(openSet[0].id) ?? Infinity;
      for (let i = 1; i < openSet.length; i++) {
        const f = fScore.get(openSet[i].id) ?? Infinity;
        if (f < bestF) {
          bestF = f;
          bestIdx = i;
        }
      }

      const current = openSet.splice(bestIdx, 1)[0];
      if (current.id === goalNode.id) {
        // Reconstruct edge sequence
        const path: SidewalkEdge[] = [];
        let currId = goalNode.id;
        while (cameFromEdge.has(currId)) {
          const edge = cameFromEdge.get(currId)!;
          path.unshift(edge);
          currId = edge.from.id;
        }
        return path;
      }

      closedSet.add(current.id);
      const neighbors = this.adjacency.get(current.id) || [];

      for (let i = 0; i < neighbors.length; i++) {
        const edge = neighbors[i];
        const neighbor = edge.to;
        if (closedSet.has(neighbor.id)) continue;

        // Slight cost penalty on crosswalks so pedestrians prefer staying on continuous sidewalks unless crossing
        const stepCost = edge.type === 'crosswalk' ? edge.length * 1.25 : edge.length;
        const tentativeG = (gScore.get(current.id) ?? Infinity) + stepCost;

        if (tentativeG < (gScore.get(neighbor.id) ?? Infinity)) {
          cameFromEdge.set(neighbor.id, edge);
          gScore.set(neighbor.id, tentativeG);
          fScore.set(
            neighbor.id,
            tentativeG + neighbor.position.distanceTo(goalNode.position)
          );
          if (!openSet.includes(neighbor)) {
            openSet.push(neighbor);
          }
        }
      }
    }

    // Fallback: pick any connected outgoing edge if disconnected
    const fallbackEdges = this.adjacency.get(startNode.id) || [];
    return fallbackEdges.length > 0 ? [fallbackEdges[0]] : [];
  }

  private pickRandomHighDensityGoal(excludeNode: SidewalkNode): SidewalkNode {
    for (let attempt = 0; attempt < 12; attempt++) {
      const candidate =
        this.weightedNodes[Math.floor(Math.random() * this.weightedNodes.length)];
      if (
        candidate &&
        candidate.id !== excludeNode.id &&
        candidate.position.distanceTo(excludeNode.position) < 260
      ) {
        return candidate;
      }
    }
    return this.weightedNodes[0] || excludeNode;
  }

  private spawnHighDensityCrowd(totalCount: number) {
    const archetypes: PedestrianArchetype[] = [
      'executive',
      'tech_commuter',
      'tourist',
      'student',
      'jogger',
    ];

    for (let i = 0; i < totalCount; i++) {
      const startNode =
        this.weightedNodes[Math.floor(Math.random() * this.weightedNodes.length)];
      if (!startNode) continue;

      const goalNode = this.pickRandomHighDensityGoal(startNode);
      const route = this.findPath(startNode, goalNode);
      const archetype = archetypes[i % archetypes.length];

      const ped = new Pedestrian(`ped_${i}`, startNode, archetype, route);

      // Stagger initial progress along first edge so pedestrians aren't bunched on corners
      if (route.length > 0) {
        const firstEdge = route[0];
        const t = Math.random() * 0.85;
        ped.mesh.position.lerpVectors(firstEdge.from.position, firstEdge.to.position, t);
      }

      this.pedestrians.push(ped);
      this.group.add(ped.mesh);
    }
  }

  public update(
    delta: number,
    trafficLights?: Map<string, TrafficLight>,
    vehicles?: Vehicle[],
    playerPos?: THREE.Vector3
  ) {
    const activeLights = trafficLights || new Map<string, TrafficLight>();
    const activeVehicles = vehicles || [];

    // 1. Update Visual Pedestrian Crosswalk WALK / WAIT Signal Beacons
    if (activeLights.size > 0) {
      for (let i = 0; i < this.crosswalkBeacons.length; i++) {
        const b = this.crosswalkBeacons[i];
        const tl = activeLights.get(b.trafficLightId);
        if (tl) {
          b.lampMesh.material = tl.isGreen(b.axis) ? this.walkGreenMat : this.waitRedMat;
        }
      }
    }

    // 2. Rebuild 2D Spatial Hash Grid for Fast Neighbor Avoidance
    this.spatialGrid.clear();
    for (let i = 0; i < this.pedestrians.length; i++) {
      const p = this.pedestrians[i];
      const cx = Math.floor(p.mesh.position.x / this.gridCellSize);
      const cz = Math.floor(p.mesh.position.z / this.gridCellSize);
      const key = `${cx},${cz}`;
      let cell = this.spatialGrid.get(key);
      if (!cell) {
        cell = [];
        this.spatialGrid.set(key, cell);
      }
      cell.push(p);
    }

    // 3. Update Every Pedestrian Agent with Local Neighbors, Crosswalk Signals & Physics
    const localNeighbors: Pedestrian[] = [];
    for (let i = 0; i < this.pedestrians.length; i++) {
      const ped = this.pedestrians[i];
      const cx = Math.floor(ped.mesh.position.x / this.gridCellSize);
      const cz = Math.floor(ped.mesh.position.z / this.gridCellSize);

      localNeighbors.length = 0;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          const cell = this.spatialGrid.get(`${cx + dx},${cz + dz}`);
          if (cell) {
            for (let k = 0; k < cell.length; k++) {
              if (cell[k] !== ped) localNeighbors.push(cell[k]);
            }
          }
        }
      }

      const needsNewRoute = ped.update(
        delta,
        activeLights,
        activeVehicles,
        localNeighbors,
        this.physicsEngine ?? null,
        playerPos
      );

      if (needsNewRoute) {
        const nextGoal = this.pickRandomHighDensityGoal(ped.currentNode);
        const newRoute = this.findPath(ped.currentNode, nextGoal);
        ped.assignRoute(newRoute);
      }
    }
  }

  public getActivePedestrianCount(): number {
    return this.pedestrians.length;
  }

  public dispose() {
    this.pedestrians.forEach((p) => p.dispose());
    this.walkGreenMat.dispose();
    this.waitRedMat.dispose();
    this.beaconPostMat.dispose();
    this.group.clear();
  }
}
