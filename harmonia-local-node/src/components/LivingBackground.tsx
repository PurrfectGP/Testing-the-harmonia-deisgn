/**
 * LivingBackground - The visual engine layer
 * Manages transitions between Particle Swarm, Eye, Orbit, and Helix visualizations
 * Enhanced with logo masking effect and reduced motion support
 */

import { useEffect, useMemo, useCallback, useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
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

// ============================================
// PARTICLE SWARM LAYER (Phase 0: Intro) with Logo Masking
// ============================================
function ParticleSwarm({ withLogoMask = false }: { withLogoMask?: boolean }) {
  const [init, setInit] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
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

  // Reduce particle count on mobile for performance
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const particleCount = isMobile ? 40 : 80;

  const particlesOptions = useMemo(() => ({
    fullScreen: false,
    background: { color: { value: 'transparent' } },
    fpsLimit: prefersReducedMotion ? 30 : 60,
    particles: {
      color: { value: '#D4A853' },
      links: {
        color: '#D4A853',
        distance: 150,
        enable: true,
        opacity: 0.3,
        width: 1,
      },
      move: {
        enable: !prefersReducedMotion,
        speed: prefersReducedMotion ? 0.3 : 1,
        direction: 'none' as const,
        outModes: { default: 'bounce' as const },
        attract: {
          enable: !prefersReducedMotion,
          rotateX: 600,
          rotateY: 1200,
        },
      },
      number: {
        value: particleCount,
        density: { enable: true, area: 800 },
      },
      opacity: {
        value: { min: 0.3, max: 0.8 },
        animation: {
          enable: !prefersReducedMotion,
          speed: 1,
          minimumValue: 0.3,
        },
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
  }), [prefersReducedMotion, particleCount]);

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
        id="tsparticles"
        options={particlesOptions}
        style={{ width: '100%', height: '100%' }}
      />
      {/* Logo mask overlay effect */}
      {withLogoMask && (
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '220px',
            height: '220px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {/* Glowing ring around logo */}
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
                '0 0 60px rgba(212, 168, 83, 0.4), inset 0 0 60px rgba(212, 168, 83, 0.2)',
                '0 0 40px rgba(212, 168, 83, 0.2), inset 0 0 40px rgba(212, 168, 83, 0.1)',
              ],
              scale: [1, 1.02, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Logo with pulse effect */}
          <Logo size={160} animated={true} />

          {/* Particle trail effect around logo */}
          <motion.div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '1px dashed rgba(212, 168, 83, 0.3)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

// ============================================
// EYE SVG LAYER (Phase 1: Visual)
// ============================================
function EyeVisualization({ mouseX = 0.5, mouseY = 0.5 }: { mouseX?: number; mouseY?: number }) {
  // Calculate pupil offset based on mouse position
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
        {/* Outer glow */}
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

        {/* Background circle */}
        <circle cx="100" cy="100" r="90" fill="url(#eyeGradient)" />

        {/* Outer ring */}
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

        {/* Diamond frame */}
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

        {/* Upper eyelid */}
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

        {/* Lower eyelid */}
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

        {/* Iris */}
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

        {/* Pupil - tracks mouse */}
        <motion.circle
          cx={100 + pupilOffsetX}
          cy={100 + pupilOffsetY}
          r="15"
          fill="#722F37"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        />

        {/* Pupil highlight */}
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

        {/* Outer orbit ring */}
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

        {/* Middle orbit ring */}
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

        {/* Inner orbit ring */}
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

        {/* Center golden circle */}
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

        {/* Orbiting nodes */}
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

  // Use 3D helix for non-reduced motion users
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

// SVG Fallback for reduced motion or loading state
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
      {/* Flash effect */}
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

  // Track mouse position for Eye parallax
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

  // Listen for typing speed events (from Felix Terminal)
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
          <ParticleSwarm key="particles" withLogoMask={true} />
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
          <ParticleSwarm key="results-particles" />
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
        }}
      />
    </div>
  );
}

export default LivingBackground;
