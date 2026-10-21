import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Trophy, Layers, Workflow, FileText, Sparkles, ChevronRight } from 'lucide-react';
import CompetitionsSection from './CompetitionsSection';
import ProblemStatementsSection from './ProblemStatementsSection';
import HowItWorksSection from './HowItWorksSection';
import RulesFaqSection from './RulesFaqSection';
import HoloBadge from './ui/HoloBadge';
import './CompetitionsHub.css';

export default function CompetitionsHub() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('arenas');

  // Sync tab with URL hash for anchor navigation (#competitions, #problems, #missions, #how-it-works, #rules, #faq)
  useEffect(() => {
    const hash = (location.hash || '').toLowerCase().replace('#', '');
    if (hash === 'problems' || hash === 'missions' || hash === 'tracks') {
      setActiveTab('problems');
    } else if (hash === 'how-it-works' || hash === 'process' || hash === 'workflow') {
      setActiveTab('workflow');
    } else if (hash === 'rules' || hash === 'faq') {
      setActiveTab('rules');
    } else if (hash === 'competitions' || hash === 'arenas') {
      setActiveTab('arenas');
    }
  }, [location.hash]);

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    const anchorMap = {
      arenas: 'competitions',
      problems: 'problems',
      workflow: 'how-it-works',
      rules: 'rules',
    };
    const targetAnchor = anchorMap[tabKey] || tabKey;
    window.history.replaceState(null, '', `#${targetAnchor}`);
  };

  const tabs = [
    {
      id: 'arenas',
      label: 'ARENAS & TRACKS',
      sublabel: 'Codeathon • Ideathon • Hackathon',
      badge: '3 EVENTS',
      icon: Trophy,
      color: '#81C14B',
    },
    {
      id: 'problems',
      label: 'PROBLEM STATEMENTS',
      sublabel: 'Official Technical Challenges',
      badge: '6 TRACKS',
      icon: Layers,
      color: '#39FF88',
    },
    {
      id: 'workflow',
      label: 'HOW IT WORKS',
      sublabel: 'Process & Stages',
      badge: 'GUIDE',
      icon: Workflow,
      color: '#ECBA82',
    },
    {
      id: 'rules',
      label: 'RULES & FAQS',
      sublabel: 'Guidelines & Rulebook PDF',
      badge: 'OFFICIAL',
      icon: FileText,
      color: '#F5C451',
    },
  ];

  return (
    <div className="competitions-unified-hub-wrapper" style={{ position: 'relative' }}>
      {/* Target Anchors for flawless URL hash jumps */}
      <div id="competitions" className="hub-anchor-target" />
      <div id="problems" className="hub-anchor-target" />
      <div id="missions" className="hub-anchor-target" />
      <div id="tracks" className="hub-anchor-target" />
      <div id="how-it-works" className="hub-anchor-target" />
      <div id="rules" className="hub-anchor-target" />
      <div id="faq" className="hub-anchor-target" />

      {/* Main Command Hub Header & Clickable Category Bar */}
      <div className="container" style={{ position: 'relative', zIndex: 10, paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="hub-nav-banner">
          <div className="hub-nav-meta-top">
            <HoloBadge variant="gold" icon={Sparkles}>
              COMPETITIONS & CHALLENGES COMMAND CENTER
            </HoloBadge>
            <span className="hub-click-instruction">CLICK A CATEGORY TO SWITCH ARENA VIEW</span>
          </div>

          <div className="hub-tabs-grid" role="tablist" aria-label="Competition Hub Categories">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`hub-panel-${tab.id}`}
                  id={`hub-tab-${tab.id}`}
                  className={`hub-category-card ${isActive ? 'active' : ''}`}
                  onClick={() => handleTabClick(tab.id)}
                >
                  <div className="hub-category-card-top">
                    <div className="hub-category-icon-box" style={{ color: tab.color }}>
                      <Icon size={20} />
                    </div>
                    <span className="hub-category-badge" style={{ borderColor: `${tab.color}44`, color: tab.color }}>
                      {tab.badge}
                    </span>
                  </div>

                  <div className="hub-category-card-body">
                    <span className="hub-category-title">{tab.label}</span>
                    <span className="hub-category-sublabel">{tab.sublabel}</span>
                  </div>

                  <div className="hub-category-active-bar" style={{ background: tab.color }} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Tab Panes */}
      <div className="hub-content-view">
        {activeTab === 'arenas' && (
          <div id="hub-panel-arenas" role="tabpanel" aria-labelledby="hub-tab-arenas" className="hub-tab-fade-in">
            <CompetitionsSection />
          </div>
        )}

        {activeTab === 'problems' && (
          <div id="hub-panel-problems" role="tabpanel" aria-labelledby="hub-tab-problems" className="hub-tab-fade-in">
            <ProblemStatementsSection />
          </div>
        )}

        {activeTab === 'workflow' && (
          <div id="hub-panel-workflow" role="tabpanel" aria-labelledby="hub-tab-workflow" className="hub-tab-fade-in">
            <HowItWorksSection />
          </div>
        )}

        {activeTab === 'rules' && (
          <div id="hub-panel-rules" role="tabpanel" aria-labelledby="hub-tab-rules" className="hub-tab-fade-in">
            <RulesFaqSection />
          </div>
        )}
      </div>
    </div>
  );
}
