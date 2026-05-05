import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';

const WEEKDAYS = [
  { value: 0, label: 'ראשון' },
  { value: 1, label: 'שני' },
  { value: 2, label: 'שלישי' },
  { value: 3, label: 'רביעי' },
  { value: 4, label: 'חמישי' },
  { value: 5, label: 'שישי' },
];
const HOURS = Array.from({ length: 14 }, (_, i) => 8 + i); // 08:00 .. 21:00

const DAY_COLORS = ['bg-yellow', 'bg-orange', 'bg-red', 'bg-purple', 'bg-blue', 'bg-green'];

export function WeeklyGrid({ semesterId }: { semesterId: string }) {
  const slots = useLiveQuery(
    () => db.scheduleSlots.where('semesterId').equals(semesterId).toArray(),
    [semesterId],
  ) ?? [];
  const subjects = useLiveQuery(() => db.subjects.toArray(), []) ?? [];
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
  slots: { id: string; weekday: number; subjectId: string; startMinutes: number; endMinutes: number; room?: string }[];
  subjectName: (id: string) => string;
}) {
  const min = hour * 60;
  const max = min + 60;
  return (
    <>
      <div className="bg-paper p-2 text-xs font-bold border-t-2 border-ink/30 text-center">{hour}:00</div>
      {WEEKDAYS.map((d, i) => {
        const cell = slots.find(
          (s) => s.weekday === d.value && s.startMinutes < max && s.endMinutes > min,
        );
        return (
          <div
            key={d.value}
            className={`min-h-12 p-1 border-t-2 border-s-2 border-ink/20 ${
              cell ? `${DAY_COLORS[i]}/40` : ''
            }`}
          >
            {cell && cell.startMinutes >= min && (
              <div className="rounded-md border-2 border-ink bg-cream px-2 py-1 text-xs font-bold">
                <bdi>{subjectName(cell.subjectId)}</bdi>
                {cell.room && <div className="text-[10px] text-ink/70">{cell.room}</div>}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
