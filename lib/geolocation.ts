import { STATIONS } from "@/data/stations";
import { Station } from "./types";

/**
 * Calculates great-circle distance between two points in km using Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface NearestStationResult {
  station: Station;
  distanceKm: number;
  walkingMinutes: number;
}

/**
 * Finds the nearest metro station to given GPS coordinates.
 */
export function findNearestStation(
  userLat: number,
  userLng: number
): NearestStationResult {
  let closest = STATIONS[0];
  let minDistance = calculateHaversineDistanceKm(
    userLat,
    userLng,
    closest.lat,
    closest.lng
  );

  for (let i = 1; i < STATIONS.length; i++) {
    const s = STATIONS[i];
    const dist = calculateHaversineDistanceKm(userLat, userLng, s.lat, s.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = s;
    }
  }

  const roundedDistance = Number(minDistance.toFixed(2));
  // Walking speed approx 4.8 km/h -> ~12.5 min/km
  const walkingMinutes = Math.max(1, Math.round(roundedDistance * 12.5));

  return {
    station: closest,
    distanceKm: roundedDistance,
    walkingMinutes,
  };
}
