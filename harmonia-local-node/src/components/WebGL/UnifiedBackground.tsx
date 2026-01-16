/**
 * UnifiedBackground - Session 28: New Properly Centered WebGL Background
 *
 * Features:
 * - Properly centered camera and geometry
 * - Flowing particle field that reacts to activity
 * - Phase-specific colors and intensity
 * - Responsive to viewport changes
 */

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Phase } from '../../context/AppContext';

// Phase color configurations
const PHASE_CONFIG: Record<Phase, {
  primary: [number, number, number];
  secondary: [number, number, number];
  intensity: number;
  speed: number;
}> = {
  [Phase.INTRO]: {
    primary: [0.83, 0.66, 0.33],    // Gold
    secondary: [0.45, 0.18, 0.22],  // Maroon
    intensity: 0.6,
    speed: 0.3
  },
  [Phase.VISUAL]: {
    primary: [0.96, 0.85, 0.54],    // Champagne
    secondary: [0.55, 0.45, 0.33],  // Warm brown
    intensity: 0.7,
    speed: 0.4
  },
  [Phase.PSYCHOMETRIC]: {
    primary: [0.83, 0.66, 0.33],    // Gold
    secondary: [0.45, 0.18, 0.22],  // Maroon
    intensity: 1.0,
    speed: 0.6
  },
  [Phase.BIOMETRIC]: {
    primary: [0.45, 0.18, 0.22],    // Maroon
    secondary: [0.83, 0.66, 0.33],  // Gold
    intensity: 0.8,
    speed: 0.5
  },
  [Phase.FUSION]: {
    primary: [0.96, 0.85, 0.54],    // Bright champagne
    secondary: [1.0, 1.0, 1.0],     // White
    intensity: 1.2,
    speed: 1.0
  },
  [Phase.RESULTS]: {
    primary: [0.83, 0.66, 0.33],    // Gold
    secondary: [0.96, 0.85, 0.54],  // Champagne
    intensity: 0.5,
    speed: 0.25
  },
};

// Vertex shader for flowing particles
const vertexShader = `
  uniform float uTime;
  uniform float uActivity;
  uniform float uSpeed;
  uniform vec2 uMouse;

  attribute float aRandom;
  attribute float aSize;

  varying float vAlpha;
  varying float vRandom;

  void main() {
    vec3 pos = position;

    // Flowing wave motion
    float wave1 = sin(pos.x * 2.0 + uTime * uSpeed) * 0.15;
    float wave2 = cos(pos.y * 1.5 + uTime * uSpeed * 0.8) * 0.15;
    float wave3 = sin((pos.x + pos.y) * 1.0 + uTime * uSpeed * 0.5) * 0.1;

    pos.z += wave1 + wave2 + wave3;
    pos.z += aRandom * 0.2;

    // Activity-based displacement
    pos.z += uActivity * sin(uTime * 3.0 + aRandom * 6.28) * 0.1;

    // Mouse influence (subtle attraction)
    vec2 toMouse = uMouse - pos.xy;
    float mouseDist = length(toMouse);
    float mouseInfluence = smoothstep(1.5, 0.0, mouseDist) * uActivity;
    pos.xy += normalize(toMouse) * mouseInfluence * 0.1;
    pos.z += mouseInfluence * 0.2;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size based on depth and activity
    float size = aSize * (1.0 + uActivity * 0.5);
    gl_PointSize = size * (150.0 / -mvPosition.z);

    // Alpha based on position and activity
    vAlpha = 0.3 + aRandom * 0.3 + uActivity * 0.3;
    vAlpha *= smoothstep(-2.0, 0.0, pos.z);
    vRandom = aRandom;
  }
`;

// Fragment shader for glowing particles
const fragmentShader = `
  uniform vec3 uColorPrimary;
  uniform vec3 uColorSecondary;
  uniform float uTime;
  uniform float uIntensity;

  varying float vAlpha;
  varying float vRandom;

  void main() {
    // Circular particle with soft edge
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.0, dist) * vAlpha * uIntensity;

    // Color blend based on random and time
    float colorMix = sin(uTime * 0.5 + vRandom * 6.28) * 0.5 + 0.5;
    vec3 color = mix(uColorPrimary, uColorSecondary, colorMix);

    // Glow effect
    float glow = 1.0 - dist * 1.5;
    color += uColorPrimary * glow * 0.3;

    gl_FragColor = vec4(color, alpha);
  }
`;

interface ParticleFieldProps {
  phase: Phase;
  activityLevel: number;
  mousePosition: { x: number; y: number };
}

