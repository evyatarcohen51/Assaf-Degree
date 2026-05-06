import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useTable } from '../lib/useRealtime';
import type { Year, Semester, Subject } from '../types/domain';

export function useYears(): Year[] {
  const { user } = useAuth();
  return useTable<Year[]>('years', async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('years')
      .select('*')
      .eq('user_id', user.id)
      .order('order', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }) ?? [];
}

export function useSemestersByYear(yearId: string | undefined | null): Semester[] {
  const { user } = useAuth();
  return useTable<Semester[]>(
    'semesters',
    async () => {
      if (!user || !yearId) return [];
      const { data, error } = await supabase
        .from('semesters')
        .select('*')
        .eq('user_id', user.id)
        .eq('year_id', yearId);
      if (error) throw error;
      return data ?? [];
    },
    [yearId],
  ) ?? [];
}

export function useSubjectsBySemester(semesterId: string | undefined | null): Subject[] {
  const { user } = useAuth();
  return useTable<Subject[]>(
    'subjects',
    async () => {
      if (!user || !semesterId) return [];
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .eq('semester_id', semesterId);
      if (error) throw error;
      return data ?? [];
    },
    [semesterId],
  ) ?? [];
}

export function useAllSemesters(): Semester[] {
  const { user } = useAuth();
  return useTable<Semester[]>('semesters', async () => {
    if (!user) return [];
    const { data, error } = await supabase.from('semesters').select('*').eq('user_id', user.id);
    if (error) throw error;
    return data ?? [];
  }) ?? [];
}

export function useAllSubjects(): Subject[] {
  const { user } = useAuth();
  return useTable<Subject[]>('subjects', async () => {
    if (!user) return [];
    const { data, error } = await supabase.from('subjects').select('*').eq('user_id', user.id);
    if (error) throw error;
    return data ?? [];
  }) ?? [];
}
