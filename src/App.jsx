import React, { useState } from 'react';
import Galaxy from './components/Galaxy';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {/* Loading Screen: Big Hackfest3.0 with Dark Green Gradient Glowing Border */}
      {isLoading && (
        <LoadingScreen onFinish={() => setIsLoading(false)} />
      )}

      {/* Background Image: img.jpg */}
      <div className="bg-image-container">
        <div className="bg-image" />
        <div className="bg-image-overlay" />
      </div>

      {/* High-Performance ReactBits Galaxy Background */}
      <div className="galaxy-bg">
        <Galaxy
          starSpeed={0.35}
          density={1.0}
          hueShift={140}
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

      {/* Main page is kept completely empty after loading page completes */}
    </>
  );
}
