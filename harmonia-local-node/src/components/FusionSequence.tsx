/**
 * FusionSequence - GSAP Timeline choreographed fusion animation
 * Creates a cinematic convergence of data streams before results
 */

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Logo } from './Logo';

interface FusionSequenceProps {
  onComplete?: () => void;
}

export function FusionSequence({ onComplete }: FusionSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Simple fade transition for reduced motion
      gsap.to(containerRef.current, {
        opacity: 1,
        duration: 0.5,
        onComplete: () => {
          setTimeout(() => onComplete?.(), 2000);
        },
      });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => onComplete?.(),
      });

      // Phase 1: Container fade in
      tl.to(containerRef.current, {
        opacity: 1,
        duration: 0.5,
      });

      // Phase 2: Data orbs fly in from edges
      tl.fromTo(
        orb1Ref.current,
        { x: '-50vw', y: '-30vh', scale: 0.5, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out' },
        0.3
      );
      tl.fromTo(
        orb2Ref.current,
        { x: '50vw', y: '20vh', scale: 0.5, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out' },
        0.5
      );
      tl.fromTo(
        orb3Ref.current,
        { x: 0, y: '50vh', scale: 0.5, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out' },
        0.7
      );

      // Phase 3: Orbs converge to center
      tl.to(
        [orb1Ref.current, orb2Ref.current, orb3Ref.current],
        {
          x: 0,
          y: 0,
          scale: 0.3,
          opacity: 0.8,
          duration: 1,
          ease: 'power3.in',
          stagger: 0.1,
        },
        '+=0.3'
      );

      // Phase 4: Ring expands
      tl.fromTo(
        ringRef.current,
        { scale: 0, opacity: 0, rotate: 0 },
        { scale: 1, opacity: 1, rotate: 180, duration: 0.8, ease: 'power2.out' },
        '-=0.5'
      );

      // Phase 5: Logo pulses in
      tl.fromTo(
        logoRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
        '-=0.3'
      );

      // Phase 6: Text types in
      tl.fromTo(
        textRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 },
        '-=0.2'
      );

      // Phase 7: Flash and transition
      tl.to(
        flashRef.current,
        { opacity: 1, scale: 3, duration: 0.3, ease: 'power2.in' },
        '+=1'
      );

      // Phase 8: Everything fades out
      tl.to(
        containerRef.current,
        { opacity: 0, duration: 0.5 },
        '+=0.2'
      );
    });

    return () => ctx.revert();
  }, [onComplete]);

  const styles = {
    container: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--void-black)',
      opacity: 0,
    },
    orb: {
      position: 'absolute' as const,
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      filter: 'blur(2px)',
    },
    orb1: {
      background: 'radial-gradient(circle, #D4A853 0%, transparent 70%)',
    },
    orb2: {
      background: 'radial-gradient(circle, #722F37 0%, transparent 70%)',
    },
    orb3: {
      background: 'radial-gradient(circle, #F5D98A 0%, transparent 70%)',
    },
    ring: {
      position: 'absolute' as const,
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      border: '3px solid var(--gold)',
      boxShadow: '0 0 40px rgba(212, 168, 83, 0.4), inset 0 0 40px rgba(212, 168, 83, 0.2)',
    },
    logo: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      border: '3px solid var(--gold)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--void-black)',
      boxShadow: '0 0 60px rgba(212, 168, 83, 0.5)',
      overflow: 'hidden',
    },
    logoImage: {
      width: '90px',
      height: '90px',
      objectFit: 'contain' as const,
      filter: 'drop-shadow(0 0 15px rgba(212, 168, 83, 0.6))',
    },
    textContainer: {
      marginTop: '2rem',
      textAlign: 'center' as const,
    },
    title: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '1.8rem',
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
    flash: {
      position: 'absolute' as const,
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(212,168,83,0.5) 40%, transparent 70%)',
      opacity: 0,
      pointerEvents: 'none' as const,
    },
  };

  return (
    <div ref={containerRef} style={styles.container}>
      {/* Data orbs */}
      <div ref={orb1Ref} style={{ ...styles.orb, ...styles.orb1 }} />
      <div ref={orb2Ref} style={{ ...styles.orb, ...styles.orb2 }} />
      <div ref={orb3Ref} style={{ ...styles.orb, ...styles.orb3 }} />

      {/* Central ring */}
      <div ref={ringRef} style={styles.ring} />

      {/* Logo */}
      <div ref={logoRef} style={styles.logo}>
        <Logo size={90} animated={false} />
      </div>

      {/* Text */}
      <div ref={textRef} style={styles.textContainer}>
        <h2 style={styles.title}>Initiating Fusion Sequence</h2>
        <p style={styles.subtitle}>Synthesizing compatibility vectors...</p>
      </div>

      {/* Flash effect */}
      <div ref={flashRef} style={styles.flash} />
    </div>
  );
}

export default FusionSequence;
