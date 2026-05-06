import { useAllSemesters } from '../../hooks/useTreeData';
import { computeProgress, formatDateHe, getCurrentSemester } from '../../lib/progress';

export function SemesterProgressBar() {
  const semesters = useAllSemesters();
  const semester = getCurrentSemester(semesters);

  if (!semester) return null;

  const pct = computeProgress(semester.start_date ?? '', semester.end_date ?? '');

  return (
    <section className="card">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="font-bold">{formatDateHe(semester.start_date ?? '')}</span>
        <span className="font-display text-lg font-black">{pct}%</span>
        <span className="font-bold">{formatDateHe(semester.end_date ?? '')}</span>
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
