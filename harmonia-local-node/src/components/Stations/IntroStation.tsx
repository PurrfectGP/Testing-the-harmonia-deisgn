/**
 * IntroStation - Session 28 Fix: Full Intro Content
 * Phase 0: The Magnetizing Swarm
 *
 * Flow:
 * 1. Initially hidden (logo in background is visible)
 * 2. After logo click → Content reveals with animation
 * 3. Button click → Goes to Visual phase
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, Phase } from '../../context/AppContext';
import {
  TextLayer,
  SeamlessButton,
} from '../../styles/seamlessStyles';

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    background: 'transparent',
    padding: '2rem',
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    maxWidth: '600px',
    width: '100%',
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
    fontWeight: 600,
    ...TextLayer.PRIMARY,
    marginBottom: '0.5rem',
    letterSpacing: '0.02em',
    lineHeight: 1.1,
  },
  subtitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.8rem',
    ...TextLayer.HOLOGRAPHIC,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.3em',
    marginBottom: '2.5rem',
  },
  description: {
    ...TextLayer.SECONDARY,
    fontSize: '1.1rem',
    lineHeight: 1.8,
    marginBottom: '3rem',
    maxWidth: '500px',
  },
  highlight: {
    color: 'var(--gold)',
    textShadow: '0 0 20px rgba(212, 168, 83, 0.5)',
  },
  features: {
    display: 'flex',
    justifyContent: 'center',
    gap: '3rem',
    marginBottom: '3rem',
    flexWrap: 'wrap' as const,
  },
  feature: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.75rem',
  },
  featureIcon: {
    width: '48px',
    height: '48px',
    color: 'var(--gold)',
    filter: 'drop-shadow(0 0 12px rgba(212, 168, 83, 0.5))',
  },
  featureLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.75rem',
    ...TextLayer.MUTED,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  },
  button: {
    ...SeamlessButton.PRIMARY,
    fontSize: '1.1rem',
    padding: '1.25rem 3.5rem',
    letterSpacing: '0.05em',
  },
  versionTag: {
    position: 'absolute' as const,
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.65rem',
    ...TextLayer.MUTED,
    letterSpacing: '0.1em',
  },
};

export function IntroStation() {
  const { dispatch, completeStation } = useApp();
  const [isRevealed, setIsRevealed] = useState(false);

  // Listen for intro-revealed event from LivingBackground
  useEffect(() => {
    const handleReveal = () => {
      setIsRevealed(true);
    };

    window.addEventListener('intro-revealed', handleReveal);
    return () => window.removeEventListener('intro-revealed', handleReveal);
  }, []);

  const handleBegin = () => {
    completeStation(Phase.INTRO);
    dispatch({ type: 'SET_PHASE', payload: Phase.VISUAL });
  };

  return (
    <div style={styles.container}>
      <AnimatePresence>
        {isRevealed && (
          <motion.div
            style={styles.content}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Title */}
            <motion.h1
              style={styles.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Harmonia Local Node
            </motion.h1>

            <motion.p
              style={styles.subtitle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              The Parallax Forensic Lab
            </motion.p>

            {/* Description */}
            <motion.p
              style={styles.description}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Welcome to the <span style={styles.highlight}>Compatibility Engine</span>.
              Through visual, psychometric, and biometric analysis, we synthesize
              the hidden dimensions of romantic compatibility into a unified assessment.
            </motion.p>

            {/* Features */}
            <motion.div
              style={styles.features}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div style={styles.feature}>
                <svg style={styles.featureIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span style={styles.featureLabel}>Visual</span>
              </div>

              <div style={styles.feature}>
                <svg style={styles.featureIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
                <span style={styles.featureLabel}>Psychometric</span>
              </div>

              <div style={styles.feature}>
                <svg style={styles.featureIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
                <span style={styles.featureLabel}>Biometric</span>
              </div>
            </motion.div>

            {/* Begin Button */}
            <motion.button
              style={styles.button}
              onClick={handleBegin}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              whileHover={{
                y: -3,
                boxShadow: '0 8px 35px rgba(212, 168, 83, 0.5), 0 0 60px rgba(212, 168, 83, 0.25)',
                scale: 1.02,
              }}
              whileTap={{ scale: 0.98 }}
            >
              Initialize Analysis
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Version Tag - always visible */}
      <motion.p
        style={styles.versionTag}
        initial={{ opacity: 0 }}
        animate={{ opacity: isRevealed ? 1 : 0.3 }}
        transition={{ duration: 0.6 }}
      >
        HARMONIA_ENGINE_V5.3 • LOCAL_NODE
      </motion.p>
    </div>
  );
}

export default IntroStation;
