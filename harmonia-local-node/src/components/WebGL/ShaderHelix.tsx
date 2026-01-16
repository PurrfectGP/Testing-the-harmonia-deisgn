/**
 * ShaderHelix - WebGL shader-based DNA Helix visualization
 * Session 7: DNA Helix Organic Shader Version
 *
 * Features:
 * - Organic flowing helix strands using vertex shader
 * - Procedural glow and pulse effects in fragment shader
 * - Mouse interaction for twist distortion
 * - GSAP-animated breathing and wave effects
 * - Base pair connections with energy pulses
 * - Particle trail effect along strands
 */

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';

// Extend THREE namespace for custom shaders
extend({ ShaderMaterial: THREE.ShaderMaterial });

// Helix strand vertex shader
const helixVertexShader = `
uniform float u_time;
uniform float u_twist;
uniform float u_wave;
uniform vec2 u_mouse;
uniform float u_pulse;

attribute float a_phase;
attribute float a_strand;

varying float v_phase;
varying float v_strand;
varying float v_glow;
varying vec3 v_position;

void main() {
  v_phase = a_phase;
  v_strand = a_strand;

  vec3 pos = position;

  // Organic twist animation
  float twistAngle = u_time * 0.5 + pos.y * 0.5 + u_twist * sin(u_time * 2.0 + pos.y);
  float cosT = cos(twistAngle * 0.2);
  float sinT = sin(twistAngle * 0.2);

  // Apply twist to x-z plane
  float newX = pos.x * cosT - pos.z * sinT;
  float newZ = pos.x * sinT + pos.z * cosT;
  pos.x = newX;
  pos.z = newZ;

  // Wave distortion
  float wave = sin(pos.y * 3.0 + u_time * 2.0) * u_wave * 0.1;
  pos.x += wave;
  pos.z += cos(pos.y * 3.0 + u_time * 2.0) * u_wave * 0.05;

  // Mouse interaction - push/pull effect
  vec2 mouseOffset = u_mouse - 0.5;
  float mouseInfluence = 1.0 - smoothstep(0.0, 0.5, length(mouseOffset));
  pos.x += mouseOffset.x * mouseInfluence * 0.3;
  pos.z += mouseOffset.y * mouseInfluence * 0.3;

  // Breathing effect
  float breath = sin(u_time * 0.8) * 0.5 + 0.5;
  float breathScale = 1.0 + breath * 0.05;
  pos.xy *= breathScale;

  // Calculate glow intensity based on position and pulse
  v_glow = 0.5 + u_pulse * 0.5 + sin(pos.y * 5.0 + u_time * 3.0) * 0.2;
  v_glow *= 1.0 + mouseInfluence * 0.3;

  v_position = pos;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Point size for particle-like rendering
  gl_PointSize = (6.0 + a_phase * 2.0 + u_pulse * 2.0) * (200.0 / -mvPosition.z);
}
`;

// Helix strand fragment shader
const helixFragmentShader = `
uniform float u_time;
uniform vec3 u_colorGold;
uniform vec3 u_colorMaroon;
uniform vec3 u_colorChampagne;
uniform float u_isGlowing;

varying float v_phase;
varying float v_strand;
varying float v_glow;
varying vec3 v_position;

void main() {
  // Circular particle shape
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  if (dist > 0.5) discard;

  // Soft edge
  float alpha = smoothstep(0.5, 0.1, dist);

  // Strand-based color
  vec3 strandColor = v_strand > 0.5 ? u_colorGold : u_colorMaroon;

  // Add shimmer based on phase
  float shimmer = sin(u_time * 4.0 + v_phase * 20.0) * 0.5 + 0.5;
  strandColor = mix(strandColor, u_colorChampagne, shimmer * 0.3);

  // Glow effect when active
  vec3 glowColor = u_colorGold;
  float glowIntensity = v_glow * u_isGlowing;
  strandColor = mix(strandColor, glowColor, glowIntensity * 0.5);

  // Inner core glow
  float innerGlow = 1.0 - dist * 2.0;
  strandColor += u_colorChampagne * innerGlow * 0.4 * (1.0 + glowIntensity);

  // Vertical gradient
  float yGrad = (v_position.y + 2.0) / 4.0;
  strandColor *= 0.8 + yGrad * 0.4;

  // Final alpha
  alpha *= 0.8 + glowIntensity * 0.2;

  gl_FragColor = vec4(strandColor, alpha);
}
`;

