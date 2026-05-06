import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useTable } from '../lib/useRealtime';
import { newId } from '../lib/ids';
import type { Grade, GradeKind } from '../types/domain';

export function useGradesBySubject(subjectId: string | undefined | null): Grade[] {
  const { user } = useAuth();
  return (
    useTable<Grade[]>(
      'grades',
      async () => {
        if (!user || !subjectId) return [];
        const { data, error } = await supabase
          .from('grades')
          .select('*')
          .eq('user_id', user.id)
          .eq('subject_id', subjectId)
          .order('created_at', { ascending: true });
        if (error) throw error;
        return data ?? [];
      },
      [subjectId],
    ) ?? []
  );
}

export function useAllGrades(): Grade[] {
  const { user } = useAuth();
  return (
    useTable<Grade[]>('grades', async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('grades').select('*').eq('user_id', user.id);
      if (error) throw error;
      return data ?? [];
    }) ?? []
  );
}

export async function addGrade(input: {
  user_id: string;
  subject_id: string;
  name: string;
  kind: GradeKind;
  grade: number;
  weight_percent: number;
}): Promise<string> {
  const id = newId();
  const { error } = await supabase.from('grades').insert({
    id,
    ...input,
  });
  if (error) throw error;
  return id;
}

export async function updateGrade(
  user_id: string,
  id: string,
  fields: Partial<Pick<Grade, 'name' | 'kind' | 'grade' | 'weight_percent'>>,
) {
  const { error } = await supabase
    .from('grades')
    .update(fields)
    .eq('user_id', user_id)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteGrade(user_id: string, id: string) {
  const { error } = await supabase.from('grades').delete().eq('user_id', user_id).eq('id', id);
  if (error) throw error;
}

/**
 * Weighted average of grades. If weights don't sum to 100, normalizes by
 * actual sum of weights. Returns null if no grades.
 */
export function computeFinalGrade(grades: Grade[]): number | null {
  if (grades.length === 0) return null;
  const totalWeight = grades.reduce((sum, g) => sum + g.weight_percent, 0);
  if (totalWeight === 0) return null;
  const weighted = grades.reduce((sum, g) => sum + g.grade * g.weight_percent, 0);
  return weighted / totalWeight;
}

export function totalWeight(grades: Grade[]): number {
  return grades.reduce((sum, g) => sum + g.weight_percent, 0);
}
