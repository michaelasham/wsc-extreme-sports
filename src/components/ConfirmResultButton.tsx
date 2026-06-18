"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmSession } from "@/app/actions/sessions";

export function ConfirmResultButton({ sessionId }: { sessionId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    startTransition(async () => {
      await confirmSession(sessionId);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleConfirm}
      disabled={isPending}
      className="btn-primary w-full disabled:opacity-60"
    >
      {isPending ? "Confirming…" : "Confirm & Save to Leaderboard"}
    </button>
  );
}
