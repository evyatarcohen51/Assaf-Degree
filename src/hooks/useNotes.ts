import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useTable } from '../lib/useRealtime';
import type { NoteRecord } from '../types/domain';

export function useNote(subjectId: string | undefined | null): NoteRecord | undefined {
  const { user } = useAuth();
  return useTable<NoteRecord | null>(
    'notes',
    async () => {
      if (!user || !subjectId) return null;
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('subject_id', subjectId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    [subjectId],
  ) ?? undefined;
}

export async function saveNote(user_id: string, subjectId: string, content: string) {
  const { error } = await supabase
    .from('notes')
    .upsert({ user_id, subject_id: subjectId, content });
  if (error) throw error;
}
