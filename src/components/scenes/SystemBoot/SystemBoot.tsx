"use client";

import { useEffect, useRef } from "react";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const bootSequence = [
  { text: "CTRL+ALT+REALITY BIOS v0.91", delay: 0.3 },
  { text: "", delay: 0 },
  { text: "MEMORY CHECK ............. OK", delay: 0.4 },
  { text: "DISPLAY .................. OK", delay: 0.2 },
  { text: "POINTER .................. DETECTED", delay: 0.2 },
  { text: "NETWORK .................. CONNECTED", delay: 0.3 },
  { text: "", delay: 0 },
  { text: "INITIALIZING WORLD WIDE WEB...", delay: 0.6 },
  { text: "", delay: 0 },
  { text: "SYSTEM://1991", delay: 0.5 },
  { text: "", delay: 0 },
  { text: "READY.", delay: 0.5 },
];

export function SystemBoot() {
  const { dispatch } = useExperience();
  const containerRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<(HTMLDivElement | null)[]>([]);
  const reducedMotion = useReducedMotion();

  const handleSkip = () => {
    dispatch({ type: "SET_PHASE", payload: "TERMINAL" });
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({
      onComplete: () => {
        // Small pause at the end before transitioning
        gsap.delayedCall(0.5, () => {
          dispatch({ type: "SET_PHASE", payload: "TERMINAL" });
        });
      },
    });

    if (reducedMotion) {
      tl.to(containerRef.current, { opacity: 1, duration: 1 })
        .to({}, { duration: 1 }); // simple wait
      return () => { tl.kill(); };
    }

    // Flicker intro
    tl.to(containerRef.current, { opacity: 1, duration: 0.1, ease: "steps(2)" })
      .to(containerRef.current, { opacity: 0.6, duration: 0.1 })
      .to(containerRef.current, { opacity: 1, duration: 0.1 });

    let cumulativeTime = 0.3;

    bootSequence.forEach((item, index) => {
      const lineNode = linesRef.current[index];
      if (!lineNode || !item.text) return;

      tl.fromTo(
        lineNode,
        { opacity: 0, clipPath: "inset(0 100% 0 0)" },
        {
          opacity: 1,
          clipPath: "inset(0 0% 0 0)",
          duration: 0.05,
          ease: "none",
          delay: item.delay,
        },
        cumulativeTime
      );

      // Add a tiny random flicker to some lines to mimic CRT
      if (Math.random() > 0.6) {
        tl.to(lineNode, { opacity: 0.5, duration: 0.05, yoyo: true, repeat: 1 }, cumulativeTime + 0.1);
      }

      cumulativeTime += item.delay + 0.1;
    });

    return () => {
      tl.kill();
    };
  }, [dispatch, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-full flex flex-col justify-start items-start p-6 md:p-12",
        "bg-black text-terminal font-mono opacity-0",
        // Subtle scanlines and grain
        "before:content-[''] before:absolute before:inset-0 before:pointer-events-none before:bg-[url('data:image/svg+xml,%3Csvg viewBox=\"0 0 4 4\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M0 0h4v2H0z\" fill=\"rgba(255,255,255,0.02)\"/%3E%3C/svg%3E')] before:bg-repeat before:z-10"
      )}
    >
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={handleSkip}
          className="text-[10px] text-muted hover:text-white transition-colors cursor-pointer border border-[#333] hover:border-white px-2 py-1 rounded tracking-widest"
        >
          [ SKIP BOOT ]
        </button>
      </div>

      <div className="flex flex-col gap-1 md:gap-2 mt-8 max-w-2xl w-full z-20">
        {bootSequence.map((item, i) => (
          <div
            key={i}
            ref={(el) => { linesRef.current[i] = el; }}
            className="min-h-[1.2rem] md:min-h-[1.5rem] text-sm md:text-base leading-none"
          >
            {item.text}
          </div>
        ))}
        
        {/* Blinking cursor at the end */}
        <div className="mt-2 text-sm md:text-base animate-pulse">
          &gt; _
        </div>
      </div>
    </div>
  );
}
