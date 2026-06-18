import { STAFF_DISCLAIMER, aiJudgeNotes } from "@/lib/demo-data";

interface SessionMediaReviewProps {
  notes?: string[];
  camper?: string;
  cabinLabel?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
}

function MediaPlaceholder({
  label,
  type,
  aspect = "photo",
}: {
  label: string;
  type: "before" | "after" | "video";
  aspect?: "photo" | "video";
}) {
  const icons = {
    before: "📷",
    after: "📸",
    video: "🎬",
  };

  const gradients = {
    before: "from-slate-700/80 to-slate-800/80",
    after: "from-orange-900/40 to-red-900/40",
    video: "from-violet-900/40 to-indigo-900/40",
  };

  return (
    <div
      className={`media-placeholder glass-subtle flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${gradients[type]} ${
        aspect === "video" ? "aspect-video" : "aspect-[4/3]"
      } p-6`}
    >
      <span className="mb-3 text-4xl opacity-60" role="img" aria-hidden>
        {icons[type]}
      </span>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
        {label}
      </p>
      <p className="mt-1 text-sm text-white/30">Placeholder</p>
    </div>
  );
}

function RealImage({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-2xl aspect-[4/3] bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={label} className="h-full w-full object-cover" />
    </div>
  );
}

export function SessionMediaReview({
  notes = aiJudgeNotes,
  camper = "Daniel N.",
  cabinLabel = "Cabin 7 — Lions",
  beforeImageUrl,
  afterImageUrl,
}: SessionMediaReviewProps) {
  return (
    <div className="w-full space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-400/80">
          AI Judge Review
        </p>
        <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
          Session Media
        </h2>
        <p className="mt-2 text-sm text-white/60">
          {camper} · {cabinLabel}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {beforeImageUrl ? (
          <RealImage src={beforeImageUrl} label="Before Photo" />
        ) : (
          <MediaPlaceholder label="Before Photo" type="before" />
        )}
        {afterImageUrl ? (
          <RealImage src={afterImageUrl} label="After Photo" />
        ) : (
          <MediaPlaceholder label="After Photo" type="after" />
        )}
      </div>

      <MediaPlaceholder label="Video Clip (Optional)" type="video" aspect="video" />

      <div className="glass-card p-4 sm:p-6">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-orange-300/70">
          AI Notes
        </h3>
        <ul className="space-y-3">
          {notes.map((note, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl bg-white/5 px-4 py-3"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs text-emerald-400">
                ✓
              </span>
              <span className="text-sm text-white/80 sm:text-base">{note}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center">
        <p className="text-xs text-white/50 sm:text-sm">{STAFF_DISCLAIMER}</p>
      </div>
    </div>
  );
}
