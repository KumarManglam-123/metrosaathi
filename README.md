# MetroSaathi — Bangalore Metro (Namma Metro) Route Finder

![MetroSaathi Banner](https://img.shields.io/badge/BMRCL-Namma%20Metro%202026-78288C?style=for-the-badge)
![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

**MetroSaathi** is a production-quality, full-stack transit route finder web application built for commuters in Bengaluru. It accurately maps the entire **Namma Metro (BMRCL)** network across the **Purple**, **Green**, and **Yellow** lines, calculating optimal routes, step-by-step interchange guides, official 2026 station-count fare slabs, travel times, and an interactive schematic visual map.

---

## Key Features

1. **Multi-Line Dijkstra Routing Engine (`lib/graph.ts`)**:
   - Computes the shortest transit path across the network.
   - Built-in **line transfer penalty** (+1.8km eq distance / 3.5 min time penalty) to avoid micro-shortcut transfers.
   - Supports **"Fastest Route"** vs **"Fewest Line Changes"** preference toggles.
   - Decomposes journeys into clear line-by-line `RouteLeg` objects with interchange walking directions.

2. **Official 2026 BMRCL Fare Structure (`lib/fare.ts`)**:
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

3. **Interactive Schematic SVG Transit Map (`components/MetroMapSvg.tsx`)**:
   - Clean 45°/90° schematic diagram of the complete Bangalore Metro network.
   - Dynamic glowing flow animation tracing the active computed route.
   - Zoom, Pan, Reset controls, station hover tooltips, and click-to-select routing endpoints.

4. **Fuzzy Search & Autocomplete (`components/AutocompleteInput.tsx`)**:
   - Instant search across station names, short forms, Kannada script, and common landmarks / aliases (e.g. "ITPL", "Tin Factory", "IKEA", "Majestic").
   - 180° animated swap button.

5. **Nearby Station Detection (Geolocation)**:
   - Uses browser GPS and the Haversine distance formula to find the closest Namma Metro station and walking time estimate.

6. **Recent Searches & Deep Linking**:
   - Stores recent journeys in `localStorage`.
   - Deep-linkable URLs with search parameters (`?from=whitefield-kadugodi&to=electronic-city`).

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
│   │   ├── route/route.ts       # POST & GET /api/route
│   │   └── stations/route.ts    # GET /api/stations
│   ├── globals.css              # Glassmorphism, animations & design system
│   ├── layout.tsx               # Root layout & SEO metadata
│   └── page.tsx                 # Main MetroSaathi dashboard
├── components/
│   ├── AutocompleteInput.tsx    # Dual fuzzy search with GPS
│   ├── FareBreakdownCard.tsx    # BMRCL fare slab comparison table
│   ├── Header.tsx               # Top branding & line status
│   ├── JourneyLegs.tsx          # Step-by-step transit cards
│   ├── MetroMapSvg.tsx          # Interactive visual SVG schematic map
│   ├── NetworkOverview.tsx      # 83-station line directory
│   ├── RecentSearches.tsx       # Local storage history
│   ├── RouteSummary.tsx         # Summary stats strip (Fare, Time, Distance)
│   └── StationBadge.tsx         # Line indicator dots & badges
├── data/
│   ├── edges.ts                 # Adjacency pairs with distanceKm
│   ├── lines.ts                 # Line color hexes & metadata
│   └── stations.ts              # 83 Station entities with coordinates & facilities
├── lib/
│   ├── fare.ts                  # Station-count fare calculator
│   ├── geolocation.ts           # Haversine distance calculator
│   ├── graph.ts                 # Multi-line Dijkstra routing engine
│   ├── search.ts                # Fuzzy matching & popular hubs
│   └── types.ts                 # Strict TypeScript interfaces
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## API Endpoints

### 1. Find Route & Fare
- **Endpoint**: `POST /api/route`
- **Request Body**:
```json
{
  "from": "whitefield-kadugodi",
  "to": "electronic-city",
  "preference": "fastest"
}
```
- **Response**:
```json
{
  "from": { "id": "whitefield-kadugodi", "name": "Whitefield (Kadugodi)", "lines": ["purple"] },
  "to": { "id": "electronic-city", "name": "Electronic City", "lines": ["yellow"] },
  "totalStops": 31,
  "totalDistanceKm": 41.2,
  "totalTimeMinutes": 81,
  "interchangeCount": 2,
  "fare": {
    "tokenFare": 90,
    "smartCardPeak": 86,
    "smartCardOffPeak": 81,
    "qrFare": 86,
    "stationsTraveled": 31,
    "slabDescription": "26+ stations (₹90)"
  },
  "legs": [ ... ]
}
```

### 2. Station List & Metadata
- **Endpoint**: `GET /api/stations`
- Optional query parameters: `?q=majestic` or `?line=purple`

---

## How to Add New Stations or Lines (e.g. Pink / Blue Lines)

1. **Add new line in `data/lines.ts`**:
   Define the line ID, name, and brand color hex code.
2. **Add stations to `data/stations.ts`**:
   Add new `Station` objects with `id`, `name`, `lines`, `lat`, `lng`, and `aliases`.
3. **Add connecting edges in `data/edges.ts`**:
   Add `{ from: "station-a", to: "station-b", line: "pink", distanceKm: 1.2 }`.
4. **Update `components/MetroMapSvg.tsx`**:
   Add schematic `(x, y)` coordinates in `SCHEMATIC_POSITIONS` and station order in `LINE_SEQUENCES`.

---

## Local Development

```bash
# 1. Clone the repository
git clone https://github.com/your-username/metrosaathi.git
cd metrosaathi

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Open in browser
# http://localhost:3000
```

---

## Vercel Deployment (Zero-Config)

MetroSaathi is structured with standard Next.js 14 App Router and API routes. It deploys to Vercel seamlessly:

```bash
# Deploy with Vercel CLI
npx vercel --prod
```

Or connect the repository on [Vercel Dashboard](https://vercel.com) for automatic CI/CD on every push.

---

## License
MIT License. Built for the Bangalore commuting community.
