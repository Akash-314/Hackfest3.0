import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Zap, Target, Eye, Globe, Terminal, Users2, Hammer, Lightbulb, Activity, BarChart3, Layers } from 'lucide-react';
import { eventHighlights, additionalHighlights } from '../data/eventData';
import SuperheroPanel from './ui/SuperheroPanel';
import HoloBadge from './ui/HoloBadge';

export default function AboutSection() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('pillars');

  useEffect(() => {
    const hash = (location.hash || '').toLowerCase().replace('#', '');
    if (hash === 'highlights' || hash === 'scale' || hash === 'stats') {
      setActiveTab('highlights');
    } else if (hash === 'about' || hash === 'pillars') {
      setActiveTab('pillars');
    }
  }, [location.hash]);

  const briefingPillars = [
    {
      code: 'PILLAR 01',
      title: 'MISSION',
      desc: 'To cultivate engineering excellence, creative problem-solving, and algorithmic mastery.',
      icon: Target,
      variant: 'blue',
    },
    {
      code: 'PILLAR 02',
      title: 'VISION',
      desc: 'Empowering the next generation of builders to create scalable, impactful technology for real-world challenges.',
      icon: Eye,
      variant: 'red',
    },
    {
      code: 'PILLAR 03',
      title: 'OBJECTIVE',
      desc: '48 continuous hours of collaborative coding, mentorship, and project evaluations at the Multipurpose Hall.',
      icon: Zap,
      variant: 'gold',
    },
    {
      code: 'PILLAR 04',
      title: 'WHO CAN JOIN',
      desc: 'Open to undergraduate and postgraduate students pan-India across engineering, science, and design disciplines.',
      icon: Globe,
      variant: 'green',
    },
  ];

  const highlightIcons = [
    <Terminal size={22} color="var(--color-arc-blue)" />,
    <Lightbulb size={22} color="var(--color-stark-gold)" />,
    <Users2 size={22} color="var(--color-energy-red)" />,
    <Hammer size={22} color="var(--color-tech-white)" />,
  ];

  const statVariants = ['blue', 'gold', 'red', 'green'];

  return (
    <section id="about" className="section about-section marvel-briefing-section">
      <div id="highlights" style={{ position: 'relative', top: '-80px', visibility: 'hidden', height: 0 }} />
      <div className="section-transition-top" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header Telemetry */}
        <div className="section-header center">
          <HoloBadge variant="gold">
            ABOUT THE EVENT
          </HoloBadge>
          <h2 className="heading-section marvel-section-title">
            ABOUT HACKFEST 3.0
          </h2>
          <p className="section-lead" style={{ maxWidth: '840px', lineHeight: '1.7', margin: '0 auto 2rem auto' }}>
            HackFest 3.0 — Doomsday is REC Banda's two-day, offline technology event organized by the REC Banda Incubation Centre Foundation in collaboration with the Student Developer Club, REC Banda. Taking place on 1–2 November 2026, the event brings college students together across three competitions: Hackathon, Ideathon and Codeathon.
          </p>

          {/* Interactive Compact View Switcher */}
          <div
            style={{
              display: 'inline-flex',
              padding: '0.35rem',
              borderRadius: '9999px',
              background: 'rgba(20, 26, 36, 0.9)',
              border: '1px solid rgba(245, 196, 81, 0.3)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              gap: '0.4rem',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('pillars')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.25rem',
                borderRadius: '9999px',
                border: activeTab === 'pillars' ? '1px solid var(--color-stark-gold)' : '1px solid transparent',
                background: activeTab === 'pillars' ? 'rgba(245, 196, 81, 0.18)' : 'transparent',
                color: activeTab === 'pillars' ? 'var(--color-stark-gold)' : 'var(--color-text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Layers size={15} />
              <span>MISSION & PILLARS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('highlights')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.25rem',
                borderRadius: '9999px',
                border: activeTab === 'highlights' ? '1px solid var(--color-arc-blue)' : '1px solid transparent',
                background: activeTab === 'highlights' ? 'rgba(0, 191, 255, 0.18)' : 'transparent',
                color: activeTab === 'highlights' ? 'var(--color-arc-blue)' : 'var(--color-text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <BarChart3 size={15} />
              <span>SCALE & METRICS</span>
            </button>
          </div>
        </div>

        {/* View 1: 4-Card Pillar Grid */}
        {activeTab === 'pillars' && (
          <div className="briefing-hud-grid hub-tab-fade-in">
            {briefingPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <SuperheroPanel
                  key={pillar.title}
                  variant={pillar.variant}
                  tag={pillar.code}
                  className="briefing-hud-card"
                >
                  <div className="briefing-card-content">
                    <div className="briefing-icon-wrap" style={{ width: 44, height: 44, borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem' }}>
                      <Icon size={24} />
                    </div>
                    <h3 className="heading-display" style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '0.4rem' }}>
                      {pillar.title}
                    </h3>
                    <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: '1.6' }}>
                      {pillar.desc}
                    </p>
                  </div>
                </SuperheroPanel>
              );
            })}
          </div>
        )}

        {/* View 2: Scale & Key Numbers */}
        {activeTab === 'highlights' && (
          <div className="hub-tab-fade-in">
            <div className="stats-grid stark-stats-grid">
              {eventHighlights.map((stat, idx) => (
                <SuperheroPanel
                  key={idx}
                  variant={statVariants[idx % statVariants.length]}
                  tag={`HIGHLIGHT 0${idx + 1}`}
                  className="stark-stat-card"
                >
                  <div className="stark-stat-card-inner">
                    <div className="stat-number marvel-stat-num">{stat.number}</div>
                    <div className="stat-label marvel-stat-title">{stat.label}</div>
                    <div className="stark-stat-energy-bar" />
                    <p className="stat-desc stark-stat-description">{stat.description}</p>
                  </div>
                </SuperheroPanel>
              ))}
            </div>

            <div className="features-grid stark-features-grid" style={{ marginTop: '2rem' }}>
              {additionalHighlights.map((feat, idx) => (
                <SuperheroPanel
                  key={idx}
                  variant="dark"
                  tag={feat.title.toUpperCase()}
                  className="stark-feature-panel"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                    <div className="stark-feat-icon-box">
                      {highlightIcons[idx % highlightIcons.length]}
                    </div>
                    <h3 className="feature-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#FFFFFF', margin: 0 }}>
                      {feat.title}
                    </h3>
                  </div>
                  <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: '1.55', margin: 0 }}>
                    {feat.desc}
                  </p>
                </SuperheroPanel>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
