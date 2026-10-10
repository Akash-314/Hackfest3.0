import React, { useState, useEffect } from 'react';
import { Shield, Scale, Cpu, UserCheck, Terminal, Award } from 'lucide-react';
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
    <section id="mentors-judges" className="section mentors-section superhero-council-section">
      <div className="section-transition-top" />
      <div className="container">
        {/* Header */}
        <div className="section-header center">
          <HoloBadge variant="gold" icon={Shield}>
            EXPERTS & MENTORS
          </HoloBadge>
          <h2 className="heading-section marvel-section-title">JUDGES & MENTORS</h2>
          <p className="section-lead">
            Guided and evaluated by distinguished academic leadership, senior industry architects, and experienced technology practitioners.
          </p>
        </div>

        {/* Tab switch */}
        <div className="stark-council-tabs">
          <button
            className={`workflow-tab-btn stark-tab-btn ${activeTab === 'judges' ? 'active stark-tab-active' : ''}`}
            onClick={() => setActiveTab('judges')}
          >
            <span className="stark-tab-indicator" />
            JUDGES & PATRONS
          </button>
          <button
            className={`workflow-tab-btn stark-tab-btn ${activeTab === 'mentors' ? 'active stark-tab-active' : ''}`}
            onClick={() => setActiveTab('mentors')}
          >
            <span className="stark-tab-indicator" />
            TECHNICAL MENTORS & ARCHITECTS
          </button>
          <button
            className={`workflow-tab-btn stark-tab-btn ${activeTab === 'criteria' ? 'active stark-tab-active' : ''}`}
            onClick={() => setActiveTab('criteria')}
          >
            <span className="stark-tab-indicator" />
            EVALUATION CRITERIA
          </button>
        </div>

        {activeTab === 'judges' && (
          <div className="mentors-grid stark-council-grid">
            {people.judges.map((judge, idx) => (
              <SuperheroPanel
                key={judge.id || idx}
                variant="gold"
                tag={`JUDGE // PROFILE 0${idx + 1}`}
                issueNumber="JUDGE"
                className="mentor-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '4px', background: 'rgba(245, 182, 66, 0.15)', border: '1px solid var(--color-stark-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={24} color="var(--color-stark-gold)" />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', color: '#FFFFFF', margin: 0 }}>
                      {judge.name}
                    </h3>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-stark-gold)' }}>
                      {judge.designation}
                    </div>
                  </div>
                </div>

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: '#64748B', marginBottom: '0.6rem' }}>
                  ORGANIZATION: {judge.organization}
                </div>

                <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: '1.55', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.6rem' }}>
                  {judge.bio}
                </p>
              </SuperheroPanel>
            ))}
          </div>
        )}

        {activeTab === 'mentors' && (
          <div className="mentors-grid stark-council-grid">
            {people.mentors.map((mentor, idx) => (
              <SuperheroPanel
                key={mentor.id || idx}
                variant="blue"
                tag={`MENTOR // PROFILE 0${idx + 1}`}
                issueNumber="MENTOR"
                className="mentor-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '4px', background: 'rgba(0, 191, 255, 0.15)', border: '1px solid var(--color-arc-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Cpu size={24} color="var(--color-arc-blue)" />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', color: '#FFFFFF', margin: 0 }}>
                      {mentor.name}
                    </h3>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-arc-blue)' }}>
                      {mentor.designation}
                    </div>
                  </div>
                </div>

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: '#64748B', marginBottom: '0.6rem' }}>
                  EXPERTISE: {mentor.expertise}
                </div>

                <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: '1.55', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.6rem' }}>
                  {mentor.bio}
                </p>
              </SuperheroPanel>
            ))}
          </div>
        )}

        {activeTab === 'criteria' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem' }}>
            {/* Hackathon Criteria */}
            <SuperheroPanel variant="red" tag="HACKATHON 9-DIMENSION RUBRIC" issueNumber="SCORING">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
                <Scale size={20} color="var(--color-energy-red)" />
                <h3 className="heading-display" style={{ fontSize: '1.35rem', color: '#FFFFFF' }}>
                  HACKATHON EVALUATION RUBRIC
                </h3>
              </div>
              <p style={{ fontSize: '0.86rem', color: '#94A3B8', marginBottom: '1.4rem' }}>
                Evaluated live by the High Council during evening stage presentations on Day 2.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: 0 }}>
                {(hackathonComp?.judgingCriteria || []).map((c, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.85rem',
                      background: 'rgba(5, 7, 13, 0.75)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '4px',
                      fontSize: '0.84rem',
                    }}
                  >
                    <span style={{ color: '#F5F7FA' }}>{c.criterion}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-energy-red)', fontWeight: 600 }}>{c.weight}</span>
                  </li>
                ))}
              </ul>
            </SuperheroPanel>

            {/* Ideathon Criteria */}
            <SuperheroPanel variant="blue" tag="IDEATHON DEFENSE RUBRIC" issueNumber="DEFENSE">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
                <Scale size={20} color="var(--color-arc-blue)" />
                <h3 className="heading-display" style={{ fontSize: '1.35rem', color: '#FFFFFF' }}>
                  IDEATHON DEFENSE RUBRIC
                </h3>
              </div>
              <p style={{ fontSize: '0.86rem', color: '#94A3B8', marginBottom: '1.4rem' }}>
                Scored across strategic novelty, architectural feasibility, and Q&A composure.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: 0 }}>
                {(ideathonComp?.judgingCriteria || []).map((c, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.85rem',
                      background: 'rgba(5, 7, 13, 0.75)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '4px',
                      fontSize: '0.84rem',
                    }}
                  >
                    <span style={{ color: '#F5F7FA' }}>{c.criterion}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-arc-blue)', fontWeight: 600 }}>{c.weight}</span>
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
