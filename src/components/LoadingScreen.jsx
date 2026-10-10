import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';

export default function LoadingScreen({ onFinish }) {
  const [glowActive, setGlowActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Phase 1 -> Phase 2: After appearance, activate the dark green gradient glowing border
    const glowTimer = setTimeout(() => {
      setGlowActive(true);
    }, 600);

    // Progress counter animation from 0% to 100%
    const startTime = Date.now();
    const duration = 2400; // 2.4 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        // Start exit transition
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            if (onFinish) onFinish();
          }, 600); // Wait for fade-out animation
        }, 400);
      }
    }, 30);

    return () => {
      clearTimeout(glowTimer);
      clearInterval(interval);
    };
  }, [onFinish]);

  // Click to skip loading
  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 400);
  };

  return (
    <div
      className={`loading-overlay ${isExiting ? 'loading-exit' : ''}`}
      onClick={handleSkip}
    >
      {/* Background with subtle Doctor Doom texture and dark green vignette */}
      <div className="loading-bg-backdrop" />
      <div className="loading-grid" />
      <div className="loading-scanlines" />

      {/* Very big size Hackfest3.0 with dark green gradient glowing border */}
      <div className={`loading-content ${glowActive ? 'border-glowing' : ''}`}>
        
        {/* Animated glowing border frame */}
        <div className="loading-border-frame">
          <div className="loading-border-inner">
            
            {/* Hackfest3.0 in very big size: only 'H' in capital */}
            <div className="loader-brand-title">
              <span className="loader-brand-h">H</span>
              <span className="loader-brand-ackfest">ackfest</span>
              <span className="loader-brand-version">3.0</span>
            </div>

            {/* Glowing laser line below */}
            <div className="loader-divider">
              <div className="loader-divider-line" />
              <div className="loader-divider-gem" />
              <div className="loader-divider-line" />
            </div>

            {/* Loading progress & status */}
            <div className="loader-status-row">
              <span className="loader-status-label">INITIALIZING SYSTEM</span>
              <span className="loader-status-val">{progress}%</span>
            </div>

            {/* Dark green gradient progress track */}
            <div className="loader-progress-track">
              <div
                className="loader-progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>

          </div>
        </div>

        <div className="loader-skip-hint">click anywhere to skip</div>
      </div>
    </div>
  );
}
