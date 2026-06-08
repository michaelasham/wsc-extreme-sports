import Link from "next/link";

interface DemoNavigationProps {
  showHome?: boolean;
}

const navLinks = [
  { href: "/", label: "Home", short: "Home" },
  { href: "/rage-room", label: "Rage Room", short: "Rage" },
  { href: "/leaderboard", label: "Leaderboard", short: "Board" },
  { href: "/session-review", label: "Session Review", short: "Review" },
];

export function DemoNavigation({ showHome = true }: DemoNavigationProps) {
  const links = showHome ? navLinks : navLinks.filter((l) => l.href !== "/");

  return (
    <nav className="demo-nav glass-card mx-auto flex max-w-2xl items-center justify-center gap-1 p-1.5 sm:gap-2 sm:p-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="demo-nav-link flex-1 rounded-lg px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white/60 transition-all hover:bg-white/10 hover:text-white sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <span className="hidden sm:inline">{link.label}</span>
          <span className="sm:hidden">{link.short}</span>
        </Link>
      ))}
    </nav>
  );
}

interface DemoButtonProps {
  href: string;
  label: string;
  description: string;
  variant?: "primary" | "secondary";
  delay?: number;
}

export function DemoButton({
  href,
  label,
  description,
  variant = "primary",
  delay = 0,
}: DemoButtonProps) {
  return (
    <Link
      href={href}
      className={[
        "demo-button group block w-full rounded-2xl p-5 transition-all sm:p-6",
        variant === "primary" ? "demo-button--primary" : "demo-button--secondary",
      ].join(" ")}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="flex items-center justify-between gap-4">
        <span>
          <span className="block text-lg font-bold text-white sm:text-xl">
            {label}
          </span>
          <span className="mt-1 block text-sm text-white/60 group-hover:text-white/80">
            {description}
          </span>
        </span>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg transition-transform group-hover:translate-x-1 group-hover:bg-white/20">
          →
        </span>
      </span>
    </Link>
  );
}
