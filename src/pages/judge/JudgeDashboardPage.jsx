import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { judgingService } from '../../services/judgingService';
import { Scale, ShieldCheck, ExternalLink, ArrowUpRight, Award, CheckCircle2, Clock } from 'lucide-react';
import { eventMeta } from '../../data/eventData';

const GithubIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function JudgeDashboardPage() {
  const { profile } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    judgingService.getSubmissionsForJudge().then((data) => {
      setSubmissions(data);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 2rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <span className="chapter-badge">JURY CHAMBERS</span>
            <h1 className="heading-display" style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', marginBottom: '0.3rem' }}>
              JUDGING CONSOLE
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Welcome, <strong>{profile?.full_name || 'Jury Member'}</strong>. Evaluate submitted systems against the official 9-dimension rubric.
            </p>
          </div>

          <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.35)', borderRadius: 'var(--radius-sm)', padding: '0.8rem 1.2rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-arc-cyan)', boxShadow: '0 0 15px rgba(0, 217, 255, 0.1)' }}>
            ASSIGNED PROJECTS: {submissions.length}
          </div>
        </div>

        {submissions.length === 0 ? (
          <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.2)', borderRadius: 'var(--radius-md)', padding: '3.5rem 1.5rem', textAlign: 'center', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)' }}>
            <Clock size={48} color="var(--color-arc-cyan)" style={{ margin: '0 auto 1.2rem auto' }} />
            <h3 className="heading-display" style={{ fontSize: '1.4rem', marginBottom: '0.6rem', color: 'var(--color-text-primary)' }}>
              NO SUBMISSIONS QUEUED FOR EVALUATION
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>
              Projects submitted by participant teams on Day 2 will appear here in real-time.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
            {submissions.map((sub) => {
              const isEvaluated = sub.status === 'evaluated';
              return (
                <div key={sub.id} style={{ background: 'var(--color-surface-elevated)', border: `1px solid ${isEvaluated ? 'var(--color-infinity-gold)' : 'rgba(0, 217, 255, 0.25)'}`, borderRadius: 'var(--radius-md)', padding: '1.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <span className="chapter-badge" style={{ margin: 0 }}>
                        {sub.competition?.name || 'HACKATHON'}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: isEvaluated ? 'var(--color-warm-amber)' : 'var(--color-soft-gray)' }}>
                        {sub.status.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="heading-display" style={{ fontSize: '1.3rem', color: 'var(--color-warm-off-white)', marginBottom: '0.4rem' }}>
                      {sub.title}
                    </h3>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-warm-amber)', marginBottom: '0.8rem' }}>
                      TEAM: {sub.team?.name || 'Individual'} • TRACK: {sub.problem_category?.theme || 'General Track'}
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '1.2rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {sub.description || 'No system overview provided.'}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                      {sub.github_url && (
                        <a href={sub.github_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-soft-gray)', fontSize: '0.82rem' }}>
                          <GithubIcon size={15} />
                          Repository
                        </a>
                      )}
                      {sub.demo_url && (
                        <a href={sub.demo_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-steel-blue)', fontSize: '0.82rem' }}>
                          <ExternalLink size={15} />
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/judge/evaluate/${sub.id}`}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.84rem' }}
                  >
                    <Scale size={16} />
                    {isEvaluated ? 'REVIEW SCORECARD' : 'ENTER EVALUATION RUBRIC'}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
