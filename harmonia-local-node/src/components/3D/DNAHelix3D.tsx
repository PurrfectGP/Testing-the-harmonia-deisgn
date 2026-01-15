/**
 * DNAHelix3D - True 3D DNA Helix visualization using React Three Fiber
 * Replaces SVG helix with WebGL for depth and realism
 */

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface HelixProps {
  isGlowing?: boolean;
  color1?: string;
  color2?: string;
}

// Individual sphere for helix strand
function HelixSphere({
  position,
  color,
  scale = 1,
  isGlowing
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  isGlowing?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current && isGlowing) {
      meshRef.current.scale.setScalar(
        scale * (1 + Math.sin(clock.elapsedTime * 3) * 0.1)
      );
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.12 * scale, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={isGlowing ? color : '#000000'}
        emissiveIntensity={isGlowing ? 0.5 : 0}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
}

// Connecting rung between strands using Line2 alternative
function HelixRung({
  start,
  end,
  isGlowing
}: {
  start: [number, number, number];
  end: [number, number, number];
  isGlowing?: boolean;
}) {
  const ref = useRef<THREE.Line>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array([
      start[0], start[1], start[2],
      end[0], end[1], end[2]
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [start, end]);

  const material = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: '#D4A853',
      opacity: isGlowing ? 0.8 : 0.4,
      transparent: true
    });
  }, [isGlowing]);

  return <primitive object={new THREE.Line(geometry, material)} ref={ref} />;
}

// Main Helix structure
function Helix({ isGlowing = false, color1 = '#D4A853', color2 = '#722F37' }: HelixProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Generate helix points
  const helixData = useMemo(() => {
    const points1: [number, number, number][] = [];
    const points2: [number, number, number][] = [];
    const rungs: { start: [number, number, number]; end: [number, number, number] }[] = [];

    const turns = 3;
    const pointsPerTurn = 12;
    const totalPoints = turns * pointsPerTurn;
    const radius = 0.5;
    const height = 4;

    for (let i = 0; i <= totalPoints; i++) {
      const t = i / totalPoints;
      const angle = t * turns * Math.PI * 2;
      const y = (t - 0.5) * height;

      // First strand
      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      points1.push([x1, y, z1]);

      // Second strand (180 degrees offset)
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;
      points2.push([x2, y, z2]);

      // Add rungs every few points
      if (i % 3 === 0 && i > 0 && i < totalPoints) {
        rungs.push({
          start: [x1, y, z1],
          end: [x2, y, z2]
        });
      }
    }

    return { points1, points2, rungs };
  }, []);

  // Rotate the helix
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {/* First strand - Gold */}
      {helixData.points1.map((pos, i) => (
        <HelixSphere
          key={`strand1-${i}`}
          position={pos}
          color={color1}
          isGlowing={isGlowing}
        />
      ))}

      {/* Second strand - Maroon */}
      {helixData.points2.map((pos, i) => (
        <HelixSphere
          key={`strand2-${i}`}
          position={pos}
          color={color2}
          scale={0.8}
          isGlowing={isGlowing}
        />
      ))}

      {/* Connecting rungs */}
      {helixData.rungs.map((rung, i) => (
        <HelixRung
          key={`rung-${i}`}
          start={rung.start}
          end={rung.end}
          isGlowing={isGlowing}
        />
      ))}

      {/* Electric particles when glowing */}
      {isGlowing && (
        <ElectricParticles />
      )}
    </group>
  );
}

// Electric particles effect
function ElectricParticles() {
  const particlesRef = useRef<THREE.Points>(null);

  const { geometry, material } = useMemo(() => {
    const count = 50;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.05,
      color: '#FFEB3B',
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    return { geometry: geo, material: mat };
  }, []);

  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += (Math.random() - 0.5) * 0.02;
        positions[i + 1] += (Math.random() - 0.5) * 0.02;
        positions[i + 2] += (Math.random() - 0.5) * 0.02;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return <primitive object={new THREE.Points(geometry, material)} ref={particlesRef} />;
}

// Main exported component
export function DNAHelix3D({ isGlowing = false }: { isGlowing?: boolean }) {
  return (
    <div style={{ width: '100%', height: '300px' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#D4A853" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#722F37" />

        <Float
          speed={2}
          rotationIntensity={0.5}
          floatIntensity={0.5}
        >
          <Helix isGlowing={isGlowing} />
        </Float>
      </Canvas>
    </div>
  );
}

export default DNAHelix3D;
