"use client";

import { METRO_LINES } from "@/data/lines";
import { STATIONS } from "@/data/stations";
import { MetroLine, Station } from "@/lib/types";
import { StationBadge } from "./StationBadge";
import {
  Accessibility,
  Bus,
  Car,
  CheckCircle2,
  Droplets,
  Filter,
  Layers,
  MapPin,
  Search,
  Sparkles,
  Train,
} from "lucide-react";
import React, { useMemo, useState } from "react";

interface NetworkOverviewProps {
  onSelectStation: (station: Station, role: "from" | "to") => void;
}

export function NetworkOverview({ onSelectStation }: NetworkOverviewProps) {
  const [selectedLine, setSelectedLine] = useState<MetroLine | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStations = useMemo(() => {
    return STATIONS.filter((s) => {
      const matchesLine =
        selectedLine === "all" || s.lines.includes(selectedLine);
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.shortName && s.shortName.toLowerCase().includes(q)) ||
        (s.kannadaName && s.kannadaName.toLowerCase().includes(q)) ||
        (s.aliases && s.aliases.some((a) => a.toLowerCase().includes(q)));
      return matchesLine && matchesQuery;
    });
  }, [selectedLine, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header & Line Filter Tabs */}
      <div className="glass-panel rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              Namma Metro Line Directory
            </h3>
            <p className="text-xs text-slate-400">
              Browse all 83 operational stations across Purple, Green, and Yellow corridors.
            </p>
          </div>

          {/* Search bar inside directory */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search station or landmark..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Line Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <button
            type="button"
            onClick={() => setSelectedLine("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedLine === "all"
                ? "bg-slate-700 text-white shadow"
                : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            All Corridors ({STATIONS.length})
          </button>

          {(Object.keys(METRO_LINES) as MetroLine[]).map((lineKey) => {
            const meta = METRO_LINES[lineKey];
            const isSelected = selectedLine === lineKey;

            return (
              <button
                key={lineKey}
                type="button"
                onClick={() => setSelectedLine(lineKey)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  isSelected
                    ? `${meta.bgClass} text-white shadow-lg`
                    : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    lineKey === "purple"
                      ? "bg-purple-300"
                      : lineKey === "green"
                      ? "bg-emerald-300"
                      : "bg-amber-200"
                  }`}
                />
                <span>{meta.name}</span>
                <span className="text-[10px] opacity-80">({meta.totalStations})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredStations.map((station) => {
          return (
            <div
              key={station.id}
              className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-bold text-slate-100 group-hover:text-white text-sm">
                    {station.name}
                  </div>
                  <StationBadge lines={station.lines} size="sm" />
                </div>

                {station.kannadaName && (
                  <div className="text-xs text-slate-400 font-normal mb-1">
                    {station.kannadaName}
                  </div>
                )}

                {station.aliases && station.aliases.length > 0 && (
                  <div className="text-[11px] text-slate-500 mb-3 truncate">
                    Landmarks: {station.aliases.join(", ")}
                  </div>
                )}

                {/* Facilities Tags */}
                <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-400 mb-3">
                  <span className="bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded-md capitalize">
                    {station.layout || "Elevated"}
                  </span>
                  {station.facilities?.parking && (
                    <span className="bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded-md flex items-center gap-1 text-slate-300">
                      <Car className="w-2.5 h-2.5 text-blue-400" />
                      Parking
                    </span>
                  )}
                  {station.facilities?.feederBus && (
                    <span className="bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded-md flex items-center gap-1 text-slate-300">
                      <Bus className="w-2.5 h-2.5 text-amber-400" />
                      Feeder
                    </span>
                  )}
                  {station.facilities?.wheelchairAccessible && (
                    <span className="bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded-md flex items-center gap-1 text-slate-300">
                      <Accessibility className="w-2.5 h-2.5 text-emerald-400" />
                      Accessible
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => onSelectStation(station, "from")}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 font-semibold text-center transition"
                >
                  Set Origin
                </button>
                <button
                  type="button"
                  onClick={() => onSelectStation(station, "to")}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 font-semibold text-center transition"
                >
                  Set Destination
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
