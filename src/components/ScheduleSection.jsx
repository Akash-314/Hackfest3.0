import React, { useState, useEffect } from 'react';
import { Clock, MapPin, User, Shield, Zap, Calendar, Sparkles, Loader2, Info } from 'lucide-react';
import { scheduleData as defaultScheduleData } from '../data/eventData';
import { eventService } from '../services/eventService';
import { supabase } from '../lib/supabase';
import HoloBadge from './ui/HoloBadge';
import HudPanel from './ui/HudPanel';

export default function ScheduleSection() {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState(defaultScheduleData);
  const [activeDayKey, setActiveDayKey] = useState('day1');

  useEffect(() => {
    let isMounted = true;
    async function fetchSchedule() {
      setLoading(true);
      try {
        const res = await eventService.getSchedules();
        if (isMounted && res) {
          setSchedule(res);
          // Set first available day as active
          if (Array.isArray(res.days) && res.days.length > 0) {
            setActiveDayKey(res.days[0].key || `day${res.days[0].dayNumber}`);
          }
        }
      } catch (err) {
        console.warn('Failed to load schedule:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchSchedule();

    // Subscribe to realtime database changes for schedules
    const channel = supabase
      ?.channel('public:schedules_realtime')
      ?.on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, () => {
        fetchSchedule();
      })
      ?.subscribe();

    return () => {
      isMounted = false;
      if (channel) supabase?.removeChannel(channel);
    };
  }, []);

  // Determine active day object
  const daysList = Array.isArray(schedule.days) && schedule.days.length > 0
    ? schedule.days
    : [
        {
          dayNumber: 1,
          key: 'day1',
          label: 'DAY 01 • INAUGURATION & HACKING SPRINTS',
          date: 'OCTOBER 24, 2026',
          theme: schedule.day1?.theme || defaultScheduleData.day1.theme,
          venue: schedule.day1?.venue || defaultScheduleData.day1.venue,
          items: schedule.day1?.items || defaultScheduleData.day1.items,
        },
        {
          dayNumber: 2,
          key: 'day2',
          label: 'DAY 02 • EVALUATION & AWARDS CEREMONY',
          date: 'OCTOBER 25, 2026',
          theme: schedule.day2?.theme || defaultScheduleData.day2.theme,
          venue: schedule.day2?.venue || defaultScheduleData.day2.venue,
          items: schedule.day2?.items || defaultScheduleData.day2.items,
        },
      ];

  const currentDay = daysList.find((d) => d.key === activeDayKey) || daysList[0] || {};
  const items = currentDay.items || [];

  const day1Milestones = ['CHECK-IN', 'INAUGURATION', 'HACKING SPRINT', 'MENTORSHIP'];
  const day2Milestones = ['SUBMISSIONS', 'EVALUATION', 'FINAL PITCHES', 'AWARDS'];
  const currentMilestones = currentDay.dayNumber === 1 ? day1Milestones : day2Milestones;

  return (
    <section id="schedule" className="section schedule-section superhero-timeline-section">
      <div className="section-transition-top" />
      <div className="container">
        {/* Header */}
        <div className="section-header center">
          <HoloBadge variant="cyan" icon={Clock}>
            EVENT TIMELINE // INDIAN STANDARD TIME (IST)
          </HoloBadge>
          <h2 className="heading-section marvel-section-title">EVENT AGENDA & SCHEDULE</h2>
          <p className="section-lead">
            Official chronological itinerary for HackFest 3.0. Live updates synchronized with the organizing committee.
          </p>
        </div>

        {/* Phase Pipeline Bar */}
        {currentMilestones && currentMilestones.length > 0 && (
          <div className="superhero-phase-bar">
            {currentMilestones.map((m, idx) => (
              <React.Fragment key={idx}>
                <div className="superhero-phase-step">
                  <span className="phase-step-num">0{idx + 1}</span>
                  <span className="phase-step-name">{m}</span>
                </div>
                {idx < currentMilestones.length - 1 && (
                  <span className="phase-step-arrow">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Dynamic Day Switcher Hub */}
        <div className="schedule-tabs stark-schedule-tabs" style={{ marginTop: '2rem' }}>
          {daysList.map((day) => {
            const isActive = activeDayKey === day.key;
            return (
              <button
                key={day.key}
                className={`schedule-tab-btn stark-tab-btn ${isActive ? 'active stark-tab-active' : ''}`}
                onClick={() => setActiveDayKey(day.key)}
              >
                <span
                  className="stark-tab-indicator"
                  style={{
                    background: day.dayNumber === 2 ? 'var(--color-stark-crimson)' : 'var(--color-arc-cyan)',
                  }}
                />
                {day.label}
              </button>
            );
          })}
        </div>

        {/* Day Header Info */}
        <div className="stark-schedule-meta-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {currentDay.theme && (
              <div className="stark-schedule-theme-tag" style={{ color: 'var(--color-infinity-gold)', fontWeight: 700 }}>
                THEME: {currentDay.theme.toUpperCase()}
              </div>
            )}
            {currentDay.date && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-arc-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                <Calendar size={13} />
                <span>{currentDay.date}</span>
              </div>
            )}
          </div>
          {currentDay.venue && (
            <div className="stark-schedule-venue-tag">
              <MapPin size={14} color="var(--color-arc-cyan)" />
              <span>VENUE: {currentDay.venue}</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <Loader2 size={36} color="var(--color-arc-cyan)" className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              RETRIEVING LATEST MISSION ITINERARY...
            </div>
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <HudPanel variant="cyan" tag="STATUS // SCHEDULE PENDING" scan={true}>
            <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
              <Clock size={40} color="var(--color-arc-cyan)" style={{ margin: '0 auto 1rem auto', opacity: 0.8 }} />
              <h3 className="heading-display" style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.6rem' }}>
                NO SESSIONS PUBLISHED FOR THIS DAY YET
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: '520px', margin: '0 auto', fontSize: '0.9rem', lineHeight: '1.6' }}>
                The organizing committee is actively finalizing session timings and venue allocations. Please check back shortly or review announcements.
              </p>
            </div>
          </HudPanel>
        ) : (
          /* Futuristic Timeline Stream */
          <div className="timeline-stream stark-timeline-stream">
            <div className="stark-conduit-line" />

            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className={`timeline-card stark-timeline-card ${item.highlight ? 'stark-timeline-highlight' : ''}`}
              >
                <div className="timeline-step stark-timeline-node">
                  <span className="stark-node-inner">{item.order || String(idx + 1).padStart(2, '0')}</span>
                </div>

                <div className="timeline-info stark-timeline-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                    <h3 className="timeline-title stark-timeline-title" style={{ margin: 0 }}>
                      {item.title}
                    </h3>

                    {/* Category / Badge */}
                    {item.category && item.category !== 'General' && (
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.68rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '3px',
                          background: 'rgba(0, 217, 255, 0.12)',
                          border: '1px solid rgba(0, 217, 255, 0.35)',
                          color: 'var(--color-arc-cyan)',
                          letterSpacing: '0.05em',
                          fontWeight: 600,
                        }}
                      >
                        {item.category.toUpperCase()}
                      </span>
                    )}

                    {item.badge && item.badge !== item.category && (
                      <HoloBadge variant={item.highlight ? 'gold' : 'cyan'}>
                        {item.badge}
                      </HoloBadge>
                    )}

                    {item.highlight && (
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.65rem',
                          color: 'var(--color-infinity-gold)',
                          background: 'rgba(245, 196, 81, 0.15)',
                          border: '1px solid rgba(245, 196, 81, 0.4)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '3px',
                          fontWeight: 700,
                        }}
                      >
                        KEY EVENT
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="timeline-desc stark-timeline-desc">
                      {item.description}
                    </p>
                  )}

                  {/* Speaker and Location Details */}
                  <div style={{ display: 'flex', gap: '1.2rem', marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--color-text-secondary)', flexWrap: 'wrap' }}>
                    {item.location && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={13} color="var(--color-arc-cyan)" />
                        {item.location}
                      </span>
                    )}
                    {item.speaker && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <User size={13} color="var(--color-infinity-gold)" />
                        {item.speaker}
                      </span>
                    )}
                  </div>

                  {/* Dignitaries if Opening Ceremony / Motivational Address */}
                  {Array.isArray(item.dignitaries) && item.dignitaries.length > 0 && (
                    <div className="timeline-dignitaries stark-dignitaries-row" style={{ marginTop: '0.75rem' }}>
                      {item.dignitaries.map((dig, dIdx) => (
                        <span key={dIdx} className="dignitary-badge stark-dig-badge">
                          <User size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          {dig.name} ({dig.role})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="timeline-time-badge stark-time-beacon">
                  <Clock size={13} style={{ display: 'inline', marginRight: '6px' }} />
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
