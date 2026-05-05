import { useFilesBySubject, deleteFile, touchRecent } from '../../hooks/useFiles';
import { blobToObjectURL, downloadBlob, formatBytes } from '../../lib/files';
import { formatDateHe } from '../../lib/progress';

export function FileList({ subjectId }: { subjectId: string }) {
  const files = useFilesBySubject(subjectId);

  if (files.length === 0) {
    return <p className="text-sm text-ink/50">אין קבצים עדיין</p>;
  }

  async function handleOpen(id: string, blob: Blob) {
    await touchRecent(id);
    const url = blobToObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
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
              {formatBytes(f.size)} · {formatDateHe(new Date(f.addedAt).toISOString())}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-secondary !px-3 !py-1 text-sm"
              onClick={() => handleOpen(f.id, f.blob)}
            >
              פתח
            </button>
            <button
              type="button"
              className="btn-secondary !px-3 !py-1 text-sm"
              onClick={() => downloadBlob(f.blob, f.name)}
            >
              הורד
            </button>
            <button
              type="button"
              className="btn-secondary !px-3 !py-1 text-sm"
              onClick={() => {
                if (confirm('למחוק?')) deleteFile(f.id);
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
