import React, { useEffect } from 'react';
import { X, ArrowRight, CheckCircle2, Compass, AlertCircle, FileText, Send } from 'lucide-react';

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

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close details">
          <X size={22} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '1.8rem', paddingBottom: '1.2rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--color-warm-amber)' }}>
              {problem.number}
            </span>
            <span className="chapter-badge" style={{ margin: 0 }}>
              HACKATHON CRISIS TRACK
            </span>
          </div>

          <h2 className="heading-display" style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>
            {problem.title}
          </h2>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-warm-amber)' }}>
            THEME: {problem.theme}
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Notice: {problem.placeholderNotice}
          </div>
        </div>

        {/* Modal Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
          {/* Background */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', letterSpacing: '0.12em', color: 'var(--color-soft-gray)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              PROBLEM BACKGROUND
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.65' }}>
              {problem.background}
            </p>
          </div>

          {/* Challenge */}
          <div style={{ background: 'rgba(37, 42, 49, 0.6)', borderLeft: '3px solid var(--color-muted-crimson)', padding: '1rem 1.2rem', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', letterSpacing: '0.12em', color: 'var(--color-warm-off-white)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
              THE CORE CHALLENGE
            </h4>
            <p style={{ color: 'var(--color-warm-off-white)', fontSize: '0.94rem', lineHeight: '1.6' }}>
              {problem.challenge}
            </p>
          </div>

          {/* Requirements */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', letterSpacing: '0.12em', color: 'var(--color-soft-gray)', marginBottom: '0.6rem', textTransform: 'uppercase' }}>
              SYSTEM REQUIREMENTS
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {problem.requirements.map((req, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} color="var(--color-steel-blue)" style={{ marginTop: 3, flexShrink: 0 }} />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Expected Outcome */}
          {problem.expectedOutcome && (
            <div>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', letterSpacing: '0.12em', color: 'var(--color-soft-gray)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                EXPECTED OUTCOME
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.93rem', lineHeight: '1.6' }}>
                {problem.expectedOutcome}
              </p>
            </div>
          )}

          {/* Constraints & Scope */}
          {problem.constraints && (
            <div>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', letterSpacing: '0.12em', color: 'var(--color-soft-gray)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                CONSTRAINTS & EVALUATION BOUNDARIES
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.93rem', lineHeight: '1.6' }}>
                {problem.constraints}
              </p>
            </div>
          )}

          {/* Examples / Synthetic Datasets */}
          {problem.examples && (
            <div>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', letterSpacing: '0.12em', color: 'var(--color-soft-gray)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                EXEMPLAR SCENARIOS & SAMPLE CONTRACTS
              </h4>
              <div style={{ background: '#111827', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--color-warm-off-white)', whiteSpace: 'pre-wrap' }}>
                {problem.examples}
              </div>
            </div>
          )}

          {/* Input / Output Specifications */}
          {problem.inputOutputSpecs && (
            <div>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', letterSpacing: '0.12em', color: 'var(--color-soft-gray)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                INPUT / OUTPUT SPECIFICATIONS
              </h4>
              <div style={{ background: '#111827', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--color-arc-blue)', whiteSpace: 'pre-wrap' }}>
                {problem.inputOutputSpecs}
              </div>
            </div>
          )}

          {/* Suggested Direction */}
          {problem.suggestedDirection && (
            <div>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', letterSpacing: '0.12em', color: 'var(--color-soft-gray)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                SUGGESTED TECHNICAL DIRECTION
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.93rem', lineHeight: '1.6' }}>
                {problem.suggestedDirection}
              </p>
            </div>
          )}

          {/* Reference File / Attachment */}
          {problem.referenceFileUrl && (
            <div style={{ background: 'rgba(0, 191, 255, 0.08)', border: '1px solid rgba(0, 191, 255, 0.3)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--color-arc-blue)', fontSize: '0.88rem' }}>
                <FileText size={18} />
                <span>Reference Specification / Dataset Attachment</span>
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
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                SUBMISSION PROTOCOL:
              </span>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-soft-gray)', marginTop: '2px' }}>
                {problem.submissionInfo}
              </div>
            </div>
            <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.6rem 1.4rem', fontSize: '0.82rem' }}>
              CLOSE SPECIFICATION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
