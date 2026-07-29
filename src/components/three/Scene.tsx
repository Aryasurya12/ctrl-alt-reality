"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useMousePosition } from "@/hooks/useMousePosition";

export function Scene() {
  const meshRef = useRef<THREE.Group>(null);
  const { x, y } = useMousePosition();

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Abstract geometric object rotation
      meshRef.current.rotation.x += delta * 0.1;
      meshRef.current.rotation.y += delta * 0.15;

      // Mouse Parallax (subtle)
      const targetX = (x / window.innerWidth - 0.5) * 2;
      const targetY = -(y / window.innerHeight - 0.5) * 2;

      meshRef.current.position.x += (targetX * 0.5 - meshRef.current.position.x) * 0.05;
      meshRef.current.position.y += (targetY * 0.5 - meshRef.current.position.y) * 0.05;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={2} color="#4ade80" />
      <directionalLight position={[-10, -10, -10]} intensity={1} color="#ef4444" />
      
      <group ref={meshRef}>
        <mesh>
          <icosahedronGeometry args={[2.5, 1]} />
          <meshStandardMaterial 
            color="#000000" 
            wireframe={true} 
            emissive="#222222"
          />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial 
            color="#4ade80" 
            wireframe={true} 
            emissive="#4ade80"
            transparent
            opacity={0.2}
          />
        </mesh>
      </group>
    </>
  );
}
