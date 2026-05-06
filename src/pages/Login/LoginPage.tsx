import { useState } from 'react';
import { signIn, sendPasswordReset } from '../../lib/auth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'התחברות נכשלה');
    } finally {
      setBusy(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError('הזן מייל קודם');
      return;
    }
    setBusy(true);
    try {
      await sendPasswordReset(email.trim());
      setInfo('שלחנו קישור איפוס למייל שלך. בדוק את תיבת הדואר.');
      setShowForgot(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שליחה נכשלה');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <header className="text-center mb-6">
          <h1 className="font-display text-4xl font-black tracking-tight">Got Schooled</h1>
          <p className="text-ink/60 mt-1">ניהול לימודים אישי</p>
        </header>

        <form
          onSubmit={showForgot ? handleForgot : handleLogin}
          className="card flex flex-col gap-3"
        >
          <h2 className="text-xl">{showForgot ? 'שכחתי סיסמה' : 'התחברות'}</h2>

          <label className="block">
            <span className="block text-sm mb-1">מייל</span>
            <input
              className="field"
              type="email"
              autoComplete="email"
              required
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          {!showForgot && (
            <label className="block">
              <span className="block text-sm mb-1">סיסמה</span>
              <input
                className="field"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          )}

          {error && (
            <div className="rounded-xl border-2 border-red bg-red/10 p-2 text-sm text-red">
              {error}
            </div>
          )}
          {info && (
            <div className="rounded-xl border-2 border-green bg-green/10 p-2 text-sm">{info}</div>
          )}

          <button type="submit" className="btn" disabled={busy}>
            {busy ? '...' : showForgot ? 'שלח קישור איפוס' : 'התחבר'}
          </button>

          <button
            type="button"
            className="text-sm text-ink/60 underline mt-1"
            onClick={() => {
              setShowForgot((v) => !v);
              setError(null);
              setInfo(null);
            }}
          >
            {showForgot ? 'חזרה להתחברות' : 'שכחתי סיסמה'}
          </button>
        </form>
      </div>
    </div>
  );
}
