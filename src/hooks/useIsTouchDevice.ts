"use client";

import { useState, useEffect } from "react";
import { useExperience } from "@/components/providers/ExperienceProvider";

export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  const { dispatch } = useExperience();

  useEffect(() => {
    const checkTouch = () => {
      const hasTouch = 
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0;
      setIsTouch(hasTouch);
      dispatch({ type: "SET_HAS_TOUCH", payload: hasTouch });
    };

    checkTouch();
  }, [dispatch]);

  return isTouch;
}
