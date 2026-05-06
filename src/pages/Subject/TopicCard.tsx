import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { deleteTopic } from '../../hooks/useTopics';
import { r } from '../../lib/routes';
import type { Topic, TopicColor } from '../../types/domain';

const COLOR_BG: Record<TopicColor, string> = {
  yellow: 'bg-yellow',
  orange: 'bg-orange',
  red: 'bg-red',
  purple: 'bg-purple',
  blue: 'bg-blue',
  green: 'bg-green',
};

const TEXT_ON_COLOR: Record<TopicColor, string> = {
  yellow: 'text-ink',
  orange: 'text-ink',
  red: 'text-cream',
  purple: 'text-cream',
  blue: 'text-cream',
  green: 'text-cream',
};

export function TopicCard({
  topic,
  yearId,
  semId,
  subjectId,
}: {
  topic: Topic;
  yearId: string;
  semId: string;
  subjectId: string;
}) {
  const { user } = useAuth();

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (!confirm(`למחוק את הנושא "${topic.name}" וכל הקבצים בו?`)) return;
    try {
      await deleteTopic(user.id, topic.id);
    } catch (err) {
      alert(`מחיקה נכשלה: ${err instanceof Error ? err.message : err}`);
    }
  }

  return (
    <Link
      to={r.topic(yearId, semId, subjectId, topic.id)}
      className={`relative flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-ink ${COLOR_BG[topic.color]} ${TEXT_ON_COLOR[topic.color]} p-4 shadow-sticker font-display font-black text-xl text-center`}
    >
      <bdi className="break-words">{topic.name}</bdi>
      <button
        type="button"
        onClick={handleDelete}
        aria-label="מחק נושא"
        className="absolute top-2 left-2 h-6 w-6 rounded-full border-2 border-ink bg-cream text-ink text-xs font-bold leading-none flex items-center justify-center"
      >
        ×
      </button>
    </Link>
  );
}
