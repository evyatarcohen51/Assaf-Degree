import { useMemo, useState } from 'react';
import { useSubjectsBySemester } from '../../hooks/useTreeData';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { newId } from '../../lib/ids';
import type { Subject } from '../../types/domain';

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
    <section className="card">
      <h2 className="text-xl mb-3">קורסים</h2>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_8rem_auto] gap-2 mb-3">
        <input
          className="field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          placeholder="שם קורס"
          dir="auto"
        />
        <input
          className="field"
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
        <button type="button" className="btn" onClick={handleAdd}>
          הוסף
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {display.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between gap-3 rounded-xl border-2 border-ink bg-paper px-3 py-2"
          >
            <span className="font-bold flex-1">
              <bdi>{s.name}</bdi>
            </span>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-ink/70">נק׳ זכות</span>
              <input
                type="number"
                step="0.5"
                min="0"
                defaultValue={s.credit_points}
                onBlur={(e) => handleUpdateCredits(s.id, e.target.value)}
                className="w-16 rounded-md border-2 border-ink bg-cream px-2 py-1"
              />
            </label>
            <button
              type="button"
              className="btn-secondary !px-3 !py-1 text-sm"
              onClick={() => handleRemove(s.id)}
            >
              מחק
            </button>
          </li>
        ))}
        {display.length === 0 && (
          <li className="text-sm text-ink/50">אין קורסים עדיין</li>
        )}
      </ul>
    </section>
  );
}
