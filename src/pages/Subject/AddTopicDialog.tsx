import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { addTopic } from '../../hooks/useTopics';
import { USE_SOFT_DESIGN } from '../../lib/design';
import type { TopicColor } from '../../types/domain';

const COLORS: { value: TopicColor; bgClass: string; softColor: string }[] = [
  { value: 'yellow', bgClass: 'bg-yellow', softColor: '#F7DC6F' },
  { value: 'orange', bgClass: 'bg-orange', softColor: '#F7DC6F' },
  { value: 'red',    bgClass: 'bg-red',    softColor: '#F1948A' },
  { value: 'purple', bgClass: 'bg-purple', softColor: '#AED6F1' },
  { value: 'blue',   bgClass: 'bg-blue',   softColor: '#AED6F1' },
  { value: 'green',  bgClass: 'bg-green',  softColor: '#A3E4D7' },
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

  if (USE_SOFT_DESIGN) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-soft-text/40 p-4"
        onClick={onClose}
      >
        <form
          className="card-soft w-full max-w-md flex flex-col gap-5"
          onClick={(e) => e.stopPropagation()}
          onSubmit={handleSubmit}
        >
          <h3 className="text-2xl font-display font-black text-soft-text">נושא חדש</h3>
          <label className="block">
            <span className="block text-sm text-soft-muted mb-2">שם</span>
            <input
              className="field-soft"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="לדוגמה: פרק 3 — נגזרות"
              autoFocus
              dir="auto"
            />
          </label>
          <div>
            <span className="block text-sm text-soft-muted mb-2">צבע</span>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  aria-label={c.value}
                  className={`h-11 w-11 rounded-full shadow-soft-pill transition ${
                    color === c.value ? 'ring-2 ring-soft-text ring-offset-2 ring-offset-soft-card scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.softColor }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" className="btn-soft" onClick={onClose}>
              ביטול
            </button>
            <button type="submit" className="btn-soft-primary" disabled={busy}>
              {busy ? '...' : 'הוסף'}
            </button>
          </div>
        </form>
      </div>
    );
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
