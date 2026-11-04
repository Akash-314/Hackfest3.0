import React, { useState, useEffect } from 'react';
import { Flame, Clock, Users, ArrowUpRight, Award, Compass, Presentation, Cpu, ShieldAlert } from 'lucide-react';
import HoloBadge from './ui/HoloBadge';
import { eventService } from '../services/eventService';

export default function HackathonDayTwoSection() {
  const [hackathonStatus, setHackathonStatus] = useState('COMPLETED • RESULTS PUBLISHED');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let isMounted = true;
    eventService.getSettings().then((s) => {
      if (isMounted && s) {
        setSettings(s);
        if (s.hackathonStatus) {
          setHackathonStatus(s.hackathonStatus);
        } else if (s.liveModeStatus) {
          setHackathonStatus(s.liveModeStatus);
        }
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const stages = [
    {
      number: '01',
      title: 'Flagship Check-in & Kick-off',
      desc: 'Shortlisted teams check in and receive mentorship briefings and challenge parameters.',
      icon: Users,
      badge: 'COMPLETED',
    },
    {
      number: '02',
      title: 'Project Development Sprint',
      desc: 'Active prototype building, API integration, and architectural implementation across 6 problem categories.',
      icon: Cpu,
      badge: 'COMPLETED',
    },
    {
      number: '03',
      title: 'Mentoring & Technical Review',
      desc: 'Industry veterans and faculty mentors provide targeted feedback on architecture, scalability, and code structure.',
      icon: Compass,
      badge: 'COMPLETED',
    },
    {
      number: '04',
      title: 'Final Pitch & Live Demo',
      desc: 'Teams present live working demos, undergo code scrutiny, and defend solutions before the grand jury.',
      icon: Presentation,
      badge: 'EVALUATED & CONCLUDED',
    },
  ];

  return (
    <section id="hackathon-day2" className="section" style={{ position: 'relative', padding: '4.5rem 0 3.5rem 0' }}>
      <div className="section-transition-top" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Section Header */}
        <div className="section-header center" style={{ marginBottom: '2.5rem' }}>
          <HoloBadge variant="gold" icon={Flame}>
            FLAGSHIP ARENA • DAY 02
          </HoloBadge>
          <h2 className="heading-section">
            HACKATHON BUILD & DEMO
          </h2>
          <p className="section-lead">
            The centerpiece 2-day flagship hackathon where shortlisted teams turned visionary concepts into deployed prototypes. Evaluations are concluded and verified winners are announced.
          </p>

          {/* Admin Configured Status Badge */}
          <div style={{ marginTop: '1.25rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 1.25rem',
                borderRadius: '9999px',
                background: 'rgba(245, 196, 81, 0.15)',
                border: '1px solid #F5C451',
                color: '#F5C451',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.82rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                boxShadow: '0 0 20px rgba(245, 196, 81, 0.25)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#F5C451',
                  boxShadow: '0 0 8px #F5C451',
                  animation: 'pulse 1.8s infinite',
                }}
              />
              DAY 02 STATUS: {hackathonStatus.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Feature Grid: 4 Hackathon Lifecycle Phases */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
            marginBottom: '3rem',
          }}
        >
          {stages.map((st, i) => {
            const IconComp = st.icon;
            return (
              <div
                key={i}
                style={{
                  position: 'relative',
                  padding: '1.75rem 1.5rem',
                  borderRadius: '14px',
                  background: 'rgba(11, 23, 17, 0.65)',
                  border: '1px solid rgba(57, 255, 136, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: 'rgba(57, 255, 136, 0.35)',
                      }}
                    >
                      {st.number}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#C3DFCE',
                      }}
                    >
                      {st.badge}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.15rem',
                      color: '#FFFFFF',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <IconComp size={18} color="#39FF88" />
                    {st.title}
                  </h3>

                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hackathon Details Callout */}
        <div
          style={{
            padding: '2rem',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(20, 40, 31, 0.75) 0%, rgba(8, 14, 11, 0.9) 100%)',
            border: '1px solid rgba(57, 255, 136, 0.25)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
          }}
        >
          <div style={{ maxWidth: '680px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: '#39FF88',
                fontWeight: 700,
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: '0.4rem',
              }}
            >
              MULTI-CATEGORY PROTOTYPE EVALUATION
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', color: '#fff', marginBottom: '0.5rem' }}>
              6 Critical Problem Statements Under Development
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Hackathon solutions were evaluated based on technical rigor, system architecture, operational demo feasibility, and real-world viability. Verified winners and runner-up teams are published below!
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a
              href="#winners"
              className="btn btn-secondary"
              style={{
                fontSize: '0.82rem',
                padding: '0.7rem 1.4rem',
                borderRadius: '8px',
                fontFamily: 'var(--font-heading)',
              }}
            >
              <span>VIEW HACKATHON WINNERS</span>
            </a>
            <a
              href="#schedule"
              className="btn btn-primary"
              style={{
                fontSize: '0.82rem',
                padding: '0.7rem 1.4rem',
                borderRadius: '8px',
                fontFamily: 'var(--font-heading)',
              }}
            >
              <span>VIEW FULL TIMELINE</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}

