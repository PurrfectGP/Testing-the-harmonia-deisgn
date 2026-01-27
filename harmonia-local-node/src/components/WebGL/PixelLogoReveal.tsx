/**
 * PixelLogoReveal - True Pixel-Mapped Particle System
 *
 * The "Magnetizing Swarm" - Phase 0: Intro
 *
 * Features:
 * - Loads logo into off-screen buffer and scans for target pixels
 * - Spawns exactly 4,000 particles from random screen edges
 * - Progressive "Homing Force" that increases over 4 seconds
 * - "Memory Force" - particles remember targets and return after mouse scatter
 * - Mouse repulsion within 100px radius
 * - Pure Canvas physics at 60FPS (no React state updates)
 */

import React, { useEffect, useRef, useCallback } from 'react';
import logoSrc from '../../assets/Celtic Knot (Transparent).png';

// ============================================
// CONSTANTS
// ============================================
const PARTICLE_COUNT = 4000;
const HOMING_DURATION = 4000; // 4 seconds for full homing force
const MOUSE_REPULSION_RADIUS = 100;
const MOUSE_REPULSION_STRENGTH = 8;
const MEMORY_FORCE = 0.08; // Force to return to target after scatter
const FRICTION = 0.92;
const MAX_VELOCITY = 15;

// Gold color palette for particles
const GOLD_COLORS = [
  { r: 212, g: 168, b: 83 },  // Primary gold #D4A853
  { r: 240, g: 200, b: 110 }, // Light gold #F0C86E
  { r: 245, g: 217, b: 138 }, // Champagne #F5D98A
  { r: 196, g: 149, b: 106 }, // Warm gold #C4956A
];

// ============================================
// PARTICLE INTERFACE
// ============================================
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  homeX: number; // Original target for memory
  homeY: number;
  r: number;
  g: number;
  b: number;
  alpha: number;
  size: number;
  isScattered: boolean; // Track if particle was recently scattered
}

// ============================================
// PROPS INTERFACE
// ============================================
interface PixelLogoRevealProps {
  onBegin?: () => void;
}

