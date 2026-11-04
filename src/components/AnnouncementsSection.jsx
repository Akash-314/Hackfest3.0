import React, { useState, useEffect } from 'react';
import { Bell, Pin, AlertTriangle, Clock, Radio, CheckCircle, ExternalLink, Filter } from 'lucide-react';
import HoloBadge from './ui/HoloBadge';
import { eventService } from '../services/eventService';

function formatAnnouncementDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

// Convert plain URLs in text into clickable links
function renderFormattedMessage(text) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--color-primary, #39FF88)',
            textDecoration: 'underline',
            wordBreak: 'break-all',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.2rem',
          }}
        >
          {part}
          <ExternalLink size={12} />
        </a>
      );
    }
    return part;
  });
}

export default function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'pinned' | 'urgent'

  useEffect(() => {
    let isMounted = true;
    eventService.getAnnouncements().then((data) => {
      if (isMounted) {
        setAnnouncements(data || []);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const pinnedCount = announcements.filter((a) => a.is_pinned).length;
  const urgentCount = announcements.filter((a) => a.priority === 'urgent').length;

  const filteredAnnouncements = announcements.filter((a) => {
    if (filter === 'pinned') return a.is_pinned;
    if (filter === 'urgent') return a.priority === 'urgent';
    return true;
  });

  return (
    <section id="announcements-feed" className="section" style={{ position: 'relative', padding: '5rem 0 3.5rem 0' }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div className="section-header center" style={{ marginBottom: '2.5rem' }}>
          <HoloBadge variant="crimson" icon={Radio}>
            TRANSMISSION FEED
          </HoloBadge>
          <h2 className="heading-section">
            OFFICIAL ANNOUNCEMENTS
          </h2>
          <p className="section-lead">
            Live notices, schedule updates, and urgent alerts published directly by event organizers.
          </p>

          {/* Filter Pills */}
          {announcements.length > 0 && (
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
                onClick={() => setFilter('all')}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '9999px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: filter === 'all' ? '1px solid #39FF88' : '1px solid transparent',
                  background: filter === 'all' ? 'rgba(57, 255, 136, 0.15)' : 'transparent',
                  color: filter === 'all' ? '#39FF88' : 'var(--text-muted, #94A3B8)',
                  transition: 'all 0.2s ease',
                }}
              >
                ALL ({announcements.length})
              </button>
              {pinnedCount > 0 && (
                <button
                  onClick={() => setFilter('pinned')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 1rem',
                    borderRadius: '9999px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: filter === 'pinned' ? '1px solid #00F0FF' : '1px solid transparent',
                    background: filter === 'pinned' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                    color: filter === 'pinned' ? '#00F0FF' : 'var(--text-muted, #94A3B8)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Pin size={12} />
                  PINNED ({pinnedCount})
                </button>
              )}
              {urgentCount > 0 && (
                <button
                  onClick={() => setFilter('urgent')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 1rem',
                    borderRadius: '9999px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: filter === 'urgent' ? '1px solid #FF3344' : '1px solid transparent',
                    background: filter === 'urgent' ? 'rgba(255, 51, 68, 0.15)' : 'transparent',
                    color: filter === 'urgent' ? '#FF6677' : 'var(--text-muted, #94A3B8)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <AlertTriangle size={12} />
                  URGENT ({urgentCount})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '850px', margin: '0 auto' }}>
            {[1, 2].map((i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(11, 23, 17, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  height: '110px',
                  animation: 'pulse 1.5s infinite',
                }}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAnnouncements.length === 0 && (
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
            <Radio size={42} style={{ color: 'rgba(57, 255, 136, 0.4)', margin: '0 auto 1rem auto', display: 'block' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#FFFFFF', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              No Active Transmissions
            </h3>
            <p style={{ color: 'var(--color-text-secondary, #94A3B8)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto', lineHeight: 1.6 }}>
              {filter !== 'all'
                ? `No announcements match the "${filter.toUpperCase()}" filter.`
                : 'All event systems operational. Real-time updates and schedule notices will appear here.'}
            </p>
          </div>
        )}

        {/* Announcements List */}
        {!loading && filteredAnnouncements.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '900px', margin: '0 auto' }}>
            {filteredAnnouncements.map((ann) => {
              const isUrgent = ann.priority === 'urgent';
              const isPinned = ann.is_pinned;

              let borderColor = 'rgba(57, 255, 136, 0.18)';
              let cardBg = 'linear-gradient(150deg, rgba(11, 23, 17, 0.85) 0%, rgba(8, 10, 9, 0.95) 100%)';

              if (isPinned) {
                borderColor = 'rgba(0, 240, 255, 0.45)';
                cardBg = 'linear-gradient(150deg, rgba(0, 40, 50, 0.4) 0%, rgba(8, 10, 9, 0.98) 100%)';
              } else if (isUrgent) {
                borderColor = 'rgba(230, 36, 41, 0.55)';
                cardBg = 'linear-gradient(150deg, rgba(40, 10, 15, 0.4) 0%, rgba(8, 10, 9, 0.98) 100%)';
              }

              return (
                <div
                  key={ann.id}
                  style={{
                    background: cardBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '14px',
                    padding: 'clamp(1.2rem, 3vw, 1.6rem)',
                    position: 'relative',
                    boxShadow: isPinned
                      ? '0 10px 30px -10px rgba(0, 240, 255, 0.2)'
                      : isUrgent
                      ? '0 10px 30px -10px rgba(230, 36, 41, 0.25)'
                      : '0 8px 24px -10px rgba(0, 0, 0, 0.6)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  {/* Top Meta Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.6rem',
                      marginBottom: '0.85rem',
                      paddingBottom: '0.65rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {/* Pinned Badge */}
                      {isPinned && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            padding: '0.22rem 0.6rem',
                            borderRadius: '4px',
                            background: 'rgba(0, 240, 255, 0.15)',
                            color: '#00F0FF',
                            border: '1px solid rgba(0, 240, 255, 0.4)',
                            textTransform: 'uppercase',
                          }}
                        >
                          <Pin size={11} />
                          PINNED
                        </span>
                      )}

                      {/* Priority Badge */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          padding: '0.22rem 0.6rem',
                          borderRadius: '4px',
                          background: isUrgent
                            ? 'rgba(230, 36, 41, 0.2)'
                            : ann.priority === 'high'
                            ? 'rgba(245, 196, 81, 0.15)'
                            : 'rgba(57, 255, 136, 0.1)',
                          color: isUrgent
                            ? '#FF6677'
                            : ann.priority === 'high'
                            ? '#F5C451'
                            : '#39FF88',
                          border: `1px solid ${
                            isUrgent
                              ? 'rgba(230, 36, 41, 0.45)'
                              : ann.priority === 'high'
                              ? 'rgba(245, 196, 81, 0.4)'
                              : 'rgba(57, 255, 136, 0.25)'
                          }`,
                          textTransform: 'uppercase',
                        }}
                      >
                        {isUrgent && (
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: '#FF3344',
                              boxShadow: '0 0 6px #FF3344',
                            }}
                          />
                        )}
                        {ann.priority || 'NORMAL'}
                      </span>
                    </div>

                    {/* Date/Time */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        color: 'var(--text-muted, #94A3B8)',
                      }}
                    >
                      <Clock size={12} />
                      <span>{formatAnnouncementDate(ann.created_at)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      letterSpacing: '0.03em',
                      textTransform: 'uppercase',
                      margin: '0 0 0.55rem 0',
                    }}
                  >
                    {ann.title}
                  </h3>

                  {/* Message body */}
                  <div
                    style={{
                      fontSize: '0.92rem',
                      lineHeight: 1.65,
                      color: '#CBD5E1',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {renderFormattedMessage(ann.message)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

