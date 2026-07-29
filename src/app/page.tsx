"use client";

import dynamic from "next/dynamic";
import { useExperience } from "@/components/providers/ExperienceProvider";

// Dynamically import WebGL to prevent SSR issues
const WebGLCanvas = dynamic(
  () => import("@/components/three/WebGLCanvas").then((mod) => mod.WebGLCanvas),
  { ssr: false }
);

export default function Home() {
  const { state } = useExperience();

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen w-full px-6 py-24 overflow-hidden">
      <WebGLCanvas />

      <div className="z-20 flex flex-col items-center text-center max-w-4xl gap-8 pointer-events-none">
        <div className="flex flex-col gap-2">
          <p className="micro-label">SYSTEM STATUS: FOUNDATION ONLINE</p>
          <p className="micro-label">PHASE 01 / SYSTEM FOUNDATION</p>
        </div>

        <h1 className="display-xl">CTRL+ALT+REALITY</h1>
        
        <p className="system-text max-w-lg mt-4">
          THE WEB WAS NEVER MEANT TO STAY FLAT.
        </p>

        {/* Debug info to prove provider works */}
        <div className="absolute bottom-8 left-8 text-left opacity-50">
          <p className="micro-label">Provider State:</p>
          <p className="micro-label">Phase: {state.phase}</p>
          <p className="micro-label">Reduced Motion: {state.reducedMotion ? "TRUE" : "FALSE"}</p>
          <p className="micro-label">Touch Device: {state.hasTouch ? "TRUE" : "FALSE"}</p>
        </div>
      </div>
    </main>
  );
}
