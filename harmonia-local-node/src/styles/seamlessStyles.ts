/**
 * Seamless Station Styles - Session 22 & 26
 * Borderless, transparent styling for stations floating over WebGL
 *
 * Provides text shadows, glow effects, and transparency utilities
 * for UI elements that need to be readable over dynamic WebGL backgrounds
 */

import type { CSSProperties } from 'react';

// =============================================================================
// TEXT LAYER STYLES - For readability over WebGL backgrounds
// =============================================================================

export const TextLayer = {
  // Primary text - main headings and important content
  PRIMARY: {
    color: 'var(--gold-champagne)',
    textShadow: '0 0 30px rgba(0,0,0,0.9), 0 0 60px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.8)',
  } as CSSProperties,

  // Secondary text - descriptions and supporting content
  SECONDARY: {
    color: 'var(--text-secondary)',
    textShadow: '0 0 20px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)',
  } as CSSProperties,

  // Muted text - hints and subtle content
  MUTED: {
    color: 'var(--text-muted)',
    textShadow: '0 0 15px rgba(0,0,0,0.7)',
  } as CSSProperties,

  // Accent text - glowing gold highlights
  ACCENT: {
    color: 'var(--gold)',
    textShadow: '0 0 20px var(--gold), 0 0 40px rgba(212,168,83,0.3), 0 2px 4px rgba(0,0,0,0.8)',
  } as CSSProperties,

  // Terminal text - monospace code-like text
  TERMINAL: {
    color: 'var(--gold-champagne)',
    textShadow: '0 0 10px rgba(212,168,83,0.5), 0 0 30px rgba(0,0,0,0.9)',
    fontFamily: "'JetBrains Mono', monospace",
  } as CSSProperties,

  // Holographic - slight chromatic aberration effect
  HOLOGRAPHIC: {
    color: 'var(--gold)',
    textShadow: `
      0 0 20px var(--gold),
      -1px 0 rgba(255,100,100,0.3),
      1px 0 rgba(100,100,255,0.3),
      0 0 40px rgba(0,0,0,0.8)
    `,
  } as CSSProperties,
};

// =============================================================================
// SEAMLESS CONTAINER STYLES - No borders, transparent backgrounds
// =============================================================================

export const SeamlessContainer = {
  // Base seamless container - transparent with no borders
  BASE: {
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    borderRadius: 0,
  } as CSSProperties,

  // Centered content container
  CENTERED: {
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
  } as CSSProperties,

  // Floating panel - very subtle backdrop for dense content
  FLOATING: {
    background: 'rgba(18, 9, 10, 0.3)',
    backdropFilter: 'blur(8px)',
    border: 'none',
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  } as CSSProperties,

  // Glass whisper - barely visible container
  WHISPER: {
    background: 'rgba(18, 9, 10, 0.15)',
    backdropFilter: 'blur(4px)',
    border: 'none',
    borderRadius: '4px',
  } as CSSProperties,
};

// =============================================================================
// GLOW EFFECTS - For interactive elements
// =============================================================================

export const GlowEffect = {
  // Gold glow for active/hover states
  GOLD: {
    boxShadow: '0 0 20px rgba(212, 168, 83, 0.4), 0 0 40px rgba(212, 168, 83, 0.2)',
  } as CSSProperties,

  // Intense gold glow for focus/active states
  GOLD_INTENSE: {
    boxShadow: '0 0 30px rgba(212, 168, 83, 0.6), 0 0 60px rgba(212, 168, 83, 0.3), 0 0 90px rgba(212, 168, 83, 0.1)',
  } as CSSProperties,

  // Maroon glow for secondary elements
  MAROON: {
    boxShadow: '0 0 20px rgba(114, 47, 55, 0.5), 0 0 40px rgba(114, 47, 55, 0.2)',
  } as CSSProperties,

  // Subtle ambient glow
  AMBIENT: {
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  } as CSSProperties,

  // Text input glow (for underlines)
  INPUT_FOCUS: {
    boxShadow: '0 2px 10px rgba(212, 168, 83, 0.5), 0 4px 20px rgba(212, 168, 83, 0.2)',
  } as CSSProperties,
};

// =============================================================================
// INPUT STYLES - Borderless inputs with glow underlines
// =============================================================================

export const SeamlessInput = {
  // Base input - transparent with glowing underline
  BASE: {
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(212, 168, 83, 0.5)',
    borderRadius: 0,
    outline: 'none',
    color: 'var(--gold-champagne)',
    fontFamily: "'JetBrains Mono', monospace",
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  } as CSSProperties,

  // Focused input state
  FOCUSED: {
    borderBottom: '2px solid var(--gold)',
    boxShadow: '0 2px 15px rgba(212, 168, 83, 0.4)',
  } as CSSProperties,

  // Input placeholder styling (apply via CSS)
  PLACEHOLDER_COLOR: 'rgba(212, 168, 83, 0.3)',
};

