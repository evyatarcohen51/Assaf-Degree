import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { he } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useTable } from '../../lib/useRealtime';
import type { Deadline, Semester, Subject } from '../../types/domain';

export function MonthlyCalendar({ semesterId }: { semesterId: string }) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const semester = useTable<Semester | null>(
    'semesters',
    async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('semesters')
        .select('*')
        .eq('user_id', user.id)
        .eq('id', semesterId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    [semesterId],
  );
  const deadlines =
    useTable<Deadline[]>('deadlines', async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('deadlines').select('*').eq('user_id', user.id);
      if (error) throw error;
      return data ?? [];
    }) ?? [];
  const subjects =
    useTable<Subject[]>('subjects', async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('subjects').select('*').eq('user_id', user.id);
      if (error) throw error;
      return data ?? [];
    }) ?? [];

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
          fromDate={semester?.start_date ? new Date(semester.start_date) : undefined}
          toDate={semester?.end_date ? new Date(semester.end_date) : undefined}
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
                  <bdi>{subjectName(d.subject_id)}</bdi>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
