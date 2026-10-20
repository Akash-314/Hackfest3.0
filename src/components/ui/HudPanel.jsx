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
          background: 'linear-gradient(90deg, transparent, rgba(57, 255, 136, 0.35), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* Header Tag Bar */}
      {tag && (
        <div
          className="hud-panel-header"
          style={{
            position: 'relative',
            zIndex: 2,
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle, #1C382A)',
            background: 'rgba(11, 23, 17, 0.75)',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#39FF88',
                boxShadow: '0 0 6px rgba(57, 255, 136, 0.45)',
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
                color: 'var(--color-holo-cyan, #8DDBB0)',
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              {tag}
            </span>
          </div>
        </div>
      )}

      {/* Panel Content Body */}
      <div style={{ padding: '1.4rem' }}>
        {children}
      </div>
    </div>
  );
}
