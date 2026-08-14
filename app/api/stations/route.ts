import { METRO_LINES } from "@/data/lines";
import { STATIONS } from "@/data/stations";
import { POPULAR_STATIONS, searchStations } from "@/lib/search";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const line = searchParams.get("line");

  let result = STATIONS;

  if (query) {
    result = searchStations(query, 20);
  }

  if (line) {
    result = result.filter((s) => s.lines.includes(line as any));
  }

  return NextResponse.json({
    total: result.length,
    stations: result,
    popular: POPULAR_STATIONS,
    lines: METRO_LINES,
  });
}
