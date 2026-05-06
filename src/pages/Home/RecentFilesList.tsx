import { Link } from 'react-router-dom';
import { useRecentFiles } from '../../hooks/useFiles';
import { useAllSemesters, useAllSubjects } from '../../hooks/useTreeData';
import { r } from '../../lib/routes';
import { formatBytes } from '../../lib/files';

export function RecentFilesList() {
  const recents = useRecentFiles();
  const subjects = useAllSubjects();
  const semesters = useAllSemesters();

  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const semesterById = new Map(semesters.map((s) => [s.id, s]));

  if (recents.length === 0) {
    return <p className="text-ink/50 text-sm">אין קבצים שנפתחו עדיין</p>;
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
