"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GalleryIndexPage() {
  const [name, setName] = useState("");
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-400/80">
            WSC Extreme Sports
          </p>
          <h1 className="text-3xl font-black text-white">Camper Gallery</h1>
          <p className="text-sm text-white/40">Enter your name to see your session highlights.</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) router.push(`/gallery/${encodeURIComponent(name.trim())}`);
          }}
          className="space-y-3"
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name…"
            autoFocus
            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none focus:ring-2 ring-orange-400/50"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="btn-primary w-full disabled:opacity-40"
          >
            View Gallery →
          </button>
        </form>
      </div>
    </main>
  );
}
