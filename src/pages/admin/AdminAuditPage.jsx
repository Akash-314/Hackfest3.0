import React, { useState, useEffect, useMemo } from 'react';
import AdminNav from '../../components/admin/AdminNav';
import { adminService } from '../../services/adminService';
import {
  ClipboardList,
  Search,
  Filter,
  Shield,
  Eye,
  RefreshCw,
  User,
  Clock,
  Lock,
  X,
  FileText,
} from 'lucide-react';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectLog, setInspectLog] = useState(null);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAuditLogs(150);
      setLogs(data || []);
    } catch (err) {
      console.error('Failed to load audit trail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterAction !== 'ALL') {
        const act = (log.action || '').toUpperCase();
        if (filterAction === 'ADMIN' && !act.includes('ADMIN')) return false;
        if (filterAction === 'REGISTRATION' && !act.includes('REGISTRATION')) return false;
        if (filterAction === 'SDC' && !act.includes('MEMBER') && !act.includes('SDC')) return false;
        if (filterAction === 'CMS' && !act.includes('SCHEDULE') && !act.includes('EVENT') && !act.includes('ANNOUNCEMENT') && !act.includes('FAQ')) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const actor = (log.actor_email || '').toLowerCase();
        const act = (log.action || '').toLowerCase();
        const ent = (log.entity_type || '').toLowerCase();
        const details = JSON.stringify(log.details || {}).toLowerCase();

        return actor.includes(q) || act.includes(q) || ent.includes(q) || details.includes(q);
      }

      return true;
    });
  }, [logs, filterAction, searchQuery]);

  const getActionColor = (action = '') => {
    const a = action.toUpperCase();
    if (a.includes('PROMOTE') || a.includes('SUPER_ADMIN')) return 'var(--color-stark-gold)';
    if (a.includes('DEMOTE') || a.includes('DELETE')) return '#ffb4b7';
    if (a.includes('REGISTRATION')) return 'var(--color-arc-blue)';
    if (a.includes('MEMBER')) return '#34D399';
    return '#E2E8F0';
  };

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '1280px' }}>
        <AdminNav />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <span className="chapter-badge" style={{ margin: 0 }}>SECURITY AUDIT TRAIL</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-stark-gold)' }}>
                ACTIVITY LOG
              </span>
            </div>
            <h1 className="heading-display" style={{ fontSize: '2rem', margin: 0 }}>
              ADMINISTRATIVE AUDIT LOG
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: '0.3rem 0 0 0' }}>
              Verifiable event timeline tracking role appointments, CMS updates, member changes, and registration approvals.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Lock size={12} />
              PERMANENT LOG
            </span>
            <button
              onClick={loadAuditLogs}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              REFRESH
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            background: 'rgba(28, 32, 38, 0.95)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Action Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: `ALL ACTIVITIES (${logs.length})` },
              { id: 'ADMIN', label: 'ROLE GOVERNANCE' },
              { id: 'REGISTRATION', label: 'REGISTRATIONS' },
              { id: 'SDC', label: 'SDC MEMBERS' },
              { id: 'CMS', label: 'WEBSITE CMS' },
            ].map((tab) => {
              const active = filterAction === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterAction(tab.id)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '4px',
                    border: active ? '1px solid var(--color-arc-blue)' : '1px solid var(--border-subtle)',
                    background: active ? 'rgba(0, 191, 255, 0.15)' : '#111827',
                    color: active ? 'var(--color-arc-blue)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} color="var(--color-arc-blue)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Filter by actor, action, details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.2rem',
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

        {/* Audit Log Table */}
        <div
          style={{
            background: 'rgba(28, 32, 38, 0.95)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
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
                  <th style={{ padding: '0.85rem 1rem' }}>TIMESTAMP</th>
                  <th style={{ padding: '0.85rem 1rem' }}>ACTOR</th>
                  <th style={{ padding: '0.85rem 1rem' }}>ACTION EXECUTED</th>
                  <th style={{ padding: '0.85rem 1rem' }}>TARGET ENTITY</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--color-soft-gray)' }}>
                      <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem auto', display: 'block', color: 'var(--color-arc-blue)' }} />
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>VERIFYING AUDIT TRAIL INTEGRITY...</div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <ClipboardList size={36} style={{ margin: '0 auto 0.75rem auto', display: 'block', opacity: 0.3 }} />
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#fff' }}>
                        NO AUDIT ENTRIES FOUND
                      </div>
                      <p style={{ fontSize: '0.85rem', margin: '0.3rem 0 0 0' }}>
                        Action records are automatically generated when administrative changes are executed.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const color = getActionColor(log.action);
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.86rem' }}>
                        <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {log.created_at ? new Date(log.created_at).toLocaleString('en-IN') : 'N/A'}
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{log.actor_email || 'System'}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-arc-blue)' }}>
                            {log.actor_role?.toUpperCase() || 'ADMIN'}
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color,
                            }}
                          >
                            {log.action}
                          </span>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              background: '#111827',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '3px',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.74rem',
                              color: 'var(--color-soft-gray)',
                            }}
                          >
                            {log.entity_type} {log.entity_id ? `(#${String(log.entity_id).slice(0, 8)})` : ''}
                          </span>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <button
                            onClick={() => setInspectLog(log)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              color: 'var(--color-tech-white)',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.72rem',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            <Eye size={12} />
                            VIEW JSON
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Inspector Modal */}
        {inspectLog && (
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
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#fff', margin: 0 }}>
                  AUDIT LOG DETAILS #{String(inspectLog.id).slice(0, 8)}
                </h3>
                <button
                  onClick={() => setInspectLog(null)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
                <div>
                  <strong style={{ color: 'var(--color-stark-gold)' }}>ACTION:</strong> {inspectLog.action}
                </div>
                <div>
                  <strong style={{ color: 'var(--color-stark-gold)' }}>ACTOR:</strong> {inspectLog.actor_email}
                </div>
                <div>
                  <strong style={{ color: 'var(--color-stark-gold)' }}>ENTITY:</strong> {inspectLog.entity_type} ({inspectLog.entity_id})
                </div>
                <div>
                  <strong style={{ color: 'var(--color-stark-gold)' }}>TIMESTAMP:</strong> {new Date(inspectLog.created_at).toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-arc-blue)', marginBottom: '0.3rem' }}>
                  RECORD PAYLOAD (JSON):
                </div>
                <pre
                  style={{
                    background: '#0B0F17',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '1rem',
                    color: '#34D399',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    overflowX: 'auto',
                    maxHeight: '300px',
                  }}
                >
                  {JSON.stringify(inspectLog.details || {}, null, 2)}
                </pre>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setInspectLog(null)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem' }}
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
