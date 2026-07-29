"use client";

import { useState, useEffect, useRef } from "react";
import { useExperience } from "@/components/providers/ExperienceProvider";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { ScreenTear } from "@/components/effects/ScreenTear";

type TerminalStep = 
  | "GREETING" 
  | "WAITING_NAME" 
  | "PROCESSING" 
  | "NAMED_GREETING" 
  | "WARNING"
  | "BUTTON_REVEAL"
  | "BUTTON_CLICKED"
  | "CORRUPTION";

export function Terminal() {
  const { dispatch, state } = useExperience();
  const reducedMotion = useReducedMotion();
  const isTouch = useIsTouchDevice();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<TerminalStep>("GREETING");
  const [inputValue, setInputValue] = useState("");
  const [hoverCount, setHoverCount] = useState(0);
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });
  const [corruptionLevel, setCorruptionLevel] = useState(0);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Focus input when clicking anywhere
  const handleContainerClick = () => {
    if (step === "WAITING_NAME") {
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    // Sequence Logic
    let timeout: NodeJS.Timeout;

    if (step === "GREETING") {
      timeout = setTimeout(() => setStep("WAITING_NAME"), 3000);
    } else if (step === "PROCESSING") {
      timeout = setTimeout(() => setStep("NAMED_GREETING"), 1000);
    } else if (step === "NAMED_GREETING") {
      timeout = setTimeout(() => setStep("WARNING"), 3000);
    } else if (step === "WARNING") {
      timeout = setTimeout(() => setStep("BUTTON_REVEAL"), 2000);
    } else if (step === "BUTTON_CLICKED") {
      timeout = setTimeout(() => setStep("CORRUPTION"), 2500);
    } else if (step === "CORRUPTION") {
      // Corruption counter logic
      const levels = [12, 27, 48, 73, 99, 100];
      
      const tl = gsap.timeline({
        onComplete: () => {
          setTimeout(() => {
            dispatch({ type: "SET_PHASE", payload: "DESKTOP" });
          }, 1500); // Wait for screen tear
        }
      });

      levels.forEach((lvl) => {
        tl.to({}, { 
          duration: 0.4 + Math.random() * 0.3,
          onComplete: () => setCorruptionLevel(lvl)
        });
        
        // Jitter terminal container
        if (!reducedMotion) {
          tl.to(terminalRef.current, {
            x: () => (Math.random() - 0.5) * (lvl / 2),
            y: () => (Math.random() - 0.5) * (lvl / 2),
            skewX: () => (Math.random() - 0.5) * (lvl / 5),
            duration: 0.1,
            yoyo: true,
            repeat: 1
          }, "<");
        }
      });
    }

    return () => clearTimeout(timeout);
  }, [step, dispatch, reducedMotion]);

  // Focus input automatically
  useEffect(() => {
    if (step === "WAITING_NAME") {
      inputRef.current?.focus();
    }
  }, [step]);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = inputValue.trim().replace(/[^a-zA-Z0-9\s]/g, "").slice(0, 20);
    if (cleanName.length > 0) {
      dispatch({ type: "SET_DISPLAY_NAME", payload: cleanName });
      setStep("PROCESSING");
    }
  };

  const handleButtonHover = () => {
    if (isTouch || reducedMotion || step !== "BUTTON_REVEAL") return;
    
    if (hoverCount < 3) {
      setHoverCount(prev => prev + 1);
      
      // Calculate a random shift away from cursor
      const shiftX = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 30);
      const shiftY = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 30);
      
      setButtonPos(prev => ({ x: prev.x + shiftX, y: prev.y + shiftY }));
      
      if (buttonRef.current) {
        gsap.to(buttonRef.current, {
          x: buttonPos.x + shiftX,
          y: buttonPos.y + shiftY,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    }
  };

  const handleButtonClick = () => {
    setStep("BUTTON_CLICKED");
  };

  return (
    <>
      <div 
        ref={terminalRef}
        onClick={handleContainerClick}
        className={cn(
          "w-full h-full flex flex-col items-center justify-center p-6 md:p-12",
          "bg-black text-terminal font-mono transition-colors",
          step === "CORRUPTION" && corruptionLevel > 80 && "bg-[#110000] text-danger"
        )}
      >
        <div className="max-w-2xl w-full flex flex-col gap-4 text-sm md:text-base leading-relaxed">
          
          <div className="flex flex-col gap-2">
            <p className="animate-fade-in">&gt; Hello.</p>
            
            {step === "WAITING_NAME" && (
              <>
                <p className="animate-fade-in">&gt; Before we continue...</p>
                <p className="animate-fade-in">&gt; What&apos;s your name?</p>
                <form onSubmit={handleInputSubmit} className="flex gap-2 items-center mt-2">
                  <span>&gt;</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    maxLength={20}
                    className="bg-transparent border-none outline-none text-terminal font-mono w-48 caret-terminal"
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <span className={cn("inline-block w-2 h-4 bg-terminal", inputValue.length === 0 ? "animate-pulse" : "opacity-0")} />
                </form>
              </>
            )}

            {(step === "PROCESSING" || step === "NAMED_GREETING" || step === "WARNING" || step === "BUTTON_REVEAL" || step === "BUTTON_CLICKED" || step === "CORRUPTION") && (
              <>
                <p>&gt; {state.displayName}</p>
                {step === "PROCESSING" ? (
                  <p className="animate-pulse">&gt; ...</p>
                ) : (
                  <>
                    <p className="animate-fade-in">&gt; Hello, {state.displayName}.</p>
                    <p className="animate-fade-in">&gt; Welcome to the internet.</p>
                  </>
                )}
              </>
            )}

            {(step === "WARNING" || step === "BUTTON_REVEAL" || step === "BUTTON_CLICKED" || step === "CORRUPTION") && (
              <p className="animate-fade-in mt-4">&gt; Please don&apos;t touch anything.</p>
            )}

            {(step === "BUTTON_CLICKED" || step === "CORRUPTION") && (
              <div className="mt-8 flex flex-col gap-2 text-danger">
                <p className="animate-fade-in delay-200">&gt; ...</p>
                <p className="animate-fade-in delay-500">&gt; you touched it.</p>
                <p className="animate-fade-in delay-1000">&gt; that was literally the only rule.</p>
                
                {step === "CORRUPTION" && (
                  <div className="mt-8 border border-danger p-4 bg-danger/10 animate-fade-in">
                    <p className="font-bold">WARNING: UNAUTHORIZED REALITY MODIFICATION DETECTED</p>
                    <p className="mt-2">CORRUPTION LEVEL: {corruptionLevel < 10 ? `0${corruptionLevel}` : corruptionLevel}%</p>
                    
                    {corruptionLevel === 100 && (
                      <p className="mt-4 font-bold animate-pulse">REALITY BREACH DETECTED</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {(step === "BUTTON_REVEAL" || step === "BUTTON_CLICKED") && (
            <div className="flex-1 flex items-center justify-center mt-12">
              <button
                ref={buttonRef}
                onMouseEnter={handleButtonHover}
                onClick={handleButtonClick}
                disabled={step === "BUTTON_CLICKED"}
                className={cn(
                  "border border-terminal px-8 py-3 uppercase tracking-widest text-sm",
                  "transition-colors duration-200",
                  "focus-visible:ring-2 focus-visible:ring-terminal focus-visible:outline-none",
                  step === "BUTTON_CLICKED" ? "bg-terminal text-black opacity-0 transition-opacity duration-1000" : "hover:bg-terminal hover:text-black"
                )}
              >
                {hoverCount >= 3 && step !== "BUTTON_CLICKED" ? "SERIOUSLY." : "DO NOT TOUCH"}
              </button>
            </div>
          )}
        </div>
      </div>

      {step === "CORRUPTION" && corruptionLevel === 100 && (
        <ScreenTear />
      )}
    </>
  );
}
