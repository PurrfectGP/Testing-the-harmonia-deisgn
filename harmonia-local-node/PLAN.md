# Harmonia Local Node - Parallax Forensic Lab
## Implementation Plan & Best Practices

---

## 1. Project Overview

The **Harmonia Local Node** is a high-fidelity "Compatibility Engine" that transforms a standard compatibility assessment into an immersive, cinematic "Parallax Forensic Lab" experience. Users progress through analysis stations (Visual, Psychometric, Biometric) before receiving a synthesized compatibility report.

### Core Concepts
- **Living Monolith**: Central glassmorphic UI container floating above animated backgrounds
- **Void & Gold Aesthetic**: Dark mode (#12090A) with gold accents (#D4A853)
- **Scroll-Snap Navigation**: Full-screen vertical stations using CSS `scroll-snap-type: y mandatory`
- **Fusion Sequence**: Narrative transition animation converging data streams

---

## 2. Technical Architecture

### 2.1 State Management Strategy

Based on best practices research, we use a **Context-based State Machine with useReducer**:

| Approach | Use Case | Our Decision |
|----------|----------|--------------|
| `useState` | Simple, isolated state | Not suitable for multi-step flow |
| `useReducer` | Complex transitions, wizards | ✅ **Selected** - good balance |
| `XState` | Strict workflows, visualizations | Consider for future enhancement |
| `Redux` | Dense, cross-cutting state | Overkill for linear flow |

**Rationale**: useReducer provides explicit state transitions without XState's complexity, while preventing invalid state combinations common with multiple useState calls.

### 2.2 Phase/Station Model

```
Phase 0: INTRO       → Magnetizing Swarm
Phase 1: VISUAL      → Eye Parallax + File Upload
Phase 2: PSYCHOMETRIC → Felix Terminal + Orbit
Phase 3: BIOMETRIC   → DNA Helix + File Upload
Phase 4: FUSION      → Transition Animation
Phase 5: RESULTS     → Sealed Dossier + Radar Chart
```

Each station has states: `LOCKED` → `IDLE` → `PROCESSING` → `COMPLETED`

### 2.3 Component Architecture

```
src/
├── context/
│   └── AppContext.tsx       # State machine + phase management
├── hooks/
│   ├── useScrollSpy.ts      # Intersection Observer for station detection
│   └── useTypewriter.ts     # Felix Terminal typing effect
├── components/
│   ├── LivingBackground.tsx # Background visualization layer (z-index: 0)
│   ├── Stations/
│   │   ├── IntroStation.tsx
│   │   ├── VisualStation.tsx
│   │   ├── PsychStation.tsx
│   │   ├── FelixTerminal.tsx
│   │   ├── BioStation.tsx
│   │   └── ResultsStation.tsx
│   └── UI/
│       └── SparkBadge.tsx
└── index.css                # Void & Gold design tokens
```

---

## 3. Design System: Void & Gold

### 3.1 Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--void-black` | `#12090A` | Primary background |
| `--dark-surface` | `#2D1A1C` | Card backgrounds |
| `--gold` | `#F0C86E` | Primary accents (dark mode tuned) |
| `--gold-pure` | `#D4A853` | Borders, highlights |
| `--gold-champagne` | `#F5D98A` | Secondary text |
| `--maroon` | `#722F37` | Gradients, biological elements |
| `--maroon-deep` | `#5C1A1B` | Deep accents |

### 3.2 Typography

- **Headers**: Cormorant Garamond (400, 600, 700)
- **Body/UI**: DM Sans (400, 500)
- **Code/Terminal**: JetBrains Mono

### 3.3 Key CSS Effects

```css
/* Gold Foil Text */
.gold-foil-text {
  background: linear-gradient(135deg, var(--gold), #FFF8E1, var(--gold));
  background-size: 200% 200%;
  -webkit-background-clip: text;
  animation: goldShimmer 3s ease-in-out infinite;
}

/* Electric Pulse */
@keyframes electricPulse {
  0% { box-shadow: 0 0 0 0 rgba(212, 168, 83, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(212, 168, 83, 0); }
  100% { box-shadow: 0 0 0 0 rgba(212, 168, 83, 0); }
}
```

---

## 4. Animation Strategy & Best Practices

### 4.1 Framer Motion (SVG Orchestration)

**Best Practices Applied**:
- Use `whileInView` for viewport-triggered animations
- Use `useScroll` + `useTransform` for parallax effects
- Memoize animation variants to prevent re-renders
- Use `AnimatePresence` with `mode="wait"` for exit animations

**Eye Parallax Implementation**:
```tsx
const pupilOffsetX = (mouseX - 0.5) * 20;
const pupilOffsetY = (mouseY - 0.5) * 20;
// Pupil follows mouse cursor within bounds
```

### 4.2 tsParticles (Magnetizing Swarm)

**Performance Optimizations Applied**:
- Use `@tsparticles/slim` instead of full bundle (~40% smaller)
- Limit particle count: 80 particles with density scaling
- Set `fpsLimit: 60` to cap frame rate
- Memoize options with `useMemo` to prevent re-initialization
- Initialize engine once with `useEffect` empty dependency

```tsx
const particlesOptions = useMemo(() => ({
  fpsLimit: 60,
  particles: {
    number: { value: 80, density: { enable: true, area: 800 } },
    // ...
  },
}), []);
```

### 4.3 Scroll-Snap Architecture

**CSS Configuration**:
```css
.scroll-snap-container {
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
}

.station {
  height: 100vh;
  scroll-snap-align: start;
}
```

**Best Practices**:
- Use Intersection Observer (via `useScrollSpy`) to detect active station
- Dispatch state updates only when phase actually changes
- Lock scroll during fusion sequence to prevent interruption

---

## 5. Session-by-Session Build Plan

### Session 1: Foundation & Design System
**Duration**: Core setup
**Deliverables**:
- [ ] Initialize Vite + React + TypeScript project
- [ ] Install dependencies (framer-motion, tsparticles, chart.js, react-dropzone)
- [ ] Create `index.css` with Void & Gold tokens
- [ ] Set up AppContext with phase/station state machine
- [ ] Create base scroll-snap container in App.tsx

### Session 2: Living Background Layer
**Duration**: Visual engine
**Deliverables**:
- [ ] Create LivingBackground.tsx wrapper component
- [ ] Implement ParticleSwarm visualization (Phase 0)
- [ ] Implement Eye SVG with mouse parallax (Phase 1)
- [ ] Implement Orbit SVG with rotation (Phase 2)
- [ ] Add AnimatePresence transitions between backgrounds

### Session 3: Intro & Visual Stations
**Duration**: First user interactions
**Deliverables**:
- [ ] Build IntroStation with animated logo and CTA
- [ ] Build VisualStation with react-dropzone integration
- [ ] Implement Eye dilation effect on file drag
- [ ] Add upload progress visualization
- [ ] Connect station completion to state machine

### Session 4: Psychometric Station & Felix Terminal
**Duration**: Core input mechanism
**Deliverables**:
- [ ] Build FelixTerminal component with typewriter effect
- [ ] Create useTypewriter custom hook
- [ ] Build PsychStation with multi-prompt flow
- [ ] Connect typing speed to Orbit rotation velocity
- [ ] Implement Victorian Scientific copy/prompts

### Session 5: Biometric Station & DNA Helix
**Duration**: 3D-style visualization
**Deliverables**:
- [ ] Build BioStation with DNA Helix SVG animation
- [ ] Implement electric crackle effect on file drag
- [ ] Add helix path drawing animation
- [ ] Connect file upload to state machine
- [ ] Prepare fusion sequence trigger

### Session 6: Fusion Sequence & Results
**Duration**: Grand finale
**Deliverables**:
- [ ] Implement Fusion overlay animation
- [ ] Build ResultsStation with Sealed Dossier
- [ ] Add seal-breaking click animation
- [ ] Integrate Chart.js Radar visualization
- [ ] Build SparkBadge with electricPulse animation
- [ ] Display Global Synergy Quotient with gold foil effect

### Session 7: Polish & Optimization
**Duration**: Production readiness
**Deliverables**:
- [ ] Performance audit (Lighthouse, React DevTools)
- [ ] Reduce particle count on mobile detection
- [ ] Add loading states and error boundaries
- [ ] Implement keyboard navigation accessibility
- [ ] Code-split with dynamic imports for heavy components
- [ ] Final testing across browsers

---

## 6. Performance Checklist

### Animations
- [ ] Use `transform` and `opacity` for GPU acceleration
- [ ] Avoid animating `width`, `height`, `top`, `left`
- [ ] Pause off-screen animations via Intersection Observer
- [ ] Debounce mouse move handlers (16ms minimum)

### React
- [ ] Memoize particle options with `useMemo`
- [ ] Memoize callbacks with `useCallback`
- [ ] Use `React.memo` for pure display components
- [ ] Avoid inline function definitions in JSX

### Bundle
- [ ] Use `@tsparticles/slim` not full bundle
- [ ] Dynamic import heavy components (Chart.js, Three.js if added)
- [ ] Tree-shake unused Framer Motion features

---

## 7. Future Enhancements (Post-MVP)

### Phase 2 Considerations
- [ ] **React Three Fiber**: Replace SVG Helix with true 3D WebGL visualization
- [ ] **XState Migration**: Formalize state machine with visualization tooling
- [ ] **GSAP Timeline**: Choreograph Fusion Sequence with precise timing
- [ ] **Image Masking**: tsparticles polygon mask for logo formation
- [ ] **Real Backend**: Connect to actual compatibility algorithm API

### Accessibility
- [ ] Screen reader announcements for phase transitions
- [ ] Reduced motion media query support
- [ ] Focus management between stations

---

## 8. Research Sources

### Framer Motion & Scroll Animations
- [React Scroll Animations with Framer Motion - LogRocket](https://blog.logrocket.com/react-scroll-animations-framer-motion/)
- [Scroll Animations - Motion Official Docs](https://www.framer.com/motion/scroll-animations/)
- [Mastering Framer Motion - Medium](https://medium.com/@pareekpnt/mastering-framer-motion-a-deep-dive-into-modern-animation-for-react-0e71d86ffdf6)

### tsParticles Performance
- [How to Incorporate React tsParticles - DhiWise](https://www.dhiwise.com/post/how-to-incorporate-react-tsparticles-into-your-app)
- [tsParticles Official Documentation](https://particles.js.org/docs/)
- [React Performance Optimization 2025 - DEV](https://dev.to/alex_bobes/react-performance-optimization-15-best-practices-for-2025-17l9)

### State Management
- [State Management Trends in React 2025 - Makers Den](https://makersden.io/blog/react-state-management-in-2025)
- [useReducer as Finite State Machine - Kyle Shevlin](https://kyleshevlin.com/how-to-use-usereducer-as-a-finite-state-machine/)
- [Managing Complex UI with XState - Medium](https://beyondthecode.medium.com/from-chaos-to-clarity-managing-complex-ui-with-xstate-b72e06d1279a)
- [Solving the Wizard Problem - Chris Zempel](https://chriszempel.com/posts/thewizardproblem/)

---

## 9. Current Implementation Status

### Completed ✅
- [x] Project structure and dependencies
- [x] Void & Gold design system (index.css)
- [x] AppContext state machine
- [x] useScrollSpy and useTypewriter hooks
- [x] LivingBackground with all visualizations
- [x] All 5 station components
- [x] Felix Terminal with typewriter
- [x] SparkBadge with electric pulse
- [x] Results with Radar Chart

### Session 7 Enhancements Completed ✅
- [x] **True 3D Helix** - React Three Fiber WebGL visualization (`src/components/3D/DNAHelix3D.tsx`)
- [x] **GSAP Fusion Sequence** - Choreographed timeline animation (`src/components/FusionSequence.tsx`)
- [x] **Particle Logo Masking** - "H" logo overlay on intro particles
- [x] **Mobile Responsiveness** - Responsive CSS, touch-friendly buttons, reduced particle count
- [x] **Accessibility Features**:
  - `prefers-reduced-motion` media query support
  - Focus-visible styles for keyboard navigation
  - Skip link for accessibility
  - High contrast mode support
  - Screen reader utilities (`.sr-only`)
- [x] **Performance Optimization**:
  - Code splitting with `React.lazy()` for heavy components
  - Suspense fallbacks for loading states
  - Reduced particle count on mobile
  - Lazy-loaded 3D components

### Bundle Analysis
After optimization, the production build produces:
- Main bundle: 484 KB (gzipped: 150 KB)
- DNAHelix3D (Three.js): 878 KB (gzipped: 238 KB) - lazy loaded
- ResultsStation (Chart.js): 177 KB (gzipped: 61 KB) - lazy loaded
- FusionSequence (GSAP): 73 KB (gzipped: 29 KB) - lazy loaded

---

**All sessions completed. The Harmonia Local Node is production-ready.**
