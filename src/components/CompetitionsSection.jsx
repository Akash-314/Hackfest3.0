import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Terminal, Sparkles, Flame, Clock, Users, ChevronDown, Calendar } from 'lucide-react';
import { competitions } from '../data/eventData';
import { eventService } from '../services/eventService';
import SuperheroPanel from './ui/SuperheroPanel';
import HoloBadge from './ui/HoloBadge';
import EventCard from './EventCard';

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
      punchline: 'Individual 1.5-hour competitive algorithmic contest with live leaderboard ranking.',
      meta1: 'Individual',
      meta2: '1.5 Hours',
    },
    ideathon: {
      tag: 'INNOVATION PITCH',
      variant: 'violet',
      badge: 'SINGLE PITCH',
      icon: Sparkles,
      punchline: 'Visionary concept development and single pitching round before the jury on Day 1.',
      meta1: 'Team (3–4 Members)',
      meta2: 'Day 1 • Pitch Round',
    },
    hackathon: {
      tag: 'FLAGSHIP HACKATHON',
      variant: 'teal',
      badge: 'BUILD & DEMO',
      icon: Flame,
      punchline: 'Two-round competition: preliminary pitch round followed by Day 2 project building and live jury demo.',
      meta1: 'Team (3–4 Members)',
      meta2: 'Day 2 • Build Sprint',
    },
  };

  return (
    <section id="competitions" className="section competitions-section">
        <div className="section-transition-top" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
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

        {/* 3 Arenas Grid - React Bits TiltedCard (Front: Event Name Only | Click: Flip Preview) */}
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

            return (
              <EventCard
                key={comp.id}
                comp={comp}
                meta={meta}
              />
            );
          })}
        </div>

        {/* Quick jump to embedded schedule */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
          <a
            href="#schedule"
            className="btn btn-secondary"
            style={{
              fontSize: '0.82rem',
              padding: '0.65rem 1.4rem',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(57, 255, 136, 0.08)',
              borderColor: 'rgba(57, 255, 136, 0.25)',
              color: '#39FF88',
            }}
          >
            <Calendar size={15} />
            <span>VIEW EVENT SCHEDULE & TIMELINE</span>
            <ChevronDown size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}
