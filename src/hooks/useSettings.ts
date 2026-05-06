import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useTable } from '../lib/useRealtime';
import type { Settings, Profile } from '../types/domain';

export function useSettings(): Settings | undefined {
  const { user } = useAuth();
  return useTable<Settings | null>('settings', async () => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }) ?? undefined;
}

export function useProfile(): Profile | undefined {
  const { user } = useAuth();
  return useTable<Profile | null>('profile', async () => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }) ?? undefined;
}
