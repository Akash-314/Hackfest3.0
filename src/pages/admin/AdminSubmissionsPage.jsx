import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import AdminNav from '../../components/admin/AdminNav';
import { ExternalLink, Video } from 'lucide-react';

const GithubIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase
      .from('submissions')
      .select('*, team:teams(name), competition:competitions(name), problem_category:problem_categories(theme)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setSubmissions(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        <AdminNav />

        <div style={{ marginBottom: '2rem' }}>
          <span className="chapter-badge">DEPLOYMENT LEDGER</span>
          <h2 className="heading-display" style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>
            SUBMITTED ARTIFACTS ({submissions.length})
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Audit all project repositories, live preview URLs, and demo recordings.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
          {submissions.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', background: 'rgba(37, 42, 49, 0.6)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No project submissions recorded yet.
            </div>
          ) : (
            submissions.map((sub) => (
              <div key={sub.id} style={{ background: 'rgba(37, 42, 49, 0.75)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="chapter-badge" style={{ margin: 0 }}>{sub.competition?.name || 'HACKATHON'}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-warm-amber)' }}>{sub.status.toUpperCase()}</span>
                </div>

                <h3 className="heading-display" style={{ fontSize: '1.25rem', color: 'var(--color-warm-off-white)', marginBottom: '0.3rem' }}>
                  {sub.title}
                </h3>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-soft-gray)', marginBottom: '0.8rem' }}>
                  TEAM: {sub.team?.name || 'Individual'} • TRACK: {sub.problem_category?.theme || 'General'}
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.8rem' }}>
                  {sub.github_url && (
                    <a href={sub.github_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-soft-gray)', fontSize: '0.8rem' }}>
                      <GithubIcon size={14} /> Repository
                    </a>
                  )}
                  {sub.demo_url && (
                    <a href={sub.demo_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-steel-blue)', fontSize: '0.8rem' }}>
                      <ExternalLink size={14} /> Demo
                    </a>
                  )}
                  {sub.video_url && (
                    <a href={sub.video_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-warm-amber)', fontSize: '0.8rem' }}>
                      <Video size={14} /> Video
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
