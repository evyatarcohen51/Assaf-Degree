import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';

const WEEKDAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function fmt(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function SubjectSchedulePage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const subject = useLiveQuery(() => (subjectId ? db.subjects.get(subjectId) : undefined), [subjectId]);
  const slots = useLiveQuery(
    () => (subjectId ? db.scheduleSlots.where('subjectId').equals(subjectId).toArray() : []),
    [subjectId],
  ) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <header className="card bg-yellow">
        <h1 className="text-3xl">
          מערכת שעות — <bdi>{subject?.name ?? '—'}</bdi>
        </h1>
      </header>
      <section className="card">
        {slots.length === 0 ? (
          <p className="text-ink/50">אין שיעורים מוגדרים — ערוך בהגדרות</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {slots
              .sort((a, b) => a.weekday - b.weekday || a.startMinutes - b.startMinutes)
              .map((s) => (
                <li
                  key={s.id}
                  className="rounded-xl border-2 border-ink bg-paper px-3 py-2"
                >
                  <strong>{WEEKDAYS[s.weekday]}</strong> · {fmt(s.startMinutes)}–{fmt(s.endMinutes)}
                  {s.room ? ` · ${s.room}` : ''}
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
