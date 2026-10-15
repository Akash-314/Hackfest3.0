import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import { eventMeta } from '../data/eventData';
import { eventService } from '../services/eventService';
import sdcLogo from '../assets/logo.png';
import aktuLogo from '../assets/aktu-logo.png';
import innovationHubLogo from '../assets/innovation-hub-logo.png';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  const [meta, setMeta] = useState(eventMeta);

  useEffect(() => {
    let isMounted = true;
    eventService.getSettings().then((res) => {
      if (isMounted && res) setMeta(res);
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <footer
      className="footer"
      style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.07)',
        background: 'linear-gradient(180deg, #0D1017 0%, #08090D 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top subtle highlight reflection line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '15%',
          right: '15%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(99, 230, 209, 0.35), transparent)',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: '4rem', paddingBottom: '3rem' }}>
        <div className="footer-grid">
          {/* Col 1: Brand & Organization */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.2rem' }}>
              <h3 className="heading-display" style={{ fontSize: '1.5rem', letterSpacing: '0.04em', color: '#F5F5F7', margin: 0 }}>
                HACKFEST <span style={{ color: '#63E6D1' }}>3.0</span>
              </h3>
            </div>
            <p style={{ color: '#A1A6B3', fontSize: '0.9rem', marginBottom: '1.2rem', lineHeight: '1.6' }}>
              Orchestrated by the <strong>Student Developer Club (SDC)</strong> at {eventMeta.institution}.
              A premier technology proving ground for the next generation of builders and problem solvers.
            </p>

            {/* Institutional Partner Logos */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
              <a
                href="https://sdcrecbanda.in"
                target="_blank"
                rel="noreferrer"
                title="Student Developer Club (SDC)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <img src={sdcLogo} alt="SDC" style={{ height: '24px', width: 'auto', objectFit: 'contain' }} />
              </a>

              <a
                href="https://aktu.ac.in"
                target="_blank"
                rel="noreferrer"
                title="Dr. A.P.J. Abdul Kalam Technical University, Lucknow"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <img src={aktuLogo} alt="AKTU Lucknow" style={{ height: '26px', width: 'auto', objectFit: 'contain' }} />
              </a>

              <div
                title="Innovation Hub Uttar Pradesh"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.92)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}
              >
                <img src={innovationHubLogo} alt="Innovation Hub Uttar Pradesh" style={{ height: '22px', width: 'auto', objectFit: 'contain' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#747B89', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              <MapPin size={15} color="#63E6D1" />
              <span>{meta.venueShort}</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="footer-col-title" style={{ fontFamily: 'var(--font-heading)', color: '#63E6D1', letterSpacing: '0.1em' }}>
              QUICK LINKS
            </h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Event</Link></li>
              <li><Link to="/competitions">Competitions</Link></li>
              <li><Link to="/problems">Problem Statements</Link></li>
              <li><Link to="/schedule">Event Schedule</Link></li>
              <li><Link to="/prizes">Prizes & Awards</Link></li>
              <li><Link to="/sponsors">Sponsors</Link></li>
              <li><Link to="/leaderboard">Leaderboard</Link></li>
              <li><Link to="/faq">Rules & FAQs</Link></li>
            </ul>
          </div>

          {/* Col 3: Arenas */}
          <div>
            <h4 className="footer-col-title" style={{ fontFamily: 'var(--font-heading)', color: '#C7CED8', letterSpacing: '0.1em' }}>
              COMPETITIONS
            </h4>
            <ul className="footer-links">
              <li><Link to="/codeathon">Codeathon (Speed Coding)</Link></li>
              <li><Link to="/ideathon">Ideathon (Innovation Lab)</Link></li>
              <li><Link to="/hackathon">Flagship 48H Hackathon</Link></li>
              <li><Link to="/register">Event Registration</Link></li>
              <li><Link to="/sponsors">Sponsors & Partners</Link></li>
            </ul>
          </div>

          {/* Col 4: Community & Connect */}
          <div>
            <h4 className="footer-col-title" style={{ fontFamily: 'var(--font-heading)', color: '#9B8AFB', letterSpacing: '0.1em' }}>
              CONNECT WITH US
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#A1A6B3', marginBottom: '1rem', lineHeight: '1.5' }}>
              Connect with SDC community channels for real-time announcements, updates, and coordination.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {/* Instagram */}
              <a
                href={eventMeta.socials.instagram}
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F5F5F7',
                  transition: 'all 0.2s ease',
                }}
                title="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href={eventMeta.socials.linkedin}
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F5F5F7',
                  transition: 'all 0.2s ease',
                }}
                title="LinkedIn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>

              {/* GitHub */}
              <a
                href={eventMeta.socials.github}
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F5F5F7',
                  transition: 'all 0.2s ease',
                }}
                title="GitHub"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#A1A6B3', fontSize: '0.84rem' }}>
              <Mail size={14} color="#63E6D1" />
              <a href={`mailto:${meta?.contactEmail || eventMeta.contactEmail || 'sdc@recbanda.ac.in'}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                {meta?.contactEmail || eventMeta.contactEmail || 'sdc@recbanda.ac.in'}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            marginTop: '3.5rem',
            paddingTop: '1.8rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ fontSize: '0.82rem', color: '#747B89', fontFamily: 'var(--font-mono)' }}>
            © {CURRENT_YEAR} HACKFEST 3.0 • STUDENT DEVELOPER CLUB (SDC), REC BANDA
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: '#747B89' }}>
            <Link to="/rules" style={{ color: 'inherit', textDecoration: 'none' }}>Event Rules</Link>
            <Link to="/faq" style={{ color: 'inherit', textDecoration: 'none' }}>FAQs</Link>
            <Link to="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
