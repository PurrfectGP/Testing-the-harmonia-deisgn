/**
 * OrganicBackground - WebGL flowing membrane background
 * Session 1: Base organic flowing shader
 * Session 2: Phase-reactive morphing with GSAP transitions
 *
 * Inspired by jellyfish WebGL demo
 * Uses vertex displacement with simplex noise for organic flowing effect
 */

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

// Phase constants matching AppContext
export const ShaderPhase = {
  INTRO: 0,
  VISUAL: 1,
  PSYCHOMETRIC: 2,
  BIOMETRIC: 3,
  FUSION: 4,
  RESULTS: 5,
} as const;

export type ShaderPhase = (typeof ShaderPhase)[keyof typeof ShaderPhase];

// Harmonia color palette
const COLORS = {
  gold: new THREE.Color('#D4A853'),
  maroon: new THREE.Color('#722F37'),
  champagne: new THREE.Color('#F5D98A'),
  dark: new THREE.Color('#12090A'),
  surface: new THREE.Color('#2D1A1C'),
};

// Phase-specific shader configurations
const PHASE_CONFIGS = {
  [ShaderPhase.INTRO]: {
    frequency: 0.4,
    amplitude: 0.12,
    timeSpeed: 0.3,
    waveComplexity: 1.0,
    vortexStrength: 0.0,
    pulseIntensity: 0.15,
    colorShift: 0.0,
  },
  [ShaderPhase.VISUAL]: {
    frequency: 0.5,
    amplitude: 0.15,
    timeSpeed: 0.35,
    waveComplexity: 1.2,
    vortexStrength: 0.0,
    pulseIntensity: 0.2,
    colorShift: 0.1,
  },
  [ShaderPhase.PSYCHOMETRIC]: {
    frequency: 0.8,
    amplitude: 0.22,
    timeSpeed: 0.5,
    waveComplexity: 2.0,
    vortexStrength: 0.1,
    pulseIntensity: 0.35,
    colorShift: 0.2,
  },
  [ShaderPhase.BIOMETRIC]: {
    frequency: 0.6,
    amplitude: 0.18,
    timeSpeed: 0.4,
    waveComplexity: 1.5,
    vortexStrength: 0.2,
    pulseIntensity: 0.25,
    colorShift: 0.15,
  },
  [ShaderPhase.FUSION]: {
    frequency: 1.2,
    amplitude: 0.35,
    timeSpeed: 0.8,
    waveComplexity: 3.0,
    vortexStrength: 0.8,
    pulseIntensity: 0.6,
    colorShift: 0.4,
  },
  [ShaderPhase.RESULTS]: {
    frequency: 0.5,
    amplitude: 0.1,
    timeSpeed: 0.25,
    waveComplexity: 1.0,
    vortexStrength: 0.0,
    pulseIntensity: 0.3,
    colorShift: 0.0,
  },
};

// Trail size for mouse history
const TRAIL_SIZE = 5;

