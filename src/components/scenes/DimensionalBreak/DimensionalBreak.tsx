import { useEffect, useState, useRef } from "react";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function DimensionalBreak() {
  const { state, dispatch } = useExperience();
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef1 = useRef<HTMLParagraphElement>(null);
  const textRef2 = useRef<HTMLParagraphElement>(null);
  const textRef3 = useRef<HTMLParagraphElement>(null);
  const typographyRef = useRef<HTMLDivElement>(null);
  const typographyInnerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const statusTextRef = useRef<HTMLDivElement>(null);
  const cursorTextRef = useRef<HTMLDivElement>(null);
  const implosionFlashRef = useRef<HTMLDivElement>(null);
  
  const [diagnostics, setDiagnostics] = useState("");

  // Impact texts refs
  const impactRef1 = useRef<HTMLParagraphElement>(null);
  const impactRef2 = useRef<HTMLParagraphElement>(null);
  const impactRef3 = useRef<HTMLParagraphElement>(null);

  // Tutorial refs
  const touchTextRef = useRef<HTMLParagraphElement>(null);
  const feedbackTextRef = useRef<HTMLParagraphElement>(null);

  const reducedMotion = useReducedMotion();

  // Handle the initial teaser text sequence
  useEffect(() => {
    if (state.phase !== "FUTURE_TEASER") return;

    const tl = gsap.timeline({
      onComplete: () => {
        dispatch({ type: "SET_PHASE", payload: "DIMENSIONAL_BREAK" });
      }
    });

    tl.to(textRef1.current, { opacity: 1, duration: 0.5, ease: "none" }, 1.0)
      .to(textRef2.current, { opacity: 1, duration: 0.5, ease: "none" }, 2.5)
      .to(textRef3.current, { opacity: 1, duration: 0.5, ease: "none" }, 5.1);

  }, [state.phase, dispatch]);

  // Handle the breakthrough sequence and cinematic text
  useEffect(() => {
    if (state.phase !== "DIMENSIONAL_BREAK" || !containerRef.current) return;

    const tl = gsap.timeline();

    tl.to({}, { duration: 0.7 });

    if (!reducedMotion) {
      tl.to(containerRef.current, {
        x: () => (Math.random() - 0.5) * 5,
        y: () => (Math.random() - 0.5) * 5,
        duration: 0.1,
        repeat: 5,
        yoyo: true,
      });
    }

    tl.to(impactRef1.current, { opacity: 1, duration: 0.1 }, 1.0)
      .to(impactRef1.current, { opacity: 0, duration: 0.2 }, 1.5)
      .to(impactRef2.current, { opacity: 1, duration: 0.1 }, 1.5)
      .to(impactRef2.current, { opacity: 0, duration: 0.2 }, 2.0)
      .to(impactRef3.current, { opacity: 1, duration: 0.2 }, 2.0)
      .to(impactRef3.current, { opacity: 0, duration: 0.5 }, 3.5);

    tl.to(typographyRef.current, { opacity: 1, duration: 1 }, 5.5);
    
    const h1 = typographyRef.current?.querySelector('.t1');
    const h2 = typographyRef.current?.querySelector('.t2');
    const h3 = typographyRef.current?.querySelector('.t3');
    
    if (h1 && h2 && h3) {
      tl.fromTo(h1, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1 }, 5.5)
        .fromTo(h2, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1 }, 6.5)
        .fromTo(h3, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1 }, 7.5);
    }

    tl.add(() => {
      dispatch({ type: "SET_PHASE", payload: "CORE_INTERACTIVE" });
    }, 9.0);

  }, [state.phase, dispatch, reducedMotion]);

  // Interaction Tutorial Sequence
  useEffect(() => {
    if (state.phase !== "CORE_INTERACTIVE") return;

    // Show initial "TOUCH THE UNKNOWN"
    const tl = gsap.timeline();
    tl.to(touchTextRef.current, { opacity: 1, duration: 1, delay: 1 })
      .to(touchTextRef.current, { opacity: 0, duration: 1, delay: 1.5 });

  }, [state.phase]);

  // Feedback display
  const showFeedback = (text: string) => {
    if (!feedbackTextRef.current) return;
    const el = feedbackTextRef.current;
    el.innerText = text;
    gsap.killTweensOf(el);
    gsap.timeline()
      .to(el, { opacity: 1, duration: 0.3 })
      .to(el, { opacity: 0, duration: 1, delay: 1.5 });
  };

  const prevDragged = useRef(state.hasDraggedCore);
  const prevHeld = useRef(state.hasHeldCore);
  const prevReleased = useRef(state.hasReleasedCore);

  useEffect(() => {
    if (state.phase !== "CORE_INTERACTIVE") return;

    if (state.hasDraggedCore && !prevDragged.current) {
      showFeedback("ROTATION UNLOCKED");
      prevDragged.current = true;
    }
    if (state.hasHeldCore && !prevHeld.current) {
      showFeedback("MATERIAL RESPONSE DETECTED");
      prevHeld.current = true;
    }
    if (state.hasReleasedCore && !prevReleased.current) {
      showFeedback("SIGNAL RECEIVED");
      prevReleased.current = true;
    }
  }, [state.hasDraggedCore, state.hasHeldCore, state.hasReleasedCore, state.phase]);


  // Reality Break Master Sequence
  useEffect(() => {
    if (state.phase === "CORE_BREAKING") {
      const tl = gsap.timeline();

      // Ensure elements are ready
      gsap.set(typographyRef.current, { perspective: 1000 });
      gsap.set(typographyInnerRef.current, { transformStyle: "preserve-3d" });
      
      const words = document.querySelectorAll('.physics-word');
      const instructions = document.querySelectorAll('.physics-instruction');

      // STAGE 1 & 2: Center Status
      tl.to(statusTextRef.current, { opacity: 1, duration: 0.1 }, 0.0);
      tl.add(() => { if (statusTextRef.current) statusTextRef.current.innerText = "STABILITY: 03%"; }, 0.0);
      tl.add(() => { if (statusTextRef.current) statusTextRef.current.innerText = "STABILITY: 01%"; }, 0.2);
      tl.add(() => { if (statusTextRef.current) statusTextRef.current.innerText = "STABILITY: 00%"; }, 0.4);
      tl.add(() => { if (statusTextRef.current) statusTextRef.current.innerText = "CORE FAILURE"; }, 0.5);
      tl.to(statusTextRef.current, { opacity: 0, duration: 0.1 }, 0.65);

      // STAGE 3: Reality Bending (Text drifts towards center)
      tl.to(words, { x: 50, duration: 0.5, ease: "power1.in", stagger: 0.02 }, 0.55);
      tl.to(instructions, { x: -50, duration: 0.5, ease: "power1.in", stagger: 0.02 }, 0.55);

      // STAGE 4: Grid Distortion
      tl.to(gridRef.current, { opacity: 1, duration: 0.2 }, 0.75);
      tl.to(gridRef.current, { scale: 0.8, duration: 0.45, ease: "power2.in" }, 0.75);

      // STAGE 5: Pointer Control Lost
      tl.to(cursorTextRef.current, { opacity: 1, duration: 0.1 }, 0.90);
      tl.to(cursorTextRef.current, { opacity: 0, duration: 0.1 }, 1.25);

      // STAGE 7: Gravity Reversal (Snap Outward)
      tl.to(words, { x: -30, duration: 0.05, ease: "power4.out" }, 1.20);
      tl.to(instructions, { x: 30, duration: 0.05, ease: "power4.out" }, 1.20);

      // STAGE 9: Typography Physics (zero gravity drift)
      words.forEach((word) => {
        tl.to(word, {
          x: () => (Math.random() - 0.5) * 400 - 50,
          y: () => (Math.random() - 0.5) * 400,
          rotation: () => (Math.random() - 0.5) * 90,
          duration: 0.6,
          ease: "power2.out"
        }, 1.55);
      });
      instructions.forEach((inst) => {
        tl.to(inst, {
          x: () => (Math.random() - 0.5) * 400 + 50,
          y: () => (Math.random() - 0.5) * 400,
          rotation: () => (Math.random() - 0.5) * 90,
          duration: 0.6,
          ease: "power2.out"
        }, 1.55);
      });
      tl.to(gridRef.current, { scale: 1.5, opacity: 0.5, duration: 0.6, ease: "power2.out" }, 1.55);

      // STAGE 10: Screen Depth Failure
      tl.to(typographyInnerRef.current, {
        rotateY: 25,
        rotateX: -10,
        z: -100,
        duration: 0.45,
        ease: "power1.inOut"
      }, 1.80);

      // STAGE 11: Final Suction
      words.forEach((word) => {
        tl.to(word, { x: 500, y: 0, scale: 0, duration: 0.35, ease: "expo.in" }, 2.10);
      });
      instructions.forEach((inst) => {
        tl.to(inst, { x: -500, y: 0, scale: 0, duration: 0.35, ease: "expo.in" }, 2.10);
      });
      tl.to(gridRef.current, { scale: 0, opacity: 0, duration: 0.35, ease: "expo.in" }, 2.10);
      tl.to(typographyInnerRef.current, { rotateY: 90, scale: 0, duration: 0.35, ease: "expo.in" }, 2.10);

      // STAGE 12: Implosion White Flash
      tl.fromTo(implosionFlashRef.current, 
        { opacity: 1, scale: 0 }, 
        { scale: 50, duration: 0.1, ease: "power4.out" }, 2.45
      ).to(implosionFlashRef.current, { opacity: 0, duration: 0.05 }, 2.55);

      // STAGE 13: Diagnostics Typing
      tl.add(() => setDiagnostics(""), 2.65);
      tl.add(() => setDiagnostics("REALITY.OS"), 2.70);
      tl.add(() => setDiagnostics("REALITY.OS\nPHYSICS ENGINE ........ OFFLINE"), 2.80);
      tl.add(() => setDiagnostics("REALITY.OS\nPHYSICS ENGINE ........ OFFLINE\nSPATIAL MATRIX ........ FAILED"), 2.90);
      tl.add(() => setDiagnostics("REALITY.OS\nPHYSICS ENGINE ........ OFFLINE\nSPATIAL MATRIX ........ FAILED\nGRAVITY ............... NULL"), 3.00);
      tl.add(() => setDiagnostics(""), 3.25);
    }
  }, [state.phase]);

  if (state.phase !== "FUTURE_TEASER" && state.phase !== "DIMENSIONAL_BREAK" && state.phase !== "CORE_INTERACTIVE" && state.phase !== "CORE_BREAKING" && state.phase !== "GRAVITY_FAILURE") {
    return null;
  }

  return (
    <div ref={containerRef} className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden">
      
      {state.phase === "FUTURE_TEASER" && (
        <div className="flex flex-col items-center justify-center text-center p-4 mix-blend-difference" data-cursor="WAIT">
          <p ref={textRef1} className="text-terminal font-mono mb-2 opacity-0">&gt; EXECUTING future.exe...</p>
          <p ref={textRef2} className="text-danger font-mono mb-8 opacity-0">DIMENSIONAL LAYER DETECTED</p>
          <p ref={textRef3} className="text-danger font-mono mb-8 opacity-0 font-bold">WARNING:<br/>DEPTH VALUE EXCEEDS INTERFACE LIMIT</p>
        </div>
      )}

      {/* Impact Texts */}
      <p ref={impactRef1} className="text-danger font-mono font-bold text-xl mix-blend-difference absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0">
        INTERFACE COLLISION DETECTED
      </p>
      <p ref={impactRef2} className="text-danger font-mono font-bold text-xl mix-blend-difference absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0">
        Z-INDEX ERROR
      </p>
      <p ref={impactRef3} className="text-white font-mono font-bold text-sm mix-blend-difference absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0">
        OBJECT EXISTS OUTSIDE DOCUMENT FLOW
      </p>

      {/* Background Grid for Distortion */}
      <div 
        ref={gridRef}
        className="absolute inset-0 pointer-events-none opacity-0 mix-blend-difference"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          backgroundPosition: 'center center'
        }}
      />

      {/* Center status text */}
      <div ref={statusTextRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-terminal font-mono text-[10px] opacity-0 pointer-events-none z-[110] tracking-widest whitespace-nowrap">
        STABILITY: 03%
      </div>

      {/* Custom Cursor offset text */}
      <div ref={cursorTextRef} className="absolute top-1/2 left-[55%] text-danger font-mono text-[10px] opacity-0 pointer-events-none z-[110] tracking-widest">
        POINTER CONTROL LOST
      </div>

      {/* Phase 3 Typography */}
      <div 
        ref={typographyRef}
        className="absolute inset-0 flex pointer-events-none opacity-0 mix-blend-difference"
      >
        <div ref={typographyInnerRef} className="w-full h-full p-8 md:p-16 flex flex-col justify-center origin-center">
           <h2 className="t1 text-white/50 font-serif text-lg md:text-2xl tracking-widest uppercase w-full">
             <span className="physics-word inline-block mr-[0.3em]">The</span>
             <span className="physics-word inline-block mr-[0.3em]">web</span>
             <span className="physics-word inline-block mr-[0.3em]">was</span>
             <span className="physics-word inline-block mr-[0.3em]">built</span>
             <span className="physics-word inline-block">flat.</span>
           </h2>
           <h2 className="t2 text-white/80 font-serif text-xl md:text-3xl tracking-widest uppercase w-full mt-2">
             <span className="physics-word inline-block mr-[0.3em]">We</span>
             <span className="physics-word inline-block mr-[0.3em]">gave</span>
             <span className="physics-word inline-block mr-[0.3em]">it</span>
             <span className="physics-word inline-block">motion.</span>
           </h2>
           <h1 className="t3 text-white font-serif tracking-tighter uppercase mt-6" style={{ fontSize: "clamp(3rem, 6vw, 6rem)", lineHeight: 0.9 }}>
             <div className="physics-word inline-block">Now</div><br/>
             <div className="physics-word inline-block">Give It</div><br/>
             <div className="physics-word inline-block">Depth.</div>
           </h1>
        </div>
      </div>

      {/* Interaction Guides (Right side) */}
      {(state.phase === "CORE_INTERACTIVE" || state.phase === "CORE_BREAKING") && (
        <div className="absolute right-8 md:right-24 top-1/2 -translate-y-1/2 flex flex-col gap-12 pointer-events-none mix-blend-difference">
          <div className={cn("physics-instruction transition-opacity duration-1000", state.hasDraggedCore ? "opacity-50" : "opacity-100")}>
            <p className="text-white font-mono text-sm tracking-widest uppercase flex items-center gap-2 whitespace-nowrap">
              DRAG {state.hasDraggedCore && <span className="text-terminal">✓</span>}
            </p>
            <p className="text-white/50 font-serif italic mt-1 text-sm">to rotate</p>
          </div>
          
          <div className={cn("physics-instruction transition-opacity duration-1000", !state.hasDraggedCore ? "opacity-30" : state.hasHeldCore ? "opacity-50" : "opacity-100")}>
            <p className="text-white font-mono text-sm tracking-widest uppercase flex items-center gap-2 whitespace-nowrap">
              HOLD {state.hasHeldCore && <span className="text-terminal">✓</span>}
            </p>
            <p className="text-white/50 font-serif italic mt-1 text-sm">to compress</p>
          </div>
          
          <div className={cn("physics-instruction transition-opacity duration-1000", !state.hasHeldCore ? "opacity-30" : "opacity-100 animate-pulse")}>
            <p className="text-white font-mono text-sm tracking-widest uppercase flex items-center gap-2 whitespace-nowrap">
              RELEASE {state.hasReleasedCore && <span className="text-terminal">✓</span>}
            </p>
            <p className="text-white/50 font-serif italic mt-1 text-sm">to break</p>
          </div>
        </div>
      )}

      {/* Implosion White Flash */}
      <div 
        ref={implosionFlashRef} 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white opacity-0 pointer-events-none z-[150]"
      />

      {/* GRAVITY FAILURE placeholder & Diagnostics */}
      {(state.phase === "CORE_BREAKING" || state.phase === "GRAVITY_FAILURE") && (
        <div className={cn("absolute inset-0 bg-black flex flex-col items-center justify-center pointer-events-none z-[200]", state.phase === "GRAVITY_FAILURE" ? "opacity-100" : "opacity-0")} style={{ opacity: diagnostics ? 1 : undefined }}>
          {diagnostics ? (
            <div className="absolute top-8 left-8 text-terminal font-mono text-xs whitespace-pre-wrap leading-relaxed opacity-75">
              {diagnostics}
            </div>
          ) : state.phase === "GRAVITY_FAILURE" ? (
            <>
              <h1 className="text-white font-serif tracking-widest text-4xl md:text-6xl text-center leading-tight">
                GRAVITY<br/>FAILED.
              </h1>
              <p className="text-terminal font-mono text-xs mt-8 tracking-widest">
                REALITY.OS // ERROR 05
              </p>
            </>
          ) : null}
        </div>
      )}

    </div>
  );
}
