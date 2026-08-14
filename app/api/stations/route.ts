import { METRO_LINES } from "@/data/lines";
import { getStationsFromDB } from "@/lib/db-data";
import { POPULAR_STATIONS, searchStations } from "@/lib/search";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const line = searchParams.get("line");

  let stations = await getStationsFromDB();

  if (query) {
    stations = searchStations(query, 20);
  }

  if (line) {
    stations = stations.filter((s) => s.lines.includes(line as any));
  }

  return NextResponse.json({
    total: stations.length,
    stations,
    popular: POPULAR_STATIONS,
    lines: METRO_LINES,
  });
}
