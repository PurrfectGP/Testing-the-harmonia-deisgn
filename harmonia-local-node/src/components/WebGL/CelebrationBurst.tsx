/**
 * CelebrationBurst - WebGL celebration particle effect for Results phase
 * Session 9: Results Phase - Celebration Burst
 *
 * Features:
 * - Radial particle explosion burst
 * - Confetti-like particles with rotation
 * - Gravity simulation for natural falling
 * - Color spectrum from Harmonia palette
 * - GSAP-animated burst triggers
 * - Multiple burst waves
 * - Sparkle and shimmer effects
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

// Celebration particle vertex shader
const celebrationVertexShader = `
uniform float u_time;
uniform float u_gravity;
uniform float u_burstProgress;
uniform float u_drag;

attribute vec3 a_velocity;
attribute float a_rotationSpeed;
attribute float a_size;
attribute float a_birthTime;
attribute float a_lifetime;

varying float v_alpha;
varying float v_rotation;
varying float v_colorIndex;
varying float v_age;

void main() {
  // Calculate particle age
  float age = u_time - a_birthTime;
  float normalizedAge = age / a_lifetime;
  v_age = normalizedAge;

  // Only show particles that have been born
  if (u_time < a_birthTime || normalizedAge > 1.0) {
    gl_Position = vec4(0.0, 0.0, -10.0, 1.0);
    gl_PointSize = 0.0;
    return;
  }

  vec3 pos = position;

  // Apply velocity with drag
  float dragFactor = pow(1.0 - u_drag, age * 60.0);
  vec3 velocity = a_velocity * dragFactor;

  // Physics simulation
  pos += velocity * age;
  pos.y -= 0.5 * u_gravity * age * age; // Gravity

  // Add some turbulence
  pos.x += sin(u_time * 5.0 + a_birthTime * 10.0) * 0.02 * (1.0 - normalizedAge);
  pos.z += cos(u_time * 4.0 + a_birthTime * 10.0) * 0.02 * (1.0 - normalizedAge);

  // Rotation
  v_rotation = a_rotationSpeed * age * 10.0;

  // Alpha fade out toward end of lifetime
  v_alpha = 1.0 - smoothstep(0.6, 1.0, normalizedAge);
  v_alpha *= smoothstep(0.0, 0.1, normalizedAge); // Fade in

  // Color based on position for variety
  v_colorIndex = fract(a_birthTime * 5.0);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Size decreases with age
  float sizeScale = 1.0 - normalizedAge * 0.5;
  gl_PointSize = a_size * sizeScale * (200.0 / -mvPosition.z);
}
`;

// Celebration particle fragment shader
const celebrationFragmentShader = `
uniform float u_time;
uniform vec3 u_colorGold;
uniform vec3 u_colorMaroon;
uniform vec3 u_colorChampagne;

varying float v_alpha;
varying float v_rotation;
varying float v_colorIndex;
varying float v_age;

mat2 rotate2D(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c);
}

void main() {
  // Rotated confetti shape
  vec2 center = gl_PointCoord - 0.5;
  center = rotate2D(v_rotation) * center;

  // Rectangle/diamond confetti shape
  float shape = max(abs(center.x), abs(center.y) * 0.6);
  if (shape > 0.4) discard;

  // Soft edge
  float alpha = smoothstep(0.4, 0.2, shape) * v_alpha;

  // Color selection based on colorIndex
  vec3 color;
  if (v_colorIndex < 0.33) {
    color = u_colorGold;
  } else if (v_colorIndex < 0.66) {
    color = u_colorChampagne;
  } else {
    color = u_colorMaroon;
  }

  // Shimmer effect
  float shimmer = sin(u_time * 20.0 + v_colorIndex * 50.0) * 0.3 + 0.7;
  color *= shimmer;

  // Brighten young particles
  color = mix(vec3(1.0), color, smoothstep(0.0, 0.2, v_age));

  gl_FragColor = vec4(color, alpha);
}
`;

// Sparkle vertex shader
const sparkleVertexShader = `
uniform float u_time;
uniform float u_burstProgress;

attribute float a_phase;

varying float v_alpha;
varying float v_sparkle;

void main() {
  vec3 pos = position;

  // Expand outward with progress
  float expansion = u_burstProgress * 2.0;
  pos *= 1.0 + expansion;

  // Oscillate position
  pos.x += sin(u_time * 3.0 + a_phase * 6.28) * 0.1;
  pos.y += cos(u_time * 2.5 + a_phase * 6.28) * 0.1;

  // Sparkle intensity cycles
  v_sparkle = sin(u_time * 15.0 + a_phase * 20.0) * 0.5 + 0.5;
  v_alpha = v_sparkle * u_burstProgress * (1.0 - u_burstProgress * 0.5);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Twinkling size
  float baseSize = 4.0 + a_phase * 4.0;
  gl_PointSize = baseSize * (0.5 + v_sparkle * 0.5) * (200.0 / -mvPosition.z);
}
`;

// Sparkle fragment shader
const sparkleFragmentShader = `
uniform vec3 u_colorGold;
uniform vec3 u_colorChampagne;

varying float v_alpha;
varying float v_sparkle;

void main() {
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  if (dist > 0.5) discard;

  // Star-like sparkle shape
  float star = 1.0 - dist * 2.0;
  star += smoothstep(0.3, 0.0, abs(center.x)) * 0.5;
  star += smoothstep(0.3, 0.0, abs(center.y)) * 0.5;

  vec3 color = mix(u_colorGold, u_colorChampagne, v_sparkle);
  color += vec3(1.0) * star * 0.3;

  float alpha = star * v_alpha;

  gl_FragColor = vec4(color, alpha);
}
`;

interface BurstParticlesProps {
  burstTime: number;
  particleCount: number;
  position: THREE.Vector3;
}

function BurstParticles({ burstTime, particleCount, position }: BurstParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const particleData = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const rotationSpeeds = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const birthTimes = new Float32Array(particleCount);
    const lifetimes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Start at burst center
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      // Random outward velocity (cone shape upward)
      const angle = Math.random() * Math.PI * 2;
      const upAngle = Math.random() * Math.PI * 0.6; // Mostly upward
      const speed = 0.5 + Math.random() * 1.5;

      velocities[i * 3] = Math.sin(upAngle) * Math.cos(angle) * speed;
      velocities[i * 3 + 1] = Math.cos(upAngle) * speed + 0.3; // Upward bias
      velocities[i * 3 + 2] = Math.sin(upAngle) * Math.sin(angle) * speed;

      rotationSpeeds[i] = (Math.random() - 0.5) * 10;
      sizes[i] = 8 + Math.random() * 12;
      birthTimes[i] = burstTime + Math.random() * 0.3; // Staggered birth
      lifetimes[i] = 2 + Math.random() * 2; // 2-4 seconds
    }

    return { positions, velocities, rotationSpeeds, sizes, birthTimes, lifetimes };
  }, [particleCount, position, burstTime]);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_gravity: { value: 0.8 },
      u_burstProgress: { value: 0 },
      u_drag: { value: 0.02 },
      u_colorGold: { value: new THREE.Color('#D4A853') },
      u_colorMaroon: { value: new THREE.Color('#722F37') },
      u_colorChampagne: { value: new THREE.Color('#F5D98A') },
    }),
    []
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(particleData.positions, 3));
    geo.setAttribute('a_velocity', new THREE.BufferAttribute(particleData.velocities, 3));
    geo.setAttribute('a_rotationSpeed', new THREE.BufferAttribute(particleData.rotationSpeeds, 1));
    geo.setAttribute('a_size', new THREE.BufferAttribute(particleData.sizes, 1));
    geo.setAttribute('a_birthTime', new THREE.BufferAttribute(particleData.birthTimes, 1));
    geo.setAttribute('a_lifetime', new THREE.BufferAttribute(particleData.lifetimes, 1));
    return geo;
  }, [particleData]);

  useFrame((state) => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = state.clock.elapsedTime;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={celebrationVertexShader}
        fragmentShader={celebrationFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface SparklesProps {
  burstProgress: number;
}

function Sparkles({ burstProgress }: SparklesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const sparkleCount = 50;

  const { positions, phases } = useMemo(() => {
    const pos = new Float32Array(sparkleCount * 3);
    const phs = new Float32Array(sparkleCount);

    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * Math.PI * 2;
      const radius = 0.3 + Math.random() * 0.5;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius + Math.random() * 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.3;

      phs[i] = Math.random();
    }

    return { positions: pos, phases: phs };
  }, []);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_burstProgress: { value: 0 },
      u_colorGold: { value: new THREE.Color('#D4A853') },
      u_colorChampagne: { value: new THREE.Color('#F5D98A') },
    }),
    []
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('a_phase', new THREE.BufferAttribute(phases, 1));
    return geo;
  }, [positions, phases]);

  useFrame((state) => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = state.clock.elapsedTime;
      material.uniforms.u_burstProgress.value = burstProgress;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={sparkleVertexShader}
        fragmentShader={sparkleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface CelebrationSceneProps {
  bursts: Array<{ time: number; position: THREE.Vector3; count: number }>;
  sparkleProgress: number;
}

function CelebrationScene({ bursts, sparkleProgress }: CelebrationSceneProps) {
  return (
    <group>
      {bursts.map((burst, i) => (
        <BurstParticles
          key={i}
          burstTime={burst.time}
          particleCount={burst.count}
          position={burst.position}
        />
      ))}
      <Sparkles burstProgress={sparkleProgress} />
    </group>
  );
}

interface CelebrationBurstProps {
  size?: number;
  className?: string;
  autoTrigger?: boolean;
  burstCount?: number;
}

export function CelebrationBurst({
  size = 600,
  className = '',
  autoTrigger = true,
  burstCount = 3,
}: CelebrationBurstProps) {
  const [bursts, setBursts] = useState<Array<{ time: number; position: THREE.Vector3; count: number }>>([]);
  const [sparkleProgress, setSparkleProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(0);

  // Trigger bursts automatically
  useEffect(() => {
    if (!autoTrigger) return;

    // Get the start time from Three.js clock (will be synced in scene)
    startTimeRef.current = performance.now() / 1000;

    // Create staggered bursts
    const newBursts: Array<{ time: number; position: THREE.Vector3; count: number }> = [];

    for (let i = 0; i < burstCount; i++) {
      const delay = i * 0.5; // 0.5s between bursts
      const xOffset = (Math.random() - 0.5) * 0.8;
      const yOffset = (Math.random() - 0.5) * 0.4 - 0.2;

      newBursts.push({
        time: startTimeRef.current + delay,
        position: new THREE.Vector3(xOffset, yOffset, 0),
        count: 80 + Math.floor(Math.random() * 40), // 80-120 particles per burst
      });
    }

    setBursts(newBursts);

    // Animate sparkle progress
    gsap.to({ value: 0 }, {
      value: 1,
      duration: 2,
      ease: 'power2.out',
      onUpdate: function() {
        setSparkleProgress(this.targets()[0].value);
      },
    });

    // Fade out sparkles
    gsap.to({ value: 1 }, {
      value: 0,
      duration: 1.5,
      delay: 2.5,
      ease: 'power2.in',
      onUpdate: function() {
        setSparkleProgress(this.targets()[0].value);
      },
    });
  }, [autoTrigger, burstCount]);

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
        ref={containerRef}
        className={className}
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Static confetti representation */}
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              background: ['#D4A853', '#F5D98A', '#722F37'][i % 3],
              transform: `translate(${(Math.random() - 0.5) * size * 0.6}px, ${(Math.random() - 0.5) * size * 0.6}px) rotate(${Math.random() * 45}deg)`,
              opacity: 0.7,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: size,
        height: size,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 2], fov: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <CelebrationScene bursts={bursts} sparkleProgress={sparkleProgress} />
      </Canvas>
    </div>
  );
}

export default CelebrationBurst;
