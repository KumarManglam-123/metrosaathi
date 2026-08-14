import { Pool, QueryResult, QueryResultRow } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.ydvkfwxybyzswokpknim:eXOTdVw64976O96F@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

// Global pool instance to prevent connection exhaustion in serverless / hot-reloading dev environments
declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

const pool =
  global._pgPool ||
  new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10, // Maximum pool connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool;
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === "development") {
    // Log slow queries (>100ms) or debug in development
    if (duration > 100) {
      console.log(`[DB Query - ${duration}ms]:`, text);
    }
  }
  return res;
}

export default pool;
