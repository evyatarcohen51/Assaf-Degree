import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useTable } from '../../lib/useRealtime';
import { useNote, saveNote } from '../../hooks/useNotes';
import { FileDropzone } from './FileDropzone';
import { FileList } from './FileList';
import type { Subject } from '../../types/domain';

export function SubjectPage() {
  const { user } = useAuth();
  const { subjectId } = useParams<{ subjectId: string }>();
  const subject = useTable<Subject | null>(
    'subjects',
    async () => {
      if (!user || !subjectId) return null;
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .eq('id', subjectId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    [subjectId],
  );
  const note = useNote(subjectId);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (note?.content !== undefined) setDraft(note.content);
  }, [subjectId, note?.content]);

  useEffect(() => {
    if (!subjectId || !user) return;
    const t = setTimeout(() => {
      if (draft !== (note?.content ?? '')) saveNote(user.id, subjectId, draft);
    }, 500);
    return () => clearTimeout(t);
  }, [draft, subjectId, note?.content, user?.id]);

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
