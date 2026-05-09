import { USE_SOFT_DESIGN } from '../lib/design';

export function HamburgerHeader({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  if (USE_SOFT_DESIGN) {
    return (
      <header className="lg:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between bg-soft-cream/95 backdrop-blur px-4 py-3 border-b border-soft-border">
        <h1 className="font-display text-2xl font-black tracking-tight text-soft-text">Got Schooled</h1>
        <button
          type="button"
          aria-label="תפריט"
          aria-expanded={open}
          onClick={onToggle}
          className="rounded-soft-pill bg-soft-mustard text-soft-text px-3 py-2 shadow-soft-pill transition hover:brightness-105"
        >
          <span className="block w-5">
            <span className="block h-0.5 bg-soft-text mb-1" />
            <span className="block h-0.5 bg-soft-text mb-1" />
            <span className="block h-0.5 bg-soft-text" />
          </span>
        </button>
      </header>
    );
  }

  return (
    <header className="lg:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between border-b-2 border-ink bg-cream px-4 py-3">
      <h1 className="font-display text-2xl font-black tracking-tight">Got Schooled</h1>
      <button
        type="button"
        aria-label="תפריט"
        aria-expanded={open}
        onClick={onToggle}
        className="rounded-full border-2 border-ink bg-yellow px-3 py-2 font-display font-bold uppercase shadow-sticker"
      >
        <span className="block w-5">
          <span className="block h-0.5 bg-ink mb-1" />
          <span className="block h-0.5 bg-ink mb-1" />
          <span className="block h-0.5 bg-ink" />
        </span>
      </button>
    </header>
  );
}
