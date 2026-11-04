import React, { useState, useEffect } from 'react';
import { Terminal, Sparkles, Trophy, Award, Users, CheckCircle, ExternalLink, Calendar, X } from 'lucide-react';
import HoloBadge from './ui/HoloBadge';
import { highlightsService } from '../services/highlightsService';

export default function HighlightsSection() {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArena, setSelectedArena] = useState('all'); // 'all' | 'codeathon' | 'ideathon' | 'hackathon'
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    highlightsService.getHighlights('all').then((data) => {
      if (isMounted) {
        setHighlights(data || []);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const codeathonHighlights = highlights.filter((h) => h.competition_id?.toLowerCase() === 'codeathon');
  const ideathonHighlights = highlights.filter((h) => h.competition_id?.toLowerCase() === 'ideathon');
  const hackathonHighlights = highlights.filter((h) => h.competition_id?.toLowerCase() === 'hackathon');

  const filteredList = highlights.filter((h) => {
    if (selectedArena === 'all') return true;
    return h.competition_id?.toLowerCase() === selectedArena.toLowerCase();
  });

  return (
    <section id="highlights" className="section" style={{ position: 'relative', padding: '5.5rem 0 4rem 0' }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div className="section-header center" style={{ marginBottom: '2.5rem' }}>
          <HoloBadge variant="violet" icon={Trophy}>
            ARENA SHOWCASE
          </HoloBadge>
          <h2 className="heading-section">
            COMPETITION HIGHLIGHTS
          </h2>
          <p className="section-lead">
            Celebrating standout problem solvers, verified results, and visionary concepts across Codeathon and Ideathon.
          </p>

          {/* Arena Switcher Tabs */}
          <div
            style={{
              display: 'inline-flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginTop: '1.25rem',
              background: 'rgba(8, 10, 9, 0.7)',
              padding: '0.35rem 0.5rem',
              borderRadius: '9999px',
              border: '1px solid var(--border-subtle, rgba(57, 255, 136, 0.15))',
            }}
          >
            <button
              onClick={() => setSelectedArena('all')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 1.15rem',
                borderRadius: '9999px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: selectedArena === 'all' ? '1px solid #39FF88' : '1px solid transparent',
                background: selectedArena === 'all' ? 'rgba(57, 255, 136, 0.15)' : 'transparent',
                color: selectedArena === 'all' ? '#39FF88' : 'var(--text-muted, #94A3B8)',
                transition: 'all 0.2s ease',
              }}
            >
              ALL ARENAS ({highlights.length})
            </button>

            <button
              onClick={() => setSelectedArena('codeathon')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 1.15rem',
                borderRadius: '9999px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: selectedArena === 'codeathon' ? '1px solid #39FF88' : '1px solid transparent',
                background: selectedArena === 'codeathon' ? 'rgba(57, 255, 136, 0.15)' : 'transparent',
                color: selectedArena === 'codeathon' ? '#39FF88' : 'var(--text-muted, #94A3B8)',
                transition: 'all 0.2s ease',
              }}
            >
              <Terminal size={14} />
              CODEATHON ({codeathonHighlights.length})
            </button>

            <button
              onClick={() => setSelectedArena('ideathon')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 1.15rem',
                borderRadius: '9999px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: selectedArena === 'ideathon' ? '1px solid #F5C451' : '1px solid transparent',
                background: selectedArena === 'ideathon' ? 'rgba(245, 196, 81, 0.18)' : 'transparent',
                color: selectedArena === 'ideathon' ? '#F5C451' : 'var(--text-muted, #94A3B8)',
                transition: 'all 0.2s ease',
              }}
            >
              <Sparkles size={14} />
              IDEATHON ({ideathonHighlights.length})
            </button>

            <button
              onClick={() => setSelectedArena('hackathon')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 1.15rem',
                borderRadius: '9999px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: selectedArena === 'hackathon' ? '1px solid #81C14B' : '1px solid transparent',
                background: selectedArena === 'hackathon' ? 'rgba(129, 193, 75, 0.18)' : 'transparent',
                color: selectedArena === 'hackathon' ? '#81C14B' : 'var(--text-muted, #94A3B8)',
                transition: 'all 0.2s ease',
              }}
            >
              <Award size={14} />
              HACKATHON ({hackathonHighlights.length})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '1.75rem',
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: '280px',
                  borderRadius: '16px',
                  background: 'rgba(11, 23, 17, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  animation: 'pulse 1.5s infinite',
                }}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredList.length === 0 && (
          <div
            style={{
              maxWidth: '650px',
              margin: '0 auto',
              background: 'linear-gradient(145deg, rgba(11, 23, 17, 0.7) 0%, rgba(8, 10, 9, 0.9) 100%)',
              border: '1px dashed rgba(57, 255, 136, 0.2)',
              borderRadius: '16px',
              padding: '3.5rem 2rem',
              textAlign: 'center',
            }}
          >
            <Trophy size={44} style={{ color: 'rgba(57, 255, 136, 0.4)', margin: '0 auto 1rem auto', display: 'block' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#FFFFFF', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Highlights In Evaluation
            </h3>
            <p style={{ color: 'var(--color-text-secondary, #94A3B8)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto', lineHeight: 1.6 }}>
              {selectedArena === 'codeathon'
                ? 'Official Codeathon algorithmic arena highlights and verified winners will be published here.'
                : selectedArena === 'ideathon'
                ? 'Ideathon pitch winners, top innovation concepts, and team highlights will be published here.'
                : 'Verified results and standout team highlights will appear here as evaluations conclude.'}
            </p>
          </div>
        )}

        {/* Highlights Cards Grid */}
        {!loading && filteredList.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '1.75rem',
            }}
          >
            {filteredList.map((item) => {
              const isCodeathon = item.competition_id?.toLowerCase() === 'codeathon';
              const accentColor = isCodeathon ? '#39FF88' : '#C084FC';
              const badgeBorder = isCodeathon ? 'rgba(57, 255, 136, 0.4)' : 'rgba(168, 85, 247, 0.4)';
              const badgeBg = isCodeathon ? 'rgba(57, 255, 136, 0.12)' : 'rgba(168, 85, 247, 0.15)';
              const cardBorder = isCodeathon ? 'rgba(57, 255, 136, 0.25)' : 'rgba(168, 85, 247, 0.28)';

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'linear-gradient(155deg, rgba(11, 23, 17, 0.92) 0%, #080A09 100%)',
                    border: `1px solid ${cardBorder}`,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: isCodeathon
                      ? '0 12px 30px -10px rgba(0, 0, 0, 0.7), 0 0 15px rgba(57, 255, 136, 0.05)'
                      : '0 12px 30px -10px rgba(0, 0, 0, 0.7), 0 0 15px rgba(168, 85, 247, 0.06)',
                    transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = isCodeathon ? 'rgba(57, 255, 136, 0.5)' : 'rgba(168, 85, 247, 0.55)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = cardBorder;
                  }}
                >
                  {/* Attached Photograph (if any) */}
                  {item.image_url && (
                    <div
                      onClick={() => setLightboxImage(item.image_url)}
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '190px',
                        overflow: 'hidden',
                        background: '#0B1711',
                        cursor: 'pointer',
                      }}
                    >
                      <img
                        src={item.image_url}
                        alt={item.title}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'transform 0.3s ease',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '50px',
                          background: 'linear-gradient(to top, #080A09 0%, transparent 100%)',
                        }}
                      />
                    </div>
                  )}

                  {/* Card Content */}
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* Header: Track & Result Badge */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginBottom: '0.85rem',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          color: accentColor,
                          textTransform: 'uppercase',
                        }}
                      >
                        {isCodeathon ? <Terminal size={13} /> : <Sparkles size={13} />}
                        {isCodeathon ? 'CODEATHON ARENA' : 'IDEATHON ARENA'}
                      </span>

                      {item.result_badge && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.22rem 0.6rem',
                            borderRadius: '4px',
                            background: badgeBg,
                            color: accentColor,
                            border: `1px solid ${badgeBorder}`,
                            textTransform: 'uppercase',
                          }}
                        >
                          <Award size={11} />
                          {item.result_badge}
                        </span>
                      )}
                    </div>

                    {/* Team Name (if any) */}
                    {item.team_name && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.78rem',
                          color: 'var(--text-muted, #94A3B8)',
                          marginBottom: '0.35rem',
                        }}
                      >
                        <Users size={12} />
                        <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{item.team_name}</span>
                      </div>
                    )}

                    {/* Highlight Title */}
                    <h3
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        margin: '0 0 0.5rem 0',
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                        lineHeight: 1.3,
                      }}
                    >
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p
                      style={{
                        fontSize: '0.88rem',
                        lineHeight: 1.6,
                        color: '#CBD5E1',
                        margin: '0 0 1rem 0',
                        flex: 1,
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lightbox for Highlight Image */}
        {lightboxImage && (
          <div
            onClick={() => setLightboxImage(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0, 0, 0, 0.92)',
              backdropFilter: 'blur(14px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
            }}
          >
            <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '85vh' }}>
              <button
                onClick={() => setLightboxImage(null)}
                aria-label="Close Preview"
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '0',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
              <img
                src={lightboxImage}
                alt="Highlight preview"
                style={{
                  maxWidth: '90vw',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: '10px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
