import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { eventService } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import AdminNav from '../../components/admin/AdminNav';
import {
  Users,
  Trophy,
  UploadCloud,
  Scale,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Crown,
  Globe,
  Users2,
  ClipboardList,
  ShieldCheck,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const { user, profile, isSuperAdmin, refreshProfile } = useAuth();

  const [stats, setStats] = useState({
    participantsCount: 0,
    teamsCount: 0,
    registrationsCount: 0,
    submissionsCount: 0,
    evaluationsCount: 0,
    sdcMembersCount: 0,
    byCompetition: {},
  });

  const [recentRegistrations, setRecentRegistrations] = useState([]);

  const [settings, setSettings] = useState({
    liveModeStatus: 'REGISTRATION OPEN',
    leaderboardPublished: false,
    eventDate: 'OCTOBER 24-25, 2026',
    venue: 'Campus Multipurpose Hall, REC Banda',
  });

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [msg, setMsg] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, cfg, allRegs] = await Promise.all([
        adminService.getStats(),
        eventService.getSettings(),
        adminService.getAllRegistrations(),
      ]);

      setStats(s);

      setSettings({
        liveModeStatus: cfg.liveModeStatus || 'REGISTRATION OPEN',
        leaderboardPublished: cfg.leaderboardPublished || false,
        eventDate: cfg.eventDate || 'OCTOBER 24-25, 2026',
        venue: cfg.venue || 'Campus Multipurpose Hall, REC Banda',
      });

      // Get latest 5 registrations
      setRecentRegistrations((allRegs || []).slice(0, 5));
    } catch (err) {
      console.error('Failed to load admin dashboard overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateMode = async (newMode) => {
    setSavingSettings(true);
    setMsg('');
    try {
      await adminService.updateEventSettings({ live_mode_status: newMode });
      setSettings((prev) => ({ ...prev, liveModeStatus: newMode }));
      setMsg(`System state shifted to: ${newMode}`);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleLeaderboard = async () => {
    setSavingSettings(true);
    try {
      const next = !settings.leaderboardPublished;
      await adminService.updateEventSettings({ leaderboard_published: next });
      setSettings((prev) => ({ ...prev, leaderboardPublished: next }));
    } catch (err) {
      alert(err.message || 'Failed to toggle leaderboard');
    } finally {
      setSavingSettings(false);
    }
  };

  const userEmail = user?.email || 'your-supabase-account-email@domain.com';
  const bootstrapSql = `SELECT public.set_super_admin_by_email('${userEmail}');`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(bootstrapSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const modes = ['REGISTRATION OPEN', 'EVENT LIVE', 'SUBMISSIONS OPEN', 'JUDGING', 'RESULTS'];

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '1280px' }}>
        <AdminNav />

        {msg && (
          <div
            style={{
              background: 'rgba(185, 133, 69, 0.15)',
              border: '1px solid var(--border-accent-amber)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.8rem 1rem',
              color: 'var(--color-warm-amber)',
              fontSize: '0.88rem',
              marginBottom: '1.5rem',
            }}
          >
            {msg}
          </div>
        )}

        {/* ============================================================== */}
        {/* SUPER ADMIN STATUS BANNER                                       */}
        {/* ============================================================== */}
        {!isSuperAdmin && (
          <div
            style={{
              background: 'rgba(143, 48, 53, 0.18)',
              border: '1px solid var(--color-muted-crimson)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffb4b7', fontWeight: 600, fontSize: '0.95rem' }}>
                <Crown size={18} />
                SUPER ADMIN VERIFICATION REQUIRED
              </div>
              <p style={{ color: '#E2E8F0', fontSize: '0.84rem', margin: '0.3rem 0 0.5rem 0' }}>
                To establish permanent Super Admin ownership on your account (<strong>{user?.email}</strong>), execute this one-time command in Supabase SQL editor:
              </p>
              <div
                style={{
                  background: '#0B0F17',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '0.4rem 0.8rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  color: 'var(--color-stark-gold)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <code>{bootstrapSql}</code>
                <button
                  onClick={handleCopySql}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-stark-gold)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    fontSize: '0.72rem',
                  }}
                >
                  {copiedSql ? <Check size={12} /> : <Copy size={12} />}
                  {copiedSql ? 'COPIED' : 'COPY'}
                </button>
              </div>
            </div>

            <button
              onClick={async () => {
                await refreshProfile();
                await loadData();
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
            >
              <RefreshCw size={13} />
              VERIFY NOW
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* SUMMARY CARDS (PER REQUIREMENT 2)                              */}
        {/* ============================================================== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Card 1: Total Registrations */}
          <div
            style={{
              background: 'var(--color-surface-elevated)',
              border: '1px solid rgba(230, 36, 41, 0.45)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.65), 0 0 15px rgba(230, 36, 41, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-stark-gold)', letterSpacing: '0.08em' }}>
                  TOTAL REGISTRATIONS
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: 'var(--color-text-primary)', margin: '0.25rem 0' }}>
                  {stats.registrationsCount}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Total Event Passes</div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(245, 182, 66, 0.15)', border: '1px solid var(--color-stark-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-stark-gold)' }}>
                <Trophy size={20} />
              </div>
            </div>
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <Link to="/admin/registrations" style={{ color: 'var(--color-arc-blue)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                MANAGE & EXPORT DATA →
              </Link>
            </div>
          </div>

          {/* Card 2: Registrations by Event / Category */}
          <div
            style={{
              background: 'var(--color-surface-elevated)',
              border: '1px solid rgba(0, 217, 255, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.65)',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-arc-blue)', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              REGISTRATIONS BY COMPETITION
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff' }}>
                <span>MARVELOUS HACKS:</span>
                <strong style={{ color: 'var(--color-arc-blue)', fontFamily: 'var(--font-mono)' }}>{stats.byCompetition?.hackathon || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff' }}>
                <span>INFINITY IDEATHON:</span>
                <strong style={{ color: 'var(--color-stark-gold)', fontFamily: 'var(--font-mono)' }}>{stats.byCompetition?.ideathon || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff' }}>
                <span>THOR CODEATHON:</span>
                <strong style={{ color: '#ffb4b7', fontFamily: 'var(--font-mono)' }}>{stats.byCompetition?.codeathon || 0}</strong>
              </div>
            </div>
            <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Verified against competitions</span>
            </div>
          </div>

          {/* Card 3: Total SDC Members */}
          <div
            style={{
              background: 'var(--color-surface-elevated)',
              border: '1px solid rgba(0, 217, 255, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.65)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-arc-blue)', letterSpacing: '0.08em' }}>
                  SDC ROSTER
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: 'var(--color-arc-blue)', margin: '0.25rem 0' }}>
                  {stats.sdcMembersCount}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Leaders & Coordinators</div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(0, 191, 255, 0.15)', border: '1px solid var(--color-arc-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-arc-blue)' }}>
                <Users2 size={20} />
              </div>
            </div>
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <Link to="/admin/sdc-members" style={{ color: 'var(--color-arc-blue)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                SDC PERSONNEL ADMIN →
              </Link>
            </div>
          </div>

          {/* Card 4: Current Event Configuration */}
          <div
            style={{
              background: 'var(--color-surface-elevated)',
              border: '1px solid rgba(245, 196, 81, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.65)',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-stark-gold)', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
              EVENT CONFIGURATION
            </div>
            <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600, marginBottom: '0.2rem' }}>
              {settings.eventDate}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
              📍 {settings.venue}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)' }}>
              STATUS: {settings.liveModeStatus}
            </div>
            <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <Link to="/admin/cms" style={{ color: 'var(--color-arc-blue)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                OPEN WEBSITE CMS →
              </Link>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* GLOBAL EVENT PROTOCOL CONTROLLER                               */}
        {/* ============================================================== */}
        <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(230, 36, 41, 0.45)', borderRadius: 'var(--radius-md)', padding: '1.8rem', marginBottom: '2.5rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
            <div>
              <span className="chapter-badge" style={{ margin: '0 0 0.3rem 0' }}>SYSTEM PROTOCOL STATE</span>
              <h3 className="heading-display" style={{ fontSize: '1.4rem', margin: 0, color: 'var(--color-text-primary)' }}>
                CURRENT EVENT PHASE: <span style={{ color: 'var(--color-arc-cyan)' }}>{settings.liveModeStatus}</span>
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.leaderboardPublished}
                  onChange={handleToggleLeaderboard}
                  disabled={savingSettings}
                  style={{ accentColor: 'var(--color-stark-gold)' }}
                />
                <span>PUBLIC LEADERBOARD LIVE</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {modes.map((m) => (
              <button
                key={m}
                onClick={() => handleUpdateMode(m)}
                disabled={savingSettings}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  border: settings.liveModeStatus === m ? '1px solid var(--color-arc-cyan)' : '1px solid rgba(0, 217, 255, 0.2)',
                  background: settings.liveModeStatus === m ? 'rgba(0, 217, 255, 0.18)' : 'var(--color-surface-secondary)',
                  color: settings.liveModeStatus === m ? 'var(--color-arc-cyan)' : 'var(--color-text-secondary)',
                  boxShadow: settings.liveModeStatus === m ? '0 0 12px rgba(0, 217, 255, 0.25)' : 'none',
                  transition: 'var(--transition-fast)',
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* RECENT REGISTRATIONS TABLE (PER REQUIREMENT 2)                 */}
        {/* ============================================================== */}
        <div
          style={{
            background: 'var(--color-surface-elevated)',
            border: '1px solid rgba(0, 217, 255, 0.22)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            marginBottom: '2.5rem',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.65)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#fff', margin: 0 }}>
                RECENT REGISTRATION ENTRIES
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>
                Latest participant submissions requiring organizer verification.
              </p>
            </div>
            <Link
              to="/admin/registrations"
              className="btn btn-secondary"
              style={{ fontSize: '0.76rem', padding: '0.4rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              VIEW ALL & EXPORT
              <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: 'rgba(8, 10, 16, 0.95)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-arc-cyan)' }}>
                  <th style={{ padding: '0.8rem 1rem' }}>PARTICIPANT</th>
                  <th style={{ padding: '0.8rem 1rem' }}>COMPETITION</th>
                  <th style={{ padding: '0.8rem 1rem' }}>TEAM</th>
                  <th style={{ padding: '0.8rem 1rem' }}>STATUS</th>
                  <th style={{ padding: '0.8rem 1rem' }}>SUBMITTED</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No registration records found yet.
                    </td>
                  </tr>
                ) : (
                  recentRegistrations.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                       <td style={{ padding: '0.8rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{r.profile?.full_name || 'Participant'}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.profile?.email}</div>
                      </td>
                      <td style={{ padding: '0.8rem 1rem', color: 'var(--color-arc-blue)' }}>
                        {r.competition?.name || 'COMPETITION'}
                      </td>
                      <td style={{ padding: '0.8rem 1rem', color: 'var(--color-soft-gray)' }}>
                        {r.team?.name || 'Individual'}
                      </td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '3px',
                            background: r.registration_status === 'confirmed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 182, 66, 0.15)',
                            color: r.registration_status === 'confirmed' ? '#34D399' : 'var(--color-stark-gold)',
                            border: `1px solid ${r.registration_status === 'confirmed' ? '#10B981' : 'var(--color-stark-gold)'}`,
                          }}
                        >
                          {(r.registration_status || 'confirmed').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '0.8rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <Link
            to="/admin/registrations"
            style={{
              textDecoration: 'none',
              background: 'rgba(28, 32, 38, 0.85)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-arc-blue)', marginBottom: '0.5rem' }}>
                <Trophy size={18} />
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>REGISTRATIONS & EXPORTS</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                Filter participants, change pass status, and export certified records to Excel, CSV, or formatted PDF.
              </p>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-arc-blue)', marginTop: '0.75rem' }}>
              OPEN REGISTRATIONS →
            </span>
          </Link>

          <Link
            to="/admin/cms"
            style={{
              textDecoration: 'none',
              background: 'rgba(28, 32, 38, 0.85)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-stark-gold)', marginBottom: '0.5rem' }}>
                <Globe size={18} />
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>EVENT & WEBSITE CMS</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                Update dates, Day 1 & Day 2 schedules, announcements, FAQs, and competition details directly to Supabase.
              </p>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-stark-gold)', marginTop: '0.75rem' }}>
              OPEN CMS SUITE →
            </span>
          </Link>

          <Link
            to="/admin/sdc-members"
            style={{
              textDecoration: 'none',
              background: 'rgba(28, 32, 38, 0.85)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffb4b7', marginBottom: '0.5rem' }}>
                <Users2 size={18} />
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>SDC MEMBERS ROSTER</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                Manage Faculty Coordinator, Mentors, and Student Coordinators, photo uploads, and live profile cards.
              </p>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#ffb4b7', marginTop: '0.75rem' }}>
              MANAGE SDC MEMBERS →
            </span>
          </Link>

          <Link
            to="/admin/audit"
            style={{
              textDecoration: 'none',
              background: 'rgba(28, 32, 38, 0.85)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34D399', marginBottom: '0.5rem' }}>
                <ClipboardList size={18} />
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>SECURITY AUDIT TRAIL</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                Review immutable ledger tracking admin promotions, registrations, member edits, and content changes.
              </p>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#34D399', marginTop: '0.75rem' }}>
              VIEW AUDIT LEDGER →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
