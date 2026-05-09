import { useState } from 'react';
import { useTopicsBySubject } from '../../hooks/useTopics';
import { TopicCard } from './TopicCard';
import { AddTopicDialog } from './AddTopicDialog';
import { USE_SOFT_DESIGN } from '../../lib/design';
import { FolderIcon, PlusIcon } from '../../ui/icons';

export function TopicGrid({
  subjectId,
  yearId,
  semId,
}: {
  subjectId: string;
  yearId: string;
  semId: string;
}) {
  const topics = useTopicsBySubject(subjectId);
  const [showAdd, setShowAdd] = useState(false);

  if (USE_SOFT_DESIGN) {
    return (
      <section className="card-soft">
        <h2 className="flex items-center gap-2 text-xl font-bold text-soft-text mb-5">
          <span>נושאים</span>
          <span className="text-soft-muted"><FolderIcon size={20} /></span>
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {topics.map((t) => (
            <TopicCard
              key={t.id}
              topic={t}
              yearId={yearId}
              semId={semId}
              subjectId={subjectId}
            />
          ))}
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="aspect-[3/4] flex flex-col items-center justify-center gap-2 rounded-soft-md bg-soft-cream text-soft-muted shadow-soft-pill transition hover:shadow-soft-pill-hover hover:bg-soft-input/30"
            aria-label="הוסף נושא"
          >
            <PlusIcon size={32} />
            <span className="text-sm font-medium">הוסף</span>
          </button>
        </div>
        {showAdd && (
          <AddTopicDialog
            subjectId={subjectId}
            nextOrder={topics.length}
            onClose={() => setShowAdd(false)}
          />
        )}
      </section>
    );
  }

  return (
    <section className="card">
      <h2 className="text-xl mb-3">נושאים</h2>
      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
        {topics.map((t) => (
          <TopicCard
            key={t.id}
            topic={t}
            yearId={yearId}
            semId={semId}
            subjectId={subjectId}
          />
        ))}
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="aspect-square flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-ink bg-cream p-2 font-display font-black text-ink/60 hover:bg-paper"
        >
          <span className="text-2xl leading-none">＋</span>
          <span className="text-xs">הוסף</span>
        </button>
      </div>
      {showAdd && (
        <AddTopicDialog
          subjectId={subjectId}
          nextOrder={topics.length}
          onClose={() => setShowAdd(false)}
        />
      )}
    </section>
  );
}
