import { useState, useMemo } from 'react';
import { HDate, HebrewCalendar } from '@hebcal/core';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useTable } from '../../lib/useRealtime';
import { USE_SOFT_DESIGN } from '../../lib/design';
import type { Deadline, Semester, ScheduleSlot, Subject } from '../../types/domain';

// Theme-aware classes (soft vs sticker)
const TH = USE_SOFT_DESIGN
  ? {
      navBtn: 'w-9 h-9 flex items-center justify-center rounded-soft-pill bg-soft-input text-soft-text shadow-soft-pill hover:shadow-soft-pill-hover transition font-bold text-xl leading-none',
      monthName: 'font-display font-bold text-xl text-soft-text',
      hebrewSub: 'text-xs text-soft-muted mt-0.5',
      dowFrame: 'grid grid-cols-7 rounded-t-soft overflow-hidden bg-soft-card',
      dowSat: 'text-soft-rose',
      dowOther: 'text-soft-muted',
      dayFrame: 'grid grid-cols-7 rounded-b-soft overflow-hidden bg-soft-card shadow-soft',
      emptyCell: 'min-h-[88px] bg-soft-cream/50 border-e border-b border-soft-border/40',
      cellBase: 'border-e border-b border-soft-border/40',
      cellHoverNormal: 'hover:bg-soft-mustard/10',
      cellSelected: 'bg-soft-mustard/20 ring-2 ring-inset ring-soft-mustard',
      cellSat: 'bg-soft-input/20',
      cellSemBoundary: 'ring-2 ring-inset ring-soft-mustard',
      hebDate: 'text-[10px] text-soft-muted leading-none',
      todayBadge: 'bg-soft-text text-soft-card rounded-full w-6 h-6 flex items-center justify-center text-xs',
      gregDate: 'text-sm font-bold leading-none text-soft-text',
      semBoundary: 'text-[10px] font-bold text-soft-text leading-tight',
      holiday: 'text-[9px] font-medium text-soft-rose leading-tight truncate',
      extraCount: 'text-[8px] text-soft-muted',
      summaryHeading: 'font-display font-bold text-soft-text mb-3',
      semBoundaryBox: 'mb-3 rounded-soft-md bg-soft-mustard/30 px-3 py-2 shadow-soft-pill',
      semBoundaryTitle: 'text-sm font-bold text-soft-text',
      semBoundaryLabel: 'text-xs text-soft-muted mt-0.5',
      holidayBox: 'mb-3 rounded-soft-md bg-soft-rose/40 px-3 py-2 shadow-soft-pill',
      holidayText: 'text-sm font-bold text-soft-text',
      sectionLabel: 'text-[10px] font-medium text-soft-muted uppercase mb-2',
      detailItem: 'rounded-soft-md bg-soft-cream px-3 py-2 overflow-hidden shadow-soft-pill',
      detailTitle: 'font-medium text-sm text-soft-text',
      detailMeta: 'text-xs text-soft-muted',
      emptyText: 'text-sm text-soft-muted',
      legendActive: 'flex items-center gap-1 transition-opacity opacity-100 font-medium text-soft-text',
      legendInactive: 'flex items-center gap-1 transition-opacity opacity-40 text-soft-muted',
    }
  : {
      navBtn: 'w-9 h-9 flex items-center justify-center rounded-lg hover:bg-ink/10 font-bold text-xl leading-none',
      monthName: 'font-display font-bold text-xl',
      hebrewSub: 'text-xs text-ink/50 mt-0.5',
      dowFrame: 'grid grid-cols-7 border-x-2 border-t-2 border-ink rounded-t-xl overflow-hidden',
      dowSat: 'text-red',
      dowOther: 'text-ink/60',
      dayFrame: 'grid grid-cols-7 border-2 border-t-0 border-ink rounded-b-xl overflow-hidden',
      emptyCell: 'min-h-[88px] bg-smoke/30 border-e border-b border-ink/10',
      cellBase: 'border-e border-b border-ink/10',
      cellHoverNormal: 'hover:bg-ink/5',
      cellSelected: 'bg-ink/10 ring-2 ring-inset ring-ink',
      cellSat: 'bg-dot/[0.04]',
      cellSemBoundary: 'ring-2 ring-inset ring-yellow',
      hebDate: 'text-[10px] text-ink/55 leading-none',
      todayBadge: 'bg-ink text-cream rounded-full w-6 h-6 flex items-center justify-center text-xs',
      gregDate: 'text-sm font-bold leading-none',
      semBoundary: 'text-[10px] font-bold text-orange leading-tight',
      holiday: 'text-[9px] font-medium text-red leading-tight truncate',
      extraCount: 'text-[8px] text-ink/50',
      summaryHeading: 'font-display font-bold uppercase mb-2',
      semBoundaryBox: 'mb-3 rounded-xl border-2 border-yellow bg-yellow/15 px-3 py-2',
      semBoundaryTitle: 'text-sm font-bold text-orange',
      semBoundaryLabel: 'text-xs text-ink/70 mt-0.5',
      holidayBox: 'mb-3 rounded-xl border-2 border-red/50 bg-red/5 px-3 py-2',
      holidayText: 'text-sm font-bold text-red',
      sectionLabel: 'text-[10px] font-bold text-ink/50 uppercase mb-1',
      detailItem: 'rounded-xl border-2 border-ink bg-paper px-3 py-2 overflow-hidden',
      detailTitle: 'font-bold text-sm',
      detailMeta: 'text-xs text-ink/60',
      emptyText: 'text-sm text-ink/50',
      legendActive: 'flex items-center gap-1 transition-opacity opacity-100 font-bold',
      legendInactive: 'flex items-center gap-1 transition-opacity opacity-40',
    };

