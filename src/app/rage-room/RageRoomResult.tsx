"use client";

import { DemoNavigation } from "@/components/DemoNavigation";
import { PageHeader, PageShell } from "@/components/PageShell";
import { RageResultCard } from "@/components/RageResultCard";
import { latestSessionResult } from "@/lib/demo-data";

export function RageRoomResult() {
  return (
    <PageShell variant="cinematic">
      <div className="mb-6">
        <DemoNavigation />
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <span className="status-pill status-pill--complete">Session Complete</span>
        <span className="status-pill status-pill--ai">AI Judge Result</span>
      </div>

      <PageHeader
        eyebrow="Rage Room"
        title="Destruction Core Results"
        subtitle="AI-powered scoring · Staff review enabled"
      />

      <RageResultCard result={latestSessionResult} />
    </PageShell>
  );
}
