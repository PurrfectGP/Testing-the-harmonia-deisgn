/**
 * ReactiveNeuralNetwork - Session 16: Quiz-Reactive Neural Network
 * Enhanced neural network visualization that responds to quiz activity
 *
 * Features:
 * - Typing speed reactivity - firing rate increases with typing
 * - Input length response - more neurons activate as response grows
 * - Idle decay - network gradually calms when user stops typing
 * - Submission burst - cascade of neural firing when answer submitted
 * - Question transition effects
 */

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useQuizReactivity } from '../../hooks/useQuizReactivity';

// Neural node vertex shader with quiz reactivity
const nodeVertexShader = `
uniform float u_time;
uniform float u_activity;
uniform float u_typingSpeed;
uniform float u_submissionPulse;
uniform float u_questionProgress;

attribute float a_random;
attribute float a_firing;

varying float v_alpha;
varying float v_firing;
varying float v_random;
varying float v_pulse;

void main() {
  v_random = a_random;
  v_firing = a_firing;
  v_pulse = u_submissionPulse;

  vec3 pos = position;

  // Enhanced jitter based on typing speed
  float jitterIntensity = 0.02 + u_typingSpeed * 0.03;
  float jitter = sin(u_time * (3.0 + u_typingSpeed * 2.0) + a_random * 6.28) * jitterIntensity * u_activity;
  pos.x += jitter;
  pos.y += cos(u_time * (2.5 + u_typingSpeed * 1.5) + a_random * 6.28) * jitterIntensity * u_activity;

  // Submission pulse wave
  float pulseWave = sin(a_random * 6.28 + u_submissionPulse * 10.0) * u_submissionPulse * 0.1;
  pos += normalize(pos) * pulseWave;

  // Calculate alpha based on activity and firing state
  v_alpha = 0.5 + a_firing * 0.5 + sin(u_time * 2.0 + a_random * 10.0) * 0.1 * u_activity;
  v_alpha += u_submissionPulse * 0.3; // Boost during submission

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Point size - larger when firing or during submission
  float baseSize = 8.0 + a_random * 4.0;
  float firingBoost = a_firing * 8.0;
  float submissionBoost = u_submissionPulse * 6.0;
  float typingBoost = u_typingSpeed * 2.0;
  gl_PointSize = (baseSize + firingBoost + submissionBoost + typingBoost) * (300.0 / -mvPosition.z);
}
`;

// Neural node fragment shader with enhanced glow
const nodeFragmentShader = `
uniform float u_time;
uniform vec3 u_colorGold;
uniform vec3 u_colorChampagne;
uniform vec3 u_colorMaroon;
uniform float u_submissionPulse;
uniform float u_typingSpeed;

varying float v_alpha;
varying float v_firing;
varying float v_random;
varying float v_pulse;

void main() {
  // Circular point shape
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  if (dist > 0.5) discard;

  // Soft glow edge
  float alpha = smoothstep(0.5, 0.05, dist) * v_alpha;

  // Color based on firing state and activity
  vec3 baseColor = mix(u_colorMaroon, u_colorGold, v_random * 0.5 + u_typingSpeed * 0.2);
  vec3 firingColor = u_colorChampagne;
  vec3 color = mix(baseColor, firingColor, v_firing);

  // Submission pulse color boost
  color = mix(color, u_colorChampagne, v_pulse * 0.5);

  // Inner glow - intensified during activity
  float innerGlow = 1.0 - dist * 2.0;
  float glowIntensity = 0.3 + u_typingSpeed * 0.2 + v_pulse * 0.3;
  color += u_colorGold * innerGlow * glowIntensity * (1.0 + v_firing);

  // Pulse effect
  float pulse = sin(u_time * (4.0 + u_typingSpeed * 2.0) + v_random * 6.28) * 0.5 + 0.5;
  color += u_colorGold * pulse * 0.15 * (v_firing + u_typingSpeed * 0.5);

  gl_FragColor = vec4(color, alpha);
}
`;

// Synapse line vertex shader with typing reactivity
const synapseVertexShader = `
uniform float u_time;
uniform float u_signalProgress;
uniform float u_activity;
uniform float u_typingSpeed;
uniform float u_submissionPulse;

attribute float a_position;

varying float v_position;
varying float v_signal;
varying float v_energy;

void main() {
  v_position = a_position;

  // Calculate signal pulse position
  float signalWidth = 0.15 + u_typingSpeed * 0.05;
  float signalDist = abs(a_position - u_signalProgress);
  v_signal = smoothstep(signalWidth, 0.0, signalDist) * u_activity;

  // Energy level based on typing
  v_energy = u_typingSpeed * 0.5 + u_submissionPulse;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Synapse line fragment shader
const synapseFragmentShader = `
uniform vec3 u_colorGold;
uniform vec3 u_colorChampagne;
uniform vec3 u_colorDark;
uniform float u_baseOpacity;
uniform float u_typingSpeed;
uniform float u_submissionPulse;

varying float v_position;
varying float v_signal;
varying float v_energy;

