import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useSettings } from '../../hooks/useSettings';
import { USE_SOFT_DESIGN } from '../../lib/design';

const T = USE_SOFT_DESIGN
  ? {
      card: 'card-soft',
      title: 'text-xl font-bold text-soft-text mb-1',
      desc: 'text-sm text-soft-muted mb-4',
      labelText: 'block text-sm text-soft-muted mb-2',
      field: 'field-soft',
      btnPrimary: 'btn-soft-primary',
      btnSec: 'btn-soft',
      okText: 'inline-flex items-center gap-1 text-green font-medium',
      errText: 'inline-flex items-center gap-1 text-red font-medium',
    }
  : {
      card: 'card',
      title: 'text-xl mb-1',
      desc: 'text-sm text-ink/60 mb-3',
      labelText: 'block text-sm mb-1',
      field: 'field',
      btnPrimary: 'btn',
      btnSec: 'btn-secondary',
      okText: 'inline-flex items-center gap-1 text-green font-bold',
      errText: 'inline-flex items-center gap-1 text-red font-bold',
    };

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
    <section className={T.card}>
      <h2 className={T.title}>הגדרת Gmail</h2>
      <p className={T.desc}>
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
          <span className={T.labelText}>כתובת Gmail</span>
          <input
            type="email"
            className={T.field}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your-name@gmail.com"
            dir="ltr"
            autoComplete="email"
          />
        </label>
        <label className="block">
          <span className={T.labelText}>סיסמת אפליקציה (Gmail App Password)</span>
          <input
            type="password"
            className={T.field}
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
            className={T.btnPrimary}
            onClick={handleSaveAndTest}
            disabled={status.kind === 'busy'}
          >
            {status.kind === 'busy' ? '...' : 'שמור ובדוק'}
          </button>

          {isConfigured && (
            <button
              type="button"
              className={T.btnSec}
              onClick={handleClear}
              disabled={status.kind === 'busy'}
            >
              מחק
            </button>
          )}

          {status.kind === 'ok' && (
            <span className={T.okText}>
              <span aria-hidden>✓</span> {status.message}
            </span>
          )}
          {status.kind === 'err' && (
            <span className={T.errText}>
              <span aria-hidden>✗</span> {status.message}
            </span>
          )}
          {status.kind === 'idle' && isConfigured && (
            <span className={T.okText}>
              <span aria-hidden>✓</span> Gmail מוגדר
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
