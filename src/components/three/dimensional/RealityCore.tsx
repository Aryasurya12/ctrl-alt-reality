import { useRef, useState, useCallback, useEffect } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function RealityCore() {
  const { state, dispatch } = useExperience();
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const reducedMotion = useReducedMotion();

  // Interaction States
  const [isHovered, setIsHovered] = useState(false);
  const [interactionState, setInteractionState] = useState<"idle" | "pointerDown" | "dragging" | "holding">("idle");
  
  const pointerDownTime = useRef(0);
  const dragStart = useRef({ x: 0, y: 0 });
  const totalMovement = useRef(0);
  
  const rotationTarget = useRef(new THREE.Vector2(0, 0));
  const rotationCurrent = useRef(new THREE.Vector2(0, 0));
  const rotationVelocity = useRef(new THREE.Vector2(0, 0));
  
  const holdProgress = useRef(0);

  // Shader Uniforms
  const uniforms = useRef({
    uTime: { value: 0 },
    uPulse: { value: 0 },
    uCompress: { value: 0 },
    uOverload: { value: 0 },
    uFracture: { value: 0 },
  });

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('core-debug-update', {
      detail: {
        pointerDown: interactionState === "pointerDown",
        isDragging: interactionState === "dragging",
        isHolding: interactionState === "holding"
      }
    }));
    
    if (interactionState === "holding" && !state.hasHeldCore) {
      dispatch({ type: "SET_CORE_INTERACTION", payload: "hold" });
    }
  }, [interactionState, dispatch, state.hasHeldCore]);

  // Custom Cursor Updates
  useEffect(() => {
    if (state.phase !== "CORE_INTERACTIVE") {
      document.body.style.cursor = 'auto';
      return;
    }

    if (interactionState === "dragging") {
      document.body.style.cursor = 'grabbing';
    } else if (interactionState === "holding") {
      document.body.style.cursor = 'wait'; // Or crosshair, but wait conveys tension
    } else if (interactionState === "pointerDown") {
      document.body.style.cursor = 'grab';
    } else if (isHovered) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'auto';
    }
  }, [interactionState, isHovered, state.phase]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onBeforeCompile = useCallback((shader: any) => {
    shader.uniforms.uTime = uniforms.current.uTime;
    shader.uniforms.uPulse = uniforms.current.uPulse;
    shader.uniforms.uCompress = uniforms.current.uCompress;
    shader.uniforms.uOverload = uniforms.current.uOverload;
    shader.uniforms.uFracture = uniforms.current.uFracture;

    shader.vertexShader = `
      uniform float uTime;
      uniform float uPulse;
      uniform float uCompress;
      uniform float uOverload;
      uniform float uFracture;

      
      // Simplex noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      
      float snoise(vec3 v) { 
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i); 
        vec4 p = permute( permute( permute( 
                   i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
      }
      
      ${shader.vertexShader}
    `.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      
      // Breathing base noise
      float noise = snoise(vec3(position.x * 1.5 + uTime * 0.1, position.y * 1.5, position.z * 1.5));
      float deformation = noise * 0.03 * (1.0 - uOverload); 
      
      // Overload deformation (fast vibration, pulled inwards)
      float overloadNoise = snoise(vec3(position.x * 10.0 + uTime * 10.0, position.y * 10.0, position.z * 10.0));
      deformation += overloadNoise * 0.05 * uOverload;
      
      // Fracture pulse
      float fracturePulse = (sin(position.y * 20.0 - uTime * 50.0) * 0.5 + 0.5) * uFracture;
      deformation += fracturePulse * 0.2;
      
      // Apply base deformation along normal
      vec3 finalPos = position + normal * deformation;
      
      // Compress interaction (Squash Y, Stretch X/Z)
      finalPos.y = mix(finalPos.y, finalPos.y * 0.91, uCompress);
      finalPos.x = mix(finalPos.x, finalPos.x * 1.05, uCompress);
      finalPos.z = mix(finalPos.z, finalPos.z * 1.05, uCompress);
      
      transformed = finalPos;
      `
    );

    shader.fragmentShader = `
      uniform float uCompress;
      uniform float uOverload;
      uniform float uFracture;
      uniform float uTime;
      ${shader.fragmentShader}
    `.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      
      // Increase highlight intensity slightly during hold/compress
      diffuseColor.rgb += vec3(0.05, 0.1, 0.08) * uCompress;
      
      // Overload tightening
      diffuseColor.rgb *= (1.0 - uOverload * 0.3);
      
      // Fracture bright seam
      float seam = step(0.98, sin(vNormal.y * 20.0 + uTime * 10.0));
      diffuseColor.rgb += vec3(1.0, 1.0, 1.0) * seam * uFracture * 2.0;
      `
    );
  }, [uniforms]);

  useFrame((_, delta) => {
    uniforms.current.uTime.value += delta * (reducedMotion ? 0.2 : 0.5);

    if (meshRef.current) {
      if (interactionState === "dragging") {
        // Strong matching to target during drag
        rotationCurrent.current.x += (rotationTarget.current.x - rotationCurrent.current.x) * 0.2;
        rotationCurrent.current.y += (rotationTarget.current.y - rotationCurrent.current.y) * 0.2;
      } else {
        // Auto slow rotation + damping inertia
        rotationCurrent.current.x += rotationVelocity.current.x * delta;
        rotationCurrent.current.y += rotationVelocity.current.y * delta;
        
        // Decay velocity
        rotationVelocity.current.x *= 0.95;
        rotationVelocity.current.y *= 0.95;
        
        // Base idle rotation
        rotationTarget.current.x = rotationCurrent.current.x + delta * 0.1 * (isHovered ? 2 : 1);
        rotationTarget.current.y = rotationCurrent.current.y + delta * 0.05 * (isHovered ? 2 : 1);
        
        rotationCurrent.current.x += (rotationTarget.current.x - rotationCurrent.current.x) * 0.05;
        rotationCurrent.current.y += (rotationTarget.current.y - rotationCurrent.current.y) * 0.05;
      }

      meshRef.current.rotation.y = rotationCurrent.current.x;
      meshRef.current.rotation.x = rotationCurrent.current.y;
    }

    // Handle hold/compress logic
    if (interactionState === "pointerDown") {
      // Check for hold threshold
      if (performance.now() - pointerDownTime.current > 450 && totalMovement.current < 10) {
        setInteractionState("holding");
      }
    }

    if (interactionState === "holding") {
      holdProgress.current = Math.min(1, holdProgress.current + delta * 2.0);
    } else {
      holdProgress.current = Math.max(0, holdProgress.current - delta * 4.0);
    }
    
    // Smooth elastic ease for compress
    const compressTarget = interactionState === "holding"
      ? holdProgress.current 
      : Math.sin(holdProgress.current * Math.PI) * holdProgress.current * -0.2 + holdProgress.current;
      
    uniforms.current.uCompress.value += (compressTarget - uniforms.current.uCompress.value) * 0.2;
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (state.phase !== "CORE_INTERACTIVE") return;
    
    setInteractionState("pointerDown");
    pointerDownTime.current = performance.now();
    dragStart.current = { x: e.clientX, y: e.clientY };
    totalMovement.current = 0;
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (state.phase !== "CORE_INTERACTIVE" || interactionState === "idle") return;
    
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    
    totalMovement.current += Math.abs(dx) + Math.abs(dy);
    
    // Only transition to dragging if we haven't already transitioned to holding
    if (totalMovement.current > 10 && interactionState === "pointerDown") {
      setInteractionState("dragging");
      dispatch({ type: "SET_CORE_INTERACTION", payload: "drag" });
    }
    
    if (interactionState === "dragging" || interactionState === "holding") {
      const deltaX = dx * 0.005;
      const deltaY = dy * 0.005;
      
      rotationTarget.current.x += deltaX;
      rotationTarget.current.y += deltaY;
      
      // Store velocity for inertia
      rotationVelocity.current.x = deltaX * 60;
      rotationVelocity.current.y = deltaY * 60;
      
      dragStart.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();

    // Trigger release if they were holding, or if they dragged while it was significantly compressed
    if (interactionState === "holding" || (state.hasHeldCore && holdProgress.current > 0.3)) {
      dispatch({ type: "SET_CORE_INTERACTION", payload: "release" });
    }
    
    setInteractionState("idle");
  };

  // CORE_BREAKING Timeline
  useEffect(() => {
    if (state.phase === "CORE_BREAKING") {
      const tl = gsap.timeline();
      
      // STAGE 2: 0.3s - 0.8s (Overload)
      tl.to(uniforms.current.uOverload, { value: 1, duration: 0.5, ease: "power2.inOut" }, 0.3);
      
      // STAGE 6: 1.15s (Fracture)
      tl.to(uniforms.current.uFracture, { value: 1, duration: 0.1, ease: "power4.out" }, 1.15); // Sharp pulse
      
      // 1.45s: Core disappears
      tl.to(meshRef.current!.scale, { x: 0, y: 0, z: 0, duration: 0.05 }, 1.45);
    }
  }, [state.phase, uniforms]);

  return (
    <mesh
      ref={meshRef}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOut={handlePointerUp}
      scale={1}
      visible={state.phase === "DIMENSIONAL_BREAK" || state.phase === "CORE_INTERACTIVE" || state.phase === "CORE_BREAKING"}
    >
      <icosahedronGeometry args={[1, 128]} />
      <meshPhysicalMaterial
        ref={materialRef}
        color="#ffffff"
        metalness={1}
        roughness={0.15}
        clearcoat={1}
        clearcoatRoughness={0.1}
        onBeforeCompile={onBeforeCompile}
      />
    </mesh>
  );
}
