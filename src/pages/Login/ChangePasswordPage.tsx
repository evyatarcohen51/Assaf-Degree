import { useState } from 'react';
import { updatePassword } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { USE_SOFT_DESIGN } from '../../lib/design';

export function ChangePasswordPage({ mandatory }: { mandatory?: boolean }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pw1.length < 8) {
      setError('סיסמה חייבת להיות לפחות 8 תווים');
      return;
    }
    if (pw1 !== pw2) {
      setError('הסיסמאות לא תואמות');
      return;
    }
    setBusy(true);
    try {
      await updatePassword(pw1);
      if (user && mandatory) {
        await supabase.from('settings').update({ must_change_password: false }).eq('user_id', user.id);
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'עדכון נכשל');
    } finally {
      setBusy(false);
    }
  }

  if (USE_SOFT_DESIGN) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <header className="text-center mb-6 rounded-soft bg-soft-mustard text-soft-text px-6 py-5 shadow-soft-lg">
            <h1 className="font-display text-3xl font-black tracking-tight text-soft-text">Got Schooled</h1>
          </header>

          <form onSubmit={handleSubmit} className="card-soft flex flex-col gap-4">
            <h2 className="text-xl font-bold text-soft-text">{mandatory ? 'הגדרת סיסמה ראשונית' : 'החלפת סיסמה'}</h2>
            {mandatory && (
              <p className="text-sm text-soft-muted">
                זו הכניסה הראשונה שלך — הגדר סיסמה חדשה לפני שתמשיך.
              </p>
            )}

            <label className="block">
              <span className="block text-sm text-soft-muted mb-2">סיסמה חדשה</span>
              <input
                className="field-soft"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={pw1}
                onChange={(e) => setPw1(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="block text-sm text-soft-muted mb-2">אימות סיסמה</span>
              <input
                className="field-soft"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
              />
            </label>

            {error && (
              <div className="rounded-soft-md bg-soft-rose/40 px-4 py-2 text-sm text-soft-text shadow-soft-pill">
                {error}
              </div>
            )}

            <button type="submit" className="btn-soft-primary" disabled={busy}>
              {busy ? '...' : 'שמור'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <header className="text-center mb-6">
          <h1 className="font-display text-3xl font-black tracking-tight">Got Schooled</h1>
        </header>

        <form onSubmit={handleSubmit} className="card flex flex-col gap-3">
          <h2 className="text-xl">{mandatory ? 'הגדרת סיסמה ראשונית' : 'החלפת סיסמה'}</h2>
          {mandatory && (
            <p className="text-sm text-ink/70">
              זו הכניסה הראשונה שלך — הגדר סיסמה חדשה לפני שתמשיך.
            </p>
          )}

          <label className="block">
            <span className="block text-sm mb-1">סיסמה חדשה</span>
            <input
              className="field"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={pw1}
              onChange={(e) => setPw1(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="block text-sm mb-1">אימות סיסמה</span>
            <input
              className="field"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
            />
          </label>

          {error && (
            <div className="rounded-xl border-2 border-red bg-red/10 p-2 text-sm text-red">
              {error}
            </div>
          )}

          <button type="submit" className="btn" disabled={busy}>
            {busy ? '...' : 'שמור'}
          </button>
        </form>
      </div>
    </div>
  );
}
