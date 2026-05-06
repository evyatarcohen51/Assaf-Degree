import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useUpcomingDeadlines } from '../../hooks/useDeadlines';
import { useAllSubjects } from '../../hooks/useTreeData';
import { newId } from '../../lib/ids';
import { formatDateHe } from '../../lib/progress';
import type { DeadlineKind } from '../../types/domain';

const KIND_LABEL: Record<DeadlineKind, string> = {
  exam: 'מבחן',
  assignment: 'מטלה',
  other: 'אחר',
};

export function UpcomingDeadlines() {
  const { user } = useAuth();
  const deadlines = useUpcomingDeadlines();
  const subjects = useAllSubjects();
  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? '—';

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [kind, setKind] = useState<DeadlineKind>('exam');

  async function handleAdd() {
    if (!user) return;
    if (!title.trim() || !date || !subjectId) return;
    await supabase.from('deadlines').insert({
      id: newId(),
      user_id: user.id,
      subject_id: subjectId,
      title: title.trim(),
      date,
      kind,
    });
    setTitle('');
    setDate('');
  }

  async function handleRemove(id: string) {
    if (!user) return;
    await supabase.from('deadlines').delete().eq('user_id', user.id).eq('id', id);
  }

  return (
    <div className="flex flex-col gap-3">
      {subjects.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <input
            className="field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="כותרת"
            dir="auto"
          />
          <select
            className="field"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            <option value="">— מקצוע —</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            className="field"
            value={kind}
            onChange={(e) => setKind(e.target.value as DeadlineKind)}
          >
            <option value="exam">מבחן</option>
            <option value="assignment">מטלה</option>
            <option value="other">אחר</option>
          </select>
          <input
            type="date"
            className="field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button type="button" className="btn" onClick={handleAdd}>
            הוסף
          </button>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {deadlines.map((d) => (
          <li
            key={d.id}
            className="flex items-center justify-between rounded-xl border-2 border-ink bg-paper px-3 py-2"
          >
            <div>
              <div className="font-bold">
                <bdi>{d.title}</bdi>{' '}
                <span className="text-xs text-ink/60">({KIND_LABEL[d.kind]})</span>
              </div>
              <div className="text-xs text-ink/60">
                <bdi>{subjectName(d.subject_id)}</bdi>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border-2 border-red bg-red px-3 py-1 font-display font-bold text-cream shadow-glow-red">
                {formatDateHe(d.date)}
              </span>
              <button
                type="button"
                className="btn-secondary !px-3 !py-1 text-sm"
                onClick={() => handleRemove(d.id)}
              >
                מחק
              </button>
            </div>
          </li>
        ))}
        {deadlines.length === 0 && (
          <li className="text-sm text-ink/50">אין מועדים קרובים</li>
        )}
      </ul>
    </div>
  );
}
