import { useSettings } from '../../hooks/useSettings';
import { useAllSemesters } from '../../hooks/useTreeData';
import { getCurrentSemester } from '../../lib/progress';
import { USE_SOFT_DESIGN } from '../../lib/design';

export function CurrentTrackHeader() {
  const settings = useSettings();
  const semesters = useAllSemesters();
  const semester = getCurrentSemester(semesters);

  const label = semester?.label || 'מסלול';
  const institution = settings?.institution_name || '';

  if (USE_SOFT_DESIGN) {
    return (
      <header className="card-soft-hero flex flex-col items-center text-center gap-2">
        <p className="font-display text-sm uppercase tracking-widest text-soft-text/70">Current Track</p>
        <h1 className="text-4xl md:text-5xl font-display font-black text-soft-text">{label}</h1>
        {institution && (
          <p className="text-base text-soft-text/80">
            <bdi>{institution}</bdi>
          </p>
        )}
      </header>
    );
  }

  return (
    <header className="card flex flex-col items-center text-center gap-2 bg-yellow">
      <p className="font-display text-sm uppercase tracking-widest text-ink/70">Current Track</p>
      <h1 className="text-4xl md:text-5xl">{label}</h1>
      {institution && (
        <p className="text-base text-ink/80">
          <bdi>{institution}</bdi>
        </p>
      )}
    </header>
  );
}
