import { useState, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import * as THREE from "three";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { TechObject } from "./TechObject";
import { Sparkles, PerspectiveCamera } from "@react-three/drei";

const TECH_WORDS = [
  "REACT", "NEXT.JS", "TYPESCRIPT", "GSAP", "HTML", "CSS", "SVG", "WEBGL", "THREE.JS", "CANVAS", "API", "JSON", "NODE",
  "TAILWIND", "VITE", "RAPIER", "FRAMER", "ZUSTAND", "TRPC", "GRAPHQL", "PRISMA", "REDIS", "DOCKER", "AWS", "VERCEL"
];

const INITIAL_TECH_WORDS_DATA = TECH_WORDS.map(word => ({
  word,
  position: [(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5] as [number, number, number],
  rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
  scale: 0.8 + Math.random() * 0.5
}));

function GravityController({ setGravity }: { setGravity: React.Dispatch<React.SetStateAction<[number, number, number]>> }) {
  const { state, dispatch } = useExperience();
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const { mouse } = useThree();
  const activeTime = useRef(0);
  const pointerActivity = useRef(false);

  useEffect(() => {
    const handleDown = () => setIsMouseDown(true);
    const handleUp = () => setIsMouseDown(false);
    const handleDblClick = () => setIsReversed(prev => !prev);
    const handleMove = () => { pointerActivity.current = true; };

    window.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("dblclick", handleDblClick);
    window.addEventListener("pointermove", handleMove);

    return () => {
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("dblclick", handleDblClick);
      window.removeEventListener("pointermove", handleMove);
    };
  }, []);

  useFrame((_, delta) => {
    if (state.phase !== "SCENE_05_ACTIVE") return;

    activeTime.current += delta;
    
    if (pointerActivity.current && state.scene05InteractionStep === 0 && activeTime.current > 2.5) {
      dispatch({ type: "SET_SCENE05_INTERACTION", payload: 1 });
    }

    // Ending Condition: 12 seconds or 3 objects thrown
    if (activeTime.current > 12 || state.objectsThrownCount >= 3) {
      dispatch({ type: "SET_PHASE", payload: "SCENE_05_ENDING" });
    }

    // Gravity Calculation
    let gx = mouse.x * 5;
    let gy = mouse.y * 5;
    
    if (isMouseDown) {
      gx *= 3;
      gy *= 3;
    }

    if (isReversed) {
      gx = -gx * 2;
      gy = -gy * 2;
    }

    // Smoothly interpolate gravity to avoid sudden jerks (unless mouse is moving fast, then it feels responsive)
    setGravity(prev => [
      prev[0] + (gx - prev[0]) * 0.1,
      prev[1] + (gy - prev[1]) * 0.1,
      0
    ]);
  });

  return null;
}

export function GravityFailureScene() {
  const { state, dispatch } = useExperience();
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { mouse } = useThree();
  const [gravity, setGravity] = useState<[number, number, number]>([0, -2, 0]);

  useFrame(() => {
    if (cameraRef.current && state.phase === "SCENE_05_ACTIVE") {
      // Tiny parallax
      cameraRef.current.position.x += (mouse.x * 0.5 - cameraRef.current.position.x) * 0.05;
      cameraRef.current.position.y += (mouse.y * 0.5 - cameraRef.current.position.y) * 0.05;
    } else if (cameraRef.current && state.phase === "SCENE_05_ENDING") {
      // Slowly move camera in
      cameraRef.current.position.z += (3 - cameraRef.current.position.z) * 0.02;
      cameraRef.current.position.x += (0 - cameraRef.current.position.x) * 0.02;
      cameraRef.current.position.y += (0 - cameraRef.current.position.y) * 0.02;
    }
  });

  // End sequence timeout
  useEffect(() => {
    if (state.phase === "SCENE_05_ENDING") {
      const timer = setTimeout(() => {
        dispatch({ type: "SET_PHASE", payload: "SCENE_06_HINT" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.phase, dispatch]);

  if (state.phase !== "SCENE_05_ACTIVE" && state.phase !== "SCENE_05_ENDING" && state.phase !== "SCENE_06_HINT") {
    return null;
  }

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 10]} fov={45} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#00ff00" />
      
      <fog attach="fog" args={['#000000', 5, 30]} />
      
      <Sparkles count={500} scale={20} size={2} speed={0.2} opacity={0.2} color="#ffffff" />
      
      <Physics gravity={gravity}>
        {INITIAL_TECH_WORDS_DATA.map((data, i) => (
          <TechObject 
            key={i} 
            text={data.word} 
            position={data.position}
            rotation={data.rotation}
            scale={data.scale}
          />
        ))}
        <GravityController setGravity={setGravity} />
      </Physics>
    </>
  );
}
