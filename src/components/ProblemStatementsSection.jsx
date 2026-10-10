import React, { useState, useEffect } from 'react';
import { ChevronRight, ShieldAlert, AlertTriangle, Skull, Flame } from 'lucide-react';
import { problemCategories as defaultCategories } from '../data/eventData';
import { eventService } from '../services/eventService';
import ProblemDetailModal from './ProblemDetailModal';
import DoomThreatNexus3D from './3d/DoomThreatNexus3D';
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

  const threatLevels = ['OMEGA LEVEL', 'CRITICAL LEVEL', 'GLOBAL CRISIS', 'EXTINCTION CLASS', 'OMEGA LEVEL', 'TACTICAL CRISIS'];
  const variants = ['green', 'red', 'gold', 'green', 'red', 'gold'];

  return (
    <section id="problems" className="section problems-section doom-battle-section">
      <div className="section-transition-top" />
      <div className="container">
        {/* Header Briefing */}
        <div className="section-header center">
          <HoloBadge variant="red" icon={ShieldAlert}>
            HACKATHON TRACKS & THEMES
          </HoloBadge>
          <h2 className="heading-section marvel-section-title">
            PROBLEM STATEMENTS & TRACKS
          </h2>
          <p className="section-lead">
            Explore the problem tracks below, assemble your team, and develop transformative solutions during the Flagship 48-Hour Hackathon.
          </p>
        </div>

        {/* Doctor Doom 3D Villain Presence Stage */}
        <div className="doom-villain-stage-card">
          <div className="doom-stage-header">
            <span className="doom-status-dot" />
            <span>INTERACTIVE 3D SHOWCASE // DOCTOR DOOM</span>
          </div>

          <DoomThreatNexus3D />

          <div className="doom-stage-footer">
            <span className="doom-warning-text">
              <AlertTriangle size={15} color="#00ff77" />
              SELECT A TRACK BELOW TO VIEW DETAILED PROBLEM STATEMENTS
            </span>
          </div>
        </div>

        {/* 6 Track Cards Grid */}
        <div className="problems-grid doom-threats-grid" style={{ marginTop: '3rem' }}>
          {categories.map((prob, idx) => {
            const threatLevel = threatLevels[idx % threatLevels.length];
            const variant = variants[idx % variants.length];

            return (
              <SuperheroPanel
                key={prob.id}
                variant={variant}
                tag={`TRACK 0${prob.number} // ${prob.theme.toUpperCase()}`}
                issueNumber={prob.theme.toUpperCase()}
                className="doom-threat-panel"
              >
                <div
                  className="doom-threat-inner"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenCategory(prob)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenCategory(prob);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                    <span className="doom-threat-code">
                      TRACK 0{prob.number}
                    </span>
                    <span className="doom-threat-badge">
                      <Flame size={13} style={{ marginRight: '4px' }} />
                      ACTIVE
                    </span>
                  </div>

                  <h3 className="doom-threat-title">
                    {prob.title}
                  </h3>

                  <p className="doom-threat-brief">
                    {prob.challenge}
                  </p>

                  <div className="doom-threat-action-bar">
                    <span>VIEW PROBLEM DETAILS</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </SuperheroPanel>
            );
          })}
        </div>

        {/* Modal Inspector */}
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
