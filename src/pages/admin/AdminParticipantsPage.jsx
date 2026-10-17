import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import AdminNav from '../../components/admin/AdminNav';
import {
  Search,
  Mail,
  Phone,
  School,
  Shield,
  Edit,
  Trash2,
  Users,
  Eye,
  RefreshCw,
  AlertCircle,
  Check,
  Loader2,
  X,
  Filter,
  UserCheck,
  UserPlus,
} from 'lucide-react';

export default function AdminParticipantsPage() {
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [collegeFilter, setCollegeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState({ text: '', type: 'success' });

  // Modals state
  const [inspectModal, setInspectModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    college: '',
    branch: '',
    year: '',
    role: 'participant',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllParticipants();
      setParticipants(res || []);
    } catch (err) {
      console.error('Failed to load participants:', err);
      showBanner('Failed to load participants from database: ' + err.message, 'error');
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

  // Filter logic
  const filtered = useMemo(() => {
    return participants.filter((p) => {
      if (search.trim()) {
        const term = search.toLowerCase().trim();
        const name = (p.full_name || '').toLowerCase();
        const email = (p.email || '').toLowerCase();
        const phone = (p.phone || '').toLowerCase();
        const college = (p.college || '').toLowerCase();
        const branch = (p.branch || '').toLowerCase();
        const role = (p.role || '').toLowerCase();

        if (
          !name.includes(term) &&
          !email.includes(term) &&
          !phone.includes(term) &&
          !college.includes(term) &&
          !branch.includes(term) &&
          !role.includes(term)
        ) {
          return false;
        }
      }

      if (roleFilter !== 'ALL') {
        if ((p.role || 'participant').toLowerCase() !== roleFilter.toLowerCase()) return false;
      }

      if (collegeFilter !== 'ALL') {
        const isRecBanda = (p.college || '').toLowerCase().includes('rec banda') || (p.college || '').toLowerCase().includes('rajkiya');
        if (collegeFilter === 'REC_BANDA' && !isRecBanda) return false;
        if (collegeFilter === 'EXTERNAL' && isRecBanda) return false;
      }

      return true;
    });
  }, [participants, search, roleFilter, collegeFilter]);

  // Handle Edit Participant
  const handleOpenEdit = (p) => {
    setEditModal(p);
    setEditFormData({
      full_name: p.full_name || '',
      email: p.email || '',
      phone: p.phone || '',
      college: p.college || 'Rajkiya Engineering College Banda',
      branch: p.branch || '',
      year: p.year || '3rd Year',
      role: p.role || 'participant',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editModal) return;

    setIsSubmitting(true);
    try {
      await adminService.updateParticipant(editModal.id, editFormData);
      showBanner(`Participant profile "${editFormData.full_name}" updated successfully!`);
      setEditModal(null);
      await loadData();
    } catch (err) {
      showBanner(err.message || 'Failed to update participant.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Participant
  const handleDeleteParticipant = async (p) => {
    if (!window.confirm(`Are you sure you want to delete participant "${p.full_name || p.email}"? This will remove their profile and associated memberships.`)) {
      return;
    }

    try {
      await adminService.deleteParticipant(p.id);
      showBanner(`Participant "${p.full_name || p.email}" deleted permanently.`);
      if (inspectModal?.id === p.id) setInspectModal(null);
      await loadData();
    } catch (err) {
      showBanner(err.message || 'Failed to delete participant.', 'error');
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = participants.length;
    const recCount = participants.filter((p) => (p.college || '').toLowerCase().includes('rec banda') || (p.college || '').toLowerCase().includes('rajkiya')).length;
    const externalCount = total - recCount;
    const adminCount = participants.filter((p) => ['admin', 'super_admin', 'organizer'].includes(p.role)).length;
    return { total, recCount, externalCount, adminCount };
  }, [participants]);

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '1180px' }}>
        <AdminNav />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <span className="chapter-badge">PARTICIPANTS LEDGER</span>
            <h2 className="heading-display" style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>
              ALL REGISTERED PARTICIPANTS ({participants.length})
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              View and manage complete participant identities, college affiliations, and team rosters.
            </p>
          </div>

          <button
            onClick={loadData}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            REFRESH
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(37, 42, 49, 0.75)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>TOTAL PARTICIPANTS</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', color: 'var(--color-arc-blue)', fontWeight: 700 }}>
              {stats.total}
            </div>
          </div>
          <div style={{ background: 'rgba(37, 42, 49, 0.75)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>REC BANDA CAMPUS</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', color: 'var(--color-warm-amber)', fontWeight: 700 }}>
              {stats.recCount}
            </div>
          </div>
          <div style={{ background: 'rgba(37, 42, 49, 0.75)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>EXTERNAL COLLEGES</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', color: '#35F8AC', fontWeight: 700 }}>
              {stats.externalCount}
            </div>
          </div>
          <div style={{ background: 'rgba(37, 42, 49, 0.75)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>ADMINS & ORGANIZERS</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', color: '#f87171', fontWeight: 700 }}>
              {stats.adminCount}
            </div>
          </div>
        </div>

        {/* Action Message Banner */}
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

        {/* Toolbar: Search and Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(37, 42, 49, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} color="var(--color-soft-gray)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, college, branch..."
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

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ padding: '0.65rem 0.85rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.85rem' }}
            >
              <option value="ALL">ALL ROLES</option>
              <option value="participant">PARTICIPANTS</option>
              <option value="admin">ADMINS</option>
              <option value="organizer">ORGANIZERS</option>
            </select>

            <select
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
              style={{ padding: '0.65rem 0.85rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.85rem' }}
            >
              <option value="ALL">ALL COLLEGES</option>
              <option value="REC_BANDA">REC BANDA</option>
              <option value="EXTERNAL">EXTERNAL COLLEGES</option>
            </select>
          </div>
        </div>

        {/* Participants Table */}
        <div style={{ background: 'rgba(37, 42, 49, 0.75)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', overflowX: 'auto', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
            <thead>
              <tr style={{ background: '#111827', borderBottom: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-warm-amber)' }}>
                <th style={{ padding: '1rem' }}>PARTICIPANT</th>
                <th style={{ padding: '1rem' }}>CONTACT</th>
                <th style={{ padding: '1rem' }}>INSTITUTION & BRANCH</th>
                <th style={{ padding: '1rem' }}>ROLE</th>
                <th style={{ padding: '1rem' }}>TEAM PASSES</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                    Loading participant records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No matching participant records found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isAdmin = ['admin', 'super_admin', 'organizer'].includes(p.role);
                  const teamsJoined = p.team_members || [];

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-warm-off-white)' }}>
                          {p.full_name || 'Anonymous Participant'}
                        </div>
                        {p.is_unlinked && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-warm-amber)', background: 'rgba(255, 179, 0, 0.12)', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>
                            ROSTER MEMBER
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <div style={{ color: 'var(--color-arc-blue)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                          {p.email || 'N/A'}
                        </div>
                        {p.phone && (
                          <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
                            📞 {p.phone}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <div style={{ color: 'var(--text-secondary)' }}>
                          {p.college || 'Rajkiya Engineering College Banda'}
                        </div>
                        {(p.branch || p.year) && (
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {p.branch} {p.year ? `• ${p.year}` : ''}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            background: isAdmin ? 'rgba(143, 48, 53, 0.25)' : 'rgba(37, 42, 49, 0.6)',
                            border: `1px solid ${isAdmin ? 'var(--color-muted-crimson)' : 'var(--border-subtle)'}`,
                            color: isAdmin ? '#ffb4b7' : 'var(--color-warm-off-white)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                          }}
                        >
                          {(p.role || 'participant').toUpperCase()}
                        </span>
                      </td>

                      <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                        {teamsJoined.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            {teamsJoined.map((tm, idx) => (
                              <span key={idx} style={{ color: tm.role === 'leader' ? 'var(--color-warm-amber)' : 'var(--text-secondary)' }}>
                                {tm.team?.name || 'Team'} ({tm.role})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Individual</span>
                        )}
                      </td>

                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => setInspectModal(p)}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                            title="Inspect details"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                            title="Edit participant"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteParticipant(p)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              color: '#f87171',
                              borderRadius: '4px',
                              padding: '0.35rem 0.55rem',
                              cursor: 'pointer',
                            }}
                            title="Delete participant"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ============================================================== */}
        {/* INSPECT PARTICIPANT MODAL                                      */}
        {/* ============================================================== */}
        {inspectModal && (
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
                maxWidth: '600px',
                padding: '1.75rem',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.75rem' }}>
                <div>
                  <span className="chapter-badge" style={{ margin: 0 }}>PARTICIPANT PROFILE</span>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', color: '#fff', margin: '0.2rem 0' }}>
                    {inspectModal.full_name || 'Participant'}
                  </h3>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-arc-blue)' }}>
                    {inspectModal.email}
                  </div>
                </div>
                <button
                  onClick={() => setInspectModal(null)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <X size={22} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#111827', padding: '0.85rem', borderRadius: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>PHONE</div>
                  <div style={{ fontSize: '0.88rem', color: '#fff' }}>{inspectModal.phone || 'Not provided'}</div>
                </div>
                <div style={{ background: '#111827', padding: '0.85rem', borderRadius: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>COLLEGE</div>
                  <div style={{ fontSize: '0.88rem', color: '#fff' }}>{inspectModal.college || 'Rajkiya Engineering College Banda'}</div>
                </div>
                <div style={{ background: '#111827', padding: '0.85rem', borderRadius: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>BRANCH & YEAR</div>
                  <div style={{ fontSize: '0.88rem', color: '#fff' }}>{inspectModal.branch || 'N/A'} {inspectModal.year ? `(${inspectModal.year})` : ''}</div>
                </div>
                <div style={{ background: '#111827', padding: '0.85rem', borderRadius: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>ACCESS ROLE</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--color-warm-amber)', fontWeight: 700 }}>
                    {(inspectModal.role || 'participant').toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Team affiliations */}
              <div style={{ background: '#111827', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-stark-gold)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  AFFILIATED TEAMS & EVENTS:
                </div>
                {(!inspectModal.team_members || inspectModal.team_members.length === 0) ? (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No team affiliations recorded.</div>
                ) : (
                  inspectModal.team_members.map((tm, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#fff', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', padding: '0.35rem 0' }}>
                      <span>Team <strong>{tm.team?.name}</strong> ({tm.team?.code})</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-arc-blue)' }}>{tm.role?.toUpperCase()}</span>
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setInspectModal(null)}
                >
                  CLOSE
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const p = inspectModal;
                    setInspectModal(null);
                    handleOpenEdit(p);
                  }}
                >
                  EDIT PROFILE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* EDIT PARTICIPANT MODAL                                         */}
        {/* ============================================================== */}
        {editModal && (
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
                EDIT PARTICIPANT RECORD
              </h3>

              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.35rem' }}>
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.full_name}
                    onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.35rem' }}>
                    EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.35rem' }}>
                      PHONE
                    </label>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.35rem' }}>
                      ROLE
                    </label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                    >
                      <option value="participant">Participant</option>
                      <option value="admin">Admin</option>
                      <option value="organizer">Organizer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.35rem' }}>
                    COLLEGE / INSTITUTION
                  </label>
                  <input
                    type="text"
                    value={editFormData.college}
                    onChange={(e) => setEditFormData({ ...editFormData, college: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.35rem' }}>
                      BRANCH
                    </label>
                    <input
                      type="text"
                      value={editFormData.branch}
                      onChange={(e) => setEditFormData({ ...editFormData, branch: e.target.value })}
                      placeholder="e.g. IT"
                      style={{ width: '100%', padding: '0.65rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.35rem' }}>
                      YEAR
                    </label>
                    <select
                      value={editFormData.year}
                      onChange={(e) => setEditFormData({ ...editFormData, year: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditModal(null)}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : 'SAVE CHANGES'}
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
