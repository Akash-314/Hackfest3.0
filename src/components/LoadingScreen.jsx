import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';

export default function LoadingScreen({ onFinish }) {
  const [borderActive, setBorderActive] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Phase 1 -> Phase 2: Border activates with dark green gradient color
    const timer = setTimeout(() => {
      setBorderActive(true);
    }, 600);

    // Phase 3: Transition out after loading finishes
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 600);
    }, 2800);

    return () => {
      clearTimeout(timer);
      clearTimeout(exitTimer);
    };
  }, [onFinish]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 300);
  };

  return (
    <div
      className={`loading-overlay ${isExiting ? 'loading-exit' : ''}`}
      onClick={handleSkip}
    >
      {/* Background Image: img.jpg */}
      <div className="loading-bg" />

      {/* Very big size Hackfest3.0 directly on the background (no container, no glow) */}
      <div className={`loader-title-wrapper ${borderActive ? 'border-active' : ''}`}>
        <span className="loader-brand-h">H</span>
        <span className="loader-brand-ackfest">ackfest</span>
        <span className="loader-brand-version">3.0</span>
      </div>
    </div>
  );
}
