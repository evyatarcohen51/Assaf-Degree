import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useTable } from '../../lib/useRealtime';
import type { ScheduleSlot, Subject } from '../../types/domain';

const WEEKDAYS = [
  { value: 0, label: 'ראשון' },
  { value: 1, label: 'שני' },
  { value: 2, label: 'שלישי' },
  { value: 3, label: 'רביעי' },
  { value: 4, label: 'חמישי' },
  { value: 5, label: 'שישי' },
];
const HOURS = Array.from({ length: 14 }, (_, i) => 8 + i);

const DAY_COLORS = ['bg-yellow', 'bg-orange', 'bg-red', 'bg-purple', 'bg-blue', 'bg-green'];

export function WeeklyGrid({ semesterId }: { semesterId: string }) {
  const { user } = useAuth();
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
  const subjects =
    useTable<Subject[]>('subjects', async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('subjects').select('*').eq('user_id', user.id);
      if (error) throw error;
      return data ?? [];
    }) ?? [];
  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? '?';

  return (
    <div className="overflow-x-auto">
      <div
        className="grid border-2 border-ink rounded-xl overflow-hidden min-w-[42rem]"
        style={{ gridTemplateColumns: `4rem repeat(${WEEKDAYS.length}, minmax(0, 1fr))` }}
      >
        <div className="bg-paper p-2 font-display text-xs uppercase border-b-2 border-ink"> </div>
        {WEEKDAYS.map((d, i) => (
          <div
            key={d.value}
            className={`p-2 text-center font-display font-bold uppercase border-b-2 border-s-2 border-ink ${DAY_COLORS[i] ?? 'bg-cream'}`}
          >
            {d.label}
          </div>
        ))}

        {HOURS.map((h) => (
          <Row key={h} hour={h} slots={slots} subjectName={subjectName} />
        ))}
      </div>
    </div>
  );
}

function Row({
  hour,
  slots,
  subjectName,
}: {
  hour: number;
  slots: ScheduleSlot[];
  subjectName: (id: string) => string;
}) {
  const min = hour * 60;
  const max = min + 60;
  return (
    <>
      <div className="bg-paper p-2 text-xs font-bold border-t-2 border-ink/30 text-center">{hour}:00</div>
      {WEEKDAYS.map((d, i) => {
        const cell = slots.find(
          (s) => s.weekday === d.value && s.start_minutes < max && s.end_minutes > min,
        );
        return (
          <div
            key={d.value}
            className={`min-h-12 p-1 border-t-2 border-s-2 border-ink/20 ${
              cell ? `${DAY_COLORS[i]}/40` : ''
            }`}
          >
            {cell && cell.start_minutes >= min && (
              <div className="rounded-md border-2 border-ink bg-cream px-2 py-1 text-xs font-bold">
                <bdi>{subjectName(cell.subject_id)}</bdi>
                {cell.room && <div className="text-[10px] text-ink/70">{cell.room}</div>}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
