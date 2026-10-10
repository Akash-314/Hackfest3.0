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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    if (!item?.path) return;

    if (item.path === '/' && location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(item.path);
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

  // Top header center links (core navigation for desktop)
  const desktopNavItems = [
    { label: 'HOME', path: '/' },
    { label: 'ABOUT', path: '/about' },
    { label: 'COMPETITIONS', path: '/competitions' },
    { label: 'PROBLEMS', path: '/problems' },
    { label: 'SCHEDULE', path: '/schedule' },
    { label: 'PRIZES', path: '/prizes' },
    { label: 'SPONSORS', path: '/sponsors' },
    { label: 'LEADERBOARD', path: '/leaderboard' },
  ];

  // Drawer Group 1: Main Pages
  const mainPages = [
    { label: 'Home', path: '/', icon: Home, tag: 'PORTAL' },
    { label: 'About HackFest', path: '/about', icon: Info, tag: 'THEME' },
    { label: 'Competitions & Tracks', path: '/competitions', icon: Trophy, tag: 'ARENAS' },
    { label: 'Problem Statements', path: '/problems', icon: Target, tag: 'CHALLENGES' },
  ];

  // Drawer Group 2: Event Information
  const eventInfoPages = [
    { label: 'Event Schedule', path: '/schedule', icon: Calendar, tag: 'TIMELINE' },
    { label: 'Prizes & Honors', path: '/prizes', icon: Award, tag: 'REWARDS' },
    { label: 'Live Leaderboard', path: '/leaderboard', icon: TrendingUp, tag: 'SCORES' },
    { label: 'Rules & FAQs', path: '/rules', icon: HelpCircle, tag: 'DIRECTIVES' },
    { label: 'Mentors & Judges', path: '/mentors', icon: Users, tag: 'COUNCIL' },
    { label: 'Event Sponsors', path: '/sponsors', icon: Sparkles, tag: 'ALLIES' },
  ];

  // Drawer Group 3: Community
  const communityPages = [
    { label: 'SDC Members & Faculty', path: '/sdc-members', icon: Users2, tag: 'SDC BANDA' },
  ];

  // Drawer Group 4: Administration (Strictly Role Protected)
  const adminPages = (isAdmin || isSuperAdmin)
    ? [
        { label: 'Admin Console Overview', path: '/admin', icon: LayoutDashboard, tag: 'DASHBOARD' },
        ...(isSuperAdmin
          ? [{ label: 'Admin Management', path: '/admin/users', icon: ShieldAlert, tag: 'SUPER ACCESS' }]
          : []),
        { label: 'Website CMS & Schedule', path: '/admin/cms', icon: Globe, tag: 'CONTENT' },
        { label: 'Registration Management', path: '/admin/registrations', icon: Trophy, tag: 'RECORDS' },
        { label: 'SDC Members Registry', path: '/admin/sdc-members', icon: Users2, tag: 'ROSTER' },
        { label: 'Audit Log Trail', path: '/admin/audit', icon: ClipboardList, tag: 'SECURITY' },
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
          {/* 1. LEFT: HackFest 3.0 Logo and SDC / REC Banda Branding        */}
          {/* ============================================================== */}
          <Link
            to="/"
            className="nav-brand"
            onClick={() => handleNavAction({ path: '/' })}
            aria-label="HackFest 3.0 Home"
          >
            <div className="stark-reactor-crest" aria-hidden="true">
              <svg viewBox="0 0 44 44" width="38" height="38">
                {/* Outer Hexagon Shield */}
                <polygon
                  points="22,2 40,12 40,32 22,42 4,32 4,12"
                  fill="#0D111A"
                  stroke="#00BFFF"
                  strokeWidth="1.6"
                  strokeDasharray="4 2"
                />
                {/* Inner Energy Triangle */}
                <polygon
                  points="22,10 33,29 11,29"
                  fill="rgba(230, 36, 41, 0.25)"
                  stroke="#E62429"
                  strokeWidth="1.8"
                />
                {/* Arc Reactor Core Center */}
                <circle cx="22" cy="22" r="4.5" fill="#00BFFF" />
                <circle cx="22" cy="22" r="7.5" fill="none" stroke="#F5B642" strokeWidth="1" />
              </svg>
            </div>
            <div className="brand-text-wrap">
              <span className="brand-title stark-brand-title">
                HACKFEST <span style={{ color: 'var(--color-arc-blue)' }}>3.0</span>
              </span>
              <span className="brand-sub stark-brand-sub">
                SDC // REC BANDA
              </span>
            </div>
          </Link>

          {/* ============================================================== */}
          {/* 2. CENTER: Core Navigation Links (Desktop Wide Screens)        */}
          {/* ============================================================== */}
          <nav aria-label="Main Navigation">
            <ul className="nav-center-links">
              {desktopNavItems.map((item) => {
                const isActive = isRouteActive(item.path);
                return (
                  <li key={item.label} className="nav-item">
                    <NavLink
                      to={item.path}
                      className={`nav-link-anchor ${isActive ? 'active' : ''}`}
                      onClick={() => setDrawerOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* ============================================================== */}
          {/* 3. RIGHT: Account CTA & Three-Line Hamburger Button           */}
          {/* ============================================================== */}
          <div className="nav-actions">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                {(isAdmin || isSuperAdmin) && (
                  <Link
                    to="/admin"
                    className="btn btn-secondary stark-cta-btn hidden-mobile"
                    style={{
                      background: 'rgba(143, 48, 53, 0.25)',
                      borderColor: 'var(--color-muted-crimson)',
                      color: '#ffb4b7',
                      fontSize: '0.78rem',
                      padding: '0.45rem 0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                    title={isSuperAdmin ? 'Super Admin Console' : 'Admin Console'}
                  >
                    <ShieldCheck size={14} color="#ffb4b7" />
                    <span>{isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN CONSOLE'}</span>
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="btn btn-primary stark-cta-btn"
                  style={{
                    padding: '0.48rem 0.95rem',
                    fontSize: '0.8rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                  title="Participant Dashboard"
                >
                  <LayoutDashboard size={15} />
                  <span>DASHBOARD</span>
                </Link>
              </div>
            ) : (
              <div className="nav-auth-actions">
                <Link
                  to="/login"
                  className="stark-login-link"
                >
                  LOG IN
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary stark-cta-btn"
                  style={{
                    padding: '0.48rem 1.05rem',
                    fontSize: '0.82rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <span>REGISTER</span>
                  <ArrowUpRight size={15} />
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
            <div className="stark-reactor-crest" aria-hidden="true" style={{ width: 28, height: 28 }}>
              <svg viewBox="0 0 44 44" width="28" height="28">
                <polygon
                  points="22,2 40,12 40,32 22,42 4,32 4,12"
                  fill="#0D111A"
                  stroke="#00BFFF"
                  strokeWidth="1.6"
                />
                <circle cx="22" cy="22" r="4.5" fill="#00BFFF" />
              </svg>
            </div>
            <div>
              <div className="drawer-header-title">HACKFEST 3.0</div>
              <div className="drawer-header-sub">NAVIGATION DIRECTORY</div>
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

        {/* Telemetry Status Strip */}
        <div className="drawer-telemetry">
          <div className="drawer-telemetry-badge">
            <span className="drawer-pulse-dot" />
            <span>PORTAL LIVE • ALL SYSTEMS NOMINAL</span>
          </div>
          <span className="drawer-campus-tag">REC BANDA</span>
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

              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: '0.2rem' }}>
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

          {/* Section 1: Main Pages */}
          <div className="drawer-section-group">
            <div className="drawer-section-title">
              <span>// MAIN SECTIONS</span>
              <span style={{ fontSize: '0.62rem', opacity: 0.6 }}>PRIMARY</span>
            </div>
            {mainPages.map((item) => (
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
                <span className="drawer-link-tag">{item.tag}</span>
              </button>
            ))}
          </div>

          {/* Section 2: Event Information */}
          <div className="drawer-section-group">
            <div className="drawer-section-title">
              <span>// EVENT INFORMATION</span>
              <span style={{ fontSize: '0.62rem', opacity: 0.6 }}>LOGISTICS</span>
            </div>
            {eventInfoPages.map((item) => (
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
                <span className="drawer-link-tag">{item.tag}</span>
              </button>
            ))}
          </div>

          {/* Section 3: Community */}
          <div className="drawer-section-group">
            <div className="drawer-section-title">
              <span>// COMMUNITY & CHAPTER</span>
              <span style={{ fontSize: '0.62rem', opacity: 0.6 }}>FACULTY & ROSTER</span>
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
                <span className="drawer-link-tag">{item.tag}</span>
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
                <span style={{ fontSize: '0.62rem', color: 'var(--color-stark-gold)' }}>
                  {isSuperAdmin ? 'SUPER ADMIN' : 'AUTHORIZED'}
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
                  <span className="drawer-link-tag" style={{ borderColor: 'rgba(230, 36, 41, 0.3)', color: '#ffb4b7' }}>
                    {item.tag}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Section 5: Judge Portal (Strictly Role-Protected) */}
          {isJudge && !isAdmin && (
            <div className="drawer-section-group">
              <div className="drawer-section-title">
                <span>// JUDGE CONSOLE</span>
                <span style={{ fontSize: '0.62rem', opacity: 0.6 }}>EVALUATION</span>
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
                <span className="drawer-link-tag">JUDGING</span>
              </button>
            </div>
          )}

          {/* Section 6: Guest Account Actions (If Not Logged In) */}
          {!user && (
            <div className="drawer-section-group" style={{ marginTop: '0.5rem' }}>
              <div className="drawer-section-title">
                <span>// PARTICIPANT ACCESS</span>
                <span style={{ fontSize: '0.62rem', opacity: 0.6 }}>CLEARANCE</span>
              </div>
              <div className="drawer-auth-actions">
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
                  <span>REGISTER FOR HACKFEST</span>
                  <ArrowUpRight size={16} />
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
                  <span>LOG IN TO ACCOUNT</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
