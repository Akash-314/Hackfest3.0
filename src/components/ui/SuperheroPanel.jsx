import React from 'react';

export default function SuperheroPanel({
  children,
  variant = 'teal', // 'teal', 'cyan', 'gold', 'red', 'dark', 'violet', 'silver'
  tag = '',
  issueNumber = '',
  className = '',
  style = {},
  tilt = false,
}) {
  // Premium restrained accent palette
  const accentColors = {
    teal: '#63E6D1',
    cyan: '#63E6D1',
    blue: '#63E6D1',
    violet: '#9B8AFB',
    gold: '#F5C451',
    red: '#EF4444',
    green: '#10B981',
    silver: '#C7CED8',
    dark: 'rgba(255, 255, 255, 0.45)',
  };

  const accent = accentColors[variant] || accentColors.teal;

  return (
    <div
      className={`glass-panel-card ${className}`}
      style={{
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.042)',
        backdropFilter: 'blur(18px) saturate(125%)',
        WebkitBackdropFilter: 'blur(18px) saturate(125%)',
        border: '1px solid rgba(255, 255, 255, 0.065)',
        borderRadius: '12px',
        boxShadow: '0 14px 34px -10px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s ease, border-color 0.28s ease',
        ...style,
      }}
    >
      {/* Top subtle specular reflection line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '12%',
          right: '12%',
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${accent}35, transparent)`,
          pointerEvents: 'none',
        }}
      />

      {/* Header Tag Bar */}
      {(tag || issueNumber) && (
        <div
          style={{
            padding: '0.65rem 1.15rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
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
          {issueNumber && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                color: accent,
                background: `${accent}12`,
                border: `1px solid ${accent}28`,
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}
            >
              {issueNumber}
            </span>
          )}
        </div>
      )}

      {/* Panel Content Body */}
      <div style={{ padding: '1.35rem' }}>
        {children}
      </div>
    </div>
  );
}
