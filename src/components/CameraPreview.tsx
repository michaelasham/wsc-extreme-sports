"use client";

import { useEffect, type RefObject } from "react";

interface CameraPreviewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  onManualCapture: () => void;
  isCapturing: boolean;
}

export function CameraPreview({
  videoRef,
  stream,
  onManualCapture,
  isCapturing,
}: CameraPreviewProps) {
  // Re-attach stream if video element remounts
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [videoRef, stream]);

  return (
    <div className="relative overflow-hidden rounded-xl bg-black aspect-video">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
      />
      {/* Live badge */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
        </span>
        LIVE
      </div>
      {/* Manual capture button */}
      <button
        type="button"
        onClick={onManualCapture}
        className="absolute bottom-3 right-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 p-3 hover:bg-white/30 transition-colors active:scale-95"
        title="Capture now"
      >
        <span className="block h-5 w-5 rounded-full border-2 border-white" />
      </button>
      {isCapturing && (
        <div className="absolute bottom-3 left-3 rounded-full bg-orange-500/80 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-white">
          AUTO
        </div>
      )}
    </div>
  );
}
