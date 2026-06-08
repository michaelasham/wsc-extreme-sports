import { DemoButton, DemoNavigation } from "@/components/DemoNavigation";
import { PageHeader, PageShell } from "@/components/PageShell";
import { APP_SUBTITLE, APP_TITLE, demoNavItems } from "@/lib/demo-data";

export default function HomePage() {
  return (
    <PageShell variant="default">
      <div className="flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center">
        <div className="mb-8 w-full">
          <DemoNavigation />
        </div>

        <div className="home-hero mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-300">
              Demo Mode
            </span>
          </div>

          <PageHeader title={APP_TITLE} subtitle={APP_SUBTITLE} />

          <p className="mx-auto mt-4 max-w-lg text-sm text-white/50">
            Rage Meter · Destruction Core · Cabin Clash
          </p>
        </div>

        <div className="home-buttons w-full max-w-xl space-y-3 sm:space-y-4">
          {demoNavItems.map((item, index) => (
            <DemoButton
              key={item.href}
              href={item.href}
              label={item.label}
              description={item.description}
              variant={index === 0 ? "primary" : "secondary"}
              delay={index * 100}
            />
          ))}
        </div>

        <footer className="mt-12 text-center text-xs text-white/30">
          WSC Extreme Sports · Camp Director Demo · Mock Data
        </footer>
      </div>
    </PageShell>
  );
}
