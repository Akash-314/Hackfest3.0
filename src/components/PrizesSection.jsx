import React from 'react';
import { Trophy, Medal, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { prizesData } from '../data/eventData';
import SuperheroPanel from './ui/SuperheroPanel';
import HoloBadge from './ui/HoloBadge';
import GlowCursor from './ui/GlowCursor';

export default function PrizesSection() {
  const podiumWinners = [
    {
      place: '2ND PLACE',
      title: '1ST RUNNER UP',
      color: '#C7CED8',
      variant: 'silver',
      icon: Medal,
      perks: ['Runner-up Trophy', 'Silver Medals', 'Certificates of Merit', 'Sponsor Swag Hamper'],
    },
    {
      place: '1ST PLACE',
      title: 'CHAMPION',
      color: '#F5C451',
      variant: 'gold',
      icon: Trophy,
      perks: ['Custom Metallic Trophy', 'Gold Medals', 'Excellence Certificates', 'Direct Mentorship & Hamper'],
      dominant: true,
    },
    {
      place: '3RD PLACE',
      title: '2ND RUNNER UP',
      color: '#CD7F32',
      variant: 'red',
      icon: Medal,
      perks: ['Bronze Medals', 'Merit Certificates', 'Partner Tool Credits', 'Sponsor Gift Kit'],
    },
  ];

  return (
    <section id="prizes" className="section prizes-section">
      <div className="glow-cursor-background-layer" aria-hidden="true">
        <GlowCursor
          color="#81C14B"
          secondaryColor="#2E933C"
          intensity={0.8}
          trailWidth={2.5}
          linger={0.9}
          glow={0.8}
          hotspot={0.35}
          followSpeed={0.65}
          grain={0}
          clickBurst={false}
          quality="medium"
          theme="dark"
          maxDevicePixelRatio={1.5}
        />
      </div>
      <div className="section-transition-top" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="section-header center">
          <HoloBadge variant="gold" icon={Trophy}>
            AWARDS & HONORS
          </HoloBadge>
          <h2 className="heading-section">
            PRIZES & RECOGNITION
          </h2>
          <p className="section-lead">
            {prizesData.subtitle || 'Recognizing exceptional engineering, design innovation, and collaborative execution.'}
          </p>
        </div>

        {/* 3-Tier Podium Grid */}
        <div
          className="prizes-podium-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 310px), 1fr))',
            gap: '1.5rem',
            alignItems: 'stretch',
            marginBottom: '3rem',
          }}
        >
          {podiumWinners.map((winner) => {
            const Icon = winner.icon;
            return (
              <SuperheroPanel
                key={winner.place}
                variant={winner.variant}
                tag={winner.place}
                issueNumber={winner.title}
                className={`podium-card ${winner.dominant ? 'dominant-podium' : ''}`}
                style={winner.dominant ? { borderColor: 'rgba(245, 196, 81, 0.35)', background: 'rgba(255, 255, 255, 0.055)' } : {}}
              >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', textAlign: 'center', alignItems: 'center' }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: `${winner.color}18`,
                      border: `1px solid ${winner.color}45`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: winner.color,
                      marginBottom: '1rem',
                    }}
                  >
                    <Icon size={26} />
                  </div>

                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      color: winner.color,
                      letterSpacing: '0.12em',
                      fontWeight: 700,
                      marginBottom: '0.35rem',
                    }}
                  >
                    {winner.place}
                  </span>

                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.6rem',
                      color: '#F5F5F7',
                      marginBottom: '1.4rem',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {winner.title}
                  </h3>

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {winner.perks.map((perk, pIdx) => (
                      <li
                        key={pIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          color: '#A1A6B3',
                          fontSize: '0.88rem',
                        }}
                      >
                        <CheckCircle2 size={15} color={winner.color} style={{ flexShrink: 0 }} />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </SuperheroPanel>
            );
          })}
        </div>

        {/* 3 Arenas Category Breakdown */}
        {Array.isArray(prizesData.arenas) && prizesData.arenas.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.35rem',
                color: '#F5F5F7',
                marginBottom: '1.25rem',
                textAlign: 'center',
                letterSpacing: '0.04em',
              }}
            >
              ARENA PRIZE BREAKDOWN
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                gap: '1.25rem',
              }}
            >
              {prizesData.arenas.map((arena) => (
                <div
                  key={arena.arenaId}
                  style={{
                    background: 'rgba(255, 255, 255, 0.035)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '10px',
                    padding: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#F5F5F7', fontWeight: 600 }}>
                      {arena.arenaName}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        color: '#63E6D1',
                        background: 'rgba(99, 230, 209, 0.08)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                      }}
                    >
                      {arena.subtitle}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {arena.rewards?.map((r, rIdx) => (
                      <div
                        key={rIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.84rem',
                          color: '#A1A6B3',
                          borderBottom: rIdx < arena.rewards.length - 1 ? '1px solid rgba(255, 255, 255, 0.04)' : 'none',
                          paddingBottom: '0.4rem',
                        }}
                      >
                        <span style={{ color: '#F5F5F7', fontWeight: 500 }}>{r.position}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: '#C7CED8' }}>{r.details || r.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
