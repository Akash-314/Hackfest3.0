import React, { useState, useEffect } from 'react';
import { Megaphone, AlertCircle, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { eventService } from '../services/eventService';

export default function AnnouncementTicker() {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    eventService.getAnnouncements().then((data) => {
      if (isMounted && Array.isArray(data)) {
        setAnnouncements(data.filter((a) => a.published !== false));
      }
    });
    return () => { isMounted = false; };
  }, []);

  if (dismissed || !announcements || announcements.length === 0) {
    return null;
  }

  const current = announcements[currentIndex] || announcements[0];
  const isUrgent = current.priority === 'urgent' || current.priority === 'high';

  return (
    <div
      className="public-announcement-ticker"
      style={{
        position: 'relative',
        zIndex: 50,
        background: isUrgent
          ? 'linear-gradient(90deg, rgba(143, 48, 53, 0.95) 0%, rgba(30, 20, 25, 0.95) 100%)'
          : 'linear-gradient(90deg, rgba(17, 24, 39, 0.95) 0%, rgba(10, 15, 30, 0.95) 100%)',
        borderBottom: `1px solid ${isUrgent ? 'var(--color-muted-crimson)' : 'rgba(0, 191, 255, 0.4)'}`,
        padding: '0.55rem 1rem',
        boxShadow: isUrgent ? '0 0 15px rgba(230, 36, 41, 0.3)' : '0 0 15px rgba(0, 191, 255, 0.2)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          maxWidth: '1280px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, overflow: 'hidden' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: isUrgent ? 'var(--color-energy-red)' : 'var(--color-arc-blue)',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              padding: '0.2rem 0.55rem',
              borderRadius: '2px',
              letterSpacing: '0.08em',
              flexShrink: 0,
            }}
          >
            {isUrgent ? <AlertCircle size={12} /> : <Megaphone size={12} />}
            {current.priority ? current.priority.toUpperCase() : 'UPDATE'}
          </span>

          <div
            style={{
              fontSize: '0.85rem',
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <strong style={{ color: isUrgent ? '#FFD700' : 'var(--color-arc-blue)' }}>
              {current.title}:
            </strong>
            <span style={{ color: 'var(--color-warm-off-white)' }}>
              {current.message}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {announcements.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <button
                onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : announcements.length - 1))}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}
                aria-label="Previous announcement"
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#64748B' }}>
                {currentIndex + 1}/{announcements.length}
              </span>
              <button
                onClick={() => setCurrentIndex((prev) => (prev < announcements.length - 1 ? prev + 1 : 0))}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}
                aria-label="Next announcement"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          <button
            onClick={() => setDismissed(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Dismiss announcement banner"
            aria-label="Dismiss announcement banner"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
