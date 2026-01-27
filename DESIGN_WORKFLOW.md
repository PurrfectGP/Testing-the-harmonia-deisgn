# Harmonia Design Workflow Guide

## Overview

This document explains the design vision, version history, known issues, and how to work with AI tools efficiently for the Harmonia project.

---

## THE VISION: What We're Building

### The "Parallax Forensic Lab" (Option A)

The Harmonia Local Node is a **high-fidelity "Compatibility Engine"** that transforms a standard compatibility assessment into an immersive, cinematic experience. Users progress through analysis stations (Visual, Psychometric, Biometric) before receiving a synthesized compatibility report.

**Core Concept**: A "Lead Scientist" moving through distinct "stations" within a high-tech forensic laboratory.

### The Three Architectural Pillars

1. **The Living Monolith**
   - Central glassmorphic UI container that floats above deep, animated backgrounds
   - Morphs and adapts dimensions to content within
   - NOT a static box - it should feel alive

2. **Void & Gold Aesthetic**
   - "Wine Black" background (#12090A) creates the "void"
   - "Pure Gold" (#D4A853) accents pop with high contrast
   - This is the "Engine Room" - distinct from the marketing site

3. **The Fusion Sequence**
   - Narrative transition where Visual, Psychometric, and Biometric data streams visually converge
   - Replaces standard loading bars with cinematic anticipation

### The Twin-Engine System (CRITICAL)

The app needs TWO distinct layers that communicate:

**Layer A: UI Engine (React + Framer Motion)**
- Handles text, inputs, buttons
- "Vertical Scroll" transitions with Spring Physics
- Stations slide UP like an elevator shaft

**Layer B: FX Engine (Custom Vanilla JS / Canvas)**
- Handles "Magnetizing Particles," "Shatter," and Background Icons
- HTML5 Canvas API + Custom Physics Loop (60FPS)
- Can render 5,000+ particles without slowing React UI

---

## VERSION HISTORY

### Current State (Session 28+)

| Session | What Was Added |
|---------|----------------|
| 28 | Pixel logo reveal & global reactivity across all phases |
| 28 | New centered UnifiedBackground with Three.js particles |
| 27 | Apply seamless design to all stations |
| 15 | Polish & Integration - WebGL exports index |
| 11-12 | Audio-Reactive & Performance Optimization |
| 10 | Post-Processing Pipeline |
| 9 | Results Phase - Celebration Burst |
| 8 | Fusion Sequence - Convergent Energy Vortex |
| 7 | DNA Helix Organic Shader Version |
| 6 | Neural Network Firing System |
| 5 | WebGL shader-based eye visualization |
| 4 | Celtic Knot Logo Integration with WebGL particle flow |
| 3 | Interactive Mouse Field Distortion with trail and touch |
| 2 | Phase-Reactive Shader Morphing with GSAP transitions |
| 1 | WebGL Organic Background with flowing shaders |

### React App Status (harmonia-local-node/)

**Completed:**
- Project structure and dependencies
- Void & Gold design system (index.css)
- AppContext state machine
- useScrollSpy and useTypewriter hooks
- LivingBackground with all visualizations
- All 5 station components
- Felix Terminal with typewriter
- SparkBadge with electric pulse
- Results with Radar Chart
- True 3D Helix (React Three Fiber)
- GSAP Fusion Sequence
- Particle Logo Masking
- Mobile Responsiveness
- Accessibility features

---

## KNOWN FAILURES & ISSUES

### Where Claude Has Struggled

#### 1. **Particle Logo Masking - Incomplete**
**Problem**: The magnetizing logo effect where 4,000+ particles drift from screen edges and snap to form the Harmonia logo is not fully working.
**What Was Wanted**:
- Particles spawn at random edges
- Over 4 seconds, "Homing Force" pulls them to target pixels
- Mouse interaction scatters particles, then they reform
**Current State**: Basic particle system exists but doesn't properly pixel-map to logo

#### 2. **Shatter Physics - Not Implemented**
**Problem**: The Voronoi Tessellation shatter effect between phases was never built.
**What Was Wanted**:
- When phase ends, capture screen state
- Mathematically fracture into 12-20 jagged polygons
- Apply explosion vector - shards fly outward in 3D space with gravity
**Current State**: Using simple fade transitions instead

#### 3. **Reactive Background Icons - Partial**
**Problem**: Background icons don't fully react to user interactions as specified.
**What Was Wanted**:
- Phase 1 Eye: Pupil dilates when hovering Upload button, iris rotates faster
- Phase 2 Radar: "Jitter" - keystrokes send shockwaves through nodes
- Phase 3 Helix: "Untwist" - DNA strands separate when dragging file
**Current State**: Some basic reactivity but not the full kinetic link

#### 4. **Advanced Foreground Icons - Not Built**
**Problem**: The custom SVG icons with internal animation states weren't created.
**What Was Wanted**:
- The Scanner: Wireframe reticle that actively scans up/down
- The Neural Node: Network of dots with connections lighting up dynamically
- The Cryptex: Rotating cylinder lock that clicks into place on file drop
**Current State**: Using simpler static or basic animated icons

#### 5. **3-Tab Results Dossier - Simplified**
**Problem**: The results view doesn't have the full forensic structure.
**What Was Wanted**:
- Tab 1 (Executive): Holographic "Ring" chart + Large Gold Percentage
- Tab 2 (Forensic): D3/Recharts Radar showing "7 Sins" vector
- Tab 3 (Registry): Recursive File Tree with JSON/Encrypted code view
**Current State**: Single radar chart without tabbed structure

#### 6. **FX Engine Separation - Not Done**
**Problem**: The Canvas-based FX layer was never properly separated from React.
**What Was Wanted**: A `lib/FXEngine.ts` class handling all heavy particle/shatter rendering
**Current State**: Everything mixed into React components

#### 7. **Victorian Scientific Voice - Inconsistent**
**Problem**: Copy/prompts don't consistently use the aesthetic voice.
**What Was Wanted**: "Initiate psychometric calibration. Input subjective analysis of variable X."
**Current State**: Mix of styles

---

## WHAT STILL NEEDS TO BE DONE

### High Priority (Core Experience)

1. **True Pixel-Mapped Particle System**
   - Load logo into off-screen buffer
   - Scan pixels, record gold pixel coordinates as targets
   - 4,000 particles with homing force
   - Mouse repulsion + memory force to reform

2. **Voronoi Shatter Transitions**
   - Implement tessellation algorithm
   - Capture screen to canvas
   - Apply 3D explosion physics with gravity

3. **Complete Reactive Backgrounds**
   - Eye pupil dilation on hover
   - Orbit velocity linked to typing speed
   - Helix untwist on file drag

4. **FXEngine Class**
   - Separate from React
   - 60FPS physics loop
   - Bridge to communicate with UI

### Medium Priority (Polish)

5. **Advanced Icons**
   - Scanner reticle component
   - Neural Node with dynamic connections
   - Cryptex lock component

6. **3-Tab Results Structure**
   - Tab navigation
   - Executive ring chart
   - File tree view

7. **Victorian Scientific Copy**
   - Audit all text strings
   - Rewrite in consistent voice

### Low Priority (Enhancement)

8. **Audio Reactivity**
   - Background responds to ambient audio
   - UI sounds on interactions

9. **XState Migration**
   - Replace useReducer with formal state machine
   - Enable visualization tooling

---

## Branch Structure

Each design section has its own dedicated branch for isolated development:

| Branch Name | Purpose | Main File Section |
|-------------|---------|-------------------|
| `claude/design-home-hero-y6Pe3` | Home page hero section | Lines 431-500+ in HTML |
| `claude/design-why-harmonia-y6Pe3` | Why Harmonia page (animated icons) | Lines 6221-6556 |
| `claude/design-partnerships-y6Pe3` | Partnerships page & modal | Lines 6573-6682 |
| `claude/design-team-y6Pe3` | Team page & member cards | Lines 6682-7000+ |
| `claude/design-contact-y6Pe3` | Contact section & form | Lines 5237-5695 |
| `claude/design-navigation-y6Pe3` | Navigation, hamburger, theme toggle | Lines 138-430 |
| `claude/design-css-tokens-y6Pe3` | CSS variables, colors, typography | Lines 1-137 |
| `claude/design-animations-y6Pe3` | Keyframe animations & effects | Throughout CSS |

---

## Main Design Files

### Standalone HTML: `harmonia_integrated_v30 (5) (2).html`

8,500+ line self-contained file with:
- All CSS styles (inline)
- All JavaScript (inline)
- Complete UI structure
- Light/Dark mode support

```
Lines 1-6000:      CSS Styles
  - 1-137:         Root variables & design tokens
  - 138-430:       Navigation & theme toggle
  - 431-1000:      Hero section styles
  - 1000-3500:     Page layouts & responsive styles
  - 3500-6000:     Component-specific styles

Lines 6000-8000:   HTML Structure
  - 6134-6220:     Navigation HTML
  - 6168-6220:     Home page
  - 6221-6556:     Why Harmonia page
  - 6573-6682:     Partnerships page
  - 6682-7200:     Team page
  - 7200+:         Contact & Footer

Lines 8000+:       JavaScript
```

### React App: `harmonia-local-node/`

```
src/
├── components/
│   ├── Stations/          # 6 main UI stations
│   │   ├── IntroStation.tsx
│   │   ├── VisualStation.tsx
│   │   ├── PsychStation.tsx
│   │   ├── FelixTerminal.tsx
│   │   ├── BioStation.tsx
│   │   └── ResultsStation.tsx
│   ├── WebGL/             # 16 shader components
│   │   ├── UnifiedBackground.tsx
│   │   ├── PixelLogoReveal.tsx
│   │   ├── GlobalReactiveField.tsx
│   │   └── ... (13 more)
│   ├── 3D/
│   │   └── DNAHelix3D.tsx
│   └── UI/
│       └── SparkBadge.tsx
├── context/
│   └── AppContext.tsx     # State machine
├── hooks/
│   ├── useScrollSpy.ts
│   ├── useTypewriter.ts
│   └── useQuizReactivity.ts
└── shaders/
    ├── noise.glsl
    └── organic.*.glsl
```

---

## Using Claude Efficiently for Design Changes

### The Problem with Claude

Claude tends to:
1. Over-simplify complex visual requirements
2. Use React patterns when Canvas/WebGL is needed
3. Forget the "Void & Gold" aesthetic mid-conversation
4. Not fully implement physics-based animations

### Better Prompts for Claude

**For Complex Animations:**
```
I need a TRUE pixel-mapped particle system, not a simplified version.

Requirements:
1. Load harmonia_logo.png into an OffscreenCanvas
2. Scan every pixel - if alpha > 0, record (x,y) as a Target
3. Spawn exactly 4000 particles at random screen edges
4. Each particle has: position, velocity, targetPosition, color
5. Physics loop at 60FPS applies:
   - Homing force toward target (strength increases over 4 seconds)
   - Mouse repulsion when cursor within 100px
   - Memory force to return to target after repulsion
6. Use requestAnimationFrame, NOT React state updates

Do NOT simplify this. Show me the full implementation.
```

**For Shatter Effect:**
```
Implement Voronoi tessellation shatter transition.

This is NOT a CSS animation. It requires:
1. Capture current view to canvas (html2canvas or similar)
2. Generate 15 Voronoi cells mathematically
3. Create polygon mesh from cell boundaries
4. On trigger, apply physics:
   - Explosion vector from center
   - Each shard gets random rotation
   - Gravity pulls shards down
   - Shards scale down as they fly (perspective)
5. Reveal next phase behind shards

Show me the algorithm, not a library wrapper.
```

**For Reactive Backgrounds:**
```
The Eye background must react to UI events:

1. Create a bridge between React UI and Canvas FX layer
2. When user hovers upload button:
   - Dispatch 'eye:dilate' event
   - FX layer receives event, animates pupil scale from 1.0 to 1.4
3. When file is dragged:
   - Dispatch 'eye:alert' event
   - Iris rotation speed increases from 0.5 to 2.0 rad/s
4. Use EventEmitter pattern, not React props

The FX layer runs independently at 60FPS.
Do not tie animations to React render cycle.
```

### What to Tell Claude Upfront

Always include this context:
```
This is the Harmonia project - a "Parallax Forensic Lab" with:
- Void & Gold aesthetic (dark #12090A background, gold #D4A853 accents)
- Twin-Engine architecture (React UI + Canvas FX layers)
- Victorian Scientific tone ("Initiate calibration...")
- PS5-level visual fidelity goal

Do not simplify. Do not use standard React patterns for animations.
Heavy visuals must use Canvas/WebGL, not React state.
```

---

## Using Google AI Studio Efficiently

### Best For:
- Generating creative copy in Victorian Scientific voice
- Brainstorming visual concepts
- Quick SVG icon sketches
- Color palette variations

### Prompts That Work

**For Victorian Scientific Copy:**
```
Write UI text for a compatibility analysis app in Victorian Scientific voice.

Context: User is uploading a photo for "Visual Calibration"
Tone: Formal, mysterious, slightly dramatic, uses scientific terminology

Generate:
1. Header text (max 8 words)
2. Instruction text (max 20 words)
3. Button text (max 3 words)
4. Success message (max 15 words)
```

**For Animation Concepts:**
```
Describe a particle animation for a luxury dating app logo reveal.

Constraints:
- 4000 gold particles on black background
- Must feel "magnetic" and "inevitable"
- Takes 4 seconds to complete
- Interactive - mouse disrupts temporarily

Describe the visual journey frame by frame.
I'll implement the code separately.
```

### Workflow: AI Studio → Claude

1. **Ideate in AI Studio**: Get creative concepts, copy variations
2. **Refine in AI Studio**: Pick best options, iterate
3. **Implement with Claude**: Take refined specs to Claude for code
4. **Debug with Claude**: Use Claude for technical fixes

---

## Phase-by-Phase Requirements

### Phase 0: The Magnetizing Swarm (Intro)

**Visual**: Gold particles form Harmonia logo
**Tech**: tsparticles with polygon mask OR custom Canvas
**Interactions**:
- Mouse repels particles temporarily
- Particles reform with "memory force"

**Status**: Partially working - needs pixel-perfect mapping

---

### Phase 1: Visual Calibration (The Eye)

**Background**: Massive Eye SVG with parallax mouse tracking
**UI**: Upload button positioned over iris
**Interactions**:
- Hover upload → Pupil dilates
- Drag file → Iris rotates faster
- Complete → Eye "closes" transition

**Status**: Eye exists, reactivity incomplete

---

### Phase 2: Psychometric Analysis (Felix Terminal)

**Background**: Personality Orbit (concentric ring dots)
**UI**: Felix Terminal with typewriter prompts
**Interactions**:
- Typing speed → Ring rotation velocity
- Keystroke → Shockwave through nodes

**Status**: Terminal works, orbit reactivity incomplete

---

### Phase 3: Biometric Ingestion (The Helix)

**Background**: 3D DNA Helix in maroon atmosphere
**UI**: File dropzone with containment field
**Interactions**:
- Drag file → Electric Crackle (Bloom effect)
- Drop file → Helix "untwists" to accept

**Status**: Helix renders, interactions incomplete

---

### Phase 4: The Fusion Sequence

**Animation Timeline (GSAP)**:
1. Scroll locks
2. Eye translates to center from top
3. Orbit translates to center from bottom
4. Helix scales down, moves to center
5. All three overlap, spin rapidly
6. White/gold flash ramps to full opacity
7. Results mount behind flash
8. Flash fades, reveals Sealed Dossier

**Status**: Basic sequence works, needs polish

---

### Phase 5: Results Dashboard

**Structure**: 3-tab Sealed Dossier
- Tab 1: Executive summary + ring chart
- Tab 2: Forensic radar chart
- Tab 3: Registry file tree

**UI Elements**:
- Gold Foil text for score
- SparkBadge with electricPulse
- Wax seal click animation

**Status**: Single view works, tabs not implemented

---

## Design System Quick Reference

### Color Tokens (Void & Gold)

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--dark-bg` | - | #12090A | Primary void background |
| `--dark-surface` | - | #2D1A1C | Card surfaces |
| `--gold` | #D4A853 | #F0C86E | Primary accents |
| `--gold-champagne` | #E8C97A | #F5D98A | Secondary text |
| `--gold-light` | - | rgba(240,200,110,0.2) | Glows/hovers |
| `--maroon` | #722F37 | #722F37 | Gradients, bio elements |
| `--maroon-deep` | #5C1A1B | #5C1A1B | Deep accents |

### Typography

| Use | Font | Weights |
|-----|------|---------|
| Headers | Cormorant Garamond | 400, 500, 600, 700 |
| Body/UI | DM Sans | 400, 500, 600, 700 |
| Code/Terminal | JetBrains Mono | 400 |

### Key CSS Effects

```css
/* Gold Foil Text */
.gold-foil-text {
  background: linear-gradient(135deg, var(--gold), #FFF8E1, var(--gold));
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: goldShimmer 3s ease-in-out infinite;
}

/* Electric Pulse Badge */
@keyframes electricPulse {
  0% { box-shadow: 0 0 0 0 rgba(212, 168, 83, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(212, 168, 83, 0); }
  100% { box-shadow: 0 0 0 0 rgba(212, 168, 83, 0); }
}
```

---

## Common Git Commands

```bash
# View all design branches
git branch -a | grep design

# Switch to a branch
git checkout claude/design-home-hero-y6Pe3

# See what changed
git diff HEAD~1 -- "harmonia_integrated_v30 (5) (2).html"

# Commit changes
git add .
git commit -m "Description of change"
git push -u origin claude/design-[section]-y6Pe3
```

---

## Tips for Success

1. **Reference the PDF**: "Enhancing Animation and Code Structure.pdf" has the full vision
2. **Test Both Themes**: Always verify light AND dark mode
3. **Canvas for Heavy FX**: Don't use React state for particle systems
4. **One Change Per Commit**: Keep changes focused and atomic
5. **Victorian Voice**: All copy should sound scientific and mysterious

---

## Quick Reference: File Locations

| What | Where |
|------|-------|
| Standalone HTML | `harmonia_integrated_v30 (5) (2).html` |
| React App | `harmonia-local-node/` |
| Design Tokens CSS | `harmonia-local-node/src/index.css` |
| State Machine | `harmonia-local-node/src/context/AppContext.tsx` |
| WebGL Components | `harmonia-local-node/src/components/WebGL/` |
| Station Components | `harmonia-local-node/src/components/Stations/` |
| Architecture Plan | `harmonia-local-node/PLAN.md` |
| Original Spec | `plan.md` |
| Design Vision PDF | `Enhancing Animation and Code Structure.pdf` |

---

*Last Updated: January 2026*
*Version: 2.0 - Added failure analysis, vision documentation, and outstanding tasks*
