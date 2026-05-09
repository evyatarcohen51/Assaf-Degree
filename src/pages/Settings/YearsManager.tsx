import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { newId } from '../../lib/ids';
import { useYears, useAllSemesters } from '../../hooks/useTreeData';
import { USE_SOFT_DESIGN } from '../../lib/design';
import type { Year, Semester } from '../../types/domain';

const T = USE_SOFT_DESIGN
  ? {
      card: 'card-soft',
      title: 'text-xl font-bold text-soft-text mb-4',
      field: 'field-soft',
      btnPrimary: 'btn-soft-primary',
      btnSec: 'btn-soft text-sm !px-3 !py-1',
      empty: 'text-sm text-soft-muted',
      yearLi: 'rounded-soft-md bg-soft-cream shadow-soft-pill overflow-hidden',
      yearHead: 'flex items-center gap-2 p-3 border-b border-soft-border',
      semSubtitle: 'font-medium text-sm text-soft-text mb-3',
      semLi: 'grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-center rounded-soft-md bg-soft-card px-3 py-2 shadow-soft-pill',
    }
  : {
      card: 'card',
      title: 'text-xl mb-3',
      field: 'field',
      btnPrimary: 'btn',
      btnSec: 'btn-secondary !px-3 !py-1 text-sm',
      empty: 'text-sm text-ink/50',
      yearLi: 'rounded-xl border-2 border-ink bg-cream',
      yearHead: 'flex items-center gap-2 p-3 border-b-2 border-ink/20',
      semSubtitle: 'font-display font-bold uppercase text-sm mb-2',
      semLi: 'grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-center rounded-lg border-2 border-ink bg-paper px-3 py-2',
    };

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
    <section className={T.card}>
      <h2 className={T.title}>שנות לימודים</h2>

      <div className="flex gap-2 mb-3">
        <input
          className={`${T.field} flex-1`}
          value={newYearLabel}
          onChange={(e) => setNewYearLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddYear();
          }}
          placeholder='שם שנה (לדוגמה: תשפ"ו)'
          dir="auto"
        />
        <button type="button" className={T.btnPrimary} onClick={handleAddYear}>
          הוסף שנה
        </button>
      </div>

      {years.length === 0 ? (
        <p className={T.empty}>אין שנים עדיין</p>
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
  const [open, setOpen] = useState(false);
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
    <li className={T.yearLi}>
      <div className={T.yearHead}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="font-bold text-3xl leading-none px-2 py-1 min-w-[2.5rem]"
          aria-label={open ? 'סגור' : 'פתח'}
        >
          {open ? '▾' : '▸'}
        </button>
        <input
          className={`${T.field} flex-1`}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => label !== year.label && onUpdate(label)}
          dir="auto"
        />
        <button type="button" className={T.btnSec} onClick={onDelete}>
          מחק שנה
        </button>
      </div>

      {open && (
        <div className="p-3">
          <h3 className={T.semSubtitle}>סמסטרים</h3>
          {semesters.length === 0 ? (
            <p className={`${T.empty} mb-2`}>אין סמסטרים בשנה זו</p>
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
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-center">
            <input
              className={T.field}
              value={newSemLabel}
              onChange={(e) => setNewSemLabel(e.target.value)}
              placeholder="שם סמסטר"
              dir="auto"
            />
            <input
              type="date"
              className={`${T.field} min-w-[10rem]`}
              value={newSemStart}
              onChange={(e) => setNewSemStart(e.target.value)}
            />
            <input
              type="date"
              className={`${T.field} min-w-[10rem]`}
              value={newSemEnd}
              onChange={(e) => setNewSemEnd(e.target.value)}
            />
            <button
              type="button"
              className={T.btnPrimary}
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
    <li className={T.semLi}>
      <input
        className={T.field}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={() => label !== semester.label && onUpdate({ label })}
        dir="auto"
      />
      <input
        type="date"
        className={`${T.field} min-w-[10rem]`}
        value={start}
        onChange={(e) => setStart(e.target.value)}
        onBlur={() => start !== (semester.start_date ?? '') && onUpdate({ start_date: start || null })}
      />
      <input
        type="date"
        className={`${T.field} min-w-[10rem]`}
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        onBlur={() => end !== (semester.end_date ?? '') && onUpdate({ end_date: end || null })}
      />
      <button type="button" className={T.btnSec} onClick={onDelete}>
        מחק
      </button>
    </li>
  );
}
