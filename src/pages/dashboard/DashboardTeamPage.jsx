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
  Mail,
  Trash2,
  X,
  Phone,
  School,
} from 'lucide-react';
import { competitions } from '../../data/eventData';

export default function DashboardTeamPage() {
  const { user, isConfigured } = useAuth();
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
      setTeams(data);
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
      (t) => t.competition_id === newCompId || t.competition?.slug === newCompId || t.competition?.id === newCompId
    );
    if (existingForComp) {
      setError(`You already belong to team "${existingForComp.name}" in this competition. A participant can only join or create one team per event.`);
      return;
    }

    if (!newTeamName.trim() || newTeamName.trim().length < 2) {
      setError('Please enter a team name (minimum 2 characters).');
      return;
    }

    setActionLoading(true);

    try {
      const created = await teamService.createTeam({
        name: newTeamName.trim(),
        competitionId: newCompId,
        college: newTeamCollege.trim(),
        userId: user.id,
      });
      setSuccess(`Team "${newTeamName.trim()}" created successfully! Team code: ${created.code}`);
      setNewTeamName('');
      setShowCreate(false);
      await loadTeams();
    } catch (err) {
      setError(err.message || 'Failed to create team.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMember = async (e, teamId) => {
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
        college: 'Rajkiya Engineering College Banda',
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
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '980px' }}>
        <DashboardNav />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span className="chapter-badge">TEAM MANAGEMENT</span>
            <h2 className="heading-display" style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>
              MY TEAM ROSTERS
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              Manage team members, roles, contact info, and team codes for HackFest 3.0.
            </p>
          </div>

          <button
            onClick={() => { setShowCreate(true); setError(''); setSuccess(''); }}
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.1rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} />
            CREATE NEW TEAM
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(143, 48, 53, 0.2)', border: '1px solid var(--border-accent-crimson)', borderRadius: 'var(--radius-sm)', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ffb4b7', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(53, 248, 172, 0.12)', border: '1px solid rgba(53, 248, 172, 0.4)', borderRadius: 'var(--radius-sm)', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#35F8AC', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            <ShieldCheck size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* Create Team Form Modal */}
        {showCreate && (
          <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-infinity-gold)', borderRadius: 'var(--radius-md)', padding: '1.8rem', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)' }}>
            <h3 className="heading-display" style={{ fontSize: '1.3rem', marginBottom: '0.4rem', color: 'var(--color-text-primary)' }}>
              CREATE NEW TEAM
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
              You will be registered as Team Leader. You can add your teammates directly to the roster.
            </p>
            <form onSubmit={handleCreateTeam} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>
                    TEAM NAME *
                  </label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g. Code Warriors"
                    required
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--color-surface-secondary)', border: '1px solid rgba(0, 217, 255, 0.25)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)', fontSize: '0.92rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>
                    COLLEGE / INSTITUTION
                  </label>
                  <input
                    type="text"
                    value={newTeamCollege}
                    onChange={(e) => setNewTeamCollege(e.target.value)}
                    placeholder="Rajkiya Engineering College Banda"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--color-surface-secondary)', border: '1px solid rgba(0, 217, 255, 0.25)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)', fontSize: '0.92rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>
                  COMPETITION *
                </label>
                <select
                  value={newCompId}
                  onChange={(e) => setNewCompId(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--color-surface-secondary)', border: '1px solid rgba(0, 217, 255, 0.25)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)', fontSize: '0.92rem' }}
                >
                  <option value="hackathon">Flagship 48-Hour Hackathon (Team 2-4)</option>
                  <option value="ideathon">Ideathon (Team 1-3)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'CREATE TEAM'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Teams List */}
        {teams.length === 0 ? (
          <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.2)', borderRadius: 'var(--radius-md)', padding: '3rem 1.5rem', textAlign: 'center', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65)' }}>
            <Users size={48} color="var(--color-arc-cyan)" style={{ margin: '0 auto 1.2rem auto' }} />
            <h3 className="heading-display" style={{ fontSize: '1.4rem', marginBottom: '0.6rem', color: 'var(--color-text-primary)' }}>
              NO TEAMS REGISTERED YET
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem auto', lineHeight: '1.6' }}>
              You are not currently in a team. You can register your team directly through the registration portal.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="btn btn-primary"
            >
              CREATE TEAM
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {teams.map((tm) => {
              const isLeader = tm.userRole === 'leader' || tm.leader_id === user?.id;
              const memberCount = tm.members?.length || 1;
              const maxLimit = tm.competition?.max_team_size || 4;
              const minLimit = tm.competition?.min_team_size || 2;
              const isFull = memberCount >= maxLimit;

              return (
                <div key={tm.id} style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.25)', borderRadius: 'var(--radius-md)', padding: '1.8rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(0, 217, 255, 0.15)' }}>
                    <div>
                      <span className="chapter-badge" style={{ margin: '0 0 0.4rem 0' }}>
                        {tm.competition?.name || 'HACKATHON'}
                      </span>
                      <h3 className="heading-display" style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)', margin: '0.2rem 0' }}>
                        {tm.name}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {tm.college || 'Rajkiya Engineering College Banda'}
                      </div>
                    </div>

                    {/* Team Code Pill */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-surface-secondary)', border: '1px solid var(--color-infinity-gold)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.8rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--color-infinity-gold)', fontWeight: 700 }}>
                        {tm.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(tm.code)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Copy team code"
                      >
                        {copiedCode === tm.code ? <Check size={16} color="var(--color-infinity-gold)" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Team Members List Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: 0, letterSpacing: '0.08em' }}>
                      TEAM ROSTER ({memberCount} / {maxLimit})
                    </h4>
                    {isLeader && !isFull && (
                      <button
                        type="button"
                        onClick={() => {
                          setAddingMemberTeamId(addingMemberTeamId === tm.id ? null : tm.id);
                          setError('');
                        }}
                        style={{
                          background: 'rgba(53, 248, 172, 0.1)',
                          border: '1px solid rgba(53, 248, 172, 0.35)',
                          borderRadius: 'var(--radius-sm)',
                          color: '#35F8AC',
                          padding: '0.3rem 0.65rem',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <UserPlus size={13} />
                        ADD TEAMMATE
                      </button>
                    )}
                  </div>

                  {/* Inline Add Member Form */}
                  {addingMemberTeamId === tm.id && (
                    <form
                      onSubmit={(e) => handleAddMember(e, tm.id)}
                      style={{
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(53, 248, 172, 0.3)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '1.25rem',
                        marginBottom: '1.2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.8rem',
                      }}
                    >
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#35F8AC', fontWeight: 600 }}>
                        ADD TEAM MEMBER DETAILS:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.2rem' }}>
                            FULL NAME *
                          </label>
                          <input
                            type="text"
                            required
                            value={memberForm.name}
                            onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                            placeholder="Teammate name"
                            style={{ width: '100%', padding: '0.55rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.2rem' }}>
                            EMAIL ADDRESS *
                          </label>
                          <input
                            type="email"
                            required
                            value={memberForm.email}
                            onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                            placeholder="teammate@example.com"
                            style={{ width: '100%', padding: '0.55rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.2rem' }}>
                            PHONE NUMBER
                          </label>
                          <input
                            type="tel"
                            value={memberForm.phone}
                            onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                            placeholder="10-digit phone"
                            style={{ width: '100%', padding: '0.55rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.2rem' }}>
                            COLLEGE / INSTITUTION
                          </label>
                          <input
                            type="text"
                            value={memberForm.college}
                            onChange={(e) => setMemberForm({ ...memberForm, college: e.target.value })}
                            placeholder="College name"
                            style={{ width: '100%', padding: '0.55rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.2rem' }}>
                            BRANCH
                          </label>
                          <input
                            type="text"
                            value={memberForm.branch}
                            onChange={(e) => setMemberForm({ ...memberForm, branch: e.target.value })}
                            placeholder="CSE / IT / EE"
                            style={{ width: '100%', padding: '0.55rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.2rem' }}>
                            YEAR
                          </label>
                          <select
                            value={memberForm.year}
                            onChange={(e) => setMemberForm({ ...memberForm, year: e.target.value })}
                            style={{ width: '100%', padding: '0.55rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                          >
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem' }}>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={addingMemberLoading}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                        >
                          {addingMemberLoading ? <Loader2 size={14} className="animate-spin" /> : 'SAVE TEAMMATE'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setAddingMemberTeamId(null)}
                          style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem' }}
                        >
                          CANCEL
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Member Roster Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.9rem', marginBottom: '1.4rem' }}>
                    {(tm.members || []).map((m) => (
                      <div
                        key={m.id}
                        style={{
                          background: 'var(--color-surface-secondary)',
                          border: `1px solid ${m.role === 'leader' ? 'var(--color-infinity-gold)' : 'rgba(0, 217, 255, 0.15)'}`,
                          borderRadius: 'var(--radius-sm)',
                          padding: '1rem',
                          position: 'relative',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                              {m.name || 'Member'}
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-arc-cyan)' }}>
                              {m.email}
                            </div>
                          </div>

                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.7rem',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '3px',
                              background: m.role === 'leader' ? 'rgba(255, 179, 0, 0.15)' : 'rgba(0, 217, 255, 0.1)',
                              color: m.role === 'leader' ? 'var(--color-infinity-gold)' : 'var(--color-arc-cyan)',
                              border: `1px solid ${m.role === 'leader' ? 'rgba(255, 179, 0, 0.3)' : 'rgba(0, 217, 255, 0.2)'}`,
                              fontWeight: 700,
                            }}
                          >
                            {m.role?.toUpperCase()}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '0.4rem' }}>
                          {m.phone && <div>📞 {m.phone}</div>}
                          <div>🏛️ {m.college || 'REC Banda'} {m.branch ? `• ${m.branch}` : ''} {m.year ? `(${m.year})` : ''}</div>
                        </div>

                        {/* Leader can remove non-leader members */}
                        {isLeader && m.role !== 'leader' && (
                          <div style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.5rem', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(tm.id, m.id, m.name)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#f87171',
                                fontSize: '0.74rem',
                                fontFamily: 'var(--font-mono)',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                              }}
                            >
                              <Trash2 size={12} />
                              REMOVE
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {!isLeader && (
                    <button
                      onClick={() => handleLeaveTeam(tm.id)}
                      style={{ background: 'none', border: 'none', color: '#ff8b90', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
                    >
                      <UserMinus size={14} />
                      LEAVE TEAM
                    </button>
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
