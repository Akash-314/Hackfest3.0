import React, { useState, useEffect } from 'react';
import AdminNav from '../../components/admin/AdminNav';
import { adminService } from '../../services/adminService';
import { eventService } from '../../services/eventService';
import ProblemDetailModal from '../../components/ProblemDetailModal';
import {
  Globe,
  Calendar,
  Clock,
  MapPin,
  Bell,
  HelpCircle,
  Trophy,
  Save,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  X,
  Layers,
  Target,
  FileText,
  Eye,
  Search,
  Filter,
  Check,
  ShieldAlert,
  Flame,
  Handshake,
  Upload,
  ExternalLink,
  Image as ImageIcon,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  to24HourInput,
  from24HourInput,
  isEndTimeAfterStartTime,
  formatTimeRange,
  formatDateIST,
} from '../../utils/dateTimeUtils';

export default function AdminCmsPage() {
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'problem_categories' | 'problem_statements' | 'schedules' | 'sponsors' | 'announcements' | 'faqs' | 'competitions'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState({ text: '', type: 'success' });

  // 1. Event Settings State (Registration & Submission Controls)
  const [eventSettings, setEventSettings] = useState({
    liveModeStatus: 'REGISTRATION OPEN',
    registrationOpen: true,
    registrationStartDate: 'OCTOBER 10, 2026',
    registrationDeadline: 'October 20, 2026',
    pptSubmissionsOpen: true,
    submissionDeadline: 'OCTOBER 25, 2026, 12:00 PM',
    submissionInstructions: 'Submit your slide presentation (PDF or PPTX format, under 25MB) and provide your GitHub repository link.',
    acceptedFileTypes: '.pdf,.pptx,.ppt',
    maxFileSizeMb: 25,
    leaderboardPublished: false,
    eventDate: 'OCTOBER 24-25, 2026',
    venue: 'Campus Multipurpose Hall, REC Banda',
    contactEmail: 'sdc@recbanda.ac.in',
  });

  // 2. Problem Categories State
  const [categories, setCategories] = useState([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    number: '01',
    title: '',
    slug: '',
    theme: '',
    placeholder_notice: 'OFFICIAL PROBLEM STATEMENT TO BE UNVEILED AT BRIEFING',
    background: '',
    challenge: '',
    requirements: '',
    expected_outcome: '',
    technical_directions: '',
    submission_info: '',
    sort_order: 1,
    is_published: true,
  });

  // 3. Problem Statements State
  const [statements, setStatements] = useState([]);
  const [statementModalOpen, setStatementModalOpen] = useState(false);
  const [editingStatement, setEditingStatement] = useState(null);
  const [statementForm, setStatementForm] = useState({
    category_id: '',
    title: '',
    slug: '',
    track_label: '',
    description: '',
    requirements: '',
    constraints: '',
    examples: '',
    input_output_specs: '',
    reference_file_url: '',
    sort_order: 1,
    status: 'published',
    is_published: true,
  });

  // Problem Statements Search & Filtering
  const [statementSearch, setStatementSearch] = useState('');
  const [statementCategoryFilter, setStatementCategoryFilter] = useState('all');
  const [statementStatusFilter, setStatementStatusFilter] = useState('all');

  // Preview & Safe Deletion Modal States
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewProblem, setPreviewProblem] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // 4. Schedules State
  const [schedules, setSchedules] = useState([]);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    day_number: 1,
    day_label: 'DAY 01',
    title: '',
    description: '',
    event_date: '2026-10-24',
    start_time: '09:00 AM',
    end_time: '10:00 AM',
    location: 'Auditorium, REC Banda',
    speaker: '',
    category: 'Opening Ceremony',
    badge: 'STAGE',
    is_highlight: false,
    sort_order: 1,
    is_published: true,
  });

  // 5. Sponsors State
  const [sponsors, setSponsors] = useState([]);
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [sponsorForm, setSponsorForm] = useState({
    name: '',
    tier: 'gold',
    logo_url: '',
    website_url: '',
    description: '',
    sort_order: 1,
    is_published: true,
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [sponsorPreviewOpen, setSponsorPreviewOpen] = useState(false);
  const [previewSponsor, setPreviewSponsor] = useState(null);
  const [sponsorTierFilter, setSponsorTierFilter] = useState('all');
  const [sponsorSearch, setSponsorSearch] = useState('');

  // 6. Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    priority: 'normal',
    published: true,
  });

  // 7. FAQs State
  const [faqs, setFaqs] = useState([]);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({
    category: 'general',
    question: '',
    answer: '',
  });

  // 8. Competitions State
  const [competitions, setCompetitions] = useState([]);
  const [compModalOpen, setCompModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState(null);
  const [compForm, setCompForm] = useState({
    name: '',
    description: '',
    max_team_size: 4,
    min_team_size: 1,
  });

  const notify = (text, type = 'success') => {
    setBanner({ text, type });
    setTimeout(() => setBanner({ text: '', type: 'success' }), 4000);
  };

  const loadAllCmsData = async () => {
    setLoading(true);
    try {
      const [settingsData, schedData, annData, faqData, compData, catData, stmtData, sponsData] = await Promise.all([
        eventService.getSettings(),
        adminService.getSchedulesAdmin(),
        adminService.getAnnouncementsAdmin(),
        adminService.getFaqsAdmin(),
        eventService.getCompetitions(),
        adminService.getProblemCategoriesAdmin(),
        adminService.getProblemStatementsAdmin(),
        adminService.getSponsorsAdmin(),
      ]);

      if (settingsData) {
        setEventSettings({
          liveModeStatus: settingsData.liveModeStatus || 'REGISTRATION OPEN',
          registrationOpen: settingsData.registrationOpen !== false,
          registrationStartDate: settingsData.registrationStartDate || 'OCTOBER 10, 2026',
          registrationDeadline: settingsData.registrationDeadline || 'October 20, 2026',
          pptSubmissionsOpen: settingsData.pptSubmissionsOpen !== false,
          submissionDeadline: settingsData.submissionDeadline || 'OCTOBER 25, 2026, 12:00 PM',
          submissionInstructions: settingsData.submissionInstructions || 'Submit your slide presentation (PDF or PPTX format, under 25MB) and provide your GitHub repository link.',
          acceptedFileTypes: settingsData.acceptedFileTypes || '.pdf,.pptx,.ppt',
          maxFileSizeMb: settingsData.maxFileSizeMb || 25,
          leaderboardPublished: Boolean(settingsData.leaderboardPublished),
          eventDate: settingsData.eventDate || 'OCTOBER 24-25, 2026',
          venue: settingsData.venue || 'Campus Multipurpose Hall, REC Banda',
          contactEmail: settingsData.contactEmail || 'sdc@recbanda.ac.in',
        });
      }

      setSchedules(schedData || []);
      setAnnouncements(annData || []);
      setFaqs(faqData || []);
      setCompetitions(compData || []);
      setCategories(catData || []);
      setStatements(stmtData || []);
      setSponsors(sponsData || []);
    } catch (err) {
      console.error('Failed to load CMS data:', err);
      notify('Failed to load some CMS records: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllCmsData();
  }, []);

  // --------------------------------------------------------------------------
  // Save Event Settings (Canonical Registration & Submission Control)
  // --------------------------------------------------------------------------
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateEventSettings({
        live_mode_status: eventSettings.liveModeStatus,
        registration_open: eventSettings.registrationOpen,
        registration_status: eventSettings.registrationOpen ? 'OPEN' : 'CLOSED',
        registration_start_date: eventSettings.registrationStartDate,
        registration_deadline: eventSettings.registrationDeadline,
        ppt_submissions_open: eventSettings.pptSubmissionsOpen,
        submission_deadline: eventSettings.submissionDeadline,
        submission_instructions: eventSettings.submissionInstructions,
        accepted_file_types: eventSettings.acceptedFileTypes,
        max_file_size_mb: eventSettings.maxFileSizeMb,
        leaderboard_published: eventSettings.leaderboardPublished,
        event_date: eventSettings.eventDate,
        venue: eventSettings.venue,
        contact_email: eventSettings.contactEmail,
      });
      notify('Event parameters, registration state & PPT submission controls updated successfully!');
      // Re-fetch to reconcile with persistent database record
      const refreshed = await eventService.getSettings();
      if (refreshed) {
        setEventSettings({
          liveModeStatus: refreshed.liveModeStatus || 'REGISTRATION OPEN',
          registrationOpen: refreshed.registrationOpen !== false,
          registrationStartDate: refreshed.registrationStartDate || 'OCTOBER 10, 2026',
          registrationDeadline: refreshed.registrationDeadline || 'October 20, 2026',
          pptSubmissionsOpen: refreshed.pptSubmissionsOpen !== false,
          submissionDeadline: refreshed.submissionDeadline || 'OCTOBER 25, 2026, 12:00 PM',
          submissionInstructions: refreshed.submissionInstructions || 'Submit your slide presentation (PDF or PPTX format, under 25MB) and provide your GitHub repository link.',
          acceptedFileTypes: refreshed.acceptedFileTypes || '.pdf,.pptx,.ppt',
          maxFileSizeMb: refreshed.maxFileSizeMb || 25,
          leaderboardPublished: Boolean(refreshed.leaderboardPublished),
          eventDate: refreshed.eventDate || 'OCTOBER 24-25, 2026',
          venue: refreshed.venue || 'Campus Multipurpose Hall, REC Banda',
          contactEmail: refreshed.contactEmail || 'sdc@recbanda.ac.in',
        });
      }
    } catch (err) {
      notify('Failed to save settings: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------------------------------
  // Problem Categories Handlers (PART 2)
  // --------------------------------------------------------------------------
  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({
        number: cat.number || '',
        title: cat.title || '',
        slug: cat.slug || '',
        theme: cat.theme || '',
        placeholder_notice: cat.placeholder_notice || 'OFFICIAL PROBLEM STATEMENT TO BE UNVEILED AT BRIEFING',
        background: cat.background || '',
        challenge: cat.challenge || cat.description || '',
        requirements: Array.isArray(cat.requirements) ? cat.requirements.join('\n') : '',
        expected_outcome: cat.expected_outcome || '',
        technical_directions: cat.technical_directions || '',
        submission_info: cat.submission_info || '',
        sort_order: cat.sort_order ?? 1,
        is_published: cat.is_published ?? cat.is_active ?? true,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        number: String(categories.length + 1).padStart(2, '0'),
        title: '',
        slug: '',
        theme: '',
        placeholder_notice: 'OFFICIAL PROBLEM STATEMENT TO BE UNVEILED AT BRIEFING',
        background: '',
        challenge: '',
        requirements: '',
        expected_outcome: '',
        technical_directions: '',
        submission_info: '',
        sort_order: categories.length + 1,
        is_published: true,
      });
    }
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.title.trim()) {
      notify('Track title is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const reqList = categoryForm.requirements
        ? categoryForm.requirements.split('\n').map((r) => r.trim()).filter(Boolean)
        : [];

      await adminService.saveProblemCategory({
        ...categoryForm,
        id: editingCategory?.id,
        requirements: reqList,
      });
      notify(editingCategory ? 'Updated problem category successfully!' : 'Created new problem category track!');
      setCategoryModalOpen(false);
      const updated = await adminService.getProblemCategoriesAdmin();
      setCategories(updated || []);
    } catch (err) {
      notify('Failed to save category: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCategoryPublish = async (cat) => {
    const current = cat.is_published ?? cat.is_active ?? true;
    const nextState = !current;
    try {
      await adminService.toggleProblemCategoryPublish(cat.id, nextState);
      notify(`Track "${cat.title}" is now ${nextState ? 'PUBLISHED' : 'UNPUBLISHED'}`);
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, is_active: nextState, is_published: nextState } : c))
      );
    } catch (err) {
      notify('Failed to update publication status: ' + err.message, 'error');
    }
  };

  const handlePromptDeleteCategory = async (cat) => {
    try {
      const depCheck = await adminService.checkProblemCategoryDependencies(cat.id);
      setDeleteTarget({
        type: 'category',
        item: cat,
        canDelete: depCheck.canDelete,
        message: depCheck.message,
      });
      setDeleteConfirmOpen(true);
    } catch (err) {
      notify('Failed to inspect dependencies: ' + err.message, 'error');
    }
  };

  // --------------------------------------------------------------------------
  // Problem Statements Handlers (PART 3)
  // --------------------------------------------------------------------------
  const handleOpenStatementModal = (stmt = null) => {
    if (stmt) {
      setEditingStatement(stmt);
      setStatementForm({
        category_id: stmt.category_id || (categories[0]?.id || ''),
        title: stmt.title || '',
        slug: stmt.slug || '',
        track_label: stmt.track_label || '',
        description: stmt.description || '',
        requirements: Array.isArray(stmt.requirements) ? stmt.requirements.join('\n') : '',
        constraints: stmt.constraints || '',
        examples: stmt.examples || '',
        input_output_specs: stmt.input_output_specs || '',
        reference_file_url: stmt.reference_file_url || '',
        sort_order: stmt.sort_order ?? 1,
        status: stmt.status || 'published',
        is_published: stmt.is_published !== false,
      });
    } else {
      setEditingStatement(null);
      setStatementForm({
        category_id: categories[0]?.id || '',
        title: '',
        slug: '',
        track_label: '',
        description: '',
        requirements: '',
        constraints: '',
        examples: '',
        input_output_specs: '',
        reference_file_url: '',
        sort_order: statements.length + 1,
        status: 'published',
        is_published: true,
      });
    }
    setStatementModalOpen(true);
  };

  const handleSaveStatement = async (e, asDraft = false) => {
    e.preventDefault();
    if (!statementForm.title.trim()) {
      notify('Problem statement title is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const reqList = statementForm.requirements
        ? statementForm.requirements.split('\n').map((r) => r.trim()).filter(Boolean)
        : [];

      await adminService.saveProblemStatement({
        ...statementForm,
        id: editingStatement?.id,
        requirements: reqList,
        status: asDraft ? 'draft' : 'published',
        is_published: !asDraft,
      });

      notify(asDraft ? 'Draft statement saved securely!' : 'Problem statement published to public website!');
      setStatementModalOpen(false);
      const updated = await adminService.getProblemStatementsAdmin();
      setStatements(updated || []);
    } catch (err) {
      notify('Failed to save problem statement: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatementPublish = async (stmt) => {
    const nextState = !stmt.is_published;
    try {
      await adminService.toggleProblemStatementPublish(stmt.id, nextState);
      notify(`Statement "${stmt.title}" is now ${nextState ? 'PUBLISHED' : 'SAVED AS DRAFT'}`);
      setStatements((prev) =>
        prev.map((s) => (s.id === stmt.id ? { ...s, is_published: nextState, status: nextState ? 'published' : 'draft' } : s))
      );
    } catch (err) {
      notify('Failed to update publish state: ' + err.message, 'error');
    }
  };

  const handlePromptDeleteStatement = async (stmt) => {
    try {
      const depCheck = await adminService.checkProblemStatementDependencies(stmt.id);
      setDeleteTarget({
        type: 'statement',
        item: stmt,
        canDelete: depCheck.canDelete,
        message: depCheck.message,
      });
      setDeleteConfirmOpen(true);
    } catch (err) {
      notify('Failed to check dependencies: ' + err.message, 'error');
    }
  };

  const handleExecuteDelete = async () => {
    if (!deleteTarget?.item) return;
    setSaving(true);
    try {
      if (deleteTarget.type === 'category') {
        await adminService.deleteProblemCategory(deleteTarget.item.id);
        notify(`Deleted track category "${deleteTarget.item.title}"`);
        setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.item.id));
      } else if (deleteTarget.type === 'statement') {
        await adminService.deleteProblemStatement(deleteTarget.item.id);
        notify(`Deleted problem statement "${deleteTarget.item.title}"`);
        setStatements((prev) => prev.filter((s) => s.id !== deleteTarget.item.id));
      } else if (deleteTarget.type === 'schedule') {
        await adminService.deleteScheduleItem(deleteTarget.item.id);
        notify(`Deleted schedule session "${deleteTarget.item.title}"`);
        setSchedules((prev) => prev.filter((s) => s.id !== deleteTarget.item.id));
      } else if (deleteTarget.type === 'sponsor') {
        await adminService.deleteSponsorItem(deleteTarget.item.id);
        notify(`Deleted sponsor "${deleteTarget.item.name}"`);
        setSponsors((prev) => prev.filter((s) => s.id !== deleteTarget.item.id));
      }
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      notify('Delete failed: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewItem = (type, item) => {
    if (type === 'category') {
      setPreviewProblem({
        number: item.number || '01',
        title: item.title,
        theme: item.theme,
        placeholderNotice: item.placeholder_notice || 'OFFICIAL PROBLEM STATEMENT TO BE UNVEILED AT BRIEFING',
        background: item.background || item.description,
        challenge: item.challenge || item.description,
        requirements: Array.isArray(item.requirements) ? item.requirements : [],
        expectedOutcome: item.expected_outcome,
        suggestedDirection: item.technical_directions,
        submissionInfo: item.submission_info,
      });
    } else if (type === 'statement') {
      const parentCat = categories.find((c) => c.id === item.category_id) || item.category || {};
      setPreviewProblem({
        number: parentCat.number || '01',
        title: item.title,
        theme: parentCat.theme || item.track_label || 'CHALLENGE TRACK',
        placeholderNotice: 'OFFICIAL PROBLEM STATEMENT SPECIFICATION (PREVIEW)',
        background: item.description,
        challenge: item.description,
        requirements: Array.isArray(item.requirements) ? item.requirements : [],
        constraints: item.constraints,
        examples: item.examples,
        inputOutputSpecs: item.input_output_specs,
        referenceFileUrl: item.reference_file_url,
        expectedOutcome: 'Working operational prototype solving core challenge constraints.',
        suggestedDirection: 'Production-ready architecture, clear separation of concerns, live validation.',
        submissionInfo: 'Transmitted via HackFest 3.0 submission portal.',
      });
    }
    setPreviewModalOpen(true);
  };

  // --------------------------------------------------------------------------
  // Schedule Management (Multi-Day, IST Time Validation, Order & Publish)
  // --------------------------------------------------------------------------
  const handleOpenScheduleModal = (item = null) => {
    if (item) {
      setEditingSchedule(item);
      setScheduleForm({
        day_number: Number(item.day_number) || 1,
        day_label: item.day_label || `DAY ${String(item.day_number || 1).padStart(2, '0')}`,
        title: item.title || '',
        description: item.description || '',
        event_date: item.event_date || '2026-10-24',
        start_time: item.start_time || '09:00 AM',
        end_time: item.end_time || '10:00 AM',
        location: item.location || 'Auditorium, REC Banda',
        speaker: item.speaker || '',
        category: item.category || 'Opening Ceremony',
        badge: item.badge || 'STAGE',
        is_highlight: Boolean(item.is_highlight),
        sort_order: Number(item.sort_order) || 1,
        is_published: item.is_published !== false,
      });
    } else {
      setEditingSchedule(null);
      setScheduleForm({
        day_number: 1,
        day_label: 'DAY 01',
        title: '',
        description: '',
        event_date: '2026-10-24',
        start_time: '09:00 AM',
        end_time: '10:00 AM',
        location: 'Auditorium, REC Banda',
        speaker: '',
        category: 'Opening Ceremony',
        badge: 'STAGE',
        is_highlight: false,
        sort_order: (schedules.length || 0) + 1,
        is_published: true,
      });
    }
    setScheduleModalOpen(true);
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleForm.title.trim()) {
      notify('Schedule session title is required', 'error');
      return;
    }

    // Validate that end time is after start time
    if (!isEndTimeAfterStartTime(scheduleForm.start_time, scheduleForm.end_time)) {
      notify('Session end time must be after the start time for the same day', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...scheduleForm,
        id: editingSchedule?.id,
      };
      await adminService.saveScheduleItem(payload);
      notify(editingSchedule ? 'Schedule session updated' : 'New session committed to schedule');
      setScheduleModalOpen(false);
      const updated = await adminService.getSchedulesAdmin();
      setSchedules(updated || []);
    } catch (err) {
      notify('Failed to save schedule: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePromptDeleteSchedule = (item) => {
    setDeleteTarget({
      type: 'schedule',
      item,
      canDelete: true,
      message: `Are you sure you want to permanently delete session "${item.title}" from Day ${item.day_number}?`,
    });
    setDeleteConfirmOpen(true);
  };

  const handleToggleSchedulePublish = async (item) => {
    const nextState = !item.is_published;
    try {
      await adminService.saveScheduleItem({ ...item, is_published: nextState });
      notify(`Session "${item.title}" is now ${nextState ? 'PUBLISHED' : 'SAVED AS DRAFT'}`);
      setSchedules((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, is_published: nextState } : s))
      );
    } catch (err) {
      notify('Failed to update session status: ' + err.message, 'error');
    }
  };

  const handleReorderSchedule = async (item, direction) => {
    const dayItems = schedules
      .filter((s) => Number(s.day_number) === Number(item.day_number))
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const currentIndex = dayItems.findIndex((s) => s.id === item.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= dayItems.length) return;

    const reordered = [...dayItems];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    // Apply sort_order
    const updated = reordered.map((s, idx) => ({ ...s, sort_order: idx + 1 }));

    // Optimistic UI update
    setSchedules((prev) =>
      prev.map((s) => {
        const found = updated.find((u) => u.id === s.id);
        return found ? found : s;
      })
    );

    await adminService.reorderSchedules(updated);
    notify('Schedule sequence updated');
  };

  // --------------------------------------------------------------------------
  // Sponsors Management (Tiers, Logo Upload, Preview, Order & Publish)
  // --------------------------------------------------------------------------
  const handleOpenSponsorModal = (item = null) => {
    if (item) {
      setEditingSponsor(item);
      setSponsorForm({
        name: item.name || '',
        tier: item.tier || item.category || 'gold',
        logo_url: item.logo_url || '',
        website_url: item.website_url || '',
        description: item.description || '',
        sort_order: Number(item.sort_order) || 1,
        is_published: item.is_published !== false,
      });
    } else {
      setEditingSponsor(null);
      setSponsorForm({
        name: '',
        tier: 'gold',
        logo_url: '',
        website_url: '',
        description: '',
        sort_order: (sponsors.length || 0) + 1,
        is_published: true,
      });
    }
    setSponsorModalOpen(true);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify('Please select an image file (PNG, JPG, SVG, WebP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notify('Image file must be under 5MB', 'error');
      return;
    }

    setUploadingLogo(true);
    try {
      const publicUrl = await adminService.uploadSponsorLogo(file);
      setSponsorForm((prev) => ({ ...prev, logo_url: publicUrl }));
      notify('Sponsor logo uploaded to storage successfully');
    } catch (err) {
      notify('Failed to upload logo: ' + err.message, 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveSponsor = async (e) => {
    e.preventDefault();
    if (!sponsorForm.name.trim()) {
      notify('Sponsor organization name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...sponsorForm,
        id: editingSponsor?.id,
      };
      await adminService.saveSponsorItem(payload);
      notify(editingSponsor ? 'Sponsor record updated' : 'New sponsor partner registered');
      setSponsorModalOpen(false);
      const updated = await adminService.getSponsorsAdmin();
      setSponsors(updated || []);
    } catch (err) {
      notify('Failed to save sponsor: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePromptDeleteSponsor = (item) => {
    setDeleteTarget({
      type: 'sponsor',
      item,
      canDelete: true,
      message: `Are you sure you want to permanently delete sponsor "${item.name}" from tier ${item.tier ? item.tier.toUpperCase() : 'PARTNER'}?`,
    });
    setDeleteConfirmOpen(true);
  };

  const handleToggleSponsorPublish = async (item) => {
    const nextState = !item.is_published;
    try {
      await adminService.saveSponsorItem({ ...item, is_published: nextState });
      notify(`Sponsor "${item.name}" is now ${nextState ? 'PUBLISHED' : 'SAVED AS DRAFT'}`);
      setSponsors((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, is_published: nextState } : s))
      );
    } catch (err) {
      notify('Failed to update sponsor publish state: ' + err.message, 'error');
    }
  };

  const handleReorderSponsor = async (item, direction) => {
    const tierItems = sponsors
      .filter((s) => (s.tier || 'gold').toLowerCase() === (item.tier || 'gold').toLowerCase())
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const currentIndex = tierItems.findIndex((s) => s.id === item.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= tierItems.length) return;

    const reordered = [...tierItems];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const updated = reordered.map((s, idx) => ({ ...s, sort_order: idx + 1 }));

    setSponsors((prev) =>
      prev.map((s) => {
        const found = updated.find((u) => u.id === s.id);
        return found ? found : s;
      })
    );

    await adminService.reorderSponsors(updated);
    notify('Sponsor tier display sequence updated');
  };

  const handlePreviewSponsor = (item) => {
    setPreviewSponsor(item);
    setSponsorPreviewOpen(true);
  };

  // --------------------------------------------------------------------------
  // Announcements Management
  // --------------------------------------------------------------------------
  const handleOpenAnnouncementModal = (item = null) => {
    if (item) {
      setEditingAnnouncement(item);
      setAnnouncementForm({
        title: item.title || '',
        message: item.message || '',
        priority: item.priority || 'normal',
        published: item.published !== false,
      });
    } else {
      setEditingAnnouncement(null);
      setAnnouncementForm({
        title: '',
        message: '',
        priority: 'normal',
        published: true,
      });
    }
    setAnnouncementModalOpen(true);
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.message.trim()) {
      notify('Announcement title and message are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...announcementForm,
        id: editingAnnouncement?.id,
      };
      await adminService.saveAnnouncement(payload);
      notify(editingAnnouncement ? 'Announcement updated' : 'Announcement broadcasted');
      setAnnouncementModalOpen(false);
      const updated = await adminService.getAnnouncementsAdmin();
      setAnnouncements(updated || []);
    } catch (err) {
      notify('Failed to save announcement: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAnnouncement = async (id, title) => {
    if (!window.confirm(`Delete announcement "${title}"?`)) return;
    try {
      await adminService.deleteAnnouncement(id);
      notify(`Announcement "${title}" removed.`);
      setAnnouncements(announcements.filter((a) => a.id !== id));
    } catch (err) {
      notify('Failed to delete announcement: ' + err.message, 'error');
    }
  };

  // --------------------------------------------------------------------------
  // FAQs Management
  // --------------------------------------------------------------------------
  const handleOpenFaqModal = (item = null) => {
    if (item) {
      setEditingFaq(item);
      setFaqForm({
        category: item.category || 'general',
        question: item.question || '',
        answer: item.answer || '',
      });
    } else {
      setEditingFaq(null);
      setFaqForm({
        category: 'general',
        question: '',
        answer: '',
      });
    }
    setFaqModalOpen(true);
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      notify('Question and answer are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...faqForm,
        id: editingFaq?.id,
      };
      await adminService.saveFaq(payload);
      notify(editingFaq ? 'FAQ entry updated' : 'New FAQ added');
      setFaqModalOpen(false);
      const updated = await adminService.getFaqsAdmin();
      setFaqs(updated || []);
    } catch (err) {
      notify('Failed to save FAQ: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Delete this FAQ entry?')) return;
    try {
      await adminService.deleteFaq(id);
      notify('FAQ entry removed.');
      setFaqs(faqs.filter((f) => f.id !== id));
    } catch (err) {
      notify('Failed to delete FAQ: ' + err.message, 'error');
    }
  };

  // --------------------------------------------------------------------------
  // Competitions Editor
  // --------------------------------------------------------------------------
  const handleOpenCompModal = (comp) => {
    setEditingComp(comp);
    setCompForm({
      name: comp.name || '',
      description: comp.description || '',
      max_team_size: comp.max_team_size || 4,
      min_team_size: comp.min_team_size || 1,
    });
    setCompModalOpen(true);
  };

  const handleSaveComp = async (e) => {
    e.preventDefault();
    if (!editingComp) return;
    setSaving(true);
    try {
      await adminService.updateCompetition(editingComp.dbId || editingComp.id, compForm);
      notify(`Updated competition details for "${compForm.name}"`);
      setCompModalOpen(false);
      const updated = await eventService.getCompetitions();
      setCompetitions(updated || []);
    } catch (err) {
      notify('Failed to update competition: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '1280px' }}>
        <AdminNav />

        {/* Banner notification */}
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

        {/* Section Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <span className="chapter-badge" style={{ margin: 0 }}>CONTENT MANAGEMENT SYSTEM</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-arc-blue)' }}>
              LIVE WEBSITE SYNC
            </span>
          </div>
          <h1 className="heading-display" style={{ fontSize: '2rem', margin: 0 }}>
            EVENT & WEBSITE CONTENT
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: '0.3rem 0 0 0' }}>
            Directly modify event timelines, instructions, announcements, FAQs, and competition settings without code redeployments.
          </p>
        </div>

        {/* Sub-tabs Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '2rem',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: '0.5rem',
          }}
        >
          {[
            { id: 'settings', label: 'EVENT & SUBMISSION SETTINGS', icon: Calendar },
            { id: 'problem_categories', label: `PROBLEM CATEGORIES (${categories.length})`, icon: Target },
            { id: 'problem_statements', label: `PROBLEM STATEMENTS (${statements.length})`, icon: Layers },
            { id: 'schedules', label: `EVENT SCHEDULE (${schedules.length})`, icon: Clock },
            { id: 'sponsors', label: `SPONSORS & ALLIES (${sponsors.length})`, icon: Handshake },
            { id: 'announcements', label: `ANNOUNCEMENTS (${announcements.length})`, icon: Bell },
            { id: 'faqs', label: `FAQS (${faqs.length})`, icon: HelpCircle },
            { id: 'competitions', label: `COMPETITIONS & TRACKS (${competitions.length})`, icon: Trophy },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  flexShrink: 0,
                  gap: '0.45rem',
                  padding: '0.65rem 1.15rem',
                  borderRadius: '4px',
                  border: active ? '1px solid var(--color-arc-blue)' : '1px solid transparent',
                  background: active ? 'rgba(0, 191, 255, 0.15)' : 'transparent',
                  color: active ? 'var(--color-arc-blue)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* TAB 1: EVENT SETTINGS & PARAMETERS (PARTS 4 & 5)                */}
        {/* ============================================================== */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} style={{ maxWidth: '960px' }}>
            <div
              style={{
                background: 'rgba(28, 32, 38, 0.95)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2.5rem',
              }}
            >
              {/* SECTION A: EVENT REGISTRATION CONTROL (PART 4) */}
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <ShieldAlert size={20} color={eventSettings.registrationOpen ? '#00ff77' : '#E62429'} />
                    EVENT REGISTRATION CONTROL
                  </h3>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '20px',
                    background: eventSettings.registrationOpen ? 'rgba(0, 255, 119, 0.12)' : 'rgba(230, 36, 41, 0.15)',
                    border: `1px solid ${eventSettings.registrationOpen ? 'rgba(0, 255, 119, 0.4)' : 'rgba(230, 36, 41, 0.4)'}`,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    color: eventSettings.registrationOpen ? '#00ff77' : '#ffb4b7',
                    fontWeight: 600,
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: eventSettings.registrationOpen ? '#00ff77' : '#E62429',
                      boxShadow: eventSettings.registrationOpen ? '0 0 8px #00ff77' : '0 0 8px #E62429',
                    }} />
                    <span>{eventSettings.registrationOpen ? 'REGISTRATIONS OPEN & ACTIVE' : 'REGISTRATIONS CLOSED // GATES SEALED'}</span>
                  </div>
                </div>

                <div style={{ background: '#111827', padding: '1.25rem', borderRadius: '6px', marginBottom: '1.5rem', border: '1px solid var(--border-subtle)' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={eventSettings.registrationOpen}
                      onChange={(e) => setEventSettings({ ...eventSettings, registrationOpen: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--color-arc-blue)', marginTop: '2px' }}
                    />
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                        ENABLE PUBLIC EVENT REGISTRATIONS (OPEN / CLOSED)
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.5', marginTop: '0.2rem' }}>
                        When disabled, the public registration page immediately indicates that registrations have concluded, disables form submissions, and Supabase database-level triggers reject new registration inserts.
                      </div>
                    </div>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.4rem' }}>
                      REGISTRATION OPENING TIMELINE
                    </label>
                    <input
                      type="text"
                      value={eventSettings.registrationStartDate}
                      onChange={(e) => setEventSettings({ ...eventSettings, registrationStartDate: e.target.value })}
                      placeholder="e.g. OCTOBER 10, 2026, 10:00 AM"
                      style={{
                        width: '100%',
                        padding: '0.7rem',
                        background: '#111827',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.4rem' }}>
                      REGISTRATION CLOSING DEADLINE
                    </label>
                    <input
                      type="text"
                      value={eventSettings.registrationDeadline}
                      onChange={(e) => setEventSettings({ ...eventSettings, registrationDeadline: e.target.value })}
                      placeholder="e.g. October 20, 2026 11:59 PM"
                      style={{
                        width: '100%',
                        padding: '0.7rem',
                        background: '#111827',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: PPT & PROJECT SUBMISSION CONTROL (PART 5) */}
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <FileText size={20} color={eventSettings.pptSubmissionsOpen ? 'var(--color-arc-blue)' : '#E62429'} />
                    PPT & PROJECT SUBMISSION CONTROL
                  </h3>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '20px',
                    background: eventSettings.pptSubmissionsOpen ? 'rgba(0, 191, 255, 0.12)' : 'rgba(230, 36, 41, 0.15)',
                    border: `1px solid ${eventSettings.pptSubmissionsOpen ? 'rgba(0, 191, 255, 0.4)' : 'rgba(230, 36, 41, 0.4)'}`,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    color: eventSettings.pptSubmissionsOpen ? 'var(--color-arc-blue)' : '#ffb4b7',
                    fontWeight: 600,
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: eventSettings.pptSubmissionsOpen ? 'var(--color-arc-blue)' : '#E62429',
                      boxShadow: eventSettings.pptSubmissionsOpen ? '0 0 8px var(--color-arc-blue)' : '0 0 8px #E62429',
                    }} />
                    <span>{eventSettings.pptSubmissionsOpen ? 'PPT SUBMISSIONS ACTIVE' : 'PPT SUBMISSIONS DISABLED // CLOSED'}</span>
                  </div>
                </div>

                <div style={{ background: '#111827', padding: '1.25rem', borderRadius: '6px', marginBottom: '1.5rem', border: '1px solid var(--border-subtle)' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={eventSettings.pptSubmissionsOpen}
                      onChange={(e) => setEventSettings({ ...eventSettings, pptSubmissionsOpen: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--color-arc-blue)', marginTop: '2px' }}
                    />
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                        ENABLE PROJECT & PPT SUBMISSIONS (OPEN / CLOSED)
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.5', marginTop: '0.2rem' }}>
                        When disabled or after deadline, the participant submission dashboard locks document uploads and final submissions, and database validation prevents status progression.
                      </div>
                    </div>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.4rem' }}>
                      SUBMISSION CLOSING DEADLINE
                    </label>
                    <input
                      type="text"
                      value={eventSettings.submissionDeadline}
                      onChange={(e) => setEventSettings({ ...eventSettings, submissionDeadline: e.target.value })}
                      placeholder="e.g. OCTOBER 25, 2026, 12:00 PM"
                      style={{
                        width: '100%',
                        padding: '0.7rem',
                        background: '#111827',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.4rem' }}>
                      ACCEPTED FILE EXTENSIONS
                    </label>
                    <input
                      type="text"
                      value={eventSettings.acceptedFileTypes}
                      onChange={(e) => setEventSettings({ ...eventSettings, acceptedFileTypes: e.target.value })}
                      placeholder="e.g. .pdf,.pptx,.ppt"
                      style={{
                        width: '100%',
                        padding: '0.7rem',
                        background: '#111827',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.4rem' }}>
                      MAX FILE SIZE LIMIT (MB)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={100}
                      value={eventSettings.maxFileSizeMb}
                      onChange={(e) => setEventSettings({ ...eventSettings, maxFileSizeMb: Number(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: '0.7rem',
                        background: '#111827',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.4rem' }}>
                    OFFICIAL SUBMISSION INSTRUCTIONS & DIRECTIVES
                  </label>
                  <textarea
                    rows={3}
                    value={eventSettings.submissionInstructions}
                    onChange={(e) => setEventSettings({ ...eventSettings, submissionInstructions: e.target.value })}
                    placeholder="Instructions shown to teams regarding repository structure, slide format, and required deliverables..."
                    style={{
                      width: '100%',
                      padding: '0.7rem',
                      background: '#111827',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              {/* SECTION C: GENERAL TIMELINE & WEBSITE PARAMETERS */}
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <Calendar size={20} color="var(--color-arc-blue)" />
                  GENERAL EVENT PARAMETERS & VENUE
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.4rem' }}>
                      EVENT DATES BANNER
                    </label>
                    <input
                      type="text"
                      value={eventSettings.eventDate}
                      onChange={(e) => setEventSettings({ ...eventSettings, eventDate: e.target.value })}
                      placeholder="e.g. OCTOBER 24-25, 2026"
                      style={{
                        width: '100%',
                        padding: '0.7rem',
                        background: '#111827',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.4rem' }}>
                      CAMPUS VENUE / HOST LOCATION
                    </label>
                    <input
                      type="text"
                      value={eventSettings.venue}
                      onChange={(e) => setEventSettings({ ...eventSettings, venue: e.target.value })}
                      placeholder="e.g. Campus Multipurpose Hall, REC Banda, Atarra, Uttar Pradesh"
                      style={{
                        width: '100%',
                        padding: '0.7rem',
                        background: '#111827',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.4rem' }}>
                      EVENT CYCLE STATUS
                    </label>
                    <select
                      value={eventSettings.liveModeStatus}
                      onChange={(e) => setEventSettings({ ...eventSettings, liveModeStatus: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.7rem',
                        background: '#111827',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        color: '#fff',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                      }}
                    >
                      <option value="REGISTRATION OPEN">REGISTRATION OPEN</option>
                      <option value="EVENT LIVE">EVENT LIVE (HACKATHON COMMENCED)</option>
                      <option value="SUBMISSIONS OPEN">SUBMISSIONS OPEN</option>
                      <option value="JUDGING">JUDGING & EVALUATION</option>
                      <option value="RESULTS">RESULTS DEPLOYED</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.4rem' }}>
                      OFFICIAL SUPPORT EMAIL
                    </label>
                    <input
                      type="email"
                      value={eventSettings.contactEmail}
                      onChange={(e) => setEventSettings({ ...eventSettings, contactEmail: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.7rem',
                        background: '#111827',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                </div>

                <div style={{ background: '#111827', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', border: '1px solid var(--border-subtle)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={eventSettings.leaderboardPublished}
                      onChange={(e) => setEventSettings({ ...eventSettings, leaderboardPublished: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--color-stark-gold)' }}
                    />
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>ENABLE PUBLIC LEADERBOARD</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Permit attendees and visitors to view official rankings and judging scores.</div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2rem' }}
              >
                {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                SAVE & PUBLISH SETTINGS TO DATABASE
              </button>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* TAB: PROBLEM CATEGORIES MANAGEMENT (PART 2)                    */}
        {/* ============================================================== */}
        {activeTab === 'problem_categories' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#fff', margin: 0 }}>
                  HACKATHON PROBLEM TRACK CATEGORIES
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                  Manage the six official crisis tracks, themes, background scenarios, requirements, and display sequences.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenCategoryModal()}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
              >
                <Plus size={16} />
                ADD TRACK CATEGORY
              </button>
            </div>

            {categories.length === 0 ? (
              <div style={{ background: '#111827', padding: '3rem', textAlign: 'center', borderRadius: '8px', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                No problem categories registered. Click "Add Track Category" to initialize official tracks.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {categories.map((cat) => {
                  const isPub = cat.is_published ?? cat.is_active ?? true;
                  return (
                    <div
                      key={cat.id || cat.slug}
                      style={{
                        background: 'rgba(28, 32, 38, 0.95)',
                        border: `1px solid ${isPub ? 'rgba(0, 191, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-stark-gold)', fontWeight: 600 }}>
                            TRACK 0{cat.number} // ORDER #{cat.sort_order ?? 0}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.68rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              background: isPub ? 'rgba(0, 255, 119, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                              color: isPub ? '#00ff77' : 'var(--text-muted)',
                              border: `1px solid ${isPub ? 'rgba(0, 255, 119, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                              fontWeight: 600,
                            }}
                          >
                            {isPub ? 'PUBLISHED' : 'UNPUBLISHED'}
                          </span>
                        </div>

                        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#fff', margin: '0 0 0.4rem 0' }}>
                          {cat.title}
                        </h4>

                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-arc-blue)', marginBottom: '0.6rem' }}>
                          THEME: {cat.theme}
                        </div>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: '1.5', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {cat.challenge || cat.background || cat.description || 'No description provided.'}
                        </p>
                      </div>

                      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => handlePreviewItem('category', cat)}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            title="Preview how this appears to participants"
                          >
                            <Eye size={13} />
                            PREVIEW
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenCategoryModal(cat)}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            title="Edit Category Details"
                          >
                            <Edit2 size={13} />
                            EDIT
                          </button>
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleCategoryPublish(cat)}
                            style={{
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.75rem',
                              borderRadius: '4px',
                              background: isPub ? 'rgba(230, 36, 41, 0.15)' : 'rgba(0, 255, 119, 0.15)',
                              border: `1px solid ${isPub ? 'rgba(230, 36, 41, 0.4)' : 'rgba(0, 255, 119, 0.4)'}`,
                              color: isPub ? '#ffb4b7' : '#00ff77',
                              cursor: 'pointer',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 600,
                            }}
                          >
                            {isPub ? 'UNPUBLISH' : 'PUBLISH'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePromptDeleteCategory(cat)}
                            style={{
                              padding: '0.35rem 0.55rem',
                              borderRadius: '4px',
                              background: 'rgba(230, 36, 41, 0.1)',
                              border: '1px solid rgba(230, 36, 41, 0.3)',
                              color: '#ffb4b7',
                              cursor: 'pointer',
                            }}
                            title="Delete category (safe dependency check)"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: PROBLEM STATEMENTS MANAGEMENT (PART 3)                    */}
        {/* ============================================================== */}
        {activeTab === 'problem_statements' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#fff', margin: 0 }}>
                  PROBLEM STATEMENTS REPOSITORY
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                  Author and publish comprehensive challenge specifications, constraints, synthetic datasets, and evaluation criteria.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenStatementModal()}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
              >
                <Plus size={16} />
                ADD PROBLEM STATEMENT
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div style={{
              background: '#111827',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '0.85rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  value={statementSearch}
                  onChange={(e) => setStatementSearch(e.target.value)}
                  placeholder="Search problem statements by title or description..."
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Filter size={14} color="var(--color-stark-gold)" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-stark-gold)' }}>TRACK:</span>
                  <select
                    value={statementCategoryFilter}
                    onChange={(e) => setStatementCategoryFilter(e.target.value)}
                    style={{
                      padding: '0.4rem 0.6rem',
                      background: '#1A1F26',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '0.78rem',
                    }}
                  >
                    <option value="all">ALL TRACKS</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        TRACK 0{c.number}: {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-stark-gold)' }}>STATUS:</span>
                  <select
                    value={statementStatusFilter}
                    onChange={(e) => setStatementStatusFilter(e.target.value)}
                    style={{
                      padding: '0.4rem 0.6rem',
                      background: '#1A1F26',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '0.78rem',
                    }}
                  >
                    <option value="all">ALL STATUSES</option>
                    <option value="published">PUBLISHED ONLY</option>
                    <option value="draft">DRAFTS ONLY</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Statements Cards Grid */}
            {(() => {
              const filtered = statements.filter((s) => {
                const matchSearch = statementSearch.trim() === '' ||
                  s.title?.toLowerCase().includes(statementSearch.toLowerCase()) ||
                  s.description?.toLowerCase().includes(statementSearch.toLowerCase());

                const matchCat = statementCategoryFilter === 'all' || s.category_id === statementCategoryFilter;
                const matchStatus = statementStatusFilter === 'all' ||
                  (statementStatusFilter === 'published' && s.is_published) ||
                  (statementStatusFilter === 'draft' && !s.is_published);

                return matchSearch && matchCat && matchStatus;
              });

              if (filtered.length === 0) {
                return (
                  <div style={{ background: '#111827', padding: '3rem', textAlign: 'center', borderRadius: '8px', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    No problem statements found matching the selected criteria. Click "Add Problem Statement" to author one.
                  </div>
                );
              }

              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
                  {filtered.map((stmt) => {
                    const parentCat = categories.find((c) => c.id === stmt.category_id) || stmt.category || {};
                    const isPub = stmt.is_published;

                    return (
                      <div
                        key={stmt.id}
                        style={{
                          background: 'rgba(28, 32, 38, 0.95)',
                          border: `1px solid ${isPub ? 'rgba(0, 191, 255, 0.3)' : 'rgba(245, 182, 66, 0.25)'}`,
                          borderRadius: 'var(--radius-md)',
                          padding: '1.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-stark-gold)', fontWeight: 600 }}>
                              {parentCat.number ? `TRACK 0${parentCat.number}` : 'TRACK'} • {parentCat.theme || stmt.track_label || 'CHALLENGE'}
                            </span>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.68rem',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                background: isPub ? 'rgba(0, 255, 119, 0.15)' : 'rgba(245, 182, 66, 0.15)',
                                color: isPub ? '#00ff77' : 'var(--color-stark-gold)',
                                border: `1px solid ${isPub ? 'rgba(0, 255, 119, 0.3)' : 'rgba(245, 182, 66, 0.3)'}`,
                                fontWeight: 600,
                              }}
                            >
                              {isPub ? 'PUBLISHED' : 'DRAFT'}
                            </span>
                          </div>

                          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#fff', margin: '0 0 0.5rem 0' }}>
                            {stmt.title}
                          </h4>

                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: '1.5', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {stmt.description}
                          </p>

                          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                            {Array.isArray(stmt.requirements) && stmt.requirements.length > 0 && (
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-arc-blue)', background: 'rgba(0, 191, 255, 0.08)', padding: '0.15rem 0.45rem', borderRadius: '3px' }}>
                                {stmt.requirements.length} Requirements
                              </span>
                            )}
                            {stmt.constraints && (
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-muted-crimson)', background: 'rgba(230, 36, 41, 0.08)', padding: '0.15rem 0.45rem', borderRadius: '3px' }}>
                                Constraints Defined
                              </span>
                            )}
                            {stmt.reference_file_url && (
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#00ff77', background: 'rgba(0, 255, 119, 0.08)', padding: '0.15rem 0.45rem', borderRadius: '3px' }}>
                                Attachment Linked
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              type="button"
                              onClick={() => handlePreviewItem('statement', stmt)}
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              title="Preview problem statement specification"
                            >
                              <Eye size={13} />
                              PREVIEW
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenStatementModal(stmt)}
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              title="Edit Statement Details"
                            >
                              <Edit2 size={13} />
                              EDIT
                            </button>
                          </div>

                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              type="button"
                              onClick={() => handleToggleStatementPublish(stmt)}
                              style={{
                                padding: '0.35rem 0.65rem',
                                fontSize: '0.75rem',
                                borderRadius: '4px',
                                background: isPub ? 'rgba(245, 182, 66, 0.15)' : 'rgba(0, 255, 119, 0.15)',
                                border: `1px solid ${isPub ? 'rgba(245, 182, 66, 0.4)' : 'rgba(0, 255, 119, 0.4)'}`,
                                color: isPub ? 'var(--color-stark-gold)' : '#00ff77',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 600,
                              }}
                            >
                              {isPub ? 'SAVE DRAFT' : 'PUBLISH'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePromptDeleteStatement(stmt)}
                              style={{
                                padding: '0.35rem 0.55rem',
                                borderRadius: '4px',
                                background: 'rgba(230, 36, 41, 0.1)',
                                border: '1px solid rgba(230, 36, 41, 0.3)',
                                color: '#ffb4b7',
                                cursor: 'pointer',
                              }}
                              title="Safely delete statement"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
        {activeTab === 'schedules' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#fff', margin: 0 }}>
                  TIMELINE SESSIONS & AGENDAS
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                  Manage multi-day chronological workshops, keynotes, hacking sprints, and evaluation rounds in Indian Standard Time (IST).
                </p>
              </div>
              <button
                onClick={() => handleOpenScheduleModal()}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
              >
                <Plus size={16} />
                ADD SESSION
              </button>
            </div>

            {/* Dynamic Multi-Day Iteration */}
            {(() => {
              const distinctDays = Array.from(new Set(schedules.map((s) => Number(s.day_number) || 1))).sort((a, b) => a - b);
              const activeDays = distinctDays.length > 0 ? distinctDays : [1, 2];

              return activeDays.map((dayNum) => {
                const dayItems = schedules
                  .filter((s) => Number(s.day_number) === dayNum)
                  .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

                const firstItem = dayItems[0] || {};
                const dayLabel = firstItem.day_label || `DAY 0${dayNum}`;
                const eventDate = firstItem.event_date || (dayNum === 1 ? '2026-10-24' : '2026-10-25');

                return (
                  <div
                    key={dayNum}
                    style={{
                      background: 'var(--color-surface-elevated)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.5rem',
                      marginBottom: '2rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            background: dayNum === 1 ? 'rgba(0, 217, 255, 0.2)' : 'rgba(230, 36, 41, 0.2)',
                            border: `1px solid ${dayNum === 1 ? 'var(--color-arc-cyan)' : 'var(--color-stark-crimson)'}`,
                            color: dayNum === 1 ? 'var(--color-arc-cyan)' : '#ffb4b7',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '4px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {dayLabel}
                        </span>

                        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#fff', margin: 0 }}>
                          {dayNum === 1 ? 'COMMENCEMENT, KEYNOTE & HACKING SPRINTS' : 'EVALUATION, DEMOS & VALEDICTORY'}
                        </h4>

                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-arc-cyan)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={12} />
                          {eventDate}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          ({dayItems.length} sessions)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSchedule(null);
                            setScheduleForm({
                              day_number: dayNum,
                              day_label: dayLabel,
                              title: '',
                              description: '',
                              event_date: eventDate,
                              start_time: '10:00 AM',
                              end_time: '11:00 AM',
                              location: 'Multipurpose Hall, REC Banda',
                              speaker: '',
                              category: 'Competition',
                              badge: 'SPRINT',
                              is_highlight: false,
                              sort_order: dayItems.length + 1,
                              is_published: true,
                            });
                            setScheduleModalOpen(true);
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
                        >
                          + ADD TO {dayLabel}
                        </button>
                      </div>
                    </div>

                    {dayItems.length === 0 ? (
                      <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        No sessions listed for {dayLabel}. Click "Add to {dayLabel}" to schedule an agenda session.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {dayItems.map((item, idx) => {
                          const isPub = item.is_published !== false;
                          const timeFormatted = formatTimeRange(item.start_time, item.end_time);

                          return (
                            <div
                              key={item.id}
                              style={{
                                background: 'var(--color-surface-secondary)',
                                border: item.is_highlight ? '1px solid var(--color-infinity-gold)' : '1px solid var(--border-subtle)',
                                borderRadius: '6px',
                                padding: '1rem 1.25rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '1rem',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <div style={{ flex: '1 1 340px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                                  {/* Sort index badge */}
                                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-text-secondary)', background: 'rgba(255, 255, 255, 0.06)', padding: '0.15rem 0.4rem', borderRadius: '3px' }}>
                                    #{item.sort_order || idx + 1}
                                  </span>

                                  {/* Time Range */}
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-mono)',
                                      fontSize: '0.74rem',
                                      color: 'var(--color-arc-cyan)',
                                      background: 'rgba(0, 217, 255, 0.1)',
                                      border: '1px solid rgba(0, 217, 255, 0.25)',
                                      padding: '0.15rem 0.5rem',
                                      borderRadius: '3px',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {timeFormatted}
                                  </span>

                                  {/* Category */}
                                  {item.category && (
                                    <span
                                      style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.68rem',
                                        color: '#F4F7FB',
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        padding: '0.15rem 0.45rem',
                                        borderRadius: '3px',
                                      }}
                                    >
                                      {item.category}
                                    </span>
                                  )}

                                  {/* Badge marker */}
                                  {item.badge && item.badge !== item.category && (
                                    <span
                                      style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.68rem',
                                        color: 'var(--color-infinity-gold)',
                                        background: 'rgba(245, 196, 81, 0.15)',
                                        border: '1px solid rgba(245, 196, 81, 0.3)',
                                        padding: '0.15rem 0.4rem',
                                        borderRadius: '3px',
                                      }}
                                    >
                                      {item.badge}
                                    </span>
                                  )}

                                  {/* Highlight */}
                                  {item.is_highlight && (
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-infinity-gold)', fontWeight: 700 }}>
                                      KEY EVENT
                                    </span>
                                  )}

                                  {/* Publish Status */}
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-mono)',
                                      fontSize: '0.65rem',
                                      padding: '0.15rem 0.4rem',
                                      borderRadius: '3px',
                                      background: isPub ? 'rgba(0, 255, 119, 0.12)' : 'rgba(245, 196, 81, 0.12)',
                                      color: isPub ? '#00ff77' : 'var(--color-infinity-gold)',
                                      border: `1px solid ${isPub ? 'rgba(0, 255, 119, 0.3)' : 'rgba(245, 196, 81, 0.3)'}`,
                                      fontWeight: 600,
                                    }}
                                  >
                                    {isPub ? 'PUBLISHED' : 'DRAFT'}
                                  </span>
                                </div>

                                <div style={{ fontWeight: 600, color: '#fff', fontSize: '1rem', marginBottom: '0.2rem' }}>
                                  {item.title}
                                </div>

                                {item.description && (
                                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem', lineHeight: '1.4' }}>
                                    {item.description}
                                  </div>
                                )}

                                <div style={{ display: 'flex', gap: '1.2rem', marginTop: '0.4rem', fontSize: '0.75rem', color: '#94A3B8', flexWrap: 'wrap' }}>
                                  {item.location && <span>📍 {item.location}</span>}
                                  {item.speaker && <span>🎙️ {item.speaker}</span>}
                                  {item.event_date && <span>📅 {item.event_date}</span>}
                                </div>
                              </div>

                              {/* Controls */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                {/* Reorder Arrows */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleReorderSchedule(item, 'up')}
                                    disabled={idx === 0}
                                    style={{
                                      padding: '0.2rem 0.35rem',
                                      background: 'rgba(255, 255, 255, 0.05)',
                                      border: '1px solid rgba(255, 255, 255, 0.1)',
                                      color: idx === 0 ? 'rgba(255, 255, 255, 0.2)' : '#fff',
                                      borderRadius: '3px',
                                      cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                    }}
                                    title="Move Earlier"
                                  >
                                    <ChevronUp size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReorderSchedule(item, 'down')}
                                    disabled={idx === dayItems.length - 1}
                                    style={{
                                      padding: '0.2rem 0.35rem',
                                      background: 'rgba(255, 255, 255, 0.05)',
                                      border: '1px solid rgba(255, 255, 255, 0.1)',
                                      color: idx === dayItems.length - 1 ? 'rgba(255, 255, 255, 0.2)' : '#fff',
                                      borderRadius: '3px',
                                      cursor: idx === dayItems.length - 1 ? 'not-allowed' : 'pointer',
                                    }}
                                    title="Move Later"
                                  >
                                    <ChevronDown size={12} />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleToggleSchedulePublish(item)}
                                  style={{
                                    padding: '0.35rem 0.65rem',
                                    fontSize: '0.72rem',
                                    borderRadius: '4px',
                                    background: isPub ? 'rgba(245, 196, 81, 0.15)' : 'rgba(0, 255, 119, 0.15)',
                                    border: `1px solid ${isPub ? 'rgba(245, 196, 81, 0.4)' : 'rgba(0, 255, 119, 0.4)'}`,
                                    color: isPub ? 'var(--color-infinity-gold)' : '#00ff77',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 600,
                                  }}
                                >
                                  {isPub ? 'DRAFT' : 'PUBLISH'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenScheduleModal(item)}
                                  className="btn btn-secondary"
                                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                                  title="Edit Session"
                                >
                                  <Edit2 size={13} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handlePromptDeleteSchedule(item)}
                                  style={{
                                    padding: '0.35rem 0.55rem',
                                    background: 'rgba(230, 36, 41, 0.12)',
                                    border: '1px solid rgba(230, 36, 41, 0.35)',
                                    color: '#ffb4b7',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                  }}
                                  title="Delete Session"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: SPONSORS & PARTNERS ALLIANCES                            */}
        {/* ============================================================== */}
        {activeTab === 'sponsors' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#fff', margin: 0 }}>
                  SPONSORS & PARTNER ALLIANCES
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                  Manage corporate sponsors, tiers, brand logos, website redirects, and display rankings.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleOpenSponsorModal()}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
                >
                  <Plus size={16} />
                  ADD SPONSOR
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div
              style={{
                background: 'var(--color-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: '1 1 240px', position: 'relative' }}>
                <Search size={16} color="var(--color-arc-cyan)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search sponsors by brand name..."
                  value={sponsorSearch}
                  onChange={(e) => setSponsorSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.85rem 0.55rem 2.4rem',
                    background: 'var(--color-surface-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    color: '#fff',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>TIER:</span>
                <select
                  value={sponsorTierFilter}
                  onChange={(e) => setSponsorTierFilter(e.target.value)}
                  style={{
                    padding: '0.55rem 0.85rem',
                    background: 'var(--color-surface-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                  }}
                >
                  <option value="all">ALL TIERS</option>
                  <option value="title">TITLE SPONSOR</option>
                  <option value="powered_by">POWERED BY</option>
                  <option value="gold">GOLD SPONSORS</option>
                  <option value="silver">SILVER SPONSORS</option>
                  <option value="bronze">BRONZE SPONSORS</option>
                  <option value="community">COMMUNITY PARTNERS</option>
                </select>
              </div>
            </div>

            {/* Grouped by Official Tier */}
            {(() => {
              const tierSpecs = [
                { id: 'title', label: 'TITLE SPONSOR', badge: 'HERO TIER', variant: 'gold' },
                { id: 'powered_by', label: 'POWERED BY', badge: 'INFRASTRUCTURE PARTNER', variant: 'cyan' },
                { id: 'gold', label: 'GOLD SPONSORS', badge: 'GOLD ALLIANCE', variant: 'gold' },
                { id: 'silver', label: 'SILVER SPONSORS', badge: 'SILVER ALLIANCE', variant: 'cyan' },
                { id: 'bronze', label: 'BRONZE SPONSORS', badge: 'BRONZE ALLIANCE', variant: 'steel' },
                { id: 'community', label: 'COMMUNITY PARTNERS', badge: 'COMMUNITY ECOSYSTEM', variant: 'violet' },
              ];

              const filtered = sponsors.filter((s) => {
                if (sponsorSearch.trim()) {
                  const q = sponsorSearch.toLowerCase().trim();
                  if (!s.name?.toLowerCase().includes(q)) return false;
                }
                if (sponsorTierFilter !== 'all') {
                  const t = (s.tier || s.category || '').toLowerCase();
                  if (t !== sponsorTierFilter.toLowerCase()) return false;
                }
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div
                    style={{
                      background: 'var(--color-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '3rem',
                      textAlign: 'center',
                    }}
                  >
                    <Handshake size={36} color="var(--color-arc-cyan)" style={{ margin: '0 auto 1rem auto', opacity: 0.6 }} />
                    <h4 style={{ color: '#fff', fontFamily: 'var(--font-heading)', margin: '0 0 0.4rem 0' }}>
                      NO SPONSORS FOUND
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 1.25rem 0' }}>
                      {sponsorSearch || sponsorTierFilter !== 'all'
                        ? 'No sponsors match the current filter or search criteria.'
                        : 'No sponsors have been created yet. Click "Add Sponsor" above to create one.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenSponsorModal()}
                      className="btn btn-primary"
                    >
                      <Plus size={14} />
                      REGISTER FIRST SPONSOR
                    </button>
                  </div>
                );
              }

              return tierSpecs.map((spec) => {
                const tierItems = filtered
                  .filter((s) => (s.tier || s.category || 'gold').toLowerCase() === spec.id.toLowerCase())
                  .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

                if (tierItems.length === 0 && sponsorTierFilter !== 'all') return null;
                if (tierItems.length === 0) return null;

                return (
                  <div
                    key={spec.id}
                    style={{
                      background: 'var(--color-surface-elevated)',
                      border: `1px solid ${spec.variant === 'gold' ? 'rgba(245, 196, 81, 0.3)' : 'var(--border-medium)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '1.5rem',
                      marginBottom: '2rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            color: spec.variant === 'gold' ? 'var(--color-infinity-gold)' : 'var(--color-arc-cyan)',
                            background: spec.variant === 'gold' ? 'rgba(245, 196, 81, 0.15)' : 'rgba(0, 217, 255, 0.15)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontWeight: 700,
                          }}
                        >
                          {spec.label}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          ({tierItems.length} sponsors)
                        </span>
                      </div>

                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                        {spec.badge}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
                      {tierItems.map((sponsor, idx) => {
                        const isPub = sponsor.is_published !== false;

                        return (
                          <div
                            key={sponsor.id}
                            style={{
                              background: 'var(--color-surface-secondary)',
                              border: `1px solid ${isPub ? 'var(--border-subtle)' : 'rgba(245, 196, 81, 0.25)'}`,
                              borderRadius: '6px',
                              padding: '1.25rem',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: '0.8rem',
                            }}
                          >
                            <div>
                              {/* Header & Logo */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                                <div
                                  style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '6px',
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {sponsor.logo_url ? (
                                    <img
                                      src={sponsor.logo_url}
                                      alt={sponsor.name}
                                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                    />
                                  ) : (
                                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-arc-cyan)' }}>
                                      {sponsor.name.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>

                                <span
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.65rem',
                                    padding: '0.15rem 0.45rem',
                                    borderRadius: '3px',
                                    background: isPub ? 'rgba(0, 255, 119, 0.12)' : 'rgba(245, 196, 81, 0.12)',
                                    color: isPub ? '#00ff77' : 'var(--color-infinity-gold)',
                                    border: `1px solid ${isPub ? 'rgba(0, 255, 119, 0.3)' : 'rgba(245, 196, 81, 0.3)'}`,
                                    fontWeight: 600,
                                  }}
                                >
                                  {isPub ? 'PUBLISHED' : 'DRAFT'}
                                </span>
                              </div>

                              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: '#fff', fontWeight: 600, marginBottom: '0.2rem' }}>
                                {sponsor.name}
                              </div>

                              {sponsor.description && (
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', lineHeight: '1.4', margin: '0 0 0.5rem 0' }}>
                                  {sponsor.description}
                                </p>
                              )}

                              {sponsor.website_url && (
                                <a
                                  href={sponsor.website_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    color: 'var(--color-arc-cyan)',
                                    fontSize: '0.74rem',
                                    fontFamily: 'var(--font-mono)',
                                    textDecoration: 'none',
                                    wordBreak: 'break-all',
                                  }}
                                >
                                  <ExternalLink size={12} />
                                  {sponsor.website_url}
                                </a>
                              )}
                            </div>

                            {/* Card Footer Controls */}
                            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleReorderSponsor(sponsor, 'up')}
                                  disabled={idx === 0}
                                  style={{
                                    padding: '0.2rem 0.35rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: idx === 0 ? 'rgba(255, 255, 255, 0.2)' : '#fff',
                                    borderRadius: '3px',
                                    cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                  }}
                                  title="Shift Priority Up"
                                >
                                  <ChevronUp size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReorderSponsor(sponsor, 'down')}
                                  disabled={idx === tierItems.length - 1}
                                  style={{
                                    padding: '0.2rem 0.35rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: idx === tierItems.length - 1 ? 'rgba(255, 255, 255, 0.2)' : '#fff',
                                    borderRadius: '3px',
                                    cursor: idx === tierItems.length - 1 ? 'not-allowed' : 'pointer',
                                  }}
                                  title="Shift Priority Down"
                                >
                                  <ChevronDown size={12} />
                                </button>
                              </div>

                              <div style={{ display: 'flex', gap: '0.35rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handlePreviewSponsor(sponsor)}
                                  className="btn btn-secondary"
                                  style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem' }}
                                  title="Preview card"
                                >
                                  <Eye size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenSponsorModal(sponsor)}
                                  className="btn btn-secondary"
                                  style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem' }}
                                  title="Edit sponsor details"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSponsorPublish(sponsor)}
                                  style={{
                                    padding: '0.3rem 0.55rem',
                                    fontSize: '0.72rem',
                                    borderRadius: '4px',
                                    background: isPub ? 'rgba(245, 196, 81, 0.15)' : 'rgba(0, 255, 119, 0.15)',
                                    border: `1px solid ${isPub ? 'rgba(245, 196, 81, 0.4)' : 'rgba(0, 255, 119, 0.4)'}`,
                                    color: isPub ? 'var(--color-infinity-gold)' : '#00ff77',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 600,
                                  }}
                                >
                                  {isPub ? 'DRAFT' : 'PUBLISH'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePromptDeleteSponsor(sponsor)}
                                  style={{
                                    padding: '0.3rem 0.5rem',
                                    borderRadius: '4px',
                                    background: 'rgba(230, 36, 41, 0.12)',
                                    border: '1px solid rgba(230, 36, 41, 0.35)',
                                    color: '#ffb4b7',
                                    cursor: 'pointer',
                                  }}
                                  title="Delete sponsor"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: ANNOUNCEMENTS                                            */}
        {/* ============================================================== */}
        {activeTab === 'announcements' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#fff', margin: 0 }}>
                  ANNOUNCEMENTS & NOTICES
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                  Push urgent alerts, schedule changes, and instructions to participants across the platform.
                </p>
              </div>
              <button
                onClick={() => handleOpenAnnouncementModal()}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
              >
                <Plus size={16} />
                NEW BROADCAST
              </button>
            </div>

            <div
              style={{
                background: 'rgba(28, 32, 38, 0.95)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
              }}
            >
              {announcements.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Bell size={32} style={{ margin: '0 auto 0.5rem auto', display: 'block', opacity: 0.3 }} />
                  No announcements recorded yet. Create one to inform participants.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      style={{
                        background: '#111827',
                        border: ann.priority === 'urgent' ? '1px solid var(--color-muted-crimson)' : '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ flex: '1 1 300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.45rem',
                              borderRadius: '3px',
                              background: ann.priority === 'urgent' ? 'rgba(143, 48, 53, 0.3)' : 'rgba(0, 191, 255, 0.15)',
                              color: ann.priority === 'urgent' ? '#ffb4b7' : 'var(--color-arc-blue)',
                              border: `1px solid ${ann.priority === 'urgent' ? 'var(--color-muted-crimson)' : 'var(--color-arc-blue)'}`,
                            }}
                          >
                            {(ann.priority || 'NORMAL').toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: ann.published ? '#34D399' : 'var(--text-muted)' }}>
                            {ann.published ? '● PUBLISHED LIVE' : '○ DRAFT'}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                            {ann.created_at ? new Date(ann.created_at).toLocaleDateString('en-IN') : ''}
                          </span>
                        </div>

                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.05rem', marginBottom: '0.35rem' }}>
                          {ann.title}
                        </div>
                        <p style={{ color: '#CBD5E1', fontSize: '0.86rem', lineHeight: 1.5, margin: 0 }}>
                          {ann.message}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleOpenAnnouncementModal(ann)}
                          style={{
                            padding: '0.35rem 0.65rem',
                            background: 'rgba(0, 191, 255, 0.15)',
                            border: '1px solid var(--color-arc-blue)',
                            color: 'var(--color-arc-blue)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                          style={{
                            padding: '0.35rem 0.65rem',
                            background: 'rgba(143, 48, 53, 0.2)',
                            border: '1px solid var(--color-muted-crimson)',
                            color: '#ffb4b7',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: FAQs                                                     */}
        {/* ============================================================== */}
        {activeTab === 'faqs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#fff', margin: 0 }}>
                  EVENT RULES & FREQUENTLY ASKED QUESTIONS
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                  Keep rules, accommodation, transport, eligibility, and submission requirements up to date.
                </p>
              </div>
              <button
                onClick={() => handleOpenFaqModal()}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
              >
                <Plus size={16} />
                ADD FAQ
              </button>
            </div>

            <div
              style={{
                background: 'rgba(28, 32, 38, 0.95)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
              }}
            >
              {faqs.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No FAQs listed. Click "Add FAQ" to add instructions.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {faqs.map((faq) => (
                    <div
                      key={faq.id}
                      style={{
                        background: '#111827',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.7rem',
                              color: 'var(--color-stark-gold)',
                              background: 'rgba(245, 182, 66, 0.1)',
                              padding: '0.1rem 0.45rem',
                              borderRadius: '3px',
                            }}
                          >
                            {(faq.category || 'GENERAL').toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.98rem', marginBottom: '0.35rem' }}>
                          {faq.question}
                        </div>
                        <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                          {faq.answer}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleOpenFaqModal(faq)}
                          style={{
                            padding: '0.35rem 0.65rem',
                            background: 'rgba(0, 191, 255, 0.15)',
                            border: '1px solid var(--color-arc-blue)',
                            color: 'var(--color-arc-blue)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteFaq(faq.id)}
                          style={{
                            padding: '0.35rem 0.65rem',
                            background: 'rgba(143, 48, 53, 0.2)',
                            border: '1px solid var(--color-muted-crimson)',
                            color: '#ffb4b7',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: COMPETITIONS                                             */}
        {/* ============================================================== */}
        {activeTab === 'competitions' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#fff', margin: 0 }}>
                COMPETITION TRACKS & DESCRIPTIONS
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                Review and update track guidelines, team limits, and competition briefs.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
              {competitions.map((comp) => (
                <div
                  key={comp.id}
                  style={{
                    background: 'rgba(28, 32, 38, 0.95)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="chapter-badge" style={{ margin: 0 }}>
                        {comp.slug?.toUpperCase() || 'TRACK'}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-arc-blue)' }}>
                        TEAM SIZE: {comp.min_team_size || 1} - {comp.max_team_size || 4}
                      </span>
                    </div>

                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#fff', margin: '0.3rem 0 0.5rem 0' }}>
                      {comp.name}
                    </h4>

                    <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.55 }}>
                      {comp.description || 'No description provided.'}
                    </p>
                  </div>

                  <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', marginTop: '1rem' }}>
                    <button
                      onClick={() => handleOpenCompModal(comp)}
                      className="btn btn-secondary"
                      style={{ width: '100%', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                    >
                      <Edit2 size={14} />
                      EDIT COMPETITION BRIEF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SCHEDULE MODAL                                                  */}
        {/* ============================================================== */}
        {scheduleModalOpen && (
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
                padding: '1.75rem',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={20} color="var(--color-arc-blue)" />
                  {editingSchedule ? 'EDIT SCHEDULE EVENT' : 'ADD NEW SCHEDULE EVENT'}
                </h3>
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveSchedule}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      EVENT DATE:
                    </label>
                    <input
                      type="date"
                      required
                      value={scheduleForm.event_date || '2026-10-24'}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, event_date: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      DAY NUMBER:
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={scheduleForm.day_number}
                      onChange={(e) => {
                        const num = Number(e.target.value);
                        setScheduleForm({
                          ...scheduleForm,
                          day_number: num,
                          day_label: scheduleForm.day_label || `DAY ${String(num).padStart(2, '0')}`,
                        });
                      }}
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      DAY LABEL / BADGE:
                    </label>
                    <input
                      type="text"
                      value={scheduleForm.day_label || ''}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, day_label: e.target.value })}
                      placeholder="e.g. DAY 01"
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    EVENT TITLE:
                  </label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.title}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                    placeholder="e.g. Opening Ceremony & Hackathon Kickoff"
                    style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      EVENT CATEGORY:
                    </label>
                    <select
                      value={scheduleForm.category || 'Opening Ceremony'}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, category: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    >
                      <option value="Opening Ceremony">Opening Ceremony</option>
                      <option value="Competition Track">Competition / Hacking</option>
                      <option value="Keynote & Talk">Keynote & Expert Talk</option>
                      <option value="Workshop">Workshop & Demo</option>
                      <option value="Mentorship Sprint">Mentorship Sprint</option>
                      <option value="Food & Refreshments">Break & Refreshments</option>
                      <option value="Judging Round">Judging Round</option>
                      <option value="Project Pitching">Project Pitching</option>
                      <option value="Results & Valedictory">Results & Valedictory</option>
                      <option value="General">General / Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      VISUAL BADGE / MARKER:
                    </label>
                    <input
                      type="text"
                      value={scheduleForm.badge}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, badge: e.target.value })}
                      placeholder="e.g. STAGE, CEREMONY, HACKATHON"
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      START TIME (IST) — {scheduleForm.start_time}:
                    </label>
                    <input
                      type="time"
                      required
                      value={to24HourInput(scheduleForm.start_time)}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: from24HourInput(e.target.value) })}
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      END TIME (IST) — {scheduleForm.end_time}:
                    </label>
                    <input
                      type="time"
                      required
                      value={to24HourInput(scheduleForm.end_time)}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: from24HourInput(e.target.value) })}
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      VENUE / LOCATION:
                    </label>
                    <input
                      type="text"
                      value={scheduleForm.location}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                      placeholder="Main Auditorium, REC Banda"
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      SPEAKER / HOST:
                    </label>
                    <input
                      type="text"
                      value={scheduleForm.speaker}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, speaker: e.target.value })}
                      placeholder="e.g. Chief Guest / Dr. Mentor"
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    DESCRIPTION:
                  </label>
                  <textarea
                    rows={3}
                    value={scheduleForm.description}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                    placeholder="Details about session deliverables, requirements, or agenda..."
                    style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      DISPLAY SORT ORDER:
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={scheduleForm.sort_order}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, sort_order: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      STATUS:
                    </label>
                    <select
                      value={scheduleForm.is_published ? 'published' : 'draft'}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, is_published: e.target.value === 'published' })}
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    >
                      <option value="published">PUBLISHED (PUBLIC TIMELINE)</option>
                      <option value="draft">DRAFT (HIDDEN)</option>
                    </select>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={scheduleForm.is_highlight}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, is_highlight: e.target.checked })}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#fff' }}>Highlight session with prominent golden glow on public timeline</span>
                </label>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setScheduleModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary"
                  >
                    {saving ? 'SAVING...' : editingSchedule ? 'UPDATE EVENT' : 'COMMIT EVENT'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SPONSOR MODAL                                                   */}
        {/* ============================================================== */}
        {sponsorModalOpen && (
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
                maxWidth: '620px',
                padding: '1.75rem',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Handshake size={20} color="var(--color-arc-blue)" />
                  {editingSponsor ? 'EDIT SPONSOR RECORD' : 'REGISTER NEW SPONSOR'}
                </h3>
                <button
                  type="button"
                  onClick={() => setSponsorModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveSponsor}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      ORGANIZATION / BRAND NAME:
                    </label>
                    <input
                      type="text"
                      required
                      value={sponsorForm.name}
                      onChange={(e) => setSponsorForm({ ...sponsorForm, name: e.target.value })}
                      placeholder="e.g. Stark Industries, Google, GitHub"
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      PARTNERSHIP TIER:
                    </label>
                    <select
                      value={sponsorForm.tier}
                      onChange={(e) => setSponsorForm({ ...sponsorForm, tier: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    >
                      <option value="title">TITLE SPONSOR (TIER 1)</option>
                      <option value="powered_by">POWERED BY (TIER 2)</option>
                      <option value="gold">GOLD SPONSOR</option>
                      <option value="silver">SILVER SPONSOR</option>
                      <option value="bronze">BRONZE SPONSOR</option>
                      <option value="community">COMMUNITY PARTNER</option>
                    </select>
                  </div>
                </div>

                {/* Logo Upload Section */}
                <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.5rem' }}>
                    SPONSOR LOGO (UPLOAD OR DIRECT URL):
                  </label>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label
                      style={{
                        padding: '0.5rem 1rem',
                        background: uploadingLogo ? 'rgba(0, 240, 255, 0.1)' : 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid var(--color-arc-blue)',
                        color: 'var(--color-arc-blue)',
                        borderRadius: '4px',
                        cursor: uploadingLogo ? 'wait' : 'pointer',
                        fontSize: '0.78rem',
                        fontFamily: 'var(--font-mono)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <Upload size={14} />
                      {uploadingLogo ? 'UPLOADING TO STORAGE...' : 'SELECT LOGO FILE'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                      PNG, SVG, or WebP recommended (Max 5MB)
                    </span>
                  </div>

                  <input
                    type="url"
                    value={sponsorForm.logo_url}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, logo_url: e.target.value })}
                    placeholder="https://... or auto-filled upon upload"
                    style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                  />

                  {/* Logo live preview in modal */}
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: '120px',
                        height: '60px',
                        background: '#0d1117',
                        border: '1px dashed var(--border-subtle)',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.25rem',
                      }}
                    >
                      {sponsorForm.logo_url ? (
                        <img
                          src={sponsorForm.logo_url}
                          alt="Logo Preview"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div style={{ color: '#64748B', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                          NO LOGO
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94A3B8', lineHeight: 1.4 }}>
                      Card will display brand emblem fallback with initials if logo is left blank or fails to load.
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    OFFICIAL WEBSITE URL (OPTIONAL):
                  </label>
                  <input
                    type="url"
                    value={sponsorForm.website_url}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, website_url: e.target.value })}
                    placeholder="https://company.org"
                    style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    SHORT DESCRIPTION / PARTNERSHIP NOTE:
                  </label>
                  <textarea
                    rows={2}
                    value={sponsorForm.description}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, description: e.target.value })}
                    placeholder="Brief description or partnership role..."
                    style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      DISPLAY SORT ORDER:
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={sponsorForm.sort_order}
                      onChange={(e) => setSponsorForm({ ...sponsorForm, sort_order: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      PUBLICATION STATUS:
                    </label>
                    <select
                      value={sponsorForm.is_published ? 'published' : 'draft'}
                      onChange={(e) => setSponsorForm({ ...sponsorForm, is_published: e.target.value === 'published' })}
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    >
                      <option value="published">PUBLISHED (PUBLIC VISIBLE)</option>
                      <option value="draft">DRAFT (HIDDEN)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => handlePreviewSponsor(sponsorForm)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--color-stark-gold)',
                      borderRadius: '4px',
                      padding: '0.5rem 0.9rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Eye size={14} />
                    PREVIEW CARD
                  </button>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setSponsorModalOpen(false)}
                      className="btn btn-secondary"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      disabled={saving || uploadingLogo}
                      className="btn btn-primary"
                    >
                      {saving ? 'SAVING...' : editingSponsor ? 'UPDATE SPONSOR' : 'REGISTER SPONSOR'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SPONSOR LIVE CARD PREVIEW MODAL                                 */}
        {/* ============================================================== */}
        {sponsorPreviewOpen && previewSponsor && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              zIndex: 1100,
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
                maxWidth: '460px',
                padding: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Eye size={18} color="var(--color-arc-blue)" />
                  PUBLIC SPONSOR CARD PREVIEW
                </h3>
                <button
                  type="button"
                  onClick={() => setSponsorPreviewOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Rendered Preview Card matching SponsorsSection */}
              <div
                style={{
                  background: 'linear-gradient(180deg, rgba(20, 24, 33, 0.95) 0%, rgba(13, 17, 23, 0.98) 100%)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    color: 'var(--color-stark-gold)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    padding: '0.2rem 0.6rem',
                    background: 'rgba(255, 184, 0, 0.08)',
                    border: '1px solid rgba(255, 184, 0, 0.25)',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                  }}
                >
                  {previewSponsor.tier?.replace('_', ' ').toUpperCase() || 'SPONSOR'}
                </div>

                <div
                  style={{
                    width: '100%',
                    height: '90px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    padding: '0.5rem',
                  }}
                >
                  {previewSponsor.logo_url ? (
                    <img
                      src={previewSponsor.logo_url}
                      alt={previewSponsor.name || 'Sponsor'}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(255, 184, 0, 0.15))',
                        border: '1px solid rgba(0, 240, 255, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-arc-blue)',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                      }}
                    >
                      {(previewSponsor.name || 'SP').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#fff', margin: '0 0 0.5rem 0' }}>
                  {previewSponsor.name || 'Sponsor Name'}
                </h4>

                {previewSponsor.description && (
                  <p style={{ color: '#94A3B8', fontSize: '0.82rem', lineHeight: 1.4, margin: '0 0 1rem 0' }}>
                    {previewSponsor.description}
                  </p>
                )}

                {previewSponsor.website_url ? (
                  <a
                    href={previewSponsor.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      color: 'var(--color-arc-blue)',
                      textDecoration: 'none',
                      padding: '0.4rem 0.8rem',
                      border: '1px solid rgba(0, 240, 255, 0.3)',
                      borderRadius: '4px',
                      background: 'rgba(0, 240, 255, 0.05)',
                    }}
                  >
                    <span>VISIT OFFICIAL SITE</span>
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#64748B' }}>
                    NO WEBSITE LINK SPECIFIED
                  </span>
                )}
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSponsorPreviewOpen(false)}
                  className="btn btn-secondary"
                >
                  CLOSE PREVIEW
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ANNOUNCEMENT MODAL                                              */}
        {/* ============================================================== */}
        {announcementModalOpen && (
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
                maxWidth: '550px',
                padding: '1.75rem',
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#fff', margin: '0 0 1.25rem 0' }}>
                {editingAnnouncement ? 'EDIT BROADCAST' : 'DISPATCH ANNOUNCEMENT'}
              </h3>

              <form onSubmit={handleSaveAnnouncement}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    BROADCAST TITLE:
                  </label>
                  <input
                    type="text"
                    required
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    placeholder="e.g. Mentor Round 1 Begins at 14:00"
                    style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      PRIORITY LEVEL:
                    </label>
                    <select
                      value={announcementForm.priority}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    >
                      <option value="normal">NORMAL</option>
                      <option value="high">HIGH</option>
                      <option value="urgent">URGENT (ALERT BANNER)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      STATUS:
                    </label>
                    <select
                      value={announcementForm.published ? 'true' : 'false'}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, published: e.target.value === 'true' })}
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    >
                      <option value="true">PUBLISHED (LIVE)</option>
                      <option value="false">DRAFT (HIDDEN)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    BROADCAST MESSAGE:
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={announcementForm.message}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                    placeholder="Detailed announcement or instructions for participants..."
                    style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setAnnouncementModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary"
                  >
                    {saving ? 'POSTING...' : 'POST ANNOUNCEMENT'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* FAQ MODAL                                                       */}
        {/* ============================================================== */}
        {faqModalOpen && (
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
                maxWidth: '550px',
                padding: '1.75rem',
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#fff', margin: '0 0 1.25rem 0' }}>
                {editingFaq ? 'EDIT FAQ' : 'NEW FAQ'}
              </h3>

              <form onSubmit={handleSaveFaq}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    CATEGORY:
                  </label>
                  <select
                    value={faqForm.category}
                    onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  >
                    <option value="general">GENERAL / EVENT</option>
                    <option value="registration">REGISTRATION & ELIGIBILITY</option>
                    <option value="hackathon">HACKATHON GUIDELINES</option>
                    <option value="logistics">ACCOMMODATION & TRAVEL</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    QUESTION:
                  </label>
                  <input
                    type="text"
                    required
                    value={faqForm.question}
                    onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                    placeholder="e.g. Will food and accommodation be provided at REC Banda?"
                    style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    ANSWER:
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={faqForm.answer}
                    onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                    placeholder="Clear and actionable answer for prospective delegates..."
                    style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setFaqModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary"
                  >
                    {saving ? 'SAVING...' : 'SAVE FAQ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* COMPETITION MODAL                                               */}
        {/* ============================================================== */}
        {compModalOpen && (
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
                maxWidth: '550px',
                padding: '1.75rem',
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#fff', margin: '0 0 1.25rem 0' }}>
                EDIT COMPETITION: {editingComp?.name}
              </h3>

              <form onSubmit={handleSaveComp}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    TRACK NAME:
                  </label>
                  <input
                    type="text"
                    required
                    value={compForm.name}
                    onChange={(e) => setCompForm({ ...compForm, name: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      MIN TEAM SIZE:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={compForm.min_team_size}
                      onChange={(e) => setCompForm({ ...compForm, min_team_size: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      MAX TEAM SIZE:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={compForm.max_team_size}
                      onChange={(e) => setCompForm({ ...compForm, max_team_size: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    COMPETITION BRIEF & DESCRIPTION:
                  </label>
                  <textarea
                    rows={4}
                    value={compForm.description}
                    onChange={(e) => setCompForm({ ...compForm, description: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setCompModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary"
                  >
                    {saving ? 'UPDATING...' : 'COMMIT CHANGES'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PROBLEM CATEGORY MODAL (PART 2)                                 */}
        {/* ============================================================== */}
        {categoryModalOpen && (
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
                maxWidth: '750px',
                padding: '1.75rem',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={20} color="var(--color-arc-blue)" />
                  {editingCategory ? 'EDIT PROBLEM CATEGORY TRACK' : 'ADD NEW PROBLEM CATEGORY TRACK'}
                </h3>
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveCategory}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      TRACK NUMBER (e.g. 01):
                    </label>
                    <input
                      type="text"
                      required
                      value={categoryForm.number}
                      onChange={(e) => setCategoryForm({ ...categoryForm, number: e.target.value })}
                      placeholder="01"
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      DISPLAY SORT ORDER:
                    </label>
                    <input
                      type="number"
                      value={categoryForm.sort_order}
                      onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      TRACK TITLE / NAME:
                    </label>
                    <input
                      type="text"
                      required
                      value={categoryForm.title}
                      onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
                      placeholder="e.g. AI & Machine Learning"
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      THEME / TAGLINE:
                    </label>
                    <input
                      type="text"
                      value={categoryForm.theme}
                      onChange={(e) => setCategoryForm({ ...categoryForm, theme: e.target.value })}
                      placeholder="e.g. INTELLIGENT SYSTEMS & AUTONOMOUS AGENTS"
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    URL SLUG:
                  </label>
                  <input
                    type="text"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    placeholder="e.g. ai-ml"
                    style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    PLACEHOLDER / BRIEFING NOTICE:
                  </label>
                  <input
                    type="text"
                    value={categoryForm.placeholder_notice}
                    onChange={(e) => setCategoryForm({ ...categoryForm, placeholder_notice: e.target.value })}
                    placeholder="OFFICIAL PROBLEM STATEMENT TO BE UNVEILED AT BRIEFING"
                    style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    BACKGROUND & CONTEXT:
                  </label>
                  <textarea
                    rows={3}
                    value={categoryForm.background}
                    onChange={(e) => setCategoryForm({ ...categoryForm, background: e.target.value })}
                    placeholder="Historical context, real-world relevance, industry backdrop..."
                    style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    CORE CHALLENGE DESCRIPTION:
                  </label>
                  <textarea
                    rows={3}
                    value={categoryForm.challenge}
                    onChange={(e) => setCategoryForm({ ...categoryForm, challenge: e.target.value })}
                    placeholder="The primary problem or operational bottleneck participants must address..."
                    style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    REQUIREMENTS (ONE PER LINE):
                  </label>
                  <textarea
                    rows={4}
                    value={categoryForm.requirements}
                    onChange={(e) => setCategoryForm({ ...categoryForm, requirements: e.target.value })}
                    placeholder="Requirement 1&#10;Requirement 2&#10;Requirement 3"
                    style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      EXPECTED OUTCOME:
                    </label>
                    <textarea
                      rows={2}
                      value={categoryForm.expected_outcome}
                      onChange={(e) => setCategoryForm({ ...categoryForm, expected_outcome: e.target.value })}
                      placeholder="Functional, production-ready solution..."
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      TECHNICAL DIRECTIONS:
                    </label>
                    <textarea
                      rows={2}
                      value={categoryForm.technical_directions}
                      onChange={(e) => setCategoryForm({ ...categoryForm, technical_directions: e.target.value })}
                      placeholder="Recommended architectures, libraries..."
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                  <input
                    type="checkbox"
                    id="cat_published"
                    checked={categoryForm.is_published}
                    onChange={(e) => setCategoryForm({ ...categoryForm, is_published: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="cat_published" style={{ color: '#fff', fontSize: '0.85rem', cursor: 'pointer' }}>
                    Publish Track on Public Problems Page Immediately
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setCategoryModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary"
                  >
                    {saving ? 'SAVING...' : editingCategory ? 'UPDATE CATEGORY' : 'CREATE CATEGORY'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PROBLEM STATEMENT MODAL (PART 3)                                */}
        {/* ============================================================== */}
        {statementModalOpen && (
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
                maxWidth: '800px',
                padding: '1.75rem',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target size={20} color="var(--color-arc-blue)" />
                  {editingStatement ? 'EDIT PROBLEM STATEMENT SPECIFICATION' : 'ADD NEW PROBLEM STATEMENT'}
                </h3>
                <button
                  type="button"
                  onClick={() => setStatementModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      ASSIGNED TRACK / CATEGORY:
                    </label>
                    <select
                      value={statementForm.category_id}
                      onChange={(e) => setStatementForm({ ...statementForm, category_id: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          [{c.number || '00'}] {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      BADGE / TRACK LABEL:
                    </label>
                    <input
                      type="text"
                      value={statementForm.track_label}
                      onChange={(e) => setStatementForm({ ...statementForm, track_label: e.target.value })}
                      placeholder="e.g. CORE MISSION or ADVANCED"
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      SORT ORDER:
                    </label>
                    <input
                      type="number"
                      value={statementForm.sort_order}
                      onChange={(e) => setStatementForm({ ...statementForm, sort_order: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    PROBLEM STATEMENT TITLE:
                  </label>
                  <input
                    type="text"
                    required
                    value={statementForm.title}
                    onChange={(e) => setStatementForm({ ...statementForm, title: e.target.value })}
                    placeholder="e.g. Multi-Modal Emergency Dispatch Routing Engine"
                    style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    PROBLEM DESCRIPTION & OVERVIEW:
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={statementForm.description}
                    onChange={(e) => setStatementForm({ ...statementForm, description: e.target.value })}
                    placeholder="Detailed explanation of the challenge, target audience, and operational goals..."
                    style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    TECHNICAL REQUIREMENTS (ONE PER LINE):
                  </label>
                  <textarea
                    rows={4}
                    value={statementForm.requirements}
                    onChange={(e) => setStatementForm({ ...statementForm, requirements: e.target.value })}
                    placeholder="Real-time geo-clustering within <500ms&#10;Deterministic state synchronization&#10;OAuth 2.0 authentication"
                    style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      CONSTRAINTS & LIMITATIONS:
                    </label>
                    <textarea
                      rows={3}
                      value={statementForm.constraints}
                      onChange={(e) => setStatementForm({ ...statementForm, constraints: e.target.value })}
                      placeholder="Memory limits, disallowed libraries, offline capabilities..."
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                      INPUT / OUTPUT SPECIFICATIONS:
                    </label>
                    <textarea
                      rows={3}
                      value={statementForm.input_output_specs}
                      onChange={(e) => setStatementForm({ ...statementForm, input_output_specs: e.target.value })}
                      placeholder="Input JSON schemas, output formats, REST endpoints..."
                      style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    EXAMPLES & TEST SCENARIOS:
                  </label>
                  <textarea
                    rows={3}
                    value={statementForm.examples}
                    onChange={(e) => setStatementForm({ ...statementForm, examples: e.target.value })}
                    placeholder="Sample input/output or mock incident report payload..."
                    style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-stark-gold)', marginBottom: '0.3rem' }}>
                    REFERENCE ATTACHMENT / REPO URL:
                  </label>
                  <input
                    type="url"
                    value={statementForm.reference_file_url}
                    onChange={(e) => setStatementForm({ ...statementForm, reference_file_url: e.target.value })}
                    placeholder="https://github.com/recbanda/hackfest-starter or cloud storage link"
                    style={{ width: '100%', padding: '0.6rem', background: '#111827', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setStatementModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={(e) => handleSaveStatement(e, true)}
                    style={{
                      padding: '0.6rem 1.2rem',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--border-medium)',
                      color: '#E2E8F0',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    SAVE AS DRAFT
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={(e) => handleSaveStatement(e, false)}
                    className="btn btn-primary"
                  >
                    {saving ? 'SAVING...' : 'PUBLISH LIVE'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SAFE DELETION CONFIRMATION MODAL (PART 2 & 3)                    */}
        {/* ============================================================== */}
        {deleteConfirmOpen && deleteTarget && (
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
                border: deleteTarget.canDelete ? '1px solid var(--color-muted-crimson)' : '1px solid var(--color-stark-gold)',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '520px',
                padding: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <ShieldAlert size={28} color={deleteTarget.canDelete ? '#ef4444' : '#f59e0b'} />
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#fff', margin: 0 }}>
                    {deleteTarget.canDelete ? 'CONFIRM SAFE DELETION' : 'DELETION BLOCKED // DEPENDENCIES DETECTED'}
                  </h3>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#94A3B8' }}>
                    TARGET: {deleteTarget.type.toUpperCase()} // "{deleteTarget.item?.title}"
                  </div>
                </div>
              </div>

              {!deleteTarget.canDelete ? (
                <div>
                  <div
                    style={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '6px',
                      padding: '1rem',
                      color: '#FDE68A',
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                      marginBottom: '1.25rem',
                    }}
                  >
                    <strong>Referential Integrity Protection:</strong>
                    <p style={{ margin: '0.35rem 0 0 0' }}>{deleteTarget.message}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmOpen(false)}
                      className="btn btn-secondary"
                    >
                      ACKNOWLEDGE & CLOSE
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ color: '#E2E8F0', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {deleteTarget.message}
                    <br />
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>This record will be permanently purged from the database.</span>
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmOpen(false)}
                      className="btn btn-secondary"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleExecuteDelete}
                      style={{
                        padding: '0.6rem 1.25rem',
                        background: '#dc2626',
                        border: '1px solid #ef4444',
                        color: '#fff',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {saving ? 'DELETING...' : 'CONFIRM PURGE'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PUBLIC PREVIEW MODAL (PART 2 & 3)                               */}
        {/* ============================================================== */}
        {previewModalOpen && previewProblem && (
          <ProblemDetailModal
            problem={previewProblem}
            onClose={() => setPreviewModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

