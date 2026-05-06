import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useTable } from '../lib/useRealtime';
import type { Deadline } from '../types/domain';

export function useUpcomingDeadlines(limit = 8): Deadline[] {
  const { user } = useAuth();
  return useTable<Deadline[]>(
    'deadlines',
    async () => {
      if (!user) return [];
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
    [limit],
  ) ?? [];
}
