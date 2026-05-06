import { useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useTable } from '../../lib/useRealtime';
import type { ScheduleSlot, Subject, Weekday } from '../../types/domain';

const WEEKDAYS = [
  { value: 0 as Weekday, label: 'ראשון' },
  { value: 1 as Weekday, label: 'שני' },
  { value: 2 as Weekday, label: 'שלישי' },
  { value: 3 as Weekday, label: 'רביעי' },
  { value: 4 as Weekday, label: 'חמישי' },
  { value: 5 as Weekday, label: 'שישי' },
];
const HOURS = Array.from({ length: 14 }, (_, i) => 8 + i);
const DAY_COLORS = ['bg-yellow', 'bg-orange', 'bg-red', 'bg-purple', 'bg-blue', 'bg-green'];

const CELL_PX = 48; // matches the row height (3rem)
const SNAP_MIN = 15; // resize/move granularity
const PX_PER_MIN = CELL_PX / 60;

const DRAG_TYPE = 'application/x-got-schooled-slot';

type LocalOverrides = Record<
  string,
  Pick<ScheduleSlot, 'weekday' | 'start_minutes' | 'end_minutes'>
>;

export function WeeklyGrid({ semesterId }: { semesterId: string }) {
  const { user } = useAuth();
  const slotsFromServer =
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

  const [overrides, setOverrides] = useState<LocalOverrides>({});
  const [dragOver, setDragOver] = useState<{ day: number; hour: number } | null>(null);
  const overridesRef = useRef(overrides);
  overridesRef.current = overrides;

  const slots = slotsFromServer.map((s) =>
    overrides[s.id] ? { ...s, ...overrides[s.id] } : s,
  );

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? '?';

  function clearOverride(slotId: string) {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  }

  async function commitChange(
    slotId: string,
    fields: Pick<ScheduleSlot, 'weekday' | 'start_minutes' | 'end_minutes'>,
  ) {
    if (!user) return;
    const { error } = await supabase
      .from('schedule_slots')
      .update(fields)
      .eq('user_id', user.id)
      .eq('id', slotId);
    if (error) {
      clearOverride(slotId);
      alert(`עדכון נכשל: ${error.message}`);
    } else {
      setTimeout(() => clearOverride(slotId), 1500);
    }
  }

  // ── DRAG to move ────────────────────────────────────────────
  function handleDragStart(e: React.DragEvent, slotId: string) {
    e.dataTransfer.setData(DRAG_TYPE, slotId);
    e.dataTransfer.effectAllowed = 'move';
  }
  function handleDragOver(e: React.DragEvent, day: number, hour: number) {
    if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOver?.day !== day || dragOver?.hour !== hour) {
      setDragOver({ day, hour });
    }
  }
  function handleDragLeave() {
    setDragOver(null);
  }
  async function handleDrop(e: React.DragEvent, day: Weekday, hour: number) {
    e.preventDefault();
    setDragOver(null);
    const slotId = e.dataTransfer.getData(DRAG_TYPE);
    if (!slotId) return;
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) return;
    const duration = slot.end_minutes - slot.start_minutes;
    const minuteOffset = slot.start_minutes % 60;
    const newStart = hour * 60 + minuteOffset;
    const newEnd = newStart + duration;
    if (newEnd > 24 * 60) return;
    if (slot.weekday === day && slot.start_minutes === newStart) return;
    setOverrides((prev) => ({
      ...prev,
      [slotId]: { weekday: day, start_minutes: newStart, end_minutes: newEnd },
    }));
    commitChange(slotId, { weekday: day, start_minutes: newStart, end_minutes: newEnd });
  }

  // ── RESIZE (15-min snaps) ────────────────────────────────────
  function startResize(edge: 'top' | 'bottom', slot: ScheduleSlot, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const originalStart = slot.start_minutes;
    const originalEnd = slot.end_minutes;
    let lastChange: Pick<ScheduleSlot, 'weekday' | 'start_minutes' | 'end_minutes'> = {
      weekday: slot.weekday,
      start_minutes: originalStart,
      end_minutes: originalEnd,
    };

    function move(ev: MouseEvent) {
      const deltaY = ev.clientY - startY;
      const deltaMinRaw = deltaY / PX_PER_MIN;
      const deltaMin = Math.round(deltaMinRaw / SNAP_MIN) * SNAP_MIN;
      if (edge === 'top') {
        const newStart = Math.max(0, originalStart + deltaMin);
        if (newStart >= originalEnd) return;
        lastChange = {
          weekday: slot.weekday,
          start_minutes: newStart,
          end_minutes: originalEnd,
        };
      } else {
        const newEnd = Math.min(24 * 60, originalEnd + deltaMin);
        if (newEnd <= originalStart) return;
        lastChange = {
          weekday: slot.weekday,
          start_minutes: originalStart,
          end_minutes: newEnd,
        };
      }
      setOverrides((prev) => ({ ...prev, [slot.id]: lastChange }));
    }

    function up() {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      if (
        lastChange.start_minutes === originalStart &&
        lastChange.end_minutes === originalEnd
      ) {
        return;
      }
      commitChange(slot.id, lastChange);
    }

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }

  // ── Position helpers ─────────────────────────────────────────
  const positioned = slots
    .map((s) => {
      const dayIdx = WEEKDAYS.findIndex((d) => d.value === s.weekday);
      const startHour = Math.floor(s.start_minutes / 60);
      const endHour = Math.ceil(s.end_minutes / 60);
      const startRow = HOURS.indexOf(startHour);
      const span = Math.max(1, endHour - startHour);
      return { slot: s, dayIdx, startRow, span };
    })
    .filter((p) => p.dayIdx >= 0 && p.startRow >= 0);

  return (
    <div className="overflow-x-auto">
      <p className="text-xs text-ink/60 mb-2">
        טיפ: גרור בלוק שיעור לתא אחר כדי להזיז. גרור את הקצה העליון או התחתון כדי למתוח (בקפיצות של 15 דקות).
      </p>
      <div
        className="grid border-2 border-ink rounded-xl overflow-hidden min-w-[42rem]"
        style={{
          gridTemplateColumns: `4rem repeat(${WEEKDAYS.length}, minmax(0, 1fr))`,
          gridTemplateRows: `auto repeat(${HOURS.length}, ${CELL_PX}px)`,
        }}
      >
        {/* Header row — explicit positions so slot blocks below don't shift them */}
        <div
          style={{ gridColumn: 1, gridRow: 1 }}
          className="bg-paper p-2 font-display text-xs uppercase border-b-2 border-ink"
        />
        {WEEKDAYS.map((d, i) => (
          <div
            key={`hdr-${d.value}`}
            style={{ gridColumn: i + 2, gridRow: 1 }}
            className={`p-2 text-center font-display font-bold uppercase border-b-2 border-s-2 border-ink ${DAY_COLORS[i] ?? 'bg-cream'}`}
          >
            {d.label}
          </div>
        ))}

        {/* Hour labels — explicit row */}
        {HOURS.map((h, i) => (
          <div
            key={`hour-${h}`}
            style={{ gridColumn: 1, gridRow: i + 2 }}
            className="bg-paper p-2 text-xs font-bold border-t-2 border-ink/30 text-center flex items-center justify-center"
          >
            {h}:00
          </div>
        ))}

        {/* Drop cells — explicit positions */}
        {HOURS.map((h, hi) =>
          WEEKDAYS.map((d, di) => {
            const isDragOver = dragOver?.day === d.value && dragOver?.hour === h;
            return (
              <div
                key={`cell-${d.value}-${h}`}
                style={{ gridColumn: di + 2, gridRow: hi + 2 }}
                onDragOver={(e) => handleDragOver(e, d.value, h)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, d.value, h)}
                className={`border-t-2 border-s-2 border-ink/20 ${
                  isDragOver ? 'ring-2 ring-ink ring-inset bg-ink/5' : ''
                }`}
              />
            );
          }),
        )}

        {/* Slot blocks — explicit positions, on top of cells */}
        {positioned.map(({ slot, dayIdx, startRow, span }) => {
          const colorIdx = dayIdx % DAY_COLORS.length;
          return (
            <div
              key={`slot-${slot.id}`}
              style={{
                gridColumn: dayIdx + 2,
                gridRow: `${startRow + 2} / span ${span}`,
              }}
              className={`relative m-0.5 z-10 rounded-md border-2 border-ink ${DAY_COLORS[colorIdx]}/70 overflow-hidden`}
            >
              {/* Top resize handle */}
              <div
                onMouseDown={(e) => startResize('top', slot, e)}
                className="absolute top-0 inset-x-0 h-2 cursor-ns-resize bg-ink/30 hover:bg-ink/60 z-20"
                aria-label="מתח למעלה"
              />
              {/* Body — draggable for moving */}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, slot.id)}
                className="px-2 py-2 text-xs font-bold cursor-grab active:cursor-grabbing h-full bg-cream/60"
                title="גרור כדי להזיז"
              >
                <bdi>{subjectName(slot.subject_id)}</bdi>
                {slot.room && <div className="text-[10px] text-ink/70">{slot.room}</div>}
              </div>
              {/* Bottom resize handle */}
              <div
                onMouseDown={(e) => startResize('bottom', slot, e)}
                className="absolute bottom-0 inset-x-0 h-2 cursor-ns-resize bg-ink/30 hover:bg-ink/60 z-20"
                aria-label="מתח למטה"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
