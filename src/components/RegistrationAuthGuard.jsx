import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ShieldCheck } from 'lucide-react';

/**
 * RegistrationAuthGuard
 *
 * Centralized authentication guard for all HackFest 3.0 event registration flows
 * (Hackathon, Codeathon, Ideathon).
 *
 * Guarantees that:
 * 1. Unauthenticated visitors cannot access or submit event registration forms.
 * 2. Full destination path (including ?competition=... search parameters) is preserved.
 * 3. Loading states during Supabase session restoration prevent premature or false redirects.
 * 4. Only genuine, verified Supabase sessions are permitted through.
 */
export default function RegistrationAuthGuard({ children }) {
  const { user, loading, isConfigured } = useAuth();
  const location = useLocation();

  // 1. Session Restoration Loading State
  if (loading) {
    return (
      <div
        style={{
          minHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.2rem',
          paddingTop: 'var(--nav-height, 72px)',
          textAlign: 'center',
        }}
        aria-live="polite"
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(0, 217, 255, 0.1)',
            border: '1px solid rgba(0, 217, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(0, 217, 255, 0.25)',
          }}
        >
          <Loader2 size={32} className="animate-spin" color="var(--color-arc-cyan, #00d9ff)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.85rem',
              color: 'var(--color-arc-cyan, #00d9ff)',
              letterSpacing: '0.12em',
              fontWeight: 700,
            }}
          >
            VERIFYING AGENT CLEARANCE...
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body, sans-serif)',
              fontSize: '0.82rem',
              color: 'var(--color-text-secondary, #94a3b8)',
            }}
          >
            Validating HackFest 3.0 participant session
          </span>
        </div>
      </div>
    );
  }

  // 2. Bypass in unconfigured local environment (development mock preview)
  if (!isConfigured) {
    return children;
  }

  // 3. Unauthenticated Visitor Guard — Redirect to Login preserving exact destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 4. Authenticated Session Verified
  return children;
}
