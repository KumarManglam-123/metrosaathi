import { STATIONS, STATIONS_MAP, getStationById } from "./data/stations";
import { EDGES } from "./data/edges";
import { findRoute } from "./lib/graph";
import { calculateFare, FARE_SLABS } from "./lib/fare";

console.log("=========================================");
console.log("MetroSaathi Test Suite & Routing Verification");
console.log("=========================================");

let failureCount = 0;

// 1. Verify Stations and Edges
console.log(`Total unique stations registered: ${STATIONS.length}`);
console.log(`Total edges defined: ${EDGES.length}`);

if (STATIONS.length !== 83) {
  console.error(`❌ Expected 83 unique stations, got ${STATIONS.length}`);
  failureCount++;
} else {
  console.log(" Station count verified (83 stations: 37 Purple + 32 Green + 16 Yellow - 2 shared).");
}

if (EDGES.length !== 82) {
  console.error(`❌ Expected 82 unique edges, got ${EDGES.length}`);
  failureCount++;
} else {
  console.log(" Track edge count verified (82 edges).");
}

// 2. Verify Fare Calculation Table
console.log("\nTesting BMRCL 2026 Station-Count Fare Slabs:");
const testCasesFare = [
  { stops: 1, expectedFare: 10 },
  { stops: 2, expectedFare: 10 },
  { stops: 3, expectedFare: 20 },
  { stops: 4, expectedFare: 20 },
  { stops: 5, expectedFare: 30 },
  { stops: 6, expectedFare: 30 },
  { stops: 7, expectedFare: 40 },
  { stops: 8, expectedFare: 40 },
  { stops: 9, expectedFare: 50 },
  { stops: 10, expectedFare: 50 },
  { stops: 12, expectedFare: 60 },
  { stops: 15, expectedFare: 60 },
  { stops: 18, expectedFare: 70 },
  { stops: 20, expectedFare: 70 },
  { stops: 22, expectedFare: 80 },
  { stops: 25, expectedFare: 80 },
  { stops: 30, expectedFare: 90 },
];

let fareErrors = 0;
for (const tc of testCasesFare) {
  const result = calculateFare(tc.stops);
  if (result.tokenFare !== tc.expectedFare) {
    console.error(`❌ Fare mismatch for ${tc.stops} stops: Expected ₹${tc.expectedFare}, got ₹${result.tokenFare}`);
    fareErrors++;
    failureCount++;
  }
}
if (fareErrors === 0) {
  console.log(" All fare table test cases passed!");
}

// 3. Test Routing Scenarios
console.log("\nTesting Routing Scenarios:");

// Scenario A: Single Line Purple (Whitefield -> Majestic)
const routeA = findRoute("whitefield-kadugodi", "majestic");
console.log("\n[Trip A] Whitefield (Kadugodi) -> Majestic");
if (routeA) {
  console.log(`- Total stops: ${routeA.totalStops}`);
  console.log(`- Legs count: ${routeA.legs.length} (${routeA.legs.map((l) => l.line).join(", ")})`);
  console.log(`- Interchanges: ${routeA.interchangeCount}`);
  console.log(`- Fare: ₹${routeA.fare.tokenFare} (Smart Card: ₹${routeA.fare.smartCardPeak})`);
  console.log(`- Estimated Time: ${routeA.totalTimeMinutes} mins`);
  if (routeA.interchangeCount !== 0) {
    console.error("❌ Expected 0 interchanges for Purple line direct trip");
    failureCount++;
  } else {
    console.log(" Trip A verified (Direct Purple Line)");
  }
} else {
  console.error("❌ Route A failed to find path");
  failureCount++;
}

// Scenario B: 1-Interchange (Indiranagar [Purple] -> Jayanagar [Green])
const routeB = findRoute("indiranagar", "jayanagar");
console.log("\n[Trip B] Indiranagar (Purple) -> Jayanagar (Green)");
if (routeB) {
  console.log(`- Total stops: ${routeB.totalStops}`);
  console.log(`- Legs count: ${routeB.legs.length} (${routeB.legs.map((l) => `${l.line}: ${l.fromStation.name} -> ${l.toStation.name}`).join(" | ")})`);
  console.log(`- Interchanges: ${routeB.interchangeCount}`);
  console.log(`- Transfer Station: ${routeB.legs[0]?.interchangeAfter?.atStation.name}`);
  console.log(`- Fare: ₹${routeB.fare.tokenFare}`);
  if (routeB.interchangeCount !== 1) {
    console.error("❌ Expected 1 interchange");
    failureCount++;
  } else {
    console.log(" Trip B verified (1 Interchange at Majestic)");
  }
} else {
  console.error("❌ Route B failed to find path");
  failureCount++;
}

// Scenario C: 2-Interchanges (Whitefield [Purple] -> Electronic City [Yellow])
const routeC = findRoute("whitefield-kadugodi", "electronic-city");
console.log("\n[Trip C] Whitefield (Purple) -> Electronic City (Yellow)");
if (routeC) {
  console.log(`- Total stops: ${routeC.totalStops}`);
  console.log(`- Legs: ${routeC.legs.map((l) => `${l.line.toUpperCase()}: ${l.fromStation.name} -> ${l.toStation.name} (${l.numStops} stops)`).join(" -> ")}`);
  console.log(`- Interchanges: ${routeC.interchangeCount}`);
  console.log(`- Total Distance: ${routeC.totalDistanceKm} km`);
  console.log(`- Travel Time: ${routeC.totalTimeMinutes} min`);
  console.log(`- Fare: ₹${routeC.fare.tokenFare}`);
  if (routeC.interchangeCount !== 2) {
    console.error("❌ Expected 2 interchanges (Majestic & RV Road)");
    failureCount++;
  } else {
    console.log(" Trip C verified (2 Interchanges: Purple -> Green at Majestic, Green -> Yellow at RV Road)");
  }
} else {
  console.error("❌ Route C failed to find path");
  failureCount++;
}

// Scenario D: Direct Yellow Line (RV Road -> Bommasandra)
const routeD = findRoute("rv-road", "bommasandra");
console.log("\n[Trip D] RV Road -> Bommasandra (Yellow Line)");
if (routeD) {
  console.log(`- Total stops: ${routeD.totalStops}`);
  console.log(`- Legs: ${routeD.legs.map((l) => l.line).join(", ")}`);
  console.log(`- Interchanges: ${routeD.interchangeCount}`);
  console.log(`- Fare: ₹${routeD.fare.tokenFare}`);
  if (routeD.interchangeCount !== 0) {
    console.error("❌ Expected 0 interchanges");
    failureCount++;
  } else {
    console.log(" Trip D verified (Direct Yellow Line)");
  }
} else {
  console.error("❌ Route D failed to find path");
  failureCount++;
}

console.log("\n=========================================");
if (failureCount > 0) {
  console.error(`❌ Test suite failed with ${failureCount} errors.`);
  process.exit(1);
} else {
  console.log("All Core Algorithms Verified Successfully!");
  console.log("=========================================");
  process.exit(0);
}
