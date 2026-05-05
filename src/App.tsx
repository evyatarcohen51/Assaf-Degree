import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { HomePage } from './pages/Home/HomePage';
import { SchedulePage } from './pages/Schedule/SchedulePage';
import { SubjectPage } from './pages/Subject/SubjectPage';
import { SubjectSchedulePage } from './pages/Subject/SubjectSchedulePage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { NotFoundPage } from './pages/NotFound';
import { GuardedRoutes } from './GuardedRoutes';

export function App() {
  return (
    <HashRouter>
      <AppShell>
        <GuardedRoutes>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/year/:yearId/semester/:semId/schedule" element={<SchedulePage />} />
            <Route path="/year/:yearId/semester/:semId/subject/:subjectId" element={<SubjectPage />} />
            <Route
              path="/year/:yearId/semester/:semId/subject/:subjectId/schedule"
              element={<SubjectSchedulePage />}
            />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </GuardedRoutes>
      </AppShell>
    </HashRouter>
  );
}
