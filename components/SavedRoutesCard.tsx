"use client";

import { Bookmark, BookmarkCheck, ArrowRight, Trash2, LogIn, Loader2, Sparkles, Navigation, Calendar } from "lucide-react";
import React, { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface SavedRouteItem {
  id: number;
  userId: string;
  fromStationId: string;
  fromStationName: string;
  fromStationKannada: string | null;
  toStationId: string;
  toStationName: string;
  toStationKannada: string | null;
  createdAt: string;
}

interface SavedRoutesCardProps {
  user: User | null;
  onOpenAuth: () => void;
  onSelectRoute: (fromId: string, toId: string) => void;
}

export function SavedRoutesCard({
  user,
  onOpenAuth,
  onSelectRoute,
}: SavedRoutesCardProps) {
  const [savedRoutes, setSavedRoutes] = useState<SavedRouteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchSavedRoutes = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const res = await fetch("/api/saved-routes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setSavedRoutes(data.savedRoutes || []);
      }
    } catch (err) {
      console.error("Failed to load saved routes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSavedRoutes();
    } else {
      setSavedRoutes([]);
    }
  }, [user]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    setDeletingId(id);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const res = await fetch(`/api/saved-routes?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setSavedRoutes((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete route:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="glass-panel rounded-3xl p-8 text-center space-y-4 shadow-xl border border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/30">
          <Bookmark className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <h3 className="text-lg font-bold text-white">Sign In to Save Your Routes</h3>
          <p className="text-xs text-slate-400">
            Log in to save your daily office commutes, frequent metro trips, and access them seamlessly from any device.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAuth}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white text-xs font-bold transition shadow-lg inline-flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In / Register</span>
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl p-5 md:p-6 shadow-xl space-y-4 border border-slate-800">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-emerald-400" />
            My Saved Commutes ({savedRoutes.length})
          </h3>
          <p className="text-xs text-slate-400">
            Synced with your Supabase PostgreSQL account.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSavedRoutes}
          disabled={loading}
          className="text-xs text-purple-400 hover:text-purple-300 font-medium px-2.5 py-1 rounded-lg hover:bg-slate-800 transition flex items-center gap-1"
        >
          {loading && <Loader2 className="w-3 h-3 animate-spin" />}
          <span>Refresh</span>
        </button>
      </div>

      {loading && savedRoutes.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
          <span>Loading your saved routes...</span>
        </div>
      ) : savedRoutes.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
            <Bookmark className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-400">
            You don&apos;t have any saved routes yet. Search for a route above and click <strong className="text-purple-300">&quot;Save Route&quot;</strong> to store it here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {savedRoutes.map((item) => {
            const formattedDate = new Date(item.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            });

            return (
              <div
                key={item.id}
                onClick={() => onSelectRoute(item.fromStationId, item.toStationId)}
                className="glass-panel glass-panel-hover rounded-2xl p-4 cursor-pointer group flex flex-col justify-between relative border border-slate-800 hover:border-purple-500/40"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-3 h-3" />
                      Saved {formattedDate}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      disabled={deletingId === item.id}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Delete saved route"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="truncate">{item.fromStationName}</span>
                    </div>

                    <div className="pl-1 text-slate-500">
                      <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition" />
                    </div>

                    <div className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <span className="truncate">{item.toStationName}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="group-hover:text-purple-300 font-medium transition">
                    Click to load route
                  </span>
                  <Navigation className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
