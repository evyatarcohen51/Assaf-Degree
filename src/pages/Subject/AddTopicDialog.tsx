import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { addTopic } from '../../hooks/useTopics';
import type { TopicColor } from '../../types/domain';

const COLORS: { value: TopicColor; bgClass: string }[] = [
  { value: 'yellow', bgClass: 'bg-yellow' },
  { value: 'orange', bgClass: 'bg-orange' },
  { value: 'red', bgClass: 'bg-red' },
  { value: 'purple', bgClass: 'bg-purple' },
  { value: 'blue', bgClass: 'bg-blue' },
  { value: 'green', bgClass: 'bg-green' },
];

export function AddTopicDialog({
  subjectId,
  nextOrder,
  onClose,
}: {
  subjectId: string;
  nextOrder: number;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [color, setColor] = useState<TopicColor>('yellow');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      await addTopic({
        user_id: user.id,
        subject_id: subjectId,
        name: trimmed,
        color,
        order: nextOrder,
      });
      onClose();
    } catch (err) {
      alert(`הוספה נכשלה: ${err instanceof Error ? err.message : err}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <form
        className="card w-full max-w-md flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3 className="text-2xl">נושא חדש</h3>
        <label className="block">
          <span className="block text-sm mb-1">שם</span>
          <input
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="לדוגמה: פרק 3 — נגזרות"
            autoFocus
            dir="auto"
          />
        </label>
        <div>
          <span className="block text-sm mb-2">צבע</span>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                aria-label={c.value}
                className={`h-10 w-10 rounded-full border-2 border-ink ${c.bgClass} ${
                  color === c.value ? 'shadow-sticker' : ''
                }`}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>
            ביטול
          </button>
          <button type="submit" className="btn" disabled={busy}>
            {busy ? '...' : 'הוסף'}
          </button>
        </div>
      </form>
    </div>
  );
}
