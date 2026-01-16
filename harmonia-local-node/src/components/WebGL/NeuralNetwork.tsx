/**
 * NeuralNetwork - WebGL neural network visualization
 * Session 6: Neural Network Firing System
 *
 * Features:
 * - Procedural neuron nodes with pulsing glow
 * - Dynamic synaptic connections with signal propagation
 * - Mouse proximity triggers neural firing cascades
 * - GSAP-animated signal pulses along axons
 * - Typing speed modulates network activity
 */

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

// Neural node vertex shader
const nodeVertexShader = `
uniform float u_time;
uniform float u_activity;

attribute float a_random;
attribute float a_firing;

varying float v_alpha;
varying float v_firing;
varying float v_random;

void main() {
  v_random = a_random;
  v_firing = a_firing;

  vec3 pos = position;

  // Subtle position jitter when active
  float jitter = sin(u_time * 3.0 + a_random * 6.28) * 0.02 * u_activity;
  pos.x += jitter;
  pos.y += cos(u_time * 2.5 + a_random * 6.28) * 0.02 * u_activity;

  // Calculate alpha based on activity and firing state
  v_alpha = 0.6 + a_firing * 0.4 + sin(u_time * 2.0 + a_random * 10.0) * 0.1;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Point size - larger when firing
  float baseSize = 8.0 + a_random * 4.0;
  float firingBoost = a_firing * 6.0;
  gl_PointSize = (baseSize + firingBoost) * (300.0 / -mvPosition.z);
}
`;

// Neural node fragment shader
const nodeFragmentShader = `
uniform float u_time;
uniform vec3 u_colorGold;
uniform vec3 u_colorChampagne;
uniform vec3 u_colorMaroon;

varying float v_alpha;
varying float v_firing;
varying float v_random;

void main() {
  // Circular point shape
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  if (dist > 0.5) discard;

  // Soft glow edge
  float alpha = smoothstep(0.5, 0.1, dist) * v_alpha;

  // Color based on firing state
  vec3 baseColor = mix(u_colorMaroon, u_colorGold, v_random * 0.5);
  vec3 firingColor = u_colorChampagne;
  vec3 color = mix(baseColor, firingColor, v_firing);

  // Inner glow
  float innerGlow = 1.0 - dist * 2.0;
  color += u_colorGold * innerGlow * 0.3 * (1.0 + v_firing);

  // Pulse effect
  float pulse = sin(u_time * 4.0 + v_random * 6.28) * 0.5 + 0.5;
  color += u_colorGold * pulse * 0.1 * v_firing;

  gl_FragColor = vec4(color, alpha);
}
`;

// Synapse line vertex shader
const synapseVertexShader = `
uniform float u_time;
uniform float u_signalProgress;
uniform float u_activity;

attribute float a_position; // 0-1 along the line

varying float v_position;
varying float v_signal;

void main() {
  v_position = a_position;

  // Calculate signal pulse position
  float signalWidth = 0.15;
  float signalDist = abs(a_position - u_signalProgress);
  v_signal = smoothstep(signalWidth, 0.0, signalDist) * u_activity;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Synapse line fragment shader
const synapseFragmentShader = `
uniform vec3 u_colorGold;
uniform vec3 u_colorDark;
uniform float u_baseOpacity;

varying float v_position;
varying float v_signal;

