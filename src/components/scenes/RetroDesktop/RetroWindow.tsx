"use client";

import { useRef, useEffect, useState } from "react";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface RetroWindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  width?: string;
}

export function RetroWindow({ id, title, children, defaultPosition = { x: 50, y: 50 }, width = "w-full md:w-[400px]" }: RetroWindowProps) {
  const { state, dispatch } = useExperience();
  const windowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [isMinimized, setIsMinimized] = useState(false);
  
  const isOpen = state.openWindows.includes(id);
  const isActive = state.activeWindow === id;

  useEffect(() => {
    if (!windowRef.current || !isOpen) return;

    if (reducedMotion) {
      gsap.set(windowRef.current, { scale: 1, opacity: 1 });
      return;
    }

    gsap.fromTo(windowRef.current,
      { scale: 0.96, opacity: 0, y: 8 },
      { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
    );
  }, [isOpen, reducedMotion]);

  useEffect(() => {
    if (!windowRef.current || !dragRef.current || !isOpen || isMinimized) return;

    const el = windowRef.current;
    
    let isDragging = false;
    let startX = 0, startY = 0;
    // Extract current position from inline style or use default
    let currentX = gsap.getProperty(el, "x") as number || defaultPosition.x;
    let currentY = gsap.getProperty(el, "y") as number || defaultPosition.y;
    
    // Set initial layout for mobile responsiveness
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    if (isMobile) {
      currentX = 10;
      currentY = 40;
    }

    gsap.set(el, { x: currentX, y: currentY });

    const onPointerDown = (e: PointerEvent) => {
      // Don't drag if we clicked a button inside title bar
      if ((e.target as HTMLElement).tagName === "BUTTON") return;
      if (state.phase === "FUTURE_TEASER") return; // Freeze desktop interaction

      isDragging = true;
      startX = e.clientX - currentX;
      startY = e.clientY - currentY;
      
      dispatch({ type: "FOCUS_WINDOW", payload: id });
      
      if (dragRef.current) dragRef.current.setPointerCapture(e.pointerId);
      
      if (!reducedMotion) {
        gsap.to(el, { scale: 1.01, duration: 0.2, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.8)" });
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || state.phase === "FUTURE_TEASER") return;
      
      let nextX = e.clientX - startX;
      let nextY = e.clientY - startY;
      
      // Strict viewport bounds
      const maxX = window.innerWidth - (el.offsetWidth || 300) + 40;
      const maxY = window.innerHeight - (el.offsetHeight || 200) + 20;
      
      nextX = Math.max(0, Math.min(nextX, Math.max(0, maxX)));
      nextY = Math.max(32, Math.min(nextY, Math.max(32, maxY))); // 32 is top system bar
      
      const deltaX = nextX - currentX;
      currentX = nextX;
      currentY = nextY;
      
      const rotation = Math.max(-2, Math.min(2, deltaX * 0.1));

      gsap.to(el, { x: currentX, y: currentY, rotateZ: reducedMotion ? 0 : rotation, duration: 0.1 });
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      if (dragRef.current) dragRef.current.releasePointerCapture(e.pointerId);
      
      if (!reducedMotion) {
        gsap.to(el, { scale: 1, rotateZ: 0, duration: 0.5, ease: "elastic.out(1, 0.7)", boxShadow: "0 0 0 0 rgba(0,0,0,0)" });
      }
    };

    const handle = dragRef.current;
    handle.addEventListener("pointerdown", onPointerDown);
    handle.addEventListener("pointermove", onPointerMove);
    handle.addEventListener("pointerup", onPointerUp);
    
    return () => {
      handle.removeEventListener("pointerdown", onPointerDown);
      handle.removeEventListener("pointermove", onPointerMove);
      handle.removeEventListener("pointerup", onPointerUp);
    };
  }, [id, isOpen, isMinimized, defaultPosition, dispatch, reducedMotion, state.phase]);

  // Keyboard Escape to close
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isActive && isOpen) {
        if(!reducedMotion) {
          gsap.to(windowRef.current, { scale: 0.96, opacity: 0, duration: 0.2, onComplete: () => dispatch({ type: "CLOSE_WINDOW", payload: id }) });
        } else {
          dispatch({ type: "CLOSE_WINDOW", payload: id });
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isActive, isOpen, id, dispatch, reducedMotion]);

  if (!isOpen) return null;

  // Determine z-index dynamically based on order in openWindows
  const zIndexBase = 30;
  const windowIndex = state.openWindows.indexOf(id);
  const zIndex = zIndexBase + windowIndex;

  return (
    <div
      ref={windowRef}
      onPointerDown={() => dispatch({ type: "FOCUS_WINDOW", payload: id })}
      className={cn(
        "absolute top-0 left-0 border bg-black text-white font-mono flex flex-col shadow-2xl transition-colors duration-200",
        width,
        "max-w-[calc(100vw-20px)]", // Ensure it fits mobile
        isActive ? "border-terminal shadow-[0_0_20px_rgba(74,222,128,0.1)]" : "opacity-90 border-border"
      )}
      style={{ zIndex }}
    >
      {/* Title Bar */}
      <div 
        ref={dragRef}
        data-cursor="DRAG"
        onPointerDown={(e) => {
          const target = e.target as HTMLElement;
          if (target.tagName !== "BUTTON") {
             target.setAttribute("data-cursor", "GRABBING");
          }
        }}
        onPointerUp={(e) => {
          const target = e.target as HTMLElement;
          target.setAttribute("data-cursor", "DRAG");
        }}
        className={cn(
          "h-8 border-b flex items-center justify-between px-2 cursor-move touch-none select-none",
          isActive ? "border-terminal/50 bg-terminal/10" : "border-border bg-border/20"
        )}
      >
        <span className="text-xs truncate mr-2">{title}</span>
        <div className="flex gap-1">
          <button 
            aria-label="Minimize"
            onPointerDown={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            onKeyDown={(e) => { if(e.key === "Enter") setIsMinimized(!isMinimized); }}
            className="w-5 h-5 border border-border hover:bg-white hover:text-black hover:border-white flex items-center justify-center text-[10px]"
            data-cursor="CLICK"
          >
            _
          </button>
          <button 
            aria-label="Close"
            onPointerDown={(e) => { 
              e.stopPropagation(); 
              if(!reducedMotion) {
                gsap.to(windowRef.current, { scale: 0.96, opacity: 0, duration: 0.2, onComplete: () => dispatch({ type: "CLOSE_WINDOW", payload: id }) });
              } else {
                dispatch({ type: "CLOSE_WINDOW", payload: id });
              }
            }}
            onKeyDown={(e) => { if(e.key === "Enter") dispatch({ type: "CLOSE_WINDOW", payload: id }); }}
            className="w-5 h-5 border border-border hover:bg-danger hover:text-black hover:border-danger flex items-center justify-center text-[10px] pointer-events-auto"
            data-cursor="CLICK"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-4 bg-black overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      )}
    </div>
  );
}
