"use client";

import { useState, useTransition } from "react";
import { createRageSession } from "@/app/actions/sessions";
import { useStopwatch } from "@/hooks/useStopwatch";

interface Cabin {
  id: string;
  number: number;
  name: string;
  mascot: string;
}

interface NewSessionFormProps {
  cabins: Cabin[];
}

export function NewSessionForm({ cabins }: NewSessionFormProps) {
  const [step, setStep] = useState<"setup" | "active">("setup");
  const [cabinId, setCabinId] = useState("");
  const [camperName, setCamperName] = useState("");
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const time = useStopwatch(step === "active");

  const selectedCabin = cabins.find((c) => c.id === cabinId);

  function handleLockIn(e: React.FormEvent) {
    e.preventDefault();
    if (!cabinId || !camperName.trim()) return;
    setStep("active");
  }

  function handlePreview(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (s: string | null) => void
  ) {
    const file = e.target.files?.[0];
    if (!file) return setter(null);
    setter(URL.createObjectURL(file));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("cabinId", cabinId);
    formData.set("camperName", camperName.trim());
    startTransition(async () => {
      try {
        await createRageSession(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  if (step === "setup") {
    return (
      <form onSubmit={handleLockIn} className="mt-8 space-y-5">
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-400/80">
            Who&apos;s up?
          </h2>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
              Cabin
            </label>
            <select
              required
              value={cabinId}
              onChange={(e) => setCabinId(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:ring-2 ring-orange-400/50"
            >
              <option value="" className="bg-gray-900">
                Select cabin…
              </option>
              {cabins.map((c) => (
                <option key={c.id} value={c.id} className="bg-gray-900">
                  {c.mascot} Cabin {c.number} — {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
              Camper Name
            </label>
            <input
              type="text"
              required
              value={camperName}
              onChange={(e) => setCamperName(e.target.value)}
              placeholder="e.g. Daniel N."
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none focus:ring-2 ring-orange-400/50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!cabinId || !camperName.trim()}
          className="btn-primary w-full disabled:opacity-40"
        >
          Start Session →
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      {/* Active session header */}
      <div className="glass-card p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-400/80">
            Now scoring
          </p>
          <p className="mt-0.5 text-lg font-bold text-white">
            {camperName} · {selectedCabin?.mascot} Cabin {selectedCabin?.number}
          </p>
        </div>

        {/* Stopwatch */}
        <div className="shrink-0 text-right">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-0.5">
            Time
          </p>
          <p className="font-mono text-3xl font-black tabular-nums text-orange-400 leading-none">
            {time}
          </p>
        </div>
      </div>

      {/* Photo uploads */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-400/80">
          Photos
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <PhotoUpload
            name="before"
            label="Before"
            preview={beforePreview}
            onChange={(e) => handlePreview(e, setBeforePreview)}
          />
          <PhotoUpload
            name="after"
            label="After"
            preview={afterPreview}
            onChange={(e) => handlePreview(e, setAfterPreview)}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !beforePreview || !afterPreview}
        className="btn-primary w-full disabled:opacity-40"
      >
        {isPending ? "Uploading & scoring with AI…" : "Submit for AI Scoring →"}
      </button>

      <button
        type="button"
        onClick={() => {
          setStep("setup");
          setBeforePreview(null);
          setAfterPreview(null);
          setError(null);
        }}
        className="btn-secondary w-full text-sm"
      >
        ← Change Camper
      </button>
    </form>
  );
}

function PhotoUpload({
  name,
  label,
  preview,
  onChange,
}: {
  name: string;
  label: string;
  preview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block cursor-pointer">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
        {label}
      </span>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border-2 border-dashed border-white/20 bg-white/5 hover:border-orange-400/50 transition-colors">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <span className="text-3xl opacity-40">📷</span>
            <span className="text-xs text-white/40">Tap to upload</span>
          </div>
        )}
        <input
          type="file"
          name={name}
          accept="image/jpeg,image/png,image/webp"
          required
          onChange={onChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
    </label>
  );
}
