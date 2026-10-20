import React, { useEffect, useRef } from 'react';

/**
 * CustomCursor:
 * Distinctive, restrained HackFest 3.0 superhero custom cursor.
 * - Precision bright mint center dot
 * - Thin circular targeting ring outline with subtle green glow
 * - Smooth lerp tracking with zero latency perception
 * - Smooth expansion over interactive elements (buttons, links, inputs)
 * - Click press reaction
 * - Native text I-beam preserved on inputs, textareas, and editable text
 * - Completely disabled on touch devices and respects prefers-reduced-motion
 */
export default function CursorTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // 1. Disable on touch / coarse pointer devices
    const isTouch =
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;
    if (isTouch) return;

    // 2. Reduced motion check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    // Coordinates and state
    let mouseX = -100;
    let mouseY = -100;
    let currentX = -100;
    let currentY = -100;
    let isHovering = false;
    let isInput = false;
    let isPressed = false;
    let isVisible = false;
    let ringScale = 1.0;
    let ringOpacity = 0.55;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        currentX = mouseX;
        currentY = mouseY;
        isVisible = true;
      }
    };

    const onMouseLeave = () => {
      isVisible = false;
    };

    const onMouseEnter = () => {
      isVisible = true;
    };

    const onMouseDown = () => {
      isPressed = true;
    };

    const onMouseUp = () => {
      isPressed = false;
    };

    // Detect hover states
    const onMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      const interactive = target.closest('button, a, [role="button"], .btn, select, .cursor-pointer');
      const inputEl = target.closest('input, textarea, [contenteditable="true"]');

      isHovering = Boolean(interactive);
      isInput = Boolean(inputEl);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });

    // Animation Loop
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      ctx.clearRect(0, 0, width, height);

      if (!isVisible || mouseX < 0 || mouseY < 0) return;

      // Don't render over text inputs if native I-beam is shown
      if (isInput) return;

      // Smooth lerp to mouse position
      const lerp = prefersReducedMotion ? 0.9 : 0.35;
      currentX += (mouseX - currentX) * lerp;
      currentY += (mouseY - currentY) * lerp;

      // Target scale & opacity for targeting ring
      const targetScale = isPressed ? 0.8 : isHovering ? 1.65 : 1.0;
      const targetOpacity = isPressed ? 0.85 : isHovering ? 0.8 : 0.55;
      ringScale += (targetScale - ringScale) * 0.22;
      ringOpacity += (targetOpacity - ringOpacity) * 0.22;

      ctx.save();

      // Outer targeting ring
      const baseRadius = 14;
      const ringRadius = baseRadius * ringScale;

      ctx.beginPath();
      ctx.arc(currentX, currentY, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(57, 255, 136, ${ringOpacity})`;
      ctx.lineWidth = isHovering ? 1.5 : 1.0;
      ctx.shadowColor = 'rgba(57, 255, 136, 0.45)';
      ctx.shadowBlur = isHovering ? 10 : 5;
      ctx.stroke();

      // Subtle outer glow halo when hovering
      if (isHovering || isPressed) {
        ctx.beginPath();
        ctx.arc(currentX, currentY, ringRadius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(22, 132, 91, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Center precision mint dot
      const dotRadius = isPressed ? 2.5 : isHovering ? 4.0 : 3.0;
      ctx.beginPath();
      ctx.arc(currentX, currentY, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#39FF88';
      ctx.shadowColor = '#16845B';
      ctx.shadowBlur = 8;
      ctx.fill();

      // Sharp white core
      ctx.beginPath();
      ctx.arc(currentX, currentY, dotRadius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 0;
      ctx.fill();

      ctx.restore();
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
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
