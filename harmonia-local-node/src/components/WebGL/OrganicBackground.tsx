/**
 * OrganicBackground - WebGL flowing membrane background
 * Inspired by jellyfish WebGL demo
 * Uses vertex displacement with simplex noise for organic flowing effect
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Harmonia color palette
const COLORS = {
  gold: new THREE.Color('#D4A853'),
  maroon: new THREE.Color('#722F37'),
  champagne: new THREE.Color('#F5D98A'),
  dark: new THREE.Color('#12090A'),
  surface: new THREE.Color('#2D1A1C'),
};

// Vertex shader with simplex noise and displacement
const vertexShader = `
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_frequency;
uniform float u_amplitude;
uniform float u_mouseInfluence;

varying vec2 vUv;
varying float vElevation;
varying float vDistortion;

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

// Fractal Brownian Motion
float fbm(vec3 p, float lacunarity, float gain) {
  float sum = 0.0;
  float amp = 1.0;
  float freq = 1.0;

  for (int i = 0; i < 4; i++) {
    sum += snoise(p * freq) * amp;
    amp *= gain;
    freq *= lacunarity;
  }

  return sum;
}

void main() {
  vUv = uv;

  vec3 pos = position;

  // Primary organic wave using fBM
  float noiseVal = fbm(
    vec3(pos.x * u_frequency, pos.y * u_frequency, u_time * 0.3),
    2.0,
    0.5
  );

  // Secondary detail wave
  float detailNoise = snoise(vec3(
    pos.x * u_frequency * 2.0 + u_time * 0.5,
    pos.y * u_frequency * 2.0,
    u_time * 0.2
  )) * 0.3;

  // Mouse interaction - creates organic ripple
  vec2 mousePos = u_mouse * 2.0 - 1.0;
  float mouseDist = distance(pos.xy, mousePos);
  float mouseWave = sin(mouseDist * 10.0 - u_time * 3.0) * exp(-mouseDist * 2.0);
  float mouseEffect = mouseWave * u_mouseInfluence;

  // Combine all effects
  float elevation = (noiseVal + detailNoise) * u_amplitude + mouseEffect * 0.15;

  pos.z += elevation;

  vElevation = elevation;
  vDistortion = noiseVal;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

// Fragment shader with Harmonia color palette
const fragmentShader = `
uniform float u_time;
uniform vec3 u_colorGold;
uniform vec3 u_colorMaroon;
uniform vec3 u_colorChampagne;
uniform vec3 u_colorDark;
uniform float u_phase;
uniform float u_intensity;

varying vec2 vUv;
varying float vElevation;
varying float vDistortion;

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

void main() {
  // Base gradient from dark
  vec3 baseColor = mix(u_colorDark, u_colorDark * 1.3, vUv.y);

  // Organic flowing pattern
  float pattern = snoise2D(vUv * 3.0 + u_time * 0.1);
  float pattern2 = snoise2D(vUv * 6.0 - u_time * 0.15) * 0.5;
  float combinedPattern = pattern + pattern2;

  // Color based on elevation and pattern
  float colorMix = (vElevation + 0.5) * 0.5 + combinedPattern * 0.2;
  colorMix = clamp(colorMix, 0.0, 1.0);

  // Three-way color blend: dark -> maroon -> gold
  vec3 gradientColor;
  if (colorMix < 0.5) {
    gradientColor = mix(u_colorDark * 1.2, u_colorMaroon, colorMix * 2.0);
  } else {
    gradientColor = mix(u_colorMaroon, u_colorGold, (colorMix - 0.5) * 2.0);
  }

  // Add champagne highlights on peaks
  float highlight = smoothstep(0.3, 0.6, vElevation);
  gradientColor = mix(gradientColor, u_colorChampagne, highlight * 0.3);

  // Subtle vein-like patterns
  float veins = abs(snoise2D(vUv * 15.0 + vec2(u_time * 0.05, 0.0)));
  veins = smoothstep(0.4, 0.5, veins);
  gradientColor = mix(gradientColor, u_colorGold * 0.5, veins * 0.15);

  // Ambient pulsing glow
  float pulse = sin(u_time * 0.5) * 0.5 + 0.5;
  float glow = smoothstep(0.2, 0.5, vElevation) * pulse * 0.2;
  gradientColor += u_colorGold * glow;

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
  frequency?: number;
  amplitude?: number;
  intensity?: number;
}

function OrganicMesh({ mouse, frequency = 0.5, amplitude = 0.15, intensity = 1.0 }: OrganicMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  // Create shader material with uniforms
  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_frequency: { value: frequency },
      u_amplitude: { value: amplitude },
      u_mouseInfluence: { value: 0.5 },
      u_colorGold: { value: COLORS.gold },
      u_colorMaroon: { value: COLORS.maroon },
      u_colorChampagne: { value: COLORS.champagne },
      u_colorDark: { value: COLORS.dark },
      u_phase: { value: 0 },
      u_intensity: { value: intensity },
    }),
    [frequency, amplitude, intensity]
  );

  // Animation loop
  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = state.clock.elapsedTime;

      // Smooth mouse lerp
      const targetMouse = new THREE.Vector2(mouse.x, 1 - mouse.y); // Flip Y
      material.uniforms.u_mouse.value.lerp(targetMouse, 0.05);
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
  frequency?: number;
  amplitude?: number;
  intensity?: number;
  className?: string;
}

export function OrganicBackground({
  frequency = 0.5,
  amplitude = 0.15,
  intensity = 1.0,
  className = '',
}: OrganicBackgroundProps) {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMouse({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
          frequency={frequency}
          amplitude={amplitude}
          intensity={intensity}
        />
      </Canvas>
    </div>
  );
}

export default OrganicBackground;
