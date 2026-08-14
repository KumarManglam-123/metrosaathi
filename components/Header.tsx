"use client";

import { METRO_LINES } from "@/data/lines";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import {
  Compass,
  Headphones,
  Info,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  Phone,
  Radio,
  Share2,
  Sparkles,
  Train,
  User as UserIcon,
} from "lucide-react";
import React from "react";

interface HeaderProps {
  user: User | null;
  onOpenAuth: () => void;
  onOpenInfoModal?: () => void;
}

export function Header({ user, onOpenAuth, onOpenInfoModal }: HeaderProps) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-emerald-600 to-amber-500 p-0.5 shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Train className="w-5 h-5 text-white" />
            </div>
            {/* Pulsing indicator */}
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg md:text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                MetroSaathi
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded-md">
                BMRCL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Bangalore Metro Route Finder & Transit Companion
            </p>
          </div>
        </div>

        {/* Live Line Status Indicator */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-full px-3.5 py-1.5 text-xs text-slate-300">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium">All 3 Lines Operational:</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] text-purple-300">
              <span className="w-2 h-2 rounded-full bg-[#78288C]" />
              Purple
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-[#008A3B]" />
              Green
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-[11px] text-amber-300">
              <span className="w-2 h-2 rounded-full bg-[#F5A623]" />
              Yellow
            </span>
          </div>
        </div>

        {/* User Auth, Helpline & Info */}
        <div className="flex items-center gap-2 text-xs">
          {/* User Auth state */}
          {user ? (
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1">
              <div className="w-6 h-6 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-slate-300 font-medium max-w-[100px] truncate hidden md:inline">
                {user.email?.split("@")[0]}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-slate-400 hover:text-rose-400 p-1 transition"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition shadow-md"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          <a
            href="tel:180042512345"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            title="BMRCL Toll-Free Helpline: 1800-425-12345"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-200">1800-425-12345</span>
          </a>

          {onOpenInfoModal && (
            <button
              type="button"
              onClick={onOpenInfoModal}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
              title="About MetroSaathi & Namma Metro info"
            >
              <Info className="w-4 h-4 text-purple-400" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