// Enhanced vertex shader with phase-reactive displacement and mouse trail
const vertexShader = `
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_mouseTrail[5];
uniform float u_trailDecay[5];
uniform float u_mouseVelocity;
uniform float u_frequency;
uniform float u_amplitude;
uniform float u_mouseInfluence;
uniform float u_phase;
uniform float u_timeSpeed;
uniform float u_waveComplexity;
uniform float u_vortexStrength;

varying vec2 vUv;
varying float vElevation;
varying float vDistortion;
varying float vPhaseEffect;
varying float vMouseProximity;

// Simplex noise functions
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Fractal Brownian Motion with variable octaves
float fbm(vec3 p, float lacunarity, float gain, int octaves) {
  float sum = 0.0;
  float amp = 1.0;
  float freq = 1.0;

  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    sum += snoise(p * freq) * amp;
    amp *= gain;
    freq *= lacunarity;
  }

  return sum;
}

void main() {
  vUv = uv;

  vec3 pos = position;
  float time = u_time * u_timeSpeed;

  // Wave complexity determines fBM octaves
  int octaves = int(u_waveComplexity) + 2;

  // Primary organic wave using fBM
  float noiseVal = fbm(
    vec3(pos.x * u_frequency, pos.y * u_frequency, time),
    2.0,
    0.5,
    octaves
  );

  // Secondary detail wave - more active in higher phases
  float detailNoise = snoise(vec3(
    pos.x * u_frequency * 2.0 + time * 1.5,
    pos.y * u_frequency * 2.0,
    time * 0.5
  )) * 0.3 * u_waveComplexity;

  // Psychometric: Neural spike patterns
  float neuralSpike = 0.0;
  if (u_phase > 1.5 && u_phase < 2.5) {
    float spikePattern = sin(pos.x * 20.0 + time * 8.0) * sin(pos.y * 20.0 + time * 6.0);
    neuralSpike = max(0.0, spikePattern) * 0.15;
  }

  // Biometric: DNA helix twist pattern
  float helixTwist = 0.0;
  if (u_phase > 2.5 && u_phase < 3.5) {
    float angle = atan(pos.y, pos.x);
    float radius = length(pos.xy);
    helixTwist = sin(angle * 2.0 + radius * 3.0 - time * 2.0) * 0.1;
  }

  // Fusion: Vortex convergence
  float vortex = 0.0;
  if (u_vortexStrength > 0.01) {
    vec2 center = vec2(0.0);
    float dist = length(pos.xy - center);
    float angle = atan(pos.y - center.y, pos.x - center.x);
    vortex = sin(angle * 4.0 + dist * 5.0 - time * 4.0) * u_vortexStrength;
    vortex *= exp(-dist * 0.5); // Fade with distance
  }

  // Enhanced mouse interaction with trail and spring physics
  vec2 mousePos = u_mouse * 2.0 - 1.0;
  float mouseDist = distance(pos.xy, mousePos);

  // Primary mouse ripple with velocity-based intensity
  float velocityBoost = 1.0 + u_mouseVelocity * 2.0;
  float mouseWave = sin(mouseDist * 12.0 - u_time * 4.0) * exp(-mouseDist * 1.8);
  float primaryEffect = mouseWave * u_mouseInfluence * velocityBoost;

  // Bulge effect - push vertices away from cursor
  float bulgeRadius = 0.4;
  float bulgePower = smoothstep(bulgeRadius, 0.0, mouseDist);
  float bulgeEffect = bulgePower * 0.15 * (1.0 + u_mouseVelocity);

  // Mouse trail ripples - fading echoes of previous positions
  float trailEffect = 0.0;
  for (int i = 0; i < 5; i++) {
    vec2 trailPos = u_mouseTrail[i] * 2.0 - 1.0;
    float trailDist = distance(pos.xy, trailPos);
    float trailWave = sin(trailDist * 8.0 - u_time * 2.5 - float(i) * 0.5) * exp(-trailDist * 2.5);
    trailEffect += trailWave * u_trailDecay[i] * 0.3;
  }

  // Total mouse effect
  float mouseEffect = (primaryEffect + bulgeEffect + trailEffect) * u_mouseInfluence;

  // Track closest mouse proximity for fragment shader
  float mouseProximity = exp(-mouseDist * 3.0);

  // Combine all effects
  float elevation = (noiseVal + detailNoise + neuralSpike + helixTwist + vortex) * u_amplitude + mouseEffect * 0.2;

  pos.z += elevation;

  vElevation = elevation;
  vDistortion = noiseVal;
  vPhaseEffect = neuralSpike + helixTwist + vortex;
  vMouseProximity = mouseProximity;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

// Enhanced fragment shader with phase-reactive coloring
const fragmentShader = `
uniform float u_time;
uniform vec3 u_colorGold;
uniform vec3 u_colorMaroon;
uniform vec3 u_colorChampagne;
uniform vec3 u_colorDark;
uniform float u_phase;
uniform float u_intensity;
uniform float u_pulseIntensity;
uniform float u_colorShift;
uniform float u_timeSpeed;

