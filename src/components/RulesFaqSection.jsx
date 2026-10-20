import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  FileText,
  HelpCircle,
  ShieldAlert,
  BookOpen,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { faqsData as defaultFaqs } from '../data/eventData';
import { eventService } from '../services/eventService';
import HudPanel from './ui/HudPanel';
import HoloBadge from './ui/HoloBadge';

export const rulebookCategories = [
  {
    id: 'general',
    title: 'General Rules',
    rules: [
      'Register using the official event registration process.',
      'Carry a valid college identity card for on-campus verification.',
      'Maintain discipline and follow campus and event committee instructions.',
      'Plagiarism, unfair means, and unauthorized collaboration are grounds for immediate disqualification.',
      'The decisions of the judging panel and organizing committee are final and binding.',
      'Bring your own laptop, charger, and necessary development resources unless otherwise specified.',
    ],
  },
  {
    id: 'hackathon',
    title: 'Hackathon',
    rules: [
      'The Hackathon takes place on Day 2, Monday, 2 November 2026.',
      'Teams work on selected problem statements and build their solutions during the event.',
      'Previously completed projects must not be presented as newly developed work.',
      'The rulebook specifies a PPT of 6–7 pages and a 5-minute pitch followed by 2 minutes of Q&A, unless different timings are officially announced.',
      'External APIs, frameworks, and open-source libraries are allowed with clear attribution.',
      'Final submission instructions and deadlines must be taken from the currently approved event configuration.',
    ],
  },
  {
    id: 'ideathon',
    title: 'Ideathon',
    rules: [
      'The Ideathon is a single pitch round on Day 1, Sunday, 1 November 2026.',
      'Teams present the problem, proposed solution, uniqueness, feasibility, and expected impact.',
      'Each pitch is followed by judge Q&A.',
      'Ideas must be original; plagiarism or presenting a previously made idea or project is grounds for disqualification.',
      'Pitch and Q&A durations will be announced officially at the Day 1 briefing.',
    ],
  },
  {
    id: 'codeathon',
    title: 'Codeathon',
    rules: [
      'The Codeathon is an individual event on Day 1 and lasts 1.5 hours.',
      'Teamwork and discussion during the contest are not permitted.',
      'The listed languages are C, C++, Java, Python, and JavaScript.',
      'Internet access will be limited and monitored during the contest.',
      'Rankings are determined by problems solved, time taken, and penalties for wrong submissions, according to declared contest rules.',
    ],
  },
  {
    id: 'accommodation',
    title: 'Accommodation & Facilities',
    rules: [
      'Accommodation is provided for participants coming from outside REC Banda.',
      'Participants must bring a valid college ID for campus access and room allotment.',
      'Participants are responsible for arranging their own meals.',
      'On-ground support includes registration, technical assistance, power/Wi-Fi arrangements, and logistics support as described in the rulebook.',
    ],
  },
  {
    id: 'evaluation',
    title: 'Evaluation & Disqualification',
    rules: [
      'Hackathon evaluations consider problem understanding, solution quality, innovation, technical implementation, functionality, usability/feasibility, impact, scalability, and presentation.',
      'Ideathon evaluations consider problem identification, originality, solution approach, feasibility, impact, scalability, presentation, and Q&A defense.',
      'Codeathon rankings follow the declared contest rules and tie-breaking methods.',
      'Plagiarism, misconduct, unauthorized collaboration, breaking time or submission rules, and false registration information or invalid college ID can lead to disqualification.',
    ],
  },
];

