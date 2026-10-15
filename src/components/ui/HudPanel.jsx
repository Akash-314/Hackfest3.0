import React, { useRef, useState } from 'react';

export default function HudPanel({
  children,
  className = '',
  style = {},
  variant = 'teal', // 'teal', 'cyan', 'gold', 'red', 'dark', 'violet'
  tag = '',
  scan = false,
  tilt = false,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`glass-card-panel ${className}`}
      style={{
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.042)',
        backdropFilter: 'blur(18px) saturate(125%)',
        WebkitBackdropFilter: 'blur(18px) saturate(125%)',
        border: '1px solid rgba(255, 255, 255, 0.065)',
        borderRadius: '12px',
        boxShadow: '0 14px 34px -10px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        ...style,
      }}
    >
      {/* Subtle top reflection line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '12%',
          right: '12%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(99, 230, 209, 0.35), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* Header Tag Bar */}
      {tag && (
        <div
          style={{
            padding: '0.65rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            background: 'rgba(255, 255, 255, 0.015)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              color: 'var(--color-text-secondary)',
              fontWeight: 600,
            }}
          >
            {tag}
          </span>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#63E6D1',
              boxShadow: '0 0 8px rgba(99, 230, 209, 0.6)',
            }}
          />
        </div>
      )}

      {/* Panel Content Body */}
      <div style={{ padding: '1.4rem' }}>
        {children}
      </div>
    </div>
  );
}
