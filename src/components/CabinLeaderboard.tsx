"use client";

import { Badge } from "@/components/Badge";
import { LeaderboardRankBadge } from "@/components/LeaderboardRankBadge";
import { useInView } from "@/hooks/useInView";
import type { Cabin } from "@/lib/types";

interface CabinLeaderboardProps {
  cabins: Cabin[];
}

function CabinCard({ cabin, index }: { cabin: Cabin; index: number }) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={[
        "leaderboard-card glass-card flex items-center gap-4 p-4 sm:gap-6 sm:p-6 lg:p-7",
        cabin.isHighlighted ? "leaderboard-card--highlight" : "",
        isInView ? "leaderboard-card--visible" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <LeaderboardRankBadge rank={cabin.rank} size="lg" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-2xl sm:text-3xl lg:text-4xl" role="img" aria-hidden>
            {cabin.mascot}
          </span>
          <div>
            <h3 className="text-lg font-bold text-white sm:text-xl lg:text-2xl">
              Cabin {cabin.number} — {cabin.name}
            </h3>
            {cabin.isHighlighted && (
              <p className="text-xs font-medium text-orange-300 sm:text-sm">
                Latest session result
              </p>
            )}
          </div>
        </div>

        {cabin.badges && cabin.badges.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
            {cabin.badges.map((badge) => (
              <Badge key={badge.id} label={badge.label} variant={badge.variant} />
            ))}
          </div>
        )}
      </div>

      <div className="text-right">
        <p className="font-mono text-2xl font-black tabular-nums text-white sm:text-3xl lg:text-5xl">
          {cabin.points.toLocaleString()}
        </p>
        <p className="text-xs font-medium uppercase tracking-wider text-white/50 sm:text-sm">
          pts
        </p>
      </div>
    </div>
  );
}

export function CabinLeaderboard({ cabins }: CabinLeaderboardProps) {
  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-5">
      {cabins.map((cabin, index) => (
        <CabinCard key={cabin.id} cabin={cabin} index={index} />
      ))}
    </div>
  );
}
