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

// Lazy load 3D Helix for performance
const DNAHelix3D = lazy(() => import('./3D/DNAHelix3D'));

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
// ============================================
function AdvancedParticleSwarm({ withLogoMask = false }: { withLogoMask?: boolean }) {
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
// EYE SVG LAYER (Phase 1: Visual)
// ============================================
function EyeVisualization({ mouseX = 0.5, mouseY = 0.5 }: { mouseX?: number; mouseY?: number }) {
  const pupilOffsetX = (mouseX - 0.5) * 20;
  const pupilOffsetY = (mouseY - 0.5) * 20;

  return (
    <motion.div
      style={styles.layer}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <motion.svg
        viewBox="0 0 200 200"
        style={styles.svgContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="eyeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D4A853" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#722F37" stopOpacity="0.1" />
          </radialGradient>
        </defs>

        <circle cx="100" cy="100" r="90" fill="url(#eyeGradient)" />

        <motion.circle
          cx="100"
          cy="100"
          r="85"
          stroke="#D4A853"
          strokeWidth="1"
          fill="none"
          opacity="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />

        <motion.rect
          x="30"
          y="30"
          width="140"
          height="140"
          stroke="#D4A853"
          strokeWidth="0.5"
          fill="none"
          style={{ transform: 'rotate(45deg)', transformOrigin: 'center' }}
          opacity="0.3"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />

        <motion.path
          d="M30 100 Q100 40 170 100"
          stroke="#D4A853"
          strokeWidth="2"
          fill="none"
          filter="url(#glow)"
          initial={{ d: 'M30 100 Q100 100 170 100' }}
          animate={{ d: 'M30 100 Q100 40 170 100' }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        <motion.path
          d="M30 100 Q100 160 170 100"
          stroke="#D4A853"
          strokeWidth="2"
          fill="none"
          filter="url(#glow)"
          initial={{ d: 'M30 100 Q100 100 170 100' }}
          animate={{ d: 'M30 100 Q100 160 170 100' }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        <motion.circle
          cx="100"
          cy="100"
          r="35"
          stroke="#722F37"
          strokeWidth="1"
          fill="rgba(114, 47, 55, 0.2)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />

        <motion.circle
          cx={100 + pupilOffsetX}
          cy={100 + pupilOffsetY}
          r="15"
          fill="#722F37"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        />

        <motion.circle
          cx={95 + pupilOffsetX}
          cy={95 + pupilOffsetY}
          r="5"
          fill="#D4A853"
          opacity="0.6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
        />
      </motion.svg>
    </motion.div>
  );
}

// ============================================
// ORBIT SVG LAYER (Phase 2: Psychometric)
// ============================================
function OrbitVisualization({ rotationSpeed = 1 }: { rotationSpeed?: number }) {
  return (
    <motion.div
      style={styles.layer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.svg
        viewBox="0 0 200 200"
        style={styles.svgContainer}
      >
        <defs>
          <filter id="orbitGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.circle
          cx="100"
          cy="100"
          r="85"
          stroke="#D4A853"
          strokeWidth="1"
          strokeDasharray="4 3"
          fill="none"
          opacity="0.5"
          animate={{ rotate: 360 }}
          transition={{ duration: 30 / rotationSpeed, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: 'center' }}
        />

        <motion.circle
          cx="100"
          cy="100"
          r="60"
          stroke="#D4A853"
          strokeWidth="1"
          strokeDasharray="4 3"
          fill="none"
          opacity="0.4"
          animate={{ rotate: -360 }}
          transition={{ duration: 20 / rotationSpeed, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: 'center' }}
        />

        <motion.circle
          cx="100"
          cy="100"
          r="35"
          stroke="#D4A853"
          strokeWidth="1"
          strokeDasharray="4 3"
          fill="none"
          opacity="0.3"
          animate={{ rotate: 360 }}
          transition={{ duration: 15 / rotationSpeed, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: 'center' }}
        />

        <motion.circle
          cx="100"
          cy="100"
          r="10"
          fill="#D4A853"
          filter="url(#orbitGlow)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />

        {[0, 120, 240].map((angle, i) => (
          <motion.g
            key={i}
            animate={{ rotate: 360 }}
            transition={{ duration: (25 - i * 5) / rotationSpeed, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '100px 100px' }}
          >
            <circle
              cx={100 + Math.cos((angle * Math.PI) / 180) * (85 - i * 25)}
              cy={100 + Math.sin((angle * Math.PI) / 180) * (85 - i * 25)}
              r="6"
              fill="#722F37"
            />
            <line
              x1="100"
              y1="100"
              x2={100 + Math.cos((angle * Math.PI) / 180) * (85 - i * 25)}
              y2={100 + Math.sin((angle * Math.PI) / 180) * (85 - i * 25)}
              stroke="#D4A853"
              strokeWidth="1"
              opacity="0.5"
            />
          </motion.g>
        ))}
      </motion.svg>
    </motion.div>
  );
}

// ============================================
// HELIX LAYER (Phase 3: Biometric) - 3D Enhanced
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
        <Suspense fallback={<HelixSVGFallback isGlowing={isGlowing} />}>
          <DNAHelix3D isGlowing={isGlowing} />
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
// FUSION LAYER (Phase 4: Transition)
// ============================================
function FusionVisualization() {
  return (
    <motion.div
      style={{
        ...styles.layer,
        background: 'radial-gradient(circle, rgba(212,168,83,0.3) 0%, transparent 70%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 4, times: [0, 0.3, 0.8, 1] }}
    >
      <motion.div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(212,168,83,0.5) 30%, transparent 70%)',
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 2] }}
        transition={{ duration: 2, delay: 1.5, ease: 'easeOut' }}
      />
    </motion.div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function LivingBackground() {
  const { state } = useApp();
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [typingSpeed, setTypingSpeed] = useState(1);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const handleTypingSpeed = (e: CustomEvent) => {
      setTypingSpeed(e.detail.speed || 1);
    };
    window.addEventListener('typing-speed' as any, handleTypingSpeed);
    return () => window.removeEventListener('typing-speed' as any, handleTypingSpeed);
  }, []);

  return (
    <div style={styles.container}>
      <AnimatePresence mode="wait">
        {state.currentPhase === Phase.INTRO && (
          <AdvancedParticleSwarm key="particles" withLogoMask={true} />
        )}

        {state.currentPhase === Phase.VISUAL && (
          <EyeVisualization
            key="eye"
            mouseX={mousePosition.x}
            mouseY={mousePosition.y}
          />
        )}

        {state.currentPhase === Phase.PSYCHOMETRIC && (
          <OrbitVisualization key="orbit" rotationSpeed={typingSpeed} />
        )}

        {state.currentPhase === Phase.BIOMETRIC && (
          <HelixVisualization key="helix" isGlowing={false} />
        )}

        {state.isFusionActive && (
          <FusionVisualization key="fusion" />
        )}

        {state.currentPhase === Phase.RESULTS && (
          <SimpleParticleSwarm key="results-particles" />
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
