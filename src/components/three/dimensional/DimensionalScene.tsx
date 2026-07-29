import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Lighting } from "./Lighting";
import { RealityCore } from "./RealityCore";
import { CoreFragments } from "./CoreFragments";


export function DimensionalScene() {
  const { state, dispatch } = useExperience();
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { viewport } = useThree();
  const reducedMotion = useReducedMotion();

  // Internal state for orchestrating the transition
  const coreTransforming = useRef(false);
  const coreGroup = useRef<THREE.Group>(null);


  // Responsive target scale
  const targetScale = viewport.width < 768 ? 1.5 : 2.5;

  useEffect(() => {
    if (!cameraRef.current || !coreGroup.current) return;

    // Camera initial state
    if (state.phase === "FUTURE_TEASER" || state.phase === "DIMENSIONAL_BREAK") {
      gsap.set(cameraRef.current.position, { x: 0, y: 0, z: 8 });
    }

    if (state.phase === "FUTURE_TEASER") {
      // 1.7s: small dark core becomes visible behind desktop
      gsap.set(coreGroup.current.scale, { x: 0.1, y: 0.1, z: 0.1 });
      gsap.set(coreGroup.current.position, { z: -5 });
      
      gsap.to(coreGroup.current.scale, {
        x: targetScale * 0.3,
        y: targetScale * 0.3,
        z: targetScale * 0.3,
        duration: 2.5,
        delay: 1.7,
        ease: "power1.inOut"
      });
      gsap.to(coreGroup.current.position, {
        z: -1,
        duration: 2.5,
        delay: 1.7,
        ease: "power1.inOut"
      });
    }

    if (state.phase === "DIMENSIONAL_BREAK") {
      const tl = gsap.timeline();
      
      // Core slowly presses forward
      tl.to(coreGroup.current.position, {
        z: 0.5,
        duration: 6.5,
        ease: "power2.inOut"
      }, 0);
      
      tl.to(coreGroup.current.scale, {
        x: targetScale * 0.8,
        y: targetScale * 0.8,
        z: targetScale * 0.8,
        duration: 6.5,
        ease: "power2.inOut"
      }, 0);

      // Impact jitter
      if (!reducedMotion) {
        tl.to(coreGroup.current.position, {
          z: 0.6,
          duration: 0.1,
          yoyo: true,
          repeat: 3
        }, 6.7);
      }

      // 9.2s - 10.0s: Core emerges
      tl.to(coreGroup.current.position, {
        z: 2,
        duration: 2,
        ease: "power3.out"
      }, 9.2);

      tl.to(coreGroup.current.scale, {
        x: targetScale,
        y: targetScale,
        z: targetScale,
        duration: 2,
        ease: "back.out(1.2)"
      }, 9.2);
    }
    
    if (state.phase === "CORE_INTERACTIVE") {
      // Fallback for HMR / component remount
      gsap.set(coreGroup.current.scale, { x: targetScale, y: targetScale, z: targetScale });
      gsap.set(coreGroup.current.position, { z: 2 });
    }
  }, [state.phase, reducedMotion, targetScale]);

  // Monitor interaction state to trigger break
  useEffect(() => {
    if (state.phase === "CORE_INTERACTIVE" && state.hasDraggedCore && state.hasHeldCore && state.hasReleasedCore && !coreTransforming.current) {
      coreTransforming.current = true;
      dispatch({ type: "SET_PHASE", payload: "CORE_BREAKING" });
    }
  }, [state.phase, state.hasDraggedCore, state.hasHeldCore, state.hasReleasedCore, dispatch]);

  // Handle CORE_BREAKING -> GRAVITY_FAILURE
  useEffect(() => {
    if (state.phase === "CORE_BREAKING") {
      const tl = gsap.timeline({
        onComplete: () => {
          dispatch({ type: "SET_PHASE", payload: "GRAVITY_FAILURE" });
        }
      });

      // 0.00s: Micro pause
      tl.to({}, { duration: 0.08 });

      // 0.08s: Pull inward further
      tl.to(coreGroup.current!.scale, {
        x: targetScale * 0.85,
        y: targetScale * 0.85,
        z: targetScale * 0.85,
        duration: 0.08,
        ease: "power2.in"
      });

      // 0.16s: Violent stretch/pulse (shader will handle internal pulse, we handle scale)
      tl.to(coreGroup.current!.scale, {
        x: targetScale * 1.5,
        y: targetScale * 1.5,
        z: targetScale * 1.5,
        duration: 0.16,
        ease: "expo.out"
      });

      // 0.32s: Disappear (fragments take over in DOM or separate mesh)
      tl.to(coreGroup.current!.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.1,
        ease: "power3.in"
      }, 0.32);
      
      // Camera Reaction (0.38s)
      tl.to(cameraRef.current!.position, {
        z: 7.5,
        duration: 0.1,
        ease: "power2.out"
      }, 0.38).to(cameraRef.current!.position, {
        z: 8.0,
        duration: 0.6,
        ease: "elastic.out(1, 0.3)"
      }, 0.48);

      // Total timeline runs slightly longer to reach 1.3s total
      tl.to({}, { duration: 0.5 });
    }
  }, [state.phase, dispatch, targetScale]);

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 8]} fov={45} />
      <Lighting />
      
      <group ref={coreGroup} scale={[0, 0, 0]}>
        <RealityCore />
      </group>
      
      <CoreFragments />


    </>
  );
}
