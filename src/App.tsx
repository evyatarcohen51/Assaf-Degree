import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { HomePage } from './pages/Home/HomePage';
import { SchedulePage } from './pages/Schedule/SchedulePage';
import { SubjectPage } from './pages/Subject/SubjectPage';
import { SubjectSchedulePage } from './pages/Subject/SubjectSchedulePage';
import { TopicPage } from './pages/Subject/TopicPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { CreditsPage } from './pages/Credits/CreditsPage';
import { NotFoundPage } from './pages/NotFound';
import { LoginPage } from './pages/Login/LoginPage';
import { ChangePasswordPage } from './pages/Login/ChangePasswordPage';
import { useFirstRunGuard } from './hooks/useFirstRunGuard';
import { AuthProvider, useAuth } from './lib/auth';

function GuardedShell() {
  useFirstRunGuard();
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function AuthenticatedApp() {
  return (
    <Routes>
      <Route path="/change-password" element={<ChangePasswordPage mandatory />} />
      <Route path="/reset-password" element={<ChangePasswordPage />} />
      <Route element={<GuardedShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/year/:yearId/semester/:semId/schedule" element={<SchedulePage />} />
        <Route
          path="/year/:yearId/semester/:semId/subject/:subjectId"
          element={<SubjectPage />}
        />
        <Route
          path="/year/:yearId/semester/:semId/subject/:subjectId/topic/:topicId"
          element={<TopicPage />}
        />
        <Route
          path="/year/:yearId/semester/:semId/subject/:subjectId/schedule"
          element={<SubjectSchedulePage />}
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/credits" element={<CreditsPage />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

function Gate() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-display uppercase tracking-widest text-ink/60">טוען...</p>
      </div>
    );
  }
  if (!user) {
    return (
      <Routes>
        <Route path="/reset-password" element={<ChangePasswordPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }
  return <AuthenticatedApp />;
}

export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </HashRouter>
  );
}
