"use client";

import dynamic from "next/dynamic";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { SystemBoot } from "@/components/scenes/SystemBoot/SystemBoot";
import { Terminal } from "@/components/scenes/Terminal/Terminal";
import { RetroDesktop } from "@/components/scenes/RetroDesktop/RetroDesktop";
import { DimensionalBreak } from "@/components/scenes/DimensionalBreak/DimensionalBreak";


// Dynamically import WebGL to prevent SSR issues
const WebGLCanvas = dynamic(
  () => import("@/components/three/WebGLCanvas").then((mod) => mod.WebGLCanvas),
  { ssr: false }
);

export default function Home() {
  const { state, dispatch } = useExperience();

  return (
    <main className="relative flex flex-col items-center justify-center h-[100dvh] w-full overflow-hidden bg-black selection:bg-terminal selection:text-black">
      
      {/* 3D Dimensional Teaser (Hidden until FUTURE_TEASER) */}
      {(state.phase === "FUTURE_TEASER" || state.phase === "DIMENSIONAL_BREAK" || state.phase === "CORE_INTERACTIVE" || state.phase === "CORE_BREAKING" || state.phase === "GRAVITY_FAILURE" || process.env.NODE_ENV === "development") && (
        <WebGLCanvas />
      )}

      {/* Main Experience Router */}
      <div className="absolute inset-0 z-10 w-full h-full">
        {state.phase === "BOOT" && <SystemBoot />}
        {state.phase === "TERMINAL" && <Terminal />}
        {(state.phase === "DESKTOP" || state.phase === "FUTURE_TEASER" || state.phase === "DIMENSIONAL_BREAK" || state.phase === "CORE_INTERACTIVE" || state.phase === "CORE_BREAKING" || state.phase === "GRAVITY_FAILURE") && (
          <RetroDesktop />
        )}
        {(state.phase === "FUTURE_TEASER" || state.phase === "DIMENSIONAL_BREAK" || state.phase === "CORE_INTERACTIVE" || state.phase === "CORE_BREAKING" || state.phase === "GRAVITY_FAILURE") && (
          <DimensionalBreak />
        )}
      </div>

      {/* Development controls */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute bottom-2 left-2 z-50 flex gap-2 text-[10px] font-mono opacity-30 hover:opacity-100 transition-opacity">
          <button onClick={() => dispatch({type: "SET_PHASE", payload: "BOOT"})} className="border px-1 border-[#444] hover:bg-[#444]">BOOT</button>
          <button onClick={() => dispatch({type: "SET_PHASE", payload: "TERMINAL"})} className="border px-1 border-[#444] hover:bg-[#444]">TERM</button>
          <button onClick={() => dispatch({type: "SET_PHASE", payload: "DESKTOP"})} className="border px-1 border-[#444] hover:bg-[#444]">DSKTP</button>
          <button onClick={() => dispatch({type: "SET_PHASE", payload: "FUTURE_TEASER"})} className="border px-1 border-[#444] hover:bg-[#444]">FUTR</button>
        </div>
      )}

    </main>
  );
}
