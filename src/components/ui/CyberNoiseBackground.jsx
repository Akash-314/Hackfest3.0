import React, { useEffect, useRef } from 'react';

export default function CyberNoiseBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particles
    const particleCount = Math.min(width > 768 ? 60 : 25, 60);
    const particles = [];

    const colors = ['rgba(0, 191, 255, 0.4)', 'rgba(230, 36, 41, 0.35)', 'rgba(245, 182, 66, 0.35)'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        color: colors[i % colors.length],
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render drifting energy particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="cyber-ambient-environment" aria-hidden="true">
      <div className="cyber-grid-floor" />
      <div className="cyber-vignette-radial" />
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          maxWidth: '100vw',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.75,
        }}
      />
    </div>
  );
}
