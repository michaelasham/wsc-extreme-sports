"use client";

import { useEffect, useState } from "react";

interface UseCountUpOptions {
  end: number;
  duration?: number;
  decimals?: number;
  delay?: number;
  enabled?: boolean;
}

export function useCountUp({
  end,
  duration = 1500,
  decimals = 0,
  delay = 0,
  enabled = true,
}: UseCountUpOptions): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let startTime: number | null = null;
    let animationFrame: number;
    let timeoutId: ReturnType<typeof setTimeout>;

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(end * eased);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    timeoutId = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrame);
    };
  }, [end, duration, delay, enabled]);

  return Number(value.toFixed(decimals));
}
