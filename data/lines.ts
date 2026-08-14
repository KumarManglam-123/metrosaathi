import { MetroLine } from "@/lib/types";

export interface LineMeta {
  id: MetroLine;
  name: string;
  kannadaName: string;
  color: string;
  colorHex: string;
  textHex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeBg: string;
  terminals: [string, string];
  totalStations: number;
  operationalYear: number;
}

export const METRO_LINES: Record<MetroLine, LineMeta> = {
  purple: {
    id: "purple",
    name: "Purple Line",
    kannadaName: "ನೇರಳೆ ಮಾರ್ಗ",
    color: "purple",
    colorHex: "#78288C",
    textHex: "#E9D5FF",
    bgClass: "bg-[#78288C]",
    textClass: "text-[#C084FC]",
    borderClass: "border-[#78288C]",
    badgeBg: "bg-[#78288C]/15 text-[#D8B4FE] border-[#78288C]/30",
    terminals: ["challaghatta", "whitefield-kadugodi"],
    totalStations: 37,
    operationalYear: 2011,
  },
  green: {
    id: "green",
    name: "Green Line",
    kannadaName: "ಹಸಿರು ಮಾರ್ಗ",
    color: "green",
    colorHex: "#008A3B",
    textHex: "#BBF7D0",
    bgClass: "bg-[#008A3B]",
    textClass: "text-[#4ADE80]",
    borderClass: "border-[#008A3B]",
    badgeBg: "bg-[#008A3B]/15 text-[#86EFAC] border-[#008A3B]/30",
    terminals: ["madavara", "silk-institute"],
    totalStations: 32,
    operationalYear: 2014,
  },
  yellow: {
    id: "yellow",
    name: "Yellow Line",
    kannadaName: "ಹಳದಿ ಮಾರ್ಗ",
    color: "yellow",
    colorHex: "#F5A623",
    textHex: "#FEF08A",
    bgClass: "bg-[#F5A623]",
    textClass: "text-[#FACC15]",
    borderClass: "border-[#F5A623]",
    badgeBg: "bg-[#F5A623]/15 text-[#FDE047] border-[#F5A623]/30",
    terminals: ["rv-road", "bommasandra"],
    totalStations: 16,
    operationalYear: 2025,
  },
};
