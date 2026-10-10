import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CinematicIntro from '../components/cinematic/CinematicIntro';
import AnnouncementTicker from '../components/AnnouncementTicker';
import HeroSection from '../components/HeroSection';
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
      {/* 00. MARVEL CINEMATIC 3D INTRO SEQUENCE */}
      <CinematicIntro />

      {/* 00B. LIVE MISSION BROADCAST & ANNOUNCEMENTS */}
      <AnnouncementTicker />

      {/* 01. HERO / HOME */}
      <HeroSection />

      {/* 02. ABOUT EVENT */}
      <AboutSection />

      {/* 03. EVENT HIGHLIGHTS */}
      <HighlightsSection />

      {/* 04. COMPETITIONS (CODEATHON, IDEATHON, HACKATHON) */}
      <CompetitionsSection />

      {/* 05. PROBLEM STATEMENTS (6 CATEGORIES) */}
      <ProblemStatementsSection />

      {/* 06. SCHEDULE (DAY 1 & DAY 2) */}
      <ScheduleSection />

      {/* 07. HOW THE EVENT WORKS (3 WORKFLOWS) */}
      <HowItWorksSection />

      {/* 08. MENTORS & JUDGES */}
      <MentorsJudgesSection />

      {/* 09. PRIZES (THE FINAL VERDICT) */}
      <PrizesSection />

      {/* 10. RULES & FAQ */}
      <RulesFaqSection />

      {/* 11. SPONSORS */}
      <SponsorsSection />

      {/* 12. REGISTER */}
      <RegisterSection />
    </main>
  );
}
