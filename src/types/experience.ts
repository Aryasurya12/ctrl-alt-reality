export type ExperiencePhase = "BOOT" | "TERMINAL" | "DESKTOP" | "FUTURE_TEASER" | "EXPLORE" | "LAB" | "CHAOS" | "FINALE";

export interface ExperienceState {
  phase: ExperiencePhase;
  isIntroComplete: boolean;
  displayName: string | null;
  isWebGLReady: boolean;
  soundEnabled: boolean;
  prefersReducedMotion: boolean;
  hasTouch: boolean;
  
  // Desktop OS State
  openWindows: string[];
  activeWindow: string;
  selectedIcon: string | null;
  openedAppCount: number;
  hasSeenDemo: boolean;
}

export type ExperienceAction = {
  type: string;
  payload?: unknown;
};
