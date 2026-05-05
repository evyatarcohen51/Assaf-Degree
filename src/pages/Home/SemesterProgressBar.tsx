import { useLiveQuery } from 'dexie-react-hooks';
import { useSettings } from '../../hooks/useSettings';
import { db } from '../../db';
import { computeProgress, formatDateHe } from '../../lib/progress';

export function SemesterProgressBar() {
  const settings = useSettings();
  const semester = useLiveQuery(
    () => (settings?.currentSemesterId ? db.semesters.get(settings.currentSemesterId) : undefined),
    [settings?.currentSemesterId],
  );

  if (!semester) return null;

  const pct = computeProgress(semester.startDate, semester.endDate);

  return (
    <section className="card">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="font-bold">{formatDateHe(semester.startDate)}</span>
        <span className="font-display text-lg font-black">{pct}%</span>
        <span className="font-bold">{formatDateHe(semester.endDate)}</span>
      </div>
      <div className="h-6 w-full rounded-full border-2 border-ink bg-cream overflow-hidden">
        <div
          className="h-full bg-green border-e-2 border-ink"
          style={{ width: `${pct}%` }}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
    </section>
  );
}
