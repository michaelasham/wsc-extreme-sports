import { DemoNavigation } from "@/components/DemoNavigation";
import { PageHeader, PageShell } from "@/components/PageShell";
import { SessionMediaReview } from "@/components/SessionMediaReview";
import { latestSessionResult } from "@/lib/demo-data";

export default function SessionReviewPage() {
  const { cabin, camper } = latestSessionResult;

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
        cabinLabel={`Cabin ${cabin.number} — ${cabin.name}`}
      />
    </PageShell>
  );
}
