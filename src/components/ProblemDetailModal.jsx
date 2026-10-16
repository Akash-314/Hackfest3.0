import React, { useEffect } from 'react';
import { X, CheckCircle2, FileText } from 'lucide-react';

export default function ProblemDetailModal({ problem, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!problem) return null;

  const trackNum = (String(problem.number || '1').replace(/^0+/, '') || '1').padStart(2, '0');
  const mainTitle = problem.title || problem.theme;
  const subTheme = problem.theme && problem.theme !== problem.title ? problem.theme : null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close details">
          <X size={22} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '1.8rem', paddingBottom: '1.2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.65rem' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: '#63E6D1',
              background: 'rgba(99, 230, 209, 0.1)',
              border: '1px solid rgba(99, 230, 209, 0.25)',
              padding: '0.2rem 0.65rem',
              borderRadius: '4px',
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}>
              TRACK {trackNum}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              HACKATHON TRACK
            </span>
          </div>

          <h2 className="heading-display" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.95rem)', lineHeight: '1.28', marginBottom: '0.4rem', color: '#FFFFFF' }}>
            {mainTitle}
          </h2>
          {subTheme && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', color: '#63E6D1', marginBottom: '0.35rem', letterSpacing: '0.02em' }}>
              {subTheme}
            </div>
          )}
          {problem.placeholderNotice && (
            <div style={{ fontSize: '0.78rem', color: '#9CA3AF', fontStyle: 'italic', marginTop: '0.35rem' }}>
              Notice: {problem.placeholderNotice}
            </div>
          )}
        </div>

        {/* Modal Sections: Balanced 2-Column Responsive Layout */}
        <div className="problem-detail-grid">
          {/* Left Column: Background, Challenge, Outcome & Submission */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
            {/* Background */}
            <div>
              <h4 className="detail-section-label">PROBLEM BACKGROUND</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: '1.65' }}>
                {problem.background}
              </p>
            </div>

            {/* Core Challenge Box */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              borderLeft: '3px solid #EF4444',
              padding: '1.1rem 1.25rem',
              borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
              borderTop: '1px solid rgba(239, 68, 68, 0.15)',
              borderRight: '1px solid rgba(239, 68, 68, 0.15)',
              borderBottom: '1px solid rgba(239, 68, 68, 0.15)',
            }}>
              <h4 style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                letterSpacing: '0.12em',
                color: '#FCA5A5',
                marginBottom: '0.35rem',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}>
                THE CORE CHALLENGE
              </h4>
              <p style={{ color: '#F3F4F6', fontSize: '0.93rem', lineHeight: '1.62' }}>
                {problem.challenge}
              </p>
            </div>

            {/* Expected Outcome */}
            {problem.expectedOutcome && (
              <div>
                <h4 className="detail-section-label">EXPECTED OUTCOME</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.62' }}>
                  {problem.expectedOutcome}
                </p>
              </div>
            )}

            {/* Reference File / Attachment */}
            {problem.referenceFileUrl && (
              <div style={{
                background: 'rgba(99, 230, 209, 0.08)',
                border: '1px solid rgba(99, 230, 209, 0.25)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.6rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#63E6D1', fontSize: '0.88rem' }}>
                  <FileText size={18} />
                  <span>Reference Specification Attachment</span>
                </div>
                <a
                  href={problem.referenceFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                >
                  OPEN ATTACHMENT
                </a>
              </div>
            )}

            {/* Submission Info */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '1rem 1.15rem',
              borderRadius: 'var(--radius-sm)',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.76rem',
                color: '#63E6D1',
                letterSpacing: '0.08em',
                fontWeight: 600,
                display: 'block',
                marginBottom: '0.3rem',
                textTransform: 'uppercase',
              }}>
                SUBMISSION PROTOCOL
              </span>
              <div style={{ fontSize: '0.88rem', color: '#C7CED8', lineHeight: '1.55' }}>
                {problem.submissionInfo || 'Submit project repository link, architectural overview, and a brief video demonstration prior to the deadline.'}
              </div>
            </div>
          </div>

          {/* Right Column: System Requirements, Constraints, Exemplar Scenarios & Directions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
            {/* Requirements */}
            {problem.requirements && problem.requirements.length > 0 && (
              <div>
                <h4 className="detail-section-label">SYSTEM REQUIREMENTS</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {problem.requirements.map((req, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.9rem', color: '#D1D5DB', lineHeight: '1.55' }}>
                      <CheckCircle2 size={16} color="#63E6D1" style={{ marginTop: 3, flexShrink: 0 }} />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Constraints & Scope */}
            {problem.constraints && (
              <div>
                <h4 className="detail-section-label">CONSTRAINTS & EVALUATION BOUNDARIES</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                  {problem.constraints}
                </p>
              </div>
            )}

            {/* Examples / Synthetic Datasets */}
            {problem.examples && (
              <div>
                <h4 className="detail-section-label">EXEMPLAR SCENARIOS & SAMPLE CONTRACTS</h4>
                <div style={{
                  background: '#0D1117',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  color: '#E5E7EB',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.55',
                }}>
                  {problem.examples}
                </div>
              </div>
            )}

            {/* Input / Output Specifications */}
            {problem.inputOutputSpecs && (
              <div>
                <h4 className="detail-section-label">INPUT / OUTPUT SPECIFICATIONS</h4>
                <div style={{
                  background: '#0D1117',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(99, 230, 209, 0.2)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  color: '#63E6D1',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.55',
                }}>
                  {problem.inputOutputSpecs}
                </div>
              </div>
            )}

            {/* Suggested Direction */}
            {problem.suggestedDirection && (
              <div>
                <h4 className="detail-section-label">SUGGESTED TECHNICAL DIRECTION</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                  {problem.suggestedDirection}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          marginTop: '2rem',
          paddingTop: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}>
          <button
            className="btn btn-secondary"
            onClick={onClose}
            style={{
              padding: '0.65rem 1.6rem',
              fontSize: '0.84rem',
              borderRadius: '999px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em',
            }}
          >
            CLOSE SPECIFICATION
          </button>
        </div>
      </div>
    </div>
  );
}
