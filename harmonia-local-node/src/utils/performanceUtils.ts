/**
 * Performance Utilities for WebGL Visualizations
 * Session 12: Performance Optimization
 *
 * Features:
 * - Device capability detection
 * - LOD (Level of Detail) helpers
 * - Frame rate monitoring
 * - Particle count scaling
 * - GPU tier detection
 */

// Device performance tiers
export const PerformanceTier = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;
export type PerformanceTier = (typeof PerformanceTier)[keyof typeof PerformanceTier];

// Detect device performance tier
export function detectPerformanceTier(): PerformanceTier {
  // Check for mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 2;

  // Check device memory (if available)
  const memory = (navigator as any).deviceMemory || 4;

  // Check WebGL capabilities
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  let maxTextureSize = 2048;
  if (gl) {
    maxTextureSize = (gl as WebGLRenderingContext).getParameter(
      (gl as WebGLRenderingContext).MAX_TEXTURE_SIZE
    );
  }

  // Score the device
  let score = 0;

  // Core count
  if (cores >= 8) score += 3;
  else if (cores >= 4) score += 2;
  else score += 1;

  // Memory
  if (memory >= 8) score += 3;
  else if (memory >= 4) score += 2;
  else score += 1;

  // Texture size
  if (maxTextureSize >= 8192) score += 3;
  else if (maxTextureSize >= 4096) score += 2;
  else score += 1;

  // Mobile penalty
  if (isMobile) score -= 2;

  // Determine tier
  if (score >= 7) return PerformanceTier.HIGH;
  if (score >= 4) return PerformanceTier.MEDIUM;
  return PerformanceTier.LOW;
}

// Get optimized particle count based on performance tier
export function getOptimizedParticleCount(
  baseCount: number,
  tier?: PerformanceTier
): number {
  const performanceTier = tier || detectPerformanceTier();

  const multipliers: Record<PerformanceTier, number> = {
    [PerformanceTier.HIGH]: 1.0,
    [PerformanceTier.MEDIUM]: 0.6,
    [PerformanceTier.LOW]: 0.3,
  };

  return Math.floor(baseCount * multipliers[performanceTier]);
}

// Get optimized shader quality settings
export interface ShaderQuality {
  noiseOctaves: number;
  shadowSamples: number;
  bloomPasses: number;
  antialiasing: boolean;
}

export function getShaderQuality(tier?: PerformanceTier): ShaderQuality {
  const performanceTier = tier || detectPerformanceTier();

  const qualities: Record<PerformanceTier, ShaderQuality> = {
    [PerformanceTier.HIGH]: {
      noiseOctaves: 6,
      shadowSamples: 16,
      bloomPasses: 5,
      antialiasing: true,
    },
    [PerformanceTier.MEDIUM]: {
      noiseOctaves: 4,
      shadowSamples: 8,
      bloomPasses: 3,
      antialiasing: true,
    },
    [PerformanceTier.LOW]: {
      noiseOctaves: 2,
      shadowSamples: 4,
      bloomPasses: 2,
      antialiasing: false,
    },
  };

  return qualities[performanceTier];
}

// Frame rate monitor
export class FrameRateMonitor {
  private frames: number[] = [];
  private lastTime: number = performance.now();
  private maxSamples: number;

  constructor(maxSamples = 60) {
    this.maxSamples = maxSamples;
  }

  tick(): number {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    const fps = 1000 / delta;
    this.frames.push(fps);

    if (this.frames.length > this.maxSamples) {
      this.frames.shift();
    }

    return fps;
  }

  getAverageFPS(): number {
    if (this.frames.length === 0) return 60;
    return this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
  }

  isPerformanceGood(): boolean {
    return this.getAverageFPS() >= 30;
  }

  reset(): void {
    this.frames = [];
    this.lastTime = performance.now();
  }
}

// LOD (Level of Detail) helper
export interface LODLevel {
  distance: number;
  detail: number; // 0-1, where 1 is full detail
}

export function calculateLOD(
  cameraDistance: number,
  levels: LODLevel[]
): number {
  // Sort levels by distance
  const sorted = [...levels].sort((a, b) => a.distance - b.distance);

  // Find appropriate LOD level
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (cameraDistance >= sorted[i].distance) {
      return sorted[i].detail;
    }
  }

  return 1; // Full detail if closer than all levels
}

// Debounce for expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle for continuous updates
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Check if WebGL is available
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

// Check if WebGL2 is available
export function isWebGL2Available(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
  } catch {
    return false;
  }
}

export default {
  detectPerformanceTier,
  getOptimizedParticleCount,
  getShaderQuality,
  FrameRateMonitor,
  calculateLOD,
  debounce,
  throttle,
  isWebGLAvailable,
  isWebGL2Available,
};
