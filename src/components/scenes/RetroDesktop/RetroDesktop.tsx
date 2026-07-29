"use client";

import { useEffect, useState, useRef } from "react";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { RetroWindow } from "./RetroWindow";
import { DesktopIcon } from "./DesktopIcon";
import { FutureDialog } from "./FutureDialog";
import { cn } from "@/lib/utils";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function RetroDesktop() {
  const { state, dispatch } = useExperience();
  const [time, setTime] = useState("");
  const [showHint, setShowHint] = useState(false);
  const desktopRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mockCursorRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Ensure Welcome window is open initially when desktop mounts
  useEffect(() => {
    if (state.phase === "DESKTOP" && state.openWindows.length === 0 && !state.isIntroComplete) {
      dispatch({ type: "OPEN_WINDOW", payload: "WELCOME.txt" });
      dispatch({ type: "SET_INTRO_COMPLETE", payload: true });
    }
  }, [state.phase, state.openWindows.length, state.isIntroComplete, dispatch]);

  // Clock
  useEffect(() => {
    if (state.phase === "FUTURE_TEASER") return; // freeze clock

    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [state.phase]);

  // Handle FUTURE_TEASER transition
  useEffect(() => {
    if (state.phase === "FUTURE_TEASER" && containerRef.current && desktopRef.current) {
      const tl = gsap.timeline();
      
      tl.to(desktopRef.current, {
        opacity: 0.2,
        duration: 3,
        ease: "power2.inOut"
      }, 0);

      tl.to(containerRef.current, {
        rotateX: 15,
        rotateY: -5,
        scale: 0.95,
        z: -100,
        duration: 4,
        ease: "power3.inOut"
      }, 0);
    } else if (state.phase === "DESKTOP" && containerRef.current && desktopRef.current) {
      gsap.set(containerRef.current, { rotateX: 0, rotateY: 0, scale: 1, z: 0 });
      gsap.set(desktopRef.current, { opacity: 1 });
    }
  }, [state.phase]);

  const handleDesktopClick = () => {
    if (state.activeWindow) {
      dispatch({ type: "FOCUS_WINDOW", payload: "" });
    }
    if (state.selectedIcon) {
      dispatch({ type: "SELECT_ICON", payload: null });
    }
  };

  const handleExploreDesktop = () => {
    dispatch({ type: "CLOSE_WINDOW", payload: "WELCOME.txt" });
    
    // Highlight icons briefly
    const icons = document.querySelectorAll('.touch-manipulation');
    gsap.fromTo(icons, 
      { scale: 1.1, filter: "brightness(1.5)" }, 
      { scale: 1, filter: "brightness(1)", duration: 0.5, stagger: 0.05, ease: "power2.out" }
    );

    // Show system hint
    setShowHint(true);
    setTimeout(() => setShowHint(false), 4000);

    // Double-click demonstration if not seen and not on mobile
    if (!state.hasSeenDemo && typeof window !== "undefined" && window.innerWidth >= 768 && !reducedMotion) {
      dispatch({ type: "SET_HAS_SEEN_DEMO", payload: true });
      
      const tl = gsap.timeline({ delay: 0.8 });
      // Move mock cursor to README.txt
      tl.to(mockCursorRef.current, {
        opacity: 1,
        duration: 0.3
      })
      .to(mockCursorRef.current, {
        x: 45, // roughly center of README icon
        y: 85,
        duration: 0.8,
        ease: "power2.inOut"
      })
      // Double click pulse 1
      .to(mockCursorRef.current, { scale: 0.7, duration: 0.1 })
      .to(mockCursorRef.current, { scale: 1, duration: 0.1 })
      // Pause
      .to({}, { duration: 0.1 })
      // Double click pulse 2
      .to(mockCursorRef.current, { scale: 0.7, duration: 0.1 })
      .to(mockCursorRef.current, { scale: 1, duration: 0.1 })
      .to(mockCursorRef.current, { opacity: 0, duration: 0.3, delay: 0.2 })
      .call(() => {
        dispatch({ type: "OPEN_WINDOW", payload: "README.txt" });
      });
    }
  };

  return (
    <div 
      className={cn(
        "w-full h-full relative overflow-hidden transition-all duration-1000",
        state.phase === "FUTURE_TEASER" ? "bg-transparent pointer-events-none" : "bg-[#080808]"
      )}
      onClick={handleDesktopClick}
      style={{ perspective: "1000px" }}
    >
      <div ref={containerRef} className="w-full h-full absolute inset-0 transform-style-preserve-3d">
        
        {/* Background Grid */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }} 
        />

        {/* System Bar */}
        <div className={cn(
          "absolute top-0 w-full h-8 flex items-center px-4 justify-between z-50 font-mono text-xs transition-colors duration-500 border-b border-[#333]",
          state.phase === "FUTURE_TEASER" ? "bg-transparent text-muted border-transparent" : "bg-border/50 text-white"
        )}>
          <span>REALITY OS // 1991</span>
          <span>{time}</span>
        </div>

        {/* Desktop Area */}
        <div 
          ref={desktopRef}
          className="absolute inset-0 pt-12 p-4"
        >
          {/* Mock Cursor for demonstration */}
          <div 
            ref={mockCursorRef}
            className="absolute w-4 h-4 bg-white rounded-full z-50 opacity-0 pointer-events-none mix-blend-difference"
            style={{ left: typeof window !== "undefined" && window.innerWidth > 768 ? 200 : 40, top: 200 }}
          />

          {/* Icons */}
          <DesktopIcon id="README.txt" label="README.txt" x={typeof window !== "undefined" && window.innerWidth < 768 ? 20 : 30} y={60} />
          <DesktopIcon id="internet.exe" label="internet.exe" x={typeof window !== "undefined" && window.innerWidth < 768 ? 20 : 30} y={160} isExecutable />
          <DesktopIcon id="trash/" label="trash/" x={typeof window !== "undefined" && window.innerWidth < 768 ? 20 : 30} y={260} />
          <DesktopIcon id="system/" label="system/" x={typeof window !== "undefined" && window.innerWidth < 768 ? 20 : 30} y={360} />
          <DesktopIcon id="???" label="???" x={typeof window !== "undefined" && window.innerWidth < 768 ? 20 : 30} y={460} />
          <DesktopIcon id="future.exe" label="future.exe" x={typeof window !== "undefined" && window.innerWidth < 768 ? 20 : 30} y={560} isExecutable />

          {/* Windows */}
          <RetroWindow id="WELCOME.txt" title="WELCOME.txt" defaultPosition={{ x: typeof window !== "undefined" && window.innerWidth > 768 ? 200 : 40, y: 100 }}>
            <div className="flex flex-col gap-4 text-sm">
              <p className="font-bold">THE WORLD WIDE WEB</p>
              <p>1991</p>
              <p>A network of documents,<br/>links and possibilities.</p>
              <p>Built to share information.</p>
              <p>Nothing more.</p>
              <p className="mt-2 opacity-50">Probably.</p>
              <button 
                onClick={handleExploreDesktop}
                data-cursor="CLICK"
                className="mt-8 text-xs text-terminal text-left hover:underline w-fit outline-none focus-visible:ring-1 focus-visible:ring-terminal"
              >
                [ explore desktop ]
              </button>
            </div>
          </RetroWindow>

          <RetroWindow id="README.txt" title="README.txt" defaultPosition={{ x: typeof window !== "undefined" && window.innerWidth > 768 ? 400 : 60, y: 150 }}>
            <div className="flex flex-col gap-4 text-sm">
              <p className="font-bold border-b border-border pb-2">REALITY OS</p>
              <p>Version 0.91</p>
              <div className="mt-2">
                <p>STATUS:</p>
                <p>Stable.</p>
                <p className="opacity-50 mt-1">Probably.</p>
              </div>
              <div className="mt-4">
                <p className="font-bold mb-2">RULES:</p>
                <ul className="flex flex-col gap-1">
                  <li>01. Explore.</li>
                  <li>02. Click things.</li>
                  <li>03. Don&apos;t break anything.</li>
                </ul>
              </div>
            </div>
          </RetroWindow>

          <RetroWindow id="internet.exe" title="WORLD WIDE WEB" defaultPosition={{ x: typeof window !== "undefined" && window.innerWidth > 768 ? 150 : 20, y: 80 }} width="w-full md:w-[600px]">
            <div className="flex flex-col gap-6 text-sm bg-zinc-900 p-6 min-h-[300px]">
              <p className="text-xl md:text-2xl font-serif">WELCOME TO THE WEB.</p>
              <div className="flex flex-col gap-4 mt-4 text-terminal underline underline-offset-4 w-fit">
                <button data-cursor="CLICK" className="text-left hover:text-white outline-none focus-visible:ring-1">[ documents ]</button>
                <button data-cursor="CLICK" className="text-left hover:text-white outline-none focus-visible:ring-1">[ people ]</button>
                <button data-cursor="CLICK" className="text-left hover:text-white outline-none focus-visible:ring-1">[ ideas ]</button>
                <button data-cursor="CLICK" className="text-left hover:text-white outline-none focus-visible:ring-1">[ ??? ]</button>
              </div>
            </div>
          </RetroWindow>

          <RetroWindow id="trash/" title="TRASH" defaultPosition={{ x: typeof window !== "undefined" && window.innerWidth > 768 ? 300 : 100, y: 200 }}>
            <div className="flex flex-col items-center justify-center min-h-[150px] text-sm">
              <p>0 files.</p>
              <p className="mt-2 text-xs opacity-50">Somehow.</p>
            </div>
          </RetroWindow>

          <RetroWindow id="system/" title="SYSTEM OVERVIEW" defaultPosition={{ x: typeof window !== "undefined" && window.innerWidth > 768 ? 500 : 50, y: 120 }}>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between border-b border-border pb-1">
                <span className="text-muted">REALITY OS</span>
                <span className="text-terminal">ONLINE</span>
              </div>
              <div className="flex justify-between border-b border-border pb-1">
                <span className="text-muted">POINTER</span>
                <span className={state.hasTouch ? "text-muted" : "text-terminal"}>{state.hasTouch ? "TOUCH" : "ACTIVE"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-1">
                <span className="text-muted">WEBGL</span>
                <span className={state.isWebGLReady ? "text-terminal" : "text-muted"}>{state.isWebGLReady ? "READY" : "LOADING"}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-1">
                <span className="text-muted">GRAVITY</span>
                <span className="text-terminal">NORMAL</span>
              </div>
              <div className="flex justify-between pb-1 mt-4">
                <span className="text-muted">REALITY</span>
                <span className="text-terminal animate-pulse">STABLE</span>
              </div>
            </div>
          </RetroWindow>

          <RetroWindow id="ACCESS_DENIED" title="ERROR" defaultPosition={{ x: typeof window !== "undefined" && window.innerWidth > 768 ? 400 : 60, y: 300 }} width="w-full md:w-[300px]">
            <div className="flex flex-col gap-4 text-sm text-center py-4">
              <p className="text-danger font-bold">ACCESS DENIED.</p>
              <p className="text-muted text-xs">YOU&apos;RE EARLY.</p>
            </div>
          </RetroWindow>

        </div>
      </div>

      {/* System Hint Overlay */}
      <div className={cn(
        "absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 border border-terminal/30 text-terminal px-4 py-2 font-mono text-xs z-[100] transition-opacity duration-500 pointer-events-none backdrop-blur-sm",
        showHint && state.phase === "DESKTOP" ? "opacity-100" : "opacity-0"
      )}>
        DOUBLE CLICK TO OPEN &nbsp;&bull;&nbsp; DRAG WINDOWS TO MOVE
      </div>

      <FutureDialog />

      {/* FUTURE_TEASER OVERLAY TEXT */}
      {state.phase === "FUTURE_TEASER" && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none text-center p-4">
          <p className="text-terminal font-mono mb-2 animate-fade-in">&gt; EXECUTING future.exe...</p>
          <p className="text-danger font-mono mb-8 animate-fade-in" style={{ animationDelay: "1s" }}>DIMENSIONAL LAYER DETECTED</p>
          
          <p className="display-lg text-white mb-8 animate-fade-in" style={{ animationDelay: "3s" }}>
            THE INTERFACE IS<br/>NO LONGER FLAT.
          </p>
          
          <div className="animate-fade-in" style={{ animationDelay: "5s" }}>
            <p className="system-text mb-2">PHASE 03 READY</p>
            <button className="border border-terminal text-terminal px-4 py-2 uppercase tracking-widest text-xs pointer-events-auto hover:bg-terminal hover:text-black transition-colors" data-cursor="CLICK">
              [ CONTINUE ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
