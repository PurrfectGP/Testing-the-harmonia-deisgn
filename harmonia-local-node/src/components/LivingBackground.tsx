/**
 * LivingBackground - The visual engine layer
 * Manages transitions between Particle Swarm, Eye, Orbit, and Helix visualizations
 *
 * SESSION 1 ENHANCEMENTS:
 * - Polygon mask plugin: Particles form Celtic Knot logo shape
 * - Mouse repulsion/attraction: Particles explode on hover, return to form
 * - Color gradient animation: Gold → Champagne → Maroon spectrum
 * - Multi-layer parallax: Foreground/background depth layering
 */

import { useEffect, useMemo, useCallback, useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { loadPolygonMaskPlugin } from '@tsparticles/plugin-polygon-mask';
import type { ISourceOptions } from '@tsparticles/engine';
import { useApp, Phase } from '../context/AppContext';
import { Logo } from './Logo';
import { OrganicBackground, ShaderPhase } from './WebGL/OrganicBackground';
import { useGlobalActivity } from '../hooks/useGlobalActivity';

// Lazy load 3D/WebGL components for performance
const ShaderEye = lazy(() => import('./WebGL/ShaderEye'));
const ShaderHelix = lazy(() => import('./WebGL/ShaderHelix'));
const FusionVortex = lazy(() => import('./WebGL/FusionVortex'));
const CelebrationBurst = lazy(() => import('./WebGL/CelebrationBurst'));

// Session 28: Pixel particle magnetization logo reveal
const PixelLogoReveal = lazy(() => import('./WebGL/PixelLogoReveal'));

// Session 16-20: Quiz-Reactive WebGL Components
const ReactiveNeuralNetwork = lazy(() => import('./WebGL/ReactiveNeuralNetwork'));
const QuantumOrbit = lazy(() => import('./WebGL/QuantumOrbit'));
const ThoughtStream = lazy(() => import('./WebGL/ThoughtStream'));
const PulseField = lazy(() => import('./WebGL/PulseField'));

// Styles
const styles = {
  container: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 0,
    overflow: 'hidden',
    background: 'var(--void-black)',
  },
  layer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgContainer: {
    width: '60vw',
    height: '60vh',
    maxWidth: '600px',
    maxHeight: '600px',
  },
};

// Color palette for gradient animation
const PARTICLE_COLORS = ['#D4A853', '#F0C86E', '#F5D98A', '#C4956A', '#722F37'];

