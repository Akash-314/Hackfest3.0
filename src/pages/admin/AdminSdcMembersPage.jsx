import React, { useState, useEffect } from 'react';
import AdminNav from '../../components/admin/AdminNav';
import { sdcService } from '../../services/sdcService';
import SuperheroPanel from '../../components/ui/SuperheroPanel';
import ProfileCard from '../../components/ui/ProfileCard';
import {
  Users2,
  Plus,
  Edit2,
  Trash2,
  Upload,
  ArrowUp,
  ArrowDown,
  User,
  GraduationCap,
  Sparkles,
  Users,
  Mail,
  ExternalLink,
  Eye,
  RefreshCw,
  X,
  Check,
  HeartHandshake,
} from 'lucide-react';

function LinkedInIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GitHubIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

export default function AdminSdcMembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewMember, setPreviewMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [banner, setBanner] = useState({ text: '', type: 'success' });

  // Form State
  const [form, setForm] = useState({
    name: '',
    category: 'coordinator',
    role_title: '',
    bio: '',
    photo_url: '',
    social_links: {
      linkedin: '',
      github: '',
      email: '',
      twitter: '',
    },
    sort_order: 1,
    is_active: true,
  });

  const notify = (text, type = 'success') => {
    setBanner({ text, type });
    setTimeout(() => setBanner({ text: '', type: 'success' }), 4000);
  };

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await sdcService.getAllMembersForAdmin();
      setMembers(data || []);
    } catch (err) {
      console.error('Failed to load SDC members:', err);
      notify('Failed to load SDC members: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const filteredMembers = members.filter((m) => {
    if (categoryFilter === 'ALL') return true;
    return m.category === categoryFilter;
  });

  // Modal open
  const handleOpenAdd = () => {
    setEditingMember(null);
    setForm({
      name: '',
      category: categoryFilter !== 'ALL' ? categoryFilter : 'coordinator',
      role_title: '',
      bio: '',
      photo_url: '',
      social_links: { linkedin: '', github: '', email: '', twitter: '' },
      sort_order: members.length + 1,
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (m) => {
    setEditingMember(m);
    setForm({
      name: m.name || '',
      category: m.category || 'coordinator',
      role_title: m.role_title || '',
      bio: m.bio || '',
      photo_url: m.photo_url || '',
      social_links: {
        linkedin: m.social_links?.linkedin || '',
        github: m.social_links?.github || '',
        email: m.social_links?.email || '',
        twitter: m.social_links?.twitter || '',
      },
      sort_order: m.sort_order || 1,
      is_active: m.is_active !== false,
    });
    setModalOpen(true);
  };

  // Photo Upload Handler
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notify('Photo must be less than 5MB in size', 'error');
      return;
    }

    setUploadingPhoto(true);
    try {
      const publicUrl = await sdcService.uploadPhoto(file);
      setForm((prev) => ({ ...prev, photo_url: publicUrl }));
      notify('Photograph uploaded to SDC Storage successfully');
    } catch (err) {
      notify('Failed to upload photo: ' + err.message, 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Submit Handler
  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role_title.trim()) {
      notify('Full name and role / designation title are required', 'error');
      return;
    }

    // Validate LinkedIn URL if configured
    const trimmedLinkedin = form.social_links.linkedin.trim();
    if (trimmedLinkedin) {
      let candidate = trimmedLinkedin;
      if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;
      try {
        const parsed = new URL(candidate);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          notify('Please provide a valid web URL for LinkedIn (e.g. https://linkedin.com/in/username)', 'error');
          return;
        }
      } catch {
        notify('Please provide a valid URL for LinkedIn (e.g. https://linkedin.com/in/username)', 'error');
        return;
      }
    }

    // Validate GitHub URL if configured
    const trimmedGithub = form.social_links.github.trim();
    if (trimmedGithub) {
      let candidate = trimmedGithub;
      if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;
      try {
        const parsed = new URL(candidate);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          notify('Please provide a valid web URL for GitHub (e.g. https://github.com/username)', 'error');
          return;
        }
      } catch {
        notify('Please provide a valid URL for GitHub (e.g. https://github.com/username)', 'error');
        return;
      }
    }

    // Validate Public Contact Email if configured
    const trimmedEmail = form.social_links.email.trim().replace(/^mailto:/i, '');
    if (trimmedEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail) || /[\r\n]/.test(trimmedEmail)) {
        notify('Please provide a valid Public Contact Email address (e.g. volunteer@domain.com)', 'error');
        return;
      }
    }

    setSaving(true);
    try {
      const social_links = {};
      if (trimmedLinkedin) {
        social_links.linkedin = /^https?:\/\//i.test(trimmedLinkedin) ? trimmedLinkedin : `https://${trimmedLinkedin}`;
      }
      if (trimmedGithub) {
        social_links.github = /^https?:\/\//i.test(trimmedGithub) ? trimmedGithub : `https://${trimmedGithub}`;
      }
      if (trimmedEmail) {
        social_links.email = trimmedEmail;
      }
      if (form.social_links.twitter?.trim()) {
        social_links.twitter = form.social_links.twitter.trim();
      }

      const payload = {
        name: form.name.trim(),
        category: form.category,
        role_title: form.role_title.trim(),
        bio: form.bio.trim(),
        photo_url: form.photo_url.trim() || null,
        social_links,
        sort_order: Number(form.sort_order) || 1,
        is_active: form.is_active,
      };

      const entityType = form.category === 'volunteer' ? 'Volunteer' : 'SDC Member';

      if (editingMember) {
        await sdcService.updateMember(editingMember.id, payload);
        notify(`Updated ${entityType} profile for "${payload.name}" successfully.`);
      } else {
        await sdcService.createMember(payload);
        notify(`Added new ${entityType} "${payload.name}" successfully.`);
      }

      setModalOpen(false);
      await loadMembers();
    } catch (err) {
      console.error('Failed to save SDC member:', err);
      const isConstraintError = err.message?.includes('check constraint') || err.message?.includes('sdc_members_category_check');
      if (isConstraintError && (form.category === 'volunteer' || form.category === 'director')) {
        notify(
          `Database constraint: The "${form.category}" category requires executing migration 20261021_add_director_category_to_sdc_members.sql in Supabase SQL editor.`,
          'error'
        );
      } else {
        notify('Failed to save profile: ' + (err.message || 'Unknown database error'), 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  // Delete Member
  const handleDeleteMember = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the roster?`)) return;
    try {
      await sdcService.deleteMember(id);
      notify(`Profile "${name}" has been removed from SDC registry.`);
      setMembers(members.filter((m) => m.id !== id));
    } catch (err) {
      notify('Failed to delete profile: ' + err.message, 'error');
    }
  };

  // Reorder sort_order
  const handleShiftOrder = async (m, direction) => {
    const currentOrder = m.sort_order || 1;
    const newOrder = direction === 'up' ? Math.max(1, currentOrder - 1) : currentOrder + 1;
    if (newOrder === currentOrder) return;

    try {
      await sdcService.updateMember(m.id, { sort_order: newOrder });
      setMembers((prev) =>
        prev.map((item) => (item.id === m.id ? { ...item, sort_order: newOrder } : item))
      );
      notify(`Order updated for ${m.name}`);
    } catch (err) {
      notify('Failed to update order: ' + err.message, 'error');
    }
  };

  const getCategoryBadge = (cat) => {
    if (cat === 'director') {
      return {
        label: 'DIRECTOR / PATRON',
        color: 'var(--color-stark-gold)',
        bg: 'rgba(245, 182, 66, 0.25)',
        icon: Shield,
      };
    }
    if (cat === 'faculty_coordinator') {
      return {
        label: 'FACULTY COORDINATOR',
        color: 'var(--color-stark-gold)',
        bg: 'rgba(245, 182, 66, 0.15)',
        icon: GraduationCap,
      };
    }
    if (cat === 'mentor') {
      return {
        label: 'MENTOR',
        color: 'var(--color-arc-blue)',
        bg: 'rgba(0, 191, 255, 0.15)',
        icon: Sparkles,
      };
    }
    if (cat === 'volunteer') {
      return {
        label: 'VOLUNTEER',
        color: '#A78BFA',
        bg: 'rgba(167, 139, 250, 0.15)',
        icon: HeartHandshake,
      };
    }
    return {
      label: 'COORDINATOR',
      color: '#ffb4b7',
      bg: 'rgba(143, 48, 53, 0.2)',
      icon: Users,
    };
  };

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '1280px' }}>
        <AdminNav />

        {/* Action message banner */}
        {banner.text && (
          <div
            style={{
              background: banner.type === 'error' ? 'rgba(143, 48, 53, 0.25)' : 'rgba(0, 191, 255, 0.15)',
              border: `1px solid ${banner.type === 'error' ? 'var(--color-muted-crimson)' : 'var(--color-arc-blue)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem 1.25rem',
              color: banner.type === 'error' ? '#ffb4b7' : 'var(--color-tech-white)',
              fontSize: '0.88rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{banner.text}</span>
            <button
              onClick={() => setBanner({ text: '', type: 'success' })}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <span className="chapter-badge" style={{ margin: 0 }}>SDC LEADERSHIP REGISTRY</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-stark-gold)' }}>
                REC BANDA
              </span>
            </div>
            <h1 className="heading-display" style={{ fontSize: '2rem', margin: 0 }}>
              SDC MEMBERS & PERSONNEL MANAGEMENT
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: '0.3rem 0 0 0' }}>
              Add, edit, reorder, and remove members across Faculty Coordinator, Mentors, and Student Coordinators.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a
              href="/sdc-members"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
            >
              <Eye size={15} />
              PREVIEW PUBLIC PAGE ↗
            </a>
            <button
              onClick={handleOpenAdd}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
            >
              <Plus size={16} />
              ADD MEMBER
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
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
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: `ALL MEMBERS (${members.length})` },
              { id: 'director', label: '0. DIRECTOR' },
              { id: 'faculty_coordinator', label: '1. FACULTY COORDINATOR' },
              { id: 'mentor', label: '2. MENTORS' },
              { id: 'coordinator', label: '3. COORDINATORS' },
              { id: 'volunteer', label: '4. VOLUNTEERS' },
            ].map((tab) => {
              const active = categoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCategoryFilter(tab.id)}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '4px',
                    border: active ? '1px solid var(--color-arc-blue)' : '1px solid var(--border-subtle)',
                    background: active ? 'rgba(0, 191, 255, 0.15)' : '#111827',
                    color: active ? 'var(--color-arc-blue)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={loadMembers}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            SYNC
          </button>
        </div>

        {/* Members Table */}
        <div
          style={{
            background: 'rgba(28, 32, 38, 0.95)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
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
                  <th style={{ padding: '0.9rem 1rem' }}>MEMBER / PHOTOGRAPH</th>
                  <th style={{ padding: '0.9rem 1rem' }}>CATEGORY</th>
                  <th style={{ padding: '0.9rem 1rem' }}>ROLE & SOCIAL LINKS</th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>SORT ORDER</th>
                  <th style={{ padding: '0.9rem 1rem' }}>STATUS</th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--color-soft-gray)' }}>
                      <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem auto', display: 'block', color: 'var(--color-arc-blue)' }} />
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>FETCHING SDC PERSONNEL ROSTER...</div>
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Users2 size={36} style={{ margin: '0 auto 0.75rem auto', display: 'block', opacity: 0.3 }} />
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#fff' }}>
                        NO PROFILES IN THIS CATEGORY
                      </div>
                      <p style={{ fontSize: '0.85rem', margin: '0.3rem 0 1rem 0' }}>
                        Click "Add Member" above to register faculty leaders, mentors, coordinators, or volunteers.
                      </p>
                      <button
                        onClick={handleOpenAdd}
                        className="btn btn-primary"
                        style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
                      >
                        + ADD NEW PROFILE
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => {
                    const badge = getCategoryBadge(m.category);
                    const BadgeIcon = badge.icon;
                    return (
                      <tr
                        key={m.id}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        {/* Member Photo + Name */}
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div
                              style={{
                                width: '46px',
                                height: '46px',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                background: '#1E293B',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {m.photo_url ? (
                                <img
                                  src={m.photo_url}
                                  alt={m.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <User size={22} color="var(--text-muted)" />
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{m.name}</div>
                              {m.bio && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {m.bio}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.55rem',
                              borderRadius: '4px',
                              background: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.color}`,
                            }}
                          >
                            <BadgeIcon size={12} />
                            {badge.label}
                          </span>
                        </td>

                        {/* Role Title & Social Links */}
                        <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', color: 'var(--color-warm-off-white)' }}>
                          <div style={{ fontWeight: 500, marginBottom: '0.3rem' }}>{m.role_title}</div>
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            {m.social_links?.linkedin && (
                              <a
                                href={m.social_links.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`LinkedIn: ${m.social_links.linkedin}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '22px',
                                  height: '22px',
                                  borderRadius: '3px',
                                  background: 'rgba(0, 119, 181, 0.2)',
                                  color: '#60A5FA',
                                  border: '1px solid rgba(96, 165, 250, 0.3)',
                                }}
                              >
                                <LinkedInIcon size={12} />
                              </a>
                            )}
                            {m.social_links?.github && (
                              <a
                                href={m.social_links.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`GitHub: ${m.social_links.github}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '22px',
                                  height: '22px',
                                  borderRadius: '3px',
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  color: '#F1F5F9',
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                }}
                              >
                                <GitHubIcon size={12} />
                              </a>
                            )}
                            {m.social_links?.email && (
                              <a
                                href={`mailto:${m.social_links.email}`}
                                title={`Email: ${m.social_links.email}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '22px',
                                  height: '22px',
                                  borderRadius: '3px',
                                  background: 'rgba(52, 211, 153, 0.15)',
                                  color: '#34D399',
                                  border: '1px solid rgba(52, 211, 153, 0.3)',
                                }}
                              >
                                <Mail size={12} />
                              </a>
                            )}
                            {!m.social_links?.linkedin && !m.social_links?.github && !m.social_links?.email && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>No social links</span>
                            )}
                          </div>
                        </td>

                        {/* Sort Order */}
                        <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <button
                              onClick={() => handleShiftOrder(m, 'up')}
                              style={{
                                padding: '0.2rem 0.35rem',
                                background: '#111827',
                                border: '1px solid var(--border-subtle)',
                                color: '#fff',
                                borderRadius: '3px',
                                cursor: 'pointer',
                              }}
                              title="Move Up"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-stark-gold)', minWidth: '20px' }}>
                              #{m.sort_order || 1}
                            </span>
                            <button
                              onClick={() => handleShiftOrder(m, 'down')}
                              style={{
                                padding: '0.2rem 0.35rem',
                                background: '#111827',
                                border: '1px solid var(--border-subtle)',
                                color: '#fff',
                                borderRadius: '3px',
                                cursor: 'pointer',
                              }}
                              title="Move Down"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontFamily: 'var(--font-mono)',
                              color: m.is_active !== false ? '#34D399' : 'var(--text-muted)',
                            }}
                          >
                            {m.is_active !== false ? '● ACTIVE' : '○ HIDDEN'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            <button
                              onClick={() => {
                                setPreviewMember(m);
                                setPreviewModalOpen(true);
                              }}
                              style={{
                                padding: '0.3rem 0.6rem',
                                background: 'rgba(245, 182, 66, 0.15)',
                                border: '1px solid var(--color-stark-gold)',
                                color: 'var(--color-stark-gold)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                              title="Live Card Preview"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(m)}
                              style={{
                                padding: '0.3rem 0.6rem',
                                background: 'rgba(0, 191, 255, 0.15)',
                                border: '1px solid var(--color-arc-blue)',
                                color: 'var(--color-arc-blue)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                              title="Edit Member"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(m.id, m.name)}
                              style={{
                                padding: '0.3rem 0.6rem',
                                background: 'rgba(143, 48, 53, 0.2)',
                                border: '1px solid var(--color-muted-crimson)',
                                color: '#ffb4b7',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                              title="Delete Member"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ADD / EDIT MEMBER MODAL                                         */}
        {/* ============================================================== */}
        {modalOpen && (
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
                border: '1px solid var(--color-stark-gold)',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '680px',
                padding: '1.75rem',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', color: '#fff', margin: 0 }}>
                  {editingMember
                    ? `UPDATE ${form.category === 'volunteer' ? 'VOLUNTEER' : 'SDC MEMBER'} PROFILE`
                    : `ADD ${form.category === 'volunteer' ? 'VOLUNTEER' : 'SDC MEMBER'}`}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveMember}>
                {/* Category & Name */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      TIER CATEGORY:
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontFamily: 'var(--font-mono)' }}
                    >
                      <option value="director">0. DIRECTOR / PATRON</option>
                      <option value="faculty_coordinator">1. FACULTY COORDINATOR</option>
                      <option value="mentor">2. MENTOR</option>
                      <option value="coordinator">3. COORDINATOR</option>
                      <option value="volunteer">4. VOLUNTEER</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      FULL NAME:
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Dr. Pushpendra Singh / Student Lead"
                      style={{ width: '100%', padding: '0.65rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>
                </div>

                {/* Role Title & Sort Order */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      ROLE / DESIGNATION TITLE:
                    </label>
                    <input
                      type="text"
                      required
                      value={form.role_title}
                      onChange={(e) => setForm({ ...form, role_title: e.target.value })}
                      placeholder="e.g. Faculty Convener / Head of Web Operations"
                      style={{ width: '100%', padding: '0.65rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      SORT ORDER:
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.sort_order}
                      onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.65rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>
                </div>

                {/* Photograph Section (Upload to Storage or URL) */}
                <div style={{ background: '#111827', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-arc-blue)', marginBottom: '0.5rem' }}>
                    PHOTOGRAPH (SUPABASE STORAGE OR DIRECT URL):
                  </label>

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Preview circle */}
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        background: '#1E293B',
                        border: '1px solid var(--color-arc-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {form.photo_url ? (
                        <img
                          src={form.photo_url}
                          alt="Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <User size={28} color="var(--text-muted)" />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <label
                          className="btn btn-secondary"
                          style={{
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            padding: '0.45rem 0.85rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <Upload size={14} />
                          {uploadingPhoto ? 'UPLOADING...' : 'UPLOAD NEW PHOTO'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            disabled={uploadingPhoto}
                            style={{ display: 'none' }}
                          />
                        </label>

                        {form.photo_url && (
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, photo_url: '' })}
                            style={{
                              background: 'none',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              color: 'var(--text-muted)',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                            }}
                          >
                            CLEAR
                          </button>
                        )}
                      </div>

                      <input
                        type="url"
                        value={form.photo_url}
                        onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                        placeholder="Or paste public photograph URL..."
                        style={{
                          width: '100%',
                          padding: '0.55rem',
                          background: '#1A1F26',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '4px',
                          color: '#fff',
                          fontSize: '0.8rem',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    RESPONSIBILITY / SHORT BIO:
                  </label>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Short description of responsibilities or academic profile..."
                    style={{ width: '100%', padding: '0.65rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                {/* Social Links */}
                <div style={{ background: '#111827', padding: '1rem', borderRadius: '6px', marginBottom: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', fontWeight: 600 }}>
                      SOCIAL PROFILES & CONTACT (ALL OPTIONAL):
                    </label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Leave blank to remove or omit icon from card
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#93C5FD', marginBottom: '0.25rem' }}>
                        <LinkedInIcon size={13} />
                        LINKEDIN PROFILE URL:
                      </label>
                      <input
                        type="url"
                        value={form.social_links.linkedin}
                        onChange={(e) => setForm({ ...form, social_links: { ...form.social_links, linkedin: e.target.value } })}
                        placeholder="https://linkedin.com/in/username"
                        style={{ width: '100%', padding: '0.55rem', background: '#1A1F26', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#D1D5DB', marginBottom: '0.25rem' }}>
                        <GitHubIcon size={13} />
                        GITHUB PROFILE URL:
                      </label>
                      <input
                        type="url"
                        value={form.social_links.github}
                        onChange={(e) => setForm({ ...form, social_links: { ...form.social_links, github: e.target.value } })}
                        placeholder="https://github.com/username"
                        style={{ width: '100%', padding: '0.55rem', background: '#1A1F26', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#34D399', marginBottom: '0.25rem' }}>
                        <Mail size={13} />
                        PUBLIC CONTACT EMAIL:
                      </label>
                      <input
                        type="email"
                        value={form.social_links.email}
                        onChange={(e) => setForm({ ...form, social_links: { ...form.social_links, email: e.target.value } })}
                        placeholder="volunteer@domain.com"
                        style={{ width: '100%', padding: '0.55rem', background: '#1A1F26', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#fff' }}>Display on public SDC Members page</span>
                </label>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploadingPhoto}
                    className="btn btn-primary"
                  >
                    {saving ? 'SAVING...' : editingMember ? 'UPDATE PROFILE' : 'ADD PROFILE'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* LIVE CARD PREVIEW MODAL                                         */}
        {/* ============================================================== */}
        {previewModalOpen && previewMember && (
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
                maxWidth: '400px',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="chapter-badge" style={{ margin: 0 }}>PUBLIC CARD PREVIEW</span>
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Render Public ProfileCard identical to the live site */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ProfileCard
                  avatarUrl={
                    previewMember.photo_url ||
                    (previewMember.name?.toLowerCase().includes('vibhash')
                      ? '/images/faculty/dr_vibhash_yadav.png'
                      : '/images/sdc-avatar-placeholder.svg')
                  }
                  miniAvatarUrl={
                    previewMember.photo_url ||
                    (previewMember.name?.toLowerCase().includes('vibhash')
                      ? '/images/faculty/dr_vibhash_yadav_mini.png'
                      : '/images/sdc-avatar-placeholder.svg')
                  }
                  name={previewMember.name}
                  title={previewMember.role_title}
                  handle={
                    previewMember.category === 'director' || previewMember.category === 'faculty_coordinator'
                      ? null
                      : previewMember.handle || previewMember.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
                  }
                  status={
                    previewMember.category === 'director'
                      ? 'Patron in Chief'
                      : previewMember.category === 'faculty_coordinator'
                      ? 'Faculty Leadership'
                      : previewMember.category === 'mentor'
                      ? 'Technical Mentor'
                      : previewMember.category === 'volunteer'
                      ? 'SDC Volunteer'
                      : 'Event Coordinator'
                  }
                  statusColor={
                    previewMember.category === 'director' || previewMember.category === 'faculty_coordinator'
                      ? '#F5C451'
                      : previewMember.category === 'mentor'
                      ? '#39FF88'
                      : previewMember.category === 'volunteer'
                      ? '#A78BFA'
                      : '#10B981'
                  }
                  linkedinUrl={previewMember.social_links?.linkedin}
                  githubUrl={previewMember.social_links?.github}
                  contactEmail={previewMember.social_links?.email}
                  backdropColor={
                    previewMember.category === 'faculty_coordinator'
                      ? '#282015'
                      : previewMember.category === 'mentor'
                      ? '#0B1711'
                      : previewMember.category === 'volunteer'
                      ? '#1c152b'
                      : '#1f162b'
                  }
                  theme="dark"
                  holo={0.82}
                  glare={0.48}
                  tiltStrength={11}
                  parallax={8}
                  enableTilt={true}
                  radius={16}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
