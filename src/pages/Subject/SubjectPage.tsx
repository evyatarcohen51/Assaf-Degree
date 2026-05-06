import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useTable } from '../../lib/useRealtime';
import { TopicGrid } from './TopicGrid';
import { GradesSection } from './GradesSection';
import type { Subject } from '../../types/domain';

export function SubjectPage() {
  const { user } = useAuth();
  const { yearId, semId, subjectId } = useParams<{
    yearId: string;
    semId: string;
    subjectId: string;
  }>();
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

  if (!yearId || !semId || !subjectId) return null;

  return (
    <div className="flex flex-col gap-6">
      <header className="card bg-yellow">
        <h1 className="text-3xl">
          <bdi>{subject?.name ?? '—'}</bdi>
        </h1>
        {subject && subject.credit_points > 0 && (
          <p className="text-sm text-ink/70 mt-1">
            נקודות זכות: <strong>{subject.credit_points}</strong>
          </p>
        )}
      </header>

      <TopicGrid subjectId={subjectId} yearId={yearId} semId={semId} />

      <GradesSection subjectId={subjectId} />
    </div>
  );
}
