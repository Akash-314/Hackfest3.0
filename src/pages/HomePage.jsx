import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// All Previous Sections (Scrollable below interactive hero)
import HeroSection from '../components/HeroSection';
import AnnouncementTicker from '../components/AnnouncementTicker';
import AboutSection from '../components/AboutSection';
import HighlightsSection from '../components/HighlightsSection';
import CompetitionsSection from '../components/CompetitionsSection';
import ProblemStatementsSection from '../components/ProblemStatementsSection';
import ScheduleSection from '../components/ScheduleSection';
import HowItWorksSection from '../components/HowItWorksSection';
import MentorsJudgesSection from '../components/MentorsJudgesSection';
import PrizesSection from '../components/PrizesSection';
import RulesFaqSection from '../components/RulesFaqSection';
import SponsorsSection from '../components/SponsorsSection';
import RegisterSection from '../components/RegisterSection';

export default function HomePage() {
  const location = useLocation();

  // Smooth scroll handler for anchor links (#about, #competitions, etc.)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <main>
      {/* 01. FULL-SCREEN INTERACTIVE HERO: DOOM × IRON MAN REVEAL + HACKFEST 3.0 */}
      <HeroSection />

      {/* 02. ANNOUNCEMENTS TICKER */}
      <div id="announcements">
        <AnnouncementTicker />
      </div>

      {/* 03. ABOUT EVENT */}
      <AboutSection />

      {/* 04. EVENT HIGHLIGHTS */}
      <HighlightsSection />

      {/* 05. COMPETITIONS (CODEATHON, IDEATHON, HACKATHON) */}
      <CompetitionsSection />

      {/* 06. PROBLEM STATEMENTS / TRACKS */}
      <ProblemStatementsSection />

      {/* 07. SCHEDULE */}
      <ScheduleSection />

      {/* 08. HOW IT WORKS */}
      <HowItWorksSection />

      {/* 09. MENTORS & JUDGES */}
      <MentorsJudgesSection />

      {/* 10. PRIZES */}
      <PrizesSection />

      {/* 11. RULES & FAQ */}
      <RulesFaqSection />

      {/* 12. SPONSORS */}
      <SponsorsSection />

      {/* 13. REGISTER */}
      <RegisterSection />
    </main>
  );
}
