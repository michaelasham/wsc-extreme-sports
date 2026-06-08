"use client";

import { LeaderboardRankBadge } from "@/components/LeaderboardRankBadge";
import { useInView } from "@/hooks/useInView";
import type { Camper } from "@/lib/types";

interface CamperLeaderboardProps {
  campers: Camper[];
}

function CamperCard({ camper, index }: { camper: Camper; index: number }) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={[
        "leaderboard-card glass-card flex items-center gap-4 p-4 sm:gap-6 sm:p-6 lg:p-7",
        camper.isHighlighted ? "leaderboard-card--highlight" : "",
        isInView ? "leaderboard-card--visible" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <LeaderboardRankBadge rank={camper.rank} size="lg" />

      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold text-white sm:text-xl lg:text-2xl">
          {camper.name}
        </h3>
        <p className="mt-0.5 text-sm text-white/60 sm:text-base">
          Cabin {camper.cabinNumber} — {camper.cabinName}
        </p>
        {camper.isHighlighted && (
          <p className="mt-1 text-xs font-medium text-orange-300 sm:text-sm">
            Latest Rage Room session
          </p>
        )}
      </div>

      <div className="text-right">
        <p className="font-mono text-2xl font-black tabular-nums text-white sm:text-3xl lg:text-5xl">
          {camper.points.toLocaleString()}
        </p>
        <p className="text-xs font-medium uppercase tracking-wider text-white/50 sm:text-sm">
          pts
        </p>
      </div>
    </div>
  );
}

export function CamperLeaderboard({ campers }: CamperLeaderboardProps) {
  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-5">
      {campers.map((camper, index) => (
        <CamperCard key={camper.id} camper={camper} index={index} />
      ))}
    </div>
  );
}
