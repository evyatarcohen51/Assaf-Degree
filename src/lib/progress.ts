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
