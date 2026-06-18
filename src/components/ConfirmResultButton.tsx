"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmSession } from "@/app/actions/sessions";

export function ConfirmResultButton({
  sessionId,
  aiPoints,
}: {
  sessionId: string;
  aiPoints: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [adjustment, setAdjustment] = useState(0);
  const router = useRouter();

  const finalPoints = Math.max(0, aiPoints + adjustment);

  function handleConfirm() {
    startTransition(async () => {
      await confirmSession(sessionId, adjustment);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="glass-card px-4 py-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
          Staff Manual Adjustment
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAdjustment((a) => Math.max(-500, a - 10))}
            className="h-9 w-9 rounded-lg bg-white/10 text-lg font-bold text-white hover:bg-white/20 transition-colors"
          >
            −
          </button>
          <div className="flex-1 text-center">
            <p className={`font-mono text-xl font-bold ${adjustment > 0 ? "text-emerald-400" : adjustment < 0 ? "text-red-400" : "text-white/40"}`}>
              {adjustment > 0 ? "+" : ""}{adjustment} pts
            </p>
            <p className="text-xs text-white/40 mt-0.5">
              Final: <span className="text-white font-semibold">{finalPoints} pts</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAdjustment((a) => Math.min(500, a + 10))}
            className="h-9 w-9 rounded-lg bg-white/10 text-lg font-bold text-white hover:bg-white/20 transition-colors"
          >
            +
          </button>
        </div>
        {adjustment !== 0 && (
          <button
            type="button"
            onClick={() => setAdjustment(0)}
            className="mt-2 w-full text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Reset to 0
          </button>
        )}
      </div>

      <button
        onClick={handleConfirm}
        disabled={isPending}
        className="btn-primary w-full disabled:opacity-60"
      >
        {isPending ? "Confirming…" : "Confirm & Save to Leaderboard"}
      </button>
    </div>
  );
}
