import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardNav from '../../components/dashboard/DashboardNav';
import { submissionService } from '../../services/submissionService';
import { teamService } from '../../services/teamService';
import { eventService } from '../../services/eventService';
import { isDeadlineExpired } from '../../utils/eventTime';
import { CheckCircle2, AlertCircle, Loader2, ExternalLink, Video, Lock, FileText, Info } from 'lucide-react';
import { problemCategories } from '../../data/eventData';

const GithubIcon = ({ size = 18, color = 'var(--color-soft-gray)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function DashboardSubmissionPage() {
  const { user, isConfigured } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [eventSettings, setEventSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [submissionId, setSubmissionId] = useState(null);
  const [teamId, setTeamId] = useState('');
  const [competitionId, setCompetitionId] = useState('hackathon');
  const [problemCategoryId, setProblemCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [docUrl, setDocUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const loadData = async () => {
    if (!user) return;
    try {
      const [subs, tms, settings] = await Promise.all([
        submissionService.getUserSubmissions(user.id),
        teamService.getUserTeams(user.id),
        eventService.getSettings(),
      ]);
      setSubmissions(subs);
      setTeams(tms);
      if (settings) setEventSettings(settings);

      if (subs.length > 0) {
        const first = subs[0];
        setSubmissionId(first.id);
        setTeamId(first.team_id || '');
        setCompetitionId(first.competition_id || 'hackathon');
        setProblemCategoryId(first.problem_category_id || '');
        setTitle(first.title || '');
        setDescription(first.description || '');
        setGithubUrl(first.github_url || '');
        setDemoUrl(first.demo_url || '');
        setVideoUrl(first.video_url || '');
        setDocUrl(first.document_url || '');
      } else if (tms.length > 0) {
        setTeamId(tms[0].id);
        setCompetitionId(tms[0].competition_id || 'hackathon');
      }
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSave = async (isFinal = false) => {
    setStatusMsg({ type: '', text: '' });

    if (!title.trim()) {
      setStatusMsg({ type: 'error', text: 'Project title is required.' });
      return;
    }
    if (isFinal && !githubUrl.trim()) {
      setStatusMsg({ type: 'error', text: 'GitHub repository URL is mandatory for final submission.' });
      return;
    }

    setSaving(true);

    try {
      let finalDocUrl = docUrl;

      // Handle file upload if attached
      if (docFile && isConfigured) {
        finalDocUrl = await submissionService.uploadFile(docFile, `doc_${user.id}_${docFile.name}`);
      }

      await submissionService.saveSubmission({
        id: submissionId,
        userId: user.id,
        teamId: teamId || null,
        competitionId,
        problemCategoryId: problemCategoryId || null,
        title: title.trim(),
        description: description.trim(),
        githubUrl: githubUrl.trim(),
        demoUrl: demoUrl.trim(),
        videoUrl: videoUrl.trim(),
        documentUrl: finalDocUrl,
        status: isFinal ? 'submitted' : 'draft',
      });

      setStatusMsg({
        type: 'success',
        text: isFinal ? 'Project submitted successfully for jury evaluation!' : 'Draft saved securely.',
      });
      await loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to record submission.' });
    } finally {
      setSaving(false);
    }
  };

  const currentSubmission = submissions.find((s) => s.id === submissionId);
  const isLocked = currentSubmission?.status === 'submitted' || currentSubmission?.status === 'evaluated';
  const isSubmissionDeadlinePassed = Boolean(
    eventSettings?.submissionDeadline && isDeadlineExpired(eventSettings.submissionDeadline)
  );
  const isSubmissionsClosed = Boolean(
    eventSettings && (eventSettings.pptSubmissionsOpen === false || isSubmissionDeadlinePassed)
  );

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <DashboardNav />

        <div style={{ marginBottom: '2rem' }}>
          <span className="chapter-badge">DEPLOYMENT REPOSITORY</span>
          <h2 className="heading-display" style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>
            PROJECT SUBMISSION PORTAL
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Submit your source repository, deployed demo link, and architectural documentation before the deadline timer.
          </p>
        </div>

        {/* Canonical Submission Settings & Directives Card */}
        {eventSettings && (
          <div style={{
            background: 'rgba(28, 33, 40, 0.85)',
            border: isSubmissionsClosed ? '1px solid var(--border-accent-crimson)' : '1px solid var(--border-accent-steel)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.8rem' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: isSubmissionsClosed ? '#ffb4b7' : 'var(--color-arc-blue)',
                letterSpacing: '0.08em',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <FileText size={14} />
                {isSubmissionsClosed ? 'STATUS: SUBMISSIONS CLOSED' : 'STATUS: SUBMISSIONS OPEN & ACTIVE'}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: 'var(--color-stark-gold)',
                background: 'rgba(245, 182, 66, 0.1)',
                padding: '0.25rem 0.6rem',
                borderRadius: '4px',
                border: '1px solid rgba(245, 182, 66, 0.25)'
              }}>
                DEADLINE: {eventSettings.submissionDeadline || 'OCTOBER 25, 2026, 12:00 PM'}
              </span>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.55', margin: 0 }}>
              {eventSettings.submissionInstructions || 'Submit your slide presentation (PDF or PPTX format, under 25MB) and provide your GitHub repository link.'}
            </p>

            <div style={{ marginTop: '0.75rem', fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              ACCEPTED FORMATS: {eventSettings.acceptedFileTypes || '.pdf,.pptx,.ppt'} • MAX SIZE: {eventSettings.maxFileSizeMb || 25}MB
            </div>
          </div>
        )}

        {isSubmissionsClosed && (
          <div style={{
            background: 'rgba(143, 48, 53, 0.25)',
            border: '1px solid var(--border-accent-crimson)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem 1.3rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            color: '#ffb4b7',
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={22} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, letterSpacing: '0.03em' }}>PPT & FINAL SUBMISSIONS CONCLUDED</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                New final project submissions and slide deck uploads are locked by event administration. Existing drafts and records are preserved.
              </div>
            </div>
          </div>
        )}

        {statusMsg.text && (
          <div style={{ background: statusMsg.type === 'error' ? 'rgba(143, 48, 53, 0.2)' : 'rgba(185, 133, 69, 0.15)', border: `1px solid ${statusMsg.type === 'error' ? 'var(--border-accent-crimson)' : 'var(--border-accent-amber)'}`, borderRadius: 'var(--radius-sm)', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: statusMsg.type === 'error' ? '#ffb4b7' : 'var(--color-warm-amber)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            {statusMsg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Existing Scores & Evaluation if evaluated */}
        {currentSubmission?.scores?.length > 0 && (
          <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-infinity-gold)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65)' }}>
            <h3 className="heading-display" style={{ fontSize: '1.3rem', color: 'var(--color-infinity-gold)', marginBottom: '0.8rem' }}>
              JURY EVALUATION VERDICT
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {currentSubmission.scores.map((sc) => (
                <div key={sc.id} style={{ background: 'var(--color-surface-secondary)', border: '1px solid rgba(245, 196, 81, 0.2)', padding: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{sc.criterion?.title || 'Criterion'}</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-text-primary)' }}>{sc.score} / 100</div>
                  {sc.comments && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.3rem' }}>"{sc.comments}"</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.25)', borderRadius: 'var(--radius-lg)', padding: 'clamp(1.8rem, 4vw, 2.5rem)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65)' }}>
          {isLocked && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(245, 196, 81, 0.12)', border: '1px solid var(--color-infinity-gold)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', color: 'var(--color-infinity-gold)', fontSize: '0.85rem' }}>
              <Lock size={16} />
              <span>Project has been locked for jury evaluation. Updates can only be requested through organizers.</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
            {/* Team association */}
            {teams.length > 0 && (
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-soft-gray)', marginBottom: '0.35rem' }}>
                  SUBMITTING ON BEHALF OF TEAM
                </label>
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  disabled={isLocked}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontSize: '0.92rem' }}
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.competition?.name})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Problem Category */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-soft-gray)', marginBottom: '0.35rem' }}>
                HACKATHON PROBLEM TRACK
              </label>
              <select
                value={problemCategoryId}
                onChange={(e) => setProblemCategoryId(e.target.value)}
                disabled={isLocked}
                style={{ width: '100%', padding: '0.75rem 1rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontSize: '0.92rem' }}
              >
                <option value="">Select Crisis Problem Statement Track</option>
                {problemCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    Track {cat.number} — {cat.theme}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-soft-gray)', marginBottom: '0.35rem' }}>
                PROJECT TITLE *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Project Helios: Decentralized Microgrid Protocol"
                disabled={isLocked}
                required
                style={{ width: '100%', padding: '0.8rem 1rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontSize: '0.92rem' }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-soft-gray)', marginBottom: '0.35rem' }}>
                SYSTEM OVERVIEW & ARCHITECTURE
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe your architecture, tech stack, key APIs, problem solution, and testing validation..."
                disabled={isLocked}
                style={{ width: '100%', padding: '0.8rem 1rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontSize: '0.92rem', resize: 'vertical' }}
              />
            </div>

            {/* Repository & Demo URLs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-soft-gray)', marginBottom: '0.35rem' }}>
                  GITHUB REPOSITORY URL *
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                    <GithubIcon size={18} />
                  </div>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/team/hackfest-project"
                    disabled={isLocked}
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.7rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontSize: '0.92rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-soft-gray)', marginBottom: '0.35rem' }}>
                  LIVE DEMO / DEPLOYED LINK
                </label>
                <div style={{ position: 'relative' }}>
                  <ExternalLink size={18} color="var(--color-soft-gray)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://project.vercel.app"
                    disabled={isLocked}
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.7rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontSize: '0.92rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Video & Documentation */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-soft-gray)', marginBottom: '0.35rem' }}>
                  DEMO VIDEO WALKTHROUGH URL
                </label>
                <div style={{ position: 'relative' }}>
                  <Video size={18} color="var(--color-soft-gray)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtu.be/..."
                    disabled={isLocked}
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.7rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontSize: '0.92rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-soft-gray)', marginBottom: '0.35rem' }}>
                  SLIDE DECK / DOCUMENT ({eventSettings?.acceptedFileTypes || 'PDF / PPTX'})
                </label>
                <input
                  type="file"
                  accept={eventSettings?.acceptedFileTypes || '.pdf,.ppt,.pptx,.doc,.docx'}
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  disabled={isLocked || isSubmissionsClosed}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    background: '#111827',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-soft-gray)',
                    fontSize: '0.85rem',
                    opacity: isSubmissionsClosed ? 0.6 : 1,
                    cursor: isSubmissionsClosed ? 'not-allowed' : 'pointer'
                  }}
                />
              </div>
            </div>

            {!isLocked && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={saving}
                  onClick={() => handleSave(false)}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : 'SAVE AS DRAFT'}
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={saving || isSubmissionsClosed}
                  onClick={() => handleSave(true)}
                  style={{
                    opacity: isSubmissionsClosed ? 0.6 : 1,
                    cursor: isSubmissionsClosed ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmissionsClosed ? (
                    'SUBMISSIONS CONCLUDED'
                  ) : saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'TRANSMIT FINAL SUBMISSION'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
