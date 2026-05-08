import { useState } from 'react';
import { useTopicsBySubject } from '../../hooks/useTopics';
import { TopicCard } from './TopicCard';
import { AddTopicDialog } from './AddTopicDialog';

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
