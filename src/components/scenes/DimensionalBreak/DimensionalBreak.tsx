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
  
  // Impact texts refs
  const impactRef1 = useRef<HTMLParagraphElement>(null);
  const impactRef2 = useRef<HTMLParagraphElement>(null);
  const impactRef3 = useRef<HTMLParagraphElement>(null);

  // Tutorial refs
  const touchTextRef = useRef<HTMLParagraphElement>(null);
  const feedbackTextRef = useRef<HTMLParagraphElement>(null);
  const shockwaveRef = useRef<HTMLDivElement>(null);

  const reducedMotion = useReducedMotion();

  // Listen for portal hover event from WebGL
  useEffect(() => {
    const handlePortalHover = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setIsPortalHovered(customEvent.detail);
    };
    
    window.addEventListener('portal-hover', handlePortalHover);
    return () => window.removeEventListener('portal-hover', handlePortalHover);
  }, []);

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
  const prevClicked = useRef(state.hasClickedCore);

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
    if (state.hasClickedCore && !prevClicked.current) {
      showFeedback("SIGNAL RECEIVED");
      prevClicked.current = true;
    }
  }, [state.hasDraggedCore, state.hasHeldCore, state.hasClickedCore, state.phase]);


  // Shockwave Sequence
  useEffect(() => {
    if (state.phase === "CORE_BREAKING") {
      const tl = gsap.timeline();
      
      // Jitter typography around 0.45s
      tl.to(typographyRef.current, {
        x: () => (Math.random() - 0.5) * 20,
        y: () => (Math.random() - 0.5) * 20,
        skewX: () => (Math.random() - 0.5) * 5,
        duration: 0.1,
        repeat: 3,
        yoyo: true,
      }, 0.45);
      
      // Fade out typography
      tl.to(typographyRef.current, { opacity: 0, duration: 0.3 }, 0.85);

      // DOM shockwave ring
      if (shockwaveRef.current) {
        tl.fromTo(shockwaveRef.current, 
          { scale: 0, opacity: 1, borderWidth: "10px" },
          { scale: 5, opacity: 0, borderWidth: "1px", duration: 0.6, ease: "power2.out" },
          0.32
        );
      }
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

      {/* Phase 3 Typography */}
      <div 
        ref={typographyRef}
        className="absolute inset-0 flex pointer-events-none opacity-0 mix-blend-difference"
      >
        <div className="w-full h-full p-8 md:p-16 flex flex-col justify-center">
           <h2 className="t1 text-white/50 font-serif text-lg md:text-2xl tracking-widest uppercase w-full">The web was built flat.</h2>
           <h2 className="t2 text-white/80 font-serif text-xl md:text-3xl tracking-widest uppercase w-full mt-2">We gave it motion.</h2>
           <h1 className="t3 text-white font-serif tracking-tighter uppercase mt-6" style={{ fontSize: "clamp(3rem, 6vw, 6rem)", lineHeight: 0.9 }}>Now<br/>Give It<br/>Depth.</h1>
        </div>
      </div>

      {/* Interaction Guides (Right side) */}
      {(state.phase === "CORE_INTERACTIVE" || state.phase === "CORE_BREAKING") && (
        <div className="absolute right-8 md:right-24 top-1/2 -translate-y-1/2 flex flex-col gap-12 pointer-events-none mix-blend-difference">
          <div className={cn("transition-opacity duration-1000", state.hasDraggedCore ? "opacity-50" : "opacity-100")}>
            <p className="text-white font-mono text-sm tracking-widest uppercase flex items-center gap-2">
              DRAG {state.hasDraggedCore && <span className="text-terminal">✓</span>}
            </p>
            <p className="text-white/50 font-serif italic mt-1 text-sm">to rotate</p>
          </div>
          
          <div className={cn("transition-opacity duration-1000", !state.hasDraggedCore ? "opacity-30" : state.hasHeldCore ? "opacity-50" : "opacity-100")}>
            <p className="text-white font-mono text-sm tracking-widest uppercase flex items-center gap-2">
              HOLD {state.hasHeldCore && <span className="text-terminal">✓</span>}
            </p>
            <p className="text-white/50 font-serif italic mt-1 text-sm">to compress</p>
          </div>
          
          <div className={cn("transition-opacity duration-1000", !state.hasHeldCore ? "opacity-30" : "opacity-100 animate-pulse")}>
            <p className="text-white font-mono text-sm tracking-widest uppercase flex items-center gap-2">
              RELEASE {state.hasReleasedCore && <span className="text-terminal">✓</span>}
            </p>
            <p className="text-white/50 font-serif italic mt-1 text-sm">to break</p>
          </div>
        </div>
      )}

      {/* Shockwave Ring */}
      <div 
        ref={shockwaveRef} 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-white mix-blend-difference opacity-0 pointer-events-none"
      />

      {/* GRAVITY FAILURE placeholder */}
      {state.phase === "GRAVITY_FAILURE" && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center pointer-events-none z-[200]">
          <h1 className="text-white font-serif tracking-widest text-4xl md:text-6xl text-center leading-tight">
            GRAVITY<br/>FAILED.
          </h1>
          <p className="text-terminal font-mono text-xs mt-8 tracking-widest">
            REALITY.OS // ERROR 05
          </p>
        </div>
      )}

    </div>
  );
}
