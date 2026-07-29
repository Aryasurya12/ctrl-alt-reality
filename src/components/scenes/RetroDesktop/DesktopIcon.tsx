"use client";

import { useExperience } from "@/components/providers/ExperienceProvider";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";

interface DesktopIconProps {
  id: string;
  label: string;
  x: number;
  y: number;
  isExecutable?: boolean;
}

export function DesktopIcon({ id, label, x, y, isExecutable = false }: DesktopIconProps) {
  const { dispatch, state } = useExperience();
  const isSelected = state.selectedIcon === id;
  const [isHovered, setIsHovered] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const isTouch = useIsTouchDevice();

  // Future.exe anomaly
  useEffect(() => {
    if (id === "future.exe" && state.openedAppCount === 3 && !reducedMotion && iconRef.current) {
      gsap.to(iconRef.current, { x: "+=1", y: "-=1", yoyo: true, repeat: 5, duration: 0.05, delay: 0.5 });
    }
  }, [id, state.openedAppCount, reducedMotion]);

  const displayLabel = id === "???" && (isSelected || isHovered) ? "DON'T." : label;

  const triggerOpen = () => {
    if (id === "???") {
      dispatch({ type: "OPEN_WINDOW", payload: "ACCESS_DENIED" });
      return;
    }
    if (id === "future.exe") {
      dispatch({ type: "OPEN_WINDOW", payload: "FUTURE_WARNING" });
    } else {
      dispatch({ type: "OPEN_WINDOW", payload: id });
    }
  };

  const handlePointerDown = (e: React.PointerEvent | React.TouchEvent) => {
    e.stopPropagation();
    dispatch({ type: "SELECT_ICON", payload: id });

    // On mobile touch, immediately open
    if (isTouch) {
      triggerOpen();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isTouch) triggerOpen();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerOpen();
    }
  };

  // Subtle jitter for ???
  useEffect(() => {
    if (id === "???" && isHovered && !reducedMotion && iconRef.current) {
      const tl = gsap.timeline({ repeat: -1 });
      tl.to(iconRef.current, { x: 1, y: -1, duration: 0.05 })
        .to(iconRef.current, { x: -1, y: 1, duration: 0.05 })
        .to(iconRef.current, { x: 0, y: 0, duration: 0.05 });
      return () => { tl.kill(); };
    }
  }, [id, isHovered, reducedMotion]);

  return (
    <div
      ref={iconRef}
      role="button"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      data-cursor={id === "future.exe" ? "EXECUTE" : "OPEN"}
      className={cn(
        "absolute flex flex-col items-center justify-center gap-2 cursor-pointer w-20 touch-manipulation group outline-none transition-transform duration-200",
        isHovered && "-translate-y-[2px]"
      )}
      style={{ left: x, top: y }}
    >
      {/* Icon Graphic */}
      <div className={cn(
        "w-12 h-12 border flex items-center justify-center transition-all duration-200",
        isSelected ? "bg-terminal text-black border-terminal" : "bg-black/50 border-border text-white group-focus-visible:border-terminal",
        isHovered && !isSelected ? "border-muted bg-zinc-900" : "",
        id === "future.exe" && isHovered ? "border-danger/50 text-danger bg-danger/10" : ""
      )}>
        {isExecutable ? (
          <div className="w-6 h-6 border-2 border-current rounded-sm flex items-center justify-center">
            <span className="block w-2 h-2 bg-current" />
          </div>
        ) : (
          <div className="w-6 h-8 border border-current border-t-4 border-r-4 rounded-sm flex flex-col justify-end p-1">
            <span className="block w-full h-px bg-current opacity-50 mb-[2px]" />
            <span className="block w-full h-px bg-current opacity-50 mb-[2px]" />
            <span className="block w-3/4 h-px bg-current opacity-50" />
          </div>
        )}
      </div>

      {/* Label */}
      <span className={cn(
        "text-[10px] text-center font-mono px-1 py-0.5",
        isSelected ? "bg-terminal text-black" : "bg-black/50 text-white group-focus-visible:bg-terminal/50"
      )}>
        {displayLabel}
      </span>
    </div>
  );
}
