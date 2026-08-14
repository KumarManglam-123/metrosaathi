import { Pool } from "pg";
import { METRO_LINES } from "../data/lines";
import { STATIONS } from "../data/stations";
import { EDGES } from "../data/edges";
import { MetroLine } from "../lib/types";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.ydvkfwxybyzswokpknim:eXOTdVw64976O96F@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function seed() {
  console.log("=========================================");
  console.log("🌱 MetroSaathi Database Migration & Seed");
  console.log("=========================================");

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();

  try {
    console.log("\n1. Creating database schema tables...");

    await client.query("BEGIN;");

    // Table 1: lines
    await client.query(`
      CREATE TABLE IF NOT EXISTS lines (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        color_hex VARCHAR NOT NULL
      );
    `);

    // Table 2: stations
    await client.query(`
      CREATE TABLE IF NOT EXISTS stations (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        name_kannada VARCHAR,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        is_interchange BOOLEAN DEFAULT FALSE
      );
    `);

    // Table 3: station_lines (many-to-many junction)
    await client.query(`
      CREATE TABLE IF NOT EXISTS station_lines (
        station_id VARCHAR REFERENCES stations(id) ON DELETE CASCADE,
        line_id VARCHAR REFERENCES lines(id) ON DELETE CASCADE,
        PRIMARY KEY (station_id, line_id)
      );
    `);

    // Table 4: edges (adjacency segments)
    await client.query(`
      CREATE TABLE IF NOT EXISTS edges (
        id SERIAL PRIMARY KEY,
        from_station VARCHAR REFERENCES stations(id) ON DELETE CASCADE,
        to_station VARCHAR REFERENCES stations(id) ON DELETE CASCADE,
        line_id VARCHAR REFERENCES lines(id) ON DELETE CASCADE,
        distance_km DOUBLE PRECISION NOT NULL
      );
    `);

    // Table 5: saved_routes
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_routes (
        id SERIAL PRIMARY KEY,
        user_id UUID,
        from_station VARCHAR REFERENCES stations(id) ON DELETE CASCADE,
        to_station VARCHAR REFERENCES stations(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // Indexes for fast lookup
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_edges_from ON edges(from_station);
      CREATE INDEX IF NOT EXISTS idx_edges_to ON edges(to_station);
      CREATE INDEX IF NOT EXISTS idx_station_lines_line ON station_lines(line_id);
      CREATE INDEX IF NOT EXISTS idx_saved_routes_user ON saved_routes(user_id);
    `);

    await client.query("COMMIT;");
    console.log(" Schema tables created successfully.");

    // 2. Insert lines
    console.log("\n2. Seeding lines table...");
    for (const lineKey of Object.keys(METRO_LINES) as MetroLine[]) {
      const meta = METRO_LINES[lineKey];
      await client.query(
        `
        INSERT INTO lines (id, name, color_hex)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          color_hex = EXCLUDED.color_hex;
        `,
        [meta.id, meta.name, meta.colorHex]
      );
    }
    console.log(` Inserted ${Object.keys(METRO_LINES).length} lines.`);

    // 3. Insert stations & station_lines
    console.log("\n3. Seeding stations and station_lines tables...");
    let stationLinesCount = 0;
    for (const s of STATIONS) {
      await client.query(
        `
        INSERT INTO stations (id, name, name_kannada, lat, lng, is_interchange)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          name_kannada = EXCLUDED.name_kannada,
          lat = EXCLUDED.lat,
          lng = EXCLUDED.lng,
          is_interchange = EXCLUDED.is_interchange;
        `,
        [s.id, s.name, s.kannadaName || null, s.lat, s.lng, !!s.interchange]
      );

      for (const line of s.lines) {
        await client.query(
          `
          INSERT INTO station_lines (station_id, line_id)
          VALUES ($1, $2)
          ON CONFLICT (station_id, line_id) DO NOTHING;
          `,
          [s.id, line]
        );
        stationLinesCount++;
      }
    }
    console.log(` Inserted ${STATIONS.length} stations and ${stationLinesCount} station_lines records.`);

    // 4. Insert edges
    console.log("\n4. Seeding edges table...");
    // Clear edges to avoid duplicates on re-seed
    await client.query("DELETE FROM edges;");
    for (const e of EDGES) {
      await client.query(
        `
        INSERT INTO edges (from_station, to_station, line_id, distance_km)
        VALUES ($1, $2, $3, $4);
        `,
        [e.from, e.to, e.line, e.distanceKm]
      );
    }
    console.log(` Inserted ${EDGES.length} edges.`);

    // 5. Verification Queries
    console.log("\n5. Verifying database record counts:");
    const linesRes = await client.query("SELECT COUNT(*) FROM lines;");
    const stationsRes = await client.query("SELECT COUNT(*) FROM stations;");
    const stationLinesRes = await client.query("SELECT COUNT(*) FROM station_lines;");
    const edgesRes = await client.query("SELECT COUNT(*) FROM edges;");
    const interchangesRes = await client.query("SELECT COUNT(*) FROM stations WHERE is_interchange = true;");

    console.log(`- lines count: ${linesRes.rows[0].count} (Expected: 3)`);
    console.log(`- stations count: ${stationsRes.rows[0].count} (Expected: 83)`);
    console.log(`- station_lines count: ${stationLinesRes.rows[0].count} (Expected: 85)`);
    console.log(`- edges count: ${edgesRes.rows[0].count} (Expected: 82)`);
    console.log(`- interchange stations count: ${interchangesRes.rows[0].count} (Expected: 2)`);

    console.log("\n=========================================");
    console.log(" Migration & Seed Completed Successfully!");
    console.log("=========================================");
  } catch (err: any) {
    await client.query("ROLLBACK;");
    console.error("❌ Seed failed with error:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
