import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSettings } from './useSettings';
import { useAuth } from '../lib/auth';

export function useFirstRunGuard() {
  const settings = useSettings();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    if (settings === undefined) return;

    if (settings?.must_change_password && location.pathname !== '/change-password') {
      navigate('/change-password', { replace: true });
      return;
    }

    if (
      settings &&
      !settings.must_change_password &&
      !settings.bootstrapped &&
      location.pathname !== '/settings'
    ) {
      navigate('/settings', { replace: true });
    }
  }, [
    settings,
    settings?.must_change_password,
    settings?.bootstrapped,
    user,
    loading,
    location.pathname,
    navigate,
  ]);
}
