import React, { useState, useEffect } from 'react';
import AdminNav from '../../components/admin/AdminNav';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  ShieldCheck,
  Crown,
  UserCheck,
  UserX,
  Search,
  Lock,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  X,
  Users,
} from 'lucide-react';

export default function AdminUsersPage() {
  const { user, profile, isSuperAdmin, refreshProfile } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [banner, setBanner] = useState({ text: '', type: 'success' });

  const notify = (text, type = 'success') => {
    setBanner({ text, type });
    setTimeout(() => setBanner({ text: '', type: 'success' }), 5000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminList, userList] = await Promise.all([
        adminService.getAdminUsers(),
        adminService.getAllUsersForPromotion(),
      ]);
      setAdmins(adminList || []);
      setAllUsers(userList || []);
    } catch (err) {
      console.error('Failed to load admin personnel:', err);
      notify('Failed to load admin list: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Promote a regular user to Admin
  const handlePromote = async (targetUser) => {
    if (!isSuperAdmin) {
      notify('Access Denied: Only the verified Super Admin can promote users.', 'error');
      return;
    }

    if (!window.confirm(`Grant Admin Access to "${targetUser.full_name}" (${targetUser.email})?`)) {
      return;
    }

    setProcessingId(targetUser.id);
    try {
      await adminService.promoteUserToAdmin(targetUser.id);
      notify(`Successfully promoted ${targetUser.full_name} to Admin role.`);
      await loadData();
    } catch (err) {
      notify('Promotion failed: ' + err.message, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // Demote an Admin to Participant
  const handleDemote = async (adminTarget) => {
    if (!isSuperAdmin) {
      notify('Access Denied: Only the verified Super Admin can revoke admin roles.', 'error');
      return;
    }

    // Protection rule: Super Admin cannot be demoted
    if (adminTarget.is_super_admin) {
      notify('SECURITY VIOLATION: The Super Admin identity is protected and cannot be revoked.', 'error');
      return;
    }

    if (!window.confirm(`Revoke admin privileges from "${adminTarget.full_name}" (${adminTarget.email}) and return to Participant?`)) {
      return;
    }

    setProcessingId(adminTarget.id);
    try {
      await adminService.demoteAdminToParticipant(adminTarget.id);
      notify(`Admin privileges revoked for ${adminTarget.full_name}.`);
      await loadData();
    } catch (err) {
      notify('Revocation failed: ' + err.message, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // SQL snippet for Super Admin bootstrap
  const userEmail = user?.email || 'your-supabase-account-email@domain.com';
  const bootstrapSql = `-- Run in Supabase SQL Editor to establish your verified account as Super Admin:
SELECT public.set_super_admin_by_email('${userEmail}');`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(bootstrapSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Users available for promotion (exclude users already admin or super_admin)
  const nonAdminUsers = allUsers.filter((u) => {
    const isAlreadyAdmin = admins.some((a) => a.id === u.id);
    if (isAlreadyAdmin) return false;
    if (searchUserQuery.trim()) {
      const q = searchUserQuery.toLowerCase().trim();
      const name = (u.full_name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    }
    return true;
  });

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '1280px' }}>
        <AdminNav />

        {/* Action message banner */}
        {banner.text && (
          <div
            style={{
              background: banner.type === 'error' ? 'rgba(143, 48, 53, 0.25)' : 'rgba(0, 191, 255, 0.15)',
              border: `1px solid ${banner.type === 'error' ? 'var(--color-muted-crimson)' : 'var(--color-arc-blue)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem 1.25rem',
              color: banner.type === 'error' ? '#ffb4b7' : 'var(--color-tech-white)',
              fontSize: '0.88rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{banner.text}</span>
            <button
              onClick={() => setBanner({ text: '', type: 'success' })}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <span
              className="chapter-badge"
              style={{
                background: 'rgba(245, 182, 66, 0.2)',
                borderColor: 'var(--color-stark-gold)',
                color: 'var(--color-stark-gold)',
                margin: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Crown size={12} />
              SUPER ADMIN ACCESS ONLY
            </span>
          </div>
          <h1 className="heading-display" style={{ fontSize: '2rem', margin: 0 }}>
            ADMIN ACCESS & ROLE MANAGEMENT
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: '0.3rem 0 0 0' }}>
            Authorize and revoke Administrator privileges. The protected Super Admin account is permanently secured against unauthorized modification.
          </p>
        </div>

        {/* ============================================================== */}
        {/* SUPER ADMIN STATUS & BOOTSTRAP PROTOCOL                        */}
        {/* ============================================================== */}
        <div
          style={{
            background: isSuperAdmin ? 'rgba(245, 182, 66, 0.08)' : 'rgba(143, 48, 53, 0.15)',
            border: isSuperAdmin ? '1px solid var(--color-stark-gold)' : '1px solid var(--color-muted-crimson)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            marginBottom: '2.5rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: isSuperAdmin ? 'rgba(245, 182, 66, 0.2)' : 'rgba(143, 48, 53, 0.3)',
                  border: isSuperAdmin ? '1px solid var(--color-stark-gold)' : '1px solid var(--color-muted-crimson)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSuperAdmin ? 'var(--color-stark-gold)' : '#ffb4b7',
                }}
              >
                {isSuperAdmin ? <Crown size={22} /> : <ShieldAlert size={22} />}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#fff' }}>
                  {isSuperAdmin ? 'SUPER ADMIN ACCESS VERIFIED' : 'SUPER ADMIN INITIAL SETUP REQUIRED'}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: isSuperAdmin ? 'var(--color-stark-gold)' : '#ffb4b7' }}>
                  ACTIVE ACCOUNT: {user?.email || 'NOT AUTHENTICATED'} (ID: {user?.id?.slice(0, 8)}...)
                </div>
              </div>
            </div>

            <button
              onClick={async () => {
                await refreshProfile();
                await loadData();
                notify('Refreshed security credentials from database.');
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
            >
              <RefreshCw size={14} />
              REFRESH PERMISSIONS
            </button>
          </div>

          {!isSuperAdmin ? (
            <div>
              <p style={{ color: '#E2E8F0', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                Per security requirement, Super Admin privileges must be securely established using verified database authorization.
                To establish your account as Super Admin, run the following safe database function in your <strong>Supabase SQL Editor</strong>:
              </p>

              <div
                style={{
                  background: '#0B0F17',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '1rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.84rem',
                  color: 'var(--color-stark-gold)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                <code style={{ wordBreak: 'break-all', minWidth: 0, flex: 1 }}>{bootstrapSql}</code>
                <button
                  type="button"
                  onClick={handleCopySql}
                  style={{
                    background: 'rgba(245, 182, 66, 0.15)',
                    border: '1px solid var(--color-stark-gold)',
                    color: 'var(--color-stark-gold)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {copiedSql ? <Check size={14} /> : <Copy size={14} />}
                  {copiedSql ? 'COPIED!' : 'COPY SQL'}
                </button>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                This runs <code>public.set_super_admin_by_email()</code>, which activates protected Super Admin records in both <code>profiles</code> and <code>app_admins</code> with RLS enforcement.
              </div>
            </div>
          ) : (
            <div style={{ color: '#CBD5E1', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Your account has immutable Super Admin authority. You are authorized to promote regular users to Admin and revoke admin privileges. No regular admin can demote or revoke your status.
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* ACTIVE ADMINISTRATORS ROSTER                                   */}
        {/* ============================================================== */}
        <div
          style={{
            background: 'rgba(28, 32, 38, 0.95)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            marginBottom: '2.5rem',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#fff', margin: 0 }}>
                ACTIVE ADMINISTRATORS ({admins.length})
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0.2rem 0 0 0' }}>
                All accounts with Admin or Super Admin access.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
              <thead>
                <tr
                  style={{
                    background: '#111827',
                    borderBottom: '1px solid var(--border-subtle)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    color: 'var(--color-stark-gold)',
                  }}
                >
                  <th style={{ padding: '0.85rem 1rem' }}>ADMINISTRATOR</th>
                  <th style={{ padding: '0.85rem 1rem' }}>EMAIL ADDRESS</th>
                  <th style={{ padding: '0.85rem 1rem' }}>ROLE</th>
                  <th style={{ padding: '0.85rem 1rem' }}>ADDED DATE</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No administrator accounts found. Establish Super Admin above.
                    </td>
                  </tr>
                ) : (
                  admins.map((adminItem) => {
                    const isTargetSuper = adminItem.is_super_admin;
                    return (
                      <tr
                        key={adminItem.id}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          background: isTargetSuper ? 'rgba(245, 182, 66, 0.05)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            {isTargetSuper ? (
                              <Crown size={16} color="var(--color-stark-gold)" />
                            ) : (
                              <ShieldCheck size={16} color="var(--color-arc-blue)" />
                            )}
                            <div style={{ fontWeight: 600, color: '#fff' }}>{adminItem.full_name}</div>
                          </div>
                        </td>

                        <td style={{ padding: '0.9rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#CBD5E1' }}>
                          {adminItem.email}
                        </td>

                        <td style={{ padding: '0.9rem 1rem' }}>
                          {isTargetSuper ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '4px',
                                background: 'rgba(245, 182, 66, 0.2)',
                                border: '1px solid var(--color-stark-gold)',
                                color: 'var(--color-stark-gold)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                              }}
                            >
                              <Lock size={11} />
                              SUPER ADMIN (PROTECTED)
                            </span>
                          ) : (
                            <span
                              style={{
                                padding: '0.2rem 0.55rem',
                                borderRadius: '4px',
                                background: 'rgba(0, 191, 255, 0.15)',
                                border: '1px solid var(--color-arc-blue)',
                                color: 'var(--color-arc-blue)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                              }}
                            >
                              ADMIN
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '0.9rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          {adminItem.promoted_at ? new Date(adminItem.promoted_at).toLocaleDateString('en-IN') : 'N/A'}
                        </td>

                        <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                          {isTargetSuper ? (
                            <span
                              title="The Super Admin identity is immutable and protected by security policy"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.72rem',
                                color: 'var(--text-muted)',
                                padding: '0.3rem 0.6rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '4px',
                              }}
                            >
                              <Lock size={12} />
                              IMMUTABLE
                            </span>
                          ) : (
                            <button
                              disabled={!isSuperAdmin || processingId === adminItem.id}
                              onClick={() => handleDemote(adminItem)}
                              style={{
                                padding: '0.35rem 0.75rem',
                                background: 'rgba(143, 48, 53, 0.2)',
                                border: '1px solid var(--color-muted-crimson)',
                                color: '#ffb4b7',
                                borderRadius: '4px',
                                cursor: isSuperAdmin ? 'pointer' : 'not-allowed',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.72rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                              }}
                              title="Revoke admin privileges"
                            >
                              <UserX size={13} />
                              {processingId === adminItem.id ? 'REVOKING...' : 'DEMOTE TO PARTICIPANT'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================== */}
        {/* PROMOTE REGISTERED USERS TO ADMIN                               */}
        {/* ============================================================== */}
        <div
          style={{
            background: 'rgba(28, 32, 38, 0.95)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#fff', margin: 0 }}>
                APPOINT NEW ADMINISTRATORS
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0.2rem 0 0 0' }}>
                Search registered accounts to grant Admin privileges (Event CMS, Registrations, SDC Members).
              </p>
            </div>

            {/* Search Box */}
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={15} color="var(--color-arc-blue)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2.2rem',
                  background: '#111827',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
              <thead>
                <tr
                  style={{
                    background: '#111827',
                    borderBottom: '1px solid var(--border-subtle)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    color: 'var(--color-stark-gold)',
                  }}
                >
                  <th style={{ padding: '0.85rem 1rem' }}>REGISTERED USER</th>
                  <th style={{ padding: '0.85rem 1rem' }}>EMAIL ADDRESS</th>
                  <th style={{ padding: '0.85rem 1rem' }}>COLLEGE</th>
                  <th style={{ padding: '0.85rem 1rem' }}>CURRENT ROLE</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {nonAdminUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No eligible candidates found.
                    </td>
                  </tr>
                ) : (
                  nonAdminUsers.slice(0, 20).map((cand) => (
                    <tr key={cand.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>
                        {cand.full_name || 'Anonymous User'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#CBD5E1' }}>
                        {cand.email}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {cand.college || 'REC Banda'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-soft-gray)' }}>
                        {(cand.role || 'participant').toUpperCase()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button
                          disabled={!isSuperAdmin || processingId === cand.id}
                          onClick={() => handlePromote(cand)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            background: 'rgba(0, 191, 255, 0.15)',
                            border: '1px solid var(--color-arc-blue)',
                            color: 'var(--color-arc-blue)',
                            borderRadius: '4px',
                            cursor: isSuperAdmin ? 'pointer' : 'not-allowed',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <UserCheck size={13} />
                          {processingId === cand.id ? 'PROMOTING...' : 'PROMOTE TO ADMIN'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
