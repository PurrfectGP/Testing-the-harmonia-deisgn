/**
 * FelixTerminal - Session 23: Seamless Redesign
 * Borderless floating terminal for psychometric input
 *
 * Features:
 * - Transparent background (no borders)
 * - Glowing text with shadows for readability
 * - Animated gradient underline header
 * - Glow underline input (no box)
 * - Integrated quiz reactivity events
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTypewriter } from '../../hooks/useTypewriter';
import {
  TextLayer,
  SeamlessInput,
  mergeStyles,
} from '../../styles/seamlessStyles';
import { emitKeystroke, emitSubmission, QuizEventType } from '../../hooks/useQuizReactivity';

interface FelixTerminalProps {
  prompt: string;
  onSubmit: (response: string) => void;
  isActive?: boolean;
  questionIndex?: number;
}

const styles = {
  container: {
    fontFamily: "'JetBrains Mono', monospace",
    background: 'transparent',
    border: 'none',
    padding: '1.5rem',
    position: 'relative' as const,
    maxWidth: '600px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    position: 'relative' as const,
  },
  headerLine: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent 0%, var(--gold) 20%, var(--gold-champagne) 50%, var(--gold) 80%, transparent 100%)',
    boxShadow: '0 0 15px rgba(212, 168, 83, 0.4), 0 0 30px rgba(212, 168, 83, 0.2)',
  },
  statusLight: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'var(--gold)',
    boxShadow: '0 0 10px var(--gold), 0 0 20px rgba(212, 168, 83, 0.5)',
  },
  title: {
    fontSize: '0.75rem',
    color: 'var(--gold)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.2em',
    textShadow: '0 0 15px var(--gold), 0 0 30px rgba(212, 168, 83, 0.3)',
  },
  promptContainer: {
    minHeight: '80px',
    marginBottom: '1.5rem',
  },
  promptText: {
    ...TextLayer.PRIMARY,
    fontSize: '1rem',
    lineHeight: 1.8,
    letterSpacing: '0.02em',
  },
  cursor: {
    display: 'inline-block',
    width: '10px',
    height: '20px',
    background: 'var(--gold)',
    marginLeft: '4px',
    boxShadow: '0 0 10px var(--gold), 0 0 20px rgba(212, 168, 83, 0.5)',
    animation: 'blink 1s step-end infinite',
    verticalAlign: 'middle',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    position: 'relative' as const,
  },
  inputPrefix: {
    color: 'var(--gold)',
    fontSize: '1.1rem',
    paddingTop: '0.5rem',
    userSelect: 'none' as const,
    textShadow: '0 0 10px var(--gold), 0 0 20px rgba(212, 168, 83, 0.4)',
  },
  textareaWrapper: {
    flex: 1,
    position: 'relative' as const,
  },
  textarea: {
    ...SeamlessInput.BASE,
    width: '100%',
    fontSize: '1rem',
    padding: '0.5rem 0',
    resize: 'none' as const,
    minHeight: '80px',
    lineHeight: 1.7,
    caretColor: 'var(--gold)',
  },
  textareaFocused: {
    ...SeamlessInput.FOCUSED,
  },
  inputGlow: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'var(--gold)',
    boxShadow: '0 0 15px var(--gold), 0 0 30px rgba(212, 168, 83, 0.4)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  submitHint: {
    ...TextLayer.MUTED,
    fontSize: '0.75rem',
    marginTop: '1rem',
    textAlign: 'right' as const,
    letterSpacing: '0.05em',
  },
  activityIndicator: {
    position: 'absolute' as const,
    top: '50%',
    right: '-30px',
    transform: 'translateY(-50%)',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--gold)',
    boxShadow: '0 0 10px var(--gold)',
    opacity: 0,
    transition: 'opacity 0.2s ease',
  },
};

export function FelixTerminal({
  prompt,
  onSubmit,
  isActive = true,
  questionIndex = 0,
}: FelixTerminalProps) {
  const [response, setResponse] = useState('');
  const [lastKeyTime, setLastKeyTime] = useState(Date.now());
  const [isFocused, setIsFocused] = useState(false);
  const [isTypingActive, setIsTypingActive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { displayedText, isComplete, isTyping } = useTypewriter({
    text: prompt,
    speed: 35,
    delay: 400,
  });

  // Focus textarea when prompt finishes typing
  useEffect(() => {
    if (isComplete && isActive && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 300);
    }
  }, [isComplete, isActive]);

  // Calculate and emit typing speed + keystroke events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const now = Date.now();
      const timeDiff = now - lastKeyTime;
      setLastKeyTime(now);

      // Calculate speed (faster typing = higher speed)
      if (timeDiff > 0 && timeDiff < 1000) {
        const speed = Math.min(3, Math.max(0.5, 200 / timeDiff));

        // Emit typing speed event (for orbit and other components)
        window.dispatchEvent(
          new CustomEvent(QuizEventType.TYPING_SPEED, { detail: { speed } })
        );
      }

      // Emit keystroke event
      emitKeystroke(e.key, response.length);

      // Set typing active state
      setIsTypingActive(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTypingActive(false);
      }, 500);
    },
    [lastKeyTime, response.length]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResponse(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (response.trim()) {
        // Emit submission event before calling onSubmit
        emitSubmission(questionIndex, response.trim().length);
        onSubmit(response.trim());
        setResponse('');
      }
    }
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      style={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Terminal Header with Animated Line */}
      <div style={styles.header}>
        <motion.div
          style={styles.statusLight}
          animate={{
            boxShadow: [
              '0 0 10px var(--gold), 0 0 20px rgba(212, 168, 83, 0.5)',
              '0 0 15px var(--gold), 0 0 30px rgba(212, 168, 83, 0.7)',
              '0 0 10px var(--gold), 0 0 20px rgba(212, 168, 83, 0.5)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span style={styles.title}>FELIX_PSYCH_ENGINE_V5.3</span>

        {/* Animated gradient underline */}
        <motion.div
          style={styles.headerLine}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        />
      </div>

      {/* Prompt with Typewriter Effect */}
      <div style={styles.promptContainer}>
        <motion.p
          style={styles.promptText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {displayedText}
          {isTyping && <span style={styles.cursor} />}
        </motion.p>
      </div>

      {/* Input Area */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            style={styles.inputContainer}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <span style={styles.inputPrefix}>{'>'}</span>
            <div style={styles.textareaWrapper}>
              <textarea
                ref={textareaRef}
                style={mergeStyles(
                  styles.textarea,
                  isFocused ? styles.textareaFocused : undefined
                )}
                value={response}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onKeyPress={handleKeyPress}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Enter response..."
                disabled={!isActive}
                rows={3}
              />
              {/* Glow line under input */}
              <motion.div
                style={styles.inputGlow}
                animate={{ opacity: isFocused ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
              {/* Typing activity indicator */}
              <motion.div
                style={styles.activityIndicator}
                animate={{ opacity: isTypingActive ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Hint */}
      <AnimatePresence>
        {isComplete && (
          <motion.p
            style={styles.submitHint}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
          >
            ENTER to submit • SHIFT+ENTER for new line
          </motion.p>
        )}
      </AnimatePresence>

      {/* CSS for cursor animation */}
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        textarea::placeholder {
          color: rgba(212, 168, 83, 0.3);
        }

        textarea:focus::placeholder {
          color: rgba(212, 168, 83, 0.2);
        }
      `}</style>
    </motion.div>
  );
}

export default FelixTerminal;