function fmtTime(min: number): string {
  return `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`;
}

// Hebrew day numerals 1–30 (avoiding יה/יו per tradition)
const HDAY = [
  '', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט',
  'י', 'יא', 'יב', 'יג', 'יד', 'טו', 'טז', 'יז', 'יח', 'יט',
  'כ', 'כא', 'כב', 'כג', 'כד', 'כה', 'כו', 'כז', 'כח', 'כט', 'ל',
];
const HEBREW_MONTHS: Record<number, string> = {
  1: 'ניסן', 2: 'אייר', 3: 'סיוון', 4: 'תמוז', 5: 'אב', 6: 'אלול',
  7: 'תשרי', 8: 'חשוון', 9: 'כסלו', 10: 'טבת', 11: 'שבט',
  12: 'אדר', 13: 'אדר א׳', 14: 'אדר ב׳',
};
const GREG_MONTHS_HE = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];
const DOW = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

const COLOR_HEX: Record<string, string> = {
  yellow: '#F1B333', orange: '#F07633', red: '#C53B3A',
  purple: '#6758A5', blue: '#0080FF', green: '#0C9367',
};

function parseDateLocal(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function buildMonth(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: (Date | null)[] = Array(first.getDay()).fill(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

export function MonthlyCalendar({ semesterId }: { semesterId: string }) {
  const { user } = useAuth();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<Date>(today);

  const semester = useTable<Semester | null>(
    'semesters',
    async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('semesters').select('*').eq('user_id', user.id)
        .eq('id', semesterId).maybeSingle();
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

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const days = useMemo(() => buildMonth(viewYear, viewMonth), [viewYear, viewMonth]);

  // Hebrew month name(s) for the sub-header
  const hebrewHeader = useMemo(() => {
    try {
      const first = new HDate(new Date(viewYear, viewMonth, 1));
      const last = new HDate(new Date(viewYear, viewMonth + 1, 0));
      const m1 = HEBREW_MONTHS[first.getMonth()] ?? '';
      const m2 = HEBREW_MONTHS[last.getMonth()] ?? '';
      const yr = first.getFullYear();
      return `${m1 === m2 ? m1 : `${m1}–${m2}`} ${yr}`;
    } catch { return ''; }
  }, [viewYear, viewMonth]);

  // Israeli holidays for this month
  const holidays = useMemo(() => {
    const map = new Map<string, string[]>();
    try {
      const evs = HebrewCalendar.calendar({
        start: new Date(viewYear, viewMonth, 1),
        end: new Date(viewYear, viewMonth + 1, 0),
        il: true,
        locale: 'he',
        sedrot: false,
        omer: false,
        shabbatMevarchim: false,
        molad: false,
      });
      for (const ev of evs) {
        const key = dateKey(ev.getDate().greg());
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(ev.render('he'));
      }
    } catch { /* ignore */ }
    return map;
  }, [viewYear, viewMonth]);

  const semStartKey = semester?.start_date ? dateKey(parseDateLocal(semester.start_date)) : null;
  const semEndKey = semester?.end_date ? dateKey(parseDateLocal(semester.end_date)) : null;

  // Expand weekly slots into every concrete date within the semester range
  const slotsByDate = useMemo(() => {
    const map = new Map<string, ScheduleSlot[]>();
    if (!semester?.start_date || !semester?.end_date || slots.length === 0) return map;
    const start = parseDateLocal(semester.start_date);
    const end = parseDateLocal(semester.end_date);
    const cur = new Date(start);
    while (cur <= end) {
      const dow = cur.getDay();
      const daySlots = slots.filter(s => s.weekday === dow);
      if (daySlots.length > 0) map.set(dateKey(cur), daySlots);
      cur.setDate(cur.getDate() + 1);
    }
    return map;
  }, [slots, semester]);

  const deadlinesByDate = useMemo(() => {
    const map = new Map<string, Deadline[]>();
    for (const d of deadlines) {
      const k = dateKey(parseDateLocal(d.date));
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(d);
    }
    return map;
  }, [deadlines]);

  const subjectOf = (id: string | null) => id ? subjects.find(s => s.id === id) : undefined;
  const dayDeadlines = deadlines.filter(d => sameDay(parseDateLocal(d.date), selected));
  const selectedKey = dateKey(selected);
  const selectedHolidays = holidays.get(selectedKey) ?? [];

  return (
    <div className="flex flex-col lg:flex-row gap-6" dir="rtl">
      {/* ── Big calendar ─────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* Navigation header */}
        <div className="flex items-center justify-between mb-3 px-1">
          {/* In RTL flex: first = rightmost visually */}
          <button onClick={nextMonth} className={TH.navBtn}>›</button>
          <div className="text-center leading-tight">
            <div className={TH.monthName}>{GREG_MONTHS_HE[viewMonth]} {viewYear}</div>
            <div className={TH.hebrewSub}>{hebrewHeader}</div>
          </div>
          <button onClick={prevMonth} className={TH.navBtn}>‹</button>
        </div>

        {/* Day-of-week labels */}
        <div className={TH.dowFrame}>
          {DOW.map((d, i) => (
            <div
              key={d}
              className={`py-2 text-center text-xs font-bold ${i === 6 ? TH.dowSat : TH.dowOther}`}
            >{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className={TH.dayFrame}>
          {days.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className={TH.emptyCell} />;
            }

            const key = dateKey(day);
            const isToday = sameDay(day, today);
            const isSel = sameDay(day, selected);
            const isSat = day.getDay() === 6;
            const isStart = key === semStartKey;
            const isEnd = key === semEndKey;
            const dayHols = holidays.get(key) ?? [];
            const dayDls = deadlinesByDate.get(key) ?? [];

            let hDay = 1, hMonth = 0;
            try { const hd = new HDate(day); hDay = hd.getDate(); hMonth = hd.getMonth(); } catch { /* */ }
            const isFirstOfHMonth = hDay === 1;

            return (
              <div
                key={key}
                onClick={() => setSelected(day)}
                className={[
                  'relative min-h-[88px] p-1.5 cursor-pointer',
                  TH.cellBase,
                  'flex flex-col gap-0.5 transition-colors select-none',
                  isSel ? TH.cellSelected : TH.cellHoverNormal,
                  isSat ? TH.cellSat : '',
                  (isStart || isEnd) ? TH.cellSemBoundary : '',
                ].filter(Boolean).join(' ')}
              >
                {/* Top row: Hebrew date (right) + Gregorian date (left) */}
                <div className="flex justify-between items-start">
                  <span className={TH.hebDate}>
                    {HDAY[hDay]}{isFirstOfHMonth && HEBREW_MONTHS[hMonth] ? ` ${HEBREW_MONTHS[hMonth]}` : ''}
                  </span>
                  <span className={isToday ? TH.todayBadge : TH.gregDate}>
                    {day.getDate()}
                  </span>
                </div>

                {/* Semester boundary label */}
                {(isStart || isEnd) && (
                  <div className={TH.semBoundary}>
                    {isStart ? 'תחילת סמסטר' : 'סוף סמסטר'}
                  </div>
                )}

                {/* Holidays (up to 1) */}
                {dayHols.slice(0, 1).map((h, hi) => (
                  <div key={hi} className={TH.holiday} title={h}>{h}</div>
                ))}

                {/* Schedule slot chips */}
                {(() => {
                  const daySlots = slotsByDate.get(key) ?? [];
                  if (daySlots.length === 0) return null;
                  const visible = daySlots.slice(0, 2);
                  const extra = daySlots.length - visible.length;
                  return (
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      {visible.map(s => {
                        const sub = subjectOf(s.subject_id);
                        const hex = sub?.color ? (COLOR_HEX[sub.color] ?? '#555') : '#555';
                        return (
                          <div
                            key={s.id}
                            style={{ background: hex }}
                            className="text-[8px] font-bold text-white leading-tight px-1 py-0.5 rounded truncate"
                            title={`${sub?.name ?? '?'} ${fmtTime(s.start_minutes)}–${fmtTime(s.end_minutes)}`}
                          >
                            {sub?.name ?? '?'}
                          </div>
                        );
                      })}
                      {extra > 0 && <div className={TH.extraCount}>+{extra}</div>}
                    </div>
                  );
                })()}

                {/* Deadline dots */}
                {dayDls.length > 0 && (
                  <div className="mt-auto pt-0.5 flex gap-1 flex-wrap">
                    {dayDls.map(d => {
                      const hex = d.subject_id
                        ? COLOR_HEX[subjectOf(d.subject_id)?.color ?? ''] ?? '#555'
                        : '#555';
                      return (
                        <span
                          key={d.id}
                          style={{ background: hex }}
                          className="inline-block w-3 h-3 rounded-full border border-white/40"
                          title={d.title}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend — active items glow when present on selected day */}
        {(() => {
          const selDls = deadlinesByDate.get(selectedKey) ?? [];
          const selSlots = slotsByDate.get(selectedKey) ?? [];
          const activeSubjectIds = new Set([
            ...selDls.map(d => d.subject_id),
            ...selSlots.map(s => s.subject_id),
          ]);
          const hasSelHoliday = (holidays.get(selectedKey) ?? []).length > 0;
          const hasSelSem = selectedKey === semStartKey || selectedKey === semEndKey;
          return (
            <div className="mt-3 flex gap-3 flex-wrap text-[10px] px-1">
              <span className={hasSelSem ? TH.legendActive : TH.legendInactive}>
                <span className={`inline-block w-3 h-3 rounded-full ring-2 bg-transparent ${USE_SOFT_DESIGN ? 'ring-soft-mustard' : 'ring-yellow'}`} />
                תחילת/סוף סמסטר
              </span>
              <span className={hasSelHoliday ? TH.legendActive : TH.legendInactive}>
                <span className={`inline-block w-3 h-3 rounded-full ${USE_SOFT_DESIGN ? 'bg-soft-rose' : 'bg-red'}`} />
                חג/מועד
              </span>
              {subjects.filter(s => s.color).map(s => {
                const active = activeSubjectIds.has(s.id);
                return (
                  <span key={s.id} className={active ? TH.legendActive : TH.legendInactive}>
                    <span className="inline-block w-3 h-3 rounded-full" style={{ background: COLOR_HEX[s.color!] ?? '#555' }} />
                    <bdi>{s.name}</bdi>
                  </span>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* ── Detail panel ─────────────────────────────────────── */}
      <div className="w-full lg:w-72 shrink-0">
        <h3 className={TH.summaryHeading}>סיכום יום</h3>

        {/* Semester boundary */}
        {(selectedKey === semStartKey || selectedKey === semEndKey) && (
          <div className={TH.semBoundaryBox}>
            <div className={TH.semBoundaryTitle}>
              {selectedKey === semStartKey ? 'תחילת סמסטר' : 'סוף סמסטר'}
            </div>
            {semester?.label && (
              <div className={TH.semBoundaryLabel}>{semester.label}</div>
            )}
          </div>
        )}

        {/* Selected day holidays */}
        {selectedHolidays.length > 0 && (
          <div className={TH.holidayBox}>
            {selectedHolidays.map((h, i) => (
              <div key={i} className={TH.holidayText}><bdi>{h}</bdi></div>
            ))}
          </div>
        )}

        {/* Schedule slots for the day */}
        {(() => {
          const daySlots = (slotsByDate.get(selectedKey) ?? [])
            .slice()
            .sort((a, b) => a.start_minutes - b.start_minutes);
          if (daySlots.length === 0) return null;
          return (
            <div className="mb-3">
              <div className={TH.sectionLabel}>שיעורים</div>
              <ul className="flex flex-col gap-2">
                {daySlots.map(s => {
                  const sub = subjectOf(s.subject_id);
                  const hex = sub?.color ? (COLOR_HEX[sub.color] ?? undefined) : undefined;
                  return (
                    <li key={s.id} className={TH.detailItem}>
                      {hex && <div className="h-1.5 -mx-3 -mt-2 mb-2" style={{ background: hex }} />}
                      <div className={TH.detailTitle}><bdi>{sub?.name ?? '?'}</bdi></div>
                      <div className={TH.detailMeta}>
                        {fmtTime(s.start_minutes)}–{fmtTime(s.end_minutes)}
                        {s.room ? ` · ${s.room}` : ''}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })()}

        {/* Deadlines for the day */}
        {dayDeadlines.length > 0 && (
          <div>
            <div className={TH.sectionLabel}>מועדים</div>
            <ul className="flex flex-col gap-2">
              {dayDeadlines.map(d => {
                const sub = subjectOf(d.subject_id);
                const hex = sub?.color ? (COLOR_HEX[sub.color] ?? undefined) : undefined;
                return (
                  <li key={d.id} className={TH.detailItem}>
                    {hex && (
                      <div className="h-1.5 -mx-3 -mt-2 mb-2" style={{ background: hex }} />
                    )}
                    <div className={TH.detailTitle}><bdi>{d.title}</bdi></div>
                    <div className={TH.detailMeta}><bdi>{sub?.name ?? '—'}</bdi></div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {dayDeadlines.length === 0 &&
         (slotsByDate.get(selectedKey) ?? []).length === 0 &&
         selectedKey !== semStartKey && selectedKey !== semEndKey &&
         selectedHolidays.length === 0 && (
          <p className={TH.emptyText}>אין מועדים</p>
        )}
      </div>
    </div>
  );
}
