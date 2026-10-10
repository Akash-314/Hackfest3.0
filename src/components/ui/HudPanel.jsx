import React, { useRef, useState } from 'react';

export default function HudPanel({
  children,
  className = '',
  style = {},
  variant = 'cyan', // 'cyan', 'red', 'gold', 'steel'
  tag = '',
  scan = true,
  tilt = true,
  onClick,
}) {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});

  const handleMouseMove = (e) => {
    if (!tilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    setTiltStyle({
      transform: `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`,
    });
  };

  const handleMouseLeave = () => {
    if (!tilt) return;
    setTiltStyle({
      transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)',
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`hud-panel-frame hud-variant-${variant} ${scan ? 'hud-scan-active' : ''} ${className}`}
      style={{
        ...tiltStyle,
        ...style,
      }}
    >
      {/* Corner Brackets [+] */}
      <span className="hud-corner hud-corner-tl" />
      <span className="hud-corner hud-corner-tr" />
      <span className="hud-corner hud-corner-bl" />
      <span className="hud-corner hud-corner-br" />

      {/* Scanning beam animation */}
      {scan && <div className="hud-scanner-beam" />}

      {/* Top telemetry tag */}
      {tag && (
        <div className="hud-telemetry-strip">
          <span className="hud-tag-dot" />
          <span className="hud-tag-text">{tag}</span>
        </div>
      )}

      {/* Inner panel content */}
      <div className="hud-panel-inner">{children}</div>
    </div>
  );
}
