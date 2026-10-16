import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  X,
  ArrowUpRight,
  LayoutDashboard,
  ShieldCheck,
  Home,
  Info,
  Trophy,
  Target,
  Calendar,
  Award,
  TrendingUp,
  HelpCircle,
  Users2,
  Users,
  Sparkles,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Globe,
  ClipboardList,
  Scale,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import sdcLogo from '../assets/logo.png';
import aktuLogo from '../assets/aktu-logo.png';
import innovationHubLogo from '../assets/innovation-hub-logo.png';
import GooeyNav from './ui/GooeyNav';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [pastIntro, setPastIntro] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, profile, role, isAdmin, isSuperAdmin, isJudge, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Route-aware active item determination
  const isRouteActive = (itemPath) => {
    const { pathname } = location;
    if (itemPath === '/') {
      return pathname === '/';
    }
    if (itemPath === '/problems' || itemPath === '/missions') {
      return pathname === '/problems' || pathname === '/missions';
    }
    if (itemPath === '/competitions') {
      return (
        pathname === '/competitions' ||
        pathname.startsWith('/codeathon') ||
        pathname.startsWith('/ideathon') ||
        pathname.startsWith('/hackathon')
      );
    }
    if (itemPath === '/rules' || itemPath === '/faq') {
      return pathname === '/rules' || pathname === '/faq';
    }
    if (itemPath === '/sdc-members' || itemPath === '/members') {
      return pathname === '/sdc-members' || pathname === '/members';
    }
    if (itemPath === '/admin') {
      return pathname.startsWith('/admin');
    }
    return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
  };

  // Scroll monitoring for transparent -> glassmorphic navbar and cinematic intro gating
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
      const introEl = document.getElementById('cinematic-intro');
      if (introEl && location.pathname === '/') {
        const totalScrollable = introEl.offsetHeight - window.innerHeight;
        setPastIntro(window.scrollY >= introEl.offsetTop + totalScrollable);
      } else {
        setPastIntro(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Lock body scroll and listen for Escape key when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setDrawerOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [drawerOpen]);

  // Automatically close drawer when route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Navigation action helper that executes real route navigation and drawer closure
  const handleNavAction = (item) => {
    setDrawerOpen(false);
    const dest = item?.path || item?.href;
    if (!dest) return;

    if (dest === '/' && location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(dest);
    }
  };

  const handleSignOut = async () => {
    setDrawerOpen(false);
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  };

  // Top header center links (Prizes, Event Sponsors, SDC Family Members added, Schedule removed)
  const desktopNavItems = [
    { label: 'HOME', path: '/' },
    { label: 'ABOUT', path: '/about' },
    { label: 'COMPETITIONS', path: '/competitions' },
    { label: 'PROBLEMS', path: '/problems' },
    { label: 'PRIZES', path: '/prizes' },
    { label: 'EVENT SPONSORS', path: '/sponsors' },
    { label: 'SDC FAMILY MEMBERS', path: '/sdc-members' },
  ];

  const activeNavIndex = desktopNavItems.findIndex((item) => isRouteActive(item.path));

  // Drawer Group 1: Explore
  const explorePages = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'About', path: '/about', icon: Info },
    { label: 'Competitions', path: '/competitions', icon: Trophy },
    { label: 'Problem Statements', path: '/problems', icon: Target },
    { label: 'Prizes', path: '/prizes', icon: Award },
    { label: 'Sponsors', path: '/sponsors', icon: Sparkles },
  ];

  // Drawer Group 2: Event
  const eventPages = [
    { label: 'Schedule', path: '/schedule', icon: Calendar },
    { label: 'Leaderboard', path: '/leaderboard', icon: TrendingUp },
    { label: 'Rules & FAQs', path: '/rules', icon: HelpCircle },
    { label: 'Mentors & Judges', path: '/mentors', icon: Users },
  ];

  // Drawer Group 3: Community
  const communityPages = [
    { label: 'SDC Members & Faculty', path: '/sdc-members', icon: Users2 },
  ];

  // Drawer Group 4: Administration (Strictly Role Protected)
  const adminPages = (isAdmin || isSuperAdmin)
    ? [
        { label: 'Admin Console', path: '/admin', icon: LayoutDashboard },
        ...(isSuperAdmin
          ? [{ label: 'Admin Management', path: '/admin/users', icon: ShieldAlert }]
          : []),
        { label: 'Website CMS & Schedule', path: '/admin/cms', icon: Globe },
        { label: 'Registrations', path: '/admin/registrations', icon: Trophy },
        { label: 'SDC Members Registry', path: '/admin/sdc-members', icon: Users2 },
        { label: 'Audit Log Trail', path: '/admin/audit', icon: ClipboardList },
      ]
    : [];

  return (
    <>
      <header
        className={`navbar stark-navbar ${
          location.pathname === '/' && !pastIntro
            ? 'navbar-in-intro'
            : scrolled
            ? 'scrolled stark-navbar-scrolled'
            : ''
        }`}
      >
        <div className="navbar-inner">
          {/* ============================================================== */}
          {/* 1. LEFT: Hackfest 3.0 Neo Font Logo + Partners Cluster        */}
          {/* ============================================================== */}
          <div className="navbar-brand-cluster">
            <Link
              to="/"
              className="nav-brand"
              onClick={() => handleNavAction({ path: '/' })}
              aria-label="HackFest 3.0 Home"
            >
              <span className="nav-brand-title">
                <span className="nav-brand-word-hackfest">Hackfest</span>
                <span className="nav-brand-version-number">3.0</span>
              </span>
            </Link>

            {/* Subtle Divider Pipe */}
            <div className="nav-brand-pipe" aria-hidden="true" />

            {/* Institutional Partner Logos: SDC, AKTU, Innovation Hub */}
            <div className="nav-partner-logos-strip" aria-label="Organizing & Academic Partners">
              <div
                className="nav-partner-badge sdc-badge"
                title="Student Developer Club (SDC)"
                style={{ cursor: 'default' }}
              >
                <img
                  src={sdcLogo}
                  alt="Student Developer Club"
                  className="nav-partner-img nav-sdc-img"
                />
              </div>

              <div
                className="nav-partner-badge aktu-badge"
                title="Dr. A.P.J. Abdul Kalam Technical University, Lucknow"
              >
                <img
                  src={aktuLogo}
                  alt="AKTU Lucknow"
                  className="nav-partner-img nav-aktu-img"
                />
              </div>

              <div
                className="nav-partner-badge inno-hub-badge"
                title="Innovation Hub Uttar Pradesh"
              >
                <img
                  src={innovationHubLogo}
                  alt="Innovation Hub Uttar Pradesh"
                  className="nav-partner-img nav-inno-img"
                />
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 2. CENTER: Floating Navigation Capsule with GooeyNav Effect    */}
          {/* ============================================================== */}
          <div className="nav-capsule-wrapper" aria-label="Main Navigation">
            <GooeyNav
              items={desktopNavItems.map((item) => ({
                label: item.label,
                href: item.path,
                path: item.path,
              }))}
              activeIndex={activeNavIndex >= 0 ? activeNavIndex : 0}
              initialActiveIndex={0}
              theme="dark"
              size="sm"
              frame={true}
              color="#222832"
              activeTextColor="#FFFFFF"
              colors={['#272E3B', '#1E242E', '#323B4A']}
              particleCount={14}
              spread={74}
              animationTime={550}
              timeVariance={350}
              gooeyness={0.7}
              wobble={0.4}
              hoverEffect={true}
              onChange={(index, item) => handleNavAction(item)}
            />
          </div>

          {/* ============================================================== */}
          {/* 3. RIGHT: Reference Pill Action Button [ SIGN IN (↗) ] & Menu  */}
          {/* ============================================================== */}
          <div className="nav-actions">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {(isAdmin || isSuperAdmin) && (
                  <Link
                    to="/admin"
                    className="nav-ref-pill-btn nav-ref-pill-admin hidden-mobile"
                    title={isSuperAdmin ? 'Super Admin Console' : 'Admin Console'}
                  >
                    <span>{isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'}</span>
                    <span className="nav-pill-arrow-circle" aria-hidden="true">
                      <ShieldCheck size={13} color="#08090D" />
                    </span>
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="nav-ref-pill-btn"
                  title="Participant Dashboard"
                >
                  <span>DASHBOARD</span>
                  <span className="nav-pill-arrow-circle" aria-hidden="true">
                    <ArrowUpRight size={14} color="#08090D" strokeWidth={2.5} />
                  </span>
                </Link>
              </div>
            ) : (
              <div className="nav-auth-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Link
                  to="/login"
                  className="nav-ref-pill-btn"
                  aria-label="Sign In to HackFest 3.0"
                >
                  <span>SIGN IN</span>
                  <span className="nav-pill-arrow-circle" aria-hidden="true">
                    <ArrowUpRight size={14} color="#08090D" strokeWidth={2.5} />
                  </span>
                </Link>
              </div>
            )}

            {/* Clearly Visible Three-Line Hamburger Button */}
            <button
              type="button"
              className={`stark-hamburger-btn ${drawerOpen ? 'is-active' : ''}`}
              onClick={() => setDrawerOpen((prev) => !prev)}
              aria-label={drawerOpen ? 'Close navigation directory' : 'Open navigation directory'}
              aria-expanded={drawerOpen}
              aria-controls="side-nav-drawer"
            >
              <span className="hamburger-bars-wrap" aria-hidden="true">
                <span className="hamburger-bar bar-top" />
                <span className="hamburger-bar bar-mid" />
                <span className="hamburger-bar bar-bot" />
              </span>
              <span className="hamburger-label">MENU</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 4. SIDE NAVIGATION DRAWER & BACKDROP SYSTEM                    */}
      {/* ============================================================== */}
      {/* Dark Translucent Backdrop */}
      <div
        className={`nav-drawer-backdrop ${drawerOpen ? 'open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-out Side Drawer Panel */}
      <aside
        id="side-nav-drawer"
        className={`side-nav-drawer ${drawerOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Directory"
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-header-brand">
            <div>
              <div className="drawer-header-title">
                <span className="nav-brand-word-hackfest" style={{ fontSize: '1.25rem' }}>Hackfest</span>{' '}
                <span className="nav-brand-version-number" style={{ fontSize: '1.1rem' }}>3.0</span>
              </div>
              <div className="drawer-header-sub">STUDENT DEVELOPER CLUB • REC BANDA</div>
            </div>
          </div>

          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation directory"
          >
            <X size={16} />
            <span>CLOSE</span>
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="drawer-body">
          {/* Account Status Card (if logged in) */}
          {user && (
            <div className="drawer-user-card">
              <div className="drawer-user-meta">
                <div>
                  <div className="drawer-user-name">
                    {profile?.full_name || user.email?.split('@')[0] || 'Participant'}
                  </div>
                  <div className="drawer-user-email">{user.email}</div>
                </div>
                <span
                  className={`drawer-role-badge ${
                    isSuperAdmin ? 'super' : isAdmin ? 'admin' : 'participant'
                  }`}
                >
                  {isSuperAdmin
                    ? 'SUPER ADMIN'
                    : isAdmin
                    ? 'ADMIN'
                    : (role || 'PARTICIPANT').toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: '0.4rem' }}>
                <Link
                  to="/dashboard"
                  onClick={() => setDrawerOpen(false)}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    padding: '0.55rem 0.85rem',
                    fontSize: '0.78rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <LayoutDashboard size={14} />
                  <span>DASHBOARD</span>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.55rem 0.85rem',
                    fontSize: '0.78rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                  title="Sign out of account"
                >
                  <LogOut size={14} />
                  <span>LOGOUT</span>
                </button>
              </div>
            </div>
          )}

          {/* Section 1: Explore */}
          <div className="drawer-section-group">
            <div className="drawer-section-title">
              <span>EXPLORE</span>
            </div>
            {explorePages.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNavAction(item)}
                className={`drawer-link-btn ${isRouteActive(item.path) ? 'active' : ''}`}
              >
                <div className="drawer-link-left">
                  <item.icon size={16} className="drawer-link-icon" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={14} className="drawer-link-chevron" />
              </button>
            ))}
          </div>

          {/* Section 2: Event */}
          <div className="drawer-section-group">
            <div className="drawer-section-title">
              <span>EVENT</span>
            </div>
            {eventPages.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNavAction(item)}
                className={`drawer-link-btn ${isRouteActive(item.path) ? 'active' : ''}`}
              >
                <div className="drawer-link-left">
                  <item.icon size={16} className="drawer-link-icon" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={14} className="drawer-link-chevron" />
              </button>
            ))}
          </div>

          {/* Section 3: Community */}
          <div className="drawer-section-group">
            <div className="drawer-section-title">
              <span>COMMUNITY</span>
            </div>
            {communityPages.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNavAction(item)}
                className={`drawer-link-btn ${isRouteActive(item.path) ? 'active' : ''}`}
              >
                <div className="drawer-link-left">
                  <item.icon size={16} className="drawer-link-icon" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={14} className="drawer-link-chevron" />
              </button>
            ))}
          </div>

          {/* Section 4: Administration (Strictly Role-Protected) */}
          {(isAdmin || isSuperAdmin) && (
            <div className="drawer-section-group drawer-admin-group">
              <div className="drawer-section-title drawer-admin-title">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={14} />
                  ADMINISTRATION
                </span>
              </div>
              {adminPages.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavAction(item)}
                  className={`drawer-link-btn drawer-admin-link ${isRouteActive(item.path) ? 'active' : ''}`}
                >
                  <div className="drawer-link-left">
                    <item.icon size={15} style={{ color: item.superOnly ? 'var(--color-stark-gold)' : '#ffb4b7' }} />
                    <span style={{ color: item.superOnly ? 'var(--color-stark-gold)' : '#ffb4b7' }}>{item.label}</span>
                  </div>
                  <ChevronRight size={14} className="drawer-link-chevron" />
                </button>
              ))}
            </div>
          )}

          {/* Section 5: Judge Portal (Strictly Role-Protected) */}
          {isJudge && !isAdmin && (
            <div className="drawer-section-group">
              <div className="drawer-section-title">
                <span>JUDGE CONSOLE</span>
              </div>
              <button
                type="button"
                onClick={() => handleNavAction({ path: '/judge' })}
                className="drawer-link-btn"
              >
                <div className="drawer-link-left">
                  <Scale size={16} className="drawer-link-icon" />
                  <span>Judge Evaluation Portal</span>
                </div>
                <ChevronRight size={14} className="drawer-link-chevron" />
              </button>
            </div>
          )}

          {/* Section 6: Guest Account Actions (If Not Logged In) */}
          {!user && (
            <div className="drawer-section-group" style={{ marginTop: '0.4rem' }}>
              <div className="drawer-section-title">
                <span>ACCOUNT</span>
              </div>
              <div className="drawer-auth-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <Link
                  to="/register"
                  onClick={() => setDrawerOpen(false)}
                  className="btn btn-primary"
                  style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Sparkles size={15} />
                  <span>REGISTER FOR HACKFEST</span>
                  <ArrowUpRight size={15} />
                </Link>
                <Link
                  to="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.7rem 1rem',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <LogIn size={15} />
                  <span>SIGN IN</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
