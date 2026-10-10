import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ScheduleSection from '../components/ScheduleSection';
import HowItWorksSection from '../components/HowItWorksSection';

export default function SchedulePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1rem)' }}>
      <div className="container" style={{ paddingTop: '1.5rem' }}>
        <Link
          to="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-warm-amber)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
        >
          <ArrowLeft size={16} />
          RETURN TO HOME
        </Link>
      </div>
      <ScheduleSection />
      <HowItWorksSection />
    </div>
  );
}
