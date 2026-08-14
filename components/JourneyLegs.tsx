"use client";

import { METRO_LINES } from "@/data/lines";
import { RouteLeg, RouteResult, Station } from "@/lib/types";
import { StationBadge } from "./StationBadge";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowRightLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Footprints,
  Info,
  MapPin,
  Sparkles,
  Train,
  Volume2,
} from "lucide-react";
import React, { useState } from "react";

interface JourneyLegsProps {
  route: RouteResult;
  onStationClick?: (station: Station) => void;
}

export function JourneyLegs({ route, onStationClick }: JourneyLegsProps) {
  const [expandedLegs, setExpandedLegs] = useState<Record<number, boolean>>({});

  const toggleLegExpand = (legIndex: number) => {
    setExpandedLegs((prev) => ({
      ...prev,
      [legIndex]: !prev[legIndex],
    }));
  };

  const lineThemeStyles = {
    purple: {
      barBg: "bg-[#78288C]",
      border: "border-[#78288C]/40",
      text: "text-[#C084FC]",
      lightBg: "bg-[#78288C]/10",
      ring: "ring-[#78288C]/40",
      glow: "shadow-[0_0_20px_rgba(120,40,140,0.2)]",
      bulletBg: "bg-[#78288C]",
    },
    green: {
      barBg: "bg-[#008A3B]",
      border: "border-[#008A3B]/40",
      text: "text-[#4ADE80]",
      lightBg: "bg-[#008A3B]/10",
      ring: "ring-[#008A3B]/40",
      glow: "shadow-[0_0_20px_rgba(0,138,59,0.2)]",
      bulletBg: "bg-[#008A3B]",
    },
    yellow: {
      barBg: "bg-[#F5A623]",
      border: "border-[#F5A623]/40",
      text: "text-[#FACC15]",
      lightBg: "bg-[#F5A623]/10",
      ring: "ring-[#F5A623]/40",
      glow: "shadow-[0_0_20px_rgba(245,166,35,0.2)]",
      bulletBg: "bg-[#F5A623]",
    },
  };

  if (route.totalStops === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">You are already at {route.from.name}!</h3>
        <p className="text-sm text-slate-400">
          Origin and destination stations are identical. No transit needed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Origin Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-panel rounded-2xl p-4 border-l-4 border-emerald-500 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-2 ring-emerald-500/30 flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              Start Journey • Board Here
            </div>
            <div className="text-base md:text-lg font-bold text-white flex items-center gap-2 flex-wrap">
              <span>{route.from.name}</span>
              {route.from.kannadaName && (
                <span className="text-xs text-slate-400 font-normal">
                  ({route.from.kannadaName})
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <StationBadge lines={route.from.lines} size="sm" />
        </div>
      </motion.div>

      {/* Route Legs */}
      <div className="space-y-4 relative">
        {route.legs.map((leg, legIndex) => {
          const theme = lineThemeStyles[leg.line];
          const lineMeta = METRO_LINES[leg.line];
          const isExpanded = !!expandedLegs[legIndex];
          const intermediateStations = leg.stations.slice(1, -1);

          return (
            <motion.div
              key={`${leg.line}-${leg.fromStation.id}-${leg.toStation.id}-${legIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: legIndex * 0.1 }}
              className="space-y-3"
            >
              {/* Leg Container */}
              <div
                className={`glass-panel rounded-2xl p-4 md:p-5 border-l-4 ${theme.border} ${theme.glow} transition-all duration-300`}
              >
                {/* Leg Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-3.5 h-3.5 rounded-full ${theme.barBg} ring-4 ${theme.ring}`}
                    />
                    <div>
                      <h4 className={`text-base font-bold ${theme.text} flex items-center gap-1.5`}>
                        <Train className="w-4 h-4" />
                        {lineMeta.name} ({lineMeta.kannadaName})
                      </h4>
                      <div className="text-xs text-slate-400">
                        Towards terminal • Platform frequency 3–6 min
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 font-medium">
                      {leg.numStops} Stop{leg.numStops > 1 ? "s" : ""}
                    </span>
                    <span className="bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-400" />
                      ~{leg.estimatedMinutes} min
                    </span>
                    <span className="bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 font-medium">
                      {leg.distanceKm} km
                    </span>
                  </div>
                </div>

                {/* Leg Stations Track */}
                <div className="mt-4 space-y-3">
                  {/* Boarding Stop */}
                  <div className="flex items-start gap-3 text-sm">
                    <div className="flex flex-col items-center pt-0.5">
                      <div className={`w-3.5 h-3.5 rounded-full ${theme.barBg} ring-4 ${theme.ring}`} />
                      <div className={`w-0.5 h-6 ${theme.barBg} opacity-40`} />
                    </div>
                    <div className="flex-1 -mt-0.5">
                      <div className="font-semibold text-white">
                        {leg.fromStation.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        Board train on {lineMeta.name}
                      </div>
                    </div>
                  </div>

                  {/* Intermediate Stops Accordion */}
                  {intermediateStations.length > 0 && (
                    <div className="pl-1.5">
                      <button
                        type="button"
                        onClick={() => toggleLegExpand(legIndex)}
                        className={`w-full text-left py-2 px-3 rounded-xl border border-slate-800 ${theme.lightBg} hover:bg-slate-800/60 transition-colors flex items-center justify-between text-xs font-medium text-slate-300`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-500" />
                          <span>
                            {isExpanded
                              ? `Hide ${intermediateStations.length} intermediate stops`
                              : `Ride past ${intermediateStations.length} intermediate stops (${intermediateStations[0].shortName || intermediateStations[0].name} ...)`}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-6 pt-2 pb-2 space-y-2 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-700"
                        >
                          {intermediateStations.map((station, sIdx) => (
                            <div
                              key={station.id}
                              onClick={() => onStationClick?.(station)}
                              className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-800/60 cursor-pointer text-slate-300 group transition"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-slate-300" />
                                <span className="font-medium group-hover:text-white">
                                  {station.name}
                                </span>
                                {station.kannadaName && (
                                  <span className="text-[10px] text-slate-500">
                                    {station.kannadaName}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Stop #{sIdx + 1}
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Leg Alighting Stop */}
                  <div className="flex items-start gap-3 text-sm">
                    <div className="flex flex-col items-center pt-0.5">
                      <div className={`w-3.5 h-3.5 rounded-full ring-4 ${theme.ring} bg-white`} />
                    </div>
                    <div className="flex-1 -mt-0.5">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{leg.toStation.name}</span>
                        {leg.interchangeAfter && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                            Transfer Point
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {leg.interchangeAfter
                          ? "Alight here to transfer lines"
                          : "Final stop on this route"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interchange Banner */}
              {leg.interchangeAfter && (
                <motion.div
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl p-4 bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-emerald-500/15 border border-amber-500/30 shadow-lg relative overflow-hidden"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 ring-2 ring-amber-500/30 mt-0.5">
                      <ArrowRightLeft className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                          <Footprints className="w-3.5 h-3.5" />
                          Interchange at {leg.interchangeAfter.atStation.shortName || leg.interchangeAfter.atStation.name}
                        </span>
                        <span className="text-[11px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-700/50 px-2 py-0.5 rounded-full">
                          ~{leg.interchangeAfter.walkingTimeMinutes} min walk
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 mt-1 font-medium leading-relaxed">
                        {leg.interchangeAfter.instructions}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                        <Info className="w-3.5 h-3.5 text-amber-400" />
                        <span>Do not exit the fare gates. Follow illuminated floor markers & signage.</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Destination Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="glass-panel rounded-2xl p-4 border-l-4 border-rose-500 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center ring-2 ring-rose-500/30 flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">
              Destination • Exit Here
            </div>
            <div className="text-base md:text-lg font-bold text-white flex items-center gap-2 flex-wrap">
              <span>{route.to.name}</span>
              {route.to.kannadaName && (
                <span className="text-xs text-slate-400 font-normal">
                  ({route.to.kannadaName})
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <StationBadge lines={route.to.lines} size="sm" />
        </div>
      </motion.div>

      {/* Commuter Tips strip */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3.5 flex items-start gap-2.5 text-xs text-slate-400">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">Bangalore Metro Timings:</span> First train departs at 5:00 AM (Mon–Sat) / 7:00 AM (Sun). Last train departs terminals at 11:00 PM. Keep your QR or Smart card handy for tap-out at the destination gate.
        </div>
      </div>
    </div>
  );
}
