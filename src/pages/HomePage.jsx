import React, { useRef, useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Trophy, Users } from 'lucide-react';
import doomImg from '../assets/doom.png';
import ironImg from '../assets/iron.png';

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
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft());

  // Live 1-second countdown tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    </main>
  );
}
