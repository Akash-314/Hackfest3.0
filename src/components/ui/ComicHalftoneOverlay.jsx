import React from 'react';

export default function ComicHalftoneOverlay() {
  return (
    <div
      className="atmospheric-global-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* Subtle Micro Dot Matrix Texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.5,
        }}
      />

      {/* Atmospheric Tech Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 40%, transparent 45%, rgba(8, 9, 13, 0.82) 100%)',
        }}
      />
    </div>
  );
}
