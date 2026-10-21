import React, { useState, useEffect } from 'react';
import { Users, Shield, CheckCircle2 } from 'lucide-react';
import { mentorsAndJudges as defaultData, competitions } from '../data/eventData';
import { eventService } from '../services/eventService';
import SuperheroPanel from './ui/SuperheroPanel';
import HoloBadge from './ui/HoloBadge';

export default function MentorsJudgesSection() {
  const [activeTab, setActiveTab] = useState('judges');
  const [people, setPeople] = useState(defaultData);

  useEffect(() => {
    let isMounted = true;
    eventService.getMentorsAndJudges().then((res) => {
      if (isMounted && res) setPeople(res);
    });
    return () => { isMounted = false; };
  }, []);

  const hackathonComp = competitions.find((c) => c.id === 'hackathon');
  const ideathonComp = competitions.find((c) => c.id === 'ideathon');

  return (
    <section id="mentors-judges" className="section mentors-section">
      <div id="mentors" style={{ position: 'relative', top: '-80px', visibility: 'hidden' }} />
      <div className="section-transition-top" />
      <div className="container">
        {/* Header */}
        <div className="section-header center">
          <HoloBadge variant="teal" icon={Users}>
            COUNCIL & ARCHITECTS
          </HoloBadge>
          <h2 className="heading-section">JUDGES & MENTORS</h2>
          <p className="section-lead">
            Guided and evaluated by distinguished academic leadership, senior industry architects, and experienced technology practitioners.
          </p>
        </div>

        {/* Tab switch */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            className={`btn ${activeTab === 'judges' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('judges')}
            style={{ fontSize: '0.82rem', padding: '0.65rem 1.25rem', borderRadius: '8px' }}
          >
            JUDGES & PATRONS
          </button>
          <button
            className={`btn ${activeTab === 'mentors' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('mentors')}
            style={{ fontSize: '0.82rem', padding: '0.65rem 1.25rem', borderRadius: '8px' }}
          >
            TECHNICAL MENTORS
          </button>
          <button
            className={`btn ${activeTab === 'criteria' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('criteria')}
            style={{ fontSize: '0.82rem', padding: '0.65rem 1.25rem', borderRadius: '8px' }}
          >
            EVALUATION RUBRIC
          </button>
        </div>

        {/* Tab 1: Judges */}
        {activeTab === 'judges' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: '1.25rem',
            }}
          >
            {(people.judges || [])
              .filter((j) => !j.name?.toLowerCase().includes('industry guest jury') && !j.name?.toLowerCase().includes('judge 0'))
              .map((judge, idx) => (
                <SuperheroPanel
                  key={judge.id || idx}
                  variant="teal"
                  tag={`ACADEMIC JURY 0${idx + 1}`}
                  issueNumber={judge.organization ? judge.organization.slice(0, 14) : ''}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: '50%',
                          background: 'rgba(57, 255, 136, 0.08)',
                          border: '1px solid #1C382A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#39FF88',
                          flexShrink: 0,
                        }}
                      >
                        <Shield size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#F5F5F7', margin: 0 }}>
                          {judge.name}
                        </h3>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#8DDBB0' }}>
                          {judge.designation}
                        </div>
                      </div>
                    </div>

                    <p style={{ color: '#A1A6B3', fontSize: '0.86rem', lineHeight: '1.5', margin: 0 }}>
                      {judge.bio}
                    </p>
                  </div>
                </SuperheroPanel>
              ))}
          </div>
        )}

        {/* Tab 2: Mentors */}
        {activeTab === 'mentors' && (
          <div>
            {(people.mentors || []).filter((m) => !m.name?.toLowerCase().includes('senior tech mentor')).length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                  gap: '1.25rem',
                }}
              >
                {(people.mentors || [])
                  .filter((m) => !m.name?.toLowerCase().includes('senior tech mentor'))
                  .map((mentor, idx) => (
                    <SuperheroPanel
                      key={mentor.id || idx}
                      variant="violet"
                      tag={`MENTOR 0${idx + 1}`}
                      issueNumber={mentor.organization ? mentor.organization.slice(0, 14) : ''}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
                          <div
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: '50%',
                              background: 'rgba(155, 138, 251, 0.1)',
                              border: '1px solid rgba(155, 138, 251, 0.25)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#9B8AFB',
                              flexShrink: 0,
                            }}
                          >
                            <Users size={20} />
                          </div>
                          <div>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#F5F5F7', margin: 0 }}>
                              {mentor.name}
                            </h3>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#9B8AFB' }}>
                              {mentor.designation}
                            </div>
                          </div>
                        </div>

                        <p style={{ color: '#A1A6B3', fontSize: '0.86rem', lineHeight: '1.5', margin: 0 }}>
                          {mentor.bio}
                        </p>
                      </div>
                    </SuperheroPanel>
                  ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '3rem 2rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  maxWidth: '680px',
                  margin: '0 auto',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: '50%',
                    background: 'rgba(155, 138, 251, 0.1)',
                    border: '1px solid rgba(155, 138, 251, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9B8AFB',
                    margin: '0 auto 1.2rem auto',
                  }}
                >
                  <Users size={26} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#F5F5F7', marginBottom: '0.5rem' }}>
                  TECHNICAL MENTORS TO BE ANNOUNCED
                </h3>
                <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: '1.6', maxWidth: '520px', margin: '0 auto' }}>
                  Our full roster of specialized technical mentors spanning distributed systems, applied AI, full-stack systems, and embedded hardware will be officially revealed prior to the event.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Evaluation Criteria */}
        {activeTab === 'criteria' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '1.5rem',
            }}
          >
            <SuperheroPanel variant="teal" tag="RUBRIC 01">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#F5F5F7', marginBottom: '1rem' }}>
                Hackathon Scoring Rubric
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {(hackathonComp?.judgingCriteria || [
                  { criterion: 'Innovation & Novelty', weight: '25%' },
                  { criterion: 'Technical Execution & Architecture', weight: '25%' },
                  { criterion: 'Functionality & Completeness', weight: '20%' },
                  { criterion: 'UI/UX & User Experience', weight: '15%' },
                  { criterion: 'Presentation & Demo Pitch', weight: '15%' },
                ]).map((c, i) => (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#A1A6B3', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.4rem' }}>
                    <span>{c.criterion || c}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#39FF88', fontWeight: 600 }}>{c.weight || ''}</span>
                  </li>
                ))}
              </ul>
            </SuperheroPanel>

            <SuperheroPanel variant="violet" tag="RUBRIC 02">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#F5F5F7', marginBottom: '1rem' }}>
                Ideathon Scoring Rubric
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {(ideathonComp?.judgingCriteria || [
                  { criterion: 'Problem Statement & Impact', weight: '30%' },
                  { criterion: 'Solution Feasibility & Scalability', weight: '25%' },
                  { criterion: 'Market Viability & Business Model', weight: '20%' },
                  { criterion: 'Pitch Clarity & Defense', weight: '25%' },
                ]).map((c, i) => (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#A1A6B3', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.4rem' }}>
                    <span>{c.criterion || c}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#9B8AFB', fontWeight: 600 }}>{c.weight || ''}</span>
                  </li>
                ))}
              </ul>
            </SuperheroPanel>
          </div>
        )}
      </div>
    </section>
  );
}
