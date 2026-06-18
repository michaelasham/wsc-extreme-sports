export const dynamic = "force-dynamic";

import { DemoNavigation } from "@/components/DemoNavigation";
import { PageHeader, PageShell } from "@/components/PageShell";
import { LeaderboardView } from "./LeaderboardView";
import { getCabinLeaderboard, getCamperLeaderboard } from "@/lib/queries";

export default async function LeaderboardPage() {
  const [cabins, campers] = await Promise.all([
    getCabinLeaderboard(),
    getCamperLeaderboard(),
  ]);

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

      <LeaderboardView cabins={cabins} campers={campers} />
    </PageShell>
  );
}
