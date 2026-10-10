import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Calendar, MapPin, Users, Zap, Shield, Sparkles, Terminal } from 'lucide-react';
import { eventMeta } from '../data/eventData';
import { eventService } from '../services/eventService';
import SuperheroPanel from './ui/SuperheroPanel';
import HoloBadge from './ui/HoloBadge';

export default function RegisterSection() {
  const [activeSlot, setActiveSlot] = useState(null);
  const [meta, setMeta] = useState(eventMeta);

  useEffect(() => {
    let isMounted = true;
    eventService.getSettings().then((res) => {
      if (isMounted && res) setMeta(res);
    });
    return () => { isMounted = false; };
  }, []);

  const heroSlots = [
    {
      slot: 'HERO SLOT 01',
      role: 'SYSTEM ARCHITECT',
      heroType: 'ARMORED TACTICIAN',
      color: 'var(--color-stark-gold)',
      desc: 'Master of system scalability, distributed infrastructure, and defense architecture.',
      icon: Shield,
    },
    {
      slot: 'HERO SLOT 02',
      role: 'CODE WARRIOR',
      heroType: 'AGILE SPEED DEVELOPER',
      color: 'var(--color-energy-red)',
      desc: 'Rapid algorithm specialist capable of high-velocity debugging and algorithmic precision.',
      icon: Terminal,
    },
    {
      slot: 'HERO SLOT 03',
      role: 'STRATEGY VANGUARD',
      heroType: 'DEFENSIVE CAPTAIN',
      color: 'var(--color-arc-blue)',
      desc: 'Team coordinator, security analyst, and presentation leader defending before the jury.',
      icon: Users,
    },
    {
      slot: 'HERO SLOT 04',
      role: 'INNOVATION SPECIALIST',
      heroType: 'QUANTUM INNOVATOR',
      color: '#00ff77',
      desc: 'Multimodal AI integrator, UX visionary, and breakthrough product designer.',
      icon: Sparkles,
    },
  ];

  const deploymentSteps = [
    { num: 'STEP 01', label: 'CHOOSE COMPETITION', desc: 'Codeathon, Ideathon, or Flagship Hackathon' },
    { num: 'STEP 02', label: 'FORM YOUR TEAM', desc: 'Form a team of 2 to 4 or register solo' },
    { num: 'STEP 03', label: 'SELECT TRACK', desc: 'Pick from 6 problem tracks' },
    { num: 'STEP 04', label: 'BUILD & SUBMIT', desc: 'Build and showcase your prototype' },
  ];

  return (
    <section id="register" className="section register-cta-section avengers-assemble-section">
      <div className="section-transition-top" />
      <div className="container">
        {/* Main Assemble Card */}
        <SuperheroPanel
          variant="red"
          tag="REGISTRATION // TEAM FORMATION"
          issueNumber="HACKFEST 3.0"
          className="avengers-main-card"
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <HoloBadge variant="gold" icon={Zap} style={{ marginBottom: '1rem' }}>
              REGISTRATION OPEN // PAN-INDIA
            </HoloBadge>

            <h2 className="heading-display avengers-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: '#FFFFFF', lineHeight: '1.05', marginBottom: '0.8rem' }}>
              ASSEMBLE YOUR TEAM
            </h2>

            <p style={{ color: 'var(--color-stark-gold)', fontFamily: 'var(--font-heading)', fontSize: '1.25rem', letterSpacing: '0.1em', marginBottom: '1rem' }}>
              "GREAT IDEAS ARE BUILT TOGETHER."
            </p>

            <p style={{ color: '#94A3B8', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto', lineHeight: '1.6' }}>
              Team up with peers from your college or form cross-college teams.
              Balance your team across development, UI/UX design, and presentation to compete in <strong>HackFest 3.0</strong>.
            </p>
          </div>

          {/* 4 Interactive Team Role Slots */}
          <div className="hero-slots-grid">
            {heroSlots.map((hero, idx) => {
              const Icon = hero.icon;
              const isHovered = activeSlot === idx;

              return (
                <div
                  key={idx}
                  className={`hero-slot-card ${isHovered ? 'hero-slot-active' : ''}`}
                  onMouseEnter={() => setActiveSlot(idx)}
                  onMouseLeave={() => setActiveSlot(null)}
                  style={{
                    border: `2px solid ${isHovered ? hero.color : 'rgba(255, 255, 255, 0.1)'}`,
                    boxShadow: isHovered ? `0 0 25px ${hero.color}40, 5px 5px 0px ${hero.color}` : '4px 4px 0px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  {/* Hero Avatar Banner */}
                  <div className="hero-slot-avatar-wrap">
                    <div className="hero-slot-silhouette" style={{ color: hero.color }}>
                      <Icon size={34} />
                    </div>
                    <span className="hero-slot-badge" style={{ color: hero.color }}>
                      {hero.slot}
                    </span>
                  </div>

                  <h3 className="hero-slot-role" style={{ color: '#FFFFFF' }}>
                    {hero.role}
                  </h3>

                  <div className="hero-slot-archetype" style={{ color: hero.color }}>
                    {hero.heroType}
                  </div>

                  <p className="hero-slot-desc">
                    {hero.desc}
                  </p>

                  <div className="hero-slot-glow-bar" style={{ background: hero.color }} />
                </div>
              );
            })}
          </div>

          {/* 4-Step Registration Steps */}
          <div className="deployment-steps-row">
            {deploymentSteps.map((st, i) => (
              <div key={i} className="deployment-step-item">
                <span className="deployment-step-num">{st.num}</span>
                <span className="deployment-step-lbl">{st.label}</span>
                <span className="deployment-step-desc">{st.desc}</span>
              </div>
            ))}
          </div>

          {/* Quick Event Pills */}
          <div className="register-meta-pills" style={{ marginTop: '2rem', marginBottom: '2.5rem' }}>
            <div className="register-meta-pill">
              <Calendar size={15} color="var(--color-stark-gold)" />
              <span>{meta.datesDisplay}</span>
            </div>
            <div className="register-meta-pill">
              <MapPin size={15} color="var(--color-arc-blue)" />
              <span>{meta.venueShort}</span>
            </div>
            <div className="register-meta-pill">
              <Users size={15} color="var(--color-energy-red)" />
              <span>COLLEGES PAN-INDIA // FREE ENTRY</span>
            </div>
          </div>

          {/* Main Register Button */}
          <div style={{ textAlign: 'center' }}>
            {meta.registrationOpen !== false ? (
              <Link
                to="/register"
                className="btn btn-avenger marvel-hero-cta"
                id="final-register-btn"
              >
                <Zap size={22} />
                REGISTER FOR HACKFEST 3.0
                <ArrowUpRight size={22} />
              </Link>
            ) : (
              <div
                className="btn btn-secondary marvel-hero-cta"
                style={{ opacity: 0.8, cursor: 'not-allowed', borderColor: '#64748B' }}
              >
                REGISTRATIONS ARE CURRENTLY CLOSED
              </div>
            )}
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#64748B' }}>
            STATUS: {meta.registrationStatus.toUpperCase()} • 100% FREE PARTICIPATION • REC BANDA
          </div>
        </SuperheroPanel>
      </div>
    </section>
  );
}