void main() {
  // Base line color with gradient
  vec3 baseColor = mix(u_colorDark * 2.0, u_colorGold * 0.5, v_position);

  // Signal pulse color
  vec3 signalColor = u_colorGold;

  // Combine base and signal
  vec3 color = mix(baseColor, signalColor, v_signal);

  // Alpha with signal boost
  float alpha = u_baseOpacity + v_signal * 0.5;

  gl_FragColor = vec4(color, alpha);
}
`;

// Generate neural network topology
interface NetworkNode {
  position: THREE.Vector3;
  connections: number[];
  layer: number;
}

function generateNetworkTopology(nodeCount: number, layerCount: number): NetworkNode[] {
  const nodes: NetworkNode[] = [];
  const nodesPerLayer = Math.ceil(nodeCount / layerCount);

  // Create nodes in layers
  for (let layer = 0; layer < layerCount; layer++) {
    const layerNodes = layer === layerCount - 1
      ? nodeCount - nodes.length
      : nodesPerLayer;

    const layerX = (layer / (layerCount - 1)) * 2 - 1; // -1 to 1

    for (let i = 0; i < layerNodes; i++) {
      const ySpread = 0.8;
      const y = (i / (layerNodes - 1 || 1)) * 2 * ySpread - ySpread;
      const z = (Math.random() - 0.5) * 0.3;

      nodes.push({
        position: new THREE.Vector3(layerX + (Math.random() - 0.5) * 0.2, y, z),
        connections: [],
        layer,
      });
    }
  }

  // Create connections between adjacent layers
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nextLayerNodes = nodes.filter(n => n.layer === node.layer + 1);

    // Connect to 2-4 random nodes in next layer
    const connectionCount = Math.min(2 + Math.floor(Math.random() * 3), nextLayerNodes.length);
    const shuffled = nextLayerNodes
      .map((n) => ({ node: n, idx: nodes.indexOf(n), dist: Math.random() }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, connectionCount);

    node.connections = shuffled.map(s => s.idx);
  }

  return nodes;
}

interface NeuralNodesProps {
  nodes: NetworkNode[];
  firingStates: Float32Array;
  activity: number;
}

function NeuralNodes({ nodes, firingStates, activity }: NeuralNodesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, randoms } = useMemo(() => {
    const pos = new Float32Array(nodes.length * 3);
    const rand = new Float32Array(nodes.length);

    nodes.forEach((node, i) => {
      pos[i * 3] = node.position.x;
      pos[i * 3 + 1] = node.position.y;
      pos[i * 3 + 2] = node.position.z;
      rand[i] = Math.random();
    });

    return { positions: pos, randoms: rand };
  }, [nodes]);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_activity: { value: 0 },
      u_colorGold: { value: new THREE.Color('#D4A853') },
      u_colorChampagne: { value: new THREE.Color('#F5D98A') },
      u_colorMaroon: { value: new THREE.Color('#722F37') },
    }),
    []
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('a_random', new THREE.BufferAttribute(randoms, 1));
    geo.setAttribute('a_firing', new THREE.BufferAttribute(firingStates, 1));
    return geo;
  }, [positions, randoms, firingStates]);

  useFrame((state) => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = state.clock.elapsedTime;
      material.uniforms.u_activity.value = activity;

      // Update firing states attribute
      const firingAttr = pointsRef.current.geometry.getAttribute('a_firing');
      if (firingAttr) {
        (firingAttr as THREE.BufferAttribute).needsUpdate = true;
      }
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={nodeVertexShader}
        fragmentShader={nodeFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface SynapseConnectionProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  signalProgress: number;
  activity: number;
}

function SynapseConnection({ start, end, signalProgress, activity }: SynapseConnectionProps) {
  const { lineObject, material } = useMemo(() => {
    const segments = 20;
    const pos = new Float32Array(segments * 3);
    const positionAttr = new Float32Array(segments);

    for (let i = 0; i < segments; i++) {
      const t = i / (segments - 1);
      pos[i * 3] = start.x + (end.x - start.x) * t;
      pos[i * 3 + 1] = start.y + (end.y - start.y) * t;
      pos[i * 3 + 2] = start.z + (end.z - start.z) * t;
      positionAttr[i] = t;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('a_position', new THREE.BufferAttribute(positionAttr, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: synapseVertexShader,
      fragmentShader: synapseFragmentShader,
      uniforms: {
        u_time: { value: 0 },
        u_signalProgress: { value: 0 },
        u_activity: { value: 0 },
        u_baseOpacity: { value: 0.15 },
        u_colorGold: { value: new THREE.Color('#D4A853') },
        u_colorDark: { value: new THREE.Color('#12090A') },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const line = new THREE.Line(geo, mat);
    return { lineObject: line, material: mat };
  }, [start, end]);

  useFrame((state) => {
    material.uniforms.u_time.value = state.clock.elapsedTime;
    material.uniforms.u_signalProgress.value = signalProgress;
    material.uniforms.u_activity.value = activity;
  });

  return <primitive object={lineObject} />;
}

interface NeuralNetworkSceneProps {
  mouse: { x: number; y: number };
  activity: number;
}

function NeuralNetworkScene({ mouse, activity }: NeuralNetworkSceneProps) {
  const nodeCount = 40;
  const layerCount = 5;

  const nodes = useMemo(() => generateNetworkTopology(nodeCount, layerCount), []);

  // Firing states for each node
  const firingStates = useRef(new Float32Array(nodeCount).fill(0));

  // Track active signals
  const [activeSignals, setActiveSignals] = useState<Array<{
    from: number;
    to: number;
    progress: number;
    id: string;
  }>>([]);

  // Trigger firing cascade from mouse proximity
  useEffect(() => {
    const mousePos = new THREE.Vector3((mouse.x - 0.5) * 2, -(mouse.y - 0.5) * 2, 0);

    // Find nodes near mouse
    nodes.forEach((node, idx) => {
      const dist = node.position.distanceTo(mousePos);
      if (dist < 0.3 && firingStates.current[idx] < 0.5 && Math.random() < 0.05 * activity) {
        triggerNodeFiring(idx);
      }
    });
  }, [mouse, nodes, activity]);

  // Random background activity
  useEffect(() => {
    const interval = setInterval(() => {
      if (activity > 0.3) {
        const randomNode = Math.floor(Math.random() * nodes.length);
        if (firingStates.current[randomNode] < 0.3) {
          triggerNodeFiring(randomNode);
        }
      }
    }, 500 + Math.random() * 1000);

    return () => clearInterval(interval);
  }, [nodes, activity]);

  const triggerNodeFiring = useCallback((nodeIdx: number) => {
    // Fire the node
    gsap.to(firingStates.current, {
      [nodeIdx]: 1,
      duration: 0.1,
      onComplete: () => {
        // Decay
        gsap.to(firingStates.current, {
          [nodeIdx]: 0,
          duration: 0.5,
          ease: 'power2.out',
        });
      },
    });

    // Propagate to connected nodes
    const node = nodes[nodeIdx];
    node.connections.forEach((connIdx, i) => {
      const signalId = `${nodeIdx}-${connIdx}-${Date.now()}`;

      // Add signal
      setActiveSignals(prev => [...prev, {
        from: nodeIdx,
        to: connIdx,
        progress: 0,
        id: signalId,
      }]);

      // Animate signal progress
      const signalObj = { progress: 0 };
      gsap.to(signalObj, {
        progress: 1,
        duration: 0.3 + Math.random() * 0.2,
        delay: i * 0.05,
        ease: 'power1.inOut',
        onUpdate: () => {
          setActiveSignals(prev => prev.map(s =>
            s.id === signalId ? { ...s, progress: signalObj.progress } : s
          ));
        },
        onComplete: () => {
          // Remove signal and trigger next node
          setActiveSignals(prev => prev.filter(s => s.id !== signalId));

          // Chain reaction with probability
          if (Math.random() < 0.6 * activity && firingStates.current[connIdx] < 0.3) {
            setTimeout(() => triggerNodeFiring(connIdx), 50);
          }
        },
      });
    });
  }, [nodes, activity]);

  // All connections for static rendering
  const allConnections = useMemo(() => {
    const connections: Array<{ from: number; to: number }> = [];
    nodes.forEach((node, idx) => {
      node.connections.forEach(connIdx => {
        connections.push({ from: idx, to: connIdx });
      });
    });
    return connections;
  }, [nodes]);

  return (
    <group>
      {/* Static connections */}
      {allConnections.map(({ from, to }) => {
        const activeSignal = activeSignals.find(s => s.from === from && s.to === to);
        return (
          <SynapseConnection
            key={`conn-${from}-${to}`}
            start={nodes[from].position}
            end={nodes[to].position}
            signalProgress={activeSignal?.progress || 0}
            activity={activity}
          />
        );
      })}

      {/* Neural nodes */}
      <NeuralNodes
        nodes={nodes}
        firingStates={firingStates.current}
        activity={activity}
      />
    </group>
  );
}

interface NeuralNetworkProps {
  size?: number;
  className?: string;
  activity?: number;
}

export function NeuralNetwork({ size = 600, className = '', activity = 0.7 }: NeuralNetworkProps) {
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
          background: 'radial-gradient(circle, rgba(212,168,83,0.1) 0%, transparent 70%)',
        }}
      >
        <svg viewBox="0 0 100 100" style={{ width: '80%', height: '80%', opacity: 0.5 }}>
          {/* Static network representation */}
          {[20, 40, 60, 80].map((x, i) => (
            <g key={i}>
              {[30, 50, 70].map((y, j) => (
                <circle key={`${i}-${j}`} cx={x} cy={y} r="3" fill="#D4A853" opacity={0.6} />
              ))}
            </g>
          ))}
          <line x1="20" y1="30" x2="40" y2="50" stroke="#D4A853" strokeWidth="0.5" opacity="0.3" />
          <line x1="20" y1="50" x2="40" y2="50" stroke="#D4A853" strokeWidth="0.5" opacity="0.3" />
          <line x1="40" y1="50" x2="60" y2="30" stroke="#D4A853" strokeWidth="0.5" opacity="0.3" />
          <line x1="40" y1="50" x2="60" y2="70" stroke="#D4A853" strokeWidth="0.5" opacity="0.3" />
          <line x1="60" y1="50" x2="80" y2="50" stroke="#D4A853" strokeWidth="0.5" opacity="0.3" />
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
        camera={{ position: [0, 0, 2.5], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <NeuralNetworkScene mouse={mouse} activity={activity} />
      </Canvas>
    </div>
  );
}

export default NeuralNetwork;
