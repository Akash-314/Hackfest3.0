import React, { useState, useEffect, useMemo, useRef } from 'react';
import AdminNav from '../../components/admin/AdminNav';
import { adminService } from '../../services/adminService';
import { exportService } from '../../services/exportService';
import {
  Trophy,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
  User,
  Users,
  Shield,
  Calendar,
  Check,
  Upload,
  Trash2,
  ExternalLink,
  FileCheck,
} from 'lucide-react';

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [arenaFilter, setArenaFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL'); // ALL, TODAY, WEEK, MONTH
  const [pptFilter, setPptFilter] = useState('ALL'); // ALL, WITH_PPT, WITHOUT_PPT
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [inspectModalItem, setInspectModalItem] = useState(null);
  const [statusModalItem, setStatusModalItem] = useState(null);
  const [newStatus, setNewStatus] = useState('confirmed');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [actionMessage, setActionMessage] = useState({ text: '', type: 'success' });
  const [docActionLoading, setDocActionLoading] = useState(false);
  const [uploadTargetId, setUploadTargetId] = useState(null);
  const adminDocInputRef = useRef(null);
  const tableFileInputRef = useRef(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllRegistrations();
      setRegistrations(data || []);
    } catch (err) {
      console.error('Failed to load registrations:', err);
      showBanner('Failed to load registrations from database: ' + err.message, 'error');
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

  const handleAdminReplaceDocument = async (e, registrationId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocActionLoading(true);
    try {
      const updated = await adminService.replaceRegistrationDocumentAdmin(registrationId, file);
      showBanner(`Document "${file.name}" attached successfully!`, 'success');
      setInspectModalItem((prev) => (prev && prev.id === registrationId ? { ...prev, ...updated } : prev));
      await loadData();
    } catch (err) {
      showBanner(err.message || 'Failed to replace document.', 'error');
    } finally {
      setDocActionLoading(false);
      if (adminDocInputRef.current) adminDocInputRef.current.value = '';
    }
  };

  const handleTableRowUpload = (regId) => {
    setUploadTargetId(regId);
    if (tableFileInputRef.current) {
      tableFileInputRef.current.value = '';
      tableFileInputRef.current.click();
    }
  };

  const handleTableFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetId) return;

    setDocActionLoading(true);
    try {
      await adminService.replaceRegistrationDocumentAdmin(uploadTargetId, file);
      showBanner(`Document "${file.name}" uploaded successfully for registration!`, 'success');
      await loadData();
    } catch (err) {
      showBanner(err.message || 'Failed to upload document.', 'error');
    } finally {
      setDocActionLoading(false);
      setUploadTargetId(null);
      if (tableFileInputRef.current) tableFileInputRef.current.value = '';
    }
  };

  const handleAdminDeleteDocument = async (registrationId) => {
    if (!window.confirm('Are you sure you want to delete this attached presentation document? This will remove the file from storage.')) return;

    setDocActionLoading(true);
    try {
      await adminService.deleteRegistrationDocumentAdmin(registrationId);
      showBanner('Document attachment removed successfully.', 'success');
      setInspectModalItem((prev) => (prev && prev.id === registrationId ? {
        ...prev,
        document_url: null,
        document_name: null,
        document_type: null,
        document_size: null,
        document_path: null,
      } : prev));
      await loadData();
    } catch (err) {
      showBanner(err.message || 'Failed to delete document.', 'error');
    } finally {
      setDocActionLoading(false);
    }
  };

  const handleAdminDeleteRegistration = async (registrationId, teamId = null, teamName = '') => {
    const targetLabel = teamName
      ? `team "${teamName}" and its registration`
      : `registration #${registrationId ? registrationId.slice(0, 8) : ''}`;

    if (
      !window.confirm(
        `Are you sure you want to permanently delete ${targetLabel}? This will remove the registered team, its roster of members, and the registration record.`
      )
    ) {
      return;
    }

    try {
      await adminService.deleteRegistrationAndTeamAdmin(registrationId, teamId);
      showBanner(`Deleted ${targetLabel} successfully.`, 'success');
      setInspectModalItem(null);
      await loadData();
    } catch (err) {
      showBanner(err.message || 'Failed to delete registration / team.', 'error');
    }
  };

  // Filter & Search logic
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (r.profile?.full_name || r.user_name || '').toLowerCase();
        const email = (r.profile?.email || r.user_email || '').toLowerCase();
        const phone = (r.profile?.phone || '').toLowerCase();
        const college = (r.profile?.college || '').toLowerCase();
        const teamName = (r.team?.name || r.team_name || '').toLowerCase();
        const id = (r.id || '').toLowerCase();
        const comp = (r.competition?.name || r.competition_name || '').toLowerCase();

        const matches =
          name.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          college.includes(q) ||
          teamName.includes(q) ||
          id.includes(q) ||
          comp.includes(q);

        if (!matches) return false;
      }

      // Arena / Competition
      if (arenaFilter !== 'ALL') {
        const cSlug = (r.competition?.slug || r.competition?.name || r.competition_id || '').toLowerCase();
        if (!cSlug.includes(arenaFilter.toLowerCase())) return false;
      }

      // Status
      if (statusFilter !== 'ALL') {
        const s = (r.registration_status || '').toLowerCase();
        if (s !== statusFilter.toLowerCase()) return false;
      }

      // Date Range
      if (dateFilter !== 'ALL' && r.created_at) {
        const now = new Date();
        const recordDate = new Date(r.created_at);
        const diffDays = (now - recordDate) / (1000 * 60 * 60 * 24);

        if (dateFilter === 'TODAY' && diffDays > 1) return false;
        if (dateFilter === 'WEEK' && diffDays > 7) return false;
        if (dateFilter === 'MONTH' && diffDays > 30) return false;
      }

      // PPT / Proposal Deck Filter
      if (pptFilter !== 'ALL') {
        const hasDoc = Boolean(r.document_url || r.team?.document_url);
        if (pptFilter === 'WITH_PPT' && !hasDoc) return false;
        if (pptFilter === 'WITHOUT_PPT' && hasDoc) return false;
      }

      return true;
    });
  }, [registrations, searchQuery, arenaFilter, statusFilter, dateFilter, pptFilter]);

  // Sorting
  const sortedRegistrations = useMemo(() => {
    const list = [...filteredRegistrations];
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'name') {
        valA = a.profile?.full_name || a.user_name || '';
        valB = b.profile?.full_name || b.user_name || '';
      } else if (sortField === 'arena') {
        valA = a.competition?.name || a.competition_name || '';
        valB = b.competition?.name || b.competition_name || '';
      } else if (sortField === 'team') {
        valA = a.team?.name || a.team_name || '';
        valB = b.team?.name || b.team_name || '';
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredRegistrations, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedRegistrations.length / pageSize));
  const paginatedRegistrations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRegistrations.slice(start, start + pageSize);
  }, [sortedRegistrations, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Selection
  const isAllSelected =
    paginatedRegistrations.length > 0 &&
    paginatedRegistrations.every((r) => selectedIds.has(r.id));

  const handleSelectAll = () => {
    const next = new Set(selectedIds);
    if (isAllSelected) {
      paginatedRegistrations.forEach((r) => next.delete(r.id));
    } else {
      paginatedRegistrations.forEach((r) => next.add(r.id));
    }
    setSelectedIds(next);
  };

  const handleToggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Export handlers
  const getRecordsToExport = () => {
    if (selectedIds.size > 0) {
      return registrations.filter((r) => selectedIds.has(r.id));
    }
    return sortedRegistrations;
  };

  const handleExportExcel = () => {
    const records = getRecordsToExport();
    if (records.length === 0) {
      showBanner('No records available to export.', 'error');
      return;
    }
    try {
      exportService.exportToExcel(records, `HackFest3_Registrations_${new Date().toISOString().slice(0, 10)}.xlsx`);
      showBanner(`Successfully exported ${records.length} registrations to Excel (.xlsx)`);
    } catch (err) {
      showBanner('Export failed: ' + err.message, 'error');
    }
  };

  const handleExportCsv = () => {
    const records = getRecordsToExport();
    if (records.length === 0) {
      showBanner('No records available to export.', 'error');
      return;
    }
    try {
      exportService.exportToCsv(records, `HackFest3_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
      showBanner(`Successfully exported ${records.length} registrations to CSV`);
    } catch (err) {
      showBanner('Export failed: ' + err.message, 'error');
    }
  };

  const handleExportPdf = () => {
    const records = getRecordsToExport();
    if (records.length === 0) {
      showBanner('No records available to export.', 'error');
      return;
    }
    try {
      exportService.exportToPdf(records, `HackFest3_Registrations_${new Date().toISOString().slice(0, 10)}.pdf`, {
        arena: arenaFilter,
        status: statusFilter,
      });
      showBanner(`Successfully exported ${records.length} registrations to PDF`);
    } catch (err) {
      showBanner('Export failed: ' + err.message, 'error');
    }
  };

  const handlePrintList = () => {
    const records = getRecordsToExport();
    if (records.length === 0) {
      showBanner('No records available to print.', 'error');
      return;
    }
    exportService.printRegistrations(records, `HackFest 3.0 Registration Report — ${arenaFilter} (${statusFilter})`);
  };

  const handlePrintSingle = (registration) => {
    exportService.printSingleRegistration(registration);
  };

  // Status updates
  const handleOpenStatusModal = (r) => {
    setStatusModalItem(r);
    setNewStatus(r.registration_status || 'confirmed');
    setStatusNotes(r.notes || '');
  };

  const handleSaveStatus = async () => {
    if (!statusModalItem) return;
    setIsUpdatingStatus(true);
    try {
      await adminService.updateRegistrationStatus(statusModalItem.id, newStatus, statusNotes);
      showBanner(`Registration #${statusModalItem.id.slice(0, 8)} status shifted to ${newStatus.toUpperCase()}`);
      setStatusModalItem(null);
      await loadData();
    } catch (err) {
      showBanner('Failed to update status: ' + err.message, 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Quick stats
  const totalCount = registrations.length;
  const confirmedCount = registrations.filter((r) => r.registration_status === 'confirmed').length;
  const pendingCount = registrations.filter((r) => r.registration_status === 'pending').length;
  const waitlistCount = registrations.filter((r) => r.registration_status === 'waitlist' || r.registration_status === 'waitlisted').length;
  const pptCount = registrations.filter((r) => Boolean(r.document_url || r.team?.document_url)).length;

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '1280px' }}>
        <AdminNav />

        {/* Hidden file input for direct table row document upload */}
        <input
          type="file"
          ref={tableFileInputRef}
          accept=".pptx,.ppt,.pdf"
          style={{ display: 'none' }}
          onChange={handleTableFileSelected}
        />

        {/* Action message banner */}
        {actionMessage.text && (
          <div
            style={{
              background: actionMessage.type === 'error' ? 'rgba(143, 48, 53, 0.25)' : 'rgba(0, 191, 255, 0.15)',
              border: `1px solid ${actionMessage.type === 'error' ? 'var(--color-muted-crimson)' : 'var(--color-arc-blue)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem 1.25rem',
              color: actionMessage.type === 'error' ? '#ffb4b7' : 'var(--color-tech-white)',
              fontSize: '0.88rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{actionMessage.text}</span>
            <button
              onClick={() => setActionMessage({ text: '', type: 'success' })}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Header & Metric Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <span className="chapter-badge" style={{ margin: 0 }}>DATA INTELLIGENCE</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-stark-gold)' }}>
                AUDITED DATABASE RECORDS
              </span>
            </div>
            <h1 className="heading-display" style={{ fontSize: '2rem', margin: 0 }}>
              REGISTRATION MANAGEMENT
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: '0.3rem 0 0 0' }}>
              Inspect event registrations, verify participant details, view uploaded presentation decks, and generate certified exports.
            </p>
          </div>

          {/* Quick Counter Chips */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.6rem 1rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>TOTAL REGISTERED</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-warm-off-white)' }}>{totalCount}</div>
            </div>
            <div
              onClick={() => {
                setPptFilter((prev) => (prev === 'WITH_PPT' ? 'ALL' : 'WITH_PPT'));
                setCurrentPage(1);
              }}
              style={{
                background: pptFilter === 'WITH_PPT' ? 'rgba(52, 211, 153, 0.22)' : 'rgba(30, 41, 59, 0.7)',
                border: `1px solid ${pptFilter === 'WITH_PPT' ? '#34D399' : 'rgba(52, 211, 153, 0.35)'}`,
                borderRadius: '6px',
                padding: '0.6rem 1rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Click to toggle filter: Registrations with PPT attached"
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#34D399', fontWeight: 700 }}>PPTs UPLOADED</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#34D399' }}>
                {pptCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({totalCount > 0 ? Math.round((pptCount / totalCount) * 100) : 0}%)</span>
              </div>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(0, 191, 255, 0.3)', borderRadius: '6px', padding: '0.6rem 1rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-arc-blue)' }}>CONFIRMED</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-arc-blue)' }}>{confirmedCount}</div>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(245, 182, 66, 0.3)', borderRadius: '6px', padding: '0.6rem 1rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-stark-gold)' }}>PENDING</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-stark-gold)' }}>{pendingCount}</div>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(143, 48, 53, 0.3)', borderRadius: '6px', padding: '0.6rem 1rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#ffb4b7' }}>WAITLIST</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#ffb4b7' }}>{waitlistCount}</div>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search Bar */}
        <div
          style={{
            background: 'rgba(28, 32, 38, 0.95)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '240px' }}>
              <Search size={16} color="var(--color-arc-blue)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by participant, email, phone, team, ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                  borderRadius: '4px',
                  background: '#111827',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--color-tech-white)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            {/* Competition Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>COMPETITION:</span>
              <select
                value={arenaFilter}
                onChange={(e) => {
                  setArenaFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '0.55rem 0.85rem',
                  background: '#111827',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  color: 'var(--color-tech-white)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">ALL COMPETITIONS</option>
                <option value="hackathon">HACKATHON (MARVELOUS HACKS)</option>
                <option value="ideathon">IDEATHON (INFINITY IDEAS)</option>
                <option value="codeathon">CODEATHON (THOR SPEED CODING)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>STATUS:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '0.55rem 0.85rem',
                  background: '#111827',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  color: 'var(--color-tech-white)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">ALL STATUSES</option>
                <option value="confirmed">CONFIRMED</option>
                <option value="pending">PENDING</option>
                <option value="waitlist">WAITLIST</option>
                <option value="rejected">REJECTED</option>
                <option value="cancelled">CANCELLED</option>
              </select>
            </div>

            {/* PPT / Presentation Deck Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: pptFilter !== 'ALL' ? '#34D399' : 'var(--text-muted)', fontWeight: pptFilter !== 'ALL' ? 700 : 400 }}>PPT DECK:</span>
              <select
                value={pptFilter}
                onChange={(e) => {
                  setPptFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '0.55rem 0.85rem',
                  background: '#111827',
                  border: pptFilter !== 'ALL' ? '1px solid #34D399' : '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  color: pptFilter !== 'ALL' ? '#34D399' : 'var(--color-tech-white)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">ALL (PPT STATUS)</option>
                <option value="WITH_PPT">HAS PPT / ATTACHED</option>
                <option value="WITHOUT_PPT">MISSING PPT (PENDING)</option>
              </select>
            </div>

            {/* Date Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>DATE:</span>
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '0.55rem 0.85rem',
                  background: '#111827',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  color: 'var(--color-tech-white)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">ALL TIME</option>
                <option value="TODAY">TODAY</option>
                <option value="WEEK">PAST 7 DAYS</option>
                <option value="MONTH">PAST 30 DAYS</option>
              </select>
            </div>

            <button
              onClick={loadData}
              className="btn btn-secondary"
              title="Refresh Records"
              style={{ padding: '0.55rem 0.85rem', fontSize: '0.8rem' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              SYNC
            </button>
          </div>
        </div>

        {/* Export & Batch Action Toolbar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
            padding: '0.75rem 1.25rem',
            background: 'rgba(20, 24, 30, 0.85)',
            border: '1px solid rgba(245, 182, 66, 0.25)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-stark-gold)' }}>
              EXPORT DATA INTELLIGENCE:
            </span>
            {selectedIds.size > 0 && (
              <span
                style={{
                  background: 'rgba(245, 182, 66, 0.2)',
                  border: '1px solid var(--color-stark-gold)',
                  borderRadius: '3px',
                  padding: '0.15rem 0.5rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'var(--color-stark-gold)',
                }}
              >
                {selectedIds.size} SELECTED
              </span>
            )}
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              ({getRecordsToExport().length} records targeted)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Excel Export Button */}
            <button
              onClick={handleExportExcel}
              className="btn btn-secondary"
              style={{
                padding: '0.45rem 0.9rem',
                fontSize: '0.78rem',
                borderColor: '#10B981',
                color: '#34D399',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
              title="Download Microsoft Excel compatible spreadsheet"
            >
              <FileSpreadsheet size={15} />
              EXCEL (.XLSX)
            </button>

            {/* CSV Export Button */}
            <button
              onClick={handleExportCsv}
              className="btn btn-secondary"
              style={{
                padding: '0.45rem 0.9rem',
                fontSize: '0.78rem',
                borderColor: 'var(--color-arc-blue)',
                color: 'var(--color-arc-blue)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
              title="Download comma-separated values (CSV)"
            >
              <Download size={15} />
              CSV
            </button>

            {/* PDF Export Button */}
            <button
              onClick={handleExportPdf}
              className="btn btn-secondary"
              style={{
                padding: '0.45rem 0.9rem',
                fontSize: '0.78rem',
                borderColor: 'var(--color-muted-crimson)',
                color: '#ffb4b7',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
              title="Generate printable PDF report"
            >
              <FileText size={15} />
              PDF REPORT
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrintList}
              className="btn btn-secondary"
              style={{
                padding: '0.45rem 0.9rem',
                fontSize: '0.78rem',
                borderColor: 'var(--color-stark-gold)',
                color: 'var(--color-stark-gold)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
              title="Print registration report or save as PDF"
            >
              <Printer size={15} />
              PRINT REPORT
            </button>
          </div>
        </div>

        {/* Main Data Table */}
        <div
          style={{
            background: 'rgba(28, 32, 38, 0.95)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '980px' }}>
              <thead>
                <tr
                  style={{
                    background: '#111827',
                    borderBottom: '1px solid var(--border-subtle)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    color: 'var(--color-stark-gold)',
                    letterSpacing: '0.05em',
                  }}
                >
                  <th style={{ padding: '0.9rem 1rem', width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th
                    style={{ padding: '0.9rem 1rem', cursor: 'pointer' }}
                    onClick={() => handleSort('name')}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      PARTICIPANT / EMAIL
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th
                    style={{ padding: '0.9rem 1rem', cursor: 'pointer' }}
                    onClick={() => handleSort('arena')}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      COMPETITION
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th
                    style={{ padding: '0.9rem 1rem', cursor: 'pointer' }}
                    onClick={() => handleSort('team')}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      TEAM
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ padding: '0.9rem 1rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#34D399' }}>
                      <FileText size={13} />
                      PPT / PROPOSAL DECK
                    </div>
                  </th>
                  <th style={{ padding: '0.9rem 1rem' }}>COLLEGE / CONTACT</th>
                  <th
                    style={{ padding: '0.9rem 1rem', cursor: 'pointer' }}
                    onClick={() => handleSort('registration_status')}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      STATUS
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th
                    style={{ padding: '0.9rem 1rem', cursor: 'pointer' }}
                    onClick={() => handleSort('created_at')}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      SUBMITTED
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--color-soft-gray)' }}>
                      <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem auto', display: 'block', color: 'var(--color-arc-blue)' }} />
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>QUERYING ENCRYPTED REGISTRATION VAULT...</div>
                    </td>
                  </tr>
                ) : paginatedRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Trophy size={36} style={{ margin: '0 auto 0.75rem auto', display: 'block', color: 'rgba(255, 255, 255, 0.2)' }} />
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--color-warm-off-white)' }}>
                        NO REGISTRATIONS FOUND
                      </div>
                      <p style={{ fontSize: '0.85rem', margin: '0.3rem 0 1rem 0' }}>
                        No records matched your current query or filter criteria.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setArenaFilter('ALL');
                          setStatusFilter('ALL');
                          setDateFilter('ALL');
                          setPptFilter('ALL');
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem' }}
                      >
                        RESET ALL FILTERS
                      </button>
                    </td>
                  </tr>
                ) : (
                  paginatedRegistrations.map((r) => {
                    const isSelected = selectedIds.has(r.id);
                    const status = (r.registration_status || 'confirmed').toLowerCase();
                    const statusColor =
                      status === 'confirmed'
                        ? '#34D399'
                        : status === 'pending'
                        ? 'var(--color-stark-gold)'
                        : status === 'waitlist'
                        ? 'var(--color-arc-blue)'
                        : '#ffb4b7';
                    const statusBg =
                      status === 'confirmed'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : status === 'pending'
                        ? 'rgba(245, 182, 66, 0.15)'
                        : status === 'waitlist'
                        ? 'rgba(0, 191, 255, 0.15)'
                        : 'rgba(143, 48, 53, 0.2)';

                    return (
                      <tr
                        key={r.id}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          background: isSelected ? 'rgba(245, 182, 66, 0.05)' : 'transparent',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(r.id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--color-warm-off-white)' }}>
                            {r.profile?.full_name || r.user_name || 'Participant'}
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {r.profile?.email || r.user_email || 'N/A'}
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.35)', marginTop: '2px' }}>
                            ID: {r.id.slice(0, 8)}...
                          </div>
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              color: 'var(--color-arc-blue)',
                              background: 'rgba(0, 191, 255, 0.1)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              border: '1px solid rgba(0, 191, 255, 0.25)',
                            }}
                          >
                            {r.competition?.name || r.competition_name || 'EVENT'}
                          </span>
                        </td>
                        <td style={{ padding: '0.9rem 1rem', color: 'var(--color-soft-gray)', fontSize: '0.85rem' }}>
                          {r.team?.name ? (
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--color-tech-white)' }}>{r.team.name}</div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-stark-gold)' }}>
                                CODE: {r.team.code || 'N/A'}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>
                              Individual Participant
                            </span>
                          )}
                        </td>
                        {/* PPT / Presentation Deck Column */}
                        <td style={{ padding: '0.9rem 1rem' }}>
                          {r.document_url ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.68rem',
                                    padding: '0.15rem 0.45rem',
                                    borderRadius: '3px',
                                    background: (r.document_type || '').toUpperCase() === 'PDF' ? 'rgba(239, 68, 68, 0.18)' : 'rgba(255, 179, 0, 0.18)',
                                    border: `1px solid ${(r.document_type || '').toUpperCase() === 'PDF' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 179, 0, 0.4)'}`,
                                    color: (r.document_type || '').toUpperCase() === 'PDF' ? '#f87171' : 'var(--color-stark-gold)',
                                    fontWeight: 700,
                                  }}
                                >
                                  {r.document_type || 'PPT'}
                                </span>
                                <span
                                  title={r.document_name || 'Presentation Deck'}
                                  style={{
                                    fontSize: '0.82rem',
                                    color: '#fff',
                                    fontWeight: 600,
                                    maxWidth: '160px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {r.document_name || 'Presentation Deck'}
                                </span>
                              </div>

                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                <a
                                  href={r.document_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.2rem 0.45rem',
                                    background: 'rgba(0, 191, 255, 0.15)',
                                    border: '1px solid rgba(0, 191, 255, 0.4)',
                                    borderRadius: '3px',
                                    color: 'var(--color-arc-blue)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.68rem',
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                  }}
                                  title="View / Open slide deck in new tab"
                                >
                                  <ExternalLink size={11} />
                                  VIEW
                                </a>
                                <a
                                  href={r.document_url}
                                  download={r.document_name || 'presentation'}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.2rem 0.45rem',
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    borderRadius: '3px',
                                    color: '#34D399',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.68rem',
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                  }}
                                  title="Download presentation deck"
                                >
                                  <Download size={11} />
                                  GET
                                </a>
                                {r.document_size && (
                                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                                    {(r.document_size / (1024 * 1024)).toFixed(1)}MB
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span
                                style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '0.68rem',
                                  color: 'var(--text-muted)',
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: '3px',
                                  background: 'rgba(255, 255, 255, 0.04)',
                                  border: '1px solid rgba(255, 255, 255, 0.08)',
                                }}
                              >
                                NO PPT
                              </span>
                              <button
                                onClick={() => handleTableRowUpload(r.id)}
                                style={{
                                  background: 'rgba(0, 191, 255, 0.1)',
                                  border: '1px solid rgba(0, 191, 255, 0.3)',
                                  borderRadius: '3px',
                                  color: 'var(--color-arc-blue)',
                                  cursor: 'pointer',
                                  padding: '0.15rem 0.4rem',
                                  fontSize: '0.68rem',
                                  fontFamily: 'var(--font-mono)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                }}
                                title="Attach PPT deck for this registration"
                              >
                                <Upload size={11} />
                                ATTACH
                              </button>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ fontSize: '0.82rem', color: 'var(--color-warm-off-white)' }}>
                            {r.profile?.college || 'REC Banda'}
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {r.profile?.phone || 'No phone'}
                          </div>
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <span
                            style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '4px',
                              background: statusBg,
                              border: `1px solid ${statusColor}`,
                              color: statusColor,
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              display: 'inline-block',
                            }}
                          >
                            {status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '0.9rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : 'N/A'}
                        </td>
                        <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            {/* Inspect Detail */}
                            <button
                              onClick={() => setInspectModalItem(r)}
                              style={{
                                padding: '0.3rem 0.55rem',
                                background: 'rgba(30, 41, 59, 0.8)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'var(--color-tech-white)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                              title="Inspect Full Registration Details"
                            >
                              <Eye size={13} />
                            </button>

                            {/* Print Individual Ticket */}
                            <button
                              onClick={() => handlePrintSingle(r)}
                              style={{
                                padding: '0.3rem 0.55rem',
                                background: 'rgba(245, 182, 66, 0.15)',
                                border: '1px solid var(--color-stark-gold)',
                                color: 'var(--color-stark-gold)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                              title="Print Single Participant Pass"
                            >
                              <Printer size={13} />
                            </button>

                            {/* Status Change Modal */}
                            <button
                              onClick={() => handleOpenStatusModal(r)}
                              style={{
                                padding: '0.3rem 0.65rem',
                                background: 'rgba(0, 191, 255, 0.15)',
                                border: '1px solid var(--color-arc-blue)',
                                color: 'var(--color-arc-blue)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.72rem',
                              }}
                            >
                              UPDATE
                            </button>

                            {/* Simple Delete Registered Team & Registration */}
                            <button
                              onClick={() =>
                                handleAdminDeleteRegistration(
                                  r.id,
                                  r.team_id || r.team?.id,
                                  r.team?.name || r.team_name
                                )
                              }
                              style={{
                                padding: '0.3rem 0.55rem',
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                color: '#f87171',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              title={
                                r.team?.name || r.team_id
                                  ? `Delete Team "${r.team?.name || 'Registered Team'}" & Registration`
                                  : 'Delete Registration'
                              }
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

          {/* Table Footer with Pagination */}
          <div
            style={{
              padding: '0.85rem 1.25rem',
              background: '#111827',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Showing {sortedRegistrations.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, sortedRegistrations.length)} of {sortedRegistrations.length} records
              {sortedRegistrations.length !== registrations.length && ` (filtered from ${registrations.length})`}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>ROWS:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    background: '#1E293B',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    color: '#fff',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                  }}
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', opacity: currentPage <= 1 ? 0.4 : 1 }}
                >
                  <ChevronLeft size={14} />
                  PREV
                </button>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0 0.6rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    color: 'var(--color-stark-gold)',
                  }}
                >
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', opacity: currentPage >= totalPages ? 0.4 : 1 }}
                >
                  NEXT
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* INSPECT REGISTRATION MODAL                                      */}
        {/* ============================================================== */}
        {inspectModalItem && (
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
                maxWidth: '650px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
                padding: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.75rem' }}>
                <div>
                  <span className="chapter-badge" style={{ margin: 0 }}>REGISTRATION DETAILS</span>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#fff', margin: '0.2rem 0 0 0' }}>
                    {inspectModalItem.profile?.full_name || inspectModalItem.user_name || 'Participant Details'}
                  </h3>
                </div>
                <button
                  onClick={() => setInspectModalItem(null)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <X size={22} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#111827', padding: '0.9rem', borderRadius: '6px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>REGISTRATION ID</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--color-stark-gold)', wordBreak: 'break-all' }}>
                    {inspectModalItem.id}
                  </div>
                </div>

                <div style={{ background: '#111827', padding: '0.9rem', borderRadius: '6px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>COMPETITION</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--color-arc-blue)' }}>
                    {inspectModalItem.competition?.name || inspectModalItem.competition_name || 'N/A'}
                  </div>
                </div>

                <div style={{ background: '#111827', padding: '0.9rem', borderRadius: '6px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>EMAIL ADDRESS</div>
                  <div style={{ fontSize: '0.88rem', color: '#fff' }}>
                    {inspectModalItem.profile?.email || inspectModalItem.user_email || 'N/A'}
                  </div>
                </div>

                <div style={{ background: '#111827', padding: '0.9rem', borderRadius: '6px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>CONTACT PHONE</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: '#fff' }}>
                    {inspectModalItem.profile?.phone || 'Not Provided'}
                  </div>
                </div>

                <div style={{ background: '#111827', padding: '0.9rem', borderRadius: '6px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>COLLEGE / INSTITUTION</div>
                  <div style={{ fontSize: '0.88rem', color: '#fff' }}>
                    {inspectModalItem.profile?.college || 'Rajkiya Engineering College Banda'}
                  </div>
                </div>

                <div style={{ background: '#111827', padding: '0.9rem', borderRadius: '6px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>TEAM</div>
                  <div style={{ fontSize: '0.88rem', color: '#fff' }}>
                    {inspectModalItem.team?.name ? `${inspectModalItem.team.name} (${inspectModalItem.team.code})` : 'Individual Participant'}
                  </div>
                </div>

                <div style={{ background: '#111827', padding: '0.9rem', borderRadius: '6px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>STATUS</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-stark-gold)', fontWeight: 700 }}>
                    {(inspectModalItem.registration_status || 'confirmed').toUpperCase()}
                  </div>
                </div>

                <div style={{ background: '#111827', padding: '0.9rem', borderRadius: '6px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>TIMESTAMP</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94A3B8' }}>
                    {inspectModalItem.created_at ? new Date(inspectModalItem.created_at).toLocaleString('en-IN') : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Hidden file input for document replace / upload */}
              <input
                type="file"
                ref={adminDocInputRef}
                accept=".pptx,.ppt,.pdf"
                style={{ display: 'none' }}
                onChange={(e) => inspectModalItem && handleAdminReplaceDocument(e, inspectModalItem.id)}
              />

              {/* Team Members Roster */}
              {inspectModalItem.team?.members && inspectModalItem.team.members.length > 0 && (
                <div style={{ background: '#111827', borderRadius: '6px', padding: '1rem', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', fontWeight: 700 }}>
                      TEAM MEMBER ROSTER ({inspectModalItem.team.members.length} MEMBERS)
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      TEAM CODE: {inspectModalItem.team.code}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {inspectModalItem.team.members.map((m) => (
                      <div
                        key={m.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${m.role === 'leader' ? 'rgba(255, 179, 0, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
                          borderRadius: '4px',
                          padding: '0.5rem 0.75rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.4rem',
                          fontSize: '0.82rem',
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 600, color: '#fff', marginRight: '0.5rem' }}>
                            {m.name || 'Member'}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-arc-blue)' }}>
                            {m.email}
                          </span>
                          {m.phone && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                              📞 {m.phone}
                            </span>
                          )}
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {m.college || 'REC Banda'} {m.branch ? `• ${m.branch}` : ''} {m.year ? `(${m.year})` : ''}
                          </div>
                        </div>

                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.68rem',
                            padding: '0.15rem 0.4rem',
                            borderRadius: '3px',
                            background: m.role === 'leader' ? 'rgba(255, 179, 0, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                            color: m.role === 'leader' ? 'var(--color-stark-gold)' : 'var(--text-muted)',
                            fontWeight: 700,
                          }}
                        >
                          {m.role?.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Management Section */}
              <div style={{ background: '#111827', borderRadius: '6px', padding: '1.1rem', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-arc-blue)', fontWeight: 700, marginBottom: '0.6rem' }}>
                  ATTACHED PRESENTATION / PROPOSAL DECK
                </div>

                {inspectModalItem.document_url ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', background: 'rgba(0, 217, 255, 0.05)', padding: '0.75rem', borderRadius: '4px', border: '1px solid rgba(0, 217, 255, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <FileText size={22} color="var(--color-arc-blue)" />
                      <div>
                        <div style={{ fontSize: '0.88rem', color: '#fff', fontWeight: 600 }}>
                          {inspectModalItem.document_name || 'Presentation Deck'} {inspectModalItem.document_type ? `[${inspectModalItem.document_type}]` : ''}
                        </div>
                        {inspectModalItem.document_size && (
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            SIZE: {(inspectModalItem.document_size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <a
                        href={inspectModalItem.document_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                      >
                        <ExternalLink size={13} />
                        OPEN
                      </a>
                      <a
                        href={inspectModalItem.document_url}
                        download={inspectModalItem.document_name || 'presentation'}
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                      >
                        <Download size={13} />
                        DOWNLOAD
                      </a>
                      <button
                        type="button"
                        disabled={docActionLoading}
                        onClick={() => adminDocInputRef.current?.click()}
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                      >
                        <Upload size={13} />
                        REPLACE
                      </button>
                      <button
                        type="button"
                        disabled={docActionLoading}
                        onClick={() => handleAdminDeleteDocument(inspectModalItem.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          borderRadius: '4px',
                          color: '#f87171',
                          padding: '0.35rem 0.6rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        <Trash2 size={13} />
                        DELETE
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No presentation deck attached to this registration.
                    </span>
                    <button
                      type="button"
                      disabled={docActionLoading}
                      onClick={() => adminDocInputRef.current?.click()}
                      className="btn btn-secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                    >
                      <Upload size={13} />
                      ATTACH FILE
                    </button>
                  </div>
                )}
              </div>

              {inspectModalItem.notes && (
                <div style={{ background: '#111827', padding: '1rem', borderRadius: '6px', marginBottom: '1.25rem' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    OPERATIONAL NOTES:
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.5 }}>
                    {inspectModalItem.notes}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() =>
                    handleAdminDeleteRegistration(
                      inspectModalItem.id,
                      inspectModalItem.team_id || inspectModalItem.team?.id,
                      inspectModalItem.team?.name || inspectModalItem.team_name
                    )
                  }
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    borderRadius: '4px',
                    padding: '0.45rem 0.8rem',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                  title="Permanently delete this registration and registered team"
                >
                  <Trash2 size={14} />
                  {inspectModalItem.team?.name || inspectModalItem.team_id
                    ? 'DELETE TEAM & REGISTRATION'
                    : 'DELETE REGISTRATION'}
                </button>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => handlePrintSingle(inspectModalItem)}
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                  >
                    <Printer size={14} />
                    PRINT PASS
                  </button>
                  <button
                    onClick={() => {
                      const item = inspectModalItem;
                      setInspectModalItem(null);
                      handleOpenStatusModal(item);
                    }}
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem' }}
                  >
                    EDIT STATUS
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* UPDATE STATUS MODAL                                             */}
        {/* ============================================================== */}
        {statusModalItem && (
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
                border: '1px solid var(--border-accent-crimson)',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '500px',
                padding: '1.75rem',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#fff', margin: '0 0 1rem 0' }}>
                UPDATE REGISTRATION STATUS
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Updating status for <strong>{statusModalItem.profile?.full_name || 'Participant'}</strong> (#{statusModalItem.id.slice(0, 8)}).
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.4rem' }}>
                  TARGET STATUS:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    background: '#111827',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="confirmed">CONFIRMED (REGISTRATION APPROVED)</option>
                  <option value="pending">PENDING (AWAITING VERIFICATION)</option>
                  <option value="waitlist">WAITLIST (SECONDARY POOL)</option>
                  <option value="rejected">REJECTED (DISQUALIFIED / DENIED)</option>
                  <option value="cancelled">CANCELLED (USER WITHDREW)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.4rem' }}>
                  ADMIN AUDIT NOTE (OPTIONAL):
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Reason for change, verification notes..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    background: '#111827',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => setStatusModalItem(null)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem' }}
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={handleSaveStatus}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {isUpdatingStatus ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  UPDATE STATUS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
