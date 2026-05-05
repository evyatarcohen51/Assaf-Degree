import { useEffect, useState } from 'react';
import { useProfile } from '../../hooks/useSettings';
import { db } from '../../db';
import { blobToObjectURL } from '../../lib/files';

export function ProfilePage() {
  const profile = useProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [pictureUrl, setPictureUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setEmail(profile.email);
    setBirthDate(profile.birthDate);
  }, [profile?.id, profile?.name, profile?.email, profile?.birthDate]);

  useEffect(() => {
    if (profile?.pictureBlob) {
      const url = blobToObjectURL(profile.pictureBlob);
      setPictureUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPictureUrl(undefined);
  }, [profile?.pictureBlob]);

  async function handleSave() {
    await db.profile.put({
      id: 'me',
      name,
      email,
      birthDate,
      pictureBlob: profile?.pictureBlob,
      pictureMime: profile?.pictureMime,
    });
  }

  async function handlePicture(file: File | undefined) {
    if (!file) return;
    await db.profile.update('me', { pictureBlob: file, pictureMime: file.type });
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
              העלה תמונה
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
              <button type="button" className="btn" onClick={handleSave}>
                שמור
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
