import { useEffect, useState, useRef } from "react";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { gsap } from "@/lib/gsap";

export function Scene05Overlay() {
  const { state } = useExperience();
  const hintRef = useRef<HTMLDivElement>(null);
  const endTextRef = useRef<HTMLDivElement>(null);

  const [hintText, setHintText] = useState("");

  useEffect(() => {
    if (state.phase !== "SCENE_05_ACTIVE" && state.phase !== "SCENE_05_ENDING" && state.phase !== "SCENE_06_HINT") return;

    if (state.phase === "SCENE_06_HINT") {
      gsap.to(hintRef.current, { opacity: 0, duration: 0.5 });
      gsap.fromTo(endTextRef.current, 
        { opacity: 0, scale: 0.9 }, 
        { opacity: 1, scale: 1, duration: 2, ease: "power2.out" }
      );
      return;
    }

    // Handle Hints
    const tl = gsap.timeline();
    
    if (state.scene05InteractionStep === 0) {
      // Just started, wait 2 seconds then show first hint
      tl.to({}, { duration: 2.0 });
      tl.add(() => setHintText("MOVE\nTHE CURSOR"));
      tl.to(hintRef.current, { opacity: 1, duration: 1.0 });
    } else if (state.scene05InteractionStep === 1) {
      // First movement done
      tl.to(hintRef.current, { opacity: 0, duration: 0.5 });
      tl.add(() => setHintText("GRAB\nAN OBJECT"));
      tl.to(hintRef.current, { opacity: 1, duration: 1.0, delay: 0.5 });
    } else if (state.scene05InteractionStep === 2) {
      // First drag done
      tl.to(hintRef.current, { opacity: 0, duration: 0.5 });
      tl.add(() => setHintText("THROW IT."));
      tl.to(hintRef.current, { opacity: 1, duration: 1.0, delay: 0.5 });
    } else if (state.scene05InteractionStep === 3) {
      // Thrown
      tl.to(hintRef.current, { opacity: 0, duration: 1.0 });
    }
  }, [state.scene05InteractionStep, state.phase]);

  if (state.phase !== "SCENE_05_ACTIVE" && state.phase !== "SCENE_05_ENDING" && state.phase !== "SCENE_06_HINT") {
    return null;
  }

  return (
    <div className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center">
      <div 
        ref={hintRef}
        className="text-white font-serif tracking-widest text-xl md:text-3xl text-center leading-tight opacity-0 mix-blend-difference"
      >
        {hintText.split('\n').map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      <div 
        ref={endTextRef}
        className="absolute inset-0 flex items-center justify-center text-danger font-mono text-xl md:text-3xl text-center tracking-[0.5em] opacity-0 mix-blend-difference bg-black/50"
      >
        <div>
          DIMENSIONAL<br/>GATEWAY<br/>DETECTED.
        </div>
      </div>
    </div>
  );
}
