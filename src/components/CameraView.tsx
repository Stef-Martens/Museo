"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ScanOverlay from "@/components/ScanOverlay";
import RecognitionResult from "@/components/RecognitionResult";
import { recognizeArtwork, simulateRecognitionDelay } from "@/lib/recognition";
import type { RecognitionResult as RecognitionResultType } from "@/types";

type CameraState = "idle" | "scanning" | "result" | "error";

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [result, setResult] = useState<RecognitionResultType | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError(null);
    } catch {
      setError("Camera access denied. Enable camera permissions to scan artworks.");
      setCameraState("error");
    }
  }, []);

  useEffect(() => {
    startCamera();
    const video = videoRef.current;
    return () => {
      const stream = video?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]);

  const capture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || cameraState === "scanning") return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(dataUrl);
    setCameraState("scanning");
    setResult(null);

    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }

    const [recognitionResult] = await Promise.all([
      recognizeArtwork(canvas),
      simulateRecognitionDelay(),
    ]);

    if ("vibrate" in navigator) {
      navigator.vibrate([30, 50, 30]);
    }

    setResult(recognitionResult);
    setCameraState("result");
  };

  const reset = () => {
    setCameraState("idle");
    setResult(null);
    setCapturedImage(null);
  };

  if (cameraState === "result" && result) {
    return (
      <RecognitionResult
        result={result}
        capturedImage={capturedImage}
        onScanAgain={reset}
      />
    );
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="relative flex-1 overflow-hidden bg-black">
        {error ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="text-5xl">📷</span>
            <p className="text-white/70">{error}</p>
            <button
              onClick={startCamera}
              className="rounded-full game-gradient px-6 py-3 text-sm font-bold text-white"
            >
              Retry Camera
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            <ScanOverlay
              isScanning={cameraState === "scanning"}
              statusText={
                cameraState === "scanning" ? "Identifying artwork…" : undefined
              }
            />
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {!error && (
        <div className="flex items-center justify-center bg-museo-dark py-6">
          <button
            onClick={capture}
            disabled={cameraState === "scanning"}
            className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 transition-transform active:scale-95 disabled:opacity-50"
            aria-label="Capture artwork"
          >
            <span
              className={`h-14 w-14 rounded-full ${
                cameraState === "scanning"
                  ? "animate-pulse bg-museo-purple"
                  : "game-gradient"
              }`}
            />
          </button>
        </div>
      )}
    </div>
  );
}
