import React, { useRef, useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Trophy, Users, ArrowUpRight } from 'lucide-react';
import doomImg from '../assets/doom.png';
import ironImg from '../assets/iron.png';

// All Sections for the Complete One-Page Website
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
import SdcMembersSection from '../components/SdcMembersSection';
import RegisterSection from '../components/RegisterSection';

// Event start date: 1 November 2026 00:00:00 IST
const TARGET_EVENT_DATE = new Date('2026-11-01T00:00:00+05:30');

function calculateTimeLeft(targetDate = TARGET_EVENT_DATE) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) {
    return { months: '00', days: '00', hours: '00', minutes: '00', seconds: '00' };
  }

  let temp = new Date(now.getTime());
  let months = 0;
  while (true) {
    const nextMonth = new Date(temp.getTime());
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    if (nextMonth <= targetDate) {
      months++;
      temp = nextMonth;
    } else {
      break;
    }
  }

  const remMs = targetDate.getTime() - temp.getTime();
  const totalSec = Math.floor(remMs / 1000);
  const seconds = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const minutes = totalMin % 60;
  const totalHours = Math.floor(totalMin / 60);
  const hours = totalHours % 24;
  const days = Math.floor(totalHours / 24);

  return {
    months: String(months).padStart(2, '0'),
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

export default function HomePage() {
  const containerRef = useRef(null);
  const location = useLocation();
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft());

  // Live 1-second countdown tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Smooth scroll handler for anchor links (#about, #competitions, etc.)
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
      {/* 01. FULL-SCREEN INTERACTIVE HERO: DOOM & IRON MAN REVEAL + HACKFEST 3.0 */}
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

          {/* COUNTDOWN TIMER */}
          <div className="doomsday-countdown-wrap">
            <div className="doomsday-countdown-grid">
              <div className="doomsday-time-col">
                <span className="doomsday-time-val">{timeLeft.months}</span>
                <span className="doomsday-time-lbl">MONTHS</span>
              </div>

              <span className="doomsday-time-sep">:</span>

              <div className="doomsday-time-col">
                <span className="doomsday-time-val">{timeLeft.days}</span>
                <span className="doomsday-time-lbl">DAYS</span>
              </div>

              <span className="doomsday-time-sep">:</span>

              <div className="doomsday-time-col">
                <span className="doomsday-time-val">{timeLeft.hours}</span>
                <span className="doomsday-time-lbl">HOURS</span>
              </div>

              <span className="doomsday-time-sep">:</span>

              <div className="doomsday-time-col">
                <span className="doomsday-time-val">{timeLeft.minutes}</span>
                <span className="doomsday-time-lbl">MINUTES</span>
              </div>

              <span className="doomsday-time-sep">:</span>

              <div className="doomsday-time-col">
                <span className="doomsday-time-val">{timeLeft.seconds}</span>
                <span className="doomsday-time-lbl">SECONDS</span>
              </div>
            </div>
          </div>

          {/* PROMINENT REGISTER NOW ACTION DIRECTLY BELOW TIMER */}
          <div className="hero-timer-cta-wrap">
            <Link
              to="/register"
              className="hero-timer-register-btn"
              id="hero-timer-register-cta"
              aria-label="Register Now for HackFest 3.0"
            >
              <span>REGISTER NOW</span>
              <span className="hero-timer-btn-arrow" aria-hidden="true">
                <ArrowUpRight size={15} />
              </span>
            </Link>
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
                <span className="doom-meta-value">Student Developer Club</span>
              </div>
            </div>
          </div>
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

      {/* 13. SDC FAMILY MEMBERS */}
      <SdcMembersSection />

      {/* 14. REGISTER */}
      <RegisterSection />
    </main>
  );
}
