/**
 * IntroStation - Session 28: Simplified for Background Logo Click
 * Phase 0: The Magnetizing Swarm
 *
 * User clicks the CelticKnotLogo in the background to proceed.
 * This station just shows subtle branding text.
 */

import { motion } from 'framer-motion';
import { TextLayer } from '../../styles/seamlessStyles';

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
    position: 'absolute' as const,
    top: '12%',
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center' as const,
    pointerEvents: 'none' as const,
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
    fontWeight: 600,
    ...TextLayer.PRIMARY,
    marginBottom: '0.5rem',
    letterSpacing: '0.02em',
    lineHeight: 1.2,
  },
  subtitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.75rem',
    ...TextLayer.HOLOGRAPHIC,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.3em',
  },
  footer: {
    position: 'absolute' as const,
    bottom: '8%',
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center' as const,
    pointerEvents: 'none' as const,
  },
  versionTag: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.65rem',
    ...TextLayer.MUTED,
    letterSpacing: '0.1em',
  },
};

export function IntroStation() {
  return (
    <div style={styles.container}>
      {/* Top branding */}
      <motion.div
        style={styles.content}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <h1 style={styles.title}>Harmonia</h1>
        <p style={styles.subtitle}>The Parallax Forensic Lab</p>
      </motion.div>

      {/* Footer version tag */}
      <motion.div
        style={styles.footer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
      >
        <p style={styles.versionTag}>
          HARMONIA_ENGINE_V5.3 • LOCAL_NODE
        </p>
      </motion.div>
    </div>
  );
}

export default IntroStation;
