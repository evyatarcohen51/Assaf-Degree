import type { Semester } from '../types/domain';

/**
 * Auto-detect the "current" semester from a list, by matching today's date to
 * a semester's date range. If none match, falls back to the semester with the
 * most recent end date.
 */
export function getCurrentSemester(semesters: Semester[]): Semester | undefined {
  if (semesters.length === 0) return undefined;
  const today = new Date().toISOString().slice(0, 10);
  const inRange = semesters.find(
    (s) =>
      s.start_date &&
      s.end_date &&
      s.start_date <= today &&
      today <= s.end_date,
  );
  if (inRange) return inRange;
  return [...semesters]
    .filter((s) => s.end_date)
    .sort((a, b) => (b.end_date ?? '').localeCompare(a.end_date ?? ''))[0]
    ?? semesters[0];
}

export function computeProgress(startISO: string, endISO: string, now: Date = new Date()): number {
  if (!startISO || !endISO) return 0;
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  if (!isFinite(start) || !isFinite(end) || end <= start) return 0;
  const t = now.getTime();
  if (t <= start) return 0;
  if (t >= end) return 100;
  return Math.round(((t - start) / (end - start)) * 100);
}

export function formatDateHe(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (!isFinite(d.getTime())) return iso;
  return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' });
}
