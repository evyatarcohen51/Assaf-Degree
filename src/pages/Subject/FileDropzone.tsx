import { useRef, useState } from 'react';
import { addFile } from '../../hooks/useFiles';

export function FileDropzone({ subjectId }: { subjectId: string }) {
  const [hover, setHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    for (const f of Array.from(files)) {
      await addFile(subjectId, f);
    }
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
      <p className="font-display font-bold uppercase">גרור קבצים לכאן</p>
      <p className="text-xs text-ink/60">או</p>
      <button type="button" className="btn" onClick={() => inputRef.current?.click()}>
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
