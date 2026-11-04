import React from 'react';
import { CheckCircle, Award, Terminal, Sparkles, Clock, MapPin, ChevronRight, ArrowDown, ArrowUpRight } from 'lucide-react';
import HoloBadge from './ui/HoloBadge';

export default function DayOneOverviewSection() {
  const scrollToWinners = (e) => {
    e.preventDefault();
    const el = document.getElementById('winners');
    if (el) {
      const navOffset = 70;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navOffset,
        behavior: 'smooth',
      });
    }
  };

  const timelineEvents = [
    {
      time: '09:30 AM – 10:30 AM',
      title: 'Opening Ceremony',
      location: 'Multipurpose Hall, REC Banda',
      category: 'INAUGURATION',
      description: 'Official inauguration of HackFest 3.0, keynote address, and unveiling of challenge themes with faculty and student leads.',
      status: 'COMPLETED',
      icon: Sparkles,
      accent: '#81C14B',
    },
    {
      time: '11:00 AM – 01:00 PM',
      title: 'Codeathon',
      location: 'Computer Centre, REC Banda',
      category: 'SPEED CODING',
      description: 'High-stakes 90-minute competitive algorithmic arena testing data structures, algorithmic velocity, and optimization skills.',
      status: 'COMPLETED',
      icon: Terminal,
      accent: '#39FF88',
    },
    {
      time: '02:00 PM – 05:00 PM',
      title: 'Ideathon',
      location: 'Lab 02, REC Banda',
      category: 'INNOVATION PITCH',
      description: 'Disruptive concept pitching sessions and defense presentations before the expert jury panel.',
      status: 'COMPLETED',
      icon: Award,
      accent: '#F5C451',
    },
  ];

  return (
    <section id="day-one-status" className="section" style={{ position: 'relative', padding: '4.5rem 0 3.5rem 0' }}>
      <div className="section-transition-top" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Section Header */}
        <div className="section-header center" style={{ marginBottom: '2.5rem' }}>
          <HoloBadge variant="teal" icon={CheckCircle}>
            COMPETITION RECAP
          </HoloBadge>
          <h2 className="heading-section">
            COMPETITIONS CONCLUDED
          </h2>
          <p className="section-lead">
            All HackFest 3.0 arenas have concluded. Explore verified competition outcomes, winners, and moments.
          </p>
        </div>

        {/* 2 Premium Status Cards: Codeathon & Ideathon */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: '1.75rem',
            marginBottom: '4rem',
          }}
        >
          {/* Card 1: Codeathon */}
          <div
            style={{
              position: 'relative',
              borderRadius: '16px',
              border: '1px solid rgba(57, 255, 136, 0.25)',
              background: 'radial-gradient(120% 120% at 50% 0%, rgba(20, 40, 31, 0.8) 0%, rgba(8, 14, 11, 0.95) 100%)',
              padding: '2rem 1.75rem',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(57, 255, 136, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.25s ease, border-color 0.25s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '9999px',
                    background: 'rgba(57, 255, 136, 0.12)',
                    border: '1px solid #39FF88',
                    color: '#39FF88',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                  }}
                >
                  <CheckCircle size={13} />
                  COMPLETED
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#8DDBB0' }}>
                  1.5 HOURS • SOLO
                </span>
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-heading, monospace)',
                  fontSize: '1.5rem',
                  letterSpacing: '0.05em',
                  color: '#FFFFFF',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
              >
                <Terminal size={22} color="#39FF88" />
                CODEATHON
              </h3>

              <p
                style={{
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                }}
              >
                High-octane algorithmic battles in the Computer Centre. Participants resolved complex algorithmic challenges across dynamic programming, graph structures, and time-optimized problem sets.
              </p>
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(57, 255, 136, 0.1)',
                  marginBottom: '1.5rem',
                  fontSize: '0.8rem',
                  color: '#C3DFCE',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <Clock size={15} color="#39FF88" />
                <span>11:00 AM – 01:00 PM • Computer Centre</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem', width: '100%' }}>
                <a
                  href="#winners"
                  onClick={scrollToWinners}
                  className="btn btn-primary"
                  style={{
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  <span>VIEW WINNERS</span>
                  <ChevronRight size={15} />
                </a>
                <a
                  href="https://drive.google.com/drive/folders/1s-6y-Ci_WsAHvzldH8gJpiyfMhs5GTmC"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em',
                    borderColor: 'rgba(57, 255, 136, 0.4)',
                    color: '#39FF88',
                  }}
                >
                  <span>HIGHLIGHTS</span>
                  <ArrowUpRight size={15} />
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: Ideathon */}
          <div
            style={{
              position: 'relative',
              borderRadius: '16px',
              border: '1px solid rgba(245, 196, 81, 0.3)',
              background: 'radial-gradient(120% 120% at 50% 0%, rgba(35, 30, 18, 0.8) 0%, rgba(12, 10, 8, 0.95) 100%)',
              padding: '2rem 1.75rem',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(245, 196, 81, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.25s ease, border-color 0.25s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '9999px',
                    background: 'rgba(245, 196, 81, 0.12)',
                    border: '1px solid #F5C451',
                    color: '#F5C451',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                  }}
                >
                  <CheckCircle size={13} />
                  COMPLETED
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#F0D597' }}>
                  SINGLE PITCH • TEAMS
                </span>
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-heading, monospace)',
                  fontSize: '1.5rem',
                  letterSpacing: '0.05em',
                  color: '#FFFFFF',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
              >
                <Sparkles size={22} color="#F5C451" />
                IDEATHON
              </h3>

              <p
                style={{
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                }}
              >
                Visionary conceptual defense round. Teams presented tech architecture, feasibility models, and impactful social solutions directly to the jury panel in Lab 02.
              </p>
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(245, 196, 81, 0.15)',
                  marginBottom: '1.5rem',
                  fontSize: '0.8rem',
                  color: '#E6D7B8',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <Clock size={15} color="#F5C451" />
                <span>02:00 PM – 05:00 PM • Lab 02</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem', width: '100%' }}>
                <a
                  href="#winners"
                  onClick={scrollToWinners}
                  className="btn btn-primary"
                  style={{
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em',
                    background: 'linear-gradient(135deg, #F5C451 0%, #D49B20 100%)',
                    color: '#0D0E12',
                    border: 'none',
                  }}
                >
                  <span>VIEW WINNERS</span>
                  <ChevronRight size={15} />
                </a>
                <a
                  href="https://drive.google.com/drive/folders/1s-6y-Ci_WsAHvzldH8gJpiyfMhs5GTmC"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em',
                    borderColor: 'rgba(245, 196, 81, 0.4)',
                    color: '#F5C451',
                  }}
                >
                  <span>HIGHLIGHTS</span>
                  <ArrowUpRight size={15} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Day 1 Chronological Timeline */}
        <div style={{ marginTop: '2rem' }}>
          <div className="section-header center" style={{ marginBottom: '2rem' }}>
            <HoloBadge variant="gold" icon={Clock}>
              CHRONOLOGY
            </HoloBadge>
            <h3 className="heading-sub" style={{ fontSize: '1.5rem', color: '#fff' }}>
              DAY 01 TIMELINE & SESSIONS
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {timelineEvents.map((evt, idx) => {
              const IconComp = evt.icon;
              return (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    borderRadius: '12px',
                    background: 'rgba(11, 23, 17, 0.7)',
                    border: '1px solid rgba(57, 255, 136, 0.18)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-mono)',
                          color: evt.accent,
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                        }}
                      >
                        {evt.category}
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '9999px',
                          background: 'rgba(57, 255, 136, 0.1)',
                          border: '1px solid rgba(57, 255, 136, 0.4)',
                          color: '#39FF88',
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                        }}
                      >
                        <CheckCircle size={10} />
                        {evt.status}
                      </span>
                    </div>

                    <h4
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.15rem',
                        color: '#fff',
                        marginBottom: '0.4rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                      }}
                    >
                      <IconComp size={18} color={evt.accent} />
                      {evt.title}
                    </h4>

                    <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                      {evt.description}
                    </p>
                  </div>

                  <div
                    style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      paddingTop: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={12} color={evt.accent} />
                      <span>{evt.time}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={12} color={evt.accent} />
                      <span>{evt.location}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

