import React from 'react';
import { Trophy, Medal, Sparkles, Clock } from 'lucide-react';
import SuperheroPanel from './ui/SuperheroPanel';
import HoloBadge from './ui/HoloBadge';

export default function PrizesSection() {
  const placementCards = [
    {
      place: '1ST PLACE',
      title: 'CHAMPION',
      color: '#F5C451',
      variant: 'gold',
      icon: Trophy,
      dominant: true,
      badgeText: 'GRAND WINNER',
      statusNotice: 'PRIZE DETAILS TO BE ANNOUNCED',
      description: 'Official awards and grand recognition for the 1st place champions of HackFest 3.0 will be revealed in the official announcement.',
    },
    {
      place: '2ND PLACE',
      title: '1ST RUNNER UP',
      color: '#C7CED8',
      variant: 'silver',
      icon: Medal,
      dominant: false,
      badgeText: 'RUNNER UP',
      statusNotice: 'PRIZE DETAILS TO BE ANNOUNCED',
      description: 'Official awards and recognition for the 1st runner-up contenders will be revealed in the official announcement.',
    },
    {
      place: '3RD PLACE',
      title: '2ND RUNNER UP',
      color: '#CD7F32',
      variant: 'red',
      icon: Medal,
      dominant: false,
      badgeText: '2ND RUNNER UP',
      statusNotice: 'PRIZE DETAILS TO BE ANNOUNCED',
      description: 'Official awards and recognition for the 2nd runner-up contenders will be revealed in the official announcement.',
    },
  ];

  return (
    <section id="prizes" className="section prizes-section">
      <div className="section-transition-top" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="section-header center">
          <HoloBadge variant="gold" icon={Trophy}>
            PRIZES — TO BE ANNOUNCED
          </HoloBadge>
          <h2 className="heading-section">
            EXCITING PRIZES AHEAD
          </h2>
          <p className="section-lead" style={{ maxWidth: '720px', margin: '0 auto' }}>
            Exciting rewards for HackFest 3.0 winners are in the works. Stay tuned for the official announcement.
          </p>
        </div>

        {/* 3 Placement Cards: 1ST PLACE, 2ND PLACE, 3RD PLACE */}
        <div
          className="prizes-podium-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 310px), 1fr))',
            gap: '1.5rem',
            alignItems: 'stretch',
          }}
        >
          {placementCards.map((card) => {
            const Icon = card.icon;
            return (
              <SuperheroPanel
                key={card.place}
                variant={card.variant}
                tag={card.place}
                className={`podium-card ${card.dominant ? 'dominant-podium' : ''}`}
                style={card.dominant ? { borderColor: 'rgba(245, 196, 81, 0.4)', background: 'rgba(255, 255, 255, 0.055)' } : {}}
              >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', textAlign: 'center', alignItems: 'center' }}>
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: '50%',
                      background: `${card.color}18`,
                      border: `1px solid ${card.color}45`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: card.color,
                      marginBottom: '1rem',
                    }}
                  >
                    <Icon size={26} />
                  </div>

                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      color: card.color,
                      letterSpacing: '0.12em',
                      fontWeight: 700,
                      marginBottom: '0.35rem',
                    }}
                  >
                    {card.place}
                  </span>

                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.65rem',
                      color: '#F5F5F7',
                      marginBottom: '1.1rem',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {card.title}
                  </h3>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${card.color}35`,
                      borderRadius: '4px',
                      padding: '0.35rem 0.75rem',
                      color: card.color,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.74rem',
                      letterSpacing: '0.06em',
                      fontWeight: 600,
                      marginBottom: '1.25rem',
                    }}
                  >
                    <Clock size={13} />
                    <span>{card.statusNotice}</span>
                  </div>

                  <p
                    style={{
                      color: '#94A3B8',
                      fontSize: '0.88rem',
                      lineHeight: '1.6',
                      margin: 0,
                    }}
                  >
                    {card.description}
                  </p>
                </div>
              </SuperheroPanel>
            );
          })}
        </div>
      </div>
    </section>
  );
}
