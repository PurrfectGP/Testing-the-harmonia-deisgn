/**
 * BioStation - Phase 3: Biometric Ingestion
 * Features DNA Helix visualization with file upload trigger
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useApp, Phase, StationState } from '../../context/AppContext';

const styles = {
  container: {
    width: '100%',
    maxWidth: '600px',
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
    maxWidth: '500px',
    margin: '1rem auto',
  },
  helixContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    position: 'relative' as const,
    marginBottom: '2rem',
  },
  dropzone: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed transparent',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    zIndex: 10,
  },
  dropzoneActive: {
    border: '2px dashed var(--gold)',
    background: 'rgba(212, 168, 83, 0.1)',
  },
  dropzoneText: {
    color: 'var(--gold)',
    fontSize: '1rem',
    fontWeight: 500,
    background: 'rgba(18, 9, 10, 0.8)',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    backdropFilter: 'blur(4px)',
  },
  uploadedInfo: {
    background: 'rgba(45, 26, 28, 0.6)',
    border: '1px solid rgba(212, 168, 83, 0.2)',
    borderRadius: '8px',
    padding: '1rem',
    marginTop: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  fileIcon: {
    width: '40px',
    height: '40px',
    color: 'var(--gold)',
  },
  fileName: {
    color: 'var(--gold-champagne)',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.9rem',
  },
  fileSize: {
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
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
  progress: {
    marginTop: '1rem',
    height: '4px',
    background: 'var(--dark-surface)',
    borderRadius: '9999px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--maroon), var(--gold))',
    borderRadius: '9999px',
  },
  crackle: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '200px',
    height: '200px',
    pointerEvents: 'none' as const,
  },
};

// Animated DNA Helix SVG Component
function DNAHelix({ isGlowing = false }: { isGlowing: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 100 200"
      style={{ width: '150px', height: '300px' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <defs>
        <filter id="helixGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={isGlowing ? '4' : '1'} result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4A853" />
          <stop offset="100%" stopColor="#F0C86E" />
        </linearGradient>
      </defs>

      {/* Left helix strand */}
      <motion.path
        d="M30 10 Q70 35 30 60 Q70 85 30 110 Q70 135 30 160 Q70 185 30 210"
        stroke="url(#goldGrad)"
        strokeWidth="3"
        fill="none"
        filter={isGlowing ? 'url(#helixGlow)' : undefined}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />

      {/* Right helix strand */}
      <motion.path
        d="M70 10 Q30 35 70 60 Q30 85 70 110 Q30 135 70 160 Q30 185 70 210"
        stroke="#722F37"
        strokeWidth="3"
        fill="none"
        opacity="0.7"
        filter={isGlowing ? 'url(#helixGlow)' : undefined}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: 'easeInOut', delay: 0.2 }}
      />

      {/* Rungs */}
      {[35, 60, 85, 110, 135, 160, 185].map((y, i) => (
        <motion.line
          key={i}
          x1="30"
          y1={y}
          x2="70"
          y2={y}
          stroke="#D4A853"
          strokeWidth="1.5"
          opacity="0.4"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
          style={{ transformOrigin: 'center' }}
        />
      ))}

      {/* Electric crackle effect */}
      {isGlowing && (
        <>
          <motion.path
            d="M30 35 L38 32 L45 38 L52 34 L60 36 L70 35"
            stroke="#FFEB3B"
            strokeWidth="2"
            fill="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 0.3 }}
          />
          <motion.path
            d="M30 85 L40 82 L50 88 L60 84 L70 85"
            stroke="#FFEB3B"
            strokeWidth="2"
            fill="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 0.5, delay: 0.1 }}
          />
          <motion.path
            d="M30 135 L42 132 L48 138 L58 134 L70 135"
            stroke="#FFEB3B"
            strokeWidth="2"
            fill="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 0.4, delay: 0.2 }}
          />
        </>
      )}
    </motion.svg>
  );
}

export function BioStation() {
  const { state, dispatch, completeStation, startFusionSequence } = useApp();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isGlowing, setIsGlowing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const stationState = state.stationStates[Phase.BIOMETRIC];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      dispatch({ type: 'UPDATE_USER_DATA', payload: { biometricFile: file } });
      setIsGlowing(false);
    }
  }, [dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/json': ['.json'],
    },
    maxFiles: 1,
    onDragEnter: () => setIsGlowing(true),
    onDragLeave: () => setIsGlowing(false),
  });

  const handleInitiateFusion = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    dispatch({
      type: 'UPDATE_STATION_STATE',
      payload: { phase: Phase.BIOMETRIC, state: StationState.PROCESSING },
    });

    // Simulate processing
    for (let i = 0; i <= 100; i += 5) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setProgress(i);
    }

    setIsProcessing(false);
    completeStation(Phase.BIOMETRIC);

    // Start the fusion sequence
    startFusionSequence();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (stationState === StationState.LOCKED) {
    return (
      <motion.div
        style={styles.container}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        className="glass-monolith"
      >
        <div style={styles.header}>
          <h2 style={styles.title}>Biometric Ingestion</h2>
          <p style={styles.subtitle}>Station Locked</p>
        </div>
        <p style={{ ...styles.description, textAlign: 'center' }}>
          Complete psychometric analysis to unlock biometric processing.
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
          Biometric Ingestion
        </motion.h2>
        <motion.p
          style={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          DNA_RESONANCE_ANALYZER_V5.3
        </motion.p>
        <motion.p
          style={styles.description}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Genetic complementarity influences biological attraction signals.
          Upload biometric data for final synthesis calibration.
        </motion.p>
      </div>

      {/* DNA Helix with Drop Zone */}
      <motion.div
        style={styles.helixContainer}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <DNAHelix isGlowing={isGlowing || isDragActive} />

        <div
          {...getRootProps()}
          style={{
            ...styles.dropzone,
            ...(isDragActive ? styles.dropzoneActive : {}),
          }}
        >
          <input {...getInputProps()} />
          {!uploadedFile && (
            <span style={styles.dropzoneText}>
              {isDragActive ? 'Release to analyze' : 'Drop biometric data onto helix'}
            </span>
          )}
        </div>
      </motion.div>

      {/* Uploaded File Info */}
      {uploadedFile && (
        <motion.div
          style={styles.uploadedInfo}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <svg style={styles.fileIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <div>
            <p style={styles.fileName}>{uploadedFile.name}</p>
            <p style={styles.fileSize}>{formatFileSize(uploadedFile.size)}</p>
          </div>
        </motion.div>
      )}

      {/* Progress Bar */}
      {isProcessing && (
        <motion.div
          style={styles.progress}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            style={styles.progressFill}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </motion.div>
      )}

      {/* Initiate Fusion Button */}
      {uploadedFile && !isProcessing && stationState !== StationState.COMPLETED && (
        <motion.button
          style={styles.button}
          onClick={handleInitiateFusion}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ transform: 'translateY(-2px)', boxShadow: '0 6px 30px rgba(212, 168, 83, 0.5)' }}
        >
          Initiate Fusion Sequence
        </motion.button>
      )}

      {stationState === StationState.COMPLETED && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', marginTop: '2rem' }}
        >
          <span style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>
            ✓ Biometric analysis complete - Initiating fusion...
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

export default BioStation;
