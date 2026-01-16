/**
 * LivingBackground - Session 28: New Properly Centered Background
 *
 * Features:
 * - UnifiedBackground: New Three.js particle system (properly centered)
 * - Phase-specific overlay elements
 * - Fixed logo click flow
 * - Proper centering throughout
 */

import { useEffect, useCallback, useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, Phase } from '../context/AppContext';
import { useGlobalActivity } from '../hooks/useGlobalActivity';
import { TextLayer } from '../styles/seamlessStyles';

// New unified background
const UnifiedBackground = lazy(() => import('./WebGL/UnifiedBackground'));

// Lazy load phase-specific WebGL components
const CelticKnotLogo = lazy(() => import('./WebGL/CelticKnotLogo'));

const styles = {
  container: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 0,
    overflow: 'hidden',
  },
  centeredLayer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none' as const,
  },
  logoWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5rem',
    pointerEvents: 'auto' as const,
    cursor: 'pointer',
  },
  clickHint: {
    textAlign: 'center' as const,
  },
  hintText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.8rem',
    ...TextLayer.MUTED,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
  },
};

export function LivingBackground() {
  const { state } = useApp();
  const [logoSize, setLogoSize] = useState(280);
  const [introRevealed, setIntroRevealed] = useState(false);

  // Global activity tracking
  const globalActivity = useGlobalActivity(state.currentPhase);

  // Calculate logo size based on viewport
  useEffect(() => {
    const updateSize = () => {
      const minDim = Math.min(window.innerWidth, window.innerHeight);
      setLogoSize(Math.min(minDim * 0.35, 280));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handler for clicking the logo - reveals intro content
  const handleLogoClick = useCallback(() => {
    setIntroRevealed(true);
    window.dispatchEvent(new CustomEvent('intro-revealed'));
  }, []);

  // Reset introRevealed when phase changes
  useEffect(() => {
    if (state.currentPhase !== Phase.INTRO) {
      setIntroRevealed(false);
    }
  }, [state.currentPhase]);

  return (
    <div style={styles.container}>
      {/* NEW UNIFIED BACKGROUND - Properly centered Three.js */}
      <Suspense fallback={<div style={{ background: '#12090A', width: '100%', height: '100%' }} />}>
        <UnifiedBackground
          phase={state.currentPhase}
          activityLevel={globalActivity.activityLevel}
          mousePosition={globalActivity.mousePosition}
        />
      </Suspense>

      {/* INTRO PHASE: Celtic Knot Logo (before content reveal) */}
      <AnimatePresence>
        {state.currentPhase === Phase.INTRO && !introRevealed && (
          <motion.div
            key="intro-logo"
            style={styles.centeredLayer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }}
          >
            <Suspense fallback={null}>
              <motion.div
                style={styles.logoWrapper}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                onClick={handleLogoClick}
              >
                <CelticKnotLogo size={logoSize} />

                <motion.div
                  style={styles.clickHint}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                >
                  <motion.p
                    style={styles.hintText}
                    animate={{ opacity: [0.4, 0.9, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    Click to Enter
                  </motion.p>
                </motion.div>
              </motion.div>
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle vignette overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(18,9,10,0.4) 100%)',
          pointerEvents: 'none',
          zIndex: 50,
        }}
      />
    </div>
  );
}

export default LivingBackground;
