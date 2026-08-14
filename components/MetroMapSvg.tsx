"use client";

import { METRO_LINES } from "@/data/lines";
import { STATIONS, STATIONS_MAP } from "@/data/stations";
import { MetroLine, RouteResult, Station } from "@/lib/types";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  MapPin,
  Sparkles,
  Layers,
  Train,
} from "lucide-react";
import React, { useMemo, useState } from "react";

// Schematic coordinates for all 83 stations
export const SCHEMATIC_POSITIONS: Record<string, { x: number; y: number }> = {
  // Purple Line
  challaghatta: { x: 80, y: 680 },
  kengeri: { x: 110, y: 660 },
  "kengeri-bus-terminal": { x: 140, y: 640 },
  pattanagere: { x: 170, y: 620 },
  jnanabharathi: { x: 200, y: 600 },
  "rajarajeshwari-nagar": { x: 230, y: 580 },
  nayandahalli: { x: 260, y: 560 },
  "mysuru-road": { x: 290, y: 540 },
  "deepanjali-nagar": { x: 320, y: 520 },
  attiguppe: { x: 350, y: 500 },
  vijayanagar: { x: 380, y: 485 },
  hosahalli: { x: 415, y: 475 },
  "magadi-road": { x: 450, y: 465 },
  "ksr-bengaluru": { x: 485, y: 460 },
  majestic: { x: 530, y: 460 }, // Intersection Purple & Green
  "sir-m-visvesvaraya": { x: 575, y: 460 },
  "dr-br-ambedkar-vidhana-soudha": { x: 615, y: 460 },
  "cubbon-park": { x: 655, y: 460 },
  "mg-road": { x: 695, y: 460 },
  trinity: { x: 735, y: 460 },
  halasuru: { x: 775, y: 460 },
  indiranagar: { x: 815, y: 460 },
  "swami-vivekananda-road": { x: 855, y: 460 },
  baiyappanahalli: { x: 895, y: 460 },
  benniganahalli: { x: 935, y: 460 },
  "kr-pura": { x: 975, y: 460 },
  singayyanapalya: { x: 1015, y: 460 },
  garudacharpalya: { x: 1055, y: 460 },
  hoodi: { x: 1095, y: 460 },
  seetharampalya: { x: 1135, y: 460 },
  kundalahalli: { x: 1175, y: 460 },
  nallurhalli: { x: 1215, y: 460 },
  "sri-sathya-sai-hospital": { x: 1255, y: 460 },
  "pattandur-agrahara": { x: 1295, y: 460 },
  "kadugodi-tree-park": { x: 1335, y: 460 },
  "hopefarm-channasandra": { x: 1375, y: 460 },
  "whitefield-kadugodi": { x: 1415, y: 460 },

  // Green Line (North)
  madavara: { x: 230, y: 80 },
  chikkabidarakallu: { x: 250, y: 105 },
  manjunathnagar: { x: 270, y: 130 },
  nagasandra: { x: 290, y: 155 },
  dasarahalli: { x: 310, y: 180 },
  jalahalli: { x: 330, y: 205 },
  "peenya-industry": { x: 350, y: 230 },
  peenya: { x: 370, y: 255 },
  goraguntepalya: { x: 395, y: 280 },
  yeshwanthpur: { x: 420, y: 305 },
  "sandal-soap-factory": { x: 445, y: 330 },
  mahalakshmi: { x: 470, y: 355 },
  rajajinagar: { x: 490, y: 380 },
  "mahakavi-kuvempu-road": { x: 505, y: 405 },
  srirampura: { x: 518, y: 425 },
  "mantri-square-sampige-road": { x: 526, y: 442 },

  // Green Line (South)
  chickpete: { x: 530, y: 495 },
  "krishna-rajendra-market": { x: 530, y: 530 },
  "national-college": { x: 530, y: 565 },
  lalbagh: { x: 530, y: 600 },
  "south-end-circle": { x: 530, y: 635 },
  jayanagar: { x: 530, y: 670 },
  "rv-road": { x: 530, y: 710 }, // Intersection Green & Yellow
  banashankari: { x: 530, y: 750 },
  "jaya-prakash-nagar": { x: 530, y: 785 },
  yelachenahalli: { x: 530, y: 820 },
  "konanakunte-cross": { x: 505, y: 855 },
  doddakallasandra: { x: 480, y: 885 },
  vajrahalli: { x: 455, y: 915 },
  thalaghattapura: { x: 430, y: 945 },
  "silk-institute": { x: 405, y: 975 },

  // Yellow Line (RV Road -> Bommasandra)
  ragigudda: { x: 575, y: 725 },
  "jayadeva-hospital": { x: 620, y: 740 },
  "btm-layout": { x: 665, y: 755 },
  "central-silk-board": { x: 715, y: 775 },
  bommanahalli: { x: 760, y: 795 },
  hongasandra: { x: 800, y: 815 },
  "kudlu-gate": { x: 840, y: 835 },
  singasandra: { x: 880, y: 855 },
  "hosa-road": { x: 920, y: 875 },
  "beratena-agrahara": { x: 960, y: 895 },
  "electronic-city": { x: 1005, y: 915 },
  "infosys-foundation-konappana-agrahara": { x: 1050, y: 935 },
  "huskur-road": { x: 1095, y: 955 },
  hebbagodi: { x: 1140, y: 975 },
  bommasandra: { x: 1185, y: 995 },
};

