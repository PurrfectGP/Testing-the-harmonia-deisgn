/**
 * PostProcessing - WebGL post-processing effects pipeline
 * Session 10: Post-Processing Pipeline
 *
 * Features:
 * - Bloom effect for glowing elements
 * - Vignette for atmospheric depth
 * - Chromatic aberration for energy effects
 * - Film grain for organic texture
 * - Phase-based effect intensity modulation
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  Noise,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

// Effect intensity presets per phase
export interface PostProcessingConfig {
  bloomIntensity: number;
  bloomThreshold: number;
  bloomRadius: number;
  vignetteIntensity: number;
  chromaticAberration: number;
  noiseIntensity: number;
}

export const PHASE_EFFECTS: Record<string, PostProcessingConfig> = {
  INTRO: {
    bloomIntensity: 0.5,
    bloomThreshold: 0.8,
    bloomRadius: 0.6,
    vignetteIntensity: 0.3,
    chromaticAberration: 0.001,
    noiseIntensity: 0.03,
  },
  VISUAL: {
    bloomIntensity: 0.8,
    bloomThreshold: 0.6,
    bloomRadius: 0.8,
    vignetteIntensity: 0.4,
    chromaticAberration: 0.002,
    noiseIntensity: 0.02,
  },
  PSYCHOMETRIC: {
    bloomIntensity: 0.6,
    bloomThreshold: 0.7,
    bloomRadius: 0.7,
    vignetteIntensity: 0.35,
    chromaticAberration: 0.003,
    noiseIntensity: 0.04,
  },
  BIOMETRIC: {
    bloomIntensity: 0.7,
    bloomThreshold: 0.65,
    bloomRadius: 0.75,
    vignetteIntensity: 0.35,
    chromaticAberration: 0.002,
    noiseIntensity: 0.025,
  },
  FUSION: {
    bloomIntensity: 1.2,
    bloomThreshold: 0.4,
    bloomRadius: 0.9,
    vignetteIntensity: 0.5,
    chromaticAberration: 0.008,
    noiseIntensity: 0.05,
  },
  RESULTS: {
    bloomIntensity: 0.9,
    bloomThreshold: 0.5,
    bloomRadius: 0.85,
    vignetteIntensity: 0.25,
    chromaticAberration: 0.002,
    noiseIntensity: 0.02,
  },
};

interface PostProcessingEffectsProps {
  phase?: keyof typeof PHASE_EFFECTS;
  enabled?: boolean;
  customConfig?: Partial<PostProcessingConfig>;
}

export function PostProcessingEffects({
  phase = 'INTRO',
  enabled = true,
  customConfig,
}: PostProcessingEffectsProps) {
  const config = useMemo(() => {
    const baseConfig = PHASE_EFFECTS[phase] || PHASE_EFFECTS.INTRO;
    return { ...baseConfig, ...customConfig };
  }, [phase, customConfig]);

  // Animated chromatic aberration offset
  const chromaticOffsetRef = useRef(new THREE.Vector2(config.chromaticAberration, 0));

  useFrame((state) => {
    // Subtle animated chromatic aberration
    const time = state.clock.elapsedTime;
    const offset = config.chromaticAberration;
    chromaticOffsetRef.current.set(
      offset * Math.sin(time * 0.5),
      offset * Math.cos(time * 0.5)
    );
  });

  if (!enabled) return null;

  return (
    <EffectComposer>
      {/* Bloom for glow effects */}
      <Bloom
        intensity={config.bloomIntensity}
        luminanceThreshold={config.bloomThreshold}
        luminanceSmoothing={0.9}
        mipmapBlur
      />

      {/* Vignette for atmospheric depth */}
      <Vignette
        offset={0.3}
        darkness={config.vignetteIntensity}
        eskil={false}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* Chromatic aberration for energy effect */}
      <ChromaticAberration
        offset={chromaticOffsetRef.current}
        radialModulation={true}
        modulationOffset={0.15}
      />

      {/* Film grain for organic texture */}
      <Noise
        opacity={config.noiseIntensity}
        blendFunction={BlendFunction.OVERLAY}
      />
    </EffectComposer>
  );
}

// Simplified post-processing for performance-sensitive scenarios
export function LightPostProcessing({ bloomIntensity = 0.5 }: { bloomIntensity?: number }) {
  return (
    <EffectComposer>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.7}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette offset={0.3} darkness={0.3} eskil={false} />
    </EffectComposer>
  );
}

export default PostProcessingEffects;
