"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { DimensionalScene } from "./dimensional/DimensionalScene";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { cn } from "@/lib/utils";

export function WebGLCanvas() {
  const { state } = useExperience();
  
  const isInteractive = state.phase === "CORE_INTERACTIVE" || state.phase === "CORE_BREAKING";

  return (
    <div className={cn(
      "fixed inset-0 w-full h-full pointer-events-none",
      state.phase === "CORE_INTERACTIVE" || state.phase === "CORE_BREAKING" ? "z-[60]" : "z-0"
    )}>
      <Canvas
        dpr={[1, 2]}
        gl={{ 
          alpha: true, 
          antialias: true, 
          powerPreference: "high-performance",
          preserveDrawingBuffer: false 
        }}
        style={{ pointerEvents: isInteractive ? "auto" : "none" }}
      >
        <Suspense fallback={null}>
          <DimensionalScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
