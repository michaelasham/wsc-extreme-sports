"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { createRageSession } from "@/app/actions/sessions";
import { useStopwatch } from "@/hooks/useStopwatch";
import { useHighlightCapture } from "@/hooks/useHighlightCapture";
import { CameraPreview } from "@/components/CameraPreview";
import { SessionCaptureStatus } from "@/components/SessionCaptureStatus";
import { SessionHighlightsGallery } from "@/components/SessionHighlightsGallery";

type Step = "setup" | "active" | "review";

interface Cabin {
  id: string;
  number: number;
  name: string;
  mascot: string;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, b64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const bytes = atob(b64);
  const arr = new Uint8Array(bytes.length);
  for (let j = 0; j < bytes.length; j++) arr[j] = bytes.charCodeAt(j);
  return new Blob([arr], { type: mime });
}

export function NewSessionForm({ cabins }: { cabins: Cabin[] }) {
  const [step, setStep] = useState<Step>("setup");
  const [cabinId, setCabinId] = useState("");
  const [camperName, setCamperName] = useState("");
  const [captureInterval, setCaptureInterval] = useState<10 | 15>(15);
  const [highlightEnabled, setHighlightEnabled] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ pct: number; label: string } | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  const capture = useHighlightCapture();
  const time = useStopwatch(step === "active" && !isPending);
  const selectedCabin = cabins.find((c) => c.id === cabinId);

  // ── Step 1: setup + camera config ───────────────────────────────────────────
  if (step === "setup") {
    async function handleEnableCamera() {
      const granted = await capture.requestPermission();
      if (granted) setHighlightEnabled(true);
    }

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!cabinId || !camperName.trim()) return;
          if (highlightEnabled && capture.isPermissionGranted) {
            capture.startCapture(captureInterval);
          }
          setStep("active");
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

        {/* Session highlights / camera setup */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">Session Highlights</h3>
              <p className="mt-0.5 text-xs text-white/50">
                Auto-capture stills during the session. The first and last frame become
                the before &amp; after photos.
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
          type="submit"
          disabled={!cabinId || !camperName.trim()}
          className="btn-primary w-full disabled:opacity-40"
        >
          Start Session →
        </button>
      </form>
    );
  }

  // ── Step 2: active session ───────────────────────────────────────────────────
  if (step === "active") {
    return (
      <div className="mt-8 space-y-5">
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

        <canvas ref={capture.canvasRef} className="hidden" />

        <button
          type="button"
          onClick={() => {
            capture.captureFrame();
            capture.stopCapture();
            capture.stopStream();
            setStep("review");
          }}
          className="btn-primary w-full"
        >
          End Session →
        </button>
      </div>
    );
  }

  // ── Step 3: review highlights + submit ──────────────────────────────────────
  const firstHighlight = capture.highlights[0] ?? null;
  const lastHighlight = capture.highlights[capture.highlights.length - 1] ?? null;
  const canSubmit = capture.highlights.length >= 1 && !isPending;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!firstHighlight || !lastHighlight) return;
        setError(null);
        const formData = new FormData();
        formData.set("cabinId", cabinId);
        formData.set("camperName", camperName.trim());
        formData.set("before", dataUrlToBlob(firstHighlight.dataUrl), "before.jpg");
        formData.set("after", dataUrlToBlob(lastHighlight.dataUrl), "after.jpg");

        capture.highlights.forEach((h, i) => {
          formData.set(`highlight${i}`, dataUrlToBlob(h.dataUrl), `highlight${i}.jpg`);
        });

        // Animate progress through realistic stages; hold at 88% until server responds
        const STAGES = [
          { pct: 30, label: "Uploading photos…", ms: 1200 },
          { pct: 55, label: "Processing images…", ms: 1500 },
          { pct: 88, label: "Scoring with AI…", ms: 9000 },
        ] as const;
        setProgress({ pct: 0, label: STAGES[0].label });
        let stageIdx = 0;
        let framePct = 0;
        const TICK = 50;
        progressTimer.current = setInterval(() => {
          const stage = STAGES[stageIdx];
          if (!stage) return;
          const prevPct = stageIdx === 0 ? 0 : STAGES[stageIdx - 1].pct;
          framePct += (stage.pct - prevPct) / (stage.ms / TICK);
          const pct = Math.min(prevPct + framePct, stage.pct);
          setProgress({ pct: Math.round(pct), label: stage.label });
          if (pct >= stage.pct && stageIdx < STAGES.length - 1) {
            stageIdx++;
            framePct = 0;
            setProgress({ pct: Math.round(pct), label: STAGES[stageIdx].label });
          }
        }, TICK);

        startTransition(async () => {
          try {
            const sessionId = await createRageSession(formData);
            clearInterval(progressTimer.current!);
            setProgress({ pct: 100, label: "Done!" });
            router.push(`/rage-room/${sessionId}`);
          } catch (err) {
            clearInterval(progressTimer.current!);
            setProgress(null);
            setError(err instanceof Error ? err.message : "Something went wrong");
          }
        });
      }}
      className="mt-8 space-y-5"
    >
      {/* Before / After derived from highlights */}
      {firstHighlight && (
        <div className="glass-card p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-400/80">
            Before &amp; After
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={firstHighlight.dataUrl}
                alt="Before"
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
              <p className="text-center text-xs font-semibold uppercase tracking-wider text-white/50">
                Before
              </p>
            </div>
            <div className="space-y-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lastHighlight!.dataUrl}
                alt="After"
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
              <p className="text-center text-xs font-semibold uppercase tracking-wider text-white/50">
                After
              </p>
            </div>
          </div>
          {capture.highlights.length === 1 && (
            <p className="text-center text-xs text-white/30">
              Only one highlight captured — same frame used for before &amp; after.
            </p>
          )}
        </div>
      )}

      {/* Highlights gallery */}
      <div className="glass-card p-5 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-400/80">
          Session Highlights ({capture.highlights.length})
        </h2>
        <SessionHighlightsGallery
          highlights={capture.highlights}
          onRemove={capture.removeHighlight}
        />
        {capture.highlights.length === 0 && (
          <p className="text-center text-xs text-orange-400/70">
            No highlights captured — go back and run the session with camera enabled.
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {progress !== null ? (
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">{progress.label}</span>
            <span className="font-mono text-sm font-bold text-orange-400">
              {progress.pct}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-[width] duration-75 ease-linear"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
        </div>
      ) : (
        <>
          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-primary w-full disabled:opacity-40"
          >
            Submit for AI Scoring →
          </button>

          <button
            type="button"
            onClick={() => setStep("active")}
            className="btn-secondary w-full text-sm"
          >
            ← Back to session
          </button>
        </>
      )}
    </form>
  );
}
