"use client";

import { Station } from "@/lib/types";
import { StationBadge } from "./StationBadge";
import { ArrowRight, History, Trash2, X } from "lucide-react";
import React from "react";

export interface RecentRouteItem {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  timestamp: number;
}

interface RecentSearchesProps {
  recentRoutes: RecentRouteItem[];
  onSelectRoute: (fromId: string, toId: string) => void;
  onClearHistory: () => void;
}

export function RecentSearches({
  recentRoutes,
  onSelectRoute,
  onClearHistory,
}: RecentSearchesProps) {
  if (!recentRoutes || recentRoutes.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-slate-400">
          <History className="w-3.5 h-3.5 text-purple-400" />
          <span>Recent Searches</span>
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          className="text-slate-500 hover:text-rose-400 flex items-center gap-1 transition"
          title="Clear search history"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {recentRoutes.map((item, idx) => (
          <button
            key={`${item.fromId}-${item.toId}-${idx}`}
            type="button"
            onClick={() => onSelectRoute(item.fromId, item.toId)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-xs text-slate-200 transition group"
          >
            <span className="font-medium group-hover:text-white truncate max-w-[110px]">
              {item.fromName}
            </span>
            <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-purple-400 flex-shrink-0" />
            <span className="font-medium group-hover:text-white truncate max-w-[110px]">
              {item.toName}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
