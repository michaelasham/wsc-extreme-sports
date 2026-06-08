"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatedRageMeter } from "@/components/AnimatedRageMeter";
import { useCountUp } from "@/hooks/useCountUp";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { SessionResult } from "@/lib/types";

interface RageResultCardProps {
  result: SessionResult;
}

interface SubMetricProps {
  label: string;
  value: string;
}

function SubMetric({ label, value }: SubMetricProps) {
  return (
    <div className="glass-subtle flex items-center justify-between rounded-xl px-4 py-3 sm:px-5 sm:py-3.5">
      <span className="text-xs font-medium uppercase tracking-wider text-white/60 sm:text-sm">
        {label}
      </span>
      <span className="font-mono text-base font-bold tabular-nums text-white sm:text-lg">
        {value}
      </span>
    </div>
  );
}

function AnimatedSubMetric({
  label,
  end,
  decimals = 1,
  max,
  suffix = "",
  delay = 0,
  enabled,
}: {
  label: string;
  end: number;
  decimals?: number;
  max?: number;
  suffix?: string;
  delay?: number;
  enabled: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const value = useCountUp({
    end,
    decimals,
    delay: reducedMotion ? 0 : delay,
    duration: reducedMotion ? 0 : 1200,
    enabled,
  });

  const formatted =
    max !== undefined
      ? `${value.toFixed(decimals)} / ${max}`
      : `${value.toFixed(decimals)}${suffix}`;

  return <SubMetric label={label} value={formatted} />;
}

export function RageResultCard({ result }: RageResultCardProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const { cabin, scores, rankMovement } = result;
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="w-full">
      <div className="result-card glass-card mx-auto max-w-2xl p-5 sm:p-8 lg:max-w-4xl lg:p-10">
        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-400/80">
            AI Judge Result · Session Complete
          </p>
          <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
            Cabin {cabin.number} — {cabin.name}
          </h2>
          <p className="mt-1 text-sm text-white/60">{result.camper}</p>
        </div>

        {/* Meter + sub-metrics layout */}
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10 lg:items-start">
          <AnimatedRageMeter
            score={scores.rageScore}
            maxScore={scores.rageScoreMax}
          />

          <div className="space-y-2.5 sm:space-y-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-orange-300/70">
              Score Breakdown
            </p>

            <AnimatedSubMetric
              label="Destruction Level"
              end={scores.destructionLevel}
              decimals={0}
              suffix="%"
              delay={600}
              enabled
            />
            <AnimatedSubMetric
              label="Team Energy"
              end={scores.teamEnergy}
              max={scores.teamEnergyMax}
              delay={750}
              enabled
            />
            <AnimatedSubMetric
              label="Safety Discipline"
              end={scores.safetyDiscipline}
              max={scores.safetyDisciplineMax}
              delay={900}
              enabled
            />

            <div className="flex items-center justify-between rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 sm:px-5 sm:py-3.5">
              <span className="text-xs font-medium uppercase tracking-wider text-amber-200 sm:text-sm">
                Creativity Bonus
              </span>
              <span className="font-mono text-base font-bold text-amber-300 sm:text-lg">
                +{scores.creativityBonus} pts
              </span>
            </div>

            <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-4 text-center sm:px-5 sm:py-5">
              <p
                className={[
                  "text-sm font-semibold text-emerald-300 sm:text-base lg:text-lg",
                  !reducedMotion ? "animate-fade-in" : "",
                ].join(" ")}
                style={{ animationDelay: "1.8s" }}
              >
                Cabin {cabin.number} climbed from #{rankMovement.previousRank} to #
                {rankMovement.currentRank}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:mt-10 lg:max-w-lg">
        <button
          type="button"
          onClick={() => setShowAdjust(!showAdjust)}
          className="btn-secondary w-full"
        >
          Adjust Score
        </button>

        {showAdjust && (
          <div className="animate-fade-in glass-subtle rounded-xl p-4 text-center text-sm text-white/70">
            Staff override panel — connect to backend in production.
          </div>
        )}

        <button
          type="button"
          onClick={() => setConfirmed(true)}
          className={`btn-primary w-full ${confirmed ? "opacity-80" : ""}`}
          disabled={confirmed}
        >
          {confirmed ? "✓ Result Confirmed" : "Confirm Result"}
        </button>

        {confirmed && (
          <Link href="/leaderboard" className="btn-primary w-full text-center">
            View Updated Leaderboard →
          </Link>
        )}
      </div>
    </div>
  );
}
