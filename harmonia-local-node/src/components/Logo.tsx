/**
 * Logo Component - Displays the Harmonia logo
 * Uses PNG if available, falls back to SVG "H" logo
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: number;
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Try to import the logo PNG
let logoImage: string | null = null;
try {
  // @ts-ignore - dynamic import
  logoImage = new URL('../assets/logo.png', import.meta.url).href;
} catch {
  logoImage = null;
}

export function Logo({ size = 80, animated = true, className, style }: LogoProps) {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    // Check if the logo image exists
    if (logoImage) {
      const img = new Image();
      img.onload = () => setImageSrc(logoImage);
      img.onerror = () => setImageError(true);
      img.src = logoImage;
    } else {
      setImageError(true);
    }
  }, []);

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    filter: 'drop-shadow(0 0 10px rgba(212, 168, 83, 0.5))',
  };

  // If we have a valid image, show it
  if (imageSrc && !imageError) {
    if (animated) {
      return (
        <motion.div style={containerStyle} className={className}>
          <motion.img
            src={imageSrc}
            alt="Harmonia Logo"
            style={imageStyle}
            animate={{
              filter: [
                'drop-shadow(0 0 10px rgba(212, 168, 83, 0.5))',
                'drop-shadow(0 0 20px rgba(212, 168, 83, 0.8))',
                'drop-shadow(0 0 10px rgba(212, 168, 83, 0.5))',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      );
    }
    return (
      <div style={containerStyle} className={className}>
        <img src={imageSrc} alt="Harmonia Logo" style={imageStyle} />
      </div>
    );
  }

  // Fallback to SVG "H" logo
  return (
    <motion.div style={containerStyle} className={className}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        <defs>
          <filter id="logoGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4A853" />
            <stop offset="50%" stopColor="#F5D98A" />
            <stop offset="100%" stopColor="#D4A853" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth="2"
          filter="url(#logoGlow)"
        />
        <text
          x="50"
          y="62"
          textAnchor="middle"
          fontFamily="'Cormorant Garamond', serif"
          fontSize="50"
          fontWeight="700"
          fill="url(#goldGradient)"
          filter="url(#logoGlow)"
        >
          H
        </text>
      </svg>
    </motion.div>
  );
}

export default Logo;
