import React from 'react';

export default function ComicHalftoneOverlay() {
  return (
    <div
      className="comic-halftone-global-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* Subtle Comic Halftone Dot Matrix */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(230, 36, 41, 0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.6,
        }}
      />

      {/* Cinematic Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, transparent 60%, rgba(5, 7, 13, 0.85) 100%)',
        }}
      />
    </div>
  );
}
