import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Sparkles, Layers, RefreshCw, AlertCircle, FileQuestion } from 'lucide-react';
import { eventService } from '../services/eventService';
import ProblemDetailModal from './ProblemDetailModal';
import SuperheroPanel from './ui/SuperheroPanel';
import SuperheroTrackArt from './ui/SuperheroTrackArt';
import HoloBadge from './ui/HoloBadge';

export default function ProblemStatementsSection() {
  const [categories, setCategories] = useState([]);
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeProblem, setActiveProblem] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, stmtRes] = await Promise.all([
        eventService.getProblemCategories(),
        eventService.getProblemStatements(),
      ]);
      setCategories(catRes || []);
      setStatements(stmtRes || []);
    } catch (err) {
      console.error('Failed to load problem data from database:', err);
      setError(err?.message || 'Unable to retrieve problem statements from the database repository.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCategory = (cat) => {
    // Match linked published statement by id, category_id, slug, or track_label
    const linked = statements.find(
      (s) => s.id === cat.id ||
             s.category_id === cat.id ||
             s.slug === cat.slug ||
             (s.track_label && s.track_label === cat.number)
    );

    if (linked) {
      setActiveProblem({
        ...cat,
        id: cat.id,
        title: linked.title || cat.title,
        challenge: linked.description || cat.challenge || cat.summary,
        background: cat.background || linked.constraints || linked.description || cat.summary,
        requirements: (Array.isArray(linked.requirements) && linked.requirements.length > 0)
          ? linked.requirements
          : (Array.isArray(cat.requirements) ? cat.requirements : []),
        constraints: linked.constraints || '',
        examples: linked.examples || cat.expectedOutcome || '',
        inputOutputSpecs: linked.input_output_specs || cat.suggestedDirection || '',
        referenceFileUrl: linked.reference_file_url || '',
        expectedOutcome: cat.expectedOutcome || linked.examples || '',
        submissionInfo: cat.submissionInfo || '',
      });
    } else {
      setActiveProblem(cat);
    }
  };

  return (
    <section id="problems" className="section problems-section">
      <div id="missions" style={{ position: 'relative', top: '-80px', visibility: 'hidden' }} />
      <div id="tracks" style={{ position: 'relative', top: '-80px', visibility: 'hidden' }} />
      <div className="section-transition-top" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="section-header center">
          <HoloBadge variant="teal" icon={Layers}>
            HACKATHON TRACKS
          </HoloBadge>
          <h2 className="heading-section">
            PROBLEM STATEMENTS
          </h2>
          <p className="section-lead">
            Explore the official technical challenges stored in the HackFest 3.0 database, designed to build real-world resilience, crisis healthcare, and civic infrastructure.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '280px',
              gap: '1.25rem',
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(57, 255, 136, 0.2)',
              borderRadius: '12px',
              padding: '2.5rem',
            }}
          >
            <RefreshCw
              size={36}
              color="#39FF88"
              style={{ animation: 'spin 1.2s linear infinite' }}
            />
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.95rem',
                  color: '#39FF88',
                  letterSpacing: '0.08em',
                  marginBottom: '0.4rem',
                }}
              >
                CONNECTING TO DATABASE REPOSITORY...
              </div>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0 }}>
                Loading verified problem statements and challenge specifications.
              </p>
            </div>
          </div>
        )}

        {/* Error State with Explicit Retry (No Silent Fallback) */}
        {!loading && error && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '260px',
              gap: '1.25rem',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '2.5rem',
              textAlign: 'center',
            }}
          >
            <AlertCircle size={40} color="#EF4444" />
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  color: '#FFFFFF',
                  marginBottom: '0.5rem',
                }}
              >
                DATABASE CONNECTION FAILED
              </h3>
              <p
                style={{
                  color: '#FCA5A5',
                  fontSize: '0.88rem',
                  maxWidth: '520px',
                  margin: '0 auto 1.25rem auto',
                  lineHeight: '1.55',
                }}
              >
                {error}
              </p>
              <button
                type="button"
                onClick={loadData}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.82rem',
                  padding: '0.65rem 1.3rem',
                }}
              >
                <RefreshCw size={15} />
                <span>RETRY CONNECTION</span>
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && categories.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '260px',
              gap: '1rem',
              background: 'rgba(17, 24, 39, 0.5)',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center',
            }}
          >
            <FileQuestion size={40} color="var(--color-stark-gold)" />
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.2rem',
                color: '#FFFFFF',
                margin: 0,
              }}
            >
              NO PUBLISHED PROBLEM STATEMENTS FOUND
            </h3>
            <p
              style={{
                color: '#94A3B8',
                fontSize: '0.88rem',
                maxWidth: '460px',
                margin: 0,
                lineHeight: '1.5',
              }}
            >
              The committee has not yet published problem statements in the database. Please check back following the official event briefing.
            </p>
          </div>
        )}

        {/* Database-Driven Cards Grid */}
        {!loading && !error && categories.length > 0 && (
          <div
            className="problems-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))',
              gap: '1.75rem',
            }}
          >
            {categories.map((prob, idx) => {
              const rawNum = prob.number != null ? String(prob.number).replace(/^0+/, '') : String(idx + 1);
              const trackNum = (rawNum || String(idx + 1)).padStart(2, '0');
              const displayTitle = prob.title || prob.theme;
              const summaryText = prob.summary || prob.challenge || prob.description;

              return (
                <SuperheroPanel
                  key={prob.id || idx}
                  variant={idx % 2 === 0 ? 'teal' : 'gold'}
                  tag={`TRACK ${trackNum}`}
                  className="problem-superhero-card"
                  backgroundArt={<SuperheroTrackArt trackIndex={idx} variant={idx % 2 === 0 ? 'teal' : 'gold'} />}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleOpenCategory(prob)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpenCategory(prob);
                      }
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ marginBottom: '0.85rem' }}>
                      <h3
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '1.25rem',
                          lineHeight: '1.35',
                          color: '#FFFFFF',
                          margin: 0,
                          letterSpacing: '0.01em',
                        }}
                      >
                        {displayTitle}
                      </h3>
                    </div>

                    {/* Humanized Plain-Language Summary from Database */}
                    <p
                      style={{
                        color: '#C7CED8',
                        fontSize: '0.88rem',
                        lineHeight: '1.65',
                        marginBottom: '1.5rem',
                        flexGrow: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {summaryText}
                    </p>

                    {/* Action trigger to reveal full modal */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        paddingTop: '0.9rem',
                        marginTop: 'auto',
                        color: idx % 2 === 0 ? '#39FF88' : '#F5C451',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.06em',
                      }}
                    >
                      <span>EXPLORE SPECIFICATION</span>
                      <ArrowUpRight size={16} />
                    </div>
                  </div>
                </SuperheroPanel>
              );
            })}
          </div>
        )}

        {/* Detailed Modal Inspector (Revealed on User Interaction) */}
        {activeProblem && (
          <ProblemDetailModal
            problem={activeProblem}
            onClose={() => setActiveProblem(null)}
          />
        )}
      </div>
    </section>
  );
}
