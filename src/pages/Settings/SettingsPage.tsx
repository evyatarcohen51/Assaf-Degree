import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useSettings } from '../../hooks/useSettings';
import { useAllSemesters, useYears } from '../../hooks/useTreeData';
import { r } from '../../lib/routes';
import { USE_SOFT_DESIGN } from '../../lib/design';
import { YearsManager } from './YearsManager';
import { SubjectsSection } from './SubjectsSection';
import { WeeklyScheduleSection } from './WeeklyScheduleSection';
import { GmailSection } from './GmailSection';

export function SettingsPage() {
  const { user } = useAuth();
  const settings = useSettings();
  const navigate = useNavigate();
  const years = useYears();
  const semesters = useAllSemesters();

  const [institutionName, setInstitutionName] = useState('');
  const [busy, setBusy] = useState(false);
  const [activeSemesterId, setActiveSemesterId] = useState<string>('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmed, setResetConfirmed] = useState(false);
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) setInstitutionName(settings.institution_name);
  }, [settings?.institution_name]);

  // Default active semester to current_semester_id from settings, or first available
  useEffect(() => {
    if (activeSemesterId) return;
    if (settings?.current_semester_id) {
      setActiveSemesterId(settings.current_semester_id);
    } else if (semesters.length > 0) {
      setActiveSemesterId(semesters[0].id);
    }
  }, [settings?.current_semester_id, semesters, activeSemesterId]);

  // If the active semester gets deleted, fall back
  useEffect(() => {
    if (activeSemesterId && !semesters.some((s) => s.id === activeSemesterId)) {
      setActiveSemesterId(semesters[0]?.id ?? '');
    }
  }, [semesters, activeSemesterId]);

  const activeSemester = semesters.find((s) => s.id === activeSemesterId);

  async function handleSave() {
    if (!user) return;
    setBusy(true);
    try {
      const hasMinimal = institutionName.trim() && years.length > 0 && semesters.length > 0;
      const { error } = await supabase
        .from('settings')
        .update({
          institution_name: institutionName,
          current_semester_id: activeSemesterId || settings?.current_semester_id || null,
          current_year_id: activeSemester?.year_id ?? settings?.current_year_id ?? null,
          bootstrapped: hasMinimal,
        })
        .eq('user_id', user.id);
      if (error) {
        alert(`שמירה נכשלה: ${error.message}`);
        return;
      }
      if (hasMinimal) navigate(r.home());
    } finally {
      setBusy(false);
    }
  }

  async function handleResetData() {
    if (!user) return;
    await supabase.from('years').delete().eq('user_id', user.id);
    await supabase
      .from('settings')
      .update({
        institution_name: '',
        current_year_id: null,
        current_semester_id: null,
        bootstrapped: false,
      })
      .eq('user_id', user.id);
    location.reload();
  }

  function openResetModal() {
    setResetConfirmed(false);
    setShowResetModal(true);
  }

  function closeResetModal() {
    setShowResetModal(false);
    setResetConfirmed(false);
  }

  const isFirstRun = !settings?.bootstrapped;
  const yearLabelOf = (yearId: string) => years.find((y) => y.id === yearId)?.label ?? '';

  if (USE_SOFT_DESIGN) {
    return (
      <div className="flex flex-col gap-7">
        <header className="card-soft-hero flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-4xl font-display font-black text-soft-text">הגדרות</h1>
          {isFirstRun && (
            <div className="mt-4 rounded-soft-md bg-soft-card text-soft-text px-4 py-3 font-medium shadow-soft-pill">
              בוא נגדיר את האפליקציה — מלא את הפרטים כדי להתחיל. צריך לפחות שנה אחת + סמסטר אחד + שם מוסד.
            </div>
          )}
        </header>

        <section className="card-soft">
          <h2 className="text-xl font-bold text-soft-text mb-4">מוסד הלימודים</h2>
          <label className="block">
            <span className="block text-sm text-soft-muted mb-2">שם המוסד</span>
            <input
              className="field-soft"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder='לדוגמה: מכינה הקדם-אקדמית של אונ׳ ת"א'
            />
          </label>
        </section>

        <YearsManager />

        {semesters.length > 0 && (
          <section className="card-soft">
            <h2 className="text-xl font-bold text-soft-text mb-4">סמסטר לעריכה</h2>
            <p className="text-sm text-soft-muted mb-3">
              בחר את הסמסטר שאתה רוצה לערוך כעת. קורסים ושיעורים נשמרים מיידית.
            </p>
            <select
              className="field-soft"
              value={activeSemesterId}
              onChange={(e) => setActiveSemesterId(e.target.value)}
            >
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {yearLabelOf(s.year_id)} · {s.label}
                </option>
              ))}
            </select>
          </section>
        )}

        {activeSemester && (
          <>
            <SubjectsSection semesterId={activeSemester.id} />
            <WeeklyScheduleSection semesterId={activeSemester.id} />
          </>
        )}

        <GmailSection />

        <div className="flex flex-wrap gap-3 justify-between items-center">
          <button type="button" className="btn-soft-primary" onClick={handleSave} disabled={busy}>
            {busy ? '...' : 'שמור והמשך'}
          </button>
          {!isFirstRun && (
            <button
              type="button"
              className="btn-soft-danger"
              onClick={openResetModal}
            >
              אפס הכל
            </button>
          )}
        </div>

        {showResetModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-soft-text/40 p-4"
            onClick={(e) => { if (e.target === e.currentTarget) closeResetModal(); }}
          >
            <div className="card-soft max-w-sm w-full flex flex-col gap-4">
              <h3 className="text-xl font-bold text-soft-text">אפס את כל הנתונים</h3>
              <p className="text-sm text-soft-muted">
                פעולה זו תמחק את כל השנים, הסמסטרים, הקורסים, השיעורים וכל שאר הנתונים.
                <strong className="block mt-1 text-soft-text">לא ניתן לשחזר.</strong>
              </p>
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  ref={checkboxRef}
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 cursor-pointer"
                  checked={resetConfirmed}
                  onChange={(e) => setResetConfirmed(e.target.checked)}
                />
                <span className="text-sm text-soft-text">אני בטוח/ה שאני מוחק/ת את כל הנתונים לתמיד</span>
              </label>
              <div className="flex gap-3 justify-end">
                <button type="button" className="btn-soft" onClick={closeResetModal}>
                  ביטול
                </button>
                <button
                  type="button"
                  className="btn-soft-danger"
                  disabled={!resetConfirmed}
                  onClick={() => { closeResetModal(); handleResetData(); }}
                >
                  אשר מחיקה
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="card">
        <h1 className="text-3xl">הגדרות</h1>
        {isFirstRun && (
          <div className="mt-3 rounded-xl border-2 border-ink bg-yellow p-3 font-bold">
            בוא נגדיר את האפליקציה — מלא את הפרטים כדי להתחיל. צריך לפחות שנה אחת + סמסטר אחד + שם מוסד.
          </div>
        )}
      </header>

      <section className="card">
        <h2 className="text-xl mb-3">מוסד הלימודים</h2>
        <label className="block">
          <span className="block text-sm mb-1">שם המוסד</span>
          <input
            className="field"
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value)}
            placeholder='לדוגמה: מכינה הקדם-אקדמית של אונ׳ ת"א'
          />
        </label>
      </section>

      <YearsManager />

      {semesters.length > 0 && (
        <section className="card">
          <h2 className="text-xl mb-3">סמסטר לעריכה</h2>
          <p className="text-sm text-ink/60 mb-2">
            בחר את הסמסטר שאתה רוצה לערוך כעת. קורסים ושיעורים נשמרים מיידית.
          </p>
          <select
            className="field"
            value={activeSemesterId}
            onChange={(e) => setActiveSemesterId(e.target.value)}
          >
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {yearLabelOf(s.year_id)} · {s.label}
              </option>
            ))}
          </select>
        </section>
      )}

      {activeSemester && (
        <>
          <SubjectsSection semesterId={activeSemester.id} />
          <WeeklyScheduleSection semesterId={activeSemester.id} />
        </>
      )}

      <GmailSection />

      <div className="flex flex-wrap gap-3 justify-between items-center">
        <button type="button" className="btn" onClick={handleSave} disabled={busy}>
          {busy ? '...' : 'שמור והמשך'}
        </button>
        {!isFirstRun && (
          <button
            type="button"
            className="btn-danger"
            onClick={openResetModal}
          >
            אפס הכל
          </button>
        )}
      </div>

      {showResetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40"
          onClick={(e) => { if (e.target === e.currentTarget) closeResetModal(); }}
        >
          <div className="bg-paper rounded-2xl border-2 border-ink shadow-xl p-6 max-w-sm w-full mx-4 flex flex-col gap-4">
            <h3 className="text-xl font-bold text-red-600">אפס את כל הנתונים</h3>
            <p className="text-sm text-ink/80">
              פעולה זו תמחק את כל השנים, הסמסטרים, הקורסים, השיעורים וכל שאר הנתונים.
              <strong className="block mt-1">לא ניתן לשחזר.</strong>
            </p>
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                ref={checkboxRef}
                type="checkbox"
                className="mt-0.5 w-4 h-4 accent-red-600 cursor-pointer"
                checked={resetConfirmed}
                onChange={(e) => setResetConfirmed(e.target.checked)}
              />
              <span className="text-sm">אני בטוח/ה שאני מוחק/ת את כל הנתונים לתמיד</span>
            </label>
            <div className="flex gap-3 justify-end">
              <button type="button" className="btn-secondary" onClick={closeResetModal}>
                ביטול
              </button>
              <button
                type="button"
                className="btn-danger-filled"
                disabled={!resetConfirmed}
                onClick={() => { closeResetModal(); handleResetData(); }}
              >
                אשר מחיקה
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
