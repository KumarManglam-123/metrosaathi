import { FareDetails } from "./types";

/**
 * BMRCL Official Station-Based Fare Slab Matrix (as per post-Feb 2025/2026 revision)
 * Fares are strictly determined by the number of stations traveled along the route.
 */
export const FARE_SLABS: Array<{ min: number; max: number; fare: number; label: string }> = [
  { min: 1, max: 2, fare: 10, label: "1–2 stations (₹10)" },
  { min: 3, max: 4, fare: 20, label: "3–4 stations (₹20)" },
  { min: 5, max: 6, fare: 30, label: "5–6 stations (₹30)" },
  { min: 7, max: 8, fare: 40, label: "7–8 stations (₹40)" },
  { min: 9, max: 10, fare: 50, label: "9–10 stations (₹50)" },
  { min: 11, max: 15, fare: 60, label: "11–15 stations (₹60)" },
  { min: 16, max: 20, fare: 70, label: "16–20 stations (₹70)" },
  { min: 21, max: 25, fare: 80, label: "21–25 stations (₹80)" },
  { min: 26, max: 999, fare: 90, label: "26+ stations (₹90)" },
];

/**
 * Calculates BMRCL fare based on the number of stations traveled along the route.
 * @param stationsTraveled Number of stations traversed (stops = total_stations_in_path - 1)
 */
export function calculateFare(stationsTraveled: number): FareDetails {
  if (stationsTraveled <= 0) {
    return {
      tokenFare: 0,
      smartCardPeak: 0,
      smartCardOffPeak: 0,
      qrFare: 0,
      stationsTraveled: 0,
      slabDescription: "Same station",
    };
  }

  const slab =
    FARE_SLABS.find((s) => stationsTraveled >= s.min && stationsTraveled <= s.max) ||
    FARE_SLABS[FARE_SLABS.length - 1];

  const tokenFare = slab.fare;

  // Smart card discounts:
  // 5% off token fare during Peak Hours
  // 10% off token fare during Off-Peak Hours & Sundays
  // QR ticket discount: 5% off token fare
  const smartCardPeak = Math.round(tokenFare * 0.95);
  const smartCardOffPeak = Math.round(tokenFare * 0.90);
  const qrFare = Math.round(tokenFare * 0.95);

  return {
    tokenFare,
    smartCardPeak,
    smartCardOffPeak,
    qrFare,
    stationsTraveled,
    slabDescription: slab.label,
  };
}
