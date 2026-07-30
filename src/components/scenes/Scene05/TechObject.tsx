import { useRef, useState, useEffect } from "react";
import { useFrame, ThreeEvent, useThree } from "@react-three/fiber";
import { Text3D, Center } from "@react-three/drei";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useExperience } from "@/components/providers/ExperienceProvider";

interface TechObjectProps {
  text: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

export function TechObject({ text, position, rotation, scale }: TechObjectProps) {
  const { state, dispatch } = useExperience();
  const api = useRef<RapierRigidBody>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { camera } = useThree();
  const pointer3D = new THREE.Vector3();
  const targetPos = new THREE.Vector3();

  useEffect(() => {
    if (isHovered && !isDragging) {
      document.body.style.cursor = 'grab';
    } else if (isDragging) {
      document.body.style.cursor = 'grabbing';
    } else {
      document.body.style.cursor = 'auto';
    }
  }, [isHovered, isDragging]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (state.phase !== "SCENE_05_ACTIVE") return;
    e.stopPropagation();
    (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
    setIsDragging(true);
    
    if (state.scene05InteractionStep < 2) {
      dispatch({ type: "SET_SCENE05_INTERACTION", payload: 2 });
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
    
    if (isDragging) {
      setIsDragging(false);
      dispatch({ type: "INCREMENT_OBJECTS_THROWN" });
      
      if (state.scene05InteractionStep < 3) {
        dispatch({ type: "SET_SCENE05_INTERACTION", payload: 3 });
      }
    }
  };

  useFrame(({ mouse }) => {
    if (!api.current) return;

    if (state.phase === "SCENE_05_ENDING") {
      // Suck everything to center
      const currentPos = api.current.translation();
      const forceX = -currentPos.x * 0.1;
      const forceY = -currentPos.y * 0.1;
      const forceZ = -currentPos.z * 0.1;
      api.current.applyImpulse({ x: forceX, y: forceY, z: forceZ }, true);
      
      const linvel = api.current.linvel();
      api.current.setLinvel({ x: linvel.x * 0.95, y: linvel.y * 0.95, z: linvel.z * 0.95 }, true);
      return;
    }

    if (isDragging) {
      // Map mouse to world plane
      pointer3D.set(mouse.x, mouse.y, 0.5);
      pointer3D.unproject(camera);
      pointer3D.sub(camera.position).normalize();
      
      // Calculate intersection with Z=0 plane (or object's current Z)
      const currentPos = api.current.translation();
      const distance = (currentPos.z - camera.position.z) / pointer3D.z;
      targetPos.copy(camera.position).add(pointer3D.multiplyScalar(distance));
      
      // Spring force towards mouse
      const forceX = (targetPos.x - currentPos.x) * 1.5;
      const forceY = (targetPos.y - currentPos.y) * 1.5;
      const forceZ = (0 - currentPos.z) * 0.5; // keep roughly near z=0
      
      api.current.applyImpulse({ x: forceX, y: forceY, z: forceZ }, true);
      
      // Dampen velocity to prevent infinite oscillation
      const linvel = api.current.linvel();
      api.current.setLinvel({ x: linvel.x * 0.8, y: linvel.y * 0.8, z: linvel.z * 0.9 }, true);
      
      // Wake up physics body
      api.current.wakeUp();
    } else {
      // Very slow ambient drifting
      api.current.applyImpulse({ x: 0, y: 0, z: (Math.random() - 0.5) * 0.001 }, true);
    }
  });

  return (
    <RigidBody
      ref={api}
      position={position}
      rotation={rotation}
      mass={1}
      linearDamping={0.2}
      angularDamping={0.2}
      restitution={0.8}
      colliders="cuboid"
    >
      <Center>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.4 * scale}
          height={0.1 * scale}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02 * scale}
          bevelSize={0.01 * scale}
          bevelOffset={0}
          bevelSegments={3}
          onPointerEnter={(e) => { e.stopPropagation(); setIsHovered(true); }}
          onPointerLeave={() => setIsHovered(false)}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          {text}
          <meshPhysicalMaterial 
            color={isHovered ? "#ffffff" : "#cccccc"}
            metalness={0.9}
            roughness={0.1}
            clearcoat={1.0}
          />
        </Text3D>
      </Center>
    </RigidBody>
  );
}
