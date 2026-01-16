/**
 * QuantumOrbit - Session 17: WebGL Particle Ring System
 * Replaces SVG OrbitVisualization with WebGL particles
 *
 * Features:
 * - 3 concentric particle rings rotating at different speeds
 * - Particles glow brighter with typing activity
 * - Ring rotation speed tied to typing speed
 * - Question transition: rings pulse and reform
 * - Shader-based glow with additive blending
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useQuizReactivity } from '../../hooks/useQuizReactivity';

// Particle ring vertex shader
const ringVertexShader = `
uniform float u_time;
uniform float u_rotationSpeed;
uniform float u_typingSpeed;
uniform float u_submissionPulse;
uniform float u_radius;
uniform float u_ringIndex;

attribute float a_angle;
attribute float a_random;
attribute float a_size;

varying float v_alpha;
varying float v_random;
varying float v_glow;

void main() {
  v_random = a_random;

  // Calculate rotation with typing speed influence
  float baseSpeed = 0.3 + u_ringIndex * 0.15;
  float speed = baseSpeed * (1.0 + u_typingSpeed * 0.5);
  float direction = mod(u_ringIndex, 2.0) == 0.0 ? 1.0 : -1.0;
  float rotation = u_time * speed * direction;

  // Current angle with rotation
  float angle = a_angle + rotation;

  // Radius with breathing effect
  float breathe = sin(u_time * 1.5 + a_random * 6.28) * 0.02;
  float pulseExpand = u_submissionPulse * 0.1;
  float r = u_radius + breathe + pulseExpand;

  // Position on ring
  vec3 pos;
  pos.x = cos(angle) * r;
  pos.y = sin(angle) * r;
  pos.z = sin(u_time * 0.5 + a_angle * 2.0) * 0.05; // Subtle z-wave

  // Calculate alpha and glow
  float baseAlpha = 0.6 + a_random * 0.2;
  float typingBoost = u_typingSpeed * 0.3;
  float pulseBoost = u_submissionPulse * 0.4;
  v_alpha = baseAlpha + typingBoost + pulseBoost;

  v_glow = u_typingSpeed * 0.5 + u_submissionPulse;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Point size with activity boost
  float baseSize = a_size * (1.0 + u_typingSpeed * 0.3);
  float pulseSize = u_submissionPulse * 3.0;
  gl_PointSize = (baseSize + pulseSize) * (200.0 / -mvPosition.z);
}
`;

// Particle ring fragment shader
const ringFragmentShader = `
uniform vec3 u_colorGold;
uniform vec3 u_colorChampagne;
uniform float u_typingSpeed;
uniform float u_submissionPulse;
uniform float u_time;

varying float v_alpha;
varying float v_random;
varying float v_glow;

void main() {
  // Circular particle shape
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  if (dist > 0.5) discard;

  // Soft glow
  float alpha = smoothstep(0.5, 0.0, dist) * v_alpha;

  // Color with activity-based shift
  vec3 color = mix(u_colorGold, u_colorChampagne, v_glow + v_random * 0.3);

  // Inner core glow
  float innerGlow = 1.0 - dist * 2.0;
  color += u_colorChampagne * innerGlow * 0.4 * (1.0 + v_glow);

  // Shimmer effect
  float shimmer = sin(u_time * 8.0 + v_random * 20.0) * 0.5 + 0.5;
  color += u_colorGold * shimmer * 0.1 * u_typingSpeed;

  gl_FragColor = vec4(color, alpha);
}
`;

// Ring trail vertex shader (connecting particles)
const trailVertexShader = `
uniform float u_time;
uniform float u_rotationSpeed;
uniform float u_typingSpeed;
uniform float u_radius;
uniform float u_ringIndex;

attribute float a_angle;

varying float v_alpha;

void main() {
  float baseSpeed = 0.3 + u_ringIndex * 0.15;
  float speed = baseSpeed * (1.0 + u_typingSpeed * 0.5);
  float direction = mod(u_ringIndex, 2.0) == 0.0 ? 1.0 : -1.0;
  float rotation = u_time * speed * direction;

  float angle = a_angle + rotation;

  vec3 pos;
  pos.x = cos(angle) * u_radius;
  pos.y = sin(angle) * u_radius;
  pos.z = 0.0;

  v_alpha = 0.15 + u_typingSpeed * 0.1;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

// Ring trail fragment shader
const trailFragmentShader = `
uniform vec3 u_colorGold;

varying float v_alpha;

void main() {
  gl_FragColor = vec4(u_colorGold, v_alpha);
}
`;

interface ParticleRingProps {
  radius: number;
  particleCount: number;
  ringIndex: number;
  quizState: {
    typingSpeed: number;
    submissionPulse: number;
    activityLevel: number;
  };
}

function ParticleRing({ radius, particleCount, ringIndex, quizState }: ParticleRingProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const trailRef = useRef<THREE.LineLoop>(null);

  // Generate particle attributes
  const { angles, randoms, sizes } = useMemo(() => {
    const ang = new Float32Array(particleCount);
    const rand = new Float32Array(particleCount);
    const sz = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      ang[i] = (i / particleCount) * Math.PI * 2;
      rand[i] = Math.random();
      sz[i] = 4 + Math.random() * 4;
    }

    return { angles: ang, randoms: rand, sizes: sz };
  }, [particleCount]);

  // Particle geometry
  const particleGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = angles[i];
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = 0;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('a_angle', new THREE.BufferAttribute(angles, 1));
    geo.setAttribute('a_random', new THREE.BufferAttribute(randoms, 1));
    geo.setAttribute('a_size', new THREE.BufferAttribute(sizes, 1));

    return geo;
  }, [particleCount, angles, randoms, sizes, radius]);

  // Trail geometry (circle)
  const trailGeometry = useMemo(() => {
    const segments = 64;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(segments * 3);
    const trailAngles = new Float32Array(segments);

    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = 0;
      trailAngles[i] = angle;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('a_angle', new THREE.BufferAttribute(trailAngles, 1));

    return geo;
  }, [radius]);

  // Particle uniforms
  const particleUniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_rotationSpeed: { value: 1 },
      u_typingSpeed: { value: 0 },
      u_submissionPulse: { value: 0 },
      u_radius: { value: radius },
      u_ringIndex: { value: ringIndex },
      u_colorGold: { value: new THREE.Color('#D4A853') },
      u_colorChampagne: { value: new THREE.Color('#F5D98A') },
    }),
    [radius, ringIndex]
  );

  // Trail uniforms
  const trailUniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_rotationSpeed: { value: 1 },
      u_typingSpeed: { value: 0 },
      u_radius: { value: radius },
      u_ringIndex: { value: ringIndex },
      u_colorGold: { value: new THREE.Color('#D4A853') },
    }),
    [radius, ringIndex]
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = time;
      material.uniforms.u_typingSpeed.value = quizState.typingSpeed;
      material.uniforms.u_submissionPulse.value = quizState.submissionPulse;
    }

    if (trailRef.current) {
      const material = trailRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = time;
      material.uniforms.u_typingSpeed.value = quizState.typingSpeed;
    }
  });

  return (
    <group>
      {/* Trail ring */}
      <lineLoop ref={trailRef} geometry={trailGeometry}>
        <shaderMaterial
          vertexShader={trailVertexShader}
          fragmentShader={trailFragmentShader}
          uniforms={trailUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineLoop>

      {/* Particles */}
      <points ref={pointsRef} geometry={particleGeometry}>
        <shaderMaterial
          vertexShader={ringVertexShader}
          fragmentShader={ringFragmentShader}
          uniforms={particleUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

interface QuantumOrbitSceneProps {
  quizState: {
    typingSpeed: number;
    submissionPulse: number;
    activityLevel: number;
    questionIndex: number;
  };
}

function QuantumOrbitScene({ quizState }: QuantumOrbitSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [pulseScale, setPulseScale] = useState(1);

  // Question change pulse effect
  useEffect(() => {
    if (quizState.submissionPulse > 0.5) {
      setPulseScale(1.1);
      const timeout = setTimeout(() => setPulseScale(1), 300);
      return () => clearTimeout(timeout);
    }
  }, [quizState.submissionPulse > 0.5]);

  useFrame(() => {
    if (groupRef.current) {
      // Smooth scale transition
      groupRef.current.scale.lerp(
        new THREE.Vector3(pulseScale, pulseScale, 1),
        0.1
      );
    }
  });

  // Ring configurations
  const rings = [
    { radius: 0.3, particleCount: 12 },
    { radius: 0.5, particleCount: 18 },
    { radius: 0.7, particleCount: 24 },
  ];

  return (
    <group ref={groupRef}>
      {rings.map((ring, index) => (
        <ParticleRing
          key={index}
          radius={ring.radius}
          particleCount={ring.particleCount}
          ringIndex={index}
          quizState={quizState}
        />
      ))}

      {/* Center glow */}
      <mesh>
        <circleGeometry args={[0.08, 32]} />
        <meshBasicMaterial
          color="#D4A853"
          transparent
          opacity={0.3 + quizState.typingSpeed * 0.2}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

interface QuantumOrbitProps {
  className?: string;
  style?: React.CSSProperties;
}

export function QuantumOrbit({ className = '', style }: QuantumOrbitProps) {
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

  // Reduced motion fallback
  if (prefersReducedMotion) {
    return (
      <div
        className={className}
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', opacity: 0.4 }}>
          <circle cx="50" cy="50" r="15" fill="none" stroke="#D4A853" strokeWidth="0.5" strokeDasharray="2,2" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="#D4A853" strokeWidth="0.5" strokeDasharray="3,3" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="#D4A853" strokeWidth="0.5" strokeDasharray="4,4" />
          <circle cx="50" cy="50" r="4" fill="#D4A853" opacity="0.5" />
        </svg>
      </div>
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
        dpr={[1, 2]}
      >
        <QuantumOrbitScene quizState={quizState} />
      </Canvas>
    </div>
  );
}

export default QuantumOrbit;
