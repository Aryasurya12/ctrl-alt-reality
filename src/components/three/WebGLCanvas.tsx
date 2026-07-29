"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Scene } from "./Scene";

export function WebGLCanvas() {
  return (
    <div className="fixed inset-0 pointer-events-none z-10 w-full h-full">
      <Canvas
        dpr={[1, 2]}
        gl={{ 
          alpha: true, 
          antialias: true, 
          powerPreference: "high-performance",
          preserveDrawingBuffer: false 
        }}
        camera={{ position: [0, 0, 5], fov: 45 }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
