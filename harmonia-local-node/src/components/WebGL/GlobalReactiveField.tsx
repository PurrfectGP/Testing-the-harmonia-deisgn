/**
 * GlobalReactiveField - Always-visible reactive background overlay
 * Session 28: Unified reactive layer across ALL phases
 *
 * Features:
 * - Subtle grid of glowing points
 * - Responds to global activity (mouse, clicks, typing)
 * - Phase-specific color theming
 * - Wave propagation on activity
 */

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Phase } from '../../context/AppContext';

// Phase-specific colors
const PHASE_COLORS: Record<Phase, { primary: string; secondary: string }> = {
  [Phase.INTRO]: { primary: '#D4A853', secondary: '#F5D98A' },
  [Phase.VISUAL]: { primary: '#8B7355', secondary: '#D4A853' },
  [Phase.PSYCHOMETRIC]: { primary: '#D4A853', secondary: '#722F37' },
  [Phase.BIOMETRIC]: { primary: '#722F37', secondary: '#D4A853' },
  [Phase.FUSION]: { primary: '#F5D98A', secondary: '#FFFFFF' },
  [Phase.RESULTS]: { primary: '#D4A853', secondary: '#F0C86E' },
};

// Vertex shader
const vertexShader = `
uniform float u_time;
uniform float u_activityLevel;
uniform float u_clickPulse;
uniform vec2 u_mousePosition;
uniform float u_waveTime;

attribute float a_random;

varying float v_alpha;
varying float v_distance;

void main() {
  vec3 pos = position;

  // Wave from center on activity
  float distFromCenter = length(pos.xy);
  float waveRadius = (u_time - u_waveTime) * 1.5;
  float waveEffect = smoothstep(waveRadius + 0.3, waveRadius, distFromCenter) *
                     smoothstep(waveRadius - 0.3, waveRadius, distFromCenter);
  waveEffect *= u_clickPulse * 2.0;

  // Mouse influence
  vec2 mouseWorld = (u_mousePosition * 2.0 - 1.0) * vec2(1.5, 1.0);
  float mouseDist = distance(pos.xy, mouseWorld);
  float mouseEffect = smoothstep(0.5, 0.0, mouseDist) * u_activityLevel;

  // Breathing animation
  float breath = sin(u_time * 0.8 + distFromCenter * 2.0) * 0.02;

  // Apply effects
  pos.z += breath + waveEffect * 0.1 + mouseEffect * 0.05;

  // Alpha based on activity and effects
  v_alpha = 0.15 + u_activityLevel * 0.3 + waveEffect * 0.4 + mouseEffect * 0.3;
  v_alpha *= 0.5 + a_random * 0.5;
  v_distance = distFromCenter;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Point size
  float size = 2.0 + u_activityLevel * 2.0 + waveEffect * 3.0 + mouseEffect * 2.0;
  gl_PointSize = size * (200.0 / -mvPosition.z);
}
`;

// Fragment shader
const fragmentShader = `
uniform vec3 u_colorPrimary;
uniform vec3 u_colorSecondary;
uniform float u_time;
uniform float u_activityLevel;

varying float v_alpha;
varying float v_distance;

void main() {
  // Circular particle
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  if (dist > 0.5) discard;

  // Soft edge
  float alpha = smoothstep(0.5, 0.1, dist) * v_alpha;

  // Color based on distance and time
  float colorMix = sin(u_time * 0.5 + v_distance * 3.0) * 0.5 + 0.5;
  vec3 color = mix(u_colorPrimary, u_colorSecondary, colorMix * u_activityLevel);

  // Glow
  float glow = 1.0 - dist * 2.0;
  color += u_colorPrimary * glow * 0.2 * u_activityLevel;

  gl_FragColor = vec4(color, alpha);
}
`;

interface ReactiveFieldProps {
  activityLevel: number;
  clickPulse: number;
  mousePosition: { x: number; y: number };
  phase: Phase;
}

function ReactiveField({ activityLevel, clickPulse, mousePosition, phase }: ReactiveFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const waveTimeRef = useRef(0);
  const lastClickPulse = useRef(0);

  // Generate grid points
  const { positions, randoms } = useMemo(() => {
    const gridSize = 12;
    const spacing = 0.25;
    const count = gridSize * gridSize;
    const pos = new Float32Array(count * 3);
    const rand = new Float32Array(count);

    let idx = 0;
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        pos[idx * 3] = (x - gridSize / 2 + 0.5) * spacing;
        pos[idx * 3 + 1] = (y - gridSize / 2 + 0.5) * spacing;
        pos[idx * 3 + 2] = 0;
        rand[idx] = Math.random();
        idx++;
      }
    }

    return { positions: pos, randoms: rand };
  }, []);

  // Get phase colors
  const colors = PHASE_COLORS[phase] || PHASE_COLORS[Phase.INTRO];

  // Uniforms
  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_activityLevel: { value: 0 },
      u_clickPulse: { value: 0 },
      u_mousePosition: { value: new THREE.Vector2(0.5, 0.5) },
      u_waveTime: { value: 0 },
      u_colorPrimary: { value: new THREE.Color(colors.primary) },
      u_colorSecondary: { value: new THREE.Color(colors.secondary) },
    }),
    [colors.primary, colors.secondary]
  );

  // Animation loop
  useFrame((state) => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = state.clock.elapsedTime;
      material.uniforms.u_activityLevel.value = activityLevel;
      material.uniforms.u_clickPulse.value = clickPulse;

      // Update wave time on new click pulse
      if (clickPulse > lastClickPulse.current + 0.5) {
        waveTimeRef.current = state.clock.elapsedTime;
      }
      lastClickPulse.current = clickPulse;
      material.uniforms.u_waveTime.value = waveTimeRef.current;

      // Smooth mouse position
      const targetMouse = new THREE.Vector2(mousePosition.x, 1 - mousePosition.y);
      material.uniforms.u_mousePosition.value.lerp(targetMouse, 0.1);

      // Update colors if phase changed
      material.uniforms.u_colorPrimary.value.set(colors.primary);
      material.uniforms.u_colorSecondary.value.set(colors.secondary);
    }
  });

  // Create geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('a_random', new THREE.BufferAttribute(randoms, 1));
    return geo;
  }, [positions, randoms]);

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface GlobalReactiveFieldProps {
  activityLevel: number;
  clickPulse: number;
  mousePosition: { x: number; y: number };
  phase: Phase;
  className?: string;
  style?: React.CSSProperties;
}

export function GlobalReactiveField({
  activityLevel,
  clickPulse,
  mousePosition,
  phase,
  className = '',
  style = {},
}: GlobalReactiveFieldProps) {
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.4,
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 2], fov: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
      >
        <ReactiveField
          activityLevel={activityLevel}
          clickPulse={clickPulse}
          mousePosition={mousePosition}
          phase={phase}
        />
      </Canvas>
    </div>
  );
}

export default GlobalReactiveField;
