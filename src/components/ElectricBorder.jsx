import React, { useEffect, useRef, memo } from 'react';
import './ElectricBorder.css';

// Precomputed 512-entry random table for zero-lag noise lookups (100x faster than Math.sin)
const TABLE_SIZE = 512;
const RAND_TABLE = new Float32Array(TABLE_SIZE);
for (let i = 0; i < TABLE_SIZE; i++) {
  RAND_TABLE[i] = ((Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1 + 1) % 1;
}

function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(86, 204, 242, ${alpha})`;
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h.split('').map(c => c + c).join('');
  }
  const int = parseInt(h.slice(0, 6), 16) || 0;
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 2D bilinear smoothed noise in [-1.0, 1.0]
function noise2D(x, y) {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;

  const idx = ((i + j * 57) & (TABLE_SIZE - 1));
  const a = RAND_TABLE[idx];
  const b = RAND_TABLE[(idx + 1) & (TABLE_SIZE - 1)];
  const c = RAND_TABLE[(idx + 57) & (TABLE_SIZE - 1)];
  const d = RAND_TABLE[(idx + 58) & (TABLE_SIZE - 1)];

  const ux = fx * fx * (3.0 - 2.0 * fx);
  const uy = fy * fy * (3.0 - 2.0 * fy);

  const val = a * (1.0 - ux) * (1.0 - uy) + b * ux * (1.0 - uy) + c * (1.0 - ux) * uy + d * ux * uy;
  return val * 2.0 - 1.0; // Normalized to [-1.0, 1.0]
}

// 4-octave zero-mean fractal noise
function octavedNoise(x, octaves, lacunarity, gain, baseAmplitude, baseFrequency, time, seed) {
  let y = 0;
  let amplitude = baseAmplitude;
  let frequency = baseFrequency;

  for (let i = 0; i < octaves; i++) {
    const n = noise2D(frequency * x + seed * 43.1, time * frequency * 0.4);
    y += amplitude * n;
    frequency *= lacunarity;
    amplitude *= gain;
  }

  return y;
}

// Computes perimeter point AND its outward normal vector (nx, ny)
function getRoundedRectPointAndNormal(t, left, top, width, height, radius) {
  const straightWidth = width - 2 * radius;
  const straightHeight = height - 2 * radius;
  const cornerArc = (Math.PI * radius) / 2;
  const totalPerimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerArc;
  const distance = t * totalPerimeter;

  let accumulated = 0;

  // 1. Top straight edge
  if (distance <= accumulated + straightWidth) {
    const progress = (distance - accumulated) / straightWidth;
    return {
      x: left + radius + progress * straightWidth,
      y: top,
      nx: 0,
      ny: -1
    };
  }
  accumulated += straightWidth;

  // 2. Top-right corner
  if (distance <= accumulated + cornerArc) {
    const progress = (distance - accumulated) / cornerArc;
    const angle = -Math.PI / 2 + progress * (Math.PI / 2);
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    return {
      x: left + width - radius + radius * cosA,
      y: top + radius + radius * sinA,
      nx: cosA,
      ny: sinA
    };
  }
  accumulated += cornerArc;

  // 3. Right straight edge
  if (distance <= accumulated + straightHeight) {
    const progress = (distance - accumulated) / straightHeight;
    return {
      x: left + width,
      y: top + radius + progress * straightHeight,
      nx: 1,
      ny: 0
    };
  }
  accumulated += straightHeight;

  // 4. Bottom-right corner
  if (distance <= accumulated + cornerArc) {
    const progress = (distance - accumulated) / cornerArc;
    const angle = progress * (Math.PI / 2);
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    return {
      x: left + width - radius + radius * cosA,
      y: top + height - radius + radius * sinA,
      nx: cosA,
      ny: sinA
    };
  }
  accumulated += cornerArc;

  // 5. Bottom straight edge
  if (distance <= accumulated + straightWidth) {
    const progress = (distance - accumulated) / straightWidth;
    return {
      x: left + width - radius - progress * straightWidth,
      y: top + height,
      nx: 0,
      ny: 1
    };
  }
  accumulated += straightWidth;

  // 6. Bottom-left corner
  if (distance <= accumulated + cornerArc) {
    const progress = (distance - accumulated) / cornerArc;
    const angle = Math.PI / 2 + progress * (Math.PI / 2);
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    return {
      x: left + radius + radius * cosA,
      y: top + height - radius + radius * sinA,
      nx: cosA,
      ny: sinA
    };
  }
  accumulated += cornerArc;

  // 7. Left straight edge
  if (distance <= accumulated + straightHeight) {
    const progress = (distance - accumulated) / straightHeight;
    return {
      x: left,
      y: top + height - radius - progress * straightHeight,
      nx: -1,
      ny: 0
    };
  }
  accumulated += straightHeight;

  // 8. Top-left corner
  const progress = (distance - accumulated) / cornerArc;
  const angle = Math.PI + progress * (Math.PI / 2);
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  return {
    x: left + radius + radius * cosA,
    y: top + radius + radius * sinA,
    nx: cosA,
    ny: sinA
  };
}

function ElectricBorderComponent({
  children,
  color = '#56ccf2',
  speed = 1.4,
  chaos = 0.16,
  borderRadius = 28,
  className = '',
  style = {}
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Displacement and offset config: lightning dances 6px - 18px OUTSIDE the card boundary
    const borderOffset = 50;
    const baseOutwardOffset = 7; // Average outward distance from the card edge
    const maxDisplacement = 13; // Dynamic lightning spike amplitude

    let width = 0;
    let height = 0;
    let dpr = 1;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width + borderOffset * 2);
      height = Math.floor(rect.height + borderOffset * 2);

      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    updateSize();

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const drawElectricBorder = (currentTime) => {
      animationRef.current = requestAnimationFrame(drawElectricBorder);
      if (!isVisible) return;

      if (!lastFrameTimeRef.current) lastFrameTimeRef.current = currentTime;
      const deltaTime = Math.min((currentTime - lastFrameTimeRef.current) / 1000, 0.05);
      timeRef.current += deltaTime * speed;
      lastFrameTimeRef.current = currentTime;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      const left = borderOffset;
      const top = borderOffset;
      const borderWidth = width - 2 * borderOffset;
      const borderHeight = height - 2 * borderOffset;
      const maxRadius = Math.min(borderWidth, borderHeight) / 2;
      const radius = Math.min(borderRadius, maxRadius);

      const approximatePerimeter = 2 * (borderWidth + borderHeight) + 2 * Math.PI * radius;
      const sampleCount = Math.max(120, Math.floor(approximatePerimeter / 3.8));

      const time = timeRef.current;

      ctx.beginPath();

      for (let i = 0; i <= sampleCount; i++) {
        const progress = i / sampleCount;
        const pt = getRoundedRectPointAndNormal(progress, left, top, borderWidth, borderHeight, radius);

        // Outward normal displacement (lightning crackles outwards into space)
        const normalNoise = octavedNoise(progress * 6.5, 4, 1.9, 0.55, 1.0, 5.5, time, 0);
        const normalDisp = baseOutwardOffset + normalNoise * maxDisplacement;

        // Tangent displacement (lightning zig-zags along the perimeter)
        const tangentNoise = octavedNoise(progress * 6.5, 3, 2.0, 0.5, 1.0, 7.5, time, 1);
        const tangentDisp = tangentNoise * (maxDisplacement * 0.35);

        // Displace along the normal vector and tangent vector
        const displacedX = pt.x + pt.nx * normalDisp + (-pt.ny) * tangentDisp;
        const displacedY = pt.y + pt.ny * normalDisp + pt.nx * tangentDisp;

        if (i === 0) {
          ctx.moveTo(displacedX, displacedY);
        } else {
          ctx.lineTo(displacedX, displacedY);
        }
      }

      ctx.closePath();

      // Pass 1: Electric plasma blue aura with glow
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.stroke();

      // Pass 2: Bright white-hot lightning core
      ctx.strokeStyle = 'rgba(235, 252, 255, 0.9)';
      ctx.lineWidth = 0.85;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 2;
      ctx.stroke();
    };

    let resizeTimer;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateSize, 60);
    });
    resizeObserver.observe(container);

    animationRef.current = requestAnimationFrame(drawElectricBorder);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearTimeout(resizeTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();
    };
  }, [color, speed, chaos, borderRadius]);

  const faintColor = hexToRgba(color, 0.45);
  const glowColor = hexToRgba(color, 0.25);

  return (
    <div
      ref={containerRef}
      className={`electric-border-container ${className}`}
      style={{
        '--electric-color': color,
        '--electric-color-faint': faintColor,
        '--electric-color-glow': glowColor,
        borderRadius: `${borderRadius}px`,
        ...style
      }}
    >
      {/* Crackling Electric Lightning Canvas */}
      <div className="electric-canvas-wrapper">
        <canvas ref={canvasRef} className="electric-canvas" />
      </div>

      {/* Soft Cyan Halo Glow Around Card Edge */}
      <div className="electric-glow-ambient">
        <div className="electric-glow-sharp" />
        <div className="electric-glow-blur" />
        <div className="electric-glow-deep" />
      </div>

      {/* Card Content */}
      <div className="electric-content">{children}</div>
    </div>
  );
}

const ElectricBorder = memo(ElectricBorderComponent);
export default ElectricBorder;
