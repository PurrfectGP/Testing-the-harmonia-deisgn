/**
 * ThoughtStream - Session 18: Consciousness Flow Visualization
 * Particle stream representing the flow of thought during quiz input
 *
 * Features:
 * - Particles spawn with each keystroke
 * - Flow upward from terminal toward neural network
 * - Color shifts based on typing rhythm
 * - Pause creates ripple effects
 * - Represents the "flow of consciousness"
 */

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useQuizReactivity } from '../../hooks/useQuizReactivity';

// Thought particle vertex shader
const particleVertexShader = `
uniform float u_time;
uniform float u_typingSpeed;
uniform float u_submissionPulse;

attribute float a_birthTime;
attribute float a_random;
attribute float a_speed;

varying float v_alpha;
varying float v_age;
varying float v_random;

void main() {
  // Calculate particle age
  float age = u_time - a_birthTime;
  float maxAge = 3.0 + a_random * 2.0;
  float normalizedAge = age / maxAge;
  v_age = normalizedAge;
  v_random = a_random;

  // Kill old particles
  if (normalizedAge > 1.0 || age < 0.0) {
    gl_Position = vec4(0.0, 0.0, -1000.0, 1.0);
    gl_PointSize = 0.0;
    v_alpha = 0.0;
    return;
  }

  vec3 pos = position;

  // Upward flow with spiral motion
  float flowSpeed = a_speed * (0.8 + u_typingSpeed * 0.4);
  float yOffset = age * flowSpeed;
  pos.y += yOffset;

  // Spiral motion
  float spiralRadius = 0.1 + a_random * 0.15;
  float spiralSpeed = 2.0 + a_random * 2.0;
  pos.x += sin(age * spiralSpeed + a_random * 6.28) * spiralRadius * (1.0 - normalizedAge);
  pos.z += cos(age * spiralSpeed + a_random * 6.28) * spiralRadius * 0.5 * (1.0 - normalizedAge);

  // Spread outward as they rise
  float spread = normalizedAge * 0.3;
  pos.x += (a_random - 0.5) * spread;

  // Submission pulse pushes particles outward
  if (u_submissionPulse > 0.1) {
    float pulseForce = u_submissionPulse * 0.3;
    pos.x += (a_random - 0.5) * pulseForce;
    pos.y += pulseForce * 0.5;
  }

  // Fade in and out
  float fadeIn = smoothstep(0.0, 0.1, normalizedAge);
  float fadeOut = 1.0 - smoothstep(0.7, 1.0, normalizedAge);
  v_alpha = fadeIn * fadeOut * (0.6 + u_typingSpeed * 0.3);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Point size - shrinks as particle ages
  float baseSize = 6.0 + a_random * 4.0;
  float ageShrink = 1.0 - normalizedAge * 0.5;
  float typingBoost = 1.0 + u_typingSpeed * 0.3;
  gl_PointSize = baseSize * ageShrink * typingBoost * (150.0 / -mvPosition.z);
}
`;

// Thought particle fragment shader
const particleFragmentShader = `
uniform vec3 u_colorGold;
uniform vec3 u_colorChampagne;
uniform vec3 u_colorMaroon;
uniform float u_typingSpeed;
uniform float u_time;

varying float v_alpha;
varying float v_age;
varying float v_random;

void main() {
  // Circular shape with soft edge
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  if (dist > 0.5) discard;

  float alpha = smoothstep(0.5, 0.1, dist) * v_alpha;

  // Color evolution based on age and typing
  vec3 youngColor = mix(u_colorGold, u_colorChampagne, u_typingSpeed);
  vec3 oldColor = mix(u_colorMaroon, u_colorGold, 0.3);
  vec3 color = mix(youngColor, oldColor, v_age);

  // Inner glow
  float innerGlow = 1.0 - dist * 2.0;
  color += u_colorChampagne * innerGlow * 0.3;

  // Subtle shimmer
  float shimmer = sin(u_time * 10.0 + v_random * 20.0) * 0.5 + 0.5;
  color += u_colorGold * shimmer * 0.05;

  gl_FragColor = vec4(color, alpha);
}
`;

// Maximum particles in the system
const MAX_PARTICLES = 200;

interface ThoughtStreamSceneProps {
  quizState: {
    typingSpeed: number;
    submissionPulse: number;
    isTyping: boolean;
    inputLength: number;
  };
}

