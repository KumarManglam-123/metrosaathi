# MetroSaathi — Bangalore Metro (Namma Metro) Route Finder

![MetroSaathi Banner](https://img.shields.io/badge/BMRCL-Namma%20Metro%202026-78288C?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17.6%20Supabase-336791?style=for-the-badge&logo=postgresql)
![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

**MetroSaathi** is a production-quality, full-stack transit route finder web application built for commuters in Bengaluru. It accurately maps the entire **Namma Metro (BMRCL)** network across the **Purple**, **Green**, and **Yellow** lines, calculating optimal routes, step-by-step interchange guides, official 2026 station-count fare slabs, travel times, saved commuter routes, and an interactive schematic visual map powered by a relational **PostgreSQL (Supabase)** database.

> 📖 **Interview Guide & Architecture**: For an in-depth breakdown of schema normalization, join tables vs array columns, and graph caching tradeoffs, check out [**`DATABASE.md`**](./DATABASE.md).

---

## Key Features

1. **Relational PostgreSQL Data Layer & Supabase Auth**:
   - Normalized relational schema (`lines`, `stations`, `station_lines`, `edges`, `saved_routes`).
   - Many-to-many junction tables (`station_lines`) enforcing strict foreign key referential integrity.
   - User authentication via Supabase Auth with ability to save and sync favorite routes across devices.

2. **Multi-Line Dijkstra Routing Engine (`lib/graph.ts`)**:
   - Computes the shortest transit path across the network.
   - Built-in **line transfer penalty** (+1.8km eq distance / 3.5 min time penalty) to avoid micro-shortcut transfers.
   - Supports **"Fastest Route"** vs **"Fewest Line Changes"** preference toggles.
   - Decomposes journeys into clear line-by-line `RouteLeg` objects with interchange walking directions.

3. **Official 2026 BMRCL Fare Structure (`lib/fare.ts`)**:
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

4. **Interactive Schematic SVG Transit Map (`components/MetroMapSvg.tsx`)**:
   - Clean 45°/90° schematic diagram of the complete Bangalore Metro network.
   - Dynamic glowing flow animation tracing the active computed route.
   - Zoom, Pan, Reset controls, station hover tooltips, and click-to-select routing endpoints.

5. **Fuzzy Search & Autocomplete (`components/AutocompleteInput.tsx`)**:
   - Instant search across station names, short forms, Kannada script, and common landmarks / aliases (e.g. "ITPL", "Tin Factory", "IKEA", "Majestic").
   - 180° animated swap button.

6. **Nearby Station Detection (Geolocation)**:
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

## Project Structure

```
metrosaathi/
├── app/
│   ├── api/
│   │   ├── route/route.ts          # POST & GET /api/route (DB-backed)
│   │   ├── stations/route.ts       # GET /api/stations (DB-backed)
│   │   └── saved-routes/route.ts   # GET, POST, DELETE /api/saved-routes
│   ├── globals.css                 # Glassmorphism, animations & design system
│   ├── layout.tsx                  # Root layout & SEO metadata
│   └── page.tsx                    # Main MetroSaathi dashboard with Auth & Saved Routes
├── components/
│   ├── AuthModal.tsx               # Supabase sign in / sign up modal
│   ├── AutocompleteInput.tsx       # Dual fuzzy search with GPS
│   ├── FareBreakdownCard.tsx       # BMRCL fare slab comparison table
│   ├── Header.tsx                  # Top branding, line status & Auth buttons
│   ├── JourneyLegs.tsx             # Step-by-step transit cards
│   ├── MetroMapSvg.tsx             # Interactive visual SVG schematic map
│   ├── NetworkOverview.tsx         # 83-station line directory
│   ├── RecentSearches.tsx          # Local storage history
│   ├── RouteSummary.tsx            # Summary stats strip (Fare, Time, Distance)
│   ├── SavedRoutesCard.tsx         # User saved commutes card
│   └── StationBadge.tsx            # Line indicator dots & badges
├── data/                           # Archived static dataset (for before vs after demo)
│   ├── edges.ts
│   ├── lines.ts
│   └── stations.ts
├── lib/
│   ├── db.ts                       # node-postgres Pool configuration
│   ├── db-data.ts                  # PostgreSQL query & caching layer
│   ├── fare.ts                     # Station-count fare calculator
│   ├── geolocation.ts              # Haversine distance calculator
│   ├── graph.ts                    # DB-backed Dijkstra routing engine
│   ├── search.ts                   # Fuzzy matching & popular hubs
│   ├── supabase.ts                 # Supabase Auth client
│   └── types.ts                    # Strict TypeScript interfaces
├── scripts/
│   └── seed.ts                     # Database DDL & migration script
├── DATABASE.md                     # Technical architecture & interview guide
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Database Migration & Seeding

Run the seed script to create all tables and populate data into PostgreSQL:

```bash
npx tsx scripts/seed.ts
```

---

## Local Development

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
