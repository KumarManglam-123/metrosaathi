import { STATIONS } from "@/data/stations";
import { Station } from "./types";

/**
 * Normalizes text for clean fuzzy comparison (lowercase, trims punctuation and whitespace)
 */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Searches stations by name, shortName, aliases, Kannada name, or line.
 */
export function searchStations(query: string, limit = 8): Station[] {
  const q = normalize(query);
  if (!q) {
    return STATIONS.slice(0, limit);
  }

  const resultsWithScore = STATIONS.map((station) => {
    let score = 0;
    const nameNorm = normalize(station.name);
    const shortNorm = station.shortName ? normalize(station.shortName) : "";
    const kannadaNorm = station.kannadaName ? normalize(station.kannadaName) : "";
    const aliasesNorm = (station.aliases || []).map((a) => normalize(a));

    // Exact matches get top priority
    if (nameNorm === q || shortNorm === q) {
      score += 100;
    } else if (aliasesNorm.some((a) => a === q)) {
      score += 90;
    }
    // Prefix match
    else if (nameNorm.startsWith(q) || shortNorm.startsWith(q)) {
      score += 80;
    } else if (aliasesNorm.some((a) => a.startsWith(q))) {
      score += 70;
    }
    // Substring match
    else if (nameNorm.includes(q) || shortNorm.includes(q)) {
      score += 60;
    } else if (aliasesNorm.some((a) => a.includes(q))) {
      score += 50;
    } else if (kannadaNorm.includes(q)) {
      score += 45;
    }
    // Token word matching
    else {
      const qWords = q.split(" ");
      const allText = `${nameNorm} ${shortNorm} ${aliasesNorm.join(" ")}`;
      const allWordsMatch = qWords.every((word) => allText.includes(word));
      if (allWordsMatch) {
        score += 40;
      }
    }

    // Boost interchange stations slightly for visibility
    if (score > 0 && station.interchange) {
      score += 5;
    }

    return { station, score };
  });

  return resultsWithScore
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.station);
}

/**
 * Popular hub stations for quick 1-click selection chips
 */
export const POPULAR_STATIONS: Array<{ id: string; label: string }> = [
  { id: "majestic", label: "Majestic" },
  { id: "mg-road", label: "MG Road" },
  { id: "indiranagar", label: "Indiranagar" },
  { id: "whitefield-kadugodi", label: "Whitefield" },
  { id: "electronic-city", label: "Electronic City" },
  { id: "rv-road", label: "RV Road" },
  { id: "central-silk-board", label: "Silk Board" },
  { id: "nagasandra", label: "Nagasandra (IKEA)" },
];
