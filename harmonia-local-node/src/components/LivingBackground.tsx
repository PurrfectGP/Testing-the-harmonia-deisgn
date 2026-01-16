/**
 * LivingBackground - Session 28: Unified Reactive Background
 *
 * Features:
 * - ONE unified OrganicBackground (phase-reactive, always visible)
 * - GlobalReactiveField overlay (reacts to all activity)
 * - Phase-specific main elements (logo, eye, quiz overlay, helix, etc.)
 * - Fixed logo click functionality
 * - Proper centering and layering
 */

import { useEffect, useCallback, useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, Phase } from '../context/AppContext';
import { OrganicBackground, ShaderPhase } from './WebGL/OrganicBackground';
import { useGlobalActivity } from '../hooks/useGlobalActivity';
import { TextLayer } from '../styles/seamlessStyles';

// Lazy load WebGL components
const CelticKnotLogo = lazy(() => import('./WebGL/CelticKnotLogo'));
const ShaderEye = lazy(() => import('./WebGL/ShaderEye'));
const ShaderHelix = lazy(() => import('./WebGL/ShaderHelix'));
const FusionVortex = lazy(() => import('./WebGL/FusionVortex'));
const CelebrationBurst = lazy(() => import('./WebGL/CelebrationBurst'));
const GlobalReactiveField = lazy(() => import('./WebGL/GlobalReactiveField'));

// Quiz-Reactive Components (Session 16-20)
const ReactiveNeuralNetwork = lazy(() => import('./WebGL/ReactiveNeuralNetwork'));
const QuantumOrbit = lazy(() => import('./WebGL/QuantumOrbit'));
const ThoughtStream = lazy(() => import('./WebGL/ThoughtStream'));
const PulseField = lazy(() => import('./WebGL/PulseField'));

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
  clickHint: {
    position: 'absolute' as const,
    bottom: '25%',
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center' as const,
    zIndex: 15,
    pointerEvents: 'none' as const,
  },
  hintText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.85rem',
    ...TextLayer.MUTED,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
  },
  hintSubtext: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.1rem',
    ...TextLayer.SECONDARY,
    marginTop: '0.5rem',
  },
};

// ============================================
// MAIN COMPONENT
// ============================================
export function LivingBackground() {
  const { state, completeStation, goToPhase } = useApp();
  const [logoSize, setLogoSize] = useState(350);

  // Global activity tracking
  const globalActivity = useGlobalActivity(state.currentPhase);

  // Calculate logo size based on viewport
  useEffect(() => {
    const updateSize = () => {
      setLogoSize(Math.min(window.innerWidth * 0.4, window.innerHeight * 0.4, 350));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handler for clicking the intro logo
  const handleIntroComplete = useCallback(() => {
    completeStation(Phase.INTRO);
    goToPhase(Phase.VISUAL);
  }, [completeStation, goToPhase]);

  // Map Phase to ShaderPhase
  const shaderPhase = (() => {
    const phaseMap: Record<Phase, ShaderPhase> = {
      [Phase.INTRO]: ShaderPhase.INTRO,
      [Phase.VISUAL]: ShaderPhase.VISUAL,
      [Phase.PSYCHOMETRIC]: ShaderPhase.PSYCHOMETRIC,
      [Phase.BIOMETRIC]: ShaderPhase.BIOMETRIC,
      [Phase.FUSION]: ShaderPhase.FUSION,
      [Phase.RESULTS]: ShaderPhase.RESULTS,
    };
    return phaseMap[state.currentPhase] ?? ShaderPhase.INTRO;
  })();

  return (
    <div style={styles.container}>
      {/* BASE LAYER: OrganicBackground - Always visible, phase-reactive */}
      <OrganicBackground
        phase={state.isFusionActive ? ShaderPhase.FUSION : shaderPhase}
        intensity={1.0}
      />

      {/* REACTIVE OVERLAY: GlobalReactiveField - Always visible, responds to all activity */}
      <Suspense fallback={null}>
        <GlobalReactiveField
          activityLevel={globalActivity.activityLevel}
          clickPulse={globalActivity.clickPulse}
          mousePosition={globalActivity.mousePosition}
          phase={state.currentPhase}
          style={{ zIndex: 1 }}
        />
      </Suspense>

      {/* PHASE-SPECIFIC ELEMENTS */}
      <AnimatePresence mode="wait">
        {/* INTRO PHASE: Celtic Knot Logo (clickable) */}
        {state.currentPhase === Phase.INTRO && (
          <motion.div
            key="intro"
            style={styles.layer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Celtic Knot Logo - THE ONLY clickable logo */}
            <Suspense fallback={null}>
              <motion.div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                  cursor: 'pointer',
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              >
                <CelticKnotLogo
                  size={logoSize}
                  onClick={handleIntroComplete}
                />
              </motion.div>
            </Suspense>

            {/* Click hint text */}
            <motion.div
              style={styles.clickHint}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <motion.p
                style={styles.hintText}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                Click to Begin
              </motion.p>
              <p style={styles.hintSubtext}>Initialize Analysis Protocol</p>
            </motion.div>
          </motion.div>
        )}

        {/* VISUAL PHASE: Shader Eye */}
        {state.currentPhase === Phase.VISUAL && (
          <motion.div
            key="visual"
            style={styles.layer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Suspense fallback={null}>
              <ShaderEye size={Math.min(window.innerWidth * 0.5, 500)} />
            </Suspense>
          </motion.div>
        )}

        {/* PSYCHOMETRIC PHASE: Quiz-Reactive Layers */}
        {state.currentPhase === Phase.PSYCHOMETRIC && (
          <motion.div
            key="psychometric"
            style={styles.layer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* PulseField - Ambient grid */}
            <Suspense fallback={null}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.4, zIndex: 1 }}>
                <PulseField />
              </div>
            </Suspense>

            {/* ThoughtStream - Consciousness flow */}
            <Suspense fallback={null}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.5, zIndex: 2 }}>
                <ThoughtStream />
              </div>
            </Suspense>

            {/* ReactiveNeuralNetwork - Quiz-reactive neurons */}
            <Suspense fallback={null}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.7, zIndex: 3 }}>
                <ReactiveNeuralNetwork />
              </div>
            </Suspense>

            {/* QuantumOrbit - Particle rings */}
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

        {/* BIOMETRIC PHASE: Shader Helix */}
        {state.currentPhase === Phase.BIOMETRIC && (
          <motion.div
            key="biometric"
            style={styles.layer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Suspense fallback={null}>
              <ShaderHelix
                size={Math.min(window.innerHeight * 0.7, 500)}
                isGlowing={false}
              />
            </Suspense>
          </motion.div>
        )}

        {/* FUSION PHASE: Vortex Animation */}
        {state.isFusionActive && (
          <motion.div
            key="fusion"
            style={{
              ...styles.layer,
              background: 'radial-gradient(circle, rgba(212,168,83,0.2) 0%, transparent 70%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Suspense fallback={null}>
              <FusionVortex
                size={Math.min(window.innerWidth, window.innerHeight) * 0.8}
                autoProgress={true}
                duration={4}
              />
            </Suspense>
          </motion.div>
        )}

        {/* RESULTS PHASE: Celebration */}
        {state.currentPhase === Phase.RESULTS && (
          <motion.div
            key="results"
            style={styles.layer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
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
            radial-gradient(ellipse at 30% 20%, rgba(212, 168, 83, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(114, 47, 55, 0.04) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
          zIndex: 100,
        }}
      />
    </div>
  );
}

export default LivingBackground;
