/**
 * ShaderEye - WebGL shader-based eye visualization
 * Session 5: Eye Visualization WebGL Overhaul
 *
 * Features:
 * - Procedural iris fibers using polar coordinate noise
 * - Realistic pupil dilation with smooth transitions
 * - Subsurface scattering simulation for sclera
 * - Specular highlights tracking cursor position
 * - Multi-layer parallax in shader
 * - Blink animation with eyelid displacement
 * - Micro-saccades for organic movement
 */

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

// Vertex shader for eye visualization
const eyeVertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment shader for realistic eye
const eyeFragmentShader = `
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_microSaccade;
uniform float u_pupilDilation;
uniform float u_blinkProgress;
uniform vec3 u_colorGold;
uniform vec3 u_colorMaroon;
uniform vec3 u_colorChampagne;
uniform vec3 u_colorDark;

varying vec2 vUv;
varying vec3 vPosition;

// Simplex noise for procedural patterns
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

// Fractal noise
float fbm(vec2 p, int octaves) {
  float sum = 0.0;
  float amp = 1.0;
  float freq = 1.0;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    sum += snoise2D(p * freq) * amp;
    amp *= 0.5;
    freq *= 2.0;
  }
  return sum;
}

void main() {
  // Center coordinates
  vec2 center = vec2(0.5, 0.5);

  // Apply micro-saccade offset
  vec2 eyeCenter = center + u_microSaccade * 0.02;

  // Mouse-based parallax offset
  vec2 mouseOffset = (u_mouse - 0.5) * 0.08;

  // Calculate from center
  vec2 uv = vUv - eyeCenter - mouseOffset;
  float dist = length(uv);
  float angle = atan(uv.y, uv.x);

  // Pupil size (0.08 to 0.18 based on dilation)
  float pupilSize = mix(0.08, 0.18, u_pupilDilation);
  float irisSize = 0.35;
  float scleraSize = 0.45;

  // Initialize color
  vec3 color = u_colorDark;
  float alpha = 1.0;

  // Outer void (outside eye)
  if (dist > scleraSize) {
    color = u_colorDark;
    alpha = 0.0;
  }
  // Sclera (white of eye) with subsurface scattering
  else if (dist > irisSize) {
    // Subsurface scattering effect
    float scleraNoise = fbm(vUv * 20.0, 3) * 0.1;
    vec3 scleraBase = vec3(0.15, 0.08, 0.09); // Dark reddish
    vec3 scleraHighlight = u_colorMaroon * 0.3;

    // Gradient from iris to edge
    float t = (dist - irisSize) / (scleraSize - irisSize);
    color = mix(scleraHighlight, scleraBase, t);
    color += scleraNoise;

    // Add subtle veins
    float veins = abs(sin(angle * 8.0 + fbm(vec2(angle * 5.0, dist * 10.0), 2) * 3.0));
    veins = smoothstep(0.7, 0.9, veins) * 0.15;
    color = mix(color, u_colorMaroon * 0.5, veins);
  }
  // Iris - procedural fiber pattern
  else if (dist > pupilSize) {
    // Polar coordinate noise for iris fibers
    float fiberCount = 48.0;
    float fiberAngle = angle * fiberCount / 6.28318;
    float fiberNoise = snoise2D(vec2(fiberAngle, dist * 20.0 + u_time * 0.1));

    // Radial fibers
    float fiber = sin(angle * fiberCount + fiberNoise * 2.0) * 0.5 + 0.5;
    fiber = pow(fiber, 0.5);

    // Concentric rings
    float rings = sin(dist * 80.0 + snoise2D(vec2(angle * 3.0, 0.0)) * 2.0) * 0.5 + 0.5;

    // Color gradient from pupil to iris edge
    float irisT = (dist - pupilSize) / (irisSize - pupilSize);

    // Base iris colors
    vec3 innerIris = u_colorMaroon * 1.2;
    vec3 midIris = mix(u_colorMaroon, u_colorGold * 0.6, 0.5);
    vec3 outerIris = u_colorGold * 0.8;

    // Three-way gradient
    vec3 irisBase;
    if (irisT < 0.4) {
      irisBase = mix(innerIris, midIris, irisT / 0.4);
    } else {
      irisBase = mix(midIris, outerIris, (irisT - 0.4) / 0.6);
    }

    // Apply fiber and ring patterns
    color = irisBase;
    color = mix(color, u_colorGold * 0.7, fiber * 0.3);
    color = mix(color, u_colorMaroon * 0.8, rings * 0.15);

    // Add crypts (darker spots) in iris
    float crypts = fbm(vec2(angle * 10.0, dist * 30.0), 4);
    crypts = smoothstep(0.2, 0.5, crypts) * 0.2;
    color = mix(color, u_colorDark, crypts);

    // Limbal ring (dark ring at iris edge)
    float limbalRing = smoothstep(irisSize - 0.02, irisSize, dist);
    color = mix(color, u_colorDark, limbalRing * 0.5);

    // Inner ring near pupil
    float innerRing = smoothstep(pupilSize + 0.03, pupilSize, dist);
    color = mix(color, u_colorDark * 1.2, innerRing * 0.3);
  }
  // Pupil
  else {
    // Pupil with slight gradient
    float pupilGrad = dist / pupilSize;
    color = mix(u_colorDark * 0.3, u_colorDark * 0.8, pupilGrad);

    // Subtle reflection in pupil
    float reflection = smoothstep(0.6, 0.3, pupilGrad);
    color += u_colorDark * 0.2 * reflection;
  }

  // Specular highlight (follows mouse slightly opposite)
  vec2 highlightPos = center - mouseOffset * 0.5 + vec2(-0.08, -0.1);
  float highlightDist = distance(vUv, highlightPos);
  float highlight = smoothstep(0.08, 0.02, highlightDist);
  color = mix(color, u_colorChampagne, highlight * 0.8);

  // Secondary smaller highlight
  vec2 highlight2Pos = center - mouseOffset * 0.3 + vec2(0.05, 0.02);
  float highlight2Dist = distance(vUv, highlight2Pos);
  float highlight2 = smoothstep(0.03, 0.01, highlight2Dist);
  color = mix(color, vec3(1.0), highlight2 * 0.6);

  // Ambient glow around iris
  float irisGlow = smoothstep(irisSize + 0.05, irisSize - 0.05, dist);
  irisGlow *= smoothstep(pupilSize - 0.02, pupilSize + 0.05, dist);
  color += u_colorGold * irisGlow * 0.15;

  // Blink effect - eyelids closing
  if (u_blinkProgress > 0.01) {
    float lidTop = 0.5 - u_blinkProgress * 0.5;
    float lidBottom = 0.5 + u_blinkProgress * 0.5;

    if (vUv.y < lidTop || vUv.y > lidBottom) {
      color = u_colorDark;
      alpha = 1.0;
    }

    // Lid edge shadow
    float topShadow = smoothstep(lidTop - 0.05, lidTop, vUv.y);
    float bottomShadow = smoothstep(lidBottom + 0.05, lidBottom, vUv.y);
    color *= mix(0.7, 1.0, min(topShadow, bottomShadow));
  }

  // Outer glow/rim lighting
  float rimLight = smoothstep(scleraSize, scleraSize - 0.08, dist);
  rimLight *= smoothstep(irisSize + 0.05, scleraSize - 0.02, dist);
  color += u_colorGold * rimLight * 0.1;

  // Vignette within eye
  float eyeVignette = smoothstep(scleraSize, scleraSize - 0.15, dist);
  alpha *= eyeVignette;

  // Pulsing glow
  float pulse = sin(u_time * 0.8) * 0.5 + 0.5;
  color += u_colorGold * pulse * 0.03 * (1.0 - dist / scleraSize);

  gl_FragColor = vec4(color, alpha);
}
`;

