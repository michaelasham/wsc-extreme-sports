"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CabinLeaderboard } from "@/components/CabinLeaderboard";
import { CamperLeaderboard } from "@/components/CamperLeaderboard";
import { LeaderboardToggle } from "@/components/LeaderboardToggle";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cabins, campers } from "@/lib/demo-data";
import type { LeaderboardMode } from "@/lib/types";

export function LeaderboardView() {
  const [mode, setMode] = useState<LeaderboardMode>("cabin");
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <LeaderboardToggle mode={mode} onChange={setMode} />
      </div>

      <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-400/80">
            {mode === "cabin" ? "Cabin Clash" : "Individual Standings"}
          </p>
          <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl lg:text-5xl">
            {mode === "cabin" ? "Cabin Leaderboard" : "Camper Leaderboard"}
          </h2>
        </div>
        <p className="text-sm text-white/50 lg:text-base">
          Last updated:{" "}
          <span className="font-medium text-emerald-400">Live demo</span>
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -12 }}
          transition={{ duration: reducedMotion ? 0 : 0.25 }}
        >
          {mode === "cabin" ? (
            <CabinLeaderboard cabins={cabins} />
          ) : (
            <CamperLeaderboard campers={campers} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
