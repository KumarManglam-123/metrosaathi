import { STATIONS as DEFAULT_STATIONS } from "../data/stations";
import { EDGES as DEFAULT_EDGES } from "../data/edges";
import { calculateFare } from "./fare";
import {
  Edge,
  MetroLine,
  RouteLeg,
  RoutePreference,
  RouteResult,
  Station,
} from "./types";

interface GraphEdge {
  to: string;
  line: MetroLine;
  distanceKm: number;
}

// Build adjacency list map (bidirectional)
const adjacencyList: Map<string, GraphEdge[]> = new Map();
let currentStationsMap: Map<string, Station> = new Map();

export function buildAdjacencyList(edges: Edge[], stations: Station[]) {
  adjacencyList.clear();
  currentStationsMap = new Map(stations.map((s) => [s.id, s]));

  for (const edge of edges) {
    if (!adjacencyList.has(edge.from)) {
      adjacencyList.set(edge.from, []);
    }
    if (!adjacencyList.has(edge.to)) {
      adjacencyList.set(edge.to, []);
    }

    // Forward direction
    adjacencyList.get(edge.from)!.push({
      to: edge.to,
      line: edge.line,
      distanceKm: edge.distanceKm,
    });

    // Reverse direction (bidirectional)
    adjacencyList.get(edge.to)!.push({
      to: edge.from,
      line: edge.line,
      distanceKm: edge.distanceKm,
    });
  }
}

// Initialize default dataset
buildAdjacencyList(DEFAULT_EDGES, DEFAULT_STATIONS);

export function getStationNeighbors(stationId: string): GraphEdge[] {
  if (adjacencyList.size === 0) {
    buildAdjacencyList(DEFAULT_EDGES, DEFAULT_STATIONS);
  }
  return adjacencyList.get(stationId) || [];
}

interface PathStep {
  stationId: string;
  line: MetroLine;
  distanceKm: number;
}

interface DijkstraState {
  stationId: string;
  currentLine: MetroLine | null;
  cost: number;
  totalDistanceKm: number;
  path: PathStep[];
}

/**
 * Finds the best route between two stations using Dijkstra with line-switch penalty.
 */
