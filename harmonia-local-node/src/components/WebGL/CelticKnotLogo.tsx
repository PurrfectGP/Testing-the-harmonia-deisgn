/**
 * CelticKnotLogo - WebGL particle-based logo visualization
 * Session 4: Celtic Knot Logo Integration
 *
 * Features:
 * - Particles flowing along Celtic Knot SVG paths
 * - Pulse animation synchronized with organic background
 * - Mouse proximity scatter and reform effect
 * - PNG fallback for reduced motion
 */

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

// Generate all particle positions along paths
function generateParticlePositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);

  // Distribute particles across different path elements
  const outerCount = Math.floor(count * 0.3);
  const triquetraCount = Math.floor(count * 0.4);
  const innerCount = Math.floor(count * 0.15);
  const centerCount = count - outerCount - triquetraCount - innerCount;

  let idx = 0;

  // Outer circle particles
  for (let i = 0; i < outerCount; i++) {
    const angle = (i / outerCount) * Math.PI * 2 + Math.random() * 0.1;
    const r = 0.85 + Math.random() * 0.1;
    positions[idx * 3] = Math.cos(angle) * r;
    positions[idx * 3 + 1] = Math.sin(angle) * r;
    positions[idx * 3 + 2] = (Math.random() - 0.5) * 0.1;
    idx++;
  }

  // Triquetra particles - three lobes
  for (let i = 0; i < triquetraCount; i++) {
    const lobe = i % 3;
    const t = (i / triquetraCount) * 3;
    const lobeAngle = (lobe / 3) * Math.PI * 2 - Math.PI / 2;

    // Create lobe shape
    const lobeT = (t % 1) * Math.PI * 2;
    const lobeR = 0.35 + Math.sin(lobeT) * 0.15;
    const baseX = Math.cos(lobeAngle) * 0.4;
    const baseY = Math.sin(lobeAngle) * 0.4;

    positions[idx * 3] = baseX + Math.cos(lobeT + lobeAngle) * lobeR * 0.5 + (Math.random() - 0.5) * 0.05;
    positions[idx * 3 + 1] = baseY + Math.sin(lobeT + lobeAngle) * lobeR * 0.5 + (Math.random() - 0.5) * 0.05;
    positions[idx * 3 + 2] = (Math.random() - 0.5) * 0.1;
    idx++;
  }

  // Inner detail circle
  for (let i = 0; i < innerCount; i++) {
    const angle = (i / innerCount) * Math.PI * 2;
    const r = 0.3 + Math.random() * 0.08;
    positions[idx * 3] = Math.cos(angle) * r;
    positions[idx * 3 + 1] = Math.sin(angle) * r;
    positions[idx * 3 + 2] = (Math.random() - 0.5) * 0.05;
    idx++;
  }

  // Center particles
  for (let i = 0; i < centerCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.12;
    positions[idx * 3] = Math.cos(angle) * r;
    positions[idx * 3 + 1] = Math.sin(angle) * r;
    positions[idx * 3 + 2] = (Math.random() - 0.5) * 0.05;
    idx++;
  }

  return positions;
}

// Vertex shader for particle system
const particleVertexShader = `
uniform float u_time;
uniform float u_pulse;
uniform vec2 u_mouse;
uniform float u_mouseInfluence;
uniform float u_scatter;

attribute float a_random;
attribute vec3 a_originalPosition;

varying float v_alpha;
varying float v_distance;

void main() {
  vec3 pos = a_originalPosition;

  // Flow animation - particles move along their radius
  float flowSpeed = 0.3;
  float flowOffset = a_random * 6.28318;
  float flow = sin(u_time * flowSpeed + flowOffset) * 0.02;

  // Apply flow in radial direction
  float radius = length(pos.xy);
  vec2 radialDir = radius > 0.01 ? normalize(pos.xy) : vec2(1.0, 0.0);
  pos.xy += radialDir * flow;

  // Pulse effect - expand/contract
  float pulseAmount = u_pulse * 0.05;
  pos.xy *= 1.0 + pulseAmount * (0.5 + a_random * 0.5);

  // Mouse interaction - scatter effect
  vec2 mousePos = u_mouse * 2.0 - 1.0;
  float mouseDist = distance(pos.xy, mousePos);
  float mouseEffect = smoothstep(0.4, 0.0, mouseDist) * u_mouseInfluence;

  // Push particles away from mouse
  vec2 pushDir = pos.xy - mousePos;
  if (length(pushDir) > 0.001) {
    pushDir = normalize(pushDir);
  }
  pos.xy += pushDir * mouseEffect * 0.3 * u_scatter;

  // Scatter randomization
  pos.xy += vec2(
    sin(u_time * 2.0 + a_random * 10.0),
    cos(u_time * 2.0 + a_random * 10.0)
  ) * mouseEffect * 0.1 * u_scatter;

  // Z-axis wobble
  pos.z += sin(u_time * 1.5 + a_random * 6.28) * 0.02;

  // Calculate alpha based on distance from center and mouse
  v_alpha = 0.6 + a_random * 0.4;
  v_alpha *= 1.0 - mouseEffect * 0.5;
  v_distance = radius;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Point size with distance attenuation
  float size = 3.0 + a_random * 2.0;
  size *= 1.0 + u_pulse * 0.3;
  gl_PointSize = size * (300.0 / -mvPosition.z);
}
`;

