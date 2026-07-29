"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap } from "@/lib/gsap";

export function ScreenTear() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!containerRef.current) return;

    if (reducedMotion) {
      gsap.to(containerRef.current, {
        opacity: 1,
        duration: 0.5,
      });
      return;
    }

    const tl = gsap.timeline();
    
    // Animate a central tear that scales vertically to reveal the desktop underneath
    tl.fromTo(containerRef.current,
      { clipPath: "polygon(0 50%, 100% 50%, 100% 50%, 0 50%)" },
      { clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)", duration: 1.2, ease: "power4.inOut" }
    );

    return () => {
      tl.kill();
    };
  }, [reducedMotion]);

  // This component will act as the "reveal" layer showing through the torn terminal.
  // We apply it over the terminal and wait for the phase to switch to DESKTOP.
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#080808] pointer-events-none"
      style={{
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    />
  );
}