varying vec2 vUv;
varying float vElevation;
varying float vDistortion;
varying float vPhaseEffect;
varying float vMouseProximity;

// Simplex 2D noise for fragment effects
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise2D(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(vec4(i, i + 1.0, i + 1.0)).xy;
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m * m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// HSV to RGB conversion
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  float time = u_time * u_timeSpeed;

  // Base gradient from dark
  vec3 baseColor = mix(u_colorDark, u_colorDark * 1.3, vUv.y);

  // Organic flowing pattern
  float pattern = snoise2D(vUv * 3.0 + time * 0.3);
  float pattern2 = snoise2D(vUv * 6.0 - time * 0.4) * 0.5;
  float combinedPattern = pattern + pattern2;

  // Color based on elevation and pattern
  float colorMix = (vElevation + 0.5) * 0.5 + combinedPattern * 0.2;
  colorMix = clamp(colorMix, 0.0, 1.0);

  // Apply color shift based on phase
  colorMix = colorMix + u_colorShift * sin(time * 2.0) * 0.1;
  colorMix = clamp(colorMix, 0.0, 1.0);

  // Three-way color blend: dark -> maroon -> gold
  vec3 gradientColor;
  if (colorMix < 0.5) {
    gradientColor = mix(u_colorDark * 1.2, u_colorMaroon, colorMix * 2.0);
  } else {
    gradientColor = mix(u_colorMaroon, u_colorGold, (colorMix - 0.5) * 2.0);
  }

  // Psychometric phase: Add neural firing highlights
  if (u_phase > 1.5 && u_phase < 2.5) {
    float neural = step(0.7, snoise2D(vUv * 30.0 + time * 5.0));
    gradientColor = mix(gradientColor, u_colorChampagne, neural * 0.4);
  }

  // Fusion phase: Intensify colors toward center
  if (u_phase > 3.5 && u_phase < 4.5) {
    float distFromCenter = length(vUv - 0.5);
    float fusionGlow = exp(-distFromCenter * 4.0);
    gradientColor = mix(gradientColor, u_colorChampagne, fusionGlow * 0.5);
    gradientColor += u_colorGold * fusionGlow * 0.3;
  }

  // Results phase: Subtle celebration shimmer
  if (u_phase > 4.5) {
    float shimmer = sin(vUv.x * 50.0 + time * 3.0) * sin(vUv.y * 50.0 + time * 2.0);
    shimmer = max(0.0, shimmer);
    gradientColor = mix(gradientColor, u_colorChampagne, shimmer * 0.15);
  }

  // Add champagne highlights on peaks
  float highlight = smoothstep(0.3, 0.6, vElevation);
  gradientColor = mix(gradientColor, u_colorChampagne, highlight * 0.3);

  // Phase effect coloring
  gradientColor += u_colorGold * vPhaseEffect * 0.5;

  // Subtle vein-like patterns
  float veins = abs(snoise2D(vUv * 15.0 + vec2(time * 0.15, 0.0)));
  veins = smoothstep(0.4, 0.5, veins);
  gradientColor = mix(gradientColor, u_colorGold * 0.5, veins * 0.15);

  // Ambient pulsing glow - intensity varies by phase
  float pulse = sin(time * 1.5) * 0.5 + 0.5;
  float glow = smoothstep(0.2, 0.5, vElevation) * pulse * u_pulseIntensity;
  gradientColor += u_colorGold * glow;

  // Mouse proximity highlighting - golden glow near cursor
  float mouseGlow = vMouseProximity * 0.4;
  gradientColor = mix(gradientColor, u_colorChampagne, mouseGlow);
  gradientColor += u_colorGold * vMouseProximity * 0.15;

  // Edge darkening (vignette effect)
  float vignette = 1.0 - length(vUv - 0.5) * 0.8;
  vignette = smoothstep(0.0, 1.0, vignette);

  // Apply intensity and vignette
  vec3 finalColor = mix(u_colorDark, gradientColor, u_intensity);
  finalColor *= vignette;

  // Subtle film grain for organic texture
  float grain = snoise2D(vUv * 500.0 + u_time * 10.0) * 0.02;
  finalColor += grain;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

interface OrganicMeshProps {
  mouse: { x: number; y: number };
  mouseTrail: Array<{ x: number; y: number }>;
  mouseVelocity: number;
  phase: ShaderPhase;
  intensity?: number;
}

function OrganicMesh({ mouse, mouseTrail, mouseVelocity, phase, intensity = 1.0 }: OrganicMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  // Animated uniform values for GSAP transitions
  const animatedValues = useRef({
    frequency: PHASE_CONFIGS[ShaderPhase.INTRO].frequency,
    amplitude: PHASE_CONFIGS[ShaderPhase.INTRO].amplitude,
    timeSpeed: PHASE_CONFIGS[ShaderPhase.INTRO].timeSpeed,
    waveComplexity: PHASE_CONFIGS[ShaderPhase.INTRO].waveComplexity,
    vortexStrength: PHASE_CONFIGS[ShaderPhase.INTRO].vortexStrength,
    pulseIntensity: PHASE_CONFIGS[ShaderPhase.INTRO].pulseIntensity,
    colorShift: PHASE_CONFIGS[ShaderPhase.INTRO].colorShift,
  });

  // Create shader material with uniforms
  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_mouseTrail: { value: Array(TRAIL_SIZE).fill(null).map(() => new THREE.Vector2(0.5, 0.5)) },
      u_trailDecay: { value: [1.0, 0.8, 0.6, 0.4, 0.2] },
      u_mouseVelocity: { value: 0 },
      u_frequency: { value: animatedValues.current.frequency },
      u_amplitude: { value: animatedValues.current.amplitude },
      u_mouseInfluence: { value: 0.6 },
      u_colorGold: { value: COLORS.gold },
      u_colorMaroon: { value: COLORS.maroon },
      u_colorChampagne: { value: COLORS.champagne },
      u_colorDark: { value: COLORS.dark },
      u_phase: { value: phase },
      u_intensity: { value: intensity },
      u_timeSpeed: { value: animatedValues.current.timeSpeed },
      u_waveComplexity: { value: animatedValues.current.waveComplexity },
      u_vortexStrength: { value: animatedValues.current.vortexStrength },
      u_pulseIntensity: { value: animatedValues.current.pulseIntensity },
      u_colorShift: { value: animatedValues.current.colorShift },
    }),
    []
  );

  // GSAP transition when phase changes
  useEffect(() => {
    const config = PHASE_CONFIGS[phase];
    const transitionDuration = phase === ShaderPhase.FUSION ? 0.5 : 1.5;

    gsap.to(animatedValues.current, {
      frequency: config.frequency,
      amplitude: config.amplitude,
      timeSpeed: config.timeSpeed,
      waveComplexity: config.waveComplexity,
      vortexStrength: config.vortexStrength,
      pulseIntensity: config.pulseIntensity,
      colorShift: config.colorShift,
      duration: transitionDuration,
      ease: phase === ShaderPhase.FUSION ? 'power2.in' : 'power2.inOut',
    });
  }, [phase]);

  // Animation loop
  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = state.clock.elapsedTime;

      // Update uniforms from animated values
      material.uniforms.u_frequency.value = animatedValues.current.frequency;
      material.uniforms.u_amplitude.value = animatedValues.current.amplitude;
      material.uniforms.u_timeSpeed.value = animatedValues.current.timeSpeed;
      material.uniforms.u_waveComplexity.value = animatedValues.current.waveComplexity;
      material.uniforms.u_vortexStrength.value = animatedValues.current.vortexStrength;
      material.uniforms.u_pulseIntensity.value = animatedValues.current.pulseIntensity;
      material.uniforms.u_colorShift.value = animatedValues.current.colorShift;
      material.uniforms.u_phase.value = phase;
      material.uniforms.u_intensity.value = intensity;

      // Smooth mouse lerp with spring physics
      const targetMouse = new THREE.Vector2(mouse.x, 1 - mouse.y);
      material.uniforms.u_mouse.value.lerp(targetMouse, 0.08);

      // Update mouse trail uniforms
      mouseTrail.forEach((pos, i) => {
        material.uniforms.u_mouseTrail.value[i].set(pos.x, 1 - pos.y);
      });

      // Update velocity with smooth decay
      material.uniforms.u_mouseVelocity.value += (mouseVelocity - material.uniforms.u_mouseVelocity.value) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[viewport.width * 1.5, viewport.height * 1.5, 128, 128]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

