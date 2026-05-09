import { useMemo, useState } from 'react';
import {
  useFilesByTopic,
  deleteFile,
  touchRecent,
  getSignedUrl,
  downloadFile,
  toggleFavorite,
} from '../../hooks/useFiles';
import { useAuth } from '../../lib/auth';
import { downloadBlob, formatBytes } from '../../lib/files';
import { formatDateHe } from '../../lib/progress';
import { USE_SOFT_DESIGN } from '../../lib/design';
import { TrashIcon } from '../../ui/icons';
import type { FileRecord } from '../../types/domain';

type SortKey = 'name' | 'time';
type SortDir = 'asc' | 'desc';

export function FileList({ topicId }: { topicId: string }) {
  const { user } = useAuth();
  const files = useFilesByTopic(topicId);

  const [search, setSearch] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('time');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const display = useMemo(() => {
    let out = files.slice();
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter((f) => f.name.toLowerCase().includes(q));
    }
    if (favoritesOnly) {
      out = out.filter((f) => f.is_favorite);
    }
    out.sort((a, b) => {
      if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name, 'he');
      else cmp = a.added_at.localeCompare(b.added_at);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return out;
  }, [files, search, favoritesOnly, sortKey, sortDir]);

  function flipSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
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

  async function handleToggleFav(file: FileRecord) {
    if (!user) return;
    try {
      await toggleFavorite(user.id, file.id, !file.is_favorite);
    } catch (err) {
      alert(`עדכון נכשל: ${err instanceof Error ? err.message : err}`);
    }
  }

  if (USE_SOFT_DESIGN) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-2 items-stretch">
          <input
            className="field-soft flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חפש לפי שם..."
            dir="auto"
          />
          <label className="inline-flex items-center gap-2 rounded-soft-pill bg-soft-input px-4 py-2 cursor-pointer shadow-soft-pill">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(e) => setFavoritesOnly(e.target.checked)}
            />
            <span className="font-medium text-soft-text text-sm">מועדפים בלבד</span>
          </label>
        </div>

        {display.length === 0 ? (
          <p className="text-sm text-soft-muted">אין קבצים</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-soft-border py-3 ps-3 w-10"></th>
                  <th
                    className="border-b border-soft-border py-3 text-start text-soft-muted text-sm font-medium cursor-pointer"
                    onClick={() => flipSort('name')}
                  >
                    שם {sortKey === 'name' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    className="border-b border-soft-border py-3 text-start text-soft-muted text-sm font-medium cursor-pointer"
                    onClick={() => flipSort('time')}
                  >
                    הועלה {sortKey === 'time' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="border-b border-soft-border py-3 pe-3"></th>
                </tr>
              </thead>
              <tbody>
                {display.map((f) => (
                  <tr key={f.id} className="align-middle">
                    <td className="border-b border-soft-border py-3 ps-3">
                      <button
                        type="button"
                        onClick={() => handleToggleFav(f)}
                        aria-label={f.is_favorite ? 'הסר מועדף' : 'סמן כמועדף'}
                        className={`text-2xl leading-none transition ${
                          f.is_favorite ? 'text-soft-mustard' : 'text-soft-muted hover:text-soft-text'
                        }`}
                      >
                        {f.is_favorite ? '★' : '☆'}
                      </button>
                    </td>
                    <td className="border-b border-soft-border py-3 max-w-xs">
                      <div className="font-medium text-soft-text truncate">
                        <bdi>{f.name}</bdi>
                      </div>
                      <div className="text-xs text-soft-muted">{formatBytes(f.size)}</div>
                    </td>
                    <td className="border-b border-soft-border py-3 text-sm text-soft-muted">
                      {formatDateHe(f.added_at)}
                    </td>
                    <td className="border-b border-soft-border py-3 pe-3 text-end whitespace-nowrap">
                      <button
                        type="button"
                        className="btn-soft text-sm !px-3 !py-1 me-1"
                        onClick={() => handleOpen(f.id, f.storage_path)}
                      >
                        פתח
                      </button>
                      <button
                        type="button"
                        className="btn-soft text-sm !px-3 !py-1 me-1"
                        onClick={() => handleDownload(f.storage_path, f.name)}
                      >
                        הורד
                      </button>
                      <button
                        type="button"
                        className="icon-btn-soft-danger"
                        onClick={() => {
                          if (!user) return;
                          if (confirm('למחוק?')) deleteFile(user.id, f.id, f.storage_path);
                        }}
                        aria-label="מחק קובץ"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col md:flex-row gap-2 items-stretch">
        <input
          className="field flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חפש לפי שם..."
          dir="auto"
        />
        <label className="inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-cream px-3 py-2 cursor-pointer">
          <input
            type="checkbox"
            checked={favoritesOnly}
            onChange={(e) => setFavoritesOnly(e.target.checked)}
          />
          <span className="font-display font-bold uppercase text-sm">מועדפים בלבד</span>
        </label>
      </div>

      {display.length === 0 ? (
        <p className="text-sm text-ink/50">אין קבצים</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b-2 border-ink p-2 w-10"></th>
                <th
                  className="border-b-2 border-ink p-2 text-start font-display uppercase cursor-pointer"
                  onClick={() => flipSort('name')}
                >
                  שם {sortKey === 'name' && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  className="border-b-2 border-ink p-2 text-start font-display uppercase cursor-pointer"
                  onClick={() => flipSort('time')}
                >
                  הועלה {sortKey === 'time' && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className="border-b-2 border-ink p-2"></th>
              </tr>
            </thead>
            <tbody>
              {display.map((f) => (
                <tr key={f.id} className="align-middle">
                  <td className="border-b border-ink/20 p-2">
                    <button
                      type="button"
                      onClick={() => handleToggleFav(f)}
                      aria-label={f.is_favorite ? 'הסר מועדף' : 'סמן כמועדף'}
                      className={`text-2xl leading-none ${
                        f.is_favorite ? 'text-yellow' : 'text-ink/30'
                      }`}
                    >
                      {f.is_favorite ? '★' : '☆'}
                    </button>
                  </td>
                  <td className="border-b border-ink/20 p-2 max-w-xs">
                    <div className="font-bold truncate">
                      <bdi>{f.name}</bdi>
                    </div>
                    <div className="text-xs text-ink/60">{formatBytes(f.size)}</div>
                  </td>
                  <td className="border-b border-ink/20 p-2 text-sm">
                    {formatDateHe(f.added_at)}
                  </td>
                  <td className="border-b border-ink/20 p-2 text-end whitespace-nowrap">
                    <button
                      type="button"
                      className="btn-secondary !px-3 !py-1 text-sm me-1"
                      onClick={() => handleOpen(f.id, f.storage_path)}
                    >
                      פתח
                    </button>
                    <button
                      type="button"
                      className="btn-secondary !px-3 !py-1 text-sm me-1"
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
