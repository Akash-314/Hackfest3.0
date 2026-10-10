import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ArrowUpRight, Lock, Mail, AlertCircle, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { eventMeta } from '../data/eventData';
import HudPanel from '../components/ui/HudPanel';
import HoloBadge from '../components/ui/HoloBadge';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'calc(var(--nav-height) + 2rem) 1.5rem 4rem', position: 'relative' }}>
      <div className="container" style={{ maxWidth: '500px', position: 'relative', zIndex: 10 }}>
        <Link
          to="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-arc-blue)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.08em', marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={16} />
          BACK TO HOME
        </Link>

        <HudPanel variant="cyan" tag="LOGIN // PORTAL" scan={true}>
          <div style={{ marginBottom: '1.8rem' }}>
            <HoloBadge variant="cyan" icon={ShieldCheck} style={{ marginBottom: '0.8rem' }}>
              ACCOUNT LOGIN
            </HoloBadge>
            <h1 className="heading-display" style={{ fontSize: '2.2rem', marginBottom: '0.4rem', color: '#FFFFFF', letterSpacing: '0.04em' }}>
              WELCOME BACK
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: '1.6' }}>
              Sign in to access your dashboard, team details, and competition submissions for {eventMeta.name}.
            </p>
          </div>

          {!isConfigured && (
            <div style={{ background: 'rgba(245, 182, 66, 0.1)', border: '1px solid var(--color-stark-gold)', borderRadius: '4px', padding: '0.9rem 1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#F5F7FA', lineHeight: '1.5', fontFamily: 'var(--font-mono)' }}>
              <strong>Notice:</strong> Supabase environment configuration pending.
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(230, 36, 41, 0.15)', border: '1px solid var(--color-energy-red)', borderRadius: '4px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#FFB4B7', fontSize: '0.85rem', marginBottom: '1.4rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, color: 'var(--color-energy-red)' }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginBottom: '0.4rem', letterSpacing: '0.08em' }}>
                EMAIL ADDRESS
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--color-arc-cyan)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@institution.ac.in"
                  required
                  style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.28)', borderRadius: '4px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.94rem' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', borderBottom: 'none', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-text-secondary)', letterSpacing: '0.08em' }}>
                  PASSWORD
                </label>
                <Link to="/forgot-password" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-infinity-gold)' }}>
                  FORGOT PASSWORD?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--color-arc-cyan)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.28)', borderRadius: '4px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.94rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.6rem', justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  SIGNING IN...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  SIGN IN
                  <ArrowUpRight size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.8rem', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.2rem', fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--color-infinity-gold)', fontWeight: 600 }}>
              Create an Account
            </Link>
          </div>
        </HudPanel>
      </div>
    </div>
  );
}
