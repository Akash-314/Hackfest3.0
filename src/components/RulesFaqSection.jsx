import React, { useState, useEffect } from 'react';
import { ChevronDown, FileText, HelpCircle, ShieldAlert } from 'lucide-react';
import { rulesData, faqsData as defaultFaqs } from '../data/eventData';
import { eventService } from '../services/eventService';
import HudPanel from './ui/HudPanel';
import HoloBadge from './ui/HoloBadge';

export default function RulesFaqSection() {
  const [faqs, setFaqs] = useState(defaultFaqs);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    eventService.getFaqs().then((res) => {
      if (isMounted && res?.length > 0) setFaqs(res);
    });
    return () => { isMounted = false; };
  }, []);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="section rules-faq-section">
      <div className="section-transition-top" />
      <div className="container">
        <div className="section-header">
          <HoloBadge variant="gold" icon={ShieldAlert}>
            GUIDELINES & HELP
          </HoloBadge>
          <h2 className="heading-section stark-section-title">RULES & FAQS</h2>
          <p className="section-lead">
            Essential guidelines, competition rules, and answers to frequently asked questions.
          </p>
        </div>

        <div className="rules-faq-grid">
          {/* Left Column: Official Rules */}
          <HudPanel variant="gold" tag="RULES & GUIDELINES" scan={false}>
            <h3 className="rules-col-title" style={{ color: 'var(--color-stark-gold)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.4rem' }}>
              <FileText size={22} color="var(--color-stark-gold)" />
              EVENT RULES & CONDUCT
            </h3>

            <div>
              {rulesData.map((category, idx) => (
                <div key={idx} className="rules-category-block" style={{ marginBottom: '1.4rem' }}>
                  <h4 className="rules-category-title" style={{ color: '#F5F7FA', fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>
                    {category.category}
                  </h4>
                  <ul className="rules-list" style={{ marginTop: '0.5rem' }}>
                    {category.rules.map((rule, rIdx) => (
                      <li key={rIdx} style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '0.4rem' }}>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </HudPanel>

          {/* Right Column: FAQ Accordions */}
          <HudPanel variant="cyan" tag="FREQUENTLY ASKED QUESTIONS" scan={false}>
            <h3 className="faq-col-title" style={{ color: 'var(--color-arc-blue)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.4rem' }}>
              <HelpCircle size={22} color="var(--color-arc-blue)" />
              FREQUENTLY ASKED QUESTIONS
            </h3>

            <div className="accordion-group">
              {faqs.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                const paddedNum = String(idx + 1).padStart(2, '0');

                return (
                  <div
                    key={idx}
                    className={`accordion-item ${isOpen ? 'open' : ''}`}
                    style={{
                      background: isOpen ? 'rgba(0, 191, 255, 0.06)' : 'rgba(13, 17, 26, 0.6)',
                      border: `1px solid ${isOpen ? 'rgba(0, 191, 255, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                      borderRadius: '6px',
                      marginBottom: '0.8rem',
                      overflow: 'hidden',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    <button
                      className="accordion-trigger"
                      onClick={() => toggleFaq(idx)}
                      aria-expanded={isOpen}
                      style={{
                        width: '100%',
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'transparent',
                        border: 'none',
                        color: isOpen ? '#FFFFFF' : '#E2E8F0',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.05rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-arc-blue)' }}>
                          {paddedNum}
                        </span>
                        <span>{item.q}</span>
                      </div>
                      <ChevronDown
                        size={18}
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.25s ease',
                          flexShrink: 0,
                          color: 'var(--color-arc-blue)'
                        }}
                      />
                    </button>

                    {isOpen && (
                      <div
                        className="accordion-content"
                        style={{
                          padding: '0 1.25rem 1.25rem 2.8rem',
                          color: '#94A3B8',
                          fontSize: '0.94rem',
                          lineHeight: '1.65'
                        }}
                      >
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </HudPanel>
        </div>
      </div>
    </section>
  );
}