// Continuous polyline sequences per line
const LINE_SEQUENCES: Record<MetroLine, string[]> = {
  purple: [
    "challaghatta",
    "kengeri",
    "kengeri-bus-terminal",
    "pattanagere",
    "jnanabharathi",
    "rajarajeshwari-nagar",
    "nayandahalli",
    "mysuru-road",
    "deepanjali-nagar",
    "attiguppe",
    "vijayanagar",
    "hosahalli",
    "magadi-road",
    "ksr-bengaluru",
    "majestic",
    "sir-m-visvesvaraya",
    "dr-br-ambedkar-vidhana-soudha",
    "cubbon-park",
    "mg-road",
    "trinity",
    "halasuru",
    "indiranagar",
    "swami-vivekananda-road",
    "baiyappanahalli",
    "benniganahalli",
    "kr-pura",
    "singayyanapalya",
    "garudacharpalya",
    "hoodi",
    "seetharampalya",
    "kundalahalli",
    "nallurhalli",
    "sri-sathya-sai-hospital",
    "pattandur-agrahara",
    "kadugodi-tree-park",
    "hopefarm-channasandra",
    "whitefield-kadugodi",
  ],
  green: [
    "madavara",
    "chikkabidarakallu",
    "manjunathnagar",
    "nagasandra",
    "dasarahalli",
    "jalahalli",
    "peenya-industry",
    "peenya",
    "goraguntepalya",
    "yeshwanthpur",
    "sandal-soap-factory",
    "mahalakshmi",
    "rajajinagar",
    "mahakavi-kuvempu-road",
    "srirampura",
    "mantri-square-sampige-road",
    "majestic",
    "chickpete",
    "krishna-rajendra-market",
    "national-college",
    "lalbagh",
    "south-end-circle",
    "jayanagar",
    "rv-road",
    "banashankari",
    "jaya-prakash-nagar",
    "yelachenahalli",
    "konanakunte-cross",
    "doddakallasandra",
    "vajrahalli",
    "thalaghattapura",
    "silk-institute",
  ],
  yellow: [
    "rv-road",
    "ragigudda",
    "jayadeva-hospital",
    "btm-layout",
    "central-silk-board",
    "bommanahalli",
    "hongasandra",
    "kudlu-gate",
    "singasandra",
    "hosa-road",
    "beratena-agrahara",
    "electronic-city",
    "infosys-foundation-konappana-agrahara",
    "huskur-road",
    "hebbagodi",
    "bommasandra",
  ],
};

interface MetroMapSvgProps {
  route: RouteResult | null;
  onSelectStation?: (station: Station, role: "from" | "to") => void;
}

