import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { deleteTopic } from '../../hooks/useTopics';
import { r } from '../../lib/routes';
import type { Topic, TopicColor } from '../../types/domain';

// `text-{color}` drives `fill="currentColor"` on the SVG path.
const COLOR_FILL: Record<TopicColor, string> = {
  yellow: 'text-yellow',
  orange: 'text-orange',
  red: 'text-red',
  purple: 'text-purple',
  blue: 'text-blue',
  green: 'text-green',
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
      className="relative block aspect-square"
      style={{ filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.22))' }}
    >
      {/* Folder silhouette — viewBox 100×100, tab on the start side (right in RTL) */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full ${COLOR_FILL[topic.color]}`}
      >
        <path
          d="M 10 14 Q 0 14 0 22 V 90 Q 0 100 10 100 H 90 Q 100 100 100 90 V 10 Q 100 0 90 0 H 62 Q 52 0 52 14 Z"
          fill="currentColor"
        />
      </svg>
      {/* Text content — pushed down past the tab area */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center gap-1 px-2 pb-2 pt-[20%] ${TEXT_ON_COLOR[topic.color]} font-display font-black text-xs text-center`}
      >
        <bdi className="break-words">{topic.name}</bdi>
      </div>
      {/* Delete button — top-end corner of the body (visual left in RTL) */}
      <button
        type="button"
        onClick={handleDelete}
        aria-label="מחק נושא"
        className="absolute top-[18%] end-1 h-4 w-4 rounded-full bg-black/20 text-white text-[10px] font-bold leading-none flex items-center justify-center hover:bg-black/40"
      >
        ×
      </button>
    </Link>
  );
}
