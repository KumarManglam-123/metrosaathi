# MetroSaathi: Database Architecture & Technical Decisions

This document outlines the database design, schema decisions, and data access strategies used in **MetroSaathi**. It is intended as a technical reference and architectural discussion guide for interview preparation.

---

## 1. Why Migrate from Flat JSON / TS Files to PostgreSQL?

| Criteria | Static Files (`stations.ts`, `edges.ts`) | Relational PostgreSQL (`lines`, `stations`, `edges`, `saved_routes`) |
| :--- | :--- | :--- |
| **Referential Integrity** | No database enforcement. A deleted or misspelled station ID in `edges.ts` leads to silent runtime graph disconnects. | **Foreign Key constraints** (`REFERENCES stations(id) ON DELETE CASCADE`) guarantee network integrity. |
| **Dynamic User State** | Impossible without a persistent write layer. Flat files cannot store per-user data (e.g. saved commutes, custom favorites). | Tables like `saved_routes` link directly to `auth.users(id)` with relational joins and Row-Level Security (RLS). |
| **Query Flexibility** | Filtering requires custom in-memory JavaScript iterations (`Array.filter`). | Declarative SQL queries with indexing, aggregations (`ARRAY_AGG`), and joins executed in the database engine. |
| **Concurrency & ACID** | File writes are race-condition prone and do not support transactional rollback. | Full **ACID transactions** (`BEGIN`, `COMMIT`, `ROLLBACK`) during network expansions and user mutations. |
| **Scalability & Admin** | Updating network routes requires rebuilding and redeploying the application bundle. | Transit operators can insert new Phase 2/3 stations via SQL or admin dashboards with **zero redeployments**. |

---

## 2. Schema Design Decisions

### The Relational Schema
```sql
-- 1. Transit Lines
CREATE TABLE lines (
  id VARCHAR PRIMARY KEY,        -- 'purple', 'green', 'yellow'
  name VARCHAR NOT NULL,
  color_hex VARCHAR NOT NULL
);

-- 2. Physical Metro Stations
CREATE TABLE stations (
  id VARCHAR PRIMARY KEY,        -- slug, e.g. 'mg-road'
  name VARCHAR NOT NULL,
  name_kannada VARCHAR,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  is_interchange BOOLEAN DEFAULT FALSE
);

-- 3. Many-to-Many Junction Table
CREATE TABLE station_lines (
  station_id VARCHAR REFERENCES stations(id) ON DELETE CASCADE,
  line_id VARCHAR REFERENCES lines(id) ON DELETE CASCADE,
  PRIMARY KEY (station_id, line_id)
);

-- 4. Track Edges (Adjacency List)
CREATE TABLE edges (
  id SERIAL PRIMARY KEY,
  from_station VARCHAR REFERENCES stations(id) ON DELETE CASCADE,
  to_station VARCHAR REFERENCES stations(id) ON DELETE CASCADE,
  line_id VARCHAR REFERENCES lines(id) ON DELETE CASCADE,
  distance_km DOUBLE PRECISION NOT NULL
);

-- 5. User Saved Routes
CREATE TABLE saved_routes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  from_station VARCHAR REFERENCES stations(id) ON DELETE CASCADE,
  to_station VARCHAR REFERENCES stations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Key Decision: Junction Table (`station_lines`) vs Array Column (`lines VARCHAR[]`)
In PostgreSQL, storing `lines VARCHAR[]` directly in the `stations` table is syntactically possible, but an explicit **junction table** (`station_lines`) was chosen for several crucial reasons:

1. **Third Normal Form (3NF) & Foreign Key Constraints**:
   - In a junction table, `line_id` has a strict foreign key reference to `lines(id)`. If someone tries to assign an invalid line ID (e.g. `'red'`), Postgres rejects it immediately.
   - Array elements cannot enforce foreign key constraints in Postgres.
2. **Reverse Lookups & Indexing**:
   - Querying *"Find all stations on the Purple Line"* is a standard B-Tree index scan on `station_lines(line_id)`.
   - With an array column, queries require GIN/GiST index lookups (`WHERE lines @> ARRAY['purple']`), which are heavier and less standard across RDBMS engines.
3. **Extensibility**:
   - If we later need to add line-specific station properties (e.g. `platform_number`, `order_index`, `inauguration_date`), we simply add columns to `station_lines` without schema restructuring.

---

## 3. Graph Building: Request-Time vs Cached Layer

### The Tradeoff
Dijkstra's shortest-path algorithm evaluates dozens of candidate paths in priority queues.
- **Option A: Query Postgres per edge hop** -> Recursive SQL CTE or 20+ roundtrips per route search. Network latency across Vercel and Supabase (~15–30ms per query) would cause route calculation to take **500ms–1000ms**.
- **Option B: Pure In-Memory without Database** -> Fast (<1ms), but decoupled from persistent storage.
- **Option C (Our Implementation): Database-Backed In-Memory Graph with Cache TTL**:
  - The application queries PostgreSQL on startup (or on first request) using a single optimized join query:
    ```sql
    SELECT
      s.id,
      s.name,
      s.name_kannada,
      s.lat,
      s.lng,
      s.is_interchange,
      ARRAY_AGG(sl.line_id ORDER BY sl.line_id) as lines
    FROM stations s
    JOIN station_lines sl ON s.id = sl.station_id
    GROUP BY s.id, s.name, s.name_kannada, s.lat, s.lng, s.is_interchange;
    ```
  - The returned nodes and edges populate an in-memory weighted adjacency multi-graph.
  - The cache has a 5-minute TTL and supports programmatic cache invalidation (`forceRefresh = true`).
  - **Result**: Dijkstra pathfinding executes in **0.2 milliseconds**, while remaining 100% synchronized with PostgreSQL.

---

## 4. DB Client Choice: `pg` (node-postgres) vs Prisma

We chose `pg` with connection pooling over Prisma for this application:
1. **Lightweight & Zero Cold-Start Overhead**: `pg` has no heavy engine binaries, making it ideal for Vercel serverless functions.
2. **Transparent SQL**: Queries use explicit parameterized SQL, making query plans, joins, and aggregates crystal clear for interview code reviews.
3. **Transaction Pooler Compatibility**: Configured to work seamlessly with Supabase's transaction pooler (PgBouncer) on port 6543 for IPv4 compatibility and connection scaling.
