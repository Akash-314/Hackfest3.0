import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Clock, MapPin, Trophy, Users, CheckCircle, ChevronRight, Sparkles, ShieldCheck } from 'lucide-react';
import doomImg from '../assets/doom.png';
import ironImg from '../assets/iron.png';

// All Sections for the Complete One-Page Website
import WinnersSection from '../components/WinnersSection';
import ResultsAndNoticesSection from '../components/ResultsAndNoticesSection';
import DayOneOverviewSection from '../components/DayOneOverviewSection';
import HackathonDayTwoSection from '../components/HackathonDayTwoSection';
import CompetitionsHub from '../components/CompetitionsHub';
import ScheduleSection from '../components/ScheduleSection';
import MentorsJudgesSection from '../components/MentorsJudgesSection';
import PrizesSection from '../components/PrizesSection';
import SponsorsSection from '../components/SponsorsSection';
import SdcMembersSection from '../components/SdcMembersSection';
import AboutSection from '../components/AboutSection';

export default function HomePage() {
  const containerRef = useRef(null);
  const location = useLocation();

  // Smooth scroll handler for anchor links (#winners, #highlights, #competitions, etc.)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          const navOffset = 70;
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: elementPosition - navOffset,
            behavior: 'smooth',
          });
        }, 120);
      }
    }
  }, [location.hash]);

  const scrollToWinners = (e) => {
    if (e) e.preventDefault();
    const el = document.getElementById('winners');
    if (el) {
      const navOffset = 70;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: Math.max(0, elementPosition - navOffset),
        behavior: 'smooth',
      });
      window.history.pushState(null, '', '#winners');
    } else {
      window.location.hash = '#winners';
    }
  };

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
      {/* 01. FULL-SCREEN INTERACTIVE HERO: DOOM & IRON MAN REVEAL + ALL COMPETITIONS CONCLUDED */}
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

        {/* Centered Hero Content: HackFest 3.0 + EVENT COMPLETED & WINNERS ANNOUNCED */}
        <div className="homepage-pure-content">
          <h1 className="homepage-pure-title">
            <span className="title-word-hackfest">Hackfest</span>
            <span className="title-number-version"> 3.0</span>
          </h1>

          {/* EVENT COMPLETION & WINNERS BANNER */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: '1.25rem',
              gap: '1rem',
            }}
          >
            {/* ALL COMPETITIONS COMPLETED BADGE */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.55rem 1.4rem',
                borderRadius: '9999px',
                background: 'rgba(57, 255, 136, 0.12)',
                border: '1px solid #39FF88',
                boxShadow: '0 0 25px rgba(57, 255, 136, 0.25)',
              }}
            >
              <CheckCircle size={16} color="#39FF88" />
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: '#39FF88',
                }}
              >
                EVENT COMPLETED • WINNERS ANNOUNCED
              </span>
            </div>

            {/* Event Post-Challenge Tagline */}
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontFamily: 'var(--font-heading, monospace)',
                fontSize: '1.15rem',
                letterSpacing: '0.04em',
                margin: '0.25rem 0 0.5rem 0',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
                textAlign: 'center',
              }}
            >
              The challenges have concluded. The champions have risen.
            </p>

            {/* ACTION BUTTONS: VIEW WINNERS & EXPLORE HIGHLIGHTS */}
            <div
              style={{
                display: 'flex',
                gap: '0.85rem',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: '0.4rem',
                pointerEvents: 'auto',
                position: 'relative',
                zIndex: 25,
              }}
            >
              <a
                href="#winners"
                onClick={scrollToWinners}
                className="btn btn-primary"
                id="hero-explore-winners-cta"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.85rem 2rem',
                  fontSize: '0.92rem',
                  fontFamily: 'var(--font-heading, monospace)',
                  letterSpacing: '0.08em',
                  borderRadius: '8px',
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 26,
                }}
              >
                <Trophy size={18} />
                <span>VIEW OFFICIAL WINNERS</span>
              </a>

              <a
                href="https://drive.google.com/drive/folders/1s-6y-Ci_WsAHvzldH8gJpiyfMhs5GTmC"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                id="hero-explore-highlights-cta"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.85rem 1.8rem',
                  fontSize: '0.92rem',
                  fontFamily: 'var(--font-heading, monospace)',
                  letterSpacing: '0.08em',
                  borderRadius: '8px',
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 26,
                }}
              >
                <span>ARENA HIGHLIGHTS</span>
                <ChevronRight size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* EVENT META INFO BAR (DOOM KE NEECHE) */}
        <div className="doom-event-meta-wrapper">
          <div className="doom-event-meta-bar">
            {/* 01. DATE */}
            <div className="doom-meta-item">
              <Calendar className="doom-meta-icon" size={21} />
              <div className="doom-meta-info">
                <span className="doom-meta-label">DATE</span>
                <span className="doom-meta-value">1-2 Nov 2026</span>
              </div>
            </div>

            <div className="doom-meta-divider" />

            {/* 02. VENUE */}
            <div className="doom-meta-item">
              <Clock className="doom-meta-icon" size={21} />
              <div className="doom-meta-info">
                <span className="doom-meta-label">VENUE</span>
                <span className="doom-meta-value">REC Banda</span>
              </div>
            </div>

            <div className="doom-meta-divider" />

            {/* 03. MODE */}
            <div className="doom-meta-item">
              <MapPin className="doom-meta-icon" size={21} />
              <div className="doom-meta-info">
                <span className="doom-meta-label">MODE</span>
                <span className="doom-meta-value">On-Campus</span>
              </div>
            </div>

            <div className="doom-meta-divider" />

            {/* 04. PRIZES */}
            <div className="doom-meta-item">
              <Trophy className="doom-meta-icon" size={21} />
              <div className="doom-meta-info">
                <span className="doom-meta-label">PRIZES</span>
                <span className="doom-meta-value">Exciting Rewards</span>
              </div>
            </div>

            <div className="doom-meta-divider" />

            {/* 05. ORGANIZED BY */}
            <div className="doom-meta-item">
              <Users className="doom-meta-icon" size={21} />
              <div className="doom-meta-info">
                <span className="doom-meta-label">ORGANIZED BY</span>
                <span className="doom-meta-value">REC Banda Incubation Centre</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02. DEDICATED WINNERS & RESULTS SECTION (HACKFEST 3.0 — WINNERS & RESULTS) */}
      <WinnersSection />

      {/* 03. ANNOUNCEMENTS & RESULTS (LEADERBOARD / VERIFIED OUTCOMES) */}
      <ResultsAndNoticesSection />

      {/* 05. COMPETITION RECAP & TIMELINE */}
      <DayOneOverviewSection />

      {/* 06. FLAGSHIP HACKATHON RECAP */}
      <HackathonDayTwoSection />

      {/* 08. ABOUT EVENT & SCALE */}
      <AboutSection />

      {/* 09. COMPETITIONS, PROBLEMS, HOW IT WORKS & RULES/FAQS (COMMAND CENTER HUB) */}
      <CompetitionsHub />

      {/* 10. SCHEDULE */}
      <ScheduleSection />

      {/* 11. MENTORS & JUDGES */}
      <MentorsJudgesSection />

      {/* 12. PRIZES */}
      <PrizesSection />

      {/* 13. SPONSORS */}
      <SponsorsSection />

      {/* 14. SDC TEAM & ORGANIZERS */}
      <SdcMembersSection />
    </main>
  );
}
