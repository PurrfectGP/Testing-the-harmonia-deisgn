/**
 * VisualStation - Session 27: Seamless Design
 * Phase 1: Visual Calibration with borderless UI
 * Handles file upload with Eye dilation effect
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useApp, Phase, StationState } from '../../context/AppContext';
import {
  TextLayer,
  SeamlessButton,
} from '../../styles/seamlessStyles';

const styles = {
  container: {
    width: '100%',
    maxWidth: '600px',
    padding: '2rem',
    background: 'transparent',
    border: 'none',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
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
    maxWidth: '500px',
    margin: '1.25rem auto',
  },
  dropzone: {
    border: '2px dashed transparent',
    borderRadius: '16px',
    padding: '3rem 2rem',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: 'rgba(18, 9, 10, 0.3)',
    backdropFilter: 'blur(4px)',
  },
  dropzoneActive: {
    border: '2px dashed var(--gold)',
    background: 'rgba(212, 168, 83, 0.1)',
    boxShadow: '0 0 40px rgba(212, 168, 83, 0.3)',
  },
  dropzoneText: {
    ...TextLayer.ACCENT,
    fontSize: '1.1rem',
    fontWeight: 500,
    marginBottom: '0.5rem',
  },
  dropzoneSubtext: {
    ...TextLayer.MUTED,
    fontSize: '0.85rem',
  },
  uploadIcon: {
    width: '64px',
    height: '64px',
    margin: '0 auto 1rem',
    color: 'var(--gold)',
    filter: 'drop-shadow(0 0 10px rgba(212, 168, 83, 0.5))',
  },
  preview: {
    marginTop: '1.5rem',
    padding: '1rem',
    background: 'rgba(18, 9, 10, 0.3)',
    backdropFilter: 'blur(4px)',
    borderRadius: '8px',
    borderLeft: '2px solid rgba(212, 168, 83, 0.5)',
  },
  previewImage: {
    maxWidth: '200px',
    maxHeight: '200px',
    borderRadius: '8px',
    margin: '0 auto',
    display: 'block',
    boxShadow: '0 0 20px rgba(212, 168, 83, 0.2)',
  },
  previewText: {
    ...TextLayer.TERMINAL,
    fontSize: '0.9rem',
    marginTop: '0.75rem',
    textAlign: 'center' as const,
  },
  button: {
    ...SeamlessButton.PRIMARY,
    display: 'block',
    margin: '2rem auto 0',
    fontSize: '1.05rem',
    padding: '1.1rem 3rem',
    letterSpacing: '0.03em',
  },
  progress: {
    marginTop: '1.5rem',
    height: '4px',
    background: 'rgba(45, 26, 28, 0.4)',
    borderRadius: '9999px',
    overflow: 'hidden',
    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--maroon), var(--gold), var(--gold-champagne))',
    borderRadius: '9999px',
    boxShadow: '0 0 10px var(--gold)',
  },
  lockedContainer: {
    width: '100%',
    maxWidth: '600px',
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

export function VisualStation() {
  const { state, dispatch, completeStation } = useApp();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      dispatch({ type: 'UPDATE_USER_DATA', payload: { visualFile: file } });

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Dispatch event for Eye dilation
      window.dispatchEvent(new CustomEvent('file-drag', { detail: { isDragging: false } }));
    }
  }, [dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxFiles: 1,
    onDragEnter: () => {
      window.dispatchEvent(new CustomEvent('file-drag', { detail: { isDragging: true } }));
    },
    onDragLeave: () => {
      window.dispatchEvent(new CustomEvent('file-drag', { detail: { isDragging: false } }));
    },
  });

  const handleProceed = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    dispatch({
      type: 'UPDATE_STATION_STATE',
      payload: { phase: Phase.VISUAL, state: StationState.PROCESSING },
    });

    // Simulate processing
    for (let i = 0; i <= 100; i += 5) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setProgress(i);
    }

    setIsProcessing(false);
    completeStation(Phase.VISUAL);
    dispatch({ type: 'SET_PHASE', payload: Phase.PSYCHOMETRIC });
  };

  const stationState = state.stationStates[Phase.VISUAL];

  // Locked state
  if (stationState === StationState.LOCKED) {
    return (
      <motion.div
        style={styles.lockedContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
      >
        <div style={styles.header}>
          <h2 style={styles.title}>Visual Calibration</h2>
          <p style={styles.subtitle}>Station Locked</p>
        </div>
        <p style={styles.lockedText}>
          Complete the previous station to unlock visual analysis.
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
      <div style={styles.header}>
        <motion.h2
          style={styles.title}
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Visual Calibration
        </motion.h2>
        <motion.p
          style={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          HARMONIA_VISUAL_ENGINE_V5.3
        </motion.p>
        <motion.p
          style={styles.description}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Physical attraction drives the strongest initial spark in romantic connection.
          Upload a clear photograph for visual pattern analysis.
        </motion.p>
      </div>

      {/* Drop Zone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{
          boxShadow: '0 0 30px rgba(212, 168, 83, 0.2)',
        }}
      >
        <div
          {...getRootProps()}
          style={{
            ...styles.dropzone,
            ...(isDragActive ? styles.dropzoneActive : {}),
          }}
        >
          <input {...getInputProps()} />

        {!preview ? (
          <>
            <motion.svg
              style={styles.uploadIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </motion.svg>
            <p style={styles.dropzoneText}>
              {isDragActive ? 'Release to upload' : 'Drag & drop your photograph'}
            </p>
            <p style={styles.dropzoneSubtext}>or click to browse</p>
          </>
        ) : (
          <div style={styles.preview}>
            <img src={preview} alt="Preview" style={styles.previewImage} />
            <p style={styles.previewText}>{uploadedFile?.name}</p>
          </div>
        )}
        </div>
      </motion.div>

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

      {/* Proceed Button */}
      {uploadedFile && !isProcessing && stationState !== StationState.COMPLETED && (
        <motion.button
          style={styles.button}
          onClick={handleProceed}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{
            y: -2,
            boxShadow: '0 6px 30px rgba(212, 168, 83, 0.5), 0 0 40px rgba(212, 168, 83, 0.2)',
            scale: 1.02,
          }}
          whileTap={{ scale: 0.98 }}
        >
          Initialize Visual Analysis
        </motion.button>
      )}

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
            Visual calibration complete
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

export default VisualStation;
