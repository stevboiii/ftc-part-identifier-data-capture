"use client";

import { useEffect, useRef, useState } from "react";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        setError(null);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
          },
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error(err);
        setError("Could not access the camera.");
      }
    }

    startCamera();

    return () => {
      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, []);

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const image = canvas.toDataURL("image/jpeg", 0.95);

    setPhoto(image);
  }

  function retakePhoto() {
    setPhoto(null);
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg border border-red-900 bg-red-950/30 text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg space-y-4">
      {!photo ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-xl"
          />

          <button
            type="button"
            onClick={capturePhoto}
            className="w-full rounded-lg bg-white py-3 text-black font-semibold"
          >
            Capture
          </button>
        </>
      ) : (
        <>
          <img
            src={photo}
            alt="Captured part"
            className="w-full rounded-xl"
          />

          <button
            type="button"
            onClick={retakePhoto}
            className="w-full rounded-lg bg-zinc-800 py-3 text-white font-semibold"
          >
            Retake
          </button>
        </>
      )}

      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </div>
  );
}