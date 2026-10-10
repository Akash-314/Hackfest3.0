import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Compass, Zap, RotateCcw, Shield, Sparkles } from 'lucide-react';
import { eventMeta } from '../data/eventData';
import { eventService } from '../services/eventService';
import MarvelCinematicHero3D from './3d/MarvelCinematicHero3D';
import HoloBadge from './ui/HoloBadge';

export default function HeroSection() {
  const [introPhase, setIntroPhase] = useState(0); // 0: Portal ignite, 1: Hero strike, 2: Title reveal, 3: Full controls ready
  const [replayKey, setReplayKey] = useState(0);
  const [meta, setMeta] = useState(eventMeta);

  useEffect(() => {
    let isMounted = true;
    eventService.getSettings().then((res) => {
      if (isMounted && res) setMeta(res);
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    // Cinematic opening sequence timeline
    const t1 = setTimeout(() => setIntroPhase(1), 800);  // 0.8s: Heroes streak across sky
    const t2 = setTimeout(() => setIntroPhase(2), 2200); // 2.2s: Title comic impact burst
    const t3 = setTimeout(() => setIntroPhase(3), 3600); // 3.6s: Complete UI interactive assembly

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [replayKey]);

  const handleReplayIntro = () => {
    setIntroPhase(0);
    setReplayKey((prev) => prev + 1);
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="hero-section marvel-cinematic-hero-section">
      {/* Background Comic Sky & City Grid */}
      <div className="hero-bg-container marvel-hero-bg">
        <div className="marvel-city-vignette" />
        <div className="marvel-sky-nebula" />
      </div>

      <div className="container marvel-hero-container">
        {/* Top Hero Split Grid: Left Text + Right 3D Visual */}
        <div className="marvel-hero-grid">
          {/* Left Column: Comic Narrative & Call to Action */}
          <div className={`marvel-hero-narrative-col phase-${introPhase}`}>
            {/* Comic Header Strip */}
            <div className="marvel-comic-badge-strip">
              <span className="marvel-logo-badge">
                HACKFEST
              </span>
              <HoloBadge variant="red" icon={Shield}>
                EDITION 3.0 // ANNUAL HACKATHON
              </HoloBadge>
              <span className="marvel-hero-inst">REC BANDA • SDC</span>
            </div>

            {/* Main Headline */}
            <div className="marvel-title-wrap">
              <h1 className="heading-display marvel-main-title">
                <span className="marvel-title-word">HACKFEST</span>
                <span className="marvel-title-number">3.0</span>
              </h1>
              <div className="marvel-impact-burst-tag">
                THE NEXT GENERATION OF BUILDERS
              </div>
            </div>

            {/* Subheading Narrative */}
            <p className="marvel-hero-desc">
              Join hundreds of student innovators, developers, and designers from across India.
              Compete in high-speed algorithms in <strong>Codeathon</strong>, present visionary ideas in the <strong>Ideathon</strong>,
              and build groundbreaking software in the <strong>Flagship 48-Hour Hackathon</strong>.
            </p>

            {/* Action Buttons */}
            <div className="marvel-hero-actions">
              <Link
                to="/register"
                className="btn btn-avenger marvel-assemble-btn"
                id="hero-register-btn"
              >
                <Zap size={20} />
                <span>REGISTER NOW</span>
                <ArrowUpRight size={20} />
              </Link>

              <button
                type="button"
                className="btn btn-reactor"
                onClick={() => scrollTo('about')}
                id="hero-explore-btn"
              >
                <Compass size={18} />
                <span>EXPLORE EVENT</span>
              </button>

              <button
                type="button"
                className="btn-replay-sequence"
                onClick={handleReplayIntro}
                title="Replay Cinematic Superhero Sequence"
                aria-label="Replay Cinematic Superhero Sequence"
              >
                <RotateCcw size={15} />
                <span>REPLAY INTRO</span>
              </button>
            </div>
          </div>

          {/* Right Column: 3D Marvel Cinematic Superhero Showcase */}
          <div className="marvel-hero-3d-col">
            <div className="marvel-cinematic-viewport">
              {/* Status Banner */}
              <div className="marvel-viewport-tag">
                <span className="marvel-tag-pulse" />
                <span>CINEMATIC SHOWCASE // INTERACTIVE 3D EXPERIENCE</span>
              </div>

              {/* Live 3D Scene */}
              <MarvelCinematicHero3D key={replayKey} />

              {/* Interaction Hint */}
              <div className="marvel-viewport-footer">
                <span className="marvel-hint-pill">
                  <Sparkles size={13} color="#f5b642" />
                  DRAG TO ROTATE 3D CAMERA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Key Stats */}
        <div className="marvel-roster-strip">
          <div className="marvel-roster-item">
            <span className="marvel-roster-lbl">VENUE</span>
            <span className="marvel-roster-val">{meta.venueShort}</span>
          </div>
          <div className="marvel-roster-item">
            <span className="marvel-roster-lbl">PARTICIPANTS</span>
            <span className="marvel-roster-val">500+ PAN-INDIA</span>
          </div>
          <div className="marvel-roster-item">
            <span className="marvel-roster-lbl">EVENT DURATION</span>
            <span className="marvel-roster-val">48 CONTINUOUS HOURS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
