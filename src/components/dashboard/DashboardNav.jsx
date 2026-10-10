import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Users, Trophy, UploadCloud, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardNav() {
  const { profile, role, signOut, isConfigured } = useAuth();

  const links = [
    { to: '/dashboard', label: 'OVERVIEW', icon: LayoutDashboard, end: true },
    { to: '/dashboard/team', label: 'MY TEAM', icon: Users },
    { to: '/dashboard/registration', label: 'REGISTRATIONS', icon: Trophy },
    { to: '/dashboard/submission', label: 'SUBMISSION', icon: UploadCloud },
    { to: '/dashboard/profile', label: 'PROFILE', icon: User },
  ];

  return (
    <div
      style={{
        background: 'var(--color-surface-elevated)',
        border: '1px solid rgba(0, 217, 255, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(0.75rem, 2.5vw, 1.25rem)',
        marginBottom: '2rem',
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.7), inset 0 0 20px rgba(0, 217, 255, 0.03)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(0, 217, 255, 0.15)' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.2rem 0.65rem', background: 'rgba(0, 217, 255, 0.1)', border: '1px solid rgba(0, 217, 255, 0.35)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-arc-cyan)', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-arc-cyan)', boxShadow: '0 0 6px var(--color-arc-cyan)' }} />
            OPERATOR: {role.toUpperCase()}
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.05rem, 3.2vw, 1.3rem)', color: 'var(--color-text-primary)', wordBreak: 'break-word', letterSpacing: '0.04em' }}>
            {profile?.full_name || 'Participant'}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-arc-cyan)', wordBreak: 'break-word' }}>
            {profile?.college || 'Rajkiya Engineering College Banda'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {(role === 'admin' || role === 'organizer') && (
            <NavLink to="/admin" className="btn btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.78rem' }}>
              ADMIN CONSOLE
            </NavLink>
          )}
          {(role === 'judge' || role === 'admin') && (
            <NavLink to="/judge" className="btn btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.78rem' }}>
              JUDGE PORTAL
            </NavLink>
          )}
          <button
            onClick={signOut}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <LogOut size={14} />
            SIGN OUT
          </button>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              style={({ isActive }) => ({
                display: 'inline-flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                gap: '0.5rem',
                padding: '0.6rem 1.1rem',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                letterSpacing: '0.05em',
                textDecoration: 'none',
                background: isActive ? 'rgba(0, 217, 255, 0.16)' : 'rgba(16, 22, 32, 0.65)',
                color: isActive ? 'var(--color-arc-cyan)' : 'var(--color-text-secondary)',
                border: isActive ? '1px solid var(--color-arc-cyan)' : '1px solid rgba(0, 217, 255, 0.15)',
                boxShadow: isActive ? '0 0 14px rgba(0, 217, 255, 0.25)' : 'none',
                transition: 'var(--transition-fast)',
              })}
            >
              <Icon size={16} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
