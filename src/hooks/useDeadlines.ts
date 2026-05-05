import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export function useUpcomingDeadlines(limit = 8) {
  return useLiveQuery(async () => {
    const today = new Date().toISOString().slice(0, 10);
    return db.deadlines
      .where('date')
      .aboveOrEqual(today)
      .sortBy('date')
      .then((rows) => rows.slice(0, limit));
  }, [limit]) ?? [];
}
