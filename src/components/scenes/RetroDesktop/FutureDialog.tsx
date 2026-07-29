"use client";

import { useExperience } from "@/components/providers/ExperienceProvider";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export function FutureDialog() {
  const { state, dispatch } = useExperience();
  const dialogRef = useRef<HTMLDivElement>(null);
  
  const isOpen = state.openWindows.includes("FUTURE_WARNING");

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      gsap.fromTo(dialogRef.current, 
        { scale: 0.95, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.2, ease: "back.out(1.5)" }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
      <div 
        ref={dialogRef}
        className="bg-black border border-danger p-6 max-w-[320px] md:max-w-sm w-full font-mono shadow-[0_0_50px_-12px_rgba(239,68,68,0.5)]"
      >
        <p className="text-danger font-bold text-lg border-b border-danger/30 pb-2 mb-4">
          REALITY OS
        </p>

        <p className="text-sm mb-6 text-white leading-relaxed">
          <span className="text-terminal">future.exe</span> wants permission to modify reality.
        </p>
        
        <p className="text-xs text-muted mb-2">THIS ACTION MAY:</p>
        <ul className="text-xs text-muted flex flex-col gap-1 mb-8 ml-4" style={{ listStyleType: "circle" }}>
          <li>alter interface behavior</li>
          <li>disable conventional layout</li>
          <li>modify dimensional constraints</li>
        </ul>

        <div className="flex gap-4 justify-end">
          <button 
            data-cursor="CLICK"
            onClick={() => dispatch({ type: "CLOSE_WINDOW", payload: "FUTURE_WARNING" })}
            className="px-4 py-2 text-xs border border-border hover:bg-border/50 text-white transition-colors"
          >
            [CANCEL]
          </button>
          <button 
            data-cursor="CLICK"
            onClick={() => {
              dispatch({ type: "CLOSE_WINDOW", payload: "FUTURE_WARNING" });
              dispatch({ type: "SET_PHASE", payload: "FUTURE_TEASER" });
            }}
            className="px-4 py-2 text-xs border border-danger bg-danger/10 text-danger hover:bg-danger hover:text-black transition-colors"
          >
            [ALLOW]
          </button>
        </div>
      </div>
    </div>
  );
}
