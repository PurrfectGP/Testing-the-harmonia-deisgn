/**
 * PulseField - Session 19: Ambient Reactive Background Field
 * Subtle grid of glowing points that pulse with activity
 *
 * Features:
 * - Grid of ambient glowing points
 * - Waves emanate from center on keystrokes
 * - Intensity increases with quiz progress (1/3 → 2/3 → 3/3)
 * - Breathing animation in idle state
 * - Uses instanced rendering for performance
 */

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useQuizReactivity } from '../../hooks/useQuizReactivity';

// Instanced pulse vertex shader
const pulseVertexShader = `
uniform float u_time;
uniform float u_typingSpeed;
uniform float u_submissionPulse;
uniform float u_questionProgress;
uniform vec2 u_waveOrigin;
uniform float u_waveTime;

attribute vec3 a_offset;
attribute float a_random;

varying float v_alpha;
varying float v_pulse;
varying float v_distance;

void main() {
  vec3 pos = position + a_offset;

  // Calculate distance from center for wave effects
  float distFromCenter = length(a_offset.xy);
  v_distance = distFromCenter;

  // Wave propagation from typing
  float waveRadius = (u_time - u_waveTime) * 2.0;
  float waveDist = abs(distFromCenter - waveRadius);
  float wave = smoothstep(0.3, 0.0, waveDist) * smoothstep(0.0, 0.5, waveRadius) * (1.0 - smoothstep(2.0, 3.0, waveRadius));

  // Submission burst wave
  float burstWave = u_submissionPulse * smoothstep(2.0, 0.0, distFromCenter);

  // Breathing effect
  float breathe = sin(u_time * 0.8 + distFromCenter * 0.5 + a_random * 3.14) * 0.5 + 0.5;

  // Combined pulse intensity
  v_pulse = wave + burstWave + breathe * 0.3 + u_typingSpeed * 0.2;

  // Base alpha with progression boost
  float progressBoost = u_questionProgress * 0.3;
  v_alpha = 0.15 + progressBoost + v_pulse * 0.4;

  // Subtle z-displacement based on pulse
  pos.z += v_pulse * 0.1;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Point size with pulse effect
  float baseSize = 2.0 + a_random * 1.0;
  float pulseSize = v_pulse * 3.0;
  gl_PointSize = (baseSize + pulseSize) * (100.0 / -mvPosition.z);
}
`;

// Instanced pulse fragment shader
const pulseFragmentShader = `
uniform vec3 u_colorGold;
uniform vec3 u_colorMaroon;
uniform float u_typingSpeed;
uniform float u_questionProgress;

varying float v_alpha;
varying float v_pulse;
varying float v_distance;

void main() {
  // Circular point with soft edges
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  if (dist > 0.5) discard;

  float alpha = smoothstep(0.5, 0.0, dist) * v_alpha;

  // Color based on distance and pulse
  vec3 innerColor = u_colorGold;
  vec3 outerColor = mix(u_colorMaroon, u_colorGold, 0.3);
  float colorMix = smoothstep(0.0, 2.0, v_distance);
  vec3 color = mix(innerColor, outerColor, colorMix);

  // Brighten on pulse
  color = mix(color, u_colorGold, v_pulse * 0.5);

  // Progress-based intensity
  color *= 0.7 + u_questionProgress * 0.3;

  gl_FragColor = vec4(color, alpha);
}
`;

interface PulseFieldSceneProps {
  quizState: {
    typingSpeed: number;
    submissionPulse: number;
    questionIndex: number;
    isTyping: boolean;
  };
}

function PulseFieldScene({ quizState }: PulseFieldSceneProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const waveTimeRef = useRef(0);
  const lastTypingRef = useRef(false);

  // Grid configuration
  const gridSize = 15;
  const spacing = 0.25;
  const particleCount = gridSize * gridSize;

  // Generate grid positions
  const { offsets, randoms } = useMemo(() => {
    const offs = new Float32Array(particleCount * 3);
    const rand = new Float32Array(particleCount);

    let idx = 0;
    const halfSize = ((gridSize - 1) * spacing) / 2;

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        offs[idx * 3] = x * spacing - halfSize;
        offs[idx * 3 + 1] = y * spacing - halfSize;
        offs[idx * 3 + 2] = 0;
        rand[idx] = Math.random();
        idx++;
      }
    }

    return { offsets: offs, randoms: rand };
  }, [gridSize, spacing, particleCount]);

  // Points geometry - using regular points for simplicity
  const pointsGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(offsets, 3));
    geo.setAttribute('a_offset', new THREE.BufferAttribute(offsets, 3));
    geo.setAttribute('a_random', new THREE.BufferAttribute(randoms, 1));
    return geo;
  }, [offsets, randoms]);

  // Uniforms
  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_typingSpeed: { value: 0 },
      u_submissionPulse: { value: 0 },
      u_questionProgress: { value: 0 },
      u_waveOrigin: { value: new THREE.Vector2(0, 0) },
      u_waveTime: { value: -10 },
      u_colorGold: { value: new THREE.Color('#D4A853') },
      u_colorMaroon: { value: new THREE.Color('#722F37') },
    }),
    []
  );

  // Trigger wave on typing start
  useEffect(() => {
    if (quizState.isTyping && !lastTypingRef.current) {
      waveTimeRef.current = performance.now() / 1000;
    }
    lastTypingRef.current = quizState.isTyping;
  }, [quizState.isTyping]);

  // Animation loop
  useFrame((state) => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = state.clock.elapsedTime;
      material.uniforms.u_typingSpeed.value = quizState.typingSpeed;
      material.uniforms.u_submissionPulse.value = quizState.submissionPulse;
      material.uniforms.u_questionProgress.value = (quizState.questionIndex + 1) / 3;
      material.uniforms.u_waveTime.value = waveTimeRef.current;
    }
  });

  // Trigger waves periodically when typing
  useEffect(() => {
    if (quizState.isTyping) {
      const interval = setInterval(() => {
        waveTimeRef.current = performance.now() / 1000;
      }, 300 + Math.random() * 200);

      return () => clearInterval(interval);
    }
  }, [quizState.isTyping]);

  return (
    <points ref={pointsRef} geometry={pointsGeometry}>
      <shaderMaterial
        vertexShader={pulseVertexShader}
        fragmentShader={pulseFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface PulseFieldProps {
  className?: string;
  style?: React.CSSProperties;
}

export function PulseField({ className = '', style }: PulseFieldProps) {
  const quizState = useQuizReactivity();

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (prefersReducedMotion) {
    return (
      <div
        className={className}
        style={{
          ...style,
          background: 'radial-gradient(circle, rgba(212,168,83,0.05) 0%, transparent 70%)',
        }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
      >
        <PulseFieldScene quizState={quizState} />
      </Canvas>
    </div>
  );
}

export default PulseField;
