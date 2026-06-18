"use client";

import type { Highlight } from "@/hooks/useHighlightCapture";

interface SessionHighlightsGalleryProps {
  highlights: Highlight[];
  onRemove: (id: string) => void;
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export function SessionHighlightsGallery({
  highlights,
  onRemove,
}: SessionHighlightsGalleryProps) {
  if (highlights.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/20 py-8 text-center text-sm text-white/30">
        No highlights captured yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
          {highlights.length} highlight{highlights.length !== 1 ? "s" : ""}
        </p>
        {highlights.length > 1 && (
          <button
            type="button"
            onClick={() => {
              highlights.forEach((h, i) =>
                setTimeout(
                  () => downloadDataUrl(h.dataUrl, `highlight-${i + 1}.jpg`),
                  i * 150
                )
              );
            }}
            className="text-xs font-semibold text-orange-400/70 hover:text-orange-400 transition-colors"
          >
            ↓ Download all
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {highlights.map((h, i) => (
          <div key={h.id} className="group relative aspect-[4/3] overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={h.dataUrl}
              alt={`Highlight ${i + 1}`}
              className="h-full w-full object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() =>
                  downloadDataUrl(h.dataUrl, `highlight-${i + 1}.jpg`)
                }
                className="rounded-md bg-white/20 px-2 py-1 text-xs text-white hover:bg-white/30"
              >
                ↓ Save
              </button>
              <button
                type="button"
                onClick={() => onRemove(h.id)}
                className="rounded-md bg-red-500/40 px-2 py-1 text-xs text-white hover:bg-red-500/60"
              >
                Delete
              </button>
            </div>
            {/* Index badge */}
            <span className="absolute top-1 left-1 rounded bg-black/50 px-1 py-0.5 text-[10px] font-bold text-white/70">
              {i + 1}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-white/30 text-center">
        Staff can delete any image before saving. Highlights are for recap only.
      </p>
    </div>
  );
}
