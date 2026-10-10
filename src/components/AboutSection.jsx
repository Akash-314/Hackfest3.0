import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Zap, Target, Eye, Globe } from 'lucide-react';
import SuperheroPanel from './ui/SuperheroPanel';
import HoloBadge from './ui/HoloBadge';

export default function AboutSection() {
  const briefingPillars = [
    {
      code: 'PILLAR 01',
      title: 'MISSION',
      desc: 'To cultivate engineering excellence, creative problem-solving, and algorithmic mastery.',
      icon: Target,
      variant: 'blue',
    },
    {
      code: 'PILLAR 02',
      title: 'VISION',
      desc: 'Empowering the next generation of builders to create scalable, impactful technology for real-world challenges.',
      icon: Eye,
      variant: 'red',
    },
    {
      code: 'PILLAR 03',
      title: 'OBJECTIVE',
      desc: '48 continuous hours of collaborative coding, mentorship, and project evaluations at the Multipurpose Hall.',
      icon: Zap,
      variant: 'gold',
    },
    {
      code: 'PILLAR 04',
      title: 'WHO CAN JOIN',
      desc: 'Open to undergraduate and postgraduate students pan-India across engineering, science, and design disciplines.',
      icon: Globe,
      variant: 'green',
    },
  ];

  return (
    <section id="about" className="section about-section marvel-briefing-section">
      <div className="section-transition-top" />
      <div className="container">
        {/* Header Telemetry */}
        <div className="section-header">
          <HoloBadge variant="gold">
            ABOUT THE EVENT
          </HoloBadge>
          <h2 className="heading-section marvel-section-title">
            ABOUT HACKFEST 3.0
          </h2>
          <p className="section-lead">
            Organized by the <strong>Student Developer Club (SDC)</strong> at <strong>Rajkiya Engineering College, Banda</strong>, HackFest 3.0 is a premier college hackathon where creativity, passion, and engineering combine to build real-world solutions.
          </p>
        </div>

        {/* 4-Card Pillar Grid */}
        <div className="briefing-hud-grid">
          {briefingPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <SuperheroPanel
                key={pillar.title}
                variant={pillar.variant}
                tag={pillar.code}
                issueNumber={pillar.title}
                className="briefing-hud-card"
              >
                <div className="briefing-card-content">
                  <div className="briefing-icon-wrap" style={{ width: 44, height: 44, borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem' }}>
                    <Icon size={24} />
                  </div>
                  <h3 className="heading-display" style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '0.4rem' }}>
                    {pillar.title}
                  </h3>
                  <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: '1.6' }}>
                    {pillar.desc}
                  </p>
                </div>
              </SuperheroPanel>
            );
          })}
        </div>

        {/* Base Overview Card */}
        <div className="briefing-base-overview" style={{ marginTop: '2.5rem' }}>
          <SuperheroPanel variant="blue" tag="HOST CAMPUS // REC BANDA" issueNumber="SDC REC BANDA">
            <div className="briefing-base-layout">
              <div className="briefing-base-img-col">
                <img
                  src="/images/about-sdc.jpg"
                  alt="Student developers collaborating at REC Banda"
                  className="briefing-base-img"
                  loading="lazy"
                />
              </div>
              <div className="briefing-base-info-col">
                <span className="chapter-badge" style={{ margin: '0 0 0.6rem 0' }}>
                  STUDENT DEVELOPER CLUB
                </span>
                <h3 className="heading-display" style={{ fontSize: '1.7rem', color: '#FFFFFF', marginBottom: '0.8rem' }}>
                  REC BANDA DEVELOPER COMMUNITY
                </h3>
                <p style={{ color: '#94A3B8', fontSize: '0.94rem', lineHeight: '1.65', marginBottom: '1.4rem' }}>
                  Founded at REC Banda, the Student Developer Club drives open-source innovation, system architecture research, and collegiate technical growth. HackFest 3.0 represents our most ambitious convergence of talent, industry mentors, and experienced judges.
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link to="/about" className="btn btn-secondary">
                    LEARN MORE ABOUT SDC
                    <ArrowUpRight size={16} />
                  </Link>
                  <Link to="/register" className="btn btn-avenger">
                    REGISTER NOW
                  </Link>
                </div>
              </div>
            </div>
          </SuperheroPanel>
        </div>
      </div>
    </section>
  );
}
