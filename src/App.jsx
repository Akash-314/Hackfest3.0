import React, { useRef } from 'react';
import Galaxy from './components/Galaxy';
import ElectricBorder from './components/ElectricBorder';
import './App.css';

export default function App() {
  const cardRef = useRef(null);

  // Direct GPU transform manipulation: 0 React re-renders on mousemove
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const normX = (e.clientX - centerX) / (centerX || 1);
    const normY = (e.clientY - centerY) / (centerY || 1);

    const tiltX = -normY * 4.5;
    const tiltY = normX * 4.5;

    cardRef.current.style.transform = `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
  };

  return (
    <>
      {/* High-Performance ReactBits Galaxy Background */}
      <div className="galaxy-bg">
        <Galaxy
          starSpeed={0.35}
          density={1.0}
          hueShift={160}
          glowIntensity={0.35}
          saturation={0.5}
          speed={0.8}
          mouseRepulsion={true}
          repulsionStrength={1.8}
          twinkleIntensity={0.35}
          rotationSpeed={0.03}
          transparent={true}
        />
      </div>

      {/* Atmospheric glowing orbs */}
      <div className="glow-orb orb-1" />
      <div className="glow-orb orb-2" />
      <div className="glow-orb orb-3" />
      <div className="cyber-grid" />
      <div className="scanlines" />

      {/* Main page container */}
      <main
        className="page-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="card-glow-wrapper">
          <div ref={cardRef} className="card-tilt-container">
            <ElectricBorder
              color="#00f0ff"
              speed={1.4}
              chaos={0.15}
              borderRadius={28}
            >
              <div className="electric-card">
                {/* Main Brand Title: Only 'H' is capital in Hackfest3.0 for Avengers logo */}
                <div className="brand-title">
                  <span className="brand-h">H</span>
                  <span className="brand-ackfest">ackfest</span>
                  <span className="brand-version">3.0</span>
                </div>

                {/* Cyber Laser Divider */}
                <div className="cyber-divider">
                  <div className="divider-line" />
                  <div className="divider-diamond" />
                  <div className="divider-line" />
                </div>

                {/* Primary Message: website under construction */}
                <h2 className="construction-message">Coming Soon...</h2>

                {/* High-tech Animated Construction Progress Bar */}
                <div className="progress-module">
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" />
                    <div className="progress-laser" />
                  </div>
                </div>
              </div>
            </ElectricBorder>
          </div>
        </div>
      </main>
    </>
  );
}
