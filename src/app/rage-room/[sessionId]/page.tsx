import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, PageShell } from "@/components/PageShell";
import { RageResultCard } from "@/components/RageResultCard";
import { getSessionResult } from "@/lib/queries";
import { ConfirmResultButton } from "@/components/ConfirmResultButton";

export default async function SessionRagePage(
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  const result = await getSessionResult(sessionId);
  if (!result) notFound();

  return (
    <PageShell variant="cinematic">
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <span
          className={`status-pill ${result.sessionComplete ? "status-pill--complete" : "status-pill--pending"}`}
        >
          {result.sessionComplete ? "Session Complete" : "Pending Review"}
        </span>
        <span className="status-pill status-pill--ai">AI Judge Result</span>
      </div>

      <PageHeader
        eyebrow="Rage Room"
        title="Destruction Core Results"
        subtitle="AI-powered scoring · Staff review enabled"
      />

      <RageResultCard result={result} hideActions />

      <div className="mx-auto mt-8 w-full max-w-md flex flex-col gap-3 lg:max-w-lg">
        {result.sessionComplete ? (
          <>
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-center text-sm font-semibold text-emerald-300">
              ✓ Saved to leaderboard
            </div>
            <Link href="/new-session" className="btn-primary w-full text-center">
              Next Camper →
            </Link>
            <Link href="/leaderboard" className="btn-secondary w-full text-center">
              View Leaderboard
            </Link>
          </>
        ) : (
          <ConfirmResultButton sessionId={sessionId} aiPoints={result.scores.points} />
        )}
      </div>
    </PageShell>
  );
}
