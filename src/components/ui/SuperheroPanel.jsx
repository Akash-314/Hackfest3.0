import React from 'react';

export default function SuperheroPanel({
  children,
  variant = 'red', // 'red', 'gold', 'green', 'blue', 'dark'
  tag = '',
  issueNumber = '',
  className = '',
  style = {},
  tilt = true,
}) {
  const variantStyles = {
    red: {
      border: '2px solid #e62429',
      boxShadow: '6px 6px 0px rgba(230, 36, 41, 0.4), 0 0 25px rgba(230, 36, 41, 0.15)',
      headerBg: '#e62429',
      headerText: '#ffffff',
      tagColor: '#ffd7d9',
      accentGlow: 'rgba(230, 36, 41, 0.2)',
    },
    gold: {
      border: '2px solid #f5b642',
      boxShadow: '6px 6px 0px rgba(245, 182, 66, 0.4), 0 0 25px rgba(245, 182, 66, 0.15)',
      headerBg: '#f5b642',
      headerText: '#0d111a',
      tagColor: '#4a3200',
      accentGlow: 'rgba(245, 182, 66, 0.2)',
    },
    green: {
      border: '2px solid #00ff77',
      boxShadow: '6px 6px 0px rgba(0, 255, 119, 0.35), 0 0 25px rgba(0, 255, 119, 0.15)',
      headerBg: '#0f4224',
      headerText: '#00ff77',
      tagColor: '#77ffaa',
      accentGlow: 'rgba(0, 255, 119, 0.2)',
    },
    blue: {
      border: '2px solid #00bfff',
      boxShadow: '6px 6px 0px rgba(0, 191, 255, 0.4), 0 0 25px rgba(0, 191, 255, 0.15)',
      headerBg: '#00bfff',
      headerText: '#05070d',
      tagColor: '#002844',
      accentGlow: 'rgba(0, 191, 255, 0.2)',
    },
    dark: {
      border: '2px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '6px 6px 0px rgba(0, 0, 0, 0.8)',
      headerBg: 'rgba(255, 255, 255, 0.08)',
      headerText: '#f5f7fa',
      tagColor: '#94a3b8',
      accentGlow: 'transparent',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.red;

  return (
    <div
      className={`comic-action-panel ${className}`}
      style={{
        position: 'relative',
        background: 'linear-gradient(145deg, rgba(13, 17, 26, 0.95) 0%, rgba(8, 11, 18, 0.98) 100%)',
        border: currentVariant.border,
        boxShadow: currentVariant.boxShadow,
        borderRadius: '6px',
        overflow: 'hidden',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease',
        ...style,
      }}
    >
      {/* Comic Header Stripe */}
      {(tag || issueNumber) && (
        <div
          style={{
            background: currentVariant.headerBg,
            color: currentVariant.headerText,
            padding: '0.45rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.8rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 800,
          }}
        >
          <span>{tag}</span>
          {issueNumber && (
            <span
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '0.15rem 0.5rem',
                borderRadius: '3px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
              }}
            >
              {issueNumber}
            </span>
          )}
        </div>
      )}

      {/* Comic Halftone Micro Texture inside Card */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
          backgroundSize: '8px 8px',
          pointerEvents: 'none',
        }}
      />

      {/* Panel Content Body */}
      <div style={{ padding: '1.4rem' }}>
        {children}
      </div>
    </div>
  );
}
