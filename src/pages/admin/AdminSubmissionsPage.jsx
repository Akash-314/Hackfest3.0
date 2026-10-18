import React, { useState, useEffect, useMemo, useRef } from 'react';
import { adminService } from '../../services/adminService';
import AdminNav from '../../components/admin/AdminNav';
import {
  ExternalLink,
  Video,
  FileText,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit,
  Eye,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  X,
  Trophy,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const GithubIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [compFilter, setCompFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionMessage, setActionMessage] = useState({ text: '', type: 'success' });

  // Modals & form state
  const [inspectModal, setInspectModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [docLoading, setDocLoading] = useState(false);
  const [replacingSubId, setReplacingSubId] = useState(null);
  const fileInputRef = useRef(null);

  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    github_url: '',
    demo_url: '',
    video_url: '',
    document_url: '',
    status: 'submitted',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllSubmissionsAdmin();
      setSubmissions(data || []);
    } catch (err) {
      console.error('Failed to load submissions:', err);
      showBanner('Failed to load submissions: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showBanner = (text, type = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage({ text: '', type: 'success' }), 4000);
  };

  // Filter logic
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const title = (sub.title || '').toLowerCase();
        const desc = (sub.description || '').toLowerCase();
        const teamName = (sub.team?.name || '').toLowerCase();
        const track = (sub.problem_category?.theme || '').toLowerCase();

        if (!title.includes(q) && !desc.includes(q) && !teamName.includes(q) && !track.includes(q)) {
          return false;
        }
      }

      if (compFilter !== 'ALL') {
        const cSlug = (sub.competition?.slug || sub.competition?.name || '').toLowerCase();
        if (!cSlug.includes(compFilter.toLowerCase())) return false;
      }

      if (statusFilter !== 'ALL') {
        if ((sub.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
      }

      return true;
    });
  }, [submissions, search, compFilter, statusFilter]);

  // Document Replace & Delete
  const handleReplaceDocument = async (e, subId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocLoading(true);
    try {
      const targetSub = submissions.find((s) => s.id === subId);
      if (targetSub?.is_registration_deck && targetSub?.registration_id) {
        await adminService.replaceRegistrationDocumentAdmin(targetSub.registration_id, file);
      } else {
        await adminService.replaceSubmissionDocumentAdmin(subId, file);
      }
      showBanner(`Document "${file.name}" uploaded successfully!`);
      await loadData();
    } catch (err) {
      showBanner(err.message || 'Failed to replace document.', 'error');
    } finally {
      setDocLoading(false);
      setReplacingSubId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDocument = async (subId) => {
    if (!window.confirm('Are you sure you want to remove the document attachment for this submission?')) return;

    setDocLoading(true);
    try {
      const targetSub = submissions.find((s) => s.id === subId);
      if (targetSub?.is_registration_deck && targetSub?.registration_id) {
        await adminService.deleteRegistrationDocumentAdmin(targetSub.registration_id);
      } else {
        await adminService.deleteSubmissionDocumentAdmin(subId);
      }
      showBanner('Document attachment removed.');
      await loadData();
    } catch (err) {
      showBanner(err.message || 'Failed to delete document.', 'error');
    } finally {
      setDocLoading(false);
    }
  };

  // Edit Submission Details
  const handleOpenEdit = (sub) => {
    setEditModal(sub);
    setEditFormData({
      title: sub.title || '',
      description: sub.description || '',
      github_url: sub.github_url || '',
      demo_url: sub.demo_url || '',
      video_url: sub.video_url || '',
      document_url: sub.document_url || '',
      status: sub.status || 'submitted',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editModal) return;

    setIsSubmitting(true);
    try {
      await adminService.updateSubmissionAdmin(editModal.id, editFormData);
      showBanner(`Submission "${editFormData.title}" updated successfully!`);
      setEditModal(null);
      await loadData();
    } catch (err) {
      showBanner(err.message || 'Failed to update submission.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Submission
  const handleDeleteSubmission = async (subId, subTitle) => {
    if (!window.confirm(`Are you sure you want to permanently delete submission "${subTitle}"?`)) return;

    try {
      await adminService.deleteSubmissionAdmin(subId);
      showBanner(`Submission "${subTitle}" deleted permanently.`);
      if (inspectModal?.id === subId) setInspectModal(null);
      await loadData();
    } catch (err) {
      showBanner(err.message || 'Failed to delete submission.', 'error');
    }
  };

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = submissions.length;
    const withDocs = submissions.filter((s) => Boolean(s.document_url)).length;
    const evaluated = submissions.filter((s) => s.status === 'evaluated' || (s.scores && s.scores.length > 0)).length;
    const underReview = submissions.filter((s) => s.status === 'under_review' || s.status === 'submitted').length;
    return { total, withDocs, evaluated, underReview };
  }, [submissions]);

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '1180px' }}>
        <AdminNav />

        {/* Hidden file input for document replacement */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".pptx,.ppt,.pdf"
          style={{ display: 'none' }}
          onChange={(e) => replacingSubId && handleReplaceDocument(e, replacingSubId)}
        />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <span className="chapter-badge">DEPLOYMENT LEDGER</span>
            <h2 className="heading-display" style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>
              SUBMISSIONS & DOCUMENT REPOSITORY ({submissions.length})
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              Browse project repositories, live preview demos, attached presentation decks, and scoring audits.
            </p>
          </div>

          <button
            onClick={loadData}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            REFRESH
          </button>
        </div>

        {/* Metrics Summary Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(37, 42, 49, 0.75)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>TOTAL SUBMISSIONS</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', color: 'var(--color-arc-blue)', fontWeight: 700 }}>
              {metrics.total}
            </div>
          </div>
          <div style={{ background: 'rgba(37, 42, 49, 0.75)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>DOCUMENTS ATTACHED</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', color: 'var(--color-warm-amber)', fontWeight: 700 }}>
              {metrics.withDocs}
            </div>
          </div>
          <div style={{ background: 'rgba(37, 42, 49, 0.75)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>EVALUATED</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', color: '#35F8AC', fontWeight: 700 }}>
              {metrics.evaluated}
            </div>
          </div>
          <div style={{ background: 'rgba(37, 42, 49, 0.75)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>AWAITING REVIEW</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', color: '#60a5fa', fontWeight: 700 }}>
              {metrics.underReview}
            </div>
          </div>
        </div>

        {/* Action Message Banner */}
        {actionMessage.text && (
          <div
            style={{
              background: actionMessage.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(53, 248, 172, 0.12)',
              border: `1px solid ${actionMessage.type === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(53, 248, 172, 0.4)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '0.8rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: actionMessage.type === 'error' ? '#fca5a5' : '#35F8AC',
              fontSize: '0.88rem',
              marginBottom: '1.5rem',
            }}
          >
            {actionMessage.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* Toolbar: Search and Filter */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem', background: 'rgba(37, 42, 49, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} color="var(--color-soft-gray)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project title, description, team, problem track..."
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.4rem',
                background: '#111827',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-warm-off-white)',
                fontSize: '0.85rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              value={compFilter}
              onChange={(e) => setCompFilter(e.target.value)}
              style={{ padding: '0.65rem 0.85rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.85rem' }}
            >
              <option value="ALL">ALL COMPETITIONS</option>
              <option value="hackathon">HACKATHON</option>
              <option value="ideathon">IDEATHON</option>
              <option value="codeathon">CODEATHON</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.65rem 0.85rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.85rem' }}
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="submitted">SUBMITTED</option>
              <option value="under_review">UNDER REVIEW</option>
              <option value="evaluated">EVALUATED</option>
              <option value="draft">DRAFT</option>
            </select>
          </div>
        </div>

        {/* Submissions Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 0.75rem auto' }} />
            <div>Loading submission artifacts from database...</div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div style={{ background: 'rgba(37, 42, 49, 0.5)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No project submissions match your criteria.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
            {filteredSubmissions.map((sub) => {
              const statusColor =
                sub.status === 'evaluated'
                  ? '#35F8AC'
                  : sub.status === 'under_review'
                  ? 'var(--color-warm-amber)'
                  : 'var(--color-arc-blue)';

              return (
                <div
                  key={sub.id}
                  style={{
                    background: 'rgba(37, 42, 49, 0.85)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className="chapter-badge" style={{ margin: 0, fontSize: '0.68rem' }}>
                          {sub.competition?.name || 'HACKATHON'}
                        </span>
                        {sub.is_registration_deck && (
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.65rem',
                              color: '#34D399',
                              background: 'rgba(52, 211, 153, 0.15)',
                              border: '1px solid rgba(52, 211, 153, 0.35)',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '3px',
                              fontWeight: 700,
                            }}
                          >
                            REGISTRATION DECK
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          color: statusColor,
                          fontWeight: 700,
                          background: 'rgba(0, 0, 0, 0.3)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '3px',
                        }}
                      >
                        {(sub.status || 'SUBMITTED').toUpperCase()}
                      </span>
                    </div>

                    <h3 className="heading-display" style={{ fontSize: '1.35rem', color: 'var(--color-warm-off-white)', margin: '0.2rem 0' }}>
                      {sub.title || 'Untitled Project'}
                    </h3>

                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--color-soft-gray)', marginBottom: '0.75rem' }}>
                      TEAM: <strong>{sub.team?.name || 'Individual'}</strong> • TRACK: {sub.problem_category?.theme || 'General'}
                    </div>

                    {sub.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {sub.description}
                      </p>
                    )}

                    {/* Attached Document Banner */}
                    <div style={{ background: 'rgba(17, 24, 39, 0.95)', border: '1px solid rgba(0, 217, 255, 0.15)', borderRadius: '4px', padding: '0.65rem 0.85rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={16} color="var(--color-arc-blue)" />
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>
                            {sub.document_name || (sub.document_url ? 'Presentation Deck Attached' : 'No Document Attached')}
                          </div>
                          {sub.document_type && (
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-stark-gold)' }}>
                              FORMAT: {sub.document_type}
                              {sub.document_size && ` • ${(sub.document_size / (1024 * 1024)).toFixed(2)} MB`}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {sub.document_url && (
                          <>
                            <a
                              href={sub.document_url}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-secondary"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                              title="Open presentation deck"
                            >
                              <ExternalLink size={12} />
                              OPEN
                            </a>
                            <a
                              href={sub.document_url}
                              download={sub.document_name || 'presentation'}
                              className="btn btn-secondary"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                              title="Download presentation deck"
                            >
                              <Download size={12} />
                              GET
                            </a>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setReplacingSubId(sub.id);
                            fileInputRef.current?.click();
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          title="Upload / Replace presentation deck"
                        >
                          <Upload size={12} />
                          {sub.document_url ? 'REPLACE' : 'UPLOAD'}
                        </button>
                        {sub.document_url && (
                          <button
                            type="button"
                            onClick={() => handleDeleteDocument(sub.id)}
                            style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', borderRadius: '3px', padding: '0.25rem 0.4rem', cursor: 'pointer' }}
                            title="Delete presentation deck"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* External Artifact Links */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {sub.github_url && (
                        <a href={sub.github_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-soft-gray)', fontSize: '0.78rem' }}>
                          <GithubIcon size={14} /> Repository
                        </a>
                      )}
                      {sub.demo_url && (
                        <a href={sub.demo_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-arc-blue)', fontSize: '0.78rem' }}>
                          <ExternalLink size={14} /> Live Demo
                        </a>
                      )}
                      {sub.video_url && (
                        <a href={sub.video_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-warm-amber)', fontSize: '0.78rem' }}>
                          <Video size={14} /> Video Walkthrough
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                    <button
                      type="button"
                      onClick={() => setInspectModal(sub)}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    >
                      <Eye size={13} />
                      AUDIT
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(sub)}
                      className="btn btn-primary"
                      style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}
                      title="Edit submission details"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubmission(sub.id, sub.title)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#f87171',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.45rem 0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Delete submission"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================== */}
        {/* INSPECT SUBMISSION MODAL                                        */}
        {/* ============================================================== */}
        {inspectModal && (
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
                maxWidth: '680px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '1.75rem',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.75rem' }}>
                <div>
                  <span className="chapter-badge" style={{ margin: 0 }}>SUBMISSION AUDIT</span>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#fff', margin: '0.2rem 0' }}>
                    {inspectModal.title}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Team: {inspectModal.team?.name || 'Individual'} • Track: {inspectModal.problem_category?.theme || 'General'}
                  </div>
                </div>
                <button
                  onClick={() => setInspectModal(null)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <X size={22} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#111827', padding: '0.8rem', borderRadius: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>STATUS</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-stark-gold)', fontWeight: 700 }}>
                    {(inspectModal.status || 'submitted').toUpperCase()}
                  </div>
                </div>

                <div style={{ background: '#111827', padding: '0.8rem', borderRadius: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>SUBMISSION TIMESTAMP</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#fff' }}>
                    {inspectModal.created_at ? new Date(inspectModal.created_at).toLocaleString('en-IN') : 'N/A'}
                  </div>
                </div>
              </div>

              {inspectModal.description && (
                <div style={{ background: '#111827', padding: '1rem', borderRadius: '6px', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-stark-gold)', marginBottom: '0.4rem', fontWeight: 600 }}>
                    PROJECT DESCRIPTION:
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#CBD5E1', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {inspectModal.description}
                  </div>
                </div>
              )}

              {/* Document artifact row */}
              {inspectModal.document_url && (
                <div style={{ background: '#111827', padding: '1rem', borderRadius: '6px', marginBottom: '1.25rem', border: '1px solid rgba(0, 217, 255, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <FileText size={20} color="var(--color-arc-blue)" />
                    <div>
                      <div style={{ fontSize: '0.88rem', color: '#fff', fontWeight: 600 }}>Presentation Deck</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Attached artifact for jury review
                      </div>
                    </div>
                  </div>
                  <a
                    href={inspectModal.document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <ExternalLink size={13} />
                    VIEW DECK
                  </a>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setInspectModal(null)}
                >
                  CLOSE
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const sub = inspectModal;
                    setInspectModal(null);
                    handleOpenEdit(sub);
                  }}
                >
                  EDIT DETAILS
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* EDIT SUBMISSION MODAL                                           */}
        {/* ============================================================== */}
        {editModal && (
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
                maxWidth: '560px',
                padding: '1.75rem',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#fff', margin: '0 0 1.25rem 0' }}>
                EDIT SUBMISSION DETAILS
              </h3>

              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.35rem' }}>
                    PROJECT TITLE *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.35rem' }}>
                    STATUS
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                  >
                    <option value="submitted">SUBMITTED</option>
                    <option value="under_review">UNDER REVIEW</option>
                    <option value="evaluated">EVALUATED</option>
                    <option value="draft">DRAFT</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.35rem' }}>
                    GITHUB REPOSITORY URL
                  </label>
                  <input
                    type="url"
                    value={editFormData.github_url}
                    onChange={(e) => setEditFormData({ ...editFormData, github_url: e.target.value })}
                    placeholder="https://github.com/..."
                    style={{ width: '100%', padding: '0.65rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.35rem' }}>
                    LIVE DEMO PREVIEW URL
                  </label>
                  <input
                    type="url"
                    value={editFormData.demo_url}
                    onChange={(e) => setEditFormData({ ...editFormData, demo_url: e.target.value })}
                    placeholder="https://..."
                    style={{ width: '100%', padding: '0.65rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.35rem' }}>
                    VIDEO RECORDING URL
                  </label>
                  <input
                    type="url"
                    value={editFormData.video_url}
                    onChange={(e) => setEditFormData({ ...editFormData, video_url: e.target.value })}
                    placeholder="https://youtube.com/... or loom.com/..."
                    style={{ width: '100%', padding: '0.65rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.35rem' }}>
                    PROJECT DESCRIPTION
                  </label>
                  <textarea
                    rows={3}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditModal(null)}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : 'SAVE CHANGES'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
