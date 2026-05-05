import { useState } from 'react';
import { useSubjectsBySemester } from '../../hooks/useTreeData';
import { db } from '../../db';
import { newId } from '../../lib/ids';

export function SubjectsSection({ semesterId }: { semesterId: string }) {
  const subjects = useSubjectsBySemester(semesterId);
  const [name, setName] = useState('');

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    await db.subjects.add({ id: newId(), semesterId, name: trimmed });
    setName('');
  }

  async function handleRemove(id: string) {
    if (!confirm('למחוק את המקצוע?')) return;
    await db.subjects.delete(id);
    await db.scheduleSlots.where('subjectId').equals(id).delete();
    await db.notes.delete(id);
  }

  return (
    <section className="card">
      <h2 className="text-xl mb-3">מקצועות</h2>
      <div className="flex gap-2 mb-3">
        <input
          className="field flex-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          placeholder="הוסף מקצוע (Enter)"
          dir="auto"
        />
        <button type="button" className="btn" onClick={handleAdd}>
          הוסף
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {subjects.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between rounded-xl border-2 border-ink bg-paper px-3 py-2"
          >
            <span className="font-bold">
              <bdi>{s.name}</bdi>
            </span>
            <button
              type="button"
              className="btn-secondary !px-3 !py-1 text-sm"
              onClick={() => handleRemove(s.id)}
            >
              מחק
            </button>
          </li>
        ))}
        {subjects.length === 0 && (
          <li className="text-sm text-ink/50">אין מקצועות עדיין</li>
        )}
      </ul>
    </section>
  );
}
