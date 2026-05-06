import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useTable } from '../lib/useRealtime';
import { newId } from '../lib/ids';
import type { HomeworkItem, HomeworkStatus } from '../types/domain';

export function useAllHomework(): HomeworkItem[] {
  const { user } = useAuth();
  return useTable<HomeworkItem[]>('homework', async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('homework')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }) ?? [];
}

export async function addHomework(input: {
  user_id: string;
  subjectId: string;
  task: string;
  dueDate?: string;
}) {
  const { error } = await supabase.from('homework').insert({
    id: newId(),
    user_id: input.user_id,
    subject_id: input.subjectId,
    task: input.task,
    status: 'pending' as HomeworkStatus,
    due_date: input.dueDate ?? null,
  });
  if (error) throw error;
}

export async function setHomeworkStatus(user_id: string, id: string, status: HomeworkStatus) {
  const { error } = await supabase
    .from('homework')
    .update({ status })
    .eq('user_id', user_id)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteHomework(user_id: string, id: string) {
  const { error } = await supabase.from('homework').delete().eq('user_id', user_id).eq('id', id);
  if (error) throw error;
}
