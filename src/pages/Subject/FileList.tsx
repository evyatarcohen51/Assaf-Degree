import {
  useFilesBySubject,
  deleteFile,
  touchRecent,
  getSignedUrl,
  downloadFile,
} from '../../hooks/useFiles';
import { useAuth } from '../../lib/auth';
import { downloadBlob, formatBytes } from '../../lib/files';
import { formatDateHe } from '../../lib/progress';

export function FileList({ subjectId }: { subjectId: string }) {
  const { user } = useAuth();
  const files = useFilesBySubject(subjectId);

  if (files.length === 0) {
    return <p className="text-sm text-ink/50">אין קבצים עדיין</p>;
  }

  async function handleOpen(id: string, path: string) {
    if (!user) return;
    await touchRecent(user.id, id);
    const url = await getSignedUrl(path, 60 * 5);
    window.open(url, '_blank');
  }

  async function handleDownload(path: string, name: string) {
    const blob = await downloadFile(path);
    downloadBlob(blob, name);
  }

  return (
    <ul className="flex flex-col gap-2">
      {files.map((f) => (
        <li
          key={f.id}
          className="flex items-center justify-between rounded-xl border-2 border-ink bg-paper px-3 py-2"
        >
          <div className="min-w-0">
            <div className="font-bold truncate">
              <bdi>{f.name}</bdi>
            </div>
            <div className="text-xs text-ink/60">
              {formatBytes(f.size)} · {formatDateHe(f.added_at)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-secondary !px-3 !py-1 text-sm"
              onClick={() => handleOpen(f.id, f.storage_path)}
            >
              פתח
            </button>
            <button
              type="button"
              className="btn-secondary !px-3 !py-1 text-sm"
              onClick={() => handleDownload(f.storage_path, f.name)}
            >
              הורד
            </button>
            <button
              type="button"
              className="btn-secondary !px-3 !py-1 text-sm"
              onClick={() => {
                if (!user) return;
                if (confirm('למחוק?')) deleteFile(user.id, f.id, f.storage_path);
              }}
            >
              מחק
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
