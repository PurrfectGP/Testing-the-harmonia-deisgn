/**
 * IntroStation - Phase 0: The Magnetizing Swarm
 * Welcome screen with particle animation intro
 */

import { motion } from 'framer-motion';
import { useApp, Phase } from '../../context/AppContext';
import { Logo } from '../Logo';

const styles = {
  container: {
    width: '100%',
    maxWidth: '600px',
    padding: '3rem 2rem',
    textAlign: 'center' as const,
  },
  logoContainer: {
    width: '100px',
    height: '100px',
    margin: '0 auto 2rem',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--maroon), var(--maroon-deep))',
    border: '2px solid var(--gold)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 40px rgba(212, 168, 83, 0.3)',
    overflow: 'hidden',
  },
  logoImage: {
    width: '80px',
    height: '80px',
    objectFit: 'contain' as const,
    filter: 'drop-shadow(0 0 10px rgba(212, 168, 83, 0.5))',
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 600,
    color: 'var(--gold-champagne)',
    marginBottom: '0.5rem',
    lineHeight: 1.1,
  },
  subtitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.75rem',
    color: 'var(--gold)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.3em',
    marginBottom: '2rem',
  },
  description: {
    color: 'var(--text-secondary)',
    fontSize: '1.1rem',
    lineHeight: 1.8,
    marginBottom: '3rem',
    maxWidth: '500px',
    margin: '0 auto 3rem',
  },
  highlight: {
    color: 'var(--gold)',
  },
  button: {
    padding: '1.25rem 3rem',
    background: 'linear-gradient(135deg, var(--gold), var(--gold-champagne))',
    color: 'var(--maroon-deep)',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: '0 4px 20px rgba(212, 168, 83, 0.3)',
  },
  versionTag: {
    marginTop: '3rem',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.1em',
  },
  features: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    marginBottom: '3rem',
    flexWrap: 'wrap' as const,
  },
  feature: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.5rem',
  },
  featureIcon: {
    width: '40px',
    height: '40px',
    color: 'var(--gold)',
  },
  featureLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  },
};

export function IntroStation() {
  const { dispatch, completeStation } = useApp();

  const handleBegin = () => {
    completeStation(Phase.INTRO);
    dispatch({ type: 'SET_PHASE', payload: Phase.VISUAL });
  };

  return (
    <motion.div
      style={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="glass-monolith"
    >
      {/* Logo */}
      <motion.div
        style={styles.logoContainer}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.8 }}
      >
        <Logo size={80} animated={true} />
      </motion.div>

      {/* Title */}
      <motion.h1
        style={styles.title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        Harmonia Local Node
      </motion.h1>

      <motion.p
        style={styles.subtitle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        The Parallax Forensic Lab
      </motion.p>

      {/* Description */}
      <motion.p
        style={styles.description}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
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
        transition={{ delay: 1.8 }}
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
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
        transition={{ delay: 2 }}
        whileHover={{
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 30px rgba(212, 168, 83, 0.5)',
        }}
        whileTap={{ scale: 0.98 }}
      >
        Initialize Analysis Protocol
      </motion.button>

      {/* Version Tag */}
      <motion.p
        style={styles.versionTag}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
      >
        HARMONIA_ENGINE_V5.3 • PARALLAX_FORENSIC_LAB
      </motion.p>
    </motion.div>
  );
}

export default IntroStation;
