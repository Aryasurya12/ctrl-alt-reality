export type ExperiencePhase = 
  | "BOOT" 
  | "TERMINAL" 
  | "DESKTOP" 
  | "FUTURE_TEASER" 
  | "DIMENSIONAL_BREAK" 
  | "CORE_INTERACTIVE"
  | "CORE_BREAKING" 
  | "GRAVITY_FAILURE"
  | "GRAVITY_RESTART"
  | "SCENE_05_ACTIVE"
  | "SCENE_05_ENDING"
  | "SCENE_06_HINT";

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

  // Scene 05 Interaction State
  scene05InteractionStep: number; // 0: Start, 1: Move Hint, 2: Grab Hint, 3: Throw Hint
  objectsThrownCount: number;
}

export type ExperienceAction = {
  type: string;
  payload?: unknown;
};
