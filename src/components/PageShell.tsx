interface PageShellProps {
  children: React.ReactNode;
  variant?: "default" | "cinematic" | "leaderboard";
}

export function PageShell({ children, variant = "default" }: PageShellProps) {
  const bgClass =
    variant === "cinematic"
      ? "page-bg-cinematic"
      : variant === "leaderboard"
        ? "page-bg-leaderboard"
        : "page-bg-default";

  return (
    <div className={`${bgClass} min-h-full flex-1`}>
      <div className="page-noise pointer-events-none fixed inset-0 opacity-[0.03]" />
      <div className="relative mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {children}
      </div>
    </div>
  );
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <header className="mb-8 text-center sm:mb-10">
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-orange-400/80 sm:text-sm">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/60 sm:text-base">
          {subtitle}
        </p>
      )}
    </header>
  );
}
