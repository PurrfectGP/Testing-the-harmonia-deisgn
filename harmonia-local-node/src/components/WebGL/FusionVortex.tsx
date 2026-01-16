/**
 * FusionVortex - WebGL convergent energy vortex for Fusion phase
 * Session 8: Fusion Sequence - Convergent Energy Vortex
 *
 * Features:
 * - Particle vortex spiraling toward center
 * - Energy beam convergence from edges
 * - Radial wave pulses expanding outward
 * - Color synthesis from all Harmonia palette colors
 * - GSAP-animated intensity progression
 * - Light burst climax effect
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

// Vortex particle vertex shader
const vortexVertexShader = `
uniform float u_time;
uniform float u_progress;
uniform float u_intensity;
uniform vec2 u_center;

attribute float a_angle;
attribute float a_radius;
attribute float a_speed;
attribute float a_phase;

varying float v_alpha;
varying float v_colorMix;
varying float v_distance;

void main() {
  // Calculate spiral position
  float angle = a_angle + u_time * a_speed * (1.0 + u_progress);

  // Radius shrinks as progress increases (converging to center)
  float convergeFactor = 1.0 - u_progress * 0.8;
  float currentRadius = a_radius * convergeFactor;

  // Add spiral inward motion
  float spiralAngle = angle + u_progress * 3.14159 * 2.0 * a_phase;

  vec3 pos;
  pos.x = cos(spiralAngle) * currentRadius;
  pos.y = sin(spiralAngle) * currentRadius;
  pos.z = sin(u_time * 2.0 + a_phase * 6.28) * 0.1 * (1.0 - u_progress);

  // Pull toward center with progress
  vec2 toCenter = -pos.xy;
  pos.xy += toCenter * u_progress * 0.3;

  // Turbulence
  float turbulence = sin(u_time * 5.0 + a_phase * 10.0) * 0.05 * (1.0 - u_progress * 0.5);
  pos.xy += turbulence;

  // Calculate outputs
  v_distance = length(pos.xy);
  v_alpha = 0.6 + u_progress * 0.4;
  v_alpha *= smoothstep(0.0, 0.3, currentRadius); // Fade at center
  v_colorMix = a_phase + u_time * 0.1;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Point size increases as particles converge
  float baseSize = 4.0 + a_phase * 3.0;
  float convergeBoost = u_progress * 8.0 * (1.0 - v_distance);
  gl_PointSize = (baseSize + convergeBoost) * u_intensity * (200.0 / -mvPosition.z);
}
`;

// Vortex particle fragment shader
const vortexFragmentShader = `
uniform float u_time;
uniform float u_progress;
uniform vec3 u_colorGold;
uniform vec3 u_colorMaroon;
uniform vec3 u_colorChampagne;

varying float v_alpha;
varying float v_colorMix;
varying float v_distance;

void main() {
  // Circular particle
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  if (dist > 0.5) discard;

  // Soft glow
  float alpha = smoothstep(0.5, 0.0, dist) * v_alpha;

  // Color cycling through palette
  float colorPhase = fract(v_colorMix);
  vec3 color;
  if (colorPhase < 0.33) {
    color = mix(u_colorGold, u_colorMaroon, colorPhase * 3.0);
  } else if (colorPhase < 0.66) {
    color = mix(u_colorMaroon, u_colorChampagne, (colorPhase - 0.33) * 3.0);
  } else {
    color = mix(u_colorChampagne, u_colorGold, (colorPhase - 0.66) * 3.0);
  }

  // Brighten as converging
  color = mix(color, vec3(1.0), u_progress * 0.3);

  // Inner glow
  float innerGlow = 1.0 - dist * 2.0;
  color += u_colorChampagne * innerGlow * 0.5;

  gl_FragColor = vec4(color, alpha);
}
`;

// Energy beam vertex shader
const beamVertexShader = `
uniform float u_time;
uniform float u_progress;

attribute float a_position;

varying float v_position;
varying float v_intensity;

void main() {
  v_position = a_position;

  vec3 pos = position;

  // Beam converges toward center with progress
  float convergeFactor = 1.0 - a_position * u_progress * 0.7;
  pos.xy *= convergeFactor;

  // Pulsing width
  float pulse = sin(u_time * 4.0 + a_position * 6.28) * 0.5 + 0.5;
  v_intensity = pulse * u_progress;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

// Energy beam fragment shader
const beamFragmentShader = `
uniform vec3 u_colorGold;
uniform float u_progress;

varying float v_position;
varying float v_intensity;

void main() {
  // Beam color with glow
  vec3 color = u_colorGold;

  // Fade toward center and edges
  float alpha = smoothstep(0.0, 0.2, v_position) * smoothstep(1.0, 0.8, v_position);
  alpha *= v_intensity * 0.5;
  alpha *= u_progress;

  gl_FragColor = vec4(color, alpha);
}
`;

// Central core glow shader
const coreVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const coreFragmentShader = `
uniform float u_time;
uniform float u_progress;
uniform vec3 u_colorGold;
uniform vec3 u_colorChampagne;

varying vec2 vUv;

void main() {
  vec2 center = vUv - 0.5;
  float dist = length(center);

  // Core glow radius expands with progress
  float coreRadius = 0.05 + u_progress * 0.15;

  // Glow falloff
  float glow = smoothstep(coreRadius + 0.2, coreRadius, dist);
  glow *= glow; // Sharper falloff

  // Pulsing
  float pulse = sin(u_time * 6.0) * 0.3 + 0.7;
  glow *= pulse;

  // Color - white hot at center, gold outer
  vec3 color = mix(u_colorGold, vec3(1.0), smoothstep(coreRadius + 0.1, coreRadius, dist));

  // Ring waves
  float wave1 = smoothstep(0.02, 0.0, abs(dist - fract(u_time * 0.5) * 0.5 * u_progress));
  float wave2 = smoothstep(0.02, 0.0, abs(dist - fract(u_time * 0.5 + 0.5) * 0.5 * u_progress));
  color += u_colorChampagne * (wave1 + wave2) * 0.5;

  float alpha = glow * u_progress;

  // Climax flash
  if (u_progress > 0.9) {
    float flash = (u_progress - 0.9) * 10.0;
    alpha += flash * flash * 0.5;
    color = mix(color, vec3(1.0), flash * 0.5);
  }

  gl_FragColor = vec4(color, alpha);
}
`;

interface VortexParticlesProps {
  progress: number;
  intensity: number;
}

function VortexParticles({ progress, intensity }: VortexParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 500;

  const { positions, angles, radii, speeds, phases } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const ang = new Float32Array(particleCount);
    const rad = new Float32Array(particleCount);
    const spd = new Float32Array(particleCount);
    const phs = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.3 + Math.random() * 0.7;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.2;

      ang[i] = angle;
      rad[i] = radius;
      spd[i] = 0.5 + Math.random() * 1.5;
      phs[i] = Math.random();
    }

    return { positions: pos, angles: ang, radii: rad, speeds: spd, phases: phs };
  }, []);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_progress: { value: 0 },
      u_intensity: { value: 1 },
      u_center: { value: new THREE.Vector2(0, 0) },
      u_colorGold: { value: new THREE.Color('#D4A853') },
      u_colorMaroon: { value: new THREE.Color('#722F37') },
      u_colorChampagne: { value: new THREE.Color('#F5D98A') },
    }),
    []
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('a_angle', new THREE.BufferAttribute(angles, 1));
    geo.setAttribute('a_radius', new THREE.BufferAttribute(radii, 1));
    geo.setAttribute('a_speed', new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute('a_phase', new THREE.BufferAttribute(phases, 1));
    return geo;
  }, [positions, angles, radii, speeds, phases]);

  useFrame((state) => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = state.clock.elapsedTime;
      material.uniforms.u_progress.value = progress;
      material.uniforms.u_intensity.value = intensity;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={vortexVertexShader}
        fragmentShader={vortexFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface EnergyBeamsProps {
  progress: number;
}

function EnergyBeams({ progress }: EnergyBeamsProps) {
  const beamCount = 8;

  const beams = useMemo(() => {
    return Array.from({ length: beamCount }, (_, i) => {
      const angle = (i / beamCount) * Math.PI * 2;
      const segments = 20;

      const pos = new Float32Array(segments * 3);
      const posAttr = new Float32Array(segments);

      for (let j = 0; j < segments; j++) {
        const t = j / (segments - 1);
        const r = 0.1 + t * 0.9;

        pos[j * 3] = Math.cos(angle) * r;
        pos[j * 3 + 1] = Math.sin(angle) * r;
        pos[j * 3 + 2] = 0;

        posAttr[j] = t;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('a_position', new THREE.BufferAttribute(posAttr, 1));

      const mat = new THREE.ShaderMaterial({
        vertexShader: beamVertexShader,
        fragmentShader: beamFragmentShader,
        uniforms: {
          u_time: { value: 0 },
          u_progress: { value: 0 },
          u_colorGold: { value: new THREE.Color('#D4A853') },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const line = new THREE.Line(geo, mat);
      return { line, material: mat };
    });
  }, []);

  useFrame((state) => {
    beams.forEach(({ material }) => {
      material.uniforms.u_time.value = state.clock.elapsedTime;
      material.uniforms.u_progress.value = progress;
    });
  });

  return (
    <group>
      {beams.map(({ line }, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  );
}

interface CoreGlowProps {
  progress: number;
}

function CoreGlow({ progress }: CoreGlowProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_progress: { value: 0 },
      u_colorGold: { value: new THREE.Color('#D4A853') },
      u_colorChampagne: { value: new THREE.Color('#F5D98A') },
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = state.clock.elapsedTime;
      material.uniforms.u_progress.value = progress;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0.01]}>
      <planeGeometry args={[3, 3]} />
      <shaderMaterial
        vertexShader={coreVertexShader}
        fragmentShader={coreFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

interface FusionSceneProps {
  progress: number;
  intensity: number;
}

function FusionScene({ progress, intensity }: FusionSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Slow rotation of entire scene
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.1 * (1 + progress * 0.5);
    }
  });

  return (
    <group ref={groupRef}>
      <VortexParticles progress={progress} intensity={intensity} />
      <EnergyBeams progress={progress} />
      <CoreGlow progress={progress} />
    </group>
  );
}

interface FusionVortexProps {
  size?: number;
  className?: string;
  autoProgress?: boolean;
  duration?: number;
  onComplete?: () => void;
}

export function FusionVortex({
  size = 600,
  className = '',
  autoProgress = true,
  duration = 4,
  onComplete,
}: FusionVortexProps) {
  const [progress, setProgress] = useState(0);
  const [intensity, setIntensity] = useState(0.5);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef({ value: 0 });

  // Auto-animate progress
  useEffect(() => {
    if (!autoProgress) return;

    // Fade in intensity
    gsap.to({ value: 0.5 }, {
      value: 1.5,
      duration: duration * 0.3,
      ease: 'power2.out',
      onUpdate: function() {
        setIntensity(this.targets()[0].value);
      },
    });

    // Progress animation
    gsap.to(progressRef.current, {
      value: 1,
      duration: duration,
      ease: 'power2.inOut',
      onUpdate: () => {
        setProgress(progressRef.current.value);
      },
      onComplete: () => {
        // Flash effect at end
        gsap.to({ value: 1.5 }, {
          value: 0,
          duration: 0.5,
          ease: 'power2.out',
          onUpdate: function() {
            setIntensity(this.targets()[0].value);
          },
          onComplete: () => {
            onComplete?.();
          },
        });
      },
    });
  }, [autoProgress, duration, onComplete]);

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
          background: 'radial-gradient(circle, rgba(212,168,83,0.4) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      >
        <div
          style={{
            width: '30%',
            height: '30%',
            background: 'radial-gradient(circle, #F5D98A 0%, #D4A853 100%)',
            borderRadius: '50%',
            boxShadow: '0 0 60px rgba(212,168,83,0.8)',
          }}
        />
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
        <FusionScene progress={progress} intensity={intensity} />
      </Canvas>
    </div>
  );
}

export default FusionVortex;
