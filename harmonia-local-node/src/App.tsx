/**
 * Harmonia Local Node - The Parallax Forensic Lab
 * Main Application Component
 *
 * A high-fidelity "Compatibility Engine" that transforms
 * user data analysis into an immersive, cinematic experience.
 *
 * Enhanced with:
 * - Code splitting for performance
 * - GSAP Fusion Sequence choreography
 * - Accessibility improvements
 */

import { useRef, useEffect, Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp, Phase } from './context/AppContext';
import { useScrollSpy } from './hooks/useScrollSpy';
import LivingBackground from './components/LivingBackground';
import IntroStation from './components/Stations/IntroStation';
import './index.css';

// Lazy load heavy components for better initial load performance
const VisualStation = lazy(() => import('./components/Stations/VisualStation'));
const PsychStation = lazy(() => import('./components/Stations/PsychStation'));
const BioStation = lazy(() => import('./components/Stations/BioStation'));
const ResultsStation = lazy(() => import('./components/Stations/ResultsStation'));
const FusionSequence = lazy(() => import('./components/FusionSequence'));

// Loading spinner component
function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      minHeight: '200px',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(212, 168, 83, 0.3)',
        borderTop: '3px solid var(--gold)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
    </div>
  );
}

// Station wrapper component
interface StationWrapperProps {
  phase: Phase;
  children: React.ReactNode;
  getRef: (el: HTMLElement | null) => void;
}

function StationWrapper({ phase, children, getRef }: StationWrapperProps) {
  return (
    <section
      ref={getRef}
      data-phase={phase}
      className="station"
      style={{
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div className="station-content">
        {children}
      </div>
    </section>
  );
}

// Progress indicator component
function ProgressIndicator() {
  const { state } = useApp();
  const phases = [
    { phase: Phase.INTRO, label: 'Intro' },
    { phase: Phase.VISUAL, label: 'Visual' },
    { phase: Phase.PSYCHOMETRIC, label: 'Psych' },
    { phase: Phase.BIOMETRIC, label: 'Bio' },
    { phase: Phase.RESULTS, label: 'Results' },
  ];

  return (
    <motion.div
      style={{
        position: 'fixed',
        right: '2rem',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'flex-end',
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1 }}
    >
      {phases.map(({ phase, label }) => (
        <motion.div
          key={phase}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
          whileHover={{ x: -5 }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.65rem',
              color: state.currentPhase === phase ? 'var(--gold)' : 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              opacity: state.currentPhase === phase ? 1 : 0.5,
              transition: 'all 0.3s ease',
            }}
          >
            {label}
          </span>
          <div
            style={{
              width: state.currentPhase === phase ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: state.currentPhase === phase ? 'var(--gold)' : 'var(--dark-surface)',
              border: '1px solid',
              borderColor: state.currentPhase >= phase ? 'var(--gold)' : 'rgba(212, 168, 83, 0.3)',
              transition: 'all 0.3s ease',
              boxShadow: state.currentPhase === phase ? '0 0 10px var(--gold)' : 'none',
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

// Main content component
function AppContent() {
  const { state, dispatch } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);

  const { getStationRef } = useScrollSpy({
    threshold: 0.5,
    onPhaseChange: (phase) => {
      dispatch({ type: 'SET_PHASE', payload: phase });
    },
  });

  // Scroll to current phase when it changes
  useEffect(() => {
    if (containerRef.current && !state.isScrollLocked) {
      const stationElement = containerRef.current.querySelector(
        `[data-phase="${state.currentPhase}"]`
      );
      if (stationElement) {
        stationElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [state.currentPhase, state.isScrollLocked]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Living Background Layer */}
      <LivingBackground />

      {/* Progress Indicator */}
      <ProgressIndicator />

      {/* Main Scroll Container */}
      <div
        ref={containerRef}
        className="scroll-snap-container"
        style={{
          position: 'relative',
          zIndex: 1,
          pointerEvents: state.isScrollLocked ? 'none' : 'auto',
          overflowY: state.isScrollLocked ? 'hidden' : 'scroll',
        }}
      >
        {/* Phase 0: Intro */}
        <StationWrapper phase={Phase.INTRO} getRef={getStationRef(Phase.INTRO)}>
          <AnimatePresence mode="wait">
            {state.currentPhase === Phase.INTRO && (
              <motion.div
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <IntroStation />
              </motion.div>
            )}
          </AnimatePresence>
        </StationWrapper>

        {/* Phase 1: Visual Calibration */}
        <StationWrapper phase={Phase.VISUAL} getRef={getStationRef(Phase.VISUAL)}>
          <Suspense fallback={<LoadingSpinner />}>
            <VisualStation />
          </Suspense>
        </StationWrapper>

        {/* Phase 2: Psychometric Analysis */}
        <StationWrapper phase={Phase.PSYCHOMETRIC} getRef={getStationRef(Phase.PSYCHOMETRIC)}>
          <Suspense fallback={<LoadingSpinner />}>
            <PsychStation />
          </Suspense>
        </StationWrapper>

        {/* Phase 3: Biometric Ingestion */}
        <StationWrapper phase={Phase.BIOMETRIC} getRef={getStationRef(Phase.BIOMETRIC)}>
          <Suspense fallback={<LoadingSpinner />}>
            <BioStation />
          </Suspense>
        </StationWrapper>

        {/* Phase 5: Results */}
        <StationWrapper phase={Phase.RESULTS} getRef={getStationRef(Phase.RESULTS)}>
          <Suspense fallback={<LoadingSpinner />}>
            <ResultsStation />
          </Suspense>
        </StationWrapper>
      </div>

      {/* GSAP-Choreographed Fusion Overlay */}
      {state.isFusionActive && (
        <Suspense fallback={null}>
          <FusionSequence />
        </Suspense>
      )}
    </div>
  );
}

// Root App Component with Provider
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
