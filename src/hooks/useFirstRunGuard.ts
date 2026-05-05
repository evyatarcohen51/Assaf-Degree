import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSettings } from './useSettings';

export function useFirstRunGuard() {
  const settings = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (settings === undefined) return; // still loading
    if (!settings || !settings.bootstrapped) {
      if (location.pathname !== '/settings') {
        navigate('/settings', { replace: true });
      }
    }
  }, [settings, location.pathname, navigate]);
}
