"use client";

import type { CameraError } from "@/hooks/useHighlightCapture";

interface SessionCaptureStatusProps {
  isPermissionGranted: boolean;
  isCapturing: boolean;
  highlightCount: number;
  intervalSeconds: number;
  nextCaptureIn: number | null;
  cameraError: CameraError;
}

export function SessionCaptureStatus({
  isPermissionGranted,
  isCapturing,
  highlightCount,
  intervalSeconds,
  nextCaptureIn,
  cameraError,
}: SessionCaptureStatusProps) {
  if (cameraError) {
    const msg: Record<NonNullable<CameraError>, string> = {
      "not-supported": "Camera not supported on this browser",
      "permission-denied": "Camera permission denied",
      "no-camera": "No camera found",
      "in-use": "Camera is already in use by another app",
      "capture-failed": "Capture failed",
    };
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
        <span>⚠</span>
        <span>{msg[cameraError]} — session continues without highlights</span>
      </div>
    );
  }

  if (!isPermissionGranted) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/40">
        <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
        Highlight capture disabled
      </div>
    );
  }

  if (!isCapturing) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Camera ready · {highlightCount} highlight{highlightCount !== 1 ? "s" : ""} captured
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-3 py-2 text-xs text-orange-300">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
      </span>
      Capturing every {intervalSeconds}s · {highlightCount} captured
      {nextCaptureIn !== null && (
        <span className="ml-auto font-mono tabular-nums text-orange-400/60">
          next in {nextCaptureIn}s
        </span>
      )}
    </div>
  );
}