export function MetroMapSvg({ route, onSelectStation }: MetroMapSvgProps) {
  const [zoom, setZoom] = useState(1);
  const [hoveredStation, setHoveredStation] = useState<Station | null>(null);
  const [selectedLineFilter, setSelectedLineFilter] = useState<MetroLine | "all">("all");

  const activeStationIds = useMemo(() => {
    if (!route || !route.allStations) return new Set<string>();
    return new Set(route.allStations.map((s) => s.id));
  }, [route]);

  const originId = route?.from.id;
  const destinationId = route?.to.id;

  // Build SVG path strings for the background full lines
  const linePathStrings = useMemo(() => {
    const paths: Record<MetroLine, string> = {
      purple: "",
      green: "",
      yellow: "",
    };

    (Object.keys(LINE_SEQUENCES) as MetroLine[]).forEach((line) => {
      const stationIds = LINE_SEQUENCES[line];
      const points = stationIds
        .map((id) => SCHEMATIC_POSITIONS[id])
        .filter(Boolean);

      if (points.length > 0) {
        paths[line] = points
          .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
          .join(" ");
      }
    });

    return paths;
  }, []);

  // Build active route path segments (per leg)
  const activeRoutePaths = useMemo(() => {
    if (!route || !route.legs) return [];

    return route.legs.map((leg) => {
      const points = leg.stations
        .map((s) => SCHEMATIC_POSITIONS[s.id])
        .filter(Boolean);
      const d = points
        .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
        .join(" ");
      return {
        line: leg.line,
        pathD: d,
      };
    });
  }, [route]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.7));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="glass-panel rounded-2xl p-4 md:p-6 overflow-hidden relative shadow-2xl">
      {/* Map Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
        <div>
          <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
            <Train className="w-5 h-5 text-purple-400" />
            Namma Metro Interactive Schematic Map
          </h3>
          <p className="text-xs text-slate-400">
            {route
              ? "Active route highlighted with animated pulse. Click any station to select."
              : "Hover for station details or click to set origin / destination."}
          </p>
        </div>

        {/* Controls & Line Filters */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedLineFilter("all")}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedLineFilter === "all"
                  ? "bg-slate-700 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Lines
            </button>
            <button
              onClick={() => setSelectedLineFilter("purple")}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedLineFilter === "purple"
                  ? "bg-[#78288C] text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Purple
            </button>
            <button
              onClick={() => setSelectedLineFilter("green")}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedLineFilter === "green"
                  ? "bg-[#008A3B] text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Green
            </button>
            <button
              onClick={() => setSelectedLineFilter("yellow")}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedLineFilter === "yellow"
                  ? "bg-[#F5A623] text-black font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Yellow
            </button>
          </div>

          <div className="flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-800">
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition text-xs font-semibold px-2"
              title="Reset view"
            >
              100%
            </button>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full h-[460px] md:h-[560px] overflow-auto bg-[#070b14] rounded-xl border border-slate-800/80 shadow-inner flex items-center justify-center">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
            transition: "transform 0.2s ease-out",
          }}
          className="w-[1500px] h-[1050px] flex-shrink-0 relative"
        >
          <svg
            viewBox="0 0 1500 1050"
            className="w-full h-full select-none"
            style={{ shapeRendering: "geometricPrecision" }}
          >
            <defs>
              {/* Glow filters */}
              <filter id="purpleGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="greenGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="yellowGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="activePathGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background grid subtle dots */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#1e293b" opacity="0.4" />
            </pattern>
            <rect width="1500" height="1050" fill="url(#grid)" />

            {/* Base Network Lines (Dimmed if route is active) */}
            {/* 1. Purple Line Base */}
            {(selectedLineFilter === "all" || selectedLineFilter === "purple") && (
              <g opacity={route ? 0.35 : 0.9} style={{ transition: "opacity 0.3s" }}>
                <path
                  d={linePathStrings.purple}
                  fill="none"
                  stroke="#78288C"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}

            {/* 2. Green Line Base */}
            {(selectedLineFilter === "all" || selectedLineFilter === "green") && (
              <g opacity={route ? 0.35 : 0.9} style={{ transition: "opacity 0.3s" }}>
                <path
                  d={linePathStrings.green}
                  fill="none"
                  stroke="#008A3B"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}

            {/* 3. Yellow Line Base */}
            {(selectedLineFilter === "all" || selectedLineFilter === "yellow") && (
              <g opacity={route ? 0.35 : 0.9} style={{ transition: "opacity 0.3s" }}>
                <path
                  d={linePathStrings.yellow}
                  fill="none"
                  stroke="#F5A623"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}

            {/* ACTIVE ROUTE GLOWING HIGHLIGHT PATH */}
            {activeRoutePaths.map((item, idx) => {
              const strokeColor =
                item.line === "purple"
                  ? "#C084FC"
                  : item.line === "green"
                  ? "#4ADE80"
                  : "#FACC15";

              const glowColor =
                item.line === "purple"
                  ? "#78288C"
                  : item.line === "green"
                  ? "#008A3B"
                  : "#F5A623";

              return (
                <g key={`active-leg-${idx}`}>
                  {/* Thick glow background */}
                  <path
                    d={item.pathD}
                    fill="none"
                    stroke={glowColor}
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.8"
                    filter="url(#activePathGlow)"
                  />
                  {/* Solid core line */}
                  <path
                    d={item.pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Animated dash flow */}
                  <path
                    d={item.pathD}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-metro-flow"
                    opacity="0.9"
                  />
                </g>
              );
            })}

            {/* Station Nodes & Labels */}
            {STATIONS.map((station) => {
              const pos = SCHEMATIC_POSITIONS[station.id];
              if (!pos) return null;

              const isOrigin = originId === station.id;
              const isDestination = destinationId === station.id;
              const isOnActiveRoute = activeStationIds.has(station.id);
              const isInterchange = station.interchange;
              const isHovered = hoveredStation?.id === station.id;

              // Node colors
              const primaryLine = station.lines[0];
              const nodeFill = isInterchange
                ? "#FFFFFF"
                : primaryLine === "purple"
                ? "#78288C"
                : primaryLine === "green"
                ? "#008A3B"
                : "#F5A623";

              return (
                <g
                  key={station.id}
                  className="cursor-pointer transition-transform duration-200"
                  onMouseEnter={() => setHoveredStation(station)}
                  onMouseLeave={() => setHoveredStation(null)}
                  onClick={() => {
                    if (onSelectStation) {
                      // Alternate setting from / to
                      if (!originId) {
                        onSelectStation(station, "from");
                      } else {
                        onSelectStation(station, "to");
                      }
                    }
                  }}
                >
                  {/* Hover or Active Route pulse ring */}
                  {(isHovered || isOrigin || isDestination) && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isOrigin || isDestination ? 18 : 14}
                      fill={
                        isOrigin
                          ? "rgba(16, 185, 129, 0.4)"
                          : isDestination
                          ? "rgba(244, 63, 94, 0.4)"
                          : "rgba(255, 255, 255, 0.3)"
                      }
                      className="animate-station-pulse"
                    />
                  )}

                  {/* Interchange double ring */}
                  {isInterchange ? (
                    <g>
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="11"
                        fill="#0F172A"
                        stroke="#FFFFFF"
                        strokeWidth="3.5"
                      />
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="5"
                        fill={isOnActiveRoute ? "#10B981" : "#F59E0B"}
                      />
                    </g>
                  ) : (
                    /* Standard Station Node */
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isOnActiveRoute ? 7 : 5}
                      fill={isOnActiveRoute ? "#FFFFFF" : nodeFill}
                      stroke={isOnActiveRoute ? nodeFill : "#0B0F19"}
                      strokeWidth={isOnActiveRoute ? 3 : 2}
                      opacity={
                        !route
                          ? 1
                          : isOnActiveRoute
                          ? 1
                          : 0.45
                      }
                    />
                  )}

                  {/* Origin & Destination Distinct Badges */}
                  {isOrigin && (
                    <g transform={`translate(${pos.x - 14}, ${pos.y - 34})`}>
                      <rect
                        width="28"
                        height="20"
                        rx="6"
                        fill="#10B981"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                      <text
                        x="14"
                        y="14"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        FROM
                      </text>
                    </g>
                  )}
                  {isDestination && (
                    <g transform={`translate(${pos.x - 14}, ${pos.y - 34})`}>
                      <rect
                        width="28"
                        height="20"
                        rx="6"
                        fill="#F43F5E"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                      <text
                        x="14"
                        y="14"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        TO
                      </text>
                    </g>
                  )}

                  {/* Station Text Label */}
                  <text
                    x={pos.x}
                    y={pos.y + (isInterchange ? 22 : 16)}
                    textAnchor="middle"
                    fontSize={isInterchange ? "11" : "9"}
                    fontWeight={isInterchange || isOnActiveRoute ? "700" : "500"}
                    fill={
                      isOnActiveRoute
                        ? "#FFFFFF"
                        : isInterchange
                        ? "#F1F5F9"
                        : "#94A3B8"
                    }
                    className="pointer-events-none tracking-tight"
                    style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}
                  >
                    {station.shortName || station.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hovered Station Tooltip */}
        {hoveredStation && (
          <div className="absolute bottom-4 left-4 z-40 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl max-w-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold text-white">
                {hoveredStation.name}
              </div>
              <div className="flex gap-1">
                {hoveredStation.lines.map((l) => (
                  <span
                    key={l}
                    className={`w-2.5 h-2.5 rounded-full ${
                      l === "purple"
                        ? "bg-[#78288C]"
                        : l === "green"
                        ? "bg-[#008A3B]"
                        : "bg-[#F5A623]"
                    }`}
                  />
                ))}
              </div>
            </div>
            {hoveredStation.kannadaName && (
              <div className="text-[11px] text-slate-400 mt-0.5">
                {hoveredStation.kannadaName}
              </div>
            )}
            {hoveredStation.interchange && (
              <div className="text-[10px] text-amber-400 font-semibold mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Interchange Station ({hoveredStation.lines.join(" + ").toUpperCase()})
              </div>
            )}
            <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-2">
              <span>Click to set route endpoint</span>
            </div>
          </div>
        )}
      </div>

      {/* Network Legend Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#78288C]" />
            <span className="text-slate-300 font-medium">Purple Line (Challaghatta ↔ Whitefield)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#008A3B]" />
            <span className="text-slate-300 font-medium">Green Line (Madavara ↔ Silk Institute)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#F5A623]" />
            <span className="text-slate-300 font-medium">Yellow Line (RV Road ↔ Bommasandra)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full ring-2 ring-white bg-slate-900" />
            <span className="text-amber-300 font-medium">Interchange (Majestic / RV Road)</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Schematic topology • 83 stations mapped
        </div>
      </div>
    </div>
  );
}
