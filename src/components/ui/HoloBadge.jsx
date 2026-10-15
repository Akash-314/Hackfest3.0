import React from 'react';

export default function HoloBadge({
  children,
  variant = 'teal', // 'teal', 'cyan', 'gold', 'red', 'silver', 'violet'
  icon: Icon,
  className = '',
  style = {},
}) {
  return (
    <span className={`premium-badge badge-${variant} ${className}`} style={style}>
      <span className="premium-badge-dot" />
      {Icon && <Icon size={12} className="premium-badge-icon" />}
      <span className="premium-badge-text">{children}</span>
    </span>
  );
}
