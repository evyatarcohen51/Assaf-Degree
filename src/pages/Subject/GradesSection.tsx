import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import {
  useGradesBySubject,
  addGrade,
  updateGrade,
  deleteGrade,
  computeFinalGrade,
  totalWeight,
} from '../../hooks/useGrades';
import { USE_SOFT_DESIGN } from '../../lib/design';
import { PencilIcon, TrashIcon } from '../../ui/icons';
import type { Grade, GradeKind } from '../../types/domain';

const KIND_LABEL: Record<GradeKind, string> = {
  exam: 'מבחן',
  assignment: 'מטלה',
  project: 'פרויקט',
  other: 'אחר',
};

export function GradesSection({ subjectId }: { subjectId: string }) {
  const { user } = useAuth();
  const grades = useGradesBySubject(subjectId);

  const [name, setName] = useState('');
  const [kind, setKind] = useState<GradeKind>('exam');
  const [grade, setGrade] = useState('');
  const [weight, setWeight] = useState('');

  const final = computeFinalGrade(grades);
  const sumWeight = totalWeight(grades);

  async function handleAdd() {
    if (!user) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const g = Number(grade);
    const w = Number(weight);
    if (isNaN(g) || isNaN(w)) {
      alert('ציון ומשקל חייבים להיות מספרים');
      return;
    }
    if (g < 0 || g > 100 || w < 0 || w > 100) {
      alert('ציון ומשקל חייבים להיות בין 0 ל-100');
      return;
    }
    try {
      await addGrade({
        user_id: user.id,
        subject_id: subjectId,
        name: trimmed,
        kind,
        grade: g,
        weight_percent: w,
      });
      setName('');
      setGrade('');
      setWeight('');
    } catch (err) {
      alert(`הוספה נכשלה: ${err instanceof Error ? err.message : err}`);
    }
  }

  async function handleUpdate(
    g: Grade,
    fields: Partial<Pick<Grade, 'name' | 'kind' | 'grade' | 'weight_percent'>>,
  ) {
    if (!user) return;
    try {
      await updateGrade(user.id, g.id, fields);
    } catch (err) {
      alert(`עדכון נכשל: ${err instanceof Error ? err.message : err}`);
    }
  }

  async function handleRemove(id: string) {
    if (!user) return;
    if (!confirm('למחוק את הציון?')) return;
    try {
      await deleteGrade(user.id, id);
    } catch (err) {
      alert(`מחיקה נכשלה: ${err instanceof Error ? err.message : err}`);
    }
  }

  if (USE_SOFT_DESIGN) {
    return (
      <section className="card-soft">
        <h2 className="flex items-center gap-2 text-xl font-bold text-soft-text mb-5">
          <span>ציונים</span>
          <span className="text-soft-muted"><PencilIcon size={20} /></span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-[1fr_auto_auto_auto_auto] gap-2 mb-4 items-stretch">
          <input
            className="field-soft"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
            placeholder="שם (למשל: מבחן אמצע)"
            dir="auto"
          />
          <select
            className="field-soft"
            value={kind}
            onChange={(e) => setKind(e.target.value as GradeKind)}
          >
            <option value="exam">מבחן</option>
            <option value="assignment">מטלה</option>
            <option value="project">פרויקט</option>
            <option value="other">אחר</option>
          </select>
          <input
            className="field-soft w-24"
            type="number"
            step="0.5"
            min="0"
            max="100"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="ציון"
          />
          <input
            className="field-soft w-24"
            type="number"
            step="1"
            min="0"
            max="100"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="משקל %"
          />
          <button type="button" className="btn-soft-primary" onClick={handleAdd}>
            הוסף
          </button>
        </div>

        {grades.length === 0 ? (
          <p className="text-sm text-soft-muted">אין ציונים עדיין</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-b border-soft-border py-3 ps-3 text-start text-soft-muted text-sm font-medium">שם</th>
                    <th className="border-b border-soft-border py-3 text-start text-soft-muted text-sm font-medium">סוג</th>
                    <th className="border-b border-soft-border py-3 text-start text-soft-muted text-sm font-medium">ציון</th>
                    <th className="border-b border-soft-border py-3 text-start text-soft-muted text-sm font-medium">משקל</th>
                    <th className="border-b border-soft-border py-3 pe-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g) => (
                    <GradeRow
                      key={g.id}
                      g={g}
                      soft
                      onUpdate={(fields) => handleUpdate(g, fields)}
                      onRemove={() => handleRemove(g.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 items-center justify-between row-soft">
              <div className="font-display font-bold text-lg text-soft-text">
                ציון משוקלל:{' '}
                <span className="text-2xl">
                  {final !== null ? final.toFixed(2) : '—'}
                </span>
              </div>
              <div
                className={`text-sm ${sumWeight === 100 ? 'text-green' : 'text-red font-bold'}`}
              >
                סך משקלים: {sumWeight.toFixed(0)}%
                {sumWeight !== 100 && ' (אמור להיות 100%)'}
              </div>
            </div>
          </>
        )}
      </section>
    );
  }

  return (
    <section className="card">
      <h2 className="text-xl mb-3">ציונים</h2>

      <div className="grid grid-cols-2 md:grid-cols-[1fr_auto_auto_auto_auto] gap-2 mb-3 items-stretch">
        <input
          className="field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          placeholder="שם (למשל: מבחן אמצע)"
          dir="auto"
        />
        <select
          className="field"
          value={kind}
          onChange={(e) => setKind(e.target.value as GradeKind)}
        >
          <option value="exam">מבחן</option>
          <option value="assignment">מטלה</option>
          <option value="project">פרויקט</option>
          <option value="other">אחר</option>
        </select>
        <input
          className="field w-24"
          type="number"
          step="0.5"
          min="0"
          max="100"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          placeholder="ציון"
        />
        <input
          className="field w-24"
          type="number"
          step="1"
          min="0"
          max="100"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="משקל %"
        />
        <button type="button" className="btn" onClick={handleAdd}>
          הוסף
        </button>
      </div>

      {grades.length === 0 ? (
        <p className="text-sm text-ink/50">אין ציונים עדיין</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b-2 border-ink p-2 text-start font-display uppercase">שם</th>
                  <th className="border-b-2 border-ink p-2 text-start font-display uppercase">סוג</th>
                  <th className="border-b-2 border-ink p-2 text-start font-display uppercase">ציון</th>
                  <th className="border-b-2 border-ink p-2 text-start font-display uppercase">משקל</th>
                  <th className="border-b-2 border-ink p-2"></th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g) => (
                  <GradeRow
                    key={g.id}
                    g={g}
                    soft={false}
                    onUpdate={(fields) => handleUpdate(g, fields)}
                    onRemove={() => handleRemove(g.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 items-center justify-between p-3 rounded-xl border-2 border-ink bg-paper">
            <div className="font-display font-bold text-lg">
              ציון משוקלל:{' '}
              <span className="text-2xl">
                {final !== null ? final.toFixed(2) : '—'}
              </span>
            </div>
            <div
              className={`text-sm ${sumWeight === 100 ? 'text-green' : 'text-red font-bold'}`}
            >
              סך משקלים: {sumWeight.toFixed(0)}%
              {sumWeight !== 100 && ' (אמור להיות 100%)'}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function GradeRow({
  g,
  soft,
  onUpdate,
  onRemove,
}: {
  g: Grade;
  soft: boolean;
  onUpdate: (
    fields: Partial<Pick<Grade, 'name' | 'kind' | 'grade' | 'weight_percent'>>,
  ) => void;
  onRemove: () => void;
}) {
  const [name, setName] = useState(g.name);
  const [grade, setGrade] = useState(String(g.grade));
  const [weight, setWeight] = useState(String(g.weight_percent));

  if (soft) {
    return (
      <tr className="align-middle">
        <td className="border-b border-soft-border py-3 ps-3">
          <input
            className="w-full bg-transparent border-b border-transparent hover:border-soft-border focus:border-soft-mustard outline-none text-soft-text transition"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name !== g.name && onUpdate({ name })}
            dir="auto"
          />
        </td>
        <td className="border-b border-soft-border py-3">
          <select
            className="bg-soft-input rounded-soft-pill px-3 py-1 text-sm shadow-soft-pill outline-none"
            value={g.kind}
            onChange={(e) => onUpdate({ kind: e.target.value as GradeKind })}
          >
            <option value="exam">{KIND_LABEL.exam}</option>
            <option value="assignment">{KIND_LABEL.assignment}</option>
            <option value="project">{KIND_LABEL.project}</option>
            <option value="other">{KIND_LABEL.other}</option>
          </select>
        </td>
        <td className="border-b border-soft-border py-3">
          <input
            type="number"
            step="0.5"
            min="0"
            max="100"
            className="w-20 bg-transparent border-b border-transparent hover:border-soft-border focus:border-soft-mustard outline-none text-soft-text transition"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            onBlur={() => {
              const v = Number(grade);
              if (!isNaN(v) && v !== g.grade) onUpdate({ grade: v });
            }}
          />
        </td>
        <td className="border-b border-soft-border py-3">
          <input
            type="number"
            step="1"
            min="0"
            max="100"
            className="w-16 bg-transparent border-b border-transparent hover:border-soft-border focus:border-soft-mustard outline-none text-soft-text transition"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={() => {
              const v = Number(weight);
              if (!isNaN(v) && v !== g.weight_percent) onUpdate({ weight_percent: v });
            }}
          />
          <span className="text-soft-muted ms-1">%</span>
        </td>
        <td className="border-b border-soft-border py-3 pe-3 text-end">
          <button
            type="button"
            className="icon-btn-soft-danger"
            onClick={onRemove}
            aria-label="מחק ציון"
          >
            <TrashIcon size={16} />
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="align-middle">
      <td className="border-b border-ink/20 p-2">
        <input
          className="w-full bg-transparent border-b border-transparent hover:border-ink/30 focus:border-ink outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name !== g.name && onUpdate({ name })}
          dir="auto"
        />
      </td>
      <td className="border-b border-ink/20 p-2">
        <select
          className="bg-transparent rounded-md border-2 border-ink/30 px-1 py-0.5"
          value={g.kind}
          onChange={(e) => onUpdate({ kind: e.target.value as GradeKind })}
        >
          <option value="exam">{KIND_LABEL.exam}</option>
          <option value="assignment">{KIND_LABEL.assignment}</option>
          <option value="project">{KIND_LABEL.project}</option>
          <option value="other">{KIND_LABEL.other}</option>
        </select>
      </td>
      <td className="border-b border-ink/20 p-2">
        <input
          type="number"
          step="0.5"
          min="0"
          max="100"
          className="w-20 bg-transparent border-b border-transparent hover:border-ink/30 focus:border-ink outline-none"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          onBlur={() => {
            const v = Number(grade);
            if (!isNaN(v) && v !== g.grade) onUpdate({ grade: v });
          }}
        />
      </td>
      <td className="border-b border-ink/20 p-2">
        <input
          type="number"
          step="1"
          min="0"
          max="100"
          className="w-20 bg-transparent border-b border-transparent hover:border-ink/30 focus:border-ink outline-none"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          onBlur={() => {
            const v = Number(weight);
            if (!isNaN(v) && v !== g.weight_percent) onUpdate({ weight_percent: v });
          }}
        />
        %
      </td>
      <td className="border-b border-ink/20 p-2 text-end">
        <button
          type="button"
          className="btn-secondary !px-3 !py-1 text-sm"
          onClick={onRemove}
        >
          מחק
        </button>
      </td>
    </tr>
  );
}
