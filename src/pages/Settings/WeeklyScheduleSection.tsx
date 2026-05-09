import { useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useTable } from '../../lib/useRealtime';
import { newId } from '../../lib/ids';
import { useSubjectsBySemester } from '../../hooks/useTreeData';
import { USE_SOFT_DESIGN } from '../../lib/design';
import type { ScheduleSlot, Weekday } from '../../types/domain';

const T = USE_SOFT_DESIGN
  ? {
      card: 'card-soft',
      title: 'text-xl font-bold text-soft-text mb-4',
      field: 'field-soft',
      btnPrimary: 'btn-soft-primary',
      btnSec: 'btn-soft text-sm !px-3 !py-1',
      itemRow: 'flex items-center justify-between rounded-soft-md bg-soft-cream px-4 py-3 shadow-soft-pill',
      empty: 'text-sm text-soft-muted',
      hint: 'text-sm text-soft-muted',
    }
  : {
      card: 'card',
      title: 'text-xl mb-3',
      field: 'field',
      btnPrimary: 'btn',
      btnSec: 'btn-secondary !px-3 !py-1 text-sm',
      itemRow: 'flex items-center justify-between rounded-xl border-2 border-ink bg-paper px-3 py-2',
      empty: 'text-sm text-ink/50',
      hint: 'text-sm text-ink/60',
    };

const WEEKDAYS = [
  { value: 0, label: 'ראשון' },
  { value: 1, label: 'שני' },
  { value: 2, label: 'שלישי' },
  { value: 3, label: 'רביעי' },
  { value: 4, label: 'חמישי' },
  { value: 5, label: 'שישי' },
  { value: 6, label: 'שבת' },
] as const;

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}
function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function WeeklyScheduleSection({ semesterId }: { semesterId: string }) {
  const { user } = useAuth();
  const subjects = useSubjectsBySemester(semesterId);
  const slots =
    useTable<ScheduleSlot[]>(
      'schedule_slots',
      async () => {
        if (!user) return [];
        const { data, error } = await supabase
          .from('schedule_slots')
          .select('*')
          .eq('user_id', user.id)
          .eq('semester_id', semesterId);
        if (error) throw error;
        return data ?? [];
      },
      [semesterId],
    ) ?? [];

  const [pendingAdds, setPendingAdds] = useState<ScheduleSlot[]>([]);
  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set());

  const display = useMemo(() => {
    const fromServerVisible = slots.filter((s) => !pendingDeletes.has(s.id));
    const knownIds = new Set(slots.map((s) => s.id));
    const stillPendingAdds = pendingAdds.filter((p) => !knownIds.has(p.id));
    return [...fromServerVisible, ...stillPendingAdds];
  }, [slots, pendingAdds, pendingDeletes]);

  const [subjectId, setSubjectId] = useState('');
  const [weekday, setWeekday] = useState<Weekday>(0);
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('10:30');
  const [room, setRoom] = useState('');

  async function handleAdd() {
    if (!user || !subjectId) return;
    const optimistic: ScheduleSlot = {
      id: newId(),
      user_id: user.id,
      semester_id: semesterId,
      subject_id: subjectId,
      weekday,
      start_minutes: timeToMinutes(start),
      end_minutes: timeToMinutes(end),
      room: room || null,
    };
    setPendingAdds((prev) => [...prev, optimistic]);
    setRoom('');
    const { error } = await supabase.from('schedule_slots').insert(optimistic);
    if (error) {
      setPendingAdds((prev) => prev.filter((p) => p.id !== optimistic.id));
      alert(`הוספה נכשלה: ${error.message}`);
    }
  }

  async function handleRemove(id: string) {
    if (!user) return;
    setPendingDeletes((prev) => new Set(prev).add(id));
    const { error } = await supabase
      .from('schedule_slots')
      .delete()
      .eq('user_id', user.id)
      .eq('id', id);
    if (error) {
      setPendingDeletes((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      alert(`מחיקה נכשלה: ${error.message}`);
    }
  }

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? '?';

  return (
    <section className={T.card}>
      <h2 className={T.title}>מערכת שעות שבועית</h2>

      {subjects.length === 0 ? (
        <p className={T.hint}>הוסף קורסים תחילה</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
            <select
              className={T.field}
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              <option value="">— קורס —</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              className={T.field}
              value={weekday}
              onChange={(e) => setWeekday(Number(e.target.value) as Weekday)}
            >
              {WEEKDAYS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
            <input
              type="time"
              className={`${T.field} min-w-[7rem]`}
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
            <input
              type="time"
              className={`${T.field} min-w-[7rem]`}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
            <input
              className={T.field}
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="חדר"
              dir="auto"
            />
          </div>
          <button type="button" className={`${T.btnPrimary} mb-4`} onClick={handleAdd}>
            הוסף שיעור
          </button>
        </>
      )}

      <ul className="flex flex-col gap-2.5">
        {display.map((s) => (
          <li key={s.id} className={T.itemRow}>
            <span className={USE_SOFT_DESIGN ? 'text-soft-text' : ''}>
              <strong>
                <bdi>{subjectName(s.subject_id)}</bdi>
              </strong>{' '}
              — {WEEKDAYS[s.weekday]?.label} {minutesToTime(s.start_minutes)}–
              {minutesToTime(s.end_minutes)}
              {s.room ? ` · ${s.room}` : ''}
            </span>
            <button
              type="button"
              className={T.btnSec}
              onClick={() => handleRemove(s.id)}
            >
              מחק
            </button>
          </li>
        ))}
        {display.length === 0 && <li className={T.empty}>אין שיעורים עדיין</li>}
      </ul>
    </section>
  );
}
