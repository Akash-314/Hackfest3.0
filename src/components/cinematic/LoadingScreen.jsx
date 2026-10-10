import React, { useState, useEffect } from 'react';
import { Shield, Zap, Sparkles, ArrowRight } from 'lucide-react';

export default function LoadingScreen({ progress = 100, isLoaded = false, onComplete }) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [stageText, setStageText] = useState('CONNECTING QUANTUM SATELLITE...');

  useEffect(() => {
    const target = Math.min(progress, 100);
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev >= target) {
          clearInterval(interval);
          return target;
        }
        const next = Math.min(prev + Math.max(1, Math.floor((target - prev) * 0.2)), target);
        if (next < 25) setStageText('CONNECTING QUANTUM SATELLITE...');
        else if (next < 55) setStageText('SYNCHRONIZING HERO ARMOR MK-III...');
        else if (next < 85) setStageText('CALIBRATING MULTIVERSE FREQUENCY...');
        else setStageText('STARK QUANTUM CORES: ONLINE');
        return next;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [progress]);

  const handleLaunch = () => {
    if (onComplete) onComplete();
  };

  return (
    <div
      className={`cinematic-loading-overlay ${isLoaded && displayProgress >= 100 ? 'loaded' : ''}`}
      aria-live="polite"
      role="status"
    >
      <div className="loading-hud-card">
        {/* Stark Reactor Crest Badge */}
        <div className="loading-brand-strip">
          <div className="loading-reactor-pulse" aria-hidden="true">
            <svg viewBox="0 0 44 44" width="46" height="46">
              <polygon
                points="22,2 40,12 40,32 22,42 4,32 4,12"
                fill="#0A0F1D"
                stroke="#00BFFF"
                strokeWidth="1.8"
                strokeDasharray="4 2"
              />
              <polygon
                points="22,10 33,29 11,29"
                fill="rgba(230, 36, 41, 0.3)"
                stroke="#E62429"
                strokeWidth="1.8"
              />
              <circle cx="22" cy="22" r="5" fill="#00BFFF" />
              <circle cx="22" cy="22" r="8" fill="none" stroke="#F5B642" strokeWidth="1.2" />
            </svg>
          </div>
          <div className="loading-titles">
            <span className="loading-series-tag">
              <Shield size={12} color="#00bfff" />
              MULTIVERSE PROTOCOL // ISSUE #03
            </span>
            <h2 className="loading-main-title">
              SYSTEM INITIALIZING <span style={{ color: '#00bfff' }}>CORE</span>
            </h2>
          </div>
        </div>

        {/* Dynamic Telemetry Stage */}
        <div className="loading-stage-label">
          <Sparkles size={14} color="#f5b642" className="sparkle-spin" />
          <span>{stageText}</span>
        </div>

        {/* High-Tech Progress Bar */}
        <div className="loading-progress-track">
          <div
            className="loading-progress-fill"
            style={{ width: `${displayProgress}%` }}
          />
          <div
            className="loading-progress-glow"
            style={{ left: `${displayProgress}%` }}
          />
        </div>

        {/* Metrics Footer */}
        <div className="loading-metrics-row">
          <span className="loading-metric-code">SEC: 28.404°N 80.324°E</span>
          <span className="loading-percent">{Math.round(displayProgress)}%</span>
        </div>

        {/* Enter Mission Button (Appears once loaded) */}
        {isLoaded && (
          <button
            type="button"
            className="btn-enter-mission"
            onClick={handleLaunch}
            autoFocus
          >
            <Zap size={16} />
            <span>LAUNCH MISSION SEQUENCE</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