interface EyeMeshProps {
  mouse: { x: number; y: number };
  pupilDilation: number;
  blinkProgress: number;
  microSaccade: { x: number; y: number };
}

function EyeMesh({ mouse, pupilDilation, blinkProgress, microSaccade }: EyeMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Uniforms
  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_microSaccade: { value: new THREE.Vector2(0, 0) },
      u_pupilDilation: { value: 0 },
      u_blinkProgress: { value: 0 },
      u_colorGold: { value: new THREE.Color('#D4A853') },
      u_colorMaroon: { value: new THREE.Color('#722F37') },
      u_colorChampagne: { value: new THREE.Color('#F5D98A') },
      u_colorDark: { value: new THREE.Color('#12090A') },
    }),
    []
  );

  // Animation loop
  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = state.clock.elapsedTime;

      // Smooth mouse lerp
      const targetMouse = new THREE.Vector2(mouse.x, mouse.y);
      material.uniforms.u_mouse.value.lerp(targetMouse, 0.08);

      // Update other uniforms
      material.uniforms.u_microSaccade.value.set(microSaccade.x, microSaccade.y);
      material.uniforms.u_pupilDilation.value += (pupilDilation - material.uniforms.u_pupilDilation.value) * 0.1;
      material.uniforms.u_blinkProgress.value += (blinkProgress - material.uniforms.u_blinkProgress.value) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={eyeVertexShader}
        fragmentShader={eyeFragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

// Decorative outer ring
function OuterRing() {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <mesh ref={ringRef} position={[0, 0, -0.01]}>
      <ringGeometry args={[0.92, 0.95, 64]} />
      <meshBasicMaterial color="#D4A853" transparent opacity={0.3} />
    </mesh>
  );
}

