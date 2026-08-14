"use client";

import { AutocompleteInput } from "@/components/AutocompleteInput";
import { FareBreakdownCard } from "@/components/FareBreakdownCard";
import { Header } from "@/components/Header";
import { JourneyLegs } from "@/components/JourneyLegs";
import { MetroMapSvg } from "@/components/MetroMapSvg";
import { NetworkOverview } from "@/components/NetworkOverview";
import { RecentRouteItem, RecentSearches } from "@/components/RecentSearches";
import { RouteSummary } from "@/components/RouteSummary";
import { StationBadge } from "@/components/StationBadge";
import { METRO_LINES } from "@/data/lines";
import { STATIONS, getStationById } from "@/data/stations";
import { findRoute } from "@/lib/graph";
import { POPULAR_STATIONS } from "@/lib/search";
import { MetroLine, RoutePreference, RouteResult, Station } from "@/lib/types";
import { motion } from "framer-motion";
import {
  ArrowRightLeft,
  Banknote,
  Check,
  CheckCircle2,
  Compass,
  Info,
  Layers,
  Map,
  MapPin,
  RotateCcw,
  Route,
  Share2,
  Sparkles,
  Train,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";

export default function HomePage() {
  const [fromStation, setFromStation] = useState<Station | null>(null);
  const [toStation, setToStation] = useState<Station | null>(null);
  const [preference, setPreference] = useState<RoutePreference>("fastest");
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [activeTab, setActiveTab] = useState<"route" | "map" | "fare" | "directory">("route");
  const [recentRoutes, setRecentRoutes] = useState<RecentRouteItem[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  // Load recent searches from localStorage & handle URL query parameters on initial load
  useEffect(() => {
    try {
      const saved = localStorage.getItem("metrosaathi_recent_searches");
      if (saved) {
        setRecentRoutes(JSON.parse(saved));
      }
    } catch {
      // Ignore storage error
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const fromParam = params.get("from");
      const toParam = params.get("to");
      const prefParam = params.get("preference");

      if (fromParam) {
        const foundFrom = getStationById(fromParam);
        if (foundFrom) setFromStation(foundFrom);
      }
      if (toParam) {
        const foundTo = getStationById(toParam);
        if (foundTo) setToStation(foundTo);
      }
      if (prefParam === "fewest_transfers" || prefParam === "fastest") {
        setPreference(prefParam);
      }
    }
  }, []);

  // Compute route whenever origin, destination, or preference changes
  useEffect(() => {
    if (fromStation && toStation) {
      const result = findRoute(fromStation.id, toStation.id, preference);
      setRouteResult(result);

      // Save to recent searches if distinct stations
      if (fromStation.id !== toStation.id) {
        setRecentRoutes((prev) => {
          const newItem: RecentRouteItem = {
            fromId: fromStation.id,
            fromName: fromStation.shortName || fromStation.name,
            toId: toStation.id,
            toName: toStation.shortName || toStation.name,
            timestamp: Date.now(),
          };
          const filtered = prev.filter(
            (r) => !(r.fromId === newItem.fromId && r.toId === newItem.toId)
          );
          const updated = [newItem, ...filtered].slice(0, 6);
          try {
            localStorage.setItem("metrosaathi_recent_searches", JSON.stringify(updated));
          } catch {
            // Ignore storage error
          }
          return updated;
        });
      }
    } else {
      setRouteResult(null);
    }
  }, [fromStation, toStation, preference]);

  // Swap From and To stations
  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  // Quick select popular station chip
  const handleQuickChipSelect = (stationId: string) => {
    const station = getStationById(stationId);
    if (!station) return;

    if (!fromStation) {
      setFromStation(station);
    } else if (!toStation && fromStation.id !== station.id) {
      setToStation(station);
    } else {
      setToStation(station);
    }
  };

  // Select from recent searches
  const handleSelectRecentRoute = (fromId: string, toId: string) => {
    const f = getStationById(fromId);
    const t = getStationById(toId);
    if (f) setFromStation(f);
    if (t) setToStation(t);
  };

  // Clear recent searches
  const handleClearHistory = () => {
    setRecentRoutes([]);
    try {
      localStorage.removeItem("metrosaathi_recent_searches");
    } catch {
      // Ignore
    }
  };

  // Select station from map or directory
  const handleMapOrDirectorySelect = (station: Station, role: "from" | "to") => {
    if (role === "from") {
      setFromStation(station);
    } else {
      setToStation(station);
    }
    setActiveTab("route");
  };

  // Copy shareable link to clipboard
  const handleShareRoute = () => {
    if (!fromStation || !toStation) return;
    const url = `${window.location.origin}${window.location.pathname}?from=${fromStation.id}&to=${toStation.id}&preference=${preference}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col selection:bg-purple-500/30">
      <Header onOpenInfoModal={() => setInfoModalOpen(true)} />

      {/* Hero Ambient Background Lighting */}
      <div className="relative overflow-hidden pt-6 pb-12 sm:pt-8 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-60 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-6 relative z-10">
          {/* Main Title Section */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-purple-300 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Namma Metro (BMRCL) 2026 Transit Guide</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white font-display">
              Navigate Bangalore Metro with{" "}
              <span className="bg-gradient-to-r from-purple-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
                Confidence
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              Find the shortest route, exact interchange steps, station-based fares, and journey timings across Purple, Green, and Yellow lines.
            </p>
          </div>

          {/* Search Card */}
          <div className="glass-panel rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-700/60 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Origin Input */}
              <div className="lg:col-span-5">
                <AutocompleteInput
                  label="Origin Station"
                  placeholder="Type departure station (e.g. Whitefield, ITPL)..."
                  selectedStation={fromStation}
                  onSelectStation={setFromStation}
                  accentColor="emerald"
                  icon="origin"
                  enableGeolocation={true}
                />
              </div>

              {/* Swap Button */}
              <div className="lg:col-span-2 flex justify-center py-1 lg:py-0">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92, rotate: 180 }}
                  type="button"
                  onClick={handleSwapStations}
                  className="p-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white shadow-lg transition flex items-center justify-center gap-2 group"
                  title="Swap Origin and Destination"
                >
                  <ArrowRightLeft className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition" />
                  <span className="text-xs font-semibold lg:hidden">Swap Stations</span>
                </motion.button>
              </div>

              {/* Destination Input */}
              <div className="lg:col-span-5">
                <AutocompleteInput
                  label="Destination Station"
                  placeholder="Type arrival station (e.g. Electronic City, Majestic)..."
                  selectedStation={toStation}
                  onSelectStation={setToStation}
                  accentColor="purple"
                  icon="destination"
                  enableGeolocation={false}
                />
              </div>
            </div>

            {/* Popular Hub Quick Chips & Preferences */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              {/* Quick Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500 font-semibold uppercase text-[11px] tracking-wider mr-1">
                  Popular Hubs:
                </span>
                {POPULAR_STATIONS.map((hub) => (
                  <button
                    key={hub.id}
                    type="button"
                    onClick={() => handleQuickChipSelect(hub.id)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition text-xs font-medium"
                  >
                    {hub.label}
                  </button>
                ))}
              </div>

              {/* Preference Toggle */}
              <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setPreference("fastest")}
                  className={`px-3 py-1 rounded-lg transition font-medium text-xs flex items-center gap-1 ${
                    preference === "fastest"
                      ? "bg-purple-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  Fastest Route
                </button>
                <button
                  type="button"
                  onClick={() => setPreference("fewest_transfers")}
                  className={`px-3 py-1 rounded-lg transition font-medium text-xs flex items-center gap-1 ${
                    preference === "fewest_transfers"
                      ? "bg-purple-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  Fewest Changes
                </button>
              </div>
            </div>
          </div>

          {/* Recent Searches Strip */}
          <RecentSearches
            recentRoutes={recentRoutes}
            onSelectRoute={handleSelectRecentRoute}
            onClearHistory={handleClearHistory}
          />

          {/* RESULTS SECTION */}
          {routeResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Summary Strip */}
              <RouteSummary route={routeResult} />

              {/* Action Toolbar: Tabs & Share Link */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-2xl border border-slate-800/80">
                {/* Navigation Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab("route")}
                    className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                      activeTab === "route"
                        ? "bg-purple-600 text-white shadow-lg"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    <Route className="w-4 h-4" />
                    <span>Step-by-Step Directions</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("map")}
                    className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                      activeTab === "map"
                        ? "bg-purple-600 text-white shadow-lg"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    <Map className="w-4 h-4" />
                    <span>Interactive Metro Map</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("fare")}
                    className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                      activeTab === "fare"
                        ? "bg-purple-600 text-white shadow-lg"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Fare Slabs & Ticketing</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("directory")}
                    className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                      activeTab === "directory"
                        ? "bg-purple-600 text-white shadow-lg"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>All 83 Stations</span>
                  </button>
                </div>

                {/* Share Link Button */}
                <button
                  type="button"
                  onClick={handleShareRoute}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition flex items-center gap-1.5"
                  title="Copy deep link to share this route"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-slate-400" />
                      <span>Share Route</span>
                    </>
                  )}
                </button>
              </div>

              {/* TAB CONTENT VIEWS */}
              {activeTab === "route" && (
                <JourneyLegs
                  route={routeResult}
                  onStationClick={(station) => {
                    setToStation(station);
                  }}
                />
              )}

              {activeTab === "map" && (
                <MetroMapSvg
                  route={routeResult}
                  onSelectStation={handleMapOrDirectorySelect}
                />
              )}

              {activeTab === "fare" && (
                <FareBreakdownCard route={routeResult} />
              )}

              {activeTab === "directory" && (
                <NetworkOverview onSelectStation={handleMapOrDirectorySelect} />
              )}
            </motion.div>
          )}

          {/* When no route is searched yet, show interactive map or directory directly */}
          {!routeResult && (
            <div className="space-y-6">
              <MetroMapSvg
                route={null}
                onSelectStation={handleMapOrDirectorySelect}
              />
              <NetworkOverview onSelectStation={handleMapOrDirectorySelect} />
              <FareBreakdownCard route={null} />
            </div>
          )}
        </div>
      </div>

      {/* Info & About Modal */}
      {infoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-slate-700 relative">
            <button
              onClick={() => setInfoModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Train className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">About MetroSaathi</h3>
                <p className="text-xs text-slate-400">Bangalore Namma Metro Navigator</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong>MetroSaathi</strong> is a modern, high-precision route finder and transit companion for Bangalore&apos;s Namma Metro (BMRCL) network.
              </p>
              <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800 space-y-1.5">
                <div className="font-semibold text-white">Network Coverage:</div>
                <ul className="list-disc list-inside text-slate-400 space-y-1">
                  <li><strong>Purple Line:</strong> Challaghatta ↔ Whitefield (Kadugodi) (37 Stations)</li>
                  <li><strong>Green Line:</strong> Madavara (BIEC) ↔ Silk Institute (32 Stations)</li>
                  <li><strong>Yellow Line:</strong> RV Road ↔ Bommasandra (Electronic City) (16 Stations)</li>
                  <li><strong>Interchanges:</strong> Majestic (Purple + Green) & RV Road (Green + Yellow)</li>
                </ul>
              </div>
              <p>
                <strong>Fare Computation:</strong> Accurately modeled on BMRCL&apos;s official 2026 station-count fare slabs ranging from ₹10 to ₹90, with automatic Smart Card / NCMC and WhatsApp QR ticketing discount breakdowns.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setInfoModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition shadow"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">MetroSaathi</span>
            <span>•</span>
            <span>Made with ❤️ for Bangalore Commuters</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span>BMRCL Toll-Free: 1800-425-12345</span>
            <span>•</span>
            <span>Operating Hours: 05:00 AM – 11:00 PM</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
