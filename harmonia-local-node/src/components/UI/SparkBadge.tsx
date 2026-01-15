/**
 * SparkBadge - Electric pulse animation badge component
 */

import { motion } from 'framer-motion';

interface SparkBadgeProps {
  value: number | string;
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

const styles = {
  container: {
    position: 'relative' as const,
    display: 'inline-flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.5rem',
  },
  badge: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--maroon), var(--maroon-deep))',
    border: '2px solid var(--gold)',
    overflow: 'hidden',
  },
  badgeSmall: {
    width: '60px',
    height: '60px',
  },
  badgeMedium: {
    width: '100px',
    height: '100px',
  },
  badgeLarge: {
    width: '140px',
    height: '140px',
  },
  value: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 700,
    color: 'var(--gold-champagne)',
    zIndex: 2,
  },
  valueSmall: {
    fontSize: '1.2rem',
  },
  valueMedium: {
    fontSize: '2rem',
  },
  valueLarge: {
    fontSize: '3rem',
  },
  label: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  },
  shimmer: {
    position: 'absolute' as const,
    top: 0,
    left: '-100%',
    width: '200%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(212, 168, 83, 0.3), transparent)',
    zIndex: 1,
  },
  pulseRing: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    border: '2px solid var(--gold)',
    pointerEvents: 'none' as const,
  },
};

export function SparkBadge({ value, label, size = 'medium' }: SparkBadgeProps) {
  const sizeStyles = {
    small: { badge: styles.badgeSmall, value: styles.valueSmall },
    medium: { badge: styles.badgeMedium, value: styles.valueMedium },
    large: { badge: styles.badgeLarge, value: styles.valueLarge },
  };

  const badgeSize = size === 'small' ? 60 : size === 'medium' ? 100 : 140;

  return (
    <motion.div
      style={styles.container}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      <motion.div
        style={{ ...styles.badge, ...sizeStyles[size].badge }}
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(212, 168, 83, 0.4)',
            '0 0 0 15px rgba(212, 168, 83, 0)',
            '0 0 0 0 rgba(212, 168, 83, 0)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
      >
        {/* Shimmer effect */}
        <motion.div
          style={styles.shimmer}
          animate={{ x: ['0%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
        />

        {/* Value */}
        <span
          style={{ ...styles.value, ...sizeStyles[size].value }}
          className="gold-foil-text"
        >
          {value}
        </span>

        {/* Pulse rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{
              ...styles.pulseRing,
              width: badgeSize,
              height: badgeSize,
            }}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeOut',
            }}
          />
        ))}
      </motion.div>

      {/* Label */}
      {label && (
        <motion.span
          style={styles.label}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {label}
        </motion.span>
      )}
    </motion.div>
  );
}

export default SparkBadge;
