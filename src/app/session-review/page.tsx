export const dynamic = "force-dynamic";

import { DemoNavigation } from "@/components/DemoNavigation";
import { PageHeader, PageShell } from "@/components/PageShell";
import { SessionMediaReview } from "@/components/SessionMediaReview";
import { getSessionResult } from "@/lib/queries";

interface Props {
  searchParams: Promise<{ session?: string }>;
}

export default async function SessionReviewPage({ searchParams }: Props) {
  const { session: sessionId } = await searchParams;
  const result = sessionId ? await getSessionResult(sessionId) : null;

  const camper = result?.camper ?? "—";
  const cabinLabel = result
    ? `Cabin ${result.cabin.number} — ${result.cabin.name}`
    : "—";
  const notes = result?.aiNotes ?? [];
  const sessionData = result as (typeof result & {
    beforeImagePath?: string;
    afterImagePath?: string;
  }) | null;

  return (
    <PageShell variant="default">
      <div className="mb-6">
        <DemoNavigation />
      </div>

      <PageHeader
        eyebrow="Session Review"
        title="AI Judge Result Card"
        subtitle="How the AI evaluated this Rage Room session"
      />

      <SessionMediaReview
        camper={camper}
        cabinLabel={cabinLabel}
        notes={notes}
        beforeImageUrl={sessionData?.beforeImagePath ? `/media/${sessionData.beforeImagePath}` : undefined}
        afterImageUrl={sessionData?.afterImagePath ? `/media/${sessionData.afterImagePath}` : undefined}
      />
    </PageShell>
  );
}
