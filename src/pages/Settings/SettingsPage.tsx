import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useSettings } from '../../hooks/useSettings';
import { useAllSemesters, useYears } from '../../hooks/useTreeData';
import { r } from '../../lib/routes';
import { YearsManager } from './YearsManager';
import { SubjectsSection } from './SubjectsSection';
import { WeeklyScheduleSection } from './WeeklyScheduleSection';

export function SettingsPage() {
  const { user } = useAuth();
  const settings = useSettings();
  const navigate = useNavigate();
  const years = useYears();
  const semesters = useAllSemesters();

  const [institutionName, setInstitutionName] = useState('');
  const [busy, setBusy] = useState(false);
  const [activeSemesterId, setActiveSemesterId] = useState<string>('');

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
    if (!confirm('למחוק את כל הנתונים? לא ניתן לשחזר.')) return;
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

  const isFirstRun = !settings?.bootstrapped;
  const yearLabelOf = (yearId: string) => years.find((y) => y.id === yearId)?.label ?? '';

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

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn" onClick={handleSave} disabled={busy}>
          {busy ? '...' : 'שמור והמשך'}
        </button>
        {!isFirstRun && (
          <button type="button" className="btn-secondary" onClick={handleResetData}>
            אפס הכל
          </button>
        )}
      </div>
    </div>
  );
}
