/**
 * PsychStation - Session 24: Seamless Redesign
 * Phase 2: Psychometric Analysis with borderless floating UI
 *
 * Features:
 * - Transparent background (no glass-monolith)
 * - Glowing progress orbs instead of bordered dots
 * - Text shadows for readability over WebGL
 * - Integrated quiz reactivity events
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, Phase, StationState } from '../../context/AppContext';
import FelixTerminal from './FelixTerminal';
import {
  TextLayer,
  ProgressOrb,
  SeamlessButton,
  mergeStyles,
} from '../../styles/seamlessStyles';
import { emitQuestionChange } from '../../hooks/useQuizReactivity';

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
    background: 'transparent',
    border: 'none',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '2.5rem',
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 600,
    ...TextLayer.PRIMARY,
    marginBottom: '0.75rem',
    letterSpacing: '0.02em',
  },
  subtitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.8rem',
    ...TextLayer.HOLOGRAPHIC,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.25em',
  },
  description: {
    ...TextLayer.SECONDARY,
    fontSize: '1.05rem',
    lineHeight: 1.8,
    marginTop: '1.25rem',
    maxWidth: '550px',
    margin: '1.25rem auto',
  },
  progress: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '2.5rem',
  },
  progressOrb: {
    ...ProgressOrb.BASE,
    width: '14px',
    height: '14px',
  },
  progressOrbActive: {
    ...ProgressOrb.ACTIVE,
    animation: 'pulse-glow 2s ease-in-out infinite',
  },
  progressOrbComplete: {
    ...ProgressOrb.COMPLETED,
  },
  progressOrbInactive: {
    ...ProgressOrb.INACTIVE,
  },
  terminalWrapper: {
    marginTop: '1.5rem',
  },
  completedResponsesContainer: {
    marginBottom: '1.5rem',
  },
  completedResponse: {
    background: 'rgba(18, 9, 10, 0.2)',
    backdropFilter: 'blur(4px)',
    borderRadius: '8px',
    padding: '1rem 1.25rem',
    marginBottom: '0.75rem',
    borderLeft: '2px solid rgba(114, 47, 55, 0.5)',
  },
  responseLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.7rem',
    color: 'var(--maroon)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    marginBottom: '0.5rem',
    textShadow: '0 0 10px rgba(114, 47, 55, 0.5)',
  },
  responseText: {
    ...TextLayer.MUTED,
    fontSize: '0.9rem',
    lineHeight: 1.6,
    fontStyle: 'italic' as const,
  },
  completionContainer: {
    textAlign: 'center' as const,
    marginTop: '2rem',
  },
  completionText: {
    ...TextLayer.ACCENT,
    fontSize: '1.1rem',
    marginBottom: '1.5rem',
  },
  button: {
    ...SeamlessButton.PRIMARY,
    display: 'inline-block',
    fontSize: '1.05rem',
    padding: '1.1rem 3rem',
    letterSpacing: '0.03em',
  },
  lockedContainer: {
    width: '100%',
    maxWidth: '700px',
    padding: '2rem',
    background: 'transparent',
    opacity: 0.4,
  },
  lockedText: {
    ...TextLayer.MUTED,
    textAlign: 'center' as const,
    fontSize: '1rem',
  },
  checkmark: {
    ...TextLayer.ACCENT,
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
};

export function PsychStation() {
  const { state, dispatch, completeStation } = useApp();
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [prevPromptIndex, setPrevPromptIndex] = useState(0);

  const stationState = state.stationStates[Phase.PSYCHOMETRIC];
  const currentPrompt = PROMPTS[currentPromptIndex];

  // Emit question change event when prompt index changes
  useEffect(() => {
    if (currentPromptIndex !== prevPromptIndex) {
      emitQuestionChange(prevPromptIndex, currentPromptIndex);
      setPrevPromptIndex(currentPromptIndex);
    }
  }, [currentPromptIndex, prevPromptIndex]);

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

  // Locked state - minimal display
  if (stationState === StationState.LOCKED) {
    return (
      <motion.div
        style={styles.lockedContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
      >
        <div style={styles.header}>
          <h2 style={styles.title}>Psychometric Analysis</h2>
          <p style={styles.subtitle}>Station Locked</p>
        </div>
        <p style={styles.lockedText}>
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
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      {/* Header Section */}
      <div style={styles.header}>
        <motion.h2
          style={styles.title}
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Psychometric Analysis
        </motion.h2>
        <motion.p
          style={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          PERSONALITY_RESONANCE_CALIBRATION
        </motion.p>
        <motion.p
          style={styles.description}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Perceived similarity builds deeper, lasting emotional connection.
          Respond thoughtfully to calibrate psychometric compatibility vectors.
        </motion.p>
      </div>

      {/* Progress Orbs */}
      <motion.div
        style={styles.progress}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
      >
        {PROMPTS.map((prompt, index) => {
          const isActive = index === currentPromptIndex && !allPromptsComplete;
          const isComplete = !!responses[prompt.id];

          return (
            <motion.div
              key={index}
              style={mergeStyles(
                styles.progressOrb,
                isActive
                  ? styles.progressOrbActive
                  : isComplete
                  ? styles.progressOrbComplete
                  : styles.progressOrbInactive
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1, type: 'spring' }}
            />
          );
        })}
      </motion.div>

      {/* Previous Responses (Condensed) */}
      <AnimatePresence>
        {Object.keys(responses).length > 0 && !allPromptsComplete && (
          <motion.div
            style={styles.completedResponsesContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Object.entries(responses)
              .slice(0, currentPromptIndex)
              .map(([key, value]) => (
                <motion.div
                  key={key}
                  style={styles.completedResponse}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                >
                  <p style={styles.responseLabel}>Response Recorded</p>
                  <p style={styles.responseText}>
                    "{value.length > 80 ? value.substring(0, 80) + '...' : value}"
                  </p>
                </motion.div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Felix Terminal */}
      <AnimatePresence mode="wait">
        {!allPromptsComplete && (
          <motion.div
            key={currentPrompt.id}
            style={styles.terminalWrapper}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.5 }}
          >
            <FelixTerminal
              prompt={currentPrompt.prompt}
              onSubmit={handleResponse}
              isActive={stationState !== StationState.COMPLETED}
              questionIndex={currentPromptIndex}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion State - Ready to Proceed */}
      <AnimatePresence>
        {allPromptsComplete && stationState !== StationState.COMPLETED && (
          <motion.div
            style={styles.completionContainer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p style={styles.completionText}>
              Psychometric calibration complete. {PROMPTS.length}/{PROMPTS.length} vectors analyzed.
            </p>
            <motion.button
              style={styles.button}
              onClick={handleProceed}
              whileHover={{
                y: -2,
                boxShadow: '0 6px 30px rgba(212, 168, 83, 0.5), 0 0 40px rgba(212, 168, 83, 0.2)',
                scale: 1.02,
              }}
              whileTap={{ scale: 0.98 }}
            >
              Proceed to Biometric Analysis
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Station Complete */}
      {stationState === StationState.COMPLETED && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{ textAlign: 'center', marginTop: '2rem' }}
        >
          <span style={styles.checkmark}>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              ✓
            </motion.span>
            Psychometric analysis complete
          </span>
        </motion.div>
      )}

      {/* Keyframes for pulse animation */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 15px var(--gold), 0 0 30px rgba(212, 168, 83, 0.5);
          }
          50% {
            box-shadow: 0 0 25px var(--gold), 0 0 50px rgba(212, 168, 83, 0.7);
          }
        }
      `}</style>
    </motion.div>
  );
}

export default PsychStation;