// Fragment shader for particles
const particleFragmentShader = `
uniform vec3 u_colorGold;
uniform vec3 u_colorChampagne;
uniform float u_time;

varying float v_alpha;
varying float v_distance;

void main() {
  // Circular particle shape
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  if (dist > 0.5) discard;

  // Soft edge
  float alpha = smoothstep(0.5, 0.2, dist) * v_alpha;

  // Color gradient based on distance from center
  vec3 color = mix(u_colorGold, u_colorChampagne, v_distance);

  // Add shimmer
  float shimmer = sin(u_time * 3.0 + v_distance * 10.0) * 0.1 + 0.9;
  color *= shimmer;

  // Glow effect
  float glow = 1.0 - dist * 2.0;
  color += u_colorGold * glow * 0.3;

  gl_FragColor = vec4(color, alpha);
}
`;

interface KnotParticlesProps {
  mouse: { x: number; y: number };
  isHovered: boolean;
}

function KnotParticles({ mouse, isHovered }: KnotParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 400;

  // Generate particle data
  const { positions, randoms, originalPositions } = useMemo(() => {
    const pos = generateParticlePositions(particleCount);
    const rand = new Float32Array(particleCount);
    const origPos = new Float32Array(pos.length);

    for (let i = 0; i < particleCount; i++) {
      rand[i] = Math.random();
      origPos[i * 3] = pos[i * 3];
      origPos[i * 3 + 1] = pos[i * 3 + 1];
      origPos[i * 3 + 2] = pos[i * 3 + 2];
    }

    return { positions: pos, randoms: rand, originalPositions: origPos };
  }, []);

  // Animated values for GSAP
  const animatedValues = useRef({
    scatter: 0,
    pulse: 0,
  });

  // Scatter effect when hovered
  useEffect(() => {
    gsap.to(animatedValues.current, {
      scatter: isHovered ? 1 : 0,
      duration: 0.5,
      ease: 'power2.out',
    });
  }, [isHovered]);

  // Uniforms
  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_pulse: { value: 0 },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_mouseInfluence: { value: 0.6 },
      u_scatter: { value: 0 },
      u_colorGold: { value: new THREE.Color('#D4A853') },
      u_colorChampagne: { value: new THREE.Color('#F5D98A') },
    }),
    []
  );

  // Animation loop
  useFrame((state) => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = state.clock.elapsedTime;

      // Pulse animation
      material.uniforms.u_pulse.value = Math.sin(state.clock.elapsedTime * 0.8) * 0.5 + 0.5;

      // Smooth mouse lerp
      const targetMouse = new THREE.Vector2(mouse.x, 1 - mouse.y);
      material.uniforms.u_mouse.value.lerp(targetMouse, 0.1);

      // Update scatter from animated values
      material.uniforms.u_scatter.value = animatedValues.current.scatter;

      // Gentle rotation
      pointsRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  // Create geometry with attributes
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('a_random', new THREE.BufferAttribute(randoms, 1));
    geo.setAttribute('a_originalPosition', new THREE.BufferAttribute(originalPositions, 3));
    return geo;
  }, [positions, randoms, originalPositions]);

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

// Glow ring component
function GlowRings() {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={ringsRef}>
      {[0.9, 0.7, 0.5, 0.3].map((radius, i) => (
        <mesh key={i} rotation={[0, 0, i * 0.2]}>
          <ringGeometry args={[radius - 0.01, radius + 0.01, 64]} />
          <meshBasicMaterial
            color="#D4A853"
            transparent
            opacity={0.1 - i * 0.02}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

interface CelticKnotLogoProps {
  size?: number;
  className?: string;
}

export function CelticKnotLogo({ size = 300, className = '' }: CelticKnotLogoProps) {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
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

  // PNG fallback for reduced motion
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
        <img
          src="/celtic-knot.svg"
          alt="Celtic Knot Logo"
          style={{
            width: '80%',
            height: '80%',
            opacity: 0.8,
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
        cursor: 'pointer',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        <GlowRings />
        <KnotParticles mouse={mouse} isHovered={isHovered} />
      </Canvas>
    </div>
  );
}

export default CelticKnotLogo;
