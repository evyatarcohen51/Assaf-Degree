import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export function useYears() {
  return useLiveQuery(() => db.years.orderBy('order').toArray(), []) ?? [];
}

export function useSemestersByYear(yearId: string | undefined | null) {
  return useLiveQuery(
    () => (yearId ? db.semesters.where('yearId').equals(yearId).toArray() : []),
    [yearId],
  ) ?? [];
}

export function useSubjectsBySemester(semesterId: string | undefined | null) {
  return useLiveQuery(
    () => (semesterId ? db.subjects.where('semesterId').equals(semesterId).toArray() : []),
    [semesterId],
  ) ?? [];
}

export function useAllSemesters() {
  return useLiveQuery(() => db.semesters.toArray(), []) ?? [];
}

export function useAllSubjects() {
  return useLiveQuery(() => db.subjects.toArray(), []) ?? [];
}
