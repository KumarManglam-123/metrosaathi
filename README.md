# MetroSaathi — Bangalore Metro (Namma Metro) Route Finder

![MetroSaathi Banner](https://img.shields.io/badge/BMRCL-Namma%20Metro%202026-78288C?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Multi--Stage%20Alpine-2496ED?style=for-the-badge&logo=docker)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17.6%20Supabase-336791?style=for-the-badge&logo=postgresql)
![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

**MetroSaathi** is a production-quality, full-stack transit route finder web application built for commuters in Bengaluru. It accurately maps the entire **Namma Metro (BMRCL)** network across the **Purple**, **Green**, and **Yellow** lines, calculating optimal routes, step-by-step interchange guides, official 2026 station-count fare slabs, travel times, saved commuter routes, and an interactive schematic visual map.

> 📖 **Interview & Technical Guides**:
> - [**`DOCKER.md`**](./DOCKER.md): Multi-stage builds, non-root security (`nextjs:nodejs`), Next.js standalone tracing, and local vs hosted database isolation.
> - [**`DATABASE.md`**](./DATABASE.md): Relational schema design, 3NF junction tables vs array columns, and graph caching tradeoffs.

---

## Key Features

1. **Docker Containerization (`Dockerfile`, `docker-compose.yml`)**:
   - Multi-stage build producing an ultra-slim (~150MB) container based on `node:20-alpine`.
   - Runs as an unprivileged non-root user (`nextjs:nodejs`, UID 1001) for container security.
   - `docker-compose.yml` spins up the Next.js app alongside an isolated local PostgreSQL 17 database.

2. **Relational PostgreSQL Data Layer & Supabase Auth**:
   - Normalized relational schema (`lines`, `stations`, `station_lines`, `edges`, `saved_routes`).
   - Many-to-many junction tables (`station_lines`) enforcing strict foreign key referential integrity.
   - User authentication via Supabase Auth with ability to save and sync favorite routes across devices.

3. **Multi-Line Dijkstra Routing Engine (`lib/graph.ts`)**:
   - Computes the shortest transit path across the network.
   - Built-in **line transfer penalty** (+1.8km eq distance / 3.5 min time penalty) to avoid micro-shortcut transfers.
   - Supports **"Fastest Route"** vs **"Fewest Line Changes"** preference toggles.
   - Decomposes journeys into clear line-by-line `RouteLeg` objects with interchange walking directions.

4. **Official 2026 BMRCL Fare Structure (`lib/fare.ts`)**:
   - Calculated strictly based on the number of stations traveled:
     - 1–2 stations: ₹10
     - 3–4 stations: ₹20
     - 5–6 stations: ₹30
     - 7–8 stations: ₹40
     - 9–10 stations: ₹50
     - 11–15 stations: ₹60
     - 16–20 stations: ₹70
     - 21–25 stations: ₹80
     - 26+ stations: ₹90
   - Smart Card / NCMC discount calculation (5% peak, 10% off-peak & Sundays) and WhatsApp QR ticketing (5% off).

5. **Interactive Schematic SVG Transit Map (`components/MetroMapSvg.tsx`)**:
   - Clean 45°/90° schematic diagram of the complete Bangalore Metro network.
   - Dynamic glowing flow animation tracing the active computed route.
   - Zoom, Pan, Reset controls, station hover tooltips, and click-to-select routing endpoints.

6. **Fuzzy Search & Autocomplete (`components/AutocompleteInput.tsx`)**:
   - Instant search across station names, short forms, Kannada script, and common landmarks / aliases (e.g. "ITPL", "Tin Factory", "IKEA", "Majestic").
   - 180° animated swap button.

7. **Nearby Station Detection (Geolocation)**:
   - Uses browser GPS and the Haversine distance formula to find the closest Namma Metro station and walking time estimate.

---

## Network Coverage (83 Stations)

| Line | Terminals | Total Stations | Authentic Color |
| :--- | :--- | :--- | :--- |
| **Purple Line** | Challaghatta ↔ Whitefield (Kadugodi) | 37 Stations | `#78288C` |
| **Green Line** | Madavara (BIEC) ↔ Silk Institute | 32 Stations | `#008A3B` |
| **Yellow Line** | RV Road ↔ Bommasandra (Electronic City) | 16 Stations | `#F5A623` |

### Key Interchange Junctions
- **Nadaprabhu Kempegowda Station, Majestic**: Purple Line ↔ Green Line
- **Rashtreeya Vidyalaya Road (RV Road)**: Green Line ↔ Yellow Line

---

## 🐳 Run with Docker (One Command)

You can run MetroSaathi in a fully containerized environment with **zero manual Node.js or PostgreSQL installations**:

```bash
docker compose up --build
```

### What this does:
1. Builds the **MetroSaathi Next.js standalone container** on port `3000`.
2. Starts an isolated **PostgreSQL 17 container** on port `5432` and automatically runs `scripts/init.sql` on first boot to seed all 83 stations and 82 edges.
3. Automatically connects the web application to the local container database without touching production Supabase data.

Open your browser at **`http://localhost:3000`**.

To stop the containers:
```bash
docker compose down
```

---

## Local Development (Without Docker)

```bash
# 1. Install dependencies
npm install

# 2. Configure .env.local (DATABASE_URL, SUPABASE credentials)

# 3. Start local development server
npm run dev

# 4. Open in browser
# http://localhost:3000
```

---

## License
MIT License. Built for the Bangalore commuting community.
