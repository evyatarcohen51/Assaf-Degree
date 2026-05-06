import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useSettings } from '../../hooks/useSettings';
import { useYears, useSemestersByYear } from '../../hooks/useTreeData';
import { newId } from '../../lib/ids';
import { r } from '../../lib/routes';
import { SubjectsSection } from './SubjectsSection';
import { WeeklyScheduleSection } from './WeeklyScheduleSection';

export function SettingsPage() {
  const { user } = useAuth();
  const settings = useSettings();
  const navigate = useNavigate();

  const years = useYears();
  const currentYear = years[0];
  const semesters = useSemestersByYear(currentYear?.id);
  const currentSemester = semesters[0];

  const [institutionName, setInstitutionName] = useState('');
  const [yearLabel, setYearLabel] = useState('');
  const [semLabel, setSemLabel] = useState('');
  const [semStart, setSemStart] = useState('');
  const [semEnd, setSemEnd] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (settings) setInstitutionName(settings.institution_name);
  }, [settings?.institution_name]);
  useEffect(() => {
    if (currentYear) setYearLabel(currentYear.label);
  }, [currentYear?.id, currentYear?.label]);
  useEffect(() => {
    if (currentSemester) {
      setSemLabel(currentSemester.label);
      setSemStart(currentSemester.start_date ?? '');
      setSemEnd(currentSemester.end_date ?? '');
    }
  }, [
    currentSemester?.id,
    currentSemester?.label,
    currentSemester?.start_date,
    currentSemester?.end_date,
  ]);

  async function handleSave() {
    if (!user) return;
    setBusy(true);
    try {
      let yearId = currentYear?.id;
      if (!yearId) {
        yearId = newId();
        const { error } = await supabase
          .from('years')
          .insert({ id: yearId, user_id: user.id, label: yearLabel || 'תשפ"ו', order: 0 });
        if (error) throw error;
      } else {
        await supabase
          .from('years')
          .update({ label: yearLabel })
          .eq('user_id', user.id)
          .eq('id', yearId);
      }

      let semId = currentSemester?.id;
      if (!semId) {
        semId = newId();
        const { error } = await supabase.from('semesters').insert({
          id: semId,
          user_id: user.id,
          year_id: yearId,
          label: semLabel || "סמסטר א'",
          start_date: semStart || null,
          end_date: semEnd || null,
        });
        if (error) throw error;
      } else {
        await supabase
          .from('semesters')
          .update({
            label: semLabel,
            start_date: semStart || null,
            end_date: semEnd || null,
          })
          .eq('user_id', user.id)
          .eq('id', semId);
      }

      const { error } = await supabase
        .from('settings')
        .update({
          institution_name: institutionName,
          current_year_id: yearId,
          current_semester_id: semId,
          bootstrapped: true,
        })
        .eq('user_id', user.id);
      if (error) throw error;

      navigate(r.home());
    } finally {
      setBusy(false);
    }
  }

  async function handleResetData() {
    if (!user) return;
    if (!confirm('למחוק את כל הנתונים? לא ניתן לשחזר.')) return;
    // Delete cascades from years → semesters → subjects → everything else.
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

  return (
    <div className="flex flex-col gap-6">
      <header className="card">
        <h1 className="text-3xl">הגדרות</h1>
        {isFirstRun && (
          <div className="mt-3 rounded-xl border-2 border-ink bg-yellow p-3 font-bold">
            בוא נגדיר את האפליקציה — מלא את הפרטים כדי להתחיל
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

      <section className="card">
        <h2 className="text-xl mb-3">שנת לימודים נוכחית</h2>
        <label className="block mb-3">
          <span className="block text-sm mb-1">שנה (לדוגמה: תשפ״ו)</span>
          <input
            className="field"
            value={yearLabel}
            onChange={(e) => setYearLabel(e.target.value)}
            placeholder="תשפ&quot;ו"
          />
        </label>
        <label className="block mb-3">
          <span className="block text-sm mb-1">סמסטר</span>
          <input
            className="field"
            value={semLabel}
            onChange={(e) => setSemLabel(e.target.value)}
            placeholder="סמסטר א'"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-sm mb-1">תאריך התחלה</span>
            <input
              type="date"
              className="field"
              value={semStart}
              onChange={(e) => setSemStart(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="block text-sm mb-1">תאריך סיום</span>
            <input
              type="date"
              className="field"
              value={semEnd}
              onChange={(e) => setSemEnd(e.target.value)}
            />
          </label>
        </div>
      </section>

      {currentSemester && (
        <>
          <SubjectsSection semesterId={currentSemester.id} />
          <WeeklyScheduleSection semesterId={currentSemester.id} />
        </>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn" onClick={handleSave} disabled={busy}>
          {busy ? '...' : 'שמור'}
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
