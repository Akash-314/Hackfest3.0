import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import { eventMeta } from '../data/eventData';
import { eventService } from '../services/eventService';

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

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="footer" style={{ borderTop: '1px solid rgba(0, 191, 255, 0.25)', background: 'linear-gradient(180deg, rgba(8, 11, 18, 0.95) 0%, rgba(5, 7, 13, 1) 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* Top ambient glow line */}
      <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg, transparent, #00BFFF, transparent)' }} />

      <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: '4rem', paddingBottom: '3rem' }}>
        <div className="footer-grid">
          {/* Col 1: Brand & Organization */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.2rem' }}>
              <div style={{ position: 'relative', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 40 40" width="34" height="34">
                  <polygon points="20,2 38,12 33,34 20,39 7,34 2,12" fill="rgba(230, 36, 41, 0.2)" stroke="#E62429" strokeWidth="2" />
                  <circle cx="20" cy="20" r="8" fill="rgba(0, 191, 255, 0.25)" stroke="#00BFFF" strokeWidth="1.5" />
                  <circle cx="20" cy="20" r="3" fill="#00BFFF" />
                </svg>
              </div>
              <h3 className="heading-display" style={{ fontSize: '1.5rem', letterSpacing: '0.06em', color: '#F5F7FA' }}>
                {eventMeta.name}
              </h3>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.92rem', marginBottom: '1.2rem', lineHeight: '1.6' }}>
              Orchestrated by the <strong>Student Developer Club (SDC)</strong> at {eventMeta.institution}.
              A premier high-tech proving ground for the next generation of builders and problem solvers.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              <MapPin size={15} color="var(--color-stark-gold)" />
              <span>{meta.venueShort}</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="footer-col-title" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-arc-blue)', letterSpacing: '0.1em' }}>
              QUICK LINKS
            </h4>
            <ul className="footer-links">
              <li><Link to="/" onClick={() => scrollTo('hero')}>Home</Link></li>
              <li><Link to="/about" onClick={() => scrollTo('about')}>About Event</Link></li>
              <li><Link to="/competitions" onClick={() => scrollTo('competitions')}>Competitions</Link></li>
              <li><Link to="/missions" onClick={() => scrollTo('problems')}>Problem Statements</Link></li>
              <li><Link to="/schedule" onClick={() => scrollTo('schedule')}>Event Schedule</Link></li>
              <li><Link to="/prizes" onClick={() => scrollTo('prizes')}>Prizes & Awards</Link></li>
              <li><Link to="/faq" onClick={() => scrollTo('faq')}>Rules & FAQs</Link></li>
            </ul>
          </div>

          {/* Col 3: Arenas */}
          <div>
            <h4 className="footer-col-title" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-stark-gold)', letterSpacing: '0.1em' }}>
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
            <h4 className="footer-col-title" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-energy-red)', letterSpacing: '0.1em' }}>
              CONNECT WITH US
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', marginBottom: '1rem', lineHeight: '1.5' }}>
              Connect with SDC community channels for real-time announcements, updates, and coordination.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {/* Instagram */}
              <a
                href={eventMeta.socials.instagram}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '0.55rem',
                  background: 'rgba(13, 17, 26, 0.8)',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href={eventMeta.socials.linkedin}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '0.55rem',
                  background: 'rgba(13, 17, 26, 0.8)',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
                aria-label="LinkedIn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect width="4" height="12" x="2" y="9"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href={eventMeta.socials.x}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '0.55rem',
                  background: 'rgba(13, 17, 26, 0.8)',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
                aria-label="X / Twitter"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* Email */}
              <a
                href={`mailto:${meta.contactEmail}`}
                style={{
                  padding: '0.55rem',
                  background: 'rgba(13, 17, 26, 0.8)',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
              EMAIL: <a href={`mailto:${meta.contactEmail}`} style={{ color: 'var(--color-arc-blue)' }}>{meta.contactEmail}</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Stark Status */}
        <div className="footer-bottom" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem', marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#64748B' }}>
            © {CURRENT_YEAR} {eventMeta.name} • STUDENT DEVELOPER CLUB (REC BANDA). ALL RIGHTS RESERVED.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
            <span style={{ color: 'var(--color-arc-blue)' }}>GRID: ONLINE // VER 3.0</span>
            <span style={{ color: 'var(--color-stark-gold)' }}>REBUILD THE FUTURE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
