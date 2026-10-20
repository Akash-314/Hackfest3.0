import React, { useState, useEffect } from 'react';
import { sdcService } from '../services/sdcService';
import ProfileCard from './ui/ProfileCard';
import HoloBadge from './ui/HoloBadge';
import {
  GraduationCap,
  Sparkles,
  Users,
  Shield,
  RefreshCw,
  HeartHandshake,
} from 'lucide-react';

export default function SdcMembersSection() {
  const [members, setMembers] = useState({
    faculty: [],
    mentors: [],
    coordinators: [],
    volunteers: [],
    all: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchMembers() {
      try {
        const data = await sdcService.getPublicMembers();
        if (isMounted && data) {
          setMembers({
            faculty: data.faculty || [],
            mentors: data.mentors || [],
            coordinators: data.coordinators || [],
            volunteers: data.volunteers || [],
            all: data.all || [],
          });
        }
      } catch (err) {
        console.error('Failed to load SDC members:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchMembers();
    return () => {
      isMounted = false;
    };
  }, []);

  const renderMemberCard = (member, categoryKey = 'faculty') => {
    const isFaculty = categoryKey === 'faculty' || member.category === 'faculty_coordinator';

    // Social links (all optional, validated inside ProfileCard)
    const linkedinUrl = member.social_links?.linkedin || member.linkedin_url || null;
    const githubUrl = member.social_links?.github || member.github_url || null;
    const contactEmail = member.public_contact_email || member.email || member.social_links?.email || null;

    const defaultAvatars = {
      faculty: '/images/faculty/dr_vibhash_yadav.png',
      mentor: '/images/sdc-avatar-placeholder.svg',
      coordinator: '/images/sdc-avatar-placeholder.svg',
      volunteer: '/images/sdc-avatar-placeholder.svg',
    };

    const avatar = member.avatarUrl || member.photo_url || defaultAvatars[categoryKey] || defaultAvatars.coordinator;
    const miniAvatar = member.miniAvatarUrl || avatar;
    const handle = isFaculty ? null : (member.handle || member.name.toLowerCase().replace(/[^a-z0-9]/g, '_'));

    const statusDefaults = {
      faculty: { status: 'Faculty Leadership', statusColor: '#F5C451', backdrop: '#282015' },
      mentor: { status: 'Technical Mentor', statusColor: '#39FF88', backdrop: '#0B1711' },
      coordinator: { status: 'Event Coordinator', statusColor: '#10B981', backdrop: '#1f162b' },
      volunteer: { status: 'SDC Volunteer', statusColor: '#A78BFA', backdrop: '#1c152b' },
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
          linkedinUrl={linkedinUrl}
          githubUrl={githubUrl}
          contactEmail={contactEmail}
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
    <section id="sdc-members" className="section sdc-members-section" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="container" style={{ maxWidth: '1200px', position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div className="section-header center" style={{ marginBottom: '3.5rem' }}>
          <HoloBadge variant="gold" icon={Shield}>
            STUDENT DEVELOPER CLUB • REC BANDA
          </HoloBadge>
          <h2 className="heading-section marvel-section-title" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)' }}>
            SDC TEAM & ORGANIZERS
          </h2>
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
            {/* 1. FACULTY COORDINATOR */}
            <div aria-labelledby="heading-faculty-sec">
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
                  <h3
                    id="heading-faculty-sec"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.65rem',
                      color: 'var(--color-warm-off-white)',
                      margin: 0,
                    }}
                  >
                    FACULTY COORDINATOR
                  </h3>
                </div>
              </div>

              {members.faculty.length > 0 && (
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
            </div>

            {/* 2. MENTORS */}
            {members.mentors.length > 0 && (
              <div aria-labelledby="heading-mentors-sec">
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
                      TECHNICAL ADVISORS
                    </span>
                    <h3
                      id="heading-mentors-sec"
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.65rem',
                        color: 'var(--color-warm-off-white)',
                        margin: 0,
                      }}
                    >
                      MENTORS ({members.mentors.length})
                    </h3>
                  </div>
                </div>

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
              </div>
            )}

            {/* 3. COORDINATORS */}
            {members.coordinators.length > 0 && (
              <div aria-labelledby="heading-coordinators-sec">
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
                      STUDENT LEADERSHIP
                    </span>
                    <h3
                      id="heading-coordinators-sec"
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.65rem',
                        color: 'var(--color-warm-off-white)',
                        margin: 0,
                      }}
                    >
                      STUDENT COORDINATORS ({members.coordinators.length})
                    </h3>
                  </div>
                </div>

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
              </div>
            )}

            {/* 4. VOLUNTEERS */}
            {members.volunteers.length > 0 && (
              <div aria-labelledby="heading-volunteers-sec">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1.5rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid rgba(167, 139, 250, 0.3)',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '6px',
                      background: 'rgba(167, 139, 250, 0.15)',
                      border: '1px solid #A78BFA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#A78BFA',
                    }}
                  >
                    <HeartHandshake size={20} />
                  </div>
                  <div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#A78BFA', letterSpacing: '0.12em' }}>
                      OPERATIONAL CORPS
                    </span>
                    <h3
                      id="heading-volunteers-sec"
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.65rem',
                        color: 'var(--color-warm-off-white)',
                        margin: 0,
                      }}
                    >
                      VOLUNTEERS ({members.volunteers.length})
                    </h3>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                    gap: '2.5rem',
                    justifyContent: 'center',
                    alignItems: 'start',
                  }}
                >
                  {members.volunteers.map((member) => renderMemberCard(member, 'volunteer'))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
