import React, { useEffect, useRef } from 'react';
// Ensure this matches your filename exactly
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

    console.log("LOG: Attempting to load logo from:", logoSrc);

    // 1. THE SCANNER: Load the image
    const image = new Image();
    image.src = logoSrc;
    
    image.onload = () => {
      console.log("LOG: Image loaded successfully!", image.width, "x", image.height);
      
      // Create off-screen buffer
      const buffer = document.createElement('canvas');
      const bCtx = buffer.getContext('2d');
      if (!bCtx) return;

      // Scale logo to a good size (e.g., 350px width)
      const logoWidth = 350;
      const scale = logoWidth / image.width;
      const logoHeight = image.height * scale;
      
      buffer.width = canvas.width;
      buffer.height = canvas.height;
      
      // Center the image
      const startX = (canvas.width - logoWidth) / 2;
      const startY = (canvas.height - logoHeight) / 2;
      
      bCtx.drawImage(image, startX, startY, logoWidth, logoHeight);
      
      // Scan pixels
      const imageData = bCtx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const particles: Particle[] = [];
      
      // Density: Higher number = fewer particles
      const density = 4; 
      
      for (let y = 0; y < canvas.height; y += density) {
        for (let x = 0; x < canvas.width; x += density) {
          const index = (y * canvas.width + x) * 4;
          const alpha = data[index + 3];
          
          if (alpha > 128) {
            particles.push({
              x: Math.random() < 0.5 ? 0 : canvas.width,
              y: Math.random() * canvas.height,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              targetX: x,
              targetY: y,
              color: `rgba(212, 168, 83, ${Math.random() * 0.5 + 0.5})` 
            });
          }
        }
      }
      
      console.log(`LOG: Generated ${particles.length} particles.`);
      particlesRef.current = particles.slice(0, 4500); 
      startAnimation();
    };

    image.onerror = (err) => {
        console.error("LOG: Failed to load logo image.", err);
    };

    // Cleanup
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const startAnimation = () => {
    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear Screen
      ctx.fillStyle = 'rgba(18, 9, 10, 0.3)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const friction = 0.94;
      const ease = 0.05; 
      const reactionRadius = 150;

      particlesRef.current.forEach(p => {
        // Physics
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        
        p.vx += dx * ease;
        p.vy += dy * ease;

        const mx = p.x - mouseRef.current.x;
        const my = p.y - mouseRef.current.y;
        const dist = Math.sqrt(mx * mx + my * my);

        if (dist < reactionRadius) {
          const force = (reactionRadius - dist) / reactionRadius;
          const angle = Math.atan2(my, mx);
          p.vx -= Math.cos(angle) * force * 5; 
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