export function findRoute(
  fromId: string,
  toId: string,
  preference: RoutePreference = "fastest",
  customStationsMap?: Map<string, Station>
): RouteResult | null {
  if (adjacencyList.size === 0) {
    buildAdjacencyList(DEFAULT_EDGES, DEFAULT_STATIONS);
  }

  const stationsMap = customStationsMap || currentStationsMap;
  const startStation = stationsMap.get(fromId) || DEFAULT_STATIONS.find((s) => s.id === fromId);
  const endStation = stationsMap.get(toId) || DEFAULT_STATIONS.find((s) => s.id === toId);

  if (!startStation || !endStation) {
    return null;
  }

  // Handle same origin and destination
  if (fromId === toId) {
    const fare = calculateFare(0);
    return {
      from: startStation,
      to: endStation,
      legs: [],
      allStations: [startStation],
      totalStops: 0,
      totalDistanceKm: 0,
      totalTimeMinutes: 0,
      interchangeCount: 0,
      fare,
      preferenceUsed: preference,
    };
  }

  // Transfer penalty in distance equivalents (km)
  const transferPenaltyKm = preference === "fewest_transfers" ? 12.0 : 1.8;

  // Key: `${stationId}|${currentLine || 'any'}` -> minimum cost
  const minCostMap: Map<string, number> = new Map();

  const queue: DijkstraState[] = [
    {
      stationId: fromId,
      currentLine: null,
      cost: 0,
      totalDistanceKm: 0,
      path: [],
    },
  ];

  let bestFinalState: DijkstraState | null = null;

  while (queue.length > 0) {
    queue.sort((a, b) => a.cost - b.cost);
    const current = queue.shift()!;

    if (current.stationId === toId) {
      bestFinalState = current;
      break;
    }

    const stateKey = `${current.stationId}|${current.currentLine || "any"}`;
    const previousMinCost = minCostMap.get(stateKey);
    if (previousMinCost !== undefined && previousMinCost <= current.cost) {
      continue;
    }
    minCostMap.set(stateKey, current.cost);

    const neighbors = getStationNeighbors(current.stationId);
    for (const edge of neighbors) {
      const isLineChange =
        current.currentLine !== null && current.currentLine !== edge.line;
      const penalty = isLineChange ? transferPenaltyKm : 0;
      const newCost = current.cost + edge.distanceKm + penalty;
      const newDistance = current.totalDistanceKm + edge.distanceKm;

      const nextStateKey = `${edge.to}|${edge.line}`;
      const nextMinCost = minCostMap.get(nextStateKey);

      if (nextMinCost === undefined || newCost < nextMinCost) {
        queue.push({
          stationId: edge.to,
          currentLine: edge.line,
          cost: newCost,
          totalDistanceKm: newDistance,
          path: [
            ...current.path,
            {
              stationId: edge.to,
              line: edge.line,
              distanceKm: edge.distanceKm,
            },
          ],
        });
      }
    }
  }

  if (!bestFinalState) {
    return null;
  }

  // Reconstruct full station sequence
  const allStations: Station[] = [startStation];
  for (const step of bestFinalState.path) {
    const station = stationsMap.get(step.stationId) || DEFAULT_STATIONS.find((s) => s.id === step.stationId);
    if (station) {
      allStations.push(station);
    }
  }

  // Decompose into distinct RouteLeg runs per line
  const legs: RouteLeg[] = [];
  let currentLegStations: Station[] = [startStation];
  let currentLegLine: MetroLine | null =
    bestFinalState.path.length > 0 ? bestFinalState.path[0].line : null;
  let currentLegDistance = 0;

  for (let i = 0; i < bestFinalState.path.length; i++) {
    const step = bestFinalState.path[i];
    const station = stationsMap.get(step.stationId) || DEFAULT_STATIONS.find((s) => s.id === step.stationId)!;

    if (currentLegLine === null) {
      currentLegLine = step.line;
    }

    if (step.line !== currentLegLine) {
      const fromLegStation = currentLegStations[0];
      const toLegStation = currentLegStations[currentLegStations.length - 1];
      const legStops = currentLegStations.length - 1;
      const legMinutes = Math.round(legStops * 2.4 + currentLegDistance * 0.4);

      legs.push({
        line: currentLegLine,
        fromStation: fromLegStation,
        toStation: toLegStation,
        stations: [...currentLegStations],
        numStops: legStops,
        distanceKm: Number(currentLegDistance.toFixed(1)),
        estimatedMinutes: Math.max(legMinutes, 2),
      });

      currentLegStations = [toLegStation, station];
      currentLegLine = step.line;
      currentLegDistance = step.distanceKm;
    } else {
      currentLegStations.push(station);
      currentLegDistance += step.distanceKm;
    }
  }

  // Push final leg
  if (currentLegStations.length > 1 && currentLegLine !== null) {
    const fromLegStation = currentLegStations[0];
    const toLegStation = currentLegStations[currentLegStations.length - 1];
    const legStops = currentLegStations.length - 1;
    const legMinutes = Math.round(legStops * 2.4 + currentLegDistance * 0.4);

    legs.push({
      line: currentLegLine,
      fromStation: fromLegStation,
      toStation: toLegStation,
      stations: [...currentLegStations],
      numStops: legStops,
      distanceKm: Number(currentLegDistance.toFixed(1)),
      estimatedMinutes: Math.max(legMinutes, 2),
    });
  }

  // Attach interchange details to legs
  for (let i = 0; i < legs.length - 1; i++) {
    const currentLeg = legs[i];
    const nextLeg = legs[i + 1];
    const interchangeStation = currentLeg.toStation;

    const fromLineName = currentLeg.line.charAt(0).toUpperCase() + currentLeg.line.slice(1);
    const toLineName = nextLeg.line.charAt(0).toUpperCase() + nextLeg.line.slice(1);

    currentLeg.interchangeAfter = {
      toLine: nextLeg.line,
      atStation: interchangeStation,
      walkingTimeMinutes: 3,
      instructions: `Change from ${fromLineName} Line to ${toLineName} Line at ${interchangeStation.name}. Follow ${toLineName} Line platform signage.`,
    };
  }

  const interchangeCount = Math.max(0, legs.length - 1);
  const totalStops = allStations.length - 1;

  const totalTimeMinutes = Math.round(
    totalStops * 2.4 + interchangeCount * 3.5
  );

  const fare = calculateFare(totalStops);

  return {
    from: startStation,
    to: endStation,
    legs,
    allStations,
    totalStops,
    totalDistanceKm: Number(bestFinalState.totalDistanceKm.toFixed(1)),
    totalTimeMinutes: Math.max(totalTimeMinutes, 2),
    interchangeCount,
    fare,
    preferenceUsed: preference,
  };
}
