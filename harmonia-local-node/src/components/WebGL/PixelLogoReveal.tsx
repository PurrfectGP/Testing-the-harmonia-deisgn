/**
 * PixelLogoReveal - Sharp pixel particles that magnetize to form the Celtic Knot logo
 *
 * Features:
 * - Crisp, pixel-like particles (not blurry fireflies)
 * - Particles start scattered and magnetize to form logo shape
 * - Click to reveal/begin
 * - Sharp glow effect with clean edges
 */

import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Celtic Knot path points - sampled from the SVG triquetra
function generateLogoPoints(count: number): Float32Array {
  const points: number[] = [];

  // Generate points along the Celtic Knot paths
  // Outer circle
  for (let i = 0; i < count * 0.15; i++) {
    const angle = (i / (count * 0.15)) * Math.PI * 2;
    const r = 1.8;
    points.push(
      Math.cos(angle) * r,
      Math.sin(angle) * r,
      0
    );
  }

  // Three main loops of triquetra
  // Top loop
  for (let i = 0; i < count * 0.2; i++) {
    const t = i / (count * 0.2);
    const angle = t * Math.PI * 2 - Math.PI / 2;
    const r = 0.8 + Math.sin(t * Math.PI * 3) * 0.3;
    const yOffset = -0.4;
    points.push(
      Math.cos(angle) * r * 0.8,
      Math.sin(angle) * r * 0.6 + yOffset,
      0
    );
  }

  // Bottom left loop
  for (let i = 0; i < count * 0.2; i++) {
    const t = i / (count * 0.2);
    const angle = t * Math.PI * 2 + Math.PI * 0.75;
    const r = 0.6;
    const xOffset = -0.5;
    const yOffset = 0.4;
    points.push(
      Math.cos(angle) * r + xOffset,
      Math.sin(angle) * r + yOffset,
      0
    );
  }

  // Bottom right loop
  for (let i = 0; i < count * 0.2; i++) {
    const t = i / (count * 0.2);
    const angle = t * Math.PI * 2 + Math.PI * 0.25;
    const r = 0.6;
    const xOffset = 0.5;
    const yOffset = 0.4;
    points.push(
      Math.cos(angle) * r + xOffset,
      Math.sin(angle) * r + yOffset,
      0
    );
  }

  // Inner triquetra
  for (let i = 0; i < count * 0.15; i++) {
    const t = i / (count * 0.15);
    const angle = t * Math.PI * 2;
    const r = 0.35;
    points.push(
      Math.cos(angle) * r,
      Math.sin(angle) * r,
      0
    );
  }

  // Center circle
  for (let i = 0; i < count * 0.1; i++) {
    const angle = (i / (count * 0.1)) * Math.PI * 2;
    const r = 0.15;
    points.push(
      Math.cos(angle) * r,
      Math.sin(angle) * r,
      0
    );
  }

  // Fill remaining with scattered points along paths
  while (points.length < count * 3) {
    const pathChoice = Math.random();
    let x, y;

    if (pathChoice < 0.3) {
      // Outer circle
      const angle = Math.random() * Math.PI * 2;
      x = Math.cos(angle) * 1.8;
      y = Math.sin(angle) * 1.8;
    } else if (pathChoice < 0.6) {
      // Connecting lines
      const t = Math.random();
      const startAngle = Math.floor(Math.random() * 3) * (Math.PI * 2 / 3);
      x = Math.cos(startAngle) * t * 0.8;
      y = Math.sin(startAngle) * t * 0.8;
    } else {
      // Inner area
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.5;
      x = Math.cos(angle) * r;
      y = Math.sin(angle) * r;
    }

    points.push(x, y, 0);
  }

  return new Float32Array(points.slice(0, count * 3));
}

// Vertex shader for pixel particles
const vertexShader = `
  attribute float size;
  attribute vec3 customColor;
  attribute float alpha;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = customColor;
    vAlpha = alpha;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Fragment shader for crisp pixel particles with sharp glow
const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Create sharp square/pixel shape
    vec2 center = gl_PointCoord - vec2(0.5);

    // Sharp pixel edge - using max for square shape
    float dist = max(abs(center.x), abs(center.y));

    // Core pixel (sharp)
    float core = step(dist, 0.3);

    // Sharp glow ring (not blurry)
    float glowInner = step(dist, 0.4) - step(dist, 0.3);
    float glowOuter = step(dist, 0.5) - step(dist, 0.4);

    // Combine with sharp falloff
    float intensity = core + glowInner * 0.6 + glowOuter * 0.3;

    if (intensity < 0.1) discard;

    // Add slight color variation in glow
    vec3 glowColor = vColor * 1.2;
    vec3 finalColor = mix(glowColor, vColor, core);

    gl_FragColor = vec4(finalColor, intensity * vAlpha);
  }
`;

interface PixelParticlesProps {
  isRevealed: boolean;
  onRevealComplete?: () => void;
}

