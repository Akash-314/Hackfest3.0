import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import doomImg from '../assets/doom.png';
import ironImg from '../assets/iron.png';

// All Previous Sections (Scrollable below interactive hero)
import AnnouncementTicker from '../components/AnnouncementTicker';
import AboutSection from '../components/AboutSection';
import HighlightsSection from '../components/HighlightsSection';
import CompetitionsSection from '../components/CompetitionsSection';
import ProblemStatementsSection from '../components/ProblemStatementsSection';
import ScheduleSection from '../components/ScheduleSection';
import HowItWorksSection from '../components/HowItWorksSection';
import MentorsJudgesSection from '../components/MentorsJudgesSection';
import PrizesSection from '../components/PrizesSection';
import RulesFaqSection from '../components/RulesFaqSection';
import SponsorsSection from '../components/SponsorsSection';
import RegisterSection from '../components/RegisterSection';

export default function HomePage() {
  const containerRef = useRef(null);
  const location = useLocation();

  // Smooth scroll handler for anchor links (#about, #competitions, etc.)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  // Interactive Cursor Mask Handler (Doom reveals Iron underneath)
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
    <main>
      {/* 01. FULL-SCREEN INTERACTIVE HERO: DOOM × IRON MAN REVEAL + HACKFEST 3.0 */}
      <section
        id="hero"
        ref={containerRef}
        className="homepage-hero-interactive"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseLeave}
      >
        {/* Background Layer: Iron Man */}
        <div className="homepage-iron-layer">
          <img
            src={ironImg}
            alt="Iron Man - Hackfest"
            className="homepage-iron-image"
          />
          <div className="homepage-iron-overlay" />
        </div>

        {/* Foreground Layer: Doctor Doom with Mask that disappears around cursor */}
        <div className="homepage-doom-layer">
          <img
            src={doomImg}
            alt="Doctor Doom - Hackfest"
            className="homepage-doom-image"
          />
          <div className="homepage-doom-overlay" />
        </div>

        {/* Centered Hero Title: Hackfest 3.0 in Stroke Font */}
        <div className="homepage-pure-content">
          <h1 className="homepage-pure-title">
            <span className="title-word-hackfest">Hackfest</span>
            <span className="title-number-version"> 3.0</span>
          </h1>
        </div>
      </section>

      {/* 02. ANNOUNCEMENTS TICKER */}
      <div id="announcements">
        <AnnouncementTicker />
      </div>

      {/* 03. ABOUT EVENT */}
      <AboutSection />

      {/* 04. EVENT HIGHLIGHTS */}
      <HighlightsSection />

      {/* 05. COMPETITIONS (CODEATHON, IDEATHON, HACKATHON) */}
      <CompetitionsSection />

      {/* 06. PROBLEM STATEMENTS / TRACKS */}
      <ProblemStatementsSection />

      {/* 07. SCHEDULE */}
      <ScheduleSection />

      {/* 08. HOW IT WORKS */}
      <HowItWorksSection />

      {/* 09. MENTORS & JUDGES */}
      <MentorsJudgesSection />

      {/* 10. PRIZES */}
      <PrizesSection />

      {/* 11. RULES & FAQ */}
      <RulesFaqSection />

      {/* 12. SPONSORS */}
      <SponsorsSection />

      {/* 13. REGISTER */}
      <RegisterSection />
    </main>
  );
}
