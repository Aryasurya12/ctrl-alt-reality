"use client";

import { useEffect, useRef } from "react";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export type CursorState = "DEFAULT" | "CLICK" | "DRAG" | "THROW" | "ENTER" | "BREAK" | "HOLD" | "EXPLORE";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const { x, y } = useMousePosition();
  const isTouch = useIsTouchDevice();
  const reducedMotion = useReducedMotion();

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
        "fixed top-0 left-0 w-4 h-4 bg-white rounded-full pointer-events-none z-50",
        "mix-blend-difference -translate-x-1/2 -translate-y-1/2"
      )}
    />
  );
}
