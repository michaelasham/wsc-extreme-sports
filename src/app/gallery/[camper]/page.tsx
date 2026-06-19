import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface SessionRow {
  session_id: string;
  status: string;
  total_score: number | null;
  ai_overall_score: number | null;
  ai_badges: { name: string; description: string }[] | null;
  created_at: string;
  camper_name: string;
  cabin_number: number;
  before_path: string | null;
  after_path: string | null;
}

interface HighlightRow {
  session_id: string;
  rel_path: string;
  capture_order: number;
}

async function getCamperGallery(slug: string) {
  const name = decodeURIComponent(slug);

  const sessions = (await db.execute(sql`
    SELECT
      rs.id              AS session_id,
      rs.status,
      rs.total_score,
      rs.ai_overall_score,
      rs.ai_badges,
      rs.created_at,
      ca.name            AS camper_name,
      cb.number          AS cabin_number,
      bm.rel_path        AS before_path,
      am.rel_path        AS after_path
    FROM rage_sessions rs
    JOIN campers ca ON ca.id = rs.camper_id
    JOIN cabins  cb ON cb.id = rs.cabin_id
    LEFT JOIN media bm ON bm.id = rs.before_media_id
    LEFT JOIN media am ON am.id = rs.after_media_id
    WHERE ca.name ILIKE ${name}
    ORDER BY rs.created_at DESC
  `)) as unknown as SessionRow[];

  if (!sessions.length) return null;

  const sessionIds = sessions.map((s) => s.session_id);

  const highlights = (await db.execute(sql`
    SELECT
      sh.session_id,
      m.rel_path,
      sh.capture_order
    FROM session_highlights sh
    JOIN media m ON m.id = sh.media_id
    WHERE sh.session_id = ANY(${sessionIds})
    ORDER BY sh.session_id, sh.capture_order
  `)) as unknown as HighlightRow[];

  const highlightsBySession = new Map<string, HighlightRow[]>();
  for (const h of highlights) {
    const arr = highlightsBySession.get(h.session_id) ?? [];
    arr.push(h);
    highlightsBySession.set(h.session_id, arr);
  }

  return { sessions, highlightsBySession, camperName: sessions[0].camper_name, cabinNumber: sessions[0].cabin_number };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ camper: string }>;
}): Promise<Metadata> {
  const { camper } = await params;
  return { title: `${decodeURIComponent(camper)} — WSC Extreme Sports` };
}

export default async function CamperGalleryPage({
  params,
}: {
  params: Promise<{ camper: string }>;
}) {
  const { camper } = await params;
  const data = await getCamperGallery(camper);
  if (!data) notFound();

  const { sessions, highlightsBySession, camperName, cabinNumber } = data;

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-400/80">
            WSC Extreme Sports
          </p>
          <h1 className="text-3xl font-black text-white">{camperName}</h1>
          <p className="text-sm text-white/50">Cabin {cabinNumber}</p>
          <p className="text-xs text-white/30">
            {sessions.length} session{sessions.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Sessions */}
        {sessions.map((s) => {
          const hl = highlightsBySession.get(s.session_id) ?? [];
          const date = new Date(s.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const badges = (s.ai_badges ?? []) as { name: string; description: string }[];

          return (
            <div
              key={s.session_id}
              className="glass-card overflow-hidden divide-y divide-white/10"
            >
              {/* Session header */}
              <div className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-white/40">{date}</p>
                  {badges.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {badges.map((b) => (
                        <span
                          key={b.name}
                          title={b.description}
                          className="rounded-full bg-orange-500/20 border border-orange-500/30 px-2 py-0.5 text-[11px] font-semibold text-orange-300"
                        >
                          {b.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {s.total_score != null && (
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-black tabular-nums text-orange-400">
                      {s.total_score}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      pts
                    </p>
                  </div>
                )}
              </div>

              {/* Before / After */}
              {(s.before_path || s.after_path) && (
                <div className="p-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                    Before &amp; After
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { path: s.before_path, label: "Before" },
                      { path: s.after_path, label: "After" },
                    ].map(({ path, label }) =>
                      path ? (
                        <div key={label} className="space-y-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/media/${path}`}
                            alt={label}
                            className="aspect-[4/3] w-full rounded-lg object-cover"
                          />
                          <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-white/40">
                            {label}
                          </p>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}

              {/* Highlights */}
              {hl.length > 0 && (
                <div className="p-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                    Highlights · {hl.length} frames
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                    {hl.map((h, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={h.capture_order}
                        src={`/media/${h.rel_path}`}
                        alt={`Frame ${i + 1}`}
                        className="aspect-[4/3] w-full rounded-md object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
