"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRageSession } from "@/app/actions/sessions";
import { useStopwatch } from "@/hooks/useStopwatch";
import { useHighlightCapture } from "@/hooks/useHighlightCapture";
import { CameraPreview } from "@/components/CameraPreview";
import { SessionCaptureStatus } from "@/components/SessionCaptureStatus";
import { SessionHighlightsGallery } from "@/components/SessionHighlightsGallery";

type Step = "setup" | "before" | "active" | "after";

interface Cabin {
  id: string;
  number: number;
  name: string;
  mascot: string;
}

export function NewSessionForm({ cabins }: { cabins: Cabin[] }) {
  const [step, setStep] = useState<Step>("setup");
  const [cabinId, setCabinId] = useState("");
  const [camperName, setCamperName] = useState("");
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [captureInterval, setCaptureInterval] = useState<10 | 15>(15);
  const [highlightEnabled, setHighlightEnabled] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const capture = useHighlightCapture();
  const time = useStopwatch(step === "active" && !isPending);
  const selectedCabin = cabins.find((c) => c.id === cabinId);

  // ── Step 1: setup ───────────────────────────────────────────────────────────
  if (step === "setup") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (cabinId && camperName.trim()) setStep("before");
        }}
        className="mt-8 space-y-5"
      >
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
              <option value="" className="bg-gray-900">Select cabin…</option>
              {cabins.map((c) => (
                <option key={c.id} value={c.id} className="bg-gray-900">
                  Cabin {c.number}
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
          Continue →
        </button>
      </form>
    );
  }

  // ── Step 2: before photo + optional camera ───────────────────────────────────
  if (step === "before") {
    async function handleEnableCamera() {
      const granted = await capture.requestPermission();
      if (granted) setHighlightEnabled(true);
    }

    return (
      <div className="mt-8 space-y-5">
        {/* Camper header */}
        <div className="glass-card px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-400/80">
            Next up
          </p>
          <p className="mt-0.5 text-lg font-bold text-white">
            {camperName} · Cabin {selectedCabin?.number}
          </p>
        </div>

        {/* Before photo */}
        <div className="glass-card p-6 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-400/80">
            Before Photo
          </h2>
          <PhotoUpload
            label="Before"
            preview={beforePreview}
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setBeforeFile(f);
              setBeforePreview(f ? URL.createObjectURL(f) : null);
            }}
          />
        </div>

        {/* Highlight capture option */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">Session Highlights</h3>
              <p className="mt-0.5 text-xs text-white/50">
                Auto-capture still images during the session for recap and camp memories.
                Staff can delete any image before saving.
              </p>
            </div>
            {!highlightEnabled && (
              <button
                type="button"
                onClick={handleEnableCamera}
                className="shrink-0 rounded-lg bg-orange-500/20 border border-orange-500/30 px-3 py-1.5 text-xs font-semibold text-orange-300 hover:bg-orange-500/30 transition-colors"
              >
                Enable
              </button>
            )}
          </div>

          {highlightEnabled && !capture.cameraError && (
            <>
              {capture.isPermissionGranted && (
                <CameraPreview
                  videoRef={capture.videoRef}
                  stream={capture.stream}
                  onManualCapture={capture.captureFrame}
                  isCapturing={false}
                />
              )}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">
                  Capture interval
                </p>
                <div className="flex gap-2">
                  {([10, 15] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setCaptureInterval(s)}
                      className={`flex-1 rounded-lg border py-2 text-sm font-semibold transition-colors ${
                        captureInterval === s
                          ? "border-orange-400/50 bg-orange-500/20 text-orange-300"
                          : "border-white/20 bg-white/5 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      {s}s
                    </button>
                  ))}
                </div>
              </div>
              <SessionCaptureStatus
                isPermissionGranted={capture.isPermissionGranted}
                isCapturing={false}
                highlightCount={0}
                intervalSeconds={captureInterval}
                nextCaptureIn={null}
                cameraError={capture.cameraError}
              />
            </>
          )}

          {capture.cameraError && (
            <SessionCaptureStatus
              isPermissionGranted={false}
              isCapturing={false}
              highlightCount={0}
              intervalSeconds={captureInterval}
              nextCaptureIn={null}
              cameraError={capture.cameraError}
            />
          )}
        </div>

        <button
          type="button"
          disabled={!beforePreview}
          onClick={() => {
            if (highlightEnabled && capture.isPermissionGranted) {
              capture.startCapture(captureInterval);
            }
            setStep("active");
          }}
          className="btn-primary w-full disabled:opacity-40"
        >
          Start Session →
        </button>

        <button
          type="button"
          onClick={() => setStep("setup")}
          className="btn-secondary w-full text-sm"
        >
          ← Back
        </button>
      </div>
    );
  }

  // ── Step 3: active session ───────────────────────────────────────────────────
  if (step === "active") {
    return (
      <div className="mt-8 space-y-5">
        {/* Header with stopwatch */}
        <div className="glass-card p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-400/80">
              Session in progress
            </p>
            <p className="mt-0.5 text-lg font-bold text-white">
              {camperName} · Cabin {selectedCabin?.number}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-0.5">
              Time
            </p>
            <p className="font-mono text-3xl font-black tabular-nums text-orange-400 leading-none">
              {time}
            </p>
          </div>
        </div>

        {/* Camera preview */}
        {highlightEnabled && capture.isPermissionGranted && (
          <div className="glass-card p-4 space-y-3">
            <CameraPreview
              videoRef={capture.videoRef}
              stream={capture.stream}
              onManualCapture={capture.captureFrame}
              isCapturing={capture.isCapturing}
            />
            <SessionCaptureStatus
              isPermissionGranted={capture.isPermissionGranted}
              isCapturing={capture.isCapturing}
              highlightCount={capture.highlights.length}
              intervalSeconds={capture.intervalSeconds}
              nextCaptureIn={capture.nextCaptureIn}
              cameraError={capture.cameraError}
            />
          </div>
        )}

        {/* Hidden canvas for captures */}
        <canvas ref={capture.canvasRef} className="hidden" />

        <button
          type="button"
          onClick={() => {
            capture.stopCapture();
            capture.stopStream();
            setStep("after");
          }}
          className="btn-primary w-full"
        >
          End Session →
        </button>
      </div>
    );
  }

  // ── Step 4: after photo + highlights + submit ────────────────────────────────
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!beforeFile || !afterFile) return;
        setError(null);
        const formData = new FormData();
        formData.set("cabinId", cabinId);
        formData.set("camperName", camperName.trim());
        formData.set("before", beforeFile);
        formData.set("after", afterFile);

        // Pick 3 evenly spaced highlights and append as Blobs
        const hl = capture.highlights;
        if (hl.length > 0) {
          const picks =
            hl.length <= 3
              ? hl
              : [0, 1, 2].map((i) => hl[Math.round((i * (hl.length - 1)) / 2)]);
          picks.forEach((h, i) => {
            const [header, b64] = h.dataUrl.split(",");
            const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
            const bytes = atob(b64);
            const arr = new Uint8Array(bytes.length);
            for (let j = 0; j < bytes.length; j++) arr[j] = bytes.charCodeAt(j);
            formData.set(`highlight${i}`, new Blob([arr], { type: mime }));
          });
        }

        startTransition(async () => {
          try {
            const sessionId = await createRageSession(formData);
            router.push(`/rage-room/${sessionId}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
          }
        });
      }}
      className="mt-8 space-y-5"
    >
      {/* After photo */}
      <div className="glass-card p-6 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-400/80">
          After Photo
        </h2>
        <PhotoUpload
          label="After"
          preview={afterPreview}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setAfterFile(f);
            setAfterPreview(f ? URL.createObjectURL(f) : null);
          }}
        />
      </div>

      {/* Highlights gallery */}
      {capture.highlights.length > 0 && (
        <div className="glass-card p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-400/80">
            Session Highlights ({capture.highlights.length})
          </h2>
          <SessionHighlightsGallery
            highlights={capture.highlights}
            onRemove={capture.removeHighlight}
          />
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !afterPreview}
        className="btn-primary w-full disabled:opacity-40"
      >
        {isPending ? "Uploading & scoring with AI…" : "Submit for AI Scoring →"}
      </button>

      <button
        type="button"
        onClick={() => setStep("active")}
        className="btn-secondary w-full text-sm"
      >
        ← Back to session
      </button>
    </form>
  );
}

function PhotoUpload({
  label,
  preview,
  onChange,
}: {
  label: string;
  preview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block cursor-pointer">
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
          accept="image/jpeg,image/png,image/webp"
          required
          onChange={onChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
    </label>
  );
}
