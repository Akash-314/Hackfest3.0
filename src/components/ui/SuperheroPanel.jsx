import React from 'react';

export default function SuperheroPanel({
  children,
  variant = 'teal', // 'teal', 'cyan', 'gold', 'red', 'dark', 'violet', 'silver'
  tag = '',
  issueNumber = '',
  className = '',
  style = {},
  tilt = false,
  backgroundArt = null,
}) {
  // Premium restrained accent palette
  const accentColors = {
    teal: '#39FF88',
    cyan: '#39FF88',
    blue: '#16845B',
    violet: '#9B8AFB',
    gold: '#F5C451',
    red: '#EF4444',
    green: '#39FF88',
    silver: '#C7CED8',
    dark: 'rgba(255, 255, 255, 0.45)',
  };

  const accent = accentColors[variant] || accentColors.teal;

  return (
    <div
      className={`glass-panel-card superhero-panel-card ${className}`}
      style={{
        position: 'relative',
        background: 'rgba(11, 23, 17, 0.90)',
        backdropFilter: 'blur(18px) saturate(125%)',
        WebkitBackdropFilter: 'blur(18px) saturate(125%)',
        border: '1px solid var(--border-subtle, #1C382A)',
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
          zIndex: 2,
        }}
      />

      {/* Header Tag Bar */}
      {(tag || issueNumber) && (
        <div
          className="superhero-panel-header"
          style={{
            position: 'relative',
            zIndex: 2,
            padding: '0.75rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
            borderBottom: '1px solid var(--border-subtle, #1C382A)',
            background: 'rgba(11, 23, 17, 0.75)',
            boxSizing: 'border-box',
          }}
        >
          {tag && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: variant === 'gold' ? '#F5C451' : '#39FF88',
                  boxShadow: variant === 'gold' ? '0 0 6px rgba(245, 196, 81, 0.45)' : '0 0 6px rgba(57, 255, 136, 0.45)',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(0.8125rem, 1.1vw, 0.875rem)',
                  letterSpacing: '0.11em',
                  textTransform: 'uppercase',
                  color: variant === 'gold' ? 'var(--color-stark-gold, #F5C451)' : 'var(--color-holo-cyan, #8DDBB0)',
                  fontWeight: 600,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {tag}
              </span>
            </div>
          )}
          {issueNumber && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: accent,
                background: `${accent}14`,
                border: `1px solid ${accent}30`,
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                flexShrink: 0,
                marginLeft: 'auto',
              }}
            >
              {issueNumber}
            </span>
          )}
        </div>
      )}

      {/* Superhero-Themed Ambient Background Artwork */}
      {backgroundArt && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0,
          }}
          aria-hidden="true"
        >
          {backgroundArt}
          {/* Gentle dark gradient overlay for text contrast */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(12, 16, 23, 0.92) 25%, rgba(12, 16, 23, 0.72) 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>
      )}

      {/* Panel Content Body */}
      <div style={{ position: 'relative', zIndex: 1, padding: '1.35rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}
