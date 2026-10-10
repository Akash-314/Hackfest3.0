import React, { useEffect, useRef } from 'react';

/**
 * CursorTrail:
 * High-performance 2D Canvas-based futuristic superhero HUD energy cursor.
 * Features:
 * - Smooth lerped tracking of real mouse movements
 * - Dynamic particle trail that elongates with cursor speed and dissipates on standstill
 * - Interactive states: expands & spawns energy reticle ring on hover (buttons, links)
 * - Click shockwave pulse with radial sparks
 * - Automatically disabled on touch devices and respects prefers-reduced-motion
 */
export default function CursorTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // 1. Disable on touch / mobile devices
    const isTouch =
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;
    if (isTouch) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Reduced motion check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mouse coordinates and state
    let mouseX = -100;
    let mouseY = -100;
    let currentX = -100;
    let currentY = -100;
    let lastX = -100;
    let lastY = -100;
    let isHovering = false;
    let isVisible = false;

    // Dynamic particle collection
    const particles = [];
    const maxParticles = prefersReducedMotion ? 25 : 65;

    // Click pulses
    const pulses = [];

    // Reticle rotation angle
    let reticleAngle = 0;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        currentX = mouseX;
        currentY = mouseY;
        lastX = mouseX;
        lastY = mouseY;
        isVisible = true;
      }
    };

    const onMouseLeave = () => {
      isVisible = false;
    };

    const onMouseDown = (e) => {
      if (!isVisible) return;
      pulses.push({
        x: e.clientX,
        y: e.clientY,
        radius: 6,
        maxRadius: 36,
        opacity: 0.9,
      });

      // Spawn burst sparks on click
      const sparkCount = prefersReducedMotion ? 6 : 14;
      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.5 + Math.random() * 4.5;
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 1.5 + Math.random() * 2.0,
          color: Math.random() > 0.3 ? '#00e5ff' : '#ffffff',
          alpha: 1.0,
          decay: 0.04 + Math.random() * 0.03,
        });
      }
    };

    // Detect hover over interactive elements
    const onMouseOver = (e) => {
      const target = e.target;
      if (!target) return;
      const interactive =
        target.closest('button, a, input, select, textarea, [role="button"]') ||
        target.classList.contains('cursor-hover') ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'A';
      isHovering = !!interactive;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });

    // Animation Loop
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      ctx.clearRect(0, 0, width, height);

      if (!isVisible) return;

      // Smooth lerp to mouse position
      const lerpFactor = 0.28;
      currentX += (mouseX - currentX) * lerpFactor;
      currentY += (mouseY - currentY) * lerpFactor;

      const speedX = currentX - lastX;
      const speedY = currentY - lastY;
      const speed = Math.sqrt(speedX * speedX + speedY * speedY);
      lastX = currentX;
      lastY = currentY;

      // Spawn particles along path when cursor is moving
      if (speed > 0.8 && particles.length < maxParticles) {
        const count = Math.min(4, Math.floor(speed * 0.45) + 1);
        for (let i = 0; i < count; i++) {
          const jitterAngle = Math.random() * Math.PI * 2;
          const jitterDist = Math.random() * 3.5;
          particles.push({
            x: currentX + Math.cos(jitterAngle) * jitterDist,
            y: currentY + Math.sin(jitterAngle) * jitterDist,
            vx: -speedX * 0.18 + (Math.random() - 0.5) * 0.8,
            vy: -speedY * 0.18 + (Math.random() - 0.5) * 0.8,
            size: isHovering ? 2.2 + Math.random() * 2.0 : 1.4 + Math.random() * 1.8,
            color: isHovering
              ? Math.random() > 0.4
                ? '#00e5ff'
                : '#ffb703'
              : Math.random() > 0.25
              ? '#00e5ff'
              : '#ffffff',
            alpha: 0.9,
            decay: 0.025 + Math.random() * 0.025,
          });
        }
      }

      // Render and update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0.02) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Render and update click shockwave pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.radius += 2.2;
        pulse.opacity -= 0.05;

        if (pulse.opacity <= 0.02) {
          pulses.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = pulse.opacity;
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Render main futuristic cursor head
      ctx.save();
      const headRadius = isHovering ? 6.5 : 3.8;

      // Outer soft glow
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = isHovering ? '#00e5ff' : '#00bfff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = isHovering ? 18 : 12;
      ctx.beginPath();
      ctx.arc(currentX, currentY, headRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Sharp core
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(currentX, currentY, headRadius, 0, Math.PI * 2);
      ctx.fill();

      // If hovering interactive element, draw rotating tech reticle ring
      if (isHovering) {
        reticleAngle += 0.05;
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 8;
        ctx.setLineDash([4, 4]);

        ctx.beginPath();
        ctx.arc(currentX, currentY, 14, reticleAngle, reticleAngle + Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseover', onMouseOver);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 99999,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}
