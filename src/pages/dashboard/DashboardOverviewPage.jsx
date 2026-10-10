import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardNav from '../../components/dashboard/DashboardNav';
import { registrationService } from '../../services/registrationService';
import { teamService } from '../../services/teamService';
import { eventService } from '../../services/eventService';
import { submissionService } from '../../services/submissionService';
import { Trophy, Users, UploadCloud, Bell, CheckCircle2, AlertCircle, ArrowUpRight, Clock, MapPin } from 'lucide-react';
import { eventMeta } from '../../data/eventData';

export default function DashboardOverviewPage() {
  const { user, profile } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const [regs, tms, subs, anns] = await Promise.all([
          registrationService.getUserRegistrations(user.id),
          teamService.getUserTeams(user.id),
          submissionService.getUserSubmissions(user.id),
          eventService.getAnnouncements(),
        ]);
        if (isMounted) {
          setRegistrations(regs);
          setTeams(tms);
          setSubmissions(subs);
          setAnnouncements(anns);
        }
      } catch (err) {
        console.error('Failed to load dashboard overview:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [user]);

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        <DashboardNav />

        {/* Live Announcements Banner */}
        {announcements.length > 0 && (
          <div style={{ background: 'rgba(185, 133, 69, 0.12)', border: '1px solid var(--border-accent-amber)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--color-warm-amber)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>
              <Bell size={16} />
              SYSTEM ANNOUNCEMENTS
            </div>
            {announcements.map((ann) => (
              <div key={ann.id} style={{ marginBottom: '0.6rem' }}>
                <strong style={{ color: 'var(--color-warm-off-white)' }}>{ann.title}: </strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>{ann.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.25)', borderRadius: 'var(--radius-md)', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-arc-cyan)' }}>REGISTERED EVENTS</span>
              <Trophy size={20} color="var(--color-arc-cyan)" />
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: 'var(--color-text-primary)' }}>
              {registrations.length}
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              {registrations.length > 0 ? registrations.map(r => r.competition?.name).join(', ') : 'No active registrations'}
            </div>
          </div>

          <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.25)', borderRadius: 'var(--radius-md)', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-arc-cyan)' }}>AFFILIATED TEAMS</span>
              <Users size={20} color="var(--color-arc-cyan)" />
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: 'var(--color-text-primary)' }}>
              {teams.length}
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              {teams.length > 0 ? teams.map(t => t.name).join(', ') : 'Not yet in a team'}
            </div>
          </div>

          <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(230, 36, 41, 0.35)', borderRadius: 'var(--radius-md)', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-stark-crimson)' }}>SUBMISSION STATUS</span>
              <UploadCloud size={20} color="var(--color-stark-crimson)" />
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: 'var(--color-text-primary)' }}>
              {submissions.length > 0 ? submissions[0].status.toUpperCase() : 'PENDING'}
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              {submissions.length > 0 ? submissions[0].title : 'No project drafts yet'}
            </div>
          </div>
        </div>

        {/* Action Blocks */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem' }}>
          {/* Active Registrations Card */}
          <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.22)', borderRadius: 'var(--radius-md)', padding: '1.8rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 className="heading-display" style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>ACTIVE REGISTRATIONS</h3>
              <Link to="/dashboard/registration" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-arc-cyan)' }}>
                MANAGE
              </Link>
            </div>

            {registrations.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', background: 'var(--color-surface-secondary)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1rem' }}>
                  You have not registered for any competition yet.
                </p>
                <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.82rem' }}>
                  REGISTER NOW
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {registrations.map((reg) => (
                  <div key={reg.id} style={{ background: 'var(--color-surface-secondary)', border: '1px solid rgba(0, 217, 255, 0.15)', borderRadius: 'var(--radius-sm)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {reg.competition?.name || 'COMPETITION'}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                        STATUS: {reg.registration_status?.toUpperCase()} • {reg.team?.name ? `TEAM: ${reg.team.name}` : 'INDIVIDUAL'}
                      </div>
                    </div>
                    <span style={{ padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-sm)', background: 'rgba(0, 217, 255, 0.12)', border: '1px solid rgba(0, 217, 255, 0.4)', color: 'var(--color-arc-cyan)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                      VERIFIED
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Submission Shortcut */}
          <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.22)', borderRadius: 'var(--radius-md)', padding: '1.8rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 className="heading-display" style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>PROJECT PORTAL</h3>
              <Link to="/dashboard/submission" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-arc-cyan)' }}>
                OPEN PORTAL
              </Link>
            </div>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Ready to submit your repository and demo links? You can save drafts or transmit final projects directly to the evaluation jury.
            </p>

            <Link to="/dashboard/submission" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              MANAGE SUBMISSIONS
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
