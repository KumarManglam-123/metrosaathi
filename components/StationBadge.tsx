import { METRO_LINES } from "@/data/lines";
import { MetroLine } from "@/lib/types";
import React from "react";

interface StationBadgeProps {
  lines: MetroLine[];
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

export function StationBadge({ lines, size = "md", showName = false }: StationBadgeProps) {
  const isInterchange = lines.length > 1;

  const dotSizeClasses = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const badgePadding = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs font-medium",
    lg: "px-3 py-1.5 text-sm font-medium",
  };

  if (!showName) {
    return (
      <div className="flex items-center gap-1.5">
        {lines.map((line) => {
          const meta = METRO_LINES[line];
          return (
            <span
              key={line}
              title={meta?.name || line}
              className={`inline-block rounded-full ring-2 ring-slate-900/60 shadow-sm ${dotSizeClasses[size]} ${
                line === "purple"
                  ? "bg-[#78288C]"
                  : line === "green"
                  ? "bg-[#008A3B]"
                  : "bg-[#F5A623]"
              }`}
            />
          );
        })}
      </div>
    );
  }

  if (isInterchange) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 ${badgePadding[size]}`}
      >
        <div className="flex -space-x-1">
          {lines.map((line) => (
            <span
              key={line}
              className={`inline-block rounded-full ring-1 ring-slate-900 ${
                dotSizeClasses[size]
              } ${
                line === "purple"
                  ? "bg-[#78288C]"
                  : line === "green"
                  ? "bg-[#008A3B]"
                  : "bg-[#F5A623]"
              }`}
            />
          ))}
        </div>
        <span>Interchange Junction</span>
      </div>
    );
  }

  const singleLine = lines[0];
  const meta = METRO_LINES[singleLine];

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border ${meta?.badgeBg || "bg-slate-800 text-slate-300 border-slate-700"} ${badgePadding[size]}`}
    >
      <span
        className={`inline-block rounded-full ${dotSizeClasses[size]} ${
          singleLine === "purple"
            ? "bg-[#78288C]"
            : singleLine === "green"
            ? "bg-[#008A3B]"
            : "bg-[#F5A623]"
        }`}
      />
      <span>{meta?.name || singleLine}</span>
    </div>
  );
}