void main() {
  // Base line color with gradient - brighter when typing
  float brightness = 0.5 + u_typingSpeed * 0.3;
  vec3 baseColor = mix(u_colorDark * 2.0, u_colorGold * brightness, v_position);

  // Signal pulse color
  vec3 signalColor = mix(u_colorGold, u_colorChampagne, u_submissionPulse);

  // Combine base and signal
  vec3 color = mix(baseColor, signalColor, v_signal + v_energy * 0.3);

  // Alpha with signal boost and typing activity
  float alpha = u_baseOpacity + u_typingSpeed * 0.1 + v_signal * 0.6 + u_submissionPulse * 0.3;

  gl_FragColor = vec4(color, alpha);
}
`;

// Network topology interface
interface NetworkNode {
  position: THREE.Vector3;
  connections: number[];
  layer: number;
}

function generateNetworkTopology(nodeCount: number, layerCount: number): NetworkNode[] {
  const nodes: NetworkNode[] = [];
  const nodesPerLayer = Math.ceil(nodeCount / layerCount);

  for (let layer = 0; layer < layerCount; layer++) {
    const layerNodes = layer === layerCount - 1
      ? nodeCount - nodes.length
      : nodesPerLayer;

    const layerX = (layer / (layerCount - 1)) * 2 - 1;

    for (let i = 0; i < layerNodes; i++) {
      const ySpread = 0.9;
      const y = (i / (layerNodes - 1 || 1)) * 2 * ySpread - ySpread;
      const z = (Math.random() - 0.5) * 0.4;

      nodes.push({
        position: new THREE.Vector3(layerX + (Math.random() - 0.5) * 0.25, y, z),
        connections: [],
        layer,
      });
    }
  }

  // Create connections between adjacent layers
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nextLayerNodes = nodes.filter(n => n.layer === node.layer + 1);

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
  typingSpeed: number;
  submissionPulse: number;
}

function NeuralNodes({ nodes, firingStates, activity, typingSpeed, submissionPulse }: NeuralNodesProps) {
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
      u_typingSpeed: { value: 0 },
      u_submissionPulse: { value: 0 },
      u_questionProgress: { value: 0 },
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
      material.uniforms.u_typingSpeed.value = typingSpeed;
      material.uniforms.u_submissionPulse.value = submissionPulse;

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
  typingSpeed: number;
  submissionPulse: number;
}

function SynapseConnection({ start, end, signalProgress, activity, typingSpeed, submissionPulse }: SynapseConnectionProps) {
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
        u_typingSpeed: { value: 0 },
        u_submissionPulse: { value: 0 },
        u_baseOpacity: { value: 0.12 },
        u_colorGold: { value: new THREE.Color('#D4A853') },
        u_colorChampagne: { value: new THREE.Color('#F5D98A') },
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
    material.uniforms.u_typingSpeed.value = typingSpeed;
    material.uniforms.u_submissionPulse.value = submissionPulse;
  });

  return <primitive object={lineObject} />;
}

interface NeuralNetworkSceneProps {
  mouse: { x: number; y: number };
  quizState: {
    typingSpeed: number;
    submissionPulse: number;
    activityLevel: number;
    isTyping: boolean;
    questionIndex: number;
  };
}

function NeuralNetworkScene({ mouse, quizState }: NeuralNetworkSceneProps) {
  const nodeCount = 50;
  const layerCount = 6;

  const nodes = useMemo(() => generateNetworkTopology(nodeCount, layerCount), []);
  const firingStates = useRef(new Float32Array(nodeCount).fill(0));
  const lastQuestionIndex = useRef(quizState.questionIndex);

  const [activeSignals, setActiveSignals] = useState<Array<{
    from: number;
    to: number;
    progress: number;
    id: string;
  }>>([]);

  // Calculate effective activity
  const effectiveActivity = useMemo(() => {
    return Math.max(0.3, quizState.activityLevel + quizState.typingSpeed * 0.3);
  }, [quizState.activityLevel, quizState.typingSpeed]);

  // Trigger firing cascade from mouse proximity
  useEffect(() => {
    const mousePos = new THREE.Vector3((mouse.x - 0.5) * 2, -(mouse.y - 0.5) * 2, 0);

    nodes.forEach((node, idx) => {
      const dist = node.position.distanceTo(mousePos);
      const firingChance = 0.03 + quizState.typingSpeed * 0.04;
      if (dist < 0.35 && firingStates.current[idx] < 0.5 && Math.random() < firingChance) {
        triggerNodeFiring(idx);
      }
    });
  }, [mouse, nodes, quizState.typingSpeed]);

  // Typing-reactive background activity
  useEffect(() => {
    const baseInterval = 600;
    const interval = setInterval(() => {
      const firingRate = quizState.isTyping
        ? 0.3 + quizState.typingSpeed * 0.4
        : 0.1;

      if (Math.random() < firingRate) {
        // Fire multiple nodes when typing fast
        const nodesToFire = quizState.isTyping ? Math.ceil(quizState.typingSpeed) : 1;
        for (let i = 0; i < nodesToFire; i++) {
          const randomNode = Math.floor(Math.random() * nodes.length);
          if (firingStates.current[randomNode] < 0.3) {
            setTimeout(() => triggerNodeFiring(randomNode), i * 50);
          }
        }
      }
    }, baseInterval - quizState.typingSpeed * 200);

    return () => clearInterval(interval);
  }, [nodes, quizState.isTyping, quizState.typingSpeed]);

  // Submission burst effect
  useEffect(() => {
    if (quizState.submissionPulse > 0.8) {
      // Cascade firing from center outward
      const centerNodes = nodes
        .map((n, idx) => ({ node: n, idx, dist: n.position.length() }))
        .sort((a, b) => a.dist - b.dist);

      centerNodes.forEach(({ idx }, i) => {
        setTimeout(() => {
          if (firingStates.current[idx] < 0.5) {
            triggerNodeFiring(idx);
          }
        }, i * 30);
      });
    }
  }, [quizState.submissionPulse > 0.8, nodes]);

  // Question change effect
  useEffect(() => {
    if (quizState.questionIndex !== lastQuestionIndex.current) {
      lastQuestionIndex.current = quizState.questionIndex;

      // Wave of activation across the network
      const layerDelay = 150;
      for (let layer = 0; layer < layerCount; layer++) {
        const layerNodes = nodes.filter(n => n.layer === layer);
        setTimeout(() => {
          layerNodes.forEach((_, idx) => {
            const nodeIdx = nodes.indexOf(layerNodes[idx]);
            if (firingStates.current[nodeIdx] < 0.3) {
              triggerNodeFiring(nodeIdx);
            }
          });
        }, layer * layerDelay);
      }
    }
  }, [quizState.questionIndex, nodes]);

  const triggerNodeFiring = useCallback((nodeIdx: number) => {
    gsap.to(firingStates.current, {
      [nodeIdx]: 1,
      duration: 0.1,
      onComplete: () => {
        gsap.to(firingStates.current, {
          [nodeIdx]: 0,
          duration: 0.4,
          ease: 'power2.out',
        });
      },
    });

    const node = nodes[nodeIdx];
    node.connections.forEach((connIdx, i) => {
      const signalId = `${nodeIdx}-${connIdx}-${Date.now()}-${Math.random()}`;

      setActiveSignals(prev => [...prev, {
        from: nodeIdx,
        to: connIdx,
        progress: 0,
        id: signalId,
      }]);

      const signalObj = { progress: 0 };
      const signalDuration = 0.25 + Math.random() * 0.15;

      gsap.to(signalObj, {
        progress: 1,
        duration: signalDuration,
        delay: i * 0.03,
        ease: 'power1.inOut',
        onUpdate: () => {
          setActiveSignals(prev => prev.map(s =>
            s.id === signalId ? { ...s, progress: signalObj.progress } : s
          ));
        },
        onComplete: () => {
          setActiveSignals(prev => prev.filter(s => s.id !== signalId));

          const chainChance = 0.5 + quizState.typingSpeed * 0.2;
          if (Math.random() < chainChance && firingStates.current[connIdx] < 0.3) {
            setTimeout(() => triggerNodeFiring(connIdx), 30);
          }
        },
      });
    });
  }, [nodes, quizState.typingSpeed]);

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
      {allConnections.map(({ from, to }) => {
        const activeSignal = activeSignals.find(s => s.from === from && s.to === to);
        return (
          <SynapseConnection
            key={`conn-${from}-${to}`}
            start={nodes[from].position}
            end={nodes[to].position}
            signalProgress={activeSignal?.progress || 0}
            activity={effectiveActivity}
            typingSpeed={quizState.typingSpeed}
            submissionPulse={quizState.submissionPulse}
          />
        );
      })}

      <NeuralNodes
        nodes={nodes}
        firingStates={firingStates.current}
        activity={effectiveActivity}
        typingSpeed={quizState.typingSpeed}
        submissionPulse={quizState.submissionPulse}
      />
    </group>
  );
}

interface ReactiveNeuralNetworkProps {
  className?: string;
  style?: React.CSSProperties;
}

export function ReactiveNeuralNetwork({ className = '', style }: ReactiveNeuralNetworkProps) {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Get quiz reactivity state
  const quizState = useQuizReactivity();

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

  if (prefersReducedMotion) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle, rgba(212,168,83,0.1) 0%, transparent 70%)',
        }}
      >
        <svg viewBox="0 0 100 100" style={{ width: '60%', height: '60%', opacity: 0.4 }}>
          {[15, 30, 45, 60, 75, 85].map((x, i) => (
            <g key={i}>
              {[25, 40, 55, 70].map((y, j) => (
                <circle key={`${i}-${j}`} cx={x} cy={y} r="2.5" fill="#D4A853" opacity={0.5 + Math.random() * 0.3} />
              ))}
            </g>
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
        width: '100%',
        height: '100%',
        ...style,
      }}
      onMouseMove={handleMouseMove}
    >
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <NeuralNetworkScene mouse={mouse} quizState={quizState} />
      </Canvas>
    </div>
  );
}

export default ReactiveNeuralNetwork;
