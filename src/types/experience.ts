export type ExperiencePhase = 
  | "BOOT" 
  | "TERMINAL" 
  | "DESKTOP" 
  | "FUTURE_TEASER" 
  | "DIMENSIONAL_BREAK" 
  | "CORE_INTERACTIVE"
  | "CORE_BREAKING" 
  | "GRAVITY_FAILURE";

export interface ExperienceState {
  phase: ExperiencePhase;
  isIntroComplete: boolean;
  displayName: string | null;
  isWebGLReady: boolean;
  soundEnabled: boolean;
  prefersReducedMotion: boolean;
  hasTouch: boolean;
  
  // Desktop State
  openWindows: string[];
  activeWindow: string;
  selectedIcon: string | null;
  openedAppCount: number;
  hasSeenDemo: boolean;

  // Phase 3 Interaction State
  hasDraggedCore: boolean;
  hasHeldCore: boolean;
  hasReleasedCore: boolean;
}

export type ExperienceAction = {
  type: string;
  payload?: unknown;
};
