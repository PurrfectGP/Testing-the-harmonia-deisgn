/**
 * FelixTerminal - The psychometric input component
 * Victorian Scientific voice with typewriter effect
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTypewriter } from '../../hooks/useTypewriter';

interface FelixTerminalProps {
  prompt: string;
  onSubmit: (response: string) => void;
  isActive?: boolean;
}

const styles = {
  container: {
    fontFamily: "'JetBrains Mono', monospace",
    background: 'rgba(18, 9, 10, 0.8)',
    border: '1px solid rgba(212, 168, 83, 0.3)',
    borderRadius: '8px',
    padding: '1.5rem',
    position: 'relative' as const,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid rgba(212, 168, 83, 0.2)',
  },
  statusLight: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--gold)',
    boxShadow: '0 0 8px var(--gold)',
    animation: 'pulse 2s ease-in-out infinite',
  },
  title: {
    fontSize: '0.7rem',
    color: 'var(--gold)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
  },
  promptContainer: {
    minHeight: '60px',
    marginBottom: '1rem',
  },
  promptText: {
    color: 'var(--gold-champagne)',
    fontSize: '0.95rem',
    lineHeight: 1.6,
  },
  cursor: {
    display: 'inline-block',
    width: '8px',
    height: '16px',
    background: 'var(--gold)',
    marginLeft: '2px',
    animation: 'blink 1s step-end infinite',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  inputPrefix: {
    color: 'var(--maroon)',
    fontSize: '0.9rem',
    paddingTop: '0.5rem',
    userSelect: 'none' as const,
  },
  textarea: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--gold)',
    color: 'var(--gold-champagne)',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.95rem',
    padding: '0.5rem 0',
    resize: 'none' as const,
    outline: 'none',
    minHeight: '60px',
    caretColor: 'var(--gold)',
  },
  submitHint: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    marginTop: '0.75rem',
    textAlign: 'right' as const,
  },
};

export function FelixTerminal({ prompt, onSubmit, isActive = true }: FelixTerminalProps) {
  const [response, setResponse] = useState('');
  const [lastKeyTime, setLastKeyTime] = useState(Date.now());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingSpeedRef = useRef(1);

  const { displayedText, isComplete, isTyping } = useTypewriter({
    text: prompt,
    speed: 40,
    delay: 300,
  });

  // Focus textarea when prompt finishes typing
  useEffect(() => {
    if (isComplete && isActive && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isComplete, isActive]);

  // Calculate and emit typing speed
  const handleKeyDown = useCallback(() => {
    const now = Date.now();
    const timeDiff = now - lastKeyTime;
    setLastKeyTime(now);

    // Calculate speed (faster typing = higher speed)
    if (timeDiff > 0 && timeDiff < 1000) {
      const speed = Math.min(3, Math.max(0.5, 200 / timeDiff));
      typingSpeedRef.current = speed;

      // Emit typing speed for orbit animation
      window.dispatchEvent(
        new CustomEvent('typing-speed', { detail: { speed } })
      );
    }
  }, [lastKeyTime]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResponse(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (response.trim()) {
        onSubmit(response.trim());
        setResponse('');
      }
    }
  };

  return (
    <motion.div
      style={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Terminal Header */}
      <div style={styles.header}>
        <motion.div
          style={styles.statusLight}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span style={styles.title}>FELIX_PSYCH_ENGINE_V5.3</span>
      </div>

      {/* Prompt with Typewriter Effect */}
      <div style={styles.promptContainer}>
        <p style={styles.promptText}>
          {displayedText}
          {isTyping && <span style={styles.cursor} />}
        </p>
      </div>

      {/* Input Area */}
      {isComplete && (
        <motion.div
          style={styles.inputContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span style={styles.inputPrefix}>{'>'}</span>
          <textarea
            ref={textareaRef}
            style={styles.textarea}
            value={response}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onKeyPress={handleKeyPress}
            placeholder="Input response..."
            disabled={!isActive}
            rows={2}
          />
        </motion.div>
      )}

      {/* Submit Hint */}
      {isComplete && (
        <motion.p
          style={styles.submitHint}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Press Enter to submit • Shift+Enter for new line
        </motion.p>
      )}

      {/* CSS for cursor animation */}
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </motion.div>
  );
}

export default FelixTerminal;
