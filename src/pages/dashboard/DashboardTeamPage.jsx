import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardNav from '../../components/dashboard/DashboardNav';
import { teamService } from '../../services/teamService';
import {
  Users,
  Copy,
  Check,
  Plus,
  AlertCircle,
  Loader2,
  ShieldCheck,
  UserMinus,
  UserPlus,
  Trash2,
  Phone,
  Mail,
  School,
  GraduationCap,
  Sparkles,
  Info,
} from 'lucide-react';

// Only team-based competitions permitted for team rosters (Codeathon is strictly individual)
const TEAM_COMPETITION_OPTIONS = [
  {
    id: 'hackathon',
    name: 'Hackathon',
    subtitle: '3–4 Members Total',
    minSize: 3,
    maxSize: 4,
    badge: 'EVENT 03 • MAIN TRACK',
    accentColor: '#81C14B',
  },
  {
    id: 'ideathon',
    name: 'Ideathon',
    subtitle: '3–4 Members Total',
    minSize: 3,
    maxSize: 4,
    badge: 'EVENT 02 • INNOVATION PITCH',
    accentColor: '#ECBA82',
  },
];

export default function DashboardTeamPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / form states
  const [showCreate, setShowCreate] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamCollege, setNewTeamCollege] = useState('Rajkiya Engineering College Banda');
  const [newCompId, setNewCompId] = useState('hackathon');
  const [copiedCode, setCopiedCode] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add member modal state
  const [addingMemberTeamId, setAddingMemberTeamId] = useState(null);
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    college: 'Rajkiya Engineering College Banda',
    branch: '',
    year: '3rd Year',
  });
  const [addingMemberLoading, setAddingMemberLoading] = useState(false);

  const loadTeams = async () => {
    if (!user) return;
    try {
      const data = await teamService.getUserTeams(user.id);
      setTeams(data || []);
    } catch (err) {
      console.error('Failed to load teams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, [user]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const existingForComp = teams.find(
      (t) =>
        t.competition_id === newCompId ||
        t.competition?.slug === newCompId ||
        t.competition?.id === newCompId
    );
    if (existingForComp) {
      setError(
        `You already belong to team "${existingForComp.name}" in this competition. A participant can only join or create one team per event.`
      );
      return;
    }

    if (!newTeamName.trim() || newTeamName.trim().length < 2) {
      setError('Please enter a team name (minimum 2 characters).');
      return;
    }

    setActionLoading(true);

    try {
      await teamService.createTeam({
        name: newTeamName.trim(),
        competitionId: newCompId,
        college: newTeamCollege.trim(),
        userId: user.id,
      });
      setSuccess(`Team "${newTeamName.trim()}" created successfully!`);
      setNewTeamName('');
      setShowCreate(false);
      await loadTeams();
    } catch (err) {
      setError(err.message || 'Failed to create team.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMember = async (e, teamId, currentTeam) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanEmail = memberForm.email.trim().toLowerCase();
    const cleanName = memberForm.name.trim();

    if (!cleanName) {
      setError('Please enter teammate full name.');
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid teammate email address.');
      return;
    }
    if (cleanEmail === user.email?.toLowerCase()) {
      setError('You are already the leader of this team.');
      return;
    }

    const currentCount = currentTeam?.members?.length || 1;
    if (currentCount >= 4) {
      setError('Team is already full. HackFest 3.0 permits a maximum of 4 members per team.');
      return;
    }

    setAddingMemberLoading(true);

    try {
      await teamService.addMember({
        teamId,
        name: cleanName,
        email: cleanEmail,
        phone: memberForm.phone.trim(),
        college: memberForm.college.trim(),
        branch: memberForm.branch.trim(),
        year: memberForm.year,
        leaderUserId: user.id,
      });

      setSuccess(`Added "${cleanName}" to your team roster!`);
      setMemberForm({
        name: '',
        email: '',
        phone: '',
        college: currentTeam?.college || 'Rajkiya Engineering College Banda',
        branch: '',
        year: '3rd Year',
      });
      setAddingMemberTeamId(null);
      await loadTeams();
    } catch (err) {
      setError(err.message || 'Failed to add member.');
    } finally {
      setAddingMemberLoading(false);
    }
  };

  const handleRemoveMember = async (teamId, memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName || 'this teammate'} from your team?`)) return;
    setError('');
    setSuccess('');
    try {
      await teamService.removeMember({
        teamId,
        memberId,
        leaderUserId: user.id,
      });
      setSuccess(`Removed teammate from roster.`);
      await loadTeams();
    } catch (err) {
      setError(err.message || 'Failed to remove member.');
    }
  };

  const handleLeaveTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to withdraw from this team? You will be removed from this competition entry.')) return;
    setError('');
    setSuccess('');
    try {
      await teamService.leaveTeam({ teamId, userId: user.id });
      setSuccess('You have successfully left the team.');
      await loadTeams();
    } catch (err) {
      setError(err.message || 'Failed to leave team.');
    }
  };

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem', minHeight: '100vh', background: 'radial-gradient(ellipse at top, #12251C 0%, #080A09 65%)' }}>
      <div className="container" style={{ maxWidth: '1040px' }}>
        <DashboardNav />

        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(46, 147, 60, 0.15)', border: '1px solid #204E4A', borderRadius: '4px', padding: '0.2rem 0.6rem', color: '#81C14B', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              <Sparkles size={12} color="#81C14B" />
              TEAM ROSTER MANAGEMENT
            </div>
            <h2 className="heading-display" style={{ fontSize: '2rem', margin: '0 0 0.35rem 0', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
              MY TEAM ROSTERS
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '0.92rem', margin: 0, maxWidth: '640px', lineHeight: 1.5 }}>
              Manage your team members and academic details for HackFest 3.0. Teams require 3–4 members total (including the team leader). Codeathon is an individual event and does not use team rosters.
            </p>
          </div>

          <button
            onClick={() => { setShowCreate(!showCreate); setError(''); setSuccess(''); }}
            className="btn btn-primary"
            style={{
              padding: '0.65rem 1.25rem',
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#2E933C',
              borderColor: '#81C14B',
              color: '#FFFFFF',
              boxShadow: '0 0 20px rgba(46, 147, 60, 0.35)',
            }}
          >
            <Plus size={16} />
            {showCreate ? 'CLOSE PANEL' : 'CREATE NEW TEAM'}
          </button>
        </div>

        {/* Feedback Banners */}
        {error && (
          <div style={{ background: 'rgba(143, 48, 53, 0.25)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '6px', padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#ffb4b7', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(46, 147, 60, 0.2)', border: '1px solid #81C14B', borderRadius: '6px', padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#81C14B', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            <ShieldCheck size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* CREATE TEAM PANEL                                               */}
        {/* ============================================================== */}
        {showCreate && (
          <div
            style={{
              background: 'linear-gradient(135deg, #12251C 0%, #080A09 100%)',
              border: '1px solid rgba(129, 193, 75, 0.4)',
              borderRadius: '8px',
              padding: '1.75rem',
              marginBottom: '2.5rem',
              boxShadow: '0 15px 40px rgba(0, 0, 0, 0.75)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem', borderBottom: '1px solid #204E4A', paddingBottom: '0.85rem' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#81C14B', fontWeight: 600, letterSpacing: '0.08em' }}>
                  NEW TEAM INITIALIZATION
                </span>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', color: '#FFFFFF', margin: '0.2rem 0' }}>
                  CREATE NEW TEAM
                </h3>
                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0 }}>
                  You will be registered as Team Leader. You can enter all teammate details directly below.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(32, 78, 74, 0.4)', border: '1px solid #204E4A', padding: '0.35rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem', color: '#ECBA82', fontFamily: 'var(--font-mono)' }}>
                <Info size={14} color="#ECBA82" />
                <span>3–4 Members Required</span>
              </div>
            </div>

            <form onSubmit={handleCreateTeam} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#81C14B', marginBottom: '0.4rem', fontWeight: 600 }}>
                    TEAM NAME *
                  </label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g. CyberKnights"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: '#080A09',
                      border: '1px solid #204E4A',
                      borderRadius: '4px',
                      color: '#FFFFFF',
                      fontSize: '0.92rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#81C14B', marginBottom: '0.4rem', fontWeight: 600 }}>
                    COLLEGE / INSTITUTION
                  </label>
                  <input
                    type="text"
                    value={newTeamCollege}
                    onChange={(e) => setNewTeamCollege(e.target.value)}
                    placeholder="Rajkiya Engineering College Banda"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: '#080A09',
                      border: '1px solid #204E4A',
                      borderRadius: '4px',
                      color: '#FFFFFF',
                      fontSize: '0.92rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#81C14B', marginBottom: '0.4rem', fontWeight: 600 }}>
                  COMPETITION TRACK *
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={newCompId}
                    onChange={(e) => setNewCompId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: '#080A09',
                      border: '1px solid #204E4A',
                      borderRadius: '4px',
                      color: '#FFFFFF',
                      fontSize: '0.92rem',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {TEAM_COMPETITION_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id} style={{ background: '#080A09', color: '#FFFFFF', padding: '0.5rem' }}>
                        {opt.name} — {opt.subtitle} ({opt.badge})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94A3B8', marginTop: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                  Note: Codeathon is an individual event (1 participant) and does not permit team creation.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                  style={{
                    padding: '0.65rem 1.4rem',
                    fontSize: '0.82rem',
                    background: '#2E933C',
                    borderColor: '#81C14B',
                    color: '#FFFFFF',
                  }}
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'CONFIRM & INITIALIZE TEAM'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreate(false)}
                  style={{ padding: '0.65rem 1.1rem', fontSize: '0.82rem', borderColor: '#204E4A', color: '#94A3B8' }}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* TEAMS LISTING                                                  */}
        {/* ============================================================== */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94A3B8' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: '#81C14B' }} />
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>LOADING YOUR TEAM ROSTERS...</p>
          </div>
        ) : teams.length === 0 ? (
          <div
            style={{
              background: 'linear-gradient(135deg, #12251C 0%, #080A09 100%)',
              border: '1px solid #204E4A',
              borderRadius: '8px',
              padding: '3.5rem 1.5rem',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
            }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(46, 147, 60, 0.15)', border: '1px solid #204E4A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <Users size={32} color="#81C14B" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', marginBottom: '0.5rem', color: '#FFFFFF' }}>
              NO TEAMS REGISTERED YET
            </h3>
            <p style={{ color: '#94A3B8', maxWidth: '480px', margin: '0 auto 1.75rem auto', lineHeight: '1.6', fontSize: '0.9rem' }}>
              You are not currently in a team for Hackathon or Ideathon. Create a team above as Team Leader, or submit your entry through the registration portal.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.4rem', fontSize: '0.82rem', background: '#2E933C', borderColor: '#81C14B' }}
            >
              <Plus size={16} />
              CREATE A TEAM NOW
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {teams.map((tm) => {
              const isLeader = tm.userRole === 'leader' || tm.leader_id === user?.id;
              const members = tm.members || [];
              const memberCount = members.length || 1;
              const maxLimit = tm.competition?.max_team_size || 4;
              const minLimit = tm.competition?.min_team_size || 3;
              const isFull = memberCount >= maxLimit;
              const isQualified = memberCount >= minLimit && memberCount <= maxLimit;
              const compTitle = (tm.competition?.name || 'HACKATHON').toUpperCase();

              return (
                <div
                  key={tm.id}
                  style={{
                    background: 'linear-gradient(135deg, #12251C 0%, #080A09 100%)',
                    border: '1px solid #204E4A',
                    borderRadius: '8px',
                    padding: '1.75rem',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.75)',
                    position: 'relative',
                  }}
                >
                  {/* Top Bar: Comp Badge, Team Name, Code */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      marginBottom: '1.25rem',
                      paddingBottom: '1rem',
                      borderBottom: '1px solid #204E4A',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            padding: '0.15rem 0.55rem',
                            borderRadius: '3px',
                            background: compTitle.includes('IDEATHON') ? 'rgba(236, 186, 130, 0.15)' : 'rgba(46, 147, 60, 0.2)',
                            color: compTitle.includes('IDEATHON') ? '#ECBA82' : '#81C14B',
                            border: `1px solid ${compTitle.includes('IDEATHON') ? 'rgba(236, 186, 130, 0.35)' : 'rgba(129, 193, 75, 0.35)'}`,
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                          }}
                        >
                          {compTitle}
                        </span>

                        {/* Status Chip */}
                        {isQualified ? (
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.68rem',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '3px',
                              background: 'rgba(52, 211, 153, 0.15)',
                              color: '#34D399',
                              border: '1px solid rgba(52, 211, 153, 0.4)',
                              fontWeight: 600,
                            }}
                          >
                            ✓ ROSTER QUALIFIED (3–4)
                          </span>
                        ) : (
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.68rem',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '3px',
                              background: 'rgba(236, 186, 130, 0.15)',
                              color: '#ECBA82',
                              border: '1px solid rgba(236, 186, 130, 0.35)',
                              fontWeight: 600,
                            }}
                          >
                            ⚠️ NEEDS {minLimit - memberCount} MORE TO MEET MINIMUM
                          </span>
                        )}
                      </div>

                      <h3
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '1.6rem',
                          color: '#FFFFFF',
                          margin: '0.2rem 0',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {tm.name}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', color: '#94A3B8' }}>
                        <School size={14} color="#81C14B" />
                        <span>{tm.college || 'Rajkiya Engineering College Banda'}</span>
                      </div>
                    </div>

                    {/* Team Code Chip */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        background: '#080A09',
                        border: '1px solid #204E4A',
                        borderRadius: '4px',
                        padding: '0.45rem 0.85rem',
                      }}
                    >
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#94A3B8', letterSpacing: '0.08em' }}>
                          TEAM CODE
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem', color: '#ECBA82', fontWeight: 700 }}>
                          {tm.code}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopyCode(tm.code)}
                        style={{
                          background: 'rgba(236, 186, 130, 0.12)',
                          border: '1px solid rgba(236, 186, 130, 0.3)',
                          borderRadius: '3px',
                          color: '#ECBA82',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0.35rem',
                        }}
                        title="Copy team code"
                      >
                        {copiedCode === tm.code ? <Check size={14} color="#34D399" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Team Members Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem',
                      flexWrap: 'wrap',
                      gap: '0.6rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#81C14B', fontWeight: 700, letterSpacing: '0.08em' }}>
                        ROSTER ({memberCount} / {maxLimit} MEMBERS)
                      </span>
                      <span style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                        • Team Leader + {memberCount - 1} Teammate{memberCount - 1 === 1 ? '' : 's'}
                      </span>
                    </div>

                    {isLeader && !isFull && (
                      <button
                        type="button"
                        onClick={() => {
                          setAddingMemberTeamId(addingMemberTeamId === tm.id ? null : tm.id);
                          setError('');
                        }}
                        style={{
                          background: 'rgba(46, 147, 60, 0.2)',
                          border: '1px solid #81C14B',
                          borderRadius: '4px',
                          color: '#81C14B',
                          padding: '0.35rem 0.75rem',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontWeight: 600,
                        }}
                      >
                        <UserPlus size={13} />
                        {addingMemberTeamId === tm.id ? 'CLOSE FORM' : 'ADD TEAMMATE'}
                      </button>
                    )}
                  </div>

                  {/* Inline Add Member Form */}
                  {addingMemberTeamId === tm.id && (
                    <form
                      onSubmit={(e) => handleAddMember(e, tm.id, tm)}
                      style={{
                        background: '#080A09',
                        border: '1px solid #81C14B',
                        borderRadius: '6px',
                        padding: '1.25rem',
                        marginBottom: '1.4rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.85rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#81C14B', fontWeight: 700 }}>
                          ENTER TEAMMATE DETAILS:
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#94A3B8' }}>
                          Spot {memberCount + 1} of {maxLimit}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', color: '#81C14B', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
                            FULL NAME *
                          </label>
                          <input
                            type="text"
                            required
                            value={memberForm.name}
                            onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                            placeholder="Full Name"
                            style={{ width: '100%', padding: '0.55rem', background: '#12251C', border: '1px solid #204E4A', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', color: '#81C14B', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
                            EMAIL ADDRESS *
                          </label>
                          <input
                            type="email"
                            required
                            value={memberForm.email}
                            onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                            placeholder="teammate@college.edu"
                            style={{ width: '100%', padding: '0.55rem', background: '#12251C', border: '1px solid #204E4A', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', color: '#81C14B', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
                            PHONE NUMBER
                          </label>
                          <input
                            type="tel"
                            value={memberForm.phone}
                            onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                            placeholder="10-digit mobile"
                            style={{ width: '100%', padding: '0.55rem', background: '#12251C', border: '1px solid #204E4A', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', color: '#81C14B', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
                            COLLEGE / INSTITUTION
                          </label>
                          <input
                            type="text"
                            value={memberForm.college}
                            onChange={(e) => setMemberForm({ ...memberForm, college: e.target.value })}
                            placeholder="College name"
                            style={{ width: '100%', padding: '0.55rem', background: '#12251C', border: '1px solid #204E4A', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', color: '#81C14B', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
                            BRANCH / DISCIPLINE
                          </label>
                          <input
                            type="text"
                            value={memberForm.branch}
                            onChange={(e) => setMemberForm({ ...memberForm, branch: e.target.value })}
                            placeholder="e.g. IT / CSE / EE"
                            style={{ width: '100%', padding: '0.55rem', background: '#12251C', border: '1px solid #204E4A', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', color: '#81C14B', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
                            ACADEMIC YEAR
                          </label>
                          <select
                            value={memberForm.year}
                            onChange={(e) => setMemberForm({ ...memberForm, year: e.target.value })}
                            style={{ width: '100%', padding: '0.55rem', background: '#12251C', border: '1px solid #204E4A', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                          >
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.35rem' }}>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={addingMemberLoading}
                          style={{ padding: '0.5rem 1.1rem', fontSize: '0.78rem', background: '#2E933C', borderColor: '#81C14B' }}
                        >
                          {addingMemberLoading ? <Loader2 size={14} className="animate-spin" /> : 'SAVE TEAMMATE TO ROSTER'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setAddingMemberTeamId(null)}
                          style={{ padding: '0.5rem 0.85rem', fontSize: '0.78rem', borderColor: '#204E4A', color: '#94A3B8' }}
                        >
                          CANCEL
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Member Roster Cards Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                    {members.map((m) => {
                      const memberIsLeader = m.role === 'leader';

                      return (
                        <div
                          key={m.id}
                          style={{
                            background: '#080A09',
                            border: `1px solid ${memberIsLeader ? '#ECBA82' : '#204E4A'}`,
                            borderRadius: '6px',
                            padding: '1.1rem',
                            position: 'relative',
                            boxShadow: memberIsLeader ? '0 0 15px rgba(236, 186, 130, 0.12)' : 'none',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.98rem', color: '#FFFFFF' }}>
                                {m.name || 'Member'}
                              </div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: '#81C14B', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                                <Mail size={12} />
                                <span>{m.email}</span>
                              </div>
                            </div>

                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.68rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '3px',
                                background: memberIsLeader ? 'rgba(236, 186, 130, 0.15)' : 'rgba(32, 78, 74, 0.4)',
                                color: memberIsLeader ? '#ECBA82' : '#81C14B',
                                border: `1px solid ${memberIsLeader ? '#ECBA82' : '#204E4A'}`,
                                fontWeight: 700,
                              }}
                            >
                              {memberIsLeader ? 'TEAM LEADER' : 'MEMBER'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.78rem', color: '#94A3B8', borderTop: '1px solid #12251C', paddingTop: '0.6rem' }}>
                            {m.phone && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <Phone size={12} color="#81C14B" />
                                <span>{m.phone}</span>
                              </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <School size={12} color="#81C14B" />
                              <span>{m.college || tm.college || 'Rajkiya Engineering College Banda'}</span>
                            </div>
                            {(m.branch || m.year) && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <GraduationCap size={12} color="#81C14B" />
                                <span>
                                  {m.branch ? `${m.branch} • ` : ''}{m.year || '3rd Year'}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Leader action to remove a member */}
                          {isLeader && !memberIsLeader && (
                            <div style={{ marginTop: '0.75rem', borderTop: '1px solid #12251C', paddingTop: '0.5rem', textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(tm.id, m.id, m.name)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#f87171',
                                  fontSize: '0.72rem',
                                  fontFamily: 'var(--font-mono)',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                }}
                              >
                                <Trash2 size={12} />
                                REMOVE FROM ROSTER
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Non-leader member withdraw action */}
                  {!isLeader && (
                    <div style={{ borderTop: '1px solid #204E4A', paddingTop: '0.85rem' }}>
                      <button
                        onClick={() => handleLeaveTeam(tm.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#f87171',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.76rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          cursor: 'pointer',
                        }}
                      >
                        <UserMinus size={14} />
                        WITHDRAW / LEAVE TEAM
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
