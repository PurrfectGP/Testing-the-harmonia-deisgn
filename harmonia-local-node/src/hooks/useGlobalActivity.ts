/**
 * useGlobalActivity - Global activity tracking for reactive backgrounds
 * Session 28: Unified activity system across ALL phases
 *
 * Tracks:
 * - Mouse movement velocity
 * - Click events
 * - Scroll events
 * - Quiz events (integrates with useQuizReactivity)
 *
 * Provides unified activityLevel (0-1) that drives reactive backgrounds
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Phase } from '../context/AppContext';
import { QuizEventType } from './useQuizReactivity';

export interface GlobalActivityState {
  activityLevel: number;      // 0-1 overall activity
  mouseSpeed: number;         // 0-1 normalized mouse velocity
  mousePosition: { x: number; y: number }; // 0-1 normalized position
  lastClick: number;          // Timestamp
  clickPulse: number;         // 0-1 decaying pulse from clicks
  scrollVelocity: number;     // 0-1 normalized scroll speed
  isInteracting: boolean;     // Any active interaction
  phase: Phase;               // Current phase for context
  // Quiz-specific (forwarded from quiz events when active)
  typingSpeed: number;        // 0-3 from quiz
  submissionPulse: number;    // 0-1 from quiz
  isTyping: boolean;          // From quiz
}

const DEFAULT_STATE: GlobalActivityState = {
  activityLevel: 0,
  mouseSpeed: 0,
  mousePosition: { x: 0.5, y: 0.5 },
  lastClick: 0,
  clickPulse: 0,
  scrollVelocity: 0,
  isInteracting: false,
  phase: Phase.INTRO,
  typingSpeed: 0,
  submissionPulse: 0,
  isTyping: false,
};

// Decay rates
const MOUSE_SPEED_DECAY = 0.92;
const CLICK_PULSE_DECAY = 0.95;
const SCROLL_DECAY = 0.9;
const ACTIVITY_SMOOTHING = 0.08;
const SUBMISSION_PULSE_DECAY = 0.97;

// Sensitivity multipliers
const MOUSE_SENSITIVITY = 0.003;
const SCROLL_SENSITIVITY = 0.01;

/**
 * Hook to track global user activity across all phases
 * Use this in LivingBackground and reactive components
 */
export function useGlobalActivity(currentPhase: Phase): GlobalActivityState {
  const [state, setState] = useState<GlobalActivityState>({
    ...DEFAULT_STATE,
    phase: currentPhase,
  });

  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastScrollY = useRef(0);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const targetActivityRef = useRef(0);
  const mouseSpeedRef = useRef(0);
  const scrollVelocityRef = useRef(0);
  const clickPulseRef = useRef(0);
  const typingSpeedRef = useRef(0);
  const submissionPulseRef = useRef(0);
  const isTypingRef = useRef(false);

  // Mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    const speed = Math.sqrt(dx * dx + dy * dy) * MOUSE_SENSITIVITY;

    mouseSpeedRef.current = Math.min(1, mouseSpeedRef.current + speed);
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setState(prev => ({
      ...prev,
      mousePosition: {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      },
    }));
  }, []);

  // Click handler
  const handleClick = useCallback(() => {
    clickPulseRef.current = 1;
    setState(prev => ({
      ...prev,
      lastClick: Date.now(),
    }));
  }, []);

  // Scroll handler
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const delta = Math.abs(scrollY - lastScrollY.current);
    scrollVelocityRef.current = Math.min(1, scrollVelocityRef.current + delta * SCROLL_SENSITIVITY);
    lastScrollY.current = scrollY;
  }, []);

  // Quiz event handlers
  useEffect(() => {
    const handleTypingSpeed = (e: CustomEvent) => {
      typingSpeedRef.current = e.detail?.speed || 0;
      isTypingRef.current = true;
    };

    const handleSubmission = () => {
      submissionPulseRef.current = 1;
    };

    const handleTypingStop = () => {
      isTypingRef.current = false;
    };

    window.addEventListener(QuizEventType.TYPING_SPEED, handleTypingSpeed as EventListener);
    window.addEventListener(QuizEventType.SUBMISSION, handleSubmission as EventListener);
    window.addEventListener(QuizEventType.TYPING_STOP, handleTypingStop as EventListener);

    return () => {
      window.removeEventListener(QuizEventType.TYPING_SPEED, handleTypingSpeed as EventListener);
      window.removeEventListener(QuizEventType.SUBMISSION, handleSubmission as EventListener);
      window.removeEventListener(QuizEventType.TYPING_STOP, handleTypingStop as EventListener);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      // Decay values
      mouseSpeedRef.current *= MOUSE_SPEED_DECAY;
      clickPulseRef.current *= CLICK_PULSE_DECAY;
      scrollVelocityRef.current *= SCROLL_DECAY;
      submissionPulseRef.current *= SUBMISSION_PULSE_DECAY;

      // Decay typing speed when not typing
      if (!isTypingRef.current) {
        typingSpeedRef.current *= 0.95;
      }

      // Calculate target activity from all sources
      const mouseContribution = mouseSpeedRef.current * 0.3;
      const clickContribution = clickPulseRef.current * 0.3;
      const scrollContribution = scrollVelocityRef.current * 0.2;
      const typingContribution = (typingSpeedRef.current / 3) * 0.4;
      const submissionContribution = submissionPulseRef.current * 0.5;

      targetActivityRef.current = Math.min(1,
        mouseContribution +
        clickContribution +
        scrollContribution +
        typingContribution +
        submissionContribution
      );

      setState(prev => {
        const newActivityLevel = prev.activityLevel +
          (targetActivityRef.current - prev.activityLevel) * ACTIVITY_SMOOTHING;

        const isInteracting =
          mouseSpeedRef.current > 0.01 ||
          clickPulseRef.current > 0.01 ||
          scrollVelocityRef.current > 0.01 ||
          isTypingRef.current;

        return {
          ...prev,
          activityLevel: newActivityLevel,
          mouseSpeed: mouseSpeedRef.current,
          clickPulse: clickPulseRef.current,
          scrollVelocity: scrollVelocityRef.current,
          isInteracting,
          typingSpeed: typingSpeedRef.current,
          submissionPulse: submissionPulseRef.current,
          isTyping: isTypingRef.current,
          phase: currentPhase,
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
  }, [currentPhase]);

  // Event listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleMouseMove, handleClick, handleScroll]);

  return state;
}

export default useGlobalActivity;
