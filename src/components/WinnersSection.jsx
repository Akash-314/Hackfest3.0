import React, { useState } from 'react';
import { Trophy, Medal, Award, CheckCircle, Sparkles, Star, ShieldCheck, Users, Code, Lightbulb, Flame } from 'lucide-react';
import HoloBadge from './ui/HoloBadge';

export default function WinnersSection() {
  const [selectedArena, setSelectedArena] = useState('all'); // 'all' | 'hackathon' | 'codeathon' | 'ideathon'

  const winnerData = {
    hackathon: {
      title: 'HACKATHON',
      subtitle: 'Flagship 2-Day Prototype & Live Demo Sprint',
      type: 'Team Competition',
      icon: Flame,
      accentColor: '#39FF88',
      accentGlow: 'rgba(57, 255, 136, 0.25)',
      podium: [
        {
          rank: '1st Place',
          place: 1,
          name: 'Brainstormer',
          entity: 'Team Winner',
          role: 'Champion',
          tag: 'CHAMPION',
          tier: 'gold',
          medal: Trophy,
        },
        {
          rank: '2nd Place',
          place: 2,
          name: 'InnoVex',
          entity: 'Team Runner-up',
          role: 'First Runner-Up',
          tag: 'RUNNER UP',
          tier: 'silver',
          medal: Medal,
        },
        {
          rank: '3rd Place',
          place: 3,
          name: 'Inn0v8',
          entity: 'Team 2nd Runner-up',
          role: 'Second Runner-Up',
          tag: 'THIRD PLACE',
          tier: 'bronze',
          medal: Medal,
        },
      ],
      specialMention: {
        title: 'Mind Cluster',
        label: 'Emerging Team',
        desc: 'Special commendation awarded by the jury panel to the emerging team for commendable innovation, architecture, and engineering grit.',
      },
    },
    codeathon: {
      title: 'CODEATHON',
      subtitle: '90-Minute High-Stakes Algorithmic Arena',
      type: 'Individual Contest',
      icon: Code,
      accentColor: '#63E6D1',
      accentGlow: 'rgba(99, 230, 209, 0.25)',
      podium: [
        {
          rank: '1st Place',
          place: 1,
          name: 'Nitin Gupta',
          entity: 'Solo Coder',
          role: 'Champion',
          tag: 'CHAMPION',
          tier: 'gold',
          medal: Trophy,
        },
        {
          rank: '2nd Place',
          place: 2,
          name: 'Krish Jaiswal',
          entity: 'Solo Coder',
          role: 'First Runner-Up',
          tag: 'RUNNER UP',
          tier: 'silver',
          medal: Medal,
        },
        {
          rank: '3rd Place',
          place: 3,
          name: 'Pramod Yadav',
          entity: 'Solo Coder',
          role: 'Second Runner-Up',
          tag: 'THIRD PLACE',
          tier: 'bronze',
          medal: Medal,
        },
      ],
      specialMention: null,
    },
    ideathon: {
      title: 'IDEATHON',
      subtitle: 'Single Pitch & Conceptual Defense Round',
      type: 'Team Competition',
      icon: Lightbulb,
      accentColor: '#F5C451',
      accentGlow: 'rgba(245, 196, 81, 0.25)',
      podium: [
        {
          rank: '1st Place',
          place: 1,
          name: 'EVVA',
          entity: 'Team Winner',
          role: 'Champion',
          tag: 'CHAMPION',
          tier: 'gold',
          medal: Trophy,
        },
        {
          rank: '2nd Place',
          place: 2,
          name: 'Innova',
          entity: 'Team Runner-up',
          role: 'First Runner-Up',
          tag: 'RUNNER UP',
          tier: 'silver',
          medal: Medal,
        },
        {
          rank: '3rd Place',
          place: 3,
          name: 'Tech Titans',
          entity: 'Team 2nd Runner-up',
          role: 'Second Runner-Up',
          tag: 'THIRD PLACE',
          tier: 'bronze',
          medal: Medal,
        },
      ],
      specialMention: null,
    },
  };

  const getTierColors = (tier) => {
    switch (tier) {
      case 'gold':
        return {
          border: 'rgba(245, 196, 81, 0.7)',
          headerBg: 'linear-gradient(135deg, rgba(245, 196, 81, 0.2) 0%, rgba(200, 140, 20, 0.05) 100%)',
          cardBg: 'radial-gradient(120% 120% at 50% 0%, rgba(40, 32, 12, 0.85) 0%, rgba(12, 11, 8, 0.95) 100%)',
          accent: '#F5C451',
          glow: '0 0 35px rgba(245, 196, 81, 0.35)',
          badgeBg: 'rgba(245, 196, 81, 0.15)',
          badgeText: '#F5C451',
          pillBorder: '1px solid rgba(245, 196, 81, 0.5)',
          pedestalHeight: '130px',
        };
      case 'silver':
        return {
          border: 'rgba(226, 232, 240, 0.55)',
          headerBg: 'linear-gradient(135deg, rgba(226, 232, 240, 0.16) 0%, rgba(148, 163, 184, 0.03) 100%)',
          cardBg: 'radial-gradient(120% 120% at 50% 0%, rgba(30, 35, 42, 0.85) 0%, rgba(10, 12, 15, 0.95) 100%)',
          accent: '#E2E8F0',
          glow: '0 0 25px rgba(226, 232, 240, 0.2)',
          badgeBg: 'rgba(226, 232, 240, 0.12)',
          badgeText: '#E2E8F0',
          pillBorder: '1px solid rgba(226, 232, 240, 0.4)',
          pedestalHeight: '95px',
        };
      case 'bronze':
      default:
        return {
          border: 'rgba(205, 127, 50, 0.65)',
          headerBg: 'linear-gradient(135deg, rgba(205, 127, 50, 0.2) 0%, rgba(160, 82, 45, 0.04) 100%)',
          cardBg: 'radial-gradient(120% 120% at 50% 0%, rgba(35, 23, 16, 0.85) 0%, rgba(12, 10, 9, 0.95) 100%)',
          accent: '#E59866',
          glow: '0 0 25px rgba(205, 127, 50, 0.25)',
          badgeBg: 'rgba(205, 127, 50, 0.15)',
          badgeText: '#E59866',
          pillBorder: '1px solid rgba(205, 127, 50, 0.45)',
          pedestalHeight: '75px',
        };
    }
  };

  const arenasToShow =
    selectedArena === 'all'
      ? ['hackathon', 'codeathon', 'ideathon']
      : [selectedArena];

  return (
    <section id="winners" className="section" style={{ position: 'relative', padding: '5.5rem 0 4.5rem 0' }}>
      <div className="section-transition-top" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Section Header */}
        <div className="section-header center" style={{ marginBottom: '2.5rem' }}>
          <HoloBadge variant="gold" icon={Trophy}>
            VICTORY ARCHIVE • OFFICIAL VERIFICATION
          </HoloBadge>
          <h2 className="heading-section" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', letterSpacing: '0.04em' }}>
            HACKFEST 3.0 — WINNERS & RESULTS
          </h2>
          <p className="section-lead" style={{ maxWidth: '720px', margin: '0 auto 1.5rem auto' }}>
            All three competitive arenas have officially concluded. We proudly celebrate the champions, runners-up, and standout innovators of HackFest 3.0.
          </p>

          {/* Tri-Status Badges */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}
          >
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
                fontSize: '0.76rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
              }}
            >
              <CheckCircle size={13} />
              ALL COMPETITIONS COMPLETED
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                background: 'rgba(245, 196, 81, 0.15)',
                border: '1px solid #F5C451',
                color: '#F5C451',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.76rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
              }}
            >
              <ShieldCheck size={13} />
              RESULTS PUBLISHED & VERIFIED
            </span>
          </div>

          {/* Arena Switcher Tabs */}
          <div
            style={{
              display: 'inline-flex',
              gap: '0.45rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              background: 'rgba(8, 10, 9, 0.75)',
              padding: '0.4rem 0.6rem',
              borderRadius: '9999px',
              border: '1px solid rgba(57, 255, 136, 0.2)',
            }}
          >
            {[
              { id: 'all', label: 'ALL ARENAS (3)' },
              { id: 'hackathon', label: 'HACKATHON', icon: Flame },
              { id: 'codeathon', label: 'CODEATHON', icon: Code },
              { id: 'ideathon', label: 'IDEATHON', icon: Lightbulb },
            ].map((tab) => {
              const isActive = selectedArena === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedArena(tab.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 1.15rem',
                    borderRadius: '9999px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    border: isActive ? '1px solid #39FF88' : '1px solid transparent',
                    background: isActive ? 'rgba(57, 255, 136, 0.16)' : 'transparent',
                    color: isActive ? '#39FF88' : '#94A3B8',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {TabIcon && <TabIcon size={13} />}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Arenas Rendering Loop */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          {arenasToShow.map((arenaKey) => {
            const data = winnerData[arenaKey];
            const ArenaIcon = data.icon;

            // Re-order podium for Olympic presentation: 2nd place (left), 1st place (center elevated), 3rd place (right)
            const firstPlace = data.podium.find((p) => p.place === 1);
            const secondPlace = data.podium.find((p) => p.place === 2);
            const thirdPlace = data.podium.find((p) => p.place === 3);
            const displayOrder = [secondPlace, firstPlace, thirdPlace].filter(Boolean);

            return (
              <div
                key={arenaKey}
                style={{
                  position: 'relative',
                  borderRadius: '20px',
                  border: '1px solid rgba(57, 255, 136, 0.22)',
                  background: 'linear-gradient(175deg, rgba(14, 28, 20, 0.75) 0%, rgba(6, 12, 9, 0.95) 100%)',
                  padding: '2.5rem 2rem',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)',
                }}
              >
                {/* Arena Title Bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    paddingBottom: '1.75rem',
                    marginBottom: '2.5rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                      <ArenaIcon size={24} color={data.accentColor} />
                      <h3
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '1.75rem',
                          color: '#FFFFFF',
                          letterSpacing: '0.06em',
                          margin: 0,
                        }}
                      >
                        {data.title}
                      </h3>
                    </div>
                    <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.9rem', margin: 0 }}>
                      {data.subtitle}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '6px',
                        background: 'rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.74rem',
                        color: '#C3DFCE',
                      }}
                    >
                      {data.type.toUpperCase()}
                    </span>
                    <span
                      style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '6px',
                        background: 'rgba(57, 255, 136, 0.1)',
                        border: '1px solid #39FF88',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.74rem',
                        color: '#39FF88',
                        fontWeight: 700,
                      }}
                    >
                      COMPLETED
                    </span>
                  </div>
                </div>

                {/* Podium Grid (2nd, 1st, 3rd) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                    gap: '1.75rem',
                    alignItems: 'end',
                  }}
                >
                  {displayOrder.map((winner) => {
                    const theme = getTierColors(winner.tier);
                    const isChampion = winner.place === 1;
                    const MedalIcon = winner.medal;

                    return (
                      <div
                        key={winner.place}
                        style={{
                          position: 'relative',
                          borderRadius: '16px',
                          border: `1px solid ${theme.border}`,
                          background: theme.cardBg,
                          boxShadow: theme.glow,
                          padding: isChampion ? '2.5rem 1.75rem 2rem 1.75rem' : '2rem 1.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          order: winner.place === 1 ? 2 : winner.place === 2 ? 1 : 3,
                          transform: isChampion ? 'translateY(-8px)' : 'none',
                          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                        }}
                      >
                        {/* Crown / Trophy Halo */}
                        <div
                          style={{
                            width: isChampion ? '72px' : '56px',
                            height: isChampion ? '72px' : '56px',
                            borderRadius: '50%',
                            background: theme.badgeBg,
                            border: theme.pillBorder,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem',
                            boxShadow: isChampion ? '0 0 25px rgba(245, 196, 81, 0.4)' : 'none',
                          }}
                        >
                          <MedalIcon size={isChampion ? 36 : 28} color={theme.accent} />
                        </div>

                        {/* Rank Badge */}
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.85rem',
                            borderRadius: '9999px',
                            background: theme.badgeBg,
                            border: theme.pillBorder,
                            color: theme.badgeText,
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            marginBottom: '0.75rem',
                          }}
                        >
                          {winner.rank.toUpperCase()}
                        </span>

                        {/* Prominent Winner Name */}
                        <h4
                          style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: isChampion ? '1.85rem' : '1.45rem',
                            color: '#FFFFFF',
                            letterSpacing: '0.04em',
                            margin: '0.25rem 0 0.5rem 0',
                            textShadow: '0 2px 12px rgba(0, 0, 0, 0.8)',
                          }}
                        >
                          {winner.name}
                        </h4>

                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.78rem',
                            color: theme.accent,
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            marginBottom: '0.35rem',
                          }}
                        >
                          {winner.role.toUpperCase()}
                        </span>

                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {winner.entity}
                        </span>

                        {/* Subtle Pedestal Base */}
                        <div
                          style={{
                            width: '100%',
                            height: '4px',
                            borderRadius: '2px',
                            background: theme.border,
                            marginTop: '1.5rem',
                            boxShadow: theme.glow,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Additional Recognition (Hackathon: Emerging Team - Mind Cluster) */}
                {data.specialMention && (
                  <div
                    style={{
                      marginTop: '2.5rem',
                      borderRadius: '12px',
                      background: 'rgba(0, 0, 0, 0.45)',
                      border: '1px dashed rgba(57, 255, 136, 0.35)',
                      padding: '1.25rem 1.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1.25rem',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          background: 'rgba(57, 255, 136, 0.12)',
                          border: '1px solid #39FF88',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Star size={22} color="#39FF88" />
                      </div>
                      <div>
                        <span
                          style={{
                            display: 'block',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            color: '#39FF88',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                          }}
                        >
                          {data.specialMention.label.toUpperCase()}
                        </span>
                        <h5
                          style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.2rem',
                            color: '#FFFFFF',
                            margin: '0.15rem 0',
                            letterSpacing: '0.03em',
                          }}
                        >
                          {data.specialMention.title}
                        </h5>
                        <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.82rem', margin: 0 }}>
                          {data.specialMention.desc}
                        </p>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '0.35rem 0.8rem',
                        borderRadius: '9999px',
                        background: 'rgba(57, 255, 136, 0.1)',
                        border: '1px solid rgba(57, 255, 136, 0.4)',
                        color: '#39FF88',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                      }}
                    >
                      JURY COMMENDATION
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

