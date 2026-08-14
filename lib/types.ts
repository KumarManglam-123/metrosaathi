export type MetroLine = "purple" | "green" | "yellow";

export interface StationFacilities {
  parking?: boolean;
  feederBus?: boolean;
  restrooms?: boolean;
  wheelchairAccessible?: boolean;
  drinkingWater?: boolean;
}

export interface Station {
  id: string; // slug, e.g. "mg-road"
  name: string; // display name e.g. "Mahatma Gandhi Road"
  shortName?: string; // e.g. "MG Road"
  kannadaName?: string;
  lines: MetroLine[];
  lat: number;
  lng: number;
  interchange?: boolean;
  terminal?: boolean;
  aliases?: string[];
  layout?: "elevated" | "underground" | "at-grade";
  facilities?: StationFacilities;
}

export interface Edge {
  from: string; // station id
  to: string; // station id
  line: MetroLine;
  distanceKm: number;
  travelTimeSeconds?: number;
}

export interface InterchangeInfo {
  toLine: MetroLine;
  atStation: Station;
  walkingTimeMinutes: number;
  instructions: string;
}

export interface RouteLeg {
  line: MetroLine;
  fromStation: Station;
  toStation: Station;
  stations: Station[]; // Inclusive sequence of stations for this leg
  numStops: number; // stations.length - 1
  distanceKm: number;
  estimatedMinutes: number;
  interchangeAfter?: InterchangeInfo;
}

export interface FareDetails {
  tokenFare: number;
  smartCardPeak: number; // 5% off token fare
  smartCardOffPeak: number; // 10% off token fare
  qrFare: number; // 5% off token fare
  stationsTraveled: number;
  slabDescription: string;
}

export type RoutePreference = "fastest" | "fewest_transfers";

export interface RouteResult {
  from: Station;
  to: Station;
  legs: RouteLeg[];
  allStations: Station[];
  totalStops: number; // number of stations traveled (allStations.length - 1)
  totalDistanceKm: number;
  totalTimeMinutes: number;
  interchangeCount: number;
  fare: FareDetails;
  preferenceUsed: RoutePreference;
}

export interface RouteRequest {
  from: string;
  to: string;
  preference?: RoutePreference;
}
