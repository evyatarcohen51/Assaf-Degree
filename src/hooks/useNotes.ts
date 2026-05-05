import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export function useNote(subjectId: string | undefined | null) {
  return useLiveQuery(
    () => (subjectId ? db.notes.get(subjectId) : undefined),
    [subjectId],
  );
}

export async function saveNote(subjectId: string, content: string) {
  await db.notes.put({ subjectId, content, updatedAt: Date.now() });
}
