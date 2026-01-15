/**
 * useTypewriter - Custom hook for Felix Terminal typewriter effect
 */

import { useState, useEffect, useCallback } from 'react';

interface UseTypewriterOptions {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
}

export function useTypewriter({
  text,
  speed = 50,
  delay = 0,
  onComplete,
}: UseTypewriterOptions) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
    setIsStarted(false);
  }, [text]);

  // Handle initial delay
  useEffect(() => {
    if (delay > 0 && !isStarted) {
      const delayTimeout = setTimeout(() => {
        setIsStarted(true);
      }, delay);
      return () => clearTimeout(delayTimeout);
    } else {
      setIsStarted(true);
    }
  }, [delay, isStarted]);

  // Typewriter effect
  useEffect(() => {
    if (!isStarted || isComplete) return;

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, isComplete, isStarted, onComplete]);

  // Skip to end
  const skipToEnd = useCallback(() => {
    setDisplayedText(text);
    setCurrentIndex(text.length);
    setIsComplete(true);
    onComplete?.();
  }, [text, onComplete]);

  // Restart
  const restart = useCallback(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
    setIsStarted(false);
  }, []);

  return {
    displayedText,
    isComplete,
    isTyping: isStarted && !isComplete,
    skipToEnd,
    restart,
    progress: text.length > 0 ? currentIndex / text.length : 0,
  };
}

export default useTypewriter;
