import { useEffect, useState, useCallback, useRef, useId } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth';

type Fetcher<T> = () => Promise<T>;

/**
 * Generic hook: fetches data from Supabase and re-fetches when the table changes.
 * Provides Dexie's useLiveQuery-like behavior using Postgres Changes (Realtime).
 *
 * Each call gets a unique channel name (via useId) so multiple components
 * subscribing to the same table don't share — and conflict on — a channel.
 */
export function useTable<T>(
  table: string,
  fetcher: Fetcher<T>,
  deps: ReadonlyArray<unknown> = [],
): T | undefined {
  const { user } = useAuth();
  const [data, setData] = useState<T | undefined>(undefined);
  const fetchRef = useRef(fetcher);
  fetchRef.current = fetcher;
  const instanceId = useId();

  const reload = useCallback(() => {
    fetchRef.current()
      .then(setData)
      .catch((err) => {
        console.error(`useTable(${table}) failed:`, err);
        setData(undefined);
      });
  }, [table]);

  useEffect(() => {
    if (!user) {
      setData(undefined);
      return;
    }
    reload();
    const channelName = `${table}-${user.id}-${instanceId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `user_id=eq.${user.id}` },
        reload,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, table, reload, instanceId, ...deps]);

  return data;
}
