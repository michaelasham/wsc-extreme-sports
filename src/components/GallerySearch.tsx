"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GallerySearch() {
  const [name, setName] = useState("");
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) router.push(`/gallery/${encodeURIComponent(name.trim())}`);
      }}
      className="flex gap-2 max-w-sm mx-auto"
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Search by name…"
        className="flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:ring-2 ring-orange-400/50"
      />
      <button
        type="submit"
        disabled={!name.trim()}
        className="btn-primary px-4 py-2.5 text-sm disabled:opacity-40"
      >
        Go →
      </button>
    </form>
  );
}
