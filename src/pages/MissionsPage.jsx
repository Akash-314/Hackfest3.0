import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProblemStatementsSection from '../components/ProblemStatementsSection';

export default function MissionsPage() {
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
      <ProblemStatementsSection />
    </div>
  );
}
