"use client";

import type { LeaderboardMode } from "@/lib/types";

interface LeaderboardToggleProps {
  mode: LeaderboardMode;
  onChange: (mode: LeaderboardMode) => void;
}

export function LeaderboardToggle({ mode, onChange }: LeaderboardToggleProps) {
  return (
    <div
      className="leaderboard-toggle glass-card mx-auto flex w-full max-w-md p-1 sm:max-w-lg sm:p-1.5"
      role="tablist"
      aria-label="Leaderboard mode"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "cabin"}
        onClick={() => onChange("cabin")}
        className={[
          "leaderboard-toggle-btn flex-1 rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wide transition-all sm:px-4 sm:py-3 sm:text-sm",
          mode === "cabin" ? "leaderboard-toggle-btn--active" : "",
        ].join(" ")}
      >
        Cabin Leaderboard
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "camper"}
        onClick={() => onChange("camper")}
        className={[
          "leaderboard-toggle-btn flex-1 rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-wide transition-all sm:px-4 sm:py-3 sm:text-sm",
          mode === "camper" ? "leaderboard-toggle-btn--active" : "",
        ].join(" ")}
      >
        Camper Leaderboard
      </button>
    </div>
  );
}
