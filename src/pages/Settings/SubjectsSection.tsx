import { useMemo, useState } from 'react';
import { useSubjectsBySemester } from '../../hooks/useTreeData';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { newId } from '../../lib/ids';
import { SUBJECT_COLORS, SUBJECT_COLOR_BG, type SubjectColor } from '../../lib/subjectColors';
import { USE_SOFT_DESIGN } from '../../lib/design';
import type { Subject } from '../../types/domain';

const T = USE_SOFT_DESIGN
  ? {
      card: 'card-soft',
      title: 'text-xl font-bold text-soft-text mb-4',
      field: 'field-soft',
      btnPrimary: 'btn-soft-primary',
      btnSec: 'btn-soft text-sm !px-3 !py-1',
      itemRow: 'flex flex-wrap items-center justify-between gap-3 rounded-soft-md bg-soft-cream px-4 py-3 shadow-soft-pill',
      empty: 'text-sm text-soft-muted',
      label: 'font-medium text-soft-text flex-1 min-w-[8rem]',
      cpLabel: 'flex items-center gap-2 text-sm text-soft-muted',
      cpInput: 'w-16 rounded-soft-pill bg-soft-input text-soft-text px-3 py-1 shadow-soft-inset outline-none',
      colorRing: 'ring-2 ring-soft-text ring-offset-2 ring-offset-soft-cream scale-110',
    }
  : {
      card: 'card',
      title: 'text-xl mb-3',
      field: 'field',
      btnPrimary: 'btn',
      btnSec: 'btn-secondary !px-3 !py-1 text-sm',
      itemRow: 'flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink bg-paper px-3 py-2',
      empty: 'text-sm text-ink/50',
      label: 'font-bold flex-1 min-w-[8rem]',
      cpLabel: 'flex items-center gap-2 text-sm',
      cpInput: 'w-16 rounded-md border-2 border-ink bg-cream px-2 py-1',
      colorRing: 'shadow-sticker',
    };

export function SubjectsSection({ semesterId }: { semesterId: string }) {
  const { user } = useAuth();
  const subjects = useSubjectsBySemester(semesterId);
  const [name, setName] = useState('');
  const [creditPoints, setCreditPoints] = useState('');
  const [pendingAdds, setPendingAdds] = useState<Subject[]>([]);
  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set());

  const display = useMemo(() => {
    const fromServerVisible = subjects.filter((s) => !pendingDeletes.has(s.id));
    const knownIds = new Set(subjects.map((s) => s.id));
    const stillPendingAdds = pendingAdds.filter((p) => !knownIds.has(p.id));
    return [...fromServerVisible, ...stillPendingAdds];
  }, [subjects, pendingAdds, pendingDeletes]);

  async function handleAdd() {
    if (!user) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const cp = Number(creditPoints) || 0;
    setName('');
    setCreditPoints('');
    const optimistic: Subject = {
      id: newId(),
      user_id: user.id,
      semester_id: semesterId,
      name: trimmed,
      color: null,
      credit_points: cp,
    };
    setPendingAdds((prev) => [...prev, optimistic]);
    const { error } = await supabase.from('subjects').insert(optimistic);
    if (error) {
      setPendingAdds((prev) => prev.filter((p) => p.id !== optimistic.id));
      alert(`הוספה נכשלה: ${error.message}`);
    }
  }

  async function handleUpdateCredits(id: string, value: string) {
    if (!user) return;
    const cp = Number(value);
    if (isNaN(cp)) return;
    const { error } = await supabase
      .from('subjects')
      .update({ credit_points: cp })
      .eq('user_id', user.id)
      .eq('id', id);
    if (error) alert(`עדכון נכשל: ${error.message}`);
  }

  async function handleUpdateColor(id: string, color: SubjectColor | null) {
    if (!user) return;
    const { error } = await supabase
      .from('subjects')
      .update({ color })
      .eq('user_id', user.id)
      .eq('id', id);
    if (error) alert(`עדכון נכשל: ${error.message}`);
  }

  async function handleRemove(id: string) {
    if (!user) return;
    if (!confirm('למחוק את הקורס?')) return;
    setPendingDeletes((prev) => new Set(prev).add(id));
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('user_id', user.id)
      .eq('id', id);
    if (error) {
      setPendingDeletes((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      alert(`מחיקה נכשלה: ${error.message}`);
    }
  }

  return (
    <section className={T.card}>
      <h2 className={T.title}>קורסים</h2>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_8rem_auto] gap-2 mb-4">
        <input
          className={T.field}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          placeholder="שם קורס"
          dir="auto"
        />
        <input
          className={T.field}
          type="number"
          step="0.5"
          min="0"
          value={creditPoints}
          onChange={(e) => setCreditPoints(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          placeholder="נק׳ זכות"
        />
        <button type="button" className={T.btnPrimary} onClick={handleAdd}>
          הוסף
        </button>
      </div>
      <ul className="flex flex-col gap-2.5">
        {display.map((s) => (
          <li key={s.id} className={T.itemRow}>
            <span className={T.label}>
              <bdi>{s.name}</bdi>
            </span>
            <div
              role="radiogroup"
              aria-label="צבע קורס"
              className="flex flex-wrap items-center gap-2"
            >
              {SUBJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={s.color === c}
                  aria-label={c}
                  onClick={() => handleUpdateColor(s.id, c)}
                  className={`h-8 w-8 rounded-full transition ${SUBJECT_COLOR_BG[c]} ${
                    s.color === c ? T.colorRing : USE_SOFT_DESIGN ? 'shadow-soft-pill' : 'border-2 border-ink'
                  }`}
                />
              ))}
            </div>
            <label className={T.cpLabel}>
              <span>נק׳ זכות</span>
              <input
                type="number"
                step="0.5"
                min="0"
                defaultValue={s.credit_points}
                onBlur={(e) => handleUpdateCredits(s.id, e.target.value)}
                className={T.cpInput}
              />
            </label>
            <button
              type="button"
              className={T.btnSec}
              onClick={() => handleRemove(s.id)}
            >
              מחק
            </button>
          </li>
        ))}
        {display.length === 0 && (
          <li className={T.empty}>אין קורסים עדיין</li>
        )}
      </ul>
    </section>
  );
}
