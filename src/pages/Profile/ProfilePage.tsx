import { useEffect, useState } from 'react';
import { useProfile } from '../../hooks/useSettings';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { getSignedUrl } from '../../hooks/useFiles';
import { USE_SOFT_DESIGN } from '../../lib/design';

const PROFILE_BUCKET = 'user-files';

export function ProfilePage() {
  const { user } = useAuth();
  const profile = useProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [pictureUrl, setPictureUrl] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setEmail(profile.email);
    setBirthDate(profile.birth_date ?? '');
  }, [profile?.user_id, profile?.name, profile?.email, profile?.birth_date]);

  useEffect(() => {
    let cancelled = false;
    async function loadPicture() {
      if (!profile?.picture_path) {
        setPictureUrl(undefined);
        return;
      }
      try {
        const url = await getSignedUrl(profile.picture_path, 60 * 30);
        if (!cancelled) setPictureUrl(url);
      } catch {
        if (!cancelled) setPictureUrl(undefined);
      }
    }
    loadPicture();
    return () => {
      cancelled = true;
    };
  }, [profile?.picture_path]);

  async function handleSave() {
    if (!user) return;
    setBusy(true);
    try {
      await supabase
        .from('profile')
        .update({
          name,
          email,
          birth_date: birthDate || null,
        })
        .eq('user_id', user.id);
    } finally {
      setBusy(false);
    }
  }

  async function handlePicture(file: File | undefined) {
    if (!file || !user) return;
    setBusy(true);
    try {
      const path = `${user.id}/profile-${Date.now()}`;
      const { error: upErr } = await supabase.storage.from(PROFILE_BUCKET).upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (upErr) throw upErr;
      // Remove old picture if any
      if (profile?.picture_path) {
        await supabase.storage.from(PROFILE_BUCKET).remove([profile.picture_path]);
      }
      await supabase
        .from('profile')
        .update({ picture_path: path, picture_mime: file.type })
        .eq('user_id', user.id);
    } finally {
      setBusy(false);
    }
  }

  if (USE_SOFT_DESIGN) {
    return (
      <div className="flex flex-col gap-7">
        <header className="card-soft-hero flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-4xl font-display font-black text-soft-text">פרופיל</h1>
        </header>

        <section className="card-soft">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex flex-col items-center gap-3">
              <div className="h-32 w-32 rounded-full bg-soft-cream shadow-soft overflow-hidden flex items-center justify-center">
                {pictureUrl ? (
                  <img src={pictureUrl} alt="תמונת פרופיל" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-soft-muted text-sm">אין תמונה</span>
                )}
              </div>
              <label className="btn-soft text-sm cursor-pointer">
                {busy ? '...' : 'העלה תמונה'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePicture(e.target.files?.[0])}
                />
              </label>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <label className="block">
                <span className="block text-sm text-soft-muted mb-2">שם</span>
                <input className="field-soft" value={name} onChange={(e) => setName(e.target.value)} dir="auto" />
              </label>
              <label className="block">
                <span className="block text-sm text-soft-muted mb-2">מייל</span>
                <input
                  className="field-soft"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="auto"
                />
              </label>
              <label className="block">
                <span className="block text-sm text-soft-muted mb-2">תאריך לידה</span>
                <input
                  className="field-soft"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </label>
              <div>
                <button type="button" className="btn-soft-primary" onClick={handleSave} disabled={busy}>
                  {busy ? '...' : 'שמור'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="card bg-orange">
        <h1 className="text-3xl">פרופיל</h1>
      </header>

      <section className="card">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex flex-col items-center gap-2">
            <div className="h-32 w-32 rounded-full border-2 border-ink bg-paper overflow-hidden flex items-center justify-center">
              {pictureUrl ? (
                <img src={pictureUrl} alt="תמונת פרופיל" className="h-full w-full object-cover" />
              ) : (
                <span className="text-ink/40 text-sm">אין תמונה</span>
              )}
            </div>
            <label className="btn-secondary text-sm cursor-pointer">
              {busy ? '...' : 'העלה תמונה'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePicture(e.target.files?.[0])}
              />
            </label>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <label className="block">
              <span className="block text-sm mb-1">שם</span>
              <input className="field" value={name} onChange={(e) => setName(e.target.value)} dir="auto" />
            </label>
            <label className="block">
              <span className="block text-sm mb-1">מייל</span>
              <input
                className="field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="auto"
              />
            </label>
            <label className="block">
              <span className="block text-sm mb-1">תאריך לידה</span>
              <input
                className="field"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </label>
            <div>
              <button type="button" className="btn" onClick={handleSave} disabled={busy}>
                {busy ? '...' : 'שמור'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
