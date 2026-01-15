/**
 * ResultsStation - Phase 5: Results Dashboard
 * Features Sealed Dossier reveal and Radar Chart visualization
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { useApp, Phase, StationState } from '../../context/AppContext';
import SparkBadge from '../UI/SparkBadge';

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const styles = {
  container: {
    width: '100%',
    maxWidth: '800px',
    padding: '2rem',
  },
  sealedDossier: {
    position: 'relative' as const,
    background: 'rgba(45, 26, 28, 0.8)',
    border: '2px solid var(--gold)',
    borderRadius: '16px',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  sealOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(45, 26, 28, 0.95), rgba(18, 9, 10, 0.98))',
    zIndex: 10,
  },
  sealIcon: {
    width: '120px',
    height: '120px',
    marginBottom: '1.5rem',
  },
  sealText: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.5rem',
    color: 'var(--gold-champagne)',
    textAlign: 'center' as const,
  },
  sealSubtext: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.5rem',
  },
  content: {
    padding: '2rem',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid rgba(212, 168, 83, 0.2)',
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
  scoreSection: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '3rem',
  },
  gridSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
  },
  card: {
    background: 'rgba(45, 26, 28, 0.4)',
    border: '1px solid rgba(212, 168, 83, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  cardTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.2rem',
    color: 'var(--gold)',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  radarContainer: {
    height: '280px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inventoryList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  inventoryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid rgba(212, 168, 83, 0.1)',
  },
  inventoryLabel: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  },
  inventoryValue: {
    fontFamily: "'JetBrains Mono', monospace",
    color: 'var(--gold)',
    fontSize: '0.9rem',
  },
  directive: {
    background: 'linear-gradient(135deg, rgba(114, 47, 55, 0.3), rgba(45, 26, 28, 0.5))',
    border: '1px solid var(--gold)',
    borderRadius: '8px',
    padding: '1.5rem',
    textAlign: 'center' as const,
  },
  directiveTitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.7rem',
    color: 'var(--gold)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    marginBottom: '0.75rem',
  },
  directiveText: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.3rem',
    color: 'var(--gold-champagne)',
    fontStyle: 'italic' as const,
    lineHeight: 1.5,
  },
};

export function ResultsStation() {
  const { state } = useApp();
  const [isSealed, setIsSealed] = useState(true);

  const stationState = state.stationStates[Phase.RESULTS];
  const results = state.results;

  // Radar chart configuration
  const radarData = {
    labels: ['Visual', 'Emotional', 'Intellectual', 'Values', 'Lifestyle', 'Chemistry'],
    datasets: [
      {
        label: 'Compatibility Profile',
        data: results?.radarData || [0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(114, 47, 55, 0.3)',
        borderColor: '#722F37',
        borderWidth: 2,
        pointBackgroundColor: '#D4A853',
        pointBorderColor: '#D4A853',
        pointHoverBackgroundColor: '#F0C86E',
        pointHoverBorderColor: '#F0C86E',
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: 'rgba(212, 168, 83, 0.2)',
        },
        grid: {
          color: 'rgba(212, 168, 83, 0.15)',
        },
        pointLabels: {
          color: '#C4B8B0',
          font: {
            family: "'DM Sans', sans-serif",
            size: 11,
          },
        },
        ticks: {
          display: false,
          stepSize: 20,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart' as const,
    },
  };

  const handleUnseal = () => {
    setIsSealed(false);
  };

  if (stationState === StationState.LOCKED || !results) {
    return (
      <motion.div
        style={styles.container}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        className="glass-monolith"
      >
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={styles.title}>Results Pending</h2>
          <p style={styles.subtitle}>Complete all analysis stations</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      style={styles.container}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <motion.div
        style={styles.sealedDossier}
        onClick={isSealed ? handleUnseal : undefined}
        layout
      >
        {/* Sealed Overlay */}
        <AnimatePresence>
          {isSealed && (
            <motion.div
              style={styles.sealOverlay}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Wax Seal SVG */}
              <motion.svg
                style={styles.sealIcon}
                viewBox="0 0 100 100"
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <defs>
                  <radialGradient id="sealGrad" cx="30%" cy="30%">
                    <stop offset="0%" stopColor="#8B3A3A" />
                    <stop offset="100%" stopColor="#5C1A1B" />
                  </radialGradient>
                  <filter id="sealShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.4" />
                  </filter>
                </defs>
                <circle cx="50" cy="50" r="45" fill="url(#sealGrad)" filter="url(#sealShadow)" />
                <circle cx="50" cy="50" r="38" stroke="#D4A853" strokeWidth="1.5" fill="none" />
                <text
                  x="50"
                  y="55"
                  textAnchor="middle"
                  fill="#D4A853"
                  fontFamily="'Cormorant Garamond', serif"
                  fontSize="24"
                  fontWeight="600"
                >
                  H
                </text>
              </motion.svg>

              <motion.p
                style={styles.sealText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Compatibility Dossier
              </motion.p>
              <motion.p
                style={styles.sealSubtext}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Click to break seal and reveal results
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dossier Content */}
        <motion.div
          style={styles.content}
          initial={{ opacity: 0 }}
          animate={{ opacity: isSealed ? 0 : 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Header */}
          <div style={styles.header}>
            <h2 style={styles.title}>Compatibility Analysis Complete</h2>
            <p style={styles.subtitle}>HARMONIA_SYNTHESIS_REPORT_V5.3</p>
          </div>

          {/* Global Synergy Quotient */}
          <motion.div
            style={styles.scoreSection}
            initial={{ scale: 0 }}
            animate={{ scale: isSealed ? 0 : 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            <SparkBadge
              value={`${results.globalSynergyQuotient}%`}
              label="Global Synergy Quotient"
              size="large"
            />
          </motion.div>

          {/* Grid Section */}
          <div style={styles.gridSection}>
            {/* Radar Chart */}
            <motion.div
              style={styles.card}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: isSealed ? -30 : 0, opacity: isSealed ? 0 : 1 }}
              transition={{ delay: 0.7 }}
            >
              <h3 style={styles.cardTitle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                Psychometric Inventory (PIIP)
              </h3>
              <div style={styles.radarContainer}>
                <Radar data={radarData} options={radarOptions} />
              </div>
            </motion.div>

            {/* Biological & Visual Forensics */}
            <motion.div
              style={styles.card}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: isSealed ? 30 : 0, opacity: isSealed ? 0 : 1 }}
              transition={{ delay: 0.8 }}
            >
              <h3 style={styles.cardTitle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Biological & Visual Forensics
              </h3>
              <ul style={styles.inventoryList}>
                <li style={styles.inventoryItem}>
                  <span style={styles.inventoryLabel}>Visual Resonance</span>
                  <span style={styles.inventoryValue}>{results.visualScore}%</span>
                </li>
                <li style={styles.inventoryItem}>
                  <span style={styles.inventoryLabel}>Psychometric Alignment</span>
                  <span style={styles.inventoryValue}>{results.psychometricScore}%</span>
                </li>
                <li style={styles.inventoryItem}>
                  <span style={styles.inventoryLabel}>Biometric Compatibility</span>
                  <span style={styles.inventoryValue}>{results.biometricScore}%</span>
                </li>
                <li style={{ ...styles.inventoryItem, borderBottom: 'none' }}>
                  <span style={styles.inventoryLabel}>Synthesis Confidence</span>
                  <span style={styles.inventoryValue}>HIGH</span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Operational Directive */}
          <motion.div
            style={styles.directive}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: isSealed ? 20 : 0, opacity: isSealed ? 0 : 1 }}
            transition={{ delay: 0.9 }}
          >
            <p style={styles.directiveTitle}>Operational Directive</p>
            <p style={styles.directiveText}>"{results.operationalDirective}"</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default ResultsStation;
