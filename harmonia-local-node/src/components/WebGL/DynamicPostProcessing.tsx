/**
 * DynamicPostProcessing - Session 20: Quiz-Reactive Post-Processing
 * Real-time post-processing effects tied to user activity
 *
 * Features:
 * - Dynamic bloom that pulses with typing
 * - Vignette that tightens during active input
 * - Chromatic aberration on submissions
 * - Film grain modulation
 * - Scanline overlay option
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import * as THREE from 'three';
import { useQuizReactivity } from '../../hooks/useQuizReactivity';

// Extend R3F with post-processing classes
extend({ EffectComposer, RenderPass, ShaderPass, UnrealBloomPass });

// Custom vignette + chromatic aberration + grain shader
const DynamicEffectsShader = {
  uniforms: {
    tDiffuse: { value: null },
    u_time: { value: 0 },
    u_vignetteIntensity: { value: 0.3 },
    u_chromaticAberration: { value: 0.0 },
    u_grainIntensity: { value: 0.03 },
    u_scanlineIntensity: { value: 0.0 },
    u_resolution: { value: new THREE.Vector2(1, 1) },
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float u_time;
    uniform float u_vignetteIntensity;
    uniform float u_chromaticAberration;
    uniform float u_grainIntensity;
    uniform float u_scanlineIntensity;
    uniform vec2 u_resolution;

    varying vec2 vUv;

    // Simple hash for noise
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv;

      // Chromatic aberration
      vec2 direction = uv - 0.5;
      float dist = length(direction);

      vec3 color;
      if (u_chromaticAberration > 0.001) {
        float aberration = u_chromaticAberration * dist;
        color.r = texture2D(tDiffuse, uv + direction * aberration).r;
        color.g = texture2D(tDiffuse, uv).g;
        color.b = texture2D(tDiffuse, uv - direction * aberration).b;
      } else {
        color = texture2D(tDiffuse, uv).rgb;
      }

      // Vignette
      float vignette = 1.0 - dist * u_vignetteIntensity * 2.0;
      vignette = smoothstep(0.0, 1.0, vignette);
      color *= vignette;

      // Film grain
      if (u_grainIntensity > 0.001) {
        float grain = hash(uv * u_resolution + u_time * 100.0) * 2.0 - 1.0;
        color += grain * u_grainIntensity;
      }

      // Scanlines
      if (u_scanlineIntensity > 0.001) {
        float scanline = sin(uv.y * u_resolution.y * 2.0) * 0.5 + 0.5;
        scanline = pow(scanline, 8.0);
        color -= scanline * u_scanlineIntensity;
      }

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

interface DynamicPostProcessingEffectsProps {
  quizState: {
    typingSpeed: number;
    submissionPulse: number;
    activityLevel: number;
    isTyping: boolean;
  };
  baseBloom?: number;
  baseVignette?: number;
  enableScanlines?: boolean;
}

export function DynamicPostProcessingEffects({
  quizState,
  baseBloom = 0.4,
  baseVignette = 0.3,
  enableScanlines = false,
}: DynamicPostProcessingEffectsProps) {
  const { gl, scene, camera, size } = useThree();

  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const effectsPassRef = useRef<ShaderPass | null>(null);

  // Initialize composer
  useEffect(() => {
    const composer = new EffectComposer(gl);

    // Render pass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Bloom pass
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      baseBloom,
      0.7,
      0.7
    );
    composer.addPass(bloomPass);
    bloomPassRef.current = bloomPass;

    // Custom effects pass
    const effectsPass = new ShaderPass(DynamicEffectsShader);
    effectsPass.uniforms.u_resolution.value.set(size.width, size.height);
    composer.addPass(effectsPass);
    effectsPassRef.current = effectsPass;

    composerRef.current = composer;

    return () => {
      composer.dispose();
    };
  }, [gl, scene, camera, size.width, size.height, baseBloom]);

  // Update size on resize
  useEffect(() => {
    if (composerRef.current) {
      composerRef.current.setSize(size.width, size.height);
    }
    if (effectsPassRef.current) {
      effectsPassRef.current.uniforms.u_resolution.value.set(size.width, size.height);
    }
    if (bloomPassRef.current) {
      bloomPassRef.current.resolution.set(size.width, size.height);
    }
  }, [size]);

  // Animation loop - update effects based on quiz state
  useFrame((state) => {
    if (!composerRef.current) return;

    const time = state.clock.elapsedTime;

    // Dynamic bloom - increases with typing
    if (bloomPassRef.current) {
      const targetBloom = baseBloom + quizState.typingSpeed * 0.2 + quizState.submissionPulse * 0.4;
      bloomPassRef.current.strength = THREE.MathUtils.lerp(
        bloomPassRef.current.strength,
        targetBloom,
        0.1
      );
    }

    // Dynamic vignette and effects
    if (effectsPassRef.current) {
      const uniforms = effectsPassRef.current.uniforms;

      uniforms.u_time.value = time;

      // Vignette tightens during active typing
      const targetVignette = quizState.isTyping
        ? baseVignette + 0.15
        : baseVignette;
      uniforms.u_vignetteIntensity.value = THREE.MathUtils.lerp(
        uniforms.u_vignetteIntensity.value,
        targetVignette,
        0.05
      );

      // Chromatic aberration on submissions
      const targetChromatic = quizState.submissionPulse * 0.008;
      uniforms.u_chromaticAberration.value = THREE.MathUtils.lerp(
        uniforms.u_chromaticAberration.value,
        targetChromatic,
        0.1
      );

      // Grain increases slightly with activity
      const targetGrain = 0.02 + quizState.activityLevel * 0.02;
      uniforms.u_grainIntensity.value = THREE.MathUtils.lerp(
        uniforms.u_grainIntensity.value,
        targetGrain,
        0.05
      );

      // Scanlines (optional)
      uniforms.u_scanlineIntensity.value = enableScanlines ? 0.03 : 0;
    }

    // Render with composer
    composerRef.current.render();
  }, 1); // Priority 1 to render after scene

  return null;
}

// Standalone component that wraps a Canvas with dynamic post-processing
interface DynamicPostProcessingProps {
  children: React.ReactNode;
  baseBloom?: number;
  baseVignette?: number;
  enableScanlines?: boolean;
}

export function DynamicPostProcessingCanvas({
  children,
  baseBloom = 0.4,
  baseVignette = 0.3,
  enableScanlines = false,
}: DynamicPostProcessingProps) {
  const quizState = useQuizReactivity();

  return (
    <>
      {children}
      <DynamicPostProcessingEffects
        quizState={quizState}
        baseBloom={baseBloom}
        baseVignette={baseVignette}
        enableScanlines={enableScanlines}
      />
    </>
  );
}

// Hook to get current post-processing values for external use
export function usePostProcessingValues() {
  const quizState = useQuizReactivity();

  return useMemo(() => ({
    bloomIntensity: 0.4 + quizState.typingSpeed * 0.2 + quizState.submissionPulse * 0.4,
    vignetteIntensity: quizState.isTyping ? 0.45 : 0.3,
    chromaticAberration: quizState.submissionPulse * 0.008,
    grainIntensity: 0.02 + quizState.activityLevel * 0.02,
  }), [quizState]);
}

export default DynamicPostProcessingEffects;
