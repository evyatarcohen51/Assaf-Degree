import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { useSettings } from '../../hooks/useSettings';
import { newId } from '../../lib/ids';
import { r } from '../../lib/routes';
import { SubjectsSection } from './SubjectsSection';
import { WeeklyScheduleSection } from './WeeklyScheduleSection';

export function SettingsPage() {
  const settings = useSettings();
  const navigate = useNavigate();

  const years = useLiveQuery(() => db.years.orderBy('order').toArray(), []) ?? [];
  const currentYear = years[0]; // single-track app: one active year at a time
  const semesters = useLiveQuery(
    () => (currentYear ? db.semesters.where('yearId').equals(currentYear.id).toArray() : []),
    [currentYear?.id],
  ) ?? [];
  const currentSemester = semesters[0];

  const [institutionName, setInstitutionName] = useState('');
  const [yearLabel, setYearLabel] = useState('');
  const [semLabel, setSemLabel] = useState('');
  const [semStart, setSemStart] = useState('');
  const [semEnd, setSemEnd] = useState('');

  useEffect(() => {
    if (settings) setInstitutionName(settings.institutionName);
  }, [settings?.institutionName]);
  useEffect(() => {
    if (currentYear) setYearLabel(currentYear.label);
  }, [currentYear?.id, currentYear?.label]);
  useEffect(() => {
    if (currentSemester) {
      setSemLabel(currentSemester.label);
      setSemStart(currentSemester.startDate);
      setSemEnd(currentSemester.endDate);
    }
  }, [currentSemester?.id, currentSemester?.label, currentSemester?.startDate, currentSemester?.endDate]);

  async function handleSave() {
    let yearId = currentYear?.id;
    if (!yearId) {
      yearId = newId();
      await db.years.add({ id: yearId, label: yearLabel || 'תשפ"ו', order: 0 });
    } else {
      await db.years.update(yearId, { label: yearLabel });
    }

    let semId = currentSemester?.id;
    if (!semId) {
      semId = newId();
      await db.semesters.add({
        id: semId,
        yearId,
        label: semLabel || 'סמסטר א\'',
        startDate: semStart,
        endDate: semEnd,
      });
    } else {
      await db.semesters.update(semId, { label: semLabel, startDate: semStart, endDate: semEnd });
    }

    await db.settings.put({
      id: 'app',
      institutionName,
      currentYearId: yearId,
      currentSemesterId: semId,
      bootstrapped: true,
    });

    navigate(r.home());
  }

  async function handleReset() {
    if (!confirm('למחוק את כל הנתונים? לא ניתן לשחזר.')) return;
    await db.delete();
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
        <button type="button" className="btn" onClick={handleSave}>
          שמור
        </button>
        {!isFirstRun && (
          <button type="button" className="btn-secondary" onClick={handleReset}>
            אפס הכל
          </button>
        )}
      </div>
    </div>
  );
}
