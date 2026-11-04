import React, { useState, useEffect } from 'react';
import { Trophy, Award, CheckCircle, Clock, AlertTriangle, ShieldCheck, ExternalLink, Sparkles, Pin } from 'lucide-react';
import HoloBadge from './ui/HoloBadge';
import { eventService } from '../services/eventService';
import { highlightsService } from '../services/highlightsService';

export default function ResultsAndNoticesSection() {
  const [announcements, setAnnouncements] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);

  // Competition results state
  // Notice requirement: Do not treat competition completion as result declaration.
  // Codeathon & Ideathon are completed, but results are awaited unless admin explicitly publishes verified winner highlights.
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      eventService.getAnnouncements(),
      highlightsService.getHighlights('all'),
    ]).then(([annData, highData]) => {
      if (isMounted) {
        setAnnouncements(annData || []);
        setHighlights(highData || []);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const verifiedCodeathonResults = highlights.filter(
    (h) => h.competition_id?.toLowerCase() === 'codeathon' && h.team_name && h.result_badge
  );

  const verifiedIdeathonResults = highlights.filter(
    (h) => h.competition_id?.toLowerCase() === 'ideathon' && h.team_name && h.result_badge
  );

  const verifiedHackathonResults = highlights.filter(
    (h) => h.competition_id?.toLowerCase() === 'hackathon' && h.team_name && h.result_badge
  );


  const officialWinners = {
    hackathon: [
      { team_name: 'Brainstormer', result_badge: '1st Place (Champion)', title: 'Flagship Hackathon Winner' },
      { team_name: 'InnoVex', result_badge: '2nd Place (1st Runner-Up)', title: 'Flagship Hackathon Runner-up' },
      { team_name: 'Inn0v8', result_badge: '3rd Place (2nd Runner-Up)', title: 'Flagship Hackathon Second Runner-up' },
      { team_name: 'Mind Cluster', result_badge: 'Emerging Team', title: 'Jury Commendation Recognition' },
    ],
    codeathon: [
      { team_name: 'Nitin Gupta', result_badge: '1st Place (Champion)', title: 'Solo Algorithmic Champion' },
      { team_name: 'Krish Jaiswal', result_badge: '2nd Place (1st Runner-Up)', title: 'Algorithmic 1st Runner-up' },
      { team_name: 'Pramod Yadav', result_badge: '3rd Place (2nd Runner-Up)', title: 'Algorithmic 2nd Runner-up' },
    ],
    ideathon: [
      { team_name: 'EVVA', result_badge: '1st Place (Champion)', title: 'Innovation Pitch Champion' },
      { team_name: 'Innova', result_badge: '2nd Place (1st Runner-Up)', title: 'Innovation Pitch 1st Runner-up' },
      { team_name: 'Tech Titans', result_badge: '3rd Place (2nd Runner-Up)', title: 'Innovation Pitch 2nd Runner-up' },
    ],
  };

  const competitionsStatusList = [
    {
      id: 'hackathon',
      name: 'HACKATHON',
      eventStatus: 'COMPLETED',
      resultsStatus: 'RESULTS PUBLISHED',
      results: officialWinners.hackathon,
      desc: 'Flagship 2-day prototype build sprint & stage demonstration.',
      color: '#39FF88',
    },
    {
      id: 'codeathon',
      name: 'CODEATHON',
      eventStatus: 'COMPLETED',
      resultsStatus: 'RESULTS PUBLISHED',
      results: officialWinners.codeathon,
      desc: '1.5-hour algorithmic speed contest held at Computer Centre.',
      color: '#63E6D1',
    },
    {
      id: 'ideathon',
      name: 'IDEATHON',
      eventStatus: 'COMPLETED',
      resultsStatus: 'RESULTS PUBLISHED',
      results: officialWinners.ideathon,
      desc: 'Disruptive innovation pitching session evaluated in Lab 02.',
      color: '#F5C451',
    },
  ];

  return (
    <section id="results" className="section" style={{ position: 'relative', padding: '5rem 0 4rem 0' }}>
      <div className="section-transition-top" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Section Header */}
        <div className="section-header center" style={{ marginBottom: '2.75rem' }}>
          <HoloBadge variant="gold" icon={Trophy}>
            LEADERBOARD & NOTICES
          </HoloBadge>
          <h2 className="heading-section">
            ANNOUNCEMENTS & RESULTS
          </h2>
          <p className="section-lead">
            Official announcements, schedule notices, and verified competition outcomes. Results are published only after formal jury and admin verification.
          </p>
        </div>

        {/* 1. Official Announcements Callout (if any active announcements exist) */}
        {announcements.length > 0 && (
          <div style={{ marginBottom: '3.5rem' }}>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                color: '#FFFFFF',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Pin size={18} color="#39FF88" />
              LATEST OFFICIAL NOTICES
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  style={{
                    position: 'relative',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '12px',
                    background: ann.priority === 'urgent' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(11, 23, 17, 0.7)',
                    border: ann.priority === 'urgent' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(57, 255, 136, 0.2)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        background: ann.priority === 'urgent' ? '#EF4444' : 'rgba(57, 255, 136, 0.15)',
                        color: ann.priority === 'urgent' ? '#fff' : '#39FF88',
                        fontWeight: 700,
                      }}
                    >
                      {ann.priority === 'urgent' ? 'URGENT NOTICE' : 'OFFICIAL NOTICE'}
                    </span>
                    {ann.created_at && (
                      <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                        {new Date(ann.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: '#fff', marginBottom: '0.35rem' }}>
                    {ann.title}
                  </h4>
                  <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    {ann.message || ann.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Three Competition Status & Results Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {competitionsStatusList.map((comp) => {
            const isPublished = comp.resultsStatus === 'RESULTS PUBLISHED';
            return (
              <div
                key={comp.id}
                style={{
                  position: 'relative',
                  borderRadius: '14px',
                  background: 'rgba(11, 23, 17, 0.75)',
                  border: isPublished ? '1px solid #39FF88' : '1px solid rgba(57, 255, 136, 0.2)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        background: comp.eventStatus === 'COMPLETED' ? 'rgba(57, 255, 136, 0.12)' : 'rgba(245, 196, 81, 0.12)',
                        border: comp.eventStatus === 'COMPLETED' ? '1px solid #39FF88' : '1px solid #F5C451',
                        color: comp.eventStatus === 'COMPLETED' ? '#39FF88' : '#F5C451',
                        fontWeight: 700,
                      }}
                    >
                      {comp.eventStatus}
                    </span>

                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        background: isPublished ? 'rgba(57, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: isPublished ? '1px solid #39FF88' : '1px solid rgba(255, 255, 255, 0.15)',
                        color: isPublished ? '#39FF88' : '#E2E8F0',
                        fontWeight: 600,
                      }}
                    >
                      {comp.resultsStatus}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.35rem',
                      color: '#FFFFFF',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Trophy size={20} color={comp.color} />
                    {comp.name}
                  </h3>

                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {comp.desc}
                  </p>

                  {/* Results Display or Awaited Notice */}
                  {isPublished ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      {comp.results.map((res, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            background: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid rgba(57, 255, 136, 0.25)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '0.9rem' }}>
                              {res.team_name}
                            </span>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.7rem',
                                color: '#F5C451',
                                fontWeight: 700,
                              }}
                            >
                              {res.result_badge}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '0.2rem' }}>
                            {res.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '1rem',
                        borderRadius: '10px',
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: '1px dashed rgba(255, 255, 255, 0.15)',
                        marginBottom: '1.25rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                      }}
                    >
                      <Clock size={18} color="#F5C451" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#F5C451', fontWeight: 700 }}>
                          JURY EVALUATION IN PROGRESS
                        </span>
                        <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                          Competition rounds have concluded. Submissions and scorecards are being verified. Verified winners will be declared here once finalized.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <a
                  href="#winners"
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  <span>VIEW FULL PODIUM</span>
                </a>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

