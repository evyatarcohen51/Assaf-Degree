import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useTable } from '../lib/useRealtime';
import { newId } from '../lib/ids';
import type { Topic, TopicColor } from '../types/domain';

export function useTopicsBySubject(subjectId: string | undefined | null): Topic[] {
  const { user } = useAuth();
  return (
    useTable<Topic[]>(
      'topics',
      async () => {
        if (!user || !subjectId) return [];
        const { data, error } = await supabase
          .from('topics')
          .select('*')
          .eq('user_id', user.id)
          .eq('subject_id', subjectId)
          .order('order', { ascending: true });
        if (error) throw error;
        return data ?? [];
      },
      [subjectId],
    ) ?? []
  );
}

export function useTopic(topicId: string | undefined | null): Topic | undefined {
  const { user } = useAuth();
  return (
    useTable<Topic | null>(
      'topics',
      async () => {
        if (!user || !topicId) return null;
        const { data, error } = await supabase
          .from('topics')
          .select('*')
          .eq('user_id', user.id)
          .eq('id', topicId)
          .maybeSingle();
        if (error) throw error;
        return data;
      },
      [topicId],
    ) ?? undefined
  );
}

export async function addTopic(input: {
  user_id: string;
  subject_id: string;
  name: string;
  color: TopicColor;
  order: number;
}): Promise<string> {
  const id = newId();
  const { error } = await supabase.from('topics').insert({
    id,
    user_id: input.user_id,
    subject_id: input.subject_id,
    name: input.name,
    color: input.color,
    order: input.order,
  });
  if (error) throw error;
  return id;
}

export async function updateTopic(
  user_id: string,
  id: string,
  fields: Partial<Pick<Topic, 'name' | 'color' | 'order'>>,
) {
  const { error } = await supabase
    .from('topics')
    .update(fields)
    .eq('user_id', user_id)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteTopic(user_id: string, id: string) {
  const { error } = await supabase.from('topics').delete().eq('user_id', user_id).eq('id', id);
  if (error) throw error;
}
