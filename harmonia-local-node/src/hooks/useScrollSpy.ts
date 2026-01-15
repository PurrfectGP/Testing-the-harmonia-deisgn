/**
 * useScrollSpy - Custom hook to detect active station based on scroll position
 * Uses Intersection Observer API for performance
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Phase } from '../context/AppContext';

interface UseScrollSpyOptions {
  threshold?: number;
  rootMargin?: string;
  onPhaseChange?: (phase: Phase) => void;
}

export function useScrollSpy(options: UseScrollSpyOptions = {}) {
  const {
    threshold = 0.5,
    rootMargin = '0px',
    onPhaseChange,
  } = options;

  const [activePhase, setActivePhase] = useState<Phase>(Phase.INTRO);
  const [isIntersecting, setIsIntersecting] = useState<Record<number, boolean>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const stationRefs = useRef<Map<Phase, HTMLElement>>(new Map());

  // Register a station element
  const registerStation = useCallback((phase: Phase, element: HTMLElement | null) => {
    if (element) {
      stationRefs.current.set(phase, element);
    } else {
      stationRefs.current.delete(phase);
    }
  }, []);

  // Create ref callback for each station
  const getStationRef = useCallback((phase: Phase) => {
    return (element: HTMLElement | null) => registerStation(phase, element);
  }, [registerStation]);

  useEffect(() => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const updates: Record<number, boolean> = {};

        entries.forEach((entry) => {
          const phase = Number(entry.target.getAttribute('data-phase'));
          updates[phase] = entry.isIntersecting;
        });

        setIsIntersecting((prev) => ({ ...prev, ...updates }));

        // Find the most visible station
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by intersection ratio and get the most visible
          const mostVisible = visibleEntries.reduce((prev, current) =>
            current.intersectionRatio > prev.intersectionRatio ? current : prev
          );

          const newPhase = Number(mostVisible.target.getAttribute('data-phase')) as Phase;

          setActivePhase((prevPhase) => {
            if (prevPhase !== newPhase) {
              onPhaseChange?.(newPhase);
              return newPhase;
            }
            return prevPhase;
          });
        }
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin,
      }
    );

    // Observe all registered stations
    stationRefs.current.forEach((element) => {
      observerRef.current?.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, rootMargin, onPhaseChange]);

  // Re-observe when stations change
  useEffect(() => {
    const observer = observerRef.current;
    if (!observer) return;

    stationRefs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      stationRefs.current.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, []);

  return {
    activePhase,
    isIntersecting,
    getStationRef,
    registerStation,
  };
}

export default useScrollSpy;
