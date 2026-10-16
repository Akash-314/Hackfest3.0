import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './components/layout/PublicLayout';
import ScrollToTop from './components/ScrollToTop';
import CursorTrail from './components/cinematic/CursorTrail';
import Galaxy from './components/ui/Galaxy';
import ErrorBoundary from './components/ErrorBoundary';

// Existing Pages
import HomePage from './pages/HomePage';
import CompetitionDetailPage from './pages/CompetitionDetailPage';
import CompetitionsListPage from './pages/CompetitionsListPage';
import MissionsPage from './pages/MissionsPage';
import SchedulePage from './pages/SchedulePage';
import PrizesPage from './pages/PrizesPage';
import RulesFaqPage from './pages/RulesFaqPage';
import AboutPage from './pages/AboutPage';
import MentorsJudgesPage from './pages/MentorsJudgesPage';
import SponsorsPage from './pages/SponsorsPage';
import RegisterPage from './pages/RegisterPage';
import RegistrationAuthGuard from './components/RegistrationAuthGuard';
import LeaderboardPage from './pages/LeaderboardPage';

// Auth Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Participant Dashboard Pages
import DashboardOverviewPage from './pages/dashboard/DashboardOverviewPage';
import DashboardProfilePage from './pages/dashboard/DashboardProfilePage';
import DashboardTeamPage from './pages/dashboard/DashboardTeamPage';
import DashboardRegistrationPage from './pages/dashboard/DashboardRegistrationPage';
import DashboardSubmissionPage from './pages/dashboard/DashboardSubmissionPage';

// Judge Arena Pages
import JudgeDashboardPage from './pages/judge/JudgeDashboardPage';
import JudgeEvaluatePage from './pages/judge/JudgeEvaluatePage';

// Admin / Organizer Pages
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminParticipantsPage from './pages/admin/AdminParticipantsPage';
import AdminTeamsPage from './pages/admin/AdminTeamsPage';
import AdminRegistrationsPage from './pages/admin/AdminRegistrationsPage';
import AdminSubmissionsPage from './pages/admin/AdminSubmissionsPage';
import AdminJudgingPage from './pages/admin/AdminJudgingPage';
import AdminCmsPage from './pages/admin/AdminCmsPage';
import AdminSdcMembersPage from './pages/admin/AdminSdcMembersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAuditPage from './pages/admin/AdminAuditPage';
import SdcMembersPage from './pages/SdcMembersPage';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="site-wrapper">
            <CursorTrail />
            <div className="galaxy-background-layer" aria-hidden="true">
              <Galaxy
                starColors={['#81C14B', '#2E933C', '#204E4A', '#ECBA82']}
                transparent={false}
                backgroundColor="#080A09"
                opacity={0.32}
                density={0.7}
                glowIntensity={0.25}
                starSize={0.8}
                flareIntensity={0.25}
                twinkleIntensity={0.2}
                starSpeed={0.12}
                speed={0.6}
                rotationSpeed={0.015}
                layers={3}
                mouseInteraction={false}
                mouseRepulsion={false}
                clickWarp={false}
                intro={false}
                dpr={1}
              />
            </div>
            <Routes>
              <Route element={<PublicLayout />}>
                {/* Main Cinematic Landing Page (Hero Only) */}
                <Route path="/" element={<HomePage />} />

                {/* Dedicated Public Navigation Routes */}
                <Route path="/about" element={<AboutPage />} />
                <Route path="/competitions" element={<CompetitionsListPage />} />
                <Route path="/codeathon" element={<CompetitionDetailPage competitionId="codeathon" />} />
                <Route path="/ideathon" element={<CompetitionDetailPage competitionId="ideathon" />} />
                <Route path="/hackathon" element={<CompetitionDetailPage competitionId="hackathon" />} />

                <Route path="/missions" element={<MissionsPage />} />
                <Route path="/problems" element={<MissionsPage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/prizes" element={<PrizesPage />} />
                <Route path="/rules" element={<RulesFaqPage />} />
                <Route path="/faq" element={<RulesFaqPage />} />
                <Route path="/mentors" element={<MentorsJudgesPage />} />
                <Route path="/judges" element={<MentorsJudgesPage />} />
                <Route path="/sponsors" element={<SponsorsPage />} />
                <Route
                  path="/register"
                  element={
                    <RegistrationAuthGuard>
                      <RegisterPage />
                    </RegistrationAuthGuard>
                  }
                />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/sdc-members" element={<SdcMembersPage />} />
                <Route path="/members" element={<SdcMembersPage />} />

                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Participant Dashboard Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardOverviewPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/profile"
                  element={
                    <ProtectedRoute>
                      <DashboardProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/team"
                  element={
                    <ProtectedRoute>
                      <DashboardTeamPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/registration"
                  element={
                    <ProtectedRoute>
                      <DashboardRegistrationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/submission"
                  element={
                    <ProtectedRoute>
                      <DashboardSubmissionPage />
                    </ProtectedRoute>
                  }
                />

                {/* Judge Routes */}
                <Route
                  path="/judge"
                  element={
                    <ProtectedRoute allowedRoles={['judge', 'admin', 'organizer']}>
                      <JudgeDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/judge/submissions"
                  element={
                    <ProtectedRoute allowedRoles={['judge', 'admin', 'organizer']}>
                      <JudgeDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/judge/evaluate/:submissionId"
                  element={
                    <ProtectedRoute allowedRoles={['judge', 'admin', 'organizer']}>
                      <JudgeEvaluatePage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin / Organizer Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'organizer']}>
                      <AdminOverviewPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/participants"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'organizer']}>
                      <AdminParticipantsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/teams"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'organizer']}>
                      <AdminTeamsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/registrations"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'organizer']}>
                      <AdminRegistrationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/submissions"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'organizer']}>
                      <AdminSubmissionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/judging"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'organizer']}>
                      <AdminJudgingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/cms"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'organizer']}>
                      <AdminCmsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/sdc-members"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'organizer']}>
                      <AdminSdcMembersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/audit"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'organizer']}>
                      <AdminAuditPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<HomePage />} />
              </Route>
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
