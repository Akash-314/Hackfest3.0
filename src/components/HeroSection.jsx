import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Compass, Zap, Shield, Sparkles } from 'lucide-react';
import { eventMeta } from '../data/eventData';
import { eventService } from '../services/eventService';
import HoloBadge from './ui/HoloBadge';
import doomImg from '../assets/doom.png';

export default function HeroSection() {
  const [meta, setMeta] = useState(eventMeta);

  useEffect(() => {
    let isMounted = true;
    eventService.getSettings().then((res) => {
      if (isMounted && res) setMeta(res);
    });
    return () => { isMounted = false; };
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="hero-section marvel-cinematic-hero-section">
      {/* Background Comic Sky & City Grid */}
      <div className="hero-bg-container marvel-hero-bg">
        <div className="hero-doom-ambient-backdrop" />
        <div className="marvel-city-vignette" />
        <div className="marvel-sky-nebula" />
      </div>

      <div className="container marvel-hero-container">
        {/* Top Hero Split Grid: Left Text + Right Visual Card */}
        <div className="marvel-hero-grid">
          {/* Left Column: Comic Narrative & Call to Action */}
          <div className="marvel-hero-narrative-col phase-3">
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
              <h1 className="heading-display marvel-main-title marvel-neo-heading">
                <span className="marvel-title-word">Hackfest </span>
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
                className="btn btn-reactor"
                onClick={() => scrollTo('problems')}
                id="hero-tracks-btn"
                style={{ borderColor: 'rgba(0, 191, 255, 0.4)' }}
              >
                <Shield size={18} />
                <span>TRACKS</span>
              </button>
            </div>
          </div>

          {/* Right Column: Doctor Doom Showcase with Hackfest 3.0 Overlaid in Neo Font */}
          <div className="marvel-hero-3d-col">
            <div className="marvel-cinematic-viewport marvel-poster-card doom-hero-viewport">
              <img
                src={doomImg}
                alt="Doctor Doom - Hackfest 3.0"
                className="marvel-poster-bg doom-showcase-photo"
              />
              <div className="marvel-poster-overlay doom-showcase-overlay" />

              {/* Status Banner */}
              <div className="marvel-viewport-tag">
                <span className="marvel-tag-pulse" />
                <span>MULTIVERSE PROTOCOL // DOCTOR DOOM</span>
              </div>

              {/* Center Content Overlaid Directly Over Doom Photo */}
              <div className="marvel-poster-content doom-poster-content">
                <div className="marvel-poster-badge">REC BANDA PRESENTS</div>
                <h2 className="doom-overlay-hero-title">
                  Hackfest 3.0
                </h2>
                <p className="marvel-poster-subtitle">
                  THE ULTIMATE CODE & INNOVATION BATTLEGROUND
                </p>

                <div className="marvel-poster-stats-grid">
                  <div className="marvel-stat-pill">
                    <span className="stat-pill-val">₹1,00,000+</span>
                    <span className="stat-pill-lbl">PRIZE POOL</span>
                  </div>
                  <div className="marvel-stat-pill">
                    <span className="stat-pill-val">48 HRS</span>
                    <span className="stat-pill-lbl">NON-STOP</span>
                  </div>
                  <div className="marvel-stat-pill">
                    <span className="stat-pill-val">500+</span>
                    <span className="stat-pill-lbl">BUILDERS</span>
                  </div>
                </div>

                <div className="marvel-tracks-preview">
                  <span className="track-tag">WEB3 & AI</span>
                  <span className="track-tag">CLOUD SEC</span>
                  <span className="track-tag">IOT & ROBOTICS</span>
                </div>
              </div>

              {/* Interaction Hint */}
              <div className="marvel-viewport-footer">
                <span className="marvel-hint-pill">
                  <Sparkles size={13} color="#f5b642" />
                  SDC REC BANDA // INNOVATION ARENA
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
