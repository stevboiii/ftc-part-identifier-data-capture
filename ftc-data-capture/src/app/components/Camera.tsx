"use client";

import { useEffect, useRef, useState } from "react";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

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

    if (video.readyState < 2 || video.videoWidth === 0) {
      setError("Camera is not ready yet.");
      return;
    }

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

  async function nextPhoto() {
    if (!photo || uploading) return;

    setUploading(true);
    setUploadMessage(null);

    try {
      const response = await fetch(photo);
      const blob = await response.blob();

      const formData = new FormData();

      const filename = `ftc-part-${Date.now()}.jpg`;

      formData.append(
        "file",
        new File([blob], filename, {
          type: "image/jpeg",
        })
      );

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(result.error ?? "Upload failed.");
      }

      console.log("Roboflow upload successful:", result);

      setPhoto(null);
      setUploadMessage("Photo uploaded successfully.");
    } catch (err) {
      console.error(err);

      setUploadMessage(
        err instanceof Error ? err.message : "Failed to upload photo."
      );
    } finally {
      setUploading(false);
    }
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
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full rounded-xl ${photo ? "hidden" : ""}`}
      />
      {!photo ? (
        <>
      

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
          <button
            type="button"
            onClick={nextPhoto}
            disabled={uploading}
            className="w-full rounded-lg bg-blue-500 py-3 text-white font-semibold disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Next Photo"}
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