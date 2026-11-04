import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Trophy,
  Award,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 2rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        {/* Navigation Return */}
        <div style={{ marginBottom: '2rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#39FF88',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} />
            RETURN TO HOMEPAGE
          </Link>
        </div>

        {/* Closed Registration Hero Card */}
        <div
          style={{
            position: 'relative',
            borderRadius: '20px',
            border: '1px solid rgba(57, 255, 136, 0.3)',
            background: 'linear-gradient(165deg, rgba(14, 28, 20, 0.9) 0%, rgba(6, 12, 9, 0.98) 100%)',
            padding: '3.5rem 2.5rem',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(57, 255, 136, 0.08)',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(245, 196, 81, 0.12)',
              border: '1px solid #F5C451',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              boxShadow: '0 0 30px rgba(245, 196, 81, 0.25)',
            }}
          >
            <Trophy size={40} color="#F5C451" />
          </div>

          <span
            style={{
              display: 'inline-block',
              padding: '0.35rem 0.9rem',
              borderRadius: '9999px',
              background: 'rgba(57, 255, 136, 0.12)',
              border: '1px solid #39FF88',
              color: '#39FF88',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              marginBottom: '1rem',
            }}
          >
            COMPETITIONS CONCLUDED • REGISTRATION CLOSED
          </span>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              color: '#FFFFFF',
              marginBottom: '1rem',
              letterSpacing: '0.04em',
            }}
          >
            HackFest 3.0 Registrations Are Closed
          </h1>

          <p
            style={{
              color: 'rgba(255, 255, 255, 0.75)',
              fontSize: '1.02rem',
              lineHeight: 1.7,
              maxWidth: '560px',
              margin: '0 auto 2.25rem auto',
            }}
          >
            All competitive arenas — <strong>Hackathon</strong>, <strong>Codeathon</strong>, and <strong>Ideathon</strong> — have completed their live evaluation cycles. Official verified winners have been announced!
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              justifyContent: 'center',
            }}
          >
            <Link
              to="/#winners"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.8rem',
                fontSize: '0.88rem',
                fontFamily: 'var(--font-heading)',
                borderRadius: '8px',
              }}
            >
              <span>VIEW OFFICIAL WINNERS</span>
              <Trophy size={16} />
            </Link>

            <a
              href="https://drive.google.com/drive/folders/1s-6y-Ci_WsAHvzldH8gJpiyfMhs5GTmC"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.8rem',
                fontSize: '0.88rem',
                fontFamily: 'var(--font-heading)',
                borderRadius: '8px',
              }}
            >
              <span>ARENA HIGHLIGHTS</span>
              <Sparkles size={16} />
            </a>
          </div>

          <div
            style={{
              marginTop: '3rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: '#94A3B8',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
            }}
          >
            <ShieldCheck size={16} color="#39FF88" />
            <span>Already registered? Access your pass anytime via the <Link to="/dashboard" style={{ color: '#39FF88', textDecoration: 'underline' }}>Participant Dashboard</Link>.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
