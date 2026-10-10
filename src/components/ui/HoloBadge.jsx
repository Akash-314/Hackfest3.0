import React from 'react';

export default function HoloBadge({
  children,
  variant = 'cyan', // 'cyan', 'red', 'gold', 'steel'
  icon: Icon,
  className = '',
  style = {},
}) {
  return (
    <span className={`holo-badge holo-badge-${variant} ${className}`} style={style}>
      <span className="holo-badge-pulse" />
      {Icon && <Icon size={13} className="holo-badge-icon" />}
      <span className="holo-badge-text">{children}</span>
    </span>
  );
}
