import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { he } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';

export function MonthlyCalendar({ semesterId }: { semesterId: string }) {
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const semester = useLiveQuery(() => db.semesters.get(semesterId), [semesterId]);
  const deadlines = useLiveQuery(() => db.deadlines.toArray(), []) ?? [];
  const subjects = useLiveQuery(() => db.subjects.toArray(), []) ?? [];

  const deadlineDates = deadlines.map((d) => new Date(d.date));
  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? '—';

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const dayDeadlines = selected ? deadlines.filter((d) => sameDay(new Date(d.date), selected)) : [];

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="rounded-2xl border-2 border-ink bg-cream p-2">
        <DayPicker
          mode="single"
          locale={he}
          dir="rtl"
          selected={selected}
          onSelect={setSelected}
          modifiers={{ hasDeadline: deadlineDates }}
          modifiersClassNames={{ hasDeadline: 'bg-red text-cream rounded-full' }}
          fromDate={semester?.startDate ? new Date(semester.startDate) : undefined}
          toDate={semester?.endDate ? new Date(semester.endDate) : undefined}
        />
      </div>
      <div className="flex-1">
        <h3 className="font-display font-bold uppercase mb-2">מועדים ביום הנבחר</h3>
        {dayDeadlines.length === 0 ? (
          <p className="text-sm text-ink/50">אין מועדים</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {dayDeadlines.map((d) => (
              <li key={d.id} className="rounded-xl border-2 border-ink bg-paper px-3 py-2">
                <div className="font-bold">
                  <bdi>{d.title}</bdi>
                </div>
                <div className="text-xs text-ink/60">
                  <bdi>{subjectName(d.subjectId)}</bdi>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
