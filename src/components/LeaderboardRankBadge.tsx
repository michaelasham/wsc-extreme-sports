interface LeaderboardRankBadgeProps {
  rank: number;
  size?: "md" | "lg";
}

export function LeaderboardRankBadge({ rank, size = "md" }: LeaderboardRankBadgeProps) {
  const styles: Record<number, string> = {
    1: "bg-gradient-to-br from-amber-400 to-yellow-600 text-amber-950 shadow-[0_0_20px_rgba(251,191,36,0.4)]",
    2: "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900",
    3: "bg-gradient-to-br from-orange-400 to-amber-700 text-orange-950",
  };

  const sizeClass =
    size === "lg"
      ? "h-14 w-14 text-2xl sm:h-16 sm:w-16 sm:text-3xl"
      : "h-12 w-12 text-xl sm:h-14 sm:w-14 sm:text-2xl";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl font-black ${sizeClass} ${
        styles[rank] ?? "bg-white/10 text-white/80"
      }`}
    >
      #{rank}
    </div>
  );
}
