import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Terminal, Sparkles, Flame, Clock, Users } from 'lucide-react';
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

  const arenaMeta = {
    codeathon: {
      tag: 'SPEED CODING',
      variant: 'teal',
      badge: 'ALGORITHMS',
      icon: Terminal,
      punchline: 'High-speed algorithmic sprints and data structure challenges under time pressure.',
      meta1: 'Individual',
      meta2: '3 Hours',
    },
    ideathon: {
      tag: 'INNOVATION PITCH',
      variant: 'violet',
      badge: 'IDEATION',
      icon: Sparkles,
      punchline: 'Visionary concept development, architecture planning, and executive pitch deck presentation.',
      meta1: '1-3 Members',
      meta2: 'Design & Pitch',
    },
    hackathon: {
      tag: 'FLAGSHIP HACKATHON',
      variant: 'teal',
      badge: '48H SPRINT',
      icon: Flame,
      punchline: 'End-to-end prototype build across AI, Web3, FinTech, and open innovation tracks.',
      meta1: '2-4 Members',
      meta2: '48 Hours',
    },
  };

  return (
    <section id="competitions" className="section competitions-section">
      <div className="section-transition-top" />
      <div className="container">
        {/* Header */}
        <div className="section-header center">
          <HoloBadge variant="teal" icon={Flame}>
            COMPETITION ARENAS
          </HoloBadge>
          <h2 className="heading-section">
            THREE SPECIALIZED TRACKS
          </h2>
          <p className="section-lead">
            Select an arena to review full guidelines, evaluation criteria, problem tracks, and registration requirements.
          </p>
        </div>

        {/* 3 Arenas Grid - Compact Minimal Cards */}
        <div className="competitions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
          {compList.map((comp) => {
            const meta = arenaMeta[comp.id] || {
              tag: 'TRACK',
              variant: 'teal',
              badge: comp.badge || 'EVENT',
              icon: Terminal,
              punchline: comp.shortDescription,
              meta1: comp.format || 'Team',
              meta2: comp.duration || 'Sprint',
            };
            const Icon = meta.icon;

            return (
              <SuperheroPanel
                key={comp.id}
                variant={meta.variant}
                tag={meta.tag}
                issueNumber={meta.badge}
                className="competition-minimal-card"
              >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {/* Title & Icon */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#F5F5F7', margin: 0, letterSpacing: '0.02em' }}>
                      {comp.title}
                    </h3>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        background: 'rgba(99, 230, 209, 0.08)',
                        border: '1px solid rgba(99, 230, 209, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#63E6D1',
                      }}
                    >
                      <Icon size={18} />
                    </div>
                  </div>

                  {/* 1 concise tagline */}
                  <p style={{ color: '#A1A6B3', fontSize: '0.9rem', lineHeight: '1.55', marginBottom: '1.25rem', flexGrow: 1 }}>
                    {meta.punchline}
                  </p>

                  {/* 2 Essential metadata badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.78rem',
                        color: '#C7CED8',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <Users size={12} color="#63E6D1" />
                      {meta.meta1}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.78rem',
                        color: '#C7CED8',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <Clock size={12} color="#63E6D1" />
                      {meta.meta2}
                    </span>
                  </div>

                  {/* Intentional Interaction Link */}
                  <Link
                    to={`/${comp.id}`}
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      fontSize: '0.82rem',
                      padding: '0.7rem 1rem',
                      background: 'rgba(255, 255, 255, 0.04)',
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      color: '#F5F5F7',
                      borderRadius: '8px',
                    }}
                  >
                    <span>EXPLORE ARENA DETAILS</span>
                    <ArrowUpRight size={15} color="#63E6D1" />
                  </Link>
                </div>
              </SuperheroPanel>
            );
          })}
        </div>
      </div>
    </section>
  );
}