function PixelParticles({ isRevealed, onRevealComplete }: PixelParticlesProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const particleCount = 800;
  const revealProgress = useRef(0);
  const hasCalledComplete = useRef(false);

  // Target positions (logo shape) and random start positions
  const { targetPositions, startPositions, sizes, colors, alphas } = useMemo(() => {
    const targets = generateLogoPoints(particleCount);
    const starts = new Float32Array(particleCount * 3);
    const sizesArr = new Float32Array(particleCount);
    const colorsArr = new Float32Array(particleCount * 3);
    const alphasArr = new Float32Array(particleCount);

    // Gold color palette
    const goldPrimary = new THREE.Color('#D4A853');
    const goldLight = new THREE.Color('#F5D98A');
    const maroon = new THREE.Color('#722F37');

    for (let i = 0; i < particleCount; i++) {
      // Random start positions (scattered)
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.5 + Math.random() * 2;
      starts[i * 3] = Math.cos(angle) * radius;
      starts[i * 3 + 1] = Math.sin(angle) * radius;
      starts[i * 3 + 2] = (Math.random() - 0.5) * 0.5;

      // Particle sizes (pixels are uniform-ish)
      sizesArr[i] = 4 + Math.random() * 4;

      // Colors - mostly gold with some variation
      const colorChoice = Math.random();
      let color;
      if (colorChoice < 0.6) {
        color = goldPrimary;
      } else if (colorChoice < 0.85) {
        color = goldLight;
      } else {
        color = maroon;
      }
      colorsArr[i * 3] = color.r;
      colorsArr[i * 3 + 1] = color.g;
      colorsArr[i * 3 + 2] = color.b;

      // Alpha
      alphasArr[i] = 0.7 + Math.random() * 0.3;
    }

    return {
      targetPositions: targets,
      startPositions: starts,
      sizes: sizesArr,
      colors: colorsArr,
      alphas: alphasArr,
    };
  }, []);

  // Animation frame
  useFrame((state, delta) => {
    if (!particlesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;

    if (!isRevealed) {
      // Magnetize: particles move toward target positions
      revealProgress.current = Math.min(revealProgress.current + delta * 0.3, 1);
      hasCalledComplete.current = false;

      const progress = revealProgress.current;
      // Easing function for smooth magnetization
      const eased = 1 - Math.pow(1 - progress, 3);

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Interpolate from start to target
        positions[i3] = THREE.MathUtils.lerp(startPositions[i3], targetPositions[i3], eased);
        positions[i3 + 1] = THREE.MathUtils.lerp(startPositions[i3 + 1], targetPositions[i3 + 1], eased);
        positions[i3 + 2] = THREE.MathUtils.lerp(startPositions[i3 + 2], targetPositions[i3 + 2], eased);

        // Add subtle shimmer when formed
        if (progress > 0.8) {
          const shimmer = Math.sin(time * 3 + i * 0.1) * 0.02 * (progress - 0.8) * 5;
          positions[i3] += shimmer;
          positions[i3 + 1] += shimmer;
        }
      }
    } else {
      // Explode outward on reveal
      revealProgress.current = Math.min(revealProgress.current + delta * 2, 1);

      const progress = revealProgress.current;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Explode from center
        const dx = targetPositions[i3];
        const dy = targetPositions[i3 + 1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        const explosionRadius = dist + progress * 4;

        positions[i3] = Math.cos(angle) * explosionRadius;
        positions[i3 + 1] = Math.sin(angle) * explosionRadius;
        positions[i3 + 2] = (Math.random() - 0.5) * progress * 2;
      }

      // Fade out
      if (materialRef.current) {
        materialRef.current.uniforms.globalAlpha = { value: 1 - progress };
      }

      // Callback when explosion complete
      if (progress >= 1 && !hasCalledComplete.current) {
        hasCalledComplete.current = true;
        onRevealComplete?.();
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  // Reset progress when isRevealed changes
  useEffect(() => {
    if (isRevealed) {
      revealProgress.current = 0;
    }
  }, [isRevealed]);

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[startPositions.slice(), 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
        <bufferAttribute
          attach="attributes-customColor"
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-alpha"
          args={[alphas, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Click prompt text
function ClickPrompt({ visible }: { visible: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    // Pulse effect
    const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
    meshRef.current.scale.setScalar(pulse);
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = visible ? 0.6 + Math.sin(state.clock.elapsedTime * 3) * 0.2 : 0;
  });

  return (
    <mesh ref={meshRef} position={[0, -2.2, 0]}>
      <planeGeometry args={[2, 0.3]} />
      <meshBasicMaterial
        color="#D4A853"
        transparent
        opacity={0}
      />
    </mesh>
  );
}

interface PixelLogoRevealProps {
  onBegin: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function PixelLogoReveal({ onBegin, className = '', style = {} }: PixelLogoRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFormed, setIsFormed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect when logo is formed (after ~3 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFormed(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = useCallback(() => {
    if (isFormed && !isRevealed) {
      setIsRevealed(true);
    }
  }, [isFormed, isRevealed]);

  const handleRevealComplete = useCallback(() => {
    onBegin();
  }, [onBegin]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        cursor: isFormed && !isRevealed ? 'pointer' : 'default',
        ...style,
      }}
      onClick={handleClick}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <PixelParticles
          isRevealed={isRevealed}
          onRevealComplete={handleRevealComplete}
        />
        <ClickPrompt visible={isFormed && !isRevealed} />
      </Canvas>

      {/* Click to begin text overlay */}
      {isFormed && !isRevealed && (
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#D4A853',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.2rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            opacity: 0.8,
            animation: 'pulse 2s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        >
          Click to Begin
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default PixelLogoReveal;