function ThoughtStreamScene({ quizState }: ThoughtStreamSceneProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const particleIndexRef = useRef(0);
  const lastSpawnTimeRef = useRef(0);
  const lastInputLengthRef = useRef(0);

  // Particle attributes
  const { positions, birthTimes, randoms, speeds } = useMemo(() => {
    const pos = new Float32Array(MAX_PARTICLES * 3);
    const birth = new Float32Array(MAX_PARTICLES);
    const rand = new Float32Array(MAX_PARTICLES);
    const spd = new Float32Array(MAX_PARTICLES);

    // Initialize all particles as "dead" (birth time in past)
    for (let i = 0; i < MAX_PARTICLES; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = -1; // Start below view
      pos[i * 3 + 2] = 0;
      birth[i] = -100; // Born in the past = dead
      rand[i] = Math.random();
      spd[i] = 0.3 + Math.random() * 0.4;
    }

    return { positions: pos, birthTimes: birth, randoms: rand, speeds: spd };
  }, []);

  // Geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('a_birthTime', new THREE.BufferAttribute(birthTimes, 1));
    geo.setAttribute('a_random', new THREE.BufferAttribute(randoms, 1));
    geo.setAttribute('a_speed', new THREE.BufferAttribute(speeds, 1));
    return geo;
  }, [positions, birthTimes, randoms, speeds]);

  // Uniforms
  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_typingSpeed: { value: 0 },
      u_submissionPulse: { value: 0 },
      u_colorGold: { value: new THREE.Color('#D4A853') },
      u_colorChampagne: { value: new THREE.Color('#F5D98A') },
      u_colorMaroon: { value: new THREE.Color('#722F37') },
    }),
    []
  );

  // Spawn new particles when typing
  const spawnParticle = (time: number, x: number = 0) => {
    const idx = particleIndexRef.current % MAX_PARTICLES;

    // Set position at bottom center with slight x variation
    positions[idx * 3] = x + (Math.random() - 0.5) * 0.3;
    positions[idx * 3 + 1] = -0.8; // Start at bottom
    positions[idx * 3 + 2] = (Math.random() - 0.5) * 0.2;

    // Set birth time to current time
    birthTimes[idx] = time;

    // Update random values for variety
    randoms[idx] = Math.random();
    speeds[idx] = 0.3 + Math.random() * 0.4;

    particleIndexRef.current++;
  };

  // Spawn burst of particles
  const spawnBurst = (time: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 0.2 + Math.random() * 0.2;
      const x = Math.cos(angle) * radius;
      setTimeout(() => spawnParticle(time + i * 0.02, x), i * 10);
    }
  };

  // React to typing activity
  useEffect(() => {
    if (quizState.isTyping && quizState.inputLength > lastInputLengthRef.current) {
      const now = performance.now() / 1000;
      const timeSinceLastSpawn = now - lastSpawnTimeRef.current;

      // Spawn rate increases with typing speed
      const minInterval = 0.05 / (1 + quizState.typingSpeed);

      if (timeSinceLastSpawn > minInterval) {
        const particlesToSpawn = Math.ceil(1 + quizState.typingSpeed);
        for (let i = 0; i < particlesToSpawn; i++) {
          spawnParticle(now, (Math.random() - 0.5) * 0.4);
        }
        lastSpawnTimeRef.current = now;
      }
    }
    lastInputLengthRef.current = quizState.inputLength;
  }, [quizState.inputLength, quizState.isTyping, quizState.typingSpeed]);

  // Submission burst
  useEffect(() => {
    if (quizState.submissionPulse > 0.8) {
      const now = performance.now() / 1000;
      spawnBurst(now, 30);
    }
  }, [quizState.submissionPulse > 0.8]);

  // Animation frame
  useFrame((state) => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = state.clock.elapsedTime;
      material.uniforms.u_typingSpeed.value = quizState.typingSpeed;
      material.uniforms.u_submissionPulse.value = quizState.submissionPulse;

      // Update geometry attributes
      const posAttr = pointsRef.current.geometry.getAttribute('position');
      const birthAttr = pointsRef.current.geometry.getAttribute('a_birthTime');
      const randAttr = pointsRef.current.geometry.getAttribute('a_random');
      const speedAttr = pointsRef.current.geometry.getAttribute('a_speed');

      if (posAttr) (posAttr as THREE.BufferAttribute).needsUpdate = true;
      if (birthAttr) (birthAttr as THREE.BufferAttribute).needsUpdate = true;
      if (randAttr) (randAttr as THREE.BufferAttribute).needsUpdate = true;
      if (speedAttr) (speedAttr as THREE.BufferAttribute).needsUpdate = true;
    }
  });

  // Ambient particle spawning when idle
  useEffect(() => {
    const interval = setInterval(() => {
      if (!quizState.isTyping) {
        const now = performance.now() / 1000;
        if (Math.random() < 0.3) {
          spawnParticle(now, (Math.random() - 0.5) * 0.5);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [quizState.isTyping]);

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface ThoughtStreamProps {
  className?: string;
  style?: React.CSSProperties;
}

export function ThoughtStream({ className = '', style }: ThoughtStreamProps) {
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
          background: 'linear-gradient(to top, rgba(212,168,83,0.05) 0%, transparent 100%)',
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
        camera={{ position: [0, 0, 2], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
      >
        <ThoughtStreamScene quizState={quizState} />
      </Canvas>
    </div>
  );
}

export default ThoughtStream;
