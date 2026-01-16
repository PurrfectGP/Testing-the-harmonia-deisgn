/**
 * LivingBackground - Session 28 Fix: Proper Logo Click Flow
 *
 * Flow:
 * 1. Initially: CelticKnotLogo centered (splash screen)
 * 2. Click logo → Reveals IntroStation content (intro opens)
 * 3. IntroStation button → Visual phase
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

// Quiz-Reactive Components
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
  logoContainer: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '2rem',
  },
  clickHint: {
    textAlign: 'center' as const,
    pointerEvents: 'none' as const,
  },
  hintText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.85rem',
    ...TextLayer.MUTED,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
  },
};

export function LivingBackground() {
  const { state } = useApp();
  const [logoSize, setLogoSize] = useState(300);
  const [introRevealed, setIntroRevealed] = useState(false);

  // Global activity tracking
  const globalActivity = useGlobalActivity(state.currentPhase);

  // Calculate logo size based on viewport
  useEffect(() => {
    const updateSize = () => {
      const size = Math.min(window.innerWidth * 0.35, window.innerHeight * 0.35, 300);
      setLogoSize(size);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handler for clicking the logo - reveals intro content
  const handleLogoClick = useCallback(() => {
    setIntroRevealed(true);
    // Dispatch event for IntroStation to know intro is revealed
    window.dispatchEvent(new CustomEvent('intro-revealed'));
  }, []);

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

  // Reset introRevealed when returning to INTRO phase
  useEffect(() => {
    if (state.currentPhase !== Phase.INTRO) {
      setIntroRevealed(false);
    }
  }, [state.currentPhase]);

  return (
    <div style={styles.container}>
      {/* BASE LAYER: OrganicBackground */}
      <OrganicBackground
        phase={state.isFusionActive ? ShaderPhase.FUSION : shaderPhase}
        intensity={1.0}
      />

      {/* REACTIVE OVERLAY: GlobalReactiveField */}
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
        {/* INTRO PHASE: Logo (before reveal) */}
        {state.currentPhase === Phase.INTRO && !introRevealed && (
          <motion.div
            key="intro-logo"
            style={styles.layer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8 }}
          >
            <Suspense fallback={null}>
              <motion.div
                style={styles.logoContainer}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              >
                <CelticKnotLogo
                  size={logoSize}
                  onClick={handleLogoClick}
                />
                <motion.div
                  style={styles.clickHint}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 0.8 }}
                >
                  <motion.p
                    style={styles.hintText}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    Click to Enter
                  </motion.p>
                </motion.div>
              </motion.div>
            </Suspense>
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
              <ShaderEye size={Math.min(window.innerWidth * 0.45, 450)} />
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
            <Suspense fallback={null}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.3, zIndex: 1 }}>
                <PulseField />
              </div>
            </Suspense>
            <Suspense fallback={null}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.4, zIndex: 2 }}>
                <ThoughtStream />
              </div>
            </Suspense>
            <Suspense fallback={null}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.5, zIndex: 3 }}>
                <ReactiveNeuralNetwork />
              </div>
            </Suspense>
            <Suspense fallback={null}>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '35%',
                  height: '35%',
                  maxWidth: '350px',
                  maxHeight: '350px',
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
                size={Math.min(window.innerHeight * 0.6, 450)}
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
              background: 'radial-gradient(circle, rgba(212,168,83,0.15) 0%, transparent 60%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Suspense fallback={null}>
              <FusionVortex
                size={Math.min(window.innerWidth, window.innerHeight) * 0.7}
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
                  size={Math.min(window.innerWidth, window.innerHeight) * 0.7}
                  autoTrigger={true}
                  burstCount={3}
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
            radial-gradient(ellipse at 30% 20%, rgba(212, 168, 83, 0.05) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(114, 47, 55, 0.03) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
          zIndex: 100,
        }}
      />
    </div>
  );
}

export default LivingBackground;
