import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useSettings } from '../../hooks/useSettings';

type Status =
  | { kind: 'idle' }
  | { kind: 'busy' }
  | { kind: 'ok'; message: string }
  | { kind: 'err'; message: string };

export function GmailSection() {
  const { user } = useAuth();
  const settings = useSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  // Hydrate the email field from saved settings (the password field stays empty
  // for security — the user re-enters it only when changing credentials).
  useEffect(() => {
    if (settings?.gmail_user) setEmail(settings.gmail_user);
  }, [settings?.gmail_user]);

  const isConfigured = !!settings?.gmail_user && !!settings?.gmail_app_password;

  async function handleSaveAndTest() {
    if (!user) return;
    if (!email.trim() || !password.trim()) {
      setStatus({ kind: 'err', message: 'נא להזין כתובת Gmail וסיסמה' });
      return;
    }
    setStatus({ kind: 'busy' });
    try {
      const res = await fetch('/api/test-gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setStatus({ kind: 'err', message: body.error ?? 'אימות נכשל' });
        return;
      }
      const { error } = await supabase
        .from('settings')
        .update({ gmail_user: email.trim(), gmail_app_password: password.trim() })
        .eq('user_id', user.id);
      if (error) {
        setStatus({ kind: 'err', message: `שמירה נכשלה: ${error.message}` });
        return;
      }
      setPassword('');
      setStatus({ kind: 'ok', message: 'החיבור תקין ונשמר' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus({ kind: 'err', message: msg });
    }
  }

  async function handleClear() {
    if (!user) return;
    setStatus({ kind: 'busy' });
    const { error } = await supabase
      .from('settings')
      .update({ gmail_user: null, gmail_app_password: null })
      .eq('user_id', user.id);
    if (error) {
      setStatus({ kind: 'err', message: `מחיקה נכשלה: ${error.message}` });
      return;
    }
    setEmail('');
    setPassword('');
    setStatus({ kind: 'idle' });
  }

  return (
    <section className="card">
      <h2 className="text-xl mb-1">הגדרת Gmail</h2>
      <p className="text-sm text-ink/60 mb-3">
        תזכורות שלך יישלחו דרך חשבון ה-Gmail שלך.
        {' '}
        <a
          href="https://myaccount.google.com/apppasswords"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          צור App Password ב-Google Account → Security
        </a>
        {' '}(נדרש 2-Step Verification פעיל).
      </p>

      <div className="flex flex-col gap-3">
        <label className="block">
          <span className="block text-sm mb-1">כתובת Gmail</span>
          <input
            type="email"
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your-name@gmail.com"
            dir="ltr"
            autoComplete="email"
          />
        </label>
        <label className="block">
          <span className="block text-sm mb-1">סיסמת אפליקציה (Gmail App Password)</span>
          <input
            type="password"
            className="field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isConfigured ? '•••• •••• •••• •••• (הזן מחדש כדי לעדכן)' : 'xxxx xxxx xxxx xxxx'}
            dir="ltr"
            autoComplete="off"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn"
            onClick={handleSaveAndTest}
            disabled={status.kind === 'busy'}
          >
            {status.kind === 'busy' ? '...' : 'שמור ובדוק'}
          </button>

          {isConfigured && (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClear}
              disabled={status.kind === 'busy'}
            >
              מחק
            </button>
          )}

          {status.kind === 'ok' && (
            <span className="inline-flex items-center gap-1 text-green font-bold">
              <span aria-hidden>✓</span> {status.message}
            </span>
          )}
          {status.kind === 'err' && (
            <span className="inline-flex items-center gap-1 text-red font-bold">
              <span aria-hidden>✗</span> {status.message}
            </span>
          )}
          {status.kind === 'idle' && isConfigured && (
            <span className="inline-flex items-center gap-1 text-green font-bold">
              <span aria-hidden>✓</span> Gmail מוגדר
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