interface ShaderEyeProps {
  size?: number;
  className?: string;
}

export function ShaderEye({ size = 400, className = '' }: ShaderEyeProps) {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [pupilDilation, setPupilDilation] = useState(0);
  const [blinkProgress, setBlinkProgress] = useState(0);
  const [microSaccade, setMicroSaccade] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Track mouse position
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMouse({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Listen for file drag events for pupil dilation
  useEffect(() => {
    const handleDragEnter = () => setPupilDilation(1);
    const handleDragLeave = () => setPupilDilation(0);
    const handleDrop = () => setPupilDilation(0);

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  // Random blink animation
  useEffect(() => {
    const scheduleBlink = () => {
      const nextBlink = 3000 + Math.random() * 5000;
      return setTimeout(() => {
        // Blink animation
        gsap.to({ progress: 0 }, {
          progress: 1,
          duration: 0.15,
          onUpdate: function() {
            setBlinkProgress(this.targets()[0].progress);
          },
          onComplete: () => {
            gsap.to({ progress: 1 }, {
              progress: 0,
              duration: 0.1,
              onUpdate: function() {
                setBlinkProgress(this.targets()[0].progress);
              },
            });
          },
        });
        scheduleBlink();
      }, nextBlink);
    };

    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  // Micro-saccade animation
  useEffect(() => {
    const saccadeInterval = setInterval(() => {
      setMicroSaccade({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
      });
    }, 100);

    return () => clearInterval(saccadeInterval);
  }, []);

  // Handle click for manual blink
  const handleClick = useCallback(() => {
    gsap.to({ progress: 0 }, {
      progress: 1,
      duration: 0.1,
      onUpdate: function() {
        setBlinkProgress(this.targets()[0].progress);
      },
      onComplete: () => {
        gsap.to({ progress: 1 }, {
          progress: 0,
          duration: 0.08,
          onUpdate: function() {
            setBlinkProgress(this.targets()[0].progress);
          },
        });
      },
    });
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
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle, #722F37 0%, #12090A 70%)',
          borderRadius: '50%',
        }}
      >
        <div
          style={{
            width: '30%',
            height: '30%',
            background: 'radial-gradient(circle, #2D1A1C 0%, #12090A 100%)',
            borderRadius: '50%',
            border: '2px solid #D4A853',
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
      onClick={handleClick}
    >
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <OuterRing />
        <EyeMesh
          mouse={mouse}
          pupilDilation={pupilDilation}
          blinkProgress={blinkProgress}
          microSaccade={microSaccade}
        />
      </Canvas>
    </div>
  );
}

export default ShaderEye;
