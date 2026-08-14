import { query } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// Helper to extract authenticated user from Supabase Bearer token
async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return null;
  }
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to view your saved routes." },
        { status: 401 }
      );
    }

    const res = await query(
      `
      SELECT
        sr.id,
        sr.user_id as "userId",
        sr.from_station as "fromStationId",
        s_from.name as "fromStationName",
        s_from.name_kannada as "fromStationKannada",
        sr.to_station as "toStationId",
        s_to.name as "toStationName",
        s_to.name_kannada as "toStationKannada",
        sr.created_at as "createdAt"
      FROM saved_routes sr
      JOIN stations s_from ON sr.from_station = s_from.id
      JOIN stations s_to ON sr.to_station = s_to.id
      WHERE sr.user_id = $1
      ORDER BY sr.created_at DESC;
      `,
      [user.id]
    );

    return NextResponse.json({ savedRoutes: res.rows }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to save routes." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { from_station, to_station } = body;

    if (!from_station || !to_station) {
      return NextResponse.json(
        { error: "Both 'from_station' and 'to_station' are required." },
        { status: 400 }
      );
    }

    // Insert new saved route
    const res = await query(
      `
      INSERT INTO saved_routes (user_id, from_station, to_station)
      VALUES ($1, $2, $3)
      RETURNING id, user_id as "userId", from_station as "fromStationId", to_station as "toStationId", created_at as "createdAt";
      `,
      [user.id, from_station, to_station]
    );

    return NextResponse.json(
      { message: "Route saved successfully", savedRoute: res.rows[0] },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to delete saved routes." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    if (!idParam) {
      return NextResponse.json(
        { error: "Missing 'id' query parameter to delete." },
        { status: 400 }
      );
    }

    const routeId = parseInt(idParam, 10);
    const res = await query(
      `
      DELETE FROM saved_routes
      WHERE id = $1 AND user_id = $2
      RETURNING id;
      `,
      [routeId, user.id]
    );

    if (res.rowCount === 0) {
      return NextResponse.json(
        { error: "Saved route not found or not owned by user." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Saved route deleted successfully", id: routeId },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
