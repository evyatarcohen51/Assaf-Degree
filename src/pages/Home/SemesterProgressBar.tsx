import { useAllSemesters } from '../../hooks/useTreeData';
import { computeProgress, formatDateHe, getCurrentSemester } from '../../lib/progress';
import { USE_SOFT_DESIGN } from '../../lib/design';

export function SemesterProgressBar() {
  const semesters = useAllSemesters();
  const semester = getCurrentSemester(semesters);

  if (!semester) return null;

  const pct = computeProgress(semester.start_date ?? '', semester.end_date ?? '');

  if (USE_SOFT_DESIGN) {
    return (
      <section className="card-soft">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="font-medium text-soft-text">{formatDateHe(semester.start_date ?? '')}</span>
          <span className="font-display text-lg font-black text-soft-text">{pct}%</span>
          <span className="font-medium text-soft-text">{formatDateHe(semester.end_date ?? '')}</span>
        </div>
        <div className="progress-soft" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-soft-fill" style={{ width: `${pct}%` }} />
        </div>
      </section>
    );
  }

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
