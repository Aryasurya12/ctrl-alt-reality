import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function CoreFragments() {
  const { state } = useExperience();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const reducedMotion = useReducedMotion();
  
  const COUNT = reducedMotion ? 50 : 250;
  
  // Physics data
  const [particles] = useState(() => {
    const data = [];
    for (let i = 0; i < COUNT; i++) {
      // Random direction sphere
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      const velocity = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      ).multiplyScalar(Math.random() * 30 + 10); // Fast burst
      
      data.push({
        position: new THREE.Vector3(0, 0, 2), // Same as RealityCore start z
        velocity,
        rotation: new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        rotVelocity: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(20),
        scale: Math.random() * 0.15 + 0.05
      });
    }
    return data;
  });

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!meshRef.current || state.phase !== "CORE_BREAKING") return;
    
    // Initial reset
    particles.forEach((p, i) => {
      p.position.set(0, 0, 2);
      dummy.position.copy(p.position);
      dummy.scale.set(0, 0, 0); // Hide initially
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [state.phase, particles, dummy]);

  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (state.phase !== "CORE_BREAKING" || !meshRef.current) return;
    
    timeRef.current += delta;
    
    // Delay fragment explosion until 0.32s to match core disappearance
    if (timeRef.current < 0.32) return;

    particles.forEach((p, i) => {
      p.position.addScaledVector(p.velocity, delta);
      p.rotation.addScaledVector(p.rotVelocity, delta);
      
      // Drag/Friction
      p.velocity.multiplyScalar(0.95);
      
      dummy.position.copy(p.position);
      dummy.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);
      
      // Scale down over time
      const lifeTime = timeRef.current - 0.32;
      const currentScale = Math.max(0, p.scale * (1.0 - lifeTime * 1.5));
      dummy.scale.set(currentScale, currentScale, currentScale);
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (state.phase !== "CORE_BREAKING") return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <tetrahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial 
        color="#ffffff"
        metalness={1}
        roughness={0.1}
        clearcoat={1}
      />
    </instancedMesh>
  );
}
