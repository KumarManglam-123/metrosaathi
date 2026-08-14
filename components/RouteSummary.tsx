"use client";

import { RouteResult } from "@/lib/types";
import {
  Banknote,
  Clock,
  Navigation,
  ArrowRightLeft,
  Coins,
  CreditCard,
  Train,
  Sparkles,
} from "lucide-react";
import React from "react";

interface RouteSummaryProps {
  route: RouteResult;
}

export function RouteSummary({ route }: RouteSummaryProps) {
  const { fare, totalTimeMinutes, totalDistanceKm, interchangeCount, totalStops } =
    route;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* 1. Fare Card */}
      <div className="glass-panel rounded-2xl p-4 relative overflow-hidden group hover:border-slate-600/60 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all" />
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
            <Coins className="w-4 h-4" />
            Metro Fare
          </span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-medium px-2 py-0.5 rounded-full border border-emerald-500/20">
            {fare.slabDescription.split("(")[0]}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            ₹{fare.tokenFare}
          </div>
          <div className="text-xs text-slate-400">Token</div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-300">
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-white">₹{fare.smartCardPeak}</span>
            <span className="text-[11px] text-slate-400">Smart Card</span>
          </div>
          <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
            Save 5–10%
          </span>
        </div>
      </div>

      {/* 2. Travel Time Card */}
      <div className="glass-panel rounded-2xl p-4 relative overflow-hidden group hover:border-slate-600/60 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-all" />
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-blue-400">
            <Clock className="w-4 h-4" />
            Travel Time
          </span>
          <span className="text-[10px] text-slate-400">Estimated</span>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            ~{totalTimeMinutes}
          </div>
          <div className="text-xs text-slate-400 font-medium">minutes</div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>~2.4 min / station</span>
          <span className="text-blue-300 text-[11px]">Avg speed 34 km/h</span>
        </div>
      </div>

      {/* 3. Distance & Stops */}
      <div className="glass-panel rounded-2xl p-4 relative overflow-hidden group hover:border-slate-600/60 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10 transition-all" />
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-purple-400">
            <Navigation className="w-4 h-4" />
            Distance
          </span>
          <span className="text-[10px] text-slate-400">{totalStops} Stops</span>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {totalDistanceKm}
          </div>
          <div className="text-xs text-slate-400 font-medium">kilometers</div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Train className="w-3.5 h-3.5 text-purple-400" />
            {totalStops + 1} Stations Total
          </span>
        </div>
      </div>

      {/* 4. Interchanges */}
      <div className="glass-panel rounded-2xl p-4 relative overflow-hidden group hover:border-slate-600/60 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-all" />
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-amber-400">
            <ArrowRightLeft className="w-4 h-4" />
            Interchanges
          </span>
          {interchangeCount === 0 ? (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">
              Direct Line
            </span>
          ) : (
            <span className="text-[10px] bg-amber-500/10 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-500/20">
              {interchangeCount} Change{interchangeCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {interchangeCount === 0 ? "Direct" : interchangeCount}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            {interchangeCount === 0 ? "No transfer" : "Line transfer"}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>{interchangeCount === 0 ? "Single train journey" : `~3 min walking transfer`}</span>
        </div>
      </div>
    </div>
  );
}
