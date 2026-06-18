"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useCountUp } from "@/hooks/useCountUp";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface AnimatedRageMeterProps {
  score: number;
  maxScore?: number;
  delay?: number;
}

const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${12 + (i * 11) % 76}%`,
  delay: `${i * 0.35}s`,
  duration: `${1.8 + (i % 3) * 0.4}s`,
}));

export function AnimatedRageMeter({
  score,
  maxScore = 10,
  delay = 200,
}: AnimatedRageMeterProps) {
  const { ref, isInView } = useInView(0.2);
  const reducedMotion = usePrefersReducedMotion();
  const hasAnimated = useRef(false);
  const [started, setStarted] = useState(false);
  const [complete, setComplete] = useState(false);

  const targetPercent = Math.min((score / maxScore) * 100, 100);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    if (reducedMotion) {
      setStarted(true);
      setComplete(true);
      return;
    }

    const startTimer = setTimeout(() => setStarted(true), delay);
    const completeTimer = setTimeout(() => setComplete(true), delay + 2200);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(completeTimer);
    };
  }, [isInView, reducedMotion, delay]);

  const displayScore = useCountUp({
    end: score,
    decimals: 1,
    duration: reducedMotion ? 0 : 2000,
    delay: reducedMotion ? 0 : delay,
    enabled: isInView,
  });

  const displayPercent = useCountUp({
    end: targetPercent,
    decimals: 0,
    duration: reducedMotion ? 0 : 2000,
    delay: reducedMotion ? 0 : delay,
    enabled: isInView,
  });

  return (
    <div ref={ref} className="w-full">
      <div className="mb-4 text-center sm:mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-400/80 sm:text-sm">
          Mission Score
        </p>
        <p className="mt-2 font-mono text-5xl font-black tabular-nums text-white sm:text-6xl lg:text-7xl">
          {displayScore.toFixed(1)}
          <span className="text-2xl font-normal text-white/40 sm:text-3xl lg:text-4xl">
            {" "}
            / {maxScore}
          </span>
        </p>
        <p className="mt-2 text-sm font-semibold text-orange-300 sm:text-base">
          {displayPercent.toFixed(0)}% Mission Complete
        </p>
      </div>

      <div className="flex justify-center">
        <div
          className={[
            "canister relative",
            complete ? "canister--complete" : "",
          ].join(" ")}
        >
          <div className="canister-cap">
            <div className="canister-cap-inner" />
            <span className="canister-label">Mission Meter</span>
          </div>

          <div className="canister-body">
            <div className="canister-shine" aria-hidden />

            <div className="canister-ticks" aria-hidden>
              {[100, 75, 50, 25, 0].map((tick) => (
                <div key={tick} className="canister-tick">
                  <span>{tick}</span>
                </div>
              ))}
            </div>

            <motion.div
              className="canister-fill"
              initial={{ height: "0%" }}
              animate={{ height: started ? `${targetPercent}%` : "0%" }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { duration: 2.2, ease: [0.22, 1, 0.36, 1] }
              }
            >
              {!reducedMotion && (
                <>
                  <div className="canister-wave canister-wave--1" />
                  <div className="canister-wave canister-wave--2" />
                  {PARTICLES.map((p) => (
                    <span
                      key={p.id}
                      className="canister-particle"
                      style={{
                        left: p.left,
                        animationDelay: p.delay,
                        animationDuration: p.duration,
                      }}
                    />
                  ))}
                </>
              )}
            </motion.div>

            <div className="canister-empty-glow" aria-hidden />
          </div>

          <div className="canister-base">
            <span className="canister-sublabel">Impact Core</span>
          </div>
        </div>
      </div>
    </div>
  );
}