// =============================================================================
// BUTTON STYLES - Floating buttons with glow
// =============================================================================

export const SeamlessButton = {
  // Primary button - gradient with glow
  PRIMARY: {
    background: 'linear-gradient(135deg, var(--gold), var(--gold-champagne))',
    color: 'var(--maroon-deep)',
    border: 'none',
    borderRadius: '4px',
    padding: '1rem 2rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(212, 168, 83, 0.3)',
  } as CSSProperties,

  // Primary button hover state
  PRIMARY_HOVER: {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 30px rgba(212, 168, 83, 0.5), 0 0 40px rgba(212, 168, 83, 0.2)',
  } as CSSProperties,

  // Ghost button - outline only
  GHOST: {
    background: 'transparent',
    color: 'var(--gold)',
    border: '1px solid rgba(212, 168, 83, 0.3)',
    borderRadius: '4px',
    padding: '0.75rem 1.5rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  } as CSSProperties,

  // Ghost button hover
  GHOST_HOVER: {
    borderColor: 'var(--gold)',
    boxShadow: '0 0 20px rgba(212, 168, 83, 0.3)',
  } as CSSProperties,
};

// =============================================================================
// PROGRESS INDICATOR STYLES - Glowing orbs instead of bordered dots
// =============================================================================

export const ProgressOrb = {
  // Base orb style
  BASE: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: 'none',
    transition: 'all 0.3s ease',
  } as CSSProperties,

  // Inactive orb - dim
  INACTIVE: {
    background: 'rgba(45, 26, 28, 0.6)',
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
  } as CSSProperties,

  // Active orb - glowing gold
  ACTIVE: {
    background: 'var(--gold)',
    boxShadow: '0 0 15px var(--gold), 0 0 30px rgba(212, 168, 83, 0.5)',
  } as CSSProperties,

  // Completed orb - subtle maroon
  COMPLETED: {
    background: 'var(--maroon)',
    boxShadow: '0 0 10px rgba(114, 47, 55, 0.5)',
  } as CSSProperties,
};

// =============================================================================
// DIVIDER STYLES - Glowing lines instead of hard borders
// =============================================================================

export const SeamlessDivider = {
  // Horizontal glowing line
  HORIZONTAL: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
    border: 'none',
    boxShadow: '0 0 10px rgba(212, 168, 83, 0.3)',
    margin: '1rem 0',
  } as CSSProperties,

  // Animated gradient line
  ANIMATED: {
    height: '2px',
    background: 'linear-gradient(90deg, transparent, var(--gold), var(--gold-champagne), var(--gold), transparent)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 3s ease-in-out infinite',
    border: 'none',
  } as CSSProperties,
};

// =============================================================================
// ANIMATION KEYFRAMES (to be added to CSS)
// =============================================================================

export const seamlessKeyframes = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 15px var(--gold), 0 0 30px rgba(212, 168, 83, 0.5);
    }
    50% {
      box-shadow: 0 0 25px var(--gold), 0 0 50px rgba(212, 168, 83, 0.7);
    }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  @keyframes text-glow-pulse {
    0%, 100% {
      text-shadow: 0 0 20px var(--gold), 0 0 40px rgba(212, 168, 83, 0.3);
    }
    50% {
      text-shadow: 0 0 30px var(--gold), 0 0 60px rgba(212, 168, 83, 0.5);
    }
  }
`;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Merge multiple style objects
 */
export const mergeStyles = (...styles: (CSSProperties | undefined)[]): CSSProperties => {
  return styles.reduce<CSSProperties>((acc, style) => {
    if (style) {
      return { ...acc, ...style };
    }
    return acc;
  }, {});
};

/**
 * Create a responsive text shadow based on background brightness
 * @param intensity 0-1, higher = more shadow for darker backgrounds
 */
export const adaptiveTextShadow = (intensity: number = 0.8): CSSProperties => {
  const shadowStrength = Math.min(1, Math.max(0, intensity));
  return {
    textShadow: `
      0 0 ${30 * shadowStrength}px rgba(0,0,0,${0.9 * shadowStrength}),
      0 0 ${60 * shadowStrength}px rgba(0,0,0,${0.5 * shadowStrength}),
      0 2px 4px rgba(0,0,0,${0.8 * shadowStrength})
    `,
  };
};

/**
 * Create glow effect with custom color
 */
export const customGlow = (color: string, intensity: number = 1): CSSProperties => {
  return {
    boxShadow: `
      0 0 ${20 * intensity}px ${color},
      0 0 ${40 * intensity}px ${color}66,
      0 0 ${60 * intensity}px ${color}33
    `,
  };
};

export default {
  TextLayer,
  SeamlessContainer,
  GlowEffect,
  SeamlessInput,
  SeamlessButton,
  ProgressOrb,
  SeamlessDivider,
  mergeStyles,
  adaptiveTextShadow,
  customGlow,
};
