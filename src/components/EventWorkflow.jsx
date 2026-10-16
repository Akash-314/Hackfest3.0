import React from 'react';
import {
  Sparkles,
  Terminal,
  BarChart2,
  Lightbulb,
  CheckCircle2,
  Rocket,
  Cpu,
  Compass,
  Presentation,
  ShieldCheck,
  Trophy,
  Medal,
  Flag,
  Calendar,
  ArrowDown,
  ArrowRight,
  GitBranch,
} from 'lucide-react';
import HoloBadge from './ui/HoloBadge';
import './EventWorkflow.css';

/**
 * Official HackFest 3.0 Event Workflow
 * Participant journey across Day 1 (Open & Compete) and Day 2 (Build & Celebrate)
 */
const DAY1_WORKFLOW = [
  {
    step: '01',
    title: 'Opening Ceremony',
    description: 'Official inauguration of HackFest 3.0.',
    icon: Sparkles,
    tag: 'INAUGURATION',
    accent: '#81C14B',
  },
  {
    step: '02',
    title: 'Codeathon',
    description: 'A 1.5-hour competitive programming challenge focused on algorithms and problem-solving.',
    icon: Terminal,
    tag: 'ALGORITHMS & SPEED',
    accent: '#81C14B',
  },
  {
    step: '03',
    title: 'Codeathon Results & Rankings',
    description: 'Leaderboard-based evaluation and ranking verification.',
    icon: BarChart2,
    tag: 'LEADERBOARD',
    accent: '#81C14B',
  },
  {
    step: '04',
    title: 'Ideathon — Idea Pitching',
    description: 'Participants present innovative ideas to the judges.',
    icon: Lightbulb,
    tag: 'INNOVATION PITCH',
    accent: '#ECBA82',
  },
  {
    step: '05',
    title: 'Ideathon Evaluation',
    description: 'Assessment of ideas through judging, Q&A and scoring.',
    icon: CheckCircle2,
    tag: 'DEFENSE & SCORING',
    accent: '#ECBA82',
  },
];

const DAY2_WORKFLOW = [
  {
    step: '01',
    title: 'Hackathon Check-in & Kick-off',
    description: 'Participant check-in and commencement of the main Hackathon.',
    icon: Rocket,
    tag: 'FLAGSHIP KICK-OFF',
    accent: '#81C14B',
  },
  {
    step: '02',
    title: 'Project Development Phase',
    description: 'Teams build, integrate and test solutions to their selected problem statements.',
    icon: Cpu,
    tag: 'DEV SPRINT',
    accent: '#2E933C',
  },
  {
    step: '03',
    title: 'Mentoring Round',
    description: 'Expert guidance and feedback to refine project implementation.',
    icon: Compass,
    tag: 'EXPERT GUIDANCE',
    accent: '#ECBA82',
  },
  {
    step: '04',
    title: 'Final Presentation & Q&A',
    description: 'Teams demonstrate their solutions and answer questions from the judges.',
    icon: Presentation,
    tag: 'LIVE DEMO',
    accent: '#81C14B',
  },
  {
    step: '05',
    title: 'Judging & Evaluation',
    description: 'Assessment of project quality, implementation, innovation and presentation, followed by result verification.',
    icon: ShieldCheck,
    tag: 'RIGOROUS AUDIT',
    accent: '#2E933C',
  },
  {
    step: '06',
    title: 'Grand Result Announcement',
    description: 'Announcement of the Hackathon, Codeathon and Ideathon results.',
    icon: Trophy,
    tag: 'TRI-ARENA RESULTS',
    accent: '#ECBA82',
  },
  {
    step: '07',
    title: 'Awards & Recognition',
    description: 'Recognition of outstanding participants and winning teams across all three competitions.',
    icon: Medal,
    tag: 'HONORS & PRIZES',
    accent: '#ECBA82',
  },
  {
    step: '08',
    title: 'Closing Ceremony',
    description: 'Formal conclusion of HackFest 3.0.',
    icon: Flag,
    tag: 'GRAND FINALE',
    accent: '#81C14B',
  },
];

