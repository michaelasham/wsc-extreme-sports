import { DemoNavigation } from "@/components/DemoNavigation";
import { PageHeader, PageShell } from "@/components/PageShell";
import { LeaderboardView } from "./LeaderboardView";

export default function LeaderboardPage() {
  return (
    <PageShell variant="leaderboard">
      <div className="mb-6">
        <DemoNavigation />
      </div>

      <PageHeader
        eyebrow="WSC Extreme Sports"
        title="Live Rankings"
        subtitle="Cabins and campers compete through AI-scored Rage Room sessions"
      />

      <LeaderboardView />
    </PageShell>
  );
}
