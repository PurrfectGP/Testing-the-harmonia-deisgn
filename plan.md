1. The Core Architecture: "Twin-Engine" System
We will split the application into two distinct layers that communicate via a bridge.
Layer A: The UI Engine (React + Framer Motion)
Responsibility: Handles text, inputs, buttons, and the "Vertical Scroll" transitions.
Tech: framer-motion (via import map).
Why: CSS transitions are linear. Framer uses Spring Physics (Mass, Stiffness, Damping). This makes the interface feel heavy and expensive, like a physical machine.
Vertical Scroll: When a phase completes, the current station will physically slide UP out of view (y: -100%), and the new station will slide UP from the bottom (y: 100%), like an elevator shaft.
Layer B: The FX Engine (Custom Vanilla JS Class)
Responsibility: Handles the "Magnetizing Particles," "Shatter," and Background Icons.
Tech: HTML5 Canvas API + Custom Physics Loop (60FPS).
Why: This allows us to render 5,000+ particles individually without slowing down the React UI.
2. The Global Visual Engine Specs
A. True Pixel-Mapped Particle System (The "Logo Form")
Behavior:
Ingestion: The engine loads the "Harmonia" Base64 image into an off-screen buffer.
Scanning: It scans every pixel. If a pixel is gold (non-transparent), it records that (x, y) coordinate as a Target.
Spawn: 4,000 particles spawn at the random edges of the screen.
Magnetization: Over 4 seconds (Intro Phase), a "Homing Force" is applied. Particles drift from the edges and strictly snap to their assigned Target pixel, recreating the logo out of gold dust.
Interaction: If you move your mouse through the logo, particles scatter (Repulsion Force) and then slowly reform (Memory Force).
B. The "Shatter" Physics (Canvas-Based)
Behavior:
Instead of CSS clip-path (which looks like paper), we use Voronoi Tesselation.
When a phase ends, the FXEngine captures the current screen state.
It mathematically fractures the image into 12-20 jagged, uneven polygons.
It applies an Explosion Vector from the center. Shards fly outward in 3D space (scaling down, rotating) with gravity, revealing the next phase behind them.
C. Cinematic Backgrounds (Reactive Icons)
We will replace the static SVGs with Living Canvas Objects or Complex SVGs that react to specific triggers:
Phase 1 (Eye):
Trigger: Hovering the "Upload" button.
Reaction: The background Eye's pupil physically dilates (expands). The iris rotates faster.
Phase 2 (Radar):
Trigger: Typing in the input field.
Reaction: "Jitter." Every keystroke sends a shockwave through the background radar nodes, making them flash and shake.
Phase 3 (Helix):
Trigger: Dragging the file.
Reaction: "Untwist." The DNA strands physically separate and straighten out to "unlock" the vault.
3. The "Advanced Icons" (Foreground)
We will scrap the Lucide defaults for the main interactions and build Custom SVG Components with internal animation states.
The Scanner (Phase 1): A wireframe reticle that actively scans up and down.
The Neural Node (Phase 2): A network of dots where connections light up dynamically.
The Cryptex (Phase 3): A rotating cylinder lock that clicks into place when the file is dropped.
4. The 3-Tab Results Dossier
Implemented as a strictly structured data view:
Tab 1 (Executive): Holographic "Ring" chart (Eye/Brain/DNA) + Large Gold Percentage.
Tab 2 (Forensic): A D3/Recharts Radar chart showing the "7 Sins" vector.
Tab 3 (Registry): A recursive File Tree. Clicking a file loads the raw JSON/Encrypted string into a "Code View" pane.
5. Execution Plan
If you confirm, I will proceed in this exact order:
Dependencies: Add framer-motion to index.html.
FX Engine: Write lib/FXEngine.ts. This is the heavy lifting (Particles + Shatter).
UI Components: Rewrite Monolith.tsx to support the Vertical Scroll (Elevator) transition.
Stations: Rebuild each station (Visual, Psych, Bio) with the new Advanced Icons and connect their events (typing, hovering) to the background engine.
Do you confirm this Specification and Plan? (I will wait for your "Yes" before generating the code).
