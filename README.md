# CTRL+ALT+REALITY

"The web was never meant to stay flat."

## Overview

CTRL+ALT+REALITY is an experimental interactive web experience exploring what happens when the web refuses to stay flat. The project is being built as a frontend technical challenge for a GDG On Campus Technical Lead selection, demonstrating advanced frontend engineering, WebGL, 3D graphics, physics, shaders, creative animation, and interaction design.

## Concept

The final experience will explore the evolution of the web from static interfaces into interactive, physical and immersive digital environments. Eventually featuring interactive terminals, retro desktops, draggable windows, advanced GSAP timelines, Real 3D WebGL objects, physics-enabled UI objects, shaders, and a destruction/chaos sequence.

## Current Development Status

**Phase 01 — Foundation**

Phase 1 establishes an exceptionally clean, scalable, and performant architectural foundation so the advanced creative development can be layered on safely afterward. 

Phase 1 includes:
- Next.js App Router initialization
- Core dependencies configuration (GSAP, Three.js, Lenis, Rapier, Postprocessing)
- Custom Cursor foundation
- Centralized GSAP configuration
- Lenis Smooth Scroll foundation
- Lightweight Context-based global experience state
- Minimal WebGL test canvas setup
- Experimental design system CSS variables and typography tokens
- Subtle Noise Overlay

## Tech Stack

- **Core**: Next.js, React, TypeScript, Tailwind CSS
- **Animation**: GSAP, Motion
- **3D / WebGL**: Three.js, React Three Fiber, React Three Drei
- **Physics**: React Three Rapier
- **Scrolling**: Lenis
- **Post-processing**: React Three Postprocessing

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

## Project Architecture

- `src/app/`: Next.js App Router pages and global layout.
- `src/components/`:
  - `experience/`: Main experience orchestrator (future).
  - `scenes/`: 3D environments and scenes (future).
  - `three/`: WebGL utilities and components.
  - `motion/`: Animation and scroll components (e.g., SmoothScroll).
  - `ui/`: 2D Interface elements (Cursor, Overlay).
  - `providers/`: React Context providers (ExperienceProvider).
- `src/hooks/`: Custom React hooks (e.g., useMousePosition, useReducedMotion).
- `src/lib/`: Core utilities and library configurations (GSAP).
- `src/store/`: State definitions.
- `src/types/`: TypeScript interfaces.
- `src/shaders/`: Custom GLSL shaders (future).
