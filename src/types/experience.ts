export type ExperiencePhase = "INTRO" | "EXPLORE" | "LAB" | "CHAOS" | "FINALE";

export interface ExperienceState {
  phase: ExperiencePhase;
  isIntroComplete: boolean;
  isWebGLReady: boolean;
  isChaosMode: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
  hasTouch: boolean;
}

export type ExperienceAction = {
  type: string;
  payload?: any;
};
