import React, { useRef, useState, useCallback, useEffect } from "react";
import { useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function Portal() {
  const { state, dispatch } = useExperience();
  const groupRef = useRef<THREE.Group>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const tunnelGroupRef = useRef<THREE.Group>(null);
  
  const { mouse, viewport } = useThree();
  const reducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  // Shader Uniforms for the outer aperture
  const uniforms = useRef({
    uTime: { value: 0 },
    uHover: { value: 0 }
  }).current;

  // Custom Cursor (We rely on global DOM for ENTER)
  useEffect(() => {
    if (state.phase !== "PORTAL_READY") return;
    document.body.style.cursor = isHovered ? 'pointer' : 'auto';
    
    // Dispatch a custom event so the DOM overlay can react to hover
    window.dispatchEvent(new CustomEvent('portal-hover', { detail: isHovered }));
    
    return () => { document.body.style.cursor = 'auto'; };
  }, [isHovered, state.phase]);

  // Hover animation scaling
  useEffect(() => {
    if (groupRef.current) {
      gsap.to(groupRef.current.scale, {
        x: isHovered ? 1.02 : 1,
        y: isHovered ? 1.02 : 1,
        z: isHovered ? 1.02 : 1,
        duration: 0.8,
        ease: "power2.out"
      });
    }
  }, [isHovered]);

  // Liquid chrome shader for the thin outer aperture
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onBeforeCompile = useCallback((shader: any) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uHover = uniforms.uHover;

    shader.vertexShader = `
      uniform float uTime;
      uniform float uHover;
      
      // Simplex noise
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
      
      vec3 pos = position;
      
      // Continuous subtle organic deformation (liquid metal tension)
      float noise = snoise(vec3(pos.x * 2.0 + uTime * 0.2, pos.y * 2.0, pos.z * 2.0));
      pos += normal * noise * 0.02 * (1.0 + uHover);
      
      transformed = pos;
      `
    );
    
    // Inject tiny occasional green reflections in fragment
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      
      // Slight green ambient hue to match terminal
      diffuseColor.rgb += vec3(0.01, 0.05, 0.02);
      `
    );
  }, [uniforms]);

  // Target values for smooth parallax interpolation
  const parallaxCurrent = useRef(new THREE.Vector2(0, 0));

  useFrame((_, delta) => {
    const timeDelta = reducedMotion ? delta * 0.2 : delta * 0.5;
    uniforms.uTime.value += timeDelta;
    uniforms.uHover.value += ((isHovered ? 1 : 0) - uniforms.uHover.value) * 0.1;

    // Slow continual rotation of the aperture
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * 0.05 * (1.0 + uniforms.uHover.value);
    }

    // Parallax tracking
    if (state.phase === "PORTAL_READY") {
      parallaxCurrent.current.x += (mouse.x - parallaxCurrent.current.x) * 0.1;
      parallaxCurrent.current.y += (mouse.y - parallaxCurrent.current.y) * 0.1;

      if (tunnelGroupRef.current) {
        // Shift tunnel perspective slightly based on mouse
        tunnelGroupRef.current.rotation.y = parallaxCurrent.current.x * 0.15;
        tunnelGroupRef.current.rotation.x = -parallaxCurrent.current.y * 0.15;
        tunnelGroupRef.current.position.x = parallaxCurrent.current.x * 0.2;
        tunnelGroupRef.current.position.y = parallaxCurrent.current.y * 0.2;
      }
    }

    // Rotate tunnel rings at varying speeds to create deep atmospheric motion
    if (tunnelGroupRef.current) {
      tunnelGroupRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          // Skip the vanishing point sphere
          if (child.geometry.type !== "SphereGeometry") {
            // Speed up slightly on hover
            const speedMultiplier = 1.0 + (uniforms.uHover.value * 2.0);
            child.rotation.z += delta * 0.02 * (i % 2 === 0 ? 1 : -1) * (i + 1) * speedMultiplier;
          }
        }
      });
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (state.phase !== "PORTAL_READY") return;
    
    setIsHovered(false);
    document.body.style.cursor = 'auto';
    window.dispatchEvent(new CustomEvent('portal-hover', { detail: false }));
    dispatch({ type: "SET_PHASE", payload: "PHASE_04_READY" });
  };

  const numRings = 7;

  // Generate nested tunnel rings
  const tunnelRings = React.useMemo(() => {
    const rings = [];
    for (let i = 1; i <= numRings; i++) {
      // Rings get smaller and deeper
      const radius = 1.0 - (i * 0.12);
      const zDepth = -(i * 1.5);
      
      // Colors get darker (closer to black) as it gets deeper
      const intensity = Math.max(0.02, 0.2 - (i * 0.03));
      const color = new THREE.Color().setHSL(0, 0, intensity);
      
      rings.push(
        <mesh key={i} position={[0, 0, zDepth]} rotation={[0, 0, (i * Math.PI) / numRings]}>
          {/* Slightly thicker inner rings to hide seams, but radius shrinks */}
          <torusGeometry args={[radius, 0.05 + (i * 0.01), 32, 64]} />
          <meshPhysicalMaterial 
            color={color}
            metalness={0.8}
            roughness={0.5 + (i * 0.05)}
            envMapIntensity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      );
    }
    return rings;
  }, []);

  return (
    <group 
      ref={groupRef}
      scale={1} 
      visible={state.phase === "PORTAL_READY" || state.phase === "PHASE_04_READY"}
      onClick={handleClick}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      {/* LAYER A - Outer Liquid Chrome Aperture */}
      <mesh ref={outerRingRef}>
        {/* THIN irregular boundary: radius 1, tube 0.08 */}
        <torusGeometry args={[1, 0.08, 64, 128]} />
        <meshPhysicalMaterial
          ref={materialRef}
          color="#a0a0a0"
          metalness={1.0}
          roughness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          emissive="#050505"
          onBeforeCompile={onBeforeCompile}
        />
      </mesh>

      {/* LAYER B & C - Inner Threshold and Depth Tunnel */}
      <group ref={tunnelGroupRef}>
        {tunnelRings}
        
        {/* LAYER C (Vanishing Point) - Tiny geometric light */}
        <mesh position={[0, 0, -(numRings * 1.5) - 2]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      </group>
    </group>
  );
}
