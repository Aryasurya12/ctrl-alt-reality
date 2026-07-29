"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";
import { ExperienceState, ExperiencePhase } from "@/types/experience";

type Action =
  | { type: "SET_PHASE"; payload: ExperiencePhase }
  | { type: "SET_INTRO_COMPLETE"; payload: boolean }
  | { type: "SET_DISPLAY_NAME"; payload: string }
  | { type: "SET_WEBGL_READY"; payload: boolean }
  | { type: "TOGGLE_SOUND" }
  | { type: "SET_REDUCED_MOTION"; payload: boolean }
  | { type: "SET_HAS_TOUCH"; payload: boolean }
  | { type: "OPEN_WINDOW"; payload: string }
  | { type: "CLOSE_WINDOW"; payload: string }
  | { type: "FOCUS_WINDOW"; payload: string }
  | { type: "SELECT_ICON"; payload: string | null }
  | { type: "SET_HAS_SEEN_DEMO"; payload: boolean }
  | { type: "SET_CORE_INTERACTION"; payload: "drag" | "hold" | "release" };

const initialState: ExperienceState = {
  phase: "BOOT",
  isIntroComplete: false,
  displayName: null,
  isWebGLReady: false,
  soundEnabled: false,
  prefersReducedMotion: false,
  hasTouch: false,
  openWindows: [],
  activeWindow: "",
  selectedIcon: null,
  openedAppCount: 0,
  hasSeenDemo: false,
  hasDraggedCore: false,
  hasHeldCore: false,
  hasReleasedCore: false,
};

function experienceReducer(state: ExperienceState, action: Action): ExperienceState {
  switch (action.type) {
    case "SET_PHASE":
      return { ...state, phase: action.payload };
    case "SET_INTRO_COMPLETE":
      return { ...state, isIntroComplete: action.payload };
    case "SET_DISPLAY_NAME":
      return { ...state, displayName: action.payload };
    case "SET_WEBGL_READY":
      return { ...state, isWebGLReady: action.payload };
    case "TOGGLE_SOUND":
      return { ...state, soundEnabled: !state.soundEnabled };
    case "SET_REDUCED_MOTION":
      return { ...state, prefersReducedMotion: action.payload };
    case "SET_HAS_TOUCH":
      return { ...state, hasTouch: action.payload };
    case "OPEN_WINDOW":
      if (!state.openWindows.includes(action.payload)) {
        return { 
          ...state, 
          openWindows: [...state.openWindows, action.payload],
          activeWindow: action.payload,
          openedAppCount: state.openedAppCount + 1
        };
      }
      return { ...state, activeWindow: action.payload, openWindows: [...state.openWindows.filter(id => id !== action.payload), action.payload] };
    case "CLOSE_WINDOW":
      const remainingWindows = state.openWindows.filter((id) => id !== action.payload);
      return { 
        ...state, 
        openWindows: remainingWindows,
        activeWindow: state.activeWindow === action.payload ? (remainingWindows[remainingWindows.length - 1] || "") : state.activeWindow
      };
    case "FOCUS_WINDOW":
      if (action.payload === "") {
        return { ...state, activeWindow: "" };
      }
      // Reorder to bring to front
      return { 
        ...state, 
        activeWindow: action.payload,
        openWindows: [...state.openWindows.filter(id => id !== action.payload), action.payload]
      };
    case "SELECT_ICON":
      return { ...state, selectedIcon: action.payload, activeWindow: "" };
    case "SET_HAS_SEEN_DEMO":
      return { ...state, hasSeenDemo: action.payload };
    case "SET_CORE_INTERACTION":
      if (action.payload === "drag") return { ...state, hasDraggedCore: true };
      if (action.payload === "hold") return { ...state, hasHeldCore: true };
      if (action.payload === "release") return { ...state, hasReleasedCore: true };
      return state;
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
