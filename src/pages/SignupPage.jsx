import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ArrowUpRight, Lock, Mail, User, Phone, School, AlertCircle, CheckCircle2, Loader2, Zap, Shield } from 'lucide-react';
import { eventMeta } from '../data/eventData';
import HudPanel from '../components/ui/HudPanel';
import HoloBadge from '../components/ui/HoloBadge';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: 'Rajkiya Engineering College Banda',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { signUp, isConfigured } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        college: formData.college,
        phone: formData.phone,
        role: 'participant',
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'calc(var(--nav-height) + 2rem) 1.5rem 4rem', position: 'relative' }}>
      <div className="container" style={{ maxWidth: '560px', position: 'relative', zIndex: 10 }}>
        <Link
          to="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-arc-blue)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.08em', marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={16} />
          BACK TO HOME
        </Link>

        <HudPanel variant="red" tag="REGISTRATION // NEW ACCOUNT" scan={true}>
          <div style={{ marginBottom: '1.8rem' }}>
            <HoloBadge variant="red" icon={Shield} style={{ marginBottom: '0.8rem' }}>
              CREATE ACCOUNT
            </HoloBadge>
            <h1 className="heading-display" style={{ fontSize: '2.2rem', marginBottom: '0.4rem', color: '#FFFFFF', letterSpacing: '0.04em' }}>
              PARTICIPANT REGISTRATION
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: '1.6' }}>
              Register for {eventMeta.name}. Create your profile to join teams, participate in competitions, and track your progress.
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

          {success ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0, 191, 255, 0.15)', border: '1px solid var(--color-arc-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto', color: 'var(--color-arc-blue)', boxShadow: '0 0 20px rgba(0, 191, 255, 0.3)' }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 className="heading-display" style={{ fontSize: '1.5rem', marginBottom: '0.6rem', color: '#FFFFFF' }}>ACCOUNT CREATED SUCCESSFULLY</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.92rem', marginBottom: '1.8rem', lineHeight: '1.6' }}>
                Your account is ready. Sign in with your credentials to access your dashboard and register for events.
              </p>
              <button
                type="button"
                className="btn btn-avenger"
                onClick={() => navigate('/login')}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                PROCEED TO LOGIN
                <ArrowUpRight size={18} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginBottom: '0.35rem', letterSpacing: '0.08em' }}>
                  FULL NAME *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="var(--color-stark-crimson)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Arjun Verma"
                    required
                    style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: 'var(--color-surface-elevated)', border: '1px solid rgba(230, 36, 41, 0.3)', borderRadius: '4px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.92rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginBottom: '0.35rem', letterSpacing: '0.08em' }}>
                  EMAIL ADDRESS *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="var(--color-stark-crimson)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@institution.ac.in"
                    required
                    style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: 'var(--color-surface-elevated)', border: '1px solid rgba(230, 36, 41, 0.3)', borderRadius: '4px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.92rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginBottom: '0.35rem', letterSpacing: '0.08em' }}>
                    PHONE NUMBER
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} color="var(--color-stark-crimson)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: 'var(--color-surface-elevated)', border: '1px solid rgba(230, 36, 41, 0.3)', borderRadius: '4px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginBottom: '0.35rem', letterSpacing: '0.08em' }}>
                    COLLEGE / UNIVERSITY
                  </label>
                  <div style={{ position: 'relative' }}>
                    <School size={18} color="var(--color-stark-crimson)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      placeholder="REC Banda"
                      style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: 'var(--color-surface-elevated)', border: '1px solid rgba(230, 36, 41, 0.3)', borderRadius: '4px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginBottom: '0.35rem', letterSpacing: '0.08em' }}>
                    PASSWORD *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="var(--color-stark-crimson)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
                      required
                      style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: 'var(--color-surface-elevated)', border: '1px solid rgba(230, 36, 41, 0.3)', borderRadius: '4px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginBottom: '0.35rem', letterSpacing: '0.08em' }}>
                    CONFIRM PASSWORD *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="var(--color-stark-crimson)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      required
                      style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: 'var(--color-surface-elevated)', border: '1px solid rgba(230, 36, 41, 0.3)', borderRadius: '4px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.92rem' }}
                    />
                  </div>
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
                    CREATING ACCOUNT...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    CREATE ACCOUNT
                    <ArrowUpRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          <div style={{ marginTop: '1.8rem', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.2rem', fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-arc-cyan)', fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </HudPanel>
      </div>
    </div>
  );
}
