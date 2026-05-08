import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { addFile } from '../../hooks/useFiles';
import { PROVIDERS, pickFromProvider, type CloudProvider } from '../../lib/cloudPickers';

export function CloudPickerButton({
  subjectId,
  topicId,
}: {
  subjectId: string;
  topicId: string;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<CloudProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const enabled = PROVIDERS.filter((p) => p.enabled);
  if (enabled.length === 0) return null;

  async function handlePick(provider: CloudProvider) {
    if (!user) return;
    setOpen(false);
    setError(null);
    setBusy(provider);
    try {
      const picked = await pickFromProvider(provider);
      if (!picked) return;
      const file = new File([picked.blob], picked.name, { type: picked.mime });
      await addFile(user.id, subjectId, topicId, file);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'שגיאה בהעלאה');
    } finally {
      setBusy(null);
    }
  }

  const busyLabel =
    busy && (PROVIDERS.find((p) => p.id === busy)?.label ?? '');

  return (
    <div className="mt-3 flex flex-col items-center gap-2">
      <div className="text-xs text-ink/50">או</div>
      <div ref={containerRef} className="relative flex items-center gap-2">
        <button
          type="button"
          className="btn"
          onClick={() => setOpen((v) => !v)}
          disabled={busy !== null}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {busy ? `מעלה מ-${busyLabel}...` : 'העלה ממקור חיצוני ▾'}
        </button>
        {busy && (
          <button
            type="button"
            className="text-sm text-ink/70 underline hover:text-ink"
            onClick={() => {
              setBusy(null);
              setError(null);
            }}
          >
            ביטול
          </button>
        )}
        {open && (
          <div
            role="menu"
            className="absolute left-1/2 top-full z-20 mt-2 min-w-[12rem] -translate-x-1/2 overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-sticker"
          >
            {enabled.map((p) => (
              <button
                key={p.id}
                type="button"
                role="menuitem"
                className="block w-full px-4 py-2 text-start hover:bg-yellow"
                onClick={() => handlePick(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red">{error}</p>}
    </div>
  );
}
