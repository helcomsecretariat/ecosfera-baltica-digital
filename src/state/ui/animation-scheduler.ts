import { baseDuration } from "@/constants/animation";
import { cardHeight, cardWidth } from "@/constants/card";
import {
  Coordinate,
  EntitityRenderKey,
  GamePieceAppearance,
  GamePieceAppearances,
  GamePieceCoordsDict,
} from "@/state/types";
import { entries } from "lodash-es";

type MotionDataEntry = {
  key: EntitityRenderKey;
  deltaX: number;
  deltaY: number;
  angle: number;
  distance: number;
  cardAppearance: GamePieceAppearance;
  startPoint: Coordinate;
  endPoint: Coordinate;
  animationType: "move" | "disappear" | "appear";
  doesFlip: boolean;
  clusterIndex?: number;
};

function calcDist(posA: Coordinate, posB: Coordinate): number {
  return Math.sqrt(Math.pow(posA.x - posB.x, 2) + Math.pow(posA.y - posB.y, 2));
}

// Step 1: Calculate motion data for each card
function calcMotionData(cards: GamePieceCoordsDict, cardsPrev?: GamePieceCoordsDict): MotionDataEntry[] {
  const motionData: MotionDataEntry[] = [];

  entries(cards).forEach(([key, currentApp]) => {
    const prevApp = cardsPrev ? cardsPrev[key as keyof GamePieceCoordsDict] : undefined;
    const {
      position: curPos,
      initialPosition: curInitPos,
      exitPosition: curExitPos,
      rotation: curRot,
      initialRotation: curInitRot,
      exitRotation: curExitRot,
    } = currentApp;
    const prevPos = prevApp?.position;
    const prevRot = prevApp?.rotation;

    let distance = 0;
    let deltaX = 0;
    let deltaY = 0;
    let startPoint: Coordinate = { x: 0, y: 0, z: 0 };
    let endPoint: Coordinate = { x: 0, y: 0, z: 0 };
    let doesFlip = false;
    let animationType: "move" | "disappear" | "appear" = "move";

    if (curPos && curInitPos && !prevPos) {
      // New card appearing
      startPoint = curInitPos;
      endPoint = curPos;
      doesFlip = !!(curInitRot && curRot && curInitRot.y !== curRot.y);
      animationType = "appear";
    } else if (!curPos && prevPos && curExitPos) {
      // Card disappearing
      startPoint = prevPos;
      endPoint = curExitPos;
      animationType = "disappear";
      doesFlip = !!(prevRot && curExitRot && prevRot.y !== curExitRot.y);
    } else if (prevPos && curPos) {
      // Card moving
      startPoint = prevPos;
      endPoint = curPos;
      doesFlip = !!(prevRot && curRot && prevRot.y !== curRot.y);
      animationType = "move";
    }

    distance = calcDist(startPoint, endPoint);
    deltaX = startPoint.x - endPoint.x;
    deltaY = startPoint.y - endPoint.y;

    const angle = Math.atan2(deltaY, deltaX);

    motionData.push({
      key: key as EntitityRenderKey,
      deltaX,
      deltaY,
      angle,
      distance,
      cardAppearance: currentApp as GamePieceAppearance,
      startPoint,
      endPoint,
      animationType,
      doesFlip,
    });
  });

  return motionData;
}

// Step 2: Detect overlaps between moving cards
function detectOverlaps(motionData: MotionDataEntry[], cardHeight: number): Map<string, string> {
  const overlaps = new Map<string, string>();

  for (let i = 0; i < motionData.length; i++) {
    if (motionData[i].distance === 0 || motionData[i].animationType === "disappear") continue;
    for (let j = 0; j < motionData.length; j++) {
      if (motionData[j].distance === 0) continue;

      const sameX = motionData[i].endPoint.x === motionData[j].startPoint.x;
      const sameY = motionData[i].endPoint.y === motionData[j].startPoint.y;
      const closeX = Math.abs(motionData[i].endPoint.x - motionData[j].startPoint.x) < cardHeight / 4;
      const closeY = Math.abs(motionData[i].endPoint.y - motionData[j].startPoint.y) < cardHeight / 4;

      if ((sameX && closeY) || (sameY && closeX)) {
        overlaps.set(motionData[i].key, motionData[j].key);
        break;
      }
    }
  }

  return overlaps;
}

