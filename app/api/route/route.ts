import { getStationById } from "@/data/stations";
import { findRoute } from "@/lib/graph";
import { RoutePreference } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, to, preference = "fastest" } = body;

    if (!from || typeof from !== "string") {
      return NextResponse.json(
        { error: "Origin station ('from') is required and must be a valid station ID slug." },
        { status: 400 }
      );
    }

    if (!to || typeof to !== "string") {
      return NextResponse.json(
        { error: "Destination station ('to') is required and must be a valid station ID slug." },
        { status: 400 }
      );
    }

    const startStation = getStationById(from);
    if (!startStation) {
      return NextResponse.json(
        { error: `Origin station ID '${from}' not found in Namma Metro network.` },
        { status: 400 }
      );
    }

    const endStation = getStationById(to);
    if (!endStation) {
      return NextResponse.json(
        { error: `Destination station ID '${to}' not found in Namma Metro network.` },
        { status: 400 }
      );
    }

    const validPref: RoutePreference =
      preference === "fewest_transfers" ? "fewest_transfers" : "fastest";

    const route = findRoute(from, to, validPref);

    if (!route) {
      return NextResponse.json(
        { error: "Could not find a valid route between the specified stations." },
        { status: 404 }
      );
    }

    return NextResponse.json(route, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const preference = (searchParams.get("preference") as RoutePreference) || "fastest";

  if (!from || !to) {
    return NextResponse.json(
      { error: "Please provide 'from' and 'to' query parameters. Example: /api/route?from=whitefield-kadugodi&to=majestic" },
      { status: 400 }
    );
  }

  const startStation = getStationById(from);
  if (!startStation) {
    return NextResponse.json(
      { error: `Origin station ID '${from}' not found.` },
      { status: 400 }
    );
  }

  const endStation = getStationById(to);
  if (!endStation) {
    return NextResponse.json(
      { error: `Destination station ID '${to}' not found.` },
      { status: 400 }
    );
  }

  const route = findRoute(from, to, preference);
  if (!route) {
    return NextResponse.json(
      { error: "Could not find a valid route between the specified stations." },
      { status: 404 }
    );
  }

  return NextResponse.json(route, { status: 200 });
}
