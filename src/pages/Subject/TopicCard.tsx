import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { deleteTopic } from '../../hooks/useTopics';
import { r } from '../../lib/routes';
import { USE_SOFT_DESIGN } from '../../lib/design';
import type { Topic, TopicColor } from '../../types/domain';

// Original sticker palette — drives `fill="currentColor"` on the SVG path.
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

// Soft pastel palette (Gemini exact spec) — folder body fill
const SOFT_FOLDER_FILL: Record<TopicColor, string> = {
  yellow: '#F7DC6F',  // exercises (Gemini exact)
  orange: '#F7DC6F',
  red:    '#F1948A',  // tests (Gemini exact)
  purple: '#AED6F1',  // materials (Gemini exact)
  blue:   '#AED6F1',
  green:  '#A3E4D7',  // labs / submissions (Gemini exact)
};

// Slightly darker tone for the back-half of the folder (gives 3D depth)
const SOFT_FOLDER_BACK: Record<TopicColor, string> = {
  yellow: '#E8C547',
  orange: '#E8C547',
  red:    '#D87268',
  purple: '#8DBBE0',
  blue:   '#8DBBE0',
  green:  '#82C9BA',
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

  if (USE_SOFT_DESIGN) {
    const fill = SOFT_FOLDER_FILL[topic.color];
    const back = SOFT_FOLDER_BACK[topic.color];
    return (
      <Link
        to={r.topic(yearId, semId, subjectId, topic.id)}
        className="relative block aspect-[3/4] transition hover:-translate-y-0.5"
        style={{ filter: 'drop-shadow(4px 6px 10px rgba(0,0,0,0.18)) drop-shadow(-2px -2px 4px rgba(255,255,255,0.6))' }}
      >
        <svg
          viewBox="0 0 100 110"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        >
          {/* Back half — slightly darker, peeks above the front (gives 3D depth) */}
          <path
            d="M 6 8 Q 0 8 0 16 V 30 H 100 V 18 Q 100 8 90 8 H 64 Q 56 8 54 14 L 52 18 H 12 Q 6 8 6 8 Z"
            fill={back}
          />
          {/* Front half — main folder body, rounded radius 18px */}
          <path
            d="M 4 22 Q 0 22 0 30 V 95 Q 0 105 10 105 H 90 Q 100 105 100 95 V 30 Q 100 22 92 22 Z"
            fill={fill}
          />
          {/* Subtle highlight along the top of the front half */}
          <path
            d="M 4 22 Q 0 22 0 30 V 32 H 100 V 30 Q 100 22 92 22 Z"
            fill="rgba(255,255,255,0.25)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-3 pb-3 pt-[28%] text-soft-text font-display font-bold text-sm text-center">
          <bdi className="break-words">{topic.name}</bdi>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          aria-label="מחק נושא"
          className="absolute top-[12%] end-2 h-5 w-5 rounded-full bg-soft-text/15 text-soft-text text-xs font-bold leading-none flex items-center justify-center hover:bg-soft-text/30 transition"
        >
          ×
        </button>
      </Link>
    );
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