// ============================================
// COMPONENT
// ============================================
const PixelLogoReveal: React.FC<PixelLogoRevealProps> = ({ onBegin }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const startTimeRef = useRef<number>(0);
  const isClickedRef = useRef(false);
  const targetCoordsRef = useRef<{ x: number; y: number }[]>([]);

  // ============================================
  // SPAWN PARTICLE AT RANDOM EDGE
  // ============================================
  const spawnAtEdge = useCallback((
    canvasWidth: number,
    canvasHeight: number,
    targetX: number,
    targetY: number
  ): Particle => {
    // Choose random edge (0=top, 1=right, 2=bottom, 3=left)
    const edge = Math.floor(Math.random() * 4);
    let x: number, y: number;

    switch (edge) {
      case 0: // Top edge
        x = Math.random() * canvasWidth;
        y = -10;
        break;
      case 1: // Right edge
        x = canvasWidth + 10;
        y = Math.random() * canvasHeight;
        break;
      case 2: // Bottom edge
        x = Math.random() * canvasWidth;
        y = canvasHeight + 10;
        break;
      default: // Left edge
        x = -10;
        y = Math.random() * canvasHeight;
        break;
    }

    // Random gold color from palette
    const color = GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)];

    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      targetX,
      targetY,
      homeX: targetX,
      homeY: targetY,
      r: color.r,
      g: color.g,
      b: color.b,
      alpha: 0.5 + Math.random() * 0.5,
      size: 1 + Math.random() * 2,
      isScattered: false,
    };
  }, []);

  // ============================================
  // SCAN LOGO PIXELS AND EXTRACT TARGET COORDINATES
  // ============================================
  const scanLogoPixels = useCallback((
    image: HTMLImageElement,
    canvasWidth: number,
    canvasHeight: number
  ): { x: number; y: number }[] => {
    // Create off-screen buffer
    const buffer = document.createElement('canvas');
    const bCtx = buffer.getContext('2d');
    if (!bCtx) return [];

    // Scale logo to fit nicely (350px width)
    const logoWidth = 350;
    const scale = logoWidth / image.width;
    const logoHeight = image.height * scale;

    buffer.width = canvasWidth;
    buffer.height = canvasHeight;

    // Center the image
    const startX = (canvasWidth - logoWidth) / 2;
    const startY = (canvasHeight - logoHeight) / 2;

    bCtx.drawImage(image, startX, startY, logoWidth, logoHeight);

    // Scan pixels and collect target coordinates
    const imageData = bCtx.getImageData(0, 0, canvasWidth, canvasHeight);
    const data = imageData.data;
    const targets: { x: number; y: number }[] = [];

    // Scan with appropriate density to find all logo pixels
    const scanDensity = 2;
    for (let y = 0; y < canvasHeight; y += scanDensity) {
      for (let x = 0; x < canvasWidth; x += scanDensity) {
        const index = (y * canvasWidth + x) * 4;
        const alpha = data[index + 3];

        if (alpha > 50) { // Pixel is part of logo
          targets.push({ x, y });
        }
      }
    }

    return targets;
  }, []);

  // ============================================
  // INITIALIZE PARTICLES
  // ============================================
  const initializeParticles = useCallback((
    targets: { x: number; y: number }[],
    canvasWidth: number,
    canvasHeight: number
  ): Particle[] => {
    const particles: Particle[] = [];

    if (targets.length === 0) {
      console.warn('No target pixels found in logo');
      return particles;
    }

    // Spawn exactly PARTICLE_COUNT particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Assign each particle to a target pixel (cycle through targets)
      const target = targets[i % targets.length];
      particles.push(spawnAtEdge(canvasWidth, canvasHeight, target.x, target.y));
    }

    console.log(`Initialized ${PARTICLE_COUNT} particles with ${targets.length} target pixels`);
    return particles;
  }, [spawnAtEdge]);

  // ============================================
  // PHYSICS UPDATE (60FPS)
  // ============================================
  const updatePhysics = useCallback((
    particles: Particle[],
    mouseX: number,
    mouseY: number,
    elapsedTime: number
  ) => {
    // Calculate progressive homing force (0 to 1 over HOMING_DURATION)
    const homingProgress = Math.min(elapsedTime / HOMING_DURATION, 1);
    // Eased homing force (starts slow, accelerates)
    const homingForce = homingProgress * homingProgress * 0.12;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Calculate distance to mouse
      const dmx = p.x - mouseX;
      const dmy = p.y - mouseY;
      const mouseDistance = Math.sqrt(dmx * dmx + dmy * dmy);

      // Mouse repulsion
      if (mouseDistance < MOUSE_REPULSION_RADIUS && mouseDistance > 0) {
        const repulsionForce = (MOUSE_REPULSION_RADIUS - mouseDistance) / MOUSE_REPULSION_RADIUS;
        const angle = Math.atan2(dmy, dmx);
        p.vx += Math.cos(angle) * repulsionForce * MOUSE_REPULSION_STRENGTH;
        p.vy += Math.sin(angle) * repulsionForce * MOUSE_REPULSION_STRENGTH;
        p.isScattered = true;
      }

      // Calculate distance to target
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      const targetDistance = Math.sqrt(dx * dx + dy * dy);

      // Apply homing force (progressive over 4 seconds)
      if (targetDistance > 1) {
        // Normalize and apply force
        const nx = dx / targetDistance;
        const ny = dy / targetDistance;

        // Use memory force if scattered, otherwise use progressive homing
        const currentForce = p.isScattered ? MEMORY_FORCE : homingForce;

        p.vx += nx * currentForce * targetDistance * 0.01;
        p.vy += ny * currentForce * targetDistance * 0.01;

        // Once close to target, no longer scattered
        if (targetDistance < 5) {
          p.isScattered = false;
        }
      }

      // Apply friction
      p.vx *= FRICTION;
      p.vy *= FRICTION;

      // Clamp velocity
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > MAX_VELOCITY) {
        p.vx = (p.vx / speed) * MAX_VELOCITY;
        p.vy = (p.vy / speed) * MAX_VELOCITY;
      }

      // Update position
      p.x += p.vx;
      p.y += p.vy;
    }
  }, []);

  // ============================================
  // RENDER PARTICLES
  // ============================================
  const renderParticles = useCallback((
    ctx: CanvasRenderingContext2D,
    particles: Particle[],
    canvasWidth: number,
    canvasHeight: number
  ) => {
    // Clear with semi-transparent background for trail effect
    ctx.fillStyle = 'rgba(18, 9, 10, 0.15)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw each particle
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Skip particles far off-screen
      if (p.x < -50 || p.x > canvasWidth + 50 || p.y < -50 || p.y > canvasHeight + 50) {
        continue;
      }

      ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  // ============================================
  // ANIMATION LOOP
  // ============================================
  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate elapsed time since animation start
    if (startTimeRef.current === 0) {
      startTimeRef.current = timestamp;
    }
    const elapsedTime = timestamp - startTimeRef.current;

    // Update physics
    updatePhysics(
      particlesRef.current,
      mouseRef.current.x,
      mouseRef.current.y,
      elapsedTime
    );

    // Render
    renderParticles(ctx, particlesRef.current, canvas.width, canvas.height);

    // Continue animation loop
    requestRef.current = requestAnimationFrame(animate);
  }, [updatePhysics, renderParticles]);

  // ============================================
  // INITIALIZATION EFFECT
  // ============================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Clear canvas
    ctx.fillStyle = '#12090A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load logo image
    const image = new Image();
    image.src = logoSrc;

    image.onload = () => {
      console.log('Logo loaded:', image.width, 'x', image.height);

      // Scan logo pixels
      const targets = scanLogoPixels(image, canvas.width, canvas.height);
      targetCoordsRef.current = targets;

      // Initialize particles
      particlesRef.current = initializeParticles(targets, canvas.width, canvas.height);

      // Start animation
      startTimeRef.current = 0;
      requestRef.current = requestAnimationFrame(animate);
    };

    image.onerror = (err) => {
      console.error('Failed to load logo image:', err);
    };

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Re-initialize particles with new canvas size if we have targets
      if (targetCoordsRef.current.length > 0) {
        // Re-scan logo for new canvas size
        const newTargets = scanLogoPixels(image, canvas.width, canvas.height);
        targetCoordsRef.current = newTargets;

        // Update existing particle targets
        particlesRef.current.forEach((p, i) => {
          const target = newTargets[i % newTargets.length];
          p.targetX = target.x;
          p.targetY = target.y;
          p.homeX = target.x;
          p.homeY = target.y;
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [scanLogoPixels, initializeParticles, animate]);

  // ============================================
  // EVENT HANDLERS
  // ============================================
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleClick = useCallback(() => {
    if (!isClickedRef.current) {
      isClickedRef.current = true;
      onBegin?.();
    }
  }, [onBegin]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    // Reset mouse position when touch ends
    mouseRef.current = { x: -9999, y: -9999 };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-auto z-10"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        background: 'transparent',
        cursor: 'pointer',
      }}
      aria-label="Interactive particle logo - click to begin"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    />
  );
};

export default PixelLogoReveal;
