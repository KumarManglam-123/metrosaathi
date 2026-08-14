import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.ydvkfwxybyzswokpknim:eXOTdVw64976O96F@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function testConnection() {
  console.log("Testing PostgreSQL connection to Supabase...");
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    const res = await client.query("SELECT NOW() as now, version() as version;");
    console.log("✅ Successfully connected to Supabase PostgreSQL!");
    console.log("Current DB Time:", res.rows[0].now);
    console.log("Postgres Version:", res.rows[0].version);
    client.release();
    await pool.end();
  } catch (err: any) {
    console.error("❌ Database connection error:", err.message);
    if (err.code === "28P01" || err.message?.includes("password authentication failed")) {
      console.error("CRITICAL: Password authentication failed! Please check credentials.");
    }
    process.exit(1);
  }
}

testConnection();