// ============================================
// ADVANCED PARTICLE SWARM (Session 1 Enhanced)
// Features: Polygon Mask, Multi-layer Parallax, Color Animation
// NOTE: Exported for potential future use but currently replaced by PixelLogoReveal in INTRO phase
// ============================================
export function AdvancedParticleSwarm({ withLogoMask = false }: { withLogoMask?: boolean }) {
  const [init, setInit] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
      await loadPolygonMaskPlugin(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // LAYER 1: Background particles (slower, smaller, subtle)
  const backgroundParticlesOptions = useMemo<ISourceOptions>(() => ({
    fullScreen: false,
    background: { color: { value: 'transparent' } },
    fpsLimit: prefersReducedMotion ? 30 : 60,
    particles: {
      color: {
        value: PARTICLE_COLORS,
        animation: {
          h: { enable: !prefersReducedMotion, speed: 5, sync: false },
          s: { enable: false },
          l: { enable: !prefersReducedMotion, speed: 2, sync: false, offset: { min: -10, max: 10 } },
        }
      },
      links: {
        color: { value: '#D4A853' },
        distance: 200,
        enable: true,
        opacity: 0.15,
        width: 0.5,
        triangles: { enable: false },
      },
      move: {
        enable: !prefersReducedMotion,
        speed: 0.3,
        direction: 'none' as const,
        outModes: { default: 'bounce' as const },
        random: true,
        straight: false,
      },
      number: {
        value: isMobile ? 20 : 40,
        density: { enable: true, width: 1200, height: 1200 },
      },
      opacity: {
        value: { min: 0.1, max: 0.3 },
        animation: {
          enable: !prefersReducedMotion,
          speed: 0.5,
          sync: false,
        },
      },
      shape: { type: 'circle' },
      size: {
        value: { min: 1, max: 2 },
      },
    },
    interactivity: {
      events: {
        onHover: { enable: false },
        onClick: { enable: false },
      },
    },
    detectRetina: true,
  }), [prefersReducedMotion, isMobile]);

  // LAYER 2: Main particles with polygon mask (logo shape)
  const mainParticlesOptions = useMemo<ISourceOptions>(() => ({
    fullScreen: false,
    background: { color: { value: 'transparent' } },
    fpsLimit: prefersReducedMotion ? 30 : 60,
    particles: {
      color: {
        value: PARTICLE_COLORS,
        animation: {
          h: { enable: !prefersReducedMotion, speed: 10, sync: true },
          s: { enable: false },
          l: { enable: false },
        }
      },
      links: {
        color: { value: '#D4A853' },
        distance: 120,
        enable: true,
        opacity: 0.4,
        width: 1,
        consent: false,
        triangles: {
          enable: !prefersReducedMotion && !isMobile,
          color: '#D4A853',
          opacity: 0.05,
        },
      },
      move: {
        enable: !prefersReducedMotion,
        speed: 1,
        direction: 'none' as const,
        outModes: { default: 'bounce' as const },
        attract: {
          enable: true,
          distance: 150,
          rotate: { x: 600, y: 1200 },
        },
        trail: {
          enable: false,
        },
      },
      number: {
        value: isMobile ? 60 : 120,
        density: { enable: true, width: 800, height: 800 },
      },
      opacity: {
        value: { min: 0.4, max: 0.9 },
        animation: {
          enable: !prefersReducedMotion,
          speed: 1,
          sync: false,
        },
      },
      shape: { type: 'circle' },
      size: {
        value: { min: 1, max: 4 },
        animation: {
          enable: !prefersReducedMotion,
          speed: 2,
          sync: false,
        },
      },
    },
    interactivity: {
      events: {
        onHover: {
          enable: !prefersReducedMotion,
          mode: ['repulse', 'connect'] as const,
          parallax: {
            enable: true,
            force: 60,
            smooth: 10,
          },
        },
        onClick: {
          enable: true,
          mode: 'push' as const,
        },
        resize: { enable: true },
      },
      modes: {
        repulse: {
          distance: 150,
          duration: 0.4,
          speed: 1,
          easing: 'ease-out-quad' as const,
        },
        connect: {
          distance: 100,
          links: { opacity: 0.5 },
          radius: 120,
        },
        push: { quantity: 6 },
        attract: {
          distance: 200,
          duration: 0.4,
          speed: 1,
        },
      },
    },
    polygon: withLogoMask ? {
      enable: true,
      type: 'inline' as const,
      move: {
        type: 'path' as const,
        radius: 10,
      },
      inline: {
        arrangement: 'equidistant' as const,
      },
      draw: {
        enable: true,
        stroke: {
          color: { value: 'rgba(212, 168, 83, 0.2)' },
          width: 1,
          opacity: 0.3,
        },
      },
      url: '/celtic-knot.svg',
      scale: 0.5,
      position: { x: 50, y: 50 },
    } : undefined,
    detectRetina: true,
  }), [prefersReducedMotion, isMobile, withLogoMask]);

  // LAYER 3: Foreground particles (faster, larger, prominent)
  const foregroundParticlesOptions = useMemo<ISourceOptions>(() => ({
    fullScreen: false,
    background: { color: { value: 'transparent' } },
    fpsLimit: prefersReducedMotion ? 30 : 60,
    particles: {
      color: { value: '#F5D98A' },
      links: {
        enable: false,
      },
      move: {
        enable: !prefersReducedMotion,
        speed: 2,
        direction: 'none' as const,
        outModes: { default: 'out' as const },
        random: true,
      },
      number: {
        value: isMobile ? 8 : 15,
      },
      opacity: {
        value: { min: 0.2, max: 0.6 },
        animation: {
          enable: !prefersReducedMotion,
          speed: 0.8,
          sync: false,
        },
      },
      shape: { type: 'circle' },
      size: {
        value: { min: 3, max: 6 },
        animation: {
          enable: !prefersReducedMotion,
          speed: 3,
          sync: false,
        },
      },
      shadow: {
        blur: 10,
        color: { value: '#D4A853' },
        enable: true,
        offset: { x: 0, y: 0 },
      },
    },
    interactivity: {
      events: {
        onHover: {
          enable: !prefersReducedMotion,
          mode: 'bubble' as const,
        },
        onClick: { enable: false },
      },
      modes: {
        bubble: {
          distance: 200,
          size: 8,
          duration: 0.3,
          opacity: 0.8,
        },
      },
    },
    detectRetina: true,
  }), [prefersReducedMotion, isMobile]);

  if (!init) return null;

  return (
    <motion.div
      style={styles.layer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* LAYER 1: Background particles (subtle, slow) */}
      <Particles
        id="particles-background"
        options={backgroundParticlesOptions}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      />

      {/* LAYER 2: Main particles with polygon mask */}
      <Particles
        id="particles-main"
        options={mainParticlesOptions}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          zIndex: 2,
        }}
      />

      {/* LAYER 3: Foreground particles (prominent, fast) */}
      <Particles
        id="particles-foreground"
        options={foregroundParticlesOptions}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          zIndex: 3,
        }}
      />

      {/* Logo overlay with enhanced effects */}
      {withLogoMask && (
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '280px',
            height: '280px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 10,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
        >
          {/* Outer pulsing ring */}
          <motion.div
            style={{
              position: 'absolute',
              width: '120%',
              height: '120%',
              borderRadius: '50%',
              border: '1px solid rgba(212, 168, 83, 0.15)',
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Middle glowing ring */}
          <motion.div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px solid rgba(212, 168, 83, 0.3)',
              boxShadow: '0 0 40px rgba(212, 168, 83, 0.2), inset 0 0 40px rgba(212, 168, 83, 0.1)',
            }}
            animate={{
              boxShadow: [
                '0 0 40px rgba(212, 168, 83, 0.2), inset 0 0 40px rgba(212, 168, 83, 0.1)',
                '0 0 80px rgba(212, 168, 83, 0.4), inset 0 0 60px rgba(212, 168, 83, 0.2)',
                '0 0 40px rgba(212, 168, 83, 0.2), inset 0 0 40px rgba(212, 168, 83, 0.1)',
              ],
              scale: [1, 1.03, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Logo with breathing effect */}
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
              filter: [
                'drop-shadow(0 0 10px rgba(212, 168, 83, 0.5))',
                'drop-shadow(0 0 20px rgba(212, 168, 83, 0.8))',
                'drop-shadow(0 0 10px rgba(212, 168, 83, 0.5))',
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Logo size={180} animated={true} />
          </motion.div>

          {/* Rotating dashed orbit */}
          <motion.div
            style={{
              position: 'absolute',
              width: '110%',
              height: '110%',
              borderRadius: '50%',
              border: '1px dashed rgba(212, 168, 83, 0.25)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          />

          {/* Counter-rotating inner orbit */}
          <motion.div
            style={{
              position: 'absolute',
              width: '90%',
              height: '90%',
              borderRadius: '50%',
              border: '1px dashed rgba(114, 47, 55, 0.2)',
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

// ============================================
// SIMPLE PARTICLE SWARM (For Results phase - no mask)
// ============================================
function SimpleParticleSwarm() {
  const [init, setInit] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const particlesOptions = useMemo<ISourceOptions>(() => ({
    fullScreen: false,
    background: { color: { value: 'transparent' } },
    fpsLimit: prefersReducedMotion ? 30 : 60,
    particles: {
      color: { value: PARTICLE_COLORS },
      links: {
        color: '#D4A853',
        distance: 150,
        enable: true,
        opacity: 0.3,
        width: 1,
      },
      move: {
        enable: !prefersReducedMotion,
        speed: 1,
        direction: 'none' as const,
        outModes: { default: 'bounce' as const },
      },
      number: {
        value: isMobile ? 40 : 80,
        density: { enable: true, width: 800, height: 800 },
      },
      opacity: {
        value: { min: 0.3, max: 0.8 },
      },
      shape: { type: 'circle' },
      size: {
        value: { min: 1, max: 3 },
      },
    },
    interactivity: {
      events: {
        onHover: { enable: !prefersReducedMotion, mode: 'repulse' as const },
        onClick: { enable: true, mode: 'push' as const },
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
        push: { quantity: 4 },
      },
    },
    detectRetina: true,
  }), [prefersReducedMotion, isMobile]);

  if (!init) return null;

  return (
    <motion.div
      style={styles.layer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <Particles
        id="particles-simple"
        options={particlesOptions}
        style={{ width: '100%', height: '100%' }}
      />
    </motion.div>
  );
}

// ============================================
// ADVANCED EYE VISUALIZATION (Session 2 Enhanced)
// Features: Multi-layer Parallax, Pupil Dilation, Blink Animation,
// Procedural Iris, Micro-animations, Smooth Cursor Tracking
// ============================================
function EyeVisualization({ mouseX = 0.5, mouseY = 0.5 }: { mouseX?: number; mouseY?: number }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [microTremor, setMicroTremor] = useState({ x: 0, y: 0 });
  const [smoothMouse, setSmoothMouse] = useState({ x: 0.5, y: 0.5 });

  // Smooth mouse tracking with easing
  useEffect(() => {
    const ease = 0.08;
    const animate = () => {
      setSmoothMouse(prev => ({
        x: prev.x + (mouseX - prev.x) * ease,
        y: prev.y + (mouseY - prev.y) * ease,
      }));
    };
    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, [mouseX, mouseY]);

  // Micro-tremor for organic feel
  useEffect(() => {
    const tremor = () => {
      setMicroTremor({
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
      });
    };
    const interval = setInterval(tremor, 100);
    return () => clearInterval(interval);
  }, []);

  // Listen for file drag events for pupil dilation
  useEffect(() => {
    const handleDragStart = () => setIsDragging(true);
    const handleDragEnd = () => setIsDragging(false);

    window.addEventListener('file-drag', ((e: CustomEvent) => {
      setIsDragging(e.detail?.isDragging || false);
    }) as EventListener);

    window.addEventListener('dragenter', handleDragStart);
    window.addEventListener('dragleave', handleDragEnd);
    window.addEventListener('drop', handleDragEnd);

    return () => {
      window.removeEventListener('dragenter', handleDragStart);
      window.removeEventListener('dragleave', handleDragEnd);
      window.removeEventListener('drop', handleDragEnd);
    };
  }, []);

  // Random blink animation
  useEffect(() => {
    const scheduleBlink = () => {
      const nextBlink = 3000 + Math.random() * 5000;
      return setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
        scheduleBlink();
      }, nextBlink);
    };
    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  // Handle click for manual blink
  const handleClick = () => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 150);
  };

  // Multi-layer parallax calculations
  const basePupilOffset = {
    x: (smoothMouse.x - 0.5) * 25 + microTremor.x,
    y: (smoothMouse.y - 0.5) * 25 + microTremor.y,
  };

  // Different parallax rates for each layer
  const irisOffset = {
    x: basePupilOffset.x * 0.6,
    y: basePupilOffset.y * 0.6,
  };

  const reflectionOffset = {
    x: -basePupilOffset.x * 0.3,
    y: -basePupilOffset.y * 0.3,
  };

  const highlightOffset = {
    x: basePupilOffset.x * 0.8,
    y: basePupilOffset.y * 0.8,
  };

  // Pupil size based on dilation state
  const pupilRadius = isDragging ? 22 : 15;
  const irisRadius = isDragging ? 42 : 35;

  // Eyelid animation
  const upperLidY = isBlinking ? 100 : 40;
  const lowerLidY = isBlinking ? 100 : 160;

  // Generate iris fiber pattern paths
  const irisFibers = useMemo(() => {
    const fibers = [];
    const fiberCount = 24;
    for (let i = 0; i < fiberCount; i++) {
      const angle = (i / fiberCount) * Math.PI * 2;
      const innerRadius = 18;
      const outerRadius = 33 + Math.random() * 4;
      const wobble = Math.sin(i * 3) * 2;
      fibers.push({
        x1: 100 + Math.cos(angle) * innerRadius,
        y1: 100 + Math.sin(angle) * innerRadius,
        x2: 100 + Math.cos(angle + wobble * 0.05) * outerRadius,
        y2: 100 + Math.sin(angle + wobble * 0.05) * outerRadius,
        opacity: 0.3 + Math.random() * 0.4,
      });
    }
    return fibers;
  }, []);

  return (
    <motion.div
      style={styles.layer}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      onClick={handleClick}
    >
      <motion.svg
        viewBox="0 0 200 200"
        style={{ ...styles.svgContainer, cursor: 'pointer' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <defs>
          {/* Enhanced glow filter */}
          <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Inner glow for iris */}
          <filter id="irisGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Radial gradient for background */}
          <radialGradient id="eyeBgGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D4A853" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#722F37" stopOpacity="0.1" />
          </radialGradient>

          {/* Iris gradient with depth */}
          <radialGradient id="irisGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5C1A1B" />
            <stop offset="40%" stopColor="#722F37" />
            <stop offset="80%" stopColor="#8B3A3A" />
            <stop offset="100%" stopColor="#D4A853" stopOpacity="0.5" />
          </radialGradient>

          {/* Pupil gradient for depth */}
          <radialGradient id="pupilGradient" cx="40%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#2D1A1C" />
            <stop offset="100%" stopColor="#12090A" />
          </radialGradient>

          {/* Golden ring glow */}
          <filter id="goldGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor="#D4A853" floodOpacity="0.6" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background ambient circle */}
        <circle cx="100" cy="100" r="95" fill="url(#eyeBgGradient)" />

        {/* Outer decorative ring */}
        <motion.circle
          cx="100"
          cy="100"
          r="90"
          stroke="#D4A853"
          strokeWidth="0.5"
          fill="none"
          opacity="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />

        {/* Rotating diamond frame */}
        <motion.g
          style={{ transformOrigin: '100px 100px' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        >
          <rect
            x="30"
            y="30"
            width="140"
            height="140"
            stroke="#D4A853"
            strokeWidth="0.5"
            fill="none"
            opacity="0.2"
            transform="rotate(45 100 100)"
          />
        </motion.g>

        {/* Sclera (white of eye) - subtle */}
        <ellipse
          cx="100"
          cy="100"
          rx="70"
          ry="45"
          fill="rgba(45, 26, 28, 0.3)"
        />

        {/* Upper eyelid with blink animation */}
        <motion.path
          stroke="#D4A853"
          strokeWidth="2.5"
          fill="rgba(18, 9, 10, 0.9)"
          filter="url(#eyeGlow)"
          animate={{
            d: `M20 100 Q100 ${upperLidY} 180 100 L180 0 L20 0 Z`,
          }}
          transition={{ duration: 0.1, ease: 'easeInOut' }}
        />

        {/* Lower eyelid with blink animation */}
        <motion.path
          stroke="#D4A853"
          strokeWidth="2.5"
          fill="rgba(18, 9, 10, 0.9)"
          filter="url(#eyeGlow)"
          animate={{
            d: `M20 100 Q100 ${lowerLidY} 180 100 L180 200 L20 200 Z`,
          }}
          transition={{ duration: 0.1, ease: 'easeInOut' }}
        />

        {/* Iris - moves with parallax */}
        <motion.g
          animate={{
            x: irisOffset.x,
            y: irisOffset.y,
          }}
          transition={{ type: 'spring', stiffness: 150, damping: 15 }}
        >
          {/* Iris base */}
          <motion.circle
            cx="100"
            cy="100"
            r={irisRadius}
            fill="url(#irisGradient)"
            stroke="#D4A853"
            strokeWidth="1"
            filter="url(#irisGlow)"
            animate={{ r: irisRadius }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          />

          {/* Iris fiber pattern */}
          <g opacity="0.6">
            {irisFibers.map((fiber, i) => (
              <line
                key={i}
                x1={fiber.x1}
                y1={fiber.y1}
                x2={fiber.x2}
                y2={fiber.y2}
                stroke="#D4A853"
                strokeWidth="0.5"
                opacity={fiber.opacity}
              />
            ))}
          </g>

          {/* Inner iris ring */}
          <circle
            cx="100"
            cy="100"
            r={irisRadius * 0.7}
            stroke="#C4956A"
            strokeWidth="0.5"
            fill="none"
            opacity="0.4"
          />

          {/* Outer iris glow ring */}
          <motion.circle
            cx="100"
            cy="100"
            r={irisRadius + 2}
            stroke="#D4A853"
            strokeWidth="1"
            fill="none"
            opacity="0.3"
            animate={{
              opacity: [0.2, 0.4, 0.2],
              r: [irisRadius + 2, irisRadius + 4, irisRadius + 2],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.g>

        {/* Pupil - moves with stronger parallax */}
        <motion.g
          animate={{
            x: basePupilOffset.x,
            y: basePupilOffset.y,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          {/* Pupil with dilation */}
          <motion.circle
            cx="100"
            cy="100"
            r={pupilRadius}
            fill="url(#pupilGradient)"
            animate={{ r: pupilRadius }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          />

          {/* Pupil inner depth */}
          <motion.circle
            cx="100"
            cy="100"
            r={pupilRadius * 0.6}
            fill="#12090A"
            animate={{ r: pupilRadius * 0.6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          />
        </motion.g>

        {/* Reflection highlight - moves opposite to pupil */}
        <motion.g
          animate={{
            x: reflectionOffset.x,
            y: reflectionOffset.y,
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          {/* Main reflection */}
          <motion.circle
            cx="92"
            cy="92"
            r="6"
            fill="#D4A853"
            opacity="0.7"
            filter="url(#goldGlow)"
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Secondary small reflection */}
          <circle
            cx="108"
            cy="105"
            r="2"
            fill="#F5D98A"
            opacity="0.5"
          />
        </motion.g>

        {/* Highlight sparkle - moves with pupil */}
        <motion.g
          animate={{
            x: highlightOffset.x,
            y: highlightOffset.y,
          }}
          transition={{ type: 'spring', stiffness: 150, damping: 15 }}
        >
          <motion.circle
            cx="95"
            cy="95"
            r="3"
            fill="white"
            opacity="0.8"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.9, 0.6],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.g>

        {/* Ambient pulsing glow around eye */}
        <motion.circle
          cx="100"
          cy="100"
          r="85"
          stroke="#D4A853"
          strokeWidth="2"
          fill="none"
          opacity="0.2"
          filter="url(#eyeGlow)"
          animate={{
            opacity: [0.1, 0.3, 0.1],
            r: [85, 88, 85],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Dilation indicator glow when dragging */}
        {isDragging && (
          <motion.circle
            cx="100"
            cy="100"
            r="50"
            stroke="#D4A853"
            strokeWidth="3"
            fill="none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
            filter="url(#goldGlow)"
          />
        )}
      </motion.svg>

      {/* Ambient particles around eye */}
      <motion.div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: '#D4A853',
              left: `${30 + Math.random() * 40}%`,
              top: `${30 + Math.random() * 40}%`,
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 20, 0],
              y: [0, (Math.random() - 0.5) * 20, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

// ============================================
// HELIX LAYER (Phase 3: Biometric) - Session 7 WebGL Shader Enhanced
// ============================================
function HelixVisualization({ isGlowing = false }: { isGlowing?: boolean }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (!prefersReducedMotion) {
    return (
      <motion.div
        style={styles.layer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* ShaderHelix - Session 7 WebGL organic shader helix */}
        <Suspense fallback={<HelixSVGFallback isGlowing={isGlowing} />}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <ShaderHelix
              size={Math.min(window.innerHeight * 0.7, 500)}
              isGlowing={isGlowing}
            />
          </div>
        </Suspense>
      </motion.div>
    );
  }

  return <HelixSVGFallback isGlowing={isGlowing} />;
}

function HelixSVGFallback({ isGlowing = false }: { isGlowing?: boolean }) {
  return (
    <motion.div
      style={styles.layer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <svg
        viewBox="0 0 200 300"
        style={{ ...styles.svgContainer, maxHeight: '80vh' }}
      >
        <defs>
          <filter id="helixGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={isGlowing ? '6' : '2'} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="helixGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4A853" />
            <stop offset="100%" stopColor="#F0C86E" />
          </linearGradient>
        </defs>
        <path
          d="M60 20 Q140 60 60 100 Q140 140 60 180 Q140 220 60 260 Q140 300 60 340"
          stroke="url(#helixGoldGrad)"
          strokeWidth="3"
          fill="none"
          filter={isGlowing ? 'url(#helixGlow)' : undefined}
        />
        <path
          d="M140 20 Q60 60 140 100 Q60 140 140 180 Q60 220 140 260 Q60 300 140 340"
          stroke="#722F37"
          strokeWidth="3"
          fill="none"
          opacity="0.7"
          filter={isGlowing ? 'url(#helixGlow)' : undefined}
        />
        {[60, 100, 140, 180, 220, 260].map((y, i) => (
          <line
            key={i}
            x1="60"
            y1={y}
            x2="140"
            y2={y}
            stroke="#D4A853"
            strokeWidth="1.5"
            opacity="0.4"
          />
        ))}
      </svg>
    </motion.div>
  );
}

// ============================================
// FUSION LAYER (Phase 4: Transition) - Session 8 WebGL Vortex
// ============================================
function FusionVisualization() {
  return (
    <motion.div
      style={{
        ...styles.layer,
        background: 'radial-gradient(circle, rgba(212,168,83,0.2) 0%, transparent 70%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* WebGL Fusion Vortex - Session 8 */}
      <Suspense
        fallback={
          <motion.div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(212,168,83,0.5) 30%, transparent 70%)',
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 2] }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />
        }
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <FusionVortex
            size={Math.min(window.innerWidth, window.innerHeight) * 0.8}
            autoProgress={true}
            duration={4}
          />
        </div>
      </Suspense>
    </motion.div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function LivingBackground() {
  const { state } = useApp();

  // Session 28: Global activity tracking for reactive backgrounds across ALL phases
  const globalActivity = useGlobalActivity(state.currentPhase);

  // Handler for clicking the intro logo to reveal intro content
  const handleIntroReveal = useCallback(() => {
    // Dispatch event for IntroStation to show content
    window.dispatchEvent(new CustomEvent('intro-revealed'));
  }, []);

  // Map AppContext Phase to ShaderPhase for WebGL background
  const shaderPhase = useMemo(() => {
    const phaseMap: Record<Phase, ShaderPhase> = {
      [Phase.INTRO]: ShaderPhase.INTRO,
      [Phase.VISUAL]: ShaderPhase.VISUAL,
      [Phase.PSYCHOMETRIC]: ShaderPhase.PSYCHOMETRIC,
      [Phase.BIOMETRIC]: ShaderPhase.BIOMETRIC,
      [Phase.FUSION]: ShaderPhase.FUSION,
      [Phase.RESULTS]: ShaderPhase.RESULTS,
    };
    return phaseMap[state.currentPhase] ?? ShaderPhase.INTRO;
  }, [state.currentPhase]);

  // Calculate dynamic intensity based on global activity
  // Base intensity + activity boost (keeps it reactive across all phases)
  const dynamicIntensity = useMemo(() => {
    return 0.8 + globalActivity.activityLevel * 0.5;
  }, [globalActivity.activityLevel]);

  return (
    <div style={styles.container}>
      {/* WebGL Organic Background - Always visible as base layer */}
      {/* Session 28: Now reactive to global activity across ALL phases */}
      <OrganicBackground
        phase={state.isFusionActive ? ShaderPhase.FUSION : shaderPhase}
        intensity={dynamicIntensity}
      />

      <AnimatePresence mode="wait">
        {state.currentPhase === Phase.INTRO && (
          <motion.div
            key="intro-container"
            style={styles.layer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Session 28: Pixel particles magnetize to form logo shape */}
            {/* Click to reveal intro content */}
            <Suspense fallback={null}>
              <PixelLogoReveal onBegin={handleIntroReveal} />
            </Suspense>
          </motion.div>
        )}

        {state.currentPhase === Phase.VISUAL && (
          <motion.div
            key="eye"
            style={styles.layer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* WebGL Shader Eye - Session 5 overhaul */}
            <Suspense fallback={<EyeVisualization mouseX={globalActivity.mousePosition.x} mouseY={globalActivity.mousePosition.y} />}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                }}
              >
                <ShaderEye size={Math.min(window.innerWidth * 0.5, 500)} />
              </div>
            </Suspense>
          </motion.div>
        )}

        {state.currentPhase === Phase.PSYCHOMETRIC && (
          <motion.div
            key="psychometric"
            style={styles.layer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Session 19: PulseField - Ambient reactive background grid */}
            <Suspense fallback={null}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.4,
                  zIndex: 1,
                }}
              >
                <PulseField />
              </div>
            </Suspense>

            {/* Session 18: ThoughtStream - Consciousness flow visualization */}
            <Suspense fallback={null}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.5,
                  zIndex: 2,
                }}
              >
                <ThoughtStream />
              </div>
            </Suspense>

            {/* Session 16: ReactiveNeuralNetwork - Quiz-reactive neural firing */}
            <Suspense fallback={null}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.7,
                  zIndex: 3,
                }}
              >
                <ReactiveNeuralNetwork />
              </div>
            </Suspense>

            {/* Session 17: QuantumOrbit - WebGL particle rings (replaces SVG) */}
            <Suspense fallback={null}>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '40%',
                  height: '40%',
                  maxWidth: '400px',
                  maxHeight: '400px',
                  zIndex: 4,
                  pointerEvents: 'none',
                }}
              >
                <QuantumOrbit />
              </div>
            </Suspense>
          </motion.div>
        )}

        {state.currentPhase === Phase.BIOMETRIC && (
          <HelixVisualization key="helix" isGlowing={false} />
        )}

        {state.isFusionActive && (
          <FusionVisualization key="fusion" />
        )}

        {state.currentPhase === Phase.RESULTS && (
          <motion.div
            key="results"
            style={styles.layer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Base particle background */}
            <SimpleParticleSwarm />
            {/* Celebration burst overlay - Session 9 */}
            <Suspense fallback={null}>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                }}
              >
                <CelebrationBurst
                  size={Math.min(window.innerWidth, window.innerHeight) * 0.8}
                  autoTrigger={true}
                  burstCount={4}
                />
              </div>
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient gradient overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(212, 168, 83, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(114, 47, 55, 0.06) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
          zIndex: 100,
        }}
      />
    </div>
  );
}

export default LivingBackground;
