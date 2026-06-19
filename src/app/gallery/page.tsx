import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { GallerySearch } from "@/components/GallerySearch";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Camper Gallery — WSC Extreme Sports" };

interface CamperRow {
  name: string;
  cabin_number: number;
  session_count: number;
  total_score: number | null;
  latest_before: string | null;
  latest_after: string | null;
}

async function getAllCampers(): Promise<CamperRow[]> {
  return (await db.execute(sql`
    SELECT
      ca.name,
      cb.number          AS cabin_number,
      COUNT(rs.id)::int  AS session_count,
      SUM(rs.total_score)::int AS total_score,
      (
        SELECT m.rel_path
        FROM rage_sessions s2
        LEFT JOIN media m ON m.id = s2.before_media_id
        WHERE s2.camper_id = ca.id AND m.rel_path IS NOT NULL
        ORDER BY s2.created_at DESC
        LIMIT 1
      ) AS latest_before,
      (
        SELECT m.rel_path
        FROM rage_sessions s3
        LEFT JOIN media m ON m.id = s3.after_media_id
        WHERE s3.camper_id = ca.id AND m.rel_path IS NOT NULL
        ORDER BY s3.created_at DESC
        LIMIT 1
      ) AS latest_after
    FROM campers ca
    JOIN cabins cb ON cb.id = ca.cabin_id
    JOIN rage_sessions rs ON rs.camper_id = ca.id
    GROUP BY ca.id, ca.name, cb.number
    ORDER BY total_score DESC NULLS LAST
  `)) as unknown as CamperRow[];
}

export default async function GalleryIndexPage() {
  const campers = await getAllCampers();

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-400/80">
            WSC Extreme Sports
          </p>
          <h1 className="text-3xl font-black text-white">Camper Gallery</h1>
          <p className="text-sm text-white/40">
            {campers.length} camper{campers.length !== 1 ? "s" : ""} with session photos
          </p>
        </div>

        {/* Search */}
        <GallerySearch />

        {/* Grid */}
        {campers.length === 0 ? (
          <p className="text-center text-white/40">No sessions recorded yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {campers.map((c) => {
              const thumb = c.latest_after ?? c.latest_before;
              return (
                <Link
                  key={c.name}
                  href={`/gallery/${encodeURIComponent(c.name)}`}
                  className="glass-card overflow-hidden group hover:ring-1 hover:ring-orange-400/50 transition-all"
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/media/${thumb}`}
                      alt={c.name}
                      className="aspect-[4/3] w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="aspect-[4/3] w-full bg-white/5 flex items-center justify-center text-white/20 text-3xl">
                      📷
                    </div>
                  )}
                  <div className="px-3 py-2.5">
                    <p className="font-bold text-white text-sm truncate">{c.name}</p>
                    <p className="text-[11px] text-white/40">
                      Cabin {c.cabin_number} · {c.session_count} session{c.session_count !== 1 ? "s" : ""}
                    </p>
                    {c.total_score != null && (
                      <p className="text-[11px] font-semibold text-orange-400 mt-0.5">
                        {c.total_score.toLocaleString()} pts
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
