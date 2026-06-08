import type { BadgeVariant } from "@/lib/types";

const variantStyles: Record<BadgeVariant, string> = {
  gold: "bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.25)]",
  blue: "bg-sky-500/20 text-sky-300 border-sky-400/40",
  green: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(52,211,153,0.2)]",
  purple: "bg-violet-500/20 text-violet-300 border-violet-400/40",
  orange: "bg-orange-500/20 text-orange-300 border-orange-400/40 shadow-[0_0_12px_rgba(251,146,60,0.25)]",
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

export function Badge({ label, variant = "gold", size = "sm" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border font-semibold uppercase tracking-wide",
        variantStyles[variant],
        size === "sm" ? "px-2.5 py-0.5 text-[10px] sm:text-xs" : "px-3 py-1 text-xs sm:text-sm",
      ].join(" ")}
    >
      {label}
    </span>
  );
}
