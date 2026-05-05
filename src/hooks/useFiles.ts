import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { FileRecord } from '../types/domain';
import { newId } from '../lib/ids';

const RECENT_CAP = 10;

export function useFilesBySubject(subjectId: string | undefined | null) {
  return useLiveQuery(
    () =>
      subjectId
        ? db.files.where('subjectId').equals(subjectId).reverse().sortBy('addedAt')
        : [],
    [subjectId],
  ) ?? [];
}

export function useRecentFiles() {
  return useLiveQuery(async () => {
    const recents = await db.recentFiles.orderBy('openedAt').reverse().limit(RECENT_CAP).toArray();
    const ids = recents.map((r) => r.fileId);
    const files = await db.files.bulkGet(ids);
    return recents
      .map((r, i) => ({ recent: r, file: files[i] }))
      .filter((row): row is { recent: typeof recents[number]; file: FileRecord } => Boolean(row.file));
  }, []) ?? [];
}

export async function addFile(subjectId: string, file: File): Promise<string> {
  const id = newId();
  const record: FileRecord = {
    id,
    subjectId,
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    blob: file,
    addedAt: Date.now(),
  };
  await db.files.add(record);
  return id;
}

export async function touchRecent(fileId: string) {
  await db.recentFiles.put({ fileId, openedAt: Date.now() });
  // trim
  const all = await db.recentFiles.orderBy('openedAt').reverse().toArray();
  if (all.length > RECENT_CAP) {
    const toDelete = all.slice(RECENT_CAP).map((r) => r.fileId);
    await db.recentFiles.bulkDelete(toDelete);
  }
}

export async function deleteFile(fileId: string) {
  await db.files.delete(fileId);
  await db.recentFiles.delete(fileId);
}
