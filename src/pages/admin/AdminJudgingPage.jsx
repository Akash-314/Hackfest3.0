import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import AdminNav from '../../components/admin/AdminNav';
import { Scale, Trophy, CheckCircle2 } from 'lucide-react';

export default function AdminJudgingPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase
      .from('submissions')
      .select(`
        *,
        team:teams(name),
        competition:competitions(name),
        problem_category:problem_categories(theme),
        scores:scores(id, score, judge:profiles(full_name))
      `)
      .order('submitted_at', { ascending: false })
      .then(({ data }) => {
        // Calculate average score for each submission
        const withAggregates = (data || []).map((sub) => {
          const scoreCount = sub.scores?.length || 0;
          const avg = scoreCount > 0
            ? sub.scores.reduce((sum, s) => sum + Number(s.score || 0), 0) / scoreCount
            : 0;
          return { ...sub, averageScore: avg, evaluationCount: scoreCount };
        });

        // Sort descending by average score for leaderboard preview
        withAggregates.sort((a, b) => b.averageScore - a.averageScore);
        setSubmissions(withAggregates);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        <AdminNav />

        <div style={{ marginBottom: '2rem' }}>
          <span className="chapter-badge">VERDICT INTELLIGENCE</span>
          <h2 className="heading-display" style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>
            JUDGING PROGRESS & SCORE COMPILATION
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Consolidated jury evaluation scores and rank ordering across all competitions.
          </p>
        </div>

        <div style={{ background: 'rgba(37, 42, 49, 0.75)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: '#111827', borderBottom: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-warm-amber)' }}>
                <th style={{ padding: '1rem' }}>RANK</th>
                <th style={{ padding: '1rem' }}>PROJECT TITLE</th>
                <th style={{ padding: '1rem' }}>TEAM</th>
                <th style={{ padding: '1rem' }}>EVALUATIONS</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>SCORE (AVG)</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No evaluations compiled yet.
                  </td>
                </tr>
              ) : (
                submissions.map((sub, idx) => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: idx === 0 ? 'var(--color-warm-amber)' : 'var(--color-soft-gray)' }}>
                      #{idx + 1}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-warm-off-white)' }}>
                      {sub.title}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {sub.team?.name || 'Individual'}
                    </td>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-soft-gray)' }}>
                      {sub.evaluationCount} score sheet(s)
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: sub.averageScore > 0 ? 'var(--color-warm-amber)' : 'var(--text-muted)' }}>
                      {sub.averageScore > 0 ? sub.averageScore.toFixed(1) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
