import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardNav from '../../components/dashboard/DashboardNav';
import { User, Phone, School, Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function DashboardProfilePage() {
  const { profile, updateProfile, isConfigured } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    college: 'Rajkiya Engineering College Banda',
    branch: '',
    year: '',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        college: profile.college || 'Rajkiya Engineering College Banda',
        branch: profile.branch || '',
        year: profile.year || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      if (isConfigured) {
        await updateProfile({
          full_name: formData.fullName,
          phone: formData.phone,
          college: formData.college,
          branch: formData.branch,
          year: formData.year,
        });
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        <DashboardNav />

        <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.25)', borderRadius: 'var(--radius-lg)', padding: 'clamp(1.8rem, 4vw, 2.5rem)', boxShadow: '0 12px 35px rgba(0, 0, 0, 0.7)' }}>
          <div style={{ marginBottom: '1.8rem' }}>
            <span className="chapter-badge">IDENTIFICATION</span>
            <h2 className="heading-display" style={{ fontSize: '1.8rem', marginBottom: '0.4rem', color: 'var(--color-text-primary)' }}>
              OPERATOR PROFILE
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem' }}>
              Update your identity details, academic affiliation, and communication coordinates.
            </p>
          </div>

          {success && (
            <div style={{ background: 'rgba(185, 133, 69, 0.15)', border: '1px solid var(--border-accent-amber)', borderRadius: 'var(--radius-sm)', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--color-warm-amber)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              <CheckCircle2 size={18} />
              <span>Profile updated successfully in system database.</span>
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(143, 48, 53, 0.2)', border: '1px solid var(--border-accent-crimson)', borderRadius: 'var(--radius-sm)', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ffb4b7', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
            {/* Email (Read only) */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-soft-gray)', marginBottom: '0.4rem' }}>
                REGISTERED EMAIL (LOCKED)
              </label>
              <input
                type="email"
                value={profile?.email || 'operator@recbanda.ac.in'}
                disabled
                style={{ width: '100%', padding: '0.8rem 1rem', background: '#0d131f', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.92rem', cursor: 'not-allowed' }}
              />
            </div>

            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-soft-gray)', marginBottom: '0.4rem' }}>
                FULL NAME *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.8rem 1rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontSize: '0.92rem' }}
              />
            </div>

            {/* Phone & College */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-soft-gray)', marginBottom: '0.4rem' }}>
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  style={{ width: '100%', padding: '0.8rem 1rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-soft-gray)', marginBottom: '0.4rem' }}>
                  COLLEGE / INSTITUTION
                </label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.8rem 1rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontSize: '0.92rem' }}
                />
              </div>
            </div>

            {/* Branch & Year */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-soft-gray)', marginBottom: '0.4rem' }}>
                  BRANCH / DEPARTMENT
                </label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="e.g. Information Technology"
                  style={{ width: '100%', padding: '0.8rem 1rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-soft-gray)', marginBottom: '0.4rem' }}>
                  ACADEMIC YEAR
                </label>
                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="e.g. 3rd Year"
                  style={{ width: '100%', padding: '0.8rem 1rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontSize: '0.92rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ marginTop: '0.8rem', alignSelf: 'flex-start' }}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  SAVING UPDATES...
                </>
              ) : (
                'SAVE PROFILE DETAILS'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
