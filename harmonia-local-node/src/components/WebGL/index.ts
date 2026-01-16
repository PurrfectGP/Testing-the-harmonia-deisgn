/**
 * WebGL Components Index
 * Updated with Sessions 16-25: Quiz-Reactive Animations
 *
 * Exports all WebGL visualization components and utilities
 * for easy import throughout the application.
 */

// Phase backgrounds and effects
export { OrganicBackground, ShaderPhase } from './OrganicBackground';
export type { ShaderPhase as ShaderPhaseType } from './OrganicBackground';

// Logo visualization
export { CelticKnotLogo } from './CelticKnotLogo';
export { default as CelticKnotLogoDefault } from './CelticKnotLogo';

// Phase-specific visualizations
export { ShaderEye } from './ShaderEye';
export { default as ShaderEyeDefault } from './ShaderEye';

export { NeuralNetwork } from './NeuralNetwork';
export { default as NeuralNetworkDefault } from './NeuralNetwork';

export { ShaderHelix } from './ShaderHelix';
export { default as ShaderHelixDefault } from './ShaderHelix';

// Transition effects
export { FusionVortex } from './FusionVortex';
export { default as FusionVortexDefault } from './FusionVortex';

// Results celebration
export { CelebrationBurst } from './CelebrationBurst';
export { default as CelebrationBurstDefault } from './CelebrationBurst';

// Post-processing
export {
  PostProcessingEffects,
  LightPostProcessing,
  PHASE_EFFECTS,
} from './PostProcessing';
export type { PostProcessingConfig } from './PostProcessing';

// ============================================
// Session 16-20: Quiz-Reactive WebGL Components
// ============================================

// Session 16: Reactive Neural Network with quiz activity response
export { ReactiveNeuralNetwork } from './ReactiveNeuralNetwork';
export { default as ReactiveNeuralNetworkDefault } from './ReactiveNeuralNetwork';

// Session 17: Quantum Orbit - WebGL particle rings (replaces SVG)
export { QuantumOrbit } from './QuantumOrbit';
export { default as QuantumOrbitDefault } from './QuantumOrbit';

// Session 18: Thought Stream - consciousness flow visualization
export { ThoughtStream } from './ThoughtStream';
export { default as ThoughtStreamDefault } from './ThoughtStream';

// Session 19: Pulse Field - ambient reactive background grid
export { PulseField } from './PulseField';
export { default as PulseFieldDefault } from './PulseField';

// Session 20: Dynamic Post-Processing - quiz-reactive effects
export {
  DynamicPostProcessingEffects,
  DynamicPostProcessingCanvas,
  usePostProcessingValues,
} from './DynamicPostProcessing';
export { default as DynamicPostProcessingDefault } from './DynamicPostProcessing';

// Session 25: Phase Transitions - smooth WebGL transitions
export { PhaseTransition, TransitionType } from './PhaseTransition';
export { default as PhaseTransitionDefault } from './PhaseTransition';

/**
 * Component Usage Summary:
 *
 * === Original Components ===
 *
 * OrganicBackground - Base layer for all phases, flowing membrane shader
 *   Props: phase (ShaderPhase), intensity (number)
 *
 * CelticKnotLogo - Intro phase logo with particle scatter effect
 *   Props: size (number), className (string), onClick (function)
 *
 * ShaderEye - Visual phase eye with pupil dilation and blink
 *   Props: size (number), className (string)
 *
 * NeuralNetwork - Psychometric phase neural firing visualization
 *   Props: size (number), activity (number 0-1)
 *
 * ShaderHelix - Biometric phase DNA helix with twist animation
 *   Props: size (number), isGlowing (boolean)
 *
 * FusionVortex - Fusion transition convergent energy effect
 *   Props: size (number), autoProgress (boolean), duration (number)
 *
 * CelebrationBurst - Results phase confetti explosion
 *   Props: size (number), autoTrigger (boolean), burstCount (number)
 *
 * PostProcessingEffects - Post-processing pipeline (inside Canvas)
 *   Props: phase (string), enabled (boolean), customConfig (object)
 *
 * === Quiz-Reactive Components (Sessions 16-20) ===
 *
 * ReactiveNeuralNetwork - Neural network that responds to quiz typing
 *   Props: className (string), style (CSSProperties)
 *   Features: typing speed reactivity, submission bursts, question transitions
 *
 * QuantumOrbit - WebGL particle rings (replaces SVG OrbitVisualization)
 *   Props: className (string), style (CSSProperties)
 *   Features: typing-reactive rotation, particle glow, submission pulse
 *
 * ThoughtStream - Particle flow representing consciousness
 *   Props: className (string), style (CSSProperties)
 *   Features: keystroke spawning, upward flow, submission burst
 *
 * PulseField - Ambient grid that pulses with activity
 *   Props: className (string), style (CSSProperties)
 *   Features: wave propagation, breathing animation, progress intensity
 *
 * DynamicPostProcessingEffects - Quiz-reactive post-processing
 *   Props: quizState, baseBloom, baseVignette, enableScanlines
 *   Features: dynamic bloom, vignette, chromatic aberration, grain
 *
 * PhaseTransition - Smooth animated transitions between phases
 *   Props: transitionType (TransitionType), isActive, duration, onComplete
 *   Features: particle morphing, turbulence, phase-specific animations
 */
