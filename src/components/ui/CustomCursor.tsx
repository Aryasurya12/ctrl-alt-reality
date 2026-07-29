"use client";

import { useEffect, useRef, useState } from "react";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export type CursorState = "DEFAULT" | "CLICK" | "DRAG" | "WAIT" | "OPEN" | "GRABBING" | "EXECUTE";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const { x, y } = useMousePosition();
  const isTouch = useIsTouchDevice();
  const reducedMotion = useReducedMotion();
  const [isClicking, setIsClicking] = useState(false);
  const [cursorState, setCursorState] = useState<CursorState>("DEFAULT");

  useEffect(() => {
    const handleDown = () => setIsClicking(true);
    const handleUp = () => setIsClicking(false);
    
    const handleMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cursorTarget = target.closest('[data-cursor]');
      
      if (cursorTarget) {
        const state = cursorTarget.getAttribute('data-cursor') as CursorState;
        setCursorState(state);
      } else {
        setCursorState("DEFAULT");
      }
    };
    
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("mousemove", handleMove);
    
    return () => {
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  useEffect(() => {
    if (isTouch || !cursorRef.current) return;

    if (reducedMotion) {
      gsap.set(cursorRef.current, { x, y });
    } else {
      gsap.to(cursorRef.current, {
        x,
        y,
        duration: 0.15,
        ease: "power2.out",
      });
    }
  }, [x, y, isTouch, reducedMotion]);

  if (isTouch) return null;

  return (
    <div
      ref={cursorRef}
      className={cn(
        "fixed top-0 left-0 pointer-events-none z-[9999] transition-all duration-150 ease-out flex items-center justify-center font-mono text-[10px] whitespace-nowrap",
        "mix-blend-difference -translate-x-1/2 -translate-y-1/2",
        cursorState === "DEFAULT" && "w-4 h-4 bg-white rounded-full",
        cursorState === "CLICK" && "w-6 h-6 bg-transparent border-2 border-white rounded-full",
        cursorState === "DRAG" && "w-4 h-4 bg-transparent border-2 border-white rounded-sm rotate-45 scale-125",
        cursorState === "GRABBING" && "w-4 h-4 bg-white border-2 border-white rounded-sm rotate-45 scale-110",
        cursorState === "WAIT" && "w-6 h-6 bg-transparent border-2 border-white border-t-transparent rounded-full animate-spin",
        cursorState === "OPEN" && "text-white font-bold ml-8 mt-4 tracking-widest",
        cursorState === "EXECUTE" && "text-danger font-bold ml-12 mt-4 tracking-widest",
        isClicking && cursorState !== "OPEN" && cursorState !== "EXECUTE" && "scale-50 opacity-50"
      )}
    >
      {cursorState === "OPEN" && "OPEN ↗"}
      {cursorState === "EXECUTE" && "EXECUTE"}
    </div>
  );
}
