"use client";

import { FARE_SLABS } from "@/lib/fare";
import { RouteResult } from "@/lib/types";
import {
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  HelpCircle,
  Info,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";
import React from "react";

interface FareBreakdownCardProps {
  route: RouteResult | null;
}

export function FareBreakdownCard({ route }: FareBreakdownCardProps) {
  const stops = route ? route.totalStops : 0;
  const fare = route?.fare;

  return (
    <div className="space-y-6">
      {/* Active Route Fare Comparison Card */}
      {route && fare && (
        <div className="glass-panel rounded-2xl p-5 border-l-4 border-emerald-500 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Fare For Your Journey ({route.from.shortName || route.from.name} → {route.to.shortName || route.to.name})
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {stops} Station{stops !== 1 ? "s" : ""} Traveled • {fare.slabDescription}
              </h3>
            </div>
            <div className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              Formula: BMRCL 2026 Station Slabs
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Paper Token */}
            <div className="rounded-xl p-4 bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-semibold text-slate-300">Single Token</span>
                  <span className="text-[10px] text-slate-500">Standard</span>
                </div>
                <div className="text-2xl font-extrabold text-white">₹{fare.tokenFare}</div>
              </div>
              <div className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
                Purchased at station counter / TVM
              </div>
            </div>

            {/* Smart Card / NCMC */}
            <div className="rounded-xl p-4 bg-emerald-950/30 border border-emerald-500/30 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                RECOMMENDED
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold mb-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Smart Card / NCMC</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-extrabold text-emerald-300">
                    ₹{fare.smartCardPeak}
                  </div>
                  <span className="text-xs text-emerald-400/80 line-through">₹{fare.tokenFare}</span>
                </div>
              </div>
              <div className="text-[11px] text-emerald-300/80 mt-3 pt-2 border-t border-emerald-900/50 flex justify-between">
                <span>Peak (5% off): ₹{fare.smartCardPeak}</span>
                <span className="font-medium">Off-Peak (10% off): ₹{fare.smartCardOffPeak}</span>
              </div>
            </div>

            {/* WhatsApp / QR Ticket */}
            <div className="rounded-xl p-4 bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-semibold text-cyan-300 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                    WhatsApp QR Ticket
                  </span>
                  <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                    5% OFF
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-cyan-200">₹{fare.qrFare}</div>
              </div>
              <div className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
                Book via official BMRCL WhatsApp bot / Namma Metro App
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official BMRCL Fare Table Matrix */}
      <div className="glass-panel rounded-2xl p-5 md:p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Banknote className="w-5 h-5 text-emerald-400" />
              Official BMRCL Station-Based Fare Slabs (2026)
            </h3>
            <p className="text-xs text-slate-400">
              Namma Metro fares are strictly calculated based on the total number of stations traveled.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/50">
                <th className="py-3 px-4">Stations Traveled</th>
                <th className="py-3 px-4">Single Token Fare</th>
                <th className="py-3 px-4">Smart Card (Peak - 5%)</th>
                <th className="py-3 px-4">Smart Card (Off-Peak - 10%)</th>
                <th className="py-3 px-4">WhatsApp QR (5%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {FARE_SLABS.map((slab) => {
                const isMatched =
                  route && stops >= slab.min && stops <= slab.max;
                const peak = Math.round(slab.fare * 0.95);
                const offPeak = Math.round(slab.fare * 0.9);
                const qr = Math.round(slab.fare * 0.95);

                return (
                  <tr
                    key={slab.label}
                    className={`transition-colors ${
                      isMatched
                        ? "bg-emerald-500/15 font-bold text-white ring-1 ring-emerald-500/40"
                        : "text-slate-300 hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="py-2.5 px-4 flex items-center gap-2">
                      {isMatched && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                      <span>
                        {slab.max >= 999
                          ? `${slab.min}+ stations`
                          : `${slab.min} – ${slab.max} stations`}
                      </span>
                      {isMatched && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                          Your Trip
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-white">
                      ₹{slab.fare}
                    </td>
                    <td className="py-2.5 px-4 text-emerald-400 font-medium">
                      ₹{peak}
                    </td>
                    <td className="py-2.5 px-4 text-emerald-400 font-medium">
                      ₹{offPeak}
                    </td>
                    <td className="py-2.5 px-4 text-cyan-300 font-medium">
                      ₹{qr}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rules & Commuter Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="glass-panel rounded-2xl p-4 space-y-2.5 border border-slate-800">
          <h4 className="font-bold text-slate-200 flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-amber-400" />
            Ticket Validity & Overstay Penalties
          </h4>
          <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
            <li>Tokens & QR tickets are valid for entry on the date of purchase.</li>
            <li>Maximum stay inside the paid metro system is <strong className="text-slate-200">120 minutes</strong> (2 hours).</li>
            <li>Overstay beyond 120 minutes incurs a penalty of <strong className="text-slate-200">₹10 per hour</strong> up to a maximum of ₹50.</li>
            <li>Entry and exit at the <strong className="text-slate-200">same station</strong> is allowed up to 20 minutes for ₹10.</li>
          </ul>
        </div>

        <div className="glass-panel rounded-2xl p-4 space-y-2.5 border border-slate-800">
          <h4 className="font-bold text-slate-200 flex items-center gap-2 text-sm">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Smart Card & NCMC Essentials
          </h4>
          <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
            <li>New Varshik smart card costs <strong className="text-slate-200">₹50</strong> (non-refundable) + ₹50 min top-up.</li>
            <li>Card validity: <strong className="text-slate-200">7 years</strong> from purchase date.</li>
            <li>Peak discount (5%): 8:00 AM – 11:00 AM & 5:00 PM – 8:00 PM (Mon–Sat).</li>
            <li>Off-Peak discount (10%): All other times, Sundays, and national holidays.</li>
            <li>Children under <strong className="text-slate-200">3 feet (90 cm)</strong> travel free of cost.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
