import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Sparkles, Layers } from 'lucide-react';
import { problemCategories as defaultCategories } from '../data/eventData';
import { eventService } from '../services/eventService';
import ProblemDetailModal from './ProblemDetailModal';
import SuperheroPanel from './ui/SuperheroPanel';
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
      <div className="section-transition-top" />
      <div className="container">
        {/* Header */}
        <div className="section-header center">
          <HoloBadge variant="teal" icon={Layers}>
            HACKATHON TRACKS
          </HoloBadge>
          <h2 className="heading-section">
            PROBLEM STATEMENTS & THEMES
          </h2>
          <p className="section-lead">
            Select any theme below to examine technical specifications, sample constraints, and evaluation rubrics.
          </p>
        </div>

        {/* 6 Track Cards Grid - Minimal & Information Light */}
        <div
          className="problems-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: '1.5rem',
          }}
        >
          {categories.map((prob, idx) => {
            const trackNum = `0${prob.number || idx + 1}`;
            return (
              <SuperheroPanel
                key={prob.id || idx}
                variant={idx % 2 === 0 ? 'teal' : 'silver'}
                tag={`TRACK ${trackNum}`}
                issueNumber={prob.theme ? prob.theme.toUpperCase() : 'CORE'}
                className="problem-minimal-card"
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <h3
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.35rem',
                        color: '#F5F5F7',
                        margin: 0,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {prob.title}
                    </h3>
                  </div>

                  {/* 1-line concise focus */}
                  <p
                    style={{
                      color: '#A1A6B3',
                      fontSize: '0.88rem',
                      lineHeight: '1.55',
                      marginBottom: '1.4rem',
                      flexGrow: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {prob.challenge}
                  </p>

                  {/* Action trigger to reveal full modal */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      paddingTop: '0.85rem',
                      marginTop: 'auto',
                      color: '#63E6D1',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    <span>VIEW SPECIFICATIONS</span>
                    <ArrowUpRight size={15} />
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
