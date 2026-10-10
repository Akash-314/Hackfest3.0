import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, Award, Users, Zap, Terminal, Sparkles, Shield, Flame } from 'lucide-react';
import { competitions } from '../data/eventData';
import { eventService } from '../services/eventService';
import SuperheroPanel from './ui/SuperheroPanel';
import HoloBadge from './ui/HoloBadge';

export default function CompetitionsSection() {
  const [compList, setCompList] = useState(competitions);

  useEffect(() => {
    let isMounted = true;
    eventService.getCompetitions().then((res) => {
      if (isMounted && res?.length > 0) setCompList(res);
    });
    return () => { isMounted = false; };
  }, []);
  const arenaThemes = {
    codeathon: {
      themeName: 'SPEED CODING',
      variant: 'blue',
      badgeLabel: 'ALGORITHMS & SPEED',
      accentColor: 'var(--color-arc-blue)',
      icon: Terminal,
      subHeadline: 'ROUND 01 // INDIVIDUAL SPEED SPRINT',
    },
    ideathon: {
      themeName: 'IDEATION & PITCH',
      variant: 'gold',
      badgeLabel: 'INNOVATION & DESIGN',
      accentColor: 'var(--color-stark-gold)',
      icon: Sparkles,
      subHeadline: 'ROUND 02 // PROPOSAL & PRESENTATION',
    },
    hackathon: {
      themeName: 'FLAGSHIP HACKATHON',
      variant: 'red',
      badgeLabel: '48H PROTOTYPE SPRINT',
      accentColor: 'var(--color-energy-red)',
      icon: Flame,
      subHeadline: 'ROUND 03 // FULL PROJECT BUILD & DEMO',
    },
  };

  return (
    <section id="competitions" className="section competitions-section superhero-arenas-section">
      <div className="section-transition-top" />
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <HoloBadge variant="red" icon={Shield}>
            COMPETITIONS
          </HoloBadge>
          <h2 className="heading-section marvel-section-title">THE THREE COMPETITIONS</h2>
          <p className="section-lead">
            Three tailored competition tracks designed to test your problem-solving speed, creative ideation, and end-to-end building capabilities.
          </p>
        </div>

        {/* 3 Arenas Grid */}
        <div className="competitions-grid marvel-arenas-grid">
          {compList.map((comp) => {
            const isMain = comp.isDominant;
            const theme = arenaThemes[comp.id] || {
              themeName: 'EVENT TRACK',
              variant: 'blue',
              badgeLabel: comp.badge,
              accentColor: 'var(--color-arc-blue)',
              icon: Zap,
              subHeadline: 'COMPETITION TRACK',
            };
            const ThemeIcon = theme.icon;

            return (
              <SuperheroPanel
                key={comp.id}
                variant={theme.variant}
                tag={theme.themeName}
                issueNumber={comp.badge}
                className={`marvel-arena-panel ${isMain ? 'dominant-arena' : ''}`}
              >
                {/* Visual Imagery Banner with comic frame */}
                <div className="competition-image-wrap marvel-arena-img-wrap">
                  <img
                    src={comp.bgImage}
                    alt={`${comp.title} Arena`}
                    className="competition-panel-img marvel-arena-img"
                    loading="lazy"
                  />
                  <div className="competition-img-overlay" />
                  
                  {/* Floating Hero Badge */}
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <HoloBadge variant={theme.variant === 'blue' ? 'cyan' : theme.variant === 'gold' ? 'gold' : 'red'}>
                      {theme.badgeLabel}
                    </HoloBadge>
                  </div>
                </div>

                {/* Body Content */}
                <div className="competition-body" style={{ display: 'flex', flexDirection: 'column', height: '100%', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <ThemeIcon size={22} color={theme.accentColor} />
                    <h3 className="heading-display" style={{ fontSize: '1.8rem', color: '#FFFFFF', letterSpacing: '0.04em' }}>
                      {comp.title}
                    </h3>
                  </div>

                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: theme.accentColor, fontWeight: 700, letterSpacing: '0.08em', marginBottom: '0.8rem' }}>
                    {theme.subHeadline}
                  </div>
                  
                  <p style={{ color: '#94A3B8', fontSize: '0.94rem', lineHeight: '1.6', marginBottom: '1.4rem' }}>
                    {comp.shortDescription}
                  </p>

                  {/* Operational Parameters */}
                  <div className="competition-meta-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.6rem', background: 'rgba(5, 7, 13, 0.6)', padding: '0.9rem', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.86rem', color: '#E2E8F0' }}>
                      <Clock size={16} color={theme.accentColor} />
                      <span>{comp.duration}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.86rem', color: '#E2E8F0' }}>
                      <Users size={16} color={theme.accentColor} />
                      <span>{comp.format}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.86rem', color: '#E2E8F0' }}>
                      <Award size={16} color={theme.accentColor} />
                      <span>{comp.evaluation}</span>
                    </div>
                  </div>

                  {/* Deploy Action */}
                  <div style={{ marginTop: 'auto' }}>
                    <Link
                      to={`/${comp.id}`}
                      className={`btn ${isMain ? 'btn-avenger' : 'btn-reactor'}`}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      {comp.cta}
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>
              </SuperheroPanel>
            );
          })}
        </div>
      </div>
    </section>
  );
}
