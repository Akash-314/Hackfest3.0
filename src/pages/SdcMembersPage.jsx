import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sdcService } from '../services/sdcService';
import ProfileCard from '../components/ui/ProfileCard';
import HoloBadge from '../components/ui/HoloBadge';
import GlowCursor from '../components/ui/GlowCursor';
import {
  GraduationCap,
  Sparkles,
  Users,
  Shield,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

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

  const renderMemberCard = (member, categoryKey = 'faculty') => {
    const contactEmail = member.email || member.social_links?.email || 'sdc@recbanda.ac.in';
    const contactHref = `mailto:${contactEmail}`;

    const defaultAvatars = {
      faculty: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
      mentor: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
      coordinator: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600',
    };

    const avatar = member.avatarUrl || member.photo_url || defaultAvatars[categoryKey] || defaultAvatars.coordinator;
    const miniAvatar = member.miniAvatarUrl || avatar;
    const handle = member.handle || member.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

    const statusDefaults = {
      faculty: { status: 'Faculty Leadership', statusColor: '#F5C451', backdrop: '#282015' },
      mentor: { status: 'Technical Mentor', statusColor: '#63E6D1', backdrop: '#10262b' },
      coordinator: { status: 'Event Coordinator', statusColor: '#10B981', backdrop: '#1f162b' },
    };

    const currentStatus = member.status || statusDefaults[categoryKey]?.status || 'Active Member';
    const currentStatusColor = member.statusColor || statusDefaults[categoryKey]?.statusColor || '#10B981';
    const currentBackdrop = member.backdropColor || statusDefaults[categoryKey]?.backdrop || '#141824';

    return (
      <div key={member.id} className="sdc-profile-card-wrapper" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <ProfileCard
          avatarUrl={avatar}
          miniAvatarUrl={miniAvatar}
          name={member.name}
          title={member.role_title}
          handle={handle}
          status={currentStatus}
          statusColor={currentStatusColor}
          contactText="Contact"
          contactHref={contactHref}
          backdropColor={currentBackdrop}
          theme="dark"
          holo={0.82}
          glare={0.48}
          tiltStrength={11}
          parallax={8}
          enableTilt={true}
          radius={16}
        />
      </div>
    );
  };

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem', position: 'relative' }}>
      <div className="glow-cursor-background-layer" aria-hidden="true">
        <GlowCursor
          color="#81C14B"
          secondaryColor="#2E933C"
          intensity={0.8}
          trailWidth={2.5}
          linger={0.9}
          glow={0.8}
          hotspot={0.35}
          followSpeed={0.65}
          grain={0}
          clickBurst={false}
          quality="medium"
          theme="dark"
          maxDevicePixelRatio={1.5}
        />
      </div>
      <div className="container" style={{ maxWidth: '1200px', position: 'relative', zIndex: 1 }}>
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
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 340px))',
                    gap: '2.5rem',
                    justifyContent: 'center',
                    alignItems: 'start',
                  }}
                >
                  {members.faculty.map((member) => renderMemberCard(member, 'faculty'))}
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
                    MENTORS ({members.mentors.length})
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
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                    gap: '2.5rem',
                    justifyContent: 'center',
                    alignItems: 'start',
                  }}
                >
                  {members.mentors.map((member) => renderMemberCard(member, 'mentor'))}
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
                    COORDINATORS ({members.coordinators.length})
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
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                    gap: '2.5rem',
                    justifyContent: 'center',
                    alignItems: 'start',
                  }}
                >
                  {members.coordinators.map((member) => renderMemberCard(member, 'coordinator'))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