// Step 3: Cluster motions based on their endpoints and other traits
function clusterByEndpoints(motionData: MotionDataEntry[], tolerance: number): Map<number, MotionDataEntry[]> {
  const clusters = new Map<number, MotionDataEntry[]>();
  let clusterIndex = 0;

  for (const data of motionData) {
    let assigned = false;
    for (const [index, cluster] of clusters.entries()) {
      const clusterRep = cluster[0];
      const isStationary =
        clusterRep.animationType === data.animationType && clusterRep.distance === 0 && data.distance === 0;
      const isSimilarEndpoint =
        (Math.abs(data.endPoint.x - clusterRep.endPoint.x) === 0 ||
          Math.abs(data.endPoint.y - clusterRep.endPoint.y) < tolerance) &&
        data.animationType === clusterRep.animationType;
      if (isStationary || isSimilarEndpoint) {
        cluster.push(data);
        data.clusterIndex = index;
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      clusters.set(clusterIndex, [data]);
      data.clusterIndex = clusterIndex;
      clusterIndex++;
    }
  }

  return clusters;
}

// Step 4: Build dependency graph based on overlaps
function buildDependencyGraph(overlaps: Map<string, string>, motionData: MotionDataEntry[]): Map<number, Set<number>> {
  const graph = new Map<number, Set<number>>();

  // Map from card key to cluster index
  const keyToClusterIndex = new Map<string, number>();
  motionData.forEach((data) => {
    if (data.clusterIndex !== undefined) {
      keyToClusterIndex.set(data.key, data.clusterIndex);
    }
  });

  overlaps.forEach((overlapsWithKey, key) => {
    const clusterA = keyToClusterIndex.get(key);
    const clusterB = keyToClusterIndex.get(overlapsWithKey);

    if (clusterA !== undefined && clusterB !== undefined && clusterA !== clusterB) {
      if (!graph.has(clusterB)) {
        graph.set(clusterB, new Set<number>());
      }
      graph.get(clusterB)!.add(clusterA);
      // This means clusterB must come before clusterA to avoid overlap
    }
  });

  return graph;
}

// Step 5: Perform topological sort on the dependency graph
function topologicalSort(graph: Map<number, Set<number>>, nodesArray: number[]): number[] {
  const visited = new Set<number>();
  const temp = new Set<number>();
  const result: number[] = [];

  function visit(node: number) {
    if (temp.has(node)) console.error("Animation dep. graph has cycles");
    if (!visited.has(node)) {
      temp.add(node);
      const neighbors = graph.get(node) || new Set<number>();
      neighbors.forEach(visit);
      temp.delete(node);
      visited.add(node);
      result.push(node);
    }
  }

  nodesArray.forEach((node) => {
    if (!visited.has(node)) {
      visit(node);
    }
  });

  return result.reverse(); // Reverse to get the correct order
}

// Step 6: Calculate delays and durations for each card
function calculateDelaysAndDurations(
  clusters: Map<number, MotionDataEntry[]>,
  sortedClusterIndices: number[],
): GamePieceAppearances {
  let cumulativeDelay = 0;
  const updatedCards: GamePieceAppearances = {};

  log("===========================================");
  log(`Total clusters detected: ${sortedClusterIndices.length}`);
  log("---------");

  sortedClusterIndices.forEach((clusterIndex, groupIndex) => {
    const cluster = clusters.get(clusterIndex)!;

    const groupMaxDistance = Math.max(...cluster.map((data) => data.distance));

    let groupMaxEndTime = 0;

    cluster.forEach((data) => {
      const intraGroupDelay =
        groupMaxDistance > 0 ? ((groupMaxDistance - data.distance) / groupMaxDistance) * baseDuration : 0;

      const duration = (data.distance / cardWidth) * baseDuration;

      const totalDelay = cumulativeDelay + intraGroupDelay;
      const additionalDelay = cumulativeDelay === 0 ? 0 : baseDuration * 2;

      if (data.distance) log(data.key, ` duration: ${duration}`);

      updatedCards[data.key] = {
        ...data.cardAppearance,
        delay: totalDelay + additionalDelay,
        duration,
        doesFlip: data.doesFlip,
      };

      const endTime = totalDelay + duration;
      groupMaxEndTime = Math.max(groupMaxEndTime, endTime);
    });

    if (cumulativeDelay !== groupMaxEndTime) {
      log(
        `Cluster ${groupIndex} - Max end time in cluster: ${groupMaxEndTime}, Cumulative delay before this cluster: ${cumulativeDelay}`,
      );

      cumulativeDelay = groupMaxEndTime;

      log(`Cumulative delay after Cluster ${groupIndex}: ${cumulativeDelay}`);
      log("---------");
    }
  });

  return updatedCards;
}

function hasCycle(graph: Map<number, Set<number>>): boolean {
  const visited = new Set<number>();
  const recStack = new Set<number>();

  function dfs(node: number): boolean {
    if (!visited.has(node)) {
      visited.add(node);
      recStack.add(node);

      const neighbors = graph.get(node) || new Set<number>();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor) && dfs(neighbor)) {
          return true;
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }
    }

    recStack.delete(node);
    return false;
  }

  for (const node of graph.keys()) {
    if (dfs(node)) {
      return true;
    }
  }

  return false;
}

export function calcDelays(cards: GamePieceCoordsDict, cardsPrev?: GamePieceCoordsDict): GamePieceAppearances {
  const isFirstRender = !cardsPrev || Object.keys(cardsPrev).length === 0;

  // Step 1: Calculate motion data
  const motionData = calcMotionData(cards, cardsPrev);

  // Step 2: Detect overlaps
  const overlaps = detectOverlaps(motionData, cardHeight);

  // Step 3: Cluster motions by endpoints
  const tolerance = cardHeight / 4;
  let clusters = clusterByEndpoints(motionData, tolerance);

  // Step 4: Build dependency graph
  const dependencyGraph = buildDependencyGraph(overlaps, motionData);

  let sortedClusterIndices: number[];

  if (hasCycle(dependencyGraph) || isFirstRender) {
    // Merge all motion data into a single cluster
    const allData = Array.from(clusters.values()).flat();
    clusters = new Map<number, MotionDataEntry[]>([[0, allData]]);
    sortedClusterIndices = [0];
  } else {
    sortedClusterIndices = topologicalSort(dependencyGraph, Array.from(clusters.keys()));
  }

  // Step 6: Calculate delays and durations
  const updatedCards = calculateDelaysAndDurations(clusters, sortedClusterIndices);

  return updatedCards;
}

// const log = (...args: unknown[]) => console.log(...args)
const log = (..._: unknown[]) => void 0;
