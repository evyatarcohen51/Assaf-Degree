import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth';

type Fetcher<T> = () => Promise<T>;

/**
 * Generic hook: fetches data from Supabase and re-fetches when the table changes.
 * Provides Dexie's useLiveQuery-like behavior using Postgres Changes (Realtime).
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

  const reload = useCallback(() => {
    fetchRef.current().then(setData).catch((err) => {
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
    const channel = supabase
      .channel(`${table}-${user.id}`)
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
  }, [user?.id, table, reload, ...deps]);

  return data;
}