// Base pair connector vertex shader
const connectorVertexShader = `
uniform float u_time;
uniform float u_pulse;

attribute float a_progress;

varying float v_progress;
varying float v_energy;

void main() {
  v_progress = a_progress;

  vec3 pos = position;

  // Energy pulse traveling along connector
  float pulsePos = fract(u_time * 0.5);
  float pulseDist = abs(a_progress - pulsePos);
  v_energy = smoothstep(0.15, 0.0, pulseDist) * u_pulse;

  // Slight vertical oscillation
  pos.y += sin(u_time * 3.0 + a_progress * 6.28) * 0.02;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

// Base pair connector fragment shader
const connectorFragmentShader = `
uniform vec3 u_colorGold;
uniform vec3 u_colorDark;

varying float v_progress;
varying float v_energy;

void main() {
  // Base line color
  vec3 baseColor = u_colorDark * 1.5;

  // Energy pulse color
  vec3 energyColor = u_colorGold;

  // Combine
  vec3 color = mix(baseColor, energyColor, v_energy);

  // Alpha with energy boost
  float alpha = 0.3 + v_energy * 0.7;

  gl_FragColor = vec4(color, alpha);
}
`;

interface HelixStrandsProps {
  isGlowing: boolean;
  mouse: { x: number; y: number };
  pulse: number;
}

function HelixStrands({ isGlowing, mouse, pulse }: HelixStrandsProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate helix points
  const { positions, phases, strands } = useMemo(() => {
    const turns = 4;
    const pointsPerTurn = 24;
    const totalPoints = turns * pointsPerTurn * 2; // Two strands
    const radius = 0.5;
    const height = 4;

    const pos = new Float32Array(totalPoints * 3);
    const phase = new Float32Array(totalPoints);
    const strand = new Float32Array(totalPoints);

    let idx = 0;

    // Generate both strands
    for (let s = 0; s < 2; s++) {
      const phaseOffset = s * Math.PI; // 180 degree offset for second strand

      for (let i = 0; i < turns * pointsPerTurn; i++) {
        const t = i / (turns * pointsPerTurn);
        const angle = t * turns * Math.PI * 2 + phaseOffset;
        const y = (t - 0.5) * height;

        pos[idx * 3] = Math.cos(angle) * radius;
        pos[idx * 3 + 1] = y;
        pos[idx * 3 + 2] = Math.sin(angle) * radius;

        phase[idx] = t;
        strand[idx] = s;

        idx++;
      }
    }

    return { positions: pos, phases: phase, strands: strand };
  }, []);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_twist: { value: 0.5 },
      u_wave: { value: 0.5 },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_pulse: { value: 0 },
      u_colorGold: { value: new THREE.Color('#D4A853') },
      u_colorMaroon: { value: new THREE.Color('#722F37') },
      u_colorChampagne: { value: new THREE.Color('#F5D98A') },
      u_isGlowing: { value: 0 },
    }),
    []
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('a_phase', new THREE.BufferAttribute(phases, 1));
    geo.setAttribute('a_strand', new THREE.BufferAttribute(strands, 1));
    return geo;
  }, [positions, phases, strands]);

  useFrame((state) => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = state.clock.elapsedTime;

      // Smooth mouse interpolation
      const targetMouse = new THREE.Vector2(mouse.x, mouse.y);
      material.uniforms.u_mouse.value.lerp(targetMouse, 0.05);

      // Smooth pulse and glow
      material.uniforms.u_pulse.value += (pulse - material.uniforms.u_pulse.value) * 0.1;
      material.uniforms.u_isGlowing.value += ((isGlowing ? 1 : 0) - material.uniforms.u_isGlowing.value) * 0.1;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={helixVertexShader}
        fragmentShader={helixFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface BasePairConnectorsProps {
  isGlowing: boolean;
  pulse: number;
}

function BasePairConnectors({ isGlowing, pulse }: BasePairConnectorsProps) {
  const connectorsData = useMemo(() => {
    const turns = 4;
    const connectorsPerTurn = 4;
    const total = turns * connectorsPerTurn;
    const radius = 0.5;
    const height = 4;

    const connectors: Array<{ line: THREE.Line; material: THREE.ShaderMaterial }> = [];

    for (let i = 0; i < total; i++) {
      const t = i / total;
      const angle = t * turns * Math.PI * 2;
      const y = (t - 0.5) * height;

      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      // Create line geometry with progress attribute
      const segments = 10;
      const pos = new Float32Array(segments * 3);
      const progress = new Float32Array(segments);

      for (let j = 0; j < segments; j++) {
        const pt = j / (segments - 1);
        pos[j * 3] = x1 + (x2 - x1) * pt;
        pos[j * 3 + 1] = y;
        pos[j * 3 + 2] = z1 + (z2 - z1) * pt;
        progress[j] = pt;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('a_progress', new THREE.BufferAttribute(progress, 1));

      const mat = new THREE.ShaderMaterial({
        vertexShader: connectorVertexShader,
        fragmentShader: connectorFragmentShader,
        uniforms: {
          u_time: { value: 0 },
          u_pulse: { value: 0 },
          u_colorGold: { value: new THREE.Color('#D4A853') },
          u_colorDark: { value: new THREE.Color('#12090A') },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const line = new THREE.Line(geo, mat);
      connectors.push({ line, material: mat });
    }

    return connectors;
  }, []);

  useFrame((state) => {
    connectorsData.forEach(({ material }) => {
      material.uniforms.u_time.value = state.clock.elapsedTime;
      material.uniforms.u_pulse.value += ((isGlowing ? 1 : 0.3) * pulse - material.uniforms.u_pulse.value) * 0.1;
    });
  });

  return (
    <group>
      {connectorsData.map(({ line }, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  );
}

// Ambient particle effect
function AmbientParticles({ isGlowing }: { isGlowing: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { geometry, material } = useMemo(() => {
    const count = 100;
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.3 + Math.random() * 0.5;
      const y = (Math.random() - 0.5) * 5;

      pos[i * 3] = Math.cos(angle) * r + (Math.random() - 0.5) * 0.2;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * r + (Math.random() - 0.5) * 0.2;
      sizes[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      color: '#F5D98A',
      size: 0.03,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    return { geometry: geo, material: mat };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      (pointsRef.current.material as THREE.PointsMaterial).opacity = isGlowing ? 0.7 : 0.3;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

interface HelixSceneProps {
  isGlowing: boolean;
  mouse: { x: number; y: number };
}

function HelixScene({ isGlowing, mouse }: HelixSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [pulse, setPulse] = useState(0.5);

  // Animate pulse
  useEffect(() => {
    const animate = () => {
      setPulse((Math.sin(Date.now() * 0.002) + 1) / 2);
    };
    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate the helix
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <HelixStrands isGlowing={isGlowing} mouse={mouse} pulse={pulse} />
      <BasePairConnectors isGlowing={isGlowing} pulse={pulse} />
      {isGlowing && <AmbientParticles isGlowing={isGlowing} />}
    </group>
  );
}

interface ShaderHelixProps {
  size?: number;
  className?: string;
  isGlowing?: boolean;
}

export function ShaderHelix({ size = 400, className = '', isGlowing = false }: ShaderHelixProps) {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Track mouse position
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMouse({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    }
  }, []);

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
        }}
      >
        <svg viewBox="0 0 100 200" style={{ width: '50%', height: '80%', opacity: 0.6 }}>
          <path
            d="M30 20 Q70 50 30 80 Q70 110 30 140 Q70 170 30 200"
            stroke="#D4A853"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M70 20 Q30 50 70 80 Q30 110 70 140 Q30 170 70 200"
            stroke="#722F37"
            strokeWidth="3"
            fill="none"
            opacity="0.7"
          />
          {[50, 80, 110, 140, 170].map((y, i) => (
            <line key={i} x1="35" y1={y} x2="65" y2={y} stroke="#D4A853" strokeWidth="1" opacity="0.4" />
          ))}
        </svg>
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
      onMouseMove={handleMouseMove}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <HelixScene isGlowing={isGlowing} mouse={mouse} />
      </Canvas>
    </div>
  );
}

export default ShaderHelix;
