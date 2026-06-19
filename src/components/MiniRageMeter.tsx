"use client";

import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface MiniRageMeterProps {
  points: number;
  maxPoints: number;
  delay?: number;
}

export function MiniRageMeter({ points, maxPoints, delay = 0 }: MiniRageMeterProps) {
  const { ref, isInView } = useInView();
  const reducedMotion = usePrefersReducedMotion();
  const pct = maxPoints > 0 ? Math.min((points / maxPoints) * 100, 100) : 0;

  return (
    <div ref={ref} className="mt-3 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-400/70">
          Rage Meter
        </span>
        <span className="text-[10px] font-mono font-bold text-white/40">
          {Math.round(pct)}%
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 transition-[width] ease-out"
          style={{
            width: reducedMotion || !isInView ? `${reducedMotion ? pct : 0}%` : "0%",
            transitionDuration: "1000ms",
            transitionDelay: `${delay}ms`,
            ...(isInView && !reducedMotion ? { width: `${pct}%` } : {}),
          }}
        />
        {/* shimmer */}
        {isInView && pct > 0 && (
          <div
            className="absolute inset-y-0 left-0 rounded-full opacity-40"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, transparent 60%, rgba(255,255,255,0.4) 80%, transparent 100%)", animation: "shimmer 2s infinite" }}
          />
        )}
      </div>
    </div>
  );
}
