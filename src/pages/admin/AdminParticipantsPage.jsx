import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import AdminNav from '../../components/admin/AdminNav';
import { Search, Mail, Phone, School, Shield } from 'lucide-react';

export default function AdminParticipantsPage() {
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAllParticipants().then((res) => {
      setParticipants(res);
      setLoading(false);
    });
  }, []);

  const filtered = participants.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.full_name?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      p.college?.toLowerCase().includes(term) ||
      p.role?.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        <AdminNav />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span className="chapter-badge">PARTICIPANTS</span>
            <h2 className="heading-display" style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>
              ALL REGISTERED PARTICIPANTS ({participants.length})
            </h2>
          </div>

          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} color="var(--color-soft-gray)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, college..."
              style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.4rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        <div style={{ background: 'rgba(37, 42, 49, 0.75)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: '#111827', borderBottom: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-warm-amber)' }}>
                <th style={{ padding: '1rem' }}>NAME</th>
                <th style={{ padding: '1rem' }}>EMAIL</th>
                <th style={{ padding: '1rem' }}>COLLEGE / INSTITUTION</th>
                <th style={{ padding: '1rem' }}>ROLE</th>
                <th style={{ padding: '1rem' }}>REGISTRATIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No matching participant records found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-warm-off-white)' }}>
                      {p.full_name}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--color-soft-gray)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      {p.email}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {p.college || 'REC Banda'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', background: p.role === 'admin' ? 'rgba(143, 48, 53, 0.25)' : 'rgba(37, 42, 49, 0.6)', border: `1px solid ${p.role === 'admin' ? 'var(--color-muted-crimson)' : 'var(--border-subtle)'}`, color: p.role === 'admin' ? '#ffb4b7' : 'var(--color-warm-off-white)', fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
                        {p.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-warm-amber)' }}>
                      {p.registrations?.length || 0} event(s)
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
