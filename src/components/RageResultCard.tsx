"use client";

import { useCountUp } from "@/hooks/useCountUp";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { AnimatedRageMeter } from "@/components/AnimatedRageMeter";
import type { AiBadge, SessionResult } from "@/lib/types";

interface RageResultCardProps {
  result: SessionResult;
  hideActions?: boolean;
}

function ProgressBar({
  label,
  value,
  max = 100,
  delay = 0,
  color = "orange",
}: {
  label: string;
  value: number;
  max?: number;
  delay?: number;
  color?: "orange" | "blue" | "green" | "purple";
}) {
  const { ref, isInView } = useInView();
  const reducedMotion = usePrefersReducedMotion();
  const animated = useCountUp({
    end: value,
    decimals: value % 1 === 0 ? 0 : 1,
    duration: reducedMotion ? 0 : 900,
    delay: reducedMotion ? 0 : delay,
    enabled: isInView,
  });

  const pct = Math.min((value / max) * 100, 100);
  const colorMap = {
    orange: "bg-orange-500",
    blue: "bg-blue-500",
    green: "bg-emerald-500",
    purple: "bg-purple-500",
  };

  return (
    <div ref={ref}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
          {label}
        </span>
        <span className="font-mono text-sm font-bold tabular-nums text-white">
          {animated % 1 === 0 ? animated.toFixed(0) : animated.toFixed(1)}{" "}
          <span className="text-white/40">/ {max}</span>
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${colorMap[color]}`}
          style={{
            width: reducedMotion ? `${pct}%` : "0%",
            transitionDuration: "900ms",
            transitionDelay: `${delay}ms`,
            ...(isInView && !reducedMotion ? { width: `${pct}%` } : {}),
          }}
        />
      </div>
    </div>
  );
}

function BadgeChip({ badge }: { badge: AiBadge }) {
  return (
    <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2">
      <p className="text-xs font-bold text-amber-300">{badge.name}</p>
      <p className="mt-0.5 text-xs text-white/50">{badge.description}</p>
    </div>
  );
}

export function RageResultCard({ result, hideActions = false }: RageResultCardProps) {
  const { cabin, scores, badges, analysis, improvementTips, confidence } = result;
  const reducedMotion = usePrefersReducedMotion();

  const pointsDisplay = useCountUp({
    end: scores.points,
    decimals: 0,
    duration: reducedMotion ? 0 : 1400,
    delay: reducedMotion ? 0 : 300,
    enabled: true,
  });

  return (
    <div className="w-full">
      <div className="result-card glass-card mx-auto max-w-2xl p-5 sm:p-8 lg:max-w-4xl lg:p-10">
        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-400/80">
            AI Judge · Image Analysis
          </p>
          <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
            Cabin {cabin.number}
          </h2>
          <p className="mt-1 text-sm text-white/60">{result.camper}</p>
          {confidence > 0 && (
            <p className="mt-1 text-xs text-white/30">
              AI confidence: {Math.round(confidence * 100)}%
            </p>
          )}
        </div>

        {/* Meter + metrics */}
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10 lg:items-start">
          {/* Left: mission meter + points */}
          <div>
            <AnimatedRageMeter score={scores.overallScore} maxScore={100} />
            <div className="mt-4 rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-300/70 mb-1">
                Points Earned
              </p>
              <p className="font-mono text-4xl font-black tabular-nums text-white">
                {pointsDisplay.toFixed(0)}
                <span className="text-xl font-normal text-white/40"> / 1000</span>
              </p>
              {scores.manualAdjustment !== 0 && (
                <p className="mt-1 text-xs text-white/40">
                  AI: {scores.points - scores.manualAdjustment} pts
                  {scores.manualAdjustment > 0 ? " + " : " − "}
                  {Math.abs(scores.manualAdjustment)} staff adj.
                </p>
              )}
            </div>
          </div>

          {/* Right: breakdown bars */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-300/70">
              Score Breakdown
            </p>
            <ProgressBar
              label="Target Completion"
              value={scores.targetCompletion}
              max={100}
              delay={400}
              color="orange"
            />
            <ProgressBar
              label="Destruction Severity"
              value={scores.destructionSeverity}
              max={100}
              delay={550}
              color="blue"
            />
            <ProgressBar
              label="Impact Score"
              value={scores.impactScore}
              max={10}
              delay={700}
              color="purple"
            />
            <ProgressBar
              label="Debris Spread"
              value={scores.debrisSpread}
              max={100}
              delay={850}
              color="green"
            />
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-300/70">
              Badges Earned
            </p>
            <div className="flex flex-wrap gap-2">
              {badges.map((b, i) => (
                <BadgeChip key={i} badge={b} />
              ))}
            </div>
          </div>
        )}

        {/* AI Analysis */}
        {analysis.length > 0 && (
          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-orange-300/70">
              AI Analysis
            </p>
            <ul className="space-y-1.5">
              {analysis.map((note, i) => (
                <li key={i} className="flex gap-2 text-sm text-white/60">
                  <span className="mt-px text-orange-400/60 shrink-0">·</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvement Tips */}
        {improvementTips.length > 0 && (
          <div className="mt-5 rounded-xl border border-blue-400/20 bg-blue-500/5 px-4 py-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-300/70">
              How to Score Higher
            </p>
            <ul className="space-y-1.5">
              {improvementTips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-white/60">
                  <span className="mt-px text-blue-400/60 shrink-0">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
