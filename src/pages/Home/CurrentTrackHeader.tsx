import { useLiveQuery } from 'dexie-react-hooks';
import { useSettings } from '../../hooks/useSettings';
import { db } from '../../db';

export function CurrentTrackHeader() {
  const settings = useSettings();
  const semester = useLiveQuery(
    () => (settings?.currentSemesterId ? db.semesters.get(settings.currentSemesterId) : undefined),
    [settings?.currentSemesterId],
  );

  const label = semester?.label || 'מסלול';
  const institution = settings?.institutionName || '';

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
