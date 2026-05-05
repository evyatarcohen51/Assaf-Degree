import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { useNote, saveNote } from '../../hooks/useNotes';
import { FileDropzone } from './FileDropzone';
import { FileList } from './FileList';

export function SubjectPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const subject = useLiveQuery(() => (subjectId ? db.subjects.get(subjectId) : undefined), [subjectId]);
  const note = useNote(subjectId);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (note?.content !== undefined) setDraft(note.content);
  }, [subjectId, note?.content]);

  useEffect(() => {
    if (!subjectId) return;
    const t = setTimeout(() => {
      if (draft !== (note?.content ?? '')) saveNote(subjectId, draft);
    }, 500);
    return () => clearTimeout(t);
  }, [draft, subjectId, note?.content]);

  if (!subjectId) return null;

  return (
    <div className="flex flex-col gap-6">
      <header className="card bg-yellow">
        <h1 className="text-3xl">
          <bdi>{subject?.name ?? '—'}</bdi>
        </h1>
      </header>

      <section className="card">
        <h2 className="text-xl mb-3">הערות</h2>
        <textarea
          className="field min-h-[16rem] font-body"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          dir="auto"
          placeholder="כתוב כאן..."
        />
        <p className="mt-1 text-xs text-ink/50">נשמר אוטומטית</p>
      </section>

      <section className="card">
        <h2 className="text-xl mb-3">קבצים</h2>
        <FileDropzone subjectId={subjectId} />
        <div className="mt-4">
          <FileList subjectId={subjectId} />
        </div>
      </section>
    </div>
  );
}