interface OrganicBackgroundProps {
  phase?: ShaderPhase;
  intensity?: number;
  className?: string;
}

export function OrganicBackground({
  phase = ShaderPhase.INTRO,
  intensity = 1.0,
  className = '',
}: OrganicBackgroundProps) {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [mouseTrail, setMouseTrail] = useState<Array<{ x: number; y: number }>>(
    Array(TRAIL_SIZE).fill({ x: 0.5, y: 0.5 })
  );
  const [mouseVelocity, setMouseVelocity] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMouseRef = useRef({ x: 0.5, y: 0.5, time: Date.now() });
  const trailUpdateRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update mouse position with velocity tracking
  const updateMousePosition = useCallback((x: number, y: number) => {
    const now = Date.now();
    const last = lastMouseRef.current;
    const dt = Math.max(1, now - last.time);
    const dx = x - last.x;
    const dy = y - last.y;
    const velocity = Math.sqrt(dx * dx + dy * dy) / dt * 100;

    lastMouseRef.current = { x, y, time: now };
    setMouse({ x, y });
    setMouseVelocity(Math.min(velocity, 2)); // Cap velocity
  }, []);

  // Update trail periodically for smooth decay
  useEffect(() => {
    const updateTrail = () => {
      setMouseTrail((prev) => {
        const newTrail = [{ ...mouse }, ...prev.slice(0, TRAIL_SIZE - 1)];
        return newTrail;
      });
    };

    trailUpdateRef.current = setInterval(updateTrail, 50);
    return () => {
      if (trailUpdateRef.current) clearInterval(trailUpdateRef.current);
    };
  }, [mouse]);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        updateMousePosition(x, y);
      }
    };

    // Touch support
    const handleTouchMove = (e: TouchEvent) => {
      if (containerRef.current && e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = containerRef.current.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / rect.width;
        const y = (touch.clientY - rect.top) / rect.height;
        updateMousePosition(x, y);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (containerRef.current && e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = containerRef.current.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / rect.width;
        const y = (touch.clientY - rect.top) / rect.height;
        // Reset trail on new touch
        setMouseTrail(Array(TRAIL_SIZE).fill({ x, y }));
        updateMousePosition(x, y);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [updateMousePosition]);

  // Decay velocity over time
  useEffect(() => {
    const decayInterval = setInterval(() => {
      setMouseVelocity((v) => v * 0.95);
    }, 50);
    return () => clearInterval(decayInterval);
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

  // Fallback for reduced motion
  if (prefersReducedMotion) {
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
          background: 'radial-gradient(ellipse at center, #2D1A1C 0%, #12090A 100%)',
          zIndex: 0,
        }}
      />
    );
  }

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
        zIndex: 0,
      }}
    >
      <Canvas
        camera={{ position: [0, 2, 0], fov: 75 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <OrganicMesh
          mouse={mouse}
          mouseTrail={mouseTrail}
          mouseVelocity={mouseVelocity}
          phase={phase}
          intensity={intensity}
        />
      </Canvas>
    </div>
  );
}

export default OrganicBackground;
