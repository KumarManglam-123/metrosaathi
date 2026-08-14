"use client";

import { Station } from "@/lib/types";
import { searchStations } from "@/lib/search";
import { findNearestStation } from "@/lib/geolocation";
import { StationBadge } from "./StationBadge";
import React, { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Search,
  X,
  Crosshair,
  ArrowRight,
  Shuffle,
  Loader2,
  Check,
} from "lucide-react";

interface AutocompleteInputProps {
  label: string;
  placeholder: string;
  selectedStation: Station | null;
  onSelectStation: (station: Station | null) => void;
  accentColor?: "purple" | "green" | "emerald" | "yellow" | "blue";
  icon?: "origin" | "destination";
  enableGeolocation?: boolean;
}

export function AutocompleteInput({
  label,
  placeholder,
  selectedStation,
  onSelectStation,
  accentColor = "purple",
  icon = "origin",
  enableGeolocation = false,
}: AutocompleteInputProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isLocating, setIsLocating] = useState(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtered results
  const results = searchStations(query, 8);

  // Sync internal query with selectedStation
  useEffect(() => {
    if (selectedStation) {
      setQuery(selectedStation.name);
    } else if (!isOpen) {
      setQuery("");
    }
  }, [selectedStation, isOpen]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        if (selectedStation) {
          setQuery(selectedStation.name);
        } else {
          setQuery("");
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedStation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    setHighlightedIndex(0);
    if (!val && selectedStation) {
      onSelectStation(null);
    }
  };

  const handleSelect = (station: Station) => {
    onSelectStation(station);
    setQuery(station.name);
    setIsOpen(false);
    setGeoMessage(null);
  };

  const handleClear = () => {
    onSelectStation(null);
    setQuery("");
    setGeoMessage(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(
        (prev) => (prev - 1 + results.length) % Math.max(1, results.length)
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[highlightedIndex]) {
        handleSelect(results[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleLocateNearest = () => {
    if (!navigator.geolocation) {
      setGeoMessage("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    setGeoMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        const nearest = findNearestStation(latitude, longitude);

        handleSelect(nearest.station);
        setGeoMessage(
          `Nearest: ${nearest.station.name} (~${nearest.distanceKm} km, ~${nearest.walkingMinutes} min walk)`
        );
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoMessage("Location permission denied. Please search manually.");
        } else {
          setGeoMessage("Could not retrieve GPS coordinates.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const accentStyles = {
    purple: "focus-within:border-purple-500/70 focus-within:ring-purple-500/20",
    green: "focus-within:border-emerald-500/70 focus-within:ring-emerald-500/20",
    emerald: "focus-within:border-emerald-500/70 focus-within:ring-emerald-500/20",
    yellow: "focus-within:border-amber-500/70 focus-within:ring-amber-500/20",
    blue: "focus-within:border-blue-500/70 focus-within:ring-blue-500/20",
  };

  const iconDotColor =
    icon === "origin"
      ? "bg-emerald-500 ring-emerald-500/30"
      : "bg-rose-500 ring-rose-500/30";

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ring-4 ${iconDotColor}`} />
          {label}
        </label>
        {enableGeolocation && (
          <button
            type="button"
            onClick={handleLocateNearest}
            disabled={isLocating}
            className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-emerald-950/40"
            title="Auto-detect nearest station using GPS"
          >
            {isLocating ? (
              <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
            ) : (
              <Crosshair className="w-3 h-3 text-emerald-400" />
            )}
            <span>{isLocating ? "Locating..." : "Near Me"}</span>
          </button>
        )}
      </div>

      <div
        className={`relative flex items-center rounded-xl bg-slate-900/90 border border-slate-700/80 transition-all duration-200 shadow-inner ring-4 ring-transparent ${accentStyles[accentColor]}`}
      >
        <div className="pl-3.5 pr-2 text-slate-400 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-slate-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent py-3 pr-9 text-sm font-medium text-white placeholder-slate-500 focus:outline-none"
        />

        {selectedStation && (
          <div className="pr-3 flex items-center gap-2">
            <StationBadge lines={selectedStation.lines} size="sm" />
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-800 transition"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {!selectedStation && query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 text-slate-400 hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {geoMessage && (
        <p className="mt-1 text-xs text-emerald-400/90 flex items-center gap-1 font-medium">
          <Check className="w-3 h-3" />
          {geoMessage}
        </p>
      )}

      {/* Autocomplete dropdown menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-700/90 bg-slate-900/95 backdrop-blur-xl shadow-2xl p-1.5 scrollbar-thin">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-center text-xs text-slate-400">
              No matching station found. Try searching for &quot;Majestic&quot;, &quot;Whitefield&quot;, &quot;ITPL&quot;, etc.
            </div>
          ) : (
            <ul className="space-y-1">
              {results.map((station, index) => {
                const isSelected = selectedStation?.id === station.id;
                const isHighlighted = highlightedIndex === index;

                return (
                  <li
                    key={station.id}
                    onClick={() => handleSelect(station)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer text-xs transition-all ${
                      isHighlighted
                        ? "bg-slate-800 text-white"
                        : "text-slate-200 hover:bg-slate-800/60"
                    } ${isSelected ? "ring-1 ring-emerald-500/50 bg-emerald-950/20" : ""}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <MapPin
                        className={`w-3.5 h-3.5 flex-shrink-0 ${
                          station.lines.includes("purple")
                            ? "text-purple-400"
                            : station.lines.includes("green")
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }`}
                      />
                      <div className="truncate">
                        <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                          <span>{station.name}</span>
                          {station.kannadaName && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({station.kannadaName})
                            </span>
                          )}
                        </div>
                        {station.aliases && station.aliases.length > 0 && (
                          <div className="text-[10px] text-slate-400 truncate">
                            aka {station.aliases.slice(0, 2).join(", ")}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <StationBadge lines={station.lines} size="sm" />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
