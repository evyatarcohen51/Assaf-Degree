import type { ReactNode } from 'react';
import { useFirstRunGuard } from './hooks/useFirstRunGuard';

export function GuardedRoutes({ children }: { children: ReactNode }) {
  useFirstRunGuard();
  return <>{children}</>;
}
