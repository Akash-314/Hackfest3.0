import React from 'react';
import { Zap, Target, Eye, Globe } from 'lucide-react';
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
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
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
      </div>
    </section>
  );
}
