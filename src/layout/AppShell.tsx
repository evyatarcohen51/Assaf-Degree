import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { HamburgerHeader } from './HamburgerHeader';
import { USE_SOFT_DESIGN } from '../lib/design';

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const asideClass = USE_SOFT_DESIGN
    ? `fixed top-0 bottom-0 z-50 w-72 bg-soft-card p-5 right-0 transform-gpu lg:translate-x-0 shadow-soft ${
        open ? 'translate-x-0 shadow-soft-lg' : 'translate-x-full lg:translate-x-0'
      }`
    : `fixed top-0 bottom-0 z-50 w-72 border-s-2 border-ink bg-paper p-4 right-0 transform-gpu lg:translate-x-0 ${
        open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`;

  return (
    <div className={USE_SOFT_DESIGN ? 'min-h-full text-soft-text' : 'min-h-full text-ink'}>
      <HamburgerHeader open={open} onToggle={() => setOpen((v) => !v)} />

      {/* Mobile overlay sidebar */}
      {open && (
        <div
          className={USE_SOFT_DESIGN ? 'fixed inset-0 z-40 bg-soft-text/30 lg:hidden' : 'fixed inset-0 z-40 bg-ink/40 lg:hidden'}
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={asideClass}>
        <Sidebar onNavigate={() => setOpen(false)} />
      </aside>

      <main className="lg:ms-72 min-h-screen p-4 pt-20 lg:pt-6">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
