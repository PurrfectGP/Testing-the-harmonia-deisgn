/**
 * WebGL Components Index
 * Session 15: Polish & Integration
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

/**
 * Component Usage Summary:
 *
 * OrganicBackground - Base layer for all phases, flowing membrane shader
 *   Props: phase (ShaderPhase), intensity (number)
 *
 * CelticKnotLogo - Intro phase logo with particle scatter effect
 *   Props: size (number), className (string)
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
 */