export default function RulesFaqSection() {
  const [faqs, setFaqs] = useState(defaultFaqs);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [openRuleIndex, setOpenRuleIndex] = useState(0);

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

  const toggleRule = (idx) => {
    setOpenRuleIndex(openRuleIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="section rules-faq-section">
      <div id="rules" style={{ position: 'relative', top: '-80px', visibility: 'hidden' }} />
      <div className="section-transition-top" />
      <div className="container">
        {/* Section Header */}
        <div className="section-header center">
          <HoloBadge variant="gold" icon={ShieldAlert}>
            GUIDELINES & GOVERNANCE
          </HoloBadge>
          <h2 className="heading-section stark-section-title">RULES & FAQS</h2>
          <p className="section-lead" style={{ maxWidth: '720px', margin: '0 auto' }}>
            Official event regulations, competition rubrics, and answers to frequently asked questions for HackFest 3.0.
          </p>
        </div>

        {/* Top Hero Banner: Official Rulebook PDF Access */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(18, 37, 28, 0.95) 0%, rgba(8, 10, 9, 0.98) 100%)',
            border: '1px solid rgba(57, 255, 136, 0.35)',
            borderRadius: '12px',
            padding: '1.75rem 2rem',
            marginBottom: '2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ maxWidth: '600px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#39FF88', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', letterSpacing: '0.08em', marginBottom: '0.4rem', fontWeight: 600 }}>
              <BookOpen size={16} />
              <span>OFFICIAL EVENT DOCUMENTATION</span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: '#FFFFFF', margin: '0 0 0.5rem 0', letterSpacing: '0.03em' }}>
              HACKFEST 3.0 OFFICIAL RULEBOOK
            </h3>
            <p style={{ color: '#C7CED8', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
              Review the complete authoritative 6-page rulebook covering official event rules, competition specifications, eligibility guidelines, and on-campus accommodation instructions.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href="/hackfest-3.0-rulebook.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.4rem',
                fontSize: '0.85rem',
                textDecoration: 'none',
              }}
            >
              <FileText size={16} />
              <span>READ THE OFFICIAL RULEBOOK</span>
              <ExternalLink size={15} />
            </a>
            <a
              href="/hackfest-3.0-rulebook.pdf"
              download="hackfest-3.0-rulebook.pdf"
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                fontSize: '0.85rem',
                textDecoration: 'none',
              }}
            >
              <Download size={16} />
              <span>DOWNLOAD PDF</span>
            </a>
          </div>
        </div>

        {/* 2-Column Grid: Structured Rules (Left) & FAQs (Right) */}
        <div className="rules-faq-grid">
          {/* Left Column: Official Rules Summary */}
          <HudPanel variant="gold" tag="EVENT GUIDELINES" scan={false}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 className="rules-col-title" style={{ color: 'var(--color-stark-gold)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                <FileText size={22} color="var(--color-stark-gold)" />
                EVENT RULES & PARTICIPANT GUIDELINES
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                HackFest 3.0 is an offline campus event at REC Banda on 1–2 November 2026. Participants should review the official rules before registering, bring a valid college ID and their own laptop and charger, submit original work, follow the event schedule and respect the decisions of the judging panel.
              </p>
            </div>

            {/* Expandable Category Accordions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {rulebookCategories.map((cat, idx) => {
                const isOpen = openRuleIndex === idx;
                return (
                  <div
                    key={cat.id}
                    style={{
                      background: isOpen ? 'rgba(245, 196, 81, 0.06)' : 'rgba(13, 17, 26, 0.65)',
                      border: `1px solid ${isOpen ? 'rgba(245, 196, 81, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                      borderRadius: '6px',
                      overflow: 'hidden',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleRule(idx)}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1.1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'transparent',
                        border: 'none',
                        color: isOpen ? '#FFFFFF' : '#E2E8F0',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.98rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        letterSpacing: '0.02em',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-stark-gold)' }}>
                          0{idx + 1}
                        </span>
                        <span>{cat.title}</span>
                      </span>
                      <ChevronDown
                        size={17}
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.25s ease',
                          color: 'var(--color-stark-gold)',
                          flexShrink: 0,
                        }}
                      />
                    </button>

                    {isOpen && (
                      <div style={{ padding: '0 1.1rem 1.1rem 2.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0.6rem 0 0 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {cat.rules.map((rule, rIdx) => (
                            <li
                              key={rIdx}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.6rem',
                                color: '#A1A6B3',
                                fontSize: '0.88rem',
                                lineHeight: '1.55',
                              }}
                            >
                              <CheckCircle2 size={15} color="var(--color-stark-gold)" style={{ marginTop: 3, flexShrink: 0 }} />
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Transparent Note on Rulebook Contradictions */}
            <div
              style={{
                marginTop: '1.5rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '0.9rem 1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
              }}
            >
              <Info size={18} color="var(--color-arc-cyan)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: '1.55' }}>
                <strong style={{ color: '#E2E8F0' }}>Notice on Rulebook Draft Variations: </strong>
                The printed rulebook PDF contains historical draft variations across sections (such as team sizes noted as 3–5 vs. 4 in specific contest pages). The website preserves the latest approved committee configuration (Codeathon: individual solo; Hackathon & Ideathon: 3–4 members, leader + 2–3 teammates; Codeathon PPT not required). Please refer to the downloaded PDF for complete guidelines and attend the Day 1 opening briefing for official real-time updates.
              </div>
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
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <button
                      type="button"
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
                        textAlign: 'left',
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
                          color: 'var(--color-arc-blue)',
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
                          lineHeight: '1.65',
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
