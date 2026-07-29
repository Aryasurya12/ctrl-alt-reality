"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";
import { ExperienceState, ExperiencePhase } from "@/types/experience";

type Action =
  | { type: "SET_PHASE"; payload: ExperiencePhase }
  | { type: "SET_INTRO_COMPLETE"; payload: boolean }
  | { type: "SET_WEBGL_READY"; payload: boolean }
  | { type: "SET_CHAOS_MODE"; payload: boolean }
  | { type: "TOGGLE_SOUND" }
  | { type: "SET_REDUCED_MOTION"; payload: boolean }
  | { type: "SET_HAS_TOUCH"; payload: boolean };

const initialState: ExperienceState = {
  phase: "INTRO",
  isIntroComplete: false,
  isWebGLReady: false,
  isChaosMode: false,
  soundEnabled: false,
  reducedMotion: false,
  hasTouch: false,
};

function experienceReducer(state: ExperienceState, action: Action): ExperienceState {
  switch (action.type) {
    case "SET_PHASE":
      return { ...state, phase: action.payload };
    case "SET_INTRO_COMPLETE":
      return { ...state, isIntroComplete: action.payload };
    case "SET_WEBGL_READY":
      return { ...state, isWebGLReady: action.payload };
    case "SET_CHAOS_MODE":
      return { ...state, isChaosMode: action.payload };
    case "TOGGLE_SOUND":
      return { ...state, soundEnabled: !state.soundEnabled };
    case "SET_REDUCED_MOTION":
      return { ...state, reducedMotion: action.payload };
    case "SET_HAS_TOUCH":
      return { ...state, hasTouch: action.payload };
    default:
      return state;
  }
}

const ExperienceContext = createContext<{
  state: ExperienceState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(experienceReducer, initialState);

  return (
    <ExperienceContext.Provider value={{ state, dispatch }}>
      {children}
    </ExperienceContext.Provider>
  );
}

export function useExperience() {
  const context = useContext(ExperienceContext);
  if (!context) {
    throw new Error("useExperience must be used within an ExperienceProvider");
  }
  return context;
}
