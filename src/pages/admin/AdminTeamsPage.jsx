import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import AdminNav from '../../components/admin/AdminNav';
import {
  Users,
  Copy,
  Check,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Shield,
  UserCheck,
  UserX,
  AlertCircle,
  Loader2,
  X,
  RefreshCw,
  School,
  Mail,
  Phone,
  FileText,
} from 'lucide-react';

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [compFilter, setCompFilter] = useState('ALL');
  const [copiedCode, setCopiedCode] = useState(null);
  const [actionMessage, setActionMessage] = useState({ text: '', type: 'success' });

  // Modals state
  const [manageTeamModal, setManageTeamModal] = useState(null); // team object
  const [editTeamModal, setEditTeamModal] = useState(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Forms
  const [newTeamData, setNewTeamData] = useState({
    name: '',
    college: 'Rajkiya Engineering College Banda',
    competition_id: '',
    description: '',
  });

  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    college: 'Rajkiya Engineering College Banda',
    branch: '',
    year: '3rd Year',
    role: 'member',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllTeamsAdmin();
      setTeams(res || []);
    } catch (err) {
      console.error('Failed to load teams:', err);
      showBanner('Failed to load teams from database: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showBanner = (text, type = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage({ text: '', type: 'success' }), 4000);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Filtered Teams
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const name = (t.name || '').toLowerCase();
        const code = (t.code || '').toLowerCase();
        const college = (t.college || '').toLowerCase();
        const leaderName = (t.leader?.full_name || '').toLowerCase();
        const leaderEmail = (t.leader?.email || '').toLowerCase();
        const memberMatch = (t.members || []).some(
          (m) =>
            (m.name || '').toLowerCase().includes(q) ||
            (m.email || '').toLowerCase().includes(q)
        );

        if (
          !name.includes(q) &&
          !code.includes(q) &&
          !college.includes(q) &&
          !leaderName.includes(q) &&
          !leaderEmail.includes(q) &&
          !memberMatch
        ) {
          return false;
        }
      }

      if (compFilter !== 'ALL') {
        const cSlug = (t.competition?.slug || t.competition?.name || '').toLowerCase();
        if (!cSlug.includes(compFilter.toLowerCase())) return false;
      }

      return true;
    });
  }, [teams, search, compFilter]);

  // Team CRUD
  const handleSaveTeam = async (e) => {
    e.preventDefault();
    if (!newTeamData.name.trim()) {
      showBanner('Please enter a team name.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editTeamModal) {
        await adminService.saveTeamAdmin({
          id: editTeamModal.id,
          ...newTeamData,
        });
        showBanner(`Team "${newTeamData.name}" updated successfully!`);
      } else {
        await adminService.saveTeamAdmin(newTeamData);
        showBanner(`Team "${newTeamData.name}" created successfully!`);
      }
      setEditTeamModal(null);
      setShowCreateTeam(false);
      setNewTeamData({ name: '', college: 'Rajkiya Engineering College Banda', competition_id: '', description: '' });
      await loadData();
    } catch (err) {
      showBanner(err.message || 'Operation failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async (teamId, teamName) => {
    if (!window.confirm(`Are you sure you want to permanently delete team "${teamName}"? This will also remove associated team members and event registrations.`)) {
      return;
    }

    try {
      await adminService.deleteTeamAdmin(teamId);
      showBanner(`Team "${teamName}" deleted permanently.`);
      if (manageTeamModal?.id === teamId) setManageTeamModal(null);
      await loadData();
    } catch (err) {
      showBanner(err.message || 'Failed to delete team.', 'error');
    }
  };

  // Member CRUD within team
  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!manageTeamModal) return;

    if (!memberForm.name.trim()) {
      showBanner('Please enter member name.', 'error');
      return;
    }
    if (!memberForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberForm.email.trim())) {
      showBanner('Please enter a valid email address.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.addTeamMemberAdmin(manageTeamModal.id, memberForm);
      showBanner(`Added member "${memberForm.name}" to team roster.`);
      setShowAddMember(false);
      setMemberForm({
        name: '',
        email: '',
        phone: '',
        college: manageTeamModal.college || 'Rajkiya Engineering College Banda',
        branch: '',
        year: '3rd Year',
        role: 'member',
      });
      // Refresh teams and updated manageTeamModal
      const updatedTeams = await adminService.getAllTeamsAdmin();
      setTeams(updatedTeams || []);
      const updatedCurrent = updatedTeams.find((t) => t.id === manageTeamModal.id);
      if (updatedCurrent) setManageTeamModal(updatedCurrent);
    } catch (err) {
      showBanner(err.message || 'Failed to add team member.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMemberSubmit = async (e) => {
    e.preventDefault();
    if (!editingMember) return;

    setIsSubmitting(true);
    try {
      await adminService.updateTeamMemberAdmin(editingMember.id, editingMember);
      showBanner(`Updated member "${editingMember.name}".`);
      setEditingMember(null);
      const updatedTeams = await adminService.getAllTeamsAdmin();
      setTeams(updatedTeams || []);
      if (manageTeamModal) {
        const updatedCurrent = updatedTeams.find((t) => t.id === manageTeamModal.id);
        if (updatedCurrent) setManageTeamModal(updatedCurrent);
      }
    } catch (err) {
      showBanner(err.message || 'Failed to update team member.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this team?`)) return;

    try {
      await adminService.removeTeamMemberAdmin(memberId);
      showBanner(`Removed ${memberName} from team.`);
      const updatedTeams = await adminService.getAllTeamsAdmin();
      setTeams(updatedTeams || []);
      if (manageTeamModal) {
        const updatedCurrent = updatedTeams.find((t) => t.id === manageTeamModal.id);
        if (updatedCurrent) setManageTeamModal(updatedCurrent);
      }
    } catch (err) {
      showBanner(err.message || 'Failed to remove member.', 'error');
    }
  };

  const handleChangeLeader = async (teamId, newLeaderMemberId, memberName) => {
    if (!window.confirm(`Promote "${memberName}" to Team Leader? The previous leader will remain as a team member.`)) return;

    try {
      await adminService.changeTeamLeaderAdmin(teamId, newLeaderMemberId);
      showBanner(`"${memberName}" is now the Team Leader!`);
      const updatedTeams = await adminService.getAllTeamsAdmin();
      setTeams(updatedTeams || []);
      if (manageTeamModal) {
        const updatedCurrent = updatedTeams.find((t) => t.id === manageTeamModal.id);
        if (updatedCurrent) setManageTeamModal(updatedCurrent);
      }
    } catch (err) {
      showBanner(err.message || 'Failed to change leader.', 'error');
    }
  };

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '1180px' }}>
        <AdminNav />

        {/* Header and Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span className="chapter-badge">TEAMS & ROSTERS</span>
            <h2 className="heading-display" style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>
              TEAMS COMMAND CENTER ({teams.length})
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              Direct database CRUD for teams, leaders, member rosters, and registration attachments.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setNewTeamData({ name: '', college: 'Rajkiya Engineering College Banda', competition_id: '', description: '' });
                setShowCreateTeam(true);
              }}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
            >
              <Plus size={16} />
              CREATE TEAM
            </button>
            <button
              onClick={loadData}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              REFRESH
            </button>
          </div>
        </div>

        {/* Action Banner */}
        {actionMessage.text && (
          <div
            style={{
              background: actionMessage.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(53, 248, 172, 0.12)',
              border: `1px solid ${actionMessage.type === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(53, 248, 172, 0.4)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '0.8rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: actionMessage.type === 'error' ? '#fca5a5' : '#35F8AC',
              fontSize: '0.88rem',
              marginBottom: '1.5rem',
            }}
          >
            {actionMessage.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem', background: 'rgba(37, 42, 49, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} color="var(--color-soft-gray)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team name, code, leader, member email, college..."
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.4rem',
                background: '#111827',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-warm-off-white)',
                fontSize: '0.85rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} color="var(--color-warm-amber)" />
            <select
              value={compFilter}
              onChange={(e) => setCompFilter(e.target.value)}
              style={{
                padding: '0.65rem 1rem',
                background: '#111827',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                fontSize: '0.85rem',
              }}
            >
              <option value="ALL">ALL COMPETITIONS</option>
              <option value="hackathon">HACKATHON</option>
              <option value="ideathon">IDEATHON</option>
              <option value="codeathon">CODEATHON</option>
            </select>
          </div>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 0.75rem auto' }} />
            <div>Loading registered teams from database...</div>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div style={{ background: 'rgba(37, 42, 49, 0.5)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No teams match your search and filter criteria.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
            {filteredTeams.map((tm) => {
              const memberCount = tm.members?.length || 0;
              const leader = tm.members?.find((m) => m.role === 'leader') || tm.leader;

              return (
                <div
                  key={tm.id}
                  style={{
                    background: 'rgba(37, 42, 49, 0.85)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div>
                    {/* Card Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                      <div>
                        <span className="chapter-badge" style={{ margin: '0 0 0.3rem 0', fontSize: '0.68rem' }}>
                          {tm.competition?.name || 'HACKATHON'}
                        </span>
                        <h3 className="heading-display" style={{ fontSize: '1.35rem', color: 'var(--color-warm-off-white)', margin: '0.2rem 0' }}>
                          {tm.name}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          🏛️ {tm.college || 'REC Banda'}
                        </div>
                      </div>

                      {/* Team Code Chip */}
                      <button
                        onClick={() => handleCopyCode(tm.code)}
                        title="Click to copy code"
                        style={{
                          background: '#111827',
                          border: '1px solid var(--border-accent-amber)',
                          color: 'var(--color-warm-amber)',
                          padding: '0.25rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <span>{tm.code}</span>
                        {copiedCode === tm.code ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>

                    {/* Leader info */}
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--color-soft-gray)', background: 'rgba(0, 0, 0, 0.25)', padding: '0.5rem 0.75rem', borderRadius: '4px', margin: '0.8rem 0' }}>
                      👑 LEADER: <strong>{leader?.name || leader?.full_name || 'Assigned'}</strong> ({leader?.email || 'N/A'})
                    </div>

                    {/* Member Roster Preview */}
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-warm-amber)', fontWeight: 600 }}>
                          ROSTER ({memberCount} MEMBERS)
                        </span>
                        {tm.registration?.document_url && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-arc-blue)' }}>
                            📄 DECK ATTACHED
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {(tm.members || []).slice(0, 4).map((m) => (
                          <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <span>{m.name || 'Member'}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: m.role === 'leader' ? 'var(--color-warm-amber)' : 'var(--text-muted)' }}>
                              {m.role?.toUpperCase()}
                            </span>
                          </div>
                        ))}
                        {memberCount > 4 && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            + {memberCount - 4} more member(s)...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                    <button
                      onClick={() => setManageTeamModal(tm)}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    >
                      <Users size={14} />
                      MANAGE ROSTER
                    </button>
                    <button
                      onClick={() => {
                        setEditTeamModal(tm);
                        setNewTeamData({
                          name: tm.name,
                          college: tm.college || 'Rajkiya Engineering College Banda',
                          competition_id: tm.competition_id || '',
                          description: tm.description || '',
                        });
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}
                      title="Edit team info"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(tm.id, tm.name)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#f87171',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.45rem 0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Delete team"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================== */}
        {/* MANAGE TEAM ROSTER MODAL                                        */}
        {/* ============================================================== */}
        {manageTeamModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              backdropFilter: 'blur(6px)',
            }}
          >
            <div
              style={{
                background: '#1A1F26',
                border: '1px solid var(--color-arc-blue)',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '780px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '1.75rem',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.75rem' }}>
                <div>
                  <span className="chapter-badge" style={{ margin: 0 }}>TEAM ROSTER CONTROL</span>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#fff', margin: '0.2rem 0' }}>
                    {manageTeamModal.name} ({manageTeamModal.code})
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Track: {manageTeamModal.competition?.name || 'Hackathon'} • {manageTeamModal.college}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setManageTeamModal(null);
                    setShowAddMember(false);
                    setEditingMember(null);
                  }}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Members List */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-stark-gold)', margin: 0 }}>
                    ACTIVE MEMBERS ({manageTeamModal.members?.length || 0})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMember(!showAddMember);
                      setEditingMember(null);
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Plus size={13} />
                    ADD MEMBER
                  </button>
                </div>

                {/* Inline Add Member Form */}
                {showAddMember && (
                  <form
                    onSubmit={handleAddMemberSubmit}
                    style={{
                      background: '#111827',
                      border: '1px solid var(--color-arc-blue)',
                      borderRadius: '6px',
                      padding: '1.25rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-arc-blue)', fontWeight: 600 }}>
                      ADD NEW TEAM MEMBER
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                      <input
                        type="text"
                        required
                        placeholder="Full Name *"
                        value={memberForm.name}
                        onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                        style={{ padding: '0.55rem', background: '#1F2937', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                      />
                      <input
                        type="email"
                        required
                        placeholder="Email Address *"
                        value={memberForm.email}
                        onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                        style={{ padding: '0.55rem', background: '#1F2937', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={memberForm.phone}
                        onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                        style={{ padding: '0.55rem', background: '#1F2937', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                      />
                      <input
                        type="text"
                        placeholder="College"
                        value={memberForm.college}
                        onChange={(e) => setMemberForm({ ...memberForm, college: e.target.value })}
                        style={{ padding: '0.55rem', background: '#1F2937', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                      />
                      <input
                        type="text"
                        placeholder="Branch (e.g. IT)"
                        value={memberForm.branch}
                        onChange={(e) => setMemberForm({ ...memberForm, branch: e.target.value })}
                        style={{ padding: '0.55rem', background: '#1F2937', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                      />
                      <select
                        value={memberForm.year}
                        onChange={(e) => setMemberForm({ ...memberForm, year: e.target.value })}
                        style={{ padding: '0.55rem', background: '#1F2937', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                      <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ padding: '0.45rem 1rem', fontSize: '0.78rem' }}>
                        {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : 'SAVE MEMBER'}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowAddMember(false)} style={{ padding: '0.45rem 0.8rem', fontSize: '0.78rem' }}>
                        CANCEL
                      </button>
                    </div>
                  </form>
                )}

                {/* Inline Edit Member Form */}
                {editingMember && (
                  <form
                    onSubmit={handleUpdateMemberSubmit}
                    style={{
                      background: '#111827',
                      border: '1px solid var(--color-warm-amber)',
                      borderRadius: '6px',
                      padding: '1.25rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-warm-amber)', fontWeight: 600 }}>
                      EDITING MEMBER: {editingMember.name}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                      <input
                        type="text"
                        required
                        value={editingMember.name}
                        onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                        style={{ padding: '0.55rem', background: '#1F2937', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                      />
                      <input
                        type="email"
                        required
                        value={editingMember.email}
                        onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                        style={{ padding: '0.55rem', background: '#1F2937', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                      />
                      <input
                        type="tel"
                        value={editingMember.phone || ''}
                        onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                        placeholder="Phone"
                        style={{ padding: '0.55rem', background: '#1F2937', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                      />
                      <input
                        type="text"
                        value={editingMember.college || ''}
                        onChange={(e) => setEditingMember({ ...editingMember, college: e.target.value })}
                        placeholder="College"
                        style={{ padding: '0.55rem', background: '#1F2937', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                      />
                      <input
                        type="text"
                        value={editingMember.branch || ''}
                        onChange={(e) => setEditingMember({ ...editingMember, branch: e.target.value })}
                        placeholder="Branch"
                        style={{ padding: '0.55rem', background: '#1F2937', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                      />
                      <select
                        value={editingMember.year || '3rd Year'}
                        onChange={(e) => setEditingMember({ ...editingMember, year: e.target.value })}
                        style={{ padding: '0.55rem', background: '#1F2937', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                      <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ padding: '0.45rem 1rem', fontSize: '0.78rem' }}>
                        {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : 'UPDATE MEMBER'}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setEditingMember(null)} style={{ padding: '0.45rem 0.8rem', fontSize: '0.78rem' }}>
                        CANCEL
                      </button>
                    </div>
                  </form>
                )}

                {/* Member Roster Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {(manageTeamModal.members || []).map((m) => (
                    <div
                      key={m.id}
                      style={{
                        background: '#111827',
                        border: `1px solid ${m.role === 'leader' ? 'var(--color-stark-gold)' : 'var(--border-subtle)'}`,
                        borderRadius: '6px',
                        padding: '0.85rem 1.1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.8rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>
                            {m.name || 'Member'}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.68rem',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '3px',
                              background: m.role === 'leader' ? 'rgba(255, 179, 0, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                              color: m.role === 'leader' ? 'var(--color-stark-gold)' : 'var(--text-muted)',
                              fontWeight: 700,
                            }}
                          >
                            {m.role?.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-arc-blue)', marginTop: '2px' }}>
                          {m.email} {m.phone ? `• 📞 ${m.phone}` : ''}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {m.college || 'REC Banda'} {m.branch ? `• ${m.branch}` : ''} {m.year ? `(${m.year})` : ''}
                        </div>
                      </div>

                      {/* Member Actions */}
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        {m.role !== 'leader' && (
                          <button
                            type="button"
                            onClick={() => handleChangeLeader(manageTeamModal.id, m.id, m.name)}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem', color: 'var(--color-stark-gold)' }}
                            title="Promote to leader"
                          >
                            MAKE LEADER
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditingMember(m)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                          title="Edit member details"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(m.id, m.name)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            color: '#f87171',
                            borderRadius: '4px',
                            padding: '0.3rem 0.55rem',
                            cursor: 'pointer',
                          }}
                          title="Remove from team"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setManageTeamModal(null)}
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* CREATE / EDIT TEAM MODAL                                        */}
        {/* ============================================================== */}
        {(showCreateTeam || editTeamModal) && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              backdropFilter: 'blur(6px)',
            }}
          >
            <div
              style={{
                background: '#1A1F26',
                border: '1px solid var(--color-arc-blue)',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '540px',
                padding: '1.75rem',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#fff', margin: '0 0 1.25rem 0' }}>
                {editTeamModal ? 'EDIT TEAM PROFILE' : 'CREATE NEW TEAM'}
              </h3>

              <form onSubmit={handleSaveTeam} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.35rem' }}>
                    TEAM NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeamData.name}
                    onChange={(e) => setNewTeamData({ ...newTeamData, name: e.target.value })}
                    placeholder="e.g. CyberKnights"
                    style={{ width: '100%', padding: '0.65rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.35rem' }}>
                    COLLEGE / INSTITUTION
                  </label>
                  <input
                    type="text"
                    value={newTeamData.college}
                    onChange={(e) => setNewTeamData({ ...newTeamData, college: e.target.value })}
                    placeholder="Rajkiya Engineering College Banda"
                    style={{ width: '100%', padding: '0.65rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.35rem' }}>
                    DESCRIPTION / NOTES
                  </label>
                  <textarea
                    rows={2}
                    value={newTeamData.description}
                    onChange={(e) => setNewTeamData({ ...newTeamData, description: e.target.value })}
                    placeholder="Team project notes, domains..."
                    style={{ width: '100%', padding: '0.65rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowCreateTeam(false);
                      setEditTeamModal(null);
                    }}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : (editTeamModal ? 'UPDATE TEAM' : 'CREATE TEAM')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
