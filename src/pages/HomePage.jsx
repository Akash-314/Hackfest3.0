import React, { useRef } from 'react';
import doomImg from '../assets/doom.png';
import ironImg from '../assets/iron.png';

export default function HomePage() {
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    containerRef.current.style.setProperty('--cursor-x', `${x}px`);
    containerRef.current.style.setProperty('--cursor-y', `${y}px`);
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    containerRef.current.style.setProperty('--cursor-x', '-9999px');
    containerRef.current.style.setProperty('--cursor-y', '-9999px');
  };

  const handleTouchMove = (e) => {
    if (!containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    containerRef.current.style.setProperty('--cursor-x', `${x}px`);
    containerRef.current.style.setProperty('--cursor-y', `${y}px`);
  };

  return (
    <main
      ref={containerRef}
      className="homepage-pure-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseLeave}
    >
      {/* 1. Background Layer: Iron Man */}
      <div className="homepage-iron-layer">
        <img
          src={ironImg}
          alt="Iron Man - Hackfest"
          className="homepage-iron-image"
        />
        <div className="homepage-iron-overlay" />
      </div>

      {/* 2. Foreground Layer: Doctor Doom with Mask that disappears around cursor */}
      <div className="homepage-doom-layer">
        <img
          src={doomImg}
          alt="Doctor Doom - Hackfest"
          className="homepage-doom-image"
        />
        <div className="homepage-doom-overlay" />
      </div>

      {/* 3. Hackfest 3.0: Hackfest in Neo font (stroke, no glow) + 3.0 in Monday font */}
      <div className="homepage-pure-content">
        <h1 className="homepage-pure-title">
          <span className="title-word-hackfest">Hackfest</span>
          <span className="title-number-version"> 3.0</span>
        </h1>
      </div>
    </main>
  );
}
