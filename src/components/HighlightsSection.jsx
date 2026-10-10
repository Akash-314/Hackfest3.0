import React from 'react';
import { Terminal, Users2, Hammer, Lightbulb, Activity } from 'lucide-react';
import { eventHighlights, additionalHighlights } from '../data/eventData';
import SuperheroPanel from './ui/SuperheroPanel';
import HoloBadge from './ui/HoloBadge';

export default function HighlightsSection() {
  const highlightIcons = [
    <Terminal size={22} color="var(--color-arc-blue)" />,
    <Lightbulb size={22} color="var(--color-stark-gold)" />,
    <Users2 size={22} color="var(--color-energy-red)" />,
    <Hammer size={22} color="var(--color-tech-white)" />
  ];

  const variants = ['blue', 'gold', 'red', 'green'];

  return (
    <section id="highlights" className="section highlights-section marvel-telemetry-section">
      <div className="section-transition-top" />
      <div className="container">
        <div className="section-header center">
          <HoloBadge variant="cyan" icon={Activity}>
            EVENT HIGHLIGHTS
          </HoloBadge>
          <h2 className="heading-section marvel-section-title">EVENT SCALE & KEY NUMBERS</h2>
          <p className="section-lead">
            Designed for hands-on learning, expert mentorship, and production-ready project development.
          </p>
        </div>

        {/* 4 Core Statistics */}
        <div className="stats-grid stark-stats-grid">
          {eventHighlights.map((stat, idx) => (
            <SuperheroPanel
              key={idx}
              variant={variants[idx % variants.length]}
              tag={`HIGHLIGHT 0${idx + 1}`}
              issueNumber="STAT"
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

        {/* 4 Additional Features / Values */}
        <div className="features-grid stark-features-grid" style={{ marginTop: '2.5rem' }}>
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
    </section>
  );
}
