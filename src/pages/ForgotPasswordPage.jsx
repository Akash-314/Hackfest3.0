import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Mail, AlertCircle, CheckCircle2, Loader2, ArrowUpRight } from 'lucide-react';
import { eventMeta } from '../data/eventData';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { resetPassword, isConfigured } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'calc(var(--nav-height) + 2rem) 1.5rem 4rem' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <Link
          to="/login"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-warm-amber)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={16} />
          BACK TO LOGIN
        </Link>

        <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.25)', borderRadius: 'var(--radius-lg)', padding: 'clamp(2rem, 5vw, 2.8rem)', boxShadow: '0 12px 35px rgba(0, 0, 0, 0.7)' }}>
          <div style={{ marginBottom: '1.8rem' }}>
            <span className="chapter-badge">PASSWORD RECOVERY</span>
            <h1 className="heading-display" style={{ fontSize: '2rem', marginBottom: '0.4rem', color: 'var(--color-text-primary)' }}>
              FORGOT PASSWORD
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem' }}>
              Enter your registered email address to receive a password reset link.
            </p>
          </div>

          {!isConfigured && (
            <div style={{ background: 'rgba(185, 133, 69, 0.12)', border: '1px solid var(--border-accent-amber)', borderRadius: 'var(--radius-sm)', padding: '0.9rem 1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: 'var(--color-warm-off-white)' }}>
              Supabase environment variables are pending. Configure your credentials in <code>.env</code>.
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(143, 48, 53, 0.2)', border: '1px solid var(--border-accent-crimson)', borderRadius: 'var(--radius-sm)', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ffb4b7', fontSize: '0.85rem', marginBottom: '1.4rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(185, 133, 69, 0.2)', border: '1px solid var(--color-warm-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto', color: 'var(--color-warm-amber)' }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 className="heading-display" style={{ fontSize: '1.4rem', marginBottom: '0.6rem' }}>RESET EMAIL SENT</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.8rem', lineHeight: '1.6' }}>
                Password reset instructions have been sent to <strong>{email}</strong>.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                BACK TO SIGN IN
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-soft-gray)', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                  EMAIL ADDRESS
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="var(--color-soft-gray)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@institution.ac.in"
                    required
                    style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.7rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontFamily: 'var(--font-body)', fontSize: '0.92rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    SENDING INSTRUCTIONS...
                  </>
                ) : (
                  <>
                    SEND RESET LINK
                    <ArrowUpRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
