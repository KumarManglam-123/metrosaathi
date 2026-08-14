import { query } from "./db";
import { Edge, MetroLine, RoutePreference, RouteResult, Station } from "./types";
import { STATIONS as FALLBACK_STATIONS } from "../data/stations";
import { EDGES as FALLBACK_EDGES } from "../data/edges";
import { buildAdjacencyList, findRoute } from "./graph";

// In-memory cache for fast graph access on the server
interface DBCache {
  stations: Station[];
  stationsMap: Map<string, Station>;
  edges: Edge[];
  lastFetched: number;
}

let dbCache: DBCache | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches all stations from PostgreSQL joined with their lines via station_lines
 */
export async function getStationsFromDB(forceRefresh = false): Promise<Station[]> {
  const now = Date.now();
  if (!forceRefresh && dbCache && now - dbCache.lastFetched < CACHE_TTL_MS) {
    return dbCache.stations;
  }

  try {
    const res = await query<{
      id: string;
      name: string;
      name_kannada: string | null;
      lat: number;
      lng: number;
      is_interchange: boolean;
      lines: MetroLine[];
    }>(`
      SELECT
        s.id,
        s.name,
        s.name_kannada,
        s.lat,
        s.lng,
        s.is_interchange,
        ARRAY_AGG(sl.line_id ORDER BY sl.line_id) as lines
      FROM stations s
      JOIN station_lines sl ON s.id = sl.station_id
      GROUP BY s.id, s.name, s.name_kannada, s.lat, s.lng, s.is_interchange
      ORDER BY s.name ASC;
    `);

    const stations: Station[] = res.rows.map((row) => {
      const fallback = FALLBACK_STATIONS.find((f) => f.id === row.id);

      return {
        id: row.id,
        name: row.name,
        shortName: fallback?.shortName || row.name,
        kannadaName: row.name_kannada || undefined,
        lines: row.lines,
        lat: row.lat,
        lng: row.lng,
        interchange: row.is_interchange,
        terminal: fallback?.terminal,
        aliases: fallback?.aliases || [],
        layout: fallback?.layout || "elevated",
        facilities: fallback?.facilities || {
          parking: true,
          feederBus: true,
          restrooms: true,
          wheelchairAccessible: true,
          drinkingWater: true,
        },
      };
    });

    const stationsMap = new Map(stations.map((s) => [s.id, s]));
    if (!dbCache) {
      dbCache = {
        stations,
        stationsMap,
        edges: [],
        lastFetched: now,
      };
    } else {
      dbCache.stations = stations;
      dbCache.stationsMap = stationsMap;
      dbCache.lastFetched = now;
    }

    return stations;
  } catch (err: any) {
    console.warn("⚠️ Warning: Failed to query stations from PostgreSQL, falling back to local dataset:", err.message);
    return FALLBACK_STATIONS;
  }
}

/**
 * Fetches all edges from PostgreSQL
 */
export async function getEdgesFromDB(forceRefresh = false): Promise<Edge[]> {
  const now = Date.now();
  if (!forceRefresh && dbCache && dbCache.edges.length > 0 && now - dbCache.lastFetched < CACHE_TTL_MS) {
    return dbCache.edges;
  }

  try {
    const res = await query<{
      from_station: string;
      to_station: string;
      line_id: MetroLine;
      distance_km: number;
    }>(`
      SELECT
        from_station,
        to_station,
        line_id,
        distance_km
      FROM edges
      ORDER BY id ASC;
    `);

    const edges: Edge[] = res.rows.map((row) => ({
      from: row.from_station,
      to: row.to_station,
      line: row.line_id,
      distanceKm: row.distance_km,
    }));

    if (!dbCache) {
      dbCache = {
        stations: [],
        stationsMap: new Map(),
        edges,
        lastFetched: now,
      };
    } else {
      dbCache.edges = edges;
      dbCache.lastFetched = now;
    }

    return edges;
  } catch (err: any) {
    console.warn("⚠️ Warning: Failed to query edges from PostgreSQL, falling back to local dataset:", err.message);
    return FALLBACK_EDGES;
  }
}

/**
 * Retrieves a single station by its ID (slug)
 */
export async function getStationByIdFromDB(id: string): Promise<Station | undefined> {
  const stations = await getStationsFromDB();
  return stations.find((s) => s.id === id);
}

/**
 * Finds route by ensuring DB data is synced and running Dijkstra
 */
export async function findRouteWithDB(
  fromId: string,
  toId: string,
  preference: RoutePreference = "fastest"
): Promise<RouteResult | null> {
  const edges = await getEdgesFromDB();
  const stations = await getStationsFromDB();
  const stationsMap = new Map(stations.map((s) => [s.id, s]));

  buildAdjacencyList(edges, stations);
  return findRoute(fromId, toId, preference, stationsMap);
}
