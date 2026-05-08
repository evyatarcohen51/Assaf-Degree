import { useEffect, useState } from 'react';

const LS_KEY = 'dark-mode';

function getInitial(): boolean {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

export function useDarkMode() {
  const [dark, setDark] = useState(getInitial);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem(LS_KEY, String(dark)); } catch { /* ignore */ }
  }, [dark]);

  return [dark, setDark] as const;
}
