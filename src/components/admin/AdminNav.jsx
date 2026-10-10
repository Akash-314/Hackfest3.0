import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Trophy,
  Globe,
  Users2,
  ShieldAlert,
  ClipboardList,
  Users,
  FileText,
  Scale,
  ArrowLeft,
  Crown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminNav() {
  const { isSuperAdmin, role } = useAuth();

  const coreLinks = [
    { to: '/admin', label: 'OVERVIEW', icon: LayoutDashboard, end: true },
    { to: '/admin/registrations', label: 'REGISTRATIONS', icon: Trophy },
    { to: '/admin/cms', label: 'WEBSITE CMS', icon: Globe },
    { to: '/admin/sdc-members', label: 'SDC MEMBERS', icon: Users2 },
    { to: '/admin/audit', label: 'AUDIT LOG', icon: ClipboardList },
  ];

  const superAdminLinks = isSuperAdmin
    ? [
        {
          to: '/admin/users',
          label: 'ADMIN MANAGEMENT',
          icon: ShieldAlert,
          isSuper: true,
        },
      ]
    : [];

  const secondaryLinks = [
    { to: '/admin/participants', label: 'PARTICIPANTS', icon: Users },
    { to: '/admin/teams', label: 'TEAMS', icon: Users },
    { to: '/admin/submissions', label: 'PROJECTS', icon: FileText },
    { to: '/admin/judging', label: 'JUDGING', icon: Scale },
  ];

  return (
    <div
      style={{
        background: 'var(--color-surface-elevated)',
        border: '1px solid rgba(230, 36, 41, 0.45)',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(0.75rem, 2.5vw, 1.25rem)',
        marginBottom: '2.5rem',
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.7), 0 0 20px rgba(230, 36, 41, 0.15)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
            <span
              className="chapter-badge"
              style={{
                background: isSuperAdmin ? 'rgba(245, 182, 66, 0.25)' : 'rgba(143, 48, 53, 0.25)',
                borderColor: isSuperAdmin ? 'var(--color-stark-gold)' : 'var(--color-muted-crimson)',
                color: isSuperAdmin ? 'var(--color-stark-gold)' : '#ffb4b7',
                margin: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              {isSuperAdmin ? <Crown size={12} /> : null}
              {isSuperAdmin ? 'SUPER ADMIN ACCESS' : 'ADMIN CONSOLE • ADMIN ACCESS'}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--color-arc-blue)',
                letterSpacing: '0.08em',
              }}
            >
              ADMIN PANEL
            </span>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1rem, 3.2vw, 1.35rem)',
              color: 'var(--color-warm-off-white)',
              letterSpacing: '0.03em',
            }}
          >
            STUDENT DEVELOPER CLUB // REC BANDA
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
          <NavLink
            to="/sdc-members"
            target="_blank"
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.78rem' }}
          >
            VIEW SDC PAGE ↗
          </NavLink>
          <NavLink
            to="/dashboard"
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.78rem' }}
          >
            <ArrowLeft size={14} />
            BACK TO DASHBOARD
          </NavLink>
        </div>
      </div>

      {/* Primary Management Navigation */}
      <nav style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {[...coreLinks, ...superAdminLinks].map((link) => {
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
                padding: '0.65rem 1.15rem',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textDecoration: 'none',
                background: isActive
                  ? link.isSuper
                    ? 'rgba(245, 182, 66, 0.25)'
                    : 'rgba(143, 48, 53, 0.35)'
                  : 'rgba(37, 42, 49, 0.65)',
                color: isActive
                  ? link.isSuper
                    ? 'var(--color-stark-gold)'
                    : '#ffb4b7'
                  : 'var(--color-soft-gray)',
                border: isActive
                  ? link.isSuper
                    ? '1px solid var(--color-stark-gold)'
                    : '1px solid var(--border-accent-crimson)'
                  : '1px solid var(--border-subtle)',
                boxShadow: isActive ? '0 0 12px rgba(230, 36, 41, 0.2)' : 'none',
                transition: 'var(--transition-fast)',
              })}
            >
              <Icon size={16} />
              {link.label}
              {link.isSuper && (
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '3px',
                    background: 'rgba(245, 182, 66, 0.3)',
                    color: 'var(--color-stark-gold)',
                  }}
                >
                  SUPER
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Secondary Operational Links */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          paddingTop: '0.6rem',
          borderTop: '1px dashed rgba(255, 255, 255, 0.08)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.08em',
            marginRight: '0.3rem',
          }}
        >
          EVENT TOOLS:
        </span>
        {secondaryLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                display: 'inline-flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.74rem',
                textDecoration: 'none',
                background: isActive ? 'rgba(0, 191, 255, 0.15)' : 'transparent',
                color: isActive ? 'var(--color-arc-blue)' : 'var(--text-muted)',
                border: isActive ? '1px solid var(--color-arc-blue)' : '1px solid transparent',
              })}
            >
              <Icon size={13} />
              {link.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