function ParticleField({ phase, activityLevel, mousePosition }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  const config = PHASE_CONFIG[phase] || PHASE_CONFIG[Phase.INTRO];

  // Generate particles in a grid pattern
  const { positions, randoms, sizes } = useMemo(() => {
    const count = 2500;
    const pos = new Float32Array(count * 3);
    const rand = new Float32Array(count);
    const size = new Float32Array(count);

    const spread = 4;
    const sqrtCount = Math.sqrt(count);

    for (let i = 0; i < count; i++) {
      // Grid-based distribution with jitter
      const gridX = (i % sqrtCount) / sqrtCount;
      const gridY = Math.floor(i / sqrtCount) / sqrtCount;

      pos[i * 3] = (gridX - 0.5) * spread * 2 + (Math.random() - 0.5) * 0.2;
      pos[i * 3 + 1] = (gridY - 0.5) * spread * 2 + (Math.random() - 0.5) * 0.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;

      rand[i] = Math.random();
      size[i] = 2 + Math.random() * 4;
    }

    return { positions: pos, randoms: rand, sizes: size };
  }, []);

  // Uniforms
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uActivity: { value: 0 },
    uSpeed: { value: config.speed },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uColorPrimary: { value: new THREE.Vector3(...config.primary) },
    uColorSecondary: { value: new THREE.Vector3(...config.secondary) },
    uIntensity: { value: config.intensity },
  }), []);

  // Animation loop
  useFrame((state) => {
    if (!pointsRef.current) return;

    const material = pointsRef.current.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value = state.clock.elapsedTime;

    // Smooth activity transition
    const targetActivity = activityLevel;
    material.uniforms.uActivity.value += (targetActivity - material.uniforms.uActivity.value) * 0.05;

    // Update mouse (convert from 0-1 to world coordinates)
    const worldMouse = new THREE.Vector2(
      (mousePosition.x - 0.5) * viewport.width,
      (0.5 - mousePosition.y) * viewport.height
    );
    material.uniforms.uMouse.value.lerp(worldMouse, 0.1);

    // Update phase colors
    material.uniforms.uColorPrimary.value.set(...config.primary);
    material.uniforms.uColorSecondary.value.set(...config.secondary);
    material.uniforms.uIntensity.value = config.intensity;
    material.uniforms.uSpeed.value = config.speed;
  });

  // Create geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, randoms, sizes]);

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

// Flowing lines component for visual interest
function FlowingLines({ phase, activityLevel }: { phase: Phase; activityLevel: number }) {
  const linesRef = useRef<THREE.LineSegments>(null);
  const config = PHASE_CONFIG[phase] || PHASE_CONFIG[Phase.INTRO];

  const { positions, colors } = useMemo(() => {
    const lineCount = 30;
    const pointsPerLine = 50;
    const pos = new Float32Array(lineCount * pointsPerLine * 3);
    const col = new Float32Array(lineCount * pointsPerLine * 3);

    for (let l = 0; l < lineCount; l++) {
      const startX = (Math.random() - 0.5) * 8;
      const startY = (Math.random() - 0.5) * 6;
      const angle = Math.random() * Math.PI * 2;

      for (let p = 0; p < pointsPerLine; p++) {
        const idx = (l * pointsPerLine + p) * 3;
        const t = p / pointsPerLine;

        pos[idx] = startX + Math.cos(angle + t * 2) * t * 2;
        pos[idx + 1] = startY + Math.sin(angle + t * 2) * t * 2;
        pos[idx + 2] = -1 + t * 0.5;

        // Color gradient along line
        const colorMix = t;
        col[idx] = config.primary[0] * (1 - colorMix) + config.secondary[0] * colorMix;
        col[idx + 1] = config.primary[1] * (1 - colorMix) + config.secondary[1] * colorMix;
        col[idx + 2] = config.primary[2] * (1 - colorMix) + config.secondary[2] * colorMix;
      }
    }

    return { positions: pos, colors: col };
  }, [config]);

  useFrame((state) => {
    if (!linesRef.current) return;

    const positions = linesRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime * config.speed;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 2] = -1 + Math.sin(time + i * 0.01) * 0.3;
    }

    linesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  // Create geometry with attributes
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.15 + activityLevel * 0.1}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

// Ambient glow orbs
function GlowOrbs({ phase, activityLevel }: { phase: Phase; activityLevel: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const config = PHASE_CONFIG[phase] || PHASE_CONFIG[Phase.INTRO];

  const orbs = useMemo(() => {
    return Array.from({ length: 5 }, () => ({
      position: [
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
        -2 + Math.random() * 2,
      ] as [number, number, number],
      scale: 0.5 + Math.random() * 1,
      speed: 0.2 + Math.random() * 0.3,
      offset: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    groupRef.current.children.forEach((child, i) => {
      const orb = orbs[i];
      const time = state.clock.elapsedTime * orb.speed + orb.offset;

      child.position.x = orb.position[0] + Math.sin(time) * 0.5;
      child.position.y = orb.position[1] + Math.cos(time * 0.7) * 0.3;
      child.scale.setScalar(orb.scale * (1 + Math.sin(time * 2) * 0.1 + activityLevel * 0.2));
    });
  });

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.position}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial
            color={new THREE.Color(...config.primary)}
            transparent
            opacity={0.08 + activityLevel * 0.05}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

interface UnifiedBackgroundProps {
  phase: Phase;
  activityLevel: number;
  mousePosition: { x: number; y: number };
  className?: string;
  style?: React.CSSProperties;
}

export function UnifiedBackground({
  phase,
  activityLevel,
  mousePosition,
  className = '',
  style = {},
}: UnifiedBackgroundProps) {
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#12090A',
        ...style,
      }}
    >
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Ambient lighting */}
        <ambientLight intensity={0.1} />

        {/* Main particle field */}
        <ParticleField
          phase={phase}
          activityLevel={activityLevel}
          mousePosition={mousePosition}
        />

        {/* Flowing lines */}
        <FlowingLines phase={phase} activityLevel={activityLevel} />

        {/* Glow orbs */}
        <GlowOrbs phase={phase} activityLevel={activityLevel} />
      </Canvas>
    </div>
  );
}

export default UnifiedBackground;
