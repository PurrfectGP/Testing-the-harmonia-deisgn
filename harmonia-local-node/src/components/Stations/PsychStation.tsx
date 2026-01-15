/**
 * PsychStation - Phase 2: Psychometric Analysis
 * Contains the Felix Terminal for psychological assessment
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, Phase, StationState } from '../../context/AppContext';
import FelixTerminal from './FelixTerminal';

const PROMPTS = [
  {
    id: 'attraction',
    prompt: 'Initiate psychometric calibration. Describe the qualities that create an immediate sense of intrigue when encountering a potential partner. Consider both visible attributes and subtle energetic resonance.',
  },
  {
    id: 'connection',
    prompt: 'Articulate the conditions under which emotional vulnerability becomes not merely tolerable, but desired. What environmental and interpersonal factors facilitate this state?',
  },
  {
    id: 'compatibility',
    prompt: 'Final calibration query: Define your conception of romantic synchronicity. What alignment of values, rhythms, or aspirations would indicate a specimen worthy of deeper analysis?',
  },
];

const styles = {
  container: {
    width: '100%',
    maxWidth: '700px',
    padding: '2rem',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
    fontWeight: 600,
    color: 'var(--gold-champagne)',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.2em',
  },
  description: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    lineHeight: 1.7,
    marginTop: '1rem',
    maxWidth: '600px',
    margin: '1rem auto',
  },
  progress: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '2rem',
  },
  progressDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'var(--dark-surface)',
    border: '1px solid rgba(212, 168, 83, 0.3)',
    transition: 'all 0.3s ease',
  },
  progressDotActive: {
    background: 'var(--gold)',
    boxShadow: '0 0 10px var(--gold)',
  },
  progressDotComplete: {
    background: 'var(--maroon)',
    border: '1px solid var(--maroon)',
  },
  terminalWrapper: {
    marginTop: '1.5rem',
  },
  completedResponse: {
    background: 'rgba(45, 26, 28, 0.4)',
    border: '1px solid rgba(212, 168, 83, 0.15)',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  responseLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.7rem',
    color: 'var(--gold)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    marginBottom: '0.5rem',
  },
  responseText: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    lineHeight: 1.5,
    fontStyle: 'italic' as const,
  },
  button: {
    marginTop: '2rem',
    padding: '1rem 3rem',
    background: 'linear-gradient(135deg, var(--gold), var(--gold-champagne))',
    color: 'var(--maroon-deep)',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: "'DM Sans', sans-serif",
    display: 'block',
    margin: '2rem auto 0',
  },
};

export function PsychStation() {
  const { state, dispatch, completeStation } = useApp();
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const stationState = state.stationStates[Phase.PSYCHOMETRIC];
  const currentPrompt = PROMPTS[currentPromptIndex];

  const handleResponse = (response: string) => {
    const promptId = currentPrompt.id;
    const newResponses = { ...responses, [promptId]: response };
    setResponses(newResponses);

    // Update user data
    dispatch({
      type: 'UPDATE_USER_DATA',
      payload: { psychometricResponses: newResponses },
    });

    // Move to next prompt or complete
    if (currentPromptIndex < PROMPTS.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
    }
  };

  const handleProceed = () => {
    completeStation(Phase.PSYCHOMETRIC);
    dispatch({ type: 'SET_PHASE', payload: Phase.BIOMETRIC });
  };

  const allPromptsComplete = Object.keys(responses).length === PROMPTS.length;

  if (stationState === StationState.LOCKED) {
    return (
      <motion.div
        style={styles.container}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        className="glass-monolith"
      >
        <div style={styles.header}>
          <h2 style={styles.title}>Psychometric Analysis</h2>
          <p style={styles.subtitle}>Station Locked</p>
        </div>
        <p style={{ ...styles.description, textAlign: 'center' }}>
          Complete visual calibration to unlock psychometric assessment.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      style={styles.container}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="glass-monolith"
    >
      <div style={styles.header}>
        <motion.h2
          style={styles.title}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Psychometric Analysis
        </motion.h2>
        <motion.p
          style={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          PERSONALITY_RESONANCE_CALIBRATION
        </motion.p>
        <motion.p
          style={styles.description}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Perceived similarity builds deeper, lasting emotional connection.
          Respond thoughtfully to calibrate psychometric compatibility vectors.
        </motion.p>
      </div>

      {/* Progress Indicator */}
      <motion.div
        style={styles.progress}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {PROMPTS.map((_, index) => (
          <div
            key={index}
            style={{
              ...styles.progressDot,
              ...(index === currentPromptIndex && !allPromptsComplete
                ? styles.progressDotActive
                : {}),
              ...(responses[PROMPTS[index].id] ? styles.progressDotComplete : {}),
            }}
          />
        ))}
      </motion.div>

      {/* Previous Responses Summary */}
      <AnimatePresence>
        {Object.entries(responses).slice(0, currentPromptIndex).map(([key, value]) => (
          <motion.div
            key={key}
            style={styles.completedResponse}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p style={styles.responseLabel}>Response Recorded</p>
            <p style={styles.responseText}>"{value.substring(0, 100)}..."</p>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Felix Terminal */}
      {!allPromptsComplete && (
        <motion.div
          key={currentPrompt.id}
          style={styles.terminalWrapper}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <FelixTerminal
            prompt={currentPrompt.prompt}
            onSubmit={handleResponse}
            isActive={stationState !== StationState.COMPLETED}
          />
        </motion.div>
      )}

      {/* Completion State */}
      {allPromptsComplete && stationState !== StationState.COMPLETED && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center' }}
        >
          <p style={{ color: 'var(--gold)', marginBottom: '1rem' }}>
            Psychometric calibration complete. {PROMPTS.length}/{PROMPTS.length} vectors analyzed.
          </p>
          <motion.button
            style={styles.button}
            onClick={handleProceed}
            whileHover={{ transform: 'translateY(-2px)', boxShadow: '0 6px 30px rgba(212, 168, 83, 0.5)' }}
          >
            Proceed to Biometric Analysis
          </motion.button>
        </motion.div>
      )}

      {stationState === StationState.COMPLETED && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', marginTop: '2rem' }}
        >
          <span style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>
            ✓ Psychometric analysis complete
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

export default PsychStation;
