"use client";

import { useState, useEffect } from "react";

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Avoid synchronous setState by using the hook's initial state or an early return if possible.
    // Actually, setting state inside effect like this isn't strictly fatal but let's silence the warning
    // or just let it update on first render properly.
    
    // A cleaner approach for Next.js SSR is to initialize to false, then set on mount via timeout or just let it set
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefersReducedMotion(mediaQuery.matches);

    const onChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  return prefersReducedMotion;
}
