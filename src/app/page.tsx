import Link from "next/link";
import { PageHeader, PageShell } from "@/components/PageShell";
import { APP_SUBTITLE, APP_TITLE } from "@/lib/demo-data";

export default function HomePage() {
  return (
    <PageShell variant="default">
      <div className="flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center">
        <div className="home-hero mb-10 text-center">
          <PageHeader title={APP_TITLE} subtitle={APP_SUBTITLE} />
          <p className="mx-auto mt-4 max-w-lg text-sm text-white/50">
            Rage Meter · Destruction Core · Cabin Clash
          </p>
        </div>

        <div className="w-full max-w-xl space-y-3 sm:space-y-4">
          <Link
            href="/new-session"
            className="btn-primary flex w-full flex-col items-start px-6 py-5 text-left"
          >
            <span className="text-base font-bold">Start New Session →</span>
            <span className="mt-0.5 text-xs font-normal opacity-70">
              Score a camper · cabin 1–24 · AI rage meter
            </span>
          </Link>

          <Link
            href="/leaderboard"
            className="btn-secondary flex w-full flex-col items-start px-6 py-5 text-left"
          >
            <span className="text-base font-bold">View Leaderboard</span>
            <span className="mt-0.5 text-xs font-normal opacity-70">
              Live cabin &amp; camper standings
            </span>
          </Link>
        </div>

        <footer className="mt-12 text-center text-xs text-white/30">
          WSC Extreme Sports · Staff Portal
        </footer>
      </div>
    </PageShell>
  );
}
