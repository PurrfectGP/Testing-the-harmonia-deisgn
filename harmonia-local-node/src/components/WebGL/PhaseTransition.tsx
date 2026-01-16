/**
 * PhaseTransition - Session 25: WebGL Phase Transition Effects
 * Smooth animated transitions between application phases
 *
 * Transitions:
 * - INTRO → VISUAL: Logo particles scatter → reform as eye
 * - VISUAL → PSYCHOMETRIC: Eye closes → neural network emerges
 * - PSYCHOMETRIC → BIOMETRIC: Neural network converges → forms helix
 * - BIOMETRIC → FUSION: Helix spirals into vortex
 * - FUSION → RESULTS: Vortex explodes into celebration
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

// Transition particle vertex shader
const transitionVertexShader = `
uniform float u_time;
uniform float u_progress;
uniform float u_transitionType;
uniform vec3 u_targetPosition;

attribute vec3 a_startPosition;
attribute vec3 a_targetPosition;
attribute float a_random;
attribute float a_delay;

varying float v_alpha;
varying float v_progress;
varying float v_random;

// Easing function
float easeInOutCubic(float t) {
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

void main() {
  v_random = a_random;

  // Calculate delayed progress per particle
  float delayedProgress = clamp((u_progress - a_delay) / (1.0 - a_delay), 0.0, 1.0);
  float easedProgress = easeInOutCubic(delayedProgress);
  v_progress = easedProgress;

  // Interpolate position
  vec3 pos = mix(a_startPosition, a_targetPosition, easedProgress);

  // Add turbulence during transition
  float turbulence = sin(u_progress * 3.14159) * 0.5; // Peaks at middle of transition
  pos.x += sin(u_time * 3.0 + a_random * 10.0) * turbulence * 0.2;
  pos.y += cos(u_time * 2.5 + a_random * 8.0) * turbulence * 0.2;
  pos.z += sin(u_time * 2.0 + a_random * 6.0) * turbulence * 0.1;

  // Spiral motion for certain transitions
  if (u_transitionType > 2.5) { // BIOMETRIC → FUSION type
    float spiralAngle = easedProgress * 6.28 * 2.0 + a_random * 6.28;
    float spiralRadius = (1.0 - easedProgress) * 0.3;
    pos.x += cos(spiralAngle) * spiralRadius;
    pos.y += sin(spiralAngle) * spiralRadius;
  }

  // Alpha - fade during transition, brighten at ends
  v_alpha = 0.5 + sin(easedProgress * 3.14159) * 0.3;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Point size - pulse during transition
  float baseSize = 6.0 + a_random * 3.0;
  float pulseFactor = 1.0 + sin(u_progress * 3.14159) * 0.5;
  gl_PointSize = baseSize * pulseFactor * (200.0 / -mvPosition.z);
}
`;

// Transition particle fragment shader
const transitionFragmentShader = `
uniform vec3 u_colorStart;
uniform vec3 u_colorEnd;
uniform float u_progress;
uniform float u_time;

varying float v_alpha;
varying float v_progress;
varying float v_random;

void main() {
  // Circular point
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  if (dist > 0.5) discard;

  float alpha = smoothstep(0.5, 0.0, dist) * v_alpha;

  // Color transition
  vec3 color = mix(u_colorStart, u_colorEnd, v_progress);

  // Inner glow
  float innerGlow = 1.0 - dist * 2.0;
  color += mix(u_colorStart, u_colorEnd, 0.5) * innerGlow * 0.3;

  // Shimmer
  float shimmer = sin(u_time * 10.0 + v_random * 20.0) * 0.5 + 0.5;
  color += vec3(1.0, 0.9, 0.7) * shimmer * 0.1 * (1.0 - abs(u_progress - 0.5) * 2.0);

  gl_FragColor = vec4(color, alpha);
}
`;

// Transition types
export const TransitionType = {
  INTRO_TO_VISUAL: 0,
  VISUAL_TO_PSYCHOMETRIC: 1,
  PSYCHOMETRIC_TO_BIOMETRIC: 2,
  BIOMETRIC_TO_FUSION: 3,
  FUSION_TO_RESULTS: 4,
} as const;

export type TransitionType = (typeof TransitionType)[keyof typeof TransitionType];

// Color pairs for each transition
const TRANSITION_COLORS: Record<TransitionType, { start: string; end: string }> = {
  [TransitionType.INTRO_TO_VISUAL]: { start: '#D4A853', end: '#F5D98A' },
  [TransitionType.VISUAL_TO_PSYCHOMETRIC]: { start: '#F5D98A', end: '#D4A853' },
  [TransitionType.PSYCHOMETRIC_TO_BIOMETRIC]: { start: '#D4A853', end: '#722F37' },
  [TransitionType.BIOMETRIC_TO_FUSION]: { start: '#722F37', end: '#F5D98A' },
  [TransitionType.FUSION_TO_RESULTS]: { start: '#F5D98A', end: '#D4A853' },
};

interface TransitionSceneProps {
  transitionType: TransitionType;
  progress: number;
  particleCount?: number;
}

function TransitionScene({ transitionType, progress, particleCount = 300 }: TransitionSceneProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate particle positions based on transition type
  const { startPositions, targetPositions, randoms, delays } = useMemo(() => {
    const start = new Float32Array(particleCount * 3);
    const target = new Float32Array(particleCount * 3);
    const rand = new Float32Array(particleCount);
    const delay = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      rand[i] = Math.random();
      delay[i] = Math.random() * 0.3; // Stagger delays

      // Generate positions based on transition type
      switch (transitionType) {
        case TransitionType.INTRO_TO_VISUAL:
          // Scattered → Circular eye shape
          start[i * 3] = (Math.random() - 0.5) * 3;
          start[i * 3 + 1] = (Math.random() - 0.5) * 3;
          start[i * 3 + 2] = (Math.random() - 0.5) * 0.5;

          const eyeAngle = (i / particleCount) * Math.PI * 2;
          const eyeRadius = 0.3 + Math.random() * 0.4;
          target[i * 3] = Math.cos(eyeAngle) * eyeRadius;
          target[i * 3 + 1] = Math.sin(eyeAngle) * eyeRadius * 0.6;
          target[i * 3 + 2] = 0;
          break;

        case TransitionType.VISUAL_TO_PSYCHOMETRIC:
          // Circular → Neural network layout
          const startEyeAngle = (i / particleCount) * Math.PI * 2;
          start[i * 3] = Math.cos(startEyeAngle) * 0.5;
          start[i * 3 + 1] = Math.sin(startEyeAngle) * 0.3;
          start[i * 3 + 2] = 0;

          const layer = Math.floor(i / (particleCount / 5));
          const layerX = (layer / 4) * 2 - 1;
          target[i * 3] = layerX + (Math.random() - 0.5) * 0.3;
          target[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
          target[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
          break;

        case TransitionType.PSYCHOMETRIC_TO_BIOMETRIC:
          // Neural network → Helix shape
          const netLayer = Math.floor(i / (particleCount / 5));
          start[i * 3] = (netLayer / 4) * 2 - 1;
          start[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
          start[i * 3 + 2] = 0;

          const helixT = i / particleCount;
          const helixAngle = helixT * Math.PI * 4;
          const helixY = helixT * 2 - 1;
          target[i * 3] = Math.cos(helixAngle) * 0.3;
          target[i * 3 + 1] = helixY;
          target[i * 3 + 2] = Math.sin(helixAngle) * 0.3;
          break;

        case TransitionType.BIOMETRIC_TO_FUSION:
          // Helix → Vortex spiral
          const startHelixT = i / particleCount;
          const startHelixAngle = startHelixT * Math.PI * 4;
          start[i * 3] = Math.cos(startHelixAngle) * 0.3;
          start[i * 3 + 1] = startHelixT * 2 - 1;
          start[i * 3 + 2] = Math.sin(startHelixAngle) * 0.3;

          const vortexAngle = (i / particleCount) * Math.PI * 8;
          const vortexRadius = (1 - i / particleCount) * 0.8;
          target[i * 3] = Math.cos(vortexAngle) * vortexRadius;
          target[i * 3 + 1] = Math.sin(vortexAngle) * vortexRadius;
          target[i * 3 + 2] = (i / particleCount) * 0.5 - 0.25;
          break;

        case TransitionType.FUSION_TO_RESULTS:
          // Vortex → Explosion
          const startVortexAngle = (i / particleCount) * Math.PI * 8;
          const startVortexRadius = (1 - i / particleCount) * 0.5;
          start[i * 3] = Math.cos(startVortexAngle) * startVortexRadius;
          start[i * 3 + 1] = Math.sin(startVortexAngle) * startVortexRadius;
          start[i * 3 + 2] = 0;

          const explosionAngle = Math.random() * Math.PI * 2;
          const explosionPhi = Math.acos(Math.random() * 2 - 1);
          const explosionRadius = 1.5 + Math.random() * 1;
          target[i * 3] = Math.sin(explosionPhi) * Math.cos(explosionAngle) * explosionRadius;
          target[i * 3 + 1] = Math.sin(explosionPhi) * Math.sin(explosionAngle) * explosionRadius;
          target[i * 3 + 2] = Math.cos(explosionPhi) * explosionRadius * 0.5;
          break;
      }
    }

    return { startPositions: start, targetPositions: target, randoms: rand, delays: delay };
  }, [transitionType, particleCount]);

  // Geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(startPositions.slice(), 3));
    geo.setAttribute('a_startPosition', new THREE.BufferAttribute(startPositions, 3));
    geo.setAttribute('a_targetPosition', new THREE.BufferAttribute(targetPositions, 3));
    geo.setAttribute('a_random', new THREE.BufferAttribute(randoms, 1));
    geo.setAttribute('a_delay', new THREE.BufferAttribute(delays, 1));
    return geo;
  }, [startPositions, targetPositions, randoms, delays]);

  // Colors
  const colors = TRANSITION_COLORS[transitionType];

  // Uniforms
  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_progress: { value: 0 },
      u_transitionType: { value: transitionType },
      u_targetPosition: { value: new THREE.Vector3(0, 0, 0) },
      u_colorStart: { value: new THREE.Color(colors.start) },
      u_colorEnd: { value: new THREE.Color(colors.end) },
    }),
    [transitionType, colors]
  );

  // Animation
  useFrame((state) => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = state.clock.elapsedTime;
      material.uniforms.u_progress.value = progress;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={transitionVertexShader}
        fragmentShader={transitionFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface PhaseTransitionProps {
  transitionType: TransitionType;
  isActive: boolean;
  duration?: number;
  onComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function PhaseTransition({
  transitionType,
  isActive,
  duration = 1.5,
  onComplete,
  className = '',
  style,
}: PhaseTransitionProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const progressRef = useRef({ value: 0 });

  // Start/stop transition
  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      progressRef.current.value = 0;
      setProgress(0);

      gsap.to(progressRef.current, {
        value: 1,
        duration,
        ease: 'power2.inOut',
        onUpdate: () => {
          setProgress(progressRef.current.value);
        },
        onComplete: () => {
          onComplete?.();
          // Keep visible briefly at end
          setTimeout(() => setIsVisible(false), 200);
        },
      });
    } else {
      setIsVisible(false);
      setProgress(0);
    }
  }, [isActive, duration, onComplete]);

  // Check for reduced motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (!isVisible) return null;

  // Reduced motion: simple fade
  if (prefersReducedMotion) {
    return (
      <div
        className={className}
        style={{
          ...style,
          position: 'absolute',
          inset: 0,
          background: `rgba(18, 9, 10, ${0.8 * (1 - Math.abs(progress - 0.5) * 2)})`,
          transition: 'background 0.3s ease',
          pointerEvents: 'none',
        }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 100,
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <TransitionScene
          transitionType={transitionType}
          progress={progress}
        />
      </Canvas>
    </div>
  );
}

export default PhaseTransition;
