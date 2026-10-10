import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { judgingService } from '../../services/judgingService';
import { ArrowLeft, Scale, ExternalLink, Video, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const GithubIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const DEFAULT_CRITERIA = [
  { id: 'c1', title: 'Problem Understanding', description: 'Grasp of the underlying crisis track and core constraints.', weight: 10 },
  { id: 'c2', title: 'Quality of Solution', description: 'Architecture, algorithmic soundness, and elegance.', weight: 10 },
  { id: 'c3', title: 'Innovation & Novelty', description: 'Originality of the conceptual approach and creative disruption.', weight: 15 },
  { id: 'c4', title: 'Technical Implementation', description: 'Depth of code, data structures, APIs, and stack integration.', weight: 15 },
  { id: 'c5', title: 'Functionality & Stability', description: 'Working prototype validation under live test stress.', weight: 15 },
  { id: 'c6', title: 'Usability & Feasibility', description: 'User experience ergonomics and real-world deployability.', weight: 10 },
  { id: 'c7', title: 'Impact & Relevance', description: 'Meaningful societal or industrial utility in a disrupted landscape.', weight: 10 },
  { id: 'c8', title: 'Scalability Potential', description: 'Capacity to handle concurrency, data volume, and expansion.', weight: 5 },
  { id: 'c9', title: 'Presentation & Live Demo', description: 'Clarity of the pitch, defense handling, and Q&A composure.', weight: 10 },
];

export default function JudgeEvaluatePage() {
  const { submissionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [criteria, setCriteria] = useState(DEFAULT_CRITERIA);
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    judgingService.getSubmissionsForJudge().then((all) => {
      const found = all.find((s) => s.id === submissionId);
      if (found) {
        setSubmission(found);
        if (found.competition_id) {
          judgingService.getJudgingCriteria(found.competition_id).then((critData) => {
            if (critData && critData.length > 0) {
              setCriteria(critData.map((c) => ({
                id: c.code || c.id,
                title: c.title,
                description: c.description,
                weight: Number(c.weight) || 10,
              })));
            }
          });
        }
        // Pre-populate if already scored
        const userScores = {};
        (found.scores || []).forEach((sc) => {
          if (sc.judge_id === user?.id) {
            userScores[sc.criterion_id] = sc.score;
            if (sc.comments) setComments(sc.comments);
          }
        });
        setScores(userScores);
      }
    });
  }, [submissionId, user]);

  const handleScoreChange = (critId, val) => {
    const num = Math.min(100, Math.max(0, Number(val) || 0));
    setScores((prev) => ({ ...prev, [critId]: num }));
  };

  // Calculate weighted aggregate score out of 100
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0) || 100;
  const weightedScore = criteria.reduce((sum, c) => {
    const sc = scores[c.id] || 0;
    return sum + (sc * (c.weight / totalWeight));
  }, 0);

  const handleSave = async (finalize = false) => {
    setSaving(true);
    setError('');

    try {
      if (user) {
        // Save each score row
        for (const c of criteria) {
          const scVal = scores[c.id] !== undefined ? scores[c.id] : 0;
          await judgingService.saveScore({
            submissionId,
            judgeId: user.id,
            criterionId: c.id,
            score: scVal,
            comments,
          });
        }

        if (finalize) {
          await judgingService.finalizeEvaluation(submissionId);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/judge');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to record verdict.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '980px' }}>
        <Link
          to="/judge"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-warm-amber)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={16} />
          RETURN TO JURY CHAMBERS
        </Link>

        {submission && (
          <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.25)', borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2.5rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65)' }}>
            <span className="chapter-badge">PROJECT UNDER REVIEW</span>
            <h1 className="heading-display" style={{ fontSize: '2.2rem', marginBottom: '0.4rem', color: 'var(--color-text-primary)' }}>
              {submission.title}
            </h1>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', color: 'var(--color-arc-cyan)', marginBottom: '1.2rem' }}>
              TEAM: {submission.team?.name || 'Individual'} • TRACK: {submission.problem_category?.theme || 'General'}
            </div>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              {submission.description || 'No project description provided.'}
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {submission.github_url && (
                <a href={submission.github_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
                  <GithubIcon size={16} />
                  REPOSITORY
                </a>
              )}
              {submission.demo_url && (
                <a href={submission.demo_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
                  <ExternalLink size={16} />
                  LIVE DEMO
                </a>
              )}
              {submission.video_url && (
                <a href={submission.video_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
                  <Video size={16} />
                  VIDEO WALKTHROUGH
                </a>
              )}
            </div>
          </div>
        )}

        {/* Evaluation Rubric Grid */}
        <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.25)', borderRadius: 'var(--radius-lg)', padding: 'clamp(1.8rem, 4vw, 2.5rem)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(0, 217, 255, 0.15)' }}>
            <div>
              <span className="chapter-badge">WEIGHTED RUBRIC</span>
              <h2 className="heading-display" style={{ fontSize: '1.6rem', color: 'var(--color-text-primary)' }}>
                SCORECARD (9 DIMENSIONS)
              </h2>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>WEIGHTED COMPOSITE</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: 'var(--color-infinity-gold)' }}>
                {weightedScore.toFixed(1)} <span style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>/ 100</span>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(230, 36, 41, 0.15)', border: '1px solid var(--color-stark-crimson)', borderRadius: 'var(--radius-sm)', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ffb4b7', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{ background: 'rgba(0, 217, 255, 0.12)', border: '1px solid var(--color-arc-cyan)', borderRadius: 'var(--radius-sm)', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--color-arc-cyan)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              <CheckCircle2 size={18} />
              <span>Verdict recorded successfully. Redirecting to chambers...</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2rem' }}>
            {criteria.map((c, idx) => (
              <div key={c.id} style={{ background: 'var(--color-surface-secondary)', border: '1px solid rgba(0, 217, 255, 0.15)', borderRadius: 'var(--radius-sm)', padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: '1', minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-arc-cyan)' }}>
                      0{idx + 1} • {c.weight}% WEIGHT
                    </span>
                  </div>
                  <h4 style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '1.05rem', margin: '0.2rem 0' }}>
                    {c.title}
                  </h4>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{c.description}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={scores[c.id] !== undefined ? scores[c.id] : ''}
                    onChange={(e) => handleScoreChange(c.id, e.target.value)}
                    placeholder="0-100"
                    style={{ width: '90px', padding: '0.65rem', background: '#0d131f', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontFamily: 'var(--font-mono)', fontSize: '1.1rem', textAlign: 'center' }}
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>/ 100</span>
                </div>
              </div>
            ))}
          </div>

          {/* Feedback comments */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-soft-gray)', marginBottom: '0.4rem' }}>
              CONFIDENTIAL JURY CRITIQUE & NOTES
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              placeholder="Constructive technical feedback, architectural strengths, vulnerabilities, defense demeanor..."
              style={{ width: '100%', padding: '0.8rem 1rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontSize: '0.92rem', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={saving}
              onClick={() => handleSave(false)}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : 'SAVE DRAFT VERDICT'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={saving}
              onClick={() => handleSave(true)}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : 'FINALIZE & SUBMIT SCORE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
