import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import AdminNav from '../../components/admin/AdminNav';
import { Users, Copy, Check } from 'lucide-react';

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAllTeams().then((res) => {
      setTeams(res);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        <AdminNav />

        <div style={{ marginBottom: '2rem' }}>
          <span className="chapter-badge">TEAMS</span>
          <h2 className="heading-display" style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>
            ALL TEAMS ({teams.length})
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            View team members, leaders, invite codes, and event assignments.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
          {teams.map((tm) => (
            <div key={tm.id} style={{ background: 'rgba(37, 42, 49, 0.75)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                <div>
                  <span className="chapter-badge" style={{ margin: '0 0 0.3rem 0' }}>
                    {tm.competition?.name || 'HACKATHON'}
                  </span>
                  <h3 className="heading-display" style={{ fontSize: '1.3rem', color: 'var(--color-warm-off-white)' }}>
                    {tm.name}
                  </h3>
                </div>

                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', background: '#111827', border: '1px solid var(--border-accent-amber)', color: 'var(--color-warm-amber)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                  {tm.code}
                </span>
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                LEADER: {tm.leader?.full_name || 'Assigned'} ({tm.leader?.email})
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.8rem' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-soft-gray)', marginBottom: '0.5rem' }}>
                  MEMBERS ({tm.members?.length || 1})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {(tm.members || []).map((m) => (
                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <span>{m.profile?.full_name || 'Member'}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: m.role === 'leader' ? 'var(--color-warm-amber)' : 'var(--text-muted)' }}>
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
