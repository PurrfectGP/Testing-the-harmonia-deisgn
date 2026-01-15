/**
 * VisualStation - Phase 1: Visual Calibration
 * Handles file upload with Eye dilation effect
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
  dropzone: {
    border: '2px dashed rgba(212, 168, 83, 0.3)',
    borderRadius: '16px',
    padding: '3rem 2rem',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: 'rgba(45, 26, 28, 0.4)',
    backdropFilter: 'blur(10px)',
  },
  dropzoneActive: {
    border: '2px solid var(--gold)',
    background: 'rgba(212, 168, 83, 0.1)',
    transform: 'scale(1.02)',
    boxShadow: '0 0 40px rgba(212, 168, 83, 0.2)',
  },
  dropzoneText: {
    color: 'var(--gold)',
    fontSize: '1.1rem',
    fontWeight: 500,
    marginBottom: '0.5rem',
  },
  dropzoneSubtext: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
  },
  uploadIcon: {
    width: '64px',
    height: '64px',
    margin: '0 auto 1rem',
    color: 'var(--gold)',
  },
  preview: {
    marginTop: '1.5rem',
    padding: '1rem',
    background: 'rgba(45, 26, 28, 0.6)',
    borderRadius: '8px',
    border: '1px solid rgba(212, 168, 83, 0.2)',
  },
  previewImage: {
    maxWidth: '200px',
    maxHeight: '200px',
    borderRadius: '8px',
    margin: '0 auto',
    display: 'block',
  },
  previewText: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    marginTop: '0.5rem',
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
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setProgress(i);
    }

    setIsProcessing(false);
    completeStation(Phase.VISUAL);
    dispatch({ type: 'SET_PHASE', payload: Phase.PSYCHOMETRIC });
  };

  const stationState = state.stationStates[Phase.VISUAL];

  if (stationState === StationState.LOCKED) {
    return (
      <motion.div
        style={styles.container}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        className="glass-monolith"
      >
        <div style={styles.header}>
          <h2 style={styles.title}>Visual Calibration</h2>
          <p style={styles.subtitle}>Station Locked</p>
        </div>
        <p style={{ ...styles.description, textAlign: 'center' }}>
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
          Visual Calibration
        </motion.h2>
        <motion.p
          style={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          HARMONIA_VISUAL_ENGINE_V5.3
        </motion.p>
        <motion.p
          style={styles.description}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Physical attraction drives the strongest initial spark in romantic connection.
          Upload a clear photograph for visual pattern analysis.
        </motion.p>
      </div>

      <motion.div
        onClick={getRootProps().onClick}
        onKeyDown={getRootProps().onKeyDown}
        onFocus={getRootProps().onFocus}
        onBlur={getRootProps().onBlur}
        role={getRootProps().role}
        tabIndex={getRootProps().tabIndex}
        style={{
          ...styles.dropzone,
          ...(isDragActive ? styles.dropzoneActive : {}),
        }}
        whileHover={{ borderColor: 'var(--gold)' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
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
              transition={{ delay: 0.6 }}
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
      </motion.div>

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
            transition={{ duration: 0.2 }}
          />
        </motion.div>
      )}

      {uploadedFile && !isProcessing && stationState !== StationState.COMPLETED && (
        <motion.button
          style={styles.button}
          onClick={handleProceed}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ transform: 'translateY(-2px)', boxShadow: '0 6px 30px rgba(212, 168, 83, 0.5)' }}
        >
          Initialize Visual Analysis
        </motion.button>
      )}

      {stationState === StationState.COMPLETED && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', marginTop: '2rem' }}
        >
          <span style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>
            ✓ Visual calibration complete
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

export default VisualStation;
