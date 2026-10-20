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
    id: 'overview',
    title: 'Event at a Glance',
    rules: [
      'Event: HackFest 3.0 — Doomsday, organized by the REC Banda Incubation Centre Foundation in collaboration with the Student Developer Club, REC Banda.',
      'Dates & Mode: 1st & 2nd November 2026 (Sunday & Monday), Offline on-campus at REC Banda.',
      'Events: Hackathon (Team Event), Ideathon (Team Event), and Codeathon (Individual Event).',
      'Opening Venue: Seminar Hall (SAC), REC Banda. General Venue: Seminar Hall (SAC) and Computer Centre (CC), REC Banda.',
      'Day 1 (Sunday, 1 Nov 2026): Opening Ceremony, Codeathon (1.5 hours), Ideathon (single pitch round).',
      'Day 2 (Monday, 2 Nov 2026): Hackathon with mentoring and final presentations, Grand Result Announcement, awards and closing ceremony.',
    ],
  },
  {
    id: 'general',
    title: 'General Rules',
    rules: [
      'Participants must register before the given deadline through the official HackFest 3.0 registration form.',
      'All participants must carry the valid college ID card of their own institution. Registration and ID are verified at check-in before each competition.',
      'Use of unfair means or plagiarism will lead to immediate disqualification.',
      'Participants must maintain discipline inside the venue and the campus, and follow the event code of conduct and instructions of organizers and volunteers.',
      'Judges\' decisions will be final and binding.',
      'Participants should bring and use their own laptops, chargers, and development resources unless otherwise specified.',
      'Reporting times, venues, platform links, submission methods, and deadlines will be shared with registered teams through WhatsApp groups, emails, and official social media handles.',
    ],
  },
  {
    id: 'eligibility',
    title: 'Eligibility, Teams & Registration',
    rules: [
      'The Hackathon and the Ideathon are team events. Team members may come from the same college or from different outside colleges.',
      'The Codeathon is strictly an individual event.',
      'The registration form asks for the team name, member details (including college name), contact information of the team lead, previous hackathon experience (if any), and tech stack and required resources.',
      'Presentation PPT: Teams must submit their PPT on or before the announced deadline. Shortlisted teams will be announced prior to the event. The submission link and format will be shared with registered teams.',
      'Only accommodation will be provided. Participants are responsible for arranging their own meals, which can be purchased from the college canteen.',
    ],
  },
  {
    id: 'hackathon',
    title: 'Hackathon Rules (Team Event)',
    rules: [
      'Held on Day 2 (Monday, 2nd November 2026).',
      'The Hackathon has 2 rounds: Round 1 – Idea Pitching / Shortlisting and Round 2 – Project Building (shortlisted teams build on Day 2).',
      'At the start of Day 2, teams will begin working on their pre-selected problem statements from one of the six categories.',
      'Detailed problem statements will be shared with registered teams in advance.',
      'Projects must be developed only during the event. All work must be original; use of pre-existing projects is prohibited.',
      'The presentation PPT must contain a maximum of 6 to 7 pages.',
      'Each team delivers a 5-minute pitch + 2-minute Q&A in front of the judges, unless different timings are announced.',
      'Use of external APIs, frameworks, and open-source libraries is allowed with proper attribution.',
      'The submission format and final submission deadline (2nd November 2026) will be communicated to all teams before the event.',
    ],
  },
  {
    id: 'ideathon',
    title: 'Ideathon Rules (Team Event)',
    rules: [
      'The Ideathon is a single pitch round held on Day 1 (Sunday, 1st November 2026), after lunch.',
      'Teams pitch the problem, proposed solution, uniqueness, feasibility, and expected impact to the judging panel.',
      'Each pitch is followed by judge Q&A. Pitch and Q&A durations will be announced.',
      'Ideas must be original. Plagiarism or presenting a previously made idea or project will lead to disqualification.',
      'Teams are scored on the approved evaluation criteria listed in the rulebook.',
    ],
  },
  {
    id: 'codeathon',
    title: 'Codeathon Rules (Individual Event)',
    rules: [
      'The Codeathon is strictly individual – no teamwork or discussion allowed.',
      'It is a 1.5-hour timed contest held on Day 1 (Sunday, 1st November 2026).',
      'Participants must bring their own laptops and chargers.',
      'Internet access will be limited and monitored. External-resource and plagiarism policies of the platform will be declared before the contest.',
      'Coding languages allowed: C, C++, Java, Python, JavaScript.',
      'Problems will be released on a competitive coding platform (HackerRank / CodeChef or an offline platform). The platform and number of problems will be announced.',
      'Ranking will be based on: 1. Number of problems solved, 2. Time taken, 3. Penalties for wrong submissions.',
      'A live leaderboard is maintained. Winners are decided by the final published ranking under the contest rules and tie-breaking method declared before the contest.',
      'A PPT presentation is NOT required for Codeathon.',
    ],
  },
  {
    id: 'accommodation',
    title: 'Accommodation & Facilities',
    rules: [
      'Accommodation will be provided to all participants coming from outside REC Banda. Details will be shared with registered teams.',
      'Outside participants must carry their valid college ID card for verification at check-in and at the accommodation.',
      'Participants must follow the rules of the accommodation and campus, and are responsible for safeguarding their personal belongings.',
      'On-ground support includes a registration desk, technical support, power and Wi-Fi arrangements, and volunteers for logistics, issue reporting, and time announcements.',
      'Only accommodation is provided. Participants will be responsible for arranging their own meals, which can be purchased from the college canteen.',
    ],
  },
  {
    id: 'evaluation',
    title: 'Evaluation Criteria',
    rules: [
      'Evaluation is conducted by a judging panel, with scores recorded on confirmed score sheets and verified before any result is announced. Criterion weightages will be announced before the event.',
      'Hackathon (9 Criteria): Problem Understanding, Quality of Solution, Innovation, Technical Implementation, Functionality, Usability & Feasibility, Impact, Scalability, and Presentation & Demo.',
      'Ideathon (8 Criteria): Problem Identification, Originality, Solution Approach, Feasibility, Impact, Scalability, Presentation, and Q&A / Defense.',
      'Codeathon: Ranking based strictly on number of problems solved, time taken, and penalties for wrong submissions under the declared contest rules and tie-breaking method.',
    ],
  },
  {
    id: 'disqualification',
    title: 'Disqualification Criteria',
    rules: [
      'Plagiarism or submission of previously made projects.',
      'Misconduct or violation of venue or accommodation rules.',
      'Unauthorised collaboration or helping other teams.',
      'Not following the time limits or submission format.',
      'Providing false information or a fake/invalid college ID during registration or check-in.',
      'Any violation of these rules may lead to immediate disqualification.',
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
                <strong style={{ color: '#E2E8F0' }}>Notice on Rulebook Draft Inconsistencies &amp; Committee Configuration: </strong>
                The printed rulebook PDF contains two internal draft discrepancies:
                <ul style={{ margin: '0.4rem 0 0 1.2rem', padding: 0 }}>
                  <li>
                    <strong>Team Size:</strong> Section 3 states "Every team must have 2-4 members. No solo or 2-member teams are allowed", while Sections 4 and 5 specify "Teams must have 4 members". The website preserves the latest approved committee configuration: <strong>Codeathon is strictly 1 member (individual solo)</strong>, while <strong>Hackathon and Ideathon require 3 to 4 members (1 leader + 2 to 3 teammates)</strong>.
                  </li>
                  <li>
                    <strong>PPT Deadlines &amp; Shortlisting:</strong> Section 1 lists PPT submission 18–26 October with shortlisting on 28 October, whereas Section 4 lists PPT submission by 24 October with shortlisting on 26 October. Deadlines are managed dynamically via committee settings and will be announced during official briefings.
                  </li>
                </ul>
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
