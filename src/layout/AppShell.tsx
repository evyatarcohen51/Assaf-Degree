import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { HamburgerHeader } from './HamburgerHeader';

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-full bg-cream text-ink">
      <HamburgerHeader open={open} onToggle={() => setOpen((v) => !v)} />

      {/* Mobile overlay sidebar */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`
          fixed top-0 bottom-0 z-50 w-72 border-s-2 border-ink bg-paper p-4
          right-0
          transform-gpu md:translate-x-0
          ${open ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}
      >
        <Sidebar onNavigate={() => setOpen(false)} />
      </aside>

      <main className="md:me-72 min-h-screen p-4 pt-20 md:pt-6">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
