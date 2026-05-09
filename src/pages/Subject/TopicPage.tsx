import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useTable } from '../../lib/useRealtime';
import { useTopic } from '../../hooks/useTopics';
import { FileDropzone } from './FileDropzone';
import { FileList } from './FileList';
import { CloudPickerButton } from './CloudPickerButton';
import { r } from '../../lib/routes';
import { USE_SOFT_DESIGN } from '../../lib/design';
import { FolderIcon } from '../../ui/icons';
import type { Subject, TopicColor } from '../../types/domain';

const HEADER_BG: Record<TopicColor, string> = {
  yellow: 'bg-yellow',
  orange: 'bg-orange',
  red: 'bg-red',
  purple: 'bg-purple',
  blue: 'bg-blue',
  green: 'bg-green',
};

const HEADER_TEXT: Record<TopicColor, string> = {
  yellow: 'text-ink',
  orange: 'text-ink',
  red: 'text-cream',
  purple: 'text-cream',
  blue: 'text-cream',
  green: 'text-cream',
};

// Soft pastel hero bg per topic color (Gemini exact palette)
const SOFT_HEADER_BG: Record<TopicColor, string> = {
  yellow: 'bg-soft-mustard-pale',
  orange: 'bg-soft-mustard-pale',
  red: 'bg-soft-rose',
  purple: 'bg-soft-blue-pale',
  blue: 'bg-soft-blue-pale',
  green: 'bg-soft-green-pale',
};

export function TopicPage() {
  const { user } = useAuth();
  const { yearId, semId, subjectId, topicId } = useParams<{
    yearId: string;
    semId: string;
    subjectId: string;
    topicId: string;
  }>();
  const topic = useTopic(topicId);
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

  if (!yearId || !semId || !subjectId || !topicId) return null;

  if (USE_SOFT_DESIGN) {
    return (
      <div className="flex flex-col gap-7">
        <header
          className={`rounded-soft p-7 shadow-soft-lg ${
            topic ? SOFT_HEADER_BG[topic.color] : 'bg-soft-mustard-pale'
          }`}
        >
          <div className="text-sm text-soft-text/75 mb-1">
            <Link to={r.subject(yearId, semId, subjectId)} className="underline hover:text-soft-text transition">
              <bdi>{subject?.name ?? '...'}</bdi>
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-soft-text">
            <bdi>{topic?.name ?? '...'}</bdi>
          </h1>
        </header>

        <section className="card-soft">
          <h2 className="flex items-center gap-2 text-xl font-bold text-soft-text mb-5">
            <span>העלאת קבצים</span>
            <span className="text-soft-muted"><FolderIcon size={20} /></span>
          </h2>
          <FileDropzone subjectId={subjectId} topicId={topicId} />
          <div className="mt-3">
            <CloudPickerButton subjectId={subjectId} topicId={topicId} />
          </div>
        </section>

        <section className="card-soft">
          <h2 className="flex items-center gap-2 text-xl font-bold text-soft-text mb-5">
            <span>קבצים</span>
            <span className="text-soft-muted"><FolderIcon size={20} /></span>
          </h2>
          <FileList topicId={topicId} />
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header
        className={`card ${topic ? HEADER_BG[topic.color] : 'bg-yellow'} ${
          topic ? HEADER_TEXT[topic.color] : 'text-ink'
        }`}
      >
        <div className="text-sm opacity-80 mb-1">
          <Link to={r.subject(yearId, semId, subjectId)} className="underline">
            <bdi>{subject?.name ?? '...'}</bdi>
          </Link>
        </div>
        <h1 className="text-3xl">
          <bdi>{topic?.name ?? '...'}</bdi>
        </h1>
      </header>

      <section className="card">
        <h2 className="text-xl mb-3">העלאת קבצים</h2>
        <FileDropzone subjectId={subjectId} topicId={topicId} />
        <CloudPickerButton subjectId={subjectId} topicId={topicId} />
      </section>

      <section className="card">
        <h2 className="text-xl mb-3">קבצים</h2>
        <FileList topicId={topicId} />
      </section>
    </div>
  );
}
