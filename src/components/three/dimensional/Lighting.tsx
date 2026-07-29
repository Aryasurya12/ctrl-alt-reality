import { Environment } from "@react-three/drei";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export function Lighting() {
  const { state } = useExperience();
  const dirLightRef = useRef<THREE.DirectionalLight>(null);

  useFrame(({ clock }) => {
    if (dirLightRef.current && state.phase === "CORE_INTERACTIVE") {
      dirLightRef.current.position.x = Math.sin(clock.elapsedTime * 0.2) * 5;
      dirLightRef.current.position.z = Math.cos(clock.elapsedTime * 0.2) * 5;
    }
  });

  return (
    <>
      {/* Low ambient light for contrast */}
      <ambientLight intensity={0.15} />
      
      {/* Large soft Key Light */}
      <directionalLight 
        ref={dirLightRef}
        position={[8, 10, 8]} 
        intensity={2.5} 
        color="#ffffff" 
        castShadow
      />
      
      {/* Subtle Rim Light (Terminal Green hint) */}
      <directionalLight 
        position={[-10, 5, -10]} 
        intensity={1.5} 
        color="#4ade80"
      />

      {/* Fill Light */}
      <directionalLight 
        position={[0, -8, 5]} 
        intensity={0.3} 
        color="#ffffff" 
      />
      
      {/* Environment Map for Premium Chrome Reflections */}
      <Environment preset="studio" blur={0.5} />
    </>
  );
}
