/**
 * useQuizReactivity - Centralized event system for quiz phase reactivity
 * Session 21: Foundation hook for WebGL reactive animations
 *
 * Manages typing events, submission events, and quiz state
 * that drives all reactive WebGL components during the psychometric phase
 */

import { useState, useEffect, useRef } from 'react';

// Event types for the quiz reactivity system
export const QuizEventType = {
  TYPING_START: 'quiz-typing-start',
  TYPING_STOP: 'quiz-typing-stop',
  KEYSTROKE: 'quiz-keystroke',
  TYPING_SPEED: 'typing-speed',
  SUBMISSION: 'quiz-submission',
  QUESTION_CHANGE: 'quiz-question-change',
} as const;

export type QuizEventType = (typeof QuizEventType)[keyof typeof QuizEventType];

// Quiz reactivity state interface
export interface QuizReactivityState {
  typingSpeed: number;        // 0-3 scale (0 = idle, 3 = fast typing)
  inputLength: number;        // Current input character count
  isTyping: boolean;          // Whether user is actively typing
  questionIndex: number;      // Current question (0, 1, 2)
  lastSubmission: number;     // Timestamp of last submission
  idleTime: number;           // Milliseconds since last keystroke
  submissionPulse: number;    // 0-1 pulse value that decays after submission
  activityLevel: number;      // 0-1 overall activity level
}

// Event detail interfaces
export interface KeystrokeEventDetail {
  key: string;
  inputLength: number;
  timestamp: number;
}

export interface TypingSpeedEventDetail {
  speed: number;
}

export interface SubmissionEventDetail {
  questionIndex: number;
  responseLength: number;
  timestamp: number;
}

export interface QuestionChangeEventDetail {
  fromIndex: number;
  toIndex: number;
  timestamp: number;
}

// Default state
const DEFAULT_STATE: QuizReactivityState = {
  typingSpeed: 0,
  inputLength: 0,
  isTyping: false,
  questionIndex: 0,
  lastSubmission: 0,
  idleTime: 0,
  submissionPulse: 0,
  activityLevel: 0,
};

// Idle timeout in ms (how long before considered "not typing")
const IDLE_TIMEOUT = 1500;
// Submission pulse decay rate (per frame)
const PULSE_DECAY = 0.02;
// Activity level smoothing factor
const ACTIVITY_SMOOTHING = 0.1;

/**
 * Hook to consume quiz reactivity state
 * Use this in WebGL components that need to react to quiz activity
 */
export function useQuizReactivity(): QuizReactivityState {
  const [state, setState] = useState<QuizReactivityState>(DEFAULT_STATE);
  const lastKeystrokeRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number | undefined>(undefined);
  const targetActivityRef = useRef<number>(0);

  // Animation loop for smooth transitions and decay
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      setState(prev => {
        const now = Date.now();
        const newIdleTime = now - lastKeystrokeRef.current;
        const isStillTyping = newIdleTime < IDLE_TIMEOUT;

        // Decay submission pulse
        const newSubmissionPulse = Math.max(0, prev.submissionPulse - PULSE_DECAY);

        // Calculate target activity based on typing and pulse
        targetActivityRef.current = isStillTyping
          ? Math.min(1, prev.typingSpeed / 2 + 0.2)
          : newSubmissionPulse;

        // Smooth activity level transition
        const newActivityLevel = prev.activityLevel +
          (targetActivityRef.current - prev.activityLevel) * ACTIVITY_SMOOTHING;

        // Update typing speed decay when idle
        const newTypingSpeed = isStillTyping
          ? prev.typingSpeed
          : Math.max(0, prev.typingSpeed - deltaTime * 2);

        return {
          ...prev,
          idleTime: newIdleTime,
          isTyping: isStillTyping,
          submissionPulse: newSubmissionPulse,
          activityLevel: newActivityLevel,
          typingSpeed: newTypingSpeed,
        };
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Listen for typing speed events (from FelixTerminal)
  useEffect(() => {
    const handleTypingSpeed = (e: CustomEvent<TypingSpeedEventDetail>) => {
      lastKeystrokeRef.current = Date.now();
      setState(prev => ({
        ...prev,
        typingSpeed: e.detail.speed,
        isTyping: true,
      }));
    };

    window.addEventListener(QuizEventType.TYPING_SPEED, handleTypingSpeed as EventListener);
    return () => {
      window.removeEventListener(QuizEventType.TYPING_SPEED, handleTypingSpeed as EventListener);
    };
  }, []);

  // Listen for keystroke events
  useEffect(() => {
    const handleKeystroke = (e: CustomEvent<KeystrokeEventDetail>) => {
      lastKeystrokeRef.current = e.detail.timestamp;
      setState(prev => ({
        ...prev,
        inputLength: e.detail.inputLength,
        isTyping: true,
      }));
    };

    window.addEventListener(QuizEventType.KEYSTROKE, handleKeystroke as EventListener);
    return () => {
      window.removeEventListener(QuizEventType.KEYSTROKE, handleKeystroke as EventListener);
    };
  }, []);

  // Listen for submission events
  useEffect(() => {
    const handleSubmission = (e: CustomEvent<SubmissionEventDetail>) => {
      setState(prev => ({
        ...prev,
        lastSubmission: e.detail.timestamp,
        submissionPulse: 1, // Full pulse on submission
        inputLength: 0, // Reset input length
      }));
    };

    window.addEventListener(QuizEventType.SUBMISSION, handleSubmission as EventListener);
    return () => {
      window.removeEventListener(QuizEventType.SUBMISSION, handleSubmission as EventListener);
    };
  }, []);

  // Listen for question change events
  useEffect(() => {
    const handleQuestionChange = (e: CustomEvent<QuestionChangeEventDetail>) => {
      setState(prev => ({
        ...prev,
        questionIndex: e.detail.toIndex,
      }));
    };

    window.addEventListener(QuizEventType.QUESTION_CHANGE, handleQuestionChange as EventListener);
    return () => {
      window.removeEventListener(QuizEventType.QUESTION_CHANGE, handleQuestionChange as EventListener);
    };
  }, []);

  return state;
}

/**
 * Utility functions to emit quiz events
 * Use these in FelixTerminal and PsychStation
 */
export const emitKeystroke = (key: string, inputLength: number): void => {
  window.dispatchEvent(
    new CustomEvent(QuizEventType.KEYSTROKE, {
      detail: {
        key,
        inputLength,
        timestamp: Date.now(),
      } as KeystrokeEventDetail,
    })
  );
};

export const emitTypingStart = (): void => {
  window.dispatchEvent(new CustomEvent(QuizEventType.TYPING_START));
};

export const emitTypingStop = (): void => {
  window.dispatchEvent(new CustomEvent(QuizEventType.TYPING_STOP));
};

export const emitSubmission = (questionIndex: number, responseLength: number): void => {
  window.dispatchEvent(
    new CustomEvent(QuizEventType.SUBMISSION, {
      detail: {
        questionIndex,
        responseLength,
        timestamp: Date.now(),
      } as SubmissionEventDetail,
    })
  );
};

export const emitQuestionChange = (fromIndex: number, toIndex: number): void => {
  window.dispatchEvent(
    new CustomEvent(QuizEventType.QUESTION_CHANGE, {
      detail: {
        fromIndex,
        toIndex,
        timestamp: Date.now(),
      } as QuestionChangeEventDetail,
    })
  );
};

export default useQuizReactivity;
