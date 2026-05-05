import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export function useSettings() {
  return useLiveQuery(() => db.settings.get('app'), []);
}

export function useProfile() {
  return useLiveQuery(() => db.profile.get('me'), []);
}
