import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sdcService } from '../services/sdcService';
import SuperheroPanel from '../components/ui/SuperheroPanel';
import HoloBadge from '../components/ui/HoloBadge';
import {
  GraduationCap,
  Sparkles,
  Users,
  Mail,
  ExternalLink,
  Shield,
  ArrowLeft,
  User,
  RefreshCw,
} from 'lucide-react';

function LinkedInIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GitHubIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

export default function SdcMembersPage() {
  const [members, setMembers] = useState({
    faculty: [],
    mentors: [],
    coordinators: [],
    all: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await sdcService.getPublicMembers();
      setMembers(data);
    } catch (err) {
      console.error('Failed to load SDC members:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderSocialIcon = (key, url) => {
    const k = key.toLowerCase();
    let Icon = ExternalLink;
    if (k.includes('linkedin')) Icon = LinkedInIcon;
    else if (k.includes('github')) Icon = GitHubIcon;
    else if (k.includes('email') || k.includes('mail')) Icon = Mail;

    const href = k.includes('email') && !url.startsWith('mailto:') ? `mailto:${url}` : url;

    return (
      <a
        key={key}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={key.toUpperCase()}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '4px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: 'var(--color-tech-white)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-stark-gold)';
          e.currentTarget.style.color = 'var(--color-stark-gold)';
          e.currentTarget.style.background = 'rgba(245, 182, 66, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
          e.currentTarget.style.color = 'var(--color-tech-white)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        }}
      >
        <Icon size={16} />
      </a>
    );
  };

  const renderMemberCard = (member, variant = 'gold', tagPrefix = 'SDC') => {
    const socialEntries = Object.entries(member.social_links || {}).filter(
      ([_, url]) => url && typeof url === 'string' && url.trim().length > 0
    );

    return (
      <SuperheroPanel
        key={member.id}
        variant={variant}
        tag={`${tagPrefix} // #${String(member.sort_order || 1).padStart(2, '0')}`}
        issueNumber="SDC"
        className="mentor-card sdc-profile-card"
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {/* Photo & Header */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
          {/* Member Photograph with fallback */}
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '8px',
              overflow: 'hidden',
              flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
              border: variant === 'gold' ? '1px solid var(--color-stark-gold)' : '1px solid var(--color-arc-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
            }}
          >
            {member.photo_url ? (
              <img
                src={member.photo_url}
                alt={member.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement.innerHTML = '<div style="color: var(--color-stark-gold); display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path></svg></div>';
                }}
              />
            ) : (
              <User size={36} color={variant === 'gold' ? 'var(--color-stark-gold)' : 'var(--color-arc-blue)'} />
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                color: '#FFFFFF',
                margin: '0 0 0.25rem 0',
                letterSpacing: '0.03em',
                lineHeight: 1.2,
              }}
            >
              {member.name}
            </h3>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: variant === 'gold' ? 'var(--color-stark-gold)' : 'var(--color-arc-blue)',
                fontWeight: 600,
                lineHeight: 1.35,
              }}
            >
              {member.role_title}
            </div>
          </div>
        </div>

        {/* Bio / Responsibility */}
        {member.bio && (
          <p
            style={{
              color: '#94A3B8',
              fontSize: '0.86rem',
              lineHeight: '1.55',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '0.75rem',
              margin: '0 0 1rem 0',
              flex: 1,
            }}
          >
            {member.bio}
          </p>
        )}

        {/* Social / Profile Links */}
        {socialEntries.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginTop: 'auto',
              paddingTop: '0.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {socialEntries.map(([k, u]) => renderSocialIcon(k, u))}
          </div>
        )}
      </SuperheroPanel>
    );
  };

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--color-warm-amber)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              textDecoration: 'none',
              letterSpacing: '0.05em',
            }}
          >
            <ArrowLeft size={16} />
            BACK TO HOME
          </Link>
        </div>

        {/* Page Hero Header */}
        <div className="section-header center" style={{ marginBottom: '3.5rem' }}>
          <HoloBadge variant="gold" icon={Shield}>
            STUDENT DEVELOPER CLUB // REC BANDA
          </HoloBadge>
          <h1 className="heading-section marvel-section-title" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)' }}>
            SDC TEAM & ORGANIZERS
          </h1>
          <p className="section-lead" style={{ maxWidth: '780px', margin: '0 auto' }}>
            Meet the team behind HackFest 3.0: distinguished faculty leadership, mentors,
            and passionate student coordinators dedicated to fostering technological excellence at Rajkiya Engineering College, Banda.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-soft-gray)' }}>
            <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 1rem auto', display: 'block', color: 'var(--color-warm-amber)' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>
              LOADING SDC TEAM PROFILES...
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
            {/* ============================================================== */}
            {/* 1. FACULTY COORDINATOR SECTION (FIRST PER MANDATE)              */}
            {/* ============================================================== */}
            <section aria-labelledby="heading-faculty">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid rgba(245, 182, 66, 0.3)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    background: 'rgba(245, 182, 66, 0.15)',
                    border: '1px solid var(--color-stark-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-stark-gold)',
                  }}
                >
                  <GraduationCap size={20} />
                </div>
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-stark-gold)', letterSpacing: '0.12em' }}>
                    FACULTY LEADERSHIP
                  </span>
                  <h2
                    id="heading-faculty"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.65rem',
                      color: 'var(--color-warm-off-white)',
                      margin: 0,
                    }}
                  >
                    FACULTY COORDINATOR
                  </h2>
                </div>
              </div>

              {members.faculty.length === 0 ? (
                <div
                  style={{
                    padding: '2.5rem',
                    textAlign: 'center',
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: '1px dashed rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: 'var(--text-muted)',
                  }}
                >
                  Faculty coordinator profile is being updated.
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                    gap: '1.5rem',
                    maxWidth: members.faculty.length === 1 ? '680px' : '100%',
                  }}
                >
                  {members.faculty.map((member) => renderMemberCard(member, 'gold', 'FACULTY'))}
                </div>
              )}
            </section>

            {/* ============================================================== */}
            {/* 2. MENTORS SECTION (SECOND PER MANDATE)                         */}
            {/* ============================================================== */}
            <section aria-labelledby="heading-mentors">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid rgba(0, 191, 255, 0.3)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    background: 'rgba(0, 191, 255, 0.15)',
                    border: '1px solid var(--color-arc-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-arc-blue)',
                  }}
                >
                  <Sparkles size={20} />
                </div>
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-arc-blue)', letterSpacing: '0.12em' }}>
                    TIER 02 // TECHNICAL GUIDANCE
                  </span>
                  <h2
                    id="heading-mentors"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.65rem',
                      color: 'var(--color-warm-off-white)',
                      margin: 0,
                    }}
                  >
                    MENTORS
                  </h2>
                </div>
              </div>

              {members.mentors.length === 0 ? (
                <div
                  style={{
                    padding: '2.5rem',
                    textAlign: 'center',
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: '1px dashed rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: 'var(--text-muted)',
                  }}
                >
                  Technical mentors currently being inducted into the registry.
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                    gap: '1.5rem',
                  }}
                >
                  {members.mentors.map((member) => renderMemberCard(member, 'blue', 'MENTOR'))}
                </div>
              )}
            </section>

            {/* ============================================================== */}
            {/* 3. COORDINATORS SECTION (THIRD PER MANDATE)                     */}
            {/* ============================================================== */}
            <section aria-labelledby="heading-coordinators">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid rgba(230, 36, 41, 0.3)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    background: 'rgba(230, 36, 41, 0.15)',
                    border: '1px solid var(--color-muted-crimson)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffb4b7',
                  }}
                >
                  <Users size={20} />
                </div>
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#ffb4b7', letterSpacing: '0.12em' }}>
                    TIER 03 // STUDENT EXECUTIVE CORPS
                  </span>
                  <h2
                    id="heading-coordinators"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.65rem',
                      color: 'var(--color-warm-off-white)',
                      margin: 0,
                    }}
                  >
                    COORDINATORS
                  </h2>
                </div>
              </div>

              {members.coordinators.length === 0 ? (
                <div
                  style={{
                    padding: '2.5rem',
                    textAlign: 'center',
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: '1px dashed rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: 'var(--text-muted)',
                  }}
                >
                  Student coordinators roster being updated.
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                    gap: '1.5rem',
                  }}
                >
                  {members.coordinators.map((member) => renderMemberCard(member, 'crimson', 'COORDINATOR'))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
