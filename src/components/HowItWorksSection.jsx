import React, { useState } from 'react';
import { Workflow } from 'lucide-react';
import { howItWorks } from '../data/eventData';
import SuperheroPanel from './ui/SuperheroPanel';
import HoloBadge from './ui/HoloBadge';

export default function HowItWorksSection() {
  const [activeWorkflow, setActiveWorkflow] = useState('hackathon');
  const current = howItWorks[activeWorkflow];

  const variants = ['blue', 'gold', 'red', 'green', 'gold'];

  return (
    <section id="how-it-works" className="section how-it-works-section superhero-blueprint-section">
      <div className="section-transition-top" />
      <div className="container">
        {/* Header */}
        <div className="section-header center">
          <HoloBadge variant="cyan" icon={Workflow}>
            EVENT PROCESS // CHAPTER 07
          </HoloBadge>
          <h2 className="heading-section marvel-section-title">HOW IT WORKS</h2>
          <p className="section-lead">
            Step-by-step process from initial check-in to prototype presentation across each competition.
          </p>
        </div>

        {/* Workflow Track Selector */}
        <div className="workflow-tabs stark-workflow-tabs">
          <button
            className={`workflow-tab-btn stark-tab-btn ${activeWorkflow === 'hackathon' ? 'active stark-tab-active' : ''}`}
            onClick={() => setActiveWorkflow('hackathon')}
          >
            <span className="stark-tab-indicator" />
            HACKATHON PROCESS
          </button>
          <button
            className={`workflow-tab-btn stark-tab-btn ${activeWorkflow === 'codeathon' ? 'active stark-tab-active' : ''}`}
            onClick={() => setActiveWorkflow('codeathon')}
          >
            <span className="stark-tab-indicator" />
            CODEATHON PROCESS (1.5H)
          </button>
          <button
            className={`workflow-tab-btn stark-tab-btn ${activeWorkflow === 'ideathon' ? 'active stark-tab-active' : ''}`}
            onClick={() => setActiveWorkflow('ideathon')}
          >
            <span className="stark-tab-indicator" />
            IDEATHON PROCESS (PITCH)
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h3 className="heading-display" style={{ fontSize: '1.6rem', color: '#FFFFFF' }}>
            {current.title}
          </h3>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--color-stark-gold)', marginTop: '4px' }}>
            {current.subtitle}
          </p>
        </div>

        {/* Step Cards Grid */}
        <div className="workflow-steps-track stark-workflow-track">
          {current.steps.map((st, i) => (
            <SuperheroPanel
              key={i}
              variant={variants[i % variants.length]}
              tag={`PHASE 0${st.step}`}
              issueNumber={st.phase}
              className="workflow-step-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: '#FFFFFF', fontWeight: 800 }}>
                  #{st.step}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)' }}>
                  {st.phase}
                </span>
              </div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#FFFFFF', marginBottom: '0.5rem' }}>
                {st.title}
              </h4>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                {st.desc}
              </p>
            </SuperheroPanel>
          ))}
        </div>
      </div>
    </section>
  );
}
