"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export interface Highlight {
  id: string;
  dataUrl: string;
  capturedAt: Date;
}

export type CameraError =
  | "not-supported"
  | "permission-denied"
  | "no-camera"
  | "in-use"
  | "capture-failed"
  | null;

export function useHighlightCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [cameraError, setCameraError] = useState<CameraError>(null);
  const [intervalSeconds, setIntervalSeconds] = useState(15);
  const [nextCaptureIn, setNextCaptureIn] = useState<number | null>(null);

  const stopStream = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setStream(null);
    setIsCapturing(false);
    setIsPermissionGranted(false);
    setNextCaptureIn(null);
  }, []);

  // Clean up on unmount
  useEffect(() => () => stopStream(), [stopStream]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError("not-supported");
      return false;
    }
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
      } catch {
        // Fallback: any camera (desktop/MacBook)
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      streamRef.current = stream;
      setStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsPermissionGranted(true);
      setCameraError(null);
      return true;
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setCameraError("permission-denied");
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setCameraError("no-camera");
      } else if (name === "NotReadableError" || name === "TrackStartError") {
        setCameraError("in-use");
      } else {
        setCameraError("not-supported");
      }
      return false;
    }
  }, []);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
      setHighlights((prev) => [
        ...prev,
        { id: crypto.randomUUID(), dataUrl, capturedAt: new Date() },
      ]);
    } catch {
      setCameraError("capture-failed");
    }
  }, []);

  const startCapture = useCallback(
    (seconds: number) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIntervalSeconds(seconds);
      setIsCapturing(true);
      setNextCaptureIn(seconds);

      // Countdown ticker (updates every second)
      let remaining = seconds;
      intervalRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          captureFrame();
          remaining = seconds;
        }
        setNextCaptureIn(remaining);
      }, 1000);
    },
    [captureFrame]
  );

  const stopCapture = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsCapturing(false);
    setNextCaptureIn(null);
  }, []);

  const removeHighlight = useCallback((id: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  }, []);

  return {
    videoRef,
    canvasRef,
    stream,
    isPermissionGranted,
    isCapturing,
    highlights,
    cameraError,
    intervalSeconds,
    nextCaptureIn,
    requestPermission,
    captureFrame,
    startCapture,
    stopCapture,
    stopStream,
    removeHighlight,
  };
}
