import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { eventService } from '../services/eventService';
import { Trophy, ArrowLeft, Award, Lock, Zap, Star, Loader2 } from 'lucide-react';
import { eventMeta } from '../data/eventData';
import HudPanel from '../components/ui/HudPanel';
import SuperheroPanel from '../components/ui/SuperheroPanel';
import HoloBadge from '../components/ui/HoloBadge';

export default function LeaderboardPage() {
  const [published, setPublished] = useState(false);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      const cfg = await eventService.getSettings();
      setPublished(Boolean(cfg.leaderboardPublished));

      if (isSupabaseConfigured && cfg.leaderboardPublished) {
        try {
          const { data: rpcData, error: rpcErr } = await supabase.rpc('get_leaderboard');
          if (!rpcErr && Array.isArray(rpcData) && rpcData.length > 0) {
            const mapped = rpcData.map((sub) => ({
              id: sub.submission_id,
              title: sub.title,
              team: { name: sub.team_name },
              competition: { name: sub.competition_name },
              avgScore: Number(sub.average_score) || 0,
            }));
            setStandings(mapped);
            setLoading(false);
            return;
          }
        } catch {
          // Fallback to direct query
        }

        const { data } = await supabase
          .from('submissions')
          .select('*, team:teams(name), competition:competitions(name), scores:scores(score)')
          .eq('status', 'evaluated');

        const scored = (data || []).map((sub) => {
          const count = sub.scores?.length || 0;
          const avg = count > 0 ? sub.scores.reduce((a, b) => a + Number(b.score || 0), 0) / count : 0;
          return { ...sub, avgScore: avg };
        });

        scored.sort((a, b) => b.avgScore - a.avgScore);
        setStandings(scored);
      }
      setLoading(false);
    }
    loadLeaderboard();
  }, []);

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 2.5rem)', paddingBottom: '6rem', position: 'relative' }}>
      <div className="container" style={{ maxWidth: '1020px', position: 'relative', zIndex: 10 }}>
        <Link
          to="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-arc-blue)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.08em', marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={16} />
          RETURN TO COMMAND BASE
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <HoloBadge variant="gold" icon={Trophy} style={{ marginBottom: '0.8rem' }}>
            OFFICIAL STANDINGS
          </HoloBadge>
          <h1 className="heading-display marvel-section-title" style={{ fontSize: 'clamp(2.6rem, 5vw, 4.4rem)', marginBottom: '0.4rem', color: '#FFFFFF' }}>
            EVENT LEADERBOARD
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem', maxWidth: '640px', lineHeight: '1.6' }}>
            Official standings, jury ratings, and verified honors compiled across all competitions of {eventMeta.name}.
          </p>
        </div>

        {loading ? (
          <HudPanel variant="cyan" tag="LOADING STANDINGS" scan={true}>
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Loader2 size={36} color="var(--color-arc-blue)" className="animate-spin" />
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#F5F7FA', letterSpacing: '0.05em' }}>
                LOADING LEADERBOARD...
              </div>
            </div>
          </HudPanel>
        ) : !published ? (
          <HudPanel variant="gold" tag="STATUS // RESULTS PENDING" scan={true}>
            <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(245, 182, 66, 0.15)', border: '1px solid var(--color-stark-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--color-stark-gold)', boxShadow: '0 0 25px rgba(245, 182, 66, 0.3)' }}>
                <Lock size={32} />
              </div>
              <h2 className="heading-display" style={{ fontSize: '2rem', marginBottom: '0.6rem', color: '#F5F7FA' }}>
                RANKINGS NOT YET PUBLISHED
              </h2>
              <p style={{ color: '#94A3B8', maxWidth: '560px', margin: '0 auto 1.8rem auto', lineHeight: '1.6', fontSize: '0.96rem' }}>
                Final scores are being compiled by the judges. Standings will be announced live during the Awards Ceremony in the Multipurpose Hall.
              </p>
              <Link to="/schedule" className="btn btn-reactor" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                <Zap size={16} />
                VIEW EVENT SCHEDULE
              </Link>
            </div>
          </HudPanel>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Top 3 Podium Highlights */}
            {standings.length >= 3 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem', marginBottom: '1.5rem' }}>
                {/* 1st Place */}
                <SuperheroPanel variant="gold" tag="#1 CHAMPION" issueNumber="1ST" className="podium-top-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.6rem' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '4px', background: 'rgba(245, 182, 66, 0.2)', border: '1px solid var(--color-stark-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-stark-gold)' }}>
                      <CrownIcon />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-stark-gold)', letterSpacing: '0.1em' }}>#1 CHAMPION</div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#FFFFFF', fontWeight: 700 }}>{standings[0]?.title}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94A3B8' }}>{standings[0]?.team?.name || 'Individual Participant'}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid rgba(245, 182, 66, 0.2)', paddingTop: '0.6rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#64748B' }}>{standings[0]?.competition?.name}</span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--color-stark-gold)', fontWeight: 700 }}>{standings[0]?.avgScore.toFixed(1)}</span>
                  </div>
                </SuperheroPanel>

                {/* 2nd Place */}
                <SuperheroPanel variant="blue" tag="#2 RUNNER-UP" issueNumber="2ND" className="podium-top-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.6rem' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '4px', background: 'rgba(0, 191, 255, 0.2)', border: '1px solid var(--color-arc-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-arc-blue)' }}>
                      <Star size={18} />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-arc-blue)', letterSpacing: '0.1em' }}>#2 RUNNER-UP</div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#FFFFFF', fontWeight: 700 }}>{standings[1]?.title}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94A3B8' }}>{standings[1]?.team?.name || 'Individual Participant'}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid rgba(0, 191, 255, 0.2)', paddingTop: '0.6rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#64748B' }}>{standings[1]?.competition?.name}</span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--color-arc-blue)', fontWeight: 700 }}>{standings[1]?.avgScore.toFixed(1)}</span>
                  </div>
                </SuperheroPanel>

                {/* 3rd Place */}
                <SuperheroPanel variant="red" tag="#3 RUNNER-UP" issueNumber="3RD" className="podium-top-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.6rem' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '4px', background: 'rgba(230, 36, 41, 0.2)', border: '1px solid var(--color-energy-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-energy-red)' }}>
                      <Award size={18} />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-energy-red)', letterSpacing: '0.1em' }}>#3 RUNNER-UP</div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#FFFFFF', fontWeight: 700 }}>{standings[2]?.title}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94A3B8' }}>{standings[2]?.team?.name || 'Individual Participant'}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid rgba(230, 36, 41, 0.2)', paddingTop: '0.6rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#64748B' }}>{standings[2]?.competition?.name}</span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--color-energy-red)', fontWeight: 700 }}>{standings[2]?.avgScore.toFixed(1)}</span>
                  </div>
                </SuperheroPanel>
              </div>
            )}

            {/* Complete Ranking Table */}
            <HudPanel variant="steel" tag="FULL RESULTS & STANDINGS" scan={false}>
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(5, 7, 13, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#94A3B8', letterSpacing: '0.1em' }}>
                      <th style={{ padding: '1rem 1.25rem' }}>RANK</th>
                      <th style={{ padding: '1rem 1.25rem' }}>TEAM & PROJECT</th>
                      <th style={{ padding: '1rem 1.25rem' }}>COMPETITION</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>SCORE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((s, idx) => {
                      const isFirst = idx === 0;
                      const isSecond = idx === 1;
                      const isThird = idx === 2;
                      const rankColor = isFirst ? 'var(--color-stark-gold)' : isSecond ? 'var(--color-arc-blue)' : isThird ? 'var(--color-energy-red)' : '#F5F7FA';

                      return (
                        <tr
                          key={s.id || idx}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            background: isFirst ? 'rgba(245, 182, 66, 0.05)' : isSecond ? 'rgba(0, 191, 255, 0.04)' : isThird ? 'rgba(230, 36, 41, 0.04)' : 'transparent',
                            transition: 'background 0.2s ease'
                          }}
                        >
                          <td style={{ padding: '1.1rem 1.25rem', fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: rankColor, fontWeight: 700 }}>
                            #{idx + 1}
                          </td>
                          <td style={{ padding: '1.1rem 1.25rem' }}>
                            <div style={{ fontWeight: 600, color: '#F5F7FA', fontSize: '1.05rem', fontFamily: 'var(--font-heading)' }}>
                              {s.title}
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#94A3B8' }}>
                              {s.team?.name || 'Individual Participant'}
                            </div>
                          </td>
                          <td style={{ padding: '1.1rem 1.25rem', color: '#64748B', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                            {s.competition?.name || 'FLAGSHIP HACKATHON'}
                          </td>
                          <td style={{ padding: '1.1rem 1.25rem', textAlign: 'right', fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: rankColor, fontWeight: 700 }}>
                            {s.avgScore.toFixed(1)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </HudPanel>
          </div>
        )}
      </div>
    </div>
  );
}

function CrownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  );
}
