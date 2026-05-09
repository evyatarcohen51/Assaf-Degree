import { Link } from 'react-router-dom';
import { useRecentFiles } from '../../hooks/useFiles';
import { useAllSemesters, useAllSubjects } from '../../hooks/useTreeData';
import { r } from '../../lib/routes';
import { formatBytes } from '../../lib/files';
import { USE_SOFT_DESIGN } from '../../lib/design';

export function RecentFilesList() {
  const recents = useRecentFiles();
  const subjects = useAllSubjects();
  const semesters = useAllSemesters();

  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const semesterById = new Map(semesters.map((s) => [s.id, s]));

  if (recents.length === 0) {
    return (
      <p className={USE_SOFT_DESIGN ? 'text-soft-muted text-sm' : 'text-ink/50 text-sm'}>
        אין קבצים שנפתחו עדיין
      </p>
    );
  }

  if (USE_SOFT_DESIGN) {
    return (
      <ul className="flex flex-col gap-2.5">
        {recents.map(({ file }) => {
          const sub = subjectById.get(file.subject_id);
          const sem = sub ? semesterById.get(sub.semester_id) : undefined;
          const link = sub && sem ? r.subject(sem.year_id, sem.id, sub.id) : undefined;
          return (
            <li key={file.id} className="row-soft">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-soft-text truncate">
                  <bdi>{file.name}</bdi>
                </div>
                <div className="text-xs text-soft-muted mt-0.5">
                  <bdi>{sub?.name ?? '—'}</bdi> · {formatBytes(file.size)}
                </div>
              </div>
              {link && (
                <Link to={link} className="ms-3 inline-flex items-center justify-center rounded-soft-pill border border-soft-mustard text-soft-text px-4 py-1.5 text-sm font-medium shadow-soft-pill transition hover:bg-soft-mustard/20 hover:shadow-soft-pill-hover">
                  פתח קורס
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {recents.map(({ file }) => {
        const sub = subjectById.get(file.subject_id);
        const sem = sub ? semesterById.get(sub.semester_id) : undefined;
        const link = sub && sem ? r.subject(sem.year_id, sem.id, sub.id) : undefined;
        return (
          <li
            key={file.id}
            className="flex items-center justify-between rounded-xl border-2 border-ink bg-paper px-3 py-2"
          >
            <div>
              <div className="font-bold">
                <bdi>{file.name}</bdi>
              </div>
              <div className="text-xs text-ink/60">
                <bdi>{sub?.name ?? '—'}</bdi> · {formatBytes(file.size)}
              </div>
            </div>
            {link && (
              <Link to={link} className="btn-secondary !px-3 !py-1 text-sm">
                פתח קורס
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
