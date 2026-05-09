import { useRef, useState } from 'react';
import { addFile } from '../../hooks/useFiles';
import { useAuth } from '../../lib/auth';
import { USE_SOFT_DESIGN } from '../../lib/design';
import { CloudUploadIcon } from '../../ui/icons';

export function FileDropzone({
  subjectId,
  topicId,
}: {
  subjectId: string;
  topicId: string;
}) {
  const { user } = useAuth();
  const [hover, setHover] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || !user) return;
    setBusy(true);
    try {
      for (const f of Array.from(files)) {
        await addFile(user.id, subjectId, topicId, f);
      }
    } finally {
      setBusy(false);
    }
  }

  if (USE_SOFT_DESIGN) {
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={(e) => {
          e.preventDefault();
          setHover(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-3 rounded-soft border-2 border-dashed p-10 text-center transition-all ${
          hover
            ? 'border-soft-mustard bg-soft-mustard/20 scale-[1.01]'
            : 'border-soft-border bg-soft-cream hover:border-soft-mustard/50'
        }`}
      >
        <div className={`rounded-full bg-soft-card p-4 shadow-soft-pill text-soft-mustard transition-transform ${hover ? 'scale-110' : ''}`}>
          <CloudUploadIcon size={32} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-medium text-soft-text text-base">{busy ? 'מעלה...' : 'גרור קבצים לכאן'}</p>
          <p className="text-xs text-soft-muted">תומך בכל סוגי הקבצים</p>
        </div>
        <button
          type="button"
          className="btn-soft-primary mt-1"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          בחר קובץ
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setHover(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink p-6 text-center ${
        hover ? 'bg-yellow' : 'bg-paper'
      }`}
    >
      <p className="font-display font-bold uppercase">{busy ? 'מעלה...' : 'גרור קבצים לכאן'}</p>
      <p className="text-xs text-ink/60">או</p>
      <button
        type="button"
        className="btn"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
      >
        בחר קובץ
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
