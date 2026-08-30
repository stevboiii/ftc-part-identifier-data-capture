"use client";

import Camera from "./components/Camera";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">
        Vanta Part Collector
      </h1>

      <Camera />
    </main>
  );
}