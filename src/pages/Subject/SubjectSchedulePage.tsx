import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useTable } from '../../lib/useRealtime';
import type { ScheduleSlot, Subject } from '../../types/domain';

const WEEKDAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function fmt(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function SubjectSchedulePage() {
  const { user } = useAuth();
  const { subjectId } = useParams<{ subjectId: string }>();
  const subject = useTable<Subject | null>(
    'subjects',
    async () => {
      if (!user || !subjectId) return null;
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .eq('id', subjectId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    [subjectId],
  );
  const slots =
    useTable<ScheduleSlot[]>(
      'schedule_slots',
      async () => {
        if (!user || !subjectId) return [];
        const { data, error } = await supabase
          .from('schedule_slots')
          .select('*')
          .eq('user_id', user.id)
          .eq('subject_id', subjectId);
        if (error) throw error;
        return data ?? [];
      },
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
              .sort((a, b) => a.weekday - b.weekday || a.start_minutes - b.start_minutes)
              .map((s) => (
                <li
                  key={s.id}
                  className="rounded-xl border-2 border-ink bg-paper px-3 py-2"
                >
                  <strong>{WEEKDAYS[s.weekday]}</strong> · {fmt(s.start_minutes)}–{fmt(s.end_minutes)}
                  {s.room ? ` · ${s.room}` : ''}
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
