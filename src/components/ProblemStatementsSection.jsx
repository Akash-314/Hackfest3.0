import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Sparkles, Layers } from 'lucide-react';
import { problemCategories as defaultCategories } from '../data/eventData';
import { eventService } from '../services/eventService';
import ProblemDetailModal from './ProblemDetailModal';
import SuperheroPanel from './ui/SuperheroPanel';
import SuperheroTrackArt from './ui/SuperheroTrackArt';
import HoloBadge from './ui/HoloBadge';

export default function ProblemStatementsSection() {
  const [categories, setCategories] = useState(defaultCategories);
  const [statements, setStatements] = useState([]);
  const [activeProblem, setActiveProblem] = useState(null);

  const loadData = async () => {
    try {
      const [catRes, stmtRes] = await Promise.all([
        eventService.getProblemCategories(),
        eventService.getProblemStatements(),
      ]);
      if (catRes?.length > 0) {
        setCategories(catRes);
      }
      if (stmtRes?.length > 0) {
        setStatements(stmtRes);
      }
    } catch (err) {
      console.warn('Failed to load problem data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCategory = (cat) => {
    // Match linked published statement if available
    const linked = statements.find(
      (s) => s.category_id === cat.id || s.category?.slug === cat.slug || s.slug === cat.slug
    );

    if (linked) {
      setActiveProblem({
        ...cat,
        title: linked.title || cat.title,
        challenge: linked.description || cat.challenge,
        background: cat.background || linked.description,
        requirements: (Array.isArray(linked.requirements) && linked.requirements.length > 0)
          ? linked.requirements
          : (cat.requirements || []),
        constraints: linked.constraints || '',
        examples: linked.examples || '',
        inputOutputSpecs: linked.input_output_specs || '',
        referenceFileUrl: linked.reference_file_url || '',
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
            Explore the six official technical challenges designed to build real-world resilience, crisis healthcare, and civic infrastructure.
          </p>
        </div>

        {/* 6 Track Cards Grid - Spacious 3-col Desktop, 2-col Tablet, 1-col Mobile */}
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
            const summaryText = prob.summary || prob.challenge;

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

                  {/* Humanized Plain-Language Summary */}
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
