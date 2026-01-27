// src/components/WebGL/PixelLogoReveal.tsx
import React, { useEffect, useRef } from 'react';
// CORRECTED ASSET PATH: Uses your real Celtic Knot file
import logoSrc from '../../assets/Celtic Knot (Transparent).png'; 

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  color: string;
}

const PixelLogoReveal: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set Canvas Size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 1. THE SCANNER: Load the correct Celtic Knot image
    const image = new Image();
    image.src = logoSrc;
    image.onload = () => {
      // Create off-screen buffer to read pixel data
      const buffer = document.createElement('canvas');
      const bCtx = buffer.getContext('2d');
      if (!bCtx) return;

      // Scale logo to a good size (e.g., 350px width)
      const logoWidth = 350;
      const scale = logoWidth / image.width;
      const logoHeight = image.height * scale;
      
      buffer.width = canvas.width;
      buffer.height = canvas.height;
      
      // Center the image in the buffer
      const startX = (canvas.width - logoWidth) / 2;
      const startY = (canvas.height - logoHeight) / 2;
      
      bCtx.drawImage(image, startX, startY, logoWidth, logoHeight);
      
      // Scan the buffer for visible pixels
      const imageData = bCtx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const particles: Particle[] = [];
      
      // Density: Higher number = fewer particles (4 is a good balance)
      const density = 4; 
      
      for (let y = 0; y < canvas.height; y += density) {
        for (let x = 0; x < canvas.width; x += density) {
          const index = (y * canvas.width + x) * 4;
          const alpha = data[index + 3];
          
          // If pixel is visible, add a particle
          if (alpha > 128) {
            particles.push({
              // Start: Random positions off-screen or scattered
              x: Math.random() < 0.5 ? 0 : canvas.width,
              y: Math.random() * canvas.height,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              targetX: x,
              targetY: y,
              // Color: Force Harmonia Gold
              color: `rgba(212, 168, 83, ${Math.random() * 0.5 + 0.5})` 
            });
          }
        }
      }
      
      // Limit to ~4500 particles to match the Design Spec
      particlesRef.current = particles.slice(0, 4500); 
      startAnimation();
    };
  };

  const startAnimation = () => {
    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear Screen with "Void" trails
      ctx.fillStyle = 'rgba(18, 9, 10, 0.3)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const friction = 0.94;
      const ease = 0.05; 
      const reactionRadius = 100;

      particlesRef.current.forEach(p => {
        // Homing Physics
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        
        p.vx += dx * ease;
        p.vy += dy * ease;

        // Mouse Interaction
        const mx = p.x - mouseRef.current.x;
        const my = p.y - mouseRef.current.y;
        const dist = Math.sqrt(mx * mx + my * my);

        if (dist < reactionRadius) {
          const force = (reactionRadius - dist) / reactionRadius;
          const angle = Math.atan2(my, mx);
          p.vx -= Math.cos(angle) * force * 5; // Repel
          p.vy -= Math.sin(angle) * force * 5;
        }

        p.vx *= friction;
        p.vy *= friction;
        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 2, 2); 
      });

      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
  };
  
  // Clean up animation on unmount
  useEffect(() => {
      return () => {
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  };

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-auto z-10"
      onMouseMove={handleMouseMove}
      style={{ background: 'transparent' }}
    />
  );
};

export default PixelLogoReveal;