export default function EventWorkflow() {
  return (
    <div className="event-workflow-section">
      {/* Workflow Header */}
      <div className="event-workflow-header center">
        <HoloBadge variant="teal" icon={GitBranch}>
          EVENT JOURNEY
        </HoloBadge>
        <h2 className="heading-section event-workflow-title">
          EVENT WORKFLOW
        </h2>
        <p className="event-workflow-lead">
          From competitive problem-solving to innovative solutions, explore the journey of HackFest 3.0.
        </p>
      </div>

      {/* Two Connected Visual Timelines */}
      <div className="event-workflow-grid">
        {/* DAY 1 COLUMN */}
        <div className="workflow-day-column workflow-day-1">
          <div className="workflow-day-banner">
            <div className="workflow-day-badge-wrap">
              <span className="workflow-day-indicator" style={{ background: '#81C14B' }} />
              <span className="workflow-day-label">DAY 01</span>
              <span className="workflow-stage-count">5 STAGES</span>
            </div>
            <h4 className="workflow-day-heading">DAY 1 — OPEN & COMPETE</h4>
            <div className="workflow-day-date">
              <Calendar size={13} color="#81C14B" />
              <span>Sunday, 1 November 2026</span>
            </div>
          </div>

          <ol className="workflow-timeline-track">
            {DAY1_WORKFLOW.map((stage, idx) => {
              const Icon = stage.icon;
              const isLast = idx === DAY1_WORKFLOW.length - 1;

              return (
                <li key={stage.step} className="workflow-stage-item">
                  <div className="workflow-node-col" aria-hidden="true">
                    <div className="workflow-node-circle" style={{ borderColor: stage.accent }}>
                      <span className="workflow-node-num">{stage.step}</span>
                    </div>
                    {!isLast && (
                      <div className="workflow-connector-line">
                        <ArrowDown size={11} className="workflow-connector-arrow" />
                      </div>
                    )}
                  </div>

                  <div className="workflow-stage-card">
                    <div className="workflow-card-top">
                      <div className="workflow-stage-icon-wrap" style={{ color: stage.accent }}>
                        <Icon size={16} />
                      </div>
                      <span className="workflow-stage-tag" style={{ color: stage.accent }}>
                        {stage.tag}
                      </span>
                    </div>

                    <h5 className="workflow-stage-title">{stage.title}</h5>
                    <p className="workflow-stage-desc">{stage.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Transition Indicator linking Day 1 to Day 2 */}
          <div className="workflow-transition-bridge">
            <div className="workflow-bridge-icon" aria-hidden="true">
              <ArrowRight size={14} className="bridge-arrow-desktop" />
              <ArrowDown size={14} className="bridge-arrow-mobile" />
            </div>
            <div className="workflow-bridge-content">
              <span className="workflow-bridge-label">OVERNIGHT SPRINT TRANSITION</span>
              <span className="workflow-bridge-text">Continuous build phase leading into Day 2 flagship arena</span>
            </div>
          </div>
        </div>

        {/* DAY 2 COLUMN */}
        <div className="workflow-day-column workflow-day-2">
          <div className="workflow-day-banner">
            <div className="workflow-day-badge-wrap">
              <span className="workflow-day-indicator" style={{ background: '#ECBA82' }} />
              <span className="workflow-day-label">DAY 02</span>
              <span className="workflow-stage-count">8 STAGES</span>
            </div>
            <h4 className="workflow-day-heading">DAY 2 — BUILD & CELEBRATE</h4>
            <div className="workflow-day-date">
              <Calendar size={13} color="#ECBA82" />
              <span>Monday, 2 November 2026</span>
            </div>
          </div>

          <ol className="workflow-timeline-track">
            {DAY2_WORKFLOW.map((stage, idx) => {
              const Icon = stage.icon;
              const isLast = idx === DAY2_WORKFLOW.length - 1;

              return (
                <li key={stage.step} className="workflow-stage-item">
                  <div className="workflow-node-col" aria-hidden="true">
                    <div className="workflow-node-circle" style={{ borderColor: stage.accent }}>
                      <span className="workflow-node-num">{stage.step}</span>
                    </div>
                    {!isLast && (
                      <div className="workflow-connector-line">
                        <ArrowDown size={11} className="workflow-connector-arrow" />
                      </div>
                    )}
                  </div>

                  <div className="workflow-stage-card">
                    <div className="workflow-card-top">
                      <div className="workflow-stage-icon-wrap" style={{ color: stage.accent }}>
                        <Icon size={16} />
                      </div>
                      <span className="workflow-stage-tag" style={{ color: stage.accent }}>
                        {stage.tag}
                      </span>
                    </div>

                    <h5 className="workflow-stage-title">{stage.title}</h5>
                    <p className="workflow-stage-desc">{stage.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
