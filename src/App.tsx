import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { HomePage } from './pages/Home/HomePage';
import { SchedulePage } from './pages/Schedule/SchedulePage';
import { SubjectPage } from './pages/Subject/SubjectPage';
import { SubjectSchedulePage } from './pages/Subject/SubjectSchedulePage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { NotFoundPage } from './pages/NotFound';
import { LoginPage } from './pages/Login/LoginPage';
import { ChangePasswordPage } from './pages/Login/ChangePasswordPage';
import { GuardedRoutes } from './GuardedRoutes';
import { AuthProvider, useAuth } from './lib/auth';

function ResetPasswordRoute() {
  return <ChangePasswordPage />;
}

function AuthenticatedApp() {
  return (
    <Routes>
      <Route path="/change-password" element={<ChangePasswordPage mandatory />} />
      <Route path="/reset-password" element={<ResetPasswordRoute />} />
      <Route
        path="*"
        element={
          <AppShell>
            <GuardedRoutes>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/year/:yearId/semester/:semId/schedule" element={<SchedulePage />} />
                <Route
                  path="/year/:yearId/semester/:semId/subject/:subjectId"
                  element={<SubjectPage />}
                />
                <Route
                  path="/year/:yearId/semester/:semId/subject/:subjectId/schedule"
                  element={<SubjectSchedulePage />}
                />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </GuardedRoutes>
          </AppShell>
        }
      />
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
