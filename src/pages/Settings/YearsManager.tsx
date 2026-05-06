import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { newId } from '../../lib/ids';
import { useYears, useAllSemesters } from '../../hooks/useTreeData';
import type { Year, Semester } from '../../types/domain';

export function YearsManager() {
  const { user } = useAuth();
  const years = useYears();
  const allSemesters = useAllSemesters();

  const [newYearLabel, setNewYearLabel] = useState('');

  async function handleAddYear() {
    if (!user) return;
    const label = newYearLabel.trim();
    if (!label) return;
    const order = years.length;
    const { error } = await supabase.from('years').insert({
      id: newId(),
      user_id: user.id,
      label,
      order,
    });
    if (error) alert(`הוספה נכשלה: ${error.message}`);
    setNewYearLabel('');
  }

  async function handleUpdateYear(id: string, label: string) {
    if (!user) return;
    await supabase.from('years').update({ label }).eq('user_id', user.id).eq('id', id);
  }

  async function handleDeleteYear(id: string) {
    if (!user) return;
    if (!confirm('למחוק את השנה? כל הסמסטרים והקורסים בתוכה יימחקו.')) return;
    await supabase.from('years').delete().eq('user_id', user.id).eq('id', id);
  }

  return (
    <section className="card">
      <h2 className="text-xl mb-3">שנות לימודים</h2>

      <div className="flex gap-2 mb-3">
        <input
          className="field flex-1"
          value={newYearLabel}
          onChange={(e) => setNewYearLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddYear();
          }}
          placeholder='שם שנה (לדוגמה: תשפ"ו)'
          dir="auto"
        />
        <button type="button" className="btn" onClick={handleAddYear}>
          הוסף שנה
        </button>
      </div>

      {years.length === 0 ? (
        <p className="text-sm text-ink/50">אין שנים עדיין</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {years.map((year) => (
            <YearRow
              key={year.id}
              year={year}
              semesters={allSemesters.filter((s) => s.year_id === year.id)}
              onUpdate={(label) => handleUpdateYear(year.id, label)}
              onDelete={() => handleDeleteYear(year.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function YearRow({
  year,
  semesters,
  onUpdate,
  onDelete,
}: {
  year: Year;
  semesters: Semester[];
  onUpdate: (label: string) => void;
  onDelete: () => void;
}) {
  const { user } = useAuth();
  const [label, setLabel] = useState(year.label);
  const [open, setOpen] = useState(true);
  const [newSemLabel, setNewSemLabel] = useState('');
  const [newSemStart, setNewSemStart] = useState('');
  const [newSemEnd, setNewSemEnd] = useState('');

  async function handleAddSemester() {
    if (!user) return;
    if (!newSemLabel.trim()) return;
    const { error } = await supabase.from('semesters').insert({
      id: newId(),
      user_id: user.id,
      year_id: year.id,
      label: newSemLabel.trim(),
      start_date: newSemStart || null,
      end_date: newSemEnd || null,
    });
    if (error) alert(`הוספה נכשלה: ${error.message}`);
    setNewSemLabel('');
    setNewSemStart('');
    setNewSemEnd('');
  }

  async function handleUpdateSemester(
    id: string,
    fields: Partial<Pick<Semester, 'label' | 'start_date' | 'end_date'>>,
  ) {
    if (!user) return;
    await supabase.from('semesters').update(fields).eq('user_id', user.id).eq('id', id);
  }

  async function handleDeleteSemester(id: string) {
    if (!user) return;
    if (!confirm('למחוק את הסמסטר?')) return;
    await supabase.from('semesters').delete().eq('user_id', user.id).eq('id', id);
  }

  return (
    <li className="rounded-xl border-2 border-ink bg-cream">
      <div className="flex items-center gap-2 p-3 border-b-2 border-ink/20">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="font-bold text-lg"
          aria-label={open ? 'סגור' : 'פתח'}
        >
          {open ? '▾' : '▸'}
        </button>
        <input
          className="field flex-1"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => label !== year.label && onUpdate(label)}
          dir="auto"
        />
        <button type="button" className="btn-secondary !px-3 !py-1 text-sm" onClick={onDelete}>
          מחק שנה
        </button>
      </div>

      {open && (
        <div className="p-3">
          <h3 className="font-display font-bold uppercase text-sm mb-2">סמסטרים</h3>
          {semesters.length === 0 ? (
            <p className="text-sm text-ink/50 mb-2">אין סמסטרים בשנה זו</p>
          ) : (
            <ul className="flex flex-col gap-2 mb-3">
              {semesters.map((sem) => (
                <SemesterRow
                  key={sem.id}
                  semester={sem}
                  onUpdate={(fields) => handleUpdateSemester(sem.id, fields)}
                  onDelete={() => handleDeleteSemester(sem.id)}
                />
              ))}
            </ul>
          )}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
            <input
              className="field"
              value={newSemLabel}
              onChange={(e) => setNewSemLabel(e.target.value)}
              placeholder="שם סמסטר"
              dir="auto"
            />
            <input
              type="date"
              className="field"
              value={newSemStart}
              onChange={(e) => setNewSemStart(e.target.value)}
            />
            <input
              type="date"
              className="field"
              value={newSemEnd}
              onChange={(e) => setNewSemEnd(e.target.value)}
            />
            <button
              type="button"
              className="btn"
              onClick={handleAddSemester}
            >
              הוסף סמסטר
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function SemesterRow({
  semester,
  onUpdate,
  onDelete,
}: {
  semester: Semester;
  onUpdate: (fields: Partial<Pick<Semester, 'label' | 'start_date' | 'end_date'>>) => void;
  onDelete: () => void;
}) {
  const [label, setLabel] = useState(semester.label);
  const [start, setStart] = useState(semester.start_date ?? '');
  const [end, setEnd] = useState(semester.end_date ?? '');

  return (
    <li className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-2 items-center rounded-lg border-2 border-ink bg-paper px-3 py-2">
      <input
        className="field"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={() => label !== semester.label && onUpdate({ label })}
        dir="auto"
      />
      <input
        type="date"
        className="field"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        onBlur={() => start !== (semester.start_date ?? '') && onUpdate({ start_date: start || null })}
      />
      <input
        type="date"
        className="field"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        onBlur={() => end !== (semester.end_date ?? '') && onUpdate({ end_date: end || null })}
      />
      <button type="button" className="btn-secondary !px-3 !py-1 text-sm" onClick={onDelete}>
        מחק
      </button>
    </li>
  );
}
